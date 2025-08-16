import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallets } from '@privy-io/react-auth'
import { hyperliquidAPI } from '../services/hyperliquid'
import { walletService, hyperliquidAccountService } from '../services/wallet'
import websocketService from '../services/websocket'
import { ProfileSkeleton } from './LoadingSkeleton'

const CopyIcon = ({ onClick, copied }) => (
  <motion.button
    onClick={onClick}
    className={`ml-3 p-2 rounded-lg transition-all duration-300 ${
      copied 
        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 hover:scale-105'
    }`}
    title={copied ? "Copied!" : "Copy address"}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {copied ? (
      <motion.svg 
        className="w-4 h-4" 
        fill="currentColor" 
        viewBox="0 0 24 24"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500 }}
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </motion.svg>
    ) : (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
    )}
  </motion.button>
)

const Profile = ({ user }) => {
  const { wallets } = useWallets()
  const [userState, setUserState] = useState(null)
  const [, setSpotState] = useState(null)
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
          
          // Clear any cached data from previous user
          setUserState(null)
          setSpotState(null)
          setWalletUSDCBalance(0)
          setPerpAccountExists(false)
          
          const [perpState, spotBalances, walletUSDC, perpAccount] = await Promise.all([
            hyperliquidAPI.getUserState(user.wallet.address),
            hyperliquidAPI.getSpotBalances(user.wallet.address),
            walletService.getUSDCBalance(user.wallet.address),
            hyperliquidAccountService.checkPerpAccount(user.wallet.address)
          ])
          
          // console.log('📊 Profile: Initial data loaded')
          
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
      } else {
        // No user - clear all data
        setUserState(null)
        setSpotState(null)
        setWalletUSDCBalance(0)
        setPerpAccountExists(false)
        setLoading(false)
      }
    }

    // Set up real-time user data listener
    const handleUserDataUpdate = (data) => {
      // console.log('👤 Profile: Real-time user data update:', data)
      
      // Handle nested clearinghouseState structure from WebSocket
      let userData = data
      if (data.clearinghouseState) {
        userData = data.clearinghouseState
      }
      
      if (userData.marginSummary) {
        setUserState(prevState => ({
          ...prevState,
          marginSummary: userData.marginSummary,
          withdrawable: userData.withdrawable,
          assetPositions: userData.assetPositions || prevState?.assetPositions
        }))
      }
    }

    fetchInitialUserState()
    websocketService.on('userDataUpdate', handleUserDataUpdate)

    // Clear previous user's data when user changes
    return () => {
      websocketService.off('userDataUpdate', handleUserDataUpdate)
    }
  }, [user?.wallet?.address]) // Depend on actual address to detect user changes

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
    <div className="h-full overflow-y-auto" style={{
      background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.6) 0%, rgba(20, 20, 32, 0.8) 100%)'
    }}>
      <motion.div 
        className="p-4 space-y-6 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* User Info */}
        <motion.div 
          className="glass-card rounded-3xl p-6"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-3 h-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
              }}
            ></div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Profile
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(196, 181, 253, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              border: '1px solid rgba(196, 181, 253, 0.1)'
            }}>
              <span className="text-slate-300 font-medium text-sm">Wallet Address</span>
              <div className="flex items-center">
                <span className="text-purple-200 font-mono text-sm bg-purple-500/10 px-3 py-1 rounded-lg">
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
            <div className="flex justify-between items-center p-3 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(253, 164, 175, 0.05) 0%, rgba(244, 63, 94, 0.05) 100%)',
              border: '1px solid rgba(253, 164, 175, 0.1)'
            }}>
              <span className="text-slate-300 font-medium text-sm">Email</span>
              <span className="text-rose-200 text-sm">{user?.email?.address || 'Not provided'}</span>
            </div>
          </div>
        </motion.div>

        {/* Wallet Balance (Arbitrum Sepolia) */}
        <motion.div 
          className="glass-card rounded-3xl p-6"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-3 h-3 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #7dd3fc 0%, #0ea5e9 100%)'
              }}
            ></div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-sky-200 to-blue-300 bg-clip-text text-transparent">
              Arbitrum Sepolia Balance
            </h3>
          </div>
          
          <motion.div 
            className="relative overflow-hidden rounded-2xl p-6 mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(125, 211, 252, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
              border: '1px solid rgba(125, 211, 252, 0.2)'
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sky-300 text-sm font-medium mb-2">USDC Balance</div>
                <div className="text-white text-2xl font-bold">
                  ${walletUSDCBalance.toFixed(2)}
                </div>
                <div className="text-sky-200 text-sm opacity-80">USDC</div>
                {walletUSDCBalance === 0 && (
                  <div className="text-xs text-sky-400 mt-2 px-2 py-1 bg-sky-500/10 rounded-lg inline-block">
                    Using mock USDC for testnet
                  </div>
                )}
              </div>
              <motion.div 
                className="text-sky-400"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Transfer to Perp Account */}
          <div className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-3 block">Transfer to Hyperliquid</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Amount USDC"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="flex-1 bg-gradient-to-r from-slate-800/50 to-slate-700/50 text-white px-4 py-3 rounded-xl border border-slate-600/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 placeholder-slate-400"
                  disabled={isTransferring}
                />
                <motion.button
                  onClick={handleTransferToPerp}
                  disabled={isTransferring || !transferAmount}
                  className="gradient-button-primary text-white px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isTransferring && transferAmount ? { scale: 1.02, y: -1 } : {}}
                  whileTap={{ scale: 0.98 }}
                >
                  {isTransferring ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send'
                  )}
                </motion.button>
              </div>
              {transferError && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-300 text-sm mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  {transferError}
                </motion.div>
              )}
              <div className="text-slate-400 text-xs mt-3 flex justify-between">
                <span>Min: $10 USDC</span>
                <span>Max: ${walletUSDCBalance.toFixed(2)} USDC</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hyperliquid Account Summary */}
        <motion.div 
          className="glass-card rounded-3xl p-6"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #86efac 0%, #22c55e 100%)'
                }}
              ></div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-200 to-green-300 bg-clip-text text-transparent">
                Hyperliquid Account
              </h3>
            </div>
            {!perpAccountExists && (
              <motion.span 
                className="text-xs bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30"
                animate={{ pulse: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Not Created
              </motion.span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            <motion.div 
              className="relative overflow-hidden rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
                border: '1px solid rgba(134, 239, 172, 0.2)'
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-emerald-300 text-sm font-medium mb-2">Total Account Value</div>
              <div className="text-white text-2xl font-bold">
                ${parseFloat(marginSummary.accountValue || 0).toLocaleString()}
              </div>
              <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="relative overflow-hidden rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(253, 164, 175, 0.1) 0%, rgba(244, 63, 94, 0.1) 100%)',
                  border: '1px solid rgba(253, 164, 175, 0.2)'
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-rose-300 text-sm font-medium mb-2">Margin Used</div>
                <div className="text-white font-bold text-lg">
                  ${parseFloat(marginSummary.totalMarginUsed || 0).toLocaleString()}
                </div>
              </motion.div>
              
              <motion.div 
                className="relative overflow-hidden rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(196, 181, 253, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  border: '1px solid rgba(196, 181, 253, 0.2)'
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-purple-300 text-sm font-medium mb-2">Available</div>
                <div className="text-white font-bold text-lg">
                  ${parseFloat(userState?.withdrawable || marginSummary?.accountValue || 0).toLocaleString()}
                </div>
                {parseFloat(userState?.withdrawable || 0) === 0 && parseFloat(marginSummary?.accountValue || 0) > 0 && (
                  <div className="text-xs text-amber-300 mt-2 px-2 py-1 bg-amber-500/10 rounded-lg">
                    May be in positions
                  </div>
                )}
              </motion.div>
            </div>
          </div>
          
          {!perpAccountExists && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                border: '1px solid rgba(252, 211, 77, 0.2)'
              }}
            >
              <div className="text-amber-200 text-sm flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div>
                  <div className="font-medium mb-1">Account Creation</div>
                  <div className="opacity-90">
                    Your Hyperliquid account will be created automatically when you make your first deposit.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {parseFloat(marginSummary.accountValue || 0) > 0 && walletUSDCBalance === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(125, 211, 252, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
                border: '1px solid rgba(125, 211, 252, 0.2)'
              }}
            >
              <div className="text-sky-200 text-sm flex items-start gap-3">
                <span className="text-lg">ℹ️</span>
                <div>
                  <div className="font-medium mb-1">Balance Location</div>
                  <div className="opacity-90">
                    Your main balance (${parseFloat(marginSummary.accountValue || 0).toFixed(2)}) is in your Hyperliquid account, not your Arbitrum wallet. This is normal for testnet usage.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

      </motion.div>
    </div>
  )
}

export default Profile