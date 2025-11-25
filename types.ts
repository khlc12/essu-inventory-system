
export type AuditStatus = 'Matched' | 'Shortage' | 'Overage' | 'Uncounted';

export type ViewState = 
  | 'dashboard' 
  | 'audit-list' 
  | 'audit-new'
  | 'audit-detail'
  | 'reports' 
  | 'settings' 
  | 'activity-logs'
  | 'mdm-departments' 
  | 'mdm-employees' 
  | 'mdm-locations' 
  | 'mdm-funds' 
  | 'mdm-categories' 
  | 'mdm-ppe' 
  | 'mdm-consumables'
  | 'transactions-list'
  | 'transactions-new'
  | 'transactions-detail'
  | 'asset-registry'
  | 'asset-new'
  | 'asset-detail'
  | 'asset-edit'
  | 'mr-list'
  | 'mr-new'
  | 'mr-detail';

export interface InventoryItem {
  id: string;
  article: string;
  description: string;
  propertyNumber: string;
  unit: string;
  unitValue: number;
  qtyPerCard: number;
  qtyPerCount: number | null; // Null allows us to track "uncounted" items vs "0" items
  shortageOverageQty?: number;
  shortageOverageValue?: number;
  receiptedBy: string;
  location: string;
  dateAcquired: string;
  remarks?: string;
  lastUpdated?: string;
}

export interface DashboardStats {
  totalValue: number;
  totalItems: number;
  itemsAudited: number;
  shortageValue: number;
}

// --- Master Data Types ---

export interface Department {
  id: string;
  code: string;
  name: string;
  head?: string; // Department Head
  locationId?: string; // Main Office Location
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  position?: string;
  departmentId: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface FundCluster {
  id: string;
  code: string;
  name: string; // e.g. Regular Agency Fund
  description?: string; // Internal notes
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'PPE' | 'Consumable' | 'Semi-Expendable';
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogItem {
  id: string;
  stockNumber: string;
  article: string;
  description: string;
  categoryId: string;
  fundClusterId?: string; // Default/Preferred Fund Cluster
  unit: string;
  unitValue?: number; // Standard/Average Cost
  itemType: 'PPE' | 'Consumable';
  quantity: number; // Current Stock on Hand
  // PPE specific
  estimatedUsefulLife?: number; // in years
  // Consumable specific
  reorderPoint?: number;
  status: 'Active' | 'Inactive';
}

// --- Stock Transaction Types ---

export type TransactionType = 'Stock In' | 'Stock Out';
export type TransactionStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface TransactionItem {
  id: string;
  catalogItemId: string;
  quantity: number;
  remarks?: string;
  custodianId?: string; // Optional: Link to Employee for PPE Stock Out
}

export interface Transaction {
  id: string;
  transactionId: string; // Readable ID e.g. TXN-2024-001
  date: string;
  type: TransactionType;
  departmentId?: string; // Requester (Stock Out) or Source
  supplier?: string; // For Stock In
  referenceNo?: string; // PO/DR/Invoice
  locationId?: string;
  items: TransactionItem[];
  status: TransactionStatus;
  remarks?: string;
  createdBy: string;
  createdAt: string;
}

// --- Asset Registry Types ---

export type AssetStatus = 'Active' | 'Retired' | 'Under Repair' | 'Missing';

export interface Asset {
  id: string;
  propertyNumber: string;
  catalogItemId: string; // Links to PPE Item in Catalog
  description: string; // Specific description
  unitValue: number;
  quantity: number; // Usually 1 for PPE
  dateAcquired: string;
  fundClusterId: string;
  departmentId: string;
  custodianId: string;
  locationId: string;
  remarks?: string;
  status: AssetStatus;
  imageUrl?: string;
}

// --- Memorandum Receipt (MR) Types ---

export type MRStatus = 'Active' | 'Closed';

export interface MRItem {
  assetId: string;
  propertyNumber: string;
  description: string;
  unitValue: number;
  returnDate?: string;
  remarks?: string;
}

export interface MemorandumReceipt {
  id: string;
  mrNumber: string;
  dateIssued: string;
  employeeId: string;
  departmentId: string;
  items: MRItem[];
  status: MRStatus;
  remarks?: string;
}

// --- Physical Count / Audit Types ---

export type AuditSessionStatus = 'Draft' | 'Finalized';

export interface AuditItem {
  assetId: string;
  propertyNumber: string;
  description: string;
  unitValue: number;
  systemQty: number; // Qty per Card
  actualQty: number | null; // Physical Count
  shortageOverageQty: number;
  shortageOverageValue: number;
  status: AuditStatus;
  remarks?: string;
  // Snapshot data for reporting
  locationName: string;
  custodianName: string;
}

export interface AuditSession {
  id: string;
  sessionId: string; // e.g. PC-2024-001
  date: string;
  departmentId?: string;
  locationId?: string;
  description: string;
  items: AuditItem[];
  status: AuditSessionStatus;
  createdBy: string;
  createdAt: string;
  finalizedAt?: string;
}

// --- Activity Log Types ---

export interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  role: string;
  action: string; // e.g. 'Created Asset', 'Issued MR'
  module: string; // e.g. 'Asset Registry', 'Reports'
  referenceId: string; // e.g. Transaction No, Property No
  description: string; // Details of the action
}

// --- Users ---
export interface AppUser {
  id: string;
  username: string;
  role: 'Officer' | 'Staff';
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

// --- System Settings Type ---

export interface SystemSettings {
  general: {
    systemName: string;
    departmentName: string;
    footerText: string;
    logoUrl: string;
  };
  inventory: {
    defaultReorderThreshold: number;
    enablePartialPhysicalCount: boolean;
    defaultAssetStatus: string;
  };
  documents: {
    includeLogoInPDF: boolean;
    preparedBy: string;
    receivedBy: string;
    verifiedBy: string;
  };
  notifications: {
    enableLowStockAlerts: boolean;
    enableInactivityWarning: boolean;
    alertType: 'Toast' | 'Badge' | 'Modal';
  };
}

// --- Notification Types ---

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
  link?: ViewState;
}
