/**
 * W3 — seeds the `labs` table from the real Month-1 lab set (`m1-labs.ts`,
 * generated from the pipeline lab.md sources). Idempotent: upserts on the lab
 * id so re-running refreshes content without duplicating rows.
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

  let seeded = 0
  for (const lab of m1Labs) {
    const values = {
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
    }
    await db
      .insert(labs)
      .values(values)
      .onConflictDoUpdate({ target: labs.id, set: values })
    seeded++
  }

  console.log(`Seeded ${seeded} labs into ${new URL(url).host}`)
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
