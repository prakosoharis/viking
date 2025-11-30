#!/bin/bash

echo "========================================"
echo "Vikings Invoice System - First Time Setup"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version too old. Please upgrade to Node.js 20+"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
    echo "✅ PM2 installed"
else
    echo "✅ PM2 already installed"
fi
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo ""

echo "→ Backend dependencies..."
cd backend && npm install --production
if [ $? -ne 0 ]; then
    echo "❌ Backend npm install failed!"
    exit 1
fi
cd ..

echo "→ Admin App dependencies..."
cd admin-app && npm install
if [ $? -ne 0 ]; then
    echo "❌ Admin App npm install failed!"
    exit 1
fi
cd ..

echo "→ User App dependencies..."
cd user-app && npm install
if [ $? -ne 0 ]; then
    echo "❌ User App npm install failed!"
    exit 1
fi
cd ..

echo ""
echo "✅ All dependencies installed!"
echo ""

# Setup environment files
echo "🔧 Setting up environment files..."
echo ""

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env (please edit with your values)"
    ENV_NEEDS_EDIT=true
else
    echo "ℹ️  backend/.env already exists"
fi

if [ ! -f admin-app/.env ]; then
    cp admin-app/.env.example admin-app/.env
    echo "✅ Created admin-app/.env (please edit with your values)"
    ENV_NEEDS_EDIT=true
else
    echo "ℹ️  admin-app/.env already exists"
fi

if [ ! -f user-app/.env ]; then
    cp user-app/.env.example user-app/.env
    echo "✅ Created user-app/.env (please edit with your values)"
    ENV_NEEDS_EDIT=true
else
    echo "ℹ️  user-app/.env already exists"
fi

echo ""

# Create logs directories
echo "📁 Creating logs directories..."
mkdir -p logs backend/logs admin-app/logs user-app/logs
echo "✅ Logs directories created"
echo ""

# Build frontend apps
echo "🏗️  Building frontend applications..."
echo ""

echo "→ Building Admin App..."
cd admin-app && npm run build
if [ $? -ne 0 ]; then
    echo "❌ Admin App build failed!"
    exit 1
fi
cd ..

echo "→ Building User App..."
cd user-app && npm run build
if [ $? -ne 0 ]; then
    echo "❌ User App build failed!"
    exit 1
fi
cd ..

echo ""
echo "✅ Frontend apps built successfully!"
echo ""

# Setup PM2 log rotation (optional)
echo "📊 Setting up PM2 log rotation..."
if pm2 describe pm2-logrotate &> /dev/null; then
    echo "ℹ️  PM2 log rotation already configured"
else
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 7
    pm2 set pm2-logrotate:compress true
    pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
    echo "✅ PM2 log rotation configured"
fi
echo ""

# Summary
echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""

if [ "$ENV_NEEDS_EDIT" = true ]; then
    echo "⚠️  IMPORTANT: Edit environment files before starting:"
    echo "   - backend/.env"
    echo "   - admin-app/.env"
    echo "   - user-app/.env"
    echo ""
fi

echo "📋 Next Steps:"
echo ""
echo "1. Setup MongoDB:"
echo "   Option A (Docker): ./scripts/server-mongodb.sh docker"
echo "   Option B (Native): Install MongoDB manually"
echo ""
echo "2. Edit environment files if needed:"
echo "   nano backend/.env"
echo "   nano admin-app/.env"
echo "   nano user-app/.env"
echo ""
echo "3. Start services:"
echo "   ./scripts/server-start.sh"
echo ""
echo "4. Setup auto-start on reboot (optional):"
echo "   pm2 startup"
echo "   pm2 save"
echo ""

echo "========================================"
echo "Happy coding! 🚀"
echo "========================================"
