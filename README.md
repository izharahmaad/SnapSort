
<h1 align="center">SnapSort AI</h1>

<p align="center">
  <strong>AI-powered waste sorting and disposal guidance from a single photo.</strong>
</p>

<p align="center">
  Gemini multimodal analysis • Python + FastAPI backend • Expo + React Native mobile app • Firebase-secured personal history
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white" alt="Python 3.11">
  <img src="https://img.shields.io/badge/FastAPI-API-009688?logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/TypeScript-Mobile-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Expo-React%20Native-000020?logo=expo&logoColor=white" alt="Expo React Native">
  <img src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/AI-Gemini%20Vision-4285F4?logo=google&logoColor=white" alt="Gemini Vision">
  <img src="https://img.shields.io/badge/License-MIT-black" alt="MIT License">
</p>

---

## Overview

**SnapSort AI** is a mobile application and backend service for identifying how to responsibly dispose of everyday items using multimodal AI image analysis.

The core idea is simple:

> **Capture a photo of an item, and let a Python-powered AI backend determine how it should be sorted, scored, and safely disposed of.**

A user opens the SnapSort AI mobile app, captures or selects a photo, and the image is sent to a Python **FastAPI** backend. The backend constructs a structured prompt and sends the image to a **Gemini multimodal model**, which returns a disposal category, an eco score, practical guidance, an optional reuse idea, and an optional safety warning. The result is displayed instantly and can be saved to the user's private, Firebase-secured Waste Journal.

The project is designed as a complete engineering pipeline connecting mobile UI, a Python API service, generative AI reasoning, and per-user cloud storage — not just an isolated model demo.

> **Development note:** the project currently ships with a working end-to-end pipeline (mobile capture → Python API → Gemini analysis → Firestore storage). Production deployment requires hosting the Python backend on a public HTTPS server instead of a local development machine.

---

## Why SnapSort AI?

Correct disposal decisions are not always obvious, and most people do not have time to research every item they throw away.

Common everyday questions include:

- Is this item recyclable, reusable, compostable, or hazardous?
- Does it need to be cleaned or disassembled first?
- Could it be reused instead of discarded?
- Are there safety precautions to be aware of?

SnapSort AI focuses on the last-mile workflow between a photo and a confident disposal decision.

### Core capabilities

| Capability | What it does |
|---|---|
| **Photo-based AI analysis** | Sends a captured or selected photo to a Python backend for Gemini-powered reasoning |
| **Disposal classification** | Assigns each item to recycle, reuse, compost, trash, or hazardous |
| **Eco score** | Produces a 0–10 score reflecting the relative environmental impact of the item |
| **Actionable guidance** | Returns clear, natural-language disposal instructions |
| **Reuse suggestions** | Suggests a creative reuse idea when applicable |
| **Safety warnings** | Flags hazardous or sensitive items explicitly |
| **Firebase authentication** | Secure per-user sign-in and session handling |
| **Private Waste Journal** | Stores each user's results under their own Firestore subcollection |
| **Weekly progress tracking** | Summarizes scan activity, sorting distribution, and weekly goals |
| **Local daily reminders** | On-device notifications to build a consistent sorting habit |
| **Cross-network API access** | Works with local development servers and production HTTPS deployments |

---

## System Architecture

```text
                 ┌─────────────────────────────┐
                 │   Mobile Application (Expo) │
                 │   Camera / Gallery Capture  │
                 └──────────────┬──────────────┘
                                │
                                ▼
                 ┌─────────────────────────────┐
                 │      Firebase Authentication │
                 │   Sign in / session state    │
                 └──────────────┬──────────────┘
                                │
                                ▼
                 ┌─────────────────────────────┐
                 │   Python FastAPI Backend    │
                 │ /api/scans/analyze endpoint │
                 └──────────────┬──────────────┘
                                │
                                ▼
                 ┌─────────────────────────────┐
                 │  Prompt Construction        │
                 │  (backend/app/prompts.py)   │
                 └──────────────┬──────────────┘
                                │
                                ▼
                 ┌─────────────────────────────┐
                 │   Gemini Multimodal Model   │
                 │ Image + Prompt → JSON Result│
                 └──────────────┬──────────────┘
                                │
                                ▼
                 ┌─────────────────────────────┐
                 │  Structured Analysis Result │
                 │  category, ecoScore, advice,│
                 │  reuseIdea, warning         │
                 └──────────────┬──────────────┘
                                │
                     ┌──────────┴──────────┐
                     ▼                     ▼
            ┌────────────────┐    ┌────────────────────┐
            │ Result Screen  │    │  Cloud Firestore   │
            │ (Mobile UI)    │    │ users/{uid}/scans/*│
            └────────────────┘    └────────────────────┘
```

