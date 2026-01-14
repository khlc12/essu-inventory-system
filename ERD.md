# Entity-Relationship Diagram (Textual)

## Scope
This ERD describes all local database entities from the Inventory and Asset Management System and the external HRMS/SSO entities that integrate via OAuth and sync endpoints.

## Local Database Entities (MySQL)

### User
- **PK**: id
- **UQ**: username
- **Fields**: passwordHash, role, status, createdAt, updatedAt
- **Relationships**: User 1..* ActivityLog

### Department
- **PK**: id
- **UQ**: code
- **Fields**: name, head?, locationId (FK), status, createdAt, updatedAt
- **Relationships**: Department 1..* Employee, Asset, Transaction, MemorandumReceipt, AuditSession
- **FK**: locationId -> Location.id

### Location
- **PK**: id
- **UQ**: code
- **Fields**: name, description?, status, createdAt, updatedAt
- **Relationships**: Location 1..* Department, Asset, Transaction, AuditSession

### FundCluster
- **PK**: id
- **UQ**: code
- **Fields**: name, description?, status, createdAt, updatedAt
- **Relationships**: FundCluster 1..* CatalogItem, Asset

### AssetCategory
- **PK**: id
- **UQ**: code
- **Fields**: name, description?, type, status, createdAt, updatedAt
- **Relationships**: AssetCategory 1..* CatalogItem

### CatalogItem
- **PK**: id
- **UQ**: stockNumber
- **Fields**: article, description, categoryId (FK), fundClusterId? (FK), unit, unitValue?, itemType, quantity, estimatedUsefulLife?, reorderPoint?, status, createdAt, updatedAt
- **Relationships**: CatalogItem 1..* Asset, TransactionItem
- **FK**: categoryId -> AssetCategory.id
- **FK**: fundClusterId -> FundCluster.id (optional)

### Employee
- **PK**: id
- **UQ**: employeeId
- **Fields**: firstName, middleName?, lastName, position?, departmentId (FK), status, createdAt, updatedAt
- **Relationships**: Employee 1..* Asset (custodian), TransactionItem (custodian), MemorandumReceipt
- **FK**: departmentId -> Department.id

### Asset
- **PK**: id
- **UQ**: propertyNumber
- **Fields**: catalogItemId (FK), description, unitValue, quantity, dateAcquired, fundClusterId (FK), departmentId (FK), custodianId (FK), locationId (FK), remarks?, status, imageUrl?, createdAt, updatedAt
- **Relationships**: Asset 1..* MRItem, AuditItem
- **FK**: catalogItemId -> CatalogItem.id
- **FK**: fundClusterId -> FundCluster.id
- **FK**: departmentId -> Department.id
- **FK**: custodianId -> Employee.id
- **FK**: locationId -> Location.id

### Transaction
- **PK**: id
- **UQ**: transactionId
- **Fields**: date, type, departmentId? (FK), supplier?, referenceNo?, locationId? (FK), status, remarks?, createdBy, createdAt, updatedAt
- **Relationships**: Transaction 1..* TransactionItem
- **FK**: departmentId -> Department.id (optional)
- **FK**: locationId -> Location.id (optional)

### TransactionItem
- **PK**: id
- **Fields**: transactionId (FK), catalogItemId (FK), quantity, remarks?, custodianId? (FK)
- **Relationships**: TransactionItem *..1 Transaction, *..1 CatalogItem, *..1 Employee (optional)
- **FK**: transactionId -> Transaction.id
- **FK**: catalogItemId -> CatalogItem.id
- **FK**: custodianId -> Employee.id (optional)

### MemorandumReceipt
- **PK**: id
- **UQ**: mrNumber
- **Fields**: dateIssued, employeeId (FK), departmentId (FK), status, remarks?, createdAt, updatedAt
- **Relationships**: MemorandumReceipt 1..* MRItem
- **FK**: employeeId -> Employee.id
- **FK**: departmentId -> Department.id

### MRItem
- **PK**: id
- **Fields**: mrId (FK), assetId (FK), propertyNumber, description, unitValue, returnDate?, remarks?
- **Relationships**: MRItem *..1 MemorandumReceipt, *..1 Asset
- **FK**: mrId -> MemorandumReceipt.id
- **FK**: assetId -> Asset.id

### AuditSession
- **PK**: id
- **UQ**: sessionId
- **Fields**: date, departmentId? (FK), locationId? (FK), description, status, createdBy, createdAt, finalizedAt?
- **Relationships**: AuditSession 1..* AuditItem
- **FK**: departmentId -> Department.id (optional)
- **FK**: locationId -> Location.id (optional)

### AuditItem
- **PK**: id
- **Fields**: auditId (FK), assetId (FK), propertyNumber, description, unitValue, systemQty, actualQty?, shortageOverageQty, shortageOverageValue, status, remarks?, locationName, custodianName
- **Relationships**: AuditItem *..1 AuditSession, *..1 Asset
- **FK**: auditId -> AuditSession.id
- **FK**: assetId -> Asset.id

### ActivityLog
- **PK**: id
- **Fields**: timestamp, userId (FK), username, role, action, module, referenceId, description
- **Relationships**: ActivityLog *..1 User
- **FK**: userId -> User.id

### SystemSettings
- **PK**: id (fixed: 1)
- **Fields**: general (JSON), inventory (JSON), documents (JSON), notifications (JSON), integrations (JSON?), updatedAt

## Enumerations
- **Status**: Active, Inactive
- **ItemType**: PPE, Consumable
- **CategoryType**: PPE, Consumable, SemiExpendable
- **AssetStatus**: Active, Retired, UnderRepair, Missing
- **TransactionType**: StockIn, StockOut
- **TransactionStatus**: Pending, Completed, Cancelled
- **AuditSessionStatus**: Draft, Finalized
- **AuditItemStatus**: Matched, Shortage, Overage, Uncounted
- **MRStatus**: Active, Closed

## External HRMS/SSO Entities

### HRMS Userinfo (OAuth /userinfo)
- **Fields**: sub, name, email, employee_id, employee_number, first_name, last_name, middle_name, department, position, roles[], permissions[]
- **Usage**: authorizes access, maps to local User (username + role)

### HRMS Employee (HRMS API)
- **Fields**: employee_id, employee_number, first_name, middle_name, last_name, department, position, status, is_deleted, deleted_at
- **Usage**: sync source for local Employee; department name maps to local Department

### HRMS Department (HRMS API)
- **Fields**: code?, name, description?, status, is_deleted, deleted_at
- **Usage**: sync source for local Department

### OAuth Token (HRMS)
- **Fields**: access_token, expires_in, refresh_token? (provider-specific)
- **Usage**: stored in server memory for HRMS API calls and SSO logout

## Cross-System Relationships (Sync/Integration)
- **HRMS Userinfo -> Local User**: SSO login upserts User and assigns role (Officer/Staff).
- **HRMS Employee -> Local Employee**: sync upserts Employee and links to Department.
- **HRMS Department -> Local Department**: sync upserts Department (code/name/status).
- **OAuth Token -> HRMS API Access**: enables employee/department sync and SSO logout.
