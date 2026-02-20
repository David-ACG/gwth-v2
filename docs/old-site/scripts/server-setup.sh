#!/bin/bash

# GWTH.ai Server Setup Script
# Run this on the production server to set up the environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}GWTH.ai Production Server Setup${NC}"
echo -e "${BLUE}==================================${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}" 
   exit 1
fi

# Step 1: Update system
echo -e "\n${YELLOW}Step 1: Updating system packages...${NC}"
apt update && apt upgrade -y

# Step 2: Install essential packages
echo -e "\n${YELLOW}Step 2: Installing essential packages...${NC}"
apt install -y curl wget git build-essential ufw

# Step 3: Install Node.js 20.x
echo -e "\n${YELLOW}Step 3: Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Step 4: Install PM2
echo -e "\n${YELLOW}Step 4: Installing PM2...${NC}"
npm install -g pm2
pm2 startup systemd -u root --hp /root

# Step 5: Install Nginx
echo -e "\n${YELLOW}Step 5: Installing Nginx...${NC}"
apt install -y nginx

# Step 6: Configure Firewall
echo -e "\n${YELLOW}Step 6: Configuring firewall...${NC}"
ufw allow 111/tcp  # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Step 7: Setup PostgreSQL Database
echo -e "\n${YELLOW}Step 7: Setting up PostgreSQL database...${NC}"
sudo -u postgres psql <<EOF
CREATE DATABASE gwthai_production;
CREATE USER gwthai_user WITH ENCRYPTED PASSWORD 'Rafiki1975';
GRANT ALL PRIVILEGES ON DATABASE gwthai_production TO gwthai_user;
ALTER DATABASE gwthai_production OWNER TO gwthai_user;
\q
EOF

echo -e "${GREEN}Database created successfully${NC}"

# Step 8: Create application directory
echo -e "\n${YELLOW}Step 8: Creating application directory...${NC}"
mkdir -p /var/www/gwth-ai
mkdir -p /var/log/pm2

# Step 9: Install Certbot
echo -e "\n${YELLOW}Step 9: Installing Certbot for Let's Encrypt...${NC}"
apt install -y certbot python3-certbot-nginx

# Step 10: Create Nginx configuration
echo -e "\n${YELLOW}Step 10: Creating Nginx configuration...${NC}"
cat > /etc/nginx/sites-available/gwth.ai <<'EOF'
server {
    listen 80;
    server_name gwth.ai www.gwth.ai;

    # Increase body size limit for file uploads
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/gwth.ai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl restart nginx

echo -e "\n${GREEN}==================================${NC}"
echo -e "${GREEN}Server setup completed!${NC}"
echo -e "${GREEN}==================================${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Clone your repository to /var/www/gwth-ai"
echo "2. Copy your .env.production.local file"
echo "3. Run the database migration SQL file"
echo "4. Build and start the application with PM2"
echo "5. Set up SSL with: certbot --nginx -d gwth.ai -d www.gwth.ai"
echo "6. Update DNS records to point to this server (195.201.177.66)"

echo -e "\n${BLUE}Quick commands:${NC}"
echo "cd /var/www/gwth-ai"
echo "git clone YOUR_REPO_URL ."
echo "npm install"
echo "npm run build"
echo "pm2 start ecosystem.config.js"