# HyperSwipe 📱

A Tinder-style perpetuals trading platform for Hyperliquid Testnet. Swipe right to trade, left to skip - it's that simple!

## 🚀 Features

### ✅ Completed
- **Privy Authentication**: Multi-wallet support (MetaMask, Phantom, Coinbase, etc.)
- **Smartphone UI**: Mobile-optimized trading experience in a contained window
- **Real-time Data**: Live asset prices and market data from Hyperliquid
- **Swipe Trading**: Intuitive swipe gestures for trading decisions
- **Position Sizing**: Dynamic sliders for position size and leverage
- **Order Placement**: Full signature generation and order execution
- **User Profile**: Account summary and position tracking

### 🎯 Technical Stack
- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Authentication**: Privy (Wallet + Social login)
- **Trading**: Hyperliquid API integration
- **Animation**: Framer Motion for smooth interactions
- **Signing**: Custom signature generation for Hyperliquid orders

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- A Privy app ID (replace `"your-privy-app-id"` in `main.jsx`)

### Installation
```bash
# Install dependencies
cd client
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Development Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## 📱 How to Use

1. **Connect Wallet**: Click "Connect Wallet" and choose your preferred method
2. **Browse Assets**: View crypto perpetuals with real-time prices and charts
3. **Configure Trade**: Use sliders to set position size (min $10 USDC) and leverage
4. **Trade**: 
   - Swipe RIGHT → Execute the trade
   - Swipe LEFT → Skip to next asset
   - Or use the Buy/Sell buttons directly
5. **Monitor**: Check your profile for positions and account summary

## 🔧 Architecture

### Key Components
- `App.jsx` - Main application with authentication handling
- `TradingCard.jsx` - Core trading interface with swipe functionality
- `Profile.jsx` - User account and position management
- `hyperliquid.js` - API service for market data and orders
- `signing.js` - Cryptographic signing for order placement

### API Integration
- **Info Endpoint**: Real-time market data, user positions
- **Exchange Endpoint**: Order placement with proper signatures
- **Authentication**: Wallet-based signing following Hyperliquid standards

### Trading Flow
1. Fetch available perpetuals from Hyperliquid
2. Display asset info (price, 24h change, open interest)
3. User configures position (size, leverage)
4. Generate cryptographic signature for order
5. Submit order to Hyperliquid exchange
6. Update UI with order status

## 🔐 Security
- All orders require proper cryptographic signatures
- No private keys stored or transmitted
- Wallet-based authentication via Privy
- Client-side signing with secure key management

## 🎨 UI/UX Features
- **Mobile-First**: Designed for smartphone-like interactions
- **Dark Theme**: Professional trading interface
- **Smooth Animations**: Framer Motion for fluid gestures
- **Real-time Updates**: Live price feeds every 10 seconds
- **Loading States**: Proper feedback during API calls

## 📊 Trading Features
- **Market Orders**: Immediate execution with price slippage protection
- **Dynamic Leverage**: Asset-specific maximum leverage limits
- **Position Sizing**: Range from $10 USDC to full wallet balance
- **Order Types**: Immediate-or-cancel for market-like behavior
- **Error Handling**: Clear feedback for failed orders

## 🛠️ Development Notes

### Important Files
- `CLAUDE.md` - Development guidance for future AI assistance
- `Exchange_Endpoint.md` - Hyperliquid API documentation
- `Perpetual_Info.md` - Market data API reference
- `Signing.md` - Signature generation requirements
- `privy.md` - Authentication configuration

### Next Steps for Production
1. Replace placeholder Privy app ID with real credentials
2. Add proper error boundaries and retry logic
3. Implement websocket feeds for real-time updates
4. Add order history and trade analytics
5. Enhanced chart integration (TradingView, etc.)
6. Mobile app deployment (React Native)

## ⚠️ Disclaimers
- This is a demo application for educational purposes
- Test with small amounts on testnet first
- Trading involves significant risk of loss
- Ensure proper wallet security practices

## 🤝 Contributing
Built with Claude Code for rapid prototyping and development.

---

**Happy Trading! 🚀**