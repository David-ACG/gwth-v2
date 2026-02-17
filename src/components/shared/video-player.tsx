"use client"

import { useState, useRef } from "react"
import { Play, Pause, Maximize, Volume2, VolumeX, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  /** URL of the video to play (MP4, YouTube embed, or other embeddable source) */
  src: string
  /** Accessible label for the video */
  title?: string
  /** Optional poster image shown before play */
  poster?: string
  /** Additional CSS classes for the container */
  className?: string
}

/**
 * Responsive video player wrapper with play/pause overlay, loading state,
 * and error fallback. Uses native HTML5 video for MP4 sources.
 * Designed to be loaded via next/dynamic for code-splitting.
 */
export function VideoPlayer({ src, title, poster, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  function handlePlayPause() {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
      setHasStarted(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current
    if (!video || !video.duration) return
    setProgress((video.currentTime / video.duration) * 100)
  }

  function handleToggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  function handleFullscreen() {
    const video = videoRef.current
    if (!video) return
    if (video.requestFullscreen) {
      video.requestFullscreen()
    }
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const video = videoRef.current
    if (!video || !video.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const fraction = (e.clientX - rect.left) / rect.width
    video.currentTime = fraction * video.duration
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "flex aspect-video items-center justify-center rounded-lg bg-muted",
          className
        )}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <AlertCircle className="size-8" />
          <p className="text-sm">Video failed to load</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setHasError(false)
              setIsLoading(true)
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg bg-black",
        className
      )}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <Skeleton className="absolute inset-0 z-10 aspect-video rounded-lg" />
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        className="aspect-video w-full"
        aria-label={title ?? "Video player"}
        onLoadedData={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={handlePlayPause}
      />

      {/* Play button overlay (shown when not started or paused) */}
      {!isPlaying && !isLoading && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
          aria-label="Play video"
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
            <Play className="ml-1 size-7" />
          </div>
        </button>
      )}

      {/* Controls bar (visible on hover when playing) */}
      {hasStarted && (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
          {/* Progress bar */}
          <div
            className="mb-2 h-1 cursor-pointer rounded-full bg-white/30"
            onClick={handleSeek}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Video progress"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-white hover:bg-white/20 hover:text-white"
              onClick={handlePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-white hover:bg-white/20 hover:text-white"
              onClick={handleToggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </Button>

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-white hover:bg-white/20 hover:text-white"
              onClick={handleFullscreen}
              aria-label="Fullscreen"
            >
              <Maximize className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
