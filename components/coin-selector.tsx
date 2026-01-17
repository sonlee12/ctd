"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { CoinPair } from "./crypto-terminal"

type CoinSelectorProps = {
  pairs: CoinPair[]
  selectedPair: CoinPair
  onSelectPair: (pair: CoinPair) => void
}

const coinIcons: Record<string, string> = {
  BTC: "₿",
  ETH: "Ξ",
  SOL: "◎",
  XRP: "✕",
  LINK: "⬡",
  ADA: "₳",
  DOGE: "Ð",
  AVAX: "🔺",
  MATIC: "⬡",
  DOT: "●",
  LTC: "Ł",
  UNI: "🦄",
}

export function CoinSelector({ pairs, selectedPair, onSelectPair }: CoinSelectorProps) {
  const [open, setOpen] = useState(false)

  const usdtPairs = pairs.filter((p) => p.quoteAsset === "USDT")
  const usdcPairs = pairs.filter((p) => p.quoteAsset === "USDC")

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
            <span className="text-lg">{coinIcons[selectedPair.baseAsset] || "🪙"}</span>
            <span className="font-mono font-medium">{selectedPair.label}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0 bg-card border-border" align="start">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search pair..." className="border-none" />
          <CommandList>
            <CommandEmpty>No pair found.</CommandEmpty>
            <CommandGroup heading="USDT Pairs">
              {usdtPairs.map((pair) => (
                <CommandItem
                  key={pair.symbol}
                  value={pair.symbol}
                  onSelect={() => {
                    onSelectPair(pair)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedPair.symbol === pair.symbol ? "opacity-100" : "opacity-0")}
                  />
                  <span className="mr-2">{coinIcons[pair.baseAsset] || "🪙"}</span>
                  <span className="font-mono">{pair.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="USDC Pairs">
              {usdcPairs.map((pair) => (
                <CommandItem
                  key={pair.symbol}
                  value={pair.symbol}
                  onSelect={() => {
                    onSelectPair(pair)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedPair.symbol === pair.symbol ? "opacity-100" : "opacity-0")}
                  />
                  <span className="mr-2">{coinIcons[pair.baseAsset] || "🪙"}</span>
                  <span className="font-mono">{pair.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
