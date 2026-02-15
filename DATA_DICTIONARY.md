# Data Dictionary

## Overview
This dictionary reflects the current schema and integration payloads for the ESSU Supply Office PPE and Consumables Management System.

## Conventions
- PK: Primary Key
- FK: Foreign Key
- UQ: Unique
- Nullable: field can be `null`
- Types use Prisma names with MySQL equivalents.

## Local Database Tables

### User
- `id`: String (VARCHAR) | PK | User ID.
- `username`: String (VARCHAR) | UQ | Login identifier (email/username).
- `passwordHash`: String (VARCHAR) | Required | Stored password/random value for SSO-created users.
- `role`: String (VARCHAR) | Required | `Officer` or `Staff`.
- `oauthSub`: String (VARCHAR) | UQ, Nullable | OAuth subject identifier.
- `oauthClientRole`: String (VARCHAR) | Nullable | Last HRMS `client_role` value.
- `lastOauthLoginAt`: DateTime (DATETIME) | Nullable | Last successful SSO timestamp.
- `status`: Enum `Status` | Default `Active`.
- `createdAt`: DateTime (DATETIME) | Auto.
- `updatedAt`: DateTime (DATETIME) | Auto.

### Department (Unit)
- `id`: String (VARCHAR) | PK.
- `code`: String (VARCHAR) | UQ.
- `name`: String (VARCHAR) | Required.
- `head`: String (VARCHAR) | Nullable.
- `locationId`: String (VARCHAR) | FK -> `Location.id` | Nullable.
- `status`: Enum `Status` | Default `Active`.
- `createdAt`: DateTime (DATETIME) | Auto.
- `updatedAt`: DateTime (DATETIME) | Auto.

### Location
- `id`: String (VARCHAR) | PK.
- `code`: String (VARCHAR) | UQ.
- `name`: String (VARCHAR) | Required.
- `description`: String (VARCHAR) | Nullable.
- `status`: Enum `Status` | Default `Active`.
- `createdAt`: DateTime (DATETIME) | Auto.
- `updatedAt`: DateTime (DATETIME) | Auto.

### FundCluster
- `id`: String (VARCHAR) | PK.
- `code`: String (VARCHAR) | UQ.
- `name`: String (VARCHAR) | Required.
- `description`: String (VARCHAR) | Nullable.
- `status`: Enum `Status` | Default `Active`.
- `createdAt`: DateTime (DATETIME) | Auto.
- `updatedAt`: DateTime (DATETIME) | Auto.

### AssetCategory
- `id`: String (VARCHAR) | PK.
- `code`: String (VARCHAR) | UQ.
- `name`: String (VARCHAR) | Required.
- `description`: String (VARCHAR) | Nullable.
- `type`: Enum `CategoryType` | Required.
- `status`: Enum `Status` | Default `Active`.
- `createdAt`: DateTime (DATETIME) | Auto.
- `updatedAt`: DateTime (DATETIME) | Auto.

### CatalogItem
- `id`: String (VARCHAR) | PK.
- `stockNumber`: String (VARCHAR) | UQ.
- `article`: String (VARCHAR) | Required.
- `description`: String (VARCHAR) | Required.
- `categoryId`: String (VARCHAR) | FK -> `AssetCategory.id` | Required.
- `fundClusterId`: String (VARCHAR) | FK -> `FundCluster.id` | Nullable.
- `unit`: String (VARCHAR) | Required.
- `unitValue`: Decimal (DECIMAL) | Nullable.
- `itemType`: Enum `ItemType` | Required.
- `quantity`: Int (INT) | Default `0`.
- `estimatedUsefulLife`: Int (INT) | Nullable.
- `reorderPoint`: Int (INT) | Nullable.
- `status`: Enum `Status` | Default `Active`.
- `createdAt`: DateTime (DATETIME) | Auto.
- `updatedAt`: DateTime (DATETIME) | Auto.

### Employee
- `id`: String (VARCHAR) | PK.
- `employeeId`: String (VARCHAR) | UQ.
- `firstName`: String (VARCHAR) | Required.
- `middleName`: String (VARCHAR) | Nullable.
- `lastName`: String (VARCHAR) | Required.
- `position`: String (VARCHAR) | Nullable.
- `departmentId`: String (VARCHAR) | FK -> `Department.id` | Required.
- `status`: Enum `Status` | Default `Active`.
- `createdAt`: DateTime (DATETIME) | Auto.
- `updatedAt`: DateTime (DATETIME) | Auto.

### Asset
- `id`: String (VARCHAR) | PK.
- `propertyNumber`: String (VARCHAR) | UQ.
- `catalogItemId`: String (VARCHAR) | FK -> `CatalogItem.id` | Required.
- `description`: String (VARCHAR) | Required.
- `unitValue`: Decimal (DECIMAL(14,2)) | Required.
- `quantity`: Int (INT) | Required.
- `dateAcquired`: DateTime (DATETIME) | Required.
- `fundClusterId`: String (VARCHAR) | FK -> `FundCluster.id` | Required.
- `departmentId`: String (VARCHAR) | FK -> `Department.id` | Nullable.
- `custodianId`: String (VARCHAR) | FK -> `Employee.id` | Required.
- `locationId`: String (VARCHAR) | FK -> `Location.id` | Nullable.
- `remarks`: String (VARCHAR) | Nullable.
- `status`: Enum `AssetStatus` | Required (`Active`, `UnderRepair`, `Missing`, `Retired`).
- `imageUrl`: String (VARCHAR) | Nullable.
- `createdAt`: DateTime (DATETIME) | Auto.
- `updatedAt`: DateTime (DATETIME) | Auto.

### Transaction
- `id`: String (VARCHAR) | PK.
- `transactionId`: String (VARCHAR) | UQ.
- `date`: DateTime (DATETIME) | Required.
- `type`: Enum `TransactionType` | Required (`StockIn`, `StockOut`).
- `departmentId`: String (VARCHAR) | FK -> `Department.id` | Nullable.
- `supplier`: String (VARCHAR) | Nullable.
- `referenceNo`: String (VARCHAR) | Nullable.
- `locationId`: String (VARCHAR) | FK -> `Location.id` | Nullable.
- `status`: Enum `TransactionStatus` | Required.
- `remarks`: String (VARCHAR) | Nullable.
- `createdBy`: String (VARCHAR) | Required.
- `createdAt`: DateTime (DATETIME) | Auto.
- `updatedAt`: DateTime (DATETIME) | Auto.

### TransactionItem
- `id`: String (VARCHAR) | PK.
- `transactionId`: String (VARCHAR) | FK -> `Transaction.id` | Required.
- `catalogItemId`: String (VARCHAR) | FK -> `CatalogItem.id` | Required.
- `quantity`: Int (INT) | Required.
- `remarks`: String (VARCHAR) | Nullable.
- `custodianId`: String (VARCHAR) | FK -> `Employee.id` | Nullable.

### MemorandumReceipt
- `id`: String (VARCHAR) | PK.
- `mrNumber`: String (VARCHAR) | UQ.
- `dateIssued`: DateTime (DATETIME) | Required.
- `employeeId`: String (VARCHAR) | FK -> `Employee.id` | Required.
- `departmentId`: String (VARCHAR) | FK -> `Department.id` | Required.
- `status`: Enum `MRStatus` | Required (`Active`, `Closed`).
- `remarks`: String (VARCHAR) | Nullable.
- `createdAt`: DateTime (DATETIME) | Auto.
- `updatedAt`: DateTime (DATETIME) | Auto.

### MRItem
- `id`: String (VARCHAR) | PK.
- `mrId`: String (VARCHAR) | FK -> `MemorandumReceipt.id` | Required.
- `assetId`: String (VARCHAR) | FK -> `Asset.id` | Required.
- `propertyNumber`: String (VARCHAR) | Required (snapshot).
- `description`: String (VARCHAR) | Required (snapshot).
- `unitValue`: Decimal (DECIMAL(14,2)) | Required (snapshot).
- `returnDate`: DateTime (DATETIME) | Nullable.
- `remarks`: String (VARCHAR) | Nullable.

### AuditSession
- `id`: String (VARCHAR) | PK.
- `sessionId`: String (VARCHAR) | UQ.
- `date`: DateTime (DATETIME) | Required.
- `departmentId`: String (VARCHAR) | FK -> `Department.id` | Nullable.
- `locationId`: String (VARCHAR) | FK -> `Location.id` | Nullable.
- `description`: String (VARCHAR) | Required.
- `status`: Enum `AuditSessionStatus` | Required.
- `createdBy`: String (VARCHAR) | Required.
- `createdAt`: DateTime (DATETIME) | Auto.
- `finalizedAt`: DateTime (DATETIME) | Nullable.

