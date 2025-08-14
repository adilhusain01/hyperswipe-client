/**
 * Format price according to Hyperliquid's tick size rules
 * 
 * Rules:
 * - Max 5 significant figures
 * - Max (6 - szDecimals) decimal places for perps  
 * - Integer prices are always allowed
 * - Remove trailing zeros
 */
export function formatHyperliquidPrice(price, szDecimals) {
  const numPrice = parseFloat(price)
  if (isNaN(numPrice) || numPrice <= 0) {
    return '0'
  }

  // For perps, max decimal places = 6 - szDecimals
  const maxDecimals = Math.max(0, 6 - szDecimals)
  
  // Convert to string to work with
  let priceStr = numPrice.toString()
  
  // If it's an integer, return as is (integers always allowed)
  if (Number.isInteger(numPrice)) {
    return priceStr
  }
  
  // Count significant figures
  const significantDigits = priceStr.replace(/^0+\.?0*/, '').replace(/\./, '').length
  
  if (significantDigits <= 5) {
    // Check decimal places constraint
    const decimalPart = priceStr.split('.')[1] || ''
    if (decimalPart.length <= maxDecimals) {
      // Remove trailing zeros
      return parseFloat(priceStr).toString()
    }
  }
  
  // Need to adjust the price to fit constraints
  // First, try to limit decimal places
  let adjustedPrice = numPrice.toFixed(maxDecimals)
  
  // Check if this gives us <= 5 significant figures
  const adjustedStr = parseFloat(adjustedPrice).toString()
  const adjustedSigFigs = adjustedStr.replace(/^0+\.?0*/, '').replace(/\./, '').length
  
  if (adjustedSigFigs <= 5) {
    return parseFloat(adjustedPrice).toString()
  }
  
  // If still too many sig figs, use toPrecision
  let precisionPrice = numPrice.toPrecision(5)
  
  // Make sure it doesn't exceed decimal places
  if (precisionPrice.includes('.')) {
    const parts = precisionPrice.split('.')
    if (parts[1] && parts[1].length > maxDecimals) {
      precisionPrice = parseFloat(precisionPrice).toFixed(maxDecimals)
    }
  }
  
  // Remove trailing zeros and return
  return parseFloat(precisionPrice).toString()
}

/**
 * Format size according to Hyperliquid's lot size rules
 * Sizes are rounded to the szDecimals of the asset
 */
export function formatHyperliquidSize(size, szDecimals) {
  const numSize = parseFloat(size)
  if (isNaN(numSize) || numSize <= 0) {
    return '0'
  }
  
  // Round to szDecimals and remove trailing zeros
  return parseFloat(numSize.toFixed(szDecimals)).toString()
}

/**
 * Create market-like pricing with proper tick size formatting
 */
export function getMarketPrice(marketPrice, isBuy, szDecimals, slippagePercent = 2) {
  const slippageMultiplier = isBuy ? (1 + slippagePercent / 100) : (1 - slippagePercent / 100)
  const adjustedPrice = parseFloat(marketPrice) * slippageMultiplier
  return formatHyperliquidPrice(adjustedPrice, szDecimals)
}

/**
 * Calculate position size in proper format
 */
export function calculatePositionSize(usdcAmount, price, szDecimals) {
  const rawSize = parseFloat(usdcAmount) / parseFloat(price)
  return formatHyperliquidSize(rawSize, szDecimals)
}