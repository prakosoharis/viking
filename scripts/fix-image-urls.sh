#!/bin/bash

echo "============================================"
echo "Vikings Invoice - Fix Image URLs in Database"
echo "============================================"
echo ""

cd "$(dirname "$0")/.."

# Check if backend dependencies installed
if [ ! -d "backend/node_modules" ]; then
    echo "❌ Backend dependencies not installed!"
    echo "   Run: cd backend && npm install"
    exit 1
fi

# Run the fix script from backend directory (has node_modules)
echo "🛠️  Running image URL fixer..."
echo ""

cd backend
node ../scripts/fix-image-urls.js
EXIT_CODE=$?
cd ..

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "✅ Image URLs fixed successfully!"
    echo "============================================"
    echo ""
    echo "Next steps:"
    echo "1. Rebuild frontend apps:"
    echo "   cd user-app && npm run build && cd .."
    echo "   cd admin-app && npm run build && cd .."
    echo ""
    echo "2. Restart PM2:"
    echo "   pm2 restart vikings-user-app"
    echo "   pm2 restart vikings-admin-app"
    echo ""
else
    echo ""
    echo "============================================"
    echo "❌ Failed to fix image URLs"
    echo "============================================"
    exit 1
fi
