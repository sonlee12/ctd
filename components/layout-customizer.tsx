"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Settings2, LayoutGrid, BarChart3, List, RotateCcw } from "lucide-react"

export type LayoutConfig = {
  layout: "default" | "chart-focus" | "tape-focus"
  chartHeight: number
  tapeHeight: number
  showOrderBook: boolean
  showStats: boolean
}

export const DEFAULT_LAYOUT: LayoutConfig = {
  layout: "default",
  chartHeight: 500,
  tapeHeight: 550,
  showOrderBook: true,
  showStats: true,
}

type LayoutCustomizerProps = {
  config: LayoutConfig
  onConfigChange: (config: LayoutConfig) => void
}

export function LayoutCustomizer({ config, onConfigChange }: LayoutCustomizerProps) {
  const [open, setOpen] = useState(false)

  const updateConfig = (updates: Partial<LayoutConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  const resetToDefault = () => {
    onConfigChange(DEFAULT_LAYOUT)
  }

  const applyPreset = (preset: "default" | "chart-focus" | "tape-focus") => {
    switch (preset) {
      case "chart-focus":
        updateConfig({ layout: preset, chartHeight: 700, tapeHeight: 400, showStats: true })
        break
      case "tape-focus":
        updateConfig({ layout: preset, chartHeight: 350, tapeHeight: 700, showStats: false })
        break
      default:
        updateConfig({ layout: preset, chartHeight: 500, tapeHeight: 550, showStats: true })
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Settings2 className="w-4 h-4" />
          <span className="hidden sm:inline">Layout</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center justify-between px-0">
          <span>Customize Layout</span>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={resetToDefault}>
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Layout Presets */}
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground mb-2 block">Quick Presets</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={config.layout === "default" ? "default" : "outline"}
              size="sm"
              className="flex-col h-auto py-2 gap-1"
              onClick={() => applyPreset("default")}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-[10px]">Balanced</span>
            </Button>
            <Button
              variant={config.layout === "chart-focus" ? "default" : "outline"}
              size="sm"
              className="flex-col h-auto py-2 gap-1"
              onClick={() => applyPreset("chart-focus")}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-[10px]">Chart</span>
            </Button>
            <Button
              variant={config.layout === "tape-focus" ? "default" : "outline"}
              size="sm"
              className="flex-col h-auto py-2 gap-1"
              onClick={() => applyPreset("tape-focus")}
            >
              <List className="w-4 h-4" />
              <span className="text-[10px]">Tape</span>
            </Button>
          </div>
        </div>

        {/* Chart Height */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">Chart Height</Label>
            <span className="text-xs font-mono text-primary">{config.chartHeight}px</span>
          </div>
          <Slider
            value={[config.chartHeight]}
            onValueChange={(v) => updateConfig({ chartHeight: v[0] })}
            min={300}
            max={900}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>300</span>
            <span>600</span>
            <span>900</span>
          </div>
        </div>

        {/* Tape Height */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">Tape Height</Label>
            <span className="text-xs font-mono text-primary">{config.tapeHeight}px</span>
          </div>
          <Slider
            value={[config.tapeHeight]}
            onValueChange={(v) => updateConfig({ tapeHeight: v[0] })}
            min={300}
            max={900}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>300</span>
            <span>600</span>
            <span>900</span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Toggle Options */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-orderbook" className="text-xs">
              Show Order Book
            </Label>
            <Switch
              id="show-orderbook"
              checked={config.showOrderBook}
              onCheckedChange={(checked) => updateConfig({ showOrderBook: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-stats" className="text-xs">
              Show Market Stats
            </Label>
            <Switch
              id="show-stats"
              checked={config.showStats}
              onCheckedChange={(checked) => updateConfig({ showStats: checked })}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
