<div align="center">

# SnapSort AI

### AI-Powered Waste Sorting and Disposal Guidance for Everyday Life

**Computer Vision • Gemini AI • FastAPI • React Native • Firebase • Mobile-First Design**

<p>
  <a href="#overview"><img src="https://img.shields.io/badge/Domain-Sustainability-2ea44f?style=for-the-badge" alt="Sustainability"></a>
  <a href="#architecture"><img src="https://img.shields.io/badge/AI-Gemini%20Vision-4285F4?style=for-the-badge" alt="Gemini Vision"></a>
  <a href="#running-the-backend"><img src="https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge" alt="FastAPI"></a>
  <a href="#mobile-app"><img src="https://img.shields.io/badge/Mobile-Expo%20%2B%20React%20Native-000020?style=for-the-badge" alt="Expo React Native"></a>
  <a href="#authentication--data"><img src="https://img.shields.io/badge/Backend-Firebase-FFCA28?style=for-the-badge" alt="Firebase"></a>
</p>

</div>

---

## Project Preview

<p align="center">
  <img src="docs/assets/home-screen.png" alt="SnapSort AI Home Dashboard" width="260">
  <img src="docs/assets/result-screen.png" alt="SnapSort AI Scan Result" width="260">
  <img src="docs/assets/waste-journal.png" alt="SnapSort AI Waste Journal" width="260">
</p>

<p align="center">
  <sub>SnapSort AI — home dashboard, AI scan result, and personal Waste Journal.</sub>
</p>

> **Note:** Keep screenshots inside `docs/assets/` in the repository so GitHub renders the preview above.

---

# Project Structure

```text
SnapSort/
│
├── App.tsx
│   └── App bootstrap, animated startup splash, font loading, Firebase auth listener
│
├── app.json
│   └── Expo configuration, Android icon, adaptive icon, splash settings
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
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       │   └── FastAPI application entry point
│       │
│       ├── api/
│       │   └── scans.py
│       │       └── Image-analysis and scan API routes
│       │
│       ├── config.py
│       │   └── Environment and application configuration
│       │
│       ├── firebase_auth.py
│       │   └── Firebase ID token verification
│       │
│       ├── gemini_service.py
│       │   └── Gemini multimodal analysis integration
│       │
│       ├── prompts.py
│       │   └── Structured AI prompt templates
│       │
│       ├── schemas/
│       │   └── Request and response models
│       │
│       ├── services/
│       │   └── Backend business logic
│       │
│       └── utils/
│           └── Shared backend utilities
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   └── scan/
│   │
│   ├── constants/
│   │   ├── categories.ts
│   │   │   └── Disposal pathway metadata (recycle, reuse, compost, trash, hazardous)
│   │   └── theme.ts
│   │       └── Shared color tokens and typography
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   └── types.ts
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   │
│   │   ├── onboarding/
│   │   │   └── OnboardingScreen.tsx
│   │   │
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   │
│   │   ├── scan/
│   │   │   ├── CameraScreen.tsx
│   │   │   ├── PreviewScreen.tsx
│   │   │   └── ResultScreen.tsx
│   │   │
│   │   ├── history/
│   │   │   └── HistoryScreen.tsx
│   │   │
│   │   ├── impact/
│   │   │   └── WasteJournalScreen.tsx
│   │   │
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       ├── NotificationsScreen.tsx
│   │       ├── PrivacyPolicyScreen.tsx
│   │       └── AboutScreen.tsx
│   │
│   ├── services/
│   │   ├── api/
│   │   │   └── scan-api.service.ts
│   │   │       └── Backend API client for AI analysis requests
│   │   │
│   │   └── firebase/
│   │       ├── firebase.ts
│   │       │   └── Firebase app, auth, and Firestore initialization
│   │       └── scans.service.ts
│   │           └── Firestore read/write operations for saved scans
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
│       ├── home-screen.png
│       ├── result-screen.png
│       └── waste-journal.png
│
├── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

# Overview

**SnapSort AI** is a mobile application that helps people make more thoughtful disposal decisions using multimodal AI image analysis.

The workflow combines three connected layers:

```text
Item Photo
      +
On-Device Camera / Gallery
      ↓
Gemini Multimodal Analysis
      ↓
Disposal Classification
      ↓
Eco Score + Guidance
      ↓
Personal Scan History
```

The project connects mobile engineering, backend API design, generative AI integration, and secure per-user data storage into a single production-style application rather than a single isolated model demo.

---

# Why SnapSort AI?

Correct disposal decisions are not always obvious.

Everyday items often raise practical questions such as:

- Is this recyclable, reusable, compostable, or hazardous?
- Should this be cleaned before recycling?
- Can this item be reused instead of thrown away?
- Are there safety precautions for disposal?

SnapSort AI investigates a practical, mobile-first workflow for this problem:

```text
Capture Item Photo
      ↓
