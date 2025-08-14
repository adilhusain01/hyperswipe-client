import React from 'react'
import { motion } from 'framer-motion'

// Generic skeleton component with romantic theme
export const Skeleton = ({ className = '', width = '100%', height = '20px' }) => (
  <motion.div 
    className={`rounded-lg ${className}`}
    style={{ 
      width, 
      height,
      background: 'linear-gradient(135deg, rgba(30, 30, 58, 0.6) 0%, rgba(20, 20, 32, 0.8) 100%)',
      border: '1px solid rgba(196, 181, 253, 0.1)'
    }}
    animate={{ opacity: [0.4, 0.8, 0.4] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  />
)

// Trading card skeleton with beautiful theme
export const TradingCardSkeleton = () => (
  <div className="h-full flex flex-col p-4">
    <motion.div 
      className="flex-1 glass-card rounded-3xl p-6 min-h-0"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chart skeleton */}
      <motion.div 
        className="h-60 mb-6 rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.8) 0%, rgba(20, 20, 32, 0.9) 100%)',
          border: '1px solid rgba(196, 181, 253, 0.1)'
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Asset info skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton width="120px" height="32px" />
          <motion.div
            className="px-3 py-1.5 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)',
              border: '1px solid rgba(134, 239, 172, 0.2)'
            }}
          >
            <Skeleton width="80px" height="20px" />
          </motion.div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            className="p-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 58, 0.6) 0%, rgba(20, 20, 32, 0.8) 100%)',
              border: '1px solid rgba(196, 181, 253, 0.1)'
            }}
          >
            <Skeleton width="80px" height="16px" className="mb-3" />
            <Skeleton width="100px" height="24px" />
          </motion.div>
          <motion.div 
            className="p-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 58, 0.6) 0%, rgba(20, 20, 32, 0.8) 100%)',
              border: '1px solid rgba(125, 211, 252, 0.1)'
            }}
          >
            <Skeleton width="90px" height="16px" className="mb-3" />
            <Skeleton width="80px" height="24px" />
          </motion.div>
        </div>
        
        {/* Trading buttons skeleton */}
        <div className="flex gap-4">
          <motion.div 
            className="flex-1 h-12 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)',
              border: '1px solid rgba(134, 239, 172, 0.2)'
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="flex-1 h-12 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(253, 164, 175, 0.2) 0%, rgba(244, 63, 94, 0.2) 100%)',
              border: '1px solid rgba(253, 164, 175, 0.2)'
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
        </div>
        
        {/* Sliders skeleton */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-3">
              <Skeleton width="100px" height="16px" />
              <motion.div
                className="px-3 py-1 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(192, 132, 252, 0.2) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                <Skeleton width="60px" height="16px" />
              </motion.div>
            </div>
            <Skeleton width="100%" height="8px" className="rounded-full" />
          </div>
          <div>
            <div className="flex justify-between mb-3">
              <Skeleton width="80px" height="16px" />
              <motion.div
                className="px-3 py-1 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                  border: '1px solid rgba(244, 63, 94, 0.2)'
                }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: 0.3 }}
              >
                <Skeleton width="40px" height="16px" />
              </motion.div>
            </div>
            <Skeleton width="100%" height="8px" className="rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  </div>
)

// Profile skeleton with beautiful theme
export const ProfileSkeleton = () => (
  <div className="h-full overflow-y-auto" style={{
    background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.6) 0%, rgba(20, 20, 32, 0.8) 100%)'
  }}>
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
            className="w-3 h-3 rounded-full"
            style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Skeleton width="80px" height="24px" />
        </div>
        <div className="space-y-4">
          <motion.div 
            className="flex justify-between items-center p-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(196, 181, 253, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              border: '1px solid rgba(196, 181, 253, 0.1)'
            }}
          >
            <Skeleton width="80px" height="16px" />
            <Skeleton width="140px" height="20px" />
          </motion.div>
          <motion.div 
            className="flex justify-between items-center p-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(253, 164, 175, 0.05) 0%, rgba(244, 63, 94, 0.05) 100%)',
              border: '1px solid rgba(253, 164, 175, 0.1)'
            }}
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
            className="w-3 h-3 rounded-full"
            style={{ background: 'linear-gradient(135deg, #7dd3fc 0%, #0ea5e9 100%)' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          <Skeleton width="180px" height="20px" />
        </div>
        
        <motion.div 
          className="p-6 rounded-2xl mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(125, 211, 252, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
            border: '1px solid rgba(125, 211, 252, 0.2)'
          }}
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
            className="w-3 h-3 rounded-full"
            style={{ background: 'linear-gradient(135deg, #86efac 0%, #22c55e 100%)' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
          <Skeleton width="140px" height="20px" />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <motion.div 
            className="p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
              border: '1px solid rgba(134, 239, 172, 0.2)'
            }}
          >
            <Skeleton width="120px" height="16px" className="mb-3" />
            <Skeleton width="100px" height="32px" />
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className="p-4 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(253, 164, 175, 0.1) 0%, rgba(244, 63, 94, 0.1) 100%)',
                border: '1px solid rgba(253, 164, 175, 0.2)'
              }}
            >
              <Skeleton width="80px" height="16px" className="mb-3" />
              <Skeleton width="70px" height="24px" />
            </motion.div>
            
            <motion.div 
              className="p-4 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(196, 181, 253, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: '1px solid rgba(196, 181, 253, 0.2)'
              }}
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

