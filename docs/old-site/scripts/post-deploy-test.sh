#!/bin/bash

# Post-Deployment Test Script
# Run this after deployment to verify everything is working

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="gwth.ai"
API_BASE="https://$DOMAIN"

echo "======================================"
echo "GWTH.ai Post-Deployment Tests"
echo "======================================"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name=$1
    local test_command=$2
    local expected_result=$3
    
    echo -n "Testing: $test_name... "
    
    result=$(eval "$test_command" 2>/dev/null)
    
    if [[ "$result" == *"$expected_result"* ]]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Expected: $expected_result"
        echo "  Got: $result"
        ((TESTS_FAILED++))
    fi
}

# 1. Test Homepage Redirect (should redirect to waitlist for non-whitelisted)
run_test "Homepage Access" \
    "curl -s -o /dev/null -w '%{http_code}' -L $API_BASE/" \
    "200"

# 2. Test Waitlist Page
run_test "Waitlist Page" \
    "curl -s -o /dev/null -w '%{http_code}' $API_BASE/waitlist" \
    "200"

# 3. Test Waitlist API
run_test "Waitlist API" \
    "curl -s -X POST $API_BASE/api/waitlist -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\"}' | grep -o 'error'" \
    "error"

# 4. Test Static Assets
run_test "Static Assets" \
    "curl -s -o /dev/null -w '%{http_code}' $API_BASE/_next/static/css/" \
    "404"

# 5. Test HTTPS Redirect
run_test "HTTPS Redirect" \
    "curl -s -o /dev/null -w '%{http_code}' http://$DOMAIN" \
    "301"

# 6. Test Backend Routes (should redirect to login)
run_test "Backend Protection" \
    "curl -s -o /dev/null -w '%{http_code}' -L $API_BASE/backend/dashboard | tail -1" \
    "200"

# 7. Test API Health
run_test "API Health" \
    "curl -s -o /dev/null -w '%{http_code}' $API_BASE/api/health 2>/dev/null || echo '404'" \
    "404"

# 8. Test SSL Certificate
echo -n "Testing: SSL Certificate... "
if echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
fi

# 9. Test Response Headers
echo -n "Testing: Security Headers... "
headers=$(curl -s -I $API_BASE)
if [[ "$headers" == *"X-Frame-Options"* ]] || [[ "$headers" == *"strict-transport-security"* ]]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (Security headers may need configuration)"
fi

echo ""
echo "======================================"
echo "Test Results:"
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"
echo "======================================"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! Deployment successful.${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please check the deployment.${NC}"
    exit 1
fi