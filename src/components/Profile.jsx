import React, { useState, useEffect } from 'react'
import { hyperliquidAPI } from '../services/hyperliquid'

const CopyIcon = ({ onClick, copied }) => (
  <button
    onClick={onClick}
    className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
    title={copied ? "Copied!" : "Copy address"}
  >
    {copied ? (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
    )}
  </button>
)

const Profile = ({ user }) => {
  const [userState, setUserState] = useState(null)
  const [spotState, setSpotState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addressCopied, setAddressCopied] = useState(false)

  useEffect(() => {
    const fetchUserState = async () => {
      if (user?.wallet?.address) {
        try {
          setLoading(true)
          const [perpState, spotBalances] = await Promise.all([
            hyperliquidAPI.getUserState(user.wallet.address),
            hyperliquidAPI.getSpotBalances(user.wallet.address)
          ])
          console.log('Perp state response:', perpState)
          console.log('Spot balances response:', spotBalances)
          setUserState(perpState)
          setSpotState(spotBalances)
        } catch (error) {
          console.error('Failed to fetch user state:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserState()
  }, [user])

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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    )
  }

  const marginSummary = userState?.marginSummary || {}

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6 pb-8">
        {/* User Info */}
        <div className="bg-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Profile</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Wallet</span>
              <div className="flex items-center">
                <span className="text-white font-mono text-sm">
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
            <div className="flex justify-between">
              <span className="text-gray-300">Email</span>
              <span className="text-white">{user?.email?.address || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Account Summary */}
        <div className="bg-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Account Summary</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-600 p-4 rounded-lg">
              <div className="text-gray-300 text-sm">Account Value</div>
              <div className="text-white text-xl font-semibold">
                ${parseFloat(marginSummary.accountValue || 0).toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-600 p-4 rounded-lg">
                <div className="text-gray-300 text-sm">Total Margin Used</div>
                <div className="text-white font-semibold">
                  ${parseFloat(marginSummary.totalMarginUsed || 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-600 p-4 rounded-lg">
                <div className="text-gray-300 text-sm">Withdrawable</div>
                <div className="text-white font-semibold">
                  ${parseFloat(userState?.withdrawable || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {/* <div className="bg-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-300">Total Trades</div>
              <div className="text-white text-xl font-bold">-</div>
            </div>
            <div className="text-center">
              <div className="text-gray-300">Success Rate</div>
              <div className="text-white text-xl font-bold">-</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-gray-400 text-sm">
              📊 Check the Positions tab for detailed trading info
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default Profile