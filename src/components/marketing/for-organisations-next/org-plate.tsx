import Image from "next/image"
import p from "@/components/marketing/paper/paper.module.css"

/**
 * One picture of the /for-organisations set: the paper render and its dusk
 * twin, swapped by theme with the shared `.plateLight` / `.plateDark` rules
 * (the theme is a class on <html>, so both are in the page and the hidden one
 * is lazy). Files: `public/organisations/<name>.jpg` and `<name>-dark.jpg`,
 * 1536x1024. Use inside an element carrying `p.plate`.
 *
 * `marketing/paper/plate.tsx` does the same for `public/home/paper/`; this
 * page's pictures live in their own folder, as each rebuilt page's do.
 */
export function OrgPlate({
  name,
  alt,
  sizes,
  priority = false,
}: {
  name: "class" | "team" | "institution" | "marking" | "walkthrough"
  alt: string
  sizes: string
  priority?: boolean
}) {
  return (
    <>
      <Image
        src={`/organisations/${name}.jpg`}
        alt={alt}
        width={1536}
        height={1024}
        sizes={sizes}
        priority={priority}
        className={p.plateLight}
      />
      <Image
        src={`/organisations/${name}-dark.jpg`}
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
