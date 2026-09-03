import Image from "next/image"
import styles from "./paper.module.css"

/**
 * A stripped-register plate: the light render and its dark-ground twin (the
 * same photograph with only the ground swapped, an image-to-image edit, per
 * the stripped-image-register decision of 2026-09-02). Files live under
 * `public/home/paper/<name>.png` and `<name>-dark.png`, both 1376x768.
 *
 * The page shows one per mode via `.plateLight` / `.plateDark`; the hidden
 * one is lazy so it is not fetched until the mode needs it. Every plate
 * carries `sizes` for the width its column renders at (W26: without it a
 * phone pulls the widest candidate into a 348px slot).
 */
export function Plate({
  name,
  alt,
  sizes,
  priority = false,
}: {
  name: string
  alt: string
  sizes: string
  priority?: boolean
}) {
  return (
    <>
      <Image
        src={`/home/paper/${name}.png`}
        alt={alt}
        width={1376}
        height={768}
        sizes={sizes}
        priority={priority}
        className={styles.plateLight}
      />
      <Image
        src={`/home/paper/${name}-dark.png`}
        alt={alt}
        width={1376}
        height={768}
        sizes={sizes}
        loading="lazy"
        className={styles.plateDark}
      />
    </>
  )
}
