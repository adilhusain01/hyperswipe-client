import React, { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { motion } from 'framer-motion'
import TradingCard from './components/TradingCard'
import Profile from './components/Profile'
import Positions from './components/Positions'
import MarketList from './components/MarketList'

// Beautiful Romantic Navigation Icons
const TradingIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="tradingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c4b5fd" />
        <stop offset="50%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" stroke="url(#tradingGrad)" strokeWidth="2" fill="none"/>
    <path d="M7 14l3-3 3 3 4-4" stroke="url(#tradingGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 8l2 2v-2h-2z" stroke="url(#tradingGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="14" r="1.5" fill="#fda4af"/>
    <circle cx="10" cy="11" r="1.5" fill="#86efac"/>
    <circle cx="13" cy="14" r="1.5" fill="#7dd3fc"/>
    <circle cx="17" cy="10" r="1.5" fill="#fcd34d"/>
  </svg>
)

const PositionsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="positionsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#86efac" />
        <stop offset="50%" stopColor="#4ade80" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
    </defs>
    <rect x="3" y="5" width="18" height="14" rx="3" stroke="url(#positionsGrad)" strokeWidth="2" fill="none"/>
    <path d="M8 12l2.5 2.5L16 9" stroke="url(#positionsGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="8" r="1" fill="#fcd34d"/>
    <circle cx="12" cy="8" r="1" fill="#fda4af"/>
    <circle cx="17" cy="8" r="1" fill="#7dd3fc"/>
  </svg>
)

const MarketsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="marketsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="50%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="16" height="16" rx="3" stroke="url(#marketsGrad)" strokeWidth="2" fill="none"/>
    <rect x="7" y="8" width="3" height="1.5" rx="0.75" fill="url(#marketsGrad)"/>
    <rect x="14" y="8" width="3" height="1.5" rx="0.75" fill="url(#marketsGrad)"/>
    <rect x="7" y="11" width="3" height="1.5" rx="0.75" fill="url(#marketsGrad)"/>
    <rect x="14" y="11" width="3" height="1.5" rx="0.75" fill="url(#marketsGrad)"/>
    <rect x="7" y="14" width="3" height="1.5" rx="0.75" fill="url(#marketsGrad)"/>
    <rect x="14" y="14" width="3" height="1.5" rx="0.75" fill="url(#marketsGrad)"/>
    <circle cx="8" cy="6" r="0.8" fill="#fcd34d"/>
    <circle cx="16" cy="6" r="0.8" fill="#fda4af"/>
  </svg>
)

const ProfileIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fda4af" />
        <stop offset="50%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" stroke="url(#profileGrad)" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="9" r="3" stroke="url(#profileGrad)" strokeWidth="2" fill="none"/>
    <path d="M6 19c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke="url(#profileGrad)" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="10" cy="8.5" r="0.5" fill="#fcd34d"/>
    <circle cx="14" cy="8.5" r="0.5" fill="#fcd34d"/>
    <path d="M10.5 10.5c0.5 0.3 1 0.3 1.5 0" stroke="url(#profileGrad)" strokeWidth="1" strokeLinecap="round"/>
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="logoutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="50%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
    </defs>
    <rect x="3" y="5" width="11" height="14" rx="2" stroke="url(#logoutGrad)" strokeWidth="2" fill="none"/>
    <path d="M15 12h6m-3-2l3 2-3 2" stroke="url(#logoutGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="8" r="0.8" fill="#fcd34d"/>
    <circle cx="10" cy="8" r="0.8" fill="#86efac"/>
    <rect x="6" y="11" width="5" height="1" rx="0.5" fill="url(#logoutGrad)"/>
    <rect x="6" y="13" width="3" height="1" rx="0.5" fill="url(#logoutGrad)"/>
  </svg>
)

