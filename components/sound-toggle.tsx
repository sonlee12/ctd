"use client"

import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type SoundToggleProps = {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function SoundToggle({ enabled, onToggle }: SoundToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onToggle(!enabled)}
            className={`bg-card border-border hover:bg-secondary ${enabled ? "text-primary" : "text-muted-foreground"}`}
          >
            {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{enabled ? "Mute trade sounds" : "Enable trade sounds"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
