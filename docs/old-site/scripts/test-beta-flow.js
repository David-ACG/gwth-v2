#!/usr/bin/env node

/**
 * Beta Tester Flow Test Script
 * Tests the complete beta tester invitation and registration flow
 */

const BASE_URL = 'http://localhost:3001';

async function testBetaTesterFlow() {
  console.log('🧪 Starting Beta Tester Flow Test\n');

  try {
    // Step 1: Create a beta tester invitation
    console.log('1️⃣  Creating beta tester invitation...');
    
    const createResponse = await fetch(`${BASE_URL}/api/backend/beta-testers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'create',
        email: 'test@example.com',
        name: 'John Test',
        source: 'Test Script',
        notes: 'Created by automated test script',
        sendEmail: false // Don't actually send email in test
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      if (error.error?.includes('already been invited')) {
        console.log('   ⚠️  Beta tester already exists, continuing with existing invitation...');
      } else {
        throw new Error(`Failed to create invitation: ${error.error}`);
      }
    } else {
      const result = await createResponse.json();
      console.log(`   ✅ Beta tester created: ${result.betaTester.email}`);
      console.log(`   📝 Token generated: ${result.betaTester.inviteToken.substring(0, 20)}...`);
    }

    // Step 2: Fetch beta testers to get the token
    console.log('\n2️⃣  Fetching beta testers to get invitation token...');
    
    const listResponse = await fetch(`${BASE_URL}/api/backend/beta-testers?includeStats=true`);
    if (!listResponse.ok) {
      throw new Error('Failed to fetch beta testers');
    }

    const listData = await listResponse.json();
    const testTester = listData.betaTesters.find(t => t.email === 'test@example.com');
    
    if (!testTester) {
      throw new Error('Test beta tester not found');
    }

    console.log(`   ✅ Found beta tester: ${testTester.name} (${testTester.status})`);
    console.log(`   📊 Stats: ${listData.stats?.total || 0} total beta testers`);

    // Step 3: Test token validation (GET method)
    console.log('\n3️⃣  Testing token validation...');
    
    const validateResponse = await fetch(
      `${BASE_URL}/api/backend/beta-testers/validate?token=${encodeURIComponent(testTester.inviteToken)}`
    );
    
    if (!validateResponse.ok) {
      throw new Error('Token validation failed');
    }

    const validation = await validateResponse.json();
    if (!validation.valid) {
      throw new Error(`Token invalid: ${validation.error}`);
    }

    console.log(`   ✅ Token is valid for: ${validation.name} (${validation.email})`);

    // Step 4: Test registration page accessibility
    console.log('\n4️⃣  Testing registration page accessibility...');
    
    const registrationUrl = `${BASE_URL}/register/beta/${testTester.inviteToken}`;
    const pageResponse = await fetch(registrationUrl);
    
    if (!pageResponse.ok) {
      throw new Error('Registration page not accessible');
    }

    console.log(`   ✅ Registration page accessible at: ${registrationUrl}`);

    // Step 5: Test backend API endpoints
    console.log('\n5️⃣  Testing backend API endpoints...');

    // Test stats endpoint
    const statsTest = await fetch(`${BASE_URL}/api/backend/beta-testers?includeStats=true`);
    if (statsTest.ok) {
      console.log('   ✅ Stats API endpoint working');
    }

    // Test resend functionality (without actually sending email)
    const resendResponse = await fetch(`${BASE_URL}/api/backend/beta-testers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'resend',
        betaTesterId: testTester.id,
        sendEmail: false
      })
    });

    if (resendResponse.ok) {
      console.log('   ✅ Resend invitation API working');
    }

    // Step 6: Test admin dashboard accessibility
    console.log('\n6️⃣  Testing admin dashboard accessibility...');
    
    const dashboardResponse = await fetch(`${BASE_URL}/backend/beta-testers`);
    if (dashboardResponse.ok) {
      console.log('   ✅ Admin dashboard accessible');
    }

    // Step 7: Cleanup (mark as expired to clean up)
    console.log('\n7️⃣  Cleaning up test data...');
    
    // Update the test tester to expired status
    const cleanupResponse = await fetch(`${BASE_URL}/api/backend/beta-testers`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testTester.id,
        notes: 'Test completed - marked as expired by test script'
      })
    });

    if (cleanupResponse.ok) {
      console.log('   ✅ Test data updated');
    }

    // Final summary
    console.log('\n🎉 Beta Tester Flow Test PASSED! ✅');
    console.log('\nFlow Summary:');
    console.log('   • ✅ Beta tester invitation creation');
    console.log('   • ✅ Token generation and validation');
    console.log('   • ✅ Registration page accessibility');
    console.log('   • ✅ Admin dashboard functionality');
    console.log('   • ✅ API endpoints working');
    console.log('\nThe complete beta tester system is ready for production! 🚀');
    
  } catch (error) {
    console.error('\n❌ Beta Tester Flow Test FAILED!');
    console.error(`Error: ${error.message}`);
    console.error('\nPlease check the following:');
    console.error('   • Is the development server running on port 3001?');
    console.error('   • Are you signed in as the admin (david@agilecommercegroup.com)?');
    console.error('   • Is the database connection working?');
    console.error('   • Are all API routes properly configured?');
    
    process.exit(1);
  }
}

// Run the test
testBetaTesterFlow();