# QEOS Database Hardening Audit

## 1. Repository Matrix

| Domain Module | Repository Interface | Infrastructure Implementation | Status |
|---------------|----------------------|--------------------------------|--------|
| IAM | ICredentialRepository | SupabaseCredentialRepository | ✅ |
| IAM | IPermissionRepository | SupabasePermissionRepository | ✅ |
| IAM | IRoleRepository | SupabaseRoleRepository | ✅ |
| IAM | ISessionRepository | SupabaseSessionRepository | ✅ |
| IAM | IUserRepository | SupabaseUserRepository | ✅ |
| Inventory | IInventoryRepository | SupabaseInventoryRepository | ✅ |
| Inventory | IProductRepository | SupabaseProductRepository | ✅ |
| Inventory | IStockMovementRepository | SupabaseStockMovementRepository | ✅ |
| Organization | IBranchRepository | SupabaseBranchRepository | ✅ |
| Organization | IOrganizationRepository | SupabaseOrganizationRepository | ✅ |
| Purchasing | IGoodsReceiptRepository | SupabaseGoodsReceiptRepository | ✅ |
| Purchasing | IPurchaseInvoiceRepository | SupabasePurchaseInvoiceRepository | ✅ |
| Purchasing | IPurchaseOrderRepository | SupabasePurchaseOrderRepository | ✅ |
| Sales | IPaymentRepository | SupabasePaymentRepository | ✅ |
| Sales | IReceiptRepository | SupabaseReceiptRepository | ✅ |
| Sales | ISalesInvoiceRepository | SupabaseSalesInvoiceRepository | ✅ |
| Sales | ISalesOrderRepository | SupabaseSalesOrderRepository | ✅ |
| Staff | IStaffRepository | SupabaseStaffRepository | ✅ |
| Supplier | ISupplierRepository | SupabaseSupplierRepository | ✅ |

**Findings:** 100% Repository Coverage. No missing implementations. No in-memory repositories remain.

## 2. Schema Audit

**Status:** ⚠️ PHYSICAL SCHEMA MISSING
The logical schema exists inside the `Supabase*Repository` mappers, but the physical PostgreSQL/Supabase schema (`CREATE TABLE` definitions, migrations) is absent from the codebase.

| Business Table | Fields Mapped in Repositories | Implicit Relationships |
|----------------|-------------------------------|------------------------|
| `organizations` | `id`, `name`, `status`, `created_at`, `updated_at` | |
| `branches` | `id`, `organization_id`, `name`, `status`, `address_line1`, `address_line2`, `city`, `state`, `zip_code`, `country`, `timezone`, `currency`, `created_at`, `updated_at` | Belongs to `organizations` |
| `users` | `id`, `organization_id`, `email`, `username`, `first_name`, `last_name`, `is_activated` | Belongs to `organizations` |
| `roles` | `id`, `organization_id`, `name`, `description` | Belongs to `organizations` |
| `permissions` | `id`, `organization_id`, `name`, `action`, `resource` | Belongs to `organizations` |
| `user_roles` | `user_id`, `role_id` | Join Table |
| `role_permissions` | `role_id`, `permission_id` | Join Table |
| `credentials` | `id`, `user_id`, `password_hash`, `is_active` | Belongs to `users` |
| `sessions` | `id`, `user_id`, `issued_at`, `expires_at`, `is_revoked` | Belongs to `users` |
| `products` | `id`, `organization_id`, `code`, `name`, `description`, `price`, `cost`, `status`, `created_at`, `updated_at` | Belongs to `organizations` |
| `inventory_items` | `id`, `organization_id`, `branch_id`, `product_id`, `quantity`, `location`, `last_counted_at`, `last_updated_at` | Belongs to `branches`, `products` |
| `stock_movements` | `id`, `inventory_item_id`, `type`, `quantity`, `notes`, `performed_by`, `created_at` | Belongs to `inventory_items` |
| `purchase_orders` | `id`, `organization_id`, `branch_id`, `supplier_id`, `created_by`, `status`, `created_at` | Belongs to `branches`, `suppliers`, `users` |
| `goods_receipts` | `id`, `organization_id`, `branch_id`, `purchase_order_id`, `received_by`, `receipt_date` | Belongs to `purchase_orders` |
| `purchase_invoices` | `id`, `organization_id`, `purchase_order_id`, `invoice_number`, `invoice_date`, `due_date`, `status`, `created_at` | Belongs to `purchase_orders` |
| `suppliers` | `id`, `organization_id`, `code`, `name`, `phone`, `email`, `address`, `tax_number`, `commercial_registration`, `status`, `created_at`, `updated_at` | Belongs to `organizations` |
| `sales_orders` | `id`, `organization_id`, `branch_id`, `customer_id`, `created_by`, `status`, `created_at` | Belongs to `branches` |
| `sales_invoices` | `id`, `organization_id`, `sales_order_id`, `invoice_number`, `invoice_date`, `due_date`, `status`, `created_at` | Belongs to `sales_orders` |
| `payments` | `id`, `organization_id`, `invoice_id`, `amount`, `payment_method`, `reference`, `payment_date` | Belongs to `purchase_invoices` |
| `receipts` | `id`, `organization_id`, `invoice_id`, `amount`, `payment_method`, `reference`, `receipt_date` | Belongs to `sales_invoices` |
| `staff` | `id`, `organization_id`, `branch_id`, `user_id`, `staff_code`, `status`, `created_at`, `updated_at` | Belongs to `branches`, `users` |

