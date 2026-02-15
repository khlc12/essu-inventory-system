# ESSU Supply Office PPE and Consumables Management System — Full Workflow Script

This document explains the current end-to-end workflow of the website based on `App.tsx`, `api.ts`, `server/src/index.ts`, and Prisma schema definitions.

## 1) Module and Component Map

### Frontend (React SPA)
- App shell and state orchestration:
- `App`
- `ConfirmDialog` with `ConfirmContext`
- `SuccessContext`
- `SearchableSelect`
- Authentication:
- `LandingPage`
- Core pages:
- `Dashboard`
- `ActivityLogView`
- `ReportsModule`
- Operations:
- `AssetRegistryList`, `AssetForm`, `AssetDetail`
- `StockTransactionList`, `StockTransactionForm`, `StockTransactionDetail`
- `MRListView`, `MRForm`, `MRDetail`
- `AuditList`, `AuditNew`, `AuditWorksheet`, `AuditReport`
- Master Data:
- `EmployeeMasterView`
- `DepartmentMasterView` (Units)
- `LocationMasterView`
- `FundClusterMasterView`
- `CategoryMasterView`
- `PPECatalogView`
- `ConsumablesCatalogView`
- Settings:
- `SettingsView`

### Frontend API Client
- `api.ts` handles:
- Auth APIs
- CRUD APIs
- HRMS sync APIs
- MR action APIs (return, transfer, report missing)
- Data normalization from backend payloads

