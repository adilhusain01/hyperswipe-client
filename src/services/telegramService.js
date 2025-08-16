// Telegram integration service for HyperSwipe notifications

class TelegramService {
  constructor() {
    this.baseUrl = import.meta.env.MODE === 'production' 
      ? 'https://app.hyperswipe.rizzmo.site' 
      : 'http://localhost:8081'
  }

  /**
   * Check if Telegram is linked for a wallet address
   */
  async checkTelegramStatus(walletAddress) {
    try {
      const response = await fetch(`${this.baseUrl}/telegram/status/${walletAddress}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('❌ Error checking Telegram status:', error)
      return { linked: false, reason: 'Network error' }
    }
  }

  /**
   * Link Telegram account to wallet address
   */
  async linkTelegramAccount(walletAddress, chatId, username = null, firstName = null) {
    try {
      const response = await fetch(`${this.baseUrl}/telegram/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          chat_id: chatId,
          username,
          first_name: firstName
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to link Telegram account')
      }

      return data
    } catch (error) {
      console.error('❌ Error linking Telegram account:', error)
      throw error
    }
  }

  /**
   * Send test notification to verify Telegram integration
   */
  async sendTestNotification(walletAddress, messageType = 'welcome') {
    try {
      const response = await fetch(`${this.baseUrl}/telegram/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          message_type: messageType
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send test notification')
      }

      return data
    } catch (error) {
      console.error('❌ Error sending test notification:', error)
      throw error
    }
  }

  /**
   * Unlink Telegram account from wallet address
   */
  async unlinkTelegramAccount(walletAddress) {
    try {
      const response = await fetch(`${this.baseUrl}/telegram/unlink/${walletAddress}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to unlink Telegram account')
      }

      return data
    } catch (error) {
      console.error('❌ Error unlinking Telegram account:', error)
      throw error
    }
  }

  /**
   * Generate Telegram bot link for user to start chat
   */
  generateBotLink() {
    // This will be updated with your actual bot username
    const botUsername = 'hyperswipe_bot' // Replace with your bot username
    return `https://t.me/${botUsername}?start=hyperswipe`
  }

  /**
   * Extract chat ID from Telegram bot callback
   * This would typically be called from a Telegram bot webhook
   */
  extractChatIdFromCallback(telegramData) {
    if (telegramData.message && telegramData.message.chat) {
      return {
        chatId: telegramData.message.chat.id.toString(),
        username: telegramData.message.from.username,
        firstName: telegramData.message.from.first_name
      }
    }
    return null
  }

  /**
   * Show instructions for linking Telegram
   */
  getTelegramLinkingInstructions() {
    return {
      steps: [
        "1. Click the button below to open our Telegram bot",
        "2. Send /start to the bot",
        "3. Copy your Chat ID from the bot's response",
        "4. Paste the Chat ID in the form below",
        "5. Click 'Link Account' to complete setup"
      ],
      botLink: this.generateBotLink()
    }
  }
}

// Export singleton instance
export const telegramService = new TelegramService()
export default telegramService