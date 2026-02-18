"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Available playback speed options */
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

interface AudioPlayerProps {
  /** URL of the audio file */
  src: string
  /** Display title for the audio */
  title?: string
  /** Total duration in seconds (for display before audio loads) */
  duration?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * Inline audio player with playback speed control, progress bar,
 * and time display. Uses native HTML5 audio element.
 * Designed to be loaded via next/dynamic for code-splitting.
 */
export function AudioPlayer({ src, title, duration: propDuration, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(propDuration ?? 0)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function handleLoadedMetadata() {
      if (audio) setDuration(audio.duration)
    }

    function handleTimeUpdate() {
      if (audio) setCurrentTime(audio.currentTime)
    }

    function handleEnded() {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    function handleError() {
      setHasError(true)
      setIsPlaying(false)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    // Timeout fallback: if audio hasn't loaded metadata after 8s, treat as error.
    // Some URLs silently fail without firing the error event.
    const timeout = setTimeout(() => {
      if (audio.readyState === 0) {
        handleError()
      }
    }, 8000)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      clearTimeout(timeout)
    }
  }, [src])

  function handlePlayPause() {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  function handleToggleMute() {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setIsMuted(audio.muted)
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const fraction = (e.clientX - rect.left) / rect.width
    audio.currentTime = fraction * duration
  }

  function cycleSpeed() {
    const audio = audioRef.current
    if (!audio) return
    const currentIndex = SPEED_OPTIONS.indexOf(speed as (typeof SPEED_OPTIONS)[number])
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length
    const newSpeed = SPEED_OPTIONS[nextIndex]
    audio.playbackRate = newSpeed
    setSpeed(newSpeed)
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border bg-card p-4",
          className
        )}
      >
        <AlertCircle className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Audio failed to load</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-4",
        className
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause */}
      <Button
        variant="ghost"
        size="icon"
        className="size-10 shrink-0 rounded-full bg-primary/10 hover:bg-primary/20"
        onClick={handlePlayPause}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        {isPlaying ? (
          <Pause className="size-4 text-primary" />
        ) : (
          <Play className="ml-0.5 size-4 text-primary" />
        )}
      </Button>

      {/* Info + Progress */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {title && (
          <p className="truncate text-sm font-medium">{title}</p>
        )}

        {/* Progress bar */}
        <div
          className="h-1.5 cursor-pointer rounded-full bg-muted"
          onClick={handleSeek}
          role="progressbar"
          aria-valuenow={Math.round(currentTime)}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-label="Audio progress"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
        </div>
      </div>

      {/* Speed control */}
      <Button
        variant="outline"
        size="sm"
        className="h-7 shrink-0 px-2 text-xs font-mono"
        onClick={cycleSpeed}
        aria-label={`Playback speed: ${speed}x. Click to change.`}
      >
        {speed}x
      </Button>

      {/* Mute toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={handleToggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="size-4" />
        ) : (
          <Volume2 className="size-4" />
        )}
      </Button>
    </div>
  )
}
