import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
// Logo hosted on Cloudinary CDN for better performance
const hyperswipeLogo = 'https://res.cloudinary.com/djxuqljgr/image/upload/v1755535763/hyperswipe-no-bg_ztqnzb.png'

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden" style={{background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 100%)'}}>
      {/* Animated gradient background as fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-800 animate-pulse" style={{ animationDuration: '4s' }} />
      
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-10"
        onError={(e) => {
          console.log('Video failed to load')
          e.target.style.display = 'none'
        }}
        onLoadStart={() => console.log('Video loading started')}
        onCanPlay={() => console.log('Video can play')}
      >
        
        <source src="https://res.cloudinary.com/djxuqljgr/video/upload/v1755528983/background-video1_mjfjh9.mp4" type="video/mp4" />
        <source src="https://res.cloudinary.com/djxuqljgr/video/upload/v1755528983/background-video2_etal0s.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-20" />

      {/* Navigation Header */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-4 left-4 right-4 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <img src={hyperswipeLogo} alt="HyperSwipe" className="h-8 w-auto" />
              <span className="text-white font-medium text-lg tracking-tight">
                HyperSwipe
              </span>
            </motion.div>

            {/* Launch App Button */}
            <button
              onClick={() => {
                console.log('Launch App button clicked, navigating to /app')
                navigate('/app')
              }}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-medium rounded-full transition-all duration-300 backdrop-blur-sm cursor-pointer relative z-10"
            >
              Launch App
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-40 min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="text-center"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="py-2 text-6xl md:text-8xl font-bold bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-800 bg-clip-text text-transparent tracking-tight"
            initial={{ opacity: 0, y: 30, z: -50 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              z: 0,
              rotateX: [0, -5, 0],
              scale: [0.95, 1.02, 1]
            }}
            transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
            whileHover={{ 
              y: -5,
              rotateX: -2,
              transition: { duration: 0.3 }
            }}
            style={{
              transformStyle: 'preserve-3d',
              textShadow: `
                0 1px 0 rgba(0,0,0,0.1),
                0 2px 0 rgba(0,0,0,0.1),
                0 3px 0 rgba(0,0,0,0.1),
                0 4px 0 rgba(0,0,0,0.1),
                0 5px 0 rgba(0,0,0,0.1),
                0 6px 1px rgba(0,0,0,0.1),
                0 0 5px rgba(0,0,0,0.1),
                0 1px 3px rgba(0,0,0,0.3),
                0 3px 5px rgba(0,0,0,0.2),
                0 5px 10px rgba(0,0,0,0.25),
                0 10px 10px rgba(0,0,0,0.2),
                0 20px 20px rgba(0,0,0,0.15)
              `
            }}
          >
            HyperSwipe
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-teal-700 font-light tracking-wide"
            initial={{ opacity: 0, y: 20, z: -30 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              z: 0,
              scale: [0.9, 1.05, 1]
            }}
            transition={{ delay: 1.3, duration: 0.8, ease: "easeOut" }}
            whileHover={{ 
              y: -3,
              transition: { duration: 0.3 }
            }}
            style={{
              transformStyle: 'preserve-3d',
              textShadow: `
                0 1px 0 rgba(0,0,0,0.1),
                0 2px 0 rgba(0,0,0,0.1),
                0 3px 0 rgba(0,0,0,0.1),
                0 4px 0 rgba(0,0,0,0.1),
                0 5px 1px rgba(0,0,0,0.1),
                0 0 5px rgba(0,0,0,0.1),
                0 1px 3px rgba(0,0,0,0.3),
                0 3px 5px rgba(0,0,0,0.2),
                0 5px 10px rgba(0,0,0,0.25)
              `
            }}
          >
            Tinder of your trades
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default Landing