#!/usr/bin/env node

/**
 * Recovery Script: Restore Sub-Lessons Hierarchy
 *
 * This script helps recover sub-lessons that were accidentally reset to main lessons.
 * It can restore the parent-child relationship based on patterns.
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function restoreSubLessons() {
  console.log('🔧 Sub-Lesson Recovery Tool');
  console.log('=' .repeat(50));
  console.log('This tool will help you restore sub-lessons that were reset to main lessons.');
  console.log('');

  try {
    // Show current statistics
    const stats = await prisma.lesson.groupBy({
      by: ['isMainLesson'],
      _count: true
    });

    const totalLessons = await prisma.lesson.count();
    const lessonsWithParent = await prisma.lesson.count({
      where: { parentLessonId: { not: null } }
    });

    console.log('📊 Current Database State:');
    console.log(`   Total Lessons: ${totalLessons}`);
    console.log(`   Main Lessons: ${stats.find(s => s.isMainLesson === true)?._count || 0}`);
    console.log(`   Sub-Lessons: ${stats.find(s => s.isMainLesson === false)?._count || 0}`);
    console.log(`   Lessons with Parent: ${lessonsWithParent}`);
    console.log('');

    // Fetch lessons grouped by month
    const lessonsByMonth = await prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
        month: true,
        week: true,
        slug: true,
        isMainLesson: true,
        parentLessonId: true
      },
      orderBy: [
        { month: 'asc' },
        { week: 'asc' },
        { title: 'asc' }
      ]
    });

    // Group by month for display
    const months = {};
    lessonsByMonth.forEach(lesson => {
      const monthKey = lesson.month || 0;
      if (!months[monthKey]) months[monthKey] = [];
      months[monthKey].push(lesson);
    });

    console.log('📅 Lessons by Month:');
    for (const [month, lessons] of Object.entries(months)) {
      console.log(`\n   Month ${month}: ${lessons.length} lessons`);

      // Show first few lessons as examples
      lessons.slice(0, 3).forEach(lesson => {
        const status = lesson.isMainLesson ? '📚' : '📖';
        const parent = lesson.parentLessonId ? ' (has parent)' : '';
        console.log(`      ${status} ${lesson.title}${parent}`);
      });

      if (lessons.length > 3) {
        console.log(`      ... and ${lessons.length - 3} more`);
      }
    }

    console.log('\n' + '=' .repeat(50));
    console.log('Recovery Options:');
    console.log('1. Restore by title pattern (e.g., lessons containing "Lab" or "Exercise")');
    console.log('2. Restore by month (make all lessons in month X sub-lessons of a parent)');
    console.log('3. Manual selection (choose specific lessons to make sub-lessons)');
    console.log('4. Restore from backup (if available)');
    console.log('5. Exit');

    const choice = await question('\nSelect option (1-5): ');

    switch(choice) {
      case '1':
        await restoreByPattern();
        break;
      case '2':
        await restoreByMonth();
        break;
      case '3':
        await manualSelection();
        break;
      case '4':
        console.log('\n⚠️  Backup restoration requires manual database restore.');
        console.log('   Contact your system administrator.');
        break;
      case '5':
        console.log('Exiting...');
        break;
      default:
        console.log('Invalid option');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

async function restoreByPattern() {
  const pattern = await question('\nEnter pattern to search for in titles (e.g., "Lab", "Exercise", "Part"): ');

  const matchingLessons = await prisma.lesson.findMany({
    where: {
      title: {
        contains: pattern,
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      title: true,
      month: true
    }
  });

  console.log(`\nFound ${matchingLessons.length} lessons matching "${pattern}"`);

  if (matchingLessons.length === 0) return;

  matchingLessons.slice(0, 10).forEach(lesson => {
    console.log(`   - ${lesson.title} (Month ${lesson.month || 'N/A'})`);
  });

  if (matchingLessons.length > 10) {
    console.log(`   ... and ${matchingLessons.length - 10} more`);
  }

  const confirm = await question('\nMake these sub-lessons? (yes/no): ');

  if (confirm.toLowerCase() === 'yes') {
    // Need to select parent lesson
    const parentTitle = await question('\nEnter the title of the parent lesson: ');

    const parentLesson = await prisma.lesson.findFirst({
      where: {
        title: {
          contains: parentTitle,
          mode: 'insensitive'
        }
      }
    });

    if (!parentLesson) {
      console.log('Parent lesson not found!');
      return;
    }

    console.log(`\nSetting parent to: ${parentLesson.title}`);
    const finalConfirm = await question('Proceed? (yes/no): ');

    if (finalConfirm.toLowerCase() === 'yes') {
      let order = 1;
      for (const lesson of matchingLessons) {
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: {
            parentLessonId: parentLesson.id,
            isMainLesson: false,
            subLessonOrder: order++
          }
        });
      }
      console.log(`✅ Updated ${matchingLessons.length} lessons`);
    }
  }
}

async function restoreByMonth() {
  const month = await question('\nEnter month number (1-12): ');
  const monthNum = parseInt(month);

  const lessonsInMonth = await prisma.lesson.findMany({
    where: { month: monthNum },
    select: {
      id: true,
      title: true,
      week: true
    },
    orderBy: [
      { week: 'asc' },
      { title: 'asc' }
    ]
  });

  console.log(`\nFound ${lessonsInMonth.length} lessons in month ${monthNum}:`);

  lessonsInMonth.forEach(lesson => {
    console.log(`   Week ${lesson.week || 'N/A'}: ${lesson.title}`);
  });

  console.log('\nOptions:');
  console.log('1. Make the first lesson the parent, others sub-lessons');
  console.log('2. Choose specific parent lesson');
  console.log('3. Group by week (each week has its own parent)');
  console.log('4. Cancel');

  const option = await question('\nSelect option (1-4): ');

  switch(option) {
    case '1':
      if (lessonsInMonth.length > 1) {
        const parent = lessonsInMonth[0];
        const children = lessonsInMonth.slice(1);

        console.log(`\nParent: ${parent.title}`);
        console.log(`Children: ${children.length} lessons`);

        const confirm = await question('Proceed? (yes/no): ');

        if (confirm.toLowerCase() === 'yes') {
          for (let i = 0; i < children.length; i++) {
            await prisma.lesson.update({
              where: { id: children[i].id },
              data: {
                parentLessonId: parent.id,
                isMainLesson: false,
                subLessonOrder: i + 1
              }
            });
          }
          console.log(`✅ Updated ${children.length} sub-lessons`);
        }
      }
      break;

    case '3':
      // Group by week
      const weeks = {};
      lessonsInMonth.forEach(lesson => {
        const week = lesson.week || 0;
        if (!weeks[week]) weeks[week] = [];
        weeks[week].push(lesson);
      });

      for (const [week, weekLessons] of Object.entries(weeks)) {
        if (weekLessons.length > 1) {
          console.log(`\nWeek ${week}: Setting ${weekLessons[0].title} as parent`);
          const parent = weekLessons[0];
          const children = weekLessons.slice(1);

          for (let i = 0; i < children.length; i++) {
            await prisma.lesson.update({
              where: { id: children[i].id },
              data: {
                parentLessonId: parent.id,
                isMainLesson: false,
                subLessonOrder: i + 1
              }
            });
          }
        }
      }
      console.log('✅ Grouped lessons by week');
      break;
  }
}

async function manualSelection() {
  console.log('\n📝 Manual Selection Mode');
  console.log('This will show you lessons and let you manually set parent-child relationships.');

  const searchTerm = await question('\nEnter search term (or press Enter to see all): ');

  const where = searchTerm ? {
    title: {
      contains: searchTerm,
      mode: 'insensitive'
    }
  } : {};

  const lessons = await prisma.lesson.findMany({
    where,
    select: {
      id: true,
      title: true,
      isMainLesson: true,
      parentLessonId: true
    },
    orderBy: { title: 'asc' },
    take: 20
  });

  console.log('\nLessons:');
  lessons.forEach((lesson, index) => {
    const status = lesson.isMainLesson ? '📚 Main' : '📖 Sub';
    console.log(`${index + 1}. [${status}] ${lesson.title}`);
  });

  const parentIndex = await question('\nSelect parent lesson number: ');
  const childIndices = await question('Select child lesson numbers (comma-separated): ');

  const parent = lessons[parseInt(parentIndex) - 1];
  const children = childIndices.split(',').map(i => lessons[parseInt(i.trim()) - 1]).filter(Boolean);

  if (parent && children.length > 0) {
    console.log(`\nParent: ${parent.title}`);
    console.log('Children:');
    children.forEach(c => console.log(`   - ${c.title}`));

    const confirm = await question('\nProceed? (yes/no): ');

    if (confirm.toLowerCase() === 'yes') {
      for (let i = 0; i < children.length; i++) {
        await prisma.lesson.update({
          where: { id: children[i].id },
          data: {
            parentLessonId: parent.id,
            isMainLesson: false,
            subLessonOrder: i + 1
          }
        });
      }
      console.log(`✅ Updated ${children.length} sub-lessons`);
    }
  }
}

// Run the script
restoreSubLessons().catch(console.error);