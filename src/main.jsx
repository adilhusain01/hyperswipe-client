import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PrivyProvider } from '@privy-io/react-auth'
import { arbitrumSepolia } from 'viem/chains'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Logo hosted on Cloudinary CDN for better performance
const hyperswipeLogo = 'https://res.cloudinary.com/djxuqljgr/image/upload/v1755535763/hyperswipe-no-bg_ztqnzb.png'

// Lazy load all page components for better performance
const App = lazy(() => import('./App.jsx'))
const Landing = lazy(() => import('./pages/Landing.jsx'))
const Documentation = lazy(() => import('./pages/Documentation.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen font-sans" style={{background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 100%)', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300 font-medium">Loading HyperSwipe...</p>
      </div>
    </div>
  </div>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <PrivyProvider 
      appId="cme8oaa6w02lvlc0czhyey21g"
      config={{
        defaultChain: arbitrumSepolia,
        supportedChains: [arbitrumSepolia],
        appearance: {
          accentColor: "#8b5cf6",
          theme: "dark",
          showWalletLoginFirst: false,
          logo: hyperswipeLogo,
          walletChainType: "ethereum-only",
          walletList: [
            "detected_wallets",
            "metamask",
            "coinbase_wallet",
            "rainbow",
            "okx_wallet",
            "wallet_connect"
          ],
          landingHeader: "Welcome to HyperSwipe",
          landingSubheader: "Trade perpetuals with style. Swipe your way to profits.",
          loginMessage: "Connect your wallet to start trading",
          showWelcomeScreen: true
        },
        loginMethods: [
          "wallet",
          "google"
        ],
        fundingMethodConfig: {
          moonpay: {
            useSandbox: true
          }
        },
        embeddedWallets: {
          requireUserPasswordOnCreate: false,
          showWalletUIs: true,
          ethereum: {
            createOnLogin: "users-without-wallets"
          }
        },
        mfa: {
          noPromptOnMfaRequired: false
        },
      }}
    >
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<App />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
      </PrivyProvider>
    </ErrorBoundary>
  </StrictMode>
)
