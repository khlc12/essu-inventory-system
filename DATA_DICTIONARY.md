# Data Dictionary

## Overview
This data dictionary documents the local MySQL database schema used by the Inventory and Asset Management System, plus the external HRMS/SSO payloads consumed during authentication and sync.

## Conventions
- **PK**: Primary key
- **FK**: Foreign key
- **UQ**: Unique
- **Nullable**: Field may be null
- Types are listed in Prisma terms with typical MySQL equivalents in parentheses.

## Local Database Tables

### User
- **id**: String (VARCHAR) | PK | System user identifier.
- **username**: String (VARCHAR) | UQ | Login username (email or SSO subject).
- **passwordHash**: String (VARCHAR) | Required | Password (seeded/local login only).
- **role**: String (VARCHAR) | Required | `Officer` or `Staff`.
- **status**: Status (ENUM) | Default `Active` | Account status.
- **createdAt**: DateTime (DATETIME) | Auto | Created timestamp.
- **updatedAt**: DateTime (DATETIME) | Auto | Updated timestamp.

### Department
- **id**: String (VARCHAR) | PK | Department identifier.
- **code**: String (VARCHAR) | UQ | Department code.
- **name**: String (VARCHAR) | Required | Department name.
- **head**: String (VARCHAR) | Nullable | Department head name.
- **locationId**: String (VARCHAR) | FK -> Location.id | Nullable | Location reference.
- **status**: Status (ENUM) | Default `Active` | Department status.
- **createdAt**: DateTime (DATETIME) | Auto | Created timestamp.
- **updatedAt**: DateTime (DATETIME) | Auto | Updated timestamp.

### Location
- **id**: String (VARCHAR) | PK | Location identifier.
- **code**: String (VARCHAR) | UQ | Location code.
- **name**: String (VARCHAR) | Required | Location name.
- **description**: String (VARCHAR) | Nullable | Location details.
- **status**: Status (ENUM) | Default `Active` | Location status.
- **createdAt**: DateTime (DATETIME) | Auto | Created timestamp.
- **updatedAt**: DateTime (DATETIME) | Auto | Updated timestamp.

### FundCluster
- **id**: String (VARCHAR) | PK | Fund cluster identifier.
- **code**: String (VARCHAR) | UQ | Fund code.
- **name**: String (VARCHAR) | Required | Fund name.
- **description**: String (VARCHAR) | Nullable | Fund details.
- **status**: Status (ENUM) | Default `Active` | Fund status.
- **createdAt**: DateTime (DATETIME) | Auto | Created timestamp.
- **updatedAt**: DateTime (DATETIME) | Auto | Updated timestamp.

### AssetCategory
- **id**: String (VARCHAR) | PK | Category identifier.
- **code**: String (VARCHAR) | UQ | Category code.
- **name**: String (VARCHAR) | Required | Category name.
- **description**: String (VARCHAR) | Nullable | Category details.
- **type**: CategoryType (ENUM) | Required | PPE/Consumable/SemiExpendable.
- **status**: Status (ENUM) | Default `Active` | Category status.
- **createdAt**: DateTime (DATETIME) | Auto | Created timestamp.
- **updatedAt**: DateTime (DATETIME) | Auto | Updated timestamp.

### CatalogItem
- **id**: String (VARCHAR) | PK | Catalog item identifier.
- **stockNumber**: String (VARCHAR) | UQ | Stock number.
- **article**: String (VARCHAR) | Required | Item article.
- **description**: String (VARCHAR) | Required | Item description.
- **categoryId**: String (VARCHAR) | FK -> AssetCategory.id | Required | Category reference.
- **fundClusterId**: String (VARCHAR) | FK -> FundCluster.id | Nullable | Fund reference.
- **unit**: String (VARCHAR) | Required | Unit of measure.
- **unitValue**: Decimal (DECIMAL) | Nullable | Unit cost.
- **itemType**: ItemType (ENUM) | Required | PPE or Consumable.
- **quantity**: Int (INT) | Default 0 | On-hand stock (consumables).
- **estimatedUsefulLife**: Int (INT) | Nullable | EUL in years (PPE).
- **reorderPoint**: Int (INT) | Nullable | Reorder threshold.
- **status**: Status (ENUM) | Default `Active` | Catalog status.
- **createdAt**: DateTime (DATETIME) | Auto | Created timestamp.
- **updatedAt**: DateTime (DATETIME) | Auto | Updated timestamp.

