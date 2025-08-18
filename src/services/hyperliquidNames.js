/**
 * Hyperliquid Names (.hl) integration service
 * Handles forward and reverse resolution of .hl domain names
 */

const HLNAMES_API_BASE = 'https://api.hlnames.xyz/api'
const API_KEY = 'CPEPKMI-HUSUX6I-SE2DHEA-YYWFG5Y'

class HyperliquidNamesService {
  constructor() {
    this.cache = new Map()
    this.reverseCache = new Map()
  }

  /**
   * Forward resolution: name -> address
   * @param {string} name - The .hl name to resolve (e.g., "testooor.hl")
   * @returns {Promise<string|null>} - The resolved address or null if not found
   */
  async resolveName(name) {
    try {
      // Check cache first
      if (this.cache.has(name)) {
        return this.cache.get(name)
      }

      const response = await fetch(`${HLNAMES_API_BASE}/resolve/${name}`, {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null // Name not found
        }
        throw new Error(`Failed to resolve name: ${response.status}`)
      }

      const data = await response.json()
      const address = data.address

      // Cache the result
      if (address) {
        this.cache.set(name, address)
        this.reverseCache.set(address.toLowerCase(), name)
      }

      return address
    } catch (error) {
      console.error('Error resolving .hl name:', error)
      return null
    }
  }

  /**
   * Reverse resolution: address -> name
   * @param {string} address - The wallet address to reverse resolve
   * @returns {Promise<string|null>} - The primary .hl name or null if not found
   */
  async reverseLookup(address) {
    try {
      // Check cache first
      const cacheKey = address.toLowerCase()
      if (this.reverseCache.has(cacheKey)) {
        return this.reverseCache.get(cacheKey)
      }

      const response = await fetch(`${HLNAMES_API_BASE}/reverse/${address}`, {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null // No primary name set
        }
        throw new Error(`Failed to reverse lookup: ${response.status}`)
      }

      const data = await response.json()
      const name = data.name

      // Cache the result
      if (name) {
        this.cache.set(name, address)
        this.reverseCache.set(cacheKey, name)
      }

      return name
    } catch (error) {
      console.error('Error reverse looking up address:', error)
      return null
    }
  }

  /**
   * Get text records for a .hl name
   * @param {string} name - The .hl name
   * @returns {Promise<Object|null>} - The text records or null if not found
   */
  async getTextRecords(name) {
    try {
      const response = await fetch(`${HLNAMES_API_BASE}/text/${name}`, {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching text records:', error)
      return null
    }
  }

  /**
   * Check if a name is a valid .hl domain
   * @param {string} name - The name to validate
   * @returns {boolean} - True if valid .hl domain format
   */
  isValidHLName(name) {
    return typeof name === 'string' && name.toLowerCase().endsWith('.hl')
  }

  /**
   * Format address for display with .hl name if available
   * @param {string} address - The wallet address
   * @param {string|null} hlName - The resolved .hl name
   * @returns {string} - Formatted display string
   */
  formatAddressDisplay(address, hlName) {
    if (hlName) {
      return hlName
    }
    
    if (!address) return 'Not connected'
    
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  /**
   * Get display info for an address (name + truncated address)
   * @param {string} address - The wallet address
   * @returns {Promise<Object>} - Object with name, address, and display string
   */
  async getAddressDisplayInfo(address) {
    if (!address) {
      return {
        name: null,
        address: null,
        display: 'Not connected',
        isHLName: false
      }
    }

    const hlName = await this.reverseLookup(address)
    
    return {
      name: hlName,
      address: address,
      display: this.formatAddressDisplay(address, hlName),
      isHLName: !!hlName
    }
  }

  /**
   * Clear caches
   */
  clearCache() {
    this.cache.clear()
    this.reverseCache.clear()
  }
}

// Export singleton instance
export const hyperliquidNamesService = new HyperliquidNamesService()
export default hyperliquidNamesService