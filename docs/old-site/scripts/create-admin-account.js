#!/usr/bin/env node

/**
 * Create Admin Account
 *
 * Creates a new admin account for david@agilecommercegroup.com
 * with proper Better Auth structure
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminAccount() {
  const email = 'david@agilecommercegroup.com';
  const password = 'Admin@123456'; // Temporary password - should be changed

  console.log('🔧 Creating admin account for:', email);

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('⚠️  User already exists, deleting and recreating...');

      // Delete existing accounts and sessions
      await prisma.account.deleteMany({ where: { userId: existingUser.id } });
      await prisma.session.deleteMany({ where: { userId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });

      console.log('✅ Existing user deleted');
    }

    // Generate Better Auth compatible ID
    const userId = crypto.randomUUID();

    // Create user
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: email,
        emailVerified: true,
        firstName: 'David',
        lastName: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    console.log('✅ User created:', user.id);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create credential account
    const credentialAccount = await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: crypto.randomUUID(),
        providerId: 'credential',
        userId: userId,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    console.log('✅ Credential account created');

    // Create Google OAuth account for flexibility
    const googleAccount = await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: crypto.randomUUID(),
        providerId: 'google',
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    console.log('✅ Google OAuth account created (for OAuth login)');

    console.log('\n✨ Admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', email);
    console.log('Temporary Password:', password);
    console.log('User ID:', userId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Notes:');
    console.log('1. Can login with email/password at /sign-in or /backend/login');
    console.log('2. Can also use Google OAuth at /backend/login');
    console.log('3. Please change password after first login');
    console.log('4. Admin access is configured in better-auth.ts');

    return user;

  } catch (error) {
    console.error('❌ Failed to create admin account:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting admin account creation...\n');

  try {
    await createAdminAccount();
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

module.exports = { createAdminAccount };