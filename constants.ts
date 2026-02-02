
import { InventoryItem, Department, Employee, Location, FundCluster, AssetCategory, CatalogItem, Transaction, Asset, MemorandumReceipt, AuditSession, LogEntry, SystemSettings, AppNotification } from './types';

// --- Audit Data ---
export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: '16-09-0630',
    article: 'Aircon',
    description: 'Package Type Air Conditioners, 3 HP, Markers Cabinet type 3TR (Lab & AV Rooms). Indoor/Outdoor unit included.',
    propertyNumber: '16-09-0630',
    unit: 'unit',
    unitValue: 110000.00,
    qtyPerCard: 1,
    qtyPerCount: 1,
    receiptedBy: 'Arnel Balbin',
    location: 'COED',
    dateAcquired: '26/09/2016',
  },
  {
    id: '16-09-0631',
    article: 'Aircon',
    description: 'Package Type Air Conditioners, 3 HP. Indoor/Outdoor unit included.',
    propertyNumber: '16-09-0631',
    unit: 'unit',
    unitValue: 110000.00,
    qtyPerCard: 1,
    qtyPerCount: 1,
    receiptedBy: 'Arnel Balbin',
    location: 'COED',
    dateAcquired: '26/09/2016',
  },
  {
    id: '16-09-0632',
    article: 'Aircon',
    description: 'Package Type Air Conditioners, 3 HP. Indoor/Outdoor unit included.',
    propertyNumber: '16-09-0632',
    unit: 'unit',
    unitValue: 110000.00,
    qtyPerCard: 1,
    qtyPerCount: null,
    receiptedBy: 'Sharon Singzon',
    location: 'Graduate School',
    dateAcquired: '26/09/2016',
  },
  {
    id: '16-09-0629',
    article: 'Aircon',
    description: 'Package Type Air Conditioners, 3 HP (Lab & AV Rms). Indoor/Outdoor unit included.',
    propertyNumber: '16-09-0629',
    unit: 'unit',
    unitValue: 110000.00,
    qtyPerCard: 1,
    qtyPerCount: null,
    receiptedBy: 'Kenneth Rey Afable',
    location: 'IT Laboratory',
    dateAcquired: '26/09/2016',
  },
  {
    id: '16-09-0633',
    article: 'Aircon',
    description: 'Indoor Unit for Split Type AC',
    propertyNumber: '16-09-0633',
    unit: 'unit',
    unitValue: 45000.00,
    qtyPerCard: 1,
    qtyPerCount: null,
    receiptedBy: 'Nasser Calapano',
    location: 'College of Law',
    dateAcquired: '26/09/2016',
  },
  {
    id: '16-09-0634',
    article: 'Aircon',
    description: 'Outdoor Unit for Split Type AC',
    propertyNumber: '16-09-0634',
    unit: 'unit',
    unitValue: 65000.00,
    qtyPerCard: 1,
    qtyPerCount: null,
    receiptedBy: 'Mark Kevin Anacio',
    location: 'College of Law',
    dateAcquired: '26/09/2016',
  },
  {
    id: '16-09-0635',
    article: 'Aircon',
    description: 'Package Type Air Conditioners, 3 hp (Lab & AV Rms)',
    propertyNumber: '16-09-0635',
    unit: 'unit',
    unitValue: 110000.00,
    qtyPerCard: 1,
    qtyPerCount: 0,
    receiptedBy: 'Rowena Capada',
    location: 'CCS',
    dateAcquired: '26/09/2016',
    remarks: 'Item not found in room 301',
  },
  {
    id: '16-09-0636',
    article: 'Aircon',
    description: 'Package Type Air Conditioners, 3 hp (Lab & AV Rms)',
    propertyNumber: '16-09-0636',
    unit: 'unit',
    unitValue: 110000.00,
    qtyPerCard: 1,
    qtyPerCount: null,
    receiptedBy: 'Rowena Capada',
    location: 'CCS',
    dateAcquired: '26/09/2016',
  },
];

// --- Master Data Mocks ---

