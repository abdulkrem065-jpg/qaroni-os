# QEOS Information Architecture

## Authorization: QEOS-AUTH-0085

## 1. Navigation Architecture

### Primary Navigation (Global)
- **Desktop:** Persistent vertical sidebar on the right (RTL) or left (LTR) containing top-level modules.
- **Tablet:** Collapsible vertical sidebar or bottom navigation bar depending on orientation and context (POS vs. Backoffice).
- **Mobile:** Hamburger menu for backoffice; optimized bottom navigation for frequent tasks (POS, Inventory).

### Secondary Navigation (Contextual)
- Horizontal tabs within a module (e.g., Accounting -> Journal Entries | Trial Balance | Reports).
- Contextual action bars at the top of list views (Search, Filter, Export, Add New).

### Breadcrumb Hierarchy
- Always visible at the top of detail screens (e.g., Products > Electronics > Laptops > MacBook Pro).

## 2. Module Hierarchy
- **Front-of-House (Operations):**
  - Point of Sale (POS)
  - Sales Orders
  - Customer Directory
- **Back-of-House (Management):**
  - Inventory & Products
  - Purchasing & Suppliers
  - Accounting & Finance
- **Administration (System):**
  - Organization & Branches
  - Staff & Roles
  - Settings & Audit

## 3. Data Hierarchy
- **Organization (Tenant):** The root container for all data.
- **Branch/Location:** Physical or virtual subsets of the organization.
- **Domain Entities:** Products, Orders, Invoices, Journal Entries.
- **Sub-Entities/Lines:** Order Items, Invoice Lines, Journal Lines.

## 4. Permission Hierarchy
- **Owner/Admin:** Unrestricted access across the Organization.
- **Branch Manager:** Full access constrained to a specific Branch.
- **Supervisor:** Read/Write access to specific operational modules (e.g., Inventory, Sales).
- **Cashier:** Restricted to POS, basic customer lookup, daily shift reporting.
- **Warehouse:** Restricted to Inventory counts, receiving, transfers.
- **Accountant:** Access to financial modules, ledgers, reports; restricted from operational deletion.
