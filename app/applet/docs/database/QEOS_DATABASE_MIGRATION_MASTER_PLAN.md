# QEOS Database Migration Master Plan

**Date:** 2026-07-24
**Status:** PLANNING PHASE (Execution Locked)

## Executive Summary
This document provides a comprehensive strategy for migrating the legacy "Al-Dhibani Store" database (single-tenant, offline-first) to the target QEOS architecture (multi-tenant, B2B SaaS). The transition addresses fundamental structural incompatibilities without compromising historical data integrity.

---

## 1. Existing Table Classification

| Legacy Table | Action | Rationale |
| :--- | :--- | :--- |
| `aldhibani_config` | **Archive / Deprecate** | Single-row configuration does not fit a multi-tenant SaaS. Store settings will be managed via the `organizations` and `branches` tables. |
| `aldhibani_categories` | **Replace** | A flat taxonomy. Will be replaced by a tenant-aware category structure linked to `organization_id`. |
| `aldhibani_products` | **Replace / Merge** | Contains both product definition and inventory levels. Needs to be split into multi-tenant `products` (catalog) and `inventory_items` (branch-specific stock). |
| `aldhibani_orders` | **Replace / Merge** | Mixes order, invoice, and payment logic. Will be decomposed into `sales_orders`, `sales_invoices`, and `payments`. |
| `aldhibani_debts` | **Archive / Keep modified** | Credit ledgers are critical. Needs tenant scoping. Will be migrated into a formalized Accounts Receivable (AR) module. |
| `staff_users` | **Replace / Merge** | Flattens identity, auth, and employment. Will be decomposed into IAM (`users`, `credentials`, `roles`) and `staff`. |
| `aldhibani_money_boxes` | **Archive** | Physical register abstraction. Will be replaced by a formalized financial accounts module. |
| `aldhibani_youth_workforce` | **Archive** | Commission/shift tracking. Will be migrated to future HR/Payroll modules scoped by tenant. |

---

## 2. Missing QEOS Tables (To Be Created)

| Table | Purpose | Dependencies | Tenant Scope | Criticality |
| :--- | :--- | :--- | :--- | :--- |
| `organizations` | Root tenant entity. | None | Global | **CRITICAL** |
| `branches` | Physical store/location abstraction. | `organizations` | Org | **CRITICAL** |
| `users` | Identity management. | `organizations` | Org | **CRITICAL** |
| `credentials` | Secure authentication. | `users` | Org | High |
| `sessions` | Active sessions. | `users` | Org | High |
| `roles` & `permissions` | RBAC definitions. | `organizations` | Org | **CRITICAL** |
| `user_roles` & `role_permissions` | RBAC assignments. | `users`, `roles`, `permissions` | Org | **CRITICAL** |
| `staff` | Employment and branch assignment. | `organizations`, `branches`, `users` | Org/Branch | High |
| `suppliers` | Vendor management. | `organizations` | Org | High |
| `products` | Global product catalog. | `organizations` | Org | **CRITICAL** |
| `inventory_items` | Stock per branch. | `organizations`, `branches`, `products` | Org/Branch | **CRITICAL** |
| `stock_movements` | Audit trail for stock. | `inventory_items`, `users` | Org/Branch | High |
| `purchase_orders` | Procurement initiation. | `organizations`, `branches`, `suppliers` | Org/Branch | Medium |
| `goods_receipts` | Receiving workflow. | `purchase_orders` | Org/Branch | Medium |
| `purchase_invoices` | AP workflow. | `purchase_orders` | Org/Branch | Medium |
| `sales_orders` | Customer intent. | `organizations`, `branches` | Org/Branch | **CRITICAL** |
| `sales_invoices` | AR workflow. | `sales_orders` | Org/Branch | **CRITICAL** |
| `payments` & `receipts` | Financial settlements. | `sales_invoices`, `purchase_invoices` | Org | **CRITICAL** |

---

## 3. Conflict Analysis

### Conflict A: Missing Multi-Tenant Isolation
- **Current:** No `organization_id` or `branch_id`.
- **Required:** Every table (except `organizations`) must include `organization_id` for RLS. Most operational tables require `branch_id`.
- **Risk:** Extreme cross-tenant data leakage if legacy tables are adapted in place.
- **Impact:** Mandates creating a new schema rather than altering existing tables.

