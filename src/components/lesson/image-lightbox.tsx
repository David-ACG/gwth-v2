"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

interface ImageLightboxProps {
  /** Image source URL */
  src: string
  /** Alt text for accessibility */
  alt: string
  /** Image width (for next/image) */
  width: number
  /** Image height (for next/image) */
  height: number
  /** Optional caption below the image in lightbox mode */
  caption?: string
  /** Additional CSS classes for the inline image */
  className?: string
}

/**
 * Click-to-expand image with fullscreen overlay.
 * Uses Motion for scale animation. Closes on Escape key,
 * click outside, or the X button. Maintains aspect ratio
 * and constrains to 90vw x 90vh.
 */
export function ImageLightbox({
  src,
  alt,
  width,
  height,
  caption,
  className,
}: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      {/* Inline image — click to open */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "cursor-zoom-in overflow-hidden rounded-lg transition-shadow hover:shadow-lg",
          className,
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="rounded-lg object-cover"
        />
        {caption && (
          <p className="mt-1.5 text-center text-xs text-muted-foreground">
            {caption}
          </p>
        )}
      </button>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              aria-label="Close lightbox"
            >
              <X className="size-5" />
            </button>

            {/* Image container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
              className="flex max-h-[90vh] max-w-[90vw] flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                width={width * 2}
                height={height * 2}
                className="max-h-[85vh] w-auto rounded-lg object-contain"
              />
              {caption && (
                <p className="mt-3 text-center text-sm text-white/80">
                  {caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
