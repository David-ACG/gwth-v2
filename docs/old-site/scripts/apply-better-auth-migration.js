#!/usr/bin/env node

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

async function applyMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🔄 Applying Better Auth database migration...");
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, "../better-auth_migrations/2025-09-05T17-56-32.634Z.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");
    
    // Check if tables already exist
    const checkTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user', 'session', 'account', 'verification')
    `);
    
    if (checkTables.rows.length > 0) {
      console.log("⚠️  Some Better Auth tables already exist:");
      checkTables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      
      // Drop existing tables if they exist (be careful in production!)
      console.log("🗑️  Dropping existing Better Auth tables...");
      await pool.query(`
        DROP TABLE IF EXISTS verification CASCADE;
        DROP TABLE IF EXISTS account CASCADE;
        DROP TABLE IF EXISTS session CASCADE;
        DROP TABLE IF EXISTS "user" CASCADE;
      `);
      console.log("✅ Existing tables dropped");
    }
    
    // Apply the migration
    console.log("📝 Creating Better Auth tables...");
    await pool.query(migrationSQL);
    
    // Add indexes for better performance
    console.log("🔧 Adding performance indexes...");
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_email ON "user" (email);
      CREATE INDEX IF NOT EXISTS idx_session_token ON session (token);
      CREATE INDEX IF NOT EXISTS idx_session_userId ON session ("userId");
      CREATE INDEX IF NOT EXISTS idx_account_userId ON account ("userId");
      CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification (identifier);
    `);
    
    // Verify tables were created
    const verifyTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user', 'session', 'account', 'verification')
      ORDER BY table_name
    `);
    
    console.log("\n✅ Better Auth tables created successfully:");
    verifyTables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    // Show table structures
    console.log("\n📊 Table structures:");
    for (const tableName of ['user', 'session', 'account', 'verification']) {
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      console.log(`\n   Table: ${tableName}`);
      columns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      });
    }
    
    console.log("\n🎉 Migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
applyMigration().catch(console.error);