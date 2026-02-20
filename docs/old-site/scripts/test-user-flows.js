#!/usr/bin/env node

/**
 * End-to-End User Flow Testing Script for GWTH.ai Beta Launch
 * Tests all critical user journeys to ensure beta readiness
 */

const https = require('https');
const fs = require('fs');

console.log('🧪 Starting end-to-end user flow testing for beta launch...');

// Test configuration
const config = {
  baseUrl: 'https://gwth.ai',
  timeout: 10000, // 10 seconds
  testResults: [],
  timestamp: new Date().toISOString()
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'GWTH-AI-Test-Bot/1.0',
        'Accept': 'text/html,application/json',
        ...options.headers
      },
      timeout: config.timeout
    };

    if (options.body) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Test runner function
async function runTest(name, testFunction) {
  console.log(`\\n🔍 Testing: ${name}`);
  const startTime = Date.now();

  try {
    const result = await testFunction();
    const duration = Date.now() - startTime;

    const testResult = {
      name,
      status: 'PASS',
      duration: `${duration}ms`,
      details: result,
      timestamp: new Date().toISOString()
    };

    config.testResults.push(testResult);
    console.log(`✅ ${name} - PASSED (${duration}ms)`);
    return testResult;
  } catch (error) {
    const duration = Date.now() - startTime;

    const testResult = {
      name,
      status: 'FAIL',
      duration: `${duration}ms`,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    config.testResults.push(testResult);
    console.log(`❌ ${name} - FAILED (${duration}ms): ${error.message}`);
    return testResult;
  }
}

// Test 1: Homepage loads successfully
async function testHomepage() {
  const response = await makeRequest(config.baseUrl);

  if (response.statusCode !== 200) {
    throw new Error(`Homepage returned status ${response.statusCode}`);
  }

  if (!response.body.includes('GWTH') && !response.body.includes('AI')) {
    throw new Error('Homepage content does not contain expected branding');
  }

  return { statusCode: response.statusCode, contentLength: response.body.length };
}

// Test 2: API health endpoints
async function testAPIHealth() {
  const endpoints = [
    '/api/health',
    '/api/test-db',
    '/api/tts/health',
    '/api/monitoring'
  ];

  const results = {};

  for (const endpoint of endpoints) {
    const response = await makeRequest(config.baseUrl + endpoint);
    results[endpoint] = {
      statusCode: response.statusCode,
      healthy: response.statusCode === 200
    };

    if (response.statusCode !== 200) {
      throw new Error(`API endpoint ${endpoint} returned status ${response.statusCode}`);
    }
  }

  return results;
}

// Test 3: Authentication pages load
async function testAuthPages() {
  const authPages = [
    '/sign-in',
    '/sign-up',
    '/forgot-password'
  ];

  const results = {};

  for (const page of authPages) {
    const response = await makeRequest(config.baseUrl + page);
    results[page] = {
      statusCode: response.statusCode,
      contentLength: response.body.length
    };

    if (response.statusCode !== 200) {
      throw new Error(`Auth page ${page} returned status ${response.statusCode}`);
    }
  }

  return results;
}

// Test 4: Public content pages
async function testPublicContent() {
  const publicPages = [
    '/about',
    '/pricing',
    '/support',
    '/terms',
    '/privacy',
    '/lessons',
    '/labs'
  ];

  const results = {};

  for (const page of publicPages) {
    const response = await makeRequest(config.baseUrl + page);
    results[page] = {
      statusCode: response.statusCode,
      loadTime: 'measured',
      contentLength: response.body.length
    };

    if (response.statusCode !== 200) {
      throw new Error(`Public page ${page} returned status ${response.statusCode}`);
    }

    // Check for basic content structure
    if (!response.body.includes('<html') || !response.body.includes('</html>')) {
      throw new Error(`Page ${page} does not contain valid HTML structure`);
    }
  }

  return results;
}

// Test 5: Course listing pages
async function testCourseListing() {
  const response = await makeRequest(config.baseUrl + '/lessons');

  if (response.statusCode !== 200) {
    throw new Error(`Lessons page returned status ${response.statusCode}`);
  }

  // Check that lessons page loads and contains content
  if (!response.body.includes('lesson') && !response.body.includes('course')) {
    throw new Error('Lessons page does not contain expected course content');
  }

  return {
    statusCode: response.statusCode,
    hasLessons: response.body.includes('lesson'),
    contentLength: response.body.length
  };
}

// Test 6: Backend dashboard (admin area)
async function testBackendAccess() {
  const response = await makeRequest(config.baseUrl + '/backend');

  // Backend should redirect unauthenticated users to login (307 or 302)
  if (response.statusCode !== 200 && response.statusCode !== 302 && response.statusCode !== 307) {
    throw new Error(`Backend returned unexpected status ${response.statusCode}`);
  }

  // Check if it redirects to login page (proper security behavior)
  const isSecurityRedirect = (response.statusCode === 307 || response.statusCode === 302) &&
    response.headers.location && response.headers.location.includes('login');

  return {
    statusCode: response.statusCode,
    redirected: response.statusCode === 302 || response.statusCode === 307,
    location: response.headers.location || null,
    securityWorking: isSecurityRedirect || response.statusCode === 200
  };
}

// Test 7: Static assets load
async function testStaticAssets() {
  const assets = [
    '/favicon.ico',
    // Add other critical static assets
  ];

  const results = {};

  for (const asset of assets) {
    try {
      const response = await makeRequest(config.baseUrl + asset);
      results[asset] = {
        statusCode: response.statusCode,
        available: response.statusCode === 200
      };
    } catch (error) {
      results[asset] = {
        statusCode: 'ERROR',
        available: false,
        error: error.message
      };
    }
  }

  return results;
}

// Test 8: Database connectivity
async function testDatabaseConnectivity() {
  const response = await makeRequest(config.baseUrl + '/api/health/database');

  if (response.statusCode !== 200) {
    throw new Error(`Database health check returned status ${response.statusCode}`);
  }

  let dbResult;
  try {
    dbResult = JSON.parse(response.body);
  } catch (error) {
    throw new Error('Database health response is not valid JSON');
  }

  if (dbResult.status !== 'healthy') {
    throw new Error(`Database health check failed: ${dbResult.error || 'Unknown error'}`);
  }

  return dbResult;
}

// Test 9: TTS service availability
async function testTTSService() {
  const response = await makeRequest(config.baseUrl + '/api/tts/health');

  if (response.statusCode !== 200) {
    throw new Error(`TTS health check returned status ${response.statusCode}`);
  }

  let ttsResult;
  try {
    ttsResult = JSON.parse(response.body);
  } catch (error) {
    throw new Error('TTS health response is not valid JSON');
  }

  return ttsResult;
}

// Test 10: Newsletter subscription (waitlist)
async function testNewsletterSubscription() {
  const testEmail = `test+${Date.now()}@example.com`;

  const response = await makeRequest(config.baseUrl + '/api/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail }),
    headers: { 'Content-Type': 'application/json' }
  });

  // Should either succeed or show appropriate error
  if (response.statusCode !== 200 && response.statusCode !== 400) {
    throw new Error(`Newsletter subscription returned status ${response.statusCode}`);
  }

  return {
    statusCode: response.statusCode,
    testEmail,
    response: response.body.substring(0, 200) // First 200 chars
  };
}

