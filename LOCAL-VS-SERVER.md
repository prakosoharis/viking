# Local vs Server - Quick Reference

Perbedaan konfigurasi antara **Local Development** dan **Production Server**.

---

## 📋 Comparison Table

| Aspect | 🏠 Local Development | 🚀 Production Server |
|--------|---------------------|---------------------|
| **MongoDB** | Docker (docker-compose) | Docker atau Native install |
| **Process Manager** | Manual (npm run dev) | PM2 |
| **Frontend Serve** | Vite Dev Server (HMR) | Vite Preview (via PM2) |
| **Backend Run** | nodemon (auto-reload) | PM2 (production mode) |
| **Nginx** | ❌ Tidak perlu | ✅ Reverse proxy |
| **Domain** | localhost | deluwang.online, admin.deluwang.online |
| **Environment Files** | `.env.local.example` | `.env.production.example` |
| **Build** | ❌ Tidak perlu | ✅ Harus build (`npm run build`) |
| **Auto-start** | ❌ Manual start | ✅ PM2 startup |
| **Logs** | Console output | PM2 logs + file rotation |

---

## 🔧 Configuration Files

### vite.config.js

**Local (Development):**
```javascript
server: {
  port: 3200,
  host: true,
  // No allowedHosts needed
}
```

**Server (Production):**
```javascript
preview: {
  port: 3200,
  host: true,
  allowedHosts: [
    'localhost',
    'deluwang.online',      // ← Domain production
    'www.deluwang.online'
  ]
}
```

---

### Environment Variables

#### Backend `.env`

**Local:**
```env
NODE_ENV=development
PORT=3202
MONGODB_URI=mongodb://admin:admin123@localhost:27017/invoice_db?authSource=admin
```

**Server:**
```env
NODE_ENV=production
PORT=3202
MONGODB_URI=mongodb://admin:admin123@localhost:27017/invoice_db?authSource=admin
```

*(Sama, tapi bisa beda credentials di production)*

#### User App `.env`

**Local:**
```env
VITE_API_URL=http://localhost:3202/api
```

**Server:**
```env
# Opsi 1: Via domain
VITE_API_URL=http://deluwang.online/api

# Opsi 2: Via subdomain API
VITE_API_URL=http://api.deluwang.online

# Opsi 3: Direct ke port (via IP)
VITE_API_URL=http://your-server-ip:3202/api
```

#### Admin App `.env`

**Local:**
```env
VITE_API_URL=http://localhost:3202/api
```

**Server:**
```env
# Opsi 1: Via subdomain admin (jika API di path yang sama)
VITE_API_URL=http://admin.deluwang.online/api

# Opsi 2: Via subdomain API terpisah
VITE_API_URL=http://api.deluwang.online

# Opsi 3: Via domain user app
VITE_API_URL=http://deluwang.online/api
```

---

## 🚀 Commands

### Local Development

**Setup (Sekali saja):**
```bash
npm run install:all
cp backend/.env.local.example backend/.env
cp user-app/.env.local.example user-app/.env
cp admin-app/.env.local.example admin-app/.env
```

**Daily Development:**
```bash
# Start MongoDB
docker-compose up -d mongodb

# Start all services (auto-reload)
npm run dev

# Stop
Ctrl + C
docker-compose down
```

**URLs:**
- User App: http://localhost:3200
- Admin App: http://localhost:3201
- Backend: http://localhost:3202

---

### Production Server

**Setup (Sekali saja):**
```bash
./scripts/server-setup.sh
./scripts/server-mongodb.sh docker

# Edit production .env
nano backend/.env
nano user-app/.env
nano admin-app/.env

# Update vite.config.js allowedHosts
nano user-app/vite.config.js
nano admin-app/vite.config.js

# Rebuild
cd user-app && npm run build && cd ..
cd admin-app && npm run build && cd ..

# Setup Nginx (manual)
# ... configure nginx ...

# Start
./scripts/server-start.sh

# Setup auto-start
pm2 startup
pm2 save
```

**Daily Operations:**
```bash
# Deploy update
./scripts/server-update.sh

# View logs
./scripts/server-logs.sh

# Restart
./scripts/server-restart.sh

# Status
pm2 status
```

**URLs:**
- User App: http://deluwang.online
- Admin App: http://admin.deluwang.online
- Backend: http://localhost:3202 (internal)

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Lupa rebuild setelah edit .env

**Problem:**
```bash
nano user-app/.env  # Edit VITE_API_URL
pm2 restart vikings-user-app  # ❌ WRONG! Changes not applied
```

**Solution:**
```bash
nano user-app/.env
cd user-app && npm run build && cd ..  # ✅ Rebuild!
pm2 restart vikings-user-app
```

**Why?** Environment variables di Vite di-bundle saat build time, bukan runtime!

---

### ❌ Mistake 2: Lupa update allowedHosts

**Problem:**
```nginx
# Nginx config
server_name newdomain.com;
proxy_pass http://localhost:3200;
```

Browser: `Error: host "newdomain.com" is not allowed`

**Solution:**
```javascript
// vite.config.js
preview: {
  allowedHosts: [
    'localhost',
    'deluwang.online',
    'newdomain.com'  // ← Add new domain!
  ]
}
```

Then rebuild!

---

### ❌ Mistake 3: Pakai .env.local di server

**Problem:**
```bash
# Di server
cp user-app/.env.local.example user-app/.env
# ❌ API URL = http://localhost:3202/api
# User buka dari browser → CORS error!
```

**Solution:**
```bash
# Di server
cp user-app/.env.production.example user-app/.env
nano user-app/.env
# ✅ API URL = http://deluwang.online/api
```

---

## 📊 Port Mapping

### Local Development
```
Port 3200 → Vite Dev (User App)
Port 3201 → Vite Dev (Admin App)
Port 3202 → nodemon (Backend)
Port 27017 → MongoDB (Docker)
```

### Production Server
```
Port 80 → Nginx
  ├─ deluwang.online → proxy → PM2 :3200 (User App)
  ├─ admin.deluwang.online → proxy → PM2 :3201 (Admin App)
  └─ (optional) api.deluwang.online → proxy → PM2 :3202

Port 3200 → PM2 (vite preview - User App)
Port 3201 → PM2 (vite preview - Admin App)
Port 3202 → PM2 (node - Backend)
Port 27017 → MongoDB (Docker/Native)
```

---

## 🎯 Checklist

### Local Development Checklist
- [ ] Node.js 20+ installed
- [ ] Docker Desktop installed & running
- [ ] Dependencies installed (`npm run install:all`)
- [ ] `.env` files created dari `.env.local.example`
- [ ] MongoDB started (`docker-compose up -d mongodb`)
- [ ] Dev servers running (`npm run dev`)
- [ ] Can access http://localhost:3200, 3201, 3202

### Production Server Checklist
- [ ] Node.js 20+ installed
- [ ] PM2 installed (`npm install -g pm2`)
- [ ] MongoDB setup (Docker atau native)
- [ ] Dependencies installed & built (`./scripts/server-setup.sh`)
- [ ] `.env` files created dari `.env.production.example` & edited
- [ ] `vite.config.js` updated dengan domain production
- [ ] Frontend rebuilt setelah edit .env
- [ ] PM2 services running (`pm2 status`)
- [ ] Nginx configured & reloaded
- [ ] Domain DNS pointing ke server IP
- [ ] Can access http://yourdomain.com
- [ ] PM2 auto-start configured (`pm2 startup && pm2 save`)

---

## 📞 Quick Help

**"Saya di local, mau start development"**
```bash
npm run dev
```

**"Saya di server, first time setup"**
```bash
./scripts/server-setup.sh
./scripts/server-mongodb.sh docker
# Edit .env files
# Update vite.config.js
# Rebuild & start
```

**"Saya di server, mau deploy update"**
```bash
./scripts/server-update.sh
```

**"Saya edit .env di server"**
```bash
cd user-app && npm run build && cd ..
pm2 restart vikings-user-app
```

**"Saya ganti domain"**
```bash
# 1. Update vite.config.js allowedHosts
# 2. Update .env VITE_API_URL
# 3. Rebuild
# 4. Update Nginx config
# 5. Restart PM2 & reload Nginx
```

---

Lihat **[SETUP-GUIDE.md](./SETUP-GUIDE.md)** untuk dokumentasi lengkap!
