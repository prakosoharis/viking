# Vikings Invoice Mobile App

A Flutter mobile application for uploading and managing invoices, built for iOS and Android platforms.

## Features

- **User Authentication**: Login with phone number
- **Invoice Upload**: Upload multiple invoices (1-10 files) from camera or gallery
- **Profile Management**: View and manage company information
- **Upload History**: View all past uploads organized by sessions
- **Email Status Tracking**: Track email status for each upload (sent, failed, pending)
- **Cross-Platform**: Works on both iOS and Android

## Tech Stack

- **Framework**: Flutter 3.35.7
- **Language**: Dart 3.9.2
- **State Management**: StatefulWidgets + setState
- **Storage**: SharedPreferences
- **Network**: HTTP client
- **Image Picker**: image_picker
- **UI Components**: Material Design 3

## Getting Started

### Prerequisites

- Flutter SDK 3.35.7 or higher
- Dart SDK 3.9.2 or higher
- Android Studio / Xcode (for building)
- iOS Simulator / Android Emulator / Physical Device

### Installation

1. Clone the repository
2. Navigate to the mobile app directory:
   ```bash
   cd vikings_invoice_mobile
   ```

3. Install dependencies:
   ```bash
   flutter pub get
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - The `API_BASE_URL` is already set to production server (https://api.clickz.co.no/api)

5. Run the app:
   ```bash
   flutter run
   ```

## Project Structure

```
lib/
├── api/
│   └── api_service.dart          # API service layer
├── constants/
│   └── app_constants.dart        # App-wide constants
├── models/
│   ├── user.dart                # User data model
│   └── upload.dart              # Upload data model
├── screens/
│   ├── login_screen.dart         # Login screen
│   └── dashboard_screen.dart    # Main dashboard
├── utils/
│   └── helpers.dart              # Utility functions
├── widgets/
│   └── viking_helm_icon.dart    # Custom widget
├── main.dart                   # App entry point
└── ...
```

## Environment Variables

Create a `.env` file in root directory:

```bash
cp .env.example .env
```

The default configuration points to production server:

```
API_BASE_URL=https://api.clickz.co.no/api
```

The default configuration points to production server:

```
API_BASE_URL=https://api.deluwang.online/api
```

## Building

### iOS

```bash
flutter build ios --release
```

### Android

```bash
flutter build apk --release
# or
flutter build appbundle --release
```

### Building with Production Environment

The app is already configured to use production API (https://api.clickz.co.no/api).

To override for local development:

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:3202/api
```

## Permissions

### iOS

The app requests the following permissions (configured in `ios/Runner/Info.plist`):
- Camera access (`NSCameraUsageDescription`)
- Photo library access (`NSPhotoLibraryUsageDescription`)
- Photo library write access (`NSPhotoLibraryAddUsageDescription`)

### Android

The app requests the following permissions (configured in `android/app/src/main/AndroidManifest.xml`):
- Internet access
- Camera access
- External storage read/write access

## API Integration

The app communicates with a REST API backend. The API endpoints include:

- `POST /api/users/login` - Login with phone number
- `POST /api/uploads` - Upload images (multipart form-data)
- `POST /api/uploads-base64` - Upload images (base64)
- `GET /api/uploads/user/:userId` - Get user uploads

## Features in Detail

### Login Screen
- Enter phone number
- Validates and authenticates user
- Persists user session

### Dashboard
- **Profile Section**: Displays company information, address, email, etc.
- **Upload Section**:
  - Take photo with camera
  - Select multiple images from gallery
  - Validates file count (1-10 files)
  - Uploads to server with progress tracking
- **Upload History**:
  - Organized by sessions
  - Expandable/collapsible session cards
  - Image thumbnails with PDF support
  - Email status indicators

## UI/UX

- Modern, clean interface with gradient backgrounds
- Material Design 3 components
- Responsive layouts for different screen sizes
- Smooth animations and transitions
- Visual feedback for user actions

## Troubleshooting

### iOS Build Issues

If you encounter build issues on iOS:

```bash
cd ios
pod install
cd ..
flutter clean
flutter pub get
```

### Android Build Issues

If you encounter build issues on Android:

```bash
flutter clean
flutter pub get
flutter build apk --debug
```

### Permission Issues

Make sure permissions are properly configured in platform-specific files:
- iOS: `ios/Runner/Info.plist`
- Android: `android/app/src/main/AndroidManifest.xml`

## License

This project is private and proprietary.

## Support

For support, please contact the development team.
