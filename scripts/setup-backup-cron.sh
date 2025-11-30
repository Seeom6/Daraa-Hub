#!/bin/bash

# ============================================
# Setup Backup Cron Job
# ============================================
# This script sets up a cron job for automated MongoDB backups
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Setting up Backup Cron Job${NC}"
echo -e "${GREEN}============================================${NC}"

# Get the absolute path to the backup script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-mongodb.sh"
LOG_FILE="/var/log/daraa-backup.log"

# Check if backup script exists
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo -e "${RED}❌ Backup script not found: $BACKUP_SCRIPT${NC}"
    exit 1
fi

# Make backup script executable
chmod +x "$BACKUP_SCRIPT"

echo -e "${YELLOW}Backup script: $BACKUP_SCRIPT${NC}"
echo -e "${YELLOW}Log file: $LOG_FILE${NC}"

echo ""
echo -e "${YELLOW}Select backup frequency:${NC}"
echo "1) Every 6 hours (recommended for production)"
echo "2) Daily at 2 AM"
echo "3) Daily at 3 AM"
echo "4) Weekly (Sunday at 2 AM)"
echo "5) Custom"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        CRON_SCHEDULE="0 */6 * * *"
        DESCRIPTION="every 6 hours"
        ;;
    2)
        CRON_SCHEDULE="0 2 * * *"
        DESCRIPTION="daily at 2 AM"
        ;;
    3)
        CRON_SCHEDULE="0 3 * * *"
        DESCRIPTION="daily at 3 AM"
        ;;
    4)
        CRON_SCHEDULE="0 2 * * 0"
        DESCRIPTION="weekly on Sunday at 2 AM"
        ;;
    5)
        read -p "Enter cron schedule (e.g., '0 2 * * *'): " CRON_SCHEDULE
        DESCRIPTION="custom schedule"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Create cron job entry
CRON_JOB="$CRON_SCHEDULE $BACKUP_SCRIPT >> $LOG_FILE 2>&1"

echo ""
echo -e "${YELLOW}Cron job to be added:${NC}"
echo "$CRON_JOB"

echo ""
read -p "Add this cron job? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cancelled${NC}"
    exit 0
fi

# Add cron job
(crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT"; echo "$CRON_JOB") | crontab -

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Cron job added successfully!${NC}"
echo -e "${GREEN}============================================${NC}"

echo ""
echo -e "${YELLOW}📝 Backup Configuration:${NC}"
echo -e "- Frequency: $DESCRIPTION"
echo -e "- Script: $BACKUP_SCRIPT"
echo -e "- Log file: $LOG_FILE"

echo ""
echo -e "${YELLOW}📝 Current crontab:${NC}"
crontab -l | grep "$BACKUP_SCRIPT" || echo "No backup jobs found"

echo ""
echo -e "${YELLOW}📝 Test the backup:${NC}"
echo -e "$BACKUP_SCRIPT"

echo ""
echo -e "${YELLOW}📝 View logs:${NC}"
echo -e "tail -f $LOG_FILE"

echo ""
echo -e "${GREEN}Done!${NC}"

