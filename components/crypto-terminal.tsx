"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { CoinSelector } from "./coin-selector"
import { LiveOrdersPanel } from "./live-orders-panel"
import { TradingViewChart } from "./trading-view-chart"
import { MarketStats } from "./market-stats"
import { OrderBook } from "./order-book"
import { ExchangeSelector } from "./exchange-selector"
import { TapeFilters } from "./tape-filters"
import { LayoutCustomizer, type LayoutConfig, DEFAULT_LAYOUT } from "./layout-customizer"
import { SoundSettings, SOUND_PRESETS, type SoundConfig, type SoundPreset } from "./sound-settings"
import { WhaleAlert } from "./whale-alert"
import { TradeStats } from "./trade-stats"
import { TradersChat } from "./traders-chat"
import { Activity, Zap, Keyboard, MessageCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type CoinPair = {
  symbol: string
  baseAsset: string
  quoteAsset: string
  label: string
}

export type Exchange = {
  id: string
  name: string
  logo: string
  color: string
  type: "spot" | "futures"
}

export type Trade = {
  id: string
  price: string
  quantity: string
  time: number
  isBuyerMaker: boolean
  symbol: string
  exchange: string
  marketType: "spot" | "futures"
}

export type TapeFilter = {
  exchanges: string[]
  side: "all" | "buy" | "sell"
  minValue: number
  marketType: "all" | "spot" | "futures"
}

export const EXCHANGES: Exchange[] = [
  // Spot Exchanges
  { id: "binance", name: "Binance", logo: "/exchanges/binance.svg", color: "#F0B90B", type: "spot" },
  { id: "coinbase", name: "Coinbase", logo: "/exchanges/coinbase.svg", color: "#0052FF", type: "spot" },
  { id: "kraken", name: "Kraken", logo: "/exchanges/kraken.svg", color: "#5741D9", type: "spot" },
  { id: "okx", name: "OKX", logo: "/exchanges/okx.svg", color: "#FFFFFF", type: "spot" },
  { id: "bybit", name: "Bybit", logo: "/exchanges/bybit.svg", color: "#F7A600", type: "spot" },
  { id: "kucoin", name: "KuCoin", logo: "/exchanges/kucoin.svg", color: "#23AF91", type: "spot" },
  { id: "bitfinex", name: "Bitfinex", logo: "/exchanges/bitfinex.svg", color: "#16B157", type: "spot" },
  { id: "huobi", name: "HTX", logo: "/exchanges/huobi.svg", color: "#1F8CEB", type: "spot" },
  { id: "mexc", name: "MEXC", logo: "/exchanges/mexc.svg", color: "#00B897", type: "spot" },
  { id: "gateio", name: "Gate.io", logo: "/exchanges/gateio.svg", color: "#17E6A1", type: "spot" },
  // Futures/Perpetual Exchanges
  { id: "binance-futures", name: "Binance Futures", logo: "/exchanges/binance.svg", color: "#F0B90B", type: "futures" },
  { id: "bybit-perp", name: "Bybit Perp", logo: "/exchanges/bybit.svg", color: "#F7A600", type: "futures" },
  { id: "okx-swap", name: "OKX Swap", logo: "/exchanges/okx.svg", color: "#FFFFFF", type: "futures" },
  { id: "bitfinex-perp", name: "Bitfinex Perp", logo: "/exchanges/bitfinex.svg", color: "#16B157", type: "futures" },
  { id: "kucoin-futures", name: "KuCoin Futures", logo: "/exchanges/kucoin.svg", color: "#23AF91", type: "futures" },
  { id: "huobi-futures", name: "HTX Futures", logo: "/exchanges/huobi.svg", color: "#1F8CEB", type: "futures" },
  { id: "deribit", name: "Deribit", logo: "/exchanges/deribit.svg", color: "#00D26B", type: "futures" },
  { id: "mexc-futures", name: "MEXC Futures", logo: "/exchanges/mexc.svg", color: "#00B897", type: "futures" },
  { id: "gateio-futures", name: "Gate.io Futures", logo: "/exchanges/gateio.svg", color: "#17E6A1", type: "futures" },
]

export const AVAILABLE_PAIRS: CoinPair[] = [
  { symbol: "BTCUSDT", baseAsset: "BTC", quoteAsset: "USDT", label: "BTC/USDT" },
  { symbol: "ETHUSDT", baseAsset: "ETH", quoteAsset: "USDT", label: "ETH/USDT" },
  { symbol: "SOLUSDT", baseAsset: "SOL", quoteAsset: "USDT", label: "SOL/USDT" },
  { symbol: "XRPUSDT", baseAsset: "XRP", quoteAsset: "USDT", label: "XRP/USDT" },
  { symbol: "LINKUSDT", baseAsset: "LINK", quoteAsset: "USDT", label: "LINK/USDT" },
  { symbol: "ADAUSDT", baseAsset: "ADA", quoteAsset: "USDT", label: "ADA/USDT" },
  { symbol: "DOGEUSDT", baseAsset: "DOGE", quoteAsset: "USDT", label: "DOGE/USDT" },
  { symbol: "AVAXUSDT", baseAsset: "AVAX", quoteAsset: "USDT", label: "AVAX/USDT" },
  { symbol: "MATICUSDT", baseAsset: "MATIC", quoteAsset: "USDT", label: "MATIC/USDT" },
  { symbol: "DOTUSDT", baseAsset: "DOT", quoteAsset: "USDT", label: "DOT/USDT" },
  { symbol: "LTCUSDT", baseAsset: "LTC", quoteAsset: "USDT", label: "LTC/USDT" },
  { symbol: "UNIUSDT", baseAsset: "UNI", quoteAsset: "USDT", label: "UNI/USDT" },
  { symbol: "BTCUSDC", baseAsset: "BTC", quoteAsset: "USDC", label: "BTC/USDC" },
  { symbol: "ETHUSDC", baseAsset: "ETH", quoteAsset: "USDC", label: "ETH/USDC" },
  { symbol: "SOLUSDC", baseAsset: "SOL", quoteAsset: "USDC", label: "SOL/USDC" },
]

class AudioPool {
  private audioContext: AudioContext | null = null
  private buyBuffers: Map<string, AudioBuffer> = new Map()
  private sellBuffers: Map<string, AudioBuffer> = new Map()
  private whaleBuffer: AudioBuffer | null = null
  private reverbBuffer: AudioBuffer | null = null
  private lastPlayTime = 0
  private scheduledCount = 0
  private maxScheduled = 12
  private minInterval = 10
  private reverbEnabled = true
  private stereoEnabled = true

  setEffects(reverb: boolean, stereo: boolean) {
    this.reverbEnabled = reverb
    this.stereoEnabled = stereo
  }

  private async initContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
      await this.createReverbBuffer()
    }
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume()
    }
    return this.audioContext
  }

  // Create impulse response for reverb effect
  private async createReverbBuffer() {
    if (!this.audioContext) return
    const ctx = this.audioContext
    const sampleRate = ctx.sampleRate
    const length = sampleRate * 0.5 // 500ms reverb tail
    const buffer = ctx.createBuffer(2, length, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        // Exponential decay with random noise
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.15))
      }
    }
    this.reverbBuffer = buffer
  }

  private generateBuffer(ctx: AudioContext, freq: number, waveType: OscillatorType, duration: number): AudioBuffer {
    const sampleRate = ctx.sampleRate
    const length = Math.floor(sampleRate * duration)
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const envelope = Math.exp((-t * 10) / duration)
      let sample = 0

      switch (waveType) {
        case "sine":
          sample = Math.sin(2 * Math.PI * freq * t)
          break
        case "square":
          sample = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.5 : -0.5
          break
        case "sawtooth":
          sample = 2 * ((freq * t) % 1) - 1
          break
        case "triangle":
          sample = 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1
          break
      }

      data[i] = sample * envelope * 0.3
    }

    return buffer
  }

  private generateWhaleBuffer(ctx: AudioContext): AudioBuffer {
    const sampleRate = ctx.sampleRate
    const duration = 0.6
    const length = Math.floor(sampleRate * duration)
    const buffer = ctx.createBuffer(2, length, sampleRate)
    const frequencies = [523, 659, 784, 1047] // C5, E5, G5, C6 chord

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate
        let sample = 0

        frequencies.forEach((freq, idx) => {
          const delay = idx * 0.03
          const pan = channel === 0 ? (idx % 2 === 0 ? 1 : 0.3) : idx % 2 === 0 ? 0.3 : 1
          if (t > delay) {
            sample += Math.sin(2 * Math.PI * freq * (t - delay)) * Math.exp(-(t - delay) * 4) * pan
          }
        })

        data[i] = sample * 0.12
      }
    }

    return buffer
  }

  async preloadPreset(preset: SoundPreset) {
    const ctx = await this.initContext()

    if (!this.buyBuffers.has(preset.id)) {
      const buyBuffer = this.generateBuffer(ctx, preset.buyFreq, preset.waveType, preset.duration)
      const sellBuffer = this.generateBuffer(ctx, preset.sellFreq, preset.waveType, preset.duration)
      this.buyBuffers.set(preset.id, buyBuffer)
      this.sellBuffers.set(preset.id, sellBuffer)
    }

    if (!this.whaleBuffer) {
      this.whaleBuffer = this.generateWhaleBuffer(ctx)
    }
  }

  play(isBuy: boolean, volume: number, preset: SoundPreset, masterVolume: number) {
    const now = performance.now()

    if (now - this.lastPlayTime < this.minInterval) return
    if (this.scheduledCount >= this.maxScheduled) return

    this.lastPlayTime = now

    this.initContext().then((ctx) => {
      const buffer = isBuy ? this.buyBuffers.get(preset.id) : this.sellBuffers.get(preset.id)

      if (!buffer) {
        this.preloadPreset(preset).then(() => {
          this.playBuffer(
            ctx,
            isBuy ? this.buyBuffers.get(preset.id)! : this.sellBuffers.get(preset.id)!,
            volume,
            masterVolume,
            isBuy,
          )
        })
        return
      }

      this.playBuffer(ctx, buffer, volume, masterVolume, isBuy)
    })
  }

  private playBuffer(ctx: AudioContext, buffer: AudioBuffer, volume: number, masterVolume: number, isBuy: boolean) {
    const source = ctx.createBufferSource()
    const gain = ctx.createGain()

    // Add slight pitch variation for more organic feel (±5%)
    const pitchVariation = 0.95 + Math.random() * 0.1
    source.playbackRate.value = pitchVariation

    source.buffer = buffer

    // Create stereo panner for buy/sell separation
    let outputNode: AudioNode = gain

    if (this.stereoEnabled) {
      const panner = ctx.createStereoPanner()
      // Buys slightly left, sells slightly right
      panner.pan.value = isBuy ? -0.3 - Math.random() * 0.2 : 0.3 + Math.random() * 0.2
      gain.connect(panner)
      outputNode = panner
    }

    // Add reverb for spaciousness
    if (this.reverbEnabled && this.reverbBuffer) {
      const convolver = ctx.createConvolver()
      convolver.buffer = this.reverbBuffer

      const dryGain = ctx.createGain()
      const wetGain = ctx.createGain()
      dryGain.gain.value = 0.8
      wetGain.gain.value = 0.25

      outputNode.connect(dryGain)
      outputNode.connect(convolver)
      convolver.connect(wetGain)

      dryGain.connect(ctx.destination)
      wetGain.connect(ctx.destination)
    } else {
      outputNode.connect(ctx.destination)
    }

    source.connect(gain)

    const normalizedVolume = Math.min(Math.max(volume / 10000, 0.3), 1) * masterVolume
    gain.gain.value = normalizedVolume

    this.scheduledCount++
    source.onended = () => {
      this.scheduledCount = Math.max(0, this.scheduledCount - 1)
    }

    source.start(0)
  }

  playWhaleAlert(masterVolume: number) {
    this.initContext().then((ctx) => {
      if (!this.whaleBuffer) {
        this.whaleBuffer = this.generateWhaleBuffer(ctx)
      }

      const source = ctx.createBufferSource()
      const gain = ctx.createGain()

      source.buffer = this.whaleBuffer
      source.connect(gain)

      // Add reverb to whale alerts
      if (this.reverbEnabled && this.reverbBuffer) {
        const convolver = ctx.createConvolver()
        convolver.buffer = this.reverbBuffer
        const wetGain = ctx.createGain()
        wetGain.gain.value = 0.4

        gain.connect(ctx.destination)
        gain.connect(convolver)
        convolver.connect(wetGain)
        wetGain.connect(ctx.destination)
      } else {
        gain.connect(ctx.destination)
      }

      gain.gain.value = masterVolume

      source.start(0)
    })
  }
}

