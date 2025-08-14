import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { hyperliquidAPI, formatAssetData } from '../services/hyperliquid'
import websocketService from '../services/websocket'
import { MarketListSkeleton } from './LoadingSkeleton'

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
    return <MarketListSkeleton />
  }

  return (
    <div className="h-full overflow-y-auto" style={{
      background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.6) 0%, rgba(20, 20, 32, 0.8) 100%)'
    }}>
      <motion.div 
        className="p-4 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div 
          className="glass-card rounded-3xl p-6"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-3 h-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #7dd3fc 0%, #0ea5e9 100%)'
              }}
            ></div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-sky-200 to-blue-300 bg-clip-text text-transparent">Markets</h2>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="w-full px-4 py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/50 text-white rounded-xl border border-slate-600/30 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-all duration-300 placeholder-slate-400"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
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
              { key: 'change', label: '24h' },
              { key: 'volume', label: 'Volume' }
            ].map(option => (
              <motion.button
                key={option.key}
                onClick={() => setSortBy(option.key)}
                className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  sortBy === option.key 
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/25' 
                    : 'bg-gradient-to-r from-slate-700/50 to-slate-600/50 text-slate-300 hover:from-slate-600/50 hover:to-slate-500/50 hover:text-white border border-slate-600/30'
                }`}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Market List */}
        <div className="space-y-3">
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
                className="glass-card rounded-2xl p-4 cursor-pointer transition-all duration-300"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  {/* Token Info */}
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-bold text-lg bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                        {asset.name}
                      </div>
                      <div className="text-slate-400 text-sm flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-medium">
                          Max {asset.maxLeverage}x
                        </span>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-sky-500/20 to-blue-500/20 border border-sky-500/30 rounded-lg text-sky-300 text-xs font-medium">
                          OI: {formatOpenInterest(asset.openInterest)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="text-right">
                    <motion.div
                      className="text-white font-bold text-lg relative px-2 py-1 rounded-lg"
                      animate={flash ? {
                        backgroundColor: flash.direction === 'up' ? 'rgba(134, 239, 172, 0.1)' : 'rgba(253, 164, 175, 0.1)'
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
                          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            flash.direction === 'up' 
                              ? 'bg-green-400/20 text-green-300 border border-green-400/30' 
                              : 'bg-red-400/20 text-red-300 border border-red-400/30'
                          }`}
                        >
                          {flash.direction === 'up' ? '↗' : '↘'}
                        </motion.div>
                      )}
                    </motion.div>
                    <motion.div 
                      className={`text-sm font-semibold px-2 py-1 rounded-lg inline-block mt-1 ${
                        priceChange >= 0 
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {priceChange >= 0 ? '+' : ''}
                      {priceChange}%
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* No Results */}
        {filteredAndSortedAssets.length === 0 && !loading && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="glass-card rounded-3xl p-8 inline-block">
              <div className="text-slate-300 text-lg mb-2 font-medium">No tokens found</div>
              <div className="text-slate-400 text-sm">
                Try adjusting your search query
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default MarketList