Multimodal AI Analysis
      ↓
Disposal Category Prediction
      ↓
Eco Score + Explanation
      ↓
Reuse Suggestion (when relevant)
      ↓
Safety Warning (when relevant)
      ↓
Saved to Personal Waste Journal
```

The system is designed as an end-to-end engineering project connecting the mobile UI layer, API layer, AI reasoning layer, and secure data layer.

---

# Key Features

| Feature | Description |
|---|---|
| **Photo-Based Analysis** | Captures or selects a photo and sends it for AI-driven disposal analysis |
| **Disposal Classification** | Classifies items into recycle, reuse, compost, trash, or hazardous pathways |
| **Eco Score** | Produces a 0–10 score reflecting the environmental impact of the item |
| **Actionable Guidance** | Returns clear disposal instructions in natural language |
| **Reuse Suggestions** | Suggests creative reuse ideas when applicable |
| **Safety Warnings** | Flags hazardous or sensitive items with explicit warnings |
| **Firebase Authentication** | Secure per-user sign-in and session handling |
| **Private Scan History** | Stores each user's results under their own Firestore subcollection |
| **Waste Journal** | Visual summary of scan activity, sorting distribution, and weekly progress |
| **Daily Reminders** | Local, on-device reminders to build a consistent sorting habit |
| **Custom Animated Splash** | Branded startup experience with a smooth 3-second loading transition |
| **Cross-Network API Access** | Works with local development servers and production HTTPS deployments |

---

# Architecture

```text
                     Mobile Application (Expo)
                              │
                 ┌────────────┼────────────┐
                 │            │             │
              Camera      Firebase       FastAPI
             / Gallery      Auth          Client
                 │            │             │
                 ▼            ▼             ▼
          ┌────────────┐ ┌─────────┐ ┌──────────────┐
          │ Image Data │ │  Auth   │ │ HTTP Request │
          └─────┬──────┘ └────┬────┘ └──────┬───────┘
                │             │             │
                └─────────────┼─────────────┘
                              ▼
                    ┌───────────────────┐
                    │   FastAPI Backend │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Gemini Service   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Structured Result │
                    │  (Category, Score,│
                    │  Advice, Warning) │
                    └─────────┬─────────┘
                              │
                              ▼
                     Mobile Result Screen
                              │
                              ▼
                    ┌───────────────────┐
                    │  Cloud Firestore  │
                    │  (per-user scans) │
                    └───────────────────┘
```

---

# AI Analysis Pipeline

```text
Item Photo (Base64)
        ↓
FastAPI /api/scans endpoint
        ↓
Prompt Construction (prompts.py)
        ↓
Gemini Multimodal Model
        ↓
Structured JSON Response
        ↓
Validation + Normalization
        ↓
Mobile Result Rendering
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

# Data Model

## Firestore structure

```text
users/
└── {userId}/
    └── scans/
        └── {scanId}
            ├── itemName
            ├── category
            ├── ecoScore
            ├── confidence
            ├── disposalAdvice
            ├── reuseIdea
            ├── warning
            └── createdAt
```

## Local application state

```text
auth.store.ts        → current authenticated user
onboarding.store.ts  → first-run onboarding completion state
scan.store.ts        → active image, analysis result, and loading state
```

---

# Technology Stack

### Mobile Application

```text
TypeScript
React Native
Expo
React Navigation
React Native Paper
Zustand
Expo Vector Icons
Expo Notifications
AsyncStorage
```

### Backend

```text
Python 3.11
FastAPI
Uvicorn
```

### AI

```text
Gemini Multimodal API
```

### Data and Authentication

```text
Firebase Authentication
Cloud Firestore
```

### Tooling

```text
EAS Build
Git
GitHub
VS Code
PowerShell
```

---

# Installation

## 1. Clone

```bash
git clone https://github.com/<YOUR_USERNAME>/SnapSort.git
cd SnapSort
```

Replace `<YOUR_USERNAME>` with the GitHub account hosting the repository.

---

## 2. Install mobile dependencies

```bash
npm install
```

---

## 3. Create backend virtual environment

### Windows PowerShell

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

---

## 4. Install backend dependencies

```bash
pip install -r requirements.txt
```

---

# Environment Configuration

## Mobile environment (`.env` in project root)

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
```

> Values prefixed with `EXPO_PUBLIC_` are bundled into the client application. Never place private server keys, Gemini API keys, or Firebase Admin credentials in this file.

## Backend environment (`backend/.env`)

```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"
```

Never commit `backend/.env` or any service-account credential file.

---

# Running the Backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API base URL:

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

# Mobile App

```bash
npx expo start --clear
```

Then choose one:

```text
Press "a"      → open Android emulator
Scan QR code   → open in Expo Go on a physical device
```

Native features such as push notifications require an Expo development build rather than Expo Go.

---

# API URL by Device

| Environment | `EXPO_PUBLIC_API_URL` |
|---|---|
| Physical Android phone (same Wi-Fi) | `http://YOUR_PC_IPV4:8000` |
| Android Studio emulator | `http://10.0.2.2:8000` |
| Production APK | `https://your-deployed-api-domain.com` |