export const INITIAL_LOCATIONS: Location[] = [
  { id: '1', code: 'RM301', name: 'ComLab 1', description: 'IT Building 3rd Floor', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '2', code: 'RM302', name: 'ComLab 2', description: 'IT Building 3rd Floor', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '3', code: 'AVR', name: 'Audio Visual Room', description: 'Main Library G/F', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '4', code: 'FAC', name: 'Faculty Room', description: 'Admin Building 2nd Floor', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '5', code: 'COED-OFF', name: 'Dean Office', description: 'Educ Building', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '6', code: 'SUP-OFF', name: 'Supply Office Main', description: 'Admin Building G/F', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '7', code: 'ENG-LAB', name: 'Engineering Lab', description: 'Engineering Building', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: '1', code: 'COED', name: 'College of Education', head: 'Dr. Sharon Singzon', locationId: '5', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '2', code: 'CCS', name: 'College of Computer Studies', head: 'Prof. Rowena Capada', locationId: '1', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '3', code: 'CBMA', name: 'College of Business Mgt & Accountancy', locationId: '4', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '4', code: 'CAS', name: 'College of Arts and Sciences', locationId: '4', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '5', code: 'CON', name: 'College of Nursing', locationId: '4', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '6', code: 'ADMIN', name: 'Administrative Services', locationId: '4', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '7', code: 'SUPPLY', name: 'Supply Office', head: 'Jeffrey Meneses', locationId: '6', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '8', code: 'COE', name: 'College of Engineering', locationId: '7', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'SUPPLY-OFFICE', employeeId: 'SUPPLY-OFFICE', firstName: 'Supply Office', lastName: 'Custodian', middleName: '', position: 'Supply Office', departmentId: 'SUPPLY', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '1', employeeId: 'E001', firstName: 'Jeffrey', lastName: 'Meneses', middleName: '', position: 'Admin Officer V', departmentId: 'ADMIN', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '2', employeeId: 'E002', firstName: 'Arnel', lastName: 'Balbin', middleName: 'S', position: 'Instructor I', departmentId: 'COED', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '3', employeeId: 'E003', firstName: 'Sharon', lastName: 'Singzon', middleName: 'L', position: 'Dean', departmentId: 'COED', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '4', employeeId: 'E004', firstName: 'Rowena', lastName: 'Capada', middleName: '', position: 'Assoc. Professor', departmentId: 'CCS', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '5', employeeId: 'E005', firstName: 'Kenneth Rey', lastName: 'Afable', middleName: '', position: 'IT Technician', departmentId: 'CCS', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '6', employeeId: 'E006', firstName: 'Nasser', lastName: 'Calapano', middleName: '', position: 'Instructor', departmentId: 'CAS', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
];

export const INITIAL_FUNDS: FundCluster[] = [
  { id: '1', code: '101', name: 'Regular Agency Fund', description: 'General Fund', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '2', code: '164', name: 'Special Trust Fund', description: 'STF', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '3', code: '184', name: 'Income Generating Projects', description: 'IGP', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
];

export const INITIAL_CATEGORIES: AssetCategory[] = [
  { id: '1', code: '0605020', name: 'IT Equipment', description: 'Computers, Printers, Peripherals', type: 'PPE', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '2', code: '0605030', name: 'Office Equipment', description: 'Aircons, Copiers, Calculators', type: 'PPE', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '3', code: '0605070', name: 'Furniture & Fixtures', description: 'Chairs, Tables, Cabinets', type: 'PPE', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '4', code: 'SUP-OFF', name: 'Office Supplies', description: 'Paper, Pens, Staplers', type: 'Consumable', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
  { id: '5', code: 'SUP-IT', name: 'IT Supplies', description: 'Ink, Toner, Flash Drives', type: 'Consumable', status: 'Active', createdAt: '2023-01-01T00:00:00Z' },
];

export const INITIAL_CATALOG: CatalogItem[] = [
  { id: '1', stockNumber: 'IT-001', article: 'Laptop', description: 'Laptop, Core i5, 8GB RAM, 512GB SSD', categoryId: '0605020', fundClusterId: '2', unit: 'unit', unitValue: 45000, itemType: 'PPE', quantity: 5, estimatedUsefulLife: 5, status: 'Active' },
  { id: '2', stockNumber: 'IT-002', article: 'Printer', description: 'Multifunction Inkjet Printer', categoryId: '0605020', fundClusterId: '2', unit: 'unit', unitValue: 8500, itemType: 'PPE', quantity: 3, estimatedUsefulLife: 5, status: 'Active' },
  { id: '3', stockNumber: 'OE-001', article: 'Aircon', description: 'Package Type Air Conditioners, 3 HP', categoryId: '0605030', fundClusterId: '1', unit: 'unit', unitValue: 110000, itemType: 'PPE', quantity: 2, estimatedUsefulLife: 7, status: 'Active' },
  { id: '4', stockNumber: 'SUP-001', article: 'Bond Paper', description: 'Bond Paper, A4, Sub 20', categoryId: 'SUP-OFF', fundClusterId: '1', unit: 'ream', unitValue: 250, itemType: 'Consumable', quantity: 150, reorderPoint: 50, status: 'Active' },
  { id: '5', stockNumber: 'SUP-002', article: 'Ink Cartridge', description: 'Ink Cartridge, Black, HP 680', categoryId: 'SUP-IT', fundClusterId: '1', unit: 'cart', unitValue: 450, itemType: 'Consumable', quantity: 24, reorderPoint: 20, status: 'Active' },
];

// --- Transaction Mocks ---

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-1',
    transactionId: 'TXN-2024-001',
    date: '2024-01-15',
    type: 'Stock In',
    departmentId: 'SUPPLY',
    items: [
      { id: 't1', catalogItemId: '4', quantity: 100, remarks: 'Q1 Supply Replenishment' }
    ],
    status: 'Completed',
    remarks: 'Received from supplier',
    createdBy: 'Jeffrey Meneses',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 'TX-2',
    transactionId: 'TXN-2024-002',
    date: '2024-01-20',
    type: 'Stock Out',
    departmentId: 'CCS',
    items: [
      { id: 't2', catalogItemId: '4', quantity: 10, remarks: 'For Midterm Exams' },
      { id: 't3', catalogItemId: '5', quantity: 2, remarks: 'Faculty Room Printer' }
    ],
    status: 'Completed',
    remarks: 'Received by Dean',
    createdBy: 'Jeffrey Meneses',
    createdAt: '2024-01-20T10:30:00Z'
  }
];

// --- Asset Registry Mocks ---

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'A1',
    propertyNumber: '16-09-0630',
    catalogItemId: '3', // Aircon
    description: 'Package Type Air Conditioners, 3 HP, Markers Cabinet type 3TR (Lab & AV Rooms).',
    unitValue: 110000.00,
    quantity: 1,
    dateAcquired: '2016-09-26',
    fundClusterId: '1', // RAF
    departmentId: '1', // COED
    custodianId: '2', // Arnel Balbin
    locationId: '5', // COED Dean Office
    status: 'Active'
  },
  {
    id: 'A2',
    propertyNumber: '16-09-0631',
    catalogItemId: '3',
    description: 'Package Type Air Conditioners, 3 HP.',
    unitValue: 110000.00,
    quantity: 1,
    dateAcquired: '2016-09-26',
    fundClusterId: '1',
    departmentId: '1',
    custodianId: '2',
    locationId: '5', // COED Dean Office
    status: 'Active'
  },
  {
    id: 'A3',
    propertyNumber: '16-09-0635',
    catalogItemId: '3',
    description: 'Package Type Air Conditioners, 3 hp (Lab & AV Rms)',
    unitValue: 110000.00,
    quantity: 1,
    dateAcquired: '2016-09-26',
    fundClusterId: '1',
    departmentId: '2', // CCS
    custodianId: '4', // Rowena Capada
    locationId: '1', // ComLab 1
    status: 'Missing',
    remarks: 'Item not found in room 301'
  },
  {
    id: 'A4',
    propertyNumber: '19-05-1001',
    catalogItemId: '1', // Laptop
    description: 'Dell Latitude 3420, Core i5',
    unitValue: 45000.00,
    quantity: 1,
    dateAcquired: '2019-05-15',
    fundClusterId: '2', // STF
    departmentId: '2', // CCS
    custodianId: '4', // Rowena Capada
    locationId: '4', // Faculty Room
    status: 'Active'
  }
];

