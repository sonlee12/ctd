"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Volume2, VolumeX, Play, Sparkles, Headphones } from "lucide-react"

export type SoundPreset = {
  id: string
  name: string
  description: string
  buyFreq: number
  sellFreq: number
  waveType: OscillatorType
  duration: number
  icon: string
}

export const SOUND_PRESETS: SoundPreset[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean sine waves",
    buyFreq: 880,
    sellFreq: 440,
    waveType: "sine",
    duration: 0.08,
    icon: "🎵",
  },
  {
    id: "arcade",
    name: "Arcade",
    description: "Retro game sounds",
    buyFreq: 1200,
    sellFreq: 300,
    waveType: "square",
    duration: 0.05,
    icon: "🕹️",
  },
  {
    id: "soft",
    name: "Soft",
    description: "Gentle tones",
    buyFreq: 523,
    sellFreq: 392,
    waveType: "sine",
    duration: 0.12,
    icon: "🌊",
  },
  {
    id: "sharp",
    name: "Sharp",
    description: "Quick sawtooth",
    buyFreq: 1000,
    sellFreq: 350,
    waveType: "sawtooth",
    duration: 0.04,
    icon: "⚡",
  },
  {
    id: "deep",
    name: "Deep",
    description: "Low frequency",
    buyFreq: 440,
    sellFreq: 220,
    waveType: "triangle",
    duration: 0.1,
    icon: "🎸",
  },
  {
    id: "high",
    name: "High",
    description: "High pitch alerts",
    buyFreq: 1400,
    sellFreq: 700,
    waveType: "sine",
    duration: 0.06,
    icon: "🔔",
  },
  {
    id: "synth",
    name: "Synth",
    description: "Electronic vibes",
    buyFreq: 660,
    sellFreq: 330,
    waveType: "square",
    duration: 0.07,
    icon: "🎹",
  },
  {
    id: "pulse",
    name: "Pulse",
    description: "Pulsing beats",
    buyFreq: 800,
    sellFreq: 400,
    waveType: "triangle",
    duration: 0.09,
    icon: "💓",
  },
]

export type SoundConfig = {
  enabled: boolean
  preset: string
  volume: number
  whaleAlerts: boolean
  minValueForSound: number
  reverb: boolean
  stereo: boolean
}

type SoundSettingsProps = {
  config: SoundConfig
  onConfigChange: (config: SoundConfig) => void
}

export function SoundSettings({ config, onConfigChange }: SoundSettingsProps) {
  const [open, setOpen] = useState(false)

  const playPreview = (preset: SoundPreset, isBuy: boolean) => {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    // Add stereo panning to preview if enabled
    if (config.stereo) {
      const panner = ctx.createStereoPanner()
      panner.pan.value = isBuy ? -0.4 : 0.4
      osc.connect(gain)
      gain.connect(panner)
      panner.connect(ctx.destination)
    } else {
      osc.connect(gain)
      gain.connect(ctx.destination)
    }

    osc.frequency.value = isBuy ? preset.buyFreq : preset.sellFreq
    osc.type = preset.waveType
    gain.gain.setValueAtTime(config.volume * 0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + preset.duration)
    osc.start()
    osc.stop(ctx.currentTime + preset.duration)
  }

  const currentPreset = SOUND_PRESETS.find((p) => p.id === config.preset) || SOUND_PRESETS[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`bg-card border-border hover:bg-secondary ${config.enabled ? "text-primary" : "text-muted-foreground"}`}
        >
          {config.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-card border-border" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Sound Settings</h4>
            <Switch checked={config.enabled} onCheckedChange={(enabled) => onConfigChange({ ...config, enabled })} />
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Volume: {Math.round(config.volume * 100)}%</Label>
            <Slider
              value={[config.volume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => onConfigChange({ ...config, volume: v })}
              className="w-full"
            />
          </div>

          {/* Sound Presets */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Sound Style</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {SOUND_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onConfigChange({ ...config, preset: preset.id })}
                  className={`
                    flex flex-col items-center gap-0.5 p-2 rounded-md border text-xs transition-all
                    ${config.preset === preset.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary"}
                  `}
                >
                  <span className="text-base">{preset.icon}</span>
                  <span className="text-[10px] truncate w-full text-center">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <Label className="text-xs text-muted-foreground">Audio Effects</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                <div>
                  <Label className="text-xs">Reverb</Label>
                  <p className="text-[10px] text-muted-foreground">Adds space and depth</p>
                </div>
              </div>
              <Switch
                checked={config.reverb ?? true}
                onCheckedChange={(reverb) => onConfigChange({ ...config, reverb })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="w-3.5 h-3.5 text-muted-foreground" />
                <div>
                  <Label className="text-xs">Stereo Pan</Label>
                  <p className="text-[10px] text-muted-foreground">Buys left, sells right</p>
                </div>
              </div>
              <Switch
                checked={config.stereo ?? true}
                onCheckedChange={(stereo) => onConfigChange({ ...config, stereo })}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs bg-[var(--color-buy)]/10 border-[var(--color-buy)]/30 text-[var(--color-buy)] hover:bg-[var(--color-buy)]/20"
              onClick={() => playPreview(currentPreset, true)}
            >
              <Play className="w-3 h-3 mr-1" />
              Buy
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs bg-[var(--color-sell)]/10 border-[var(--color-sell)]/30 text-[var(--color-sell)] hover:bg-[var(--color-sell)]/20"
              onClick={() => playPreview(currentPreset, false)}
            >
              <Play className="w-3 h-3 mr-1" />
              Sell
            </Button>
          </div>

          {/* Whale alerts */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <Label className="text-xs">Whale Alerts</Label>
              <p className="text-[10px] text-muted-foreground">Extra sound for large trades</p>
            </div>
            <Switch
              checked={config.whaleAlerts}
              onCheckedChange={(whaleAlerts) => onConfigChange({ ...config, whaleAlerts })}
            />
          </div>

          {/* Min value */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Min value for sound: ${config.minValueForSound.toLocaleString()}
            </Label>
            <Slider
              value={[config.minValueForSound]}
              min={0}
              max={5000}
              step={100}
              onValueChange={([v]) => onConfigChange({ ...config, minValueForSound: v })}
              className="w-full"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
