"use client"

import { useEffect, useRef, memo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

type TradingViewChartProps = {
  symbol: string
  height: number
}

function TradingViewChartComponent({ symbol, height }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous chart
    containerRef.current.innerHTML = ""

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${symbol}`,
      interval: "5",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(18, 18, 26, 1)",
      gridColor: "rgba(42, 42, 58, 0.5)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      studies: ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [symbol])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Calculate actual height (subtract header height)
  const chartHeight = height - 48

  return (
    <Card className={cn("bg-card border-border transition-all duration-300", isFullscreen && "fixed inset-4 z-50")}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span>Price Chart</span>
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <div
          ref={containerRef}
          className="tradingview-widget-container w-full"
          style={{ height: isFullscreen ? "calc(100vh - 120px)" : `${chartHeight}px` }}
        />
      </CardContent>
    </Card>
  )
}

export const TradingViewChart = memo(TradingViewChartComponent)
