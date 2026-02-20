// Script to convert duration strings to numeric minutes
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to parse duration string to minutes
function parseDurationToMinutes(duration) {
  if (!duration) return null;
  
  // Handle numeric strings (assume minutes)
  if (/^\d+$/.test(duration.trim())) {
    return parseInt(duration.trim());
  }
  
  // Handle decimal numbers with units (e.g., "1.5 hours", "2.5 hours")
  const decimalMatch = duration.match(/(\d+(?:\.\d+)?)\s*(h|hour|hours|m|min|mins|minutes)?/i);
  if (decimalMatch) {
    const value = parseFloat(decimalMatch[1]);
    const unit = decimalMatch[2]?.toLowerCase() || 'm';
    
    if (unit.startsWith('h')) {
      return Math.round(value * 60);
    }
    return Math.round(value);
  }
  
  return null;
}

async function migrateDurations() {
  try {
    console.log('🔄 Starting duration migration...');
    
    // Migrate lessons
    const lessons = await prisma.lesson.findMany();
    console.log(`📚 Found ${lessons.length} lessons to migrate`);
    
    let lessonUpdates = 0;
    for (const lesson of lessons) {
      const minutes = parseDurationToMinutes(lesson.duration);
      if (minutes !== null && lesson.duration !== minutes.toString()) {
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { duration: minutes.toString() }
        });
        console.log(`  ✅ Updated lesson "${lesson.title}": "${lesson.duration}" -> "${minutes} minutes"`);
        lessonUpdates++;
      }
    }
    
    // Migrate labs
    const labs = await prisma.lab.findMany();
    console.log(`🧪 Found ${labs.length} labs to migrate`);
    
    let labUpdates = 0;
    for (const lab of labs) {
      const minutes = parseDurationToMinutes(lab.duration);
      if (minutes !== null && lab.duration !== minutes.toString()) {
        await prisma.lab.update({
          where: { id: lab.id },
          data: { duration: minutes.toString() }
        });
        console.log(`  ✅ Updated lab "${lab.title}": "${lab.duration}" -> "${minutes} minutes"`);
        labUpdates++;
      }
    }
    
    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📊 Updated ${lessonUpdates} lessons and ${labUpdates} labs`);
    
    // Verify the migration
    const sampleLessons = await prisma.lesson.findMany({ take: 5 });
    const sampleLabs = await prisma.lab.findMany({ take: 5 });
    
    console.log('\n📋 Sample lesson durations after migration:');
    sampleLessons.forEach(lesson => {
      console.log(`  - ${lesson.title}: ${lesson.duration} minutes`);
    });
    
    console.log('\n📋 Sample lab durations after migration:');
    sampleLabs.forEach(lab => {
      console.log(`  - ${lab.title}: ${lab.duration} minutes`);
    });
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateDurations();