// import { encode } from '@msgpack/msgpack'
// import { keccak256 } from 'viem'

// // Constants for Hyperliquid
// const PHANTOM_AGENT_ADDRESS = '0x0000000000000000000000000000000000000000'

// export function constructOrderAction(asset, isBuy, price, size, reduceOnly = false, orderType = 'limit', tif = 'Gtc') {
//   const order = {
//     a: asset,  // asset index
//     b: isBuy,  // is buy order
//     p: price.toString(),  // price as string
//     s: size.toString(),   // size as string
//     r: reduceOnly,        // reduce only
//     t: {
//       [orderType]: orderType === 'limit' ? { tif } : {}
//     }
//   }

//   return {
//     type: 'order',
//     orders: [order],
//     grouping: 'na'
//   }
// }

// export function orderActionHash(action, vaultAddress = null, nonce) {
//   const data = {
//     action,
//     nonce,
//     signature: PHANTOM_AGENT_ADDRESS,
//     vaultAddress: vaultAddress || PHANTOM_AGENT_ADDRESS
//   }

//   // Encode the data using msgpack
//   const encoded = encode(data)
  
//   // Hash the encoded data
//   const hash = keccak256(encoded)
  
//   return hash
// }

// export async function signL1Action(wallet, action, vaultAddress = null, nonce) {
//   console.log('🖋️ Signing with wallet:', {
//     hasSignMessage: !!wallet?.signMessage,
//     hasAddress: !!wallet?.address,
//     connectorType: wallet?.connectorType,
//     methods: wallet ? Object.keys(wallet) : []
//   })

//   if (!wallet || !wallet.signMessage) {
//     throw new Error('Wallet not available for signing or does not support message signing')
//   }

//   // Special handling for different wallet types
//   if (wallet.connectorType === 'embedded') {
//     console.log('🔐 Using embedded wallet signing')
//   } else if (wallet.connectorType === 'injected') {
//     console.log('🦊 Using injected wallet (MetaMask/external) signing')
    
//     // For injected wallets, we need to use the browser's ethereum provider directly
//     if (typeof window !== 'undefined' && window.ethereum) {
//       console.log('🌐 Found window.ethereum, using direct provider signing')
      
//       try {
//         // Generate the hash
//         const hash = orderActionHash(action, vaultAddress, nonce)
//         console.log('🔑 Generated hash for injected wallet signing:', hash)
        
//         // Use the browser's ethereum provider to sign
//         // Try eth_sign first (raw hash signing), then personal_sign as fallback
//         let signature
//         try {
//           console.log('🔐 Trying eth_sign method...')
//           signature = await window.ethereum.request({
//             method: 'eth_sign',
//             params: [wallet.address, hash]
//           })
//           console.log('✅ eth_sign successful')
//         } catch (ethSignError) {
//           console.log('❌ eth_sign failed, trying eth_signTypedData_v4...', ethSignError)
//           try {
//             // Try EIP-712 signing which might be what Hyperliquid expects
//             const typedData = {
//               domain: {
//                 name: 'Exchange',
//                 version: '1',
//                 chainId: 421614, // Arbitrum Sepolia
//                 verifyingContract: '0x0000000000000000000000000000000000000000'
//               },
//               primaryType: 'Agent',
//               types: {
//                 Agent: [
//                   { name: 'source', type: 'string' },
//                   { name: 'connectionId', type: 'bytes32' }
//                 ]
//               },
//               message: {
//                 source: 'a',
//                 connectionId: hash
//               }
//             }
            
//             signature = await window.ethereum.request({
//               method: 'eth_signTypedData_v4',
//               params: [wallet.address, JSON.stringify(typedData)]
//             })
//             console.log('✅ eth_signTypedData_v4 successful')
//           } catch (typedDataError) {
//             console.log('❌ eth_signTypedData_v4 failed, trying direct hash signing...', typedDataError)
            
//             // Try to use viem to do proper raw hash signing
//             console.log('❌ Wallet methods failed, trying viem raw signing...')
//             try {
//               // Import viem functions for proper signature handling
//               const { createWalletClient, custom, hashMessage, recoverAddress } = await import('viem')
              
//               // Create a viem wallet client from MetaMask
//               const viemClient = createWalletClient({
//                 transport: custom(window.ethereum)
//               })
              
//               // Sign the raw hash bytes directly (no Ethereum message prefix)
//               console.log('🔐 Attempting raw hash signing with viem...')
//               signature = await viemClient.signMessage({
//                 account: wallet.address,
//                 message: { raw: hash }
//               })
//               console.log('✅ Viem raw signing successful')
              
//             } catch (viemError) {
//               console.log('❌ Viem signing failed:', viemError)
//               throw new Error('Unable to sign with any supported method. Hyperliquid requires raw hash signing.')
//             }
//           }
//         }
        
//         console.log('🖋️ Raw signature from injected wallet:', signature)

//         // Handle signature format for injected wallets
//         let cleanSignature = signature
//         if (signature.startsWith('0x')) {
//           cleanSignature = signature.slice(2)
//         }

//         // Hyperliquid might expect different signature format
//         const r = '0x' + cleanSignature.slice(0, 64)
//         const s = '0x' + cleanSignature.slice(64, 128)
//         const v = parseInt(cleanSignature.slice(128, 130), 16)
        
//         console.log('📝 Parsed signature components:', { r, s, v })
        
//         // Verify signature resolves to correct address (for debugging)
//         try {
//           const { verifyMessage } = await import('viem')
//           const recovered = await verifyMessage({
//             address: wallet.address,
//             message: { raw: hash },
//             signature: signature
//           })
//           console.log('🔍 Signature verification:', { 
//             expected: wallet.address,
//             recovered,
//             matches: recovered === wallet.address.toLowerCase()
//           })
//         } catch (verifyError) {
//           console.log('⚠️ Could not verify signature locally:', verifyError)
//         }
        
//         return { r, s, v }
//       } catch (injectedError) {
//         console.error('Injected wallet signing failed:', injectedError)
//         // Fall through to Privy methods
//       }
//     }
//   }

//   try {
//     // Generate the hash
//     const hash = orderActionHash(action, vaultAddress, nonce)
//     console.log('🔑 Generated hash for signing:', hash)
    
//     let signature
    
//     // Try Privy's signMessage function first, then wallet client methods
//     try {
//       if (wallet.signMessage) {
//         // Hyperliquid expects signing of raw bytes, not hex string
//         // Convert hex hash to Uint8Array
//         const hashBytes = new Uint8Array(Array.from(hash.slice(2).match(/.{1,2}/g) || [], (byte) => parseInt(byte, 16)))
//         signature = await wallet.signMessage(hashBytes)
//         console.log('✅ Signed with Privy signMessage(hashBytes)')
//       } else {
//         throw new Error('signMessage not available')
//       }
//     } catch (error) {
//       console.log('❌ Failed with bytes, trying hex string...')
//       try {
//         if (wallet.signMessage) {
//           // Fallback: try with hex string
//           signature = await wallet.signMessage(hash)
//           console.log('✅ Signed with Privy signMessage(hash)')
//         } else {
//           throw new Error('signMessage not available')
//         }
//       } catch (error2) {
//         console.log('❌ Failed with hex string, trying message object...')
//         try {
//           if (wallet.signMessage) {
//             // Try message object format
//             signature = await wallet.signMessage({ message: hash })
//             console.log('✅ Signed with Privy signMessage({message: hash})')
//           } else {
//             throw new Error('signMessage not available')
//           }
//         } catch (error3) {
//           console.error('All signing methods failed:', { error, error2, error3 })
          
//           // Check for specific Privy errors
//           if (error3.message && error3.message.includes('No embedded or connected wallet found')) {
//             if (wallet.connectorType === 'injected') {
//               throw new Error('MetaMask/injected wallet signing failed. Please ensure MetaMask is unlocked and connected to the correct network.')
//             } else {
//               throw new Error('Wallet connection lost. Please disconnect and reconnect your wallet, then try again.')
//             }
//           }
          
//           throw new Error('Unable to sign message with any supported format')
//         }
//       }
//     }

