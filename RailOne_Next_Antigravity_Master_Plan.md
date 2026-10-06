# RAILONE NEXT 2.0 — REVIEW-LED PRODUCT SPECIFICATION & ANTIGRAVITY HANDOFF
Date: 6 October 2026. Intended use: unofficial educational RailOne-inspired Indian railway website and installable mobile/PWA experience.
Status: research and design specification, **not** a functioning railway data integration or genuine booking capability.

## A. Product objective and non-negotiable rules

Deliver the best **feasible** railway journey, accounting for passenger travel class, budget, boarding eligibility, valid stops, published timetable, observed delays, realistic transfers, ticket requirements, disruption risk and current passenger context. Support Mumbai suburban first (all relevant Central, Western, Harbour and Trans-Harbour services) and national Indian Railways trains. Work as a responsive website and installable PWA using one documented backend.

1. Never issue real tickets, collect actual payments or impersonate CRIS, Indian Railways, IRCTC, NTES, UTS, Yatri or any official service. All specimen tickets must visibly state `DEMO / NOT VALID FOR TRAVEL`.
2. No unauthorized scraping, reverse-engineering of protected APIs, credential reuse, rate-limit evasion, security-rule bypass or misuse of GPS/geofencing. An open-source license for scraping code does NOT grant a railway data license.
3. If no authorized live data, use scheduled or a local *DEMO* simulation with unmistakable UI and API labeling. Never default missing live data to on time.
4. No invented exact fares, seats, crowds, historical distributions, refunds, PNRs or coach/platform positions. Reject predictions when uncalibrated.
5. Preserve current working export as a git baseline; inspect actual framework and dependencies before installing anything. Prefer existing packages. Minimize changes that break build/deployment.
6. Work in small committed changes, local tests before integration and push only after passing. Produce evidence with commands, test output and exact provenance. Never call copied/cloned/installed code "integrated" without end-to-end tests.
7. No hardcoded color identity: colors and branding configurable. Genuine passenger-accessible functionality beats cosmetic animation.

## B. Evidence from public reviews (illustrative, not representative prevalence estimates)

- RailOne: Reddit Aug 4, 2026 reports a successfully purchased unreserved ticket not appearing in My Bookings until after a complaint closed, causing a duplicate purchase. Play reviews June 16, Sept 4 describe payment/refund uncertainty and version errors. Sources: https://www.reddit.com/r/indianrailways/comments/1vf5l7w/disappointed_with_the_railone_app_experience/ ; https://play.google.com/store/apps/details?id=org.cris.aikyam ; https://www.reddit.com/r/mumbai/comments/1rqw4k0/railone_not_able_to_book_local_tickets/
- IRCTC Rail Connect: Play reviews Apr 20 and Sept 4 describe logout/error at payment and debits without clear outcome. Source: https://play.google.com/store/apps/details?id=cris.org.in.prs.ima
- Yatri: Play reviews Aug 16–Sept 1 describe ads delaying urgent timetable access, changed UI, missing timestamps and marker/stop list desynchronization. Source: https://play.google.com/store/apps/details?id=com.yatrirailways.yatri
- m-Indicator: Play reviews Aug 18–23 criticize live tracking during rain/megablocks and connecting services; other reviews strongly praise offline timetables. Source: https://play.google.com/store/apps/details?id=com.mobond.mindicator
- Where is my Train: Play reviews Jul–Sept mention offline GPS/cell tower failures and an overnight service date lookup gap; positive reviews praise offline tracking. Source: https://play.google.com/store/apps/details?id=com.whereismytrain.android
- ixigo: Play reviews Aug–Sept mention incorrect actual timings, feedback being lost on logout, food-vendor support, voucher conditions. Other reviewers praise UI. Source: https://play.google.com/store/apps/details?id=com.ixigo.train.ixitrain
- ConfirmTkt: Google Play and Reddit reports criticize unclear cash versus coupon 2x/3x refund terms, short validity and extra fees; these are **allegations/reviews**, not a verified statement of illegality. Sources: https://play.google.com/store/apps/details?id=com.confirmtkt.lite ; https://www.reddit.com/r/indianrailways/comments/1u7kwe7/confirmtkts_3x_refund_claim_seems_misleading/ ; https://www.reddit.com/r/indianrailways/comments/1wpsilo/confirmtkt_misleading/
- RailYatri: Play reviews describe weak customer service, voucher problems, and surprising alternate-destination changes; developer explains extended stations may be part of a confirmed-ticket option. Source: https://play.google.com/store/apps/details?id=com.railyatri.in.mobile
- UTS-style ticketing: location and device-linked ticket constraints create confusion but serve compliance purposes; explain, do NOT circumvent. Sources: https://www.reddit.com/r/indianrailways/comments/1mcu25f/the_railone_app/ ; https://www.reddit.com/r/indianrailways/comments/1sse7gz/railone_doesnt_allow_paper_ticket/

