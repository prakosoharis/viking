#!/bin/bash

echo "========================================"
echo "Updating Vikings Invoice System"
echo "========================================"
echo ""

# Pull latest code
echo "Pulling latest code from git..."
git pull origin main

# Install dependencies
echo ""
echo "Checking for dependency updates..."
cd backend && npm install && cd ..
cd admin-app && npm install && cd ..
cd user-app && npm install && cd ..

# Build frontend
echo ""
echo "Building frontend applications..."
cd admin-app && npm run build && cd ..
cd user-app && npm run build && cd ..

# Restart services
echo ""
echo "Restarting all services..."
pm2 restart ecosystem.config.js

echo ""
echo "Update completed!"
echo ""
pm2 status
