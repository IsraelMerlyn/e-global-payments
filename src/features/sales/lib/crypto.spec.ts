import { describe, expect, it } from 'vitest'
import {
  uint8ArrayToBase64,
  base64ToUint8Array,
  encryptPaymentData,
} from './crypto'

describe('crypto', () => {
  const keyBase64 = 'c2VjcmV0X2tleV9mb3JfZXZhbHVhdGlvbl8zMmJ5dGU=' // 32 bytes

  describe('base64 helpers', () => {
    it('converts Uint8Array to base64 and back', () => {
      const original = new Uint8Array([1, 2, 3, 255])
      const b64 = uint8ArrayToBase64(original)
      expect(b64).toBe('AQID/w==')
      const restored = base64ToUint8Array(b64)
      expect(restored).toEqual(original)
    })
  })

  describe('encryptPaymentData', () => {
    it('encrypts payment details successfully', async () => {
      const details = {
        cardNumber: '4111111111111111',
        expirationDate: '12/30',
        cvv: '123',
      }

      const result = await encryptPaymentData(details, keyBase64)
      expect(result.algorithm).toBe('AES-GCM')
      expect(result.iv).toBeDefined()
      expect(result.ciphertext).toBeDefined()
    })

    it('rejects keys that are not 32 bytes', async () => {
      const shortKey = 'c2VjcmV0' // 6 bytes
      const details = {
        cardNumber: '4111111111111111',
        expirationDate: '12/30',
        cvv: '123',
      }

      await expect(encryptPaymentData(details, shortKey)).rejects.toThrow(
        'La clave de cifrado debe tener exactamente 32 bytes',
      )
    })
  })
})
