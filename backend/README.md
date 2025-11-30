# Vikings Backend API

Backend API untuk sistem invoice Vikings menggunakan:
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM untuk MongoDB
- **Multer** - File upload handling

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://admin:admin123@localhost:27017/invoice_db?authSource=admin
```

## API Documentation

Lihat file `SETUP.md` di root project untuk dokumentasi lengkap API endpoints.

## File Storage

Upload files disimpan di direktori `uploads/` dan diakses via `/assets/:filename`
