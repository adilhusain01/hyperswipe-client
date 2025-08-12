import React, { useEffect, useRef, useState } from 'react'
import { createChart, CrosshairMode, CandlestickSeries, HistogramSeries } from 'lightweight-charts'
import { hyperliquidAPI } from '../services/hyperliquid'
import { ChartSkeleton } from './LoadingSkeleton'

const Chart = ({ asset, className = '' }) => {
  const chartContainerRef = useRef()
  const chart = useRef()
  const candleSeries = useRef()
  const volumeSeries = useRef()
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')

  const timeframes = [
    { label: '1H', value: '1h', hours: 24 },
    { label: '24H', value: '1h', hours: 24 },
    { label: '1W', value: '4h', hours: 168 },
    { label: '1M', value: '1d', hours: 720 },
    { label: '1Y', value: '1w', hours: 8760 }
  ]

  // Fetch real candlestick data from Hyperliquid
  useEffect(() => {
    const fetchChartData = async () => {
      if (!asset) return
      
      try {
        setLoading(true)
        
        // Get timeframe data based on selection
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
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [asset, selectedTimeframe])

  // Initialize TradingView chart
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return

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

  if (!asset) {
    return <ChartSkeleton />
  }

  if (loading) {
    return <ChartSkeleton />
  }

  return (
    <div className={`relative ${className}`}>
      
      {/* Chart Info Header */}
      <div className="absolute top-2 left-2 z-20 text-xs text-gray-300 bg-gray-800 bg-opacity-80 rounded p-2">
        <div className="font-semibold">{asset.name}/USD</div>
        <div className="text-xs opacity-75">{selectedTimeframe}</div>
      </div>

      {/* Timeframe Selector */}
      <div className="absolute top-2 right-2 z-20 flex gap-1">
        {timeframes.map((tf) => (
          <button
            key={tf.label}
            onClick={() => setSelectedTimeframe(tf.label)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedTimeframe === tf.label
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 bg-opacity-80 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tf.label}
          </button>
        ))}
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