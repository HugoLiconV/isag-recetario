/**
 * Scales a recipe ingredient amount by a given ratio.
 * Handles plain numbers, fractions, and preserves precision for small values.
 *
 * @param amount - The amount string (e.g., "0.005", "1/2", "250")
 * @param ratio - The scaling factor (e.g., 2 for double portions)
 * @returns The scaled amount as a string
 */
export function scaleAmount(amount: string, ratio: number): string {
  if (ratio === 1) return amount

  // Try fraction like "1/2"
  const fractionMatch = amount.match(/^(\d+)\/(\d+)$/)
  if (fractionMatch) {
    const value = (parseInt(fractionMatch[1]) / parseInt(fractionMatch[2])) * ratio
    return formatScaledNumber(value, 1)
  }

  // Try plain number
  const trimmed = amount.trim()
  const num = parseFloat(trimmed)
  // Check if it's a valid number (including those with trailing zeros like "2.50")
  if (!isNaN(num) && /^-?\d+\.?\d*$/.test(trimmed)) {
    const originalDecimals = countDecimals(trimmed)
    const scaled = num * ratio
    return formatScaledNumber(scaled, originalDecimals)
  }

  // Not a number we can scale, return as-is
  return amount
}

/**
 * Counts the number of decimal places in a numeric string.
 */
function countDecimals(numStr: string): number {
  const match = numStr.match(/\.(\d+)/)
  return match ? match[1].length : 0
}

/**
 * Formats a scaled number with appropriate precision.
 * Uses original decimal places + 1 to handle floating point arithmetic,
 * then removes trailing zeros for clean display.
 */
function formatScaledNumber(value: number, originalDecimals: number): string {
  // Use original decimals + 1 to handle floating point, but at least 1
  const decimals = Math.max(originalDecimals + 1, 1)
  const factor = Math.pow(10, decimals)
  const rounded = Math.round(value * factor) / factor

  // Convert to string with enough decimals, then strip trailing zeros
  let result = rounded.toFixed(decimals)
  // Remove trailing zeros after decimal point
  result = result.replace(/(\.\d*?)0+$/, '$1')
  // Remove decimal point if no decimals left
  result = result.replace(/\.$/, '')

  return result
}
