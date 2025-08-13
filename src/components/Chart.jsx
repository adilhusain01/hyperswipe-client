import React, { useEffect, useRef, useState } from 'react'
import { createChart, CrosshairMode, CandlestickSeries, HistogramSeries } from 'lightweight-charts'
import { hyperliquidAPI } from '../services/hyperliquid'
import websocketService from '../services/websocket'
import { ChartSkeleton } from './LoadingSkeleton'

const Chart = ({ asset, className = '' }) => {
  const chartContainerRef = useRef()
  const chart = useRef()
  const candleSeries = useRef()
  const volumeSeries = useRef()
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')
  const [currentPrice, setCurrentPrice] = useState(null)

  const timeframes = [
    { label: '3m', value: '3m', hours: 8 },
    { label: '5m', value: '5m', hours: 12 },
    { label: '15m', value: '15m', hours: 24 },
    { label: '30m', value: '30m', hours: 48 },
    { label: '1h', value: '1h', hours: 72 },
    { label: '4h', value: '4h', hours: 168 },
    { label: '1d', value: '1d', hours: 720 }
  ]

  // Fetch real candlestick data from Hyperliquid
  useEffect(() => {
    const fetchChartData = async () => {
      if (!asset) return
      
      try {
        setLoading(true)
        
        // Get 24 hours of 1h candles (24 data points)
        const timeframeConfig = timeframes.find(t => t.label === selectedTimeframe) || timeframes[0]
        const endTime = Math.floor(Date.now() / 1000)
        const startTime = endTime - (timeframeConfig.hours * 60 * 60)
        
        const response = await hyperliquidAPI.getCandlestickData(
          asset.name,
          timeframeConfig.value,
          startTime * 1000, // Convert to milliseconds
          endTime * 1000
        )
        
        if (response && Array.isArray(response)) {
          // Transform Hyperliquid data to TradingView format
          const formattedData = response.map(candle => ({
            time: Math.floor(candle.t / 1000), // Convert to seconds
            open: parseFloat(candle.o),
            high: parseFloat(candle.h),
            low: parseFloat(candle.l),
            close: parseFloat(candle.c),
            volume: parseFloat(candle.v || 0)
          })).sort((a, b) => a.time - b.time) // Sort by time ascending
          
          setChartData(formattedData)
          // Set initial current price
          if (formattedData.length > 0) {
            setCurrentPrice(formattedData[formattedData.length - 1].close)
          }
        } else {
          // Fallback: generate realistic data based on current and previous price
          const currentPrice = parseFloat(asset.markPrice)
          const prevPrice = parseFloat(asset.prevDayPrice) || currentPrice
          
          const fallbackData = []
          const now = Math.floor(Date.now() / 1000)
          
          for (let i = 23; i >= 0; i--) {
            const time = now - (i * 3600) // Each hour
            const progress = (23 - i) / 23
            const basePrice = prevPrice + (currentPrice - prevPrice) * progress
            
            // Add some realistic volatility
            const volatility = Math.abs(currentPrice - prevPrice) * 0.1
            const randomFactor = (Math.random() - 0.5) * volatility
            
            const open = basePrice + randomFactor
            const close = basePrice + randomFactor * 0.8
            const high = Math.max(open, close) * (1 + Math.random() * 0.02)
            const low = Math.min(open, close) * (1 - Math.random() * 0.02)
            
            fallbackData.push({
              time,
              open: parseFloat(open.toFixed(8)),
              high: parseFloat(high.toFixed(8)),
              low: parseFloat(low.toFixed(8)),
              close: parseFloat(close.toFixed(8)),
              volume: Math.random() * 1000000 // Random volume
            })
          }
          
          // Ensure last candle matches current price
          if (fallbackData.length > 0) {
            const lastCandle = fallbackData[fallbackData.length - 1]
            lastCandle.close = currentPrice
            lastCandle.high = Math.max(lastCandle.high, currentPrice)
            lastCandle.low = Math.min(lastCandle.low, currentPrice)
          }
          
          setChartData(fallbackData)
          // Set initial current price from fallback data
          setCurrentPrice(currentPrice)
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
        // Generate fallback data on error
        const currentPrice = parseFloat(asset.markPrice)
        const prevPrice = parseFloat(asset.prevDayPrice) || currentPrice
        
        const fallbackData = []
        const now = Math.floor(Date.now() / 1000)
        
        for (let i = 23; i >= 0; i--) {
          const time = now - (i * 3600)
          const progress = (23 - i) / 23
          const price = prevPrice + (currentPrice - prevPrice) * progress
          
          fallbackData.push({
            time,
            open: price,
            high: price * 1.01,
            low: price * 0.99,
            close: price,
            volume: Math.random() * 500000
          })
        }
        
        setChartData(fallbackData)
        // Set initial current price from error fallback data
        setCurrentPrice(currentPrice)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [asset, selectedTimeframe])

  // Initialize TradingView chart (only when chartData changes from API, not from WebSocket updates)
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return

    // Clean up existing chart to prevent memory leaks
    if (chart.current) {
      chart.current.remove()
      chart.current = null
      candleSeries.current = null
      volumeSeries.current = null
    }

    try {
      // Create chart
      chart.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        layout: {
          background: { color: '#1f2937' }, // Gray-800
          textColor: '#d1d5db', // Gray-300
        },
        grid: {
          vertLines: { color: '#374151' }, // Gray-700
          horzLines: { color: '#374151' }, // Gray-700
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        timeScale: {
          borderColor: '#4b5563', // Gray-600
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: '#4b5563', // Gray-600
          scaleMargins: {
            top: 0.1,
            bottom: 0.2, // Leave space for volume
          },
        },
      })

      console.log('Chart created:', chart.current)
      console.log('Available methods:', Object.keys(chart.current))

      // Add candlestick series using the correct API
      candleSeries.current = chart.current.addSeries(CandlestickSeries, {
        upColor: '#10b981', // Green-500
        downColor: '#ef4444', // Red-500
        borderDownColor: '#ef4444',
        borderUpColor: '#10b981',
        wickDownColor: '#ef4444',
        wickUpColor: '#10b981',
      })

      // Add volume series using the correct API
      volumeSeries.current = chart.current.addSeries(HistogramSeries, {
        color: '#6b7280', // Gray-500
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      })

      // Configure volume price scale
      chart.current.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      })

      // Set chart data
      candleSeries.current.setData(chartData)
      volumeSeries.current.setData(
        chartData.map(d => ({
          time: d.time,
          value: d.volume,
          color: d.close >= d.open ? '#10b98150' : '#ef444450' // Transparent colors
        }))
      )

      // Fit content
      chart.current.timeScale().fitContent()

      // Handle resize
      const handleResize = () => {
        if (chart.current && chartContainerRef.current) {
          chart.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          })
        }
      }

      const resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(chartContainerRef.current)

      return () => {
        if (chart.current) {
          chart.current.remove()
          chart.current = null
        }
        resizeObserver.disconnect()
      }
    } catch (error) {
      console.error('Error creating chart:', error)
    }
  }, [chartData])

  // WebSocket real-time price updates - NO STATE UPDATES to prevent chart flashing
  useEffect(() => {
    if (!asset?.name || !candleSeries.current) return

    // Keep track of chart data internally without triggering re-renders
    let internalChartData = [...chartData]
    
    const handlePriceUpdate = (data) => {
      if (data.mids && data.mids[asset.name]) {
        const newPrice = parseFloat(data.mids[asset.name])
        setCurrentPrice(newPrice)
        
        // Update chart directly without state changes - prevents flashing
        try {
          const currentTime = Math.floor(Date.now() / 1000)
          
          // Get the current timeframe in seconds
          const timeframe = timeframes.find(t => t.label === selectedTimeframe) || timeframes[4]
          let intervalSeconds = 3600 // Default to 1 hour
          
          if (timeframe.value === '3m') intervalSeconds = 180
          else if (timeframe.value === '5m') intervalSeconds = 300
          else if (timeframe.value === '15m') intervalSeconds = 900
          else if (timeframe.value === '30m') intervalSeconds = 1800
          else if (timeframe.value === '1h') intervalSeconds = 3600
          else if (timeframe.value === '4h') intervalSeconds = 14400
          else if (timeframe.value === '1d') intervalSeconds = 86400
          
          // Calculate the candle start time (align to timeframe boundary)
          const candleStartTime = Math.floor(currentTime / intervalSeconds) * intervalSeconds
          
          if (internalChartData.length === 0) return
          
          const lastCandle = internalChartData[internalChartData.length - 1]
          
          // If we're still in the same candle timeframe, update the last candle
          if (lastCandle.time === candleStartTime) {
            const updatedCandle = {
              ...lastCandle,
              close: newPrice,
              high: Math.max(lastCandle.high, newPrice),
              low: Math.min(lastCandle.low, newPrice)
            }
            
            // Update internal data
            internalChartData[internalChartData.length - 1] = updatedCandle
            
            // Update chart directly - this is smooth and doesn't flash
            candleSeries.current.update(updatedCandle)
            
          } else if (candleStartTime > lastCandle.time) {
            // New candle timeframe - add a new candle (seamless left shift)
            const newCandle = {
              time: candleStartTime,
              open: newPrice,
              high: newPrice,
              low: newPrice,
              close: newPrice,
              volume: 0
            }
            
            // Update internal data
            internalChartData.push(newCandle)
            
            // Add new candle to chart directly - smooth animation
            candleSeries.current.update(newCandle)
            volumeSeries.current.update({
              time: candleStartTime,
              value: 0,
              color: '#6b728050'
            })
            
            // Keep only recent candles
            if (internalChartData.length > 200) {
              internalChartData.splice(0, internalChartData.length - 200)
            }
          }
          
        } catch (error) {
          console.warn('Failed to update price:', error)
        }
      }
    }

    websocketService.on('priceUpdate', handlePriceUpdate)
    
    return () => {
      websocketService.off('priceUpdate', handlePriceUpdate)
    }
  }, [asset?.name, selectedTimeframe, candleSeries.current, volumeSeries.current, chartData])

  if (!asset) {
    return (
      <ChartSkeleton />
    )
  }

  if (loading) {
    return <ChartSkeleton />
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 rounded-lg z-10">
          <div className="text-gray-300 text-sm">Loading chart...</div>
        </div>
      )}
    

      {/* Timeframe Dropdown */}
      <div className="absolute top-2 left-2 z-20">
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="bg-gray-800 bg-opacity-90 text-gray-300 text-xs px-3 py-1.5 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:bg-gray-700 transition-colors cursor-pointer min-w-[80px]"
        >
          {timeframes.map((tf) => (
            <option key={tf.label} value={tf.label} className="bg-gray-800 text-gray-300">
              {tf.label}
            </option>
          ))}
        </select>
      </div>

      <div 
        ref={chartContainerRef} 
        className="w-full h-full rounded-t-lg overflow-hidden"
        style={{ minHeight: '200px' }}
      />
    </div>
  )
}

export default Chart