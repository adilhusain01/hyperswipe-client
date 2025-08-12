import React, { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import TradingCard from './components/TradingCard'
import Profile from './components/Profile'
import Positions from './components/Positions'

const App = () => {
  const { ready, authenticated, login, logout, user } = usePrivy()
  const [currentView, setCurrentView] = useState('trading') // 'trading', 'positions', or 'profile'
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0)

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-sm w-full mx-4">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">HyperSwipe</h1>
          <p className="text-gray-300 text-center mb-8">
            Swipe to trade perpetuals on Hyperliquid Testnet
          </p>
          <button
            onClick={login}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-sm mx-4">
        {/* Mobile-style container */}
        <div className="rounded-3xl shadow-[10px_10px_20px_0px_rgba(0,0,0,0.5)] overflow-hidden h-[725px] relative">
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-gray-700">
            {/* Navigation */}
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentView('trading')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'trading' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
                title="Trading"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 12C2 6.48 6.48 2 12 2S22 6.48 22 12 17.52 22 12 22 2 17.52 2 12M15.5 6L12 8.5 8.5 6 12 9.5 15.5 6M12 17C14.76 17 17 14.76 17 12H15C15 13.66 13.66 15 12 15S9 13.66 9 12H7C7 14.76 9.24 17 12 17Z"/>
                </svg>
              </button>
              <button
                onClick={() => setCurrentView('positions')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'positions' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
                title="Positions"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
                </svg>
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'profile' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
                title="Profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z"/>
                </svg>
              </button>
            </div>
            
            {/* <h1 className="text-lg font-bold text-white">HyperSwipe</h1> */}
            
            <button
              onClick={logout}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 17V14H9V10H16V7L21 12L16 17M14 2C15.11 2 16 2.9 16 4V6H14V4H5V20H14V18H16V20C16 21.11 15.11 22 14 22H5C3.9 22 3 21.11 3 20V4C3 2.9 3.9 2 5 2H14Z"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {currentView === 'trading' ? (
              <TradingCard 
                currentAssetIndex={currentAssetIndex}
                onSwipeLeft={() => setCurrentAssetIndex(prev => prev + 1)}
                onSwipeRight={() => setCurrentAssetIndex(prev => prev + 1)}
                user={user}
              />
            ) : currentView === 'positions' ? (
              <Positions user={user} />
            ) : (
              <Profile user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App