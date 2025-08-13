import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallets } from '@privy-io/react-auth'
import { hyperliquidAPI, formatAssetData } from '../services/hyperliquid'
import websocketService from '../services/websocket'
import Chart from './Chart'
import { TradingCardSkeleton } from './LoadingSkeleton'
import { 
  constructOrderAction, 
  signL1Action, 
  constructOrderRequest, 
  getNonce,
  getOrderDirection,
  getOrderPrice
} from '../services/signing'

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

const TradingCard = ({ currentAssetIndex, onSwipeLeft, onSwipeRight, user }) => {
  const { wallets } = useWallets()
  const [formattedAssets, setFormattedAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [positionSize, setPositionSize] = useState(10)
  const [leverage, setLeverage] = useState(1)
  const [userBalance, setUserBalance] = useState(0)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [priceFlash, setPriceFlash] = useState({}) // Track price changes for flash effects
  const [isDataUpdating, setIsDataUpdating] = useState(false) // Show live indicator

  useEffect(() => {
    const fetchInitialAssets = async () => {
      try {
        setLoading(true)
        const metaAndCtxs = await hyperliquidAPI.getMetaAndAssetCtxs()
        console.log('📊 Initial asset data loaded')
        const formatted = formatAssetData(metaAndCtxs)
        setFormattedAssets(formatted)
      } catch (error) {
        console.error('Failed to fetch initial assets:', error)
      } finally {
        setLoading(false)
      }
    }

    // Load initial data
    fetchInitialAssets()

    // Set up WebSocket for real-time price updates
    const handlePriceUpdate = (data) => {
      console.log('💰 Real-time price update:', data)
      
      if (data.mids) {
        // Show data update indicator
        setIsDataUpdating(true)
        setTimeout(() => setIsDataUpdating(false), 1000)
        
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

              console.log(`📈 Updating ${asset.name}: ${asset.markPrice} → ${newPrice} (${direction})`)

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

  useEffect(() => {
    const fetchInitialUserBalance = async () => {
      if (user?.wallet?.address) {
        try {
          // Initial balance fetch
          const perpState = await hyperliquidAPI.getUserState(user.wallet.address)
          console.log('👤 Initial balance loaded:', perpState)
          
          // Check multiple possible balance sources
          const marginSummary = perpState?.marginSummary
          const withdrawable = parseFloat(perpState?.withdrawable || 0)
          const accountValue = parseFloat(marginSummary?.accountValue || 0)
          
          console.log('💰 Balance sources:', {
            withdrawable,
            accountValue,
            marginSummary,
            fullResponse: perpState
          })
          
          // Verify we got the expected data format
          if (perpState && perpState.withdrawable) {
            console.log('✅ Successfully received withdrawable balance:', perpState.withdrawable)
          } else {
            console.log('⚠️ No withdrawable balance found in response')
          }
          
          // Use account value if withdrawable is 0 but account value exists
          const availableBalance = withdrawable > 0 ? withdrawable : accountValue
          setUserBalance(availableBalance)
          
          console.log('💰 Final balance set to:', availableBalance)

          // Subscribe to real-time user data updates
          websocketService.subscribeToUserData(user.wallet.address)
        } catch (error) {
          console.error('Failed to fetch user balance:', error)
          setUserBalance(0)
        }
      }
    }

    // Set up real-time user data listener
    const handleUserDataUpdate = (data) => {
      console.log('👤 Real-time user data update:', data)
      
      if (data.marginSummary) {
        const withdrawable = parseFloat(data.withdrawable || 0)
        const accountValue = parseFloat(data.marginSummary?.accountValue || 0)
        
        console.log('💰 Real-time balance sources:', {
          withdrawable,
          accountValue
        })
        
        // Use account value if withdrawable is 0 but account value exists
        const availableBalance = withdrawable > 0 ? withdrawable : accountValue
        setUserBalance(availableBalance)
        
        console.log('💰 Real-time balance updated to:', availableBalance)
      }
    }

    fetchInitialUserBalance()
    websocketService.on('userDataUpdate', handleUserDataUpdate)

    return () => {
      websocketService.off('userDataUpdate', handleUserDataUpdate)
    }
  }, [user])

  const handleDragEnd = (_, info) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      // Swiped right - Execute trade
      handleTrade('buy')
      onSwipeRight()
    } else if (info.offset.x < -threshold) {
      // Swiped left - Skip
      onSwipeLeft()
    }
  }

  const handleTrade = async (direction) => {
    const asset = formattedAssets[currentAssetIndex % formattedAssets.length]
    if (!asset || isPlacingOrder) return

    const wallet = wallets?.[0]
    if (!wallet) {
      alert('Please connect your wallet to trade')
      return
    }

    try {
      setIsPlacingOrder(true)

      // Calculate order parameters
      const isBuy = getOrderDirection(direction)
      const orderPrice = getOrderPrice(direction, asset.markPrice, true)
      // Calculate size based on USDC position size and mark price
      const markPx = parseFloat(asset.markPrice)
      const orderSize = (positionSize / markPx).toFixed(asset.szDecimals)
      
      // Construct the order action
      const action = constructOrderAction(
        asset.index,
        isBuy,
        orderPrice,
        orderSize,
        false, // reduceOnly
        'limit',
        'Ioc' // Immediate or cancel for market-like behavior
      )

      // Generate nonce
      const nonce = getNonce()

      // Sign the action
      const signature = await signL1Action(wallet, action, null, nonce)
      
      // Construct the request
      const orderRequest = constructOrderRequest(action, signature, nonce)

      console.log('Placing order:', orderRequest)

      // Place the order
      const response = await hyperliquidAPI.placeOrder(orderRequest)
      
      if (response.status === 'ok') {
        const orderStatus = response.response?.data?.statuses?.[0]
        if (orderStatus?.error) {
          alert(`Order failed: ${orderStatus.error}`)
        } else {
          alert(`${direction.toUpperCase()} order placed for ${asset.name}!\nSize: $${positionSize.toFixed(2)} USDC\nLeverage: ${leverage}x`)
        }
      } else {
        alert('Order failed: Unknown error')
      }
    } catch (error) {
      console.error('Order placement error:', error)
      alert(`Order failed: ${error.message}`)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (loading) {
    return <TradingCardSkeleton />
  }

  if (formattedAssets.length === 0) {
    return (
      <div className="h-full min-h-[675px] flex items-center justify-center">
        <h1 className="text-white">No assets available</h1>
      </div>
    )
  }

  const currentAsset = formattedAssets[currentAssetIndex % formattedAssets.length]
  const priceChange = parseFloat(currentAsset.dayChange)

  return (
    <div className="h-full flex flex-col">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="flex-1 bg-gray-700 rounded-2xl m-4 cursor-grab active:cursor-grabbing min-h-0 overflow-y-auto"
        whileDrag={{ scale: 1.02 }}
      >
        {/* Price Chart */}
        <div className="h-60 bg-gray-600 mb-4 overflow-hidden">
          <Chart asset={currentAsset} className="w-full h-full" />
        </div>

        {/* Asset Info */}
        <div className="space-y-4 pr-6 pl-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{currentAsset.name}</h2>
              {/* Live Data Indicator */}
              {isDataUpdating && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                  title="Live data updating"
                />
              )}
            </div>
            <motion.div
              key={`${currentAsset.name}-change-${priceChange}`}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
              className={`text-lg font-semibold ${
                priceChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {priceChange >= 0 ? '+' : ''}
              {priceChange}% (24h)
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <motion.div 
              className="bg-gray-600 p-3 rounded-lg relative overflow-hidden"
              animate={priceFlash[currentAsset.name] ? {
                backgroundColor: priceFlash[currentAsset.name]?.direction === 'up' ? '#10b98120' : '#ef444420'
              } : {
                backgroundColor: '#4b5563' // gray-600 hex equivalent
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="text-gray-300">Market Price</div>
              <motion.div 
                key={`price-${currentAsset.name}-${currentAsset.markPrice}`}
                initial={{ scale: 1, x: 0 }}
                animate={{ 
                  scale: priceFlash[currentAsset.name] ? [1, 1.02, 1] : 1,
                  color: priceFlash[currentAsset.name] ? 
                    (priceFlash[currentAsset.name]?.direction === 'up' ? '#10b981' : '#ef4444') : '#ffffff'
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-white font-semibold"
              >
                {formatPrice(currentAsset.markPrice)}
              </motion.div>
              {/* Price change indicator */}
              {priceFlash[currentAsset.name] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className={`absolute top-1 right-1 text-xs ${
                    priceFlash[currentAsset.name]?.direction === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {priceFlash[currentAsset.name]?.direction === 'up' ? '↗' : '↘'}
                </motion.div>
              )}
            </motion.div>
            <div className="bg-gray-600 p-3 rounded-lg">
              <div className="text-gray-300">Open Interest</div>
              <div className="text-white font-semibold">{formatOpenInterest(currentAsset.openInterest)}</div>
            </div>
          </div>

          {/* Trading Controls */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => handleTrade('buy')}
                disabled={isPlacingOrder}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {isPlacingOrder ? 'Placing...' : 'Buy/Long'}
              </button>
              <button
                onClick={() => handleTrade('sell')}
                disabled={isPlacingOrder}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {isPlacingOrder ? 'Placing...' : 'Sell/Short'}
              </button>
            </div>

            {/* Position Size Slider */}
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Position Size</span>
                <span>${positionSize.toFixed(2)} USDC</span>
              </div>
              <input
                type="range"
                min="10"
                max={Math.max(10, userBalance)}
                step="1"
                value={positionSize}
                onChange={(e) => setPositionSize(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>$10 USDC</span>
                <span>${userBalance.toFixed(2)} USDC</span>
              </div>
              {userBalance < 10 && (
                <div className="mt-2 p-2 bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg">
                  <div className="text-yellow-200 text-xs">
                    ⚠️ Insufficient Perp balance
                  </div>
                </div>
              )}
            </div>

            {/* Leverage Slider */}
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Leverage</span>
                <span>{leverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max={currentAsset.maxLeverage}
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1x</span>
                <span>{currentAsset.maxLeverage}x</span>
              </div>
            </div>
          </div>

          {/* Swipe Instructions */}
          {/* <div className="text-center text-xs text-gray-400">
            <h1>Min: $10 USDC</h1>
          </div> */}
        </div>
      </motion.div>
    </div>
  )
}

export default TradingCard