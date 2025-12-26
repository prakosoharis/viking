# Setup Guide - Vikings Invoice Mobile App

Dokumentasi lengkap untuk setup dan menjalankan aplikasi mobile Vikings Invoice User App.

## 📋 Prerequisites

Sebelum memulai, pastikan Anda sudah menginstall:

1. **Node.js** - Version 20 atau lebih baru
   - Download: https://nodejs.org/

2. **npm** - Biasanya sudah terinstall dengan Node.js
   - Cek: `npm --version`

3. **Git** - Version control
   - Download: https://git-scm.com/

4. **Expo CLI** (Recommended)
   ```bash
   npm install -g expo-cli
   ```

5. **Untuk Development Android:**
   - Android Studio
   - Android SDK
   - Virtual Device (Emulator) atau Physical Device

6. **Untuk Development iOS:**
   - Xcode (hanya di macOS)
   - iOS Simulator atau Physical Device

## 🚀 Quick Start

### 1. Clone dan Install Dependencies

```bash
cd mobile-user-app
npm install
```

### 2. Environment Variables

File `.env` sudah dikonfigurasi:

```env
EXPO_PUBLIC_API_URL=https://api.clickz.co.no/api
EXPO_PUBLIC_APP_NAME=Vikings Invoice
```

**Untuk Development Lokal:**

Jika backend berjalan di komputer Anda dan ingin test di emulator:

```env
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:3202/api
```

**Cari IP Address Anda:**
- Windows: Buka Command Prompt, ketik `ipconfig`
- Mac/Linux: Buka Terminal, ketik `ifconfig` atau `ip a`

### 3. Jalankan App

#### Start Expo Server

```bash
npm start
```

Atau:

```bash
npx expo start
```

#### Option A: Run on Android Emulator

```bash
npm run android
```

Atau setelah `npm start`, tekan `a` di terminal.

**Persiapan:**
1. Buka Android Studio
2. Start AVD Manager
3. Create/Start emulator
4. Pastikan emulator sudah running

#### Option B: Run on iOS Simulator (Mac Only)

```bash
npm run ios
```

Atau setelah `npm start`, tekan `i` di terminal.

**Persiapan:**
1. Buka Xcode
2. Pastikan simulator tersedia (iOS 14+)
3. Pastikan Xcode command line tools sudah diinstall

#### Option C: Run on Physical Device

**Metode 1: Expo Go App (Paling Mudah)**

1. Download **Expo Go** dari App Store (iOS) atau Google Play (Android)
2. Install di device Anda
3. Jalankan `npm start`
4. Scan QR code yang muncul di terminal dengan Expo Go
5. Atau ketik URL manual di Expo Go

**Metode 2: Development Build**

**Android:**
```bash
# Build APK development
npx expo run:android
```

**iOS (Mac Only):**
```bash
# Build IPA development
npx expo run:ios
```

## 🔧 Troubleshooting

### Masalah: "Cannot find module"

**Solution:**
```bash
rm -rf node_modules
npm install
```

### Masalah: "Metro bundler failed"

**Solution:**
```bash
npm start -- --clear
```

### Masalah: "Cannot connect to API"

**Solution:**
1. Pastikan backend sudah berjalan di port 3202
2. Cek EXPO_PUBLIC_API_URL di .env
3. Untuk emulator, gunakan IP address komputer (bukan localhost)
4. Coba ping backend dari emulator:
   - Android emulator: Buka browser di emulator, coba akses URL
   - iOS simulator: Buka Safari di simulator, coba akses URL

### Masalah: "Camera not working"

**Solution:**
1. Buka Settings app di device/emulator
2. Cari "Vikings Invoice" atau "Expo Go"
3. Berikan permission untuk Camera dan Photos
4. Restart app

### Masalah: "Port already in use"

**Solution:**
Cari process yang menggunakan port:

**Windows:**
```bash
netstat -ano | findstr :19000
```

**Mac/Linux:**
```bash
lsof -i :19000
```

Kill process:
```bash
# Windows
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>
```