**Evidence policy**: These are small, non-random examples. They establish plausible failure modes for testing, not overall app defect frequency. Do not present review allegations as verified root causes. RailOne, ConfirmTkt, Yatri, etc. have positive as well as negative feedback.

## C. Detailed features: each problem, intervention, measurable acceptance

### C1 — Discovery and time-dependent search [P0]
- Search origin/destination with aliases, station codes, transliterated names, multi-city terminals, train numbers, service types, date and time.
- Modes: **depart at/after**, **arrive by**, earliest, cheapest valid, minimum transfers, minimum walking, preferred class/budget, accessible route where verified.
- National trains with train-origin day, boarding day offset, midnight crossing, operating calendars, specials and days without operation.
- Suburban categories: second, first, AC; slow/fast/semi-fast, Central/Western/Harbour/Trans-Harbour; valid current services; MEMU/DEMU/passenger when available.
- National: unreserved/general and published reserved classes 2S, SL, CC, EC, 1A, 2A, 3A, 3E etc only where actual service supports them; no blanket offerings.
- Station-specific boarding/alighting and stop eligibility. Proper station codes and transfer/walking times at Dadar, Kurla, Thane and other interchanges.
- **Better**: Search returns **complete feasible itineraries** with all legs, not disconnected train rows; include reasons for unavailable choices, not fake results.
- **Tests**: overnight train with previous-day origin, non-daily operation, fast local that skips a station, an Express that is ineligible for Dadar-Kalyan short hop, absence of AC services, multi-leg route.

### C2 — Routing and decision engine [P0]
- Candidate route enumeration under service calendars, time-dependent network edges, connection buffers, walking, onboard restrictions and hard eligibility gates.
- Rank with interpretable objective hierarchy: legality and reachability FIRST, then passenger deadline, journey arrival and transfer risk, budget/class/preferences. Disclose tradeoffs; never trade hard eligibility for speed.
- Transparent breakdown: route, train number/category, leg start/end, scheduled/expected times, interchange walking, wait, fare availability, source, confidence.
- Leave-home timing with adjustable station access time, uncertainty and boarding buffer; passenger context: at home, at station, onboard.
- **Better**: recompute when a late train creates or destroys a connection; compare delayed fast vs viable slow. Already-onboard alternatives must begin only from upcoming actual halts.
- **Tests**: Thane-Dadar-Churchgate arrive by deadline; delayed fast loses to slow; origin delayed 20 mins grows to +40 downstream; train canceled; onboard at Kalyan cannot backtrack to prior stop.

### C3 — Trustworthy observations & disruption handling [P0]
- Provider-independent feed adapters with authorized-source checks. Scheduled, observed, historical, predicted, community-reported and demo namespaces.
- Timestamp and observation validity: `source_id`, `service_date`, `observed_at`, `fetched_at`, `expires_at`, location class, permitted use, quality flag and conflict indicator.
- Station boards, actual vs scheduled arrival/departure, last verified station, skipped stop, diverted line, platform updates only if verified, cancellations, megablocks and weather disruption notices where sourced.
- Explicit unavailable/stale/reconnecting messages. Never transform simulated timetable animation into 'live GPS'.
- **Better**: use disruptions to recommend alternate departures/routes, not just display status.
- **Tests**: stale provider outage, conflicting station feeds, timestamp outside validity, missing data, schedule mismatch, connection-risk update.