### Employee
- **id**: String (VARCHAR) | PK | Employee identifier.
- **employeeId**: String (VARCHAR) | UQ | Employee number/id.
- **firstName**: String (VARCHAR) | Required | First name.
- **middleName**: String (VARCHAR) | Nullable | Middle name.
- **lastName**: String (VARCHAR) | Required | Last name.
- **position**: String (VARCHAR) | Nullable | Job title.
- **departmentId**: String (VARCHAR) | FK -> Department.id | Required | Department reference.
- **status**: Status (ENUM) | Default `Active` | Employee status.
- **createdAt**: DateTime (DATETIME) | Auto | Created timestamp.
- **updatedAt**: DateTime (DATETIME) | Auto | Updated timestamp.

### Asset
- **id**: String (VARCHAR) | PK | Asset identifier.
- **propertyNumber**: String (VARCHAR) | UQ | Property number.
- **catalogItemId**: String (VARCHAR) | FK -> CatalogItem.id | Required | Catalog reference.
- **description**: String (VARCHAR) | Required | Asset description.
- **unitValue**: Decimal (DECIMAL) | Required | Unit value.
- **quantity**: Int (INT) | Required | Quantity.
- **dateAcquired**: DateTime (DATETIME) | Required | Acquisition date.
- **fundClusterId**: String (VARCHAR) | FK -> FundCluster.id | Required | Fund reference.
- **departmentId**: String (VARCHAR) | FK -> Department.id | Required | Department reference.
- **custodianId**: String (VARCHAR) | FK -> Employee.id | Required | Custodian reference.
- **locationId**: String (VARCHAR) | FK -> Location.id | Required | Location reference.
- **remarks**: String (VARCHAR) | Nullable | Notes.
- **status**: AssetStatus (ENUM) | Required | Asset status.
- **imageUrl**: String (VARCHAR) | Nullable | Image URL.
- **createdAt**: DateTime (DATETIME) | Auto | Created timestamp.
- **updatedAt**: DateTime (DATETIME) | Auto | Updated timestamp.

### Transaction
- **id**: String (VARCHAR) | PK | Transaction identifier.
- **transactionId**: String (VARCHAR) | UQ | Transaction number.
- **date**: DateTime (DATETIME) | Required | Transaction date.
- **type**: TransactionType (ENUM) | Required | StockIn/StockOut.
- **departmentId**: String (VARCHAR) | FK -> Department.id | Nullable | Department reference.
- **supplier**: String (VARCHAR) | Nullable | Supplier/manufacturer.
- **referenceNo**: String (VARCHAR) | Nullable | Reference number.
- **locationId**: String (VARCHAR) | FK -> Location.id | Nullable | Location reference.
- **status**: TransactionStatus (ENUM) | Required | Status.
- **remarks**: String (VARCHAR) | Nullable | Notes.
- **createdBy**: String (VARCHAR) | Required | Creator label.
- **createdAt**: DateTime (DATETIME) | Auto | Created timestamp.
- **updatedAt**: DateTime (DATETIME) | Auto | Updated timestamp.

### TransactionItem
- **id**: String (VARCHAR) | PK | Transaction item identifier.
- **transactionId**: String (VARCHAR) | FK -> Transaction.id | Required | Transaction reference.
- **catalogItemId**: String (VARCHAR) | FK -> CatalogItem.id | Required | Catalog reference.
- **quantity**: Int (INT) | Required | Quantity.
- **remarks**: String (VARCHAR) | Nullable | Notes.
- **custodianId**: String (VARCHAR) | FK -> Employee.id | Nullable | Custodian reference.

### MemorandumReceipt
- **id**: String (VARCHAR) | PK | MR identifier.
- **mrNumber**: String (VARCHAR) | UQ | MR number.
- **dateIssued**: DateTime (DATETIME) | Required | Issue date.
- **employeeId**: String (VARCHAR) | FK -> Employee.id | Required | Employee reference.
- **departmentId**: String (VARCHAR) | FK -> Department.id | Required | Department reference.
- **status**: MRStatus (ENUM) | Required | Status.
- **remarks**: String (VARCHAR) | Nullable | Notes.
- **createdAt**: DateTime (DATETIME) | Auto | Created timestamp.
- **updatedAt**: DateTime (DATETIME) | Auto | Updated timestamp.

### MRItem
- **id**: String (VARCHAR) | PK | MR item identifier.
- **mrId**: String (VARCHAR) | FK -> MemorandumReceipt.id | Required | MR reference.
- **assetId**: String (VARCHAR) | FK -> Asset.id | Required | Asset reference.
- **propertyNumber**: String (VARCHAR) | Required | Property number (snapshot).
- **description**: String (VARCHAR) | Required | Description (snapshot).
- **unitValue**: Decimal (DECIMAL) | Required | Unit value (snapshot).
- **returnDate**: DateTime (DATETIME) | Nullable | Return date.
- **remarks**: String (VARCHAR) | Nullable | Notes.

