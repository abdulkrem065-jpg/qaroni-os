# QEOS FINANCIAL GOVERNANCE RULES

## PURPOSE
To define the security, access, and governance frameworks that protect the QEOS financial engine.

## CHAPTER 10: SECURITY CONSTITUTION

Financial permissions within an organization are strictly segregated by role. 

### RESPONSIBILITIES
* **Viewer**: Read-only access to published financial statements and dashboards. Cannot view unposted drafts or sensitive audit trails.
* **Accountant**: Can create and post standard journal entries, view accounts, and draft reports. Cannot close periods.
* **Chief Accountant**: Can approve complex entries, manage the Chart of Accounts, and execute month-end closings.
* **Financial Controller**: Oversees all financial operations, defines accounting policies, executes year-end closings, and can authorize the re-opening of periods.
* **Auditor**: Comprehensive read-only access to all financial data, including drafts, audit events, and historical records.
* **Owner**: Full administrative control over the organization's financial settings, including assigning roles.

*(Note: These are architectural responsibilities only; no implementation is specified here.)*
