# RailOne Next — GSD Roadmap & Architecture

## Project Vision
RailOne Next is an unofficial, high-integrity AI-enhanced railway journey decision system for Indian Railways and Mumbai Suburban passengers. It prioritizes actionable commuter decisions over mere ticket booking clones: comparing delays, AC availability, slow vs. fast stopping patterns, crowding heuristics, walking transfer times, leave-home guidance, and strict legal travel eligibility (e.g. Dadar-to-Kalyan Express checks).

## Architecture & Principles
1. **Instruction Charter:** Governed by `AGENTS.md` (GSD Core orchestration, UI UX Pro Max design, Superpowers TDD, Ponytail code minimality, Caveman brevity).
2. **Standard Library First (Ponytail):** Native Node.js 22 built-ins (`node:http`, `node:sqlite`, `node:test`, `node:assert`, `node:crypto`, `node:fs`). Zero bloated third-party dependencies.
3. **Data Integrity:** Strict labeling across all responses and UI views:
   - `[VERIFIED LIVE]`
   - `[TIMETABLE SCHEDULE]`
   - `[SIMULATED DATASET]`
   Never invent live GPS or unverified delays.
4. **Multi-Channel Voice (Dograh):** In-app dialer interface, browser microphone interaction, and deterministic tool-calling backend.

## Phase Execution Waves
- **Wave 1: Core Datasets & Domain Models** (Mumbai Suburban WR/CR/HR/TH + National Rail seed fixtures, station indices, transfer graphs, eligibility rules).
- **Wave 2: Journey Decision Engine & Graph Pathfinder** (Multi-criteria ranking, transfer walks, delay propagation, slow vs fast disruption crossover, leave-home advisor).
- **Wave 3: Eligibility Gate & Specimen Ticketing** (Dadar-to-Kalyan Express rule engine, SQLite specimen wallet, idempotent checkout, refund simulation).
- **Wave 4: Dograh Multi-Channel Voice Assistant** (Deterministic tool-calling agent, in-app phone dialer, multilingual support in EN/HI/MR).
- **Wave 5: Polished Mobile-First Commuter UI** (High-contrast transit theme system, departure boards, SVG transit iconography, accessible keyboard/screen-reader).
- **Wave 6: Automated Verification & GitHub Readiness** (Comprehensive unit & integration test suite, re-entry documentation, git commit history).