function getWebSocketConfig(exchange: string, symbol: string) {
  const lowerSymbol = symbol.toLowerCase()
  const baseAsset = symbol.replace(/USDT|USDC/i, "")
  const quoteAsset = symbol.includes("USDC") ? "USDC" : "USDT"

  switch (exchange) {
    // SPOT EXCHANGES
    case "binance":
      return {
        url: `wss://stream.binance.com:9443/ws/${lowerSymbol}@trade`,
        marketType: "spot" as const,
        parser: (data: any): Trade | null => ({
          id: `binance-${data.t}`,
          price: data.p,
          quantity: data.q,
          time: data.T,
          isBuyerMaker: data.m,
          symbol,
          exchange: "binance",
          marketType: "spot",
        }),
      }
    case "coinbase":
      return {
        url: "wss://ws-feed.exchange.coinbase.com",
        marketType: "spot" as const,
        subscribe: {
          type: "subscribe",
          product_ids: [`${baseAsset}-${quoteAsset}`],
          channels: ["matches"],
        },
        parser: (data: any): Trade | null => {
          if (data.type !== "match") return null
          return {
            id: `coinbase-${data.trade_id}`,
            price: data.price,
            quantity: data.size,
            time: new Date(data.time).getTime(),
            isBuyerMaker: data.side === "sell",
            symbol,
            exchange: "coinbase",
            marketType: "spot",
          }
        },
      }
    case "kraken":
      return {
        url: "wss://ws.kraken.com",
        marketType: "spot" as const,
        subscribe: {
          event: "subscribe",
          pair: [`${baseAsset}/${quoteAsset}`],
          subscription: { name: "trade" },
        },
        parser: (data: any): Trade | null => {
          if (!Array.isArray(data) || data.length < 2) return null
          const trades = data[1]
          if (!Array.isArray(trades) || trades.length === 0) return null
          const trade = trades[trades.length - 1]
          return {
            id: `kraken-${Date.now()}-${Math.random()}`,
            price: trade[0],
            quantity: trade[1],
            time: Number.parseFloat(trade[2]) * 1000,
            isBuyerMaker: trade[3] === "s",
            symbol,
            exchange: "kraken",
            marketType: "spot",
          }
        },
      }
    case "okx":
      return {
        url: "wss://ws.okx.com:8443/ws/v5/public",
        marketType: "spot" as const,
        subscribe: {
          op: "subscribe",
          args: [{ channel: "trades", instId: `${baseAsset}-${quoteAsset}` }],
        },
        parser: (data: any): Trade | null => {
          if (!data.data || !data.data[0]) return null
          const trade = data.data[0]
          return {
            id: `okx-${trade.tradeId}`,
            price: trade.px,
            quantity: trade.sz,
            time: Number.parseInt(trade.ts),
            isBuyerMaker: trade.side === "sell",
            symbol,
            exchange: "okx",
            marketType: "spot",
          }
        },
      }
    case "bybit":
      return {
        url: "wss://stream.bybit.com/v5/public/spot",
        marketType: "spot" as const,
        subscribe: {
          op: "subscribe",
          args: [`publicTrade.${symbol}`],
        },
        parser: (data: any): Trade | null => {
          if (!data.data || !data.data[0]) return null
          const trade = data.data[0]
          return {
            id: `bybit-${trade.i}`,
            price: trade.p,
            quantity: trade.v,
            time: Number.parseInt(trade.T),
            isBuyerMaker: trade.S === "Sell",
            symbol,
            exchange: "bybit",
            marketType: "spot",
          }
        },
      }
    case "kucoin":
      return {
        url: null,
        marketType: "spot" as const,
        parser: () => null,
      }
    case "bitfinex":
      return {
        url: "wss://api-pub.bitfinex.com/ws/2",
        marketType: "spot" as const,
        subscribe: {
          event: "subscribe",
          channel: "trades",
          symbol: `t${baseAsset}${quoteAsset}`,
        },
        parser: (data: any): Trade | null => {
          if (!Array.isArray(data) || data[1] === "hb") return null
          if (data[1] === "te" || (Array.isArray(data[1]) && data[1].length > 0)) {
            const trade = data[1] === "te" ? data[2] : data[1][data[1].length - 1]
            if (!Array.isArray(trade)) return null
            return {
              id: `bitfinex-${trade[0]}`,
              price: Math.abs(trade[3]).toString(),
              quantity: Math.abs(trade[2]).toString(),
              time: trade[1],
              isBuyerMaker: trade[2] < 0,
              symbol,
              exchange: "bitfinex",
              marketType: "spot",
            }
          }
          return null
        },
      }
    case "huobi":
      return {
        url: "wss://api.huobi.pro/ws",
        marketType: "spot" as const,
        subscribe: {
          sub: `market.${lowerSymbol}.trade.detail`,
          id: "trade",
        },
        parser: (data: any): Trade | null => {
          if (!data.tick || !data.tick.data) return null
          const trade = data.tick.data[0]
          return {
            id: `huobi-${trade.tradeId}`,
            price: trade.price.toString(),
            quantity: trade.amount.toString(),
            time: trade.ts,
            isBuyerMaker: trade.direction === "sell",
            symbol,
            exchange: "huobi",
            marketType: "spot",
          }
        },
        handleMessage: (ws: WebSocket, data: any) => {
          if (data.ping) {
            ws.send(JSON.stringify({ pong: data.ping }))
          }
        },
      }
    case "mexc":
      return {
        url: `wss://wbs.mexc.com/ws`,
        marketType: "spot" as const,
        subscribe: {
          method: "SUBSCRIPTION",
          params: [`spot@public.deals.v3.api@${symbol}`],
        },
        parser: (data: any): Trade | null => {
          if (!data.d || !data.d.deals) return null
          const trade = data.d.deals[0]
          return {
            id: `mexc-${Date.now()}-${Math.random()}`,
            price: trade.p,
            quantity: trade.v,
            time: trade.t,
            isBuyerMaker: trade.S === 2,
            symbol,
            exchange: "mexc",
            marketType: "spot",
          }
        },
      }
    case "gateio":
      return {
        url: "wss://api.gateio.ws/ws/v4/",
        marketType: "spot" as const,
        subscribe: {
          time: Math.floor(Date.now() / 1000),
          channel: "spot.trades",
          event: "subscribe",
          payload: [`${baseAsset}_${quoteAsset}`],
        },
        parser: (data: any): Trade | null => {
          if (data.event !== "update" || !data.result) return null
          const trade = data.result
          return {
            id: `gateio-${trade.id}`,
            price: trade.price,
            quantity: trade.amount,
            time: Number.parseInt(trade.create_time_ms),
            isBuyerMaker: trade.side === "sell",
            symbol,
            exchange: "gateio",
            marketType: "spot",
          }
        },
      }

    // FUTURES/PERPETUAL EXCHANGES
    case "binance-futures":
      return {
        url: `wss://fstream.binance.com/ws/${lowerSymbol}@trade`,
        marketType: "futures" as const,
        parser: (data: any): Trade | null => ({
          id: `binance-futures-${data.t}`,
          price: data.p,
          quantity: data.q,
          time: data.T,
          isBuyerMaker: data.m,
          symbol,
          exchange: "binance-futures",
          marketType: "futures",
        }),
      }
    case "bybit-perp":
      return {
        url: "wss://stream.bybit.com/v5/public/linear",
        marketType: "futures" as const,
        subscribe: {
          op: "subscribe",
          args: [`publicTrade.${symbol}`],
        },
        parser: (data: any): Trade | null => {
          if (!data.data || !data.data[0]) return null
          const trade = data.data[0]
          return {
            id: `bybit-perp-${trade.i}`,
            price: trade.p,
            quantity: trade.v,
            time: Number.parseInt(trade.T),
            isBuyerMaker: trade.S === "Sell",
            symbol,
            exchange: "bybit-perp",
            marketType: "futures",
          }
        },
      }
    case "okx-swap":
      return {
        url: "wss://ws.okx.com:8443/ws/v5/public",
        marketType: "futures" as const,
        subscribe: {
          op: "subscribe",
          args: [{ channel: "trades", instId: `${baseAsset}-${quoteAsset}-SWAP` }],
        },
        parser: (data: any): Trade | null => {
          if (!data.data || !data.data[0]) return null
          const trade = data.data[0]
          return {
            id: `okx-swap-${trade.tradeId}`,
            price: trade.px,
            quantity: trade.sz,
            time: Number.parseInt(trade.ts),
            isBuyerMaker: trade.side === "sell",
            symbol,
            exchange: "okx-swap",
            marketType: "futures",
          }
        },
      }
    case "bitfinex-perp":
      return {
        url: "wss://api-pub.bitfinex.com/ws/2",
        marketType: "futures" as const,
        subscribe: {
          event: "subscribe",
          channel: "trades",
          symbol: `t${baseAsset}F0:${quoteAsset}F0`,
        },
        parser: (data: any): Trade | null => {
          if (!Array.isArray(data) || data[1] === "hb") return null
          if (data[1] === "te" || (Array.isArray(data[1]) && data[1].length > 0)) {
            const trade = data[1] === "te" ? data[2] : data[1][data[1].length - 1]
            if (!Array.isArray(trade)) return null
            return {
              id: `bitfinex-perp-${trade[0]}`,
              price: Math.abs(trade[3]).toString(),
              quantity: Math.abs(trade[2]).toString(),
              time: trade[1],
              isBuyerMaker: trade[2] < 0,
              symbol,
              exchange: "bitfinex-perp",
              marketType: "futures",
            }
          }
          return null
        },
      }
    case "kucoin-futures":
      return {
        url: null,
        marketType: "futures" as const,
        parser: () => null,
      }
    case "huobi-futures":
      return {
        url: "wss://api.hbdm.com/linear-swap-ws",
        marketType: "futures" as const,
        subscribe: {
          sub: `market.${symbol}.trade.detail`,
          id: "trade-futures",
        },
        parser: (data: any): Trade | null => {
          if (!data.tick || !data.tick.data) return null
          const trade = data.tick.data[0]
          return {
            id: `huobi-futures-${trade.id}`,
            price: trade.price.toString(),
            quantity: trade.amount.toString(),
            time: trade.ts,
            isBuyerMaker: trade.direction === "sell",
            symbol,
            exchange: "huobi-futures",
            marketType: "futures",
          }
        },
        handleMessage: (ws: WebSocket, data: any) => {
          if (data.ping) {
            ws.send(JSON.stringify({ pong: data.ping }))
          }
        },
      }
    case "deribit":
      return {
        url: "wss://www.deribit.com/ws/api/v2",
        marketType: "futures" as const,
        subscribe: {
          jsonrpc: "2.0",
          id: 1,
          method: "public/subscribe",
          params: {
            channels: [`trades.${baseAsset}-PERPETUAL.raw`],
          },
        },
        parser: (data: any): Trade | null => {
          if (!data.params || !data.params.data || !data.params.data[0]) return null
          const trade = data.params.data[0]
          return {
            id: `deribit-${trade.trade_id}`,
            price: trade.price.toString(),
            quantity: trade.amount.toString(),
            time: trade.timestamp,
            isBuyerMaker: trade.direction === "sell",
            symbol,
            exchange: "deribit",
            marketType: "futures",
          }
        },
      }
    case "mexc-futures":
      return {
        url: "wss://contract.mexc.com/ws",
        marketType: "futures" as const,
        subscribe: {
          method: "sub.deal",
          param: { symbol: `${baseAsset}_${quoteAsset}` },
        },
        parser: (data: any): Trade | null => {
          if (!data.data) return null
          const trade = data.data
          return {
            id: `mexc-futures-${Date.now()}-${Math.random()}`,
            price: trade.p.toString(),
            quantity: trade.v.toString(),
            time: trade.t,
            isBuyerMaker: trade.T === 2,
            symbol,
            exchange: "mexc-futures",
            marketType: "futures",
          }
        },
      }
    case "gateio-futures":
      return {
        url: "wss://fx-ws.gateio.ws/v4/ws/usdt",
        marketType: "futures" as const,
        subscribe: {
          time: Math.floor(Date.now() / 1000),
          channel: "futures.trades",
          event: "subscribe",
          payload: [`${baseAsset}_${quoteAsset}`],
        },
        parser: (data: any): Trade | null => {
          if (data.event !== "update" || !data.result || !data.result[0]) return null
          const trade = data.result[0]
          return {
            id: `gateio-futures-${trade.id}`,
            price: trade.price,
            quantity: trade.size.toString(),
            time: Number.parseInt(trade.create_time_ms),
            isBuyerMaker: trade.size < 0,
            symbol,
            exchange: "gateio-futures",
            marketType: "futures",
          }
        },
      }
    default:
      return { url: null, marketType: "spot" as const, parser: () => null }
  }
}