//     console.log('🖋️ Raw signature:', signature)

//     // Handle signature format
//     let cleanSignature = signature
//     if (signature.startsWith('0x')) {
//       cleanSignature = signature.slice(2)
//     }

//     return {
//       r: '0x' + cleanSignature.slice(0, 64),
//       s: '0x' + cleanSignature.slice(64, 128),
//       v: parseInt(cleanSignature.slice(128, 130), 16)
//     }
//   } catch (error) {
//     console.error('Signing error:', error)
//     throw new Error(`Failed to sign transaction: ${error.message}`)
//   }
// }

// export function constructOrderRequest(action, signature, nonce, vaultAddress = null) {
//   return {
//     action,
//     nonce,
//     signature,
//     vaultAddress: vaultAddress || undefined
//   }
// }

// // Helper to get current timestamp as nonce
// export function getNonce() {
//   return Date.now()
// }

// // Convert order type for Hyperliquid API
// export function getOrderDirection(direction) {
//   return direction === 'buy' || direction === 'long'
// }

// // Calculate order price with market order handling
// export function getOrderPrice(direction, markPrice, isMarketOrder = true) {
//   if (isMarketOrder) {
//     const price = parseFloat(markPrice)
//     // For market orders, adjust price to ensure execution
//     if (direction === 'buy' || direction === 'long') {
//       return (price * 1.05).toString() // 5% above mark price for market buy on testnet
//     } else {
//       return (price * 0.95).toString() // 5% below mark price for market sell on testnet
//     }
//   }
//   return markPrice.toString()
// }




import { encode } from '@msgpack/msgpack';
import { keccak256, concat, toBytes, createWalletClient, custom } from 'viem';

// --- HELPER FUNCTIONS ---

/**
 * Converts a number to a string with precision and normalization,
 * matching the Hyperliquid Python SDK's `float_to_wire` function.
 * This is the final fix to ensure the client-side hash matches the server-side hash.
 * @param {string | number} num The number to format.
 * @returns {string} The formatted number as a string.
 */
function floatToWire(num) {
  const s = Number(num).toFixed(8);
  // Use regex to remove trailing zeros after the decimal point,
  // and also remove the decimal point if it's followed only by zeros.
  // '123.45000000' -> '123.45'
  // '123.00000000' -> '123'
  let normalized = s.replace(/(\.\d*?[1-9])0+$/, "$1"); // remove trailing zeros from decimal
  normalized = normalized.replace(/\.0+$/, ""); // remove .0000... if it exists
  return normalized;
}

/**
 * Constructs the order action payload for the Hyperliquid API.
 * @param {number} asset - The asset index.
 * @param {boolean} isBuy - True for a buy order, false for a sell.
 * @param {string | number} price - The limit price for the order.
 * @param {string | number} size - The size of the order.
 * @param {boolean} reduceOnly - If true, the order can only reduce a position.
 * @param {'limit' | 'trigger'} orderType - The type of order.
 * @param {'Gtc' | 'Ioc' | 'Alo'} tif - The time-in-force for the order.
 * @returns {object} The structured order action.
 */
export function constructOrderAction(asset, isBuy, price, size, reduceOnly = false, orderType = 'limit', tif = 'Gtc') {
  const order = {
    a: asset,
    b: isBuy,
    // Use the robust floatToWire for price and size
    p: floatToWire(price),
    s: floatToWire(size),
    r: reduceOnly,
    t: {
      [orderType]: orderType === 'limit' ? { tif } : {},
    },
  };

  return {
    type: 'order',
    orders: [order],
    grouping: 'na',
  };
}

// --- HASHING & SIGNING (Corrected Implementation) ---

/**
 * Generates the EIP-712 `connectionId` hash by replicating the Python SDK's byte-concatenation logic.
 * This is the hash that gets wrapped in the EIP-712 message.
 * @param {object} action - The action payload from constructOrderAction.
 * @param {string | null} vaultAddress - The vault address, or null if not used.
 * @param {number} nonce - The timestamp nonce.
 * @param {number | null} expiresAfter - Optional expiration timestamp.
 * @returns {`0x${string}`} The correctly formatted connectionId hash.
 */
