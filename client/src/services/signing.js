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
  if (!wallet || !wallet.signMessage) {
    throw new Error('Wallet not available for signing')
  }

  try {
    // Generate the hash
    const hash = orderActionHash(action, vaultAddress, nonce)
    
    // Sign the hash
    const signature = await wallet.signMessage({
      message: { raw: hash }
    })

    return {
      r: signature.slice(0, 66),
      s: '0x' + signature.slice(66, 130),
      v: parseInt(signature.slice(130, 132), 16)
    }
  } catch (error) {
    console.error('Signing error:', error)
    throw error
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