const DEFAULT_SOUND_CONFIG: SoundConfig = {
  enabled: true,
  preset: "classic",
  volume: 0.5,
  whaleAlerts: true,
  minValueForSound: 100,
  reverb: true,
  stereo: true,
}

export function CryptoTerminal() {
  const [selectedPair, setSelectedPair] = useState<CoinPair>(AVAILABLE_PAIRS[0])
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>([
    "binance",
    "binance-futures",
    "bybit",
    "bybit-perp",
    "okx",
    "okx-swap",
  ])
  const [trades, setTrades] = useState<Trade[]>([])
  const [soundConfig, setSoundConfig] = useState<SoundConfig>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cryptoflow-sound-v3")
      if (saved) {
        try {
          return { ...DEFAULT_SOUND_CONFIG, ...JSON.parse(saved) }
        } catch {
          return DEFAULT_SOUND_CONFIG
        }
      }
    }
    return DEFAULT_SOUND_CONFIG
  })
  const [connectionStatus, setConnectionStatus] = useState<Record<string, "connecting" | "connected" | "disconnected">>(
    {},
  )
  const [filters, setFilters] = useState<TapeFilter>({
    exchanges: [],
    side: "all",
    minValue: 0,
    marketType: "all",
  })
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cryptoflow-layout-v2")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return DEFAULT_LAYOUT
        }
      }
    }
    return DEFAULT_LAYOUT
  })
  const [whaleAlert, setWhaleAlert] = useState<Trade | null>(null)
  const [showHotkeys, setShowHotkeys] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const wsRefs = useRef<Map<string, WebSocket>>(new Map())
  const audioPoolRef = useRef<AudioPool>(new AudioPool())
  const filtersRef = useRef<TapeFilter>(filters)
  const soundConfigRef = useRef<SoundConfig>(soundConfig)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  useEffect(() => {
    soundConfigRef.current = soundConfig
    localStorage.setItem("cryptoflow-sound-v3", JSON.stringify(soundConfig))
    audioPoolRef.current.setEffects(soundConfig.reverb ?? true, soundConfig.stereo ?? true)
  }, [soundConfig])

  useEffect(() => {
    localStorage.setItem("cryptoflow-layout-v2", JSON.stringify(layoutConfig))
  }, [layoutConfig])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key.toLowerCase()) {
        case "m":
          setSoundConfig((prev) => ({ ...prev, enabled: !prev.enabled }))
          break
        case "b":
          setFilters((prev) => ({ ...prev, side: prev.side === "buy" ? "all" : "buy" }))
          break
        case "s":
          setFilters((prev) => ({ ...prev, side: prev.side === "sell" ? "all" : "sell" }))
          break
        case "f":
          setFilters((prev) => ({ ...prev, marketType: prev.marketType === "futures" ? "all" : "futures" }))
          break
        case "p":
          setFilters((prev) => ({ ...prev, marketType: prev.marketType === "spot" ? "all" : "spot" }))
          break
        case "?":
          setShowHotkeys((prev) => !prev)
          break
        // Add hotkey for chat toggle
        case "c":
          setShowChat((prev) => !prev)
          break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const shouldPlaySound = useCallback((trade: Trade, tradeValue: number): boolean => {
    const currentFilters = filtersRef.current
    const config = soundConfigRef.current

    if (tradeValue < config.minValueForSound) return false
    if (currentFilters.exchanges.length > 0 && !currentFilters.exchanges.includes(trade.exchange)) {
      return false
    }
    if (currentFilters.side === "buy" && trade.isBuyerMaker) return false
    if (currentFilters.side === "sell" && !trade.isBuyerMaker) return false
    if (currentFilters.marketType !== "all" && trade.marketType !== currentFilters.marketType) return false
    if (tradeValue < currentFilters.minValue) return false

    return true
  }, [])

  const playTradeSound = useCallback(
    (trade: Trade, volume: number) => {
      const config = soundConfigRef.current
      if (!config.enabled) return
      if (!shouldPlaySound(trade, volume)) return

      const preset = SOUND_PRESETS.find((p) => p.id === config.preset) || SOUND_PRESETS[0]
      audioPoolRef.current.play(!trade.isBuyerMaker, volume, preset, config.volume)

      if (volume > 50000 && config.whaleAlerts) {
        setWhaleAlert(trade)
        audioPoolRef.current.playWhaleAlert(config.volume)
      }
    },
    [shouldPlaySound],
  )

  useEffect(() => {
    wsRefs.current.forEach((ws) => ws.close())
    wsRefs.current.clear()
    setTrades([])

    const newStatus: Record<string, "connecting" | "connected" | "disconnected"> = {}
    selectedExchanges.forEach((ex) => {
      newStatus[ex] = "connecting"
    })
    setConnectionStatus(newStatus)

    selectedExchanges.forEach((exchangeId) => {
      const config = getWebSocketConfig(exchangeId, selectedPair.symbol)
      if (!config.url) return

      try {
        const ws = new WebSocket(config.url)
        wsRefs.current.set(exchangeId, ws)

        ws.onopen = () => {
          setConnectionStatus((prev) => ({ ...prev, [exchangeId]: "connected" }))
          if (config.subscribe) {
            ws.send(JSON.stringify(config.subscribe))
          }
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (config.handleMessage) {
              config.handleMessage(ws, data)
            }
            const trade = config.parser(data)
            if (trade) {
              setTrades((prev) => [trade, ...prev.slice(0, 299)])
              const tradeValue = Number.parseFloat(trade.price) * Number.parseFloat(trade.quantity)
              if (tradeValue > 50) {
                playTradeSound(trade, tradeValue)
              }
            }
          } catch {
            // Ignore parse errors
          }
        }

        ws.onerror = () => {
          setConnectionStatus((prev) => ({ ...prev, [exchangeId]: "disconnected" }))
        }

        ws.onclose = () => {
          setConnectionStatus((prev) => ({ ...prev, [exchangeId]: "disconnected" }))
        }
      } catch {
        setConnectionStatus((prev) => ({ ...prev, [exchangeId]: "disconnected" }))
      }
    })

    return () => {
      wsRefs.current.forEach((ws) => ws.close())
      wsRefs.current.clear()
    }
  }, [selectedPair, selectedExchanges, playTradeSound])

  useEffect(() => {
    const preset = SOUND_PRESETS.find((p) => p.id === soundConfig.preset) || SOUND_PRESETS[0]
    audioPoolRef.current.preloadPreset(preset)
  }, [soundConfig.preset])

  const filteredTrades = trades.filter((trade) => {
    if (filters.exchanges.length > 0 && !filters.exchanges.includes(trade.exchange)) {
      return false
    }
    if (filters.side === "buy" && trade.isBuyerMaker) return false
    if (filters.side === "sell" && !trade.isBuyerMaker) return false
    if (filters.marketType !== "all" && trade.marketType !== filters.marketType) return false
    const value = Number.parseFloat(trade.price) * Number.parseFloat(trade.quantity)
    if (value < filters.minValue) return false
    return true
  })

  const connectedCount = Object.values(connectionStatus).filter((s) => s === "connected").length
  const spotCount = selectedExchanges.filter((e) => EXCHANGES.find((ex) => ex.id === e)?.type === "spot").length
  const futuresCount = selectedExchanges.filter((e) => EXCHANGES.find((ex) => ex.id === e)?.type === "futures").length

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <WhaleAlert trade={whaleAlert} exchanges={EXCHANGES} onDismiss={() => setWhaleAlert(null)} />

      {/* Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">CryptoFlow</h1>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connectedCount > 0 ? "bg-[var(--color-buy)] animate-pulse" : "bg-[var(--color-sell)]"
              }`}
            />
            <span className="text-xs text-muted-foreground font-mono">
              {connectedCount}/{selectedExchanges.length} LIVE
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className="text-cyan-400">{spotCount} SPOT</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-yellow-400">{futuresCount} PERP</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <CoinSelector pairs={AVAILABLE_PAIRS} selectedPair={selectedPair} onSelectPair={setSelectedPair} />
          <ExchangeSelector
            exchanges={EXCHANGES}
            selectedExchanges={selectedExchanges}
            onSelectExchanges={setSelectedExchanges}
            connectionStatus={connectionStatus}
          />
          <SoundSettings config={soundConfig} onConfigChange={setSoundConfig} />
          <LayoutCustomizer config={layoutConfig} onConfigChange={setLayoutConfig} />
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-md border transition-colors ${
              showChat
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <TooltipProvider>
            <Tooltip open={showHotkeys} onOpenChange={setShowHotkeys}>
              <TooltipTrigger asChild>
                <button className="p-2 rounded-md border border-border hover:bg-secondary text-muted-foreground hover:text-foreground">
                  <Keyboard className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-48">
                <div className="text-xs space-y-1">
                  <p>
                    <kbd className="px-1 bg-secondary rounded">M</kbd> Toggle sound
                  </p>
                  <p>
                    <kbd className="px-1 bg-secondary rounded">B</kbd> Filter buys
                  </p>
                  <p>
                    <kbd className="px-1 bg-secondary rounded">S</kbd> Filter sells
                  </p>
                  <p>
                    <kbd className="px-1 bg-secondary rounded">F</kbd> Filter futures
                  </p>
                  <p>
                    <kbd className="px-1 bg-secondary rounded">P</kbd> Filter spot
                  </p>
                  <p>
                    <kbd className="px-1 bg-secondary rounded">C</kbd> Toggle chat
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Main Grid */}
      <div
        className={`grid grid-cols-1 gap-3 ${
          layoutConfig.layout === "default"
            ? "lg:grid-cols-12"
            : layoutConfig.layout === "chart-focus"
              ? "lg:grid-cols-10"
              : "lg:grid-cols-8"
        }`}
      >
        {layoutConfig.showOrderBook && (
          <div
            className={`order-3 lg:order-1 ${layoutConfig.layout === "default" ? "lg:col-span-3" : "lg:col-span-2"}`}
          >
            <OrderBook
              symbol={selectedPair.symbol}
              selectedExchanges={selectedExchanges}
              height={layoutConfig.chartHeight}
            />
          </div>
        )}

        <div
          className={`space-y-3 order-1 lg:order-2 ${
            layoutConfig.layout === "default"
              ? layoutConfig.showOrderBook
                ? "lg:col-span-5"
                : "lg:col-span-8"
              : layoutConfig.layout === "chart-focus"
                ? layoutConfig.showOrderBook
                  ? "lg:col-span-5"
                  : "lg:col-span-7"
                : layoutConfig.showOrderBook
                  ? "lg:col-span-4"
                  : "lg:col-span-5"
          }`}
        >
          {layoutConfig.showStats && <MarketStats symbol={selectedPair.symbol} pair={selectedPair} />}
          <TradingViewChart symbol={selectedPair.symbol} height={layoutConfig.chartHeight} />
        </div>

        <div
          className={`order-2 lg:order-3 space-y-3 ${
            layoutConfig.layout === "default"
              ? "lg:col-span-4"
              : layoutConfig.layout === "chart-focus"
                ? "lg:col-span-3"
                : "lg:col-span-3"
          }`}
        >
          <TradeStats trades={filteredTrades} />
          <TapeFilters filters={filters} onFiltersChange={setFilters} exchanges={EXCHANGES} />
          <LiveOrdersPanel
            trades={filteredTrades}
            pair={selectedPair}
            exchanges={EXCHANGES}
            height={layoutConfig.tapeHeight}
          />
        </div>
      </div>

      <TradersChat isOpen={showChat} onClose={() => setShowChat(false)} currentPair={selectedPair.label} />

      <footer className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3" />
          <span>{trades.length} trades captured</span>
        </div>
        <span>|</span>
        <span>Aggregated from {connectedCount} exchanges</span>
        <span>|</span>
        <span className="text-muted-foreground/60">
          Press <kbd className="px-1 bg-secondary rounded text-[10px]">?</kbd> for hotkeys
        </span>
      </footer>
    </div>
  )
}
