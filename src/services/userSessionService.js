// User session management service to handle cross-user data isolation

class UserSessionService {
  constructor() {
    this.currentUser = null
    this.sessionData = new Map()
  }

  // Set current user and clear session if user changed
  setCurrentUser(userAddress) {
    if (!userAddress) {
      this.clearCurrentSession()
      return
    }

    const normalizedAddress = userAddress.toLowerCase()
    
    // If user changed, clear previous session
    if (this.currentUser && this.currentUser !== normalizedAddress) {
      console.log('🔄 User changed from', this.currentUser, 'to', normalizedAddress)
      this.clearCurrentSession()
    }
    
    this.currentUser = normalizedAddress
    
    // Initialize session data for new user if needed
    if (!this.sessionData.has(normalizedAddress)) {
      this.sessionData.set(normalizedAddress, {
        balances: null,
        positions: null,
        openOrders: null,
        lastUpdated: null
      })
    }
  }

  // Get current user address
  getCurrentUser() {
    return this.currentUser
  }

  // Clear current session data
  clearCurrentSession() {
    if (this.currentUser) {
      console.log('🧹 Clearing session for user:', this.currentUser)
      this.sessionData.delete(this.currentUser)
      this.currentUser = null
    }
    
    // Clear any browser storage related to user data
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('user_') || key.includes('balance_') || key.includes('position_'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Clear session storage
      sessionStorage.clear()
    } catch (error) {
      console.warn('Failed to clear browser storage:', error)
    }
  }

  // Set user data with session isolation
  setUserData(userAddress, dataType, data) {
    if (!userAddress) return false
    
    const normalizedAddress = userAddress.toLowerCase()
    if (this.currentUser !== normalizedAddress) {
      console.warn('Attempted to set data for non-current user:', normalizedAddress)
      return false
    }
    
    if (!this.sessionData.has(normalizedAddress)) {
      this.sessionData.set(normalizedAddress, {})
    }
    
    const userData = this.sessionData.get(normalizedAddress)
    userData[dataType] = data
    userData.lastUpdated = Date.now()
    
    return true
  }

  // Get user data with session isolation
  getUserData(userAddress, dataType) {
    if (!userAddress) return null
    
    const normalizedAddress = userAddress.toLowerCase()
    if (this.currentUser !== normalizedAddress) {
      return null // Don't return data for different user
    }
    
    const userData = this.sessionData.get(normalizedAddress)
    return userData ? userData[dataType] : null
  }

  // Check if data is stale (older than 30 seconds)
  isDataStale(userAddress, dataType, maxAge = 30000) {
    const userData = this.sessionData.get(userAddress?.toLowerCase())
    if (!userData || !userData.lastUpdated) return true
    
    return Date.now() - userData.lastUpdated > maxAge
  }

  // Clear all session data (for complete logout)
  clearAllSessions() {
    console.log('🧹 Clearing all user sessions')
    this.sessionData.clear()
    this.currentUser = null
    
    // Clear browser storage
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (error) {
      console.warn('Failed to clear browser storage:', error)
    }
  }
}

// Export singleton instance
export const userSessionService = new UserSessionService()
export default userSessionService