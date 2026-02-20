#!/bin/bash

# Database Backup Script for GWTH.ai
# Run this script regularly (via cron) to backup the production database

# Configuration
DB_NAME="gwthai_production"
DB_USER="gwthai_user"
BACKUP_DIR="/var/backups/gwth-ai"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/gwth_backup_$TIMESTAMP.sql"

# Perform backup
echo "Starting database backup..."
PGPASSWORD='Rafiki1975' pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_FILE

# Compress the backup
gzip $BACKUP_FILE

# Check if backup was successful
if [ -f "$BACKUP_FILE.gz" ]; then
    echo "Backup completed: $BACKUP_FILE.gz"
    
    # Get file size
    SIZE=$(ls -lh "$BACKUP_FILE.gz" | awk '{print $5}')
    echo "Backup size: $SIZE"
    
    # Remove old backups
    echo "Removing backups older than $RETENTION_DAYS days..."
    find $BACKUP_DIR -name "gwth_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # List remaining backups
    echo "Current backups:"
    ls -lh $BACKUP_DIR/gwth_backup_*.sql.gz | tail -5
else
    echo "ERROR: Backup failed!"
    exit 1
fi

# Optional: Copy to remote backup location
# scp $BACKUP_FILE.gz user@backup-server:/path/to/backups/

echo "Backup process completed."