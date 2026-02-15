# System Flowchart (Textual)

## Data Stores
- DS1 Local MySQL: `User`, `Department`, `Employee`, `Location`, `FundCluster`, `AssetCategory`, `CatalogItem`, `Asset`, `Transaction`, `TransactionItem`, `MemorandumReceipt`, `MRItem`, `AuditSession`, `AuditItem`, `SystemSettings`, `ActivityLog`.
- DS2 HRMS: OAuth endpoints (`/oauth/authorize`, `/oauth/token`, `/oauth/userinfo`, `/oauth/end-session`) and HRMS APIs (`/api/units`, `/api/employees`).

## Site Navigation and Process Flow (with Off-Page Connectors)
- OPC A Start -> Login Page.

- OPC A -> Decision: Sign-in method.
- OPC B1 Local Login -> `/api/auth/login` -> DS1 `User` validation -> JWT issued -> OPC C App Bootstrap.
- OPC B2 SSO Login -> `/api/auth/sso/redirect` -> DS2 `/oauth/authorize` -> callback `/api/auth/sso/callback` -> DS2 `/oauth/token` + `/oauth/userinfo` -> role map from `client_role` -> DS1 `User` upsert + in-memory HRMS token -> frontend receives `sso_token` -> OPC C App Bootstrap.
- OPC B2 (Denied path) -> DS2 returns 403 -> redirect with `sso_error` -> Login Page message.

- OPC C App Bootstrap -> read from DS1 (`departments`, `employees`, `locations`, `funds`, `categories`, `catalog`, `assets`, `transactions`, `mrs`, `audits`, `logs`, `settings`, `users`) -> OPC D Main App.

- OPC D Main App -> Dashboard -> DS1 (`assets`, `mrs`, `transactions`, `audits`, `logs`, `catalog`) -> OPC D.
- OPC D Main App -> Activity Logs -> DS1 `ActivityLog` -> OPC D.
- OPC D Main App -> Reports Center -> DS1 (`assets`, `mrs`, `transactions`, `audits`, `catalog`, `departments`, `locations`, `employees`) -> OPC D.

- OPC D Main App -> Asset Registry List -> DS1 `Asset` + lookups -> OPC E.
- OPC E Asset Registry -> Register/Edit Asset -> `POST/PUT /api/assets` -> DS1 `Asset` update (default Supply Office custodian if none) -> DS1 `ActivityLog` -> OPC D.
- OPC E Asset Registry -> Asset Detail (read) -> OPC D.

- OPC D Main App -> Stock Transactions List -> DS1 `Transaction` -> OPC F.
- OPC F Transactions -> New Transaction -> `POST /api/transactions` -> DS1 `Transaction` + `TransactionItem` + catalog quantity adjustment for consumables -> DS1 `ActivityLog` -> OPC D.
- OPC F Transactions -> Transaction Detail (read/print) -> OPC D.

- OPC D Main App -> Memorandum Receipts List -> DS1 `MemorandumReceipt` + `MRItem` -> OPC G.
- OPC G MR -> Issue MR -> `POST /api/mrs` -> DS1 new active MR + asset reassignment (custodian/unit/location) -> DS1 `ActivityLog` -> OPC D.
- OPC G MR -> Return Assets -> `POST /api/mrs/:id/return` -> DS1 close MR + set `MRItem.returnDate/remarks` + move assets to Supply Office custodian + status from condition -> DS1 `ActivityLog` -> OPC D.
- OPC G MR -> Transfer Custodian -> `POST /api/mrs/:id/transfer` -> DS1 close current MR + open new MR + reassign assets to new custodian/location/status -> DS1 `ActivityLog` -> OPC D.
- OPC G MR -> Report Missing -> `POST /api/mrs/:id/report-missing` -> DS1 close MR + mark assets `Missing` -> DS1 `ActivityLog` -> OPC D.

- OPC D Main App -> Physical Counts (Audit List) -> DS1 `AuditSession` -> OPC H.
- OPC H Audit -> New Session -> `POST /api/audits` -> DS1 `AuditSession` + `AuditItem` snapshot -> DS1 `ActivityLog` -> OPC H.
- OPC H Audit -> Worksheet (Draft) -> `PUT /api/audits/:id` -> DS1 save draft counts -> DS1 `ActivityLog` -> OPC H.
- OPC H Audit -> Finalize -> `PUT /api/audits/:id` status `Finalized` -> DS1 finalize session -> DS1 `ActivityLog` -> OPC D.

- OPC D Main App -> Master Data Hub -> OPC I.
- OPC I Employees (read-only) -> DS1 `Employee` + MR/asset history drawer -> OPC D.
- OPC I Units (read-only) -> DS1 `Department` -> OPC D.
- OPC I Locations/Funds/Categories/Catalog -> CRUD APIs -> DS1 respective tables -> DS1 `ActivityLog` -> OPC D.

- OPC D Main App -> Settings (Officer only) -> DS1 `SystemSettings` + maintenance -> OPC J.
- OPC J Save Settings -> `PUT /api/settings` -> DS1 `SystemSettings` -> DS1 `ActivityLog` -> OPC D.
- OPC J Sync Units -> `POST /api/hrms/departments/sync` -> DS2 `/api/units` (filter `college|office`) -> DS1 `Department` + sync timestamp in `SystemSettings.integrations` -> DS1 `ActivityLog` -> OPC D.
- OPC J Sync Employees -> `POST /api/hrms/employees/sync` -> DS2 `/api/employees` + `/api/units` mapping -> DS1 `Employee`/`Department` + sync timestamp -> DS1 `ActivityLog` -> OPC D.
- OPC J Export/Health Check -> maintenance endpoints -> DS1 read checks -> OPC D.
- OPC J User account create/update -> blocked (API returns 403 disabled).

- OPC D Sign Out -> Decision.
- OPC K1 Local User Logout -> clear local auth -> Login Page.
- OPC K2 SSO User Logout -> `POST /api/auth/logout` -> DS2 `/oauth/end-session?post_logout_redirect_uri=...` -> Login Page with `sso_logged_out=1` -> notice shown then URL param cleared.
