# RailOne Next — Reproducible Execution Guide

This document describes reproducible steps for running the RailOne Next backend server, desktop localhost phone preview, and native Expo application.

---

## 1. Prerequisites
- Node.js >= 20.x (Recommended: Node 22 with native SQLite support)
- npm >= 10.x
- Git

---

## 2. Starting the Backend Server
The backend powers the REST API, SQLite database, tariff calculators, and RailSathi deterministic tools.

```bash
# Install dependencies
npm install

# Start Express + SQLite backend on port 3000
npm run dev
```

The API endpoints will be accessible at:
- `http://localhost:3000/api/v1/stations/search?q=Thane`
- `http://localhost:3000/api/v1/routes/search?from=TNA&to=CSMT`
- `http://localhost:3000/api/health`

---

## 3. Starting the Desktop Localhost Phone Preview
The desktop phone preview simulates the mobile passenger experience in a browser viewport.

```bash
# Build the web bundle
npm run build

# Start the Vite preview server
npm run preview
```

Open the preview URL in your browser:
- `http://localhost:4173/`

---

## 4. Running the Native Mobile Application (`apps/mobile`)

The native application is an Expo SDK 53 React Native app with Expo Router.

### Option A: Expo Web Preview
```bash
npm run mobile:web
# or
cd apps/mobile && npm run web
```
Accessible at `http://localhost:8081`

### Option B: Expo Go on Physical Phone (iOS / Android)
```bash
# 1. Start the Expo development server
npm run mobile:dev
# or
cd apps/mobile && npx expo start
```
1. Connect your phone to the **same Wi-Fi network** as your computer.
2. Scan the generated QR code using the **Expo Go** app (Android) or Camera app (iOS).
3. The app automatically detects your computer's LAN IP (`Constants.expoConfig.hostUri`).

### Option C: Physical Device with Explicit Backend URL
If testing on a physical phone outside the local subnet or via cellular data:
```bash
# Set your reachable backend IP or domain
export EXPO_PUBLIC_API_URL="http://192.168.1.100:3000/api/v1"
cd apps/mobile && npx expo start
```

---

## 5. Native Compilation & Prebuild Verification
To verify native Android and iOS compilation paths:

```bash
# 1. Run Expo Doctor
npm run mobile:doctor

# 2. Run clean native prebuild
npm run mobile:prebuild
```

---

## 6. Running Local Automated Test Suites
RailOne Next enforces strict test-driven development. Run tests locally without CI:

```bash
# 1. Run full automated test suite (23 suites, 196+ assertions)
npm test

# 2. Run multi-city and route verification
npx tsx tests/verify-routes.ts

# 3. Run backend services and SQLite persistence test
npx tsx tests/backend-services.test.ts

# 4. TypeScript strict typecheck (root and mobile)
npm run lint
npm run mobile:lint
```
