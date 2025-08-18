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
        manualChunks: (id) => {
          // Bundle viem with vendor to avoid circular dependency issues
          if (id.includes('viem')) {
            return 'vendor'
          }
          
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor'
          }
          
          // Authentication
          if (id.includes('@privy-io/react-auth')) {
            return 'privy'
          }
          
          // UI and animations
          if (id.includes('framer-motion')) {
            return 'framer'
          }
          
          // Charts and trading
          if (id.includes('lightweight-charts')) {
            return 'charts'
          }
          
          // Routing
          if (id.includes('react-router-dom')) {
            return 'router'
          }
          
          // Default vendor chunk for other node_modules
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        
        // Automatically split chunks by node_modules
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId && facadeModuleId.includes('node_modules')) {
            return 'vendor/[name].[hash].js'
          }
          return 'assets/[name].[hash].js'
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    
// Enable tree shaking for better optimization
    treeshake: {
      moduleSideEffects: (id) => {
        // Preserve side effects for viem to avoid initialization issues
        if (id.includes('viem')) {
          return true
        }
        return false
      }
    }
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
      // Force viem to be pre-bundled to avoid runtime issues
      'viem',
      'viem/chains'
    ],
    exclude: ['@vite/client', '@vite/env'],
    // Ensure viem is properly handled
    force: true
  }
})
