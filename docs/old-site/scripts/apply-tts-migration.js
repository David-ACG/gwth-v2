#!/usr/bin/env node

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

async function applyTTSMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🔄 Applying TTS enhancement database migration...");
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, "../prisma/migrations/20250906_add_tts_enhancements/migration.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");
    
    // Apply the migration
    console.log("📝 Executing migration SQL...");
    await pool.query(migrationSQL);
    
    // Verify the new columns were added
    console.log("✅ Verifying migration results...");
    
    const lessonsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'lessons' 
      AND column_name IN ('audio_timestamps', 'content_hash', 'audio_outdated')
      ORDER BY column_name
    `);
    
    const labsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'labs' 
      AND column_name IN ('audio_timestamps', 'content_hash', 'audio_outdated')
      ORDER BY column_name
    `);
    
    console.log("\n📊 New columns added:");
    console.log("\nLessons table:");
    lessonsColumns.rows.forEach(row => {
      console.log(`   ✓ ${row.column_name}: ${row.data_type}`);
    });
    
    console.log("\nLabs table:");
    labsColumns.rows.forEach(row => {
      console.log(`   ✓ ${row.column_name}: ${row.data_type}`);
    });
    
    // Check indexes
    const indexes = await pool.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename IN ('lessons', 'labs') 
      AND indexname LIKE '%audio%' OR indexname LIKE '%content_hash%'
      ORDER BY tablename, indexname
    `);
    
    console.log("\n🔍 Indexes created:");
    indexes.rows.forEach(row => {
      console.log(`   ✓ ${row.indexname} on ${row.tablename}`);
    });
    
    console.log("\n🎉 TTS enhancement migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
applyTTSMigration().catch(console.error);