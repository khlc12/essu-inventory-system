// @ts-nocheck
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { prisma } from './prisma';
import { authMiddleware, requireRole, signToken } from './auth';

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const OAUTH_PROVIDER_URL = process.env.OAUTH_PROVIDER_URL || process.env.SSO_PROVIDER_URL || '';
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID || '';
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || '';
const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI || '';
const OAUTH_SCOPES = process.env.OAUTH_SCOPES || 'openid profile email';
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || process.env.VITE_APP_URL || 'http://localhost:3000';
const STATE_SECRET = process.env.OAUTH_STATE_SECRET || process.env.JWT_SECRET || 'state-secret';
const HRMS_API_BASE_URL = process.env.HRMS_API_BASE_URL || OAUTH_PROVIDER_URL;

type HrmsTokenInfo = {
  accessToken: string;
  expiresAt?: number;
};

const hrmsTokenStore = new Map<string, HrmsTokenInfo>();

const storeHrmsToken = (userId: string, tokenJson: any) => {
  if (!tokenJson?.access_token) return;
  const expiresIn = Number(tokenJson.expires_in || 0);
  const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : undefined;
  hrmsTokenStore.set(userId, { accessToken: tokenJson.access_token, expiresAt });
};

const getHrmsToken = (userId: string) => {
  const entry = hrmsTokenStore.get(userId);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    hrmsTokenStore.delete(userId);
    return null;
  }
  return entry.accessToken;
};

const updateIntegrations = async (payload: Record<string, any>) => {
  const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
  const existing = (settings?.integrations as any) || {};
  await prisma.systemSettings.update({
    where: { id: 1 },
    data: { integrations: { ...existing, ...payload } },
  });
};

const generateState = () => jwt.sign({ nonce: randomUUID() }, STATE_SECRET, { expiresIn: '10m' });
const verifyState = (token: string) => {
  try {
    jwt.verify(token, STATE_SECRET);
    return true;
  } catch (err) {
    return false;
  }
};

const mapRoleFromUserInfo = (userInfo: any): 'Officer' | 'Staff' => {
  const dept = (userInfo?.department || '').toLowerCase();
  const position = (
    userInfo?.position ||
    userInfo?.job_title ||
    userInfo?.title ||
    ''
  ).toLowerCase();
  const roles: string[] = (userInfo?.roles || []).map((r: any) => String(r).toLowerCase());

  const inSupply = dept.includes('supply');
  const looksOfficer =
    position.includes('supply officer') ||
    position.includes('officer') ||
    roles.some((r) => ['admin', 'officer', 'supply_officer', 'supply officer'].includes(r));

  if (inSupply && looksOfficer) return 'Officer';
  if (inSupply) return 'Staff';
  return 'Staff';
};

const normalizeEmail = (value: string | undefined | null) => (value || '').trim().toLowerCase();
const isAllowedUser = (userInfo: any) => {
  const dept = (userInfo?.department || '').toLowerCase();
  return dept.includes('supply office');
};

app.use(cors());
app.use(express.json());

// Apply auth to mutating routes
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method) && !req.path.startsWith('/api/auth')) {
    authMiddleware(req, res, next);
  } else {
    next();
  }
});

const ensureRole = (req: Request, res: Response, roles: string[]) => {
  const user = (req as any).user as any;
  if (!user || !roles.includes(user.role)) {
    res.status(403).json({ message: 'Forbidden' });
    return false;
  }
  return true;
};

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' });
  }
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (user.status !== 'Active') {
    return res.status(403).json({ message: 'Account is inactive' });
  }
  const token = signToken({ id: user.id, username: user.username, role: user.role as any, authMethod: 'local' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, authMethod: 'local' } });
}));

app.get('/api/auth/me', authMiddleware, asyncHandler(async (req, res) => {
  const user = (req as any).user;
  res.json({ user });
}));