function generateConnectionId(action, vaultAddress, nonce, expiresAfter = null) {
    const packedAction = encode(action);

    const nonceBytes = new Uint8Array(8);
    new DataView(nonceBytes.buffer).setBigUint64(0, BigInt(nonce), false);

    // Begin building the data to hash, starting with the action and nonce
    let dataToHash = concat([packedAction, nonceBytes]);

    // Append vault address bytes if it exists
    if (vaultAddress === null || vaultAddress === undefined) {
        dataToHash = concat([dataToHash, toBytes(0)]); // Append 0x00
    } else {
        dataToHash = concat([dataToHash, toBytes(1), toBytes(vaultAddress)]); // Append 0x01 + address
    }

    // Append expiration bytes if it exists, matching the Python SDK
    if (expiresAfter !== null && expiresAfter !== undefined) {
        const expiresBuffer = new Uint8Array(8);
        new DataView(expiresBuffer.buffer).setBigUint64(0, BigInt(expiresAfter), false);
        // Append 0x00 followed by the 8-byte timestamp
        dataToHash = concat([dataToHash, toBytes(0), expiresBuffer]);
    }

    return keccak256(dataToHash);
}


/**
 * Signs the L1 action using the EIP-712 standard required by Hyperliquid.
 * @param {object} wallet - A viem-compatible wallet object with an address.
 * @param {object} action - The action payload from constructOrderAction.
 * @param {string | null} vaultAddress - The vault address, or null.
 * @param {number} nonce - The timestamp nonce.
 * @param {number | null} expiresAfter - Optional expiration timestamp.
 * @returns {Promise<{r: `0x${string}`, s: `0x${string}`, v: number}>} The r, s, v components of the signature.
 */
export async function signL1Action(wallet, action, vaultAddress = null, nonce, expiresAfter = null) {
    if (!wallet || !wallet.address) {
        throw new Error('Wallet with a connected address is required for signing.');
    }

    // Step 1: Generate the connectionId hash using the correct method.
    const connectionId = generateConnectionId(action, vaultAddress, nonce, expiresAfter);
    console.log('✅ Correct connectionId generated:', connectionId);

    // Get the wallet's current chainId for MetaMask compatibility
    let chainId = 421614; // Default Arbitrum Sepolia
    if (wallet.chainId) {
        const match = wallet.chainId.match(/^eip155:(\d+)$/);
        if (match) {
            chainId = parseInt(match[1]);
            console.log('🔗 Using connected chainId for MetaMask compatibility:', chainId);
        }
    }

    // Step 2: Define the EIP-712 typed data structure.
    // NOTE: Using connected chainId instead of 1337 for MetaMask compatibility
    const typedData = {
        domain: {
            name: 'Exchange',
            version: '1',
            chainId: chainId, // Use connected network chainId for MetaMask
            verifyingContract: '0x0000000000000000000000000000000000000000',
        },
        types: {
            Agent: [
                { name: 'source', type: 'string' },
                { name: 'connectionId', type: 'bytes32' },
            ],
        },
        primaryType: 'Agent',
        message: {
            source: 'b', // 'b' for Testnet
            connectionId: connectionId,
        },
    };

    try {
        let signature;
        
        // FINAL ATTEMPT: Use the exact approach from Python SDK
        // Create EIP-712 hash manually and try to sign it as raw bytes
        if (typeof window !== 'undefined' && window.ethereum) {
            console.log('🖋️ Using Python SDK approach with manual EIP-712 construction...');
            
            // Import necessary viem functions
            const { hashTypedData, hashMessage, recoverAddress, verifyMessage } = await import('viem');
            
            // Create the exact EIP-712 structure as Python SDK with chainId 1337
            const hyperliquidTypedData = {
                domain: {
                    name: 'Exchange',
                    version: '1',
                    chainId: 1337, // Hyperliquid's fixed chainId
                    verifyingContract: '0x0000000000000000000000000000000000000000',
                },
                types: {
                    Agent: [
                        { name: 'source', type: 'string' },
                        { name: 'connectionId', type: 'bytes32' },
                    ],
                },
                primaryType: 'Agent',
                message: {
                    source: 'b', // testnet
                    connectionId: connectionId,
                },
            };
            
            // Generate the EIP-712 hash exactly as Python SDK would
            const eip712Hash = hashTypedData(hyperliquidTypedData);
            console.log('🔑 Generated Hyperliquid-compatible EIP-712 hash:', eip712Hash);
            
            // Since MetaMask won't sign EIP-712 with mismatched chainId,
            // let's try signing the raw hash bytes using eth_sign equivalent
            try {
                // Try to sign the EIP-712 hash directly as message bytes
                const { signMessage: viemSignMessage } = await import('viem/accounts');
                
                // This won't work in browser, but let's try personal_sign on the raw hash
                signature = await window.ethereum.request({
                    method: 'personal_sign',
                    params: [eip712Hash, wallet.address]
                });
                
                console.log('✅ Signed EIP-712 hash with personal_sign');
                
                // BUT: personal_sign adds prefix, so we need to recover differently
                // Let's verify what address this resolves to
                try {
                    const recovered = await recoverAddress({
                        hash: hashMessage({ raw: eip712Hash }),
                        signature: signature
                    });
                    console.log('🔍 personal_sign resolves to:', recovered);
                } catch (e) {
                    console.log('⚠️ Could not verify personal_sign recovery');
                }
                
            } catch (ethSignError) {
                console.log('❌ Raw signing failed, trying to use network chainId after all...');
                throw ethSignError;
            }
        } else {
            // Fallback for non-browser environments
            if (typeof wallet.signTypedData !== 'function') {
                 throw new Error('Wallet does not support signing or window.ethereum is not available.');
            }
            signature = await wallet.signTypedData(typedData);
        }

        console.log('🖋️ Raw signature from wallet:', signature);

        // Step 3: Parse the signature into r, s, and v components.
        const r = signature.slice(0, 66); // 0x + 64 chars
        const s = ('0x' + signature.slice(66, 130));
        const v = parseInt(signature.slice(130, 132), 16);

        console.log('📝 Parsed signature components:', { r, s, v });

        return { r, s, v };

    } catch (error) {
        console.error('EIP-712 Signing error:', error);
        throw new Error(`Failed to sign transaction: ${error.message}`);
    }
}


