# System Flowchart (Textual)

## Data Stores
- **DS1 Local MySQL DB**: Users, Employees, Departments, Locations, Fund Clusters, Categories, Catalog, Assets, Transactions, Memorandum Receipts, Audits, Settings, Logs
- **DS2 HRMS/SSO Provider**: OAuth endpoints, userinfo, employees, departments

## System Flowchart (Site Navigation up to Data Stores)
- **OPC A Start** → SSO Login → DS2 (OAuth authorize/token/userinfo) → DS1.Users (upsert user) → OPC B Main App

- **OPC B Main App** → Officer Nav Hub → OPC C, D, E, F, G, H, I, J, K
- **OPC B Main App** → Staff Nav Hub → OPC C, D, E, F, G, H, I, J

- **OPC C Dashboard** → DS1.Assets + DS1.Transactions + DS1.Audits + DS1.Catalog + DS1.Logs → OPC B
- **OPC D Activity Logs** → DS1.Logs → OPC B
- **OPC E Reports** → DS1.Assets + DS1.Catalog + DS1.Transactions + DS1.Audits + DS1.Departments + DS1.Locations → OPC B
- **OPC F Asset Registry (PPE)** → DS1.Assets + DS1.Catalog + DS1.Employees + DS1.Departments + DS1.Locations + DS1.Funds → DS1.Logs → OPC B
- **OPC G Stock Transactions** → DS1.Transactions + DS1.Catalog + DS1.Departments + DS1.Locations → DS1.Logs → OPC B
- **OPC H Memorandum Receipts** → DS1.MRs + DS1.Assets + DS1.Employees → DS1.Logs → OPC B
- **OPC I Physical Counts** → DS1.Audits + DS1.Assets + DS1.Departments + DS1.Locations → DS1.Logs → OPC B

- **OPC J Master Data Hub** → OPC J1, J2, J3, J4, J5, J6, J7
- **OPC J1 Employees (read-only)** → DS1.Employees → OPC J
- **OPC J1 Employees Sync (Officer)** → DS2 Employees API → DS1.Employees → DS1.Logs → OPC J
- **OPC J2 Departments (read-only)** → DS1.Departments → OPC J
- **OPC J2 Departments Sync (Officer)** → DS2 Departments API → DS1.Departments → DS1.Logs → OPC J
- **OPC J3 Locations** → DS1.Locations → DS1.Logs → OPC J
- **OPC J4 Fund Clusters** → DS1.Funds → DS1.Logs → OPC J
- **OPC J5 Asset Categories** → DS1.Categories → DS1.Logs → OPC J
- **OPC J6 PPE Catalog** → DS1.Catalog → DS1.Logs → OPC J
- **OPC J7 Consumables Catalog** → DS1.Catalog → DS1.Logs → OPC J

- **OPC K Settings (Officer only)** → DS1.Settings + DS1.Users → DS1.Logs → OPC B
- **OPC K Maintenance (Officer)** → DS1.* (export/health check reads) → DS1.Logs → OPC B

- **OPC L Sign Out** → /api/auth/logout → DS2 end-session (SSO logout) → OPC A Login
