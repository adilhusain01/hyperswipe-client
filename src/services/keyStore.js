class KeyStoreService {
  constructor() {
    this.privateKey = null
    this.sessionStartTime = null
    this.SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
  }

  setPrivateKey(key) {
    this.privateKey = key
    this.sessionStartTime = Date.now()
  }

  getPrivateKey() {
    if (!this.privateKey || !this.sessionStartTime) {
      return null
    }

    // Check if session has expired
    if (Date.now() - this.sessionStartTime > this.SESSION_TIMEOUT) {
      this.clearPrivateKey()
      return null
    }

    return this.privateKey
  }

  clearPrivateKey() {
    this.privateKey = null
    this.sessionStartTime = null
  }

  isKeyAvailable() {
    return this.getPrivateKey() !== null
  }

  extendSession() {
    if (this.privateKey) {
      this.sessionStartTime = Date.now()
    }
  }
}

// Create and export singleton
export const keyStore = new KeyStoreService()
export default keyStore