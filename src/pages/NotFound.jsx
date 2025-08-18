import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
// Logo hosted on Cloudinary CDN for better performance
const hyperswipeLogo = 'https://res.cloudinary.com/djxuqljgr/image/upload/v1755535763/hyperswipe-no-bg_ztqnzb.png'
// Glass Icons with Cloudinary CDN
const HomeIcon = () => (
  <img src="https://res.cloudinary.com/djxuqljgr/image/upload/v1755531371/connect_afpip6.svg" alt="Home" className="w-4 h-4" />
)

const AppIcon = () => (
  <img src="https://res.cloudinary.com/djxuqljgr/image/upload/v1755531607/square-chart-line_ohqzni.svg" alt="App" className="w-4 h-4" />
)

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen font-sans" style={{background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 100%)', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black/30 to-slate-800 animate-pulse" style={{ animationDuration: '6s' }} />
      
      <div className="flex flex-col items-center justify-center min-h-screen px-4 relative z-20">
        <motion.div 
          initial={{ y: 20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-md w-full"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center justify-center mb-8"
          >
            <img src={hyperswipeLogo} alt="HyperSwipe" className="h-16" />
          </motion.div>

          {/* 404 Number */}
          <motion.h1
            className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent mb-4 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            404
          </motion.h1>
          
          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="glass-card p-6 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl mb-8"
          >
            <h2 className="text-2xl font-medium text-white mb-3">
              Page Not Found
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              The page you're looking for seems to have disappeared into the void. 
              Maybe it got liquidated?
              Consider a stop loss next time!
            </p>
            
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2"
              >
                <HomeIcon />
                Back to Home
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/app')}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2"
              >
                <AppIcon />
                Launch App
              </motion.button>
            </div>
          </motion.div>

         
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound