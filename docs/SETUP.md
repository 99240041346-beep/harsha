# HARSHA setup

## GitHub
1. Push to `main` or run the Android workflow manually.
2. Open Actions.
3. Download the `HARSHA-apk` artifact from the completed run.

## Vercel
Import this repository into Vercel and select `web` as the Root Directory. Add `HARSHA_API_SECRET` as a Vercel environment variable. Add an AI provider key only when the AI integration is implemented.

## Android
Install the APK, grant microphone permission, and explicitly enable HARSHA under Android Accessibility settings if UI automation is needed.
