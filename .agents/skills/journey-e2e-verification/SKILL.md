---
name: "journey-e2e-verification"
description: "Executes repeatable verification of passenger decision scenarios: delay inversions, leave-home calculation, transfers, and voice tools."
---

# Journey E2E Verification Skill

## Critical Scenarios to Validate

1. **Delay Inversion (Slow vs Delayed Fast)**:
   - Given a Fast train delayed by 20+ minutes and a Slow train on-time, the journey planner must rank the Slow train higher if its estimated arrival at destination is earlier.
   - UI must clearly articulate the trade-off.

2. **Cross-Line Transfer (Thane to Churchgate via Dadar)**:
   - Central Railway leg: Thane to Dadar.
   - Walking transfer: Dadar Central to Dadar Western (buffer: minimum 6-8 minutes).
   - Western Railway leg: Dadar to Churchgate.
   - Connection validation: If leg 1 is delayed, system must warn of missed connection and calculate next available Western service.

3. **Leave-Home Timing**:
   - Commute travel-to-station margin (e.g. 15 minutes walking/auto).
   - If train origin has not departed, departure from boarding station is recalculated.
   - Leave-home recommendation adjusts dynamically.

4. **Express Short-Hop Eligibility**:
   - Dadar to Kalyan.
   - Check suburban pass or ticket holder eligibility on Express train.
   - System flags as `CONDITIONAL / REQUIRES MST` instead of unconditional OK.
