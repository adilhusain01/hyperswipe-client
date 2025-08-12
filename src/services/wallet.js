import { createPublicClient, createWalletClient, custom, formatUnits, parseUnits } from 'viem'
import { arbitrum } from 'viem/chains'

// USDC contract address on Arbitrum One
const USDC_CONTRACT = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'

// ERC20 ABI for USDC operations
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
]

export const walletService = {
  // Get USDC balance on Arbitrum One
  async getUSDCBalance(userAddress) {
    try {
      const publicClient = createPublicClient({
        chain: arbitrum,
        transport: custom(window.ethereum)
      })

      const balance = await publicClient.readContract({
        address: USDC_CONTRACT,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress]
      })

      // USDC has 6 decimals
      return parseFloat(formatUnits(balance, 6))
    } catch (error) {
      console.error('Error fetching USDC balance:', error)
      return 0
    }
  },

  // Transfer USDC to Hyperliquid bridge address
  async transferUSDCToHyperliquid(wallet, amount) {
    try {
      const walletClient = createWalletClient({
        chain: arbitrum,
        transport: custom(window.ethereum),
        account: wallet.address
      })

      // Hyperliquid bridge address on Arbitrum One
      const HYPERLIQUID_BRIDGE = '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7'
      
      // Convert amount to USDC units (6 decimals)
      const amountInWei = parseUnits(amount.toString(), 6)

      const hash = await walletClient.writeContract({
        address: USDC_CONTRACT,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [HYPERLIQUID_BRIDGE, amountInWei]
      })

      return { success: true, hash }
    } catch (error) {
      console.error('Error transferring USDC:', error)
      return { success: false, error: error.message }
    }
  }
}

export const hyperliquidAccountService = {
  // Check if user has a Hyperliquid perp account
  async checkPerpAccount(userAddress) {
    try {
      const response = await fetch('https://api.hyperliquid-testnet.xyz/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'clearinghouseState',
          user: userAddress
        })
      })

      const data = await response.json()
      
      // If we get valid account data, the account exists
      return {
        exists: !!(data && data.marginSummary),
        accountData: data
      }
    } catch (error) {
      console.error('Error checking perp account:', error)
      return { exists: false, accountData: null }
    }
  },

  // Create Hyperliquid perp account (this might require additional steps)
  async createPerpAccount(wallet) {
    try {
      // Note: Account creation on Hyperliquid typically happens automatically
      // when the first deposit is made to the bridge
      console.log('Account will be created automatically on first deposit')
      return { success: true }
    } catch (error) {
      console.error('Error creating perp account:', error)
      return { success: false, error: error.message }
    }
  }
}