### Conflict B: `aldhibani_products` (Monolith) vs `products` & `inventory_items` (Normalized)
- **Current:** Single table holding catalog data (names, descriptions) and volatile stock data.
- **Required:** Strict separation between Catalog (`products`) and Stock (`inventory_items`).
- **Risk:** ETL logic must duplicate/split rows safely.
- **Impact:** Application must change how it queries "available products."

### Conflict C: `staff_users` vs IAM + Staff
- **Current:** One row per employee holding passwords, raw JSON permissions, and employment status.
- **Required:** Separation of Identity (`users`), Security (`credentials`, `roles`, `permissions`), and Employment (`staff`).
- **Risk:** High complexity in mapping legacy JSON permissions to QEOS RBAC.
- **Impact:** All authentication mechanisms must point to the new IAM tables.

---

## 4. Migration Dependency Graph

The deployment and ETL sequence MUST follow this topological order:

1. **Layer 1: Tenancy (Root)**
   `organizations` -> `branches`
2. **Layer 2: Identity & Access Management (IAM)**
   `users` -> `credentials`, `roles`, `permissions` -> `user_roles`, `role_permissions` -> `staff`
3. **Layer 3: Trading Partners**
   `suppliers` -> (Future: Customers)
4. **Layer 4: Catalog & Assets**
   `products` -> `inventory_items` -> `stock_movements`
5. **Layer 5: Operations (Purchasing & Sales)**
   `purchase_orders` -> `goods_receipts` -> `purchase_invoices`
   `sales_orders` -> `sales_invoices`
6. **Layer 6: Financials**
   `payments` -> `receipts`

---

## 5. Data Preservation Strategy

**Guiding Principle:** Zero destructive operations on legacy tables (`aldhibani_*`).

1. **Side-by-Side Schema:** Create the new QEOS tables alongside the legacy tables.
2. **Seed Default Tenant:** Create an `Organization` named "Al-Dhibani VIP" and a primary `Branch`.
3. **ETL Pipelines:** Run background ETL (Extract, Transform, Load) scripts that read from `aldhibani_*`, transform the shape to fit QEOS (injecting the seeded `organization_id` and `branch_id`), and write to the new tables.
4. **Dual Write (Optional):** If the migration takes time, implement dual-write at the application layer to keep both schemas in sync during the transition.
5. **Read-Only Archival:** Once the new schema is verified, the legacy tables will be kept as read-only historical archives.

---

## 6. Risk Assessment

| Phase | Action | Risk Level | Recovery Strategy / Rollback |
| :--- | :--- | :--- | :--- |
| **1. Schema Deployment** | `CREATE TABLE` for new QEOS schema. | Low | `DROP TABLE` on new tables. No impact on legacy. |
| **2. Initial ETL Sync** | Copying data from legacy to new tables. | Medium | Truncate new tables. Fix ETL script. Retry. |
| **3. RBAC Mapping** | Translating JSON permissions to Roles. | High | Manually correct seeded Roles. Re-run IAM ETL. |
| **4. App Switch-Over** | Pointing repositories to use new tables. | High | Revert application deployment to previous commit. |

---

## 7. Final Recommendation

**Decision: Create a clean QEOS schema beside the legacy schema.**

**Reasoning:**
Evolving the existing `aldhibani_*` tables into the QEOS architecture is mathematically and structurally flawed. The existing database is a flattened, single-tenant monolith. Attempting to run `ALTER TABLE` to inject multi-tenant columns, split data (e.g., separating inventory from products), and enforce strict foreign keys on live, unstructured legacy data introduces severe risks of downtime and data loss.

By creating a **clean, parallel QEOS schema**, we achieve:
1. **Zero downtime** for the legacy application during migration.
2. **Zero risk of data loss**, as original tables are strictly read-only during ETL.
3. **Perfect adherence** to the new B2B SaaS Domain-Driven Design constraints.
4. An isolated environment to thoroughly test RLS (Row Level Security) and tenant isolation before switching live traffic.
