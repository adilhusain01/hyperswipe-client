import { encode } from '@msgpack/msgpack'
import { keccak256 } from 'viem'

// Constants for Hyperliquid
const PHANTOM_AGENT_ADDRESS = '0x0000000000000000000000000000000000000000'

export function constructOrderAction(asset, isBuy, price, size, reduceOnly = false, orderType = 'limit', tif = 'Gtc') {
  const order = {
    a: asset,  // asset index
    b: isBuy,  // is buy order
    p: price.toString(),  // price as string
    s: size.toString(),   // size as string
    r: reduceOnly,        // reduce only
    t: {
      [orderType]: orderType === 'limit' ? { tif } : {}
    }
  }

  return {
    type: 'order',
    orders: [order],
    grouping: 'na'
  }
}

export function orderActionHash(action, vaultAddress = null, nonce) {
  const data = {
    action,
    nonce,
    signature: PHANTOM_AGENT_ADDRESS,
    vaultAddress: vaultAddress || PHANTOM_AGENT_ADDRESS
  }

  // Encode the data using msgpack
  const encoded = encode(data)
  
  // Hash the encoded data
  const hash = keccak256(encoded)
  
  return hash
}

export async function signL1Action(wallet, action, vaultAddress = null, nonce) {
  console.log('🖋️ Signing with wallet:', {
    hasSignMessage: !!wallet?.signMessage,
    hasAddress: !!wallet?.address,
    connectorType: wallet?.connectorType,
    methods: wallet ? Object.keys(wallet) : []
  })

  if (!wallet || !wallet.signMessage) {
    throw new Error('Wallet not available for signing or does not support message signing')
  }

  // Special handling for different wallet types
  if (wallet.connectorType === 'embedded') {
    console.log('🔐 Using embedded wallet signing')
  } else if (wallet.connectorType === 'injected') {
    console.log('🦊 Using injected wallet (MetaMask/external) signing')
    
    // For injected wallets, we need to use the browser's ethereum provider directly
    if (typeof window !== 'undefined' && window.ethereum) {
      console.log('🌐 Found window.ethereum, using direct provider signing')
      
      try {
        // Generate the hash
        const hash = orderActionHash(action, vaultAddress, nonce)
        console.log('🔑 Generated hash for injected wallet signing:', hash)
        
        // Use the browser's ethereum provider to sign
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [hash, wallet.address]
        })
        
        console.log('🖋️ Raw signature from injected wallet:', signature)

        // Handle signature format for injected wallets
        let cleanSignature = signature
        if (signature.startsWith('0x')) {
          cleanSignature = signature.slice(2)
        }

        return {
          r: '0x' + cleanSignature.slice(0, 64),
          s: '0x' + cleanSignature.slice(64, 128),
          v: parseInt(cleanSignature.slice(128, 130), 16)
        }
      } catch (injectedError) {
        console.error('Injected wallet signing failed:', injectedError)
        // Fall through to Privy methods
      }
    }
  }

  try {
    // Generate the hash
    const hash = orderActionHash(action, vaultAddress, nonce)
    console.log('🔑 Generated hash for signing:', hash)
    
    let signature
    
    // Try Privy's signMessage function first, then wallet client methods
    try {
      if (wallet.signMessage) {
        // Hyperliquid expects signing of raw bytes, not hex string
        // Convert hex hash to Uint8Array
        const hashBytes = new Uint8Array(Array.from(hash.slice(2).match(/.{1,2}/g) || [], (byte) => parseInt(byte, 16)))
        signature = await wallet.signMessage(hashBytes)
        console.log('✅ Signed with Privy signMessage(hashBytes)')
      } else {
        throw new Error('signMessage not available')
      }
    } catch (error) {
      console.log('❌ Failed with bytes, trying hex string...')
      try {
        if (wallet.signMessage) {
          // Fallback: try with hex string
          signature = await wallet.signMessage(hash)
          console.log('✅ Signed with Privy signMessage(hash)')
        } else {
          throw new Error('signMessage not available')
        }
      } catch (error2) {
        console.log('❌ Failed with hex string, trying message object...')
        try {
          if (wallet.signMessage) {
            // Try message object format
            signature = await wallet.signMessage({ message: hash })
            console.log('✅ Signed with Privy signMessage({message: hash})')
          } else {
            throw new Error('signMessage not available')
          }
        } catch (error3) {
          console.error('All signing methods failed:', { error, error2, error3 })
          
          // Check for specific Privy errors
          if (error3.message && error3.message.includes('No embedded or connected wallet found')) {
            if (wallet.connectorType === 'injected') {
              throw new Error('MetaMask/injected wallet signing failed. Please ensure MetaMask is unlocked and connected to the correct network.')
            } else {
              throw new Error('Wallet connection lost. Please disconnect and reconnect your wallet, then try again.')
            }
          }
          
          throw new Error('Unable to sign message with any supported format')
        }
      }
    }

    console.log('🖋️ Raw signature:', signature)

    // Handle signature format
    let cleanSignature = signature
    if (signature.startsWith('0x')) {
      cleanSignature = signature.slice(2)
    }

    return {
      r: '0x' + cleanSignature.slice(0, 64),
      s: '0x' + cleanSignature.slice(64, 128),
      v: parseInt(cleanSignature.slice(128, 130), 16)
    }
  } catch (error) {
    console.error('Signing error:', error)
    throw new Error(`Failed to sign transaction: ${error.message}`)
  }
}

export function constructOrderRequest(action, signature, nonce, vaultAddress = null) {
  return {
    action,
    nonce,
    signature,
    vaultAddress: vaultAddress || undefined
  }
}

// Helper to get current timestamp as nonce
export function getNonce() {
  return Date.now()
}

// Convert order type for Hyperliquid API
export function getOrderDirection(direction) {
  return direction === 'buy' || direction === 'long'
}

// Calculate order price with market order handling
export function getOrderPrice(direction, markPrice, isMarketOrder = true) {
  if (isMarketOrder) {
    const price = parseFloat(markPrice)
    // For market orders, adjust price to ensure execution
    if (direction === 'buy' || direction === 'long') {
      return (price * 1.05).toString() // 5% above mark price for market buy on testnet
    } else {
      return (price * 0.95).toString() // 5% below mark price for market sell on testnet
    }
  }
  return markPrice.toString()
}