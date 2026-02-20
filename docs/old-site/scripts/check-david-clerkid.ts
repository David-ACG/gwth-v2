import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDavidClerkId() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'david@agilecommercegroup.com' }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('David\'s database record:');
    console.log('- Database ID:', user.id);
    console.log('- Clerk ID:', user.clerkId);
    console.log('- Email:', user.email);
    console.log('- Subscription Status:', user.subscriptionStatus);
    console.log('- Subscription Plan:', user.subscriptionPlan);
    
    console.log('\nClerk ID from debug page:', 'user_2zbGfsJ9eMHUSpdGX5Vymn2Wk1X');
    console.log('IDs match:', user.clerkId === 'user_2zbGfsJ9eMHUSpdGX5Vymn2Wk1X');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDavidClerkId();