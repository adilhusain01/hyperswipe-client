import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallets } from '@privy-io/react-auth'
import { hyperliquidAPI, formatAssetData } from '../services/hyperliquid'
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

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true)
        const metaAndCtxs = await hyperliquidAPI.getMetaAndAssetCtxs()
        // console.log('Raw API data:', metaAndCtxs)
        const formatted = formatAssetData(metaAndCtxs)
        // console.log('Formatted assets:', formatted.slice(0, 3)) // Log first 3 assets
        setFormattedAssets(formatted)
      } catch (error) {
        console.error('Failed to fetch assets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
    const interval = setInterval(fetchAssets, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (user?.wallet?.address) {
        try {
          // Use Hyperliquid perp account balance for trading
          const perpState = await hyperliquidAPI.getUserState(user.wallet.address)
          
          console.log('Perp state for trading:', perpState)
          
          // Use withdrawable balance for trading (available balance)
          const availableBalance = parseFloat(perpState?.withdrawable || 0)
          console.log(`Available balance for trading: ${availableBalance}`)
          setUserBalance(availableBalance)
        } catch (error) {
          console.error('Failed to fetch user balance:', error)
          setUserBalance(0)
        }
      }
    }

    fetchUserBalance()
    // Refresh balance every 10 seconds
    const interval = setInterval(fetchUserBalance, 10000)
    return () => clearInterval(interval)
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
            <h2 className="text-2xl font-bold text-white">{currentAsset.name}</h2>
            <div
              className={`text-lg font-semibold ${
                priceChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {priceChange >= 0 ? '+' : ''}
              {priceChange}% (24h)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-600 p-3 rounded-lg">
              <div className="text-gray-300">Market Price</div>
              <div className="text-white font-semibold">{formatPrice(currentAsset.markPrice)}</div>
            </div>
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
                    ⚠️ Insufficient balance. Transfer USDC from your Arbitrum wallet in the Profile tab.
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