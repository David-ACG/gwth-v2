#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need to be updated
const filesToUpdate = [
  '/var/www/gwth-ai/src/app/api/admin/upload/image/route.ts',
  '/var/www/gwth-ai/src/app/api/admin/upload/video/route.ts',
  '/var/www/gwth-ai/src/app/api/admin/restore/lesson/route.ts',
  '/var/www/gwth-ai/src/app/api/admin/backup/lesson/[id]/route.ts',
  '/var/www/gwth-ai/src/app/api/admin/backup/lab/[id]/route.ts',
  '/var/www/gwth-ai/src/app/api/admin/backup/database/route.ts',
  '/var/www/gwth-ai/src/app/api/stripe/checkout/route.ts',
  '/var/www/gwth-ai/src/app/api/debug/auth-test/route.ts',
  '/var/www/gwth-ai/src/app/api/debug/lessons-progress/route.ts',
  '/var/www/gwth-ai/src/app/api/debug/user-session/route.ts',
];

// Add the Better Auth import at the top
const betterAuthImport = `import { requireAuth } from '@/lib/better-auth';`;

// Update each file
filesToUpdate.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add Better Auth import if not present
    if (!content.includes("import { requireAuth }") && !content.includes("import { getSession }")) {
      // Add import after the NextRequest/NextResponse import
      content = content.replace(
        /(import { NextRequest, NextResponse } from 'next\/server';)/,
        `$1\n${betterAuthImport}`
      );
    }
    
    // Replace auth() calls with Better Auth
    content = content.replace(
      /const { userId } = await auth\(\);/g,
      `const session = await requireAuth(request);
    const userId = session.user.id;`
    );
    
    content = content.replace(
      /const { userId, sessionClaims } = await auth\(\);/g,
      `const session = await requireAuth(request);
    const userId = session.user.id;
    const sessionClaims = {};`
    );
    
    content = content.replace(
      /const { userId: clerkUserId } = await auth\(\);/g,
      `const session = await requireAuth(request);
    const clerkUserId = session.user.id;`
    );
    
    // Remove Clerk imports
    content = content.replace(
      /import { clerkClient } from '@clerk\/nextjs\/server';?\n?/g,
      ''
    );
    
    content = content.replace(
      /const { clerkClient } = await import\('@clerk\/nextjs\/server'\);?\n?/g,
      ''
    );
    
    // Replace Clerk user checks with Better Auth
    content = content.replace(
      /const client = await clerkClient\(\);?\n\s*const user = await client\.users\.getUser\(userId\);/g,
      `const user = session.user;`
    );
    
    // Update email address access
    content = content.replace(
      /user\.primaryEmailAddress\?\.emailAddress/g,
      'user.email'
    );
    
    // Write back the updated content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log('\n🎉 Auth usage update complete!');