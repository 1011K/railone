# RailOne Next — Quick Start Guide

Welcome to **RailOne Next**, a mobile-first multimodal journey application designed for Mumbai Metropolitan Region (MMR) and 7 additional verified Indian urban regions (Delhi NCR, Bengaluru, Kolkata, Pune–PCMC, Chennai, Hyderabad, Ahmedabad–Gandhinagar).

---

## 1. System Prerequisites

Before starting, ensure your local development workstation meets the engine requirements:

- **Node.js**: `>= 20.0.0` (LTS recommended)
- **npm**: `>= 10.0.0`
- **Operating System**: Windows (PowerShell/CMD), macOS, or Linux.
- **SQLite Support**: Built into Node 20+ via `node:sqlite`.

---

## 2. Installation & Setup

Clone the repository and install dependencies with a single command:

```bash
# 1. Install root workspace dependencies
npm install

# 2. (Optional) Install native mobile dependencies
npm --prefix apps/mobile install
```

> **Windows Note**: On systems where PowerShell execution policy restricts script execution, run scripts with `cmd /c npm install` or `cmd /c npm test`.

---

## 3. Launching the Web Demonstration

Start the unified full-stack application (Express API backend + Vite React 19 frontend):

```bash
npm run dev
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API & Swagger**: `http://localhost:3000/api/v1`
- **Health Check**: `http://localhost:3000/api/v1/health`

### Environment Configuration (Zero Credentials Required)
RailOne Next operates fully offline and without proprietary external API keys:
- Copy `.env.example` to `.env`:
  ```bash
  cp .env.example .env
  ```
- If `GEMINI_API_KEY` is not provided, RailOne Next automatically activates its deterministic local reasoning fallback engine. All multimodal graph routing, timetables, and transactions operate with 100% functionality.

---

## 4. Running the Test Suite

Run the comprehensive regression and acceptance test suite:

```bash
npm test
# Or on Windows:
cmd /c npm test
```

This executes all verification suites covering P0 security guards, atomic transactions, statutory ticketing regulations, multimodal graph routing, and UI invariants.

---

## 5. Mobile Application Development (Expo / React Native)

The repository includes a production-grade native mobile application in `apps/mobile`:

```bash
# Start Expo development server (Web emulator preview)
npm run mobile:web

# Start Metro Bundler for physical devices (Expo Go app)
npm run mobile:dev

# Run native prebuild checks
npm run mobile:doctor
```

> **Native SDK Notice**:
> Running on an Android emulator or building a standalone APK requires the Android SDK, Java 17+, and `ANDROID_HOME` configured. Running on iOS requires macOS and Xcode. Extracting a ZIP does not bypass native operating system and toolchain requirements.
