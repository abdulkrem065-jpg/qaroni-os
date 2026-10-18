# QEOS Golden Source Report

**Authorization ID:** QEOS-AUTH-0062
**Status:** 🟢 GOLDEN SOURCE IDENTIFIED
**Date:** 2026-07-25

## Executive Summary
A comprehensive scan of the local workspace (the "Golden Source") was performed and compared against the official GitHub remote (`qaroni-os`). Due to severe Git metadata corruption in the local environment, a massive divergence exists. The local workspace contains the true, authorized state of the QEOS architecture, database foundation, and application source code. The GitHub remote is dangerously obsolete and contains a deeply nested, deprecated directory structure (`app/applet/src/`).

---

## A. Files Missing from GitHub (Untracked Locally)

### Database
*   `supabase/migrations/20260724000000_qeos_foundation.sql` (Critical Schema)

### Source Code (Normalized to project root `src/`)
*   `src/api/*` (Controllers, Middlewares, Routing, API Foundation)
*   `src/application/*` (Use Cases, Composition Root)
*   `src/domain/*` (Aggregates, Value Objects, Domain Interfaces, Events)
*   `src/infrastructure/*` (Supabase Adapters, Persistence Layer, Repositories)
*   `src/kernel/*` (DI, Config, Logger, EventBus, Security Middlewares)

### Documentation & Reports
*   `docs/database/QEOS_DATABASE_FOUNDATION_IMPLEMENTATION_REPORT.md`
*   `docs/database/QEOS_DATABASE_FINAL_VERIFICATION_REPORT.md`
*   `docs/database/QEOS_DEPLOYMENT_SNAPSHOT.md`
*   `docs/database/QEOS_DATABASE_DEPLOYMENT_REPORT.md`
*   `docs/security/QEOS_PRODUCTION_READINESS_REVIEW.md`
*   `docs/architecture/QEOS_CONTINUITY_AUDIT.md`
*   `docs/architecture/QEOS_REPOSITORY_REBIND_REPORT.md`
*   `docs/architecture/QEOS_GIT_INTEGRATION_AUDIT.md`
*   `docs/architecture/QEOS_WORKSPACE_RECOVERY_REPORT.md`
*   `docs/business/*`
*   `docs/implementation/*`
*   `docs/verification/*`

### Tests
*   `tests/*` (Unit and Integration test suites)

---

## B. Files Newer Than GitHub (Modified Locally)

### Configuration
*   `package.json` (Updated dependencies and runtime configurations)

### Reports (Legacy Audits updated during repository rename scrub)
*   `docs/archive/legacy/reports/Package_File_Comparison_Report.md`
*   `docs/archive/legacy/reports/Project_Root_Migration_Report.md`
*   `docs/archive/legacy/reports/Recovered_Structure_Precheck_Report.md`
*   `docs/archive/legacy/reports/Workspace_Normalization_Report.md`
*   `docs/archive/legacy/reports/Workspace_Root_Restoration_Report.md`

### Source Code
*   `qaroni-engine/protocols/AuditProtocol.md`

---

## C. Critical Files That MUST Be Preserved

1.  **The Database Foundation:** `supabase/migrations/20260724000000_qeos_foundation.sql`. This file represents the absolute truth of the parallel database architecture.
2.  **The Normalized Source Tree:** The entire `src/` directory at the project root. This represents the successful extraction and clean architecture formatting of the platform layers (Domain, Application, Infrastructure, API, Kernel).
3.  **Governance Checkpoints:** All reports in `docs/database/`, `docs/security/`, and `docs/architecture/` that authorize the current deployment and security state.
4.  **Project Configuration:** The modified `package.json`.

---

## D. Recommended Export Order

To safely recover the Golden Source into a fresh, uncorrupted Git workspace, the following manual/scripted extraction sequence is recommended:

1.  **Extract Database:** Copy `supabase/` to preserve the migration state.
2.  **Extract Application:** Copy `src/` and `tests/` to preserve the normalized application code.
3.  **Extract Governance:** Copy the entire `docs/` directory to preserve all architectural ADRs, reports, and continuity files.
4.  **Extract Configuration:** Copy root configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`, etc.).
5.  **Initialize Clean Workspace:** Move these extracted assets into a newly initialized, clean Git repository targeting `qaroni-os`.
6.  **Purge Legacy:** Explicitly delete the deprecated `app/applet/src/` structure in the new repository before committing the recovered `src/` structure to ensure the remote matches the Golden Source precisely.

---

## E. Estimated Recovery Size
*   **Database Migrations:** ~1 file (13KB)
*   **Source Code (`src/` & `tests/`):** ~100+ files (~350KB)
*   **Documentation & Reports:** ~50+ files (~200KB)
*   **Configuration:** ~10 files (~25KB)
*   **Total Estimated Export Size:** ~600KB (Excluding `node_modules`, `.git`, and environment variables).

---
**AWAITING EXPLICIT HUMAN AUTHORIZATION FOR GOLDEN SOURCE EXTRACTION.**
