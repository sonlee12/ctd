"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, MessageCircle, Users, Smile } from "lucide-react"

type ChatMessage = {
  id: string
  username: string
  message: string
  timestamp: number
  color: string
  reaction?: string
}

type TradersChatProps = {
  isOpen: boolean
  onClose: () => void
  currentPair: string
}

const QUICK_REACTIONS = [
  { emoji: "🚀", label: "Moon" },
  { emoji: "📈", label: "Bullish" },
  { emoji: "📉", label: "Bearish" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "💎", label: "Diamond" },
  { emoji: "🐻", label: "Bear" },
  { emoji: "🐂", label: "Bull" },
  { emoji: "⚠️", label: "Warning" },
]

const USER_COLORS = [
  "#22d3ee", // cyan
  "#a78bfa", // purple
  "#f472b6", // pink
  "#fbbf24", // amber
  "#34d399", // emerald
  "#f97316", // orange
  "#60a5fa", // blue
  "#e879f9", // fuchsia
]

// Simulated messages for demo
const SIMULATED_MESSAGES: Omit<ChatMessage, "id" | "timestamp">[] = [
  { username: "WhaleHunter", message: "Big sell wall at 98k", color: "#22d3ee" },
  { username: "CryptoKing", message: "🚀🚀🚀", color: "#a78bfa" },
  { username: "DipBuyer", message: "Loading up here", color: "#34d399" },
  { username: "ChartMaster", message: "RSI looking oversold on 4H", color: "#f472b6" },
  { username: "SatoshiFan", message: "This is the way", color: "#fbbf24" },
  { username: "TraderJoe", message: "Stop loss hunting incoming", color: "#f97316" },
  { username: "HODLer", message: "Never selling 💎🙌", color: "#60a5fa" },
  { username: "Scalper99", message: "Quick 2% scalp done", color: "#e879f9" },
]

function generateUsername(): string {
  const adjectives = ["Crypto", "Moon", "Diamond", "Whale", "Bull", "Bear", "Degen", "Pro", "Alpha", "Based"]
  const nouns = ["Trader", "Hunter", "Master", "King", "Hands", "Ape", "Chad", "Guru", "Wizard", "Lord"]
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 99)
  return `${adj}${noun}${num}`
}

export function TradersChat({ isOpen, onClose, currentPair }: TradersChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [username, setUsername] = useState("")
  const [userColor, setUserColor] = useState("")
  const [isSettingName, setIsSettingName] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const [showEmojis, setShowEmojis] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize user
  useEffect(() => {
    const savedUsername = localStorage.getItem("cryptoflow-chat-username")
    const savedColor = localStorage.getItem("cryptoflow-chat-color")

    if (savedUsername) {
      setUsername(savedUsername)
      setUserColor(savedColor || USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)])
    } else {
      const newUsername = generateUsername()
      const newColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]
      setUsername(newUsername)
      setUserColor(newColor)
      localStorage.setItem("cryptoflow-chat-username", newUsername)
      localStorage.setItem("cryptoflow-chat-color", newColor)
    }

    // Simulate online users
    setOnlineCount(Math.floor(Math.random() * 150) + 50)
  }, [])

  // Simulate incoming messages
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(
      () => {
        if (Math.random() > 0.6) {
          const simMsg = SIMULATED_MESSAGES[Math.floor(Math.random() * SIMULATED_MESSAGES.length)]
          const newMsg: ChatMessage = {
            id: `sim-${Date.now()}-${Math.random()}`,
            ...simMsg,
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev.slice(-99), newMsg])
        }

        // Fluctuate online count
        setOnlineCount((prev) => Math.max(20, prev + Math.floor(Math.random() * 11) - 5))
      },
      3000 + Math.random() * 4000,
    )

    return () => clearInterval(interval)
  }, [isOpen])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = useCallback(() => {
    if (!inputValue.trim()) return

    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      username,
      message: inputValue.trim(),
      timestamp: Date.now(),
      color: userColor,
    }

    setMessages((prev) => [...prev.slice(-99), newMsg])
    setInputValue("")
    setShowEmojis(false)
  }, [inputValue, username, userColor])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const addEmoji = (emoji: string) => {
    setInputValue((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  const saveUsername = () => {
    if (username.trim()) {
      localStorage.setItem("cryptoflow-chat-username", username)
      setIsSettingName(false)
    }
  }

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 w-80 sm:w-96 h-[500px] bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/30 rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Traders Chat</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded">{currentPair}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{onlineCount}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Username editor */}
      {isSettingName ? (
        <div className="p-3 border-b border-border bg-secondary/20">
          <div className="flex gap-2">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="h-8 text-sm bg-background"
              maxLength={20}
            />
            <Button size="sm" onClick={saveUsername} className="h-8">
              Save
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsSettingName(true)}
          className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-b border-border text-left"
        >
          Chatting as{" "}
          <span style={{ color: userColor }} className="font-medium">
            {username}
          </span>{" "}
          (click to change)
        </button>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-2">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No messages yet</p>
              <p className="text-xs">Be the first to say something!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="group">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-xs truncate" style={{ color: msg.color }}>
                      {msg.username}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">{formatTime(msg.timestamp)}</span>
                  </div>
                  <p className="text-sm text-foreground/90 break-words">{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Quick reactions */}
      {showEmojis && (
        <div className="px-3 py-2 border-t border-border bg-secondary/20">
          <div className="flex flex-wrap gap-1">
            {QUICK_REACTIONS.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => addEmoji(reaction.emoji)}
                className="px-2 py-1 text-base hover:bg-secondary rounded transition-colors"
                title={reaction.label}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border bg-secondary/30 rounded-b-lg">
        <div className="flex gap-2">
          <button
            onClick={() => setShowEmojis(!showEmojis)}
            className={`p-2 rounded-md transition-colors ${
              showEmojis ? "bg-primary/20 text-primary" : "hover:bg-secondary text-muted-foreground"
            }`}
          >
            <Smile className="w-4 h-4" />
          </button>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 h-9 text-sm bg-background"
            maxLength={200}
          />
          <Button size="sm" onClick={sendMessage} disabled={!inputValue.trim()} className="h-9 px-3">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
