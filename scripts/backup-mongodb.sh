#!/bin/bash
#
# MongoDB Backup Script for Daraa Platform
# 
# This script creates compressed backups of the MongoDB database
# and manages backup retention (default: 30 days)
#
# Usage:
#   ./backup-mongodb.sh [options]
#
# Options:
#   -d, --database    Database name (default: daraa)
#   -r, --retention   Retention days (default: 30)
#   -o, --output      Output directory (default: ./backups/mongodb)
#   -s, --s3          Upload to S3 bucket (optional)
#   -h, --help        Show this help message
#
# Cron Example (daily at 2 AM):
#   0 2 * * * /path/to/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1
#

set -e

# ============================================
# Configuration
# ============================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
DATABASE="${MONGO_DATABASE:-daraa}"
BACKUP_USER="${MONGO_BACKUP_USERNAME:-daraa_backup}"
BACKUP_PASSWORD="${MONGO_BACKUP_PASSWORD:-DaraaBackupPassword2024}"
MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups/mongodb}"
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="daraa_backup_${TIMESTAMP}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# Functions
# ============================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

show_help() {
    head -25 "$0" | tail -20
    exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--database) DATABASE="$2"; shift 2 ;;
        -r|--retention) RETENTION_DAYS="$2"; shift 2 ;;
        -o|--output) BACKUP_DIR="$2"; shift 2 ;;
        -s|--s3) S3_BUCKET="$2"; shift 2 ;;
        -h|--help) show_help ;;
        *) log_error "Unknown option: $1"; exit 1 ;;
    esac
done

# ============================================
# Main Backup Process
# ============================================
log_info "=========================================="
log_info "Starting MongoDB Backup for Daraa Platform"
log_info "=========================================="
log_info "Database: $DATABASE"
log_info "Backup Directory: $BACKUP_DIR"
log_info "Retention: $RETENTION_DAYS days"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create the backup
log_info "Creating backup: $BACKUP_NAME"

mongodump \
    --host="$MONGO_HOST" \
    --port="$MONGO_PORT" \
    --username="$BACKUP_USER" \
    --password="$BACKUP_PASSWORD" \
    --authenticationDatabase="admin" \
    --db="$DATABASE" \
    --out="$BACKUP_DIR/$BACKUP_NAME" \
    --gzip

if [ $? -eq 0 ]; then
    log_info "Backup created successfully"
else
    log_error "Backup failed!"
    exit 1
fi

# Create a compressed archive
log_info "Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
log_info "Backup compressed: ${BACKUP_NAME}.tar.gz ($BACKUP_SIZE)"

# Upload to S3 if configured
if [ -n "$S3_BUCKET" ]; then
    log_info "Uploading to S3: s3://$S3_BUCKET/"
    aws s3 cp "${BACKUP_NAME}.tar.gz" "s3://$S3_BUCKET/mongodb/${BACKUP_NAME}.tar.gz"
    if [ $? -eq 0 ]; then
        log_info "S3 upload successful"
    else
        log_warn "S3 upload failed, backup retained locally"
    fi
fi

# Clean up old backups
log_info "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "daraa_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
REMAINING=$(ls -1 "$BACKUP_DIR"/daraa_backup_*.tar.gz 2>/dev/null | wc -l)
log_info "Remaining backups: $REMAINING"

# Create latest symlink
ln -sf "${BACKUP_NAME}.tar.gz" "$BACKUP_DIR/latest.tar.gz"

log_info "=========================================="
log_info "Backup Complete!"
log_info "=========================================="
log_info "Backup file: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
log_info "Size: $BACKUP_SIZE"

