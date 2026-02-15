# Data Flow Diagrams (Textual)

## Scope
This DFD reflects the current implementation of the ESSU Supply Office PPE and Consumables Management System, including SSO login/logout, HRMS sync, MR lifecycle actions (issue/return/transfer/missing), and reporting.

## Level 0 (Context Diagram)
- External Entities: Supply Officer (Officer), Supply Office Staff (Staff), HRMS OAuth + HRMS API.
- Core Process: ESSU Supply Office PPE and Consumables Management System.
- Data Stores: DS1 Local MySQL Database, DS2 HRMS (OAuth + Units/Employees APIs).
- Data Flows:
- Officer/Staff -> System: Login request, business transactions, master data maintenance, audits, report requests.
- System -> Officer/Staff: Dashboards, confirmations, printable forms, filtered reports, activity logs.
- System <-> DS1: Users, units, employees, assets, transactions, MRs, audits, settings, logs.
- System <-> DS2: OAuth authorize/token/userinfo, units sync data, employees sync data, end-session logout.

## Level 1 (Decomposition)
- P1 Authentication and Session Management.
- P2 HRMS Unit Sync (Departments).
- P3 HRMS Employee Sync.
- P4 Master Data Management (Locations, Funds, Categories, Catalog).
- P5 Asset Registry.
- P6 Stock Transactions (Consumables).
- P7 Memorandum Receipt Lifecycle.
- P8 Physical Count and Audit.
- P9 Reporting and Dashboard Analytics.
- P10 Settings and Integrations.
- P11 Activity Logging.

- D1 Users.
- D2 Departments (Units).
- D3 Employees.
- D4 Locations.
- D5 Fund Clusters.
- D6 Asset Categories.
- D7 Catalog Items.
- D8 Assets.
- D9 Transactions and Transaction Items.
- D10 Memorandum Receipts and MR Items.
- D11 Audit Sessions and Audit Items.
- D12 System Settings (including integrations JSON).
- D13 Activity Logs.

- Officer/Staff -> P1 -> D1:
- Local login validates username/password/status.
- SSO login uses DS2 OAuth and userinfo, maps role from `client_role` (`admin` -> Officer, else Staff), upserts user, and stores HRMS token in memory.

- Officer -> P2 -> DS2 `/api/units` -> D2:
- Syncs units; only `college` and `office` unit types are imported.
- Inactive/deleted units are marked `Inactive`.

- Officer -> P3 -> DS2 `/api/employees` + `/api/units` -> D3/D2:
- Syncs employees with pagination.
- Program-level employees are mapped to parent unit (college/office).
- Inactive/deleted HRMS employees are marked `Inactive`.

- Officer/Staff -> P4 -> D4/D5/D6/D7:
- CRUD for locations/funds/categories/catalog.
- Units and employees are read-only in app and managed through HRMS sync.

- Officer/Staff -> P5 -> D8:
- Registers/updates PPE assets.
- Default custodian is Supply Office placeholder employee.
- Unit/location are optional at registry stage.

- Officer/Staff -> P6 -> D9 and D7:
- Creates Stock In/Stock Out.
- Consumable quantities are adjusted in catalog.

- Officer/Staff -> P7 -> D10 and D8:
- Issue MR: assigns asset custodian/unit/location and creates active MR.
- Return MR: closes MR, sets return metadata, sends assets to Supply Office custodian, updates status by condition.
- Transfer MR: closes old MR, creates new MR, reassigns custodian/location/status.
- Report Missing: closes MR and marks assets `Missing`.

- Officer/Staff -> P8 -> D11:
- Creates draft audits, updates worksheet counts, finalizes audit sessions.

- Officer/Staff -> P9 -> D2..D11:
- Dashboard: MR activity snapshot, asset condition breakdown, movement analytics.
- Reports Center: PPE report with filters, consumables, movement, custody/MR summary, audit findings.

- Officer -> P10 -> D12:
- Manages system settings and OAuth settings.
- Triggers unit/employee sync.
- Runs maintenance export and health checks.
- User account create/update endpoints are disabled.

- All Processes -> P11 -> D13:
- Creates activity logs for business and admin operations.

- Officer/Staff -> P1 logout -> DS2 end-session (SSO only):
- SSO logout returns post-logout redirect URI and returns user to login page with `sso_logged_out` notice.
