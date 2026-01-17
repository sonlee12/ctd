"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import type { Trade, Exchange } from "./crypto-terminal"
import Image from "next/image"

type WhaleAlertProps = {
  trade: Trade | null
  exchanges: Exchange[]
  onDismiss: () => void
}

export function WhaleAlert({ trade, exchanges, onDismiss }: WhaleAlertProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (trade) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 300)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [trade, onDismiss])

  if (!trade) return null

  const value = Number.parseFloat(trade.price) * Number.parseFloat(trade.quantity)
  const isBuy = !trade.isBuyerMaker
  const exchange = exchanges.find((e) => e.id === trade.exchange)

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
    >
      <div
        className={`
          flex items-center gap-4 px-6 py-4 rounded-xl border-2 shadow-2xl backdrop-blur-md
          ${isBuy ? "bg-[var(--color-buy)]/20 border-[var(--color-buy)]" : "bg-[var(--color-sell)]/20 border-[var(--color-sell)]"}
        `}
      >
        <div className="text-4xl animate-bounce">🐋</div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {exchange && (
              <Image
                src={exchange.logo || "/placeholder.svg"}
                alt={exchange.name}
                width={20}
                height={20}
                className="rounded"
              />
            )}
            <span className={`text-2xl font-bold ${isBuy ? "text-[var(--color-buy)]" : "text-[var(--color-sell)]"}`}>
              ${(value / 1000).toFixed(1)}K {isBuy ? "BUY" : "SELL"}
            </span>
          </div>
          <span className="text-sm text-muted-foreground font-mono">
            {Number.parseFloat(trade.quantity).toFixed(4)} @ ${Number.parseFloat(trade.price).toLocaleString()}
          </span>
        </div>
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground ml-2">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
