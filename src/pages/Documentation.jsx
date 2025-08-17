import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import CryptoTrailBackground from '../components/CryptoTrailBackground'
import hyperswipeLogo from '../assets/logos/hyperswipe-no-bg.png'

// Import Glass Icons
import rocketIcon from '../glass_icons/rocket.svg'
import boltIcon from '../glass_icons/bolt.svg'
import circleChartLineIcon from '../glass_icons/circle-chart-line.svg'
import swapIcon from '../glass_icons/swap.svg'
import cloudBoltIcon from '../glass_icons/cloud-bolt.svg'
import triangleWarningIcon from '../glass_icons/triangle-warning.svg'
import bellIcon from '../glass_icons/bell.svg'
import appStackIcon from '../glass_icons/app-stack.svg'
import laptopMobileIcon from '../glass_icons/laptop-mobile.svg'
import gaugeIcon from '../glass_icons/gauge.svg'
import squareChartLineIcon from '../glass_icons/square-chart-line.svg'
import connectIcon from '../glass_icons/connect.svg'
import lockIcon from '../glass_icons/lock.svg'
import windowIcon from '../glass_icons/window.svg'
import gearIcon from '../glass_icons/gear.svg'
import circleArrowUpIcon from '../glass_icons/circle-arrow-up.svg'
import circleArrowDownIcon from '../glass_icons/circle-arrow-down.svg'
import circleArrowRightIcon from '../glass_icons/circle-arrow-right.svg'
import circleArrowLeftIcon from '../glass_icons/circle-arrow-left.svg'
import layersIcon from '../glass_icons/layers.svg'
import cubeIcon from '../glass_icons/cube.svg'
import clipboardCheckIcon from '../glass_icons/clipboard-check.svg'
import sparkleIcon from '../glass_icons/sparkle.svg'
import magicWandSparkleIcon from '../glass_icons/magic-wand-sparkle.svg'
import crosshairsIcon from '../glass_icons/crosshairs.svg'
import faceGrinIcon from '../glass_icons/face-grin.svg'
import arrowsBoldOppositeDirectionIcon from '../glass_icons/arrows-bold-opposite-direction.svg'
import moneyBillIcon from '../glass_icons/money-bill.svg'
import codeEditorIcon from '../glass_icons/code-editor.svg'
import hammerIcon from '../glass_icons/hammer.svg'
import sitemapIcon from '../glass_icons/sitemap.svg'

// Aliases for clarity
const shieldIcon = triangleWarningIcon
const globeIcon = windowIcon
const mobileIcon = laptopMobileIcon

const BackIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const Documentation = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', title: 'Overview', icon: rocketIcon },
    { id: 'features', title: 'Features', icon: sparkleIcon },
    { id: 'trading', title: 'Trading Guide', icon: circleChartLineIcon },
    { id: 'perpetuals', title: 'Perpetuals 101', icon: swapIcon },
    { id: 'hyperliquid', title: 'Hyperliquid', icon: cloudBoltIcon },
    { id: 'safety', title: 'Safety & Risk', icon: triangleWarningIcon },
    { id: 'telegram', title: 'Telegram Alerts', icon: bellIcon },
    { id: 'api', title: 'Technical', icon: appStackIcon }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              
              <p className="text-slate-300 text-lg leading-relaxed max-w-3xl mx-auto font-normal">
                Welcome to HyperSwipe, a Tinder-style perpetual trading platform built on Hyperliquid's lightning-fast infrastructure
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <img src={crosshairsIcon} alt="Target" className="w-6 h-6" />
                  <h2 className="text-xl font-medium text-slate-100">What is HyperSwipe?</h2>
                </div>
                <p className="text-slate-300 leading-relaxed font-normal">
                  HyperSwipe transforms complex perpetual trading into an intuitive, swipe-based experience. 
                  Trade crypto derivatives with the simplicity of swiping right for long positions and left for short positions.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <img src={boltIcon} alt="Lightning" className="w-6 h-6" />
                  <h2 className="text-xl font-medium text-slate-100">Why Choose HyperSwipe?</h2>
                </div>
                <ul className="text-slate-300 space-y-3 font-normal">
                  <li>• Lightning-fast execution on Hyperliquid</li>
                  <li>• Mobile-first intuitive interface</li>
                  <li>• Real-time price feeds & charts</li>
                  <li>• Professional Telegram notifications</li>
                  <li>• Zero learning curve for beginners</li>
                </ul>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <img src={faceGrinIcon} alt="Game" className="w-6 h-6" />
                <h2 className="text-xl font-medium text-slate-100">How It Works</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 p-1 bg-gradient-to-br from-white/20 to-transparent shadow-lg">
                    <div className="w-full h-full bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <img src={connectIcon} alt="Connect" className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-white mb-2">Connect & Browse</h3>
                  <p className="text-slate-300 font-normal">Connect your wallet and browse available assets</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 p-1 bg-gradient-to-br from-white/20 to-transparent shadow-lg">
                    <div className="w-full h-full bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <img src={squareChartLineIcon} alt="Chart" className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-white mb-2">Analyze & Configure</h3>
                  <p className="text-slate-300 font-normal">Analyze charts and set your position size</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 p-1 bg-gradient-to-br from-white/20 to-transparent shadow-lg">
                    <div className="w-full h-full bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <img src={boltIcon} alt="Lightning" className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-white mb-2">Swipe to Trade</h3>
                  <p className="text-slate-300 font-normal">Swipe right for long, left for short - instantly!</p>
                </div>
              </div>
            </motion.div>
          </div>
        )

      case 'features':
        return (
          <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent text-center mb-8">
              Powerful Features
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[
                {
                  icon: mobileIcon,
                  title: 'Mobile-First Design',
                  description: 'Optimized for smartphones with intuitive swipe gestures and touch-friendly controls'
                },
                {
                  icon: boltIcon,
                  title: 'Lightning Fast Execution',
                  description: 'Sub-second order execution powered by Hyperliquid\'s high-performance infrastructure'
                },
                {
                  icon: squareChartLineIcon,
                  title: 'Professional Charts',
                  description: 'TradingView-powered candlestick charts with volume indicators and real-time updates'
                },
                {
                  icon: arrowsBoldOppositeDirectionIcon,
                  title: 'Real-Time Data',
                  description: 'Live price feeds, position updates, and market data via WebSocket connections'
                },
                {
                  icon: crosshairsIcon,
                  title: 'Smart Position Sizing',
                  description: 'Intelligent position sizing with leverage controls and risk management tools'
                },
                {
                  icon: bellIcon,
                  title: 'Telegram Integration',
                  description: 'Professional trading notifications, P&L alerts, and daily portfolio summaries'
                },
                {
                  icon: lockIcon,
                  title: 'Secure Wallet Integration',
                  description: 'Multi-wallet support with Privy authentication and secure key management'
                },
                {
                  icon: globeIcon,
                  title: 'Cross-Platform',
                  description: 'Works seamlessly on desktop, tablet, and mobile devices'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 p-1 bg-gradient-to-br from-white/20 to-transparent shadow-lg">
                      <div className="w-full h-full bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <img src={feature.icon} alt={feature.title} className="w-8 h-8" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3">{feature.title}</h3>
                      <p className="text-slate-300 leading-relaxed font-normal">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'trading':
        return (
          <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent text-center mb-8">
              Trading Guide
            </h1>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <img src={rocketIcon} alt="Rocket" className="w-6 h-6" />
                  <h2 className="text-xl font-medium text-slate-100">Getting Started</h2>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <span className="w-8 h-8 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-200 font-semibold mt-1">1</span>
                    <div>
                      <h3 className="text-base font-medium text-white mb-2">Connect Your Wallet</h3>
                      <p className="text-slate-300 font-normal">Use Privy to connect MetaMask, Coinbase Wallet, or create an embedded wallet</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="w-8 h-8 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-200 font-semibold mt-1">2</span>
                    <div>
                      <h3 className="text-base font-medium text-white mb-2">Fund Your Account</h3>
                      <p className="text-slate-300 font-normal">Deposit USDC to your Hyperliquid account (minimum $10 for trading)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="w-8 h-8 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-200 font-semibold mt-1">3</span>
                    <div>
                      <h3 className="text-base font-medium text-white mb-2">Start Trading</h3>
                      <p className="text-slate-300 font-normal">Browse assets, analyze charts, set position size, and swipe to trade!</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <img src={squareChartLineIcon} alt="Chart" className="w-6 h-6" />
                  <h2 className="text-xl font-medium text-slate-100">Understanding the Interface</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-base font-medium text-white mb-4">Trading Card</h3>
                    <ul className="text-slate-300 space-y-2 font-normal">
                      <li>• Asset name and 24h price change</li>
                      <li>• Live candlestick chart with volume</li>
                      <li>• Current mark price and open interest</li>
                      <li>• Position size and leverage sliders</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white mb-4">Navigation</h3>
                    <ul className="text-slate-300 space-y-2 font-normal">
                      <li>• Trading: Swipe interface for orders</li>
                      <li>• Markets: Browse all available assets</li>
                      <li>• Positions: Manage open positions</li>
                      <li>• Profile: Account settings & Telegram</li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <img src={boltIcon} alt="Lightning" className="w-6 h-6" />
                  <h2 className="text-xl font-medium text-slate-100">Trading Actions</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 p-1 bg-gradient-to-br from-white/20 to-transparent shadow-lg">
                      <div className="w-full h-full bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                         <img src={circleArrowRightIcon} alt="Right Arrow" className="w-10 h-10" />
                      </div>
                    </div>
                    <h3 className="text-base font-medium text-slate-100 mb-3">Swipe Right = Long</h3>
                    <p className="text-slate-300 font-normal">Buy/Long position - profit when price goes up</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 p-1 bg-gradient-to-br from-white/20 to-transparent shadow-lg">
                      <div className="w-full h-full bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <img src={circleArrowLeftIcon} alt="Left Arrow" className="w-10 h-10" />
                      </div>
                    </div>
                    <h3 className="text-base font-medium text-slate-100 mb-3">Swipe Left = Short</h3>
                    <p className="text-slate-300 font-normal">Sell/Short position - profit when price goes down</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )

      case 'perpetuals':
        return (
          <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent text-center mb-8">
              Perpetual Futures 101
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                <img src={swapIcon} alt="Swap" className="w-6 h-6" />
                <span>What are Perpetual Futures?</span>
              </h2>
              <p className="text-slate-300 leading-relaxed mb-6 font-normal">
                Perpetual futures are derivative contracts that allow you to trade the price movement of an asset 
                without owning it. Unlike traditional futures, they don't have an expiration date and track the 
                underlying asset's price through a funding mechanism.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-4">Key Benefits:</h3>
                  <ul className="text-slate-300 space-y-2 font-normal">
                    <li>• No expiration dates</li>
                    <li>• Leverage up to 50x on some assets</li>
                    <li>• Go long or short on any asset</li>
                    <li>• Trade 24/7 with high liquidity</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-4">Risks to Consider:</h3>
                  <ul className="text-slate-300 space-y-2 font-normal">
                    <li>• Amplified gains and losses</li>
                    <li>• Liquidation risk with high leverage</li>
                    <li>• Funding costs every 8 hours</li>
                    <li>• Market volatility exposure</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                  <img src={circleArrowUpIcon} alt="Up Arrow" className="w-6 h-6" />
                  <span>Long Positions</span>
                </h2>
                <p className="text-slate-300 mb-6 font-normal">
                  Going long means you believe the asset price will increase. You profit when the price goes up.
                </p>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-base font-medium text-slate-200 mb-3">Example:</h3>
                  <p className="text-slate-300 font-normal">
                    ETH at $2,000 → You long with $100 (2x leverage) → ETH rises to $2,200 (+10%) → 
                    Your position gains $20 (20% return)
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                  <img src={circleArrowDownIcon} alt="Down Arrow" className="w-6 h-6" />
                  <span>Short Positions</span>
                </h2>
                <p className="text-slate-300 mb-6 font-normal">
                  Going short means you believe the asset price will decrease. You profit when the price goes down.
                </p>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <h3 className="text-base font-medium text-slate-200 mb-3">Example:</h3>
                  <p className="text-slate-300 font-normal">
                    BTC at $50,000 → You short with $100 (2x leverage) → BTC drops to $45,000 (-10%) → 
                    Your position gains $20 (20% return)
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                <img src={gaugeIcon} alt="Gauge" className="w-6 h-6" />
                <span>Understanding Leverage</span>
              </h2>
              <p className="text-slate-300 mb-6 font-normal">
                Leverage allows you to control a larger position with less capital. While it amplifies potential profits, 
                it also increases risks significantly.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-slate-300 py-4 font-normal">Leverage</th>
                      <th className="text-left text-slate-300 py-4 font-normal">Capital Required</th>
                      <th className="text-left text-slate-300 py-4 font-normal">Liquidation Risk</th>
                      <th className="text-left text-slate-300 py-4 font-normal">Recommended For</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300 font-normal">
                    <tr className="border-b border-white/10">
                      <td className="py-4">1x - 2x</td>
                      <td className="py-4">50% - 100%</td>
                      <td className="py-4 text-slate-100">Low</td>
                      <td className="py-4">Beginners</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-4">3x - 5x</td>
                      <td className="py-4">20% - 33%</td>
                      <td className="py-4 text-slate-300">Medium</td>
                      <td className="py-4">Intermediate</td>
                    </tr>
                    <tr>
                      <td className="py-4">10x+</td>
                      <td className="py-4">&lt; 10%</td>
                      <td className="py-4 text-slate-400">High</td>
                      <td className="py-4">Advanced</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )

      case 'hyperliquid':
        return (
          <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent text-center mb-8">
              Hyperliquid Platform
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                <img src={cloudBoltIcon} alt="Cloud Bolt" className="w-6 h-6" />
                <span>What is Hyperliquid?</span>
              </h2>
              <p className="text-slate-300 leading-relaxed mb-6 font-normal">
                Hyperliquid is a high-performance decentralized exchange (DEX) built specifically for perpetual futures trading. 
                It combines the speed and user experience of centralized exchanges with the transparency and self-custody of DeFi.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 p-1 bg-gradient-to-br from-white/20 to-transparent shadow-lg">
                    <div className="w-full h-full bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <img src={boltIcon} alt="Bolt" className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-slate-200 mb-2">Lightning Fast</h3>
                  <p className="text-slate-300 font-normal">Sub-second order execution</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 p-1 bg-gradient-to-br from-white/20 to-transparent shadow-lg">
                    <div className="w-full h-full bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <img src={layersIcon} alt="Layers" className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-slate-200 mb-2">Deep Liquidity</h3>
                  <p className="text-slate-300 font-normal">Institutional-grade order book</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 p-1 bg-gradient-to-br from-white/20 to-transparent shadow-lg">
                    <div className="w-full h-full bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <img src={lockIcon} alt="Lock" className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-slate-200 mb-2">Self-Custody</h3>
                  <p className="text-slate-300 font-normal">Your keys, your crypto</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <h2 className="text-xl font-medium text-slate-100 mb-6">Key Advantages</h2>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-4">
                    <span className="w-6 h-6 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-200 text-sm mt-1">✓</span>
                    <div>
                      <h3 className="text-base font-medium text-white">No Gas Fees</h3>
                      <p className="text-slate-300 font-normal">Trade without worrying about transaction costs</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <span className="w-6 h-6 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-200 text-sm mt-1">✓</span>
                    <div>
                      <h3 className="text-base font-medium text-white">Cross-Margin</h3>
                      <p className="text-slate-300 font-normal">Efficient capital utilization across positions</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <span className="w-6 h-6 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-200 text-sm mt-1">✓</span>
                    <div>
                      <h3 className="text-base font-medium text-white">MEV Protection</h3>
                      <p className="text-slate-300 font-normal">Built-in protection against front-running</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <span className="w-6 h-6 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-200 text-sm mt-1">✓</span>
                    <div>
                      <h3 className="text-base font-medium text-white">24/7 Trading</h3>
                      <p className="text-slate-300 font-normal">Markets never close</p>
                    </div>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <h2 className="text-xl font-medium text-slate-100 mb-6">Available Assets</h2>
                <p className="text-slate-300 mb-6 font-normal">
                  Trade perpetual futures on 50+ cryptocurrency assets including:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC', 'LINK', 'UNI', 'AAVE', 'MKR', 'CRV', 'SUSHI', 'COMP'].map((asset) => (
                    <div key={asset} className="bg-black/20 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-lg text-center">
                      <span className="text-slate-200 font-medium text-base">{asset}</span>
                    </div>
                  ))}
                </div>
                <p className="text-slate-400 mt-6 font-normal">
                  Plus many more altcoins and DeFi tokens...
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-medium text-slate-100 mb-6">How HyperSwipe Enhances Hyperliquid</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-black/10 rounded-xl border border-white/5">
                  <img src={laptopMobileIcon} alt="Mobile" className="w-10 h-10 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-slate-200 mb-2">Mobile-First</h3>
                  <p className="text-slate-300 font-normal">Optimized for smartphone trading</p>
                </div>
                <div className="text-center p-6 bg-black/10 rounded-xl border border-white/5">
                  <img src={faceGrinIcon} alt="Game" className="w-10 h-10 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-slate-200 mb-2">Gamified UX</h3>
                  <p className="text-slate-300 font-normal">Tinder-style swipe interface</p>
                </div>
                <div className="text-center p-6 bg-black/10 rounded-xl border border-white/5">
                  <img src={bellIcon} alt="Alerts" className="w-10 h-10 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-slate-200 mb-2">Smart Alerts</h3>
                  <p className="text-slate-300 font-normal">Telegram notifications</p>
                </div>
              </div>
            </motion.div>
          </div>
        )

      case 'safety':
        return (
          <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent text-center mb-8">
              Safety & Risk Management
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                <img src={triangleWarningIcon} alt="Warning" className="w-6 h-6" />
                <span>Important Risk Warnings</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <span className="w-8 h-8 bg-black/20 border border-white/10 rounded-full flex items-center justify-center text-slate-200 font-bold mt-1">!</span>
                  <p className="text-slate-300 font-normal">
                    <strong className="text-slate-100">High Risk:</strong> Perpetual futures trading involves significant risk of loss. 
                    Only trade with funds you can afford to lose.
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="w-8 h-8 bg-black/20 border border-white/10 rounded-full flex items-center justify-center text-slate-200 font-bold mt-1">!</span>
                  <p className="text-slate-300 font-normal">
                    <strong className="text-slate-100">Leverage Risk:</strong> Higher leverage amplifies both gains and losses. 
                    You can lose more than your initial investment.
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="w-8 h-8 bg-black/20 border border-white/10 rounded-full flex items-center justify-center text-slate-200 font-bold mt-1">!</span>
                  <p className="text-slate-300 font-normal">
                    <strong className="text-slate-100">Market Risk:</strong> Cryptocurrency markets are highly volatile and 
                    can experience rapid price movements.
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                  <img src={shieldIcon} alt="Shield" className="w-6 h-6" />
                  <span>Risk Management Tips</span>
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-4">
                    <span className="w-6 h-6 bg-black/20 border border-white/10 rounded-full flex items-center justify-center text-slate-200 text-sm mt-1">✓</span>
                    <div>
                      <h3 className="text-base font-medium text-white">Start Small</h3>
                      <p className="text-slate-300 font-normal">Begin with low leverage (1x-2x) and small position sizes</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <span className="w-6 h-6 bg-black/20 border border-white/10 rounded-full flex items-center justify-center text-slate-200 text-sm mt-1">✓</span>
                    <div>
                      <h3 className="text-base font-medium text-white">Set Stop Losses</h3>
                      <p className="text-slate-300 font-normal">Always define your exit strategy before entering trades</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <span className="w-6 h-6 bg-black/20 border border-white/10 rounded-full flex items-center justify-center text-slate-200 text-sm mt-1">✓</span>
                    <div>
                      <h3 className="text-base font-medium text-white">Diversify</h3>
                      <p className="text-slate-300 font-normal">Don't put all your capital in a single position</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <span className="w-6 h-6 bg-black/20 border border-white/10 rounded-full flex items-center justify-center text-slate-200 text-sm mt-1">✓</span>
                    <div>
                      <h3 className="text-base font-medium text-white">Learn Continuously</h3>
                      <p className="text-slate-300 font-normal">Study market analysis and trading strategies</p>
                    </div>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                  <img src={lockIcon} alt="Lock" className="w-6 h-6" />
                  <span>Security Best Practices</span>
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-4">
                    <span className="w-6 h-6 bg-black/20 border border-white/10 rounded-full flex items-center justify-center text-slate-200 text-sm mt-1">✓</span>
                    <div>
                      <h3 className="text-base font-medium text-white">Hardware Wallets</h3>
                      <p className="text-slate-300 font-normal">Use hardware wallets for large amounts</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <span className="w-6 h-6 bg-black/20 border border-white/10 rounded-full flex items-center justify-center text-slate-200 text-sm mt-1">✓</span>
                    <div>
                      <h3 className="text-base font-medium text-white">Secure Networks</h3>
                      <p className="text-slate-300 font-normal">Avoid public WiFi for trading activities</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <span className="w-6 h-6 bg-black/20 border border-white/10 rounded-full flex items-center justify-center text-slate-200 text-sm mt-1">✓</span>
                    <div>
                      <h3 className="text-base font-medium text-white">Verify URLs</h3>
                      <p className="text-slate-300 font-normal">Always check you're on the correct website</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <span className="w-6 h-6 bg-black/20 border border-white/10 rounded-full flex items-center justify-center text-slate-200 text-sm mt-1">✓</span>
                    <div>
                      <h3 className="text-base font-medium text-white">Keep Software Updated</h3>
                      <p className="text-slate-300 font-normal">Update wallets and browsers regularly</p>
                    </div>
                  </li>
                </ul>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                <img src={crosshairsIcon} alt="Target" className="w-6 h-6" />
                <span>Liquidation Protection</span>
              </h2>
              <p className="text-slate-300 mb-6 font-normal">
                Understanding liquidation is crucial for safe trading. Your position gets liquidated when your margin 
                falls below the maintenance requirement.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/10 border border-white/5 p-6 rounded-xl text-center">
                  <h3 className="text-base font-medium text-slate-200 mb-3">Monitor Margin</h3>
                  <p className="text-slate-300 font-normal">Keep track of your margin ratio</p>
                </div>
                <div className="bg-black/10 border border-white/5 p-6 rounded-xl text-center">
                  <h3 className="text-base font-medium text-slate-200 mb-3">Set Alerts</h3>
                  <p className="text-slate-300 font-normal">Use Telegram notifications</p>
                </div>
                <div className="bg-black/10 border border-white/5 p-6 rounded-xl text-center">
                  <h3 className="text-base font-medium text-slate-200 mb-3">Add Margin</h3>
                  <p className="text-slate-300 font-normal">Deposit more funds if needed</p>
                </div>
              </div>
            </motion.div>
          </div>
        )

      case 'telegram':
        return (
          <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent text-center mb-8">
              Telegram Notifications
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                <img src={laptopMobileIcon} alt="Mobile" className="w-6 h-6" />
                <span>Stay Connected to Your Trades</span>
              </h2>
              <p className="text-slate-300 leading-relaxed mb-6 font-normal">
                HyperSwipe's Telegram integration keeps you informed about your trading activity with real-time 
                notifications, daily summaries, and important alerts - all delivered directly to your phone.
              </p>
              <div className="flex items-center justify-center">
                <div className="bg-black/20 backdrop-blur-sm px-8 py-4 rounded-xl border border-white/10">
                  <span className="text-slate-200 font-medium text-xl">@hyperswipe_bot</span>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                  <img src={boltIcon} alt="Bolt" className="w-6 h-6" />
                  <span>Real-Time Alerts</span>
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-200 text-lg mt-1 flex-shrink-0">
                      <img src={squareChartLineIcon} alt="Chart" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-white">Position Fills</h3>
                      <p className="text-slate-300 font-normal">Instant notifications when your orders are executed</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-200 text-lg mt-1 flex-shrink-0">
                      <img src={moneyBillIcon} alt="Money" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-white">P&L Updates</h3>
                      <p className="text-slate-300 font-normal">Track your profits and losses in real-time</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-200 text-lg mt-1 flex-shrink-0">
                      <img src={triangleWarningIcon} alt="Alert" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-white">Risk Alerts</h3>
                      <p className="text-slate-300 font-normal">Warnings when positions approach liquidation</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-200 text-lg mt-1 flex-shrink-0">
                      <img src={clipboardCheckIcon} alt="Check" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-white">Position Closes</h3>
                      <p className="text-slate-300 font-normal">Confirmation when positions are closed</p>
                    </div>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                  <img src={circleChartLineIcon} alt="Chart" className="w-6 h-6" />
                  <span>Daily Summaries</span>
                </h2>
                <p className="text-slate-300 mb-6 font-normal">
                  Receive comprehensive daily reports at 9 AM UTC with:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">Total account value</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">Daily P&L breakdown</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">Open positions summary</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">Trading volume statistics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">Number of trades executed</span>
                  </li>
                </ul>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                <img src={rocketIcon} alt="Rocket" className="w-6 h-6" />
                <span>Quick Setup Guide</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-slate-200 font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-base font-medium text-white mb-3">Open Telegram</h3>
                  <p className="text-slate-300 font-normal">Launch the Telegram app</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-slate-200 font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-base font-medium text-white mb-3">Find Bot</h3>
                  <p className="text-slate-300 font-normal">Search for @hyperswipe_bot</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-slate-200 font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-base font-medium text-white mb-3">Connect</h3>
                  <p className="text-slate-300 font-normal">Link your wallet address</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-black/20 border border-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-slate-200 font-bold text-xl">4</span>
                  </div>
                  <h3 className="text-base font-medium text-white mb-3">Trade</h3>
                  <p className="text-slate-300 font-normal">Start receiving alerts!</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                <img src={magicWandSparkleIcon} alt="Magic Wand" className="w-6 h-6" />
                <span>Pro Tips</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-4">Notification Settings</h3>
                  <ul className="text-slate-300 space-y-2 font-normal">
                    <li>• Enable sound for important alerts</li>
                    <li>• Pin important messages</li>
                    <li>• Use notification scheduling</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-4">Best Practices</h3>
                  <ul className="text-slate-300 space-y-2 font-normal">
                    <li>• Check daily summaries regularly</li>
                    <li>• Act on liquidation warnings quickly</li>
                    <li>• Archive old messages to stay organized</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )

      case 'api':
        return (
          <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent text-center mb-8">
              Technical Architecture
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                <img src={sitemapIcon} alt="Sitemap" className="w-6 h-6" />
                <span>System Overview</span>
              </h2>
              <p className="text-slate-300 leading-relaxed mb-6 font-normal">
                HyperSwipe is built with modern web technologies and a robust backend architecture that ensures 
                fast, secure, and reliable trading operations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 p-1 bg-gradient-to-br from-white/20 to-transparent shadow-lg">
                    <div className="w-full h-full bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <img src={cubeIcon} alt="Cube" className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-slate-200 mb-2">React Frontend</h3>
                  <p className="text-slate-300 font-normal">Modern React with Framer Motion</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 p-1 bg-gradient-to-br from-white/20 to-transparent shadow-lg">
                    <div className="w-full h-full bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <img src={codeEditorIcon} alt="Code" className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-slate-200 mb-2">FastAPI Backend</h3>
                  <p className="text-slate-300 font-normal">High-performance Python API</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 p-1 bg-gradient-to-br from-white/20 to-transparent shadow-lg">
                    <div className="w-full h-full bg-slate-900/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <img src={connectIcon} alt="Connect" className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-slate-200 mb-2">WebSocket Data</h3>
                  <p className="text-slate-300 font-normal">Real-time price feeds</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                  <img src={hammerIcon} alt="Hammer" className="w-6 h-6" />
                  <span>Frontend Stack</span>
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">React 19 with modern hooks</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">Vite for fast development</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">Tailwind CSS v4 for styling</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">Framer Motion for animations</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">TradingView Lightweight Charts</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">Privy for wallet authentication</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                  <img src={gearIcon} alt="Gear" className="w-6 h-6" />
                  <span>Backend Stack</span>
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">FastAPI with async support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">Hyperliquid Python SDK</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">WebSocket server for real-time data</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">MongoDB with Beanie ODM</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">Telegram Bot API integration</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300 font-normal">Docker containerization</span>
                  </li>
                </ul>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                <img src={lockIcon} alt="Lock" className="w-6 h-6" />
                <span>Security Features</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-4">Cryptographic Security</h3>
                  <ul className="text-slate-300 space-y-3 font-normal">
                    <li>• Official Hyperliquid SDK for signing</li>
                    <li>• EIP-712 structured data signing</li>
                    <li>• Private keys never stored or logged</li>
                    <li>• Client-side signature generation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-4">Network Security</h3>
                  <ul className="text-slate-300 space-y-3 font-normal">
                    <li>• HTTPS/WSS encrypted connections</li>
                    <li>• CORS protection with allowlisted origins</li>
                    <li>• Rate limiting and DDoS protection</li>
                    <li>• Input validation with Pydantic</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                <img src={sitemapIcon} alt="Sitemap" className="w-6 h-6" />
                <span>Data Flow</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-black/20 border border-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-200 font-bold text-lg">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-2">Market Data</h3>
                    <p className="text-slate-300 font-normal">Hyperliquid WebSocket → Backend → Frontend via WebSocket</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-black/20 border border-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-200 font-bold text-lg">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-2">Order Placement</h3>
                    <p className="text-slate-300 font-normal">Frontend → Python Signing Service → Hyperliquid API</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-black/20 border border-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-200 font-bold text-lg">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-2">Notifications</h3>
                    <p className="text-slate-300 font-normal">Backend monitors fills → MongoDB storage → Telegram Bot API</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-8 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-medium text-slate-100 mb-6 flex items-center space-x-3">
                <img src={rocketIcon} alt="Rocket" className="w-6 h-6" />
                <span>Performance Optimizations</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6">
                  <img src={boltIcon} alt="Bolt" className="w-10 h-10 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-slate-200 mb-2">Sub-second Execution</h3>
                  <p className="text-slate-300 font-normal">Optimized order routing</p>
                </div>
                <div className="text-center p-6">
                  <img src={connectIcon} alt="Connect" className="w-10 h-10 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-slate-200 mb-2">Real-time Updates</h3>
                  <p className="text-slate-300 font-normal">WebSocket data streaming</p>
                </div>
                <div className="text-center p-6">
                  <img src={crosshairsIcon} alt="Target" className="w-10 h-10 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-slate-200 mb-2">Smart Caching</h3>
                  <p className="text-slate-300 font-normal">Optimized API calls</p>
                </div>
              </div>
            </motion.div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen font-sans" style={{background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 100%)', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
      <CryptoTrailBackground />
      
      <div className="relative z-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 md:p-6 border-b border-white/10"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-black/20 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors">
              <BackIcon />
            </div>
            <span className="hidden md:block group-hover:text-slate-100 transition-colors">Back to App</span>
          </button>
          
          <div className="text-center flex items-center justify-center">
            <img src={hyperswipeLogo} alt="HyperSwipe" className="h-8 md:h-10" />
            <span className="text-lg md:text-xl font-medium text-slate-300 ml-3">Documentation</span>
          </div>
          
          <div className="w-10 h-10" /> {/* Spacer for centering */}
        </motion.div>

        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-80 border-r border-white/10 p-4 md:p-6 lg:overflow-y-auto bg-black/20 backdrop-blur-xl"
          >
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                    activeSection === section.id
                      ? 'bg-white/10 text-white border border-white/20 shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <img src={section.icon} alt={section.title} className="w-5 h-5" />
                  <span className="font-medium">{section.title}</span>
                </button>
              ))}
            </nav>
          </motion.div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-8 lg:overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Documentation