---

## Analysis Pipeline

SnapSort AI's Python backend is the core reasoning layer of the application.

```text
Item Photo (Base64)
        │
        ▼
FastAPI /api/scans/analyze
        │
        ▼
Prompt Construction (prompts.py)
        │
        ▼
Gemini Multimodal Model
        │
        ▼
Structured JSON Response
        │
        ▼
Validation + Normalization
        │
        ▼
Mobile Result Rendering
        │
        ▼
Optional Save to Firestore
```

Expected structured output fields:

```text
itemName
category        (recycle | reuse | compost | trash | hazardous)
ecoScore         (0–10)
confidence       (low | medium | high)
disposalAdvice
reuseIdea        (optional)
warning          (optional)
```

---

## Data Representation

### Firestore document structure

```text
users/
└── {userId}/
    └── scans/
        └── {scanId}
            ├── itemName        : string
            ├── category        : "recycle" | "reuse" | "compost" | "trash" | "hazardous"
            ├── ecoScore         : number (0–10)
            ├── confidence       : "low" | "medium" | "high"
            ├── disposalAdvice   : string
            ├── reuseIdea        : string (optional)
            ├── warning          : string (optional)
            └── createdAt        : timestamp
```

### Local application state (mobile)

```text
auth.store.ts        → current authenticated user
onboarding.store.ts  → first-run onboarding completion state
scan.store.ts        → active image, analysis result, loading state
```

---

## Backend (Python)

The backend is a lightweight Python **FastAPI** service responsible for receiving images, verifying Firebase identity, calling the Gemini model, and returning a structured disposal-analysis result.

### Backend responsibilities

```text
Receive Base64 image
        │
        ▼
Verify Firebase ID token (firebase_auth.py)
        │
        ▼
Build Gemini prompt (prompts.py)
        │
        ▼
Call Gemini service (gemini_service.py)
        │
        ▼
Validate/normalize AI response (schemas)
        │
        ▼
Return JSON result to mobile app
```

### Backend structure

```text
backend/
├── requirements.txt
└── app/
    ├── main.py              # FastAPI application entry point
    ├── api/
    │   └── scans.py         # Image-analysis and scan API routes
    ├── config.py            # Environment and application configuration
    ├── firebase_auth.py     # Firebase ID token verification
    ├── gemini_service.py    # Gemini multimodal analysis integration
    ├── prompts.py           # Structured AI prompt templates
    ├── schemas/             # Request and response models
    ├── services/            # Backend business logic
    └── utils/               # Shared backend utilities
```

---

## Project Structure

```text
SnapSort/
│
├── App.tsx                    # App bootstrap, animated splash, Firebase auth listener
├── app.json                   # Expo configuration, icons, splash settings
│
├── assets/
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   └── images/
│       ├── hero-leaf.png
│       ├── pathway-recycle.png
│       ├── pathway-reuse.png
│       ├── pathway-compost.png
│       ├── pathway-dispose.png
│       └── waste-journal-hero.png
│
├── backend/                    # Python FastAPI service (see above)
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   └── scan/
│   │
│   ├── constants/
│   │   ├── categories.ts       # Disposal pathway metadata
│   │   └── theme.ts             # Shared color tokens and typography
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   └── types.ts
│   │
│   ├── screens/
│   │   ├── auth/                # Login, register, forgot password
│   │   ├── onboarding/          # First-run onboarding
│   │   ├── home/                # Dashboard
│   │   ├── scan/                # Camera, preview, result
│   │   ├── history/             # Saved scan history
│   │   ├── impact/              # Waste Journal
│   │   └── profile/             # Profile, notifications, privacy, about
│   │
│   ├── services/
│   │   ├── api/
│   │   │   └── scan-api.service.ts   # Python backend API client
│   │   └── firebase/
│   │       ├── firebase.ts           # Firebase app/auth/Firestore init
│   │       └── scans.service.ts      # Firestore read/write for scans
│   │
│   ├── stores/
│   │   ├── auth.store.ts
│   │   ├── onboarding.store.ts
│   │   └── scan.store.ts
│   │
│   └── types/
│       └── scan.ts
│
├── docs/
│   └── assets/
│       ├── snapsort-logo.svg
│       └── dashboard.png
│
├── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/<YOUR_USERNAME>/SnapSort.git
cd SnapSort
```

