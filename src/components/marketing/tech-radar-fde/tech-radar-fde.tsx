"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { TechRadarTool } from "@/lib/types"
import styles from "./tech-radar-fde.module.css"

/** Props for the TechRadarFde component */
interface TechRadarFdeProps {
  /** All tools to display and filter */
  tools: TechRadarTool[]
  /** All available category names */
  categories: string[]
  /** Total tool count for the masthead */
  toolCount: number
  /** Pre-formatted last-updated date (en-GB) */
  formattedDate: string
}

/**
 * Status renders as colour + glyph + text (never colour alone): a leading
 * glyph coloured by token, then the status name in mono.
 */
const STATUS_META: Record<
  TechRadarTool["status"],
  { glyph: string; className: string }
> = {
  GA: { glyph: "●", className: "stGa" },
  Beta: { glyph: "◐", className: "stBeta" },
  Alpha: { glyph: "○", className: "stAlpha" },
  "Research Preview": { glyph: "◌", className: "stPreview" },
  Deprecated: { glyph: "✕", className: "stDeprecated" },
}

/** Maps cost tier to a display label */
const COST_LABELS: Record<TechRadarTool["cost_tier"], string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  open_source: "Open Source",
}

/** All possible status values for the filter */
const ALL_STATUSES: TechRadarTool["status"][] = [
  "GA",
  "Beta",
  "Alpha",
  "Research Preview",
  "Deprecated",
]

/**
 * Tech Radar page in the FDE journal register: drenched teal masthead with
 * mono facts row, square filter controls, and a hairline editorial table
 * (mono headers, serif cells, glyph-coded status). Client component so the
 * search and filter behaviour from the previous skin is preserved.
 */
export function TechRadarFde({
  tools,
  categories,
  toolCount,
  formattedDate,
}: TechRadarFdeProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const filteredTools = useMemo(() => {
    let results = tools

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }

    if (selectedCategory !== "all") {
      results = results.filter((t) => t.category === selectedCategory)
    }

    if (selectedStatus !== "all") {
      results = results.filter((t) => t.status === selectedStatus)
    }

    return results
  }, [tools, searchQuery, selectedCategory, selectedStatus])

  const hasActiveFilters =
    selectedCategory !== "all" || selectedStatus !== "all" || searchQuery.trim()

  function clearAllFilters() {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedStatus("all")
  }

  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <p className={styles.mastheadKicker}>Tech radar · Tracked daily</p>
          <h1 className={styles.mastheadTitle}>
            GWTH <em>Tech Radar</em>
          </h1>
          <p className={styles.standfirst}>
            {toolCount} AI tools tracked daily. Independent. No vendor
            partnerships.
          </p>
          <div className={styles.mastheadFoot}>
            <p>{toolCount} tools tracked</p>
            <p>{categories.length} categories</p>
            <p>Last updated {formattedDate}</p>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="radar-table">
        <div className={styles.page}>
          {/* Filters */}
          <div className={styles.filters}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search tools..."
              aria-label="Search tools"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className={styles.filterSelect}
              aria-label="Filter by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              className={styles.filterSelect}
              aria-label="Filter by status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className={styles.resultsBar}>
            <p className={styles.mono}>
              {filteredTools.length} of {tools.length} tools
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={clearAllFilters}
              >
                ✕ Clear filters
              </button>
            )}
          </div>

          {/* Table */}
          {filteredTools.length === 0 ? (
            <div className={styles.empty}>
              <h3>No tools match your filters</h3>
              <p>Try adjusting your search or clearing some filters.</p>
              <button
                type="button"
                className={styles.buttonOutline}
                onClick={clearAllFilters}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.radarTable}>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Category</th>
                    <th scope="col">Status</th>
                    <th scope="col">Cost</th>
                    <th scope="col" className={styles.descCol}>
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTools.map((tool) => {
                    const status = STATUS_META[tool.status]
                    return (
                      <tr key={tool.slug}>
                        <td className={styles.toolName}>
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {tool.name}
                            <span className={styles.linkGlyph} aria-hidden="true">
                              ↗
                            </span>
                          </a>
                          {tool.is_hot && (
                            <span className={styles.hotFlag}>
                              <i aria-hidden="true">▲</i>
                              Trending
                            </span>
                          )}
                        </td>
                        <td>{tool.category}</td>
                        <td>
                          <span
                            className={`${styles.statusLabel} ${
                              styles[status.className]
                            }`}
                          >
                            <i aria-hidden="true">{status.glyph}</i>
                            {tool.status}
                          </span>
                        </td>
                        <td>
                          <span className={styles.costLabel}>
                            {COST_LABELS[tool.cost_tier]}
                          </span>
                        </td>
                        <td className={styles.descCell}>{tool.description}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            This is the intelligence your team gets{" "}
            <em>as part of the course.</em>
          </h2>
          <p>
            Every tool on this radar is tested, scored, and compared against
            alternatives. When something changes, your course content updates
            the same day.
          </p>
          <div className={styles.closingActions}>
            <Link href="/signup" className={styles.buttonSolid}>
              Join the earlybird waitlist
            </Link>
            <Link href="/" className={styles.buttonOutline}>
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
