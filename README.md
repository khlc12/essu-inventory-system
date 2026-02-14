# ESSU Supply Office Inventory System

A comprehensive, web-based inventory management prototype designed for the Eastern Samar State University (ESSU) Supply Office. This system digitizes the management of Property, Plant, and Equipment (PPE), consumable supplies, physical audits, and accountability issuance.

## 🔑 Access / Roles
Authentication and role-based access are enabled.
- Local accounts (seeded): `officer / admin123` and `staff / staff123`
- HRMS SSO: access is enforced by HRMS authorization rules
  - `client_role = admin` => **Officer**
  - Any other `client_role` => **Staff**

## 🚀 Key Features

### 1. Dashboard
*   **Real-time Metrics:** Total Asset Value, PPE Count, Low Stock Alerts, and Active Audit Sessions.
*   **Stock Movement Chart:** Interactive Bar/Line graph showing 12-month Stock In vs. Stock Out trends.
*   **Activity Feed:** Recent system actions and logs.

### 2. Asset Registry (PPE)
*   **Lifecycle Management:** Register, Edit, Track, and Archive fixed assets.
*   **Smart Forms:** Auto-fills descriptions and unit values from the Master Catalog.
*   **Validation:** Enforces unique Property Numbers and required relationships (Fund, Location, Custodian).
*   **Detailed History:** Track acquisition details and audit status.

### 3. Stock Transactions (Consumables)
*   **Inventory Flow:** Manage **Stock In** (Replenishment) and **Stock Out** (Issuance) workflows.
*   **Strict Logic:** Only allows selection of "Consumable" items; enforces stock availability checks.
*   **Printable Forms:** Generates transaction records formatted as Requisition and Issue Slips.

### 4. Memorandum Receipts (MR)
*   **Accountability:** Issue PPE assets to specific employees.
*   **Asset Filtering:** Smart selection only shows active, unassigned assets.
*   **Official Layout:** Generates printable Memorandum Receipts with signature blocks.

### 5. Physical Count (Audit) Module
*   **Session Management:** Create audit sessions scoped by Department or Location.
*   **Snapshot Logic:** Freezes the "Expected Quantity" at the start of the session.
*   **Interactive Worksheet:**
    *   Real-time calculation of **Shortages** and **Overages**.
    *   Auto-calculation of financial value for shortages.
    *   Status color-coding (Green=Match, Red=Shortage, Blue=Overage).
*   **Reports:** Generates the "Report on the Physical Count of Property, Plant and Equipment" (RPCPPE).

### 6. Master Data Management (MDM)
Centralized management for system integrity:
*   **Employees:** Synced from HRMS (read-only in-app).
*   **Units/Departments:** Synced from HRMS Units API (read-only in-app).
*   **Locations:** Building/Room management.
*   **Fund Clusters:** Fund source definitions.
*   **Asset Categories:** Classification for PPE vs. Consumables.
*   **Catalog:** Standardized definitions for items (Article, Description, Unit, Cost).

### 7. Reports Center
Dedicated reporting module with export/print capabilities:
*   **PPE Inventory Report**
*   **Consumables Stock Level Report**
*   **Stock Movement History**
*   **Audit Findings & Variance Report**

### 8. System Administration
*   **Settings:** Configure system name, logo, reorder thresholds, and document signatories.
*   **Activity Logs:** Full audit trail of all Create, Update, Delete, and Export actions.
*   **Database Export:** JSON export of current state.
*   **User Management:** Account creation/editing in Settings is disabled.
*   **Success/Confirm UX:** Custom confirmation dialogs and success banners across mutations; logout requires confirmation.
*   **HRMS Sync:** Officer-triggered sync for Employees and Units/Departments.
*   **Data Health Check:** Validates common data issues (negative quantities, invalid references).

---

## 🛠 Tech Stack
*   **Frontend:** Vite + React 19 + TypeScript
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Backend:** Node.js + Express + Prisma
*   **Database:** MySQL
*   **Auth:** JWT + OAuth2/OIDC (HRMS SSO)
*   **Hosting:** Railway (API + MySQL), Vercel (frontend)

## 🗄️ Backend (MySQL + Express/Prisma)
The backend lives in `server/` using Express, Prisma ORM, and MySQL. Authentication uses JWT and supports HRMS SSO (OAuth2/OIDC); mutating routes require a valid token, and some routes are Officer-only.