## 3. Multi-Tenant Isolation Findings

**CRITICAL VIOLATIONS DETECTED:**

The following business tables are missing `organization_id` mappings in the domain/infrastructure layer, meaning cross-tenant leakage is highly likely if accessed improperly:

1. `stock_movements` - Mapped only to `inventory_item_id`.
2. `credentials` - Mapped only to `user_id`.
3. `sessions` - Mapped only to `user_id`.
4. `user_roles` - Mapped only to `user_id` and `role_id`.
5. `role_permissions` - Mapped only to `role_id` and `permission_id`.

**Recommendation:** Add `organization_id` to ALL business and join tables to ensure RLS can be enforced independently of JOIN operations.

## 4. Row Level Security (RLS) Matrix

**Status:** ❌ MISSING
No physical SQL migrations exist in the codebase. Therefore, RLS is inherently disabled on all tables.

| Table | RLS Enabled | Policies | Security Risk |
|-------|-------------|----------|---------------|
| All Tables | 🔴 NO | 0 | 🔴 EXTREME - Any authenticated (or anon) user could potentially read/write all tenant data without RLS. |

## 5. Foreign Key (FK) Matrix

**Status:** ⚠️ MISSING PHYSICAL DEFINITION
FK constraints are expected between tables, but do not exist in code.

Critical required cascades/restricts to define:
- `user_roles.user_id` -> `users.id` (CASCADE)
- `user_roles.role_id` -> `roles.id` (CASCADE)
- `role_permissions.role_id` -> `roles.id` (CASCADE)
- `role_permissions.permission_id` -> `permissions.id` (CASCADE)
- All aggregate roots -> `organizations.id` (RESTRICT)
- `inventory_items` -> `branches.id` (RESTRICT)

## 6. Index Matrix

**Status:** ❌ MISSING
The following indexes must be created to support multi-tenancy and foreign keys:

- `idx_org_id`: `organization_id` on ALL tables.
- `idx_branch_id`: `branch_id` on applicable tables.
- `idx_supplier_code`: Unique index on `(organization_id, code)` in `suppliers`.
- `idx_supplier_tax`: Unique index on `tax_number` in `suppliers`.
- `idx_product_code`: Unique index on `(organization_id, code)` in `products`.
- All foreign key columns.

## 7. Security Findings

- **Service Role Usage:** Repositories currently accept a standard `SupabaseClient`. RLS is strictly required for the anonymous or authenticated client. Without RLS, the authenticated client has full DB access.
- **Tenant Isolation:** Missing `organization_id` on child tables prevents strict, low-cost RLS checks.
- **Public Exposure:** If deployed without RLS, Supabase Data APIs will expose the entire database to the internet.

## 8. Critical Risks

1. **No Physical Schema:** The app relies on Supabase, but the SQL migrations/schema definition files are missing.
2. **Missing `organization_id`:** Join tables and child tables (like `stock_movements`, `credentials`) lack tenant isolation columns, meaning RLS must perform expensive JOINs or cannot be enforced.
3. **No RLS Defined:** Cannot guarantee tenant data isolation without policies.

## 9. Recommended Fix Order

1. **Domain Update:** Add `OrganizationId` to `StockMovement`, `Credential`, `Session` aggregates and mapping logic.
2. **Infrastructure Update:** Ensure `user_roles` and `role_permissions` upserts include `organization_id`.
3. **Physical Schema Creation:** Write the `schema.sql` defining tables, foreign keys, unique constraints, and indexes.
4. **RLS Implementation:** Add `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and write tenant-isolation policies for ALL tables.
5. **Database Deployment:** Apply the schema to the actual Supabase instance.

## 10. Production Readiness Score

**Score:** 15/100

*Why 15?* The Domain and Infrastructure code mappings exist and are properly architected (SOLID principles, clean architecture). However, the complete lack of physical database definitions, multi-tenant gaps in child tables, and missing RLS policies render the persistence layer entirely unready for production.
