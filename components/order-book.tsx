"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Layers } from "lucide-react"
import Image from "next/image"

type OrderBookProps = {
  symbol: string
  selectedExchanges: string[]
  height?: number
}

type OrderLevel = {
  price: number
  quantity: number
  total: number
  exchanges: { id: string; quantity: number }[]
}

type ExchangeOrderBook = {
  exchange: string
  bids: [string, string][]
  asks: [string, string][]
}

type MarketType = "combined" | "spot" | "futures"

const EXCHANGE_CONFIG: Record<
  string,
  {
    name: string
    logo: string
    type: "spot" | "futures"
    getWsUrl: (symbol: string) => string | null
    getSubscribeMsg?: (symbol: string) => object
    parseOrderBook: (data: any) => { bids: [string, string][]; asks: [string, string][] } | null
    handleMessage?: (ws: WebSocket, data: any) => void
  }
> = {
  binance: {
    name: "Binance",
    logo: "/exchanges/binance.svg",
    type: "spot",
    getWsUrl: (symbol) => `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth10@100ms`,
    parseOrderBook: (data) => {
      if (!data.bids || !data.asks) return null
      return { bids: data.bids, asks: data.asks }
    },
  },
  "binance-futures": {
    name: "Binance Futures",
    logo: "/exchanges/binance.svg",
    type: "futures",
    getWsUrl: (symbol) => `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@depth10@100ms`,
    parseOrderBook: (data) => {
      if (!data.b || !data.a) return null
      return { bids: data.b, asks: data.a }
    },
  },
  bybit: {
    name: "Bybit",
    logo: "/exchanges/bybit.svg",
    type: "spot",
    getWsUrl: () => "wss://stream.bybit.com/v5/public/spot",
    getSubscribeMsg: (symbol) => ({
      op: "subscribe",
      args: [`orderbook.50.${symbol}`],
    }),
    parseOrderBook: (data) => {
      if (!data.data?.b || !data.data?.a) return null
      return {
        bids: data.data.b.map((b: string[]) => [b[0], b[1]]),
        asks: data.data.a.map((a: string[]) => [a[0], a[1]]),
      }
    },
  },
  "bybit-perp": {
    name: "Bybit Perp",
    logo: "/exchanges/bybit.svg",
    type: "futures",
    getWsUrl: () => "wss://stream.bybit.com/v5/public/linear",
    getSubscribeMsg: (symbol) => ({
      op: "subscribe",
      args: [`orderbook.50.${symbol}`],
    }),
    parseOrderBook: (data) => {
      if (!data.data?.b || !data.data?.a) return null
      return {
        bids: data.data.b.map((b: string[]) => [b[0], b[1]]),
        asks: data.data.a.map((a: string[]) => [a[0], a[1]]),
      }
    },
  },
  okx: {
    name: "OKX",
    logo: "/exchanges/okx.svg",
    type: "spot",
    getWsUrl: () => "wss://ws.okx.com:8443/ws/v5/public",
    getSubscribeMsg: (symbol) => {
      const baseAsset = symbol.replace(/USDT|USDC/i, "")
      const quoteAsset = symbol.includes("USDC") ? "USDC" : "USDT"
      return {
        op: "subscribe",
        args: [{ channel: "books5", instId: `${baseAsset}-${quoteAsset}` }],
      }
    },
    parseOrderBook: (data) => {
      if (!data.data?.[0]?.bids || !data.data?.[0]?.asks) return null
      return { bids: data.data[0].bids, asks: data.data[0].asks }
    },
  },
  "okx-swap": {
    name: "OKX Swap",
    logo: "/exchanges/okx.svg",
    type: "futures",
    getWsUrl: () => "wss://ws.okx.com:8443/ws/v5/public",
    getSubscribeMsg: (symbol) => {
      const baseAsset = symbol.replace(/USDT|USDC/i, "")
      const quoteAsset = symbol.includes("USDC") ? "USDC" : "USDT"
      return {
        op: "subscribe",
        args: [{ channel: "books5", instId: `${baseAsset}-${quoteAsset}-SWAP` }],
      }
    },
    parseOrderBook: (data) => {
      if (!data.data?.[0]?.bids || !data.data?.[0]?.asks) return null
      return { bids: data.data[0].bids, asks: data.data[0].asks }
    },
  },
  kraken: {
    name: "Kraken",
    logo: "/exchanges/kraken.svg",
    type: "spot",
    getWsUrl: () => "wss://ws.kraken.com",
    getSubscribeMsg: (symbol) => {
      const baseAsset = symbol.replace(/USDT|USDC/i, "")
      const quoteAsset = symbol.includes("USDC") ? "USDC" : "USDT"
      return {
        event: "subscribe",
        pair: [`${baseAsset}/${quoteAsset}`],
        subscription: { name: "book", depth: 10 },
      }
    },
    parseOrderBook: (data) => {
      if (!Array.isArray(data) || data.length < 2) return null
      const bookData = data[1]
      if (bookData.as && bookData.bs) {
        return {
          bids: bookData.bs.map((b: any) => [b[0], b[1]]),
          asks: bookData.as.map((a: any) => [a[0], a[1]]),
        }
      }
      return null
    },
  },
  coinbase: {
    name: "Coinbase",
    logo: "/exchanges/coinbase.svg",
    type: "spot",
    getWsUrl: () => "wss://ws-feed.exchange.coinbase.com",
    getSubscribeMsg: (symbol) => {
      const baseAsset = symbol.replace(/USDT|USDC/i, "")
      const quoteAsset = symbol.includes("USDC") ? "USDC" : "USDT"
      return {
        type: "subscribe",
        product_ids: [`${baseAsset}-${quoteAsset}`],
        channels: ["level2_batch"],
      }
    },
    parseOrderBook: (data) => {
      if (data.type === "snapshot") {
        return {
          bids: data.bids.slice(0, 10),
          asks: data.asks.slice(0, 10),
        }
      }
      return null
    },
  },
}

