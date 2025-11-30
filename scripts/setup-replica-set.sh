#!/bin/bash
#
# MongoDB Replica Set Setup Script
# 
# This script initializes the MongoDB replica set for high availability
# Run this after starting the containers with docker-compose.ha.yml
#
# Usage: ./setup-replica-set.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
MONGO_ROOT_USERNAME="${MONGO_ROOT_USERNAME:-admin}"
MONGO_ROOT_PASSWORD="${MONGO_ROOT_PASSWORD:-DaraaSecurePassword2024}"
PRIMARY_HOST="daraa-mongodb-primary"
SECONDARY_HOST="daraa-mongodb-secondary"
ARBITER_HOST="daraa-mongodb-arbiter"

log_info "=========================================="
log_info "MongoDB Replica Set Setup"
log_info "=========================================="

# Wait for MongoDB to be ready
log_info "Waiting for MongoDB primary to be ready..."
sleep 10

# Check if replica set is already initialized
REPLICA_STATUS=$(docker exec daraa-mongodb-primary mongosh -u "$MONGO_ROOT_USERNAME" -p "$MONGO_ROOT_PASSWORD" --authenticationDatabase admin --quiet --eval "rs.status().ok" 2>/dev/null || echo "0")

if [ "$REPLICA_STATUS" == "1" ]; then
    log_warn "Replica set is already initialized"
    docker exec daraa-mongodb-primary mongosh -u "$MONGO_ROOT_USERNAME" -p "$MONGO_ROOT_PASSWORD" --authenticationDatabase admin --eval "rs.status()"
    exit 0
fi

log_info "Initializing replica set..."

# Initialize replica set
docker exec daraa-mongodb-primary mongosh -u "$MONGO_ROOT_USERNAME" -p "$MONGO_ROOT_PASSWORD" --authenticationDatabase admin --eval "
rs.initiate({
    _id: 'rs0',
    members: [
        { _id: 0, host: '${PRIMARY_HOST}:27017', priority: 2 },
        { _id: 1, host: '${SECONDARY_HOST}:27017', priority: 1 },
        { _id: 2, host: '${ARBITER_HOST}:27017', arbiterOnly: true }
    ]
})
"

log_info "Waiting for replica set to stabilize..."
sleep 15

# Check replica set status
log_info "Checking replica set status..."
docker exec daraa-mongodb-primary mongosh -u "$MONGO_ROOT_USERNAME" -p "$MONGO_ROOT_PASSWORD" --authenticationDatabase admin --eval "rs.status()"

log_info "=========================================="
log_info "Replica Set Setup Complete!"
log_info "=========================================="
log_info "Primary: ${PRIMARY_HOST}:27017"
log_info "Secondary: ${SECONDARY_HOST}:27017"
log_info "Arbiter: ${ARBITER_HOST}:27017"