app.post('/api/auth/logout', authMiddleware, asyncHandler(async (req, res) => {
  const user = (req as any).user as { id?: string; authMethod?: string } | undefined;
  const isSso = user?.authMethod === 'sso' || (user?.id ? hrmsTokenStore.has(user.id) : false);
  if (user?.id) hrmsTokenStore.delete(user.id);

  if (!isSso || !OAUTH_PROVIDER_URL) {
    return res.json({ logoutUrl: null, isSso: false });
  }

  const redirectBase = FRONTEND_BASE_URL.replace(/\/$/, '');
  const redirectUri = `${redirectBase}/?sso_logged_out=1`;
  const logoutUrl = `${OAUTH_PROVIDER_URL.replace(/\/$/, '')}/oauth/end-session?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;

  res.json({ logoutUrl, isSso: true, redirectUri });
}));

app.get('/api/auth/sso/redirect', asyncHandler(async (_req, res) => {
  if (!OAUTH_PROVIDER_URL || !OAUTH_CLIENT_ID || !OAUTH_REDIRECT_URI) {
    return res.status(500).json({ message: 'SSO is not configured.' });
  }
  const state = generateState();
  const params = new URLSearchParams({
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: OAUTH_REDIRECT_URI,
    response_type: 'code',
    scope: OAUTH_SCOPES,
    state,
  });
  const url = `${OAUTH_PROVIDER_URL}/oauth/authorize?${params.toString()}`;
  res.json({ url, state });
}));

app.get('/api/auth/sso/callback', asyncHandler(async (req, res) => {
  const { code, state } = req.query as { code?: string; state?: string };
  if (!code || !state) return res.status(400).json({ message: 'Missing code or state' });
  if (!verifyState(state)) return res.status(400).json({ message: 'Invalid state' });
  if (!OAUTH_PROVIDER_URL || !OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET || !OAUTH_REDIRECT_URI) {
    return res.status(500).json({ message: 'SSO is not configured.' });
  }

  const tokenResponse = await fetch(`${OAUTH_PROVIDER_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: OAUTH_CLIENT_ID,
      client_secret: OAUTH_CLIENT_SECRET,
      code,
      redirect_uri: OAUTH_REDIRECT_URI,
    }),
  });
  if (!tokenResponse.ok) {
    const text = await tokenResponse.text();
    return res.status(400).json({ message: `Token exchange failed: ${text || tokenResponse.statusText}` });
  }
  const tokenJson = await tokenResponse.json();
  const accessToken = tokenJson.access_token;
  if (!accessToken) return res.status(400).json({ message: 'No access token returned by provider.' });

  const userResponse = await fetch(`${OAUTH_PROVIDER_URL}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!userResponse.ok) {
    const text = await userResponse.text();
    return res.status(400).json({ message: `Failed to load user info: ${text || userResponse.statusText}` });
  }
  const userInfo = await userResponse.json();

  if (!isAllowedUser(userInfo)) {
    const msg = 'You don\'t have permission to use this system. Only Supply Office accounts (Supply Officer/Staff) can sign in.';
    if (req.headers.accept?.includes('text/html')) {
      const redirectUrl = `${FRONTEND_BASE_URL}?sso_error=${encodeURIComponent(msg)}`;
      return res.redirect(redirectUrl);
    }
    return res.status(403).json({ message: msg });
  }

  const username = normalizeEmail(userInfo.email) || userInfo.username || userInfo.sub;
  if (!username) return res.status(400).json({ message: 'User info missing identifier.' });
  const role = mapRoleFromUserInfo(userInfo);
  const passwordHash = randomUUID();

  const user = await prisma.user.upsert({
    where: { username },
    update: { role, status: 'Active' },
    create: { username, passwordHash, role, status: 'Active' },
  });
  storeHrmsToken(user.id, tokenJson);

  const token = signToken({ id: user.id, username: user.username, role: user.role as any, authMethod: 'sso' });
  const userPayload = { id: user.id, username: user.username, role: user.role, authMethod: 'sso' };

  const userB64 = Buffer.from(JSON.stringify(userPayload)).toString('base64url');
  const redirectUrl = `${FRONTEND_BASE_URL}?sso_token=${encodeURIComponent(token)}&sso_user=${encodeURIComponent(userB64)}`;

  if (req.headers.accept?.includes('text/html')) {
    res.redirect(redirectUrl);
  } else {
    res.json({ token, user: userPayload, redirectUrl });
  }
}));

// Simple health checks
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/departments', asyncHandler(async (_req, res) => {
  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: { location: true },
  });
  res.json(departments);
}));

app.post('/api/departments', asyncHandler(async (req, res) => {
  res.status(403).json({ message: 'Departments are managed via HRMS sync. Manual creation is disabled.' });
}));

app.put('/api/departments/:id', asyncHandler(async (req, res) => {
  res.status(403).json({ message: 'Departments are managed via HRMS sync. Manual updates are disabled.' });
}));

app.delete('/api/departments/:id', asyncHandler(async (req, res) => {
  res.status(403).json({ message: 'Departments are managed via HRMS sync. Manual deactivation is disabled.' });
}));

app.get('/api/locations', asyncHandler(async (_req, res) => {
  const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });
  res.json(locations);
}));

app.post('/api/locations', asyncHandler(async (req, res) => {
  const { code, name, description, status = 'Active' } = req.body || {};
  if (!code || !name) return res.status(400).json({ message: 'Code and name are required.' });
  const dup = await prisma.location.findFirst({ where: { code } });
  if (dup) return res.status(400).json({ message: 'Location code must be unique.' });
  const created = await prisma.location.create({ data: { code, name, description: description || null, status } });
  res.status(201).json(created);
}));

app.put('/api/locations/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, name, description, status } = req.body || {};
  const loc = await prisma.location.findUnique({ where: { id } });
  if (!loc) return res.status(404).json({ message: 'Location not found.' });
  if (code) {
    const dup = await prisma.location.findFirst({ where: { code, NOT: { id } } });
    if (dup) return res.status(400).json({ message: 'Location code must be unique.' });
  }
  const updated = await prisma.location.update({
    where: { id },
    data: {
      code: code ?? loc.code,
      name: name ?? loc.name,
      description: description === undefined ? loc.description : description || null,
      status: status ?? loc.status,
    },
  });
  res.json(updated);
}));

app.delete('/api/locations/:id', asyncHandler(async (req, res) => {
  if (!ensureRole(req, res, ['Officer'])) return;
  const { id } = req.params;
  const loc = await prisma.location.findUnique({ where: { id } });
  if (!loc) return res.status(404).json({ message: 'Location not found.' });
  const updated = await prisma.location.update({ where: { id }, data: { status: 'Inactive' } });
  res.json(updated);
}));

app.get('/api/funds', asyncHandler(async (_req, res) => {
  const funds = await prisma.fundCluster.findMany({ orderBy: { code: 'asc' } });
  res.json(funds);
}));

app.post('/api/funds', asyncHandler(async (req, res) => {
  const { code, name, description, status = 'Active' } = req.body || {};
  if (!code || !name) return res.status(400).json({ message: 'Code and name are required.' });
  const dup = await prisma.fundCluster.findFirst({ where: { code } });
  if (dup) return res.status(400).json({ message: 'Fund code must be unique.' });
  const created = await prisma.fundCluster.create({ data: { code, name, description: description || null, status } });
  res.status(201).json(created);
}));

app.put('/api/funds/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, name, description, status } = req.body || {};
  const fund = await prisma.fundCluster.findUnique({ where: { id } });
  if (!fund) return res.status(404).json({ message: 'Fund not found.' });
  if (code) {
    const dup = await prisma.fundCluster.findFirst({ where: { code, NOT: { id } } });
    if (dup) return res.status(400).json({ message: 'Fund code must be unique.' });
  }
  const updated = await prisma.fundCluster.update({
    where: { id },
    data: {
      code: code ?? fund.code,
      name: name ?? fund.name,
      description: description === undefined ? fund.description : description || null,
      status: status ?? fund.status,
    },
  });
  res.json(updated);
}));

app.delete('/api/funds/:id', asyncHandler(async (req, res) => {
  if (!ensureRole(req, res, ['Officer'])) return;
  const { id } = req.params;
  const fund = await prisma.fundCluster.findUnique({ where: { id } });
  if (!fund) return res.status(404).json({ message: 'Fund not found.' });
  const updated = await prisma.fundCluster.update({ where: { id }, data: { status: 'Inactive' } });
  res.json(updated);
}));

app.get('/api/categories', asyncHandler(async (_req, res) => {
  const categories = await prisma.assetCategory.findMany({ orderBy: { name: 'asc' } });
  res.json(categories);
}));

app.post('/api/categories', asyncHandler(async (req, res) => {
  const { code, name, description, type, status = 'Active' } = req.body || {};
  if (!code || !name || !type) return res.status(400).json({ message: 'Code, name, and type are required.' });
  const dup = await prisma.assetCategory.findFirst({ where: { code } });
  if (dup) return res.status(400).json({ message: 'Category code must be unique.' });
  const created = await prisma.assetCategory.create({ data: { code, name, description: description || null, type, status } });
  res.status(201).json(created);
}));

app.put('/api/categories/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, name, description, type, status } = req.body || {};
  const cat = await prisma.assetCategory.findUnique({ where: { id } });
  if (!cat) return res.status(404).json({ message: 'Category not found.' });
  if (code) {
    const dup = await prisma.assetCategory.findFirst({ where: { code, NOT: { id } } });
    if (dup) return res.status(400).json({ message: 'Category code must be unique.' });
  }
  const updated = await prisma.assetCategory.update({
    where: { id },
    data: {
      code: code ?? cat.code,
      name: name ?? cat.name,
      description: description === undefined ? cat.description : description || null,
      type: type ?? cat.type,
      status: status ?? cat.status,
    },
  });
  res.json(updated);
}));

app.delete('/api/categories/:id', asyncHandler(async (req, res) => {
  if (!ensureRole(req, res, ['Officer'])) return;
  const { id } = req.params;
  const cat = await prisma.assetCategory.findUnique({ where: { id } });
  if (!cat) return res.status(404).json({ message: 'Category not found.' });
  const updated = await prisma.assetCategory.update({ where: { id }, data: { status: 'Inactive' } });
  res.json(updated);
}));

app.get('/api/employees', asyncHandler(async (_req, res) => {
  const employees = await prisma.employee.findMany({
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    include: { department: true },
  });
  res.json(employees);
}));

app.post('/api/employees', asyncHandler(async (req, res) => {
  res.status(403).json({ message: 'Employees are managed via HRMS sync. Manual creation is disabled.' });
}));

app.put('/api/employees/:id', asyncHandler(async (req, res) => {
  res.status(403).json({ message: 'Employees are managed via HRMS sync. Manual updates are disabled.' });
}));

app.delete('/api/employees/:id', asyncHandler(async (req, res) => {
  res.status(403).json({ message: 'Employees are managed via HRMS sync. Manual deactivation is disabled.' });
}));

app.post('/api/hrms/employees/sync', asyncHandler(async (req, res) => {
  if (!ensureRole(req, res, ['Officer'])) return;
  const authUser = (req as any).user as { id: string } | undefined;
  if (!HRMS_API_BASE_URL) {
    return res.status(500).json({ message: 'HRMS API base URL is not configured.' });
  }

  const accessToken = (authUser?.id ? getHrmsToken(authUser.id) : null) || process.env.HRMS_SERVICE_TOKEN;
  if (!accessToken) {
    return res.status(400).json({ message: 'No HRMS access token available. Please sign in via SSO first.' });
  }

  const existingEmployees = await prisma.employee.findMany({ select: { employeeId: true } });
  const existingById = new Set(existingEmployees.map((e) => e.employeeId));

  const departments = await prisma.department.findMany({ select: { id: true, code: true, name: true } });
  const deptByCode = new Map(departments.map((d) => [d.code.toLowerCase(), d]));
  const deptByName = new Map(departments.map((d) => [d.name.toLowerCase(), d]));

  const toDeptCode = (value: string) => {
    const base = value.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 8) || 'DEPT';
    let candidate = base;
    let idx = 1;
    while (deptByCode.has(candidate.toLowerCase())) {
      candidate = `${base}${idx}`;
      idx += 1;
    }
    return candidate;
  };

  const ensureDepartment = async (hrDept: any) => {
    const code = String(hrDept?.code || '').trim();
    const name = String(hrDept?.name || '').trim();
    const codeKey = code.toLowerCase();
    const nameKey = name.toLowerCase();

    if (codeKey && deptByCode.has(codeKey)) return deptByCode.get(codeKey);
    if (nameKey && deptByName.has(nameKey)) return deptByName.get(nameKey);

    const resolvedName = name || code || 'Unassigned Department';
    const resolvedCode = code || toDeptCode(resolvedName);
    const created = await prisma.department.create({
      data: { code: resolvedCode, name: resolvedName, status: 'Active' },
    });
    deptByCode.set(created.code.toLowerCase(), created);
    deptByName.set(created.name.toLowerCase(), created);
    return created;
  };

  const toEmployeeId = (emp: any) =>
    String(emp?.employee_number || emp?.employee_id || emp?.id || emp?.contact?.email || '').trim();

  const isInactive = (emp: any) =>
    Boolean(emp?.is_deleted) ||
    Boolean(emp?.deleted_at) ||
    String(emp?.employment?.status || '').toLowerCase() === 'inactive';

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  let inserted = 0;
  let updated = 0;
  let inactivated = 0;
  let skipped = 0;
  let processed = 0;
  let currentPage = 1;
  let lastPage = 1;
  const perPage = 100;

  while (currentPage <= lastPage) {
    const url = new URL(`${HRMS_API_BASE_URL.replace(/\/$/, '')}/api/employees`);
    url.searchParams.set('include_deleted', 'true');
    url.searchParams.set('status', 'all');
    url.searchParams.set('page', String(currentPage));
    url.searchParams.set('per_page', String(perPage));

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ message: text || `HRMS request failed on page ${currentPage}.` });
    }
    const payload = await response.json();
    const data = payload?.data || [];
    const meta = payload?.meta || {};
    lastPage = Number(meta.last_page || 1);

    for (const emp of data) {
      const employeeId = toEmployeeId(emp);
      if (!employeeId) {
        skipped += 1;
        continue;
      }
      const dept = await ensureDepartment(emp.department);
      if (!dept) {
        skipped += 1;
        continue;
      }

      const status = isInactive(emp) ? 'Inactive' : 'Active';
      const exists = existingById.has(employeeId);
      await prisma.employee.upsert({
        where: { employeeId },
        update: {
          firstName: emp?.name?.first_name || emp?.first_name || '',
          middleName: emp?.name?.middle_name || emp?.middle_name || null,
          lastName: emp?.name?.surname || emp?.last_name || '',
          position: emp?.position?.name || emp?.position || null,
          departmentId: dept.id,
          status,
        },
        create: {
          employeeId,
          firstName: emp?.name?.first_name || emp?.first_name || 'Unknown',
          middleName: emp?.name?.middle_name || emp?.middle_name || null,
          lastName: emp?.name?.surname || emp?.last_name || 'Unknown',
          position: emp?.position?.name || emp?.position || null,
          departmentId: dept.id,
          status,
        },
      });

      processed += 1;
      if (status === 'Inactive') inactivated += 1;
      if (exists) updated += 1;
      else {
        inserted += 1;
        existingById.add(employeeId);
      }
    }

    currentPage += 1;
  if (currentPage <= lastPage) {
      await sleep(1000);
    }
  }

  const lastSyncAt = new Date().toISOString();
  await updateIntegrations({ lastEmployeeSyncAt: lastSyncAt });

  res.json({
    processed,
    inserted,
    updated,
    inactivated,
    skipped,
    pages: lastPage,
    lastSyncAt,
  });
}));

app.post('/api/hrms/departments/sync', asyncHandler(async (req, res) => {
  if (!ensureRole(req, res, ['Officer'])) return;
  const authUser = (req as any).user as { id: string } | undefined;
  if (!HRMS_API_BASE_URL) {
    return res.status(500).json({ message: 'HRMS API base URL is not configured.' });
  }

  const accessToken = (authUser?.id ? getHrmsToken(authUser.id) : null) || process.env.HRMS_SERVICE_TOKEN;
  if (!accessToken) {
    return res.status(400).json({ message: 'No HRMS access token available. Please sign in via SSO first.' });
  }

  const url = new URL(`${HRMS_API_BASE_URL.replace(/\/$/, '')}/api/departments`);
  url.searchParams.set('include_deleted', 'true');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    return res.status(502).json({ message: text || 'HRMS department request failed.' });
  }

  const payload = await response.json();
  const data = payload?.data || payload || [];

  const existing = await prisma.department.findMany({ select: { id: true, code: true, name: true } });
  const byCode = new Map(existing.map((d) => [d.code.toLowerCase(), d]));
  const byName = new Map(existing.map((d) => [d.name.toLowerCase(), d]));

  const toDeptCode = (value: string) => {
    const base = value.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 8) || 'DEPT';
    let candidate = base;
    let idx = 1;
    while (byCode.has(candidate.toLowerCase())) {
      candidate = `${base}${idx}`;
      idx += 1;
    }
    return candidate;
  };

  const isInactive = (dept: any) =>
    Boolean(dept?.is_deleted) ||
    Boolean(dept?.deleted_at) ||
    String(dept?.status || '').toLowerCase() === 'inactive';

  let inserted = 0;
  let updated = 0;
  let inactivated = 0;
  let processed = 0;
  let skipped = 0;

  for (const dept of data) {
    const name = String(dept?.name || '').trim();
    if (!name) {
      skipped += 1;
      continue;
    }
    const code = String(dept?.code || '').trim() || toDeptCode(name);
    const status = isInactive(dept) ? 'Inactive' : 'Active';
    const existingByCode = byCode.get(code.toLowerCase());
    const existingByName = byName.get(name.toLowerCase());
    const target = existingByCode || existingByName;

    if (target) {
      const newCode = existingByCode ? code : target.code;
      const updatedDept = await prisma.department.update({
        where: { id: target.id },
        data: {
          code: newCode,
          name,
          status,
        },
      });
      byCode.set(updatedDept.code.toLowerCase(), updatedDept);
      byName.set(updatedDept.name.toLowerCase(), updatedDept);
      updated += 1;
    } else {
      const created = await prisma.department.create({
        data: {
          code,
          name,
          status,
        },
      });
      byCode.set(created.code.toLowerCase(), created);
      byName.set(created.name.toLowerCase(), created);
      inserted += 1;
    }

    processed += 1;
    if (status === 'Inactive') inactivated += 1;
  }

  const lastSyncAt = new Date().toISOString();
  await updateIntegrations({ lastDepartmentSyncAt: lastSyncAt });

  res.json({
    processed,
    inserted,
    updated,
    inactivated,
    skipped,
    lastSyncAt,
  });
}));

app.get('/api/catalog', asyncHandler(async (_req, res) => {
  const catalog = await prisma.catalogItem.findMany({
    orderBy: { article: 'asc' },
    include: { category: true, fundCluster: true },
  });
  res.json(catalog);
}));

app.post('/api/catalog', asyncHandler(async (req, res) => {
  const { stockNumber, article, description, categoryId, fundClusterId, unit, unitValue, itemType, estimatedUsefulLife, reorderPoint, status = 'Active' } = req.body || {};
  if (!stockNumber || !article || !description || !categoryId || !unit || !itemType) {
    return res.status(400).json({ message: 'stockNumber, article, description, categoryId, unit, and itemType are required.' });
  }
  const dup = await prisma.catalogItem.findFirst({ where: { stockNumber } });
  if (dup) return res.status(400).json({ message: 'Stock Number must be unique.' });
  const created = await prisma.catalogItem.create({
    data: {
      stockNumber,
      article,
      description,
      categoryId,
      fundClusterId: fundClusterId || null,
      unit,
      unitValue: unitValue !== undefined && unitValue !== null ? new Prisma.Decimal(unitValue) : null,
      itemType,
      quantity: 0,
      estimatedUsefulLife: estimatedUsefulLife || null,
      reorderPoint: reorderPoint || null,
      status,
    },
  });
  res.status(201).json(created);
}));

app.put('/api/catalog/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stockNumber, article, description, categoryId, fundClusterId, unit, unitValue, itemType, estimatedUsefulLife, reorderPoint, status } = req.body || {};
  const item = await prisma.catalogItem.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ message: 'Catalog item not found.' });
  if (stockNumber) {
    const dup = await prisma.catalogItem.findFirst({ where: { stockNumber, NOT: { id } } });
    if (dup) return res.status(400).json({ message: 'Stock Number must be unique.' });
  }
  const updated = await prisma.catalogItem.update({
    where: { id },
    data: {
      stockNumber: stockNumber ?? item.stockNumber,
      article: article ?? item.article,
      description: description ?? item.description,
      categoryId: categoryId ?? item.categoryId,
      fundClusterId: fundClusterId === undefined ? item.fundClusterId : fundClusterId || null,
      unit: unit ?? item.unit,
      unitValue: unitValue !== undefined && unitValue !== null ? new Prisma.Decimal(unitValue) : item.unitValue,
      itemType: itemType ?? item.itemType,
      estimatedUsefulLife: estimatedUsefulLife === undefined ? item.estimatedUsefulLife : estimatedUsefulLife || null,
      reorderPoint: reorderPoint === undefined ? item.reorderPoint : reorderPoint || null,
      status: status ?? item.status,
    },
  });
  res.json(updated);
}));

app.delete('/api/catalog/:id', asyncHandler(async (req, res) => {
  if (!ensureRole(req, res, ['Officer'])) return;
  const { id } = req.params;
  const item = await prisma.catalogItem.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ message: 'Catalog item not found.' });
  const updated = await prisma.catalogItem.update({ where: { id }, data: { status: 'Inactive' } });
  res.json(updated);
}));

app.get('/api/assets', asyncHandler(async (_req, res) => {
  const assets = await prisma.asset.findMany({
    orderBy: { propertyNumber: 'asc' },
    include: {
      catalogItem: true,
      fundCluster: true,
      department: true,
      custodian: true,
      location: true,
    },
  });
  res.json(assets);
}));

const mapAssetStatus = (status: string) => {
  if (status === 'Under Repair') return 'UnderRepair';
  return status as any;
};

const mapTransactionType = (type: string) => (type === 'Stock In' ? 'StockIn' : 'StockOut');
const mapAuditSessionStatus = (status: string) => status === 'Finalized' ? 'Finalized' : 'Draft';
const mapAuditItemStatus = (status: string) => status as any;

app.post('/api/assets', asyncHandler(async (req, res) => {
  const body = req.body || {};
  const required = ['propertyNumber', 'catalogItemId', 'description', 'unitValue', 'fundClusterId', 'departmentId', 'custodianId', 'locationId', 'status'];
  const missing = required.filter((k) => body[k] === undefined || body[k] === null || body[k] === '');
  if (missing.length) {
    return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
  }

  const existing = await prisma.asset.findFirst({ where: { propertyNumber: body.propertyNumber } });
  if (existing) {
    return res.status(400).json({ message: 'Property Number must be unique.' });
  }

  const created = await prisma.asset.create({
    data: {
      propertyNumber: body.propertyNumber,
      catalogItemId: body.catalogItemId,
      description: body.description,
      unitValue: new Prisma.Decimal(body.unitValue),
      quantity: body.quantity ?? 1,
      dateAcquired: body.dateAcquired ? new Date(body.dateAcquired) : new Date(),
      fundClusterId: body.fundClusterId,
      departmentId: body.departmentId,
      custodianId: body.custodianId,
      locationId: body.locationId,
      status: mapAssetStatus(body.status),
      remarks: body.remarks || null,
    },
  });
  res.status(201).json(created);
}));

app.put('/api/assets/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = req.body || {};

  const existing = await prisma.asset.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Asset not found.' });
  }

  const duplicate = await prisma.asset.findFirst({
    where: { propertyNumber: body.propertyNumber, NOT: { id } },
  });
  if (duplicate) {
    return res.status(400).json({ message: 'Property Number must be unique.' });
  }

  const updated = await prisma.asset.update({
    where: { id },
    data: {
      propertyNumber: body.propertyNumber ?? existing.propertyNumber,
      catalogItemId: body.catalogItemId ?? existing.catalogItemId,
      description: body.description ?? existing.description,
      unitValue: body.unitValue !== undefined ? new Prisma.Decimal(body.unitValue) : existing.unitValue,
      quantity: body.quantity ?? existing.quantity,
      dateAcquired: body.dateAcquired ? new Date(body.dateAcquired) : existing.dateAcquired,
      fundClusterId: body.fundClusterId ?? existing.fundClusterId,
      departmentId: body.departmentId ?? existing.departmentId,
      custodianId: body.custodianId ?? existing.custodianId,
      locationId: body.locationId ?? existing.locationId,
      status: body.status ? mapAssetStatus(body.status) : existing.status,
      remarks: body.remarks ?? existing.remarks,
    },
  });
  res.json(updated);
}));

app.get('/api/transactions', asyncHandler(async (_req, res) => {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    include: { items: { include: { catalogItem: true, custodian: true } }, department: true, location: true },
  });
  res.json(transactions);
}));

app.post('/api/transactions', asyncHandler(async (req, res) => {
  const { transactionId, date, type, departmentId, supplier, referenceNo, locationId, items = [], status = 'Completed', remarks, createdBy = 'System' } = req.body || {};
  if (!date || !type) {
    return res.status(400).json({ message: 'date and type are required.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one line item is required.' });
  }
  if (type === 'Stock In' && (!supplier || !referenceNo)) {
    return res.status(400).json({ message: 'supplier and referenceNo are required for Stock In.' });
  }
  if (type === 'Stock Out' && !departmentId) {
    return res.status(400).json({ message: 'departmentId is required for Stock Out.' });
  }

  for (const item of items) {
    if (!item.catalogItemId || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({ message: 'Each item needs catalogItemId and quantity > 0.' });
    }
  }

  const created = await prisma.$transaction(async (tx) => {
    const createdTxn = await tx.transaction.create({
      data: {
        transactionId: transactionId || `TXN-${new Date(date).getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        date: new Date(date),
        type: mapTransactionType(type),
        departmentId: departmentId || null,
        supplier: supplier || null,
        referenceNo: referenceNo || null,
        locationId: locationId || null,
        status,
        remarks: remarks || null,
        createdBy,
        items: {
          create: items.map((item: any) => ({
            catalogItemId: item.catalogItemId,
            quantity: item.quantity,
            remarks: item.remarks || null,
            custodianId: item.custodianId || null,
          })),
        },
      },
      include: { items: true },
    });

    // Adjust catalog quantities for consumables
    for (const item of items) {
      const catalog = await tx.catalogItem.findUnique({ where: { id: item.catalogItemId } });
      if (!catalog) continue;
      if (catalog.itemType !== 'Consumable') continue;
      const delta = Number(item.quantity) || 0;
      const newQty = createdTxn.type === 'StockIn'
        ? (catalog.quantity || 0) + delta
        : Math.max(0, (catalog.quantity || 0) - delta);
      await tx.catalogItem.update({
        where: { id: catalog.id },
        data: { quantity: newQty },
      });
    }

    return createdTxn;
  });

  const withRelations = await prisma.transaction.findUnique({
    where: { id: created.id },
    include: { items: true, department: true, location: true },
  });
  res.status(201).json(withRelations);
}));

