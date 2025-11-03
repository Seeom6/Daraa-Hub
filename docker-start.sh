#!/bin/bash

# Daraa Docker Quick Start Script
# This script helps you quickly set up and start the Daraa application with Docker

set -e

echo "🚀 Daraa Docker Quick Start"
echo "============================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed."
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed."
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.docker..."
    cp .env.docker .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and update the following:"
    echo "   - JWT_SECRET (use a strong random secret)"
    echo "   - COOKIE_SECRET (use a strong random secret)"
    echo "   - Twilio credentials (if you want to send real SMS)"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to exit and edit .env first..."
fi

echo ""
echo "🐳 Starting Docker containers..."
echo ""

# Use docker-compose or docker compose based on what's available
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

# Build and start containers
$DOCKER_COMPOSE up --build -d

echo ""
echo "⏳ Waiting for services to be healthy..."
echo ""

# Wait for services to be healthy
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if $DOCKER_COMPOSE ps | grep -q "healthy"; then
        echo "✅ Services are healthy!"
        break
    fi
    
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts - Waiting for services to start..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "⚠️  Warning: Services may not be fully healthy yet."
    echo "   Check status with: $DOCKER_COMPOSE ps"
    echo "   Check logs with: $DOCKER_COMPOSE logs -f"
fi

echo ""
echo "✅ Daraa application is running!"
echo ""
echo "📊 Service Status:"
$DOCKER_COMPOSE ps
echo ""
echo "🌐 Access Points:"
echo "   - API Server: http://localhost:3001/api"
echo "   - MongoDB: mongodb://localhost:27017/daraa-auth"
echo ""
echo "📝 Useful Commands:"
echo "   - View logs: $DOCKER_COMPOSE logs -f"
echo "   - Stop services: $DOCKER_COMPOSE down"
echo "   - Restart services: $DOCKER_COMPOSE restart"
echo "   - View status: $DOCKER_COMPOSE ps"
echo ""
echo "📖 For more information, see DOCKER.md"
echo ""

