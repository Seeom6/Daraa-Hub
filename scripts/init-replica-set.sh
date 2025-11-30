#!/bin/bash

# ============================================
# Initialize MongoDB Replica Set
# ============================================
# This script initializes a MongoDB replica set
# Run this after starting the MongoDB containers
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Initializing MongoDB Replica Set${NC}"
echo -e "${GREEN}============================================${NC}"

# MongoDB credentials
MONGO_ROOT_USERNAME=${MONGO_ROOT_USERNAME:-admin}
MONGO_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:-DaraaSecurePassword2024}

# Wait for MongoDB containers to be ready
echo -e "${YELLOW}Waiting for MongoDB containers to be ready...${NC}"
sleep 10

# Initialize replica set
echo -e "${YELLOW}Initializing replica set...${NC}"

docker exec daraa-mongodb-primary mongosh -u "$MONGO_ROOT_USERNAME" -p "$MONGO_ROOT_PASSWORD" --authenticationDatabase admin <<EOF
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "daraa-mongodb-primary:27017", priority: 2 },
    { _id: 1, host: "daraa-mongodb-secondary:27017", priority: 1 },
    { _id: 2, host: "daraa-mongodb-arbiter:27017", arbiterOnly: true }
  ]
});
EOF

echo -e "${YELLOW}Waiting for replica set to initialize...${NC}"
sleep 15

# Check replica set status
echo -e "${YELLOW}Checking replica set status...${NC}"

docker exec daraa-mongodb-primary mongosh -u "$MONGO_ROOT_USERNAME" -p "$MONGO_ROOT_PASSWORD" --authenticationDatabase admin <<EOF
rs.status();
EOF

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Replica set initialized successfully!${NC}"
echo -e "${GREEN}============================================${NC}"

echo ""
echo -e "${YELLOW}📝 Replica Set Configuration:${NC}"
echo -e "- Primary: daraa-mongodb-primary:27017"
echo -e "- Secondary: daraa-mongodb-secondary:27017"
echo -e "- Arbiter: daraa-mongodb-arbiter:27017"

echo ""
echo -e "${YELLOW}📝 Connection String:${NC}"
echo -e "mongodb://daraa_app:DaraaAppPassword2024@daraa-mongodb-primary:27017,daraa-mongodb-secondary:27017/daraa?authSource=daraa&replicaSet=rs0"

echo ""
echo -e "${GREEN}Done!${NC}"

