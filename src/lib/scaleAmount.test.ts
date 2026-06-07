import { describe, it, expect } from 'vitest'
import { scaleAmount } from './scaleAmount'

describe('scaleAmount', () => {
  describe('small decimal values (bug fix)', () => {
    it('preserves small values like 0.005 when scaling', () => {
      expect(scaleAmount('0.005', 2)).toBe('0.01')
      expect(scaleAmount('0.005', 3)).toBe('0.015')
      expect(scaleAmount('0.005', 4)).toBe('0.02')
    })

    it('handles very small decimals (0.001)', () => {
      expect(scaleAmount('0.001', 2)).toBe('0.002')
      expect(scaleAmount('0.001', 5)).toBe('0.005')
      expect(scaleAmount('0.001', 10)).toBe('0.01')
    })

    it('handles two decimal places (0.05)', () => {
      expect(scaleAmount('0.05', 2)).toBe('0.1')
      expect(scaleAmount('0.05', 3)).toBe('0.15')
      expect(scaleAmount('0.25', 4)).toBe('1')
    })
  })

  describe('whole numbers', () => {
    it('scales whole numbers correctly', () => {
      expect(scaleAmount('5', 2)).toBe('10')
      expect(scaleAmount('10', 1.5)).toBe('15')
      expect(scaleAmount('250', 2)).toBe('500')
    })

    it('removes trailing zeros for whole results', () => {
      expect(scaleAmount('5', 2)).toBe('10')
      expect(scaleAmount('2', 2.5)).toBe('5')
    })
  })

  describe('decimal numbers', () => {
    it('scales one decimal place numbers', () => {
      expect(scaleAmount('2.5', 2)).toBe('5')
      expect(scaleAmount('1.5', 3)).toBe('4.5')
      expect(scaleAmount('0.5', 2)).toBe('1')
    })

    it('preserves precision for multiple decimal places', () => {
      expect(scaleAmount('1.25', 2)).toBe('2.5')
      expect(scaleAmount('0.125', 4)).toBe('0.5')
      expect(scaleAmount('2.75', 2)).toBe('5.5')
    })
  })

  describe('fractions', () => {
    it('scales fractions correctly', () => {
      expect(scaleAmount('1/2', 2)).toBe('1')
      expect(scaleAmount('1/4', 4)).toBe('1')
      expect(scaleAmount('3/4', 2)).toBe('1.5')
    })

    it('handles fractions with decimal results', () => {
      expect(scaleAmount('1/3', 3)).toBe('1')
      expect(scaleAmount('1/2', 3)).toBe('1.5')
    })
  })

  describe('edge cases', () => {
    it('returns original amount when ratio is 1', () => {
      expect(scaleAmount('5', 1)).toBe('5')
      expect(scaleAmount('0.005', 1)).toBe('0.005')
      expect(scaleAmount('1/2', 1)).toBe('1/2')
    })

    it('handles ratio less than 1 (reducing portions)', () => {
      expect(scaleAmount('10', 0.5)).toBe('5')
      expect(scaleAmount('0.01', 0.5)).toBe('0.005')
      expect(scaleAmount('1/2', 0.5)).toBe('0.25')
    })

    it('returns non-numeric strings unchanged', () => {
      expect(scaleAmount('al gusto', 2)).toBe('al gusto')
      expect(scaleAmount('c/n', 3)).toBe('c/n')
      expect(scaleAmount('', 2)).toBe('')
    })

    it('handles zero values', () => {
      expect(scaleAmount('0', 2)).toBe('0')
      expect(scaleAmount('0.0', 5)).toBe('0')
    })
  })

  describe('floating point precision', () => {
    it('handles floating point arithmetic correctly', () => {
      // These cases often produce floating point errors
      expect(scaleAmount('0.1', 3)).toBe('0.3')
      expect(scaleAmount('0.2', 3)).toBe('0.6')
      expect(scaleAmount('1.1', 2)).toBe('2.2')
    })

    it('cleans up unnecessary trailing zeros', () => {
      expect(scaleAmount('2.50', 2)).toBe('5')
      expect(scaleAmount('1.00', 3)).toBe('3')
      expect(scaleAmount('0.50', 4)).toBe('2')
    })
  })
})