const App = () => {
  const { ready, authenticated, login, logout, user } = usePrivy()
  const [currentView, setCurrentView] = useState('trading') // 'trading', 'positions', 'markets', or 'profile'
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0)
  const [totalAssets, setTotalAssets] = useState(0)

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 100%)'}}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Initializing HyperSwipe...</p>
        </motion.div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4" style={{background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 100%)'}}>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-8 rounded-3xl max-w-sm w-full"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              HyperSwipe
            </h1>
            <div className="w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4"></div>
          </motion.div>
          
          <p className="text-slate-300 text-center mb-8 leading-relaxed">
            Swipe your way to trading perpetuals on
            <span className="text-purple-300 font-medium"> Hyperliquid Testnet</span>
          </p>
          
          <motion.button
            onClick={login}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full gradient-button-primary text-white font-medium py-3 px-6 rounded-xl text-base"
          >
            Connect Wallet
          </motion.button>
          
          <p className="text-xs text-slate-400 text-center mt-4">
            Connect your wallet to start trading
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 100%)'}}>
      <div className="w-full max-w-sm mx-4">
        {/* Mobile-style container */}
        <motion.div 
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl overflow-hidden h-[750px] relative"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-3" style={{
            background: 'linear-gradient(135deg, rgba(30, 30, 58, 0.9) 0%, rgba(20, 20, 32, 0.95) 100%)',
            borderBottom: '1px solid rgba(196, 181, 253, 0.1)'
          }}>
            {/* Navigation */}
            <div className="flex space-x-1.5">
              <motion.button
                onClick={() => setCurrentView('trading')}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  currentView === 'trading' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                }`}
                title="Trading"
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  variants={{
                    hover: { rotate: 15, scale: 1.1 }
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <TradingIcon />
                </motion.div>
              </motion.button>

              <motion.button
                onClick={() => setCurrentView('markets')}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  currentView === 'markets' 
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/25' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                }`}
                title="Markets"
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  variants={{
                    hover: { rotate: 15, scale: 1.1 }
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <MarketsIcon />
                </motion.div>
              </motion.button>
              <motion.button
                onClick={() => setCurrentView('positions')}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  currentView === 'positions' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                }`}
                title="Positions"
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  variants={{
                    hover: { rotate: 15, scale: 1.1 }
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <PositionsIcon />
                </motion.div>
              </motion.button>
              <motion.button
                onClick={() => setCurrentView('profile')}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  currentView === 'profile' 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                }`}
                title="Profile"
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  variants={{
                    hover: { rotate: 15, scale: 1.1 }
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileIcon />
                </motion.div>
              </motion.button>
            </div>
            
            {/* <h1 className="text-lg font-bold text-white">HyperSwipe</h1> */}
            
            <motion.button
              onClick={logout}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-red-500/20 transition-all duration-300 backdrop-blur-sm"
              title="Logout"
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                variants={{
                  hover: { rotate: 15, scale: 1.1 }
                }}
                transition={{ duration: 0.2 }}
              >
                <LogoutIcon />
              </motion.div>
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex-1 h-[685px]" style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.8) 0%, rgba(20, 20, 32, 0.9) 100%)'
          }}>
            {currentView === 'trading' ? (
              <TradingCard 
                currentAssetIndex={currentAssetIndex}
                onSwipeLeft={() => {
                  // Swipe left = previous asset (circular)
                  if (totalAssets > 0) {
                    setCurrentAssetIndex(prev => 
                      prev === 0 ? totalAssets - 1 : prev - 1
                    )
                  }
                }}
                onSwipeRight={() => {
                  // Swipe right = next asset (circular)
                  if (totalAssets > 0) {
                    setCurrentAssetIndex(prev => 
                      (prev + 1) % totalAssets
                    )
                  }
                }}
                onAssetCountChange={setTotalAssets}
                user={user}
              />
            ) : currentView === 'positions' ? (
              <Positions user={user} />
            ) : currentView === 'markets' ? (
              <MarketList 
                user={user} 
                onSelectAsset={(assetIndex) => {
                  setCurrentAssetIndex(assetIndex)
                  setCurrentView('trading')
                }}
              />
            ) : (
              <Profile user={user} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default App