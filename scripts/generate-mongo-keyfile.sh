#!/bin/bash
#
# Generate MongoDB Keyfile for Replica Set Authentication
#
# This script generates a secure keyfile required for MongoDB replica set
# internal authentication between nodes.
#
# Usage: ./generate-mongo-keyfile.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SECRETS_DIR="$PROJECT_ROOT/secrets"
KEYFILE_PATH="$SECRETS_DIR/mongo-keyfile"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}[INFO]${NC} Generating MongoDB keyfile..."

# Create secrets directory if it doesn't exist
mkdir -p "$SECRETS_DIR"

# Generate random keyfile
openssl rand -base64 756 > "$KEYFILE_PATH"

# Set proper permissions (MongoDB requires 400 or 600)
chmod 400 "$KEYFILE_PATH"

echo -e "${GREEN}[INFO]${NC} Keyfile generated at: $KEYFILE_PATH"
echo -e "${GREEN}[INFO]${NC} Permissions set to 400"
echo ""
echo "IMPORTANT: Keep this keyfile secure and backed up!"
echo "All replica set members must use the same keyfile."

