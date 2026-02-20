#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function runMigration() {
  console.log('🚀 Starting Admin Role Migration...\n');

  const client = await pool.connect();

  try {
    console.log('📊 Current user table structure:');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'user' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.table(tableInfo.rows);

    // Check if role column already exists
    const roleColumnExists = tableInfo.rows.some(row => row.column_name === 'role');

    if (roleColumnExists) {
      console.log('✅ Role column already exists. Checking current roles...\n');
    } else {
      console.log('📝 Adding role column to user table...\n');

      // Add role column
      await client.query(`
        ALTER TABLE "user"
        ADD COLUMN "role" VARCHAR(20) DEFAULT 'user'
        CHECK ("role" IN ('user', 'admin', 'super_admin'))
      `);

      console.log('✅ Role column added successfully\n');
    }

    // Check current admin users
    console.log('👤 Checking existing admin users:');
    const existingAdmins = await client.query(`
      SELECT id, name, email, role, "emailVerified", "createdAt"
      FROM "user"
      WHERE email = 'david@agilecommercegroup.com'
    `);

    if (existingAdmins.rows.length === 0) {
      console.log('⚠️  Admin user not found. Creating admin user...\n');

      // Create admin user if doesn't exist
      await client.query(`
        INSERT INTO "user" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid()::text,
          'David Admin',
          'david@agilecommercegroup.com',
          true,
          'admin',
          NOW(),
          NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
          role = 'admin',
          "updatedAt" = NOW()
      `);

      console.log('✅ Admin user created/updated\n');
    } else {
      console.table(existingAdmins.rows);

      // Ensure admin has admin role
      if (existingAdmins.rows[0].role !== 'admin') {
        console.log('📝 Updating admin user role...\n');

        await client.query(`
          UPDATE "user"
          SET role = 'admin', "updatedAt" = NOW()
          WHERE email = 'david@agilecommercegroup.com'
        `);

        console.log('✅ Admin role updated\n');
      } else {
        console.log('✅ Admin user already has admin role\n');
      }
    }

    // Create indexes for performance
    console.log('📊 Creating performance indexes...');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_role ON "user" ("role")
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_email_role ON "user" ("email", "role")
    `);

    console.log('✅ Indexes created\n');

    // Final verification
    console.log('🔍 Final verification - All users with roles:');
    const finalCheck = await client.query(`
      SELECT id, name, email, role, "emailVerified", "createdAt"
      FROM "user"
      WHERE role IS NOT NULL
      ORDER BY "createdAt" DESC
    `);

    if (finalCheck.rows.length > 0) {
      console.table(finalCheck.rows);
    } else {
      console.log('No users with roles found');
    }

    // Check admin count
    const adminCount = await client.query(`
      SELECT COUNT(*) as admin_count FROM "user" WHERE role = 'admin'
    `);

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📈 Total admins: ${adminCount.rows[0].admin_count}`);
    console.log(`🔐 Admin access ready for Better Auth integration\n`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await runMigration();
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runMigration };