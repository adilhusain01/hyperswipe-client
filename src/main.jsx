import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import { arbitrum } from 'viem/chains'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrivyProvider 
      appId="cme8oaa6w02lvlc0czhyey21g"
      config={{
        defaultChain: arbitrum,
        supportedChains: [arbitrum],
        appearance: {
          accentColor: "#6A6FF5",
          theme: "dark",
          showWalletLoginFirst: false,
          logo: "https://auth.privy.io/logos/privy-logo-dark.png",
          walletChainType: "ethereum-only",
          walletList: [
            "detected_wallets",
            "metamask",
            "coinbase_wallet",
            "rainbow",
            "okx_wallet",
            "wallet_connect"
          ]
        },
        loginMethods: [
          "email",
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
