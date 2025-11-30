#!/bin/bash

echo "========================================"
echo "Vikings Invoice System - Status"
echo "========================================"
echo ""
pm2 status
echo ""
echo "Detailed info:"
pm2 info vikings-backend