### C4 — Prediction and reliability [P1, not P0 blocker]
- Historical train punctuality by date/direction/station/time; average, median, p80/p90 ONLY if adequate observations.
- Simple deterministic baselines first, then optional gradient boosting or calibrated probabilistic ETA after verified datasets are available.
- No leakage: split by service date/chronology, avoid future-station observations, out-of-sample/walk-forward evaluation; baseline comparisons, absolute error, interval coverage and calibration.
- Labels `PREDICTED` and validity horizon. If history insufficient, `INSUFFICIENT_DATA`.
- **Better**: downstream delay trajectory + connection-miss likelihood, not naive flat initial delay.

### C5 — Ticket eligibility, fares and booking [P0 DEMO]
- Railway ticket products: suburban single, return, season; platform tickets; unreserved/general; national reserved and available quotas, AC/first/second as applicable.
- Rules for stops, route class, restrictions, train type, service eligibility, distance, dates, ticket validity, concessions only when supported by official rules.
- Transparent quote lines: base fare, applicable charges/taxes, fee, coupon or concession, total. No invented numbers: use configured demonstration tariff with DEMO label or show unavailable.
- Typed backend states: `DRAFT`, `VALIDATING`, `PAYMENT_SIMULATED`, `TICKET_ISSUED_DEMO`, `FAILED`, `PENDING_RECONCILIATION_DEMO`, `CANCELLED_DEMO`, `REFUND_PENDING_DEMO`, `REFUNDED_DEMO`.
- Persist idempotency key for each mock order; simulation of duplicated click, successful backend state but timeout UI, delayed booking synchronization, retry and restored session. Distinguish transaction reference from ticket issuance.
- Specimen QR/PDF tickets with prominent watermark; no Indian Railways marks, genuine PNR imitation or claims of validity.
- Pre-confirm any change to chosen origin/destination/boarding, class or route. Show unavailable options rather than quietly substituting them.
- **Better**: user can always see an intelligible outcome timeline and prevent duplicate attempt after an ambiguous failure.
- **Tests**: user taps pay twice, timeout after mock 'payment', ticket appears late, app restarts, no ticket created despite payment simulation, double click; never issue duplicates.

### C6 — Complaint and refund experience [P0 DEMO; P1 richer]
- Help per booking, visible transaction reference, case timeline, reason codes, proof/status logs with no sensitive data exposed.
- Refund estimate breakdown, timeline as DEMO, show exact cash vs wallet vs noncash benefit and all terms before opt-in.
- Escalation path where official links can be surfaced but without impersonating official support. No unverified refund guarantees.
- **Better**: a user understands status without calling support, can reopen an unresolved issue and see why a case closed.

### C7 — Mumbai-specific passenger intelligence [P0/P1]
- All published lines/services; train categories, originating vs through, AC scarcity, platform transfer, train bunching, cancellation cascades, crowded period patterns.
- Verified indicators only: AC vs other class, direction and boarding-station crowd data if actual observations; otherwise generic peak-hour descriptors with `HISTORICAL` or `UNAVAILABLE`.
- Dadar Central-Western transfer and similarly relevant interchanges; correct walk time and egress, avoid fictitious through services.
- **Better**: explain why a fast may arrive later, why less crowded option requires a longer wait and why 2nd class may be optimal for some passengers.

### C8 — Crowding [P1]
- Hour/direction/station-based crowd estimates, disruptions and bunching effects, user-reported crowd classes, confidence, moderation, time validity.
- Avoid exact coach-level counts or color-coded factual levels with no source. Accessibility and comfort choices are preferences not gendered or elitist defaults.
- **Better**: explain prediction limits and show how crowding changes across boarding stations.

### C9 — Station and coach navigation [P1]
- Station exits, facilities, toilets, lifts, accessible routes, platforms when verified, coach position orientation, guidance to transfer and train doors.
- Crowdsourced changes remain `REPORTED`, not official verified; accessible paths require verification rather than assumed lifts.
- **Better**: actionable platform/walking transfer directions and contingency when platform source unavailable.

### C10 — Maps and trip tracking [P0 simple; P1 richer]
- Timetable diagram as baseline; MapLibre or Leaflet for rail network/stop maps with attribution.
- Live train marker only from authorized observed coordinates; otherwise visually distinct **SIMULATED POSITION** and stop-progress status, never 'GPS'.
- Station timeline synchronized with train progress; last observed update and source indicator; optional coach and platform diagrams.
- **Better**: correct, understandable timelines rather than false precision on animated maps.