// --- Memorandum Receipt Mocks ---
export const INITIAL_MRS: MemorandumReceipt[] = [
  {
    id: 'MR-1',
    mrNumber: 'MR-2016-085',
    dateIssued: '2016-09-26',
    employeeId: '2', // Arnel Balbin
    departmentId: '1', // COED
    status: 'Active',
    items: [
      {
        assetId: 'A1',
        propertyNumber: '16-09-0630',
        description: 'Package Type Air Conditioners, 3 HP, Markers Cabinet type 3TR',
        unitValue: 110000.00,
      },
      {
        assetId: 'A2',
        propertyNumber: '16-09-0631',
        description: 'Package Type Air Conditioners, 3 HP',
        unitValue: 110000.00,
      }
    ]
  }
];

// --- Audit Session Mocks ---
export const INITIAL_AUDITS: AuditSession[] = [
  {
    id: 'AUD-1',
    sessionId: 'PC-2023-COED',
    date: '2023-12-15',
    departmentId: '1', // COED
    description: '2023 Year-End Physical Count - COED',
    status: 'Finalized',
    createdBy: 'Jeffrey Meneses',
    createdAt: '2023-12-10T08:00:00Z',
    finalizedAt: '2023-12-20T17:00:00Z',
    items: [
      {
        assetId: 'A1',
        propertyNumber: '16-09-0630',
        description: 'Package Type Air Conditioners, 3 HP...',
        unitValue: 110000.00,
        systemQty: 1,
        actualQty: 1,
        shortageOverageQty: 0,
        shortageOverageValue: 0,
        status: 'Matched',
        locationName: 'Dean Office',
        custodianName: 'Balbin, Arnel S.'
      },
       {
        assetId: 'A2',
        propertyNumber: '16-09-0631',
        description: 'Package Type Air Conditioners, 3 HP...',
        unitValue: 110000.00,
        systemQty: 1,
        actualQty: 1,
        shortageOverageQty: 0,
        shortageOverageValue: 0,
        status: 'Matched',
        locationName: 'Dean Office',
        custodianName: 'Balbin, Arnel S.'
      }
    ]
  }
];

