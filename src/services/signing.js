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
    walletType: wallet?.walletClientType,
    hasSignMessage: !!wallet?.signMessage,
    methods: wallet ? Object.keys(wallet) : []
  })

  if (!wallet) {
    throw new Error('Wallet not available for signing')
  }

  try {
    // Generate the hash
    const hash = orderActionHash(action, vaultAddress, nonce)
    console.log('🔑 Generated hash for signing:', hash)
    
    let signature
    
    // Handle different wallet types and signing methods
    if (wallet.signMessage) {
      // Try Privy wallet signing format first
      try {
        signature = await wallet.signMessage(hash)
        console.log('✅ Signed with wallet.signMessage(hash)')
      } catch (error) {
        console.log('❌ Failed with signMessage(hash), trying raw format...')
        // Try with raw format
        signature = await wallet.signMessage({ message: { raw: hash } })
        console.log('✅ Signed with wallet.signMessage({message: {raw: hash}})')
      }
    } else if (wallet.request) {
      // Fallback for generic wallet signing
      signature = await wallet.request({
        method: 'personal_sign',
        params: [hash, wallet.address]
      })
      console.log('✅ Signed with wallet.request personal_sign')
    } else {
      throw new Error('Wallet does not support message signing')
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