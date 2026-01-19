# Allergy Tracker Mobile App (GTrack)

A production-ready React Native Android app for tracking nutritional intake, allergy symptoms, and growth metrics. Built with Firebase cloud sync and data export capabilities for medical consultations. Features AI-powered meal planning and multiple authentication options.

## Features

### Authentication
- **Email/Password Sign-In**: Secure account creation and login
- **Google Sign-In**: Quick authentication with Google account
- Secure user data with Firebase Authentication
- Automatic session management

### Symptom Tracker
- Log heartburn/reflux severity (1-10 scale)
- Track nausea and severity
- Record vomiting episodes with frequency and color
- Identify triggers (specific foods, stress, cold/flu)
- Add notes for each entry

### Nutrition Intake Tracker
- Log meals by type (Breakfast, Lunch, Dinner, Snack)
- Food search with autocomplete
- Automatic calorie calculation
- High-calorie booster identification
- Daily calorie summary
- Weekly/monthly trends

### Growth Tracker
- Weekly weight and height measurements
- Automatic BMI calculation
- Growth charts visualization
- Weight and height trend tracking

### AI Meal Planning
- **Daily High-Calorie Meal Plans**: AI-generated suggestions to boost child growth
- **Personalized Recommendations**: Based on eating history and calorie needs
- **Meal-Specific Suggestions**: Tailored for Breakfast, Lunch, Dinner, and Snacks
- **Calorie Tracking**: Track progress toward daily calorie targets
- **Quick Add to Nutrition**: One-tap to add suggested foods to tracker
- **Download Meal Plans**: Export meal plans as CSV files for sharing or printing

### Data Export
- Export to CSV format
- Export meal plans as CSV
- Date range selection
- Share via email/messaging apps
- Export to PDF (planned)

## Technology Stack

- **Framework**: React Native 0.83.1
- **Language**: TypeScript
- **Backend**: Firebase (Authentication, Firestore)
- **Authentication**: Firebase Auth with Google Sign-In integration
- **UI Library**: React Native Paper
- **Navigation**: React Navigation
- **Charts**: react-native-chart-kit
- **State Management**: React Context API + AsyncStorage
- **File Sharing**: react-native-share, react-native-fs

## Prerequisites

- Node.js >= 20
- React Native development environment set up
- Android Studio (for Android development)
- Firebase account

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd g-track
```

2. Install dependencies:
```bash
npm install
```

3. For iOS (if developing for iOS):
```bash
cd ios
pod install
cd ..
```

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add an Android app to your Firebase project
3. Download `google-services.json` and place it in `android/app/`
4. Update `src/services/firebase.ts` with your Firebase configuration
5. Enable Authentication in Firebase Console:
   - Enable **Email/Password** authentication
   - Enable **Google** authentication (for Google Sign-In)
6. Add SHA-1 fingerprints to Firebase Console for Google Sign-In (see `GOOGLE_SIGNIN_SETUP.md`)
7. Create a Firestore database
8. Deploy security rules (see `firestore.rules`)

See `FIREBASE_SETUP.md` and `GOOGLE_SIGNIN_SETUP.md` for detailed instructions.

## Running the App

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

## Project Structure

```
g-track/
├── src/
│   ├── screens/          # Screen components
│   ├── components/       # Reusable components
│   ├── services/         # Firebase and API services
│   ├── models/           # Data models and validation
│   ├── utils/            # Utility functions
│   ├── context/          # React Context providers
│   └── navigation/       # Navigation configuration
├── android/              # Android native code
├── ios/                  # iOS native code
└── firebase.json         # Firebase configuration
```

## Building for Production

### Android

1. Generate a signing key:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Update `android/app/build.gradle` with your keystore configuration

3. Build release APK:
```bash
cd android
./gradlew assembleRelease
```

4. Build release AAB (for Play Store):
```bash
cd android
./gradlew bundleRelease
```

## Configuration

### Firebase Configuration

Update `src/services/firebase.ts` with your Firebase project credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### Android Configuration

- Update `android/app/build.gradle` with your package name and version
- Configure signing keys for release builds
- Update `AndroidManifest.xml` with required permissions

## Security

- Firebase security rules ensure users can only access their own data
- All sensitive data is encrypted in transit
- Local storage uses AsyncStorage for offline support
- Input validation on all forms

## Privacy

This app collects and stores:
- User authentication data (email)
- Symptom tracking data
- Nutrition intake data
- Growth measurements

All data is stored securely in Firebase and is only accessible by the authenticated user. Data can be exported and deleted at any time.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Add your license here]

## Support

For issues and questions, please open an issue on GitHub.

## Recent Updates

### Version 1.0.1
- ✅ Added Google Sign-In authentication
- ✅ Added meal plan download/export feature
- ✅ Improved error handling and crash prevention
- ✅ Fixed various UI rendering issues
- ✅ Enhanced authentication flow

## Roadmap

- [ ] PDF export functionality for all data types
- [ ] iOS version
- [ ] Push notifications for reminders
- [ ] Data analytics and insights dashboard
- [ ] Multi-child support
- [ ] Integration with health apps
- [ ] Meal plan PDF export with visual formatting

## Documentation

- **Firebase Setup**: See `FIREBASE_SETUP.md`
- **Google Sign-In Setup**: See `GOOGLE_SIGNIN_SETUP.md`
- **Meal Planning**: See `MEAL_PLANNING_FEATURE.md`
- **Generate APK**: See `GENERATE_APK.md`
- **Publishing to Play Store**: See `GOOGLE_PLAY_PUBLISH.md`
