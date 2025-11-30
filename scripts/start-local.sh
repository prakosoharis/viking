#!/bin/bash

echo "========================================"
echo "Vikings Invoice System - Local Development"
echo "========================================"
echo ""
echo "Starting MongoDB with Docker..."
docker-compose up -d mongodb
sleep 3
echo ""
echo "MongoDB started!"
echo ""
echo "Starting all services..."
echo "- Backend API: http://localhost:3202"
echo "- Admin App: http://localhost:3201"
echo "- User App: http://localhost:3200"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""
npm run dev
