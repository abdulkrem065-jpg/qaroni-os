# QEOS Single Intelligence Policy

## Authorization: QEOS-AUTH-0089 Rev.2

## Principle
QEOS SHALL contain only ONE AI Engine. There shall NEVER exist domain-specific AI instances (e.g., AI for Sales, AI for Inventory, AI for Accounting). These are strictly forbidden. The entire platform communicates with one centralized Enterprise AI Core.

## Enforcement
- All UI entry points (Dashboard, Explain KPI, Ask AI) open the SAME AI Hub.
- The conversation memory is unified. A user can ask a question in the Inventory context and follow up seamlessly in the Sales context.
- Tools are discovered dynamically from business modules and executed by the single Hub.
