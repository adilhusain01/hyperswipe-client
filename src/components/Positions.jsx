import React, { useState, useEffect } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { hyperliquidAPI, formatAssetData } from '../services/hyperliquid'
import { PositionsSkeleton } from './LoadingSkeleton'
import { pythonSigningService } from '../services/pythonSigning'
import { getFormattedOrderPrice } from '../utils/priceUtils'
import websocketService from '../services/websocket'
import keyStore from '../services/keyStore'
import { getMarketPrice, formatHyperliquidSize } from '../utils/hyperliquidPricing'

const Positions = ({ user }) => {
  const { wallets } = useWallets()
  const [userState, setUserState] = useState(null)
  const [openOrders, setOpenOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [closingPosition, setClosingPosition] = useState(null)
  const [privateKey, setPrivateKey] = useState('')
  const [showPrivateKeyInput, setShowPrivateKeyInput] = useState(false)
  const [livePrices, setLivePrices] = useState({})

  // Load stored private key on component mount
  useEffect(() => {
    const storedKey = keyStore.getPrivateKey()
    if (storedKey) {
      setPrivateKey(storedKey)
    }
  }, [])

  useEffect(() => {
    const fetchUserState = async () => {
      if (user?.wallet?.address) {
        try {
          setLoading(true)
          const [perpState, userOpenOrders] = await Promise.all([
            hyperliquidAPI.getUserState(user.wallet.address),
            hyperliquidAPI.getOpenOrders(user.wallet.address)
          ])
          // console.log('Perp state for positions:', perpState)
          // console.log('Open orders:', userOpenOrders)
          setUserState(perpState)
          setOpenOrders(userOpenOrders)
        } catch (error) {
          console.error('Failed to fetch user positions:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserState()
    
    // Note: Don't subscribe again if TradingCard is already subscribed
    // The WebSocket service should share the subscription
    
    // Refresh every 10 seconds for live updates (backup)
    const interval = setInterval(fetchUserState, 10000)
    return () => clearInterval(interval)
  }, [user])

  // WebSocket effect for live price updates
  useEffect(() => {
    const handlePriceUpdate = (data) => {
      // Handle price updates from WebSocket - same pattern as TradingCard
      if (data && data.mids) {
        setLivePrices(prevPrices => ({
          ...prevPrices,
          ...data.mids
        }))
      }
    }

    // Subscribe to price updates using the correct event
    websocketService.on('priceUpdate', handlePriceUpdate)

    return () => {
      websocketService.off('priceUpdate', handlePriceUpdate)
    }
  }, [])

  // WebSocket effect for real-time user data updates
  useEffect(() => {
    const handleUserDataUpdate = (data) => {
      // Update user state with real-time data
      if (data) {
        console.log('👤 Positions: Received user data update:', data)
        
        // Handle nested clearinghouseState structure from WebSocket
        let userData = data
        if (data.clearinghouseState) {
          userData = data.clearinghouseState
          console.log('💰 Positions: Using clearinghouseState data:', userData.marginSummary?.accountValue)
        } else {
          console.log('💰 Positions: Direct data account value:', data.marginSummary?.accountValue)
        }
        
        // Update open orders if provided in WebSocket data
        if (data.openOrders && Array.isArray(data.openOrders)) {
          console.log('📋 Positions: Updating open orders from WebSocket:', data.openOrders.length)
          setOpenOrders(data.openOrders)
        }
        
        console.log('📋 Positions: Real-time user data update processed')
        setUserState(userData)
      }
    }

    // Subscribe to user data updates
    websocketService.on('userDataUpdate', handleUserDataUpdate)

    return () => {
      websocketService.off('userDataUpdate', handleUserDataUpdate)
    }
  }, [])

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

  const formatPnL = (pnl) => {
    const value = parseFloat(pnl || 0)
    const isPositive = value >= 0
    return {
      value: `${isPositive ? '+' : ''}$${Math.abs(value).toFixed(2)}`,
      isPositive
    }
  }

  const getPositionSide = (size) => {
    const sizeValue = parseFloat(size || 0)
    if (sizeValue > 0) return { side: 'LONG', color: 'text-green-400' }
    if (sizeValue < 0) return { side: 'SHORT', color: 'text-red-400' }
    return { side: 'CLOSED', color: 'text-gray-400' }
  }

  const getCurrentPrice = (position) => {
    // Try to get live price from WebSocket, fallback to position mark price
    const livePrice = livePrices[position.coin]
    if (livePrice && parseFloat(livePrice) > 0) {
      return parseFloat(livePrice)
    }
    
    // Fallback to position mark price
    const markPrice = parseFloat(position.markPrice || 0)
    if (markPrice > 0) {
      return markPrice
    }
    
    // Last fallback: return 0 (will show as $0.00)
    return 0
  }


  const cancelOrder = async (order) => {
    if (!privateKey) {
      setShowPrivateKeyInput(true)
      return
    }

    try {
      const wallet = wallets[0]
      if (!wallet) {
        alert('No wallet connected')
        return
      }

      // Get asset metadata
      const metaAndCtxs = await hyperliquidAPI.getMetaAndAssetCtxs()
      const assets = formatAssetData(metaAndCtxs)
      const asset = assets.find(a => a.name === order.coin)
      if (!asset) {
        alert('Asset not found')
        return
      }

      console.log(`Cancelling order ${order.oid} for ${order.coin}`)

      // Sign and place the cancel order
      const cancelRequest = await pythonSigningService.signCancelOrder({
        assetIndex: asset.index,
        orderId: order.oid,
        walletAddress: wallet.address.toLowerCase()
      }, privateKey)

      const response = await hyperliquidAPI.placeOrder(cancelRequest)
      console.log('Cancel order response:', response)

      if (response.status === 'ok') {
        const orderStatus = response.response?.data?.statuses?.[0]
        if (orderStatus?.error) {
          alert(`Failed to cancel order: ${orderStatus.error}`)
        } else {
          alert(`Order cancelled for ${order.coin}!`)
        }
        
        // Refresh open orders
        const newOpenOrders = await hyperliquidAPI.getOpenOrders(user.wallet.address)
        setOpenOrders(newOpenOrders)
      } else {
        const errorMsg = response.response || 'Unknown error'
        alert(`Failed to cancel order: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert(`Error cancelling order: ${error.message}`)
    }
  }

  const closePosition = async (position) => {
    if (!privateKey) {
      setShowPrivateKeyInput(true)
      return
    }

    try {
      setClosingPosition(position.coin)
      
      const wallet = wallets[0]
      if (!wallet) {
        alert('No wallet connected')
        return
      }

      // Get asset metadata for price formatting
      const metaAndCtxs = await hyperliquidAPI.getMetaAndAssetCtxs()
      const assets = formatAssetData(metaAndCtxs)
      const asset = assets.find(a => a.name === position.coin)
      if (!asset) {
        alert('Asset not found')
        return
      }

      // Determine close direction (opposite of current position)
      const positionSize = parseFloat(position.szi)
      const isLong = positionSize > 0
      const closeDirection = isLong ? 'sell' : 'buy'
      const closeSize = formatHyperliquidSize(Math.abs(positionSize), asset.szDecimals)

      // Get current market price using the same logic as display
      let currentPrice = getCurrentPrice(position)
      
      if (currentPrice <= 0) {
        // Final fallback: get current price from fresh asset data
        console.log('No valid price found, fetching fresh market data...')
        const assetWithPrice = assets.find(a => a.name === position.coin)
        currentPrice = parseFloat(assetWithPrice?.markPrice || 0)
        
        if (currentPrice <= 0) {
          alert(`Unable to get current price for ${position.coin}. Please try again.`)
          return
        }
      }

      // Use proper Hyperliquid price formatting for market-like execution
      // For closing positions: buy to close short, sell to close long
      const orderPrice = getMarketPrice(currentPrice.toString(), !isLong, asset.szDecimals, 2)

      console.log(`Closing ${position.coin} position:`, {
        direction: closeDirection,
        size: closeSize,
        currentMarketPrice: currentPrice,
        orderPrice: orderPrice,
        originalSize: position.szi
      })

      // Sign and place the close order
      const orderRequest = await pythonSigningService.signOrder({
        assetIndex: asset.index,
        isBuy: !isLong, // Opposite of current position
        price: orderPrice,
        size: closeSize,
        walletAddress: wallet.address.toLowerCase(),
        reduceOnly: true, // Important: this closes the position
        orderType: 'limit',
        timeInForce: 'Ioc' // Immediate or Cancel for market-like execution
      }, privateKey)

      console.log('Close order request:', orderRequest)
      
      const response = await hyperliquidAPI.placeOrder(orderRequest)
      console.log('Close order response:', response)

      if (response.status === 'ok') {
        const orderStatus = response.response?.data?.statuses?.[0]
        console.log('📊 Close order status:', orderStatus)
        
        if (orderStatus?.error) {
          alert(`Failed to close position: ${orderStatus.error}`)
        } else if (orderStatus?.resting) {
          alert(`Close order placed for ${position.coin}! Order ID: ${orderStatus.resting.oid}`)
        } else if (orderStatus?.filled) {
          alert(`${position.coin} position closed successfully!`)
        } else {
          alert(`Close order submitted for ${position.coin}`)
        }
        
        // Refresh both positions and open orders after close attempt
        const [newPerpState, newOpenOrders] = await Promise.all([
          hyperliquidAPI.getUserState(user.wallet.address),
          hyperliquidAPI.getOpenOrders(user.wallet.address)
        ])
        setUserState(newPerpState)
        setOpenOrders(newOpenOrders)
      } else {
        const errorMsg = response.response || 'Unknown error'
        alert(`Failed to close position: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Error closing position:', error)
      alert(`Error closing position: ${error.message}`)
    } finally {
      setClosingPosition(null)
    }
  }

  if (loading) {
    return <PositionsSkeleton />
  }

  // Robust data parsing with fallbacks
  const positions = Array.isArray(userState?.assetPositions) ? userState.assetPositions : []
  const marginSummary = userState?.marginSummary || userState?.crossMarginSummary || {}
  // Open orders now fetched separately via state
  
  // Additional safety checks
  const accountValue = parseFloat(marginSummary?.accountValue || 0)
  const withdrawableBalance = parseFloat(userState?.withdrawable || 0)
  const totalMarginUsed = parseFloat(marginSummary?.totalMarginUsed || 0)

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4 pb-20">
        {/* Header with Account Summary */}
        <div className="bg-gray-700 rounded-2xl p-4">
          <h2 className="text-lg font-bold text-white mb-3">Active Positions</h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center">
              <div className="text-gray-300 text-xs">Portfolio Value</div>
              <div className="text-white font-semibold">
                ${accountValue.toFixed(3)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-300 text-xs">Total PnL</div>
              <div className={`font-semibold ${
                positions.reduce((sum, pos) => {
                  const pnl = parseFloat(pos?.position?.unrealizedPnl || 0)
                  return sum + (isNaN(pnl) ? 0 : pnl)
                }, 0) >= 0 
                ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatPnL(positions.reduce((sum, pos) => {
                  const pnl = parseFloat(pos?.position?.unrealizedPnl || 0)
                  return sum + (isNaN(pnl) ? 0 : pnl)
                }, 0)).value}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-300 text-xs">Positions</div>
              <div className="text-white font-semibold">{positions.length}</div>
            </div>
          </div>
        </div>

        {/* Open Orders */}
        {openOrders.length > 0 && (
          <div className="bg-gray-700 rounded-2xl p-4">
            <h3 className="text-lg font-bold text-white mb-3">Open Orders ({openOrders.length})</h3>
            <div className="space-y-2">
              {openOrders.slice(0, 3).map((order, index) => (
                <div key={order.oid || index} className="bg-gray-600 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-white font-semibold">{order.coin}</span>
                      <span className={`ml-2 text-sm ${order.side === 'B' ? 'text-green-400' : 'text-red-400'}`}>
                        {order.side === 'B' ? 'BUY' : 'SELL'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">${parseFloat(order.limitPx).toFixed(3)}</div>
                      <div className="text-gray-300 text-sm">{order.sz}</div>
                      {/* Only show cancel button for open/pending orders */}
                      {(!order.status || order.status === 'open' || order.status === 'pending') && (
                        <button 
                          onClick={() => cancelOrder(order)}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded mt-1 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      {order.status === 'filled' && (
                        <div className="text-xs text-green-400 mt-1 font-medium">
                          ✓ Filled
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        ID: {order.oid}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {openOrders.length > 3 && (
                <div className="text-center text-gray-400 text-sm">
                  +{openOrders.length - 3} more orders
                </div>
              )}
            </div>
          </div>
        )}

        {/* Position List */}
        {positions.length > 0 ? (
          <div className="space-y-3">
            {positions.map((pos, index) => {
              // Robust position data extraction
              const position = pos?.position || {}
              const coin = position?.coin || 'UNKNOWN'
              const szi = position?.szi || '0'
              const unrealizedPnl = position?.unrealizedPnl || '0'
              const entryPx = position?.entryPx || '0'
              const marginUsed = position?.marginUsed || '0'
              const leverage = position?.leverage?.value || 1
              
              // Safe calculations
              const pnl = formatPnL(unrealizedPnl)
              const positionSide = getPositionSide(szi)
              const entryPrice = parseFloat(entryPx)
              const currentPrice = getCurrentPrice({ coin, markPrice: entryPx }) // Use live price with fallback
              const priceChange = entryPrice > 0 && currentPrice > 0 ? ((currentPrice - entryPrice) / entryPrice * 100) : 0
              
              return (
                <div key={index} className="bg-gray-700 rounded-xl p-4">
                  {/* Position Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="text-white font-semibold text-lg">{coin}</div>
                        <div className={`text-sm font-medium ${positionSide.color}`}>
                          {positionSide.side} {leverage}x
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${pnl.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl.value}
                      </div>
                      <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Position Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-600 p-3 rounded-lg">
                      <div className="text-gray-300 text-xs mb-1">Position Size</div>
                      <div className="text-white font-semibold">{Math.abs(parseFloat(szi)).toFixed(4)}</div>
                    </div>
                    <div className="bg-gray-600 p-3 rounded-lg">
                      <div className="text-gray-300 text-xs mb-1">Entry Price</div>
                      <div className="text-white font-semibold">{formatPrice(entryPx)}</div>
                    </div>
                    <div className="bg-gray-600 p-3 rounded-lg">
                      <div className="text-gray-300 text-xs mb-1">Mark Price</div>
                      <div className="text-white font-semibold">{formatPrice(currentPrice)}</div>
                    </div>
                    <div className="bg-gray-600 p-3 rounded-lg">
                      <div className="text-gray-300 text-xs mb-1">Margin Used</div>
                      <div className="text-white font-semibold">
                        ${parseFloat(marginUsed).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Position Actions */}
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => closePosition({
                        coin,
                        szi,
                        entryPx,
                        markPrice: currentPrice.toString()
                      })}
                      disabled={closingPosition === coin}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                    >
                      {closingPosition === coin ? 'Closing...' : 'Close Position'}
                    </button>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                      Manage
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16" />
        )}

        {/* Risk Management Info */}
        {positions.length > 0 && (
          <div className="bg-gray-700 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">Risk Management</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-600 p-3 rounded-lg">
                <div className="text-gray-300 text-xs mb-1">Available Balance</div>
                <div className="text-white font-semibold">
                  ${withdrawableBalance.toFixed(2)}
                </div>
              </div>
              <div className="bg-gray-600 p-3 rounded-lg">
                <div className="text-gray-300 text-xs mb-1">Margin Usage</div>
                <div className="text-white font-semibold">
                  ${totalMarginUsed.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Private Key Input Modal */}
      {showPrivateKeyInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Private Key Required</h3>
            <p className="text-gray-300 text-sm mb-4">
              Enter your private key to sign the close position transaction
            </p>
            <div className="space-y-4">
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="0x..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPrivateKeyInput(false)
                    setPrivateKey('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (privateKey.trim()) {
                      keyStore.setPrivateKey(privateKey.trim())
                      setShowPrivateKeyInput(false)
                    }
                  }}
                  disabled={!privateKey.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Positions