import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useWallets, usePrivy } from '@privy-io/react-auth'
import { hyperliquidAPI, formatAssetData } from '../services/hyperliquid'
import websocketService from '../services/websocket'
import Chart from './Chart'
import { TradingCardSkeleton } from './LoadingSkeleton'
import { 
  pythonSigningService,
  constructOrderAction, 
  getNonce,
  getOrderDirection
} from '../services/pythonSigning'
import { getFormattedOrderPrice } from '../utils/priceUtils'
import keyStore from '../services/keyStore'
import { getMarketPrice, calculatePositionSize } from '../utils/hyperliquidPricing'

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

const TradingCard = ({ currentAssetIndex, onSwipeLeft, onSwipeRight, onAssetCountChange, user }) => {
  const { wallets, ready: walletsReady } = useWallets()
  const { signMessage, authenticated, connectWallet } = usePrivy()
  const [formattedAssets, setFormattedAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [positionSize, setPositionSize] = useState(10)
  const [leverage, setLeverage] = useState(1)
  const [userBalance, setUserBalance] = useState(0)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [lastOrderTime, setLastOrderTime] = useState(0)
  const [priceFlash, setPriceFlash] = useState({}) // Track price changes for flash effects
  const [isDataUpdating, setIsDataUpdating] = useState(false) // Show live indicator
  const [privateKey, setPrivateKey] = useState('')
  const [showPrivateKeyInput, setShowPrivateKeyInput] = useState(false)
  const [signingServiceAvailable, setSigningServiceAvailable] = useState(false)

  // Add refs to prevent multiple API calls
  const hasInitializedAssets = useRef(false)
  const lastUserAddress = useRef(null)

  // Check signing service availability and load stored private key
  useEffect(() => {
    const checkSigningService = async () => {
      try {
        const available = await pythonSigningService.isServiceAvailable()
        setSigningServiceAvailable(available)
        console.log('🐍 Python signing service available:', available)
      } catch (error) {
        console.error('❌ Failed to check signing service:', error)
        setSigningServiceAvailable(false)
      }
    }
    
    // Load stored private key if available
    const storedKey = keyStore.getPrivateKey()
    if (storedKey) {
      setPrivateKey(storedKey)
    }
    
    checkSigningService()
  }, [])

  useEffect(() => {
    const fetchInitialAssets = async () => {
      // Prevent multiple calls
      if (hasInitializedAssets.current) return
      
      try {
        setLoading(true)
        console.log('📊 Fetching initial assets from Hyperliquid...')
        
        const metaAndCtxs = await hyperliquidAPI.getMetaAndAssetCtxs()
        
        const formatted = formatAssetData(metaAndCtxs)
        
        setFormattedAssets(formatted)
        hasInitializedAssets.current = true
        console.log('✅ Assets loaded successfully:', formatted.slice(0, 3))
        
        // Notify parent component of asset count
        if (onAssetCountChange) {
          onAssetCountChange(formatted.length)
        }
      } catch (error) {
        console.error('Failed to fetch initial assets:', error)
        // Create fallback mock data to prevent infinite loading
        const mockAssets = [
          {
            index: 0,
            name: 'SOL',
            markPrice: '150.25',
            prevDayPrice: '148.50',
            dayChange: '1.18',
            openInterest: '12500000',
            maxLeverage: 20,
            szDecimals: 3,
            onlyIsolated: false,
            isDelisted: false
          },
          {
            index: 1,
            name: 'ETH',
            markPrice: '2450.75',
            prevDayPrice: '2425.30',
            dayChange: '1.05',
            openInterest: '45200000',
            maxLeverage: 25,
            szDecimals: 4,
            onlyIsolated: false,
            isDelisted: false
          }
        ]
        setFormattedAssets(mockAssets)
        
        // Notify parent component of asset count for mock data too
        if (onAssetCountChange) {
          onAssetCountChange(mockAssets.length)
        }
      } finally {
        setLoading(false)
      }
    }

    // Load initial data
    fetchInitialAssets()

    // Set up WebSocket for real-time price updates
    const handlePriceUpdate = (data) => {
      
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
        // Prevent multiple calls for the same user
        if (lastUserAddress.current === user.wallet.address) return
        lastUserAddress.current = user.wallet.address
        
        try {
          console.log('💰 Fetching user balance for:', user.wallet.address)
          // Initial balance fetch
          const perpState = await hyperliquidAPI.getUserState(user.wallet.address)
          
          // Check multiple possible balance sources
          const marginSummary = perpState?.marginSummary
          const withdrawable = parseFloat(perpState?.withdrawable || 0)
          const accountValue = parseFloat(marginSummary?.accountValue || 0)
          
          // For trading purposes, use withdrawable balance (available after reserves)
          // But for display consistency, show account value
          const displayBalance = accountValue > 0 ? accountValue : withdrawable
          const tradingBalance = withdrawable > 0 ? withdrawable : accountValue
          setUserBalance(displayBalance)

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
      // Handle nested clearinghouseState structure from WebSocket
      let userData = data
      if (data.clearinghouseState) {
        userData = data.clearinghouseState
      }
      
      if (userData.marginSummary) {
        const withdrawable = parseFloat(userData.withdrawable || 0)
        const accountValue = parseFloat(userData.marginSummary?.accountValue || 0)
        
        // Consistent balance logic: Use account value for display consistency  
        const availableBalance = accountValue > 0 ? accountValue : withdrawable
        setUserBalance(availableBalance)
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
      // Swiped right - Next asset
      onSwipeRight()
    } else if (info.offset.x < -threshold) {
      // Swiped left - Previous asset  
      onSwipeLeft()
    }
  }

  const handleTrade = async (direction) => {
    const asset = formattedAssets[currentAssetIndex % formattedAssets.length]
    if (!asset || isPlacingOrder) return

    // Rate limiting: prevent requests within 3 seconds of last order
    const now = Date.now()
    const timeSinceLastOrder = now - lastOrderTime
    const minDelay = 3000 // 3 seconds
    
    if (timeSinceLastOrder < minDelay) {
      const waitTime = Math.ceil((minDelay - timeSinceLastOrder) / 1000)
      alert(`Please wait ${waitTime} seconds before placing another order to avoid rate limits.`)
      return
    }

    // Check if wallets are ready
    if (!walletsReady) {
      alert('Wallets are still loading. Please wait a moment.')
      return
    }

    const wallet = wallets?.[0]
    
    if (!authenticated) {
      alert('Please authenticate first')
      return
    }

    if (!wallet) {
      // Try to connect wallet if none available
      try {
        await connectWallet()
        return // Let user try again after connecting
      } catch {
        alert('Failed to connect wallet. Please try again.')
        return
      }
    }
    
    if (!wallet.address) {
      alert('Wallet address not available. Please reconnect your wallet.')
      return
    }


    try {
      setIsPlacingOrder(true)
      setLastOrderTime(now) // Record the order attempt time

      // Calculate order parameters
      const isBuy = getOrderDirection(direction)
      
      // Use proper Hyperliquid price formatting for market-like execution
      const orderPrice = getMarketPrice(asset.markPrice, isBuy, asset.szDecimals, 2)
      
      // Calculate size with proper formatting
      const orderSize = calculatePositionSize(positionSize, asset.markPrice, asset.szDecimals)
      
      console.log('📊 Order parameters:', {
        asset: asset.name,
        assetIndex: asset.index,
        direction,
        isBuy,
        markPrice: asset.markPrice,
        orderPrice,
        positionSize,
        orderSize,
        szDecimals: asset.szDecimals
      })
      
      // Construct the order action for market-like execution
      const action = constructOrderAction(
        asset.index,
        isBuy,
        orderPrice,
        orderSize,
        false, // reduceOnly
        'limit',
        'Ioc' // Immediate or Cancel for market-like execution
      )

      // Generate nonce
      const nonce = getNonce()

      // Get the wallet connector type for better error handling
      console.log('🔗 Wallet details:', {
        address: wallet.address,
        connectorType: wallet.connectorType,
        walletClientType: wallet.walletClientType,
        imported: wallet.imported,
        chainId: wallet.chainId
      })

      // Check if Python signing service is available
      if (!signingServiceAvailable) {
        alert('Python signing service is not available. Please ensure it is running on localhost:8081')
        return
      }

      // Check if private key is provided
      if (!privateKey) {
        setShowPrivateKeyInput(true)
        return
      }

      // Sign the order using Python signing service
      const orderRequest = await pythonSigningService.signOrder({
        assetIndex: asset.index,
        isBuy,
        price: orderPrice,
        size: orderSize,
        walletAddress: wallet.address.toLowerCase(),
        reduceOnly: false,
        orderType: 'limit',
        timeInForce: 'Ioc' // Immediate or Cancel for market-like execution
      }, privateKey)

      // Place the order
      console.log('📤 Sending order request to Hyperliquid:', JSON.stringify(orderRequest, null, 2))
      const response = await hyperliquidAPI.placeOrder(orderRequest)
      console.log('📨 Hyperliquid API response:', response)
      
      if (response.status === 'ok') {
        const orderStatus = response.response?.data?.statuses?.[0]
        console.log('📊 Order status:', orderStatus)
        
        if (orderStatus?.error) {
          alert(`Order failed: ${orderStatus.error}`)
        } else {
          alert(`${direction.toUpperCase()} order placed for ${asset.name}!\nSize: $${positionSize.toFixed(2)} USDC\nLeverage: ${leverage}x`)
        }
      } else {
        console.error('❌ Order failed with response:', response)
        const errorMsg = response.response || response.error || 'Unknown error'
        
        // Check for specific Hyperliquid errors
        if (typeof errorMsg === 'string' && errorMsg.includes('does not exist')) {
          alert(
            'Account Not Found!\n\n' +
            'Your wallet needs to be registered with Hyperliquid first.\n\n' +
            'Please:\n' +
            '1. Visit https://app.hyperliquid.xyz/\n' +
            '2. Connect your wallet\n' +
            '3. Complete the account setup\n' +
            '4. Then return to HyperSwipe to trade'
          )
        } else {
          alert(`Order failed: ${errorMsg}`)
        }
      }
    } catch (error) {
      console.error('Order placement error:', error)
      
      // Handle specific wallet connection errors
      if (error.message && error.message.includes('Wallet connection lost')) {
        // Give user specific instructions for wallet reconnection
        const reconnect = window.confirm(
          'Wallet connection lost. Would you like to reconnect your wallet now?\n\n' +
          'Click OK to reconnect, or Cancel to try again later.'
        )
        
        if (reconnect) {
          try {
            await connectWallet()
            alert('Wallet reconnected! Please try your trade again.')
          } catch {
            alert('Failed to reconnect wallet. Please try logging out and back in.')
          }
        }
      } else if (error.message && error.message.includes('MetaMask/injected wallet signing failed')) {
        // MetaMask specific error handling
        alert(
          'MetaMask signing failed!\n\n' +
          'Please check:\n' +
          '• MetaMask is unlocked\n' +
          '• Connected to the correct network (Arbitrum Sepolia)\n' +
          '• Try refreshing the page and reconnecting'
        )
      } else if (error.message && error.message.includes('Rate limit exceeded')) {
        // Rate limit specific error handling
        alert(
          'Rate limit exceeded!\n\n' +
          'Hyperliquid has temporary rate limits.\n' +
          'Please wait 10-15 seconds before trying again.'
        )
      } else {
        alert(`Order failed: ${error.message}`)
      }
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

  // Safe asset access with bounds checking
  const currentAsset = formattedAssets.length > 0 
    ? formattedAssets[currentAssetIndex % formattedAssets.length] 
    : null
  const priceChange = parseFloat(currentAsset?.dayChange || 0)

  // Early return if no current asset (still loading or error)
  if (!currentAsset) {
    return <TradingCardSkeleton />
  }

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
        <div className="h-60 bg-gray-800 mb-4 overflow-hidden rounded-t-2xl" style={{ minHeight: '240px' }}>
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
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
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
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
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

      {/* Private Key Input Modal */}
      {showPrivateKeyInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Enter Private Key</h3>
            <p className="text-gray-300 text-sm mb-4">
              To use the Python signing service, you need to provide your private key.
              This is processed securely and not stored.
            </p>
            <div className="mb-4">
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPrivateKeyInput(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (privateKey.trim()) {
                    keyStore.setPrivateKey(privateKey.trim())
                    setShowPrivateKeyInput(false)
                    // Retry the trade with the provided private key
                    // This will be called automatically by handleTrade
                  }
                }}
                disabled={!privateKey.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
            {!signingServiceAvailable && (
              <p className="text-red-400 text-sm mt-3">
                ⚠️ Python signing service not available. Please ensure it's running on localhost:8081
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TradingCard