import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { hyperliquidAPI, formatAssetData } from '../services/hyperliquid'
import websocketService from '../services/websocket'
import { MarketListSkeleton } from './LoadingSkeleton'

// Import Glass Icons
import layersIcon from '../glass_icons/layers.svg'
import magnifierIcon from '../glass_icons/magnifier.svg'
import squareChartLineIcon from '../glass_icons/square-chart-line.svg'

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
    <div className="h-full overflow-y-auto bg-black/10" style={{fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
      <motion.div 
        className="p-4 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div 
          className="glass-card rounded-2xl p-8 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <img src={layersIcon} alt="Markets" className="w-6 h-6" />
            <h2 className="text-lg font-medium bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">Markets</h2>
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
              className="w-full px-4 py-3 bg-black/20 text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300 placeholder-slate-400 backdrop-blur-sm font-normal"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              <img src={magnifierIcon} alt="Search" className="w-4 h-4" />
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex gap-1 overflow-x-auto py-2 px-1">
            {[
              { key: 'name', label: 'Name' },
              { key: 'price', label: 'Price' },
              { key: 'change', label: '24h' },
              { key: 'volume', label: 'Volume' }
            ].map(option => (
              <motion.button
                key={option.key}
                onClick={() => setSortBy(option.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-normal whitespace-nowrap transition-all duration-300 backdrop-blur-sm ${
                  sortBy === option.key 
                    ? 'bg-white/10 text-white border border-white/20 shadow-lg' 
                    : 'bg-black/20 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20'
                }`}
                whileTap={{ scale: 0.98 }}
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
                className="glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-white/20"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  {/* Token Info */}
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-medium text-lg bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                        {asset.name}
                      </div>
                      <div className="text-slate-400 text-sm flex items-center gap-2 font-normal">
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-slate-300 text-xs font-normal backdrop-blur-sm">
                          Max {asset.maxLeverage}x
                        </span>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-slate-300 text-xs font-normal backdrop-blur-sm">
                          OI: {formatOpenInterest(asset.openInterest)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="text-right">
                    <motion.div
                      className="text-white font-medium text-lg relative px-2 py-1 rounded-lg"
                      animate={flash ? {
                        backgroundColor: flash.direction === 'up' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)'
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
                          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-normal bg-white/10 border border-white/20 backdrop-blur-sm ${
                            flash.direction === 'up' 
                              ? 'text-green-300' 
                              : 'text-red-300'
                          }`}
                        >
                          {flash.direction === 'up' ? '↗' : '↘'}
                        </motion.div>
                      )}
                    </motion.div>
                    <motion.div 
                      className={`text-sm font-normal px-2 py-1 rounded-lg inline-block mt-1 bg-white/5 border border-white/10 backdrop-blur-sm ${
                        priceChange >= 0 
                          ? 'text-green-300' 
                          : 'text-red-300'
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
            <div className="glass-card rounded-2xl p-8 inline-block bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="text-slate-300 text-lg mb-2 font-normal">No tokens found</div>
              <div className="text-slate-400 text-sm font-normal">
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