### Requirements
- Node.js 18+
- MySQL instance (create an empty database, e.g., `essu_inventory`)

### Setup
```bash
cd server
cp .env.example .env   # update DATABASE_URL/JWT_SECRET if needed
npm install
npx prisma generate
npx prisma migrate dev --name init   # plus subsequent migrations already present
npm run seed           # loads the mock data from the existing frontend constants
npm run dev            # starts API on http://localhost:4000
```

### Environment variables (backend)
- `DATABASE_URL`
- `JWT_SECRET`
- `OAUTH_PROVIDER_URL` (HRMS base URL)
- `OAUTH_CLIENT_ID`
- `OAUTH_CLIENT_SECRET`
- `OAUTH_REDIRECT_URI`
- `OAUTH_SCOPES` (default: `openid profile email`)
- `FRONTEND_BASE_URL` (used for SSO redirects and logout return)
- `HRMS_API_BASE_URL` (optional override)
- `HRMS_SERVICE_TOKEN` (optional; service token for sync without user SSO)

### HRMS sync behavior (current)
- `POST /api/hrms/departments/sync` pulls from HRMS `/api/units` and imports only unit types:
  - `college`
  - `office`
- Unit records of type `program` are not imported as standalone departments.
- `POST /api/hrms/employees/sync` resolves employee unit mapping as:
  - if employee unit type is `program`, map employee to the parent unit (`parent_unit_id`)
  - parent unit must be `college` or `office`
- Employee identity key for upsert is resolved in this order:
  - `employee_number`
  - `employee_id`
  - HRMS `id`
  - `contact.email`
- Employee and department/unit master data are read-only in-app:
  - manual create/update/deactivate endpoints return `403`.

### Available endpoints (selected)
- `GET /health`
- `GET /api/departments`
- `GET /api/locations`
- `GET /api/funds`
- `GET /api/categories`
- `GET /api/employees`
- `GET /api/catalog`
- `GET /api/assets`
- `POST /api/assets` (create)
- `PUT /api/assets/:id` (update)
- `GET /api/transactions`
- `POST /api/transactions` (create)
- `GET /api/mrs`
- `POST /api/mrs` (create)
- `GET /api/audits`
- `POST /api/audits` (create)
- `PUT /api/audits/:id` (update/finalize)
- `GET /api/logs` (optional `?limit=200`)
- `POST /api/logs` (create)
- `GET /api/settings`, `PUT /api/settings` (Officer)
- `GET /api/users`, `POST /api/users`, `PUT /api/users/:id` (Officer)
- `GET /api/auth/sso/redirect`
- `GET /api/auth/sso/callback` (redirects to frontend)
- `POST /api/auth/logout` (SSO end-session redirect)
- `POST /api/hrms/employees/sync` (Officer)
- `POST /api/hrms/departments/sync` (Officer; syncs HRMS Units as departments)
- `POST /api/maintenance/export` (Officer)
- `POST /api/maintenance/health` (Officer)

> Note: The frontend now uses the API by default (token-based). If auth fails, it falls back to mock data and shows a warning. Ensure `VITE_API_BASE_URL` is set and the backend is running.

### Frontend -> Backend
Create a `.env` in the project root with `VITE_API_BASE_URL=http://localhost:4000`, then run `npm run dev` from the root to have the frontend pull data from the backend.

### Frontend Scripts (root)
```bash
npm install        # install deps
npm run dev        # start Vite dev server (http://localhost:3000)
npm run build      # production build
npm run preview    # preview production build locally
```

## 🚀 Deployment Notes (Railway + Vercel)
- **Railway (API + MySQL):** set `DATABASE_URL`, `JWT_SECRET`, and all SSO variables. Deploy `server/` as the root.
- **Vercel (Frontend):** set `VITE_API_BASE_URL` to your Railway API URL.

## 📂 Project Structure
*   `App.tsx`: Main application controller, routing, and all view components.
*   `types.ts`: TypeScript interfaces for all data entities (Asset, Transaction, Audit, etc.).
*   `constants.ts`: Initial mock data and sample records.
*   `index.tsx`: Entry point.
*   `server/`: Express + Prisma API with MySQL backend.
