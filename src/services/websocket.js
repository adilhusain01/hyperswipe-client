class WebSocketService {
  constructor() {
    this.ws = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000 // 5 seconds
    this.messageId = 0
    this.listeners = new Map()
    
    // Server URL - adjust for production
    this.serverUrl = import.meta.env.MODE === 'production' 
      ? 'wss://your-server-domain.com' 
      : 'ws://localhost:8080'
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      console.log('🔗 Connecting to HyperSwipe WebSocket server...')
      
      this.ws = new WebSocket(this.serverUrl)

      this.ws.onopen = () => {
        console.log('✅ Connected to HyperSwipe WebSocket server')
        this.isConnected = true
        this.reconnectAttempts = 0
        resolve()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('🔌 Disconnected from WebSocket server')
        this.isConnected = false
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        this.isConnected = false
        reject(error)
      }

      // Timeout for connection
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('WebSocket connection timeout'))
        }
      }, 10000) // 10 seconds timeout
    })
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`⏰ Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('❌ Reconnection failed:', error)
      })
    }, this.reconnectInterval)
  }

  handleMessage(data) {
    const { type, data: messageData } = data

    // Emit events to listeners
    this.emit(type, messageData)

    // Handle specific message types
    switch (type) {
      case 'connected':
        console.log('📱 Server connection confirmed')
        break

      case 'price_update':
        this.emit('priceUpdate', messageData)
        break

      case 'user_data_update':
        this.emit('userDataUpdate', messageData)
        break

      case 'user_events':
        this.emit('userEvents', messageData)
        break

      case 'candle_update':
        this.emit('candleUpdate', messageData)
        break

      case 'subscription_confirmed':
        console.log('✅ Subscription confirmed:', messageData)
        break

      default:
        console.log('📦 Received message:', type, messageData)
    }
  }

  // Subscribe to user-specific data
  subscribeToUserData(userAddress) {
    if (!this.isConnected) {
      console.warn('⚠️ WebSocket not connected, cannot subscribe')
      return
    }

    const message = {
      type: 'subscribe_user_data',
      payload: { userAddress }
    }

    this.send(message)
    console.log('👤 Subscribed to user data for:', userAddress)
  }

  // Subscribe to candle data for chart
  subscribeToCandles(coin, interval = '1h') {
    if (!this.isConnected) {
      console.warn('⚠️ WebSocket not connected, cannot subscribe')
      return
    }

    const message = {
      type: 'subscribe_candles',
      payload: { coin, interval }
    }

    this.send(message)
    console.log('📈 Subscribed to candles for:', coin, interval)
  }

  // Unsubscribe from data
  unsubscribe(subscription) {
    if (!this.isConnected) {
      return
    }

    const message = {
      type: 'unsubscribe',
      payload: { subscription }
    }

    this.send(message)
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...message,
        id: ++this.messageId,
        timestamp: Date.now()
      }))
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message')
    }
  }

  // Event listener system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index !== -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('❌ Error in event listener:', error)
        }
      })
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.listeners.clear()
  }
}

// Create and export a singleton instance
export const websocketService = new WebSocketService()

// Auto-connect when imported
websocketService.connect().catch(error => {
  console.error('❌ Failed to connect to WebSocket server:', error)
  console.log('💡 Make sure the server is running: cd server && npm run dev')
})

export default websocketService