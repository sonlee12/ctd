"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowUp, BarChart3, DollarSign, TrendingUp } from "lucide-react"
import type { CoinPair } from "./crypto-terminal"

type MarketStatsProps = {
  symbol: string
  pair: CoinPair
}

type TickerData = {
  lastPrice: string
  priceChange: string
  priceChangePercent: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
}

export function MarketStats({ symbol, pair }: MarketStatsProps) {
  const [ticker, setTicker] = useState<TickerData | null>(null)

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setTicker({
        lastPrice: data.c,
        priceChange: data.p,
        priceChangePercent: data.P,
        highPrice: data.h,
        lowPrice: data.l,
        volume: data.v,
        quoteVolume: data.q,
      })
    }

    return () => ws.close()
  }, [symbol])

  const formatPrice = (price: string) => {
    const num = Number.parseFloat(price)
    if (num >= 1000) return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (num >= 1) return num.toFixed(4)
    return num.toFixed(6)
  }

  const formatVolume = (vol: string) => {
    const num = Number.parseFloat(vol)
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
    return num.toFixed(2)
  }

  const isPositive = ticker ? Number.parseFloat(ticker.priceChangePercent) >= 0 : true

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main Price */}
          <div className="flex items-baseline gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">{pair.label}</div>
              <div className="text-3xl font-bold font-mono text-foreground">
                ${ticker ? formatPrice(ticker.lastPrice) : "---"}
              </div>
            </div>
            {ticker && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                  isPositive
                    ? "bg-[var(--color-buy)]/10 text-[var(--color-buy)]"
                    : "bg-[var(--color-sell)]/10 text-[var(--color-sell)]"
                }`}
              >
                {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span className="font-mono">{Number.parseFloat(ticker.priceChangePercent).toFixed(2)}%</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <Stat
              icon={<TrendingUp className="w-4 h-4" />}
              label="24h High"
              value={ticker ? `$${formatPrice(ticker.highPrice)}` : "---"}
            />
            <Stat
              icon={<TrendingUp className="w-4 h-4 rotate-180" />}
              label="24h Low"
              value={ticker ? `$${formatPrice(ticker.lowPrice)}` : "---"}
            />
            <Stat
              icon={<BarChart3 className="w-4 h-4" />}
              label="24h Vol"
              value={ticker ? formatVolume(ticker.volume) + ` ${pair.baseAsset}` : "---"}
            />
            <Stat
              icon={<DollarSign className="w-4 h-4" />}
              label="24h Vol"
              value={ticker ? `$${formatVolume(ticker.quoteVolume)}` : "---"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  )
}
