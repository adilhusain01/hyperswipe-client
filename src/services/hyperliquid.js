import axios from 'axios'

const HYPERLIQUID_API_BASE = 'https://api.hyperliquid-testnet.xyz'

export const hyperliquidAPI = {
  async getMetaAndAssetCtxs() {
    try {
    
      
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
  
      
      const response = await axios.post(`${HYPERLIQUID_API_BASE}/info`, {
        type: 'clearinghouseState',
        user: userAddress
      })
    
      
      return response.data
    } catch (error) {
      console.error('Error fetching user state:', error)
      console.error('Request details:', {
        endpoint: `${HYPERLIQUID_API_BASE}/info`,
        userAddress,
        requestType: 'clearinghouseState'
      })
      
      // Return empty state instead of throwing to prevent crashes
      return {
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
        withdrawable: "0.0"
      }
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

  async placeOrder(orderData) {
    try {
      const response = await axios.post(`${HYPERLIQUID_API_BASE}/exchange`, orderData)
      return response.data
    } catch (error) {
      console.error('Error placing order:', error)
      
      // Handle rate limiting specifically
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a few seconds before trying again.')
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