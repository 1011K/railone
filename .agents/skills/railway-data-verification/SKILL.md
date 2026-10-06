---
name: "railway-data-verification"
description: "Verifies data provenance, stop patterns, delay propagation, and fare/eligibility integrity in RailOne Next."
---

# Railway Data Verification Skill

## Purpose
Enforces truth-in-data rules for railway schedules, delay predictions, and passenger eligibility within RailOne Next.

## Protocol
1. **Provenance Audit**:
   - Verify every observation object has `source`, `provider`, `retrieved_at`, `observed_at`, and `data_kind`.
   - Ensure demo fixtures are tagged with `data_kind: 'DEMO'` or `status: 'DEMO'`.
   - Ensure no simulated delay is rendered with a green "Verified Live" badge.

2. **Downstream Delay Propagation Check**:
   - Verify that delays at station $S_n$ propagate downstream along the route graph unless scheduled recovery slack is available.
   - Delay cannot magically vanish without buffer time in the published timetable.

3. **Eligibility Verification**:
   - For any Mail/Express recommendation on suburban sections (e.g. Dadar to Kalyan):
     - Train must be on the official Central Railway MST list.
     - Unreserved GS coaches must be present.
     - Ticket must be explicitly verified as permitted.
