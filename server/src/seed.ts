import dotenv from 'dotenv';
import {
  AuditItemStatus,
  AuditSessionStatus,
  AssetStatus,
  CategoryType,
  ItemType,
  MRStatus,
  Prisma,
  Status,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { prisma } from './prisma';
import {
  INITIAL_AUDITS,
  INITIAL_CATALOG,
  INITIAL_CATEGORIES,
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_FUNDS,
  INITIAL_LOCATIONS,
  INITIAL_LOGS,
  INITIAL_MRS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_ASSETS,
} from '../constants';

dotenv.config();

const mapCategoryType = (type: string): CategoryType =>
  type === 'Semi-Expendable' ? 'SemiExpendable' : (type as CategoryType);

const mapAssetStatus = (status: string): AssetStatus => {
  if (status === 'Under Repair') return 'UnderRepair';
  return status as AssetStatus;
};

const mapTransactionType = (type: string): TransactionType =>
  type === 'Stock In' ? 'StockIn' : 'StockOut';

const mapAuditStatus = (status: string): AuditItemStatus =>
  status as AuditItemStatus;

const mapAuditSessionStatus = (status: string): AuditSessionStatus =>
  status as AuditSessionStatus;

const toDate = (value: string | undefined) => (value ? new Date(value) : new Date());

const departmentById = new Map<string, string>();
const departmentByCode = new Map<string, string>();
const locationById = new Map<string, string>();
const locationByCode = new Map<string, string>();
const fundById = new Map<string, string>();
const categoryById = new Map<string, string>();
const categoryByCode = new Map<string, string>();
const catalogById = new Map<string, string>();
const employeeById = new Map<string, string>();

const resolveDepartmentId = (value: string) =>
  departmentById.get(value) ?? departmentByCode.get(value) ?? value;
const resolveLocationId = (value: string) =>
  locationById.get(value) ?? locationByCode.get(value) ?? value;
const resolveFundId = (value: string) => fundById.get(value) ?? value;
const resolveCategoryId = (value: string) =>
  categoryById.get(value) ?? categoryByCode.get(value) ?? value;
const resolveCatalogItemId = (value: string) => catalogById.get(value) ?? value;
const resolveEmployeeId = (value: string) => employeeById.get(value) ?? value;
const resolveUserId = (value: string) => value === 'E001' ? 'U-OFFICER' : value;

async function main() {
  console.log('Resetting database...');
  await prisma.auditItem.deleteMany();
  await prisma.auditSession.deleteMany();
  await prisma.mRItem.deleteMany();
  await prisma.memorandumReceipt.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.catalogItem.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.fundCluster.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.location.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.systemSettings.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding base users...');
  await prisma.user.createMany({
    data: [
      {
        id: 'U-OFFICER',
        username: 'officer',
        passwordHash: 'admin123',
        role: 'Officer',
        status: Status.Active,
      },
      {
        id: 'U-STAFF',
        username: 'staff',
        passwordHash: 'staff123',
        role: 'Staff',
        status: Status.Active,
      }
    ]
  });

  console.log('Seeding locations...');
  for (const loc of INITIAL_LOCATIONS) {
    await prisma.location.create({
      data: {
        id: loc.id,
        code: loc.code,
        name: loc.name,
        description: loc.description ?? null,
        status: loc.status as Status,
        createdAt: loc.createdAt ? new Date(loc.createdAt) : undefined,
      },
    });
    locationById.set(loc.id, loc.id);
    locationByCode.set(loc.code, loc.id);
  }

  console.log('Seeding departments...');
  for (const dept of INITIAL_DEPARTMENTS) {
    const created = await prisma.department.create({
      data: {
        id: dept.id,
        code: dept.code,
        name: dept.name,
        head: dept.head ?? null,
        locationId: dept.locationId ? resolveLocationId(dept.locationId) : null,
        status: dept.status as Status,
        createdAt: dept.createdAt ? new Date(dept.createdAt) : undefined,
      },
    });
    departmentById.set(created.id, created.id);
    departmentByCode.set(created.code, created.id);
  }

  console.log('Seeding employees...');
  for (const emp of INITIAL_EMPLOYEES) {
    const created = await prisma.employee.create({
      data: {
        id: emp.id,
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        middleName: emp.middleName || null,
        lastName: emp.lastName,
        position: emp.position || null,
        departmentId: resolveDepartmentId(emp.departmentId),
        status: emp.status as Status,
        createdAt: emp.createdAt ? new Date(emp.createdAt) : undefined,
      },
    });
    employeeById.set(created.id, created.id);
  }

  console.log('Seeding fund clusters...');
  for (const fund of INITIAL_FUNDS) {
    await prisma.fundCluster.create({
      data: {
        id: fund.id,
        code: fund.code,
        name: fund.name,
        description: fund.description || null,
        status: fund.status as Status,
        createdAt: fund.createdAt ? new Date(fund.createdAt) : undefined,
      },
    });
    fundById.set(fund.id, fund.id);
  }

  console.log('Seeding categories...');
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.assetCategory.create({
      data: {
        id: cat.id,
        code: cat.code,
        name: cat.name,
        description: cat.description || null,
        type: mapCategoryType(cat.type),
        status: cat.status as Status,
        createdAt: cat.createdAt ? new Date(cat.createdAt) : undefined,
      },
    });
    categoryById.set(cat.id, cat.id);
    categoryByCode.set(cat.code, cat.id);
  }

  console.log('Seeding catalog items...');
  for (const item of INITIAL_CATALOG) {
    await prisma.catalogItem.create({
      data: {
        id: item.id,
        stockNumber: item.stockNumber,
        article: item.article,
        description: item.description,
        categoryId: resolveCategoryId(item.categoryId),
        fundClusterId: item.fundClusterId ? resolveFundId(item.fundClusterId) : null,
        unit: item.unit,
        unitValue: item.unitValue ?? null,
        itemType: item.itemType as ItemType,
        quantity: item.quantity,
        estimatedUsefulLife: item.estimatedUsefulLife ?? null,
        reorderPoint: item.reorderPoint ?? null,
        status: item.status as Status,
      },
    });
    catalogById.set(item.id, item.id);
  }

  console.log('Seeding assets...');
  for (const asset of INITIAL_ASSETS) {
    await prisma.asset.create({
      data: {
        id: asset.id,
        propertyNumber: asset.propertyNumber,
        catalogItemId: resolveCatalogItemId(asset.catalogItemId),
        description: asset.description,
        unitValue: new Prisma.Decimal(asset.unitValue),
        quantity: asset.quantity,
        dateAcquired: toDate(asset.dateAcquired),
        fundClusterId: resolveFundId(asset.fundClusterId),
        departmentId: resolveDepartmentId(asset.departmentId),
        custodianId: resolveEmployeeId(asset.custodianId),
        locationId: resolveLocationId(asset.locationId),
        status: mapAssetStatus(asset.status),
        remarks: asset.remarks || null,
      },
    });
  }

  console.log('Seeding transactions...');
  for (const txn of INITIAL_TRANSACTIONS) {
    await prisma.transaction.create({
      data: {
        id: txn.id,
        transactionId: txn.transactionId,
        date: toDate(txn.date),
        type: mapTransactionType(txn.type),
        departmentId: txn.departmentId ? resolveDepartmentId(txn.departmentId) : null,
        status: txn.status as TransactionStatus,
        remarks: txn.remarks || null,
        createdBy: txn.createdBy,
        createdAt: txn.createdAt ? new Date(txn.createdAt) : undefined,
        items: {
          create: txn.items.map((item: any) => ({
            id: item.id,
            catalogItemId: resolveCatalogItemId(item.catalogItemId),
            quantity: item.quantity,
            remarks: item.remarks || null,
            custodianId: item.custodianId ? resolveEmployeeId(item.custodianId) : null,
          })),
        },
      },
    });
  }

  console.log('Seeding Memorandum Receipts...');
  for (const mr of INITIAL_MRS) {
    await prisma.memorandumReceipt.create({
      data: {
        id: mr.id,
        mrNumber: mr.mrNumber,
        dateIssued: toDate(mr.dateIssued),
        employeeId: resolveEmployeeId(mr.employeeId),
        departmentId: resolveDepartmentId(mr.departmentId),
        status: mr.status as MRStatus,
        remarks: mr.remarks || null,
        items: {
          create: mr.items.map((item: any) => ({
            assetId: item.assetId,
            propertyNumber: item.propertyNumber,
            description: item.description,
            unitValue: new Prisma.Decimal(item.unitValue),
            remarks: item.remarks || null,
            returnDate: item.returnDate ? toDate(item.returnDate) : null,
          })),
        },
      },
    });
  }

  console.log('Seeding audit sessions...');
  for (const audit of INITIAL_AUDITS) {
    await prisma.auditSession.create({
      data: {
        id: audit.id,
        sessionId: audit.sessionId,
        date: toDate(audit.date),
        departmentId: audit.departmentId ? resolveDepartmentId(audit.departmentId) : null,
        locationId: audit.locationId ? resolveLocationId(audit.locationId) : null,
        description: audit.description,
        status: mapAuditSessionStatus(audit.status),
        createdBy: audit.createdBy,
        createdAt: audit.createdAt ? toDate(audit.createdAt) : undefined,
        finalizedAt: audit.finalizedAt ? toDate(audit.finalizedAt) : null,
        items: {
          create: audit.items.map((item: any) => ({
            assetId: item.assetId,
            propertyNumber: item.propertyNumber,
            description: item.description,
            unitValue: new Prisma.Decimal(item.unitValue),
            systemQty: item.systemQty,
            actualQty: item.actualQty,
            shortageOverageQty: item.shortageOverageQty,
            shortageOverageValue: new Prisma.Decimal(item.shortageOverageValue ?? 0),
            status: mapAuditStatus(item.status),
            remarks: item.remarks || null,
            locationName: item.locationName,
            custodianName: item.custodianName,
          })),
        },
      },
    });
  }

  console.log('Seeding activity logs...');
  for (const log of INITIAL_LOGS) {
    await prisma.activityLog.create({
      data: {
        id: log.id,
        timestamp: toDate(log.timestamp),
        userId: resolveUserId(log.userId),
        username: log.username,
        role: log.role,
        action: log.action,
        module: log.module,
        referenceId: log.referenceId,
        description: log.description,
      },
    });
  }

  console.log('Seeding system settings...');
  await prisma.systemSettings.create({
    data: {
      id: 1,
      general: INITIAL_SETTINGS.general,
      inventory: INITIAL_SETTINGS.inventory,
      documents: INITIAL_SETTINGS.documents,
      notifications: INITIAL_SETTINGS.notifications,
      integrations: INITIAL_SETTINGS.integrations,
    },
  });

  console.log('Database seed completed.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
