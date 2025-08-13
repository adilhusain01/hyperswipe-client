/**
 * Python Signing Service Integration
 * Interfaces with the Python FastAPI signing service for Hyperliquid compatibility
 */

const SIGNING_SERVICE_BASE_URL = 'http://localhost:8081';

class PythonSigningService {
  constructor() {
    this.baseUrl = SIGNING_SERVICE_BASE_URL;
  }

  /**
   * Check if the Python signing service is available
   */
  async isServiceAvailable() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🐍 Python signing service available:', data);
        return data.status === 'healthy';
      }
      
      return false;
    } catch (error) {
      console.error('❌ Python signing service unavailable:', error);
      return false;
    }
  }

  /**
   * Sign a Hyperliquid order using the Python service
   * @param {Object} orderParams - Order parameters
   * @param {string} privateKey - Private key for signing (will be handled securely)
   * @returns {Promise<Object>} - Signed order request ready for Hyperliquid API
   */
  async signOrder(orderParams, privateKey) {
    console.log('🐍 Signing order with Python service...');
    
    // Validate that service is available
    const isAvailable = await this.isServiceAvailable();
    if (!isAvailable) {
      throw new Error('Python signing service is not available. Please ensure it is running on localhost:8081');
    }

    const {
      assetIndex,
      isBuy,
      price,
      size,
      walletAddress,
      reduceOnly = false,
      orderType = 'limit',
      timeInForce = 'Ioc',
      vaultAddress = null
    } = orderParams;

    const requestBody = {
      asset_index: assetIndex,
      is_buy: isBuy,
      price: price.toString(),
      size: size.toString(),
      reduce_only: reduceOnly,
      order_type: orderType,
      time_in_force: timeInForce,
      wallet_address: walletAddress,
      private_key: privateKey,
      vault_address: vaultAddress
    };

    console.log('📤 Sending signing request:', {
      ...requestBody,
      private_key: '[REDACTED]' // Don't log private key
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/sign-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Signing request failed');
      }

      if (data.success) {
        console.log('✅ Order signed successfully');
        console.log('📝 Signature:', data.signature);
        return data.order_request;
      } else {
        throw new Error(data.error || 'Signing failed');
      }

    } catch (error) {
      console.error('🚨 Python signing error:', error);
      throw new Error(`Signing service error: ${error.message}`);
    }
  }

  /**
   * Get the status of the signing service
   */
  async getServiceStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to get service status:', error);
      return null;
    }
  }
}

// Export singleton instance
export const pythonSigningService = new PythonSigningService();

// Helper functions for backward compatibility
export function constructOrderAction(asset, isBuy, price, size, reduceOnly = false, orderType = 'limit', tif = 'Gtc') {
  return {
    assetIndex: asset,
    isBuy,
    price,
    size,
    reduceOnly,
    orderType,
    timeInForce: tif
  };
}

export async function signL1Action(wallet, action, vaultAddress = null, nonce) {
  // Extract private key from wallet (this would need to be implemented based on your wallet setup)
  // For now, this is a placeholder - you'll need to adapt this based on how you get the private key
  
  throw new Error(`
    Private key required for Python signing service.
    
    To use the Python signing service, you need to provide the private key.
    This requires updating the wallet integration to either:
    1. Prompt user for private key input
    2. Use a different wallet provider that exposes private keys
    3. Implement a secure key management system
    
    The signing service is ready at ${SIGNING_SERVICE_BASE_URL}
  `);
}

export function constructOrderRequest(action, signature, nonce, vaultAddress = null) {
  // This is now handled by the Python service
  return {
    action,
    nonce,
    signature,
    vaultAddress: vaultAddress || undefined
  };
}

export function getNonce() {
  return Date.now();
}

export function getOrderDirection(direction) {
  return direction === 'buy' || direction === 'long';
}

export function getOrderPrice(direction, markPrice, isMarketOrder = true) {
  if (isMarketOrder) {
    const price = parseFloat(markPrice);
    if (direction === 'buy' || direction === 'long') {
      return (price * 1.05).toString();
    } else {
      return (price * 0.95).toString();
    }
  }
  return markPrice.toString();
}