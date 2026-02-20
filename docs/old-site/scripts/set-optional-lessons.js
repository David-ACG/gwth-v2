// Script to set some lessons as optional for testing
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setOptionalLessons() {
  try {
    // Get all lessons
    const lessons = await prisma.lesson.findMany({
      take: 10,
      orderBy: { order: 'asc' }
    });
    
    console.log(`Found ${lessons.length} lessons`);
    
    // Mark every 3rd lesson as optional
    let updated = 0;
    for (let i = 0; i < lessons.length; i++) {
      if ((i + 1) % 3 === 0) {
        await prisma.lesson.update({
          where: { id: lessons[i].id },
          data: { isOptional: true }
        });
        console.log(`✅ Set lesson "${lessons[i].title}" as optional`);
        updated++;
      }
    }
    
    console.log(`\n✅ Successfully updated ${updated} lessons as optional`);
    
    // Verify the changes
    const optionalLessons = await prisma.lesson.findMany({
      where: { isOptional: true }
    });
    
    console.log(`\n📊 Total optional lessons in database: ${optionalLessons.length}`);
    optionalLessons.forEach(lesson => {
      console.log(`  - ${lesson.title} (duration: ${lesson.duration || 'N/A'})`);
    });
    
  } catch (error) {
    console.error('❌ Error setting optional lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setOptionalLessons();