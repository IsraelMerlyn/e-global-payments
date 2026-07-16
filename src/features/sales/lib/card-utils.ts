export function cleanCardNumber(num: string): string {
  return num.replace(/\s+/g, '').replace(/\D/g, '')
}

export function formatCardNumber(num: string): string {
  const cleaned = num.replace(/\D/g, '')
  const matches = cleaned.match(/.{1,4}/g)
  return matches ? matches.join(' ') : cleaned
}

export function maskCardNumber(num: string): string {
  const cleaned = cleanCardNumber(num)
  if (cleaned.length < 8) {
    return cleaned
  }
  const first4 = cleaned.slice(0, 4)
  const last4 = cleaned.slice(-4)
  const middleLength = cleaned.length - 8
  const asterisks = '*'.repeat(middleLength > 0 ? middleLength : 8)
  return `${first4}${asterisks}${last4}`
}

export function validateLuhn(num: string): boolean {
  const cleaned = cleanCardNumber(num)
  if (!cleaned) return false
  
  let sum = 0
  let shouldDouble = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10)
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  
  return sum % 10 === 0
}

export function validateExpirationDate(exp: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(exp)) {
    return false
  }
  const parts = exp.split('/')
  const monthStr = parts[0]
  const yearStr = parts[1]
  if (!monthStr || !yearStr) {
    return false
  }
  const month = parseInt(monthStr, 10)
  const year = parseInt('20' + yearStr, 10)

  if (month < 1 || month > 12) {
    return false
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  if (year < currentYear) {
    return false
  }
  if (year === currentYear && month < currentMonth) {
    return false
  }

  return true
}

export function detectCardBrand(num: string): string {
  const cleaned = cleanCardNumber(num)
  if (/^4/.test(cleaned)) {
    return 'Visa'
  }
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(cleaned)) {
    return 'Mastercard'
  }
  if (/^3[47]/.test(cleaned)) {
    return 'American Express'
  }
  return 'Generic'
}
