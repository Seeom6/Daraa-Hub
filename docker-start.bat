@echo off
REM Daraa Docker Quick Start Script for Windows
REM This script helps you quickly set up and start the Daraa application with Docker

echo.
echo 🚀 Daraa Docker Quick Start
echo ============================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker is not installed.
    echo Please install Docker Desktop from https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Error: Docker Compose is not available.
        echo Please make sure Docker Desktop is running.
        pause
        exit /b 1
    )
    set DOCKER_COMPOSE=docker compose
) else (
    set DOCKER_COMPOSE=docker-compose
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from .env.docker...
    copy .env.docker .env >nul
    echo ✅ .env file created
    echo.
    echo ⚠️  IMPORTANT: Please edit .env file and update the following:
    echo    - JWT_SECRET (use a strong random secret^)
    echo    - COOKIE_SECRET (use a strong random secret^)
    echo    - Twilio credentials (if you want to send real SMS^)
    echo.
    pause
)

echo.
echo 🐳 Starting Docker containers...
echo.

REM Build and start containers
%DOCKER_COMPOSE% up --build -d

echo.
echo ⏳ Waiting for services to be healthy...
echo.

REM Wait for services to be healthy (simplified for Windows)
timeout /t 10 /nobreak >nul

echo.
echo ✅ Daraa application is starting!
echo.
echo 📊 Service Status:
%DOCKER_COMPOSE% ps
echo.
echo 🌐 Access Points:
echo    - API Server: http://localhost:3001/api
echo    - MongoDB: mongodb://localhost:27017/daraa-auth
echo.
echo 📝 Useful Commands:
echo    - View logs: %DOCKER_COMPOSE% logs -f
echo    - Stop services: %DOCKER_COMPOSE% down
echo    - Restart services: %DOCKER_COMPOSE% restart
echo    - View status: %DOCKER_COMPOSE% ps
echo.
echo 📖 For more information, see DOCKER.md
echo.
pause

