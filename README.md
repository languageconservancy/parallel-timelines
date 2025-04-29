# Parallel Timelines

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 19.2.6, [Node.js](https://nodejs.org/en) version 22.14.0, and [CapacitorJS](https://capacitorjs.com/) version 7.2.0

This project supports Android and iOS through the use of CapacitorJS native runtime. The `capacitor.config.js`, `android`, and `ios` directories were created using the command `npx cap init`.

## ‼️ First Steps

In order to make this app work, you must provide your own `./public/` directory with the following assets:

- `images/`
- `timelines/timeline.json`

The directory `public_example` is provided to show you an example of the content and format. Rename it to `public` to make it use the example assets. See [timeline.json Format Overview](#timeline.json-format-overview) for more information on the format of the timeline.

To keep it modular, you can create git repo for your `public` directory and clone it into this project as `public`.

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

## timeline.json Format Overview

The timeline.json file defines the structure for an interactive, scroll-based historical timeline. It organizes content into eras, each containing multiple event groups, which in turn hold main and comparative events.

This file supports educational or narrative timelines that compare parallel histories, topics, or perspectives.

### 🖹 JSON Structure
```json
{
    "eras": [
        {
            "title": { "headline": "string" }, // Title displayed at the top of the screen
            "mainEventsBackground": { "url": "string", "color": "string" }, // Background for main timeline
            "comparativeEventsBackground": { "url": "string", "color": "string" }, // Background for comparative timeline
            "eventGroups": [ /* see below */ ]
        },
        ...
    ]
}
```

### 📚 eventGroups Structure

Each eventGroup pairs main events with comparative events that should be displayed together.

```json
{
    "title": { "headline": "string" },       // (optional) Group title displayed above the events
    "mainEvents": [ /* TimelineEvent */ ],
    "comparativeEvents": [ /* TimelineEvent */ ]
}
```

### ⏱️ TimelineEvent Format
```json
{
    "date": "string", // Event header. e.g. "1492", "January 1, 1863", "1940-50", etc.
    "text": {
        "brief": "string", // Short headline shown when event is collapsed (optional)
        "text": "string" // Full description shown when event is expanded
    },
    "image": { // optional
        "url": "string", // local from public/ (e.g. "images/my_image.jpg") or hosted
        "caption": "string", // used for alt text
        "position": "left" | "right" | "top" | "bottom" // where to place the image relative to the event text
    }
}
```

### 🖼️ Background Format
```json
{
    "url": "string", // Optional path to image file (local from public/ or hosted)
    "color": "string" // Optional background overlay (e.g. "#00000080" for semi-transparent black)
}
```

### ✍️ Example
```json
{
    "eras": [
        {
            "type": "Ancient History",
            "title": {
                "headline": "The Classical Age"
            },
            "mainEventsBackground": {
                "url": "bg-classical-main.jpg"
            },
            "comparativeEventsBackground": {
                "url": "bg-classical-comp.jpg",
                "color": "#12345688"
            },
            "eventGroups": [
                {
                    "title": { "headline": "Greek and Indian Culture" },
                    "mainEvents": [
                        {
                            "date": "500 BCE",
                            "text": {
                                "brief": "Socrates teaches in Athens",
                                "text": "Socrates lays foundations of Western philosophy."
                            },
                            "image": {
                                "url": "socrates.jpg",
                                "caption": "Socrates teaching in Athens",
                                "position": "left"
                            }
                        }
                    ],
                    "comparativeEvents": [
                        {
                            "date": "500 BCE",
                            "text": {
                                "brief": "Buddha teaches in India",
                                "text": "Siddhartha Gautama (Buddha) spreads teachings in the Gangetic Plain."
                            },
                            "image": {
                                "url": "buddha.jpg",
                                "caption": "The Buddha giving a sermon",
                                "position": "right"
                            }
                        }
                    ]
                }
            ]
        }
    ]
}
```
