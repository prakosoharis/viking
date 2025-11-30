#!/bin/bash

echo "========================================"
echo "Restarting Vikings Invoice System"
echo "========================================"
echo ""
echo "Restarting all services..."
pm2 restart ecosystem.config.js
echo ""
echo "Services restarted!"
echo ""
pm2 status