### Masalah: "Gradle sync failed" (Android)

**Solution:**
1. Buka Android Studio
2. Sync Gradle manually
3. Pastikan JDK version sesuai (Android Studio settings)

Atau:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Masalah: "Build failed" (iOS)

**Solution:**
```bash
cd ios
pod install
cd ..
npm run ios
```

Atau buka Xcode:
```bash
open ios/vikingsinvoice.xcworkspace
```

## 📱 Testing di Emulator

### Android Emulator

1. Install Android Studio
2. Install Android SDK (API Level 33+)
3. Setup AVD (Android Virtual Device)
4. Start emulator
5. Jalankan `npm run android`

### iOS Simulator (Mac Only)

1. Install Xcode dari Mac App Store
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Buka Xcode → Preferences → Components
4. Download iOS Simulator (iOS 17+)
5. Start simulator
6. Jalankan `npm run ios`

## 📦 Building for Production

### Android APK (Debug)

```bash
npx expo run:android
```

APK akan tersedia di: `android/app/build/outputs/apk/debug/app-debug.apk`

### Android APK (Release)

1. Setup signing key:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore upload-keystore.p12 -alias upload -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Update `android/gradle.properties`:
   ```properties
   MYAPP_UPLOAD_STORE_FILE=upload-keystore.p12
   MYAPP_UPLOAD_KEY_ALIAS=upload
   MYAPP_UPLOAD_STORE_PASSWORD=*****
   MYAPP_UPLOAD_KEY_PASSWORD=*****
   ```

3. Build:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

### iOS IPA (Mac Only)

1. Buka `ios/vikingsinvoice.xcworkspace` di Xcode
2. Pilih target device (Any iOS Device)
3. Product → Archive
4. Setelah archive selesai, Distribute App

### EAS Build (Recommended)

Install EAS CLI:
```bash
npm install -g eas-cli
eas login
```

Setup build configuration:
```bash
eas build:configure
```

Build untuk Android:
```bash
eas build --platform android --profile production
```

Build untuk iOS:
```bash
eas build --platform ios --profile production
```

## 🔐 Permissions

App meminta permissions berikut:

**Android:**
- CAMERA - Untuk take photo
- READ_EXTERNAL_STORAGE - Untuk akses galeri
- WRITE_EXTERNAL_STORAGE - Untuk simpan file
- READ_MEDIA_IMAGES - Untuk akses media (Android 13+)

**iOS:**
- Camera Usage Description - "Allow camera to take invoice photos"
- Photo Library Usage Description - "Allow access to photo library to select invoice images"

Permissions ini sudah dikonfigurasi di `app.json`.

## 📊 Debugging

### React Native Debugger

Gunakan Flipper (Android Studio) atau React Native Debugger:

```bash
npm run android
```

Lalu buka di browser: `http://localhost:8081/debugger-ui/`

### Console Logs

Logs akan muncul di terminal tempat `npm start` dijalankan.

### React DevTools

Install React DevTools extension di browser.

### Expo DevTools

Buka `http://localhost:8081` di browser setelah `npm start` untuk Expo DevTools.

## 📝 Tips & Best Practices

1. **Hot Reload:** Changes akan otomatis reload di app saat development
2. **Metro Cache:** Jika ada masalah strange, clear cache:
   ```bash
   npm start -- --clear
   ```
3. **Restart:** Kadang restart server dan emulator perlu:
   ```bash
   # Stop server (Ctrl+C)
   npm start
   ```
4. **Clean Build:** Jika build error:
   ```bash
   cd android && ./gradlew clean && cd ..
   npm run android
   ```

## 🆘 Support

Jika ada masalah atau pertanyaan:

1. Cek logs di terminal
2. Cek Expo docs: https://docs.expo.dev/
3. Cek React Native docs: https://reactnative.dev/

## 📚 Referensi

- Expo Documentation: https://docs.expo.dev/
- React Native Documentation: https://reactnative.dev/
- Expo Go App: https://expo.dev/go
