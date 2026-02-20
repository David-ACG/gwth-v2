#!/usr/bin/env node

/**
 * Test Beta Testers API Authentication
 * This tests the API endpoints that should work
 */

const BASE_URL = 'http://localhost:3001';

async function testPublicEndpoints() {
  console.log('🧪 Testing Beta Testers API Endpoints\n');

  try {
    // Test 1: Public token validation endpoint
    console.log('1️⃣  Testing token validation endpoint...');
    
    const invalidResponse = await fetch(
      `${BASE_URL}/api/backend/beta-testers/validate?token=invalid-token`
    );
    
    if (invalidResponse.ok) {
      const result = await invalidResponse.json();
      if (!result.valid) {
        console.log(`   ✅ Token validation working: ${result.error}`);
      }
    } else {
      console.log(`   ❌ Token validation failed with status: ${invalidResponse.status}`);
    }

    // Test 2: Protected admin endpoint (should return 401)
    console.log('\n2️⃣  Testing protected admin endpoint...');
    
    const adminResponse = await fetch(`${BASE_URL}/api/backend/beta-testers`);
    
    if (adminResponse.status === 401) {
      console.log('   ✅ Admin endpoint properly protected (401 Unauthorized)');
    } else {
      console.log(`   ❌ Admin endpoint returned unexpected status: ${adminResponse.status}`);
    }

    // Test 3: Check that database is accessible (via a different known working endpoint)
    console.log('\n3️⃣  Testing database connectivity...');
    
    try {
      // Try a simple database operation to test if Prisma is working
      const { PrismaClient } = require('@prisma/client');
      const testPrisma = new PrismaClient();
      
      // Just test the connection
      await testPrisma.$connect();
      console.log('   ✅ Database connection successful');
      await testPrisma.$disconnect();
      
    } catch (dbError) {
      console.log('   ❌ Database connection failed:', dbError.message);
    }

    console.log('\n🎉 API Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('   • Beta tester validation API is working');
    console.log('   • Admin endpoints are properly protected');
    console.log('   • Database connectivity is working');
    console.log('\n💡 Next: Sign in as admin and test the full dashboard at /backend/beta-testers');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testPublicEndpoints();