### AuditItem
- `id`: String (VARCHAR) | PK.
- `auditId`: String (VARCHAR) | FK -> `AuditSession.id` | Required.
- `assetId`: String (VARCHAR) | FK -> `Asset.id` | Required.
- `propertyNumber`: String (VARCHAR) | Required (snapshot).
- `description`: String (VARCHAR) | Required (snapshot).
- `unitValue`: Decimal (DECIMAL(14,2)) | Required.
- `systemQty`: Int (INT) | Required.
- `actualQty`: Int (INT) | Nullable.
- `shortageOverageQty`: Int (INT) | Required.
- `shortageOverageValue`: Decimal (DECIMAL(14,2)) | Default `0`.
- `status`: Enum `AuditItemStatus` | Required.
- `remarks`: String (VARCHAR) | Nullable.
- `locationName`: String (VARCHAR) | Required (snapshot).
- `custodianName`: String (VARCHAR) | Required (snapshot).

### ActivityLog
- `id`: String (VARCHAR) | PK.
- `timestamp`: DateTime (DATETIME) | Auto.
- `userId`: String (VARCHAR) | FK -> `User.id` | Required in payload; Prisma relation optional.
- `username`: String (VARCHAR) | Required (snapshot).
- `role`: String (VARCHAR) | Required (snapshot).
- `action`: String (VARCHAR) | Required.
- `module`: String (VARCHAR) | Required.
- `referenceId`: String (VARCHAR) | Required.
- `description`: String (VARCHAR) | Required.

### SystemSettings
- `id`: Int (INT) | PK | Singleton (`id=1`).
- `general`: Json (JSON) | Required.
- `inventory`: Json (JSON) | Required.
- `documents`: Json (JSON) | Required.
- `notifications`: Json (JSON) | Required.
- `integrations`: Json (JSON) | Nullable.
- `updatedAt`: DateTime (DATETIME) | Auto.

## Enumerations
- `Status`: `Active`, `Inactive`
- `ItemType`: `PPE`, `Consumable`
- `CategoryType`: `PPE`, `Consumable`, `SemiExpendable`
- `AssetStatus`: `Active`, `Retired`, `UnderRepair`, `Missing`
- `TransactionType`: `StockIn`, `StockOut`
- `TransactionStatus`: `Pending`, `Completed`, `Cancelled`
- `AuditSessionStatus`: `Draft`, `Finalized`
- `AuditItemStatus`: `Matched`, `Shortage`, `Overage`, `Uncounted`
- `MRStatus`: `Active`, `Closed`

## External HRMS/SSO Payloads

### OAuth Userinfo (`/oauth/userinfo`)
- Common fields: `sub`, `email`, `name`, `client_role`, `employee_id`, `employee_number`, `unit`, `position`, `roles[]`, `permissions[]`.
- Login mapping: `client_role=admin` -> local role `Officer`; other values -> `Staff`.

### HRMS Units (`/api/units`)
- Common fields: `id`, `code`, `name`, `unit_type`, `parent_unit_id`, `status`, `is_deleted`, `deleted_at`.
- Sync rule: only `college` and `office` types are imported as local units.

### HRMS Employees (`/api/employees`)
- Common fields: `employee_id`, `employee_number`, `name.*`, `position.*`, `unit`, `employment.status`, `is_deleted`, `deleted_at`.
- Sync rule: employees from program units are mapped to parent college/office unit.

### OAuth Token (`/oauth/token`)
- Fields: `access_token`, `expires_in`, `refresh_token?`.
- Usage: held in server memory per SSO user for HRMS sync calls and SSO logout flow.

## Derived and Behavioral Notes
- Unit and Employee master data are read-only in this app and updated via HRMS sync endpoints.
- SSO logout builds `post_logout_redirect_uri` to frontend with `sso_logged_out=1`.
- MR lifecycle actions are encoded in `MRItem.remarks` and `MRItem.returnDate`:
- Return: `Good`, `For Repair`, `Unserviceable`.
- Transfer: `Transferred`.
- Missing: `Missing`.
- Reports Center computes derived fields such as Availability, Condition, MR Status, Last MR Action, MR activity counts, and custody summaries from `Asset`, `MemorandumReceipt`, and `MRItem` records.