Run `ipconfig` on Windows to find the active Wi-Fi IPv4 address for physical-device testing.

---

# API Endpoints

## `GET /`

Health check for the backend service.

---

## `GET /docs`

Interactive Swagger documentation generated by FastAPI.

---

## `POST /api/scans/analyze`

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

# Authentication & Data

## Firebase Authentication

Enable required sign-in methods in Firebase Console:

```text
Firebase Console → Build → Authentication → Sign-in method
```

## Firestore Security Rules

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

# Waste Journal

The Waste Journal screen aggregates a user's saved scans into:

```text
Total scans
Average eco score
Pathway diversity
Weekly scan progress
Disposal category distribution
Personalized activity insight
Recent scan entries
```

```text
Saved Scans
     ↓
Weekly Aggregation
     ↓
Category Distribution
     ↓
Personal Insight Message
     ↓
Journal Dashboard
```

---

# Notifications

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

# Build an Android APK

## Development build

```bash
npx expo prebuild --clean
npx expo run:android
```

## EAS build

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

> Deploy the FastAPI backend to a public HTTPS host before producing a release APK. A local address such as `http://192.168.x.x:8000` only works while the developer's computer is running on the same network.

---

# Production Deployment

Target production architecture:

```text
SnapSort Android Application
             │
             ▼  HTTPS
   Deployed FastAPI Backend
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

# Security Notes

```text
Firebase client configuration values are public identifiers by design;
real protection comes from Firestore Security Rules.

Keep .env, backend/.env, .venv, and service-account files out of Git.

Use HTTPS for any production API endpoint.

Never embed Gemini or Firebase Admin secrets inside the mobile bundle.
```

Recommended `.gitignore`:

```gitignore
.env
.env.local
.env.production
backend/.env
backend/.venv/
backend/venv/
*.pem
*.key
service-account*.json
__pycache__/
*.pyc
node_modules/
.expo/
```

---

# Development Workflow

```powershell
# Terminal 1 — backend
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — mobile app
cd ..
npx expo start --clear
```

---

# Git Workflow

Check status:

```bash
git status
```

Review changes:

```bash
git diff
```

Stage changes:

```bash
git add .
```

Commit:

```bash
git commit -m "feat: describe your change"
```

Push:

```bash
git push origin main
```

---

# Limitations

SnapSort AI is currently a research/production-style prototype, not a certified waste-management authority.

```text
1. AI-generated disposal guidance is general and may not reflect
   local municipal rules.

2. Image quality, lighting, and framing affect analysis accuracy.

3. The eco score is a relative indicator, not a certified
   environmental measurement.

4. Local backend testing requires the developer machine and phone
   to share the same network.

5. Production use requires a deployed, secured, and monitored
   backend rather than a local development server.
```

---

# Future Roadmap

```text
Current
│
├── Camera + Gallery Capture
├── Gemini-Based Analysis
├── Firebase Auth + Firestore
├── Waste Journal Dashboard
└── Local Daily Reminders
        │
        ▼
Near-Term
│
├── Production Backend Deployment
├── Offline Scan Queue + Sync
├── Image Compression Before Upload
└── Expanded Waste Journal Analytics
        │
        ▼
Long-Term
│
├── Region-Specific Disposal Rules
├── Community/Leaderboard Features
├── Multi-Language Support
└── Automated CI/CD for Android Builds
```

---

# Project Philosophy

```text
Clear Photo Capture
        ↓
Reliable AI Reasoning
        ↓
Understandable Guidance
        ↓
Secure Personal History
        ↓
Long-Term Habit Building
```

SnapSort AI aims to turn a single everyday decision — "how do I dispose of this?" — into a fast, clear, and encouraging interaction rather than an ignored or guessed choice.

---

# Contributing

Contributions are welcome, including UI refinements, backend improvements, and documentation updates.

```text
1. Fork the repository
2. Create a feature branch
3. Implement and test your change
4. Commit with a clear message
5. Open a pull request with a summary and screenshots for UI changes
```

---

# License

This project is released under the:

**MIT License**

See [`LICENSE`](LICENSE) for the full license text.

Third-party services such as Firebase and the Gemini API are subject to their own separate terms of use.

---

# Acknowledgements

SnapSort AI builds on the following technologies and services:

```text
Expo
React Native
FastAPI
Firebase
Gemini API
React Native Paper
Zustand
```

All third-party tools remain subject to their respective licenses.

---

<div align="center">

## SnapSort AI

**Smarter choices. Smaller footprint.**

**Mobile-first. AI-driven. Built for everyday sustainability.**

</div>
