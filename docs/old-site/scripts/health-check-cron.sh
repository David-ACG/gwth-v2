#!/bin/bash

# Health check script for server monitoring
# Run this as a cron job every 5 minutes

# Load environment variables
export $(cat /var/www/gwth-ai/.env.local | grep -v '^#' | xargs)

# Perform health check via API
curl -s http://localhost:3000/api/cron/health-check > /dev/null 2>&1

# Log the result
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Health check completed" >> /var/log/gwth-health-check.log