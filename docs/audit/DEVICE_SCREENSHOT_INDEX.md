# RailOne Next — Multi-Device Viewport Screenshot Index

**Audit Date:** 2026-10-10  
**Capture Engine:** Headless Microsoft Edge via Chrome DevTools Protocol (`scripts/capture-screenshots.mjs`)  
**Artifact Storage:** `artifacts/screenshots/`  
**Accessibility Standard:** WCAG 2.1 AA / AAA (4.5:1 text contrast minimum, 44×44px touch targets)

---

## Viewport Capture Ledger

| Viewport Profile | Resolution | Scale Factor | Orientation | Screenshot File | Layout & Ergonomics Compliance |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **Samsung Galaxy S24** | 360 × 780 | 2.0x | Portrait | `artifacts/screenshots/galaxy-s24-360x780.png` | **PASS (Narrow 360px Resilience)**<br>Single-line brand header, 4-column service grid without clipping, 44px touch targets. |
| **Apple iPhone SE (Gen 3)** | 375 × 667 | 2.0x | Portrait | `artifacts/screenshots/iphone-se-375x667.png` | **PASS (Compact iOS Viewport)**<br>Compact search bar, tabular arrival numerals, glanceable departure indicators. |
| **Apple iPhone 16 Pro** | 393 × 852 | 2.0x | Portrait | `artifacts/screenshots/iphone-16-pro-393x852.png` | **PASS (Modern Flagship Mobile)**<br>Dynamic Island safe-area padding, prominent quick booking shortcuts. |
| **Google Pixel 8** | 412 × 892 | 2.0x | Portrait | `artifacts/screenshots/pixel-8-412x892.png` | **PASS (Android Flagship Viewport)**<br>Material-density spacing, full 22-service tile visibility, balanced negative space. |
| **Desktop / Laptop** | 1280 × 800 | 1.0x | Landscape | `artifacts/screenshots/desktop-1280x800.png` | **PASS (Desktop Widescreen Mode)**<br>Split-screen layout with interactive God's Eye map and live timetable tables. |
| **iPhone 16 Pro (Scrolled)** | 393 × 852 | 2.0x | Portrait | `artifacts/screenshots/iphone-16-pro-scrolled-grid.png` | **PASS (22-Services Directory)**<br>Full 4-column square directory visible with category filters and pastels. |
| **iPhone 16 Pro (Dark Mode)** | 393 × 852 | 2.0x | Portrait | `artifacts/screenshots/iphone-16-pro-dark-mode.png` | **PASS (High-Contrast Dark Theme)**<br>Midnight slate surfaces (`#090d16`), luminous accent borders, WCAG AAA text contrast. |

---

## Ergonomic & Design System Verification Criteria

### 1. 44×44px Minimum Touch Targets
- All primary interactive elements (city selector chip, search submit button, booking cards, 22-service grid tiles, RailSathi call/chat triggers, and bottom navigation tabs) enforce minimum `minHeight: 44` and `minWidth: 44` bounding boxes with at least 8px lateral spacing.
- Passed across the narrowest 360px viewport without accidental multi-tap triggers.

### 2. High-Contrast Indian Transit Palette
- **Signal Blue (`#1d4ed8` / `#0284c7`):** Primary institutional brand identity, route links, and active tabs.
- **Caution Amber (`#d97706` / `#b45309`):** Scheduled maintenance blocks, First Class rakes, and delay badges.
- **Signal Green (`#16a34a` / `#059669`):** On-time running status, Ladies compartments, and refund credits.
- **Alert Crimson (`#dc2626` / `#be123c`):** Service cancellations, demo watermarks, and penalty alerts.
- **Crisp Slate (`#0f172a` light / `#090d16` dark):** Maximum readability backgrounds conforming to WCAG 2.1 AA/AAA contrast ratios (> 7.5:1).

### 3. Zero Emoji Policy Enforcement
- Pure SVG iconography used throughout (Lucide icons and custom vector assets with explicit `aria-hidden` attributes).
- Zero Unicode emoji glyphs in button labels, train descriptions, platform indicators, or system error messages.

### 4. Tabular Departure Clocks
- Monospace and tabular figure font styling applied to all countdowns, arrival clocks, platform numbers, and PNR display cards to eliminate layout jitter during live updates.
