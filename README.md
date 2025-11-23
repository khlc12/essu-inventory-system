# ESSU Supply Office Inventory System

A comprehensive, web-based inventory management prototype designed for the Eastern Samar State University (ESSU) Supply Office. This system digitizes the management of Property, Plant, and Equipment (PPE), consumable supplies, physical audits, and accountability issuance.

## 🎨 Branding
The system adheres to the official ESSU visual identity:
*   **Primary Color:** ESSU Green (`#006400`)
*   **Accent Color:** Gold/Yellow (`#EAB308`)

## 🔑 Access Credentials
*   **Username:** `admin`
*   **Password:** `password`

---

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
*   **Employees:** Granular name fields, Department linking.
*   **Departments:** Head of Office, Location linking.
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

---

## 🛠 Tech Stack
*   **Framework:** React 19
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **State Management:** Local State (Prototype) / In-Memory Mock Data

## 🗄️ Backend (MySQL + Express/Prisma)
A starter backend now lives in `server/` using Express, Prisma ORM, and MySQL.

### Requirements
- Node.js 18+
- MySQL instance (create an empty database, e.g., `essu_inventory`)

### Setup
```bash
cd server
cp .env.example .env   # update DATABASE_URL/JWT_SECRET if needed
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed           # loads the mock data from the existing frontend constants
npm run dev            # starts API on http://localhost:4000
```

### Available endpoints (initial)
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

> Note: The frontend still uses in-memory mock data. You can start wiring it to these endpoints by replacing the `INITIAL_*` state initializers with API calls.

### Frontend -> Backend
Create a `.env` in the project root with `VITE_API_BASE_URL=http://localhost:4000`, then run `npm run dev` from the root to have the frontend pull data from the backend.

## 📂 Project Structure
*   `App.tsx`: Main application controller, routing, and all view components.
*   `types.ts`: TypeScript interfaces for all data entities (Asset, Transaction, Audit, etc.).
*   `constants.ts`: Initial mock data and sample records.
*   `index.tsx`: Entry point.
