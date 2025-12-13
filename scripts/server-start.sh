#!/bin/bash

echo "========================================"
echo "Vikings Invoice System - Production Server"
echo "========================================"
echo ""

# Check if this is first time setup
NEEDS_SETUP=false

if [ ! -d "backend/node_modules" ] || [ ! -d "admin-app/node_modules" ] || [ ! -d "user-app/node_modules" ]; then
    echo "❌ Dependencies not installed!"
    echo ""
    echo "Please run first-time setup:"
    echo "  chmod +x scripts/server-setup.sh"
    echo "  ./scripts/server-setup.sh"
    echo ""
    exit 1
fi

# Create logs directory if not exists
mkdir -p logs backend/logs admin-app/logs user-app/logs

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 not found!"
    echo ""
    echo "Please run first-time setup:"
    echo "  ./scripts/server-setup.sh"
    echo ""
    exit 1
fi

# Build frontend apps
echo "Building frontend applications..."
cd admin-app && npm run build && cd ..
cd user-app && npm run build && cd ..

echo ""
echo "Starting all services with PM2..."
pm2 start ecosystem.config.js

echo ""
echo "Services started!"
echo ""
pm2 status
echo ""
echo "Useful commands:"
echo "  pm2 logs           - View all logs"
echo "  pm2 logs backend   - View backend logs"
echo "  pm2 restart all    - Restart all services"
echo "  pm2 stop all       - Stop all services"
echo "  pm2 monit          - Monitor services"
echo ""
