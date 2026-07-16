import { describe, expect, it } from 'vitest'
import {
  cleanCardNumber,
  formatCardNumber,
  maskCardNumber,
  validateLuhn,
  validateExpirationDate,
  detectCardBrand,
} from './card-utils'

describe('card-utils', () => {
  describe('cleanCardNumber', () => {
    it('removes spaces and non-digit characters', () => {
      expect(cleanCardNumber('4111 2222 3333 4444')).toBe('4111222233334444')
      expect(cleanCardNumber('4111-2222-3333-4444')).toBe('4111222233334444')
      expect(cleanCardNumber(' 4111abc ')).toBe('4111')
    })
  })

  describe('formatCardNumber', () => {
    it('groups digits by 4 with spaces', () => {
      expect(formatCardNumber('4111222233334444')).toBe('4111 2222 3333 4444')
      expect(formatCardNumber('41112222')).toBe('4111 2222')
      expect(formatCardNumber('4111')).toBe('4111')
    })
  })

  describe('maskCardNumber', () => {
    it('masks card showing only first 4 and last 4 digits', () => {
      expect(maskCardNumber('4111222233334444')).toBe('4111********4444')
      expect(maskCardNumber('4111222233334444555')).toBe('4111***********4555')
    })
    
    it('returns original input if length is too short', () => {
      expect(maskCardNumber('123456')).toBe('123456')
    })
  })

  describe('validateLuhn', () => {
    it('identifies valid credit card numbers', () => {
      // Standard test Visa card
      expect(validateLuhn('4111 1111 1111 1111')).toBe(true)
      // Invalid card (Luhn fail)
      expect(validateLuhn('4111 1111 1111 1112')).toBe(false)
    })
  })

  describe('validateExpirationDate', () => {
    it('accepts future dates in MM/AA format', () => {
      expect(validateExpirationDate('12/35')).toBe(true)
    })

    it('rejects past dates', () => {
      expect(validateExpirationDate('01/20')).toBe(false)
    })

    it('rejects invalid MM values', () => {
      expect(validateExpirationDate('13/28')).toBe(false)
      expect(validateExpirationDate('00/28')).toBe(false)
    })

    it('rejects malformed strings', () => {
      expect(validateExpirationDate('12-28')).toBe(false)
      expect(validateExpirationDate('12/2028')).toBe(false)
    })
  })

  describe('detectCardBrand', () => {
    it('identifies Visa', () => {
      expect(detectCardBrand('4111111111111')).toBe('Visa')
    })

    it('identifies Mastercard', () => {
      expect(detectCardBrand('5112345678901')).toBe('Mastercard')
      expect(detectCardBrand('2221000000000')).toBe('Mastercard')
    })

    it('identifies American Express', () => {
      expect(detectCardBrand('341234567890123')).toBe('American Express')
      expect(detectCardBrand('371234567890123')).toBe('American Express')
    })

    it('identifies other cards as Generic', () => {
      expect(detectCardBrand('6011111111111111')).toBe('Generic')
    })
  })
})
