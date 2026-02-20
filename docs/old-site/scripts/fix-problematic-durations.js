// Script to fix specific problematic duration entries
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixProblematicDurations() {
  try {
    console.log('🔄 Fixing problematic duration entries...');
    
    // Fix specific labs with known issues
    const fixMap = {
      "Sales Data Analyzer": "90",        // 1.5 hours = 90 minutes
      "SEO Content Optimizer": "150",     // 2.5 hours = 150 minutes  
      "AI-Powered Image Generator": "90"  // 1.5 hours = 90 minutes
    };
    
    for (const [title, duration] of Object.entries(fixMap)) {
      const lab = await prisma.lab.findFirst({
        where: { title }
      });
      
      if (lab) {
        await prisma.lab.update({
          where: { id: lab.id },
          data: { duration }
        });
        console.log(`  ✅ Fixed "${title}": ${lab.duration} -> ${duration} minutes`);
      }
    }
    
    // Check for any remaining problematic durations
    const allLabs = await prisma.lab.findMany();
    console.log('\n📋 All lab durations after fixes:');
    allLabs.forEach(lab => {
      console.log(`  - ${lab.title}: ${lab.duration} minutes`);
    });
    
    console.log('\n✅ Problematic durations fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing durations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProblematicDurations();