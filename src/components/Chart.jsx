import React, { useEffect, useRef, useState } from 'react'
import { createChart, CrosshairMode, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts'
import { hyperliquidAPI } from '../services/hyperliquid'
import websocketService from '../services/websocket'
import { ChartSkeleton } from './LoadingSkeleton'

const Chart = ({ asset, className = '' }) => {
  const chartContainerRef = useRef()
  const chart = useRef()
  const candleSeries = useRef()
  const volumeSeries = useRef()
  const priceLineSeries = useRef()
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [currentPrice, setCurrentPrice] = useState(null)
  const [isPriceUpdating, setIsPriceUpdating] = useState(false)
  const [prevAssetName, setPrevAssetName] = useState(null) // Track asset changes
  const [isFirstRender, setIsFirstRender] = useState(true) // Track first render
  const [isChartReady, setIsChartReady] = useState(false) // Track when chart is ready with data

  const timeframes = [
    { label: '1m', value: '1m', hours: 4, displayName: '1 Minute' },
    { label: '3m', value: '3m', hours: 8, displayName: '3 Minutes' },
    { label: '5m', value: '5m', hours: 12, displayName: '5 Minutes' },
    { label: '15m', value: '15m', hours: 24, displayName: '15 Minutes' },
    { label: '30m', value: '30m', hours: 48, displayName: '30 Minutes' },
    { label: '1h', value: '1h', hours: 72, displayName: '1 Hour' },
    { label: '4h', value: '4h', hours: 168, displayName: '4 Hours' },
    { label: '1d', value: '1d', hours: 720, displayName: '1 Day' },
    { label: '1w', value: '1w', hours: 2160, displayName: '1 Week' }
  ]

  // Fetch real candlestick data from Hyperliquid
  useEffect(() => {
    const fetchChartData = async () => {
      if (!asset) return
      
      // Initialize prevAssetName on first load
      if (!prevAssetName) {
        setPrevAssetName(asset.name)
      }
      
      try {
        setLoading(true)
        
        // Get timeframe data based on selection
        const timeframeConfig = timeframes.find(t => t.label === selectedTimeframe) || timeframes[5] // Default to 1h
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

  // Real-time price updates for current price line
  useEffect(() => {
    if (!asset) return

    const handlePriceUpdate = (data) => {
      if (data.mids && data.mids[asset.name]) {
        const newPrice = parseFloat(data.mids[asset.name])
        setCurrentPrice(newPrice)
        
        // Show update indicator
        setIsPriceUpdating(true)
        setTimeout(() => setIsPriceUpdating(false), 800)
        
        // Update price line smoothly - like a real trading platform
        if (priceLineSeries.current && chart.current) {
          const currentTime = Math.floor(Date.now() / 1000)
          
          // Add new price point to create smooth movement
          priceLineSeries.current.update({
            time: currentTime,
            value: newPrice
          })
          
          // Optional: Update the last candle's close price for ultra-real-time feel
          // This creates the "live candle" effect seen in professional platforms
          if (candleSeries.current && chartData.length > 0) {
            const lastCandle = chartData[chartData.length - 1]
            const updatedCandle = {
              ...lastCandle,
              close: newPrice,
              high: Math.max(lastCandle.high, newPrice),
              low: Math.min(lastCandle.low, newPrice),
              time: lastCandle.time
            }
            
            // Update the last candle to show live price movement
            candleSeries.current.update(updatedCandle)
          }
        }
      }
    }

    websocketService.on('priceUpdate', handlePriceUpdate)
    
    return () => {
      websocketService.off('priceUpdate', handlePriceUpdate)
    }
  }, [asset])

  // Zoom functionality
  const handleZoomIn = () => {
    if (chart.current && zoomLevel < 3) {
      const newZoomLevel = zoomLevel + 0.5
      setZoomLevel(newZoomLevel)
      chart.current.timeScale().setVisibleRange({
        from: chartData[Math.floor(chartData.length * (1 - 1/newZoomLevel))]?.time || chartData[0]?.time,
        to: chartData[chartData.length - 1]?.time
      })
    }
  }

  const handleZoomOut = () => {
    if (chart.current && zoomLevel > 0.5) {
      const newZoomLevel = zoomLevel - 0.5
      setZoomLevel(newZoomLevel)
      if (newZoomLevel === 1) {
        chart.current.timeScale().fitContent()
      } else {
        chart.current.timeScale().setVisibleRange({
          from: chartData[Math.floor(chartData.length * (1 - 1/newZoomLevel))]?.time || chartData[0]?.time,
          to: chartData[chartData.length - 1]?.time
        })
      }
    }
  }

  const resetZoom = () => {
    if (chart.current) {
      setZoomLevel(1)
      chart.current.timeScale().fitContent()
    }
  }

  // Initialize TradingView chart ONCE when container is ready
  useEffect(() => {
    console.log('📊 Chart creation effect triggered:', {
      hasContainer: !!chartContainerRef.current,
      hasExistingChart: !!chart.current
    })
    
    if (!chartContainerRef.current || chart.current) return

    // Small delay to ensure container is properly sized
    const timeoutId = setTimeout(() => {
      if (!chartContainerRef.current || chart.current) return
      
      console.log('📊 Chart: Initializing chart container')
      
        try {
          // Create chart only once
          const containerWidth = chartContainerRef.current.clientWidth
          const containerHeight = chartContainerRef.current.clientHeight
          
          console.log('📊 Chart: Container dimensions:', { containerWidth, containerHeight })
          
          chart.current = createChart(chartContainerRef.current, {
            width: containerWidth,
            height: containerHeight,
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

          // Add real-time price line series
          priceLineSeries.current = chart.current.addSeries(LineSeries, {
            color: '#9333ea', // Purple-600
            lineWidth: 2,
            priceLineVisible: true,
            lastValueVisible: true,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 4,
            crosshairMarkerBorderColor: '#9333ea',
            crosshairMarkerBackgroundColor: '#9333ea',
          })

          // Configure volume price scale
          chart.current.priceScale('volume').applyOptions({
            scaleMargins: {
              top: 0.8,
              bottom: 0,
            },
          })

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
          
          console.log('📊 Chart: Successfully created chart instance')

          return () => {
            console.log('📊 Chart: Cleaning up chart')
            if (chart.current) {
              chart.current.remove()
              chart.current = null
            }
            resizeObserver.disconnect()
          }
      } catch (error) {
        console.error('Error creating chart:', error)
      }
    }, 100) // 100ms delay
    
    return () => {
      clearTimeout(timeoutId)
    }
  }, []) // Create chart only once when component mounts

  // Separate effect for updating chart data smoothly
  useEffect(() => {
    if (!chart.current || !candleSeries.current || !volumeSeries.current || chartData.length === 0) {
      console.log('📊 Chart data update skipped:', {
        chart: !!chart.current,
        candleSeries: !!candleSeries.current,
        volumeSeries: !!volumeSeries.current,
        dataLength: chartData.length
      })
      return
    }

    const currentAssetName = asset?.name
    const isAssetChanged = currentAssetName && prevAssetName && prevAssetName !== currentAssetName
    const isInitialLoad = isFirstRender && currentAssetName
    
    console.log('📊 Chart: Updating data', {
      asset: currentAssetName,
      prevAsset: prevAssetName,
      isAssetChanged,
      isInitialLoad,
      dataLength: chartData.length
    })

    // Update chart data smoothly without triggering zoom changes
    candleSeries.current.setData(chartData)
    volumeSeries.current.setData(
      chartData.map(d => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? '#10b98150' : '#ef444450'
      }))
    )

    // Initialize real-time price line with last candle price
    if (asset && priceLineSeries.current) {
      const lastCandle = chartData[chartData.length - 1]
      const initialPrice = parseFloat(asset.markPrice) || lastCandle.close
      priceLineSeries.current.setData([
        { time: lastCandle.time, value: initialPrice },
        { time: Math.floor(Date.now() / 1000), value: initialPrice }
      ])
      setCurrentPrice(initialPrice)
    }

    // Only reset zoom on actual asset change OR initial load
    if (isAssetChanged || isInitialLoad) {
      setZoomLevel(1)
      chart.current.timeScale().fitContent()
      setPrevAssetName(currentAssetName)
      setIsFirstRender(false)
      console.log(`📊 Chart: ${isInitialLoad ? 'Initial load' : 'Asset changed'} - zoom reset for ${currentAssetName}`)
    } else if (currentAssetName && !prevAssetName) {
      // First time setting asset name but not first render (edge case)
      setPrevAssetName(currentAssetName)
    }
    
    // Mark chart as ready when data is loaded
    if (!isChartReady) {
      setIsChartReady(true)
      console.log('📊 Chart: Ready with data')
    }
    
    // During live updates, do NOTHING to zoom - let it preserve naturally
  }, [chartData, asset, prevAssetName, isFirstRender, isChartReady])

  console.log('📊 Chart render check:', {
    asset: asset?.name,
    loading,
    isChartReady,
    chartData: chartData.length,
    chartExists: !!chart.current
  })

  if (!asset) {
    console.log('📊 Chart: No asset - showing skeleton')
    return <ChartSkeleton />
  }

  if (loading || !isChartReady) {
    console.log('📊 Chart: Loading or not ready - showing skeleton')
    return <ChartSkeleton />
  }

  return (
    <div className={`relative ${className}`}>
      

      {/* Left Side Controls */}
      <div className="absolute top-2 left-2 z-20 flex flex-col gap-2">
        
        {/* Timeframe Dropdown */}
        <div className="flex justify-start">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-gray-800 bg-opacity-90 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            {timeframes.map((tf) => (
              <option key={tf.label} value={tf.label} className="bg-gray-800 text-gray-300">
                {tf.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Zoom Controls */}
        <div className="flex gap-1 justify-start">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            className="bg-gray-800 bg-opacity-90 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed w-6 h-6 rounded border border-gray-600 hover:bg-gray-700 transition-colors flex items-center justify-center text-xs font-bold"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={resetZoom}
            className="bg-gray-800 bg-opacity-90 text-gray-300 hover:text-white px-2 py-1 rounded border border-gray-600 hover:bg-gray-700 transition-colors text-xs font-medium"
            title="Reset Zoom"
          >
            Fit
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="bg-gray-800 bg-opacity-90 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed w-6 h-6 rounded border border-gray-600 hover:bg-gray-700 transition-colors flex items-center justify-center text-xs font-bold"
            title="Zoom In"
          >
            +
          </button>
        </div>
      </div>

      {/* Chart Info Header */}
      <div className="absolute top-2 right-2 z-20 text-xs text-gray-300 bg-gray-800 bg-opacity-90 rounded p-2 text-right border border-gray-600">
        <div className="flex items-center gap-2 justify-end">
          <div className="font-semibold">{asset.name}/USD</div>
          {isPriceUpdating && (
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" title="Live price updates" />
          )}
        </div>
        <div className="text-xs opacity-75">{timeframes.find(t => t.label === selectedTimeframe)?.displayName || selectedTimeframe}</div>
        {currentPrice && (
          <div className="text-xs text-purple-400 font-medium mt-1">
            Live: ${currentPrice.toFixed(currentPrice >= 1000 ? 2 : currentPrice >= 1 ? 4 : 6)}
          </div>
        )}
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