app.get('/api/mrs', asyncHandler(async (_req, res) => {
  const mrs = await prisma.memorandumReceipt.findMany({
    orderBy: { dateIssued: 'desc' },
    include: { employee: true, department: true, items: true },
  });
  res.json(mrs);
}));

app.post('/api/mrs', asyncHandler(async (req, res) => {
  const { mrNumber, dateIssued, employeeId, departmentId, items = [], status = 'Active', remarks } = req.body || {};
  if (!dateIssued || !employeeId || !departmentId) {
    return res.status(400).json({ message: 'dateIssued, employeeId, and departmentId are required.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one asset is required.' });
  }
  for (const item of items) {
    if (!item.assetId || !item.propertyNumber || !item.description || item.unitValue === undefined) {
      return res.status(400).json({ message: 'Each item needs assetId, propertyNumber, description, and unitValue.' });
    }
  }

  const created = await prisma.memorandumReceipt.create({
    data: {
      mrNumber: mrNumber || `MR-${new Date(dateIssued).getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      dateIssued: new Date(dateIssued),
      employeeId,
      departmentId,
      status,
      remarks: remarks || null,
      items: {
        create: items.map((i: any) => ({
          assetId: i.assetId,
          propertyNumber: i.propertyNumber,
          description: i.description,
          unitValue: new Prisma.Decimal(i.unitValue),
          remarks: i.remarks || null,
          returnDate: i.returnDate ? new Date(i.returnDate) : null,
        })),
      },
    },
    include: { items: true, employee: true, department: true },
  });

  res.status(201).json(created);
}));

app.get('/api/audits', asyncHandler(async (_req, res) => {
  const audits = await prisma.auditSession.findMany({
    orderBy: { date: 'desc' },
    include: { department: true, location: true, items: true },
  });
  res.json(audits);
}));

app.get('/api/logs', asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, 1000);
  const logs = await prisma.activityLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
  res.json(logs);
}));

app.post('/api/logs', asyncHandler(async (req, res) => {
  const { userId, username, role, action, module, description, referenceId, timestamp } = req.body || {};
  if (!userId || !username || !role || !action || !module || !description) {
    return res.status(400).json({ message: 'userId, username, role, action, module, and description are required.' });
  }
  const log = await prisma.activityLog.create({
    data: {
      userId,
      username,
      role,
      action,
      module,
      description,
      referenceId: referenceId || '-',
      timestamp: timestamp ? new Date(timestamp) : undefined,
    },
  });
  res.status(201).json(log);
}));

app.get('/api/settings', asyncHandler(async (_req, res) => {
  const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
  res.json(settings);
}));

app.put('/api/settings', authMiddleware, asyncHandler(async (req, res) => {
  if (!ensureRole(req, res, ['Officer'])) return;
  const { general, inventory, documents, notifications, integrations } = req.body || {};
  const updated = await prisma.systemSettings.update({
    where: { id: 1 },
    data: {
      general,
      inventory,
      documents,
      notifications,
      integrations,
    },
  });
  res.json(updated);
}));

app.get('/api/users', authMiddleware, asyncHandler(async (req, res) => {
  if (!ensureRole(req, res, ['Officer'])) return;
  const users = await prisma.user.findMany({ orderBy: { username: 'asc' } });
  res.json(users);
}));

app.post('/api/users', authMiddleware, asyncHandler(async (req, res) => {
  if (!ensureRole(req, res, ['Officer'])) return;
  const { username, password, role = 'Staff', status = 'Active' } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' });
  }
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return res.status(400).json({ message: 'Username already exists' });
  const created = await prisma.user.create({
    data: { username, passwordHash: password, role, status },
  });
  res.status(201).json(created);
}));

app.put('/api/users/:id', authMiddleware, asyncHandler(async (req, res) => {
  if (!ensureRole(req, res, ['Officer'])) return;
  const { id } = req.params;
  const { password, role, status } = req.body || {};
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const currentUser = (req as any).user;
  if (status === 'Inactive' && currentUser?.id === id) {
    return res.status(400).json({ message: 'You cannot deactivate your own account.' });
  }
  const updated = await prisma.user.update({
    where: { id },
    data: {
      passwordHash: password ?? user.passwordHash,
      role: role ?? user.role,
      status: status ?? user.status,
    },
  });
  res.json(updated);
}));

// Maintenance (Officer only)
app.post('/api/maintenance/export', authMiddleware, asyncHandler(async (req, res) => {
  if (!ensureRole(req, res, ['Officer'])) return;
  const [
    departments,
    locations,
    funds,
    categories,
    employees,
    catalog,
    assets,
    transactions,
    mrs,
    audits,
    settings,
    users,
    logs,
  ] = await Promise.all([
    prisma.department.findMany(),
    prisma.location.findMany(),
    prisma.fundCluster.findMany(),
    prisma.assetCategory.findMany(),
    prisma.employee.findMany(),
    prisma.catalogItem.findMany(),
    prisma.asset.findMany(),
    prisma.transaction.findMany({ include: { items: true } }),
    prisma.memorandumReceipt.findMany({ include: { items: true } }),
    prisma.auditSession.findMany({ include: { items: true } }),
    prisma.systemSettings.findUnique({ where: { id: 1 } }),
    prisma.user.findMany(),
    prisma.activityLog.findMany({ orderBy: { timestamp: 'desc' }, take: 500 }),
  ]);

  res.json({
    exportedAt: new Date().toISOString(),
    data: {
      departments,
      locations,
      funds,
      categories,
      employees,
      catalog,
      assets,
      transactions,
      mrs,
      audits,
      settings,
      users,
      logs,
    },
  });
}));

app.post('/api/maintenance/reset', authMiddleware, asyncHandler(async (req, res) => {
  if (!ensureRole(req, res, ['Officer'])) return;
  return res.status(503).json({ message: 'Reset is disabled via API for safety. Please run the seed script manually if you need to reset demo data.' });
}));

app.post('/api/maintenance/health', authMiddleware, asyncHandler(async (req, res) => {
  if (!ensureRole(req, res, ['Officer'])) return;
  const issues: any[] = [];

  const catalogNeg = await prisma.catalogItem.findMany({ where: { quantity: { lt: 0 } } });
  catalogNeg.forEach((c) => issues.push({ type: 'catalog_negative_qty', id: c.id, message: `Catalog ${c.article} has negative quantity (${c.quantity}).` }));

  const assetsNeg = await prisma.asset.findMany({ where: { quantity: { lt: 0 } } });
  assetsNeg.forEach((a) => issues.push({ type: 'asset_negative_qty', id: a.id, message: `Asset ${a.propertyNumber} has negative quantity (${a.quantity}).` }));

  const txnBad = await prisma.transaction.findMany({
    where: { items: { some: { quantity: { lte: 0 } } } },
    include: { items: true },
  });
  txnBad.forEach((t) => {
    t.items.filter((i) => i.quantity <= 0).forEach((i) => {
      issues.push({ type: 'transaction_invalid_qty', id: `${t.id}:${i.id}`, message: `Transaction ${t.transactionId} has item with quantity ${i.quantity}.` });
    });
  });

  const auditsNoAsset = await prisma.auditItem.findMany({
    where: { assetId: { equals: '' } }
  });
  auditsNoAsset.forEach((ai) => issues.push({ type: 'audit_missing_asset', id: ai.id, message: `Audit item ${ai.id} has missing asset reference.` }));

  res.json({
    timestamp: new Date().toISOString(),
    summary: { issues: issues.length },
    issues,
  });
}));

app.post('/api/audits', asyncHandler(async (req, res) => {
  const { sessionId, date, departmentId, locationId, description, items = [], status = 'Draft', createdBy = 'System', createdAt } = req.body || {};
  if (!sessionId || !date || !description) {
    return res.status(400).json({ message: 'sessionId, date, and description are required.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one audit item is required.' });
  }

  const created = await prisma.auditSession.create({
    data: {
      sessionId,
      date: new Date(date),
      departmentId: departmentId || null,
      locationId: locationId || null,
      description,
      status: mapAuditSessionStatus(status),
      createdBy,
      createdAt: createdAt ? new Date(createdAt) : undefined,
      items: {
        create: items.map((i: any) => ({
          assetId: i.assetId,
          propertyNumber: i.propertyNumber,
          description: i.description,
          unitValue: new Prisma.Decimal(i.unitValue),
          systemQty: i.systemQty,
          actualQty: i.actualQty,
          shortageOverageQty: i.shortageOverageQty,
          shortageOverageValue: new Prisma.Decimal(i.shortageOverageValue || 0),
          status: mapAuditItemStatus(i.status),
          remarks: i.remarks || null,
          locationName: i.locationName,
          custodianName: i.custodianName,
        })),
      },
    },
    include: { items: true, department: true, location: true },
  });

  res.status(201).json(created);
}));

app.put('/api/audits/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sessionId, date, departmentId, locationId, description, items = [], status, finalizedAt } = req.body || {};
  const existing = await prisma.auditSession.findUnique({ where: { id }, include: { items: true } });
  if (!existing) return res.status(404).json({ message: 'Audit session not found.' });

  const updated = await prisma.$transaction(async (tx) => {
    if (Array.isArray(items) && items.length > 0) {
      await tx.auditItem.deleteMany({ where: { auditId: id } });
      await tx.auditItem.createMany({
        data: items.map((i: any) => ({
          auditId: id,
          assetId: i.assetId,
          propertyNumber: i.propertyNumber,
          description: i.description,
          unitValue: Number(i.unitValue),
          systemQty: i.systemQty,
          actualQty: i.actualQty,
          shortageOverageQty: i.shortageOverageQty,
          shortageOverageValue: Number(i.shortageOverageValue || 0),
          status: mapAuditItemStatus(i.status),
          remarks: i.remarks || null,
          locationName: i.locationName,
          custodianName: i.custodianName,
        })),
      });
    }

    const upd = await tx.auditSession.update({
      where: { id },
      data: {
        sessionId: sessionId ?? existing.sessionId,
        date: date ? new Date(date) : existing.date,
        departmentId: departmentId === undefined ? existing.departmentId : departmentId || null,
        locationId: locationId === undefined ? existing.locationId : locationId || null,
        description: description ?? existing.description,
        status: status ? mapAuditSessionStatus(status) : existing.status,
        finalizedAt: finalizedAt ? new Date(finalizedAt) : existing.finalizedAt,
      },
      include: { items: true, department: true, location: true },
    });
    return upd;
  });

  res.json(updated);
}));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Unexpected error' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
