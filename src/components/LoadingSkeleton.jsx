import React from 'react'
import { motion } from 'framer-motion'

// Generic skeleton component with glass theme
export const Skeleton = ({ className = '', width = '100%', height = '20px' }) => (
  <motion.div 
    className={`rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 ${className}`}
    style={{ 
      width, 
      height
    }}
    animate={{ opacity: [0.4, 0.8, 0.4] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  />
)

// Trading card skeleton with glass theme
export const TradingCardSkeleton = () => (
  <div className="h-full flex flex-col p-4" style={{fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
    <motion.div 
      className="flex-1 glass-card rounded-3xl p-6 min-h-0 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chart skeleton */}
      <motion.div 
        className="h-60 mb-6 rounded-3xl bg-black/20 backdrop-blur-xl border border-white/10"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Asset info skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton width="120px" height="32px" />
          <motion.div
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <Skeleton width="80px" height="20px" />
          </motion.div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <Skeleton width="80px" height="16px" className="mb-3" />
            <Skeleton width="100px" height="24px" />
          </motion.div>
          <motion.div 
className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <Skeleton width="90px" height="16px" className="mb-3" />
            <Skeleton width="80px" height="24px" />
          </motion.div>
        </div>
        
        {/* Trading buttons skeleton */}
        <div className="flex gap-4">
          <motion.div 
            className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="flex-1 h-12 rounded-xl bg-red-600/20 border border-red-500/30 backdrop-blur-sm"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
        </div>
        
        {/* Sliders skeleton */}
        <div className="space-y-2">
          {/* Position Size Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Skeleton width="85px" height="14px" />
              <motion.div
                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                <Skeleton width="80px" height="14px" />
              </motion.div>
            </div>
            
            <div className="relative">
              <Skeleton width="100%" height="8px" className="rounded-full" />
            </div>
            
            <div className="flex justify-between text-xs">
              <Skeleton width="50px" height="12px" />
              <Skeleton width="90px" height="12px" />
            </div>
          </div>

          {/* Leverage Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Skeleton width="16px" height="16px" />
                <Skeleton width="60px" height="14px" />
              </div>
              <motion.div
                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: 0.3 }}
              >
                <Skeleton width="24px" height="14px" />
              </motion.div>
            </div>
            
            <div className="relative">
              <Skeleton width="100%" height="8px" className="rounded-full" />
            </div>
            
            <div className="flex justify-between text-xs">
              <Skeleton width="82px" height="12px" />
              <Skeleton width="75px" height="12px" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
)

// Profile skeleton with glass theme
export const ProfileSkeleton = () => (
  <div className="h-full overflow-y-auto bg-black/10" style={{fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
    <motion.div 
      className="p-4 space-y-6 pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* User Info skeleton */}
      <motion.div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <motion.div 
            className="w-3 h-3 rounded-full bg-white/40"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Skeleton width="80px" height="24px" />
        </div>
        <div className="space-y-4">
          <motion.div 
            className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <Skeleton width="80px" height="16px" />
            <Skeleton width="140px" height="20px" />
          </motion.div>
          <motion.div 
            className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <Skeleton width="60px" height="16px" />
            <Skeleton width="120px" height="16px" />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Wallet Balance skeleton */}
      <motion.div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <motion.div 
            className="w-3 h-3 rounded-full bg-white/40"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          <Skeleton width="180px" height="20px" />
        </div>
        
        <motion.div 
          className="p-6 rounded-2xl mb-6 bg-white/5 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <Skeleton width="80px" height="16px" className="mb-3" />
              <Skeleton width="120px" height="32px" className="mb-2" />
              <Skeleton width="60px" height="16px" />
            </div>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Skeleton width="32px" height="32px" className="rounded-full" />
            </motion.div>
          </div>
        </motion.div>
        
        <div className="space-y-4">
          <div>
            <Skeleton width="140px" height="16px" className="mb-3" />
            <div className="flex gap-3">
              <Skeleton width="100%" height="48px" className="rounded-xl" />
              <Skeleton width="80px" height="48px" className="rounded-xl" />
            </div>
            <div className="flex justify-between mt-3">
              <Skeleton width="80px" height="12px" />
              <Skeleton width="100px" height="12px" />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Account Summary skeleton */}
      <motion.div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <motion.div 
            className="w-3 h-3 rounded-full bg-white/40"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
          <Skeleton width="140px" height="20px" />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <motion.div 
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <Skeleton width="120px" height="16px" className="mb-3" />
            <Skeleton width="100px" height="32px" />
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <Skeleton width="80px" height="16px" className="mb-3" />
              <Skeleton width="70px" height="24px" />
            </motion.div>
            
            <motion.div 
              className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <Skeleton width="70px" height="16px" className="mb-3" />
              <Skeleton width="80px" height="24px" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </div>
)

// Positions skeleton with glass theme
export const PositionsSkeleton = () => (
  <div className="h-full overflow-y-auto bg-black/10" style={{fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
    <motion.div 
      className="p-4 space-y-6 pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header skeleton */}
      <motion.div className="glass-card rounded-3xl p-6 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <motion.div 
            className="w-3 h-3 rounded-full bg-white/40"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Skeleton width="120px" height="24px" />
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-sm">
          {['Portfolio Value', 'Total PnL', 'Positions'].map((label, i) => (
            <motion.div 
              key={i} 
              className="text-center p-3 rounded-xl min-h-[80px] flex flex-col justify-center bg-white/5 border border-white/10 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
            >
              <Skeleton width={label === 'Portfolio Value' ? '90px' : label === 'Total PnL' ? '65px' : '58px'} height="12px" className="mx-auto mb-1" />
              <Skeleton width={label === 'Portfolio Value' ? '70px' : label === 'Total PnL' ? '55px' : '12px'} height="14px" className="mx-auto" />
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Position cards skeleton */}
      {[1, 2, 3].map((i) => (
        <motion.div 
          key={i} 
          className="glass-card rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div>
                <Skeleton width="70px" height="24px" className="mb-2" />
                <Skeleton width="100px" height="16px" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton width="80px" height="24px" className="mb-2" />
              <Skeleton width="60px" height="16px" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((j) => (
              <motion.div 
                key={j} 
                className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <Skeleton width="70px" height="12px" className="mb-2" />
                <Skeleton width="60px" height="20px" />
              </motion.div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <motion.div 
              className="flex-1 h-10 rounded-xl bg-green-600/20 border border-green-500/30 backdrop-blur-sm"
            />
            <motion.div 
              className="flex-1 h-10 rounded-xl bg-red-600/20 border border-red-500/30 backdrop-blur-sm"
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  </div>
)

// MarketList skeleton with glass theme
export const MarketListSkeleton = () => (
  <div className="h-full overflow-y-auto bg-black/10" style={{fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
    <motion.div 
      className="p-4 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header skeleton */}
      <motion.div className="glass-card rounded-3xl p-6 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <motion.div 
            className="w-3 h-3 rounded-full bg-white/40"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Skeleton width="80px" height="24px" />
        </div>
        
        {/* Search bar skeleton */}
        <div className="relative mb-4">
          <Skeleton width="100%" height="40px" className="rounded-xl" />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Skeleton width="16px" height="16px" />
          </div>
        </div>
        
        {/* Sort options skeleton */}
        <div className="flex gap-1 overflow-x-auto py-2 px-1">
          {['Name', 'Price', '24h', 'Volume'].map((label, i) => (
            <motion.div
              key={i}
              className={`px-3 py-1.5 rounded-lg backdrop-blur-sm ${
                i === 0 
                  ? 'bg-white/10 border border-white/20' 
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <Skeleton width={label === 'Name' ? '44px' : label === 'Price' ? '40px' : label === '24h' ? '28px' : '56px'} height="16px" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Market list items skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div 
            key={i} 
            className="glass-card rounded-2xl p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between">
              {/* Token info skeleton */}
              <div className="flex items-center space-x-4">
                <div>
                  <Skeleton width="60px" height="20px" className="mb-2" />
                  <Skeleton width="120px" height="14px" />
                </div>
              </div>
              
              {/* Price info skeleton */}
              <div className="text-right">
                <Skeleton width="80px" height="20px" className="mb-1" />
                <motion.div
                  className="inline-block px-2 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <Skeleton width="40px" height="14px" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
)

// Chart skeleton with glass theme
export const ChartSkeleton = () => (
  <div className="relative w-full h-full">
    <motion.div 
      className="absolute inset-0 rounded-3xl bg-black/20 backdrop-blur-xl border border-white/10"
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    
    {/* Chart info skeleton */}
    <motion.div 
      className="absolute top-4 left-4 z-20 p-3 rounded-xl bg-black/20 backdrop-blur-xl border border-white/10"
    >
      <Skeleton width="70px" height="12px" className="mb-2" />
      <Skeleton width="50px" height="10px" />
    </motion.div>
    
    {/* Controls skeleton */}
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
      <Skeleton width="90px" height="28px" className="rounded-lg" />
      <div className="flex gap-2">
        <Skeleton width="28px" height="28px" className="rounded-lg" />
        <Skeleton width="36px" height="28px" className="rounded-lg" />
        <Skeleton width="28px" height="28px" className="rounded-lg" />
      </div>
    </div>
  </div>
)