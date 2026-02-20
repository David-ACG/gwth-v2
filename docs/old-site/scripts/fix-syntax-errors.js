#!/usr/bin/env node

const fs = require('fs');

/**
 * Quick fix for syntax errors introduced by the auth migration script
 */

const FILES_TO_FIX = [
  'src/app/api/backend/analytics/student-progress/route.ts',
  'src/app/api/backend/export/analytics/route.ts',
  'src/app/api/backend/users/[id]/route.ts',
  'src/app/api/backend/waitlist/promote/route.ts',
  'src/app/api/backend/whitelist/[id]/route.ts'
];

function fixFile(filePath) {
  console.log(`🔧 Fixing: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // Fix: Add missing closing braces for functions
  if (!content.endsWith('}') && !content.trim().endsWith('}')) {
    // Find the last function and ensure it has proper closing
    const lines = content.split('\n');
    const lastNonEmptyLine = lines[lines.length - 1].trim();

    if (lastNonEmptyLine && !lastNonEmptyLine.endsWith('}')) {
      content = content.trim();
      if (!content.endsWith('}')) {
        content += '\n}\n';
        hasChanges = true;
        console.log('   ✅ Added missing closing brace');
      }
    }
  }

  // Fix: Remove duplicate export statements
  const exportLines = content.split('\n').filter(line => line.trim().startsWith('export async function'));
  if (exportLines.length > 1) {
    // This indicates malformed structure, need to fix manually
    console.log('   ⚠️  Multiple export statements detected - needs manual fix');
  }

  // Fix: Ensure proper function structure
  content = content.replace(/(\s*)(\/\/.*Enhanced admin authentication.*)\n(\s*)(const \{ user, response \} = await adminAuth\(request\);)\n(\s*)(if \(response\) return response;.*)\n\nexport async function/gm,
    (match, indent1, comment, indent2, authLine, indent3, returnLine) => {
      return `${indent1}${comment}\n${indent2}${authLine}\n${indent3}${returnLine}\n\n    // Continue with the rest of the function logic\n    // TODO: Add the original function body here\n\n    return NextResponse.json({ error: 'Not implemented' }, { status: 500 });\n  } catch (error) {\n    console.error('API Error:', error);\n    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });\n  }\n}\n\nexport async function`;
    }
  );

  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log('   💾 File fixed and saved');
  } else {
    console.log('   ✅ File appears correct');
  }
}

function main() {
  console.log('🚀 Fixing syntax errors from auth migration...\n');

  for (const file of FILES_TO_FIX) {
    try {
      fixFile(file);
    } catch (error) {
      console.error(`   ❌ Error fixing ${file}:`, error.message);
    }
  }

  console.log('\n⚠️  Note: Some files may need manual review and completion of function bodies.');
  console.log('    The auth migration added proper authentication but may have broken function structure.');
  console.log('\n✅ Syntax error fixes completed.');
}

if (require.main === module) {
  main();
}