"use client"

import { useState, useRef, useEffect } from "react"
import {
  Headphones,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Available playback speeds */
const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2]

interface AudioBarProps {
  /** URL of the audio file */
  src: string
  /** Display duration in seconds (for initial display before metadata loads) */
  duration?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * Compact "Listen to this lesson" audio bar.
 * Features play/pause, progress bar, time display, and speed control.
 * Collapsible to just a headphones icon when not in use.
 */
export function AudioBar({ src, duration, className }: AudioBarProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(duration ?? 0)
  const [speedIndex, setSpeedIndex] = useState(1) // Default: 1x

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function handleTimeUpdate() {
      if (audio) setCurrentTime(audio.currentTime)
    }
    function handleLoadedMetadata() {
      if (audio && audio.duration && isFinite(audio.duration)) {
        setTotalDuration(audio.duration)
      }
    }
    function handleEnded() {
      setIsPlaying(false)
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      audio.play()
      setIsPlaying(true)
      setIsExpanded(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !totalDuration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const fraction = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    )
    audio.currentTime = fraction * totalDuration
  }

  function cycleSpeed() {
    const nextIndex = (speedIndex + 1) % SPEEDS.length
    setSpeedIndex(nextIndex)
    const audio = audioRef.current
    if (audio) audio.playbackRate = SPEEDS[nextIndex]!
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card transition-all",
        className,
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Collapsed bar */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Headphones className="size-4 text-muted-foreground" />
        <span className="flex-1 text-sm text-muted-foreground">
          Listen to this lesson
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-label={isExpanded ? "Collapse audio player" : "Expand audio player"}
        >
          {isExpanded ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </Button>
      </div>

      {/* Expanded controls */}
      {isExpanded && (
        <div className="border-t border-border/50 px-4 pb-3 pt-2">
          {/* Progress bar */}
          <div
            className="mb-2 h-1.5 cursor-pointer rounded-full bg-muted"
            onClick={handleSeek}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Audio progress"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs font-mono"
              onClick={cycleSpeed}
              aria-label={`Playback speed: ${SPEEDS[speedIndex]}x`}
            >
              {SPEEDS[speedIndex]}x
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
