import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Asset handling
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.ico'],
  
  // Build optimizations
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          privy: ['@privy-io/react-auth'],
          framer: ['framer-motion'],
          charts: ['lightweight-charts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  
  // Development server
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true
  },
  
  // Preview server
  preview: {
    port: 4173,
    host: true,
    open: true
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@assets': resolve(__dirname, './src/assets'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils')
    }
  },
  
  // Environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  
  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@privy-io/react-auth',
      'framer-motion',
      'lightweight-charts',
      'viem'
    ],
    exclude: ['@vite/client', '@vite/env']
  }
})
