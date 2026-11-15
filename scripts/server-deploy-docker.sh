#!/bin/bash
# Deploy Vikings/CLICKZ ke server pakai Docker + Nginx
# Jalankan sebagai root di server:  bash scripts/server-deploy-docker.sh
set -euo pipefail

APP_DIR="/var/www/viking"
REPO="https://github.com/prakosoharis/viking.git"
API_URL="https://api.clickz.co.no/api"
NGINX_SITE="/etc/nginx/sites-available/clickz.conf"

echo "==> 1/6 Cek prasyarat"
command -v docker >/dev/null || { echo "ERROR: docker belum terpasang. Install: curl -fsSL https://get.docker.com | sh"; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "ERROR: docker compose plugin belum ada. Install: apt-get install -y docker-compose-plugin"; exit 1; }
command -v nginx >/dev/null || { echo "ERROR: nginx belum terpasang. Install: apt-get install -y nginx"; exit 1; }

echo "==> 2/6 Siapkan source di $APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull
else
  mkdir -p /var/www
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

echo "==> 3/6 Cek backend/.env"
if [ ! -f backend/.env ]; then
  cat <<'MSG'
ERROR: backend/.env tidak ada (file ini tidak ikut git karena berisi rahasia).

Buat dulu di server, isinya:

  NODE_ENV=production
  PORT=3202
  MONGODB_URI=mongodb://admin:admin123@mongodb:27017/invoice_db?authSource=admin
  BREVO_API_KEY=<api key brevo anda>
  EMAIL_FROM_DOMAIN=<domain pengirim>
  EMAIL_TO=<email tujuan fallback>

Atau salin dari laptop:
  scp -P 2211 backend/.env root@169.58.142.36:/var/www/viking/backend/.env

Lalu jalankan skrip ini lagi.
MSG
  exit 1
fi

echo "==> 4/6 Build & jalankan container (API: $API_URL)"
VITE_API_URL="$API_URL" docker compose up -d --build
sleep 5
docker compose ps

echo "==> 5/6 Pasang konfigurasi Nginx"
cp nginx-clickz.conf "$NGINX_SITE"
ln -sfn "$NGINX_SITE" /etc/nginx/sites-enabled/clickz.conf
# Catatan: server ini dipakai bersama project lain, jadi site lain tidak disentuh.
nginx -t
systemctl reload nginx

echo "==> 6/6 Verifikasi"
echo -n "backend  : "; curl -fsS http://127.0.0.1:3202/api/health || echo "GAGAL"
echo
echo -n "user-app : "; curl -fsS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3200/ || echo "GAGAL"
echo -n "admin-app: "; curl -fsS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3201/ || echo "GAGAL"
echo
echo "Selesai. Cek dari luar:"
echo "  https://api.clickz.co.no/api/health"
echo "  https://clickz.co.no"
echo "  https://admin.clickz.co.no"
echo
echo "CATATAN: di Cloudflare, set SSL/TLS mode ke 'Flexible' (origin hanya listen port 80)."
