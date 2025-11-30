#!/bin/bash

# ============================================
# Generate MongoDB Keyfile for Replica Set
# ============================================
# This script generates a keyfile for MongoDB replica set authentication
# Run this before starting the MongoDB containers
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Generating MongoDB Keyfile${NC}"
echo -e "${GREEN}============================================${NC}"

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Generate keyfile
KEYFILE="scripts/mongodb-keyfile"

if [ -f "$KEYFILE" ]; then
    echo -e "${YELLOW}⚠️  Keyfile already exists${NC}"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Skipping keyfile generation${NC}"
        exit 0
    fi
fi

# Generate random keyfile
openssl rand -base64 756 > "$KEYFILE"

# Set proper permissions
chmod 400 "$KEYFILE"

echo -e "${GREEN}✅ Keyfile generated successfully!${NC}"
echo -e "Location: $KEYFILE"

echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "1. Start MongoDB containers: docker-compose -f docker-compose.production.yml up -d"
echo -e "2. Initialize replica set: ./scripts/init-replica-set.sh"

echo ""
echo -e "${RED}⚠️  IMPORTANT:${NC}"
echo -e "- Keep this keyfile secure"
echo -e "- Never commit it to git"
echo -e "- Use the same keyfile for all replica set members"

echo ""
echo -e "${GREEN}Done!${NC}"

