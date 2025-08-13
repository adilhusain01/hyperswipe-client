import React, { useState, useEffect } from 'react'
import { hyperliquidAPI } from '../services/hyperliquid'
import { PositionsSkeleton } from './LoadingSkeleton'

const Positions = ({ user }) => {
  const [userState, setUserState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserState = async () => {
      if (user?.wallet?.address) {
        try {
          setLoading(true)
          const perpState = await hyperliquidAPI.getUserState(user.wallet.address)
          // console.log('Perp state for positions:', perpState)
          setUserState(perpState)
        } catch (error) {
          console.error('Failed to fetch user positions:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserState()
    // Refresh every 10 seconds for live updates
    const interval = setInterval(fetchUserState, 10000)
    return () => clearInterval(interval)
  }, [user])

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

  if (loading) {
    return <PositionsSkeleton />
  }

  const positions = userState?.assetPositions || []
  const marginSummary = userState?.marginSummary || {}

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4 pb-8">
        {/* Header with Account Summary */}
        <div className="bg-gray-700 rounded-2xl p-4">
          <h2 className="text-lg font-bold text-white mb-3">Active Positions</h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center">
              <div className="text-gray-300 text-xs">Portfolio Value</div>
              <div className="text-white font-semibold">
                ${parseFloat(marginSummary.accountValue || 0).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-300 text-xs">Total PnL</div>
              <div className={`font-semibold ${
                positions.reduce((sum, pos) => sum + parseFloat(pos.position.unrealizedPnl || 0), 0) >= 0 
                ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatPnL(positions.reduce((sum, pos) => sum + parseFloat(pos.position.unrealizedPnl || 0), 0)).value}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-300 text-xs">Positions</div>
              <div className="text-white font-semibold">{positions.length}</div>
            </div>
          </div>
        </div>

        {/* Position List */}
        {positions.length > 0 ? (
          <div className="space-y-3">
            {positions.map((pos, index) => {
              const position = pos.position
              const pnl = formatPnL(position.unrealizedPnl)
              const positionSide = getPositionSide(position.szi)
              const leverage = position.leverage?.value || 1
              const entryPrice = parseFloat(position.entryPx || 0)
              const markPrice = parseFloat(position.markPrice || 0)
              const priceChange = entryPrice > 0 ? ((markPrice - entryPrice) / entryPrice * 100) : 0
              
              return (
                <div key={index} className="bg-gray-700 rounded-xl p-4">
                  {/* Position Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="text-white font-semibold text-lg">{position.coin}</div>
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
                      <div className="text-white font-semibold">{Math.abs(parseFloat(position.szi)).toFixed(4)}</div>
                    </div>
                    <div className="bg-gray-600 p-3 rounded-lg">
                      <div className="text-gray-300 text-xs mb-1">Entry Price</div>
                      <div className="text-white font-semibold">{formatPrice(position.entryPx)}</div>
                    </div>
                    <div className="bg-gray-600 p-3 rounded-lg">
                      <div className="text-gray-300 text-xs mb-1">Mark Price</div>
                      <div className="text-white font-semibold">{formatPrice(position.markPrice)}</div>
                    </div>
                    <div className="bg-gray-600 p-3 rounded-lg">
                      <div className="text-gray-300 text-xs mb-1">Margin Used</div>
                      <div className="text-white font-semibold">
                        ${parseFloat(position.marginUsed || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Position Actions */}
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                      Close Position
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
                  ${parseFloat(userState?.withdrawable || 0).toFixed(2)}
                </div>
              </div>
              <div className="bg-gray-600 p-3 rounded-lg">
                <div className="text-gray-300 text-xs mb-1">Margin Usage</div>
                <div className="text-white font-semibold">
                  ${parseFloat(marginSummary.totalMarginUsed || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Positions