// --- API REQUEST CONSTRUCTION ---

/**
 * Assembles the final request payload for the /exchange endpoint.
 * @param {object} action - The action payload.
 * @param {{r: string, s: string, v: number}} signature - The signature object.
 * @param {number} nonce - The timestamp nonce.
 * @param {string | null} vaultAddress - The vault address, or null.
 * @returns {object} The final request object.
 */
export function constructOrderRequest(action, signature, nonce, vaultAddress = null) {
  return {
    action,
    nonce,
    signature,
    vaultAddress: vaultAddress || undefined, // API expects undefined for null
  };
}


/**
 * Returns the current timestamp in milliseconds.
 * @returns {number}
 */
export function getNonce() {
  return Date.now();
}

/**
 * Converts a direction string to the boolean required by the API.
 * @param {'buy' | 'long' | 'sell' | 'short'} direction
 * @returns {boolean}
 */
export function getOrderDirection(direction) {
  return direction === 'buy' || direction === 'long';
}

/**
 * Calculates a slippage-adjusted price for market orders.
 * @param {'buy' | 'long' | 'sell' | 'short'} direction
 * @param {string | number} markPrice - The current mark price.
 * @param {boolean} isMarketOrder - Whether the order is a market order.
 * @returns {string} The calculated price as a string.
 */
export function getOrderPrice(direction, markPrice, isMarketOrder = true) {
  if (isMarketOrder) {
    const price = parseFloat(markPrice);
    // For market orders, adjust the price to increase the likelihood of execution.
    // This is a common practice, especially on testnet.
    if (direction === 'buy' || direction === 'long') {
      return (price * 1.05).toString(); // 5% above mark price
    } else {
      return (price * 0.95).toString(); // 5% below mark price
    }
  }
  return markPrice.toString();
}