### C11 — Notifications and personalized commutes [P1]
- Saved home-work/college routes, station aliases, preferred ticket class, depart/arrive deadlines, favorite trains, calendar-independent reminders.
- Event-driven deduped alerts for departure, cancellation, disruption, platform changes and missed-connection warnings where verified; consent and quiet preferences.
- **Better**: notify of changes that alter the passenger's best decision, not every tiny delay.

### C12 — Multilingual, accessibility, speed & offline [P0/P1]
- Responsive mobile-first website and PWA, accessible fonts/contrast, keyboard/screen-reader focus management, low-data conditions, light/dark and configurable theme.
- English, Hindi, Marathi with station code normalization; fallback transliteration and speech recognition confidence checks.
- One-tap saved commute, cached valid timetable, saved DEMO tickets, explicit stale data timestamps, app update notice, no ad blockers/interstitials.
- **Better**: a commuter can see departure/arrival information in one to two clear interactions; app still distinguishes old information when offline.

### C13 — RailSathi voice AI [P0 browser and in-app demo; P2 actual phone]
- Dograh orchestration through browser microphone and phone-style in-app UI, same backend; optional actual telephone provider only if suitable and permitted in India with known costs.
- Tool contracts for `search_stations`, `search_journeys`, `explain_delay`, `check_eligibility`, `quote_demo_fare`, `get_booking_demo_status`, `draft_demo_booking`, `confirm_demo_action`, `create_support_demo`.
- LLM may paraphrase verified tool results only. Never infer unsupplied fares/train number/ticket availability. Ask to resolve station ambiguity, language, boarding station and booking confirmation.
- **Better**: voice and manual workflows return identical deterministic decisions and cannot directly bypass rules.

### C14 — Other railway app breadth [P1/P2]
- PNR display & waitlist explanations when authorized, class/seat alternatives, Tatkal-related informational eligibility (no automated bot), train compositions, platform station boards.
- Food/e-catering, lost-and-found, grievance, support history, emergency contacts, journey sharing with consent, last-mile BEST/TMT/Metro/taxi, optional ticket wallet and pass reminders.
- Show real integrations only when permitted; otherwise clearly labeled UI concepts, not clickable fake functional flows.
- **Better**: the user can act on the journey with fewer external app switches, while keeping each provider's legal permissions intact.

### C15 — Engineering quality and security [P0]
- API contracts versioned, deterministic rules engine, modular adapters, typed server validation, server-side input sanitization, secure storage and no hardcoded keys.
- Cache strategy by status: short TTL for authorized observations, longer for schedules, immutable demo fixtures; no fake real-time caching.
- Accessibility tests, E2E fixtures for successful/failure flows; performance and large timetable tests; telemetry without secrets, PII minimization and sensible rate limits.
- **Better**: a working app that survives ambiguous outcomes and data outages, not attractive dead-end controls.

### C16 — Evaluation dashboard and demo [P0]
- Demo scenario selector: normal day, late origin, delay accumulation, wrong/stale location, canceled train, crowd peak, disrupted interchange, missed train, login expiration, payment timeout/double tap.
- Internal data-status panel: source, latest observation, freshness, fallback reason, data coverage, validation errors.
- Demo judges can toggle conditions deterministically to reproduce recommendations; show provenance and before/after journey comparisons.
- **Better**: transparent, independently testable behavior rather than hardcoded storytelling.

## D. Existing 14 repositories: exact identifiers and safe usage

**Classification is a recommendation from repo documentation, NOT proof of installed E2E function. No repository is automatically approved for code incorporation.**

