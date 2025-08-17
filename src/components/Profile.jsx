import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallets } from '@privy-io/react-auth'
import { hyperliquidAPI } from '../services/hyperliquid'
import { walletService, hyperliquidAccountService } from '../services/wallet'
import websocketService from '../services/websocket'
import telegramService from '../services/telegramService'
import { ProfileSkeleton } from './LoadingSkeleton'

// Import Glass Icons
import userIcon from '../glass_icons/user.svg'
import walletContentIcon from '../glass_icons/wallet-content.svg'
import moneyBillIcon from '../glass_icons/money-bill.svg'
import bellIcon from '../glass_icons/bell.svg'
import connectIcon from '../glass_icons/connect.svg'
import clipboardCheckIcon from '../glass_icons/clipboard-check.svg'

const CopyIcon = ({ onClick, copied }) => (
  <motion.button
    onClick={onClick}
    className={`ml-3 p-2 rounded-lg transition-all duration-300 backdrop-blur-sm ${
      copied 
        ? 'bg-white/10 text-white border border-white/20' 
        : 'bg-black/20 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
    }`}
    title={copied ? "Copied!" : "Copy address"}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {copied ? (
      <motion.img 
        src={clipboardCheckIcon}
        alt="Copied"
        className="w-4 h-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500 }}
      />
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
  
  // Telegram states
  const [telegramStatus, setTelegramStatus] = useState({ linked: false, loading: true })
  const [showTelegramSetup, setShowTelegramSetup] = useState(false)
  const [telegramChatId, setTelegramChatId] = useState('')
  const [telegramLinking, setTelegramLinking] = useState(false)

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

  // Telegram Functions
  useEffect(() => {
    const checkTelegramStatus = async () => {
      if (user?.wallet?.address) {
        try {
          const status = await telegramService.checkTelegramStatus(user.wallet.address)
          setTelegramStatus({ ...status, loading: false })
        } catch (error) {
          console.error('Error checking Telegram status:', error)
          setTelegramStatus({ linked: false, loading: false, error: error.message })
        }
      }
    }
    checkTelegramStatus()
  }, [user?.wallet?.address])

  const handleLinkTelegram = async () => {
    if (!telegramChatId.trim()) {
      alert('Please enter your Telegram Chat ID')
      return
    }

    try {
      setTelegramLinking(true)
      await telegramService.linkTelegramAccount(
        user.wallet.address,
        telegramChatId.trim()
      )
      
      setTelegramStatus({ linked: true, loading: false })
      setShowTelegramSetup(false)
      setTelegramChatId('')
      alert('🎉 Telegram notifications linked successfully!')
    } catch (error) {
      console.error('Error linking Telegram:', error)
      alert('❌ Failed to link Telegram: ' + error.message)
    } finally {
      setTelegramLinking(false)
    }
  }

  const handleTestNotification = async () => {
    try {
      await telegramService.sendTestNotification(user.wallet.address, 'pnl_alert')
      alert('📱 Test notification sent! Check your Telegram.')
    } catch (error) {
      console.error('Error sending test notification:', error)
      alert('❌ Failed to send test notification: ' + error.message)
    }
  }

  const handleUnlinkTelegram = async () => {
    if (confirm('Are you sure you want to unlink Telegram notifications?')) {
      try {
        await telegramService.unlinkTelegramAccount(user.wallet.address)
        setTelegramStatus({ linked: false, loading: false })
        alert('Telegram notifications unlinked successfully')
      } catch (error) {
        console.error('Error unlinking Telegram:', error)
        alert('❌ Failed to unlink Telegram: ' + error.message)
      }
    }
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  const marginSummary = userState?.marginSummary || {}

  return (
    <div className="h-full overflow-y-auto bg-black/10" style={{fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
      <motion.div 
        className="p-4 space-y-6 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* User Info */}
        <motion.div 
          className="glass-card rounded-2xl p-8 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <img src={userIcon} alt="Profile" className="w-6 h-6" />
            <h2 className="text-xl font-medium bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              Profile
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-300 font-normal text-sm">Wallet Address</span>
              <div className="flex items-center">
                <span className="text-slate-200 font-mono text-sm bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
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
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-300 font-normal text-sm">Email</span>
              <span className="text-slate-200 text-sm font-normal">{user?.email?.address || 'Not provided'}</span>
            </div>
          </div>
        </motion.div>

        {/* Hyperliquid Account Summary */}
        <motion.div 
          className="glass-card rounded-2xl p-8 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={walletContentIcon} alt="Wallet" className="w-6 h-6" />
              <h3 className="text-lg font-medium bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                Hyperliquid Account
              </h3>
            </div>
            {!perpAccountExists && (
              <motion.span 
                className="text-xs bg-black/20 text-slate-300 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm"
                animate={{ pulse: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Not Created
              </motion.span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            <motion.div 
              className="relative overflow-hidden rounded-xl p-6 bg-white/5 border border-white/10 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-slate-300 text-sm font-normal mb-2">Total Account Value</div>
              <div className="text-white text-2xl font-medium">
                ${parseFloat(marginSummary.accountValue || 0).toLocaleString()}
              </div>
              <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="relative overflow-hidden rounded-xl p-4 bg-white/5 border border-white/10 backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-slate-300 text-sm font-normal mb-2">Margin Used</div>
                <div className="text-white font-medium text-lg">
                  ${parseFloat(marginSummary.totalMarginUsed || 0).toLocaleString()}
                </div>
              </motion.div>
              
              <motion.div 
                className="relative overflow-hidden rounded-xl p-4 bg-white/5 border border-white/10 backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-slate-300 text-sm font-normal mb-2">Available</div>
                <div className="text-white font-medium text-lg">
                  ${parseFloat(userState?.withdrawable || marginSummary?.accountValue || 0).toLocaleString()}
                </div>
                {parseFloat(userState?.withdrawable || 0) === 0 && parseFloat(marginSummary?.accountValue || 0) > 0 && (
                  <div className="text-xs text-slate-300 mt-2 px-2 py-1 bg-black/20 rounded-lg border border-white/10 font-normal">
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
              className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="text-slate-300 text-sm flex items-start gap-3 font-normal">
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
              className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="text-slate-300 text-sm flex items-start gap-3 font-normal">
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

        {/* Wallet Balance (Arbitrum Sepolia) */}
        <motion.div 
          className="glass-card rounded-2xl p-8 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <img src={moneyBillIcon} alt="Money" className="w-6 h-6" />
            <h3 className="text-lg font-medium bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              Arbitrum Sepolia Balance
            </h3>
          </div>
          
          <motion.div 
            className="relative overflow-hidden rounded-xl p-6 mb-6 bg-white/5 border border-white/10 backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-slate-300 text-sm font-normal mb-2">USDC Balance</div>
                <div className="text-white text-2xl font-medium">
                  ${walletUSDCBalance.toFixed(2)}
                </div>
                <div className="text-slate-200 text-sm opacity-80 font-normal">USDC</div>
                {walletUSDCBalance === 0 && (
                  <div className="text-xs text-slate-300 mt-2 px-2 py-1 bg-black/20 rounded-lg inline-block border border-white/10 font-normal">
                    Using mock USDC for testnet
                  </div>
                )}
              </div>
              <motion.div 
                className="text-slate-400"
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
              <label className="text-slate-300 text-sm font-normal mb-3 block">Transfer to Hyperliquid</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Amount USDC"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="flex-1 bg-black/20 text-white px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300 placeholder-slate-400 backdrop-blur-sm font-normal"
                  disabled={isTransferring}
                />
                <motion.button
                  onClick={handleTransferToPerp}
                  disabled={isTransferring || !transferAmount}
                  className="bg-black/20 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-6 py-3 rounded-xl text-sm font-normal disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm"
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
                  className="text-slate-300 text-sm mt-3 p-3 bg-black/20 border border-white/10 rounded-xl font-normal"
                >
                  {transferError}
                </motion.div>
              )}
              <div className="text-slate-400 text-xs mt-3 flex justify-between font-normal">
                <span>Min: $10 USDC</span>
                <span>Max: ${walletUSDCBalance.toFixed(2)} USDC</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Telegram Notifications */}
        <motion.div 
          className="glass-card rounded-2xl p-8 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={bellIcon} alt="Notifications" className="w-6 h-6" />
              <h3 className="text-lg font-medium bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                Telegram
              </h3>
            </div>
            {telegramStatus.linked && (
              <div className="text-xs bg-white/10 text-white px-2 py-1 rounded-lg border border-white/20 backdrop-blur-sm font-normal">
                ✓ Connected
              </div>
            )}
          </div>
          
          {telegramStatus.loading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              <div className="text-slate-400 text-sm mt-2 font-normal">Checking status...</div>
            </div>
          ) : telegramStatus.linked ? (
            // Linked State
            <div className="space-y-4">
              <motion.div 
                className="p-4 rounded-xl bg-white/5 border border-white/10"
                whileHover={{ scale: 1.01 }}
              >
                <div className="text-slate-200 text-sm font-normal mb-2">🎉 Connected</div>
                <div className="text-slate-400 text-xs font-normal">
                  • Order fills & executions • Daily portfolio summaries
                </div>
              </motion.div>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={handleTestNotification}
                  className="flex-1 bg-black/20 hover:bg-white/10 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-normal border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Test
                </motion.button>
                <motion.button
                  onClick={handleUnlinkTelegram}
                  className="bg-black/20 hover:bg-white/10 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-normal border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Unlink
                </motion.button>
              </div>
            </div>
          ) : (
            // Not Linked State
            <div className="space-y-4">
              <motion.div 
                className="p-4 rounded-xl bg-white/5 border border-white/10"
                whileHover={{ scale: 1.01 }}
              >
                <div className="text-slate-200 text-sm font-normal mb-2">Get Trading Alerts</div>
                <div className="text-slate-400 text-xs font-normal">
                  Real-time notifications for fills and portfolio updates
                </div>
              </motion.div>
              
              {!showTelegramSetup ? (
                <motion.button
                  onClick={() => setShowTelegramSetup(true)}
                  className="w-full bg-black/20 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white py-3 px-4 rounded-xl text-sm font-normal transition-all duration-300 backdrop-blur-sm"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Connect Telegram
                </motion.button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-slate-200 text-sm font-normal mb-2">Setup:</div>
                    <div className="space-y-1 text-xs text-slate-300 font-normal">
                      <div>1. Open bot → 2. Send /start → 3. Copy Chat ID → 4. Paste below</div>
                    </div>
                  </div>
                  
                  <motion.a
                    href={telegramService.generateBotLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-black/20 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-center py-2.5 px-4 rounded-xl text-sm font-normal transition-all duration-300 backdrop-blur-sm"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Open Bot
                  </motion.a>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Chat ID (e.g., 123456789)"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      className="w-full bg-black/20 text-white px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300 placeholder-slate-400 font-mono text-sm backdrop-blur-sm"
                      disabled={telegramLinking}
                    />
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => setShowTelegramSetup(false)}
                        className="flex-1 bg-black/20 hover:bg-white/10 text-slate-300 hover:text-white py-2.5 px-4 rounded-xl text-sm font-normal border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handleLinkTelegram}
                        disabled={telegramLinking || !telegramChatId.trim()}
                        className="flex-1 bg-black/20 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white py-2.5 px-4 rounded-xl text-sm font-normal disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm"
                        whileHover={!telegramLinking && telegramChatId.trim() ? { scale: 1.02, y: -1 } : {}}
                        whileTap={{ scale: 0.98 }}
                      >
                        {telegramLinking ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Linking...</span>
                          </div>
                        ) : (
                          'Link'
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

      </motion.div>
    </div>
  )
}

export default Profile