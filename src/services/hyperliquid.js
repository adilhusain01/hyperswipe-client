import axios from 'axios'

const HYPERLIQUID_API_BASE = 'https://api.hyperliquid-testnet.xyz'

// Simple rate limiting to prevent 429 errors
const rateLimiter = {
  lastRequest: 0,
  minDelay: 1000, // 1 second between requests
  
  async wait() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequest
    
    if (timeSinceLastRequest < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastRequest
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms before API call`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.lastRequest = Date.now()
  }
}

export const hyperliquidAPI = {
  async getMetaAndAssetCtxs() {
    try {
      await rateLimiter.wait()
      
      const response = await axios.post(`${HYPERLIQUID_API_BASE}/info`, {
        type: 'metaAndAssetCtxs'
      })
      
  
      
      return response.data
    } catch (error) {
      console.error('Error fetching asset contexts:', error)
      console.error('Request details:', {
        endpoint: `${HYPERLIQUID_API_BASE}/info`,
        requestType: 'metaAndAssetCtxs'
      })
      throw error
    }
  },

  async getUserState(userAddress) {
    try {
      await rateLimiter.wait()
      
      // Validate input
      if (!userAddress || typeof userAddress !== 'string') {
        throw new Error('Invalid user address provided')
      }
      
      const response = await axios.post(`${HYPERLIQUID_API_BASE}/info`, {
        type: 'clearinghouseState',
        user: userAddress.toLowerCase() // Ensure consistent formatting
      }, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('🏦 User state response received successfully')
      
      // Validate and enhance response data
      const userData = response.data || {}
      
      // Ensure marginSummary exists (try both marginSummary and crossMarginSummary)
      if (!userData.marginSummary && userData.crossMarginSummary) {
        userData.marginSummary = userData.crossMarginSummary
      } else if (!userData.marginSummary && !userData.crossMarginSummary) {
        userData.marginSummary = {
          accountValue: "0.0",
          totalMarginUsed: "0.0",
          totalNtlPos: "0.0",
          totalRawUsd: "0.0"
        }
      }
      
      // Ensure assetPositions is an array
      if (!Array.isArray(userData.assetPositions)) {
        userData.assetPositions = []
      }
      
      // Note: openOrders requires a separate API call
      // Will be fetched separately via getOpenOrders() method
      
      // Set withdrawable to 0 if missing
      if (typeof userData.withdrawable === 'undefined' || userData.withdrawable === null) {
        userData.withdrawable = "0.0"
      }
      
      return userData
    } catch (error) {
      console.error('❌ Error fetching user state:', error.message)
      console.error('Request details:', {
        endpoint: `${HYPERLIQUID_API_BASE}/info`,
        userAddress,
        requestType: 'clearinghouseState',
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      
      // Return comprehensive fallback data structure to prevent crashes
      const fallbackData = {
        assetPositions: [],
        crossMaintenanceMarginUsed: "0.0",
        crossMarginSummary: {
          accountValue: "0.0",
          totalMarginUsed: "0.0",
          totalNtlPos: "0.0",
          totalRawUsd: "0.0"
        },
        marginSummary: {
          accountValue: "0.0",
          totalMarginUsed: "0.0",
          totalNtlPos: "0.0",
          totalRawUsd: "0.0"
        },
        withdrawable: "0.0",
        time: Date.now()
      }
      
      // Log specific error types for debugging
      if (error.code === 'ECONNABORTED') {
        console.warn('⏰ Request timed out, using fallback data')
      } else if (error.response?.status === 429) {
        console.warn('🚫 Rate limit exceeded, using fallback data')
      } else if (error.response?.status >= 500) {
        console.warn('🛑 Server error, using fallback data')
      } else {
        console.warn('⚠️ Unknown error, using fallback data')
      }
      
      return fallbackData
    }
  },

  async getSpotBalances(userAddress) {
    try {
      const response = await axios.post(`${HYPERLIQUID_API_BASE}/info`, {
        type: 'spotClearinghouseState',
        user: userAddress
      })
      return response.data
    } catch (error) {
      console.error('Error fetching spot balances:', error)
      throw error
    }
  },

  async getCandlestickData(coin, interval = '1h', startTime, endTime) {
    try {
      await rateLimiter.wait()
      
      const response = await axios.post(`${HYPERLIQUID_API_BASE}/info`, {
        type: 'candleSnapshot',
        req: {
          coin,
          interval,
          startTime,
          endTime
        }
      })
      
      
      // If the response is not an array or is empty, return null to trigger fallback
      if (!Array.isArray(response.data) || response.data.length === 0) {
        return null
      }
      
      return response.data
    } catch (error) {
      console.error('Error fetching candlestick data:', error.response?.data || error.message)
      console.error('Request was:', { coin, interval, startTime, endTime })
      
      // Instead of throwing, return null to trigger fallback data
      return null
    }
  },

  async getOpenOrders(userAddress) {
    try {
      await rateLimiter.wait()
      
      // Validate input
      if (!userAddress || typeof userAddress !== 'string') {
        throw new Error('Invalid user address provided')
      }
      
      const response = await axios.post(`${HYPERLIQUID_API_BASE}/info`, {
        type: 'openOrders',
        user: userAddress.toLowerCase()
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📋 Open orders response received successfully')
      
      // Ensure response is an array
      const openOrders = Array.isArray(response.data) ? response.data : []
      return openOrders
      
    } catch (error) {
      console.error('❌ Error fetching open orders:', error.message)
      console.error('Request details:', {
        endpoint: `${HYPERLIQUID_API_BASE}/info`,
        userAddress,
        requestType: 'openOrders',
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      
      // Return empty array as fallback
      return []
    }
  },

  async placeOrder(orderData) {
    try {
      await rateLimiter.wait()
      const response = await axios.post(`${HYPERLIQUID_API_BASE}/exchange`, orderData)
      return response.data
    } catch (error) {
      console.error('Error placing order:', error)
      console.error('📋 Error response data:', error.response?.data)
      console.error('📋 Error status:', error.response?.status)
      
      // Handle specific error codes
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a few seconds before trying again.')
      } else if (error.response?.status === 422) {
        const errorMsg = error.response?.data?.message || error.response?.data || 'Invalid order format'
        throw new Error(`Order validation failed: ${errorMsg}`)
      }
      
      throw error
    }
  }
}

export function formatAssetData(metaAndCtxs) {
  if (!metaAndCtxs || metaAndCtxs.length < 2) return []
  
  const [meta, contexts] = metaAndCtxs
  const { universe } = meta

  return universe.map((asset, index) => {
    const ctx = contexts[index] || {}
    return {
      index,
      name: asset.name,
      maxLeverage: asset.maxLeverage,
      szDecimals: asset.szDecimals,
      onlyIsolated: asset.onlyIsolated || false,
      isDelisted: asset.isDelisted || false,
      markPrice: ctx.markPx || '0',
      prevDayPrice: ctx.prevDayPx || '0',
      openInterest: ctx.openInterest || '0',
      funding: ctx.funding || '0',
      dayChange: ctx.prevDayPx && ctx.markPx ? 
        (((parseFloat(ctx.markPx) - parseFloat(ctx.prevDayPx)) / parseFloat(ctx.prevDayPx)) * 100).toFixed(2) : '0.00'
    }
  }).filter(asset => !asset.isDelisted) // Filter out delisted assets
}

export function calculatePriceChange(current, previous) {
  if (!current || !previous || previous === '0') return 0
  const currentPrice = parseFloat(current)
  const prevPrice = parseFloat(previous)
  return ((currentPrice - prevPrice) / prevPrice) * 100
}