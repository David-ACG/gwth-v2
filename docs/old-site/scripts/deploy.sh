#!/bin/bash

# GWTH.ai Deployment Script
# This script automates the deployment process to the production server

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="195.201.177.66"
SERVER_PORT="111"
SERVER_USER="root"
APP_DIR="/var/www/gwth-ai"
LOCAL_DIR="$(pwd)"

echo -e "${GREEN}Starting GWTH.ai deployment...${NC}"

# Function to run commands on server
run_remote() {
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP "$1"
}

# 1. Build locally first
echo -e "${YELLOW}Building application locally...${NC}"
npm run build

# 2. Create deployment archive
echo -e "${YELLOW}Creating deployment archive...${NC}"
tar -czf deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next/cache \
    --exclude=deploy.tar.gz \
    --exclude=.env.local \
    .

# 3. Upload to server
echo -e "${YELLOW}Uploading to server...${NC}"
scp -P $SERVER_PORT deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# 4. Deploy on server
echo -e "${YELLOW}Deploying on server...${NC}"
run_remote "
    set -e
    
    # Create app directory if it doesn't exist
    mkdir -p $APP_DIR
    
    # Backup current deployment
    if [ -d '$APP_DIR/.next' ]; then
        echo 'Backing up current deployment...'
        cp -r $APP_DIR/.next $APP_DIR/.next.backup
    fi
    
    # Extract new deployment
    cd $APP_DIR
    tar -xzf /tmp/deploy.tar.gz
    rm /tmp/deploy.tar.gz
    
    # Install/update dependencies
    echo 'Installing dependencies...'
    npm install --production
    
    # Generate Prisma client
    echo 'Generating Prisma client...'
    npx prisma generate
    
    # Run database migrations if needed
    # npx prisma migrate deploy
    
    # Restart application
    echo 'Restarting application...'
    pm2 restart gwth-ai || pm2 start ecosystem.config.js
    
    # Cleanup
    rm -rf .next.backup
    
    echo 'Deployment complete!'
"

# 5. Cleanup local archive
rm deploy.tar.gz

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Don't forget to:${NC}"
echo "1. Check the application at https://gwth.ai"
echo "2. Monitor logs: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP 'pm2 logs gwth-ai'"
echo "3. Check status: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP 'pm2 status'"