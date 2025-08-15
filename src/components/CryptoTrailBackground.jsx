import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// Simple pathfinding utility
class SnakePathfinder {
  constructor(gridWidth, gridHeight) {
    this.width = gridWidth
    this.height = gridHeight
  }

  // Check if position is valid (within bounds and not occupied)
  isValidPosition(x, y, occupiedPositions = []) {
    if (x < 1 || x >= this.width - 1 || y < 1 || y >= this.height - 1) {
      return false
    }
    return !occupiedPositions.some(pos => pos.x === x && pos.y === y)
  }

  // Get all valid directions from current position
  getValidDirections(fromX, fromY, occupiedPositions = []) {
    const directions = [
      { x: 1, y: 0, index: 0 },   // right
      { x: -1, y: 0, index: 1 },  // left
      { x: 0, y: 1, index: 2 },   // down
      { x: 0, y: -1, index: 3 }   // up
    ]

    return directions.filter(dir => {
      const newX = fromX + dir.x
      const newY = fromY + dir.y
      return this.isValidPosition(newX, newY, occupiedPositions)
    })
  }

  // Find best direction considering multiple steps ahead
  findBestDirection(headX, headY, currentDirection, trail) {
    // Get occupied positions (excluding tail which will move)
    const occupiedPositions = trail.slice(0, -1)
    
    // Try to continue in current direction first
    const currentDir = [
      { x: 1, y: 0, index: 0 },   // right
      { x: -1, y: 0, index: 1 },  // left
      { x: 0, y: 1, index: 2 },   // down
      { x: 0, y: -1, index: 3 }   // up
    ][currentDirection]

    const nextX = headX + currentDir.x
    const nextY = headY + currentDir.y

    // If current direction is still valid, use it
    if (this.isValidPosition(nextX, nextY, occupiedPositions)) {
      return { direction: currentDirection, x: nextX, y: nextY }
    }

    // Find alternative directions, prioritizing ones that lead to open space
    const validDirections = this.getValidDirections(headX, headY, occupiedPositions)
    
    if (validDirections.length === 0) {
      // Emergency: force move in any direction within bounds
      const emergencyDirections = [
        { x: 1, y: 0, index: 0 },
        { x: -1, y: 0, index: 1 },
        { x: 0, y: 1, index: 2 },
        { x: 0, y: -1, index: 3 }
      ].filter(dir => {
        const newX = headX + dir.x
        const newY = headY + dir.y
        return newX >= 1 && newX < this.width - 1 && newY >= 1 && newY < this.height - 1
      })

      if (emergencyDirections.length > 0) {
        const chosen = emergencyDirections[0]
        return { direction: chosen.index, x: headX + chosen.x, y: headY + chosen.y }
      }

      // Absolute fallback
      return { direction: currentDirection, x: headX, y: headY }
    }

    // Score each direction based on how much space it leads to
    let bestDirection = validDirections[0]
    let bestScore = 0

    for (const dir of validDirections) {
      const testX = headX + dir.x
      const testY = headY + dir.y
      
      // Count how many valid moves are possible from this position
      const futureValidMoves = this.getValidDirections(testX, testY, occupiedPositions)
      const score = futureValidMoves.length
      
      if (score > bestScore) {
        bestScore = score
        bestDirection = dir
      }
    }

    return {
      direction: bestDirection.index,
      x: headX + bestDirection.x,
      y: headY + bestDirection.y
    }
  }
}

// Import crypto icons
import algorandIcon from '../assets/algorand.svg'
import avalancheIcon from '../assets/avalanche.svg'
import bitcoinIcon from '../assets/bitcoin.svg'
import bnbIcon from '../assets/bnb.svg'
import dogecoinIcon from '../assets/dogecoin.svg'
import ethereumIcon from '../assets/ethereum.svg'
import polkadotIcon from '../assets/polkadot.svg'
import polygonIcon from '../assets/polygon.svg'
import solanaIcon from '../assets/solana.svg'
import stellarIcon from '../assets/stellar.svg'
import tetherIcon from '../assets/tether.svg'
import tronIcon from '../assets/tron.svg'
import usdcIcon from '../assets/usdc.svg'
import xrpIcon from '../assets/xrp.svg'

