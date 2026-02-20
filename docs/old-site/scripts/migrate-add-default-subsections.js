#!/usr/bin/env node

/**
 * Migration Script: Add Default Subsections to Existing Lessons and Labs
 *
 * This script adds a single default subsection (1.1) to all existing lessons and labs
 * that don't already have subsections. It moves the existing learnContent to the
 * first subsection.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateSubsections() {
  console.log('🚀 Starting subsection migration...');

  try {
    // Get all lessons without subsections
    const lessonsWithoutSubsections = await prisma.lesson.findMany({
      where: {
        subsections: {
          none: {}
        }
      },
      select: {
        id: true,
        title: true,
        learnContent: true
      }
    });

    console.log(`📚 Found ${lessonsWithoutSubsections.length} lessons without subsections`);

    // Create default subsections for lessons
    for (const lesson of lessonsWithoutSubsections) {
      const subsectionTitle = `Introduction to ${lesson.title}`;

      try {
        await prisma.lessonSubsection.create({
          data: {
            lessonId: lesson.id,
            order: 1,
            title: subsectionTitle,
            content: lesson.learnContent || {}
          }
        });

        console.log(`✅ Created subsection for lesson: ${lesson.title}`);
      } catch (error) {
        console.error(`❌ Failed to create subsection for lesson ${lesson.title}:`, error.message);
      }
    }

    // Get all labs without subsections
    const labsWithoutSubsections = await prisma.lab.findMany({
      where: {
        subsections: {
          none: {}
        }
      },
      select: {
        id: true,
        title: true,
        content: true
      }
    });

    console.log(`🧪 Found ${labsWithoutSubsections.length} labs without subsections`);

    // Create default subsections for labs
    for (const lab of labsWithoutSubsections) {
      const subsectionTitle = `Getting Started with ${lab.title}`;

      try {
        await prisma.labSubsection.create({
          data: {
            labId: lab.id,
            order: 1,
            title: subsectionTitle,
            content: lab.content || {}
          }
        });

        console.log(`✅ Created subsection for lab: ${lab.title}`);
      } catch (error) {
        console.error(`❌ Failed to create subsection for lab ${lab.title}:`, error.message);
      }
    }

    console.log('🎉 Migration completed successfully!');

    // Summary report
    const totalLessonSubsections = await prisma.lessonSubsection.count();
    const totalLabSubsections = await prisma.labSubsection.count();

    console.log('\n📊 Migration Summary:');
    console.log(`   • Created default subsections for ${lessonsWithoutSubsections.length} lessons`);
    console.log(`   • Created default subsections for ${labsWithoutSubsections.length} labs`);
    console.log(`   • Total lesson subsections in database: ${totalLessonSubsections}`);
    console.log(`   • Total lab subsections in database: ${totalLabSubsections}`);

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to validate the migration
async function validateMigration() {
  console.log('\n🔍 Validating migration...');

  try {
    // Check for lessons without subsections
    const lessonsWithoutSubsections = await prisma.lesson.count({
      where: {
        subsections: {
          none: {}
        }
      }
    });

    // Check for labs without subsections
    const labsWithoutSubsections = await prisma.lab.count({
      where: {
        subsections: {
          none: {}
        }
      }
    });

    if (lessonsWithoutSubsections === 0 && labsWithoutSubsections === 0) {
      console.log('✅ Validation passed: All lessons and labs have subsections');
    } else {
      console.log(`⚠️  Validation warning: ${lessonsWithoutSubsections} lessons and ${labsWithoutSubsections} labs still without subsections`);
    }

    // Check for duplicate order numbers within lessons/labs
    const duplicateOrders = await prisma.$queryRaw`
      SELECT
        'lesson' as type,
        "lessonId" as parent_id,
        "order",
        COUNT(*) as count
      FROM "lesson_subsections"
      GROUP BY "lessonId", "order"
      HAVING COUNT(*) > 1

      UNION ALL

      SELECT
        'lab' as type,
        "labId" as parent_id,
        "order",
        COUNT(*) as count
      FROM "lab_subsections"
      GROUP BY "labId", "order"
      HAVING COUNT(*) > 1;
    `;

    if (duplicateOrders.length === 0) {
      console.log('✅ Validation passed: No duplicate subsection orders found');
    } else {
      console.log('⚠️  Validation warning: Found duplicate subsection orders:', duplicateOrders);
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
}

// Run the migration
if (require.main === module) {
  migrateSubsections()
    .then(() => validateMigration())
    .catch(console.error);
}

module.exports = { migrateSubsections, validateMigration };