# Data Flow Diagrams (Textual)

## Level 0 (Context Diagram)
- **Entities**: Supply Officer (Admin); Supply Office Staff; HRMS/SSO Provider
- **Process**: Inventory and Asset Management System
- **Data Stores**: Inventory Database (MySQL)
- **Data Flows**: Officer/Staff -> System (login credentials, SSO authorization, asset/transaction/audit inputs, settings changes); System -> Officer/Staff (dashboards, reports, printable documents, confirmations, activity logs); System <-> HRMS/SSO Provider (OAuth tokens, user profile data, employees/departments sync data); System <-> Inventory Database (read/write master data, assets, transactions, audits, settings, logs)

## Level 1 (Decomposition)
- **Entities**: Supply Officer (Admin); Supply Office Staff; HRMS/SSO Provider
- **Processes**: P1 Authentication & Access Control; P2 HRMS Sync (Employees/Departments); P3 Master Data Management (Locations/Funds/Categories/Catalog); P4 Asset Registry (PPE); P5 Stock Transactions (Consumables); P6 Memorandum Receipts; P7 Physical Count/Audit; P8 Reports & Printing; P9 Settings & User Management; P10 Activity Logging & Maintenance
- **Data Stores**: D1 Users; D2 Departments; D3 Employees; D4 Locations; D5 Fund Clusters; D6 Asset Categories; D7 Catalog Items; D8 Assets; D9 Stock Transactions; D10 Memorandum Receipts; D11 Audit Sessions/Items; D12 System Settings; D13 Activity Logs
- **Data Flows**: Officer/Staff -> P1 (credentials or SSO auth code) -> D1 (user account lookup/upsert) -> Officer/Staff (JWT/session); HRMS/SSO Provider -> P1/P2 (userinfo, employee/department data) -> D2/D3 (upsert) -> Officer/Staff (synced master data); Officer/Staff -> P3 (locations/funds/categories/catalog updates) -> D4/D5/D6/D7 -> Officer/Staff (updated master data); Officer/Staff -> P4 (PPE registrations/updates) -> D8 -> Officer/Staff (asset records, registry views); Officer/Staff -> P5 (stock in/out entries) -> D9 and D7 (stock adjustments) -> Officer/Staff (transaction records, printable slips); Officer/Staff -> P6 (issue MR) -> D10 and D8 (asset assignment) -> Officer/Staff (MR forms); Officer/Staff -> P7 (audit sessions/counts) -> D11 and D8 (snapshot/variance) -> Officer/Staff (audit worksheets, RPCPPE report); Officer/Staff -> P8 (report requests) -> D2-D11 (data retrieval) -> Officer/Staff (reports/printouts); Officer (Admin) -> P9 (settings/users) -> D1/D12 -> Officer (updated configuration); All processes -> P10 (log entries, health checks, exports) -> D13/D12 -> Officer (logs, export files, health results)
