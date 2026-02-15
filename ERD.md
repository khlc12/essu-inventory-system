# Entity-Relationship Diagram (Textual)

## Scope
This ERD documents the current local MySQL schema plus external HRMS entities used for SSO and sync.

## Local Database Entities

### User
- PK: `id`
- UQ: `username`, `oauthSub` (nullable unique)
- Fields: `passwordHash`, `role`, `oauthClientRole?`, `lastOauthLoginAt?`, `status`, `createdAt`, `updatedAt`
- Relationships: `User` 1..* `ActivityLog`

### Department (Unit)
- PK: `id`
- UQ: `code`
- Fields: `name`, `head?`, `locationId?`, `status`, `createdAt`, `updatedAt`
- FK: `locationId -> Location.id` (nullable)
- Relationships: `Department` 1..* `Employee`, `Asset`, `Transaction`, `MemorandumReceipt`, `AuditSession`

### Location
- PK: `id`
- UQ: `code`
- Fields: `name`, `description?`, `status`, `createdAt`, `updatedAt`
- Relationships: `Location` 1..* `Department`, `Asset`, `Transaction`, `AuditSession`

### FundCluster
- PK: `id`
- UQ: `code`
- Fields: `name`, `description?`, `status`, `createdAt`, `updatedAt`
- Relationships: `FundCluster` 1..* `CatalogItem`, `Asset`

### AssetCategory
- PK: `id`
- UQ: `code`
- Fields: `name`, `description?`, `type`, `status`, `createdAt`, `updatedAt`
- Relationships: `AssetCategory` 1..* `CatalogItem`

### CatalogItem
- PK: `id`
- UQ: `stockNumber`
- Fields: `article`, `description`, `categoryId`, `fundClusterId?`, `unit`, `unitValue?`, `itemType`, `quantity`, `estimatedUsefulLife?`, `reorderPoint?`, `status`, `createdAt`, `updatedAt`
- FK: `categoryId -> AssetCategory.id`, `fundClusterId -> FundCluster.id` (nullable)
- Relationships: `CatalogItem` 1..* `Asset`, `TransactionItem`

### Employee
- PK: `id`
- UQ: `employeeId`
- Fields: `firstName`, `middleName?`, `lastName`, `position?`, `departmentId`, `status`, `createdAt`, `updatedAt`
- FK: `departmentId -> Department.id`
- Relationships: `Employee` 1..* `Asset` (as custodian), `TransactionItem` (optional), `MemorandumReceipt`

### Asset
- PK: `id`
- UQ: `propertyNumber`
- Fields: `catalogItemId`, `description`, `unitValue`, `quantity`, `dateAcquired`, `fundClusterId`, `departmentId?`, `custodianId`, `locationId?`, `remarks?`, `status`, `imageUrl?`, `createdAt`, `updatedAt`
- FK: `catalogItemId -> CatalogItem.id`, `fundClusterId -> FundCluster.id`, `departmentId -> Department.id` (nullable), `custodianId -> Employee.id`, `locationId -> Location.id` (nullable)
- Relationships: `Asset` 1..* `MRItem`, `AuditItem`

### Transaction
- PK: `id`
- UQ: `transactionId`
- Fields: `date`, `type`, `departmentId?`, `supplier?`, `referenceNo?`, `locationId?`, `status`, `remarks?`, `createdBy`, `createdAt`, `updatedAt`
- FK: `departmentId -> Department.id` (nullable), `locationId -> Location.id` (nullable)
- Relationships: `Transaction` 1..* `TransactionItem`

### TransactionItem
- PK: `id`
- Fields: `transactionId`, `catalogItemId`, `quantity`, `remarks?`, `custodianId?`
- FK: `transactionId -> Transaction.id`, `catalogItemId -> CatalogItem.id`, `custodianId -> Employee.id` (nullable)
- Relationships: `TransactionItem` *..1 `Transaction`, *..1 `CatalogItem`, *..1 `Employee` (optional)

### MemorandumReceipt
- PK: `id`
- UQ: `mrNumber`
- Fields: `dateIssued`, `employeeId`, `departmentId`, `status`, `remarks?`, `createdAt`, `updatedAt`
- FK: `employeeId -> Employee.id`, `departmentId -> Department.id`
- Relationships: `MemorandumReceipt` 1..* `MRItem`

### MRItem
- PK: `id`
- Fields: `mrId`, `assetId`, `propertyNumber`, `description`, `unitValue`, `returnDate?`, `remarks?`
- FK: `mrId -> MemorandumReceipt.id`, `assetId -> Asset.id`
- Relationships: `MRItem` *..1 `MemorandumReceipt`, *..1 `Asset`

### AuditSession
- PK: `id`
- UQ: `sessionId`
- Fields: `date`, `departmentId?`, `locationId?`, `description`, `status`, `createdBy`, `createdAt`, `finalizedAt?`
- FK: `departmentId -> Department.id` (nullable), `locationId -> Location.id` (nullable)
- Relationships: `AuditSession` 1..* `AuditItem`

### AuditItem
- PK: `id`
- Fields: `auditId`, `assetId`, `propertyNumber`, `description`, `unitValue`, `systemQty`, `actualQty?`, `shortageOverageQty`, `shortageOverageValue`, `status`, `remarks?`, `locationName`, `custodianName`
- FK: `auditId -> AuditSession.id`, `assetId -> Asset.id`
- Relationships: `AuditItem` *..1 `AuditSession`, *..1 `Asset`

### ActivityLog
- PK: `id`
- Fields: `timestamp`, `userId`, `username`, `role`, `action`, `module`, `referenceId`, `description`
- FK: `userId -> User.id` (nullable relation in Prisma)
- Relationships: `ActivityLog` *..1 `User`

### SystemSettings
- PK: `id` (singleton row, default `1`)
- Fields: `general` (JSON), `inventory` (JSON), `documents` (JSON), `notifications` (JSON), `integrations?` (JSON), `updatedAt`
- Usage: stores OAuth config and latest HRMS sync timestamps (`lastEmployeeSyncAt`, `lastDepartmentSyncAt`).

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

## External HRMS/SSO Entities

### OAuth Userinfo
- Typical fields: `sub`, `email`, `client_role`, `name`, `employee_id`, `employee_number`, `unit`, `position`, `roles[]`, `permissions[]`
- Local usage: identify/upsert user and map app role (`client_role=admin` -> `Officer`, else `Staff`).

### HRMS Unit (`/api/units`)
- Typical fields: `id`, `code`, `name`, `unit_type`, `parent_unit_id`, `status`, `is_deleted`, `deleted_at`
- Local usage: source for `Department` sync, filtered to `college` and `office` types.

### HRMS Employee (`/api/employees`)
- Typical fields: `employee_id`, `employee_number`, `name.*`, `position.*`, `unit`, `employment.status`, `is_deleted`, `deleted_at`
- Local usage: source for `Employee` sync; program units map to parent college/office unit.

### OAuth Token
- Fields: `access_token`, `expires_in`, `refresh_token?`
- Local usage: stored in server memory per authenticated SSO user for HRMS sync and logout operations.

## Operational Relationship Notes
- Department and Employee master data are read-only in this app and maintained via HRMS sync endpoints.
- A Supply Office placeholder employee (`employeeId = SUPPLY-OFFICE`) is used as default/return custodian.
- MR lifecycle updates both `MemorandumReceipt/MRItem` and related `Asset` records.
- At most one active MR assignment per asset is enforced by MR issuance/transfer checks.
