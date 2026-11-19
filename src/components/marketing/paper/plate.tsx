import Image from "next/image"
import styles from "./paper.module.css"

/**
 * A stripped-register plate: the light render and its dark-ground twin (the
 * same photograph with only the ground swapped, an image-to-image edit, per
 * the stripped-image-register decision of 2026-09-02). Files live under
 * `public/home/paper/<name>.png` and `<name>-dark.png`, 1376x768 unless
 * `width`/`height` say otherwise (the 13 Nov 2026 paper cutout plates are
 * 1536x1024, 3:2).
 *
 * The page shows one per mode via `.plateLight` / `.plateDark`. Off the hero
 * the hidden one is lazy so it is not fetched until the mode needs it; on the
 * hero (`priority`) BOTH are preloaded, because the mode is a class set by the
 * theme provider, not a media query, so the browser cannot pick the right one
 * itself and a dark-mode visitor's largest paint must not wait on a lazy
 * image (QA finding, N12). next/image serves the optimised size. Every plate
 * carries `sizes` for the width its column renders at (W26: without it a
 * phone pulls the widest candidate into a 348px slot).
 */
export function Plate({
  name,
  alt,
  sizes,
  priority = false,
  width = 1376,
  height = 768,
  ext = "png",
}: {
  name: string
  alt: string
  sizes: string
  priority?: boolean
  width?: number
  height?: number
  /** File type of both renders. The 18 Nov 2026 home draft plates are JPEG
      (22 pictures; as PNG they were 63 MB in the repository). */
  ext?: "png" | "jpg"
}) {
  return (
    <>
      <Image
        src={`/home/paper/${name}.${ext}`}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={styles.plateLight}
      />
      <Image
        src={`/home/paper/${name}-dark.${ext}`}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={styles.plateDark}
      />
    </>
  )
}