### Backend (Express + Prisma)
- Auth routes:
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/auth/sso/redirect`
- `GET /api/auth/sso/callback`
- HRMS sync routes:
- `POST /api/hrms/departments/sync`
- `POST /api/hrms/employees/sync`
- Domain routes:
- `/api/departments`, `/api/employees`, `/api/locations`, `/api/funds`, `/api/categories`, `/api/catalog`, `/api/assets`, `/api/transactions`, `/api/mrs`, `/api/audits`, `/api/logs`, `/api/settings`, `/api/users`, `/api/maintenance/*`

### Data Layer (Prisma models used)
- `User`, `Department`, `Employee`, `Location`, `FundCluster`, `AssetCategory`, `CatalogItem`, `Asset`, `Transaction`, `TransactionItem`, `MemorandumReceipt`, `MRItem`, `AuditSession`, `AuditItem`, `ActivityLog`, `SystemSettings`

## 2) Page Order and Routing Logic

This app is a state-driven SPA. Main order:
1. Login page (`LandingPage`)
2. Bootstrap loading state
3. Dashboard (default)
4. Module navigation through sidebar:
- Activity Logs
- Reports Center
- Asset Registry
- Transactions
- Memorandum Receipts
- Physical Counts
- Master Data
- Settings (Officer only)
5. Logout

View switching is handled by the `view` state in `App.tsx`.

## 3) Detailed Workflow by Page

### A. Login Page

#### Purpose
Authenticate user via local credentials or HRMS SSO.

#### Navigation to page
Shown when `isAuthenticated` is false.

#### Frontend modules involved
- `LandingPage`
- `App` auth handlers

#### Backend modules involved
- `/api/auth/login`
- `/api/auth/sso/redirect`
- `/api/auth/sso/callback`

#### API calls
- Local login: `POST /api/auth/login`
- SSO start: `GET /api/auth/sso/redirect`
- SSO callback handled server-side: `GET /api/auth/sso/callback`

#### Database interactions
- Local login: `User` lookup and status check
- SSO callback: `User` upsert using `username` and OAuth fields (`oauthSub`, `oauthClientRole`, `lastOauthLoginAt`)

#### Conditional logic
- Local login requires active account.
- SSO role mapping uses `client_role` from userinfo:
- `admin` => `Officer`
- others => `Staff`
- SSO userinfo 403 returns user-friendly denial message in login page.
- Query params handled on landing:
- `sso_error` -> error banner
- `sso_logged_out` -> success notice (auto-clears)

#### Next flow
Successful auth stores token/user, then moves to bootstrap loading.

### B. Bootstrap Loading

#### Purpose
Load all runtime data before showing app modules.

#### Navigation to page
Shown after authentication while `isBootstrapping` is true.

#### Frontend modules involved
- `App` bootstrap effect
- `bootstrapDataFromApi()`

#### API calls
- `GET /api/departments`
- `GET /api/locations`
- `GET /api/funds`
- `GET /api/categories`
- `GET /api/catalog`
- `GET /api/assets`
- `GET /api/transactions`
- `GET /api/mrs`
- `GET /api/audits`
- `GET /api/employees`
- `GET /api/logs`
- `GET /api/settings`
- Officer only: `GET /api/users`

#### Database interactions
Read from all core tables.

#### Conditional logic
- If 401, auto-sign-out.
- If bootstrap fails for other reasons, app falls back to local constants.

#### Next flow
Sets default page to Dashboard.

### C. Dashboard

#### Purpose
Show high-level operational metrics and snapshots.

#### Navigation to page
Default post-bootstrap page and sidebar “Dashboard”.

#### Frontend modules involved
- Dashboard section in `App`
- `StatCard`
- `StockMovementChart`

#### Backend/API usage
No direct call on render; uses already bootstrapped state.

#### Data logic
- Computes active/issued/available assets from `assets + mrs`.
- Computes monthly MR snapshot (new MRs, returns, transfers).
- Shows low-stock alert count from consumables `quantity <= reorderPoint`.
- Displays recent activity from `logs`.

#### Next flow
User navigates to module pages via sidebar.

### D. Asset Registry

#### Page names and purpose
- `AssetRegistryList`: browse/filter assets
- `AssetForm`: create/edit asset
- `AssetDetail`: view details

#### Navigation
Sidebar -> Asset Registry -> Register/Edit/View actions.

#### Key frontend modules
- `AssetRegistryList`, `AssetForm`, `AssetDetail`

#### Backend/API calls
- `POST /api/assets`
- `PUT /api/assets/:id`

#### Database interactions
- Create/update records in `Asset`
- Related lookups: `CatalogItem`, `FundCluster`, `Department`, `Location`, `Employee`

#### Conditional logic
- `dateAcquired` defaults to current date in form.
- Unit and location are optional.
- If custodian not provided on create, backend assigns Supply Office placeholder employee (`SUPPLY-OFFICE`).
- Active/inactive unit filtering in dropdowns includes selected inactive value when applicable.

#### Next flow
Returns to list; activity is logged.

### E. Stock Transactions

#### Page names and purpose
- `StockTransactionList`: list and filter transactions
- `StockTransactionForm`: create Stock In / Stock Out
- `StockTransactionDetail`: view/print transaction

#### Navigation
Sidebar -> Transactions -> New or Detail.

#### API calls
- `POST /api/transactions`

#### Database interactions
- Creates `Transaction` and `TransactionItem`
- Updates `CatalogItem.quantity` for consumables

#### Conditional logic
- Stock In requires `supplier` and `referenceNo`.
- Stock Out requires `departmentId` (Unit).
- Line items need valid `catalogItemId` and `quantity > 0`.

#### Next flow
Back to transaction list.

### F. Memorandum Receipts (MR)

#### Page names and purpose
- `MRListView`: browse/filter MRs
- `MRForm`: issue new MR
- `MRDetail`: view and execute MR lifecycle actions

#### Navigation
Sidebar -> Memorandum Receipts -> Issue or open detail.

#### API calls
- Issue: `POST /api/mrs`
- Return: `POST /api/mrs/:id/return`
- Transfer: `POST /api/mrs/:id/transfer`
- Report missing: `POST /api/mrs/:id/report-missing`

#### Database interactions
- `MemorandumReceipt` + `MRItem` create/update
- `Asset` reassignment and status updates

#### Conditional logic
- Issue MR:
- Requires `dateIssued`, `employeeId`, `locationId`, and at least one asset.
- Only assets with status `Active` and no active MR are allowed.
- Updates each asset `custodianId`, `departmentId`, and `locationId`.
- Return MR:
- Officer-only action.
- Requires condition: `Good`, `For Repair`, or `Unserviceable`.
- Closes MR and updates all MR items (`returnDate`, remarks condition).
- Moves assets to Supply Office custodian and updates status:
- Good -> Active
- For Repair -> Under Repair
- Unserviceable -> Retired
- Transfer MR:
- Officer-only action.
- Requires target `employeeId`, `locationId`, condition (`Good` or `For Repair`).
- Closes existing MR, marks previous MR items as `Transferred`, creates new active MR for new custodian, updates asset custodian/unit/location/status.
- Report Missing:
- Officer-only action.
- Closes MR, marks MR items as `Missing`, updates assets to `Missing`.

#### Next flow
Back to MR list/detail with refreshed MR and asset state.

### G. Physical Counts (Audit)

#### Page names and purpose
- `AuditList`: list sessions
- `AuditNew`: create draft session from active asset snapshot
- `AuditWorksheet`: update draft counts
- `AuditReport`: finalized report view

#### Navigation
Sidebar -> Physical Counts -> New/Detail.

#### API calls
- `POST /api/audits`
- `PUT /api/audits/:id`

#### Database interactions
- Creates/updates `AuditSession` and `AuditItem`

#### Conditional logic
- New session requires description plus at least one scope (unit or location).
- Snapshot includes only active assets in scope.
- Detail route behavior:
- `Draft` => worksheet
- `Finalized` => report

#### Next flow
Return to audit list or report output.

### H. Master Data

#### Pages and purpose
- Employees Master Data (`EmployeeMasterView`)
- Units Master Data (`DepartmentMasterView`)
- Locations/Funds/Categories/Catalog pages

#### Navigation
Sidebar -> Master Data section.

#### Backend/API
- Employees and Units:
- List endpoints enabled.
- Create/update/deactivate endpoints intentionally return 403 (managed by HRMS sync).
- Locations/Funds/Categories/Catalog:
- CRUD endpoints enabled (deactivation restricted to Officer).

#### Additional frontend behavior
- Employee page rows are clickable and open a drawer showing:
- Current MR assets
- Returns, transfers, missing history
- Activity summary stats
- Department/unit and employee filters handle inactive entries without breaking selected state.

#### Next flow
Return to dashboard or other modules.

### I. Reports Center

#### Purpose
Provide print-friendly operational and summary reports.

#### Navigation
Sidebar -> Reports.

#### Frontend modules
- `ReportsModule`

#### Backend/API usage
Uses bootstrapped state; no direct per-tab API call.

#### Report tabs and logic
- PPE Inventory report:
- Filters: date range, unit, location, custodian (searchable), availability, condition, MR status.
- Derived columns include MR status and last MR action.
- Consumables Stock report:
- Current stock and valuation from catalog.
- Stock Movement report:
- Flattened transaction items with source and movement type.
- Custody and MR Summary:
- Summary filters (date/unit/location/custodian)
- KPI cards for MR totals, returns, transfers, missing, availability, repair, retired
- Top custodians and top locations by value
- Audit Findings:
- Session-level shortage metrics

#### Next flow
User can print report or switch module.

### J. Settings

#### Purpose
Manage configuration, integration settings, and maintenance operations.

#### Navigation
Sidebar -> Settings (Officer only).

#### API calls
- `PUT /api/settings`
- `POST /api/hrms/departments/sync`
- `POST /api/hrms/employees/sync`
- `POST /api/maintenance/export`
- `POST /api/maintenance/health`
- `GET /api/users` (read)
- `POST /api/users`, `PUT /api/users/:id` return 403 (disabled)

#### Database interactions
- Updates `SystemSettings` including `integrations.oauth` and sync timestamps.
- HRMS sync writes to `Department` and `Employee`.

#### HRMS sync behavior details
- Units sync (`/api/hrms/departments/sync`):
- Pulls `/api/units` with `include_deleted=true`.
- Imports only unit types `college` and `office`.
- Marks inactive/deleted as local `Inactive`.
- Employees sync (`/api/hrms/employees/sync`):
- Pulls units first for mapping and then paged `/api/employees`.
- Includes deleted/inactive employees and maps them to local `Inactive`.
- For employees under `program` unit, maps to parent unit when parent type is allowed.
- Creates missing local units as needed.

#### Next flow
Save settings, sync results shown, then return to other modules.

### K. Logout

#### Purpose
End local session and optionally IdP session.

#### Navigation
Header/logout action from authenticated app.

#### API calls
- `POST /api/auth/logout` for SSO users

#### Conditional logic
- Local user:
- Clears local auth state/token only.
- SSO user:
- Backend clears token store and returns HRMS end-session URL with `post_logout_redirect_uri`.
- Frontend redirects browser to provider logout URL.
- Frontend landing page shows `You have been signed out successfully.` when redirected with `sso_logged_out=1`.

#### Next flow
Back to login page.

## 4) Complete User Journey Summary

1. User opens login page and signs in locally or via HRMS SSO.
2. Backend authenticates and issues JWT; SSO user is upserted in local `User`.
3. App bootstraps all operational data.
4. User lands on Dashboard and monitors inventory, MR, audit, and activity summaries.
5. User performs operations:
- Asset registration and updates
- Consumable stock movements
- MR issuance and lifecycle actions (return, transfer, missing)
- Physical count sessions and audit finalization
6. Master data remains consistent:
- Units and Employees are synchronized from HRMS and read-only in-app
- Other master data can be managed locally
7. Reports Center provides filtered, printable operational and custody summaries aligned with latest MR and asset state.
8. Settings lets Officer maintain OAuth config, run HRMS sync, and execute maintenance checks.
9. User logs out; SSO users are logged out from both app and provider with post-logout redirect.
