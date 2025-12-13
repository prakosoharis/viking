#!/bin/bash

echo "Stopping all Vikings services..."
pm2 stop ecosystem.config.js
echo ""
echo "All services stopped!"
echo ""
pm2 status