// --- Activity Log Mocks ---
export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'LOG-1',
    timestamp: '2024-01-15T08:01:00Z',
    userId: 'E001',
    username: 'Jeffrey Meneses',
    role: 'Admin Officer V',
    action: 'Created Transaction',
    module: 'Stock Transactions',
    referenceId: 'TXN-2024-001',
    description: 'Created Stock In TXN-2024-001'
  },
  {
    id: 'LOG-2',
    timestamp: '2024-01-20T10:31:00Z',
    userId: 'E001',
    username: 'Jeffrey Meneses',
    role: 'Admin Officer V',
    action: 'Created Transaction',
    module: 'Stock Transactions',
    referenceId: 'TXN-2024-002',
    description: 'Created Stock Out TXN-2024-002'
  },
  {
    id: 'LOG-3',
    timestamp: '2023-12-20T17:00:00Z',
    userId: 'E001',
    username: 'Jeffrey Meneses',
    role: 'Admin Officer V',
    action: 'Finalized Session',
    module: 'Physical Count',
    referenceId: 'PC-2023-COED',
    description: 'Finalized Audit Session PC-2023-COED'
  }
];

// --- Initial System Settings ---
export const INITIAL_SETTINGS: SystemSettings = {
  general: {
    systemName: 'ESSU Supply Office Inventory System',
    departmentName: 'Supply Office',
    footerText: 'Generated by ESSU Inventory System v1.0',
    logoUrl: ''
  },
  inventory: {
    defaultReorderThreshold: 10,
    enablePartialPhysicalCount: true,
    defaultAssetStatus: 'Active'
  },
  documents: {
    includeLogoInPDF: true,
    preparedBy: 'Jeffrey Meneses',
    receivedBy: 'Juan Dela Cruz',
    verifiedBy: 'Head of Agency'
  },
  notifications: {
    enableLowStockAlerts: true,
    enableInactivityWarning: false,
    alertType: 'Toast'
  },
  integrations: {
    lastEmployeeSyncAt: null,
    lastDepartmentSyncAt: null,
    oauth: {
      enabled: true,
      providerUrl: '',
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      scopes: 'openid profile email'
    }
  }
};

// --- Notifications ---
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Welcome!',
    message: 'Welcome to the ESSU Inventory System.',
    type: 'info',
    timestamp: '2024-01-01T09:00:00Z',
    read: false
  }
];
