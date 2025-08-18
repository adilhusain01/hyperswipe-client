import React, { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import TradingCard from './components/TradingCard'
import Profile from './components/Profile'
import Positions from './components/Positions'
import MarketList from './components/MarketList'
import CryptoTrailBackground from './components/CryptoTrailBackground'
import websocketService from './services/websocket'
import hyperswipeLogo from './assets/logos/hyperswipe-no-bg.png'

// Import Glass Icons
import squareChartLineIcon from './glass_icons/square-chart-line.svg'
import layersIcon from './glass_icons/layers.svg'
import clipboardCheckIcon from './glass_icons/clipboard-check.svg'
import userIcon from './glass_icons/user.svg'
import connectIcon from './glass_icons/connect.svg'
import bookOpenIcon from './glass_icons/book-open.svg'

// Glass Navigation Icons
const TradingIcon = () => (
  <img src={squareChartLineIcon} alt="Trading" className="w-5 h-5" />
)

const PositionsIcon = () => (
  <img src={clipboardCheckIcon} alt="Positions" className="w-5 h-5" />
)

const MarketsIcon = () => (
  <img src={layersIcon} alt="Markets" className="w-5 h-5" />
)

const ProfileIcon = () => (
  <img src={userIcon} alt="Profile" className="w-5 h-5" />
)

const LogoutIcon = () => (
  <img src={connectIcon} alt="Logout" className="w-5 h-5" />
)

// Documentation Component
const DocumentationIcon = () => (
  <img src={bookOpenIcon} alt="Documentation" className="w-4 h-4" />
)

const Documentation = () => {
  const navigate = useNavigate()

  return (
    <motion.button
      onClick={() => navigate('/docs')}
      className="w-8 h-8 bg-black/20 border border-white/10 rounded-lg flex items-center justify-center hover:border-white/20 hover:bg-white/10 transition-all duration-300 group backdrop-blur-sm"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Documentation"
    >
      <DocumentationIcon />
    </motion.button>
  )
}

const App = () => {
  const { ready, authenticated, login, logout, user } = usePrivy()
  const navigate = useNavigate()
  const location = useLocation()
  const [currentView, setCurrentView] = useState('trading') // 'trading', 'positions', 'markets', or 'profile'
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0)
  const [totalAssets, setTotalAssets] = useState(0)

  const validViews = ['trading', 'markets', 'positions', 'profile']

  // Handle query parameter navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const viewParam = searchParams.get('view')
    
    if (viewParam && validViews.includes(viewParam)) {
      setCurrentView(viewParam)
    } else if (viewParam) {
      // Invalid view parameter, redirect to trading
      navigate('/?view=trading', { replace: true })
    }
  }, [location.search, navigate])

  // Handle view changes and update URL
  const handleViewChange = (view) => {
    setCurrentView(view)
    navigate(`/?view=${view}`, { replace: true })
  }

  if (!ready) {
    return (
      <div className="min-h-screen font-sans" style={{background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 100%)', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
        <CryptoTrailBackground />
        <div className="flex items-center justify-center min-h-screen relative z-20">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-white/20 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 font-medium">Initializing HyperSwipe...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen font-sans" style={{background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 100%)', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
        <CryptoTrailBackground />
        <div className="flex flex-col items-center justify-center min-h-screen px-4 relative z-20">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card p-8 rounded-2xl max-w-sm w-full bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center mb-4">
                <img src={hyperswipeLogo} alt="HyperSwipe" className="h-12" />
              </div>
              <h1 className="text-2xl font-medium bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent mb-3">
                HyperSwipe
              </h1>
              <div className="w-12 h-0.5 bg-white/20 rounded-full mx-auto mb-4"></div>
            </motion.div>
            
            <p className="text-slate-300 text-center mb-8 leading-relaxed font-normal">
              Swipe your way to trading perpetuals on
              <span className="text-slate-100 font-medium"> Hyperliquid Testnet</span>
            </p>
            
            <motion.button
              onClick={login}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-black/20 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium py-3 px-6 rounded-xl text-base transition-all duration-300 backdrop-blur-sm"
            >
              Connect Wallet
            </motion.button>
            
            <p className="text-xs text-slate-400 text-center mt-4 font-normal">
              Connect your wallet to start trading
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-sans" style={{background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 100%)', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
      {/* Crypto Trail Background */}
      <CryptoTrailBackground />
      
      <div className="min-h-screen flex items-center justify-center relative z-20">
        <div className="w-full max-w-sm mx-4">
          {/* Mobile-style container */}
          <motion.div 
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl overflow-hidden h-[750px] relative bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-3 bg-black/20 backdrop-blur-xl border-b border-white/10">
            {/* Navigation */}
            <div className="flex space-x-1.5">
              <motion.button
                onClick={() => handleViewChange('trading')}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  currentView === 'trading' 
                    ? 'bg-white/10 text-white border border-white/20 shadow-lg backdrop-blur-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5 backdrop-blur-sm'
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
                onClick={() => handleViewChange('markets')}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  currentView === 'markets' 
                    ? 'bg-white/10 text-white border border-white/20 shadow-lg backdrop-blur-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5 backdrop-blur-sm'
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
                onClick={() => handleViewChange('positions')}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  currentView === 'positions' 
                    ? 'bg-white/10 text-white border border-white/20 shadow-lg backdrop-blur-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5 backdrop-blur-sm'
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
                onClick={() => handleViewChange('profile')}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  currentView === 'profile' 
                    ? 'bg-white/10 text-white border border-white/20 shadow-lg backdrop-blur-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5 backdrop-blur-sm'
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
                onClick={() => {
                  // Clear WebSocket user data before logout
                  websocketService.clearClientUserData()
                  
                  // Clear any stored user data
                  localStorage.removeItem('hyperswipe_user_cache')
                  sessionStorage.clear()
                  
                  logout()
                }}
                className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
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
            <div className="flex-1 h-[685px] bg-black/10">
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
                  handleViewChange('trading')
                }}
              />
            ) : (
              <Profile user={user} />
            )}
            </div>
          </motion.div>

          {/* Creators Section - Outside main container */}
          <motion.div 
            className="flex items-center justify-center py-4 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
          <span className="text-slate-400 text-xs font-medium">Built by</span>
          <div className="flex items-center gap-2">
            <motion.a
              href="https://x.com/0xAdilHusain"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              initial={{ opacity: 0, scale: 0, rotate: 0, y: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { delay: 1.2, duration: 0.3, type: "spring" }
              }}
              whileHover={{ 
                scale: 1.15, 
                rotate: 15, 
                y: -2,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 group-hover:border-white/30 group-hover:shadow-lg group-hover:shadow-white/10 transition-all duration-300 backdrop-blur-sm">
                <img
                  src="https://x.com/0xAdilHusain"
                  alt="Adil's Twitter"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://pbs.twimg.com/profile_images/1947715281520103424/riYRziYF_400x400.jpg"
                  }}
                />
              </div>
              <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-black/20 backdrop-blur-xl border border-white/10 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                @0xAdilHusain
              </div>
            </motion.a>
            
            <motion.a
              href="https://x.com/0xrizzmo"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              initial={{ opacity: 0, scale: 0, rotate: 0, y: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { delay: 1.3, duration: 0.3, type: "spring" }
              }}
              whileHover={{ 
                scale: 1.15, 
                rotate: 15, 
                y: -2,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 group-hover:border-white/30 group-hover:shadow-lg group-hover:shadow-white/10 transition-all duration-300 backdrop-blur-sm">
                <img
                  src="https://x.com/0xrizzmo"
                  alt="Friend's Twitter"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://pbs.twimg.com/profile_images/1934881304996446208/eyNP67zO_400x400.jpg"
                  }}
                />
              </div>
              <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-black/20 backdrop-blur-xl border border-white/10 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                @0xrizzmo
              </div>
            </motion.a>
          </div>
          
          {/* Documentation Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.3, type: "spring" }}
          >
            <Documentation />
          </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}


export default App
