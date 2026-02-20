#!/usr/bin/env node

/**
 * Delete All Test Users
 *
 * This script removes all non-admin users from the database
 * to allow for clean testing of authentication flows.
 *
 * Admin emails that will be preserved:
 * - familyuccelli@gmail.com
 * - yash.makan.22@gmail.com
 * - jonasmortensen35@gmail.com
 * - admin@gwth.ai
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Admin emails to preserve
const ADMIN_EMAILS = [
  'familyuccelli@gmail.com',
  'yash.makan.22@gmail.com',
  'jonasmortensen35@gmail.com',
  'admin@gwth.ai'
];

async function deleteTestUsers() {
  console.log('🔍 Finding all users in database...\n');

  try {
    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        isBetaTester: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total users found: ${allUsers.length}\n`);

    // Separate admin and non-admin users
    const adminUsers = allUsers.filter(u => ADMIN_EMAILS.includes(u.email.toLowerCase()));
    const usersToDelete = allUsers.filter(u => !ADMIN_EMAILS.includes(u.email.toLowerCase()));

    // Show admin users that will be preserved
    console.log(`✅ Admin users to KEEP (${adminUsers.length}):`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
    });

    console.log(`\n❌ Users to DELETE (${usersToDelete.length}):`);
    if (usersToDelete.length === 0) {
      console.log('   No non-admin users found to delete.');
      return;
    }

    usersToDelete.forEach(user => {
      const betaTag = user.isBetaTester ? ' [BETA]' : '';
      console.log(`   - ${user.email}${betaTag} (ID: ${user.id})`);
    });

    // Confirm deletion
    console.log('\n⚠️  WARNING: This will permanently delete the above users and all their data!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Delete non-admin users
    console.log('🗑️  Deleting non-admin users...\n');

    for (const user of usersToDelete) {
      try {
        // Delete related records first (cascade should handle most)

        // Delete sessions
        await prisma.session.deleteMany({
          where: { userId: user.id }
        });

        // Delete accounts
        await prisma.account.deleteMany({
          where: { userId: user.id }
        });

        // Delete the user
        await prisma.user.delete({
          where: { id: user.id }
        });

        console.log(`   ✅ Deleted: ${user.email}`);
      } catch (error) {
        console.error(`   ❌ Failed to delete ${user.email}: ${error.message}`);
      }
    }

    console.log('\n✨ Deletion completed!\n');

    // Show final state
    const remainingUsers = await prisma.user.count();
    console.log(`📊 Final user count: ${remainingUsers}`);

    const finalUsers = await prisma.user.findMany({
      select: {
        email: true,
        createdAt: true
      },
      orderBy: {
        email: 'asc'
      }
    });

    console.log('\n👤 Remaining users:');
    finalUsers.forEach(user => {
      console.log(`   - ${user.email}`);
    });

  } catch (error) {
    console.error('❌ Error during deletion:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting user cleanup for testing...\n');

  try {
    await deleteTestUsers();
    console.log('\n✅ Database is now clean for testing!');
    console.log('   - All non-admin users have been removed');
    console.log('   - Admin accounts preserved for backend access');
    console.log('   - You can now test the full authentication flow\n');
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { deleteTestUsers };