// Crypto icons array with romantic theme colors
const cryptoIcons = [
  { src: bitcoinIcon, name: 'Bitcoin', color: '#fbbf24', glowColor: '#f59e0b' },
  { src: ethereumIcon, name: 'Ethereum', color: '#8b5cf6', glowColor: '#7c3aed' },
  { src: bnbIcon, name: 'BNB', color: '#fcd34d', glowColor: '#f59e0b' },
  { src: solanaIcon, name: 'Solana', color: '#a855f7', glowColor: '#9333ea' },
  { src: dogecoinIcon, name: 'Dogecoin', color: '#fbbf24', glowColor: '#d97706' },
  { src: polkadotIcon, name: 'Polkadot', color: '#ec4899', glowColor: '#db2777' },
  { src: avalancheIcon, name: 'Avalanche', color: '#f87171', glowColor: '#dc2626' },
  { src: polygonIcon, name: 'Polygon', color: '#a855f7', glowColor: '#7c3aed' },
  { src: algorandIcon, name: 'Algorand', color: '#64748b', glowColor: '#475569' },
  { src: stellarIcon, name: 'Stellar', color: '#8b5cf6', glowColor: '#7c3aed' },
  { src: tronIcon, name: 'Tron', color: '#f87171', glowColor: '#dc2626' },
  { src: xrpIcon, name: 'XRP', color: '#64748b', glowColor: '#475569' },
  { src: tetherIcon, name: 'Tether', color: '#10b981', glowColor: '#059669' },
  { src: usdcIcon, name: 'USDC', color: '#3b82f6', glowColor: '#2563eb' }
]

// Directions for snake movement
const directions = [
  { x: 1, y: 0 },   // right
  { x: -1, y: 0 },  // left
  { x: 0, y: 1 },   // down
  { x: 0, y: -1 }   // up
]

