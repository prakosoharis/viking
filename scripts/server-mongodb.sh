#!/bin/bash

MODE=${1:-docker}

echo "========================================"
echo "MongoDB Setup - Vikings Invoice System"
echo "========================================"
echo ""

if [ "$MODE" = "docker" ]; then
    echo "🐳 Setting up MongoDB with Docker..."
    echo ""

    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker not found. Please install Docker first."
        echo ""
        echo "Install Docker:"
        echo "  Ubuntu/Debian: https://docs.docker.com/engine/install/ubuntu/"
        echo "  CentOS/RHEL: https://docs.docker.com/engine/install/centos/"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose not found. Please install Docker Compose first."
        exit 1
    fi

    echo "✅ Docker detected: $(docker --version)"
    echo "✅ Docker Compose detected: $(docker-compose --version)"
    echo ""

    # Start MongoDB with Docker Compose
    echo "🚀 Starting MongoDB container..."
    docker-compose up -d mongodb

    if [ $? -ne 0 ]; then
        echo "❌ Failed to start MongoDB container!"
        exit 1
    fi

    echo ""
    echo "⏳ Waiting for MongoDB to be ready..."
    sleep 5

    # Check if MongoDB is running
    if docker-compose ps | grep mongodb | grep -q Up; then
        echo "✅ MongoDB is running!"
        echo ""
        echo "📋 MongoDB Info:"
        echo "   Container: vikings-mongodb"
        echo "   Port: 27017"
        echo "   Database: invoice_db"
        echo "   Username: admin"
        echo "   Password: admin123"
        echo "   Connection: mongodb://admin:admin123@localhost:27017/invoice_db?authSource=admin"
        echo ""
        echo "📊 Useful commands:"
        echo "   docker-compose logs mongodb     # View logs"
        echo "   docker-compose stop mongodb     # Stop MongoDB"
        echo "   docker-compose restart mongodb  # Restart MongoDB"
        echo "   docker-compose down             # Stop and remove container"
    else
        echo "❌ MongoDB failed to start. Check logs:"
        echo "   docker-compose logs mongodb"
        exit 1
    fi

elif [ "$MODE" = "native" ]; then
    echo "📦 Native MongoDB Installation Guide"
    echo ""
    echo "This script will guide you through native MongoDB installation."
    echo ""

    # Detect OS
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        echo "❌ Cannot detect OS. Please install MongoDB manually."
        exit 1
    fi

    echo "Detected OS: $OS"
    echo ""

    case $OS in
        ubuntu|debian)
            echo "📦 Installing MongoDB on Ubuntu/Debian..."
            echo ""
            echo "Run these commands:"
            echo ""
            echo "# Import MongoDB public GPG key"
            echo "curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor"
            echo ""
            echo "# Add MongoDB repository"
            echo "echo \"deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse\" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list"
            echo ""
            echo "# Update and install"
            echo "sudo apt-get update"
            echo "sudo apt-get install -y mongodb-org"
            echo ""
            echo "# Start MongoDB"
            echo "sudo systemctl start mongod"
            echo "sudo systemctl enable mongod"
            echo ""
            echo "# Create admin user"
            echo "mongosh <<EOF"
            echo "use admin"
            echo "db.createUser({"
            echo "  user: 'admin',"
            echo "  pwd: 'admin123',"
            echo "  roles: [ { role: 'root', db: 'admin' } ]"
            echo "})"
            echo "EOF"
            ;;

        centos|rhel|rocky|almalinux)
            echo "📦 Installing MongoDB on CentOS/RHEL..."
            echo ""
            echo "Run these commands:"
            echo ""
            echo "# Add MongoDB repository"
            echo "cat > /etc/yum.repos.d/mongodb-org-7.0.repo <<EOF"
            echo "[mongodb-org-7.0]"
            echo "name=MongoDB Repository"
            echo "baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/7.0/x86_64/"
            echo "gpgcheck=1"
            echo "enabled=1"
            echo "gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc"
            echo "EOF"
            echo ""
            echo "# Install"
            echo "sudo yum install -y mongodb-org"
            echo ""
            echo "# Start MongoDB"
            echo "sudo systemctl start mongod"
            echo "sudo systemctl enable mongod"
            echo ""
            echo "# Create admin user (same as Ubuntu)"
            ;;

        *)
            echo "⚠️  Unsupported OS: $OS"
            echo ""
            echo "Please visit: https://docs.mongodb.com/manual/installation/"
            ;;
    esac

    echo ""
    echo "After installation, update backend/.env:"
    echo "  MONGODB_URI=mongodb://admin:admin123@localhost:27017/invoice_db?authSource=admin"

elif [ "$MODE" = "status" ]; then
    echo "📊 Checking MongoDB status..."
    echo ""

    # Check Docker MongoDB
    if docker-compose ps 2>/dev/null | grep mongodb | grep -q Up; then
        echo "🐳 Docker MongoDB: ✅ Running"
        docker-compose ps | grep mongodb
    else
        echo "🐳 Docker MongoDB: ❌ Not running"
    fi

    echo ""

    # Check native MongoDB
    if command -v mongod &> /dev/null; then
        echo "📦 Native MongoDB: Installed"
        if systemctl is-active --quiet mongod 2>/dev/null; then
            echo "   Status: ✅ Running"
        else
            echo "   Status: ❌ Not running"
        fi
    else
        echo "📦 Native MongoDB: Not installed"
    fi

else
    echo "❌ Invalid mode: $MODE"
    echo ""
    echo "Usage:"
    echo "  ./scripts/server-mongodb.sh docker    # Setup with Docker (recommended)"
    echo "  ./scripts/server-mongodb.sh native    # Show native installation guide"
    echo "  ./scripts/server-mongodb.sh status    # Check MongoDB status"
    echo ""
    exit 1
fi

echo ""
echo "========================================"
echo "Done! ✅"
echo "========================================"