// Positions skeleton with romantic theme
export const PositionsSkeleton = () => (
  <div className="h-full overflow-y-auto" style={{
    background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.6) 0%, rgba(20, 20, 32, 0.8) 100%)'
  }}>
    <motion.div 
      className="p-4 space-y-6 pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header skeleton */}
      <motion.div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <motion.div 
            className="w-3 h-3 rounded-full"
            style={{ background: 'linear-gradient(135deg, #86efac 0%, #22c55e 100%)' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Skeleton width="120px" height="24px" />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i} 
              className="text-center p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, rgba(${i === 1 ? '134, 239, 172' : i === 2 ? '253, 164, 175' : '196, 181, 253'}, 0.1) 0%, rgba(${i === 1 ? '34, 197, 94' : i === 2 ? '244, 63, 94' : '139, 92, 246'}, 0.1) 100%)`,
                border: `1px solid rgba(${i === 1 ? '134, 239, 172' : i === 2 ? '253, 164, 175' : '196, 181, 253'}, 0.2)`
              }}
            >
              <Skeleton width="60px" height="12px" className="mx-auto mb-2" />
              <Skeleton width="80px" height="20px" className="mx-auto" />
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
                className="p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 30, 58, 0.6) 0%, rgba(20, 20, 32, 0.8) 100%)',
                  border: '1px solid rgba(196, 181, 253, 0.1)'
                }}
              >
                <Skeleton width="70px" height="12px" className="mb-2" />
                <Skeleton width="60px" height="20px" />
              </motion.div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <motion.div 
              className="flex-1 h-10 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)',
                border: '1px solid rgba(134, 239, 172, 0.2)'
              }}
            />
            <motion.div 
              className="flex-1 h-10 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(253, 164, 175, 0.2) 0%, rgba(244, 63, 94, 0.2) 100%)',
                border: '1px solid rgba(253, 164, 175, 0.2)'
              }}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  </div>
)

// MarketList skeleton that matches actual component
export const MarketListSkeleton = () => (
  <div className="h-full overflow-y-auto" style={{
    background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.6) 0%, rgba(20, 20, 32, 0.8) 100%)'
  }}>
    <motion.div 
      className="p-4 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header skeleton */}
      <motion.div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <motion.div 
            className="w-3 h-3 rounded-full"
            style={{ background: 'linear-gradient(135deg, #7dd3fc 0%, #0ea5e9 100%)' }}
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
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="px-3 py-1.5 rounded-lg"
              style={{
                background: i === 1 ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(192, 132, 252, 0.2) 100%)' : 'linear-gradient(135deg, rgba(30, 30, 58, 0.6) 0%, rgba(20, 20, 32, 0.8) 100%)',
                border: `1px solid rgba(${i === 1 ? '139, 92, 246' : '196, 181, 253'}, 0.2)`
              }}
            >
              <Skeleton width={`${40 + i * 10}px`} height="16px" />
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
                  className="inline-block px-2 py-1 rounded-lg"
                  style={{
                    background: i % 2 === 0 
                      ? 'linear-gradient(135deg, rgba(134, 239, 172, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)' 
                      : 'linear-gradient(135deg, rgba(253, 164, 175, 0.1) 0%, rgba(244, 63, 94, 0.1) 100%)',
                    border: i % 2 === 0 
                      ? '1px solid rgba(134, 239, 172, 0.2)' 
                      : '1px solid rgba(253, 164, 175, 0.2)'
                  }}
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

// Chart skeleton with romantic theme
export const ChartSkeleton = () => (
  <div className="relative w-full h-full">
    <motion.div 
      className="absolute inset-0 rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.8) 0%, rgba(20, 20, 32, 0.9) 100%)',
        border: '1px solid rgba(196, 181, 253, 0.1)'
      }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    
    {/* Chart info skeleton */}
    <motion.div 
      className="absolute top-4 left-4 z-20 p-3 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 30, 58, 0.9) 0%, rgba(20, 20, 32, 0.95) 100%)',
        border: '1px solid rgba(196, 181, 253, 0.2)'
      }}
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