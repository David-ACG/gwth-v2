"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Maximize, Volume2, VolumeX, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/** How long to wait for the video to start loading before showing error (ms) */
const LOAD_TIMEOUT = 8000

/** HTMLMediaElement.HAVE_METADATA: duration and dimensions are known. */
const HAVE_METADATA = 1

interface VideoPlayerProps {
  /** URL of the video to play (MP4, YouTube embed, or other embeddable source) */
  src: string
  /** Accessible label for the video */
  title?: string
  /** Optional poster image shown before play */
  poster?: string
  /** Additional CSS classes for the container */
  className?: string
  /** Called with watched progress as a fraction from 0 to 1 */
  onProgressChange?: (progress: number) => void
}

/**
 * Responsive video player wrapper with play/pause overlay, loading state,
 * and error fallback. Uses native HTML5 video for MP4 sources.
 * Attaches media event listeners via useEffect for reliable error detection
 * (React's onError doesn't reliably fire for media elements).
 * Includes a timeout fallback for URLs that silently fail.
 * Designed to be loaded via next/dynamic for code-splitting.
 */
export function VideoPlayer({
  src,
  title,
  poster,
  className,
  onProgressChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  // Attach media event listeners via native DOM API for reliable error detection.
  // React's onError doesn't reliably fire for <video> / <audio> elements
  // because media error events don't bubble.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function handleReady() {
      setIsLoading(false)
    }

    function handleError() {
      setHasError(true)
      setIsLoading(false)
    }

    function handleTimeUpdate() {
      if (video && video.duration) {
        const progressFraction = video.currentTime / video.duration
        setProgress(progressFraction * 100)
        onProgressChange?.(progressFraction)
      }
    }

    function handleEnded() {
      setIsPlaying(false)
    }

    // `loadedmetadata` as well as `loadeddata`: with preload="metadata" the
    // element settles at HAVE_METADATA and a browser is under no obligation to
    // decode a first frame, so `loadeddata` alone can never arrive. By
    // HAVE_METADATA we have dimensions and duration, which is all the skeleton
    // was covering for.
    video.addEventListener("loadedmetadata", handleReady)
    video.addEventListener("loadeddata", handleReady)
    video.addEventListener("canplay", handleReady)
    video.addEventListener("error", handleError)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("ended", handleEnded)

    // Reconcile with the state the element is ALREADY in. Media events are not
    // replayed for a late listener, and the element regularly reaches
    // readyState 4 before this effect runs (a warm CDN cache does it every
    // time). Without this the skeleton stayed up for ever over a perfectly
    // healthy video, covering it and swallowing the click that would start it
    // — which is exactly what the lesson-1 intro video did on production.
    if (video.error) {
      handleError()
    } else if (video.readyState >= HAVE_METADATA) {
      handleReady()
    }

    // Timeout fallback: if the video still has nothing after LOAD_TIMEOUT ms,
    // treat it as an error. Anything past HAVE_NOTHING is working, so clear the
    // skeleton rather than leaving the viewer staring at it.
    const timeout = setTimeout(() => {
      if (video.readyState === 0) {
        handleError()
      } else {
        handleReady()
      }
    }, LOAD_TIMEOUT)

    return () => {
      video.removeEventListener("loadedmetadata", handleReady)
      video.removeEventListener("loadeddata", handleReady)
      video.removeEventListener("canplay", handleReady)
      video.removeEventListener("error", handleError)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("ended", handleEnded)
      clearTimeout(timeout)
    }
  }, [src, onProgressChange])

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
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted-foreground/10">
            <AlertCircle className="size-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Video unavailable</p>
            <p className="mt-0.5 text-xs">This video could not be loaded.</p>
          </div>
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
      {/* Loading skeleton. pointer-events-none is deliberate: if this ever
          lingers again the viewer can still click through to the video rather
          than being locked out by a decorative overlay. */}
      {isLoading && (
        <Skeleton className="pointer-events-none absolute inset-0 z-10 aspect-video rounded-lg" />
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        className="aspect-video w-full"
        aria-label={title ?? "Video player"}
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
