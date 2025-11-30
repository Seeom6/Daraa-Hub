#!/bin/bash

# ============================================
# Create Docker Secrets
# ============================================
# This script creates secret files for Docker Compose
# Run this script before starting Docker Compose
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Creating Docker Secrets${NC}"
echo -e "${GREEN}============================================${NC}"

# Create secrets directory
SECRETS_DIR="./secrets"
mkdir -p "$SECRETS_DIR"

# Function to create secret file
create_secret() {
    local secret_name=$1
    local secret_value=$2
    local secret_file="$SECRETS_DIR/${secret_name}.txt"
    
    if [ -f "$secret_file" ]; then
        echo -e "${YELLOW}⚠️  Secret already exists: ${secret_name}${NC}"
        read -p "Overwrite? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Skipping ${secret_name}${NC}"
            return
        fi
    fi
    
    echo "$secret_value" > "$secret_file"
    chmod 600 "$secret_file"
    echo -e "${GREEN}✅ Created: ${secret_name}${NC}"
}

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32
}

echo ""
echo -e "${YELLOW}Creating MongoDB Secrets...${NC}"
create_secret "mongo_root_password" "DaraaSecurePassword2024"
create_secret "mongo_app_password" "DaraaAppPassword2024"
create_secret "mongo_backup_password" "DaraaBackupPassword2024"

echo ""
echo -e "${YELLOW}Creating Redis Secret...${NC}"
create_secret "redis_password" "DaraaRedisPassword2024"

echo ""
echo -e "${YELLOW}Creating JWT Secrets...${NC}"
create_secret "jwt_secret" "$(generate_secret)"
create_secret "jwt_refresh_secret" "$(generate_secret)"

echo ""
echo -e "${YELLOW}Creating Cookie Secret...${NC}"
create_secret "cookie_secret" "$(generate_secret)"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ All secrets created successfully!${NC}"
echo -e "${GREEN}============================================${NC}"

echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "1. Review the secrets in: ${SECRETS_DIR}"
echo -e "2. Update docker-compose.yml to use secrets"
echo -e "3. Start Docker Compose: docker-compose up -d"

echo ""
echo -e "${RED}⚠️  IMPORTANT:${NC}"
echo -e "- Never commit secrets to git"
echo -e "- Change default passwords in production"
echo -e "- Keep backups in a secure location"
echo -e "- Rotate secrets regularly"

echo ""
echo -e "${GREEN}Done!${NC}"

