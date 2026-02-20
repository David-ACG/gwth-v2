#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runMigration() {
  console.log('🚀 Starting Admin Role Migration using Prisma...\n');

  try {
    // First, let's check if we can connect to the database
    console.log('🔌 Testing database connection...');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful\n');

    // Check current table structure
    console.log('📊 Checking current user table structure...');
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'user' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    console.log('Current user table columns:');
    console.table(tableInfo);

    // Check if role column exists
    const roleColumnExists = tableInfo.some(row => row.column_name === 'role');

    if (!roleColumnExists) {
      console.log('📝 Adding role column to user table...');

      // Add role column using raw SQL
      await prisma.$executeRaw`
        ALTER TABLE "user"
        ADD COLUMN "role" VARCHAR(20) DEFAULT 'user'
        CHECK ("role" IN ('user', 'admin', 'super_admin'))
      `;

      console.log('✅ Role column added successfully\n');
    } else {
      console.log('✅ Role column already exists\n');
    }

    // Check for existing admin user
    console.log('👤 Checking for existing admin user...');
    const existingAdmin = await prisma.$queryRaw`
      SELECT id, name, email, role, "emailVerified", "createdAt"
      FROM "user"
      WHERE email = 'david@agilecommercegroup.com'
    `;

    console.log('Existing admin users:');
    console.table(existingAdmin);

    if (existingAdmin.length === 0) {
      console.log('⚠️  Admin user not found. This might be expected if using Clerk legacy user table.\n');
      console.log('📝 Creating admin user in Better Auth user table...');

      // Create admin user
      await prisma.$executeRaw`
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
      `;

      console.log('✅ Admin user created\n');
    } else {
      // Update existing user to admin role
      console.log('📝 Ensuring admin user has admin role...');
      await prisma.$executeRaw`
        UPDATE "user"
        SET role = 'admin', "updatedAt" = NOW()
        WHERE email = 'david@agilecommercegroup.com'
      `;
      console.log('✅ Admin role updated\n');
    }

    // Create indexes for performance
    console.log('📊 Creating performance indexes...');

    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_user_role ON "user" ("role")
      `;

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_user_email_role ON "user" ("email", "role")
      `;

      console.log('✅ Performance indexes created\n');
    } catch (indexError) {
      console.log('⚠️  Index creation skipped (may already exist)\n');
    }

    // Final verification
    console.log('🔍 Final verification - All users:');
    const allUsers = await prisma.$queryRaw`
      SELECT id, name, email, role, "emailVerified", "createdAt"
      FROM "user"
      ORDER BY "createdAt" DESC
    `;

    console.table(allUsers);

    // Check admin count
    const adminCount = await prisma.$queryRaw`
      SELECT COUNT(*) as admin_count FROM "user" WHERE role = 'admin'
    `;

    const adminCountNum = Number(adminCount[0].admin_count);

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📈 Total admins: ${adminCountNum}`);
    console.log(`🔐 Admin access ready for Better Auth integration\n`);

    if (adminCountNum === 0) {
      console.log('⚠️  WARNING: No admin users found. You may need to manually create an admin user.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await runMigration();
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runMigration };