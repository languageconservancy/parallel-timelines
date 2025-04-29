# Parallel Timelines

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 19.2.6, [Node.js](https://nodejs.org/en) version 22.14.0, and [CapacitorJS](https://capacitorjs.com/) version 7.2.0

This project supports Android and iOS through the use of CapacitorJS native runtime. The `capacitor.config.js`, `android`, and `ios` directories were created using the command `npx cap init`.

## 🟢 Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## 🛠️ Build

### Web-app

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Android & iOS

Run `npm run build && npx cap sync` from the project root directory run the following command to build the web-app and sync it into the **android/** and **ios/** directories:

For **Android**, open the `android/` directory in [Android Studio](https://developer.android.com/studio) and build and run the app from there.

For **iOS**, open the `ios/App/App.xcworkspace/` directory in [Xcode](https://developer.apple.com/xcode/) and build and run the app from there.

## 🧪 Running unit tests

⚠️ Note: No unit tests have been written yet.

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## 🧪 Running end-to-end tests

⚠️ Note: No end-to-end tests have been written yet.

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## ✏️ Customizing for Your Project

After cloning:

1. Update the app name and ID:

   - `capacitor.config.ts`: change `appId` and `appName`
   - `android/app/src/main/AndroidManifest.xml`
   - `ios/App/App/Info.plist`

2. Change native project names:

   - Android: rename Java packages (optional)
   - iOS: rename Xcode target (optional but painful)

3. Update app icons:

   - Replace contents in `android/app/src/main/res/` and `ios/App/App/Assets.xcassets/`

4. Sync

   - Run `npx cap sync` to sync everything to the `android/` and `ios/` directories.