| Repository | Decision | Why / implementation boundary |
| --- | --- | --- |
| https://github.com/YashPrime-02/IRCTC-IMPROVISED-CLONE | REFERENCE | Understand booking flows, PDF/QR samples; Angular transplant into React not justified; check license |
| https://github.com/prasenjit-27/Indian-Railway-Data | DATA CANDIDATE | Claimed 8,990 stations, 5,208 trains, one-commit snapshot: verify provenance and schedule accuracy |
| https://github.com/datameet/railways | REFERENCE / DATA CANDIDATE | CC0, historically useful, outdated for live/current timetables |
| https://github.com/akmsy/train-tracker | REFERENCE | WebSocket/Leaflet animation; simulated GPS is not live; license uncertain |
| https://github.com/dograh-hq/dograh | HIGH-PRIORITY CANDIDATE | BSD-2-Clause, self-hosted voice tooling and provider integration; validate India/costs |
| https://github.com/himrd95/train-search-app | REFERENCE | UI/autocomplete, no verified reliable current live endpoint |
| https://github.com/The15thSin/RailEase-Train-Reservation-App | REFERENCE ONLY | GPL-3.0 license obligations; no code copying by default |
| https://github.com/shwetankg07/railpull | WITHHOLD DATA COLLECTION | MIT code, unofficial NTES reverse-engineered client; only study GTFS/adapter design without authorization |
| https://github.com/ClaudeMaxUser/rail-info | WITHHOLD DATA COLLECTION | Non-production warnings and fragile unofficial providers; architecture reference |
| https://github.com/R-Gaurav/train-delay-estimation | RESEARCH | Old delay-model example, GPL implications, datasets unproven for production |
| https://github.com/MaVasil/traineta | REFERENCE | ETA/GIS visualization, simulated tracking |
| https://github.com/omkarspace/MapMyTrain | WITHHOLD | NTES collection and open-core/proprietary scope questions |
| https://github.com/abhijitnath02/Railpulse-SIS-Hackathon-2026 | EXPERIMENTAL | ETA/dashboard ideas, synthetic and historical modelling need independent validation |
| https://github.com/Rajveerbairagi/TrainRadar | REFERENCE | Radar map/UI and external RapidAPI dependency, uncertain license/use |

## E. Targeted additional repositories (only integrate for a measured gap)

| Repo | Purpose and choice |
| --- | --- |
| https://github.com/motis-project/motis | MIT transit routing, GTFS/GTFS-RT; choose only if suitable Indian timetable GTFS exists and benefits outweigh deployment overhead |
| https://github.com/opentripplanner/OpenTripPlanner | Alternative to MOTIS, NOT complementary dependency by default; license/deployment review first |
| https://github.com/MobilityData/gtfs-validator | Apache-2.0 canonical static GTFS validation: high-priority tooling |
| https://github.com/google/transit | GTFS / GTFS-RT FORMAT SPECS, not a source of railway feeds |
| https://github.com/maplibre/maplibre-gl-js | BSD-3-Clause map view if geographic visualization genuinely improves journey experience |
| https://github.com/Leaflet/Leaflet | Lightweight map alternative; not alongside MapLibre by default |
| https://github.com/shadcn-ui/ui | MIT accessible React UI parts if exported stack compatible |
| https://github.com/nextlevelbuilder/ui-ux-pro-max-skill | MIT design skill for Antigravity; inspect installed skills and avoid reinstall |
| https://github.com/TanStack/query | MIT React API cache/freshness/retry tooling if React |
| https://github.com/statelyai/xstate | MIT deterministic booking and workflow state machines if complexity warrants |
| https://github.com/vite-pwa/vite-plugin-pwa | MIT installable offline PWA if Vite |
| https://github.com/microsoft/playwright | Browser E2E tests |
| https://github.com/valhalla/valhalla | Optional routing for first/last-mile walks if needed |
| https://github.com/shwetankg07/RailRaag | Railway animation concept, not actual GPS |
| https://github.com/Vivek-Biswal/SIH_ETA | Research only until dataset/provenance/calibration independently verified |

**Import/selection protocol**: exact URL + revision + license + security/dependencies + India relevancy + fit with stack + canonical source conflict + minimal spike + E2E tests + costs. Mark `INTEGRATE / REFERENCE / EXPERIMENT / WITHHOLD / REJECT`. No cloning every repo as a default. Every reused code file must be attributed and license-compliant.

## F. Data contracts and architecture

Suggested modules: `catalog` (station/service identity), `schedule` (stops/calendars), `railway-rules` (class/product/segment eligibility), `feed-adapters` (authorized observations), `route-engine` (time-dependent legs), `replanner` (current context), `fare-demo`, `booking-demo` (idempotent state), `voice-tools`, `support-demo`, `provenance`, `api`, `frontend` and `tests`.

