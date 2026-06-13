"use client"

import { useRouter, useSearchParams } from "next/navigation"
import styles from "./labs-fde.module.css"

/**
 * Props for {@link LabsFdeFilter}.
 */
interface LabsFdeFilterProps {
  /** Available lab categories for the category select. */
  categories: string[]
  /** Available technologies for the technology select. */
  technologies: string[]
}

/**
 * Filter bar for the FDE-register labs page: search input plus category,
 * difficulty, and technology selects, all styled to the journal register
 * (flat surfaces, 1px lines, serif text). State syncs to URL search params
 * so filtered views can be shared and bookmarked.
 */
export function LabsFdeFilter({ categories, technologies }: LabsFdeFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/labs?${params.toString()}`)
  }

  return (
    <div className={styles.filterRow}>
      <input
        type="search"
        className={styles.input}
        placeholder="Search labs"
        aria-label="Search labs"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => updateParams("q", e.target.value)}
      />
      <span className={styles.selectWrap}>
        <select
          className={styles.select}
          aria-label="Filter by category"
          defaultValue={searchParams.get("category") ?? "all"}
          onChange={(e) => updateParams("category", e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </span>
      <span className={styles.selectWrap}>
        <select
          className={styles.select}
          aria-label="Filter by difficulty"
          defaultValue={searchParams.get("difficulty") ?? "all"}
          onChange={(e) => updateParams("difficulty", e.target.value)}
        >
          <option value="all">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </span>
      <span className={styles.selectWrap}>
        <select
          className={styles.select}
          aria-label="Filter by technology"
          defaultValue={searchParams.get("technology") ?? "all"}
          onChange={(e) => updateParams("technology", e.target.value)}
        >
          <option value="all">All technologies</option>
          {technologies.map((tech) => (
            <option key={tech} value={tech}>
              {tech}
            </option>
          ))}
        </select>
      </span>
    </div>
  )
}
