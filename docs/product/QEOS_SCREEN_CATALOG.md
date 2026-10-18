# QEOS Screen Catalog

## Authorization: QEOS-AUTH-0085

## 1. Dashboard
- **Purpose:** High-level executive overview.
- **Actor:** Owner, Manager.
- **Required Data:** KPIs, charts (sales, expenses), alerts.
- **Available Actions:** Date filtering, drill-down to reports.
- **Permissions:** `dashboard:read`

## 2. Point of Sale (POS) Terminal
- **Purpose:** Fast transaction processing.
- **Actor:** Cashier, Manager.
- **Required Data:** Products, barcode scanner input, customer list, cart state.
- **Available Actions:** Add to cart, apply discount, select customer, checkout, void.
- **Permissions:** `sales:create`

## 3. Product Catalog List
- **Purpose:** Manage inventory items.
- **Actor:** Manager, Warehouse.
- **Required Data:** Paginated product list, stock levels, prices.
- **Available Actions:** Create, Edit, Delete, Import, Export, Print Barcodes.
- **Permissions:** `products:read`, `products:write`

## 4. Inventory Adjustments
- **Purpose:** Correct stock anomalies.
- **Actor:** Warehouse, Manager.
- **Required Data:** Current stock, adjustment reasons.
- **Available Actions:** Submit adjustment, approve adjustment.
- **Permissions:** `inventory:adjust`

## 5. Customer Directory
- **Purpose:** CRM and debt management.
- **Actor:** Cashier (Read), Manager (Write).
- **Required Data:** Customer details, ledger balance, history.
- **Available Actions:** Add customer, edit, view ledger, record payment.
- **Permissions:** `customers:read`, `customers:write`

## 6. Chart of Accounts
- **Purpose:** Financial structure management.
- **Actor:** Accountant, Owner.
- **Required Data:** Account tree (Assets, Liabilities, Equity, Revenue, Expenses).
- **Available Actions:** Create account, edit, view transactions.
- **Permissions:** `accounting:manage`

## 7. General Ledger / Journal
- **Purpose:** View double-entry records.
- **Actor:** Accountant.
- **Required Data:** Journal entries, debits, credits.
- **Available Actions:** Create manual journal, reverse entry, filter by date/account.
- **Permissions:** `accounting:write`

## 8. Financial Reports (Income Statement, Balance Sheet)
- **Purpose:** Assess financial health.
- **Actor:** Accountant, Owner.
- **Required Data:** Aggregated ledger balances.
- **Available Actions:** Generate, Export to PDF/Excel, filter by period.
- **Permissions:** `reports:financial`

## 9. Staff Management
- **Purpose:** HR and Access Control.
- **Actor:** Owner, Admin.
- **Required Data:** Employee profiles, roles, permissions.
- **Available Actions:** Add staff, reset password, change roles.
- **Permissions:** `staff:manage`

## 10. Settings Configuration
- **Purpose:** System-wide preferences.
- **Actor:** Owner, Admin.
- **Required Data:** Tax rates, currencies, store details, integrations.
- **Available Actions:** Update settings, configure API keys.
- **Permissions:** `settings:manage`
