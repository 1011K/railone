# RailOne Next 3.0 — Offline, Mobile PWA & Deployment Specification

**Reference Specification**: Section 16 — Offline, Mobile, PWA, Deployment  
**Standard**: Progressive Web App (W3C PWA), Service Worker Cache API  
**Date**: October 2026 | **Classification**: Deployment Architecture & Offline Resilience  

---

## 1. Executive Summary

Commuters in Mumbai frequently travel through physical cellular dead zones: underground concourses at CSMT, the Parsik railway tunnel between Thane and Diva, and long bridges over Thane and Vashi creeks.

A transit application that requires active network connectivity for basic timetable lookups or displaying issued tickets fails during critical commute moments.

**RailOne Next 3.0** is engineered as an **Offline-First Progressive Web App (PWA)**:
1. Complete station index, lines, platforms, and scheduled timetables are bundled into the application binary.
2. The Service Worker caches all JavaScript bundles, stylesheets, icons, and SVG assets on first load.
3. Specimen tickets and user commute presets persist locally in browser storage.
4. When offline, the UI functions seamlessly with a clear `[OFFLINE CACHED]` indicator.
- **Verified Test**: Master Plan Scenario `[G16]` (Offline Resilient Caching & Specimen Presentation: 4/4 assertions pass).

---

## 2. Web App Manifest (`manifest.json`)

The Web App Manifest enables instant installation to Android, iOS, and desktop home screens:
- `name`: "RailOne Next — Railway Decision Intelligence"
- `short_name`: "RailOne Next"
- `theme_color`: "#2563eb"
- `background_color`: "#0f172a"
- `display`: "standalone"
- `orientation`: "portrait"
- `categories`: `["travel", "navigation", "transportation"]`

---

## 3. Production Deployment & Build Pipeline

1. **Clean Production Compilation**:
   ```bash
   npm run build
   ```
   Compiles code-split chunks via Vite v8.3.3 and Rollup:
   - `index.html`: Shell page (<1.4KB).
   - `index-[hash].css`: Unified Tailwind CSS v4 design tokens (~136KB / ~20KB gzip).
   - `index-[hash].js`: Core application and journey decision engines (~472KB / ~129KB gzip).
   - Code-split chunks for lazy loaded modals:
     - `NetworkMapViewer-[hash].js`: (~92KB).
     - `StationGodsEyeModal-[hash].js`: (~40KB).
     - `MovingTrain3DModal-[hash].js`: (~18KB).
2. **Deterministic Build Time**: Builds cleanly in under 800ms.
3. **Zero Native C++ Binary Dependencies**: Pure modern web standards runnable across Node.js 22, Express 4, Vercel, Netlify, or self-hosted Docker containers.
