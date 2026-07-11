/**
 * W3 — seeds the `labs` table from the real Month-1 lab set (`m1-labs.ts`,
 * generated from the pipeline lab.md sources). Full-replace inside one
 * transaction: deletes every existing lab row, then inserts the current set.
 * This is required (not a plain upsert) because the picks refilter renumbers
 * lab ids and reassigns the id -> slug pairing, so an upsert-by-id would both
 * leave orphan rows for any lab dropped from the set and hit the UNIQUE(slug)
 * constraint mid-loop when a slug moves to a different id (bead gwth-launch-9u6).
 * Re-running is idempotent: the table always ends up matching m1Labs exactly.
 * The labs table has no inbound foreign keys, so the delete is safe.
 *
 * Usage:
 *   DATABASE_URL=postgres://gwth:devpass@localhost:5443/gwth_v2 \
 *     npx tsx scripts/seed-labs.ts
 */
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { m1Labs } from "../src/lib/data/m1-labs"
import { labs } from "../drizzle/schema"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("DATABASE_URL is required to seed labs")
    process.exit(1)
  }

  const client = postgres(url)
  const db = drizzle(client)

  const rows = m1Labs.map((lab) => ({
    id: lab.id,
    slug: lab.slug,
    title: lab.title,
    description: lab.description,
    difficulty: lab.difficulty,
    duration: lab.duration,
    technologies: lab.technologies,
    learningOutcomes: lab.learningOutcomes,
    prerequisites: lab.prerequisites ?? null,
    content: lab.content,
    instructions: lab.instructions,
    category: lab.category,
    projectType: lab.projectType,
    color: lab.color,
    icon: lab.icon,
    image: lab.image ?? null,
    isPremium: lab.isPremium,
    createdAt: lab.createdAt.toISOString(),
    updatedAt: lab.updatedAt.toISOString(),
  }))

  let seeded = 0
  await db.transaction(async (tx) => {
    await tx.delete(labs)
    for (const values of rows) {
      await tx.insert(labs).values(values)
      seeded++
    }
  })

  console.log(`Seeded ${seeded} labs into ${new URL(url).host} (full replace)`)
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