Canonical service fields: `train_id`, `operator`, `service_date`, `origin_station`, `scheduled_stop_sequence`, `service_days`, `train_class_catalog`, `service_type`, `stop_boarding_permissions`, `source_provenance`.
Journey fields: `journey_id`, `legs[]`, `boarding/alighting station`, `platform_if_verified`, `scheduled/observed/predicted times`, `transfer_walk`, `ticket_class`, `eligibility_reasons`, `ranking_explanation`, `source_status`, `fallback_reason`.

Source quality labels: `LIVE_VERIFIED`, `SCHEDULED`, `HISTORICAL`, `PREDICTED`, `REPORTED`, `DEMO`, `UNKNOWN`. All source objects carry `source_id`, `observed_at`, `fetched_at`, `expires_at` and `service_date` when appropriate. `LIVE_VERIFIED` requires evidence of authorized observed data. `UNKNOWN` must not silently become on-time.

Consider simulation toggle only in a top-level clearly visibly marked DEMO environment; users cannot mistake its outcomes for genuine Indian Railways status.

## G. Critical acceptance cases

1. Thane -> Churchgate via Dadar, arrive by 12:30, compare class/transfer choices; accurate line change and destination.
2. Dadar -> Kalyan, exclude Express lacking stop or valid passenger ticket on segment.
3. Delayed fast vs valid slow: recalculate arrival, choose correct completion time.
4. Origin delay +20 becomes +40 downstream (demo fixture): don't project flat delay.
5. AC local scarce; never suggest phantom AC local; show second and first objectively.
6. Cancelled transfer: alternative route using only valid operating services.
7. Onboard passenger: alternatives from actual next stopping stations, not past ones.
8. Late-night train originating yesterday, boarding today: correct service_date and offsets.
9. Feed outage: explicit stale/unknown, schedule still accessible without live claim.
10. Payment duplicate tap + ambiguous response in demo: idempotent order and reconciliation.
11. Ticket confirmed demo but hidden in initial list: consistent state after reload; prevent repurchase.
12. Coupon/refund demo: exact cash, wallet and voucher types with visible conditions.
13. An inaccurate stop/coach/platform report does not become verified automatically.
14. Hindi/Marathi station spellings resolve or ask disambiguation; no fabricated stop.
15. Same RailSathi voice and manual search: exact same eligibility, routes and demo booking outputs.
16. Offline mode shows cached data and valid test specimen ticket, with stale warning.
17. Fake API/unknown provider: safe failure, no hardcoded fictitious fallback called live.
18. Mobile screen-size, dark/light, keyboard navigation, reduced-motion and loading tests.

## H. ANTIGRAVITY MASTER PROMPT (paste after exporting Google AI Studio project)

You are lead full-stack engineer, railway domain/data auditor, accessibility designer, and red-team test engineer for RAILONE NEXT 2.0. This repo is an **unofficial educational demonstration**, not affiliated with Indian Railways. Read this entire file before changes.

GOAL: Make the existing Google AI Studio export materially better: correct end-to-end railway journey logic, robust demo booking, legible Mumbai and India coverage, delay/disruption-aware recomputation, a credible responsive website + PWA, and RailSathi voice with deterministic backend tools. Preserve current functionality; inspect code and dependencies first. Do not replace the app blindly.

BEGIN WITH BASELINE:
- Inspect tree, git status, package manifests, versions, env vars (report names not secret values), build scripts, current pages, API handlers, database, mock data, routing code and existing failures.
- Save a reversible baseline commit/branch. Report where generated/hardcoded sample data masquerades as live.
- Make a feature-by-feature audit `REQUIREMENTS_TRACEABILITY.md` against C1–C16 and identify missing, partially implemented, fake/nonworking controls.
- Write `SOURCE_AND_REPOSITORY_AUDIT.md`: classify 14 prior candidates and all targeted new ones from D/E with exact repo, revision, license, maintenance/dependencies and risk. Prioritize integration ONLY where measured advantage exists.

DATA:
- Create canonical train/station/timetable/service_date schema, aliases, valid stop sequences, operating calendars, class/ticket-product offerings, boarding/alighting restrictions, provenance and explicit status labels.
- DataMeet and Indian Railway Data may be used for licensed/validated *reference* and demo fixtures; never label historical or unverified snapshots as current.
- Use ONLY documented authorized live feeds. NTES/CRIS, Yatri and other proprietary live feeds are NOT established as open APIs. Never run `railpull`, `rail-info` or MapMyTrain data collection to bypass permission checks. If permission unknown, mark unavailable and provide coherent simulated disruption fixtures with DEMO labels.
- If valid GTFS inputs exist, validate with MobilityData/gtfs-validator and evaluate MOTIS OR OpenTripPlanner; avoid a complex engine if smaller deterministic route graph proves better.