### 2. Install mobile dependencies

```bash
npm install
```

### 3. Create the Python virtual environment

Windows PowerShell:

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Linux/macOS:

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
```

### 4. Install Python dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Configure environment variables

Create `.env` in the project root (mobile):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
```

Create `backend/.env` (Python):

```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"
```

> Never commit `.env`, `backend/.env`, or any Firebase service-account file to Git.

---

## Run the Backend (Python)

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Default development address:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

Alternative documentation:

```text
http://localhost:8000/redoc
```

---

## Run the Mobile App

```bash
npx expo start --clear
```

Then choose one:

```text
Press "a"      → open Android emulator
Scan QR code   → open in Expo Go on a physical device
```

Native features such as push notifications require an Expo development build rather than Expo Go.

### API URL by environment

| Environment | `EXPO_PUBLIC_API_URL` |
|---|---|
| Physical Android phone (same Wi-Fi) | `http://YOUR_PC_IPV4:8000` |
| Android Studio emulator | `http://10.0.2.2:8000` |
| Production APK | `https://your-deployed-api-domain.com` |

---

## API Endpoints

### `GET /`

Health check for the backend service.

### `GET /docs`

Interactive Swagger documentation generated by FastAPI.

### `POST /api/scans/analyze`

Runs multimodal AI analysis on a submitted image.

Example request body:

```json
{
  "imageBase64": "BASE64_ENCODED_IMAGE_DATA"
}
```

Example response:

```json
{
  "itemName": "Plastic water bottle",
  "category": "recycle",
  "ecoScore": 7.5,
  "confidence": "high",
  "disposalAdvice": "Rinse the bottle and place it in your recycling bin. Remove the cap if your local program requires separate disposal.",
  "reuseIdea": "Reuse as a small planter or refillable water container.",
  "warning": ""
}
```

> Confirm the exact route defined in `backend/app/api/scans.py`, since route naming may evolve during development.

---

## API Example (Python)

```python
import base64
import requests

url = "http://127.0.0.1:8000/api/scans/analyze"

with open("item.jpg", "rb") as image_file:
    encoded_image = base64.b64encode(image_file.read()).decode("utf-8")

response = requests.post(
    url,
    json={"imageBase64": encoded_image},
    timeout=60,
)

response.raise_for_status()

result = response.json()

print(result["itemName"])
print(result["category"])
print(result["ecoScore"])
print(result["disposalAdvice"])
```

---

## Authentication & Data Security

### Firebase Authentication

Enable required sign-in methods in Firebase Console:

```text
Firebase Console → Build → Authentication → Sign-in method
```

### Firestore Security Rules

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, create, update: if
        request.auth != null &&
        request.auth.uid == userId;

      allow delete: if false;

      match /scans/{scanId} {
        allow read, create, update, delete: if
          request.auth != null &&
          request.auth.uid == userId;
      }
    }
  }
}
```

These rules ensure a signed-in user can only access their own profile document and their own saved scans.

---

## Waste Journal

The Waste Journal screen aggregates a user's saved scans into a personal sustainability dashboard.

```text
Saved Scans
     │
     ▼
Weekly Aggregation
     │
     ▼
Category Distribution
     │
     ▼
Personalized Insight Message
     │
     ▼
Journal Dashboard
```

Displayed metrics include:

```text
Total scans
Average eco score
Pathway diversity
Weekly scan progress
Disposal category distribution
Recent scan entries
```

---

## Notifications

SnapSort AI supports local daily reminders to build a consistent sorting habit.

Remote push-notification functionality is unavailable in standard Expo Go for current Expo SDK versions. Use a development build for full native notification testing:

```bash
npx expo install expo-dev-client
npx expo prebuild --clean
npx expo run:android
```

After the development build installs successfully:

```bash
npx expo start
```

Open the installed SnapSort development build instead of Expo Go.

---

## Build an Android APK

### Development build

```bash
npx expo prebuild --clean
npx expo run:android
```

### EAS build

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Installable APK:

```bash
eas build --platform android --profile preview
```

Play Store bundle:

```bash
eas build --platform android --profile production
```

> Deploy the Python backend to a public HTTPS host before producing a release APK. A local address such as `http://192.168.x.x:8000` only works while the developer's computer is running on the same network.

