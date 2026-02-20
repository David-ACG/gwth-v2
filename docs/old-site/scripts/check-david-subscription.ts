import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDavidSubscription() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'david@agilecommercegroup.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('David\'s subscription data:');
    console.log('- subscriptionStatus:', user.subscriptionStatus);
    console.log('- subscriptionPlan:', user.subscriptionPlan);
    console.log('- subscriptionStartedAt:', user.subscriptionStartedAt);
    console.log('- subscriptionEndsAt:', user.subscriptionEndsAt);
    
    // Also calculate what month access he should have
    if (user.subscriptionStatus === 'active' && user.subscriptionStartedAt) {
      const now = new Date();
      const startDate = new Date(user.subscriptionStartedAt);
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const monthsSinceStart = Math.floor(daysSinceStart / 30);
      const currentMonth = Math.min(monthsSinceStart + 1, 3);
      
      console.log('\nCalculated access:');
      console.log('- Days since start:', daysSinceStart);
      console.log('- Current month access:', currentMonth);
      console.log('- Can access Month 1:', currentMonth >= 1);
      console.log('- Can access Month 2:', currentMonth >= 2);
      console.log('- Can access Month 3:', currentMonth >= 3);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDavidSubscription();