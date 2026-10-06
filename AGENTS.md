# RailOne Next — Project Intelligence & Agent Operating Charter

## 1. Multi-Agent Role & Responsibility Matrix

RailOne Next operates under a unified, conflict-free multi-agent hierarchy combining five specialized toolsets:

| Role / Responsibility | Designated Owner | Core Mandate & Boundaries |
| :--- | :--- | :--- |
| **Primary Orchestrator** | **GSD Core (`open-gsd/gsd-core`)** | Drives project planning, phase loops (Discuss → Plan → Execute → Verify → Ship), context engineering, subagent waves, and session recovery (`.planning/STATE.md`, `.planning/ROADMAP.md`). |
| **Design Guidance Owner** | **UI UX Pro Max (`nextlevelbuilder/ui-ux-pro-max-skill`)** | Directs UI visual design, mobile-first responsive architecture, transit design systems, WCAG 2.1 AA/AAA accessibility, color tokens, typography, and SVG iconography. |
| **Debugging & Test Discipline** | **Superpowers (`obra/superpowers`)** | Enforces strict Test-Driven Development (TDD: failing test first before production code), systematic root-cause debugging, verification before declaring tasks complete, and code review. |
| **Code Minimality & Simplicity** | **Ponytail (`DietrichGebert/ponytail`)** | Instruction-only Senior Dev ladder: YAGNI, standard library first, zero unrequested abstractions or dependencies, shortest working diffs, deleting dead code. |
| **Token Efficiency & Brevity** | **Caveman (`JuliusBrussee/caveman`)** | Answer-first communication, zero fluff/ceremony, preserves 100% technical payload (code, paths, numbers, errors verbatim). |

---

## 2. Conflict Resolution Matrix

When operational guidelines intersect, enforce this deterministic hierarchy:

```
User Explicit Directives > AGENTS.md Charter > GSD Orchestration > Quality Standards (Superpowers / Ponytail / UI UX Pro Max) > Default Behaviors
```

1. **GSD vs Superpowers / Ponytail during execution:**
   - GSD plans and dispatches task waves.
   - When executing an implementation task, Superpowers TDD applies: write the failing test first, verify failure, then write minimal code.
   - When writing the code to pass the test, Ponytail's ladder governs: use stdlib/built-in capabilities, write minimal lines, avoid adding external libraries.
2. **Superpowers vs Ponytail:**
   - Superpowers demands thorough automated test coverage; Ponytail demands avoiding test bloat or heavy unnecessary test frameworks.
   - Resolution: Write real, runnable, focused unit/integration tests that directly assert behavior using native/lightweight test runners (e.g., Node test runner, standard assertions).
3. **Caveman vs Completeness:**
   - Caveman enforces token brevity; it **never** drops technical requirements, security guards, safety bounds, error handlers, or complete code blocks.
   - Status updates are terse and direct; code and architecture remain production-grade.
4. **No Speculative Systems:**
   - Do **NOT** install or configure Goals, Council, or Arena without verified compatibility and explicit approval.
   - Avoid paid services, redundant UI frameworks, and unrequested microservices.

---

## 3. Railway-Source Verification & Integrity Rules

RailOne serves real Indian Railways and Mumbai Suburban passengers. Data integrity is mission-critical:

1. **Zero Data Fabrication:**
   - **NEVER** hallucinate or fabricate real-time trains, PNR status, platform assignments, live delays, track statuses, or ticket availability.
   - If an API or live feed is unavailable or unverified, state it plainly.
2. **Strict Separation of Verified vs Simulated Data:**
   - Any synthetic, mock, or timetable-derived data used during development or offline mode **MUST** be explicitly tagged and surfaced in the UI:
     - Verified Real-Time Feeds: `[VERIFIED LIVE]`
     - Timetable / Fallback Model: `[TIMETABLE SCHEDULE]`
     - Synthetic / Test Datasets: `[SIMULATED DATASET]`
   - Never present simulated delays or artificial crowding estimates as confirmed live telemetry.
3. **Transit Scope & Domain Accuracy:**
   - **Mumbai Suburban Network:** Complete coverage of Western, Central (Main), Harbour, Trans-Harbour, and Uran lines.
   - **Transit Distinctions:** Fast vs. Slow locals, AC vs. Non-AC rakes, 12-car vs. 15-car rakes, Ladies compartments, First Class vs. Second Class.
   - **Interchange & Junction Realities:** Accurate transit transfers at Dadar, Kurla, Kalyan, Thane, Andheri, Bandra with walk times and platform bridge transitions.
   - **National Rail (IRCTC):** Train numbers, origin-destination stations, class codes (1A, 2A, 3A, 3E, SL, CC, 2S), quotas (GN, TQ, PT, LD), delay propagation heuristics.
   - **Crowding Heuristics:** Grounded in historical peak rush directions (morning south/inward toward CST/Churchgate; evening north/outward), labeled transparently as predictive heuristics when not live sensor data.
   - **Voice Features:** Multilingual accessibility (English, Hindi, Marathi) for station search, next-train queries, and platform directions with clear audible feedback.

---

## 4. UI/UX Design Guidance (UI UX Pro Max)

1. **Commuter-First Mobile UX:**
   - Designed for fast scanning while walking or inside packed transit compartments.
   - High text contrast (WCAG AAA/AA, minimum 4.5:1 for body text, 3:1 for large headers).
   - Glanceable layouts: next departure, time remaining, platform number, rake type (AC/Fast) visible in primary viewports.
   - Minimum touch target: 44×44px with at least 8px spacing.
2. **Design Tokens & System:**
   - Palette: High-legibility Indian transit palette (Deep Blue, Signal Green, Caution Amber, Alert Crimson, Crisp Slate).
   - Zero emoji icons: Use crisp SVG icons (Lucide / Heroicons) with appropriate `aria-hidden` or `aria-label`.
   - Typography: Clean geometric grotesque / sans-serif (Inter, Public Sans, Roboto) with robust tabular numerals for departure clocks.
3. **Resilience & Offline Capability:**
   - Commuters pass through cellular dead zones. Timetable lookups, station indexes, and route graphs must work entirely offline using local caches.
   - Graceful degradation with zero blank-screen states.

---

## 5. End-to-End Testing & Verification Procedures

1. **TDD Workflow:**
   - Write failing unit/integration test reproducing bug or verifying feature requirement.
   - Run test and witness expected failure.
   - Implement the simplest, cleanest solution to turn test green.
   - Verify entire test suite passes with zero regressions.
2. **Route Engine Verification:**
   - Graph validation: Ensure route finder handles direct paths, single-transfer paths (e.g. Western to Central via Dadar), circular routes, and terminal reversals.
   - Edge case testing: Late-night/early-morning train gaps, Sunday mega-blocks/jumbo-blocks, cancelled services, terminal stations.
3. **E2E Browser / Device Testing:**
   - Verify layout responsiveness across 375px (mobile), 768px (tablet), and 1280px+ (desktop).
   - Test keyboard navigation, focus trap in search modals, screen-reader announcements for arrival alerts.

---

## 6. Execution & Session Persistence Rules

1. **Continuous Checkpointing:**
   - Update `.planning/STATE.md` at each phase boundary.
   - Save task checkpoints so interrupted sessions can resume instantly without context loss.
2. **No Artificial Constraints:**
   - No rigid daily schedules, arbitrary deadlines, or synthetic token quotas.
   - No unproductive agent debates or circular reviews; make decisions grounded in verifiable requirements.
3. **Repository Discipline:**
   - Atomic, well-documented commits.
   - Keep codebase clean, maintainable, and deployable.
