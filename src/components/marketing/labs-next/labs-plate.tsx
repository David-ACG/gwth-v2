import Image from "next/image"
import p from "@/components/marketing/paper/paper.module.css"

/**
 * A paper cutout picture for the Labs page: the paper render and its dusk
 * twin, swapped by theme with the shared `.plateLight` / `.plateDark` recipe
 * (the one `paper/plate.tsx` uses for the home page). Files live in
 * `public/labs/<name>.jpg` and `<name>-dark.jpg`, 1536 by 1024.
 *
 * Use it inside a `<figure className={p.plate}>`. The hidden render is lazy
 * unless `priority` is set, when both are preloaded (the theme is a class,
 * not a media query, so the browser cannot choose for itself).
 */
export function LabsPlate({
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
        src={`/labs/${name}.jpg`}
        alt={alt}
        width={1536}
        height={1024}
        sizes={sizes}
        priority={priority}
        className={p.plateLight}
      />
      <Image
        src={`/labs/${name}-dark.jpg`}
        alt={alt}
        width={1536}
        height={1024}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={p.plateDark}
      />
    </>
  )
}
