# RailOne Next 3.0 — Disruption, Delay & Recovery Intelligence

**Reference Specification**: Section 5 — Disruption, Delay, and Recovery Intelligence  
**Core Engines**: `delayModel.ts`, `delayHeatmap.ts`, `networkAlertsService.ts`  
**Date**: October 2026 | **Classification**: Railway Operational Modeling  

---

## 1. Executive Summary

Railway delay propagation in high-density corridors does not follow a linear flat timeline. When an originating train departs 20 minutes late, headway constraints, signal block sections, and platform congestion cause that delay to accumulate downstream rather than remain constant.

Furthermore, when major disruptions occur (such as OHE power trips, monsoon waterlogging at Kurla/Sion, signal point interlocking failures, or scheduled Sunday Mega-blocks), naive route finders strand passengers by recommending delayed trains that cannot make their connections.

**RailOne Next 3.0** models delay accumulation mathematically, surfaces root-cause operational disruption reasons, and dynamically replans journeys to minimize passenger delay.

---

## 2. Mathematical Delay Propagation Model

### 2.1 Compounding Delay Progression ($+20\text{m} \to +40\text{m}$)
Standard apps project initial origin delays flatly across all upcoming stations. In reality, a train delayed into a busy suburban corridor loses its scheduled signal slot and is forced to wait behind preceding local services.

The RailOne Next compounding delay model (`src/engine/delayModel.ts`) computes downstream arrival delay as:
$$\text{Delay}_{\text{downstream}} = \text{Delay}_{\text{origin}} \times (1 + \alpha \cdot \text{CongestionFactor}) + \beta \cdot (\text{TraversedHalts})$$
- Where $\alpha$ represents corridor headway density ($1.2$ during peak rush, $0.8$ off-peak).
- For Train 12134 (Mangaluru–CSMT Express), an origin delay of $+20\text{m}$ at Panvel (PNVL) compounds to $+40\text{m}$ upon arrival at CSMT due to suburban Harbour/Central line track sharing.
- **Verified Test**: Master Plan Scenario `[G4]` (Compounding Downstream Delay: 3/3 assertions pass).

---

## 3. Disruption Attribution & Operations Control (OCC) Reasons

Every delayed track segment in the interactive 2D/3D map and tracker provides the explicit railway operational reason:
1. **Signal Interlocking & Point Failure**: e.g. Kurla Junction points failure held at danger signal.
2. **Overhead Equipment (OHE) Power Trip**: e.g. Neutral section power outage or pantograph damage.
3. **Monsoon Speed Restrictions**: Cautionary speed orders ($30\text{ km/h}$) across waterlogged sections (Sion–Kurla chord).
4. **Dense Fog & Visibility Restrictions**: Absolute block speed restrictions on Northern Railway corridors (New Delhi–Kanpur).
5. **Scheduled Mega-Block / Jumbo-Block**: Sunday engineering maintenance on fast corridors rerouting services to slow tracks.

---

## 4. Onboard Context Replanning (No Backtracking)

When a passenger is already onboard a moving or stalled train:
1. The origin is strictly clamped to the train's **next upcoming halt** (e.g. Kurla).
2. The engine strictly forbids backtracking to previously passed stations (e.g. Kalyan or Thane).
3. The engine computes alternate connecting services departing exclusively from upcoming halts.
- **Verified Test**: Master Plan Scenario `[G7]` (Onboard Forward-Only Replanning: 4/4 assertions pass).
