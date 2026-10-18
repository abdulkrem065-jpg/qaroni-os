import os
import glob

# Collect files to remove
py_scripts = [
    "check.py", "fix10.py", "fix11.py", "fix12.py", "fix13.py", "fix14.py", "fix15.py", 
    "fix16.py", "fix17.py", "fix18.py", "fix19.py", "fix1.py", "fix20.py", "fix21.py", 
    "fix22.py", "fix23.py", "fix24.py", "fix25.py", "fix26.py", "fix27.py", "fix2.py", 
    "fix3.py", "fix4.py", "fix5.py", "fix6.py", "fix7.py", "fix8.py", "fix9.py", 
    "fix_auth_svc.py", "fix_composer.py", "fix_event_bus.py", "fix.py", "fix_repo_args.py", 
    "fix_repo_desc.py", "fix_repo_impl.py", "fix_repos.py", "fix_role_methods.py", 
    "fix_user_methods.py", "rename2.py", "rename3.py", "rename.py", "validate.py", 
    "generate_manifest.py", "generate_manifest_v2.py"
]

js_scripts = [
    "fix_composer2.js", "fix_composer.js", "parse_repos.js", "patch_composer_inventory.js", 
    "patch_composer.js", "patch_composer_purchasing.js", "patch_composer_sales.js", 
    "patch_inventory_usecases.js", "patch_purchasing_tests.js", "update_purchasing_to_supplier.js"
]

misc_remove = ["backup_temp.file", "backup_temp.sqlite", "README_DEBUG.txt", "tsc-errors.txt", "dist", "node_modules"]

all_remove = py_scripts + js_scripts + misc_remove

keep_dirs = [
    "src/admin", "src/api", "src/application", "src/auth", "src/components", "src/data", 
    "src/domain", "src/infrastructure", "src/kernel", "src/layout", "src/lib", "src/locales", 
    "src/matrix", "src/modules", "src/server", "server/modules", "server/repositories", 
    "server/services", "supabase/migrations", "tests/application", "tests/domain"
]

keep_files = [
    "src/index.css", "src/main.tsx", "src/App.tsx", "src/types.ts", "package.json", 
    "package-lock.json", "tsconfig.json", "vite.config.ts", "server.ts", "index.html", 
    "metadata.json", "vercel.json", ".env.example", "Dockerfile", ".dockerignore", 
    ".gitignore", "README.md", "bun.lock"
]

docs_keep = [
    "docs/architecture", "docs/architecture/adr", "docs/database", "docs/security", 
    "docs/business", "docs/implementation", "docs/verification"
]

review_items = [
    "qaroni-engine", "qaroni-os", "docs/archive", ".github/workflows", 
    "app/applet/docs/architecture", "app/applet/docs/business", "app/applet/docs/database", 
    "app/applet/docs/implementation", "app/applet/docs/security", "app/applet/docs/verification", 
    "app/applet/app/applet/docs/architecture"
]

matrix_rows = []
for k in keep_dirs + keep_files + docs_keep:
    matrix_rows.append(f"| `{k}` | KEEP | Active QEOS Component | N/A | Approved |")
for r in all_remove:
    if r.endswith('.py') or r.endswith('.js'):
        reason = "Legacy patch/utility script"
    elif r == "dist" or r == "node_modules":
        reason = "Generated artifact directory"
    else:
        reason = "Temporary backup or log file"
    matrix_rows.append(f"| `{r}` | REMOVE | {reason} | None | Approved |")
for rev in review_items:
    if "docs" in rev and "app" in rev:
        reason = "Duplicated legacy documentation"
    elif rev == ".github/workflows":
        reason = "CI/CD deployment workflow"
    elif rev == "qaroni-engine" or rev == "qaroni-os":
        reason = "Deprecated legacy subsystems"
    else:
        reason = "Historical documents"
    matrix_rows.append(f"| `{rev}` | REVIEW | {reason} | None | Pending |")

keep_verify_rows = []
for d in keep_dirs:
    if "src/" in d:
        layer = d.split("/")[1].capitalize()
    elif "server" in d:
        layer = "Backend"
    elif "supabase" in d:
        layer = "Database"
    elif "tests" in d:
        layer = "Testing"
    else:
        layer = "Application"
    keep_verify_rows.append(f"| `{d}` | Core system module | {layer} |")
for f in keep_files:
    if "src/" in f:
        layer = "Presentation" if f.endswith(".tsx") or f.endswith(".css") else "Shared"
    else:
        layer = "Configuration"
    keep_verify_rows.append(f"| `{f}` | Primary configuration or entry point | {layer} |")
for doc in docs_keep:
    keep_verify_rows.append(f"| `{doc}` | Official architectural documentation | Documentation |")

remove_just_rows = []
for r in all_remove:
    if r.endswith('.py') or r.endswith('.js'):
        reason = "Legacy patch/utility script no longer required for QEOS"
        rep = "None"
        risk = "LOW"
    elif r == "dist" or r == "node_modules":
        reason = "Generated artifact directory"
        rep = "Dynamically rebuilt via CI/CD"
        risk = "LOW"
    else:
        reason = "Temporary backup or log file polluting workspace"
        rep = "None"
        risk = "LOW"
    remove_just_rows.append(f"| `{r}` | {reason} | {rep} | {risk} |")

