import {
  Asset,
  AssetCategory,
  AssetStatus,
  AuditItem,
  AuditSession,
  Department,
  Employee,
  FundCluster,
  Location,
  MRItem,
  MemorandumReceipt,
  Transaction,
  TransactionItem,
  TransactionType,
  CatalogItem,
  LogEntry
} from './types';

const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL?.trim() ||
  import.meta?.env?.VITE_API_BASE_URL?.trim() ||
  'https://essu-inventory-system-production.up.railway.app';

let authToken: string | null = null;
export const setAuthToken = (token: string | null) => { authToken = token; };

const authHeaders = () => (authToken ? { Authorization: `Bearer ${authToken}` } : {});

const fetchJson = async <T>(path: string): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: { ...authHeaders() } });
  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const json = await res.json();
      if (json?.message) message = json.message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    const error: any = new Error(message);
    error.status = res.status;
    throw error;
  }
  return res.json();
};

const toNumber = (value: any) => (typeof value === 'number' ? value : value ? Number(value) : 0);
const toDateOnly = (value: any) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

const mapAssetStatus = (value: string): AssetStatus =>
  value === 'UnderRepair' ? 'Under Repair' : (value as AssetStatus);

const mapTransactionType = (value: string): TransactionType =>
  value === 'StockIn' ? 'Stock In' : value === 'StockOut' ? 'Stock Out' : (value as TransactionType);

const mapCategoryType = (value: string): AssetCategory['type'] =>
  value === 'SemiExpendable' ? 'Semi-Expendable' : (value as AssetCategory['type']);

