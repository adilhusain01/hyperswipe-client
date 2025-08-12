# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HyperSwipe is a Tinder-style perpetuals trading platform for Hyperliquid Testnet. Users authenticate via Privy and swipe right to trade perpetual contracts on cryptocurrency assets. The application presents trading cards with asset information, price charts, and configurable position sizing in USDC.

## Architecture

- **Frontend**: React + Vite application in `/client/` directory
  - Built with React 19, Vite 7, and Tailwind CSS v4
  - Uses Privy for wallet authentication
  - TradingView Lightweight Charts for professional price visualization
  - Smartphone-sized UI optimized for mobile trading experience
  - Three-page navigation: Trading, Positions, Profile
- **Backend**: Node.js server in `/server/` directory (minimal setup currently)
  - Planned to use MongoDB for data persistence
  - Will integrate with Hyperliquid API for trading operations

## Development Commands

### Frontend (client/)
```bash
cd client/
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Backend (server/)
Currently minimal setup - no specific commands configured.

## Key Integrations

### Hyperliquid API (Testnet)
- **Exchange Endpoint**: `https://api.hyperliquid-testnet.xyz/exchange` - Used for placing/canceling orders, managing positions
- **Info Endpoint**: `https://api.hyperliquid-testnet.xyz/info` - Used for retrieving market data, positions, account info
- Asset indexing: Perpetuals use universe index, spot assets use `10000 + index`
- All actions require proper signature generation (see `Signing.md` for details)
- **Currency**: All position sizing is in USDC with $10 minimum order size

### Privy Authentication
Configuration includes:
- Multi-wallet support (MetaMask, Phantom, Coinbase, etc.)
- Multiple login methods (email, wallet, Google)
- Ethereum and Solana chain support
- Embedded wallet creation for new users

## File Structure

### Core Components
- `/client/src/App.jsx` - Main React application with three-tab navigation
- `/client/src/components/TradingCard.jsx` - Tinder-style swipe trading interface
- `/client/src/components/Positions.jsx` - Dedicated positions management page
- `/client/src/components/Profile.jsx` - User profile with account information
- `/client/src/components/Chart.jsx` - TradingView candlestick charts with volume

### Services and Configuration
- `/client/src/services/hyperliquid.js` - API integration for market data and trading
- `/client/src/services/signing.js` - Cryptographic signature generation
- `/task.md` - Project requirements and feature specifications
- `/Exchange_Endpoint.md` - Hyperliquid API documentation for trading
- `/Perpetual_Info.md` - Hyperliquid API documentation for market data
- `/Signing.md` - Signature generation requirements for API calls
- `/privy.md` - Privy provider configuration

## Trading Features to Implement

The planned UI shows:
- Asset price charts at top
- Asset name and 24h price change
- Current mark price and open interest
- Buy/Long and Sell/Short buttons
- Position size slider ($10 USDC to wallet maximum)
- Leverage slider (configurable based on Hyperliquid margins)
- Swipe right to execute trade, left to skip to next asset
- User profile page

## Important Notes

- All Hyperliquid API calls require proper cryptographic signatures
- Asset metadata and pricing must be fetched from Hyperliquid info endpoints
- Position sizing is limited by user's wallet balance and asset-specific margin requirements
- Leverage limits vary by asset (some assets are isolated-only with lower max leverage)