import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import { arbitrumSepolia } from 'viem/chains'
import './index.css'
import App from './App.jsx'
import hyperswipeLogo from './assets/logos/hyperswipe-no-bg.png'

createRoot(document.getElementById('root')).render(
  <StrictMode>
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
      <App />
    </PrivyProvider>
  </StrictMode>,
)
