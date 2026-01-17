"use client"

import { useState } from "react"
import { Check, ChevronDown, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Image from "next/image"
import type { Exchange } from "./crypto-terminal"

type ExchangeSelectorProps = {
  exchanges: Exchange[]
  selectedExchanges: string[]
  onSelectExchanges: (exchanges: string[]) => void
  connectionStatus: Record<string, "connecting" | "connected" | "disconnected">
}

export function ExchangeSelector({
  exchanges,
  selectedExchanges,
  onSelectExchanges,
  connectionStatus,
}: ExchangeSelectorProps) {
  const [open, setOpen] = useState(false)

  const toggleExchange = (exchangeId: string) => {
    if (selectedExchanges.includes(exchangeId)) {
      if (selectedExchanges.length > 1) {
        onSelectExchanges(selectedExchanges.filter((e) => e !== exchangeId))
      }
    } else {
      onSelectExchanges([...selectedExchanges, exchangeId])
    }
  }

  const selectAllSpot = () => {
    const spotExchanges = exchanges.filter((e) => e.type === "spot").map((e) => e.id)
    onSelectExchanges([
      ...new Set([
        ...selectedExchanges.filter((e) => exchanges.find((ex) => ex.id === e)?.type === "futures"),
        ...spotExchanges,
      ]),
    ])
  }

  const selectAllFutures = () => {
    const futuresExchanges = exchanges.filter((e) => e.type === "futures").map((e) => e.id)
    onSelectExchanges([
      ...new Set([
        ...selectedExchanges.filter((e) => exchanges.find((ex) => ex.id === e)?.type === "spot"),
        ...futuresExchanges,
      ]),
    ])
  }

  const selectAll = () => {
    onSelectExchanges(exchanges.map((e) => e.id))
  }

  const getStatusColor = (exchangeId: string) => {
    const status = connectionStatus[exchangeId]
    if (status === "connected") return "bg-green-500"
    if (status === "connecting") return "bg-yellow-500"
    return "bg-red-500"
  }

  const spotExchanges = exchanges.filter((e) => e.type === "spot")
  const futuresExchanges = exchanges.filter((e) => e.type === "futures")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[160px] justify-between bg-card border-border hover:bg-secondary"
        >
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm">{selectedExchanges.length} Sources</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 bg-card border-border max-h-[500px] overflow-hidden" align="start">
        <Command className="bg-transparent">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-xs text-muted-foreground">Select Exchanges</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={selectAll}>
              All
            </Button>
          </div>
          <CommandList className="max-h-[420px] overflow-y-auto">
            <CommandGroup
              heading={
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Spot Markets</span>
                  <Button variant="ghost" size="sm" className="h-5 text-xs px-2" onClick={selectAllSpot}>
                    Select
                  </Button>
                </div>
              }
            >
              {spotExchanges.map((exchange) => (
                <CommandItem
                  key={exchange.id}
                  value={exchange.id}
                  onSelect={() => toggleExchange(exchange.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Check
                      className={cn("h-4 w-4", selectedExchanges.includes(exchange.id) ? "opacity-100" : "opacity-0")}
                    />
                    <Image
                      src={exchange.logo || "/placeholder.svg"}
                      alt={exchange.name}
                      width={16}
                      height={16}
                      className="rounded-sm"
                    />
                    <span className="font-mono text-sm">{exchange.name}</span>
                  </div>
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      selectedExchanges.includes(exchange.id) ? getStatusColor(exchange.id) : "bg-muted",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup
              heading={
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400">Futures / Perpetual</span>
                  <Button variant="ghost" size="sm" className="h-5 text-xs px-2" onClick={selectAllFutures}>
                    Select
                  </Button>
                </div>
              }
            >
              {futuresExchanges.map((exchange) => (
                <CommandItem
                  key={exchange.id}
                  value={exchange.id}
                  onSelect={() => toggleExchange(exchange.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Check
                      className={cn("h-4 w-4", selectedExchanges.includes(exchange.id) ? "opacity-100" : "opacity-0")}
                    />
                    <Image
                      src={exchange.logo || "/placeholder.svg"}
                      alt={exchange.name}
                      width={16}
                      height={16}
                      className="rounded-sm"
                    />
                    <span className="font-mono text-sm">{exchange.name}</span>
                  </div>
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      selectedExchanges.includes(exchange.id) ? getStatusColor(exchange.id) : "bg-muted",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