export function OrderBook({ symbol, selectedExchanges, height = 500 }: OrderBookProps) {
  const [orderBooks, setOrderBooks] = useState<Map<string, ExchangeOrderBook>>(new Map())
  const [marketType, setMarketType] = useState<MarketType>("combined")
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({})

  // Filter exchanges based on market type
  const filteredExchanges = useMemo(() => {
    return selectedExchanges.filter((ex) => {
      const config = EXCHANGE_CONFIG[ex]
      if (!config) return false
      if (marketType === "combined") return true
      return config.type === marketType
    })
  }, [selectedExchanges, marketType])

  useEffect(() => {
    const wsConnections = new Map<string, WebSocket>()

    filteredExchanges.forEach((exchangeId) => {
      const config = EXCHANGE_CONFIG[exchangeId]
      if (!config) return

      const wsUrl = config.getWsUrl(symbol)
      if (!wsUrl) return

      try {
        const ws = new WebSocket(wsUrl)
        wsConnections.set(exchangeId, ws)

        ws.onopen = () => {
          setConnectionStatus((prev) => ({ ...prev, [exchangeId]: true }))
          if (config.getSubscribeMsg) {
            ws.send(JSON.stringify(config.getSubscribeMsg(symbol)))
          }
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (config.handleMessage) {
              config.handleMessage(ws, data)
            }
            const parsed = config.parseOrderBook(data)
            if (parsed) {
              setOrderBooks((prev) => {
                const next = new Map(prev)
                next.set(exchangeId, {
                  exchange: exchangeId,
                  bids: parsed.bids,
                  asks: parsed.asks,
                })
                return next
              })
            }
          } catch {
            // Ignore parse errors
          }
        }

        ws.onerror = () => {
          setConnectionStatus((prev) => ({ ...prev, [exchangeId]: false }))
        }

        ws.onclose = () => {
          setConnectionStatus((prev) => ({ ...prev, [exchangeId]: false }))
        }
      } catch {
        setConnectionStatus((prev) => ({ ...prev, [exchangeId]: false }))
      }
    })

    return () => {
      wsConnections.forEach((ws) => ws.close())
    }
  }, [symbol, filteredExchanges])

  // Aggregate order books from all exchanges
  const aggregatedBook = useMemo(() => {
    const bidMap = new Map<number, OrderLevel>()
    const askMap = new Map<number, OrderLevel>()

    orderBooks.forEach((book, exchangeId) => {
      const config = EXCHANGE_CONFIG[exchangeId]
      if (!config) return

      // Process bids
      book.bids.forEach(([price, qty]) => {
        const priceNum = Number.parseFloat(price)
        const qtyNum = Number.parseFloat(qty)
        // Round price to avoid floating point issues
        const roundedPrice = Math.round(priceNum * 100) / 100

        const existing = bidMap.get(roundedPrice)
        if (existing) {
          existing.quantity += qtyNum
          existing.total += priceNum * qtyNum
          existing.exchanges.push({ id: exchangeId, quantity: qtyNum })
        } else {
          bidMap.set(roundedPrice, {
            price: priceNum,
            quantity: qtyNum,
            total: priceNum * qtyNum,
            exchanges: [{ id: exchangeId, quantity: qtyNum }],
          })
        }
      })

      // Process asks
      book.asks.forEach(([price, qty]) => {
        const priceNum = Number.parseFloat(price)
        const qtyNum = Number.parseFloat(qty)
        const roundedPrice = Math.round(priceNum * 100) / 100

        const existing = askMap.get(roundedPrice)
        if (existing) {
          existing.quantity += qtyNum
          existing.total += priceNum * qtyNum
          existing.exchanges.push({ id: exchangeId, quantity: qtyNum })
        } else {
          askMap.set(roundedPrice, {
            price: priceNum,
            quantity: qtyNum,
            total: priceNum * qtyNum,
            exchanges: [{ id: exchangeId, quantity: qtyNum }],
          })
        }
      })
    })

    const bids = Array.from(bidMap.values())
      .sort((a, b) => b.price - a.price)
      .slice(0, 12)
    const asks = Array.from(askMap.values())
      .sort((a, b) => a.price - b.price)
      .slice(0, 12)

    return { bids, asks }
  }, [orderBooks])

  const spread = useMemo(() => {
    if (aggregatedBook.bids.length === 0 || aggregatedBook.asks.length === 0) return "0"
    const bestBid = aggregatedBook.bids[0].price
    const bestAsk = aggregatedBook.asks[0].price
    return (((bestAsk - bestBid) / bestAsk) * 100).toFixed(3)
  }, [aggregatedBook])

  const maxTotal = useMemo(() => {
    const allTotals = [...aggregatedBook.bids, ...aggregatedBook.asks].map((l) => l.total)
    return Math.max(...allTotals, 1)
  }, [aggregatedBook])

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(4)
    return price.toFixed(6)
  }

  const formatQuantity = (qty: number) => {
    if (qty >= 1000) return qty.toLocaleString(undefined, { maximumFractionDigits: 2 })
    return qty.toFixed(4)
  }

  const connectedCount = Object.values(connectionStatus).filter(Boolean).length
  const levelHeight = Math.max(20, (height - 140) / 24)

  return (
    <Card className="bg-card border-border overflow-hidden" style={{ height }}>
      <CardHeader className="pb-2 px-3 py-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Order Book</span>
            <span className="text-xs text-muted-foreground font-mono">({connectedCount} sources)</span>
          </div>
          <div className="flex items-center gap-1">
            {(["combined", "spot", "futures"] as MarketType[]).map((type) => (
              <button
                key={type}
                onClick={() => setMarketType(type)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  marketType === type
                    ? type === "futures"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : type === "spot"
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {type === "combined" ? "ALL" : type.toUpperCase()}
              </button>
            ))}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex flex-col" style={{ height: height - 52 }}>
        {/* Headers */}
        <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-1 px-3 py-1.5 text-[10px] text-muted-foreground border-b border-border font-mono bg-secondary/30">
          <span>Price</span>
          <span className="text-right">Size</span>
          <span className="text-right">Total</span>
          <span className="text-center">
            <Layers className="w-3 h-3 mx-auto" />
          </span>
        </div>

        {/* Asks (reversed) */}
        <div className="flex-1 overflow-hidden flex flex-col justify-end">
          {[...aggregatedBook.asks].reverse().map((level, idx) => {
            const percentage = (level.total / maxTotal) * 100

            return (
              <div
                key={`ask-${idx}`}
                className="relative grid grid-cols-[1fr_1fr_1fr_40px] gap-1 px-3 text-[11px] font-mono items-center"
                style={{ height: levelHeight }}
              >
                <div
                  className="absolute inset-0 bg-[var(--color-sell)]/10"
                  style={{ width: `${percentage}%`, right: 0, left: "auto" }}
                />
                <span className="relative text-[var(--color-sell)]">{formatPrice(level.price)}</span>
                <span className="relative text-right text-foreground/80">{formatQuantity(level.quantity)}</span>
                <span className="relative text-right text-muted-foreground">${level.total.toFixed(0)}</span>
                <div className="relative flex justify-center gap-0.5">
                  {level.exchanges.slice(0, 3).map((ex, i) => {
                    const config = EXCHANGE_CONFIG[ex.id]
                    return (
                      <Image
                        key={i}
                        src={config?.logo || "/exchanges/binance.svg"}
                        alt={ex.id}
                        width={12}
                        height={12}
                        className="rounded-sm opacity-70"
                      />
                    )
                  })}
                  {level.exchanges.length > 3 && (
                    <span className="text-[8px] text-muted-foreground">+{level.exchanges.length - 3}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Spread */}
        <div className="px-3 py-1.5 border-y border-border bg-secondary/50">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Spread</span>
            <span className="font-mono text-foreground">{spread}%</span>
            <div className="flex items-center gap-1">
              {aggregatedBook.bids[0] && (
                <span className="text-[var(--color-buy)]">{formatPrice(aggregatedBook.bids[0].price)}</span>
              )}
              <span className="text-muted-foreground">-</span>
              {aggregatedBook.asks[0] && (
                <span className="text-[var(--color-sell)]">{formatPrice(aggregatedBook.asks[0].price)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Bids */}
        <div className="flex-1 overflow-hidden">
          {aggregatedBook.bids.map((level, idx) => {
            const percentage = (level.total / maxTotal) * 100

            return (
              <div
                key={`bid-${idx}`}
                className="relative grid grid-cols-[1fr_1fr_1fr_40px] gap-1 px-3 text-[11px] font-mono items-center"
                style={{ height: levelHeight }}
              >
                <div
                  className="absolute inset-0 bg-[var(--color-buy)]/10"
                  style={{ width: `${percentage}%`, right: 0, left: "auto" }}
                />
                <span className="relative text-[var(--color-buy)]">{formatPrice(level.price)}</span>
                <span className="relative text-right text-foreground/80">{formatQuantity(level.quantity)}</span>
                <span className="relative text-right text-muted-foreground">${level.total.toFixed(0)}</span>
                <div className="relative flex justify-center gap-0.5">
                  {level.exchanges.slice(0, 3).map((ex, i) => {
                    const config = EXCHANGE_CONFIG[ex.id]
                    return (
                      <Image
                        key={i}
                        src={config?.logo || "/exchanges/binance.svg"}
                        alt={ex.id}
                        width={12}
                        height={12}
                        className="rounded-sm opacity-70"
                      />
                    )
                  })}
                  {level.exchanges.length > 3 && (
                    <span className="text-[8px] text-muted-foreground">+{level.exchanges.length - 3}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Active exchanges footer */}
        <div className="px-3 py-1.5 border-t border-border bg-secondary/30">
          <div className="flex items-center gap-1 flex-wrap">
            {filteredExchanges.slice(0, 6).map((ex) => {
              const config = EXCHANGE_CONFIG[ex]
              const isConnected = connectionStatus[ex]
              return (
                <div
                  key={ex}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono ${
                    isConnected ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Image
                    src={config?.logo || "/exchanges/binance.svg"}
                    alt={ex}
                    width={10}
                    height={10}
                    className="rounded-sm"
                  />
                  <span className={config?.type === "futures" ? "text-yellow-400" : "text-cyan-400"}>
                    {config?.type === "futures" ? "P" : "S"}
                  </span>
                </div>
              )
            })}
            {filteredExchanges.length > 6 && (
              <span className="text-[9px] text-muted-foreground">+{filteredExchanges.length - 6}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
