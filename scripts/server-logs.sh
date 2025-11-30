#!/bin/bash

# Check if service name is provided
if [ -z "$1" ]; then
    echo "Showing logs for all services..."
    echo "Press Ctrl+C to exit"
    echo ""
    pm2 logs
else
    echo "Showing logs for: $1"
    echo "Press Ctrl+C to exit"
    echo ""
    pm2 logs $1
fi
