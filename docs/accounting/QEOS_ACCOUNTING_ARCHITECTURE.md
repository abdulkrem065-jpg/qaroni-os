# QEOS Accounting Architecture

## 1. Engine Definitions

### 1.1 Journal Engine
The entry point for all financial transactions.
- **Journal:** A container for transactions, categorized by type (General, Sales, Purchase, Cash).
- **Journal Entry (Header):** Metadata regarding the transaction (Date, Reference, Description, Source Module).
- **Journal Line:** Individual debit or credit entries. Must include Account, Amount, Currency, and optional dimensions (Cost Center).
- **Posting Statuses:** `Draft`, `Pending Approval`, `Posted`, `Reversed`, `Cancelled`.
- **Balanced Rule:** Strict enforcement that `Sum(Debits) = Sum(Credits)` in the base currency before posting.
- **Workflows:** Supports maker-checker approval workflows and standard reversal workflows (generating inverse entries).

### 1.2 Ledger Engine
The storage and balance calculation layer.
- **General Ledger (GL):** The master record of all financial accounts.
- **Sub-Ledgers:** Granular ledgers tracking specific domains before summarizing to the GL (Control Accounts).
  - *Customer Ledger (AR):* Tracks invoices, payments, and balances per customer.
  - *Supplier Ledger (AP):* Tracks bills, payments, and balances per supplier.
  - *Inventory Ledger:* Tracks stock value and COGS.
  - *Cash/Bank Ledger:* Tracks liquidity.
  - *Fixed Asset Ledger:* Tracks asset capitalization and depreciation.

### 1.3 Posting Engine
The execution mechanism for finalizing journals.
- **Automatic Posting:** Triggered synchronously by domain events (e.g., Sales Order Invoiced).
- **Manual Posting:** Executed by accountants for manual GL entries.
- **Background Posting:** Asynchronous processing for high-volume batches.
- **Deferred Posting:** Scheduled for future dates (e.g., recurring revenue recognition).
- **Transaction Integrity:** Employs database-level transactions (ACID). If a posting fails, the entire batch rolls back.
- **Idempotency:** Utilizes idempotency keys (e.g., Source Document ID) to prevent duplicate postings.

### 1.4 Fiscal Engine
Manages time-bound accounting periods.
- **Fiscal Year & Periods:** Defined in the Financial Foundation module.
- **States:** `Open`, `Locked` (soft close for operational modules), `Closed` (hard close, no entries allowed).
- **Reopening:** Strictly controlled workflow requiring high privileges and full audit logging.
- **Year-End Closing:** Automated process to calculate retained earnings, carry forward balances, and zero out P&L accounts.

### 1.5 Cost Accounting
Provides multi-dimensional profitability analysis.
- **Dimensions:** `Cost Centers`, `Profit Centers`, `Projects`, `Departments`, `Branches`.
- **Allocation Rules:** Mechanisms to distribute overhead costs across multiple centers based on defined metrics (e.g., headcount, square footage).

### 1.6 Currency Engine
Handles multi-currency complexities.
- **Base Currency:** Organization's primary reporting currency.
- **Foreign Currency:** Transactional currencies differing from the base.
- **Exchange Rates:** Sourced from the Financial Foundation.
- **Revaluation:** Period-end processes to revalue AR/AP based on latest exchange rates.
- **Currency Gain/Loss:** Automated posting of realized and unrealized exchange differences.

### 1.7 Tax Engine
Calculates and tracks tax liabilities.
- **Tax Types:** Sales Tax, Purchase Tax, VAT Ready.
- **Tax Profiles:** Defined per organization, mapped to specific transactions.
- **Tax Posting:** Automated separation of base amounts and tax amounts into distinct GL accounts.
- **Tax Ledger:** Dedicated sub-ledger for statutory tax reporting and remittance.

### 1.8 Banking Engine
Manages liquidity and external financial relationships.
- **Accounts:** Cash, Checking, Savings, Credit Cards.
- **Transactions:** Transfers, Deposits, Withdrawals, Fees.
- **Bank Reconciliation:** Matching internal ledger entries with imported bank statements. Tracks outstanding checks and deposits in transit.

## 2. Financial Statements
The output layer for financial reporting. Calculated dynamically or via materialized views for performance.
- **Trial Balance:** Lists all accounts and their current balances.
- **Balance Sheet:** Assets = Liabilities + Equity (point in time).
- **Income Statement (P&L):** Revenue - Expenses = Profit (over a period).
- **Cash Flow Statement:** Tracks cash entering and leaving (Operating, Investing, Financing).
- **Equity Statement:** Changes in owner's equity.
- **Operational Reports:** Customer Statements, Supplier Aging, Inventory Valuation, Profit Center Analysis.

## 3. AI Integration (Architecture)
The architecture provides specific hooks for future AI consumption:
- **Financial Analysis:** AI models can ingest standard GL extracts to perform automated ratio analysis.
- **Forecasting:** Cash flow prediction models can read AR/AP aging data and historical patterns.
- **Fraud/Anomaly Detection:** Real-time ML models can evaluate Journal Entries pre-posting for statistical outliers (e.g., unusual amounts, rare account combinations).
- **Business Recommendations:** NLP interfaces to query financial statements ("Why did travel expenses increase in Q3?").
- *Implementation Constraint: These are API boundaries and data extraction pipelines only. No AI models reside in the core engine.*
