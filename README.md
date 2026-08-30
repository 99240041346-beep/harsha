# HARSHA 🤖 — Android AI Assistant

HARSHA is a JARVIS-style Android assistant project with a cloud-ready Vercel backend.

## Repository layout

- `android/` — Kotlin Android application
- `web/` — Next.js/Vercel cloud API and landing page
- `.github/workflows/` — automatic Android APK and Vercel deployment workflows
- `docs/` — setup and deployment documentation

## Deployment

### 1. GitHub

Create an empty GitHub repository named `HARSHA`, then push this repository.

The Android workflow builds:

`HARSHA-debug.apk`

and uploads it as a GitHub Actions artifact.

### 2. Vercel

Import the same GitHub repository into Vercel and set the project root to `web`.

Required environment variables for the cloud API:

`HARSHA_API_SECRET`
`AI_API_KEY` (only when an AI provider is configured)

Never put provider API keys inside the Android APK.

## Local Android build

Install Android Studio, Android SDK 35, and JDK 17.

From the repository root:

```powershell
cd android
gradle wrapper --gradle-version 8.10.2
.\gradlew.bat assembleDebug
```

APK:

`android/build/outputs/apk/debug/android-debug.apk`

## Current assistant commands

The starter app supports:

- open YouTube
- open Chrome
- open Settings
- go Home
- web search
- voice input
- text-to-speech

The Accessibility Service is included as a foundation for explicit, user-requested UI automation.

## Roadmap

Voice → AI brain → tool registry → risk gate → Android APIs/accessibility → result.

Future features can add memory, routines, notifications, media control, screen understanding, device sync and PC control.
