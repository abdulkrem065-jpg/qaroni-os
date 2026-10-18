# QEOS Existing Dashboard Audit

## Authorization: QEOS-AUTH-0086

## 1. Current State Analysis
The existing `src/admin/Dashboard.tsx` is a monolithic file (~9000+ lines) that handles rendering, data fetching, global state, POS fallback, inventory management, and settings all in one view. 

## 2. Classification of Existing Dashboard Elements

- **The Monolith (Dashboard.tsx):** **Replace**
  - **Reason:** The file is too large, violates separation of concerns, and acts as an entire application rather than a dashboard. It will be replaced by modular widgets and a clean composition layout.

- **KPI Cards (Existing metric displays):** **Reuse & Redesign**
  - **Reason:** The underlying data concepts (Total Sales, Total Debt) are correct, but the visual presentation needs to be upgraded to match the new Design System (better typography, trend indicators).

- **Settings / Configuration Views embedded in Dashboard:** **Delete / Move**
  - **Reason:** Settings must be moved to their own dedicated module route (`/settings`), not reside in the main executive dashboard.

- **POS / Sales Entry embedded in Dashboard:** **Delete / Move**
  - **Reason:** The POS is an operational tool, not an executive dashboard widget. It must be completely separated into the Sales/POS module.

- **Inventory Lists embedded in Dashboard:** **Merge / Move**
  - **Reason:** The dashboard should only show *Insights* and *Alerts* (e.g., Low Stock), while the full inventory table must reside in the Inventory module.

## 3. Conclusion
The current `Dashboard.tsx` is a prototype monolith. The architectural decision is to **deprecate** it as a monolithic entry point and replace it with a true Executive Command Center strictly composed of high-level widgets, offloading operational tasks to their respective domain modules.