### AuditSession
- **id**: String (VARCHAR) | PK | Audit session identifier.
- **sessionId**: String (VARCHAR) | UQ | Session number.
- **date**: DateTime (DATETIME) | Required | Audit date.
- **departmentId**: String (VARCHAR) | FK -> Department.id | Nullable | Department scope.
- **locationId**: String (VARCHAR) | FK -> Location.id | Nullable | Location scope.
- **description**: String (VARCHAR) | Required | Description.
- **status**: AuditSessionStatus (ENUM) | Required | Status.
- **createdBy**: String (VARCHAR) | Required | Creator label.
- **createdAt**: DateTime (DATETIME) | Auto | Created timestamp.
- **finalizedAt**: DateTime (DATETIME) | Nullable | Finalized timestamp.

### AuditItem
- **id**: String (VARCHAR) | PK | Audit item identifier.
- **auditId**: String (VARCHAR) | FK -> AuditSession.id | Required | Audit session reference.
- **assetId**: String (VARCHAR) | FK -> Asset.id | Required | Asset reference.
- **propertyNumber**: String (VARCHAR) | Required | Property number (snapshot).
- **description**: String (VARCHAR) | Required | Description (snapshot).
- **unitValue**: Decimal (DECIMAL) | Required | Unit value (snapshot).
- **systemQty**: Int (INT) | Required | System quantity.
- **actualQty**: Int (INT) | Nullable | Actual quantity.
- **shortageOverageQty**: Int (INT) | Required | Variance quantity.
- **shortageOverageValue**: Decimal (DECIMAL) | Required | Variance value.
- **status**: AuditItemStatus (ENUM) | Required | Status.
- **remarks**: String (VARCHAR) | Nullable | Notes.
- **locationName**: String (VARCHAR) | Required | Location name (snapshot).
- **custodianName**: String (VARCHAR) | Required | Custodian name (snapshot).

### ActivityLog
- **id**: String (VARCHAR) | PK | Log entry identifier.
- **timestamp**: DateTime (DATETIME) | Auto | Log timestamp.
- **userId**: String (VARCHAR) | FK -> User.id | Required | User reference.
- **username**: String (VARCHAR) | Required | Username snapshot.
- **role**: String (VARCHAR) | Required | Role snapshot.
- **action**: String (VARCHAR) | Required | Action label.
- **module**: String (VARCHAR) | Required | Module name.
- **referenceId**: String (VARCHAR) | Required | Related record id.
- **description**: String (VARCHAR) | Required | Description.

### SystemSettings
- **id**: Int (INT) | PK | Singleton row (id = 1).
- **general**: Json (JSON) | Required | General settings.
- **inventory**: Json (JSON) | Required | Inventory rules.
- **documents**: Json (JSON) | Required | Document defaults.
- **notifications**: Json (JSON) | Required | Notification settings.
- **integrations**: Json (JSON) | Nullable | Integration metadata (e.g., last sync timestamps).
- **updatedAt**: DateTime (DATETIME) | Auto | Updated timestamp.

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

## External HRMS/SSO Payloads (Reference)

### HRMS Userinfo (OAuth /userinfo)
- **sub**: String | Subject identifier.
- **name**: String | Full name.
- **email**: String | Email address.
- **employee_id**: String | HRMS employee id.
- **employee_number**: String | HRMS employee number.
- **first_name**: String | First name.
- **last_name**: String | Last name.
- **middle_name**: String | Middle name.
- **department**: String | Department name.
- **position**: String | Position/job title.
- **roles**: String[] | HRMS roles.
- **permissions**: String[] | HRMS permissions.

### HRMS Employee (HRMS API)
- **employee_id**: String | Employee id (unique in HRMS).
- **employee_number**: String | Employee number.
- **first_name**: String | First name.
- **middle_name**: String | Middle name.
- **last_name**: String | Last name.
- **department**: String | Department name.
- **position**: String | Position/job title.
- **status**: String | Employment status.
- **is_deleted**: Boolean | Soft-delete flag.
- **deleted_at**: DateTime | Deleted timestamp.

### HRMS Department (HRMS API)
- **code**: String | Department code (optional).
- **name**: String | Department name.
- **description**: String | Description (optional).
- **status**: String | Status.
- **is_deleted**: Boolean | Soft-delete flag.
- **deleted_at**: DateTime | Deleted timestamp.

### OAuth Token (HRMS)
- **access_token**: String | Bearer token used for API calls.
- **expires_in**: Int | Token lifetime (seconds).
- **refresh_token**: String | Optional refresh token (provider-specific).
