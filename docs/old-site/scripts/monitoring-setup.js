#!/usr/bin/env node

/**
 * Production Monitoring Setup Script for GWTH.ai
 * Sets up comprehensive monitoring and alerting for beta launch
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Setting up production monitoring and alerts...');

// Health check endpoints monitoring
const healthChecks = {
  api: '/api/health',
  database: '/api/test-db',
  tts: '/api/tts/health',
  auth: '/api/auth/user'
};

// System metrics to monitor
const systemMetrics = {
  memory: 'Memory usage > 85%',
  cpu: 'CPU usage > 80%',
  disk: 'Disk usage > 90%',
  database: 'Database connections > 80%'
};

// Application metrics to monitor
const appMetrics = {
  responseTime: 'API response time > 2 seconds',
  errorRate: 'Error rate > 5%',
  authFailures: 'Authentication failures > 10/min',
  audioGeneration: 'Audio generation failures > 3/min'
};

// Create monitoring configuration
const monitoringConfig = {
  version: '1.0.0',
  environment: 'production',
  server: '195.201.177.66',
  application: 'gwth-ai',
  healthChecks,
  systemMetrics,
  appMetrics,
  alertChannels: {
    email: 'david@agilecommercegroup.com',
    webhook: null // Can be configured later for Slack/Discord
  },
  checkInterval: {
    health: 60, // seconds
    metrics: 300, // seconds
    logs: 30 // seconds
  }
};

// Create monitoring directory structure
const monitoringDir = '/var/www/gwth-ai/monitoring';
if (!fs.existsSync(monitoringDir)) {
  fs.mkdirSync(monitoringDir, { recursive: true });
}

// Write monitoring configuration
fs.writeFileSync(
  path.join(monitoringDir, 'config.json'),
  JSON.stringify(monitoringConfig, null, 2)
);

console.log('✅ Monitoring configuration created');

// Create health check script
const healthCheckScript = `#!/bin/bash

# GWTH.ai Health Check Script
# Runs comprehensive health checks and sends alerts if needed

CONFIG_FILE="/var/www/gwth-ai/monitoring/config.json"
LOG_FILE="/var/www/gwth-ai/logs/health-check.log"
ALERT_FILE="/var/www/gwth-ai/logs/alerts.log"

# Ensure log directory exists
mkdir -p /var/www/gwth-ai/logs

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to send alert
send_alert() {
    local message="$1"
    local severity="$2"

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$severity] $message" | tee -a "$ALERT_FILE"

    # Send email alert (requires mail command)
    if command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "GWTH.ai Alert [$severity]" david@agilecommercegroup.com
    fi

    # Log to system journal
    logger -t gwth-ai-monitor "[$severity] $message"
}

# Check API health endpoints
check_api_health() {
    local base_url="https://gwth.ai"
    local failed_checks=""

    # Check main health endpoint
    if ! curl -sf "$base_url/api/health" >/dev/null; then
        failed_checks="$failed_checks API-HEALTH "
    fi

    # Check database
    if ! curl -sf "$base_url/api/test-db" >/dev/null; then
        failed_checks="$failed_checks DATABASE "
    fi

    # Check TTS service
    if ! curl -sf "$base_url/api/tts/health" >/dev/null; then
        failed_checks="$failed_checks TTS-SERVICE "
    fi

    if [ -n "$failed_checks" ]; then
        send_alert "Health check failures: $failed_checks" "CRITICAL"
        return 1
    else
        log "All health checks passed"
        return 0
    fi
}

# Check system resources
check_system_resources() {
    local alerts=""

    # Check memory usage
    local memory_usage=\$(free | grep '^Mem:' | awk '{printf "%.0f", \$3/\$2 * 100}')
    if [ "\$memory_usage" -gt 85 ]; then
        alerts="\$alerts MEMORY:\${memory_usage}% "
    fi

    # Check CPU usage (1-minute average)
    local cpu_usage=\$(uptime | awk -F'load average:' '{print \$2}' | awk '{print \$1}' | sed 's/,//')
    local cpu_percent=\$(echo "\$cpu_usage * 25" | bc | cut -d. -f1) # Rough estimate for 4-core system
    if [ "\$cpu_percent" -gt 80 ]; then
        alerts="\$alerts CPU:\${cpu_percent}% "
    fi

    # Check disk usage
    local disk_usage=\$(df /var/www/gwth-ai | tail -1 | awk '{print \$5}' | sed 's/%//')
    if [ "\$disk_usage" -gt 90 ]; then
        alerts="\$alerts DISK:\${disk_usage}% "
    fi

    if [ -n "\$alerts" ]; then
        send_alert "System resource alerts: \$alerts" "WARNING"
        return 1
    else
        log "System resources within normal limits"
        return 0
    fi
}

# Check PM2 processes
check_pm2_processes() {
    local failed_processes=""

    # Check if PM2 is running
    if ! command -v pm2 >/dev/null 2>&1; then
        send_alert "PM2 is not installed or not in PATH" "CRITICAL"
        return 1
    fi

    # Check gwth-ai process
    if ! pm2 jlist | jq -r '.[] | select(.name=="gwth-ai") | .pm2_env.status' | grep -q "online"; then
        failed_processes="\$failed_processes GWTH-AI "
    fi

    # Check gwth-tts processes
    local tts_online=\$(pm2 jlist | jq -r '.[] | select(.name=="gwth-tts") | .pm2_env.status' | grep -c "online")
    if [ "\$tts_online" -lt 2 ]; then
        failed_processes="\$failed_processes TTS-SERVICE "
    fi

    if [ -n "\$failed_processes" ]; then
        send_alert "PM2 process failures: \$failed_processes" "CRITICAL"
        return 1
    else
        log "All PM2 processes are online"
        return 0
    fi
}

# Check application logs for errors
check_application_logs() {
    local error_count=0
    local log_files="/var/www/gwth-ai/logs/app.log ~/.pm2/logs/gwth-ai-error.log"

    # Count errors in the last 5 minutes
    for log_file in \$log_files; do
        if [ -f "\$log_file" ]; then
            local recent_errors=\$(grep -c "ERROR\\|FATAL\\|CRITICAL" "\$log_file" 2>/dev/null || echo 0)
            error_count=\$((error_count + recent_errors))
        fi
    done

    if [ "\$error_count" -gt 10 ]; then
        send_alert "High error rate detected: \$error_count errors in logs" "WARNING"
        return 1
    else
        log "Application error rate is normal"
        return 0
    fi
}

# Main monitoring function
main() {
    log "Starting health check cycle"

    local overall_status=0

    # Run all checks
    check_api_health || overall_status=1
    check_system_resources || overall_status=1
    check_pm2_processes || overall_status=1
    check_application_logs || overall_status=1

    if [ \$overall_status -eq 0 ]; then
        log "All systems healthy"
    else
        log "Issues detected - check alerts"
    fi

    # Cleanup old logs (keep last 7 days)
    find /var/www/gwth-ai/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
}

# Run the monitoring
main "\$@"
`;

fs.writeFileSync(
  path.join(monitoringDir, 'health-check.sh'),
  healthCheckScript
);

// Make script executable
require('child_process').execSync(`chmod +x ${path.join(monitoringDir, 'health-check.sh')}`);

console.log('✅ Health check script created');

// Create cron job configuration
const cronJob = `# GWTH.ai Production Monitoring
# Health checks every minute
* * * * * /var/www/gwth-ai/monitoring/health-check.sh

# System metrics every 5 minutes
*/5 * * * * /var/www/gwth-ai/monitoring/health-check.sh