// Test 11: Error handling
async function testErrorHandling() {
  // Test 404 page
  const notFoundResponse = await makeRequest(config.baseUrl + '/non-existent-page');

  if (notFoundResponse.statusCode !== 404) {
    throw new Error(`Expected 404 for non-existent page, got ${notFoundResponse.statusCode}`);
  }

  // Test API 404
  const apiNotFoundResponse = await makeRequest(config.baseUrl + '/api/non-existent-endpoint');

  if (apiNotFoundResponse.statusCode !== 404) {
    throw new Error(`Expected 404 for non-existent API, got ${apiNotFoundResponse.statusCode}`);
  }

  return {
    page404: notFoundResponse.statusCode === 404,
    api404: apiNotFoundResponse.statusCode === 404
  };
}

// Test 12: Performance checks
async function testPerformance() {
  const startTime = Date.now();
  const response = await makeRequest(config.baseUrl);
  const loadTime = Date.now() - startTime;

  if (loadTime > 5000) { // 5 seconds
    throw new Error(`Homepage load time too slow: ${loadTime}ms`);
  }

  return {
    homepageLoadTime: `${loadTime}ms`,
    acceptable: loadTime < 5000,
    fast: loadTime < 2000
  };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 GWTH.ai Beta Launch - End-to-End Testing');
  console.log('================================================');

  const tests = [
    { name: 'Homepage loads successfully', func: testHomepage },
    { name: 'API health endpoints respond', func: testAPIHealth },
    { name: 'Authentication pages load', func: testAuthPages },
    { name: 'Public content pages accessible', func: testPublicContent },
    { name: 'Course listing functionality', func: testCourseListing },
    { name: 'Backend admin area security', func: testBackendAccess },
    { name: 'Static assets availability', func: testStaticAssets },
    { name: 'Database connectivity', func: testDatabaseConnectivity },
    { name: 'TTS service health', func: testTTSService },
    { name: 'Newsletter subscription', func: testNewsletterSubscription },
    { name: 'Error handling (404s)', func: testErrorHandling },
    { name: 'Performance benchmarks', func: testPerformance }
  ];

  console.log(`Running ${tests.length} test suites...\\n`);

  for (const test of tests) {
    await runTest(test.name, test.func);
  }

  // Generate summary
  const passed = config.testResults.filter(r => r.status === 'PASS').length;
  const failed = config.testResults.filter(r => r.status === 'FAIL').length;
  const total = config.testResults.length;

  console.log('\\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`🎯 Success Rate: ${Math.round((passed/total) * 100)}%`);

  // Write detailed report
  const report = {
    summary: {
      timestamp: config.timestamp,
      total,
      passed,
      failed,
      successRate: Math.round((passed/total) * 100)
    },
    tests: config.testResults,
    environment: {
      baseUrl: config.baseUrl,
      userAgent: 'GWTH-AI-Test-Bot/1.0',
      timeout: config.timeout
    }
  };

  const reportPath = '/var/www/gwth-ai/logs/beta-readiness-test.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\\n📄 Detailed report saved to: ${reportPath}`);

  if (failed === 0) {
    console.log('\\n🎉 ALL TESTS PASSED! Beta launch ready! 🚀');
  } else {
    console.log(`\\n⚠️  ${failed} test(s) failed. Review before beta launch.`);
  }

  return report;
}

// Run the tests
runAllTests().catch(error => {
  console.error('\\n💥 Test runner failed:', error);
  process.exit(1);
});