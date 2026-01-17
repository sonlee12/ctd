"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Filter, ArrowUpRight, ArrowDownRight, TrendingUp, Layers } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { TapeFilter, Exchange } from "./crypto-terminal"

type TapeFiltersProps = {
  filters: TapeFilter
  onFiltersChange: (filters: TapeFilter) => void
  exchanges: Exchange[]
}

export function TapeFilters({ filters, onFiltersChange, exchanges }: TapeFiltersProps) {
  const toggleExchangeFilter = (exchangeId: string) => {
    const newExchanges = filters.exchanges.includes(exchangeId)
      ? filters.exchanges.filter((e) => e !== exchangeId)
      : [...filters.exchanges, exchangeId]
    onFiltersChange({ ...filters, exchanges: newExchanges })
  }

  const setSideFilter = (side: "all" | "buy" | "sell") => {
    onFiltersChange({ ...filters, side })
  }

  const setMarketTypeFilter = (marketType: "all" | "spot" | "futures") => {
    onFiltersChange({ ...filters, marketType })
  }

  const setMinValue = (value: number[]) => {
    onFiltersChange({ ...filters, minValue: value[0] })
  }

  const clearFilters = () => {
    onFiltersChange({ exchanges: [], side: "all", minValue: 0, marketType: "all" })
  }

  const hasFilters =
    filters.exchanges.length > 0 || filters.side !== "all" || filters.minValue > 0 || filters.marketType !== "all"

  const spotExchanges = exchanges.filter((e) => e.type === "spot")
  const futuresExchanges = exchanges.filter((e) => e.type === "futures")

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="w-4 h-4 text-primary" />
            <span>Tape Filters</span>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        <div className="mb-3">
          <span className="text-xs text-muted-foreground mb-2 block">Market Type</span>
          <div className="flex gap-1">
            <Button
              variant={filters.marketType === "all" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs flex-1"
              onClick={() => setMarketTypeFilter("all")}
            >
              <Layers className="w-3 h-3 mr-1" />
              All
            </Button>
            <Button
              variant={filters.marketType === "spot" ? "default" : "outline"}
              size="sm"
              className={cn("h-7 text-xs flex-1", filters.marketType === "spot" && "bg-cyan-600 hover:bg-cyan-700")}
              onClick={() => setMarketTypeFilter("spot")}
            >
              Spot
            </Button>
            <Button
              variant={filters.marketType === "futures" ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 text-xs flex-1",
                filters.marketType === "futures" && "bg-yellow-600 hover:bg-yellow-700",
              )}
              onClick={() => setMarketTypeFilter("futures")}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Perp
            </Button>
          </div>
        </div>

        {/* Side Filter */}
        <div className="mb-3">
          <span className="text-xs text-muted-foreground mb-2 block">Side</span>
          <div className="flex gap-1">
            <Button
              variant={filters.side === "all" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs flex-1"
              onClick={() => setSideFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filters.side === "buy" ? "default" : "outline"}
              size="sm"
              className={cn("h-7 text-xs flex-1", filters.side === "buy" && "bg-green-600 hover:bg-green-700")}
              onClick={() => setSideFilter("buy")}
            >
              <ArrowUpRight className="w-3 h-3 mr-1" />
              Buy
            </Button>
            <Button
              variant={filters.side === "sell" ? "default" : "outline"}
              size="sm"
              className={cn("h-7 text-xs flex-1", filters.side === "sell" && "bg-red-600 hover:bg-red-700")}
              onClick={() => setSideFilter("sell")}
            >
              <ArrowDownRight className="w-3 h-3 mr-1" />
              Sell
            </Button>
          </div>
        </div>

        {/* Min Value Filter */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Min Value</span>
            <Badge variant="outline" className="text-xs font-mono">
              ${filters.minValue >= 1000 ? (filters.minValue / 1000).toFixed(0) + "K" : filters.minValue}
            </Badge>
          </div>
          <Slider value={[filters.minValue]} onValueChange={setMinValue} max={50000} step={100} className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>$0</span>
            <span>$50K+</span>
          </div>
        </div>

        <div>
          <span className="text-xs text-muted-foreground mb-2 block">Filter by Exchange</span>

          {/* Spot Exchanges */}
          <div className="mb-2">
            <span className="text-[10px] text-cyan-400 mb-1 block">Spot</span>
            <div className="flex flex-wrap gap-1">
              {spotExchanges.map((exchange) => (
                <Button
                  key={exchange.id}
                  variant={filters.exchanges.includes(exchange.id) ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => toggleExchangeFilter(exchange.id)}
                >
                  <Image
                    src={exchange.logo || "/placeholder.svg"}
                    alt={exchange.name}
                    width={12}
                    height={12}
                    className="rounded-sm mr-1"
                  />
                  {exchange.name.slice(0, 3).toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Futures Exchanges */}
          <div>
            <span className="text-[10px] text-yellow-400 mb-1 block">Futures / Perp</span>
            <div className="flex flex-wrap gap-1">
              {futuresExchanges.map((exchange) => (
                <Button
                  key={exchange.id}
                  variant={filters.exchanges.includes(exchange.id) ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => toggleExchangeFilter(exchange.id)}
                >
                  <Image
                    src={exchange.logo || "/placeholder.svg"}
                    alt={exchange.name}
                    width={12}
                    height={12}
                    className="rounded-sm mr-1"
                  />
                  {exchange.name
                    .replace(" Perp", "")
                    .replace(" Futures", "")
                    .replace(" Swap", "")
                    .slice(0, 3)
                    .toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {filters.exchanges.length === 0 && (
            <span className="text-[10px] text-muted-foreground mt-2 block">No filter = show all</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
