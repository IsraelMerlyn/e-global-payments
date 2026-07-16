export interface EncryptedPaymentData {
  algorithm: 'AES-GCM'
  iv: string
  ciphertext: string
}

export interface PaymentDetails {
  cardNumber: string
  expirationDate: string
  cvv: string
}

export function uint8ArrayToBase64(arr: Uint8Array): string {
  const binString = Array.from(arr, (byte) => String.fromCharCode(byte)).join('')
  return globalThis.btoa(binString)
}

export function base64ToUint8Array(b64: string): Uint8Array {
  const binString = globalThis.atob(b64)
  const size = binString.length
  const bytes = new Uint8Array(size)
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i)
  }
  return bytes
}

export async function encryptPaymentData(
  paymentDetails: PaymentDetails,
  keyBase64: string,
): Promise<EncryptedPaymentData> {
  if (!keyBase64) {
    throw new Error('La clave de cifrado no está configurada')
  }

  let keyBytes: Uint8Array
  try {
    keyBytes = base64ToUint8Array(keyBase64)
  } catch {
    throw new Error('La clave Base64 es inválida')
  }

  if (keyBytes.length !== 32) {
    throw new Error('La clave de cifrado debe tener exactamente 32 bytes (256 bits)')
  }

  const cryptoInstance = globalThis.crypto

  if (!cryptoInstance || !cryptoInstance.subtle) {
    throw new Error('Web Crypto API no está disponible en este entorno')
  }

  const ivBytes = cryptoInstance.getRandomValues(new Uint8Array(12))

  const cryptoKey = await cryptoInstance.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  )

  const plaintextBytes = new TextEncoder().encode(JSON.stringify(paymentDetails))

  const ciphertextBuffer = await cryptoInstance.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
      tagLength: 128,
    },
    cryptoKey,
    plaintextBytes,
  )

  const ciphertextBytes = new Uint8Array(ciphertextBuffer)

  return {
    algorithm: 'AES-GCM',
    iv: uint8ArrayToBase64(ivBytes),
    ciphertext: uint8ArrayToBase64(ciphertextBytes),
  }
}