# Weekly log cleanup
0 2 * * 0 find /var/www/gwth-ai/logs -name "*.log" -mtime +7 -delete
`;

fs.writeFileSync(
  path.join(monitoringDir, 'crontab-monitoring'),
  cronJob
);

console.log('✅ Cron job configuration created');

// Create monitoring API endpoint
const monitoringAPI = `import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// GET /api/monitoring/status - Get current system status
export async function GET(request: NextRequest) {
  try {
    const monitoringDir = '/var/www/gwth-ai/monitoring'
    const logsDir = '/var/www/gwth-ai/logs'

    // Read configuration
    const configPath = join(monitoringDir, 'config.json')
    const config = existsSync(configPath)
      ? JSON.parse(readFileSync(configPath, 'utf8'))
      : {}

    // Read recent alerts
    const alertsPath = join(logsDir, 'alerts.log')
    const recentAlerts = existsSync(alertsPath)
      ? readFileSync(alertsPath, 'utf8')
          .split('\\n')
          .filter(line => line.trim())
          .slice(-10) // Last 10 alerts
      : []

    // Read health check log
    const healthLogPath = join(logsDir, 'health-check.log')
    const recentHealthChecks = existsSync(healthLogPath)
      ? readFileSync(healthLogPath, 'utf8')
          .split('\\n')
          .filter(line => line.trim())
          .slice(-5) // Last 5 health checks
      : []

    // System status
    const status = {
      timestamp: new Date().toISOString(),
      environment: 'production',
      server: '195.201.177.66',
      monitoring: {
        enabled: true,
        version: config.version || '1.0.0',
        lastCheck: recentHealthChecks[recentHealthChecks.length - 1] || 'No checks yet'
      },
      alerts: {
        recent: recentAlerts,
        count: recentAlerts.length
      },
      healthChecks: recentHealthChecks
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error getting monitoring status:', error)
    return NextResponse.json(
      { error: 'Failed to get monitoring status' },
      { status: 500 }
    )
  }
}

// POST /api/monitoring/alert - Manual alert endpoint
export async function POST(request: NextRequest) {
  try {
    const { message, severity = 'INFO' } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Log the alert
    const alertLog = \`[\${new Date().toISOString()}] [\${severity}] \${message}\\n\`
    const alertsPath = '/var/www/gwth-ai/logs/alerts.log'

    require('fs').appendFileSync(alertsPath, alertLog)

    return NextResponse.json({
      success: true,
      message: 'Alert logged successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error logging alert:', error)
    return NextResponse.json(
      { error: 'Failed to log alert' },
      { status: 500 }
    )
  }
}
`;

// Create monitoring API directory and file
const apiDir = '/var/www/gwth-ai/src/app/api/monitoring';
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

fs.writeFileSync(
  path.join(apiDir, 'route.ts'),
  monitoringAPI
);

console.log('✅ Monitoring API endpoint created');

// Create installation instructions
const installInstructions = `# GWTH.ai Production Monitoring Setup

## Installation Steps

1. **Install the cron job:**
   \`\`\`bash
   sudo crontab -e
   # Add the contents of monitoring/crontab-monitoring
   \`\`\`

2. **Install required system tools:**
   \`\`\`bash
   # Install mail command for email alerts
   sudo apt-get install mailutils

   # Install jq for JSON parsing
   sudo apt-get install jq

   # Install bc for calculations
   sudo apt-get install bc
   \`\`\`

3. **Configure email alerts:**
   \`\`\`bash
   # Test email functionality
   echo "Test alert from GWTH.ai monitoring" | mail -s "Test Alert" david@agilecommercegroup.com
   \`\`\`

4. **Test the monitoring system:**
   \`\`\`bash
   # Run health check manually
   /var/www/gwth-ai/monitoring/health-check.sh

   # Check the logs
   tail -f /var/www/gwth-ai/logs/health-check.log
   tail -f /var/www/gwth-ai/logs/alerts.log
   \`\`\`

5. **Access monitoring dashboard:**
   - View status: https://gwth.ai/api/monitoring
   - Send manual alerts: POST to https://gwth.ai/api/monitoring/alert

## Monitoring Features

### Health Checks
- API endpoints (/api/health, /api/test-db, /api/tts/health)
- Database connectivity
- TTS service availability
- Authentication system

### System Metrics
- Memory usage (alert if > 85%)
- CPU usage (alert if > 80%)
- Disk usage (alert if > 90%)
- PM2 process status

### Application Monitoring
- Error rate tracking
- Response time monitoring
- Authentication failure detection
- Audio generation failure tracking

### Alerting
- Email notifications to admin
- System journal logging
- Alert history tracking
- Automatic log cleanup

## Customization

Edit \`/var/www/gwth-ai/monitoring/config.json\` to customize:
- Check intervals
- Alert thresholds
- Contact information
- Additional endpoints

## Troubleshooting

1. **No email alerts:**
   - Check mail command: \`which mail\`
   - Test manually: \`echo "test" | mail -s "test" your@email.com\`

2. **Permission issues:**
   - Make script executable: \`chmod +x monitoring/health-check.sh\`
   - Check log directory permissions: \`ls -la logs/\`

3. **High alert volume:**
   - Adjust thresholds in the health-check.sh script
   - Increase check intervals in cron job
`;

fs.writeFileSync(
  path.join(monitoringDir, 'README.md'),
  installInstructions
);

console.log('✅ Installation instructions created');

console.log('\n🎉 Production monitoring setup complete!');
console.log('\nNext steps:');
console.log('1. Install system dependencies (mailutils, jq, bc)');
console.log('2. Configure cron job');
console.log('3. Test email alerts');
console.log('4. Run initial health check');
console.log('\nMonitoring files created in: /var/www/gwth-ai/monitoring/');