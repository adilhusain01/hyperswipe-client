import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { hyperliquidAPI, formatAssetData } from '../services/hyperliquid'
import websocketService from '../services/websocket'
import { TradingCardSkeleton } from './LoadingSkeleton'

// Format price based on the asset's value
const formatPrice = (price) => {
  const value = parseFloat(price || 0)
  if (value === 0) return '$0.00'
  if (value >= 1000) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  } else if (value >= 1) {
    return `$${value.toFixed(4)}`
  } else {
    return `$${value.toFixed(6)}`
  }
}

// Format open interest with appropriate units
const formatOpenInterest = (openInterest) => {
  const value = parseFloat(openInterest || 0)
  if (value === 0) return '0'
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`
  } else {
    return value.toFixed(2)
  }
}

const MarketList = ({ user, onSelectAsset }) => {
  const [formattedAssets, setFormattedAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name') // 'name', 'price', 'change', 'volume'
  const [priceFlash, setPriceFlash] = useState({}) // Track price changes for flash effects

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true)
        console.log('📊 Fetching assets for market list...')
        
        const metaAndCtxs = await hyperliquidAPI.getMetaAndAssetCtxs()
        const formatted = formatAssetData(metaAndCtxs)
        
        setFormattedAssets(formatted)
        console.log('✅ Market list loaded:', formatted.length, 'assets')
      } catch (error) {
        console.error('Failed to fetch assets for market list:', error)
        // Fallback to empty array to prevent crashes
        setFormattedAssets([])
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()

    // Set up WebSocket for real-time price updates
    const handlePriceUpdate = (data) => {
      if (data.mids) {
        setFormattedAssets(prevAssets => {
          if (prevAssets.length === 0) return prevAssets
          
          return prevAssets.map(asset => {
            const newPrice = data.mids[asset.name]
            if (newPrice && newPrice !== asset.markPrice) {
              const oldPrice = parseFloat(asset.markPrice)
              const currentPrice = parseFloat(newPrice)
              const dayChange = asset.prevDayPrice && asset.prevDayPrice !== '0' 
                ? (((currentPrice - parseFloat(asset.prevDayPrice)) / parseFloat(asset.prevDayPrice)) * 100).toFixed(2)
                : asset.dayChange

              // Trigger price flash animation
              const direction = currentPrice > oldPrice ? 'up' : 'down'
              setPriceFlash(prev => ({
                ...prev,
                [asset.name]: { direction, timestamp: Date.now() }
              }))
              
              // Clear flash after animation
              setTimeout(() => {
                setPriceFlash(prev => ({
                  ...prev,
                  [asset.name]: null
                }))
              }, 1000)

              return {
                ...asset,
                markPrice: newPrice,
                dayChange
              }
            }
            return asset
          })
        })
      }
    }

    websocketService.on('priceUpdate', handlePriceUpdate)

    return () => {
      websocketService.off('priceUpdate', handlePriceUpdate)
    }
  }, [])

  const filteredAndSortedAssets = formattedAssets
    .filter(asset => 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(b.markPrice) - parseFloat(a.markPrice)
        case 'change':
          return parseFloat(b.dayChange) - parseFloat(a.dayChange)
        case 'volume':
          return parseFloat(b.openInterest) - parseFloat(a.openInterest)
        default:
          return a.name.localeCompare(b.name)
      }
    })

  if (loading) {
    return <TradingCardSkeleton />
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="bg-gray-700 rounded-2xl p-4">
          <h2 className="text-lg font-bold text-white mb-3">Markets</h2>
          
          {/* Search Bar */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none placeholder-gray-400"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'name', label: 'Name' },
              { key: 'price', label: 'Price' },
              { key: 'change', label: '24h Change' },
              { key: 'volume', label: 'Volume' }
            ].map(option => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key)}
                className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  sortBy === option.key 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Market List */}
        <div className="space-y-2">
          {filteredAndSortedAssets.map((asset, index) => {
            const priceChange = parseFloat(asset.dayChange || 0)
            const flash = priceFlash[asset.name]
            
            return (
              <motion.div
                key={asset.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectAsset(asset.index)}
                className="bg-gray-700 rounded-xl p-4 cursor-pointer hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Token Info */}
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="text-white font-semibold text-lg">{asset.name}</div>
                      <div className="text-gray-400 text-sm">
                        Max {asset.maxLeverage}x • OI: {formatOpenInterest(asset.openInterest)}
                      </div>
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="text-right">
                    <motion.div
                      className="text-white font-semibold text-lg relative"
                      animate={flash ? {
                        backgroundColor: flash.direction === 'up' ? '#10b98120' : '#ef444420'
                      } : {
                        backgroundColor: 'transparent'
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      {formatPrice(asset.markPrice)}
                      {/* Price change indicator */}
                      {flash && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className={`absolute -top-1 -right-1 text-xs ${
                            flash.direction === 'up' ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {flash.direction === 'up' ? '↗' : '↘'}
                        </motion.div>
                      )}
                    </motion.div>
                    <div className={`text-sm font-medium ${
                      priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {priceChange >= 0 ? '+' : ''}
                      {priceChange}%
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* No Results */}
        {filteredAndSortedAssets.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">No tokens found</div>
            <div className="text-gray-500 text-sm">
              Try adjusting your search query
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketList