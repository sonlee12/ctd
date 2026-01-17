"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"
import Image from "next/image"
import type { Trade, CoinPair, Exchange } from "./crypto-terminal"

type LiveOrdersPanelProps = {
  trades: Trade[]
  pair: CoinPair
  exchanges: Exchange[]
  height: number
}

export function LiveOrdersPanel({ trades, pair, exchanges, height }: LiveOrdersPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [displayTrades, setDisplayTrades] = useState<Trade[]>([])
  const pendingTradesRef = useRef<Trade[]>([])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    pendingTradesRef.current = trades

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        setDisplayTrades(pendingTradesRef.current.slice(0, 100))
        rafRef.current = null
      })
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [trades])

  const formatPrice = (price: string) => {
    const num = Number.parseFloat(price)
    if (num >= 1000) return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (num >= 1) return num.toFixed(4)
    return num.toFixed(6)
  }

  const formatQuantity = (qty: string) => {
    const num = Number.parseFloat(qty)
    if (num >= 1000) return num.toLocaleString(undefined, { maximumFractionDigits: 2 })
    if (num >= 1) return num.toFixed(4)
    return num.toFixed(6)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getTradeValue = (trade: Trade) => {
    return Number.parseFloat(trade.price) * Number.parseFloat(trade.quantity)
  }

  const getExchangeInfo = (exchangeId: string) => {
    return exchanges.find((e) => e.id === exchangeId)
  }

  const stats = useMemo(() => {
    if (displayTrades.length === 0) return null
    const buyCount = displayTrades.filter((t) => !t.isBuyerMaker).length
    const sellCount = displayTrades.length - buyCount
    const totalVolume = displayTrades.reduce((sum, t) => sum + getTradeValue(t), 0)
    return { buyCount, sellCount, totalVolume, buyPercent: Math.round((buyCount / displayTrades.length) * 100) }
  }, [displayTrades])

  const scrollHeight = height - 120

  return (
    <Card className="bg-card border-border overflow-hidden" style={{ height: `${height}px` }}>
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-primary" />
            <span>Combined Tape</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {displayTrades.length}
            </Badge>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {pair.label}
          </Badge>
        </CardTitle>
        {stats && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-buy)] transition-all duration-500 ease-out"
                style={{ width: `${stats.buyPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-[var(--color-buy)]">{stats.buyPercent}%</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex px-3 py-1.5 text-[10px] text-muted-foreground border-b border-border font-mono bg-secondary/30 gap-2">
          <span className="w-12 shrink-0">Src</span>
          <span className="w-20 shrink-0">Price</span>
          <span className="w-16 shrink-0 text-right">Amount</span>
          <span className="w-14 shrink-0 text-right">Value</span>
          <span className="w-12 shrink-0 text-right">Time</span>
        </div>

        <div
          ref={scrollRef}
          className="overflow-y-auto overflow-x-hidden custom-scrollbar"
          style={{
            height: `${scrollHeight}px`,
            contain: "strict",
            contentVisibility: "auto",
          }}
        >
          <div className="will-change-transform" style={{ transform: "translateZ(0)" }}>
            {displayTrades.map((trade, index) => {
              const isBuy = !trade.isBuyerMaker
              const value = getTradeValue(trade)
              const isWhale = value > 50000
              const isLarge = value > 10000
              const isMedium = value > 1000
              const exchange = getExchangeInfo(trade.exchange)

              return (
                <div
                  key={trade.id}
                  className={`
                    flex items-center px-3 py-1 text-[11px] font-mono gap-2
                    border-b border-border/20
                    ${index === 0 ? "tape-new-item" : ""}
                    ${
                      isWhale
                        ? "bg-purple-500/15 border-l-2 border-l-purple-500"
                        : isLarge
                          ? "bg-yellow-500/10 border-l-2 border-l-yellow-500/50"
                          : isMedium
                            ? "bg-secondary/20"
                            : "hover:bg-secondary/20"
                    }
                  `}
                >
                  {/* Exchange - fixed width */}
                  <div className="w-12 shrink-0 flex items-center gap-1 overflow-hidden">
                    {exchange && (
                      <>
                        <Image
                          src={exchange.logo || "/placeholder.svg"}
                          alt={exchange.name}
                          width={12}
                          height={12}
                          className="rounded-sm shrink-0"
                        />
                        <span className="text-muted-foreground text-[9px] uppercase">
                          {exchange.id.replace(/-futures|-perp|-swap/g, "").slice(0, 3)}
                        </span>
                        {trade.marketType === "futures" && (
                          <span className="text-yellow-400 text-[8px] font-bold">P</span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Price - fixed width */}
                  <div className="w-20 shrink-0 flex items-center gap-1.5 overflow-hidden">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isBuy
                          ? "bg-[var(--color-buy)] shadow-[0_0_4px_var(--color-buy)]"
                          : "bg-[var(--color-sell)] shadow-[0_0_4px_var(--color-sell)]"
                      }`}
                    />
                    <span className={`${isBuy ? "text-[var(--color-buy)]" : "text-[var(--color-sell)]"} tabular-nums`}>
                      {formatPrice(trade.price)}
                    </span>
                  </div>

                  {/* Amount - fixed width */}
                  <span className="w-16 shrink-0 text-right text-foreground/70 tabular-nums overflow-hidden text-ellipsis">
                    {formatQuantity(trade.quantity)}
                  </span>

                  {/* Value - fixed width */}
                  <span
                    className={`w-14 shrink-0 text-right tabular-nums ${
                      isWhale
                        ? "text-purple-400 font-bold"
                        : isLarge
                          ? "text-yellow-400 font-semibold"
                          : isMedium
                            ? "text-orange-400"
                            : "text-muted-foreground"
                    }`}
                  >
                    ${value >= 1000 ? (value / 1000).toFixed(1) + "K" : value.toFixed(0)}
                  </span>

                  {/* Time - fixed width */}
                  <span className="w-12 shrink-0 text-right text-muted-foreground/60 tabular-nums">
                    {formatTime(trade.time).slice(3)}
                  </span>
                </div>
              )
            })}
            {displayTrades.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span>Waiting for trades...</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
