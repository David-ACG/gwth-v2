#!/usr/bin/env node

/**
 * Backup Script: Preserve Lesson Hierarchy
 *
 * This script creates a backup of the current lesson hierarchy relationships
 * to prevent accidental data loss when updating lessons.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function backupLessonHierarchy() {
  console.log('🔒 Creating Lesson Hierarchy Backup...');

  try {
    // Fetch all lessons with hierarchy data
    const lessons = await prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        parentLessonId: true,
        isMainLesson: true,
        subLessonOrder: true,
        month: true,
        week: true,
        previousLessonId: true,
        nextLessonId: true
      },
      orderBy: [
        { month: 'asc' },
        { week: 'asc' },
        { subLessonOrder: 'asc' },
        { title: 'asc' }
      ]
    });

    // Create backup object
    const backup = {
      timestamp: new Date().toISOString(),
      totalLessons: lessons.length,
      mainLessons: lessons.filter(l => l.isMainLesson).length,
      subLessons: lessons.filter(l => !l.isMainLesson).length,
      lessonsWithParent: lessons.filter(l => l.parentLessonId).length,
      data: lessons
    };

    // Create backups directory if it doesn't exist
    const backupsDir = path.join(process.cwd(), 'backups', 'lesson-hierarchy');
    await fs.mkdir(backupsDir, { recursive: true });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const time = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
    const filename = `lesson-hierarchy-${timestamp}-${time}.json`;
    const filepath = path.join(backupsDir, filename);

    // Write backup file
    await fs.writeFile(filepath, JSON.stringify(backup, null, 2));

    console.log('✅ Backup created successfully!');
    console.log(`📁 File: ${filepath}`);
    console.log(`📊 Stats:`);
    console.log(`   - Total Lessons: ${backup.totalLessons}`);
    console.log(`   - Main Lessons: ${backup.mainLessons}`);
    console.log(`   - Sub-Lessons: ${backup.subLessons}`);
    console.log(`   - Lessons with Parent: ${backup.lessonsWithParent}`);

    // Keep only last 10 backups
    const files = await fs.readdir(backupsDir);
    const backupFiles = files.filter(f => f.startsWith('lesson-hierarchy-')).sort();

    if (backupFiles.length > 10) {
      const filesToDelete = backupFiles.slice(0, backupFiles.length - 10);
      for (const file of filesToDelete) {
        await fs.unlink(path.join(backupsDir, file));
        console.log(`🗑️  Deleted old backup: ${file}`);
      }
    }

    return filepath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// If run directly
if (require.main === module) {
  backupLessonHierarchy()
    .then(() => {
      console.log('\n💡 Tip: Run this script before any major lesson updates!');
      console.log('   You can restore from backup using: node scripts/restore-from-backup.js');
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { backupLessonHierarchy };