---

## Production Deployment

Target production architecture:

```text
SnapSort Android Application
             │
             ▼  HTTPS
   Deployed Python FastAPI Backend
             │
             ▼
   Gemini Analysis + Firebase
```

Deployment checklist:

```text
Deploy backend/ to Render, Railway, Fly.io, or a private server
Run with: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Serve the API over HTTPS
Store backend secrets as host environment variables
Update EXPO_PUBLIC_API_URL to the deployed HTTPS URL
Rebuild the Android application
Restrict Firebase API keys appropriately
Keep Gemini and Firebase Admin credentials out of the mobile bundle
```

---

## Important Engineering Decisions

### Server-side AI reasoning

All Gemini calls happen inside the Python backend rather than directly from the mobile app. This keeps the Gemini API key off the device, allows centralized prompt engineering, and makes it possible to change AI providers without shipping a new mobile release.

### Per-user data isolation

Every saved scan is stored under `users/{userId}/scans/{scanId}` rather than a single shared collection. Firestore Security Rules enforce that a user can only read or write their own documents.

### Environment-aware API URL

The mobile app resolves the backend address from `EXPO_PUBLIC_API_URL` rather than hardcoding it, allowing the same codebase to target a local development server, an Android emulator, or a deployed production API.

### Graceful loading and startup state

The app waits for font loading, onboarding status, and Firebase auth state before rendering the main navigator, avoiding a flash of the wrong screen during startup.

---

## Current Development Status

### Implemented

- [x] Camera and gallery image capture
- [x] Python FastAPI backend
- [x] Gemini multimodal analysis integration
- [x] Structured disposal-analysis response
- [x] Firebase Authentication
- [x] Per-user Firestore scan storage
- [x] Firestore Security Rules
- [x] Waste Journal dashboard
- [x] Local daily reminders
- [x] Animated startup splash screen
- [x] Circular, consistent mobile UI system

### Next steps

- [ ] Deploy Python backend to a production HTTPS host
- [ ] Add image compression before upload
- [ ] Add offline scan queue with automatic sync
- [ ] Expand Waste Journal analytics and date filters
- [ ] Add region-specific disposal-rule customization
- [ ] Add automated backend and mobile tests
- [ ] Add CI/CD for Android preview and production builds

---

## Limitations

SnapSort AI is currently a research/production-style prototype rather than a certified waste-management authority.

1. **AI-generated disposal guidance is general** and may not reflect local municipal rules.
2. **Image quality, lighting, and framing affect analysis accuracy.**
3. **The eco score is a relative indicator**, not a certified environmental measurement.
4. **Local backend testing requires the developer machine and phone to share the same network.**
5. **Production use requires a deployed, secured, and monitored backend** rather than a local development server.

---

## Reproducible Local Setup

For consistent testing, keep this information documented per environment:

```text
Python version
Node.js version
Firebase project ID
Backend .env keys (names only, never values)
EXPO_PUBLIC_API_URL used for testing
Device type (emulator / physical phone)
```

---

## Git Workflow

```bash
git status
git diff
git add .
git commit -m "feat: describe your change"
git push origin main
```

---

## License

This project is released under the **MIT License**.

See [`LICENSE`](LICENSE) for details.

> Firebase and the Gemini API are subject to their own separate terms of use. Review each provider's license and usage requirements before production deployment.

---

## Acknowledgements

SnapSort AI builds on the following technologies and services:

```text
Python
FastAPI
Expo
React Native
Firebase
Gemini API
React Native Paper
Zustand
```

All third-party tools remain subject to their respective licenses.

---

## Author

**SnapSort AI Development Team**

Full-Stack Mobile Engineering | Python Backend Engineering | Applied AI Integration

SnapSort AI combines:

```text
Computer Vision
+ Generative AI Integration
+ Python API Engineering
+ Mobile Application Development
+ Secure Cloud Data Design
```

---

## ⭐ Why this project matters

Most people discard items without knowing the best disposal path. SnapSort AI turns that single everyday decision into a fast, guided, and encouraging interaction.

```text
Item Photo
      ↓
Python Backend + Gemini AI
      ↓
Disposal Category + Eco Score
      ↓
Clear Guidance
      ↓
Saved Personal History
      ↓
Long-Term Sustainable Habits
```

<p align="center">
  <strong>Smarter choices. Smaller footprint.</strong>
</p>
