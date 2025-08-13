import React from 'react'

// Generic skeleton component
export const Skeleton = ({ className = '', width = '100%', height = '20px' }) => (
  <div 
    className={`animate-pulse bg-gray-600 rounded ${className}`}
    style={{ width, height }}
  />
)

// Trading card skeleton
export const TradingCardSkeleton = () => (
  <div className="h-full flex flex-col">
    <div className="flex-1 bg-gray-700 rounded-2xl m-4 p-6 min-h-0">
      {/* Chart skeleton */}
      <div className="h-60 bg-gray-600 rounded-lg mb-4 animate-pulse" />
      
      {/* Asset info skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width="120px" height="32px" />
          <Skeleton width="80px" height="24px" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-600 p-3 rounded-lg">
            <Skeleton width="80px" height="16px" className="mb-2" />
            <Skeleton width="60px" height="20px" />
          </div>
          <div className="bg-gray-600 p-3 rounded-lg">
            <Skeleton width="90px" height="16px" className="mb-2" />
            <Skeleton width="50px" height="20px" />
          </div>
        </div>
        
        {/* Trading buttons skeleton */}
        <div className="flex gap-3">
          <Skeleton width="100%" height="48px" className="rounded-lg" />
          <Skeleton width="100%" height="48px" className="rounded-lg" />
        </div>
        
        {/* Sliders skeleton */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <Skeleton width="80px" height="16px" />
              <Skeleton width="60px" height="16px" />
            </div>
            <Skeleton width="100%" height="8px" className="rounded-full" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <Skeleton width="60px" height="16px" />
              <Skeleton width="40px" height="16px" />
            </div>
            <Skeleton width="100%" height="8px" className="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Profile skeleton
export const ProfileSkeleton = () => (
  <div className="h-full overflow-y-auto">
    <div className="p-4 space-y-6 pb-8">
      {/* User Info skeleton */}
      <div className="bg-gray-700 rounded-2xl p-6">
        <Skeleton width="60px" height="24px" className="mb-4" />
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton width="50px" height="16px" />
            <Skeleton width="120px" height="16px" />
          </div>
          <div className="flex justify-between">
            <Skeleton width="40px" height="16px" />
            <Skeleton width="100px" height="16px" />
          </div>
        </div>
      </div>
      
      {/* Wallet Balance skeleton */}
      <div className="bg-gray-700 rounded-2xl p-6">
        <Skeleton width="160px" height="20px" className="mb-4" />
        <div className="bg-gray-600 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton width="80px" height="16px" className="mb-2" />
              <Skeleton width="100px" height="24px" />
            </div>
            <Skeleton width="24px" height="24px" className="rounded-full" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Skeleton width="120px" height="16px" className="mb-2" />
            <div className="flex gap-2">
              <Skeleton width="100%" height="40px" className="rounded-lg" />
              <Skeleton width="60px" height="40px" className="rounded-lg" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Account Summary skeleton */}
      <div className="bg-gray-700 rounded-2xl p-6">
        <Skeleton width="120px" height="20px" className="mb-4" />
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-600 p-4 rounded-lg">
            <Skeleton width="90px" height="16px" className="mb-2" />
            <Skeleton width="80px" height="24px" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-600 p-4 rounded-lg">
              <Skeleton width="100px" height="16px" className="mb-2" />
              <Skeleton width="60px" height="20px" />
            </div>
            <div className="bg-gray-600 p-4 rounded-lg">
              <Skeleton width="80px" height="16px" className="mb-2" />
              <Skeleton width="60px" height="20px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Positions skeleton
export const PositionsSkeleton = () => (
  <div className="h-full overflow-y-auto">
    <div className="p-4 space-y-4 pb-8">
      {/* Header skeleton */}
      <div className="bg-gray-700 rounded-2xl p-4">
        <Skeleton width="120px" height="20px" className="mb-3" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <Skeleton width="80px" height="12px" className="mx-auto mb-1" />
              <Skeleton width="60px" height="20px" className="mx-auto" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Position cards skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-700 rounded-xl p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-3">
              <div>
                <Skeleton width="60px" height="20px" className="mb-1" />
                <Skeleton width="80px" height="16px" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton width="70px" height="20px" className="mb-1" />
              <Skeleton width="50px" height="16px" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="bg-gray-600 p-3 rounded-lg">
                <Skeleton width="80px" height="12px" className="mb-1" />
                <Skeleton width="60px" height="16px" />
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Skeleton width="100%" height="32px" className="rounded-lg" />
            <Skeleton width="100%" height="32px" className="rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Chart skeleton
export const ChartSkeleton = () => (
  <div className="relative w-full h-full">
    <div className="absolute inset-0 bg-gray-600 rounded-lg animate-pulse" />
    
    {/* Chart info skeleton */}
    <div className="absolute top-2 left-2 z-20 bg-gray-800 bg-opacity-80 rounded p-2">
      <Skeleton width="60px" height="12px" className="mb-1" />
      <Skeleton width="50px" height="10px" />
    </div>
    
    {/* Controls skeleton */}
    <div className="absolute top-2 left-2 z-20 flex flex-col gap-2">
      <Skeleton width="80px" height="24px" className="rounded" />
      <div className="flex gap-1">
        <Skeleton width="24px" height="24px" className="rounded" />
        <Skeleton width="32px" height="24px" className="rounded" />
        <Skeleton width="24px" height="24px" className="rounded" />
      </div>
    </div>
  </div>
)