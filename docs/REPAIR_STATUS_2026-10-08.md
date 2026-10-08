# RailOne Next — Repair branch status (8 October 2026)

**Branch:** `fix/railone-p0-feature-parity-2026-10-08`  
**Base:** `feature/india-multimodal-rebuild` at `463b8fde18cb7fb605a20a3a095ac9e92f88de1a`  
**Release verdict:** **NOT READY TO MERGE OR DEPLOY.** Source changes are committed, but full TypeScript, package, API, mobile and physical-device tests have **not** been run in the repair environment. Do not equate source presence with operational verification.

## Implemented and source-inspected in this branch

1. Reject profile-ID-only token issuance; use per-process fallback signing secret in demo and require configured production secret.
2. Require authentication for creation and retrieval of bookings, reject cross-user ownership and idempotency key reuse, close unrestricted audit-log access, scope notification writes.
3. Correct simulated cancellation accounting: refund instrument amounts are mutually exclusive; no bank settlement takes place.
4. Remove fabricated live punctuality, station-location, platform fallback and ticket validity statements in key native views and guide.
5. Restore native crowd estimation and least-crowded preference, explicitly marking crowd levels as uncalibrated LOW-confidence time-band estimates, not sensor observations.
6. Add new eight-region multimodal graph results alongside the existing Mumbai suburban departures. Do not show these modeled graph times as actual departing services.
7. Expose city-pack metro, ferry and bus locations in the native search picker and preserve chosen city.
8. Label multimodal timings/fare as estimates; add declared first/last-service window checks and optional operating-day constraint.
9. Mark Mumbai Monorail suspended; record operational Metro 2B/9 portions as pending routable data rather than inventing station schedules.
10. Restrict active product authority selection to India and clarify that RailOne Next has no CRIS/government endorsement.
11. Disallow invented metro ticket distances; remove arbitrary local and express fare fallbacks and made-up passenger details; label tariffs as unverified models.
12. Align map's eight-city selector to Ahmedabad–Gandhinagar; representative schematic only, not a complete geo map.
13. Correct teammate Node.js prerequisite to >=22.13, add reproducible `npm run setup` and `npm run setup:web` commands.
14. Add `npm run test:contracts` for 13 lightweight source-level regression guards. This does not replace actual tests.

## Concurrent-work warning (checked on 8 October 2026)

While this P0 repair was being committed, `feature/india-multimodal-rebuild` advanced by two commits to `f135f87454750eda4df4d3f30e9542c1e3501ce5`. The two branches **diverge**. Newer upstream changes include dynamic translations, phone actions, 2D guide updates and dark-mode tokens. Overlapping files include `src/models/authorities.ts` and `src/components/mobile/MobileLiveTab.tsx`.

**Do not force-push, assume a fast-forward, or blindly overwrite upstream.** Reconcile those commits and this repair branch through a reviewed merge/rebase, then execute the full test and physical-device gates. No CI was run and no pull request or merge was initiated here.

## Remaining release blockers: grouped by gate

### Gate A. Security, demo identity and financial correctness (P0)
- Integrate a verified user identity flow. `POST /passengers` issues a fresh demo identity and token; that is **not** authentication of a real person.
- Store tokens and passenger records using appropriate secure, durable native storage; enable intentional restore/logout, prevent cross-device leakage.
- Review all unclaimed historical bookings and restrict any remaining permissive service-layer access.
- Test API negative permissions with 2+ passenger identities; cover duplicate payment retries and instrument-specific refunds.
- Preserve demo-only payment/ticket status: no real PRS/UTS issuance, payment authorization or external bookings.

### Gate B. Mumbai verified journey planning and crowding (P0)
- Replace the current sparse Mumbai graph with all **operational and independently checked** suburban/metro routes, stops, service calendars, express eligibility gates and physically possible interchanges.
- Complete Metro 3 station-level service topology, operational sections of Lines 2B/9 and all permitted routes. Keep suspended monorail excluded until official resumption.
- Make routing genuinely time-dependent: arrival/departure date, headways, platform boarding buffers, connection windows, cancellation/disruption propagation, stale live feed handling, and service-date validation.
- Reconcile the legacy suburban engine (slow/fast/AC, replan, least-crowded) with the new multimodal engine into one shared passenger decision contract. Both web and native must use it.
- Crowd estimates currently use a rule-based heuristic only. Calibrate against licensed data before making confidence or coach-specific claims; continue to show unavailable otherwise.
- Correct class/stop/express-ticket eligibility and maintain the 15-minute express advantage as configurable preference, never statutory rule.
- Validate all tariffs with current operator documents. Demo fare formulas are currently not official quotes.

### Gate C. Native passenger journey (P1)
- Verify all flows Home → station search → accurate departure times → crowd comparison → rail/metro/bus/ferry route → maps → guide → demo ticket → wallet → RailSathi.
- Build actual geographic pedestrian map and physical station/entrance/FOB/lift walk edges; schematic-only location approximation is not full navigation.
- Verify coach formations/platform numbers/accessibility, remove remaining hardcoded or misleading dynamic statuses.
- Fix physical device native persistent offline storage (current `localStorage` bridge falls back to memory). Use an appropriate supported dependency and update the mobile lockfile.
- Complete screen-reader testing, 360px layouts, English/Hindi/Marathi copy and real native speech input; authorized call provider is not integrated.
- Replace all remaining foreign-country or government-branded demo notices outside the active authority selector.

### Gate D. Eight-region completeness (P1/P2)
- Other seven city packs are **representative datasets**, not exhaustive coverage. Require real source-specific stops, metro lines, buses, operator calendars, legal access, external links and per-city acceptance journeys.
- Official live railway/metro/bus feeds, cab/auto prices and ferry departures need licensed/authorized integration. Do not scrape protected services or invent availability.

### Gate E. Reproducible developer handover (P0)
- On a clean machine with Node >=22.13, run `npm run setup`, `npm run test:contracts`, `npm test`, `npm run lint` and `npm run mobile:lint`.
- Run a **physical Android/iOS** device workflow and actual app restart/offline tests.
- Audit and update stale/foreign-country tests under `tests/run-all-tests.ts` without deleting meaningful intended coverage. Tests from superseded product scope must be clearly marked legacy, not falsely passed.
- Validate clean GitHub ZIP from THIS branch; default `main` may not include the native application. Do not merge to `main` until explicit review and passing gates.

## Feature protection rule

**Do not replace functioning passenger features by adding parallel inaccessible engines.** Any change to a source contract must prove feature parity across **native application, web application, and RailSathi**, plus automated regression tests of original 80-feature register. Missing data must produce `UNAVAILABLE`; simulations must be conspicuously labelled.

## Source checkpoints

- Source engine: `src/engine/journeyEngine.ts`, `src/engine/multimodal/graphEngine.ts`, `src/engine/crowdEstimator.ts`
- City information: `src/engine/multimodal/cityPacks.ts`, `apps/mobile/src/fixtures/metroData.ts`, `apps/mobile/app/map.tsx`
- Native: `apps/mobile/app/(tabs)/journeys.tsx`, `apps/mobile/app/(tabs)/status.tsx`, `apps/mobile/app/guide.tsx`
- API/security: `src/backend/routes/v1.ts`, `src/backend/middleware/auth.ts`, `src/backend/modules/ticketing.ts`
- Regressions: `scripts/check-regression-contracts.mjs`, `tests/run-all-tests.ts`

**No unsupported 99% completion claim. Release gates remain open until evidence is collected.**