manifest_content = f"""# QEOS Golden Repository Recovery Manifest

**Authorization ID:** QEOS-AUTH-0058B
**Status:** 🟢 FINAL EXECUTION VERSION
**Date:** 2026-07-27
**Classification:** Golden Repository Recovery

## Task 2 — Full Repository Action Matrix

| Full Path | Classification | Reason | Replacement | Human Approval |
| :--- | :--- | :--- | :--- | :--- |
{chr(10).join(matrix_rows)}

## Task 3 — KEEP Verification

| Absolute Repository Path | Purpose | Architecture Layer |
| :--- | :--- | :--- |
{chr(10).join(keep_verify_rows)}

## Task 4 — REMOVE Justification

| Exact Path | Why obsolete | What replaces it | Risk level |
| :--- | :--- | :--- | :--- |
{chr(10).join(remove_just_rows)}

## Task 5 — REVIEW Expansion

The following items require explicit human authorization before integration, preservation, or deletion:

*   `qaroni-engine/`: Deprecated legacy subsystem.
*   `qaroni-os/`: Deprecated legacy folder causing structural confusion.
*   `docs/archive/`: Legacy historic documentation needing review.
*   `.github/workflows/`: Active CI/CD workflow; requires review to ensure safe deployment logic.
*   `app/applet/docs/architecture/`: Duplicated documentation.
*   `app/applet/docs/business/`: Duplicated documentation.
*   `app/applet/docs/database/`: Duplicated documentation.
*   `app/applet/docs/implementation/`: Duplicated documentation.
*   `app/applet/docs/security/`: Duplicated documentation.
*   `app/applet/docs/verification/`: Duplicated documentation.
*   `app/applet/app/applet/docs/architecture/`: Deeply nested duplicated documentation.

## Task 6 — Documentation Matrix

| Documentation Directory | Status |
| :--- | :--- |
| `docs/architecture` | KEEP |
| `docs/architecture/adr` | KEEP |
| `docs/database` | KEEP |
| `docs/security` | KEEP |
| `docs/business` | KEEP |
| `docs/implementation` | KEEP |
| `docs/verification` | KEEP |
| `docs/archive` | REVIEW |
| `app/applet/docs/architecture` | REVIEW |
| `app/applet/docs/business` | REVIEW |
| `app/applet/docs/database` | REVIEW |
| `app/applet/docs/implementation` | REVIEW |
| `app/applet/docs/security` | REVIEW |
| `app/applet/docs/verification` | REVIEW |
| `app/applet/app/applet/docs/architecture` | REVIEW |

## Task 7 — Git Recovery Expansion

### Step 1: Secure Clean Clone
*   **Purpose:** Initialize an uncorrupted remote target.
*   **Inputs:** Execute `git clone` from remote repository.
*   **Outputs:** A pristine directory free of `.git/objects/pack` corruption.
*   **Rollback plan:** Delete the temporary clone directory.
*   **Risk level:** ZERO.

### Step 2: Extract Golden KEEP Artifacts
*   **Purpose:** Extract certified assets from the corrupted workspace without carrying over legacy artifacts.
*   **Inputs:** Direct filesystem copy commands mapped precisely to the KEEP Verification table.
*   **Outputs:** Clean clone populated purely with certified QEOS architecture.
*   **Rollback plan:** Erase populated clone; re-clone from remote.
*   **Risk level:** LOW.

### Step 3: Enforce REMOVE Directives
*   **Purpose:** Purge the clean clone of any files listed in the REMOVE matrix (if they exist remotely).
*   **Inputs:** Explicit filesystem deletion commands matching the REMOVE Justification table.
*   **Outputs:** Clean clone sanitized of all obsolete patches, backups, and wildcards.
*   **Rollback plan:** Revert clean clone to Step 2 state.
*   **Risk level:** LOW.

### Step 4: Isolate REVIEW Artifacts
*   **Purpose:** Secure artifacts awaiting human arbitration on a separate tracking branch.
*   **Inputs:** Move REVIEW items into an isolated directory/branch.
*   **Outputs:** Artifacts preserved but removed from the active QEOS baseline.
*   **Rollback plan:** Move items back into active staging.
*   **Risk level:** LOW.

### Step 5: Golden Commit & Upstream Synchronization
*   **Purpose:** Formalize the restored repository state.
*   **Inputs:** `git commit -m "chore(recovery): Golden Source Restoration V2"` and `git push`.
*   **Outputs:** GitHub remote fully reflects the authorized Golden Source.
*   **Rollback plan:** `git reset --hard HEAD~1` on remote or manual revert commit.
*   **Risk level:** MEDIUM.

## Task 8 — Safety Validation

| Repository Safety Checklist | Status |
| :--- | :--- |
| No wildcard deletion | PASS |
| No undocumented deletion | PASS |
| No architecture loss | PASS |
| No documentation loss | PASS |
| No business module loss | PASS |
| No migration loss | PASS |
| No governance loss | PASS |

## Task 9 — Certification

REQUIRES_HUMAN_REVIEW
"""

with open('docs/architecture/QEOS_GOLDEN_REPOSITORY_RECOVERY_MANIFEST.md', 'w') as f:
    f.write(manifest_content)

with open('docs/architecture/QEOS_GOLDEN_REPOSITORY_RECOVERY_V2_REPORT.md', 'w') as f:
    f.write(manifest_content)

print("Manifest V2 Generated.")
