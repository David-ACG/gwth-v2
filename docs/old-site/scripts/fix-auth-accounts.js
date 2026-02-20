#!/usr/bin/env node

/**
 * Fix Better Auth Account Records
 *
 * This script creates missing credential account records for users who were
 * created through Google OAuth but need email/password authentication.
 *
 * Usage: node scripts/fix-auth-accounts.js
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createCredentialAccount(userId, email, password = null) {
  try {
    // Hash password if provided, otherwise use a temporary hash
    const hashedPassword = password ?
      await bcrypt.hash(password, 12) :
      await bcrypt.hash('TEMP_HASH_' + crypto.randomUUID(), 12);

    const accountId = crypto.randomUUID();

    const account = await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: accountId,
        providerId: 'credential',
        userId: userId,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    console.log(`✅ Created credential account for user ${email}`);
    return account;
  } catch (error) {
    console.error(`❌ Failed to create credential account for ${email}:`, error);
    throw error;
  }
}

async function fixUserAccounts() {
  console.log('🔍 Checking for users without credential accounts...');

  try {
    // Find users who don't have credential accounts
    const usersWithoutCredentials = await prisma.user.findMany({
      where: {
        accounts: {
          none: {
            providerId: 'credential'
          }
        }
      },
      include: {
        accounts: true
      }
    });

    if (usersWithoutCredentials.length === 0) {
      console.log('✅ All users already have credential accounts');
      return;
    }

    console.log(`📊 Found ${usersWithoutCredentials.length} users without credential accounts:`);

    for (const user of usersWithoutCredentials) {
      console.log(`   - ${user.email} (has ${user.accounts.length} other accounts)`);
    }

    // Create credential accounts for these users
    for (const user of usersWithoutCredentials) {
      console.log(`\n🔧 Creating credential account for ${user.email}...`);

      // Check if user has Google OAuth account
      const hasGoogleAccount = user.accounts.some(acc => acc.providerId === 'google');

      if (hasGoogleAccount) {
        console.log(`   - User has Google OAuth account, creating credential account for migration`);
      }

      await createCredentialAccount(user.id, user.email);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Users can now sign in with email/password');
    console.log('   2. They should set their password through the "forgot password" flow');
    console.log('   3. Or continue using Google OAuth');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Better Auth account migration...\n');

  try {
    await fixUserAccounts();
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

module.exports = { createCredentialAccount, fixUserAccounts };