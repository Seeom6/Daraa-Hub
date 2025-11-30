# Secrets Directory

This directory contains sensitive credentials for Docker Compose services.

## Setup

Create the following secret files:

```bash
# MongoDB Secrets
echo "DaraaSecurePassword2024" > mongo_root_password.txt
echo "DaraaAppPassword2024" > mongo_app_password.txt
echo "DaraaBackupPassword2024" > mongo_backup_password.txt

# Redis Secret
echo "DaraaRedisPassword2024" > redis_password.txt

# JWT Secrets
openssl rand -base64 64 > jwt_secret.txt
openssl rand -base64 64 > jwt_refresh_secret.txt

# Cookie Secret
openssl rand -base64 32 > cookie_secret.txt

# Set proper permissions
chmod 600 *.txt
```

## Production

**IMPORTANT:** Change all default passwords before deploying to production!

Generate strong random passwords:
```bash
# Generate random password
openssl rand -base64 32
```

## Security

- Never commit these files to git
- Keep backups in a secure location
- Rotate secrets regularly
- Use different secrets for each environment

