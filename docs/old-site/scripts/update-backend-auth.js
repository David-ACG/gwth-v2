#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to update all backend API routes to use new admin authentication
 * Replaces temp cookie authentication with Better Auth + role-based access
 */

const BACKEND_API_DIR = 'src/app/api/backend';
const ADMIN_API_DIR = 'src/app/api/admin';

// Old authentication pattern to replace
const OLD_AUTH_PATTERN = /\/\/\s*Check\s+for\s+admin\s+authentication.*?\n.*?const\s+tempAdminCookie\s*=.*?\n.*?if\s*\([^}]*\{\s*\n.*?return\s+NextResponse\.json\([^}]*\n.*?\}\s*\}/gms;

// Alternative patterns
const ALT_PATTERNS = [
  /const\s+tempAdminCookie\s*=.*?request\.cookies\.get\(['"`]temp_admin_session['"`]\).*?\n.*?if\s*\([^}]*tempAdminCookie[^}]*\)\s*\{[^}]*return\s+NextResponse\.json[^}]*\}/gms,
  /\/\/.*temp.*admin.*\n.*?const\s+tempAdminCookie.*?\n.*?if\s*\(.*?tempAdminCookie.*?\{.*?return.*?NextResponse\.json.*?\}/gms
];

// New authentication code
const NEW_AUTH_CODE = `    // ✨ Enhanced admin authentication with Better Auth + role-based access
    const { user, response } = await adminAuth(request);
    if (response) return response; // Return 401 if not authenticated`;

function updateFile(filePath) {
  console.log(`\n📄 Processing: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Check if file already has new auth
  if (content.includes('adminAuth')) {
    console.log('   ✅ Already using new auth system');
    return false;
  }

  // Check if file has temp admin auth to replace
  if (!content.includes('temp_admin_session')) {
    console.log('   ⏭️  No temp auth found - skipping');
    return false;
  }

  // Add import if not present
  if (!content.includes('adminAuth') && !content.includes('@/lib/admin-middleware')) {
    const importMatch = content.match(/import.*from.*['"`]@\/lib\/.*['"`];/);
    if (importMatch) {
      const lastImportIndex = content.lastIndexOf(importMatch[0]) + importMatch[0].length;
      content = content.slice(0, lastImportIndex) +
                '\nimport { adminAuth } from \'@/lib/admin-middleware\';' +
                content.slice(lastImportIndex);
      updated = true;
      console.log('   📦 Added adminAuth import');
    } else {
      // Add after the last import
      const lines = content.split('\n');
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          insertIndex = i + 1;
        }
      }
      lines.splice(insertIndex, 0, 'import { adminAuth } from \'@/lib/admin-middleware\';');
      content = lines.join('\n');
      updated = true;
      console.log('   📦 Added adminAuth import at line', insertIndex + 1);
    }
  }

  // Replace old auth patterns
  for (const pattern of [OLD_AUTH_PATTERN, ...ALT_PATTERNS]) {
    if (pattern.test(content)) {
      content = content.replace(pattern, NEW_AUTH_CODE);
      updated = true;
      console.log('   🔄 Replaced temp auth with new auth system');
      break;
    }
  }

  // Handle simple temp cookie checks
  if (content.includes('temp_admin_session') && !updated) {
    // Find the function start
    const functionMatch = content.match(/export\s+async\s+function\s+\w+\s*\([^)]*\)\s*\{/);
    if (functionMatch) {
      const functionStart = content.indexOf(functionMatch[0]) + functionMatch[0].length;
      const tryMatch = content.slice(functionStart).match(/\s*try\s*\{/);
      if (tryMatch) {
        const insertPoint = functionStart + tryMatch.index + tryMatch[0].length;
        content = content.slice(0, insertPoint) + '\n' + NEW_AUTH_CODE + '\n' + content.slice(insertPoint);
        updated = true;
        console.log('   ✨ Added new auth at function start');
      }
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log('   💾 File updated successfully');
    return true;
  } else {
    console.log('   ⚠️  Could not automatically update - manual review needed');
    return false;
  }
}

function findRouteFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return files;
  }

  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item === 'route.ts' || item === 'route.js') {
        files.push(fullPath);
      }
    }
  }

  scanDirectory(dir);
  return files;
}

async function main() {
  console.log('🚀 Backend Authentication Migration Tool\n');
  console.log('This script will update all backend API routes to use the new admin authentication system.\n');

  // Find all route files
  const backendRoutes = findRouteFiles(BACKEND_API_DIR);
  const adminRoutes = findRouteFiles(ADMIN_API_DIR);
  const allRoutes = [...backendRoutes, ...adminRoutes];

  console.log(`📊 Found ${allRoutes.length} route files to process:`);
  allRoutes.forEach(file => console.log(`   • ${file}`));

  console.log('\n🔄 Processing files...');

  let updatedCount = 0;
  let errorCount = 0;

  for (const routeFile of allRoutes) {
    try {
      const wasUpdated = updateFile(routeFile);
      if (wasUpdated) {
        updatedCount++;
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${routeFile}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📈 Migration Summary:');
  console.log(`   ✅ Files processed: ${allRoutes.length}`);
  console.log(`   🔄 Files updated: ${updatedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  if (updatedCount > 0) {
    console.log('\n🎉 Migration completed! Next steps:');
    console.log('   1. Test the updated routes');
    console.log('   2. Build and restart the application');
    console.log('   3. Verify admin authentication works');
    console.log('   4. Remove temp cookie fallbacks after testing');
  }

  if (errorCount > 0) {
    console.log('\n⚠️  Some files need manual review. Check the output above for details.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateFile, findRouteFiles };