// Single crypto trail component
const CryptoTrail = ({ trailId, gridSize = 80 }) => {
  const [trail, setTrail] = useState([])
  const [currentDirection, setCurrentDirection] = useState(0)
  const directionRef = useRef(0)
  const positionRef = useRef({ x: 10, y: 10 })
  const pathfinderRef = useRef(null)
  
  // Get screen dimensions in grid units with better padding
  const maxX = Math.floor(window.innerWidth / gridSize) - 3
  const maxY = Math.floor(window.innerHeight / gridSize) - 3
  
  // Initialize pathfinder
  if (!pathfinderRef.current) {
    pathfinderRef.current = new SnakePathfinder(maxX + 3, maxY + 3)
  }
  
  useEffect(() => {
    // Initialize trail with safer starting position
    const startX = Math.floor(Math.random() * (maxX - 12)) + 6
    const startY = Math.floor(Math.random() * (maxY - 12)) + 6
    positionRef.current = { x: startX, y: startY }
    
    const initialTrail = []
    for (let i = 0; i < 8; i++) {
      initialTrail.push({
        x: startX - i,
        y: startY,
        icon: cryptoIcons[Math.floor(Math.random() * cryptoIcons.length)],
        id: `${trailId}-${i}`
      })
    }
    setTrail(initialTrail)
    
    const moveTrail = () => {
      setTrail(prevTrail => {
        const newTrail = [...prevTrail]
        const head = newTrail[0]
        
        // Randomly change direction occasionally (snake-like behavior)
        if (Math.random() < 0.1) {
          // Change to perpendicular direction only
          const currentDir = directions[directionRef.current]
          let newDirections = []
          
          if (currentDir.x === 0) {
            // Currently moving vertically, can go horizontal
            newDirections = [0, 1] // left or right
          } else {
            // Currently moving horizontally, can go vertical
            newDirections = [2, 3] // up or down
          }
          
          directionRef.current = newDirections[Math.floor(Math.random() * newDirections.length)]
          setCurrentDirection(directionRef.current)
        }
        
        const direction = directions[directionRef.current]
        let newX = head.x + direction.x
        let newY = head.y + direction.y
        
        // Use pathfinder to determine next move
        const result = pathfinderRef.current.findBestDirection(
          head.x, 
          head.y, 
          directionRef.current, 
          newTrail
        )
        
        newX = result.x
        newY = result.y
        directionRef.current = result.direction
        setCurrentDirection(result.direction)
        
        positionRef.current = { x: newX, y: newY }
        
        // Add new head
        newTrail.unshift({
          x: newX,
          y: newY,
          icon: cryptoIcons[Math.floor(Math.random() * cryptoIcons.length)],
          id: `${trailId}-${Date.now()}`
        })
        
        // Remove tail (keep trail length constant)
        newTrail.pop()
        
        return newTrail
      })
    }
    
    const interval = setInterval(moveTrail, 400 + Math.random() * 200)
    return () => clearInterval(interval)
  }, [trailId, maxX, maxY])
  
  return (
    <>
      {trail.map((segment, index) => (
        <motion.div
          key={segment.id}
          className="absolute"
          style={{
            left: segment.x * gridSize,
            top: segment.y * gridSize,
            width: gridSize - 8,
            height: gridSize - 8,
            zIndex: trail.length - index
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1 - (index * 0.06),
            opacity: 0.9 - (index * 0.08)
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
        >
          <div
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{
              borderRadius: '22%',
              background: `linear-gradient(135deg, ${segment.icon.color}50, ${segment.icon.glowColor}30, ${segment.icon.color}40)`,
              border: `2px solid ${segment.icon.glowColor}90`,
              backdropFilter: 'blur(12px)',
              boxShadow: `
                0 4px 20px ${segment.icon.glowColor}40,
                0 0 ${25 - index * 2}px ${segment.icon.glowColor}50,
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `
            }}
          >
            {/* iPhone-style inner highlight */}
            <div 
              className="absolute inset-1 opacity-25"
              style={{
                borderRadius: '18%',
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)`
              }}
            />
            
            {/* Subtle texture overlay */}
            <div 
              className="absolute inset-2 opacity-15"
              style={{
                borderRadius: '15%',
                background: `radial-gradient(circle at 25% 25%, ${segment.icon.color}60, transparent 60%)`
              }}
            />
            
            <img 
              src={segment.icon.src} 
              alt={segment.icon.name}
              className="w-10 h-10 relative z-10"
              style={{
                filter: `
                  drop-shadow(0 2px 8px ${segment.icon.glowColor}60)
                  drop-shadow(0 0 12px ${segment.icon.color}40)
                  contrast(1.15) 
                  saturate(1.2)
                  brightness(1.05)
                `
              }}
            />
            
            {/* Gentle breathing glow effect */}
            <motion.div
              className="absolute inset-0 opacity-5"
              style={{
                borderRadius: '22%',
                background: `radial-gradient(circle at center, ${segment.icon.color}60, transparent 70%)`
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.05, 0.15, 0.05]
              }}
              transition={{
                duration: 3 + index * 0.2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>
        </motion.div>
      ))}
    </>
  )
}

// Main background component
const CryptoTrailBackground = () => {
  const containerRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        background: 'transparent',
        zIndex: 1
      }}
    >
      {/* Ambient background effects */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 20%, rgba(196, 181, 253, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 80%, rgba(253, 164, 175, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(134, 239, 172, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 80%, rgba(125, 211, 252, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 20%, rgba(196, 181, 253, 0.08) 0%, transparent 50%)',
          ]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(196, 181, 253, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(196, 181, 253, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      
      {/* Single crypto trail */}
      <CryptoTrail trailId="trail-1" gridSize={80} />
      
      {/* Floating ambient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #f7931a 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 50, -30, 0],
          y: [0, -40, 30, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/3 w-32 h-32 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #627eea 0%, transparent 70%)',
          filter: 'blur(25px)',
        }}
        animate={{
          scale: [1.2, 0.8, 1.2],
          opacity: [0.1, 0.25, 0.1],
          x: [0, -60, 40, 0],
          y: [0, 50, -20, 0]
        }}
        transition={{
          duration: 18,
          delay: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

export default CryptoTrailBackground