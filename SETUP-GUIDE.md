# Vikings Invoice System - Setup Guide

Panduan lengkap setup untuk **Local Development** dan **Production Server**.

---

## 🏠 LOCAL DEVELOPMENT

### Prerequisites
- Node.js 20+
- Docker Desktop (untuk MongoDB)

### Setup Steps

#### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd vikings
npm run install:all
```

#### 2. Setup Environment Files (LOCAL)
```bash
# Backend
cp backend/.env.local.example backend/.env

# User App
cp user-app/.env.local.example user-app/.env

# Admin App
cp admin-app/.env.local.example admin-app/.env
```

**File contents akan seperti:**
- Backend `.env`: `MONGODB_URI=mongodb://admin:admin123@localhost:27017/...`
- User App `.env`: `VITE_API_URL=http://localhost:3202/api`
- Admin App `.env`: `VITE_API_URL=http://localhost:3202/api`

#### 3. Start MongoDB dengan Docker
```bash
docker-compose up -d mongodb
# atau
npm run docker:up
```

#### 4. Start Development Servers
```bash
# Opsi 1: All-in-one (recommended)
npm run dev

# Opsi 2: Manual individual
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: User App
cd user-app && npm run dev

# Terminal 3: Admin App
cd admin-app && npm run dev
```

#### 5. Access Applications

**URLs:**
- 🌐 **User App:** http://localhost:3200
- 🛡️ **Admin App:** http://localhost:3201
- 🔌 **Backend API:** http://localhost:3202
- 🗄️ **MongoDB:** localhost:27017

#### 6. Test

**User App:**
1. Buka http://localhost:3200
2. Login dengan nomor HP (contoh: +6281234567890)
3. Upload gambar
4. Lihat di upload history

**Admin App:**
1. Buka http://localhost:3201
2. Login: username `admin`, password `admin`
3. Lihat users dan uploads

#### 7. Stop Services
```bash
# Stop dev servers: Ctrl + C

# Stop MongoDB
docker-compose down
```

---

## 🚀 PRODUCTION SERVER

### Prerequisites
- Node.js 20+
- PM2 (process manager)
- MongoDB (Docker atau native)
- Nginx (reverse proxy)
- Domain name (optional)

### Setup Steps

#### 1. Clone Repository
```bash
git clone <repo-url>
cd vikings
chmod +x scripts/*.sh
```

#### 2. Run Setup Script (Install Dependencies & Build)
```bash
./scripts/server-setup.sh
```

**Script ini akan otomatis:**
- ✅ Install PM2 globally
- ✅ Install dependencies (backend, admin-app, user-app)
- ✅ Create .env files dari .example
- ✅ Build frontend apps
- ✅ Setup PM2 log rotation
- ✅ Create logs directories

#### 3. Setup MongoDB

**Opsi A: Docker (Recommended)**
```bash
./scripts/server-mongodb.sh docker
```

**Opsi B: Native Install**
```bash
./scripts/server-mongodb.sh native
# Ikuti petunjuk installation
```

**Check Status:**
```bash
./scripts/server-mongodb.sh status
```

#### 4. Edit Environment Files (PRODUCTION)

**Backend:**
```bash
nano backend/.env
```
```env
NODE_ENV=production
PORT=3202
MONGODB_URI=mongodb://admin:admin123@localhost:27017/invoice_db?authSource=admin
```

**User App:**
```bash
nano user-app/.env
```
```env
# Opsi 1: Jika pakai domain
VITE_API_URL=http://deluwang.online/api

# Opsi 2: Jika pakai IP server
# VITE_API_URL=http://your-server-ip:3202/api
```

**Admin App:**
```bash
nano admin-app/.env
```
```env
# Opsi 1: Jika admin punya subdomain sendiri
VITE_API_URL=http://admin.deluwang.online/api

# Opsi 2: Sama dengan user app
# VITE_API_URL=http://deluwang.online/api
```

**PENTING:** Jika edit .env setelah build, rebuild lagi:
```bash
cd user-app && npm run build && cd ..
cd admin-app && npm run build && cd ..
```

#### 5. Update Vite Config dengan Domain Anda

**User App:**
```bash
nano user-app/vite.config.js
```

Update bagian `allowedHosts`:
```javascript
preview: {
  allowedHosts: [
    'localhost',
    'deluwang.online',        // ← Domain Anda
    'www.deluwang.online',    // ← WWW subdomain
    // 'your-server-ip'       // ← IP server (optional)
  ]
}
```

**Admin App:**
```bash
nano admin-app/vite.config.js
```

Update bagian `allowedHosts`:
```javascript
preview: {
  allowedHosts: [
    'localhost',
    'admin.deluwang.online',  // ← Subdomain admin
    'deluwang.online',
    // 'your-server-ip'
  ]
}
```

**Rebuild setelah update:**
```bash
cd user-app && npm run build && cd ..
cd admin-app && npm run build && cd ..
```

#### 6. Start PM2 Services
```bash
./scripts/server-start.sh
```

**Verify:**
```bash
pm2 status
# Harus muncul:
# - vikings-backend (port 3202)
# - vikings-user-app (port 3200)
# - vikings-admin-app (port 3201)
```

#### 7. Setup Nginx Reverse Proxy

**User App Config (`/etc/nginx/sites-available/deluwang.online`):**
```nginx
server {
    listen 80;
    server_name deluwang.online www.deluwang.online;

    # Optional: Basic Auth
    # auth_basic "Restricted Area";
    # auth_basic_user_file /etc/nginx/.htpasswd;

    # Proxy ke User App (PM2 port 3200)
    location / {
        proxy_pass http://localhost:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Optional: Proxy API juga (jika VITE_API_URL pakai /api path)
    # location /api {
    #     proxy_pass http://localhost:3202;
    #     proxy_http_version 1.1;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # }
}
```

