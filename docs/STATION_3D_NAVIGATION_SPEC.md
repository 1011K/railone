# RailOne Next 3.0 — 3D Station Navigation & God's Eye Specification

**Reference Specification**: Section 8 — 3D Station Navigation and God's Eye  
**Core Implementations**: `StationGodsEyeModal.tsx`, `stationLayoutsData.ts`  
**Date**: October 2026 | **Classification**: 3D Spatial Transit Modeling  

---

## 1. Executive Overview

Major railway junctions in India (such as Dadar Junction, CSMT, Thane, Andheri, Kalyan, and New Delhi) are intricate, multi-level passenger transit labyrinths. Dadar Junction alone spans 15 operational platforms divided across two distinct railway zones (Western Railway PF 1–7 and Central Railway PF 1–8), connected by three separate Foot-Over-Bridges (North, Middle, and South FOBs).

Commuters frequently miss connecting services because existing transit apps provide no physical layout guidance, no elevation cues, and no step-free accessibility details.

**RailOne Next 3.0** introduces **God's Eye 3D Station Navigation**, delivering:
1. Multi-level topological station models with true elevation separation (Platforms Level 0, FOBs Level 1, Skywalks/Metro Level 2).
2. "God's Eye" perspective with interactive 3D pitch tilt and rotation controls.
3. Pedestrian Foot-Over-Bridge Transfer Pathfinder with step-by-step turn guidance and realistic walk times.
4. Step-free accessible pathfinding prioritizing elevator-equipped bridges.
5. Live platform occupancy visualization displaying berthed rakes and coach compositions.
6. Station amenities positioning (ATVM kiosks, Lifts, Escalators, RPF Police, Medical Centers, Metro Links).

---

## 2. Indexed Railway Station Layouts

### 2.1 Dadar Junction (DR / DDR)
- **Platforms**: 15 total (7 Western Railway + 8 Central Railway).
- **Foot-Over-Bridges**:
  - *North FOB*: Fastest cross-line interchange (6m walk) with lift access.
  - *Middle FOB*: Flower market concourse connecting all 15 platforms (7m walk) with escalators and lifts.
  - *South FOB*: CSMT/Churchgate end bridge (7m walk).
- **Amenities**: ATVM reservation center, RPF safety outpost, emergency One-Rupee medical clinic, Divyangjan wheelchair ramps, East/West concourse exits.

### 2.2 Chhatrapati Shivaji Maharaj Terminus (CSMT)
- **Platforms**: Suburban local terminals (PF 1–7) and Mainline outstation platforms (PF 8–18).
- **Concourse**: UNESCO World Heritage Grand Concourse, Star Chamber UTS/PRS hall, direct subway link to Mumbai Metro Line 3 (Aqua Line).

### 2.3 Thane Junction (TNA)
- **Platforms**: Central line suburban & express (PF 1–6) and Trans-Harbour terminus (PF 9–10).
- **Level 2 SATIS Deck**: Station Area Traffic Improvement Scheme elevated concourse for direct municipal bus boarding.

### 2.4 Andheri Junction (ADH)
- **Platforms**: Western suburban (PF 1–5) and Harbour line (PF 6–7).
- **Level 2 Metro Skywalk**: Elevated pedestrian bridge connecting directly into Mumbai Metro Line 1 (Versova–Andheri–Ghatkopar).

### 2.5 New Delhi Railway Station (NDLS)
- **Platforms**: 16 outstation platforms connecting Paharganj (West) and Ajmeri Gate (East).
- **Subway Concourse**: Direct underpass connection to Delhi Metro Airport Express and Yellow Line.

---

## 3. Foot-Over-Bridge Transfer Algorithm

The transfer pathfinding function `calculateStationTransferRoute()` evaluates:
1. The physical horizontal separation between platform centers.
2. The availability of elevators and ramps when `requireStepFreeAccess` is enabled.
3. Bridge crowd factors during morning and evening rush hours.
4. Generates deterministic step-by-step pedestrian directions:
   - Alight at Platform $A$.
   - Ascend stairs / take elevator to designated Foot-Over-Bridge.
   - Walk along bridge concourse ($D$ meters).
   - Descend via elevator / stairs onto Platform $B$.
   - Stand behind yellow safety line and inspect digital indicators.
- **Verified Test**: Test Suite 18 (Assertions 18.1 to 18.14 pass deterministically).
