# HARSHA 🤖 — Android AI Assistant + Mobile Forensics

HARSHA now includes an **administrator-only mobile forensic dashboard** and a local ADB acquisition bridge for authorized Android devices.

## Repository layout

- `android/` — Kotlin Android assistant application
- `web/` — Next.js/Vercel dashboard and protected API
- `bridge/` — local Node.js ADB forensic collector
- `.github/workflows/` — automatic Android APK build
- `docs/` — setup notes

## Forensic dashboard

The web dashboard provides:

- Administrator login
- ADB connection state
- Refresh / latest scan button
- Device model, manufacturer, Android version and serial
- Counts for installed apps, SMS, contacts, files and running processes
- App/process review heuristics for common security-tool or suspicious-name indicators
- Suspicious SMS review indicators
- Evidence tables for apps, SMS, contacts, files and processes
- Security findings summary

The collector is designed for **authorized/defensive forensic analysis**. It does not bypass Android security controls, gain root, or claim that a heuristic match is proof of malware.

## Important architecture detail

A Vercel-hosted website cannot directly execute `adb` against a USB phone attached to your PC. Therefore the system uses:

`Android phone → USB/ADB → local bridge → HTTPS POST → Vercel API → admin dashboard`

The local bridge performs acquisition and the Vercel app presents the results. The current API keeps the latest result in process memory; a persistent database can be added later when multi-device/history retention is required.

## Environment variables

For Vercel (`web`):

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `FORENSIC_BRIDGE_SECRET`

Use strong random values. Do not commit secrets.

For `bridge/.env`:

```text
HARSHA_API_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
FORENSIC_BRIDGE_SECRET=the-same-bridge-secret-as-vercel
ADB_PATH=adb
```

On Windows, `ADB_PATH` may be the full path to `platform-tools\\adb.exe`.

## Run the bridge

Install Android platform-tools and authorize the test phone for USB debugging. Then:

```powershell
cd bridge
npm install
copy .env.example .env
npm run scan
```

The scan collects data that the connected ADB context/device permits. SMS and contacts may be unavailable on modern Android builds unless the authorized acquisition path has the required access.

## Vercel deployment

Import the GitHub repository into Vercel and set the **Root Directory** to `web`. Configure the four environment variables above, then deploy.

## Android build

Install Android Studio, Android SDK 35 and JDK 17. The GitHub Actions workflow builds the debug APK automatically.

## Security

Treat SMS, contacts and files as sensitive evidence. Use this system only on devices you own or are explicitly authorized to examine. For production evidence handling, add durable encrypted storage, audit logging, retention controls and stronger authentication before storing raw content.
