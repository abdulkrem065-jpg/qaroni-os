import re

with open('docs/architecture/QEOS_GOLDEN_REPOSITORY_RECOVERY_MANIFEST.md', 'r') as f:
    content = f.read()

# Update Task 7
new_task_7 = """## Task 7 — Git Recovery Expansion

### Step 1: Secure Clean Clone & Branch Creation
*   **Purpose:** Initialize an uncorrupted remote target and branch.
*   **Inputs:** `git clone` from remote repository, then `git checkout -b recovery/golden-source-sync`.
*   **Outputs:** A pristine branch free of local corruption.
*   **Rollback plan:** Delete the temporary clone directory.
*   **Risk level:** ZERO.

### Step 2: Extract Golden KEEP Artifacts
*   **Purpose:** Extract certified assets from the corrupted workspace without carrying over legacy artifacts.
*   **Inputs:** Direct filesystem copy commands mapped precisely to the KEEP Verification table into the clean clone.
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

### Step 5: Golden Commit & Safe Upstream Synchronization
*   **Purpose:** Formalize the restored repository state without affecting production `main`.
*   **Inputs:** `git commit -m "chore(recovery): Golden Source Restoration"` and push ONLY to `origin recovery/golden-source-sync`.
*   **Outputs:** GitHub remote has the new recovery branch. `main` is untouched.
*   **Rollback plan:** Delete remote branch `git push origin --delete recovery/golden-source-sync`.
*   **Risk level:** LOW.

### Step 6: Workspace Preservation & Verification
*   **Purpose:** Ensure zero data loss by retaining the old workspace until the new one is fully certified.
*   **Inputs:** 
    1. Rename current workspace to `qaroni-os_backup_YYYYMMDD`.
    2. Clone clean repository from remote.
    3. Verify: Build, Tests, Documentation, Migrations, Security.
    4. Generate Verification Report.
*   **Outputs:** A fully verified local setup. The backup is safely preserved.
*   **Rollback plan:** Revert to the `qaroni-os_backup_YYYYMMDD` workspace.
*   **Risk level:** ZERO.

### Step 7: Final Human Authorization & Merge
*   **Purpose:** Safely finalize the recovery.
*   **Inputs:** 
    1. Human Review.
    2. Human Authorization.
    3. Merge `recovery/golden-source-sync` into `main`.
    4. Only AFTER explicit authorization may the backup workspace be removed.
*   **Outputs:** Production `main` is fully certified and restored.
*   **Rollback plan:** Revert merge commit on `main`.
*   **Risk level:** MEDIUM."""

content = re.sub(r'## Task 7 — Git Recovery Expansion.*?## Task 8', new_task_7 + '\n\n## Task 8', content, flags=re.DOTALL)

# Update Task 9
content = re.sub(r'REQUIRES_HUMAN_REVIEW', 'READY_FOR_EXECUTION', content)
content = content.replace('REQUIRES_HUMAN_REVIEW', 'READY_FOR_EXECUTION')

with open('docs/architecture/QEOS_GOLDEN_REPOSITORY_RECOVERY_MANIFEST.md', 'w') as f:
    f.write(content)

with open('docs/architecture/QEOS_GOLDEN_REPOSITORY_RECOVERY_V2_REPORT.md', 'w') as f:
    f.write(content)

print("Updated manifests successfully.")