const normalizeDepartment = (raw: any): Department => ({
  id: raw.id,
  code: raw.code,
  name: raw.name,
  head: raw.head ?? undefined,
  locationId: raw.locationId ?? raw.location?.id,
  status: raw.status,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

const normalizeLocation = (raw: any): Location => ({
  id: raw.id,
  code: raw.code,
  name: raw.name,
  description: raw.description ?? undefined,
  status: raw.status,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

const normalizeFund = (raw: any): FundCluster => ({
  id: raw.id,
  code: raw.code,
  name: raw.name,
  description: raw.description ?? undefined,
  status: raw.status,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

const normalizeCategory = (raw: any): AssetCategory => ({
  id: raw.id,
  code: raw.code,
  name: raw.name,
  description: raw.description ?? undefined,
  type: mapCategoryType(raw.type),
  status: raw.status,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

const normalizeCatalogItem = (raw: any): CatalogItem => ({
  id: raw.id,
  stockNumber: raw.stockNumber,
  article: raw.article,
  description: raw.description,
  categoryId: raw.categoryId,
  fundClusterId: raw.fundClusterId ?? undefined,
  unit: raw.unit,
  unitValue: raw.unitValue !== null && raw.unitValue !== undefined ? toNumber(raw.unitValue) : undefined,
  itemType: raw.itemType,
  quantity: raw.quantity ?? 0,
  estimatedUsefulLife: raw.estimatedUsefulLife ?? undefined,
  reorderPoint: raw.reorderPoint ?? undefined,
  status: raw.status,
});

const normalizeAsset = (raw: any): Asset => ({
  id: raw.id,
  propertyNumber: raw.propertyNumber,
  catalogItemId: raw.catalogItemId,
  description: raw.description,
  unitValue: toNumber(raw.unitValue),
  quantity: raw.quantity ?? 0,
  dateAcquired: toDateOnly(raw.dateAcquired),
  fundClusterId: raw.fundClusterId,
  departmentId: raw.departmentId,
  custodianId: raw.custodianId,
  locationId: raw.locationId,
  remarks: raw.remarks ?? undefined,
  status: mapAssetStatus(raw.status),
  imageUrl: raw.imageUrl ?? undefined,
});

const normalizeTransactionItem = (raw: any): TransactionItem => ({
  id: raw.id,
  catalogItemId: raw.catalogItemId,
  quantity: raw.quantity ?? 0,
  remarks: raw.remarks ?? undefined,
  custodianId: raw.custodianId ?? undefined,
});

const normalizeTransaction = (raw: any): Transaction => ({
  id: raw.id,
  transactionId: raw.transactionId,
  date: toDateOnly(raw.date),
  type: mapTransactionType(raw.type),
  departmentId: raw.departmentId ?? undefined,
  supplier: raw.supplier ?? undefined,
  referenceNo: raw.referenceNo ?? undefined,
  locationId: raw.locationId ?? undefined,
  items: (raw.items ?? []).map(normalizeTransactionItem),
  status: raw.status,
  remarks: raw.remarks ?? undefined,
  createdBy: raw.createdBy,
  createdAt: raw.createdAt ?? new Date().toISOString(),
});

const normalizeMRItem = (raw: any): MRItem => ({
  assetId: raw.assetId,
  propertyNumber: raw.propertyNumber,
  description: raw.description,
  unitValue: toNumber(raw.unitValue),
  returnDate: raw.returnDate ? toDateOnly(raw.returnDate) : undefined,
  remarks: raw.remarks ?? undefined,
});

const normalizeMR = (raw: any): MemorandumReceipt => ({
  id: raw.id,
  mrNumber: raw.mrNumber,
  dateIssued: toDateOnly(raw.dateIssued),
  employeeId: raw.employeeId,
  departmentId: raw.departmentId,
  items: (raw.items ?? []).map(normalizeMRItem),
  status: raw.status,
  remarks: raw.remarks ?? undefined,
});

const normalizeAuditItem = (raw: any): AuditItem => ({
  assetId: raw.assetId,
  propertyNumber: raw.propertyNumber,
  description: raw.description,
  unitValue: toNumber(raw.unitValue),
  systemQty: raw.systemQty ?? 0,
  actualQty: raw.actualQty ?? null,
  shortageOverageQty: raw.shortageOverageQty ?? 0,
  shortageOverageValue: toNumber(raw.shortageOverageValue),
  status: raw.status,
  remarks: raw.remarks ?? undefined,
  locationName: raw.locationName ?? '',
  custodianName: raw.custodianName ?? '',
});

const normalizeAudit = (raw: any): AuditSession => ({
  id: raw.id,
  sessionId: raw.sessionId,
  date: toDateOnly(raw.date),
  departmentId: raw.departmentId ?? undefined,
  locationId: raw.locationId ?? undefined,
  description: raw.description,
  items: (raw.items ?? []).map(normalizeAuditItem),
  status: raw.status,
  createdBy: raw.createdBy,
  createdAt: raw.createdAt ?? new Date().toISOString(),
  finalizedAt: raw.finalizedAt ?? undefined,
});

const normalizeEmployee = (raw: any): Employee => ({
  id: raw.id,
  employeeId: raw.employeeId,
  firstName: raw.firstName,
  middleName: raw.middleName ?? undefined,
  lastName: raw.lastName,
  position: raw.position ?? undefined,
  departmentId: raw.departmentId,
  status: raw.status,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

const normalizeLog = (raw: any): LogEntry => ({
  id: raw.id,
  timestamp: raw.timestamp,
  userId: raw.userId,
  username: raw.username,
  role: raw.role,
  action: raw.action,
  module: raw.module,
  referenceId: raw.referenceId,
  description: raw.description,
});

const normalizeUser = (raw: any) => ({
  id: raw.id,
  username: raw.username,
  role: raw.role,
  status: raw.status,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

export const bootstrapDataFromApi = async (role: string = 'Officer') => {
  // Only Officers can fetch users; staff will skip this call to avoid 403.
  const safeUsers = role === 'Officer'
    ? fetchJson<any[]>('/api/users').catch((err) => {
        console.warn('Users fetch failed, defaulting to empty list.', err);
        return [];
      })
    : Promise.resolve([]);

  const [
    departments,
    locations,
    funds,
    categories,
    catalog,
    assets,
    transactions,
    mrs,
    audits,
    employees,
    logs,
    settings,
    users,
  ] = await Promise.all([
    fetchJson<any[]>('/api/departments'),
    fetchJson<any[]>('/api/locations'),
    fetchJson<any[]>('/api/funds'),
    fetchJson<any[]>('/api/categories'),
    fetchJson<any[]>('/api/catalog'),
    fetchJson<any[]>('/api/assets'),
    fetchJson<any[]>('/api/transactions'),
    fetchJson<any[]>('/api/mrs'),
    fetchJson<any[]>('/api/audits'),
    fetchJson<any[]>('/api/employees'),
    fetchJson<any[]>('/api/logs?limit=200'),
    fetchJson<any>('/api/settings'),
    safeUsers,
  ]);

  return {
    departments: departments.map(normalizeDepartment),
    locations: locations.map(normalizeLocation),
    funds: funds.map(normalizeFund),
    categories: categories.map(normalizeCategory),
    catalog: catalog.map(normalizeCatalogItem),
    assets: assets.map(normalizeAsset),
    transactions: transactions.map(normalizeTransaction),
    mrs: mrs.map(normalizeMR),
    audits: audits.map(normalizeAudit),
    employees: employees.map(normalizeEmployee),
    logs: logs.map(normalizeLog),
    settings,
    users: users.map(normalizeUser),
  };
};

const toApiStatus = (status: AssetStatus) => (status === 'Under Repair' ? 'Under Repair' : status);

export const createAsset = async (payload: Partial<Asset>) => {
  const res = await fetch(`${API_BASE_URL}/api/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      ...payload,
      unitValue: payload.unitValue,
      status: payload.status ? toApiStatus(payload.status) : 'Active',
      quantity: payload.quantity ?? 1,
    }),
  });
  if (!res.ok) {
    let message = 'Failed to create asset';
    try {
      const json = await res.json();
      if (json?.message) message = json.message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    const err: any = new Error(message);
    err.status = res.status;
    throw err;
  }
  const json = await res.json();
  return normalizeAsset(json);
};

export const updateAsset = async (id: string, payload: Partial<Asset>) => {
  const res = await fetch(`${API_BASE_URL}/api/assets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      ...payload,
      unitValue: payload.unitValue,
      status: payload.status ? toApiStatus(payload.status) : undefined,
    }),
  });
  if (!res.ok) {
    let message = 'Failed to update asset';
    try {
      const json = await res.json();
      if (json?.message) message = json.message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    const err: any = new Error(message);
    err.status = res.status;
    throw err;
  }
  const json = await res.json();
  return normalizeAsset(json);
};

// --- Master Data mutations ---

const toPayloadStatus = (status?: string) => status || 'Active';
const toApiTxnType = (type: TransactionType) => (type === 'Stock In' ? 'Stock In' : type === 'Stock Out' ? 'Stock Out' : type);

const postJson = async <T>(path: string, body: any): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }
  return res.json();
};

const putJson = async <T>(path: string, body: any): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }
  return res.json();
};

const delJson = async <T>(path: string): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }
  return res.json();
};

// Departments
export const createDepartment = async (payload: Partial<Department>) =>
  normalizeDepartment(await postJson('/api/departments', { ...payload, status: toPayloadStatus(payload.status) }));

export const updateDepartment = async (id: string, payload: Partial<Department>) =>
  normalizeDepartment(await putJson(`/api/departments/${id}`, { ...payload, status: payload.status }));

export const deactivateDepartment = async (id: string) =>
  normalizeDepartment(await delJson(`/api/departments/${id}`));

// Locations
export const createLocation = async (payload: Partial<Location>) =>
  normalizeLocation(await postJson('/api/locations', { ...payload, status: toPayloadStatus((payload as any).status) }));

export const updateLocation = async (id: string, payload: Partial<Location>) =>
  normalizeLocation(await putJson(`/api/locations/${id}`, { ...payload, status: (payload as any).status }));

export const deactivateLocation = async (id: string) =>
  normalizeLocation(await delJson(`/api/locations/${id}`));

// Funds
export const createFund = async (payload: Partial<FundCluster>) =>
  normalizeFund(await postJson('/api/funds', { ...payload, status: toPayloadStatus((payload as any).status) }));

export const updateFund = async (id: string, payload: Partial<FundCluster>) =>
  normalizeFund(await putJson(`/api/funds/${id}`, { ...payload, status: (payload as any).status }));

export const deactivateFund = async (id: string) =>
  normalizeFund(await delJson(`/api/funds/${id}`));

// Categories
export const createCategory = async (payload: Partial<AssetCategory>) =>
  normalizeCategory(await postJson('/api/categories', { ...payload, status: toPayloadStatus(payload.status) }));

export const updateCategory = async (id: string, payload: Partial<AssetCategory>) =>
  normalizeCategory(await putJson(`/api/categories/${id}`, { ...payload, status: payload.status }));

export const deactivateCategory = async (id: string) =>
  normalizeCategory(await delJson(`/api/categories/${id}`));

// Catalog Items
export const createCatalogItem = async (payload: Partial<CatalogItem>) =>
  normalizeCatalogItem(await postJson('/api/catalog', { ...payload, status: toPayloadStatus(payload.status) }));

export const updateCatalogItem = async (id: string, payload: Partial<CatalogItem>) =>
  normalizeCatalogItem(await putJson(`/api/catalog/${id}`, { ...payload, status: payload.status }));

export const deactivateCatalogItem = async (id: string) =>
  normalizeCatalogItem(await delJson(`/api/catalog/${id}`));

// Employees
export const createEmployee = async (payload: Partial<Employee>) =>
  normalizeEmployee(await postJson('/api/employees', { ...payload, status: toPayloadStatus(payload.status) }));

export const updateEmployee = async (id: string, payload: Partial<Employee>) =>
  normalizeEmployee(await putJson(`/api/employees/${id}`, { ...payload, status: payload.status }));

export const deactivateEmployee = async (id: string) =>
  normalizeEmployee(await delJson(`/api/employees/${id}`));

export const login = async (username: string, password: string) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    let errorMessage = 'Login failed';
    try {
      const json = await res.json();
      if (json?.message) errorMessage = json.message;
    } catch {
      const text = await res.text();
      if (text) errorMessage = text;
    }
    if (res.status === 401) errorMessage = 'Invalid username or password.';
    else if (res.status === 403) errorMessage = 'Account is inactive. Please contact an officer to re-enable access.';
    throw new Error(errorMessage);
  }
  const json = await res.json();
  return json;
};

export const createTransaction = async (payload: Partial<Transaction>) => {
  const res = await fetch(`${API_BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      ...payload,
      type: payload.type ? toApiTxnType(payload.type) : 'Stock In',
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to create transaction');
  }
  const json = await res.json();
  return normalizeTransaction(json);
};

export const createMemorandumReceipt = async (payload: any) => {
  const res = await fetch(`${API_BASE_URL}/api/mrs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to create MR');
  }
  const json = await res.json();
  return normalizeMR(json);
};

// Audit sessions
export const createAuditSession = async (payload: any) => {
  const res = await fetch(`${API_BASE_URL}/api/audits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to create audit session');
  }
  const json = await res.json();
  return normalizeAudit(json);
};

export const updateAuditSession = async (id: string, payload: any) => {
  const res = await fetch(`${API_BASE_URL}/api/audits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to update audit session');
  }
  const json = await res.json();
  return normalizeAudit(json);
};

export const createActivityLog = async (payload: LogEntry) => {
  const res = await fetch(`${API_BASE_URL}/api/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to create activity log');
  }
  const json = await res.json();
  return normalizeLog(json);
};

export const getSettings = async () => {
  return fetchJson<any>('/api/settings');
};

export const updateSettingsApi = async (payload: any) => {
  return putJson<any>('/api/settings', payload);
};

export const exportMaintenance = async () => {
  const res = await fetch(`${API_BASE_URL}/api/maintenance/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) {
    const text = await res.text();
    const err: any = new Error(text || 'Failed to export data');
    err.status = res.status;
    throw err;
  }
  return res.json();
};

export const resetMaintenance = async () => {
  const res = await fetch(`${API_BASE_URL}/api/maintenance/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) {
    const text = await res.text();
    const err: any = new Error(text || 'Failed to reset data');
    err.status = res.status;
    throw err;
  }
  return res.json();
};

export const runHealthCheck = async () => {
  const res = await fetch(`${API_BASE_URL}/api/maintenance/health`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  if (!res.ok) {
    const text = await res.text();
    const err: any = new Error(text || 'Failed to run health check');
    err.status = res.status;
    throw err;
  }
  return res.json();
};

// Users (Officer-only)
export const getUsers = async () => fetchJson<any[]>('/api/users');
export const createUser = async (payload: any) => postJson<any>('/api/users', payload);
export const updateUser = async (id: string, payload: any) => putJson<any>(`/api/users/${id}`, payload);
