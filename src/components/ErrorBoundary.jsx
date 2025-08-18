import React from 'react'
import { motion } from 'framer-motion'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen font-sans" style={{background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 100%)', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
          <div className="flex items-center justify-center min-h-screen px-4">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-card p-8 rounded-2xl max-w-md w-full bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="mb-6"
              >
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-xl font-medium bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent mb-3">
                  Something went wrong
                </h1>
              </motion.div>
              
              <p className="text-slate-300 mb-6 leading-relaxed">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>
              
              <motion.button
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-black/20 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium py-3 px-6 rounded-xl text-base transition-all duration-300 backdrop-blur-sm"
              >
                Reload Page
              </motion.button>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                    Error Details (Dev Mode)
                  </summary>
                  <pre className="text-xs text-red-400 bg-black/20 p-2 rounded mt-2 overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </motion.div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary