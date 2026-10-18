# QEOS Golden Repository Reconstruction Plan

**Authorization ID:** QEOS-AUTH-0065
**Status:** 🟢 PLANNING COMPLETE
**Date:** 2026-07-25
**Classification:** Repository Recovery Strategy

## Executive Summary
This document outlines the official strategy to reconstruct the `qaroni-os` GitHub repository using the uncorrupted file assets from the local "Golden Source" workspace. Because the local Git metadata is corrupted, a direct push is impossible. This plan relies on extracting the Golden Source into a secondary clean clone, normalizing the directory structure, and safely pushing the true state to the remote.

## 1. Reconstruction Strategy
**Selected Strategy:** Clean Clone + Overlay (via dedicated reconstruction branch)

**Why this strategy was chosen:**
The local `.git` directory suffers from severe object corruption (`non-monotonic index` and `invalid sha1 pointer`). Attempting to repair and push from this state risks propagating corruption to the remote repository. By utilizing a fresh, clean clone (e.g., in `/tmp/clean_workspace`), checking out a new `recovery/golden-sync` branch, and overlaying the verified Golden Source files on top of it, we guarantee 100% Git metadata integrity while perfectly preserving the Golden Source artifacts. 

## 2. Execution Phases

### Phase A: Repository Normalization
*   **Identify Obsolete Structures:** The legacy structure `app/applet/src/` currently residing in the GitHub remote will be marked for explicit deletion.
*   **Establish New Root:** The canonical root for all domains, infrastructure, and application logic is confirmed as the top-level `src/`.

### Phase B: Recovery Package Extraction
A logical package will be isolated from the Golden Source containing exclusively:
*   `/src/` (Normalized application code)
*   `/supabase/` (Database migration foundation)
*   `/docs/` (Architectural reports, security audits, and ADRs)
*   `/tests/` (Unit and integration suites)
*   Root configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`, etc.)

### Phase C: Overlay & Commit
*   Transfer the Recovery Package into the clean Git clone.
*   Execute structural deletion of obsolete paths (`git rm -rf app/applet/src`).
*   Stage all newly overlayed Golden Source files.
*   Commit with a comprehensive recovery manifest message.

### Phase D: Remote Synchronization
*   Push the reconstruction branch to the `qaroni-os` remote.
*   Verify branch integrity on GitHub.
*   Merge into `main` (Fast-forward or Squash, depending on remote branch protection).

## 3. Conflict Matrix

| Artifact Category | Target Action | Conflict Resolution |
| :--- | :--- | :--- |
| `src/*` (Root) | **PRESERVE** | Overlay golden files; overwrites remote versions. |
| `app/applet/src/*` | **ARCHIVE/DELETE** | Mark as obsolete; explicit `git rm` in clean clone. |
| `supabase/migrations/*` | **PRESERVE** | Overlay golden database foundation. |
| `docs/*` | **PRESERVE** | Overlay golden reports; overwrites outdated remote docs. |
| `tests/*` | **PRESERVE** | Overlay golden test suites. |
| Root Configs (`package.json`) | **PRESERVE** | Overlay golden configs; overwrites remote configs. |

## 4. Risk Matrix

| Risk Category | Severity | Mitigation Strategy |
| :--- | :--- | :--- |
| **Data Loss Risk** | **ZERO** | The original Golden Source workspace is strictly read-only during the extraction phase. |
| **Recovery Risk** | **LOW** | Clean clone isolates the Git database from local corruption. |
| **Merge Risk** | **MEDIUM** | Structural displacement (moving from `app/applet/src` to `src/`) results in massive diffs. Mitigated by using a dedicated reconstruction branch before touching `main`. |

## 5. Estimated Duration
*   **Extraction & Overlay:** ~5 minutes
*   **Git Normalization (Deletions & Staging):** ~5 minutes
*   **Push & Verification:** ~5 minutes
*   **Total Expected Duration:** 15 minutes.

## 6. Rollback Strategy
If the overlay process fails or generates unexpected Git conflicts in the clean clone:
1.  **Local Rollback:** Delete the `/tmp/clean_workspace` entirely. The Golden Source remains untouched.
2.  **Remote Rollback:** If the `recovery/golden-sync` branch was pushed but is invalid, delete the branch from GitHub (`git push origin --delete recovery/golden-sync`).
3.  **State Preservation:** The remote `main` branch is not modified until the final PR/Merge phase, acting as an automatic fallback.

READY_FOR_REPOSITORY_RECONSTRUCTION
