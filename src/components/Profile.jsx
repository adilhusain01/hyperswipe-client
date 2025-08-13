import React, { useState, useEffect } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { hyperliquidAPI } from '../services/hyperliquid'
import { walletService, hyperliquidAccountService } from '../services/wallet'
import websocketService from '../services/websocket'
import { ProfileSkeleton } from './LoadingSkeleton'

const CopyIcon = ({ onClick, copied }) => (
  <button
    onClick={onClick}
    className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
    title={copied ? "Copied!" : "Copy address"}
  >
    {copied ? (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
    )}
  </button>
)

const Profile = ({ user }) => {
  const { wallets } = useWallets()
  const [userState, setUserState] = useState(null)
  const [spotState, setSpotState] = useState(null)
  const [walletUSDCBalance, setWalletUSDCBalance] = useState(0)
  const [perpAccountExists, setPerpAccountExists] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addressCopied, setAddressCopied] = useState(false)
  const [transferAmount, setTransferAmount] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferError, setTransferError] = useState('')

  useEffect(() => {
    const fetchInitialUserState = async () => {
      if (user?.wallet?.address) {
        try {
          setLoading(true)
          const [perpState, spotBalances, walletUSDC, perpAccount] = await Promise.all([
            hyperliquidAPI.getUserState(user.wallet.address),
            hyperliquidAPI.getSpotBalances(user.wallet.address),
            walletService.getUSDCBalance(user.wallet.address),
            hyperliquidAccountService.checkPerpAccount(user.wallet.address)
          ])
          
          console.log('📊 Profile: Initial data loaded')
          
          setUserState(perpState)
          setSpotState(spotBalances)
          setWalletUSDCBalance(walletUSDC)
          setPerpAccountExists(perpAccount.exists)

          // Subscribe to real-time user data updates
          websocketService.subscribeToUserData(user.wallet.address)
        } catch (error) {
          console.error('Failed to fetch user state:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    // Set up real-time user data listener
    const handleUserDataUpdate = (data) => {
      console.log('👤 Profile: Real-time user data update:', data)
      
      if (data.marginSummary) {
        setUserState(prevState => ({
          ...prevState,
          marginSummary: data.marginSummary,
          withdrawable: data.withdrawable,
          assetPositions: data.assetPositions || prevState?.assetPositions
        }))
      }
    }

    fetchInitialUserState()
    websocketService.on('userDataUpdate', handleUserDataUpdate)

    return () => {
      websocketService.off('userDataUpdate', handleUserDataUpdate)
    }
  }, [user])

  const copyAddress = async () => {
    if (user?.wallet?.address) {
      try {
        await navigator.clipboard.writeText(user.wallet.address)
        setAddressCopied(true)
        setTimeout(() => setAddressCopied(false), 2000) // Reset after 2 seconds
      } catch (error) {
        console.error('Failed to copy address:', error)
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = user.wallet.address
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setAddressCopied(true)
        setTimeout(() => setAddressCopied(false), 2000)
      }
    }
  }

  const handleTransferToPerp = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setTransferError('Please enter a valid amount')
      return
    }

    if (parseFloat(transferAmount) > walletUSDCBalance) {
      setTransferError('Insufficient USDC balance')
      return
    }

    const wallet = wallets?.[0]
    if (!wallet) {
      setTransferError('No wallet connected')
      return
    }

    try {
      setIsTransferring(true)
      setTransferError('')

      const result = await walletService.transferUSDCToHyperliquid(wallet, parseFloat(transferAmount))
      
      if (result.success) {
        alert(`Successfully transferred ${transferAmount} USDC to Hyperliquid!\nTransaction hash: ${result.hash}`)
        setTransferAmount('')
        // Refresh balances
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setTransferError(result.error || 'Transfer failed')
      }
    } catch (error) {
      console.error('Transfer error:', error)
      setTransferError('Transfer failed: ' + error.message)
    } finally {
      setIsTransferring(false)
    }
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  const marginSummary = userState?.marginSummary || {}

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6 pb-8">
        {/* User Info */}
        <div className="bg-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Profile</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Wallet</span>
              <div className="flex items-center">
                <span className="text-white font-mono text-sm">
                  {user?.wallet?.address ? 
                    `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 
                    'Not connected'
                  }
                </span>
                {user?.wallet?.address && (
                  <CopyIcon onClick={copyAddress} copied={addressCopied} />
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Email</span>
              <span className="text-white">{user?.email?.address || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Wallet Balance (Arbitrum Sepolia) */}
        <div className="bg-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Arbitrum Sepolia Balance</h3>
          <div className="bg-gray-600 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-gray-300 text-sm">USDC Balance</div>
                <div className="text-white text-xl font-semibold">
                  ${walletUSDCBalance.toFixed(2)} USDC
                </div>
                {walletUSDCBalance === 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    Using mock USDC for testnet
                  </div>
                )}
              </div>
              <div className="text-blue-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Transfer to Perp Account */}
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Transfer to Hyperliquid</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount USDC"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isTransferring}
                />
                <button
                  onClick={handleTransferToPerp}
                  disabled={isTransferring || !transferAmount}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isTransferring ? 'Sending...' : 'Send'}
                </button>
              </div>
              {transferError && (
                <div className="text-red-400 text-sm mt-2">{transferError}</div>
              )}
              <div className="text-gray-400 text-xs mt-2">
                Min: $10 USDC • Max: ${walletUSDCBalance.toFixed(2)} USDC
              </div>
            </div>
          </div>
        </div>

        {/* Hyperliquid Account Summary */}
        <div className="bg-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            Hyperliquid Account
            {!perpAccountExists && (
              <span className="ml-2 text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
                Not Created
              </span>
            )}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-600 p-4 rounded-lg">
              <div className="text-gray-300 text-sm">Account Value</div>
              <div className="text-white text-xl font-semibold">
                ${parseFloat(marginSummary.accountValue || 0).toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-600 p-4 rounded-lg">
                <div className="text-gray-300 text-sm">Total Margin Used</div>
                <div className="text-white font-semibold">
                  ${parseFloat(marginSummary.totalMarginUsed || 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-600 p-4 rounded-lg">
                <div className="text-gray-300 text-sm">Available Balance</div>
                <div className="text-white font-semibold">
                  ${parseFloat(userState?.withdrawable || marginSummary?.accountValue || 0).toLocaleString()}
                </div>
                {parseFloat(userState?.withdrawable || 0) === 0 && parseFloat(marginSummary?.accountValue || 0) > 0 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    Funds in account but may be in positions
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {!perpAccountExists && (
            <div className="mt-4 p-3 bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg">
              <div className="text-yellow-200 text-sm">
                💡 Your Hyperliquid account will be created automatically when you make your first deposit.
              </div>
            </div>
          )}
          
          {parseFloat(marginSummary.accountValue || 0) > 0 && walletUSDCBalance === 0 && (
            <div className="mt-4 p-3 bg-blue-600 bg-opacity-20 border border-blue-600 rounded-lg">
              <div className="text-blue-200 text-sm">
                ℹ️ Your main balance (${parseFloat(marginSummary.accountValue || 0).toFixed(2)}) is in your Hyperliquid account, not your Arbitrum wallet. This is normal for testnet usage.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Profile