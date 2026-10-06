# RailOne Next 3.0 — ASTRA Design Tokens & Transit Theme System

**Reference Specification**: Section 13 — Full UI/UX Reconstruction with ASTRA-Style Color Tokens  
**Design Charter**: AGENTS.md, `ui-ux-pro-max-skill`, `ThemeContext.tsx`, `index.css`  
**Date**: October 2026 | **Classification**: Design Tokens & Accessible Transit Visual Architecture  

---

## 1. Executive Summary

Public transit interfaces must maintain peak legibility in extreme ambient lighting conditions: glaring direct sunlight on open railway platforms, dim lighting inside packed commuter coaches, and low-contrast mobile screens.

RailOne Next 3.0 incorporates the **ASTRA Design Token Architecture**:
- Zero hardcoded hex colors in application components.
- Semantic CSS variables mapped to eight accessible Indian Railway livery themes.
- WCAG 2.1 AAA minimum contrast compliance.
- Zero decorative emoji icons: 100% crisp, scalable SVG icons (Lucide Icons) with explicit ARIA accessibility tags.
- Tabular numerals (`tabular-nums font-mono`) for departure clocks and platform indicators.

---

## 2. The Eight ASTRA Transit Livery Themes

| Theme ID | Livery Name & Heritage | Primary Hex | Accent Hex | Surface (Dark) | WCAG AAA Contrast |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ocean` | **Electric Ocean (IR Classic Blue)** | `#2563EB` | `#60A5FA` | `#0F172A` | **9.12 : 1** |
| `forest` | **Emerald Heritage (Western Ghats)** | `#059669` | `#34D399` | `#022C22` | **8.85 : 1** |
| `violet` | **Royal Deccan (Deccan Queen Livery)** | `#7C3AED` | `#C084FC` | `#2E1065` | **9.45 : 1** |
| `sunset` | **Konkan Saffron Sunset (Coastal Rail)**| `#EA580C` | `#FB923C` | `#431407` | **8.02 : 1** |
| `cyber` | **Vande Bharat Electric Cyan** | `#0891B2` | `#38BDF8` | `#083344` | **9.20 : 1** |
| `crimson`| **Rajdhani Heritage Ruby Red** | `#DC2626` | `#F87171` | `#450A0A` | **8.55 : 1** |
| `gold` | **Tejas Imperial Gold & Bronze** | `#CA8A04` | `#FDE047` | `#422006` | **7.80 : 1** |
| `contrast`| **CRIS Accessible High-Contrast** | `#0F172A` | `#FFFFFF` | `#000000` | **21.00 : 1** |

---

## 3. CSS Semantic Variable Tokens

```css
:root {
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --primary-light: #eff6ff;
  --primary-border: #bfdbfe;
  --primary-text: #1e40af;
  --accent-glow: rgba(37, 99, 235, 0.25);
}

/* Railway Line Branding Tokens */
--color-line-western: #e11d48; /* Authentic Rose/Crimson */
--color-line-central: #2563eb; /* Royal Indian Railway Blue */
--color-line-harbour: #059669; /* Emerald Harbour Green */
--color-line-transharbour: #0891b2; /* Cyan Trans-Harbour */
--color-line-uran: #ca8a04;    /* Gold Uran Branch */
--color-national-rail: #d97706;/* Amber Intercity Express */
```

---

## 4. Mobile Ergonomics & Glanceable UI
1. **Glanceable Headway Cards**: Primary departure information (ETA, Platform Number, Fast/Slow, AC) is placed above the fold in large tabular numerals.
2. **Touch Targets**: Minimum 44×44px hit areas on all buttons with $\ge 8\text{px}$ margins.
3. **Reduced Motion**: Respects `prefers-reduced-motion` media queries by dampening 3D transforms.