**Admin App Config (`/etc/nginx/sites-available/admin.deluwang.online`):**
```nginx
server {
    listen 80;
    server_name admin.deluwang.online;

    # Recommended: Basic Auth untuk admin
    auth_basic "Admin Area";
    auth_basic_user_file /etc/nginx/.htpasswd;

    # Proxy ke Admin App (PM2 port 3201)
    location / {
        proxy_pass http://localhost:3201;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Backend API Config (Optional - jika mau API subdomain terpisah):**
```nginx
server {
    listen 80;
    server_name api.deluwang.online;

    location / {
        proxy_pass http://localhost:3202;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Enable sites & reload:**
```bash
sudo ln -s /etc/nginx/sites-available/deluwang.online /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.deluwang.online /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

#### 8. Setup Auto-start on Reboot
```bash
pm2 startup
pm2 save
```

#### 9. Test Production

**URLs:**
- 🌐 **User App:** http://deluwang.online
- 🛡️ **Admin App:** http://admin.deluwang.online
- 🔌 **Backend API:** http://localhost:3202/api/health (internal)

**Test dari server:**
```bash
# Test ports listening
netstat -tulpn | grep 320

# Test backend
curl http://localhost:3202/api/health

# Test user app
curl http://localhost:3200

# Test admin app
curl http://localhost:3201

# Test via domain
curl -I http://deluwang.online
```

---

## 📊 Architecture Comparison

### Local Development
```
┌──────────┐
│  Browser │
└─────┬────┘
      │
      ▼
┌─────────────────────────────────┐
│  Vite Dev Server                │
│  - User App: :3200 (HMR)       │
│  - Admin App: :3201 (HMR)      │
│  - Backend: :3202 (nodemon)    │
└──────────┬──────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ MongoDB      │
    │ (Docker)     │
    │ :27017       │
    └──────────────┘
```

### Production Server
```
┌──────────┐
│  Browser │
└─────┬────┘
      │
      ▼
┌─────────────────────────────────┐
│  Nginx (:80)                    │
│  ├─ deluwang.online → :3200    │
│  └─ admin.deluwang.online→:3201│
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  PM2 Process Manager            │
│  ├─ vikings-user-app (:3200)   │
│  ├─ vikings-admin-app (:3201)  │
│  └─ vikings-backend (:3202)    │
└──────────┬──────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ MongoDB      │
    │ (Docker/Native) │
    │ :27017       │
    └──────────────┘
```

---

## 🔄 Update & Deployment Workflow

### Local Development
```bash
# Pull latest code
git pull origin main

# Install new dependencies (if any)
npm run install:all

# Start dev servers
npm run dev
```

### Production Server
```bash
# Update dengan script otomatis
./scripts/server-update.sh

# Manual:
git pull origin main
cd backend && npm install && cd ..
cd user-app && npm install && npm run build && cd ..
cd admin-app && npm install && npm run build && cd ..
pm2 restart ecosystem.config.js
```

---

## 🗂️ Environment Files Summary

### Local (.env files)
```
backend/.env          → PORT=3202, MONGODB_URI=localhost
user-app/.env         → VITE_API_URL=http://localhost:3202/api
admin-app/.env        → VITE_API_URL=http://localhost:3202/api
```

### Production (.env files)
```
backend/.env          → PORT=3202, MONGODB_URI=localhost
user-app/.env         → VITE_API_URL=http://deluwang.online/api
admin-app/.env        → VITE_API_URL=http://admin.deluwang.online/api
```

### Vite Config (allowedHosts)
```
user-app/vite.config.js   → allowedHosts: ['localhost', 'deluwang.online', ...]
admin-app/vite.config.js  → allowedHosts: ['localhost', 'admin.deluwang.online', ...]
```

---

## 💡 Tips & Best Practices

### Local Development
1. ✅ Gunakan `npm run dev` untuk hot reload
2. ✅ MongoDB di Docker (mudah start/stop)
3. ✅ Git commit sebelum push ke production
4. ✅ Test di local dulu sebelum deploy

### Production Server
1. ✅ Selalu rebuild frontend setelah edit .env
2. ✅ Gunakan `./scripts/server-update.sh` untuk deploy
3. ✅ Check `pm2 logs` jika ada error
4. ✅ Setup SSL/TLS dengan Certbot (Let's Encrypt)
5. ✅ Backup database secara berkala
6. ✅ Monitor dengan `pm2 monit`

---

## 🐛 Troubleshooting

### Local Development

**Port sudah dipakai:**
```bash
# Windows
netstat -ano | findstr :3200

# Linux/Mac
lsof -i :3200

# Kill process
kill -9 <PID>
```

**MongoDB tidak konek:**
```bash
docker-compose ps
docker-compose logs mongodb
docker-compose restart mongodb
```

### Production Server

**Error "host not allowed" (Vite):**
1. Check `vite.config.js` → `allowedHosts` sudah benar
2. Rebuild: `npm run build`
3. Restart PM2: `pm2 restart vikings-user-app`

**502 Bad Gateway (Nginx):**
```bash
# Check PM2 running
pm2 status

# Check port listening
netstat -tulpn | grep 3200

# Restart PM2
pm2 restart all
```

**API tidak bisa diakses:**
1. Check `.env` → `VITE_API_URL` benar
2. Rebuild frontend
3. Check backend running: `curl http://localhost:3202/api/health`

---

## 📞 Quick Commands Reference

### Local
```bash
npm run dev                    # Start all (MongoDB + Services)
npm run docker:up              # Start MongoDB only
npm run docker:down            # Stop MongoDB
```

### Production
```bash
./scripts/server-setup.sh      # First-time setup
./scripts/server-start.sh      # Start PM2 services
./scripts/server-stop.sh       # Stop PM2 services
./scripts/server-restart.sh    # Restart PM2 services
./scripts/server-update.sh     # Git pull + rebuild + restart
./scripts/server-logs.sh       # View logs
pm2 status                     # Check status
pm2 monit                      # Monitor real-time
```

---

**Happy Coding!** 🚀
