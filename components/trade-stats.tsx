"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react"
import type { Trade } from "./crypto-terminal"

type TradeStatsProps = {
  trades: Trade[]
}

export function TradeStats({ trades }: TradeStatsProps) {
  const stats = useMemo(() => {
    if (trades.length === 0) return null

    const buyTrades = trades.filter((t) => !t.isBuyerMaker)
    const sellTrades = trades.filter((t) => t.isBuyerMaker)

    const buyVolume = buyTrades.reduce((sum, t) => sum + Number.parseFloat(t.price) * Number.parseFloat(t.quantity), 0)
    const sellVolume = sellTrades.reduce(
      (sum, t) => sum + Number.parseFloat(t.price) * Number.parseFloat(t.quantity),
      0,
    )
    const totalVolume = buyVolume + sellVolume

    const largestTrade = trades.reduce(
      (max, t) => {
        const val = Number.parseFloat(t.price) * Number.parseFloat(t.quantity)
        return val > max.value ? { trade: t, value: val } : max
      },
      { trade: trades[0], value: 0 },
    )

    const avgTradeSize = totalVolume / trades.length

    return {
      buyCount: buyTrades.length,
      sellCount: sellTrades.length,
      buyVolume,
      sellVolume,
      totalVolume,
      buyPercent: totalVolume > 0 ? (buyVolume / totalVolume) * 100 : 50,
      largestTrade,
      avgTradeSize,
      tradesPerMin: trades.length,
    }
  }, [trades])

  if (!stats) return null

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-3">
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-[var(--color-buy)]">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-medium">Buys</span>
            </div>
            <div className="text-lg font-bold text-[var(--color-buy)]">{stats.buyCount}</div>
            <div className="text-[10px] text-muted-foreground">${(stats.buyVolume / 1000).toFixed(1)}K</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-[var(--color-sell)]">
              <TrendingDown className="w-3 h-3" />
              <span className="text-xs font-medium">Sells</span>
            </div>
            <div className="text-lg font-bold text-[var(--color-sell)]">{stats.sellCount}</div>
            <div className="text-[10px] text-muted-foreground">${(stats.sellVolume / 1000).toFixed(1)}K</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-primary">
              <Activity className="w-3 h-3" />
              <span className="text-xs font-medium">Flow</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-buy)] transition-all duration-500"
                style={{ width: `${stats.buyPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground">{stats.buyPercent.toFixed(0)}% Buy</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-yellow-400">
              <DollarSign className="w-3 h-3" />
              <span className="text-xs font-medium">Avg</span>
            </div>
            <div className="text-lg font-bold text-yellow-400">
              $
              {stats.avgTradeSize >= 1000
                ? (stats.avgTradeSize / 1000).toFixed(1) + "K"
                : stats.avgTradeSize.toFixed(0)}
            </div>
            <div className="text-[10px] text-muted-foreground">per trade</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
