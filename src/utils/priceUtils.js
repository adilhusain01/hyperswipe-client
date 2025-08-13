/**
 * Price formatting utilities for Hyperliquid
 * Following the rules from Hyperliquid documentation:
 * - Max 5 significant figures
 * - Max (6 - szDecimals) decimal places for perps
 * - Remove trailing zeros
 */

/**
 * Format price according to Hyperliquid tick size rules
 * @param {number} price - Raw price
 * @param {number} szDecimals - Asset szDecimals from meta
 * @param {boolean} isSpot - Whether this is a spot asset (default: false for perps)
 * @returns {string} Formatted price
 */
export function formatHyperliquidPrice(price, szDecimals, isSpot = false) {
  const maxDecimals = isSpot ? 8 : 6
  const maxDecimalPlaces = maxDecimals - szDecimals
  
  // Convert to number if string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  // Handle edge cases
  if (!isFinite(numPrice) || numPrice <= 0) {
    throw new Error('Invalid price: must be a positive finite number')
  }
  
  // For integer prices, they're always valid regardless of significant figures
  if (Number.isInteger(numPrice)) {
    return numPrice.toString()
  }
  
  // Apply 5 significant figures rule
  const rounded = parseFloat(numPrice.toPrecision(5))
  
  // Apply max decimal places rule
  const maxDecimalStr = rounded.toFixed(maxDecimalPlaces)
  const withMaxDecimals = parseFloat(maxDecimalStr)
  
  // Convert to string and remove trailing zeros
  let result = withMaxDecimals.toString()
  
  // Remove trailing zeros after decimal point
  if (result.includes('.')) {
    result = result.replace(/\.?0+$/, '')
  }
  
  return result
}

/**
 * Get market order price with proper formatting
 * @param {string} direction - 'buy' or 'sell'
 * @param {string} markPrice - Current mark price
 * @param {number} szDecimals - Asset szDecimals
 * @param {number} slippage - Slippage percentage (default: 0.05 = 5%)
 * @param {boolean} isPostOnly - Whether this is a post-only order (default: false)
 * @returns {string} Formatted order price
 */
export function getFormattedOrderPrice(direction, markPrice, szDecimals, slippage = 0.05, isPostOnly = false) {
  const price = parseFloat(markPrice)
  
  let orderPrice
  if (isPostOnly) {
    // For post-only orders, use conservative pricing that won't immediately match
    if (direction === 'buy' || direction === 'long') {
      // Buy orders: price below market to avoid immediate matching
      orderPrice = price * (1 - 0.001) // 0.1% below market
    } else {
      // Sell orders: price above market to avoid immediate matching  
      orderPrice = price * (1 + 0.001) // 0.1% above market
    }
  } else {
    // For regular market orders, use slippage
    if (direction === 'buy' || direction === 'long') {
      orderPrice = price * (1 + slippage)
    } else {
      orderPrice = price * (1 - slippage)
    }
  }
  
  return formatHyperliquidPrice(orderPrice, szDecimals)
}

/**
 * Validate that a price meets Hyperliquid requirements
 * @param {string} price - Price to validate
 * @param {number} szDecimals - Asset szDecimals
 * @param {boolean} isSpot - Whether this is a spot asset
 * @returns {boolean} Whether price is valid
 */
export function isValidHyperliquidPrice(price, szDecimals, isSpot = false) {
  try {
    const formatted = formatHyperliquidPrice(parseFloat(price), szDecimals, isSpot)
    return formatted === price.toString()
  } catch (error) {
    return false
  }
}