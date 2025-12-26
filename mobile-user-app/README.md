# Vikings Invoice - Mobile User App

Aplikasi mobile React Native (Expo) untuk user invoice management. Aplikasi ini adalah versi mobile dari web app Vikings Invoice User App dengan tampilan dan fungsionalitas PERSIS sama.

## 📱 Fitur

- ✅ Login dengan nomor HP
- ✅ Upload invoice (gambar/PDF) hingga 10 file sekaligus
- ✅ Take photo dengan kamera
- ✅ Choose files dari galeri
- ✅ Upload history dengan session grouping
- ✅ Email status tracking (Sent/Failed/Sending)
- ✅ User profile display
- ✅ Success modal dengan animasi
- ✅ Image preview
- ✅ PDF support

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (untuk Android emulator) atau Xcode (untuk iOS simulator)

### Installation

```bash
cd mobile-user-app
npm install
```

### Environment Variables

File `.env` sudah dikonfigurasi dengan:

```env
EXPO_PUBLIC_API_URL=https://api.clickz.co.no/api
EXPO_PUBLIC_APP_NAME=Vikings Invoice
```

Untuk development lokal dengan backend di komputer Anda, ubah ke:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3202/api
```

### Running the App

#### Start Expo Development Server

```bash
npm start
```

Atau:

```bash
npx expo start
```

#### Run on Android Emulator

```bash
npm run android
```

Atau setelah `npm start`, tekan `a` di terminal.

#### Run on iOS Simulator

```bash
npm run ios
```

Atau setelah `npm start`, tekan `i` di terminal.

#### Run on Physical Device

1. Install Expo Go app di Android atau iOS
2. Scan QR code yang muncul di terminal setelah `npm start`
3. Atau gunakan Expo Go dan masukkan URL yang muncul

## 📁 Struktur Project

```
mobile-user-app/
├── src/
│   ├── api/              # API service layer
│   │   └── userApi.ts    # User API calls
│   ├── components/        # Reusable components
│   │   ├── VikingHelm.tsx       # Logo SVG
│   │   ├── SuccessModal.tsx      # Success popup
│   │   ├── FileItem.tsx         # File display
│   │   ├── ProfileSection.tsx    # User profile
│   │   ├── UploadSection.tsx     # Upload functionality
│   │   └── SessionCard.tsx      # Upload history card
│   ├── context/          # React Context
│   │   └── AuthContext.tsx      # Authentication state
│   ├── navigation/       # Navigation
│   │   └── AppNavigator.tsx     # Navigation stack
│   ├── screens/          # Screens
│   │   ├── LoginScreen.tsx      # Login page
│   │   └── DashboardScreen.tsx   # Main dashboard
│   ├── theme/            # Styling
│   │   ├── colors.ts            # Color palette
│   │   ├── spacing.ts           # Spacing values
│   │   ├── typography.ts        # Typography
│   │   └── shadows.ts           # Shadow effects
│   ├── types/            # TypeScript types
│   │   └── index.ts             # Type definitions
│   └── utils/            # Utility functions
│       ├── dateUtils.ts         # Date formatting
│       └── fileUtils.ts        # File handling
├── App.tsx               # Main app component
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── .env                  # Environment variables
```

## 🎨 Styling

Aplikasi menggunakan custom theme system yang meniru Tailwind CSS:

- **Primary Color:** Blue (#2563EB)
- **Secondary Color:** Purple/Indigo (#9333EA)
- **Semantic Colors:** Success, Error, Warning
- **Shadows:** sm, md, lg, xl, 2xl
- **Spacing:** xs, sm, md, lg, xl, 2xl, 3xl, 4xl
- **Typography:** Various sizes and weights

## 🔌 API Integration

Aplikasi ini terintegrasi dengan backend Vikings Invoice API:

### Endpoints yang digunakan:

- `POST /api/users/login` - Login user
- `POST /api/uploads` - Upload images (FormData)
- `POST /api/uploads-base64` - Upload images (Base64 untuk iOS camera)
- `GET /api/uploads/user/:userId` - Get user uploads

### Image URLs:

Gambar disajikan dari: `https://api.clickz.co.no/assets/{filename}`

## 📸 Permissions

### Android

- CAMERA - Untuk take photo
- READ_EXTERNAL_STORAGE - Untuk akses galeri
- WRITE_EXTERNAL_STORAGE - Untuk simpan file
- READ_MEDIA_IMAGES - Untuk akses media (Android 13+)

### iOS

- NSCameraUsageDescription - "Allow camera to take invoice photos"
- NSPhotoLibraryUsageDescription - "Allow access to photo library to select invoice images"

## 🐛 Troubleshooting

### Cannot connect to API

Jika app tidak bisa connect ke API:

1. Pastikan backend sudah berjalan
2. Cek EXPO_PUBLIC_API_URL di .env
3. Untuk testing di emulator, gunakan IP address komputer (bukan localhost)
4. Bisa check IP dengan:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` atau `ip a`

### Camera not working

1. Pastikan permissions sudah diberikan
2. Cek device settings untuk app permissions
3. Restart app setelah berikan permissions

### Upload failed

1. Cek koneksi internet
2. Pastikan API server accessible
3. Cek logs di terminal untuk error details

## 🏗️ Building for Production

### Build APK (Android)

```bash
npm run android
```

Atau menggunakan EAS Build:

```bash
npx eas build --platform android
```

### Build IPA (iOS)

```bash
npm run ios
```

Atau menggunakan EAS Build:

```bash
npx eas build --platform ios
```

### Konfigurasi EAS Build

Install EAS CLI:

```bash
npm install -g eas-cli
```

Login ke Expo:

```bash
eas login
```

Konfigurasi project:

```bash
eas build:configure
```

## 📝 Catatan Penting

1. **Session Management:** Session user disimpan menggunakan AsyncStorage dan persist saat app close
2. **iOS Camera Workaround:** Untuk iOS camera, gambar dikirim sebagai Base64 untuk mengatasi masalah compatibility
3. **File Limits:** Max 10 files per upload, min 1 file
4. **Email Status:** Status pengiriman email ditampilkan di history uploads
5. **Session Grouping:** Uploads dikelompokkan berdasarkan session_number

## 🤝 Kontribusi

Ini adalah bagian dari project Vikings Invoice System. Untuk kontribusi atau issues, hubungi tim development.

## 📄 License

Private project - All rights reserved.