WORKING PRODUCT:
- Complete C1–C3, C5–C7, C10–C13 basic and C15–C16. Implement accurate Thane-Dadar-Churchgate and additional Mumbai/national cases before extending coverage.
- Make search return complete train-and-transfer journeys, service-date aware, with eligible stops/classes, meaningful walking buffers, arrival deadlines, no fake prices/seats and transparent ranking.
- Implement context-sensitive replanning: at home, at station or already onboard; delayed fast vs slow; cancellation/megablock; delayed-origin progression. Refuse impossible Express short-hop alternatives.
- Build booking-demo transaction state machine, idempotent order creation and pending reconciliation behavior. Ensure tickets always say DEMO / NOT VALID FOR TRAVEL; no real payment and no real railway PNR.
- Build accessible, fast, responsive website/PWA, saved commute, search, results, tracking, booking-demo, saved tickets, station info, disruption, RailSathi and support-demo pages. All click targets must work or be intentionally disabled with honest explanation. Configurable colors, light/dark, multilingual UI, offline stale-data indicators.
- Integrate Dograh only after verifying license/stack/tool schema, self-hosting and budget. Browser mic and in-app dialer first; optional telephone network not assumed available or free. Voice tools invoke EXACT same deterministic service functions as manual UI.

TESTING AND INTEGRATION:
- Add deterministic fixtures and E2E tests covering 18 acceptance cases in G. Validate no false live labels or simulated official issuance.
- Unit tests for dates, midnight, transfer eligibility and boarding restrictions; component tests for session failure, loading and errors; Playwright mobile/desktop E2E. Security/accessibility checks.
- Prioritize performance and correctness. Avoid duplicate libraries, incompatible GPL copying, speculative APIs, unlicensed assets, expensive paid services and new subscriptions.
- For each finished module, show test commands/pass-fail counts, real provider evidence or DEMO proof, schema/source lineage, exact third-party files/code used. Integrate in owned repo, commit and push after local passing tests and existing branch/CI restrictions.

DELIVER: working and locally testable code; audit markdown, source manifest, route/demo scenarios, setup README, limitations, screenshots/tests and verified Git commit(s). Do not claim everything complete without evidence. Unresolved items must be `WITHHELD` with a reproducible reason. Work incrementally and prioritize functional P0 before visual flourish.

## I. SECOND PROMPT FOR CLAUDE (after Antigravity initial implementation)

Perform independent adversarial audit of current RailOne Next branch. Ignore optimistic completion statements and inspect actual code and tests. Independently re-run all 18 scenarios and verify no fabricated live feeds; classify findings `VERIFIED / DISPUTED / WITHHELD / REJECTED / EXPERIMENTAL`. Evaluate source permissions, service calendars, fast/slow/AC routing, short-hop Express eligibility, station transfer realism, +20 to +40 delay progression, at-home/station/onboard context, duplicate mock booking safety, source freshness, voice/manual parity, offline state and every interactive UI path. Fix reproducible P0 problems in small commits; do not substitute repo README assertions for tests or reuse unsupported data. Report unresolved live access and historical delay limitations candidly. Record code licenses, run tests, and push only proven locally passing work to canonical repo under current CI/branch rules. Reuse installed skills instead of reinstalling them. Avoid token-heavy commentary; concise evidence-led progress updates.

## J. DELIVERY GATES

Gate 0: Repo inventory and baseline compile/test. Gate 1: Station/train calendar identity and provenance correct. Gate 2: 18 critical journeys/edge cases pass deterministically. Gate 3: Demo booking state and voice/manual function parity. Gate 4: Responsive/PWA accessibility and offline behavior. Gate 5: independently checked source rights/licensing and updated evidence reports. Gate 6: local tests and commit/push verification. P1 prediction, crowd, facilities, advanced animation and P2 telephone must not block functional P0.

**Reference links**: Full original set and new repositories are listed in D and E, public review anchors in B. This report contains research and proposed instructions, not execution results. It does not assert that the current exported application has already integrated any component.
