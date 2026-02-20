#!/bin/bash

# Health Check Script for GWTH.ai
# This script checks the health of all services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "GWTH.ai Health Check"
echo "======================================"
echo ""

# Function to check service
check_service() {
    local service=$1
    local check_command=$2
    
    echo -n "Checking $service... "
    
    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Check Node.js Application
check_service "Node.js Application" "pm2 show gwth-ai"

# Check Nginx
check_service "Nginx Web Server" "systemctl is-active nginx"

# Check PostgreSQL
check_service "PostgreSQL Database" "pg_isready -h localhost -p 5432"

# Check Database Connection
check_service "Database Connection" "psql -U gwthai_user -d gwthai_production -h localhost -c 'SELECT 1' > /dev/null 2>&1"

# Check Application HTTP Response
check_service "Application HTTP" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 | grep -E '200|302'"

# Check Disk Space
echo -n "Checking Disk Space... "
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo -e "${GREEN}✓ OK ($DISK_USAGE% used)${NC}"
else
    echo -e "${YELLOW}⚠ WARNING ($DISK_USAGE% used)${NC}"
fi

# Check Memory Usage
echo -n "Checking Memory... "
MEMORY_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $MEMORY_USAGE -lt 80 ]; then
    echo -e "${GREEN}✓ OK ($MEMORY_USAGE% used)${NC}"
else
    echo -e "${YELLOW}⚠ WARNING ($MEMORY_USAGE% used)${NC}"
fi

# Check PM2 Process Details
echo ""
echo "PM2 Process Status:"
pm2 list

# Check Recent Errors
echo ""
echo "Recent Application Errors (last 10):"
pm2 logs gwth-ai --err --lines 10 --nostream

echo ""
echo "======================================"
echo "Health check completed"
echo "======================================="