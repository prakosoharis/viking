# Vikings Invoice System

Sistem manajemen invoice dan receipt dengan **2 aplikasi terpisah**: User App (untuk upload invoice) dan Admin App (untuk manage uploads), menggunakan Backend API dengan MongoDB.

---

## 📁 Struktur Project

```
vikings/
├── backend/              # Backend API (Node.js + Express + MongoDB)
│   ├── server.js
│   ├── uploads/         # File storage untuk gambar
│   └── Dockerfile
│
├── user-app/            # User Application (React + Vite)
│   └── src/
│
├── admin-app/           # Admin Application (React + Vite)
│   └── src/
│
├── scripts/             # Helper scripts untuk deployment
│   ├── start-local.sh         # Local development (all-in-one)
│   ├── server-setup.sh        # First-time server setup
│   ├── server-mongodb.sh      # MongoDB setup helper
│   ├── server-start.sh        # Start services (PM2)
│   ├── server-stop.sh         # Stop services
│   ├── server-restart.sh      # Restart services
│   ├── server-update.sh       # Deploy update (git pull + build)
│   ├── server-logs.sh         # View logs
│   └── server-status.sh       # Check status
│
├── docker-compose.yml       # Docker services
├── ecosystem.config.js      # PM2 configuration
├── package.json            # Root package (untuk dev scripts)
└── node_modules/           # Dependencies untuk concurrently
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop (untuk MongoDB)
- PM2 (untuk production server)

### Local Development (3 langkah!)

```bash
# 1. Install semua dependencies
npm run install:all

# 2. Setup environment variables
cp backend/.env.example backend/.env
cp admin-app/.env.example admin-app/.env
cp user-app/.env.example user-app/.env

# 3. Start semua services!
npm run dev
```

**Aplikasi sudah jalan! 🎉**
- Backend API: http://localhost:3202
- User App: http://localhost:3200
- Admin App: http://localhost:3201
- MongoDB: localhost:27017

**Stop services:** Tekan `Ctrl + C`

---

## 💻 Development Commands

### Root Directory Scripts

```bash
# Development
npm run dev              # Start semua services (MongoDB + Backend + Admin + User)
npm run dev:backend      # Start backend saja
npm run dev:admin        # Start admin-app saja
npm run dev:user         # Start user-app saja

# Build
npm run build:all        # Build kedua frontend apps
npm run build:admin      # Build admin-app saja
npm run build:user       # Build user-app saja

# Docker
npm run docker:up        # Start MongoDB + Backend di Docker
npm run docker:down      # Stop Docker services
npm run docker:logs      # View Docker logs

# Install
npm run install:all      # Install dependencies semua project
```

### Manual per-Service

```bash
# Backend
cd backend
npm run dev              # Development mode (nodemon)
npm start                # Production mode

# Admin App
cd admin-app
npm run dev              # Dev server (port 3201)
npm run build            # Production build
npm run preview          # Preview production build

# User App
cd user-app
npm run dev              # Dev server (port 3200)
npm run build            # Production build
npm run preview          # Preview production build
```

---

## 🏭 Production Deployment

### Setup Pertama Kali (3 Langkah!)

**Step 1: Clone Repository**
```bash
git clone <your-repo-url>
cd vikings
chmod +x scripts/*.sh
```

**Step 2: Run Setup Script** (Otomatis install semua!)
```bash
./scripts/server-setup.sh
```

Script ini akan otomatis:
- ✅ Install PM2 globally
- ✅ Install dependencies (backend, admin-app, user-app)
- ✅ Create environment files (.env)
- ✅ Build frontend applications
- ✅ Setup PM2 log rotation
- ✅ Create logs directories

**Step 3: Setup MongoDB**
```bash
# Opsi A: Docker (Recommended)
./scripts/server-mongodb.sh docker

# Opsi B: Native Install (lihat guide)
./scripts/server-mongodb.sh native

# Check status
./scripts/server-mongodb.sh status
```

**Step 4: Edit Environment Variables**
```bash
# Edit dengan nilai production Anda
nano backend/.env
nano admin-app/.env
nano user-app/.env
```

**Step 5: Start Services!**
```bash
./scripts/server-start.sh
```

Done! 🎉

### Daily Operations

```bash
# Update aplikasi (git pull + rebuild + restart)
./scripts/server-update.sh

# Restart semua services
./scripts/server-restart.sh

# Stop semua services
./scripts/server-stop.sh

# Lihat logs
./scripts/server-logs.sh                    # All services
./scripts/server-logs.sh vikings-backend    # Specific service

# Status services
./scripts/server-status.sh
pm2 status
pm2 monit                                    # Real-time monitoring
```

### Auto-start on Server Reboot

```bash
pm2 startup
pm2 save
```

### 📜 Available Scripts Reference

**Setup & Installation:**
```bash
./scripts/server-setup.sh          # First-time setup (install deps, build, configure)
./scripts/server-mongodb.sh docker # Setup MongoDB with Docker
./scripts/server-mongodb.sh native # Show native MongoDB install guide
./scripts/server-mongodb.sh status # Check MongoDB status
```

**Service Management:**
```bash
./scripts/server-start.sh          # Start all services with PM2
./scripts/server-stop.sh           # Stop all services
./scripts/server-restart.sh        # Restart all services
./scripts/server-status.sh         # Show services status
```

**Deployment & Updates:**
```bash
./scripts/server-update.sh         # Git pull + rebuild + restart
```

**Monitoring:**
```bash
./scripts/server-logs.sh           # View all logs
./scripts/server-logs.sh <name>    # View specific service logs
pm2 logs                           # PM2 logs (alternative)
pm2 monit                          # Real-time monitoring
```

---

## 🔧 Environment Variables

### backend/.env
```env
NODE_ENV=production
PORT=3202
MONGODB_URI=mongodb://admin:admin123@localhost:27017/invoice_db?authSource=admin
```

### admin-app/.env
```env
# Local development
VITE_API_URL=http://localhost:3202

# Production (ganti dengan domain Anda)
VITE_API_URL=http://api.yourdomain.com
```

### user-app/.env
```env
# Local development
VITE_API_URL=http://localhost:3202

# Production (ganti dengan domain Anda)
VITE_API_URL=http://api.yourdomain.com
```

---

## 🗄️ Database & Storage

### MongoDB
- **Database Name:** `invoice_db`
- **Collections:**
  - `users` - Data user (nomor HP, role, created_at)
  - `uploads` - Data upload gambar (user_id, image_url, uploaded_at)
- **Credentials:**
  - Username: `admin`
  - Password: `admin123`
- **Connection:** `mongodb://admin:admin123@localhost:27017/invoice_db?authSource=admin`

### File Storage
Gambar yang diupload disimpan di:
- **Local:** `backend/uploads/`
- **Docker:** `/app/uploads` (mounted ke `./backend/uploads`)
- **URL Pattern:** `http://localhost:3202/assets/{filename}`

### Schema

**Users Collection:**
```javascript
{
  _id: ObjectId,
  phone_number: String (unique, indexed),
  role: String (default: 'user'),
  created_at: Date (default: now)
}
```

**Uploads Collection:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User, indexed),
  image_url: String (file path),
  uploaded_at: Date (default: now, indexed desc),
  status: String (default: 'completed')
}
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/users/login` - Login atau create user baru

### Uploads
- `POST /api/uploads` - Upload images (multipart/form-data)
- `GET /api/uploads/user/:userId` - Get user's uploads
- `GET /api/uploads` - Get all uploads

### Admin
- `GET /api/admin/users-with-uploads` - Get users dengan upload data

### Static Assets
- `GET /assets/:filename` - Serve uploaded images

### Health Check
- `GET /api/health` - API health check

---

## 📊 Logging Strategy

### Log Locations

**Local Development:**
- Console output untuk semua services

**Production Server (PM2):**
- Backend: `backend/logs/backend-out.log` & `backend/logs/backend-error.log`
- Admin App: `admin-app/logs/admin-out.log` & `admin-app/logs/admin-error.log`
- User App: `user-app/logs/user-out.log` & `user-app/logs/user-error.log`
- PM2 System: `~/.pm2/logs/`

### Log Rotation (PM2)
- Max file size: 10MB
- Retain: 7 files
- Compress: Yes (gzip)
- Format: JSON with timestamps

### Viewing Logs

```bash
# PM2 logs
pm2 logs                              # All services real-time
pm2 logs vikings-backend              # Specific service
pm2 logs vikings-backend --lines 100  # Last 100 lines
pm2 logs vikings-backend --err        # Error logs only
pm2 flush                             # Clear all logs

# Docker logs
docker-compose logs -f                # All services
docker-compose logs backend           # Specific service
docker-compose logs mongodb           # MongoDB logs
```

---

## ✨ Fitur Aplikasi

### 👤 User App (Port 3200)
- **Login Sederhana:** Masukkan nomor HP saja (auto-create akun jika baru)
- **Upload Multiple Images:** Drag & drop atau pilih dari galeri
- **Validasi File:** Hanya menerima JPG, JPEG, PNG (max 10MB per file)
- **Success Modal:** Animasi sukus setelah upload
- **Upload History:** Lihat semua invoice yang pernah di-upload
- **Responsive:** Mobile-friendly design

### 🛡️ Admin App (Port 3201)
- **Login Admin:** Username & Password (`admin` / `admin`)
- **Lihat Semua User:** Yang memiliki uploads
- **Expandable View:** Klik user untuk lihat semua uploads mereka
- **Statistics:** Total uploads per user
- **Relational Data:** User → Images dengan proper aggregation
- **Responsive:** Desktop & mobile friendly

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Multer** - File upload handling
- **Docker** - Containerization

### Frontend
- **React 18.3.1** - UI Library
- **Vite 6.0.3** - Build tool & dev server
- **Tailwind CSS 3.4.17** - Styling
- **Lucide React** - Icons

### DevOps
- **PM2** - Process manager
- **Docker Compose** - Multi-container orchestration
- **Concurrently** - Run multiple commands (development)

---

## 🔐 Default Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin`

**User Login:**
- Nomor HP apapun (auto-create akun)
- Contoh: `+6281234567890`

---

## 🧪 Testing

### Backend API Health Check
```bash
curl http://localhost:3202/api/health
```

### User Login Test
```bash
curl -X POST http://localhost:3202/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+6281234567890"}'
```

### User Flow (via Browser)
1. Buka User App: http://localhost:3200
2. Login dengan nomor HP
3. Upload beberapa gambar
4. Lihat upload history

### Admin Flow (via Browser)
1. Buka Admin App: http://localhost:3201
2. Login (admin / admin)
3. Lihat daftar users
4. Klik user untuk expand dan lihat uploads

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check process using port
lsof -i :3202           # Linux/Mac (backend)
lsof -i :3200           # Linux/Mac (user app)
lsof -i :3201           # Linux/Mac (admin app)
netstat -ano | findstr :3202  # Windows

# Kill process
kill -9 <PID>           # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

### MongoDB Connection Error
```bash
# Check MongoDB status
docker-compose ps

# Restart MongoDB
docker-compose restart mongodb

# View logs
docker-compose logs mongodb

# Fresh start (deletes all data!)
docker-compose down -v
docker-compose up -d
```

### PM2 Service Won't Start
```bash
# Check error logs
pm2 logs vikings-backend --err --lines 50

# Delete and restart
pm2 delete vikings-backend
pm2 start ecosystem.config.js --only vikings-backend

# Reset PM2
pm2 kill
pm2 start ecosystem.config.js
```

### Frontend Build Errors
```bash
# Clear cache and reinstall
cd admin-app
rm -rf node_modules dist
npm install
npm run build
```

### Cannot Access Uploaded Images
```bash
# Check uploads directory
ls -la backend/uploads

# Check permissions
chmod 755 backend/uploads

# Check backend logs
pm2 logs vikings-backend
```

---

## 🔄 Deployment Workflow

### Development to Production

```bash
# 1. Di local: commit & push
git add .
git commit -m "Your changes"
git push origin main

# 2. Di server: deploy
ssh your-server
cd /path/to/vikings
./scripts/server-update.sh
```

**Script `server-update.sh` akan otomatis:**
- Git pull latest code
- Install dependencies jika ada update
- Build frontend apps
- Restart PM2 services

---

## 🌐 Nginx Configuration (Optional)

Untuk production dengan Nginx sebagai reverse proxy:

### Reverse Proxy ke PM2 Services

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3202;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Admin App
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://localhost:3201;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# User App
server {
    listen 80;
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://localhost:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Atau Serve Static Files Langsung (Better Performance)

```nginx
# Admin App (Static Files)
server {
    listen 80;
    server_name admin.yourdomain.com;

    root /path/to/vikings/admin-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# User App (Static Files)
server {
    listen 80;
    server_name app.yourdomain.com;

    root /path/to/vikings/user-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📦 Dependencies Info

### Root `node_modules/`
**PENTING:** Jangan hapus `node_modules/` di root directory!

- Digunakan oleh: `package.json` di root
- Package: `concurrently` (untuk menjalankan multiple services sekaligus)
- Diperlukan untuk: `npm run dev` command

Jika terhapus, install ulang:
```bash
npm install
```

---

## 🎯 PM2 Commands Reference

```bash
# Process Management
pm2 list                          # List all processes
pm2 start ecosystem.config.js     # Start all services
pm2 stop all                      # Stop all
pm2 restart all                   # Restart all
pm2 delete all                    # Delete all from PM2

# Specific Service
pm2 start ecosystem.config.js --only vikings-backend
pm2 restart vikings-backend
pm2 stop vikings-backend
pm2 delete vikings-backend

# Monitoring
pm2 monit                         # Real-time monitoring
pm2 status                        # Status overview
pm2 info vikings-backend          # Detailed info

# Logs
pm2 logs                          # All logs real-time
pm2 logs vikings-backend          # Specific service
pm2 logs --lines 100              # Last 100 lines
pm2 flush                         # Clear logs

# Persistence
pm2 save                          # Save current process list
pm2 startup                       # Setup auto-start on boot
pm2 unstartup                     # Remove auto-start

# Utilities
pm2 reset vikings-backend         # Reset restart count
pm2 reload all                    # Zero-downtime reload
```

---

## 📝 Migration Notes

### Dari localStorage ke MongoDB

Aplikasi ini sebelumnya menggunakan localStorage untuk semua data. Sekarang sudah migasi ke MongoDB.

**Perubahan utama:**
- ✅ User data: localStorage → MongoDB `users` collection
- ✅ Upload data: localStorage base64 → File system + MongoDB `uploads` collection
- ✅ Images: base64 data URLs → Static files served via `/assets` endpoint
- ℹ️ Session: Tetap menggunakan localStorage (untuk user session management)

**Keuntungan:**
- Unlimited storage (tidak dibatasi 5-10MB)
- Data persisten dan aman
- Proper file storage untuk gambar
- Multi-device access
- Database indexing untuk query cepat
- Production-ready architecture

**Data lama tidak otomatis migrate.** Ini adalah fresh start dengan database baru.

---

## 🌟 Features Checklist

- ✅ 2 aplikasi terpisah (User & Admin)
- ✅ Backend API dengan Express + MongoDB
- ✅ File upload dengan proper storage
- ✅ Docker support untuk MongoDB
- ✅ PM2 support untuk production
- ✅ Automated deployment scripts
- ✅ Log rotation & management
- ✅ PostgreSQL-compatible schema design
- ✅ Responsive design (mobile & desktop)
- ✅ Smooth animations
- ✅ Error handling & validation
- ✅ Production-ready logging

---

## 📚 Browser Support

- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- Mobile browsers ✅

---

## 💡 Tips & Best Practices

### Development
1. **Gunakan `npm run dev`** untuk start semua services sekaligus
2. **Check logs** jika ada error: `pm2 logs` atau `docker-compose logs`
3. **Clear browser cache** jika frontend tidak update
4. **Restart services** setelah mengubah environment variables

### Production
1. **Setup PM2 startup** untuk auto-restart on server reboot
2. **Configure log rotation** untuk prevent disk full
3. **Use Nginx** untuk serve static files (better performance)
4. **Setup SSL/TLS** dengan Let's Encrypt untuk HTTPS
5. **Regular backup** MongoDB data: `mongodump`
6. **Monitor logs** secara berkala: `pm2 monit`

### Security
1. **Ubah MongoDB credentials** di production
2. **Configure CORS** dengan proper allowed origins
3. **Use environment variables** untuk sensitive data
4. **Setup firewall** untuk protect database port
5. **Validate file uploads** (type, size, content)

---

## 🚧 Future Enhancements

### Priority 1
- [ ] JWT authentication untuk API
- [ ] Image compression before upload
- [ ] Image thumbnails generation
- [ ] Pagination untuk uploads

### Priority 2
- [ ] Search & filter functionality
- [ ] Download/export features
- [ ] Redis caching
- [ ] CDN untuk static assets

### Priority 3
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Audit logs
- [ ] Role-based access control (RBAC)

---

## ❓ FAQ (Frequently Asked Questions)

### Setup & Installation

**Q: Apakah bisa langsung jalankan `server-start.sh` saat setup pertama?**
A: **TIDAK.** Harus jalankan `./scripts/server-setup.sh` dulu untuk:
- Install PM2
- Install dependencies (backend, admin-app, user-app)
- Build frontend apps
- Setup environment files

**Q: Apakah perlu `npm install` manual sebelum jalankan server-start.sh?**
A: **TIDAK PERLU** jika sudah jalankan `./scripts/server-setup.sh`. Script setup sudah handle semua instalasi otomatis.

**Q: Bagaimana setup MongoDB di server production?**
A: Gunakan script helper:
```bash
# Opsi 1: Docker (recommended)
./scripts/server-mongodb.sh docker

# Opsi 2: Native install
./scripts/server-mongodb.sh native  # Lihat installation guide
```

**Q: Apakah `node_modules/` di root directory bisa dihapus?**
A: **JANGAN!** node_modules di root berisi `concurrently` yang diperlukan untuk `npm run dev` (local development).

**Q: Apa bedanya `server-start.sh` vs `server-update.sh`?**
A:
- `server-start.sh`: Start services saja (tidak pull code baru)
- `server-update.sh`: Git pull + rebuild + restart (untuk deploy update)

### Development

**Q: Port sudah digunakan, bagaimana mengubahnya?**
A: Edit file berikut:
- Backend: `backend/.env` → ubah `PORT=3202`
- Admin App: `admin-app/package.json` → ubah port di script `dev`
- User App: `user-app/package.json` → ubah port di script `dev`

**Q: MongoDB tidak jalan, bagaimana?**
A: Check status dan restart:
```bash
# Docker
docker-compose ps
docker-compose restart mongodb

# Native
sudo systemctl status mongod
sudo systemctl restart mongod
```

**Q: PM2 service error, apa yang harus dilakukan?**
A: Check logs dan restart:
```bash
pm2 logs vikings-backend --err --lines 50
pm2 restart vikings-backend
# Atau delete dan start ulang
pm2 delete vikings-backend
pm2 start ecosystem.config.js --only vikings-backend
```

---

## 📞 Support & Documentation

### Files
- `README.md` - This file (comprehensive guide)
- `ecosystem.config.js` - PM2 configuration
- `docker-compose.yml` - Docker services
- `scripts/` - Helper scripts

### Logs
- Development: Console output
- Production: `pm2 logs` atau `docker-compose logs`
- Files: `backend/logs/`, `admin-app/logs/`, `user-app/logs/`

### Troubleshooting
1. Check logs: `pm2 logs` atau `./scripts/server-logs.sh`
2. Check status: `pm2 status` atau `docker-compose ps`
3. Verify env variables di `.env` files
4. Test MongoDB connection
5. Check port availability

---

## 📄 License

Private project - All rights reserved

---

**Last Updated:** 2025-11-30
**Version:** 2.0.0 (MongoDB Migration)

---

Selamat coding! 🎉
