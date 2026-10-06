# RailOne Next 3.0 — Passenger Convenience & Assistance Guide

**Reference Specification**: Section 9 — Passenger Convenience and Assistance  
**Core Implementations**: `AiTasksView.tsx`, `RulesReferenceView.tsx`, `aiService.ts`  
**Date**: October 2026 | **Classification**: Commuter Assistance & Operations Guidance  

---

## 1. Executive Summary

Commuters traveling on Indian Railways encounter dozens of operational friction points beyond looking up departure times: locating coach positions (e.g. Ladies compartments, Divyangjan coaches), filing grievances on RailMadad, checking luggage allowances, finding station cloak rooms, and understanding refund rules.

RailOne Next 3.0 integrates dedicated passenger convenience and operational assistance modules designed specifically for daily commuters and long-distance travelers.

---

## 2. Operations & Assistance Task Catalog

The system categorizes passenger assistance into eight operational domains (`src/types/tasks.ts` & `AiTasksView.tsx`):

1. **RPF Safety & SOS Assistance**:
   - One-tap dialer for Security Helpline 139.
   - Emergency medical assistance locations (One-Rupee clinics at Dadar, Kurla, Thane).
   - Lost & Found property tracking protocols with RPF stations.
2. **Coach Layout & Compartment Alignment**:
   - Mumbai Suburban EMU 12-car and 15-car rake alignment guides.
   - Exact positions of Ladies Compartments (General Ladies vs Ladies First Class).
   - Divyangjan (wheelchair) and Luggage Van coach markers on platform indicators.
3. **Station Amenities & Interchanges**:
   - Lift and escalator availability for senior citizens and persons with disabilities.
   - ATVM ticketing kiosk concourses to bypass long booking window queues.
   - Cloak rooms and IRCTC executive waiting lounges.
4. **Legal Rules & Section 138 Reference**:
   - Central Railway official Monthly Season Ticket (MST) authorized train catalog.
   - Section 138 excess charge rules and penalty tables.
   - Unreserved Second Class travel conditions on intercity services.
5. **RailMadad Educational Grievance Assistant**:
   - Structured drafting assistant for passenger complaints (coach hygiene, electrical issues, catering overcharging).
   - Formats evidence logs and ticket details into clean grievance summaries without exposing sensitive personal data.
6. **Luggage & Excess Baggage Rules**:
   - Free baggage allowances per class (40kg for 2S/SL, 50kg for 3A/CC, 70kg for 1A).
7. **Tatkal & Premium Tatkal Informational Advisories**:
   - Explains opening windows (10:00 AM for AC, 11:00 AM for Non-AC) and dynamic pricing rules.
8. **Intermodal Last-Mile Connectivity**:
   - Direct skywalks and subway connections to Mumbai Metro Line 1 (Andheri) and Metro Line 3 (CSMT), plus municipal bus stations (Thane SATIS deck).
