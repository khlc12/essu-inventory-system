
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  INITIAL_INVENTORY, 
  INITIAL_DEPARTMENTS, 
  INITIAL_EMPLOYEES, 
  INITIAL_LOCATIONS, 
  INITIAL_FUNDS, 
  INITIAL_CATEGORIES,
  INITIAL_CATALOG,
  INITIAL_TRANSACTIONS,
  INITIAL_ASSETS,
  INITIAL_MRS,
  INITIAL_AUDITS,
  INITIAL_LOGS,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS
} from './constants';
import { 
  bootstrapDataFromApi, 
  createAsset, 
  updateAsset,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
  createLocation,
  updateLocation,
  deactivateLocation,
  createFund,
  updateFund,
  deactivateFund,
  createCategory,
  updateCategory,
  deactivateCategory,
  createCatalogItem,
  updateCatalogItem,
  deactivateCatalogItem,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  createTransaction,
  createMemorandumReceipt,
  createAuditSession,
  updateAuditSession,
  createActivityLog
} from './api';
import { 
  InventoryItem, 
  AuditStatus, 
  ViewState,
  Department,
  Employee,
  Location,
  FundCluster,
  AssetCategory,
  CatalogItem,
  Transaction,
  TransactionItem,
  TransactionType,
  Asset,
  AssetStatus,
  MemorandumReceipt,
  MRItem,
  MRStatus,
  AuditSession,
  AuditItem,
  AuditSessionStatus,
  LogEntry,
  SystemSettings,
  AppNotification
} from './types';
import { 
  LayoutDashboard, 
  PackageSearch, 
  FileText, 
  Settings, 
  Search, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Menu,
  Bell,
  Printer,
  Database,
  Users,
  Building,
  MapPin,
  Wallet,
  Tags,
  Box,
  Archive,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Undo2,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  UserCircle,
  Calendar,
  Info,
  Monitor,
  Filter,
  ClipboardList,
  ScrollText,
  FileCheck,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  AlertTriangle,
  History,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpDown,
  LogIn,
  ShieldCheck,
  Ban,
  ToggleLeft,
  ToggleRight,
  LogOut,
  Upload,
  RefreshCw,
  FileJson,
  Check,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  User,
  MoreVertical,
  Layers
} from 'lucide-react';

// --- Utility Functions ---
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const formatDateTime = (dateStr: string) => new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const getEmployeeFullName = (e?: Employee) => {
  if (!e) return 'Unknown';
  return `${e.lastName}, ${e.firstName} ${e.middleName ? e.middleName[0] + '.' : ''}`.trim();
};

const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => {
      const val = row[fieldName] ? String(row[fieldName]).replace(/,/g, ' ') : '';
      return val;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// --- Helper Components ---

const ESSUHeader = () => (
  <div className="hidden print:block text-center mb-8 font-serif">
    <div className="text-xs font-bold tracking-wider">Republic of the Philippines</div>
    <div className="text-sm font-bold text-[#006400] tracking-wide">EASTERN SAMAR STATE UNIVERSITY</div>
    <div className="text-xs italic">Borongan City, Eastern Samar</div>
    <div className="mt-4 pt-2 border-t border-black w-full max-w-md mx-auto"></div>
    <div className="mt-1 font-bold text-lg uppercase tracking-widest">Supply Office</div>
  </div>
);

const NavSection = ({ label, children, collapsed }: any) => (
  <div className="mb-4">
    {!collapsed && <div className="px-4 text-xs font-semibold text-green-200/60 uppercase tracking-wider mb-2">{label}</div>}
    <div className="space-y-1">{children}</div>
  </div>
);

const NavItem = ({ icon, label, active, onClick, collapsed }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors rounded-lg mx-2 w-auto ${
      active 
        ? 'bg-white/10 text-yellow-400 shadow-lg shadow-black/10 border border-white/5' 
        : 'text-green-100/70 hover:text-white hover:bg-white/5'
    }`}
  >
    <span className={`${active ? 'text-yellow-400' : 'text-green-100/70 group-hover:text-white'}`}>{icon}</span>
    {!collapsed && <span>{label}</span>}
  </button>
);

const StatCard = ({ label, value, subtext, icon, colorClass, iconColorClass }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform ${iconColorClass}`}>
       {React.cloneElement(icon, { size: 48 })}
    </div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
         {React.cloneElement(icon, { className: `w-6 h-6 ${iconColorClass || colorClass.replace('bg-', 'text-')}` })}
      </div>
      {subtext && <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full border border-slate-200">{subtext}</span>}
    </div>
    <div className="text-2xl font-bold text-slate-800 mb-1 relative z-10">{value}</div>
    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide relative z-10">{label}</div>
  </div>
);

// --- Custom Stock Movement Chart ---
const StockMovementChart = ({ transactions, departments }: { transactions: Transaction[], departments: Department[] }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDept, setSelectedDept] = useState('All');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((monthName, index) => {
      const monthlyTxs = transactions.filter(t => {
        const d = new Date(t.date);
        const matchesYear = d.getFullYear() === selectedYear;
        const matchesMonth = d.getMonth() === index;
        const matchesDept = selectedDept === 'All' || t.departmentId === selectedDept;
        return matchesYear && matchesMonth && matchesDept;
      });
      const inCount = monthlyTxs.filter(t => t.type === 'Stock In').reduce((sum, t) => sum + t.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);
      const outCount = monthlyTxs.filter(t => t.type === 'Stock Out').reduce((sum, t) => sum + t.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);
      return { month: monthName, in: inCount, out: outCount };
    });
  }, [transactions, selectedYear, selectedDept]);

  const maxVal = Math.max(...chartData.map(d => Math.max(d.in, d.out)), 10);

  return (
    <div className="w-full">
       <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div className="flex gap-2">
             <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="text-xs border border-slate-200 rounded px-2 py-1 outline-none focus:border-[#006400]">
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
             </select>
             <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="text-xs border border-slate-200 rounded px-2 py-1 outline-none focus:border-[#006400] max-w-[120px]">
                <option value="All">All Depts</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
             </select>
          </div>
          <div className="flex bg-slate-100 rounded p-0.5">
             <button onClick={() => setChartType('bar')} className={`p-1 rounded ${chartType === 'bar' ? 'bg-white shadow text-[#006400]' : 'text-slate-400 hover:text-slate-600'}`}><BarChart3 size={14} /></button>
             <button onClick={() => setChartType('line')} className={`p-1 rounded ${chartType === 'line' ? 'bg-white shadow text-[#006400]' : 'text-slate-400 hover:text-slate-600'}`}><LineChart size={14} /></button>
          </div>
       </div>
      <div className="h-72 w-full relative">
         {chartType === 'bar' ? (
           <div className="h-full flex items-end justify-between gap-1 pb-2">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group h-full">
                <div className="flex gap-1 w-full justify-center items-end flex-1 relative">
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">
                     <div className="font-bold mb-1">{d.month} {selectedYear}</div>
                     <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#006400]"></span> In: {d.in}</div>
                     <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Out: {d.out}</div>
                  </div>
                  <div className="w-2 md:w-4 bg-[#006400] rounded-t-sm transition-all duration-500 hover:bg-green-700 relative group/bar" style={{ height: `${(d.in / maxVal) * 100}%` }} />
                  <div className="w-2 md:w-4 bg-yellow-400 rounded-t-sm transition-all duration-500 hover:bg-yellow-300 relative group/bar" style={{ height: `${(d.out / maxVal) * 100}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 font-medium h-4 shrink-0">{d.month}</span>
              </div>
            ))}
           </div>
         ) : (
            <div className="h-full w-full relative flex flex-col">
                <div className="flex-1 w-full relative min-h-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        {[0, 25, 50, 75, 100].map(y => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f1f5f9" strokeWidth="0.5" />)}
                        <polyline fill="none" stroke="#006400" strokeWidth="1.5" points={chartData.map((d, i) => `${(i / 11) * 100},${100 - ((d.in / maxVal) * 100)}`).join(' ')} />
                        <polyline fill="none" stroke="#FACC15" strokeWidth="1.5" points={chartData.map((d, i) => `${(i / 11) * 100},${100 - ((d.out / maxVal) * 100)}`).join(' ')} />
                        {chartData.map((d, i) => (
                           <g key={i} className="group">
                              <circle cx={`${(i / 11) * 100}%`} cy={`${100 - ((d.in / maxVal) * 100)}%`} r="2" fill="#006400" className="transition-all group-hover:r-3 cursor-pointer" />
                              <circle cx={`${(i / 11) * 100}%`} cy={`${100 - ((d.out / maxVal) * 100)}%`} r="2" fill="#FACC15" className="transition-all group-hover:r-3 cursor-pointer" />
                           </g>
                        ))}
                    </svg>
                </div>
                <div className="flex justify-between mt-2 px-1 h-6 shrink-0">
                   {chartData.map(d => <span key={d.month} className="text-[10px] text-slate-500 w-full text-center">{d.month}</span>)}
                </div>
            </div>
         )}
      </div>
    </div>
  );
};

// --- Reports Module ---
const ReportsModule = ({ assets, catalog, transactions, audits, departments, locations, categories }: any) => {
    const [activeTab, setActiveTab] = useState<'ppe' | 'consumables' | 'movement' | 'audit'>('ppe');
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        department: 'All',
        category: 'All',
        status: 'Active'
    });

    const filteredPPE = useMemo(() => {
        return assets.filter((a: Asset) => {
            const matchesStatus = filters.status === 'All' ? true : a.status === filters.status;
            // Add more filters as needed
            return matchesStatus;
        });
    }, [assets, filters]);

    const stockMovementData = useMemo(() => {
        return transactions.flatMap((t: Transaction) => 
            t.items.map(item => ({
                id: item.id,
                date: t.date,
                type: t.type,
                transactionId: t.transactionId,
                source: t.type === 'Stock In'
                  ? (t.supplier || 'Supplier')
                  : (departments.find((d: Department) => d.id === t.departmentId)?.name || 'Unknown'),
                itemName: catalog.find((c: CatalogItem) => c.id === item.catalogItemId)?.article || 'Unknown Item',
                quantity: item.quantity,
                remarks: item.remarks
            }))
        ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, departments, catalog]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold text-slate-800">Reports Center</h1>
                <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white rounded-lg flex items-center gap-2 hover:bg-slate-700">
                    <Printer size={16} /> Print Report
                </button>
            </div>

            <div className="flex gap-2 border-b border-slate-200 print:hidden overflow-x-auto">
                <button onClick={() => setActiveTab('ppe')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'ppe' ? 'border-[#006400] text-[#006400]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>PPE Inventory</button>
                <button onClick={() => setActiveTab('consumables')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'consumables' ? 'border-[#006400] text-[#006400]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Consumables Stock</button>
                <button onClick={() => setActiveTab('movement')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'movement' ? 'border-[#006400] text-[#006400]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Stock Movement</button>
                <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'audit' ? 'border-[#006400] text-[#006400]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Audit Findings</button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:border-none print:shadow-none">
                <ESSUHeader />
                
                {activeTab === 'ppe' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800">Report on the Physical Count of Property, Plant and Equipment</h2>
                            <div className="text-sm text-slate-500 print:hidden">Showing {filteredPPE.length} assets</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border border-slate-300">
                                <thead className="bg-slate-100 text-slate-800 font-semibold">
                                    <tr>
                                        <th className="px-3 py-2 border border-slate-300">Property No.</th>
                                        <th className="px-3 py-2 border border-slate-300">Article / Description</th>
                                        <th className="px-3 py-2 border border-slate-300">Date Acquired</th>
                                        <th className="px-3 py-2 border border-slate-300 text-right">Unit Value</th>
                                        <th className="px-3 py-2 border border-slate-300">Location</th>
                                        <th className="px-3 py-2 border border-slate-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPPE.map((a: Asset) => (
                                        <tr key={a.id}>
                                            <td className="px-3 py-2 border border-slate-300 font-medium">{a.propertyNumber}</td>
                                            <td className="px-3 py-2 border border-slate-300">
                                                <div className="font-medium">{catalog.find((c:any) => c.id === a.catalogItemId)?.article}</div>
                                                <div className="text-xs text-slate-500">{a.description}</div>
                                            </td>
                                            <td className="px-3 py-2 border border-slate-300">{formatDate(a.dateAcquired)}</td>
                                            <td className="px-3 py-2 border border-slate-300 text-right">{formatCurrency(a.unitValue)}</td>
                                            <td className="px-3 py-2 border border-slate-300">{locations.find((l:Location) => l.id === a.locationId)?.name}</td>
                                            <td className="px-3 py-2 border border-slate-300 text-center">{a.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'consumables' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">Inventory of Supplies and Materials</h2>
                        <table className="w-full text-sm text-left border border-slate-300">
                            <thead className="bg-slate-100 text-slate-800 font-semibold">
                                <tr>
                                    <th className="px-3 py-2 border border-slate-300">Stock No.</th>
                                    <th className="px-3 py-2 border border-slate-300">Item</th>
                                    <th className="px-3 py-2 border border-slate-300">Unit</th>
                                    <th className="px-3 py-2 border border-slate-300 text-center">Stock on Hand</th>
                                    <th className="px-3 py-2 border border-slate-300 text-right">Unit Cost</th>
                                    <th className="px-3 py-2 border border-slate-300 text-right">Total Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {catalog.filter((c: CatalogItem) => c.itemType === 'Consumable').map((c: CatalogItem) => (
                                    <tr key={c.id}>
                                        <td className="px-3 py-2 border border-slate-300 font-medium">{c.stockNumber}</td>
                                        <td className="px-3 py-2 border border-slate-300">
                                            <div>{c.article}</div>
                                            <div className="text-xs text-slate-500">{c.description}</div>
                                        </td>
                                        <td className="px-3 py-2 border border-slate-300">{c.unit}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center font-bold">{c.quantity}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-right">{formatCurrency(c.unitValue || 0)}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-right">{formatCurrency((c.unitValue || 0) * c.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'movement' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">Stock Movement Report</h2>
                        <table className="w-full text-sm text-left border border-slate-300">
                            <thead className="bg-slate-100 text-slate-800 font-semibold">
                                <tr>
                                    <th className="px-3 py-2 border border-slate-300">Date</th>
                                    <th className="px-3 py-2 border border-slate-300">Transaction ID</th>
                                    <th className="px-3 py-2 border border-slate-300">Type</th>
                                    <th className="px-3 py-2 border border-slate-300">Item</th>
                                    <th className="px-3 py-2 border border-slate-300">Source</th>
                                    <th className="px-3 py-2 border border-slate-300 text-right">Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockMovementData.map((row: any) => (
                                    <tr key={row.id}>
                                        <td className="px-3 py-2 border border-slate-300">{formatDate(row.date)}</td>
                                        <td className="px-3 py-2 border border-slate-300 font-medium">{row.transactionId}</td>
                                        <td className="px-3 py-2 border border-slate-300">
                                            <span className={`text-xs font-bold ${row.type === 'Stock In' ? 'text-green-700' : 'text-amber-700'}`}>{row.type.toUpperCase()}</span>
                                        </td>
                                        <td className="px-3 py-2 border border-slate-300">{row.itemName}</td>
                                        <td className="px-3 py-2 border border-slate-300">{row.source}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-right font-bold">{row.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">Audit & Physical Count Findings</h2>
                        <table className="w-full text-sm text-left border border-slate-300">
                            <thead className="bg-slate-100 text-slate-800 font-semibold">
                                <tr>
                                    <th className="px-3 py-2 border border-slate-300">Session ID</th>
                                    <th className="px-3 py-2 border border-slate-300">Date</th>
                                    <th className="px-3 py-2 border border-slate-300">Scope</th>
                                    <th className="px-3 py-2 border border-slate-300 text-center">Items Counted</th>
                                    <th className="px-3 py-2 border border-slate-300 text-center text-red-600">Shortages</th>
                                    <th className="px-3 py-2 border border-slate-300 text-right text-red-600">Total Shortage Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {audits.map((a: AuditSession) => {
                                    const shortageCount = a.items.filter(i => i.status === 'Shortage').length;
                                    const shortageVal = a.items.reduce((sum, i) => sum + (i.shortageOverageValue < 0 ? Math.abs(i.shortageOverageValue) : 0), 0);
                                    
                                    return (
                                        <tr key={a.id}>
                                            <td className="px-3 py-2 border border-slate-300 font-medium">{a.sessionId}</td>
                                            <td className="px-3 py-2 border border-slate-300">{formatDate(a.date)}</td>
                                            <td className="px-3 py-2 border border-slate-300">{a.description}</td>
                                            <td className="px-3 py-2 border border-slate-300 text-center">{a.items.length}</td>
                                            <td className="px-3 py-2 border border-slate-300 text-center font-bold text-red-600">{shortageCount}</td>
                                            <td className="px-3 py-2 border border-slate-300 text-right font-bold text-red-600">{formatCurrency(shortageVal)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Settings Module ---
const SettingsView = ({ settings, setSettings, onLog }: any) => {
    const handleChange = (section: string, field: string, value: any) => {
        setSettings((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
        if (onLog) onLog('Updated Settings', 'Settings', `Updated ${section}.${field}`);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Monitor className="text-[#006400]" />
                        <h3 className="font-bold text-slate-800">General Configuration</h3>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">System Name</label>
                        <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" 
                            value={settings.general.systemName} 
                            onChange={(e) => handleChange('general', 'systemName', e.target.value)} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Footer Text</label>
                        <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" 
                            value={settings.general.footerText}
                            onChange={(e) => handleChange('general', 'footerText', e.target.value)}
                        />
                    </div>
                </div>

                {/* Inventory Rules */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Box className="text-[#006400]" />
                        <h3 className="font-bold text-slate-800">Inventory Rules</h3>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Default Low Stock Threshold</label>
                        <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" 
                            value={settings.inventory.defaultReorderThreshold}
                            onChange={(e) => handleChange('inventory', 'defaultReorderThreshold', parseInt(e.target.value))}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                         <span className="text-sm font-medium text-slate-700">Enable Partial Audit Saving</span>
                         <button onClick={() => handleChange('inventory', 'enablePartialPhysicalCount', !settings.inventory.enablePartialPhysicalCount)} className="text-[#006400]">
                            {settings.inventory.enablePartialPhysicalCount ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-400" />}
                        </button>
                    </div>
                </div>

                {/* Document & Printing */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="text-[#006400]" />
                        <h3 className="font-bold text-slate-800">Document Defaults</h3>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                         <span className="text-sm font-medium text-slate-700">Include ESSU Logo on PDF</span>
                         <button onClick={() => handleChange('documents', 'includeLogoInPDF', !settings.documents.includeLogoInPDF)} className="text-[#006400]">
                            {settings.documents.includeLogoInPDF ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-400" />}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Prepared By (Default)</label>
                            <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" 
                                value={settings.documents.preparedBy}
                                onChange={(e) => handleChange('documents', 'preparedBy', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Received By (Default)</label>
                            <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" 
                                value={settings.documents.receivedBy}
                                onChange={(e) => handleChange('documents', 'receivedBy', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Maintenance */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Database className="text-[#006400]" />
                        <h3 className="font-bold text-slate-800">System Maintenance</h3>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600 mb-4">
                        Manage system data and backups.
                    </div>
                    <div className="flex gap-4">
                        <button className="flex-1 px-4 py-2 border border-slate-300 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 text-slate-700" onClick={() => alert('Download started...')}>
                            <Download size={16} /> Export DB
                        </button>
                        <button className="flex-1 px-4 py-2 border border-red-200 bg-red-50 rounded-lg flex items-center justify-center gap-2 hover:bg-red-100 text-red-600" onClick={() => alert('Reset function is disabled in prototype.')}>
                            <RefreshCw size={16} /> Reset Demo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Landing/Login Page Component ---
const LandingPage = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      if (username === 'admin' && password === 'password') {
        onLogin();
      } else {
        setError('Invalid username or password. Try admin / password');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-green-50/50 flex items-center justify-center font-sans">
      <div className="w-full max-w-5xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100 animate-in fade-in zoom-in duration-500 mx-4">
        <div className="w-full md:w-1/2 bg-[#006400] text-white p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <div className="absolute right-0 top-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute left-0 bottom-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-xl mb-6 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
               <ShieldCheck className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">ESSU Inventory</h1>
            <p className="text-green-100 text-sm opacity-90 leading-relaxed">Property, Plant, and Equipment (PPE) Management and Audit System</p>
          </div>
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3 text-sm text-green-50"><CheckCircle2 className="w-5 h-5 text-yellow-400" /><span>Real-time Stock Tracking</span></div>
             <div className="flex items-center gap-3 text-sm text-green-50"><CheckCircle2 className="w-5 h-5 text-yellow-400" /><span>Digital Audit Workflows</span></div>
             <div className="flex items-center gap-3 text-sm text-green-50"><CheckCircle2 className="w-5 h-5 text-yellow-400" /><span>Asset Lifecycle Management</span></div>
          </div>
          <div className="relative z-10 text-xs text-green-200/60 mt-8">&copy; 2025 Eastern Samar State University</div>
        </div>
        <div className="w-full md:w-1/2 p-12 bg-white flex flex-col justify-center">
           <div className="max-w-sm mx-auto w-full">
              <h2 className="text-2xl font-bold text-[#006400] mb-1">Welcome Back</h2>
              <p className="text-slate-500 text-sm mb-8">Please enter your credentials to access the system.</p>
              {error && <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-sm text-red-600 animate-in slide-in-from-top-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
              <form onSubmit={handleLogin} className="space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Username</label>
                    <div className="relative">
                       <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] focus:ring-1 focus:ring-[#006400] transition-all" placeholder="Enter your username" disabled={isLoading} />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Password</label>
                    <div className="relative">
                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] focus:ring-1 focus:ring-[#006400] transition-all" placeholder="••••••••" disabled={isLoading} />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#006400]">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                 </div>
                 <button type="submit" disabled={isLoading} className="w-full bg-[#006400] hover:bg-[#004d00] text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-green-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2">
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Authenticating...</span></> : <span>Sign In</span>}
                 </button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Activity Logs ---
const ActivityLogView = ({ logs, setLogs }: any) => {
    const [search, setSearch] = useState('');
    const [filterModule, setFilterModule] = useState('All');
    const [filterAction, setFilterAction] = useState('All');
    const [page, setPage] = useState(1);
    const pageSize = 25;

    const modules = useMemo(() => ['All', ...Array.from(new Set(logs.map((l: LogEntry) => l.module))).sort()], [logs]);
    const actions = useMemo(() => ['All', ...Array.from(new Set(logs.map((l: LogEntry) => l.action))).sort()], [logs]);

    const filtered = useMemo(() => {
        const term = search.toLowerCase();
        return logs.filter((log: LogEntry) => {
            const matchesModule = filterModule === 'All' || log.module === filterModule;
            const matchesAction = filterAction === 'All' || log.action === filterAction;
            const matchesSearch =
                term === '' ||
                log.description.toLowerCase().includes(term) ||
                log.username.toLowerCase().includes(term) ||
                log.referenceId.toLowerCase().includes(term);
            return matchesModule && matchesAction && matchesSearch;
        });
    }, [logs, filterModule, filterAction, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const resetPagination = () => setPage(1);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Activity Logs</h1>
                    <p className="text-sm text-slate-500">Showing {pageItems.length} of {filtered.length} log entries</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); resetPagination(); }}
                            placeholder="Search description, user, reference..."
                            className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400]"
                        />
                    </div>
                    <select
                        value={filterModule}
                        onChange={(e) => { setFilterModule(e.target.value); resetPagination(); }}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400]"
                    >
                        {modules.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                        value={filterAction}
                        onChange={(e) => { setFilterAction(e.target.value); resetPagination(); }}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400]"
                    >
                        {actions.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Module</th>
                            <th className="px-6 py-4">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pageItems.map((log: LogEntry) => (
                            <tr key={log.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3 text-slate-500">{formatDateTime(log.timestamp)}</td>
                                <td className="px-6 py-3 font-medium text-slate-800">{log.username}</td>
                                <td className="px-6 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        log.action.toLowerCase().includes('delete') || log.action.toLowerCase().includes('archive')
                                          ? 'bg-red-50 text-red-700'
                                          : log.action.toLowerCase().includes('update') || log.action.toLowerCase().includes('finalize')
                                          ? 'bg-amber-50 text-amber-700'
                                          : 'bg-green-50 text-green-700'
                                    }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-slate-600">{log.module}</td>
                                <td className="px-6 py-3 text-slate-600">{log.description}</td>
                            </tr>
                        ))}
                        {pageItems.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600">
                <div>Page {currentPage} of {totalPages}</div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded border ${currentPage === 1 ? 'text-slate-300 border-slate-200' : 'text-slate-700 border-slate-300 hover:border-[#006400] hover:text-[#006400]'}`}
                    >
                        Prev
                    </button>
                    <button
                        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'text-slate-300 border-slate-200' : 'text-slate-700 border-slate-300 hover:border-[#006400] hover:text-[#006400]'}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Asset Registry Modules ---
const AssetRegistryList = ({ assets, setAssets, departments, locations, catalog, employees, onNavigate, onLog }: any) => {
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDept, setFilterDept] = useState('All');
    const [filterLoc, setFilterLoc] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const availableYears = useMemo(() => {
        const years = new Set(assets.map((a: Asset) => new Date(a.dateAcquired).getFullYear()));
        return Array.from(years).sort((a: any, b: any) => b - a);
    }, [assets]);

    const filteredAssets = useMemo(() => {
        return assets.filter((a: Asset) => {
            const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
            const matchesDept = filterDept === 'All' || a.departmentId === filterDept;
            const matchesLoc = filterLoc === 'All' || a.locationId === filterLoc;
            const matchesYear = filterYear === 'All' || new Date(a.dateAcquired).getFullYear().toString() === filterYear.toString();
            
            const item = catalog.find((c: CatalogItem) => c.id === a.catalogItemId);
            const itemName = item ? item.article.toLowerCase() : '';
            const propNo = a.propertyNumber.toLowerCase();
            const matchesSearch = itemName.includes(searchTerm.toLowerCase()) || propNo.includes(searchTerm.toLowerCase());

            return matchesStatus && matchesDept && matchesLoc && matchesYear && matchesSearch;
        });
    }, [assets, filterStatus, filterDept, filterLoc, filterYear, searchTerm, catalog]);

    const handleEdit = (asset: Asset) => {
        onNavigate('asset-edit', asset);
    };

    const handleDelete = (id: string) => {
        if(confirm('Are you sure you want to delete/archive this asset?')) {
            const updated = assets.map((a: Asset) => a.id === id ? { ...a, status: 'Archived', updatedAt: new Date().toISOString() } : a);
            setAssets(updated);
            if (onLog) onLog('Archived Asset', 'Asset Registry', `Archived asset ID: ${id}`, id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Asset Registry</h1>
                <button onClick={() => onNavigate('asset-new')} className="px-4 py-2 bg-[#006400] hover:bg-[#004d00] text-white rounded-lg flex items-center gap-2">
                    <Plus size={16} /> Register Asset
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Property No or Item Name..." 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Missing">Missing</option>
                    <option value="Retired">Retired</option>
                </select>
                <select className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400] max-w-[150px]" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                    <option value="All">All Departments</option>
                    {departments.map((d: Department) => <option key={d.id} value={d.id}>{d.code}</option>)}
                </select>
                <select className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400] max-w-[150px]" value={filterLoc} onChange={e => setFilterLoc(e.target.value)}>
                    <option value="All">All Locations</option>
                    {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <select className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                    <option value="All">All Years</option>
                    {availableYears.map((y: any) => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Property No.</th>
                            <th className="px-6 py-4">Item Name</th>
                            <th className="px-6 py-4">Custodian</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Date Acquired</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredAssets.map((asset: Asset) => {
                            const item = catalog.find((c: CatalogItem) => c.id === asset.catalogItemId);
                            const custodian = employees.find((e: Employee) => e.id === asset.custodianId);
                            const location = locations.find((l: Location) => l.id === asset.locationId);
                            
                            return (
                                <tr key={asset.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-[#006400]">{asset.propertyNumber}</td>
                                    <td className="px-6 py-3">
                                        <div className="font-medium text-slate-800">{item ? item.article : 'Unknown Item'}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{asset.description}</div>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">{getEmployeeFullName(custodian)}</td>
                                    <td className="px-6 py-3 text-slate-600">{location ? location.name : '-'}</td>
                                    <td className="px-6 py-3 text-slate-500">{formatDate(asset.dateAcquired)}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                            ${asset.status === 'Active' ? 'bg-green-100 text-[#006400]' : 
                                              asset.status === 'Missing' ? 'bg-red-100 text-red-700' : 
                                              'bg-slate-100 text-slate-600'}`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => onNavigate('asset-detail', asset)} className="p-1.5 text-slate-500 hover:text-[#006400] hover:bg-green-50 rounded" title="View Details"><Eye size={16} /></button>
                                            <button onClick={() => handleEdit(asset)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Pencil size={16} /></button>
                                            <button onClick={() => handleDelete(asset.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredAssets.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">No assets found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AssetForm = ({ onSave, onCancel, assets, catalog, employees, departments, locations, funds, initialData, isSaving }: any) => {
    const [formData, setFormData] = useState({
        propertyNumber: '',
        dateAcquired: '',
        catalogItemId: '',
        description: '',
        unitValue: '',
        fundClusterId: '',
        departmentId: '',
        locationId: '',
        custodianId: '',
        status: 'Active'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                propertyNumber: initialData.propertyNumber,
                dateAcquired: initialData.dateAcquired,
                catalogItemId: initialData.catalogItemId,
                description: initialData.description,
                unitValue: initialData.unitValue.toString(),
                fundClusterId: initialData.fundClusterId,
                departmentId: initialData.departmentId,
                locationId: initialData.locationId,
                custodianId: initialData.custodianId,
                status: initialData.status
            });
        }
    }, [initialData]);

    const handleCatalogChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const itemId = e.target.value;
        const item = catalog.find((c: CatalogItem) => c.id === itemId);
        
        setFormData(prev => ({
            ...prev,
            catalogItemId: itemId,
            // Auto-fill description and unit value if available, but allow user override later
            description: item ? item.description : prev.description,
            unitValue: item && item.unitValue ? item.unitValue.toString() : prev.unitValue
        }));
    };

    const handleSaveAction = async () => {
        // Validation
        if (!formData.propertyNumber || !formData.dateAcquired || !formData.catalogItemId || 
            !formData.unitValue || !formData.fundClusterId || !formData.departmentId || 
            !formData.locationId || !formData.custodianId) {
            setError('All fields are required.');
            return;
        }

        // Unique Property Number Check
        const isDuplicate = assets.some((a: Asset) => 
            a.propertyNumber === formData.propertyNumber && 
            (!initialData || a.id !== initialData.id)
        );

        if (isDuplicate) {
            setError('Property Number must be unique.');
            return;
        }

        const assetData = {
            ...formData,
            unitValue: parseFloat(formData.unitValue)
        };
        
        try {
            setError('');
            await onSave(assetData);
        } catch (err: any) {
            setError(err?.message || 'Failed to save asset.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
                <h1 className="text-2xl font-bold text-slate-800">{initialData ? 'Edit Asset' : 'Register New Asset'}</h1>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Property Number <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" 
                            placeholder="e.g. 16-09-001" 
                            value={formData.propertyNumber}
                            onChange={e => setFormData({...formData, propertyNumber: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date Acquired <span className="text-red-500">*</span></label>
                        <input 
                            type="date" 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" 
                            value={formData.dateAcquired}
                            onChange={e => setFormData({...formData, dateAcquired: e.target.value})}
                        />
                    </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Article (PPE Item) <span className="text-red-500">*</span></label>
                     <select 
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]"
                        value={formData.catalogItemId}
                        onChange={handleCatalogChange}
                     >
                         <option value="">Select Item...</option>
                         {catalog.filter((c: CatalogItem) => c.itemType === 'PPE').map((c: CatalogItem) => (
                             <option key={c.id} value={c.id}>{c.article}</option>
                         ))}
                     </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                    <textarea 
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" 
                        rows={3} 
                        placeholder="Specific details (Serial No, Model, etc)"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Unit Value <span className="text-red-500">*</span></label>
                        <input 
                            type="number" 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" 
                            value={formData.unitValue}
                            onChange={e => setFormData({...formData, unitValue: e.target.value})}
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Fund Cluster <span className="text-red-500">*</span></label>
                         <select 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]"
                            value={formData.fundClusterId}
                            onChange={e => setFormData({...formData, fundClusterId: e.target.value})}
                         >
                             <option value="">Select Fund...</option>
                             {funds.map((f: FundCluster) => <option key={f.id} value={f.id}>{f.code} - {f.name}</option>)}
                         </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Department <span className="text-red-500">*</span></label>
                         <select 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]"
                            value={formData.departmentId}
                            onChange={e => setFormData({...formData, departmentId: e.target.value})}
                         >
                             <option value="">Select Department...</option>
                             {departments.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
                         </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Location <span className="text-red-500">*</span></label>
                         <select 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]"
                            value={formData.locationId}
                            onChange={e => setFormData({...formData, locationId: e.target.value})}
                         >
                             <option value="">Select Location...</option>
                             {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.name}</option>)}
                         </select>
                    </div>
                </div>
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Custodian <span className="text-red-500">*</span></label>
                     <select 
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]"
                        value={formData.custodianId}
                        onChange={e => setFormData({...formData, custodianId: e.target.value})}
                     >
                         <option value="">Select Employee...</option>
                         {employees.map((e: Employee) => <option key={e.id} value={e.id}>{getEmployeeFullName(e)}</option>)}
                     </select>
                </div>
                
                {initialData && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]"
                            value={formData.status}
                            onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="Active">Active</option>
                            <option value="Under Repair">Under Repair</option>
                            <option value="Missing">Missing</option>
                            <option value="Retired">Retired</option>
                        </select>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg" disabled={isSaving}>Cancel</button>
                    <button onClick={handleSaveAction} disabled={isSaving} className={`px-6 py-2 rounded-lg text-white ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#006400] hover:bg-[#004d00]'}`}>{isSaving ? 'Saving...' : initialData ? 'Update Asset' : 'Register Asset'}</button>
                </div>
            </div>
        </div>
    );
}

const AssetDetail = ({ asset, catalog, departments, locations, employees, funds, onBack }: any) => {
    if (!asset) {
        return (
            <div className="space-y-4">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#006400]"><ChevronLeft size={16}/> Back to Registry</button>
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">Asset not found.</div>
            </div>
        );
    }

    const item = catalog.find((c: CatalogItem) => c.id === asset.catalogItemId);
    const dept = departments.find((d: Department) => d.id === asset.departmentId);
    const loc = locations.find((l: Location) => l.id === asset.locationId);
    const custodian = employees.find((e: Employee) => e.id === asset.custodianId);
    const fund = funds.find((f: FundCluster) => f.id === asset.fundClusterId);

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#006400]"><ChevronLeft size={16}/> Back to Registry</button>
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{item ? item.article : 'Asset Detail'}</h1>
                        <div className="text-sm text-slate-500">Property No: {asset.propertyNumber}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${asset.status === 'Active' ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-600'}`}>{asset.status}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Description</div>
                        <div className="font-medium text-slate-700">{asset.description}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Custodian</div>
                        <div className="font-medium text-slate-700">{getEmployeeFullName(custodian)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Location</div>
                        <div className="font-medium text-slate-700">{loc ? loc.name : '-'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Department</div>
                        <div className="font-medium text-slate-700">{dept ? dept.name : '-'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Fund Cluster</div>
                        <div className="font-medium text-slate-700">{fund ? `${fund.code} - ${fund.name}` : '-'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Date Acquired</div>
                        <div className="font-medium text-slate-700">{formatDate(asset.dateAcquired)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Unit Value</div>
                        <div className="font-medium text-slate-700">{formatCurrency(asset.unitValue)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Quantity</div>
                        <div className="font-medium text-slate-700">{asset.quantity ?? 1}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Catalog Item</div>
                        <div className="font-medium text-slate-700">{item ? item.article : asset.catalogItemId}</div>
                    </div>
                </div>

                {asset.remarks && (
                    <div className="border-t border-slate-100 pt-4">
                        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Remarks</div>
                        <div className="text-slate-700">{asset.remarks}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Transaction Modules ---
const StockTransactionList = ({ transactions, onNavigate, departments, catalog }: any) => {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterDept, setFilterDept] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 25;

    const filtered = useMemo(() => {
        const term = search.toLowerCase();
        return transactions.filter((t: Transaction) => {
            const matchesType = filterType === 'All' || t.type === filterType;
            const matchesDept = filterDept === 'All' || t.departmentId === filterDept;
            const matchesSearch =
              term === '' ||
              t.transactionId.toLowerCase().includes(term) ||
              (t.remarks || '').toLowerCase().includes(term);
            const ts = new Date(t.date).getTime();
            const matchStart = startDate ? ts >= new Date(startDate).getTime() : true;
            const matchEnd = endDate ? ts <= new Date(endDate).getTime() : true;
            return matchesType && matchesDept && matchesSearch && matchStart && matchEnd;
        });
    }, [transactions, filterType, filterDept, search, startDate, endDate]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const resetPagination = () => setPage(1);

    const statusBadge = (status: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'Completed' ? 'bg-green-50 text-green-700' :
            status === 'Pending' ? 'bg-amber-50 text-amber-700' :
            'bg-slate-100 text-slate-600'
        }`}>{status}</span>
    );

    return (
    <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
            <h1 className="text-2xl font-bold text-slate-800">Stock Transactions</h1>
            <button onClick={() => onNavigate('transactions-new')} className="px-4 py-2 bg-[#006400] hover:bg-[#004d00] text-white rounded-lg flex items-center gap-2">
                <Plus size={16} /> New Transaction
            </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-end">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); resetPagination(); }}
                    placeholder="Search by Transaction ID or remarks..."
                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] min-w-[220px]"
                />
            </div>
            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); resetPagination(); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] w-[140px]">
                <option value="All">All Types</option>
                <option value="Stock In">Stock In</option>
                <option value="Stock Out">Stock Out</option>
            </select>
            <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); resetPagination(); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] w-[200px]">
                <option value="All">All Departments</option>
                {departments.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div className="flex gap-2 items-center text-sm text-slate-600 flex-wrap">
                <div className="flex gap-2 items-center">
                    <span className="text-slate-500">From</span>
                    <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); resetPagination(); }} className="px-2 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] w-[150px]" />
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-slate-500">To</span>
                    <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); resetPagination(); }} className="px-2 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] w-[150px]" />
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Transaction ID</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Source / Department</th>
                        <th className="px-6 py-4">Items</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {pageItems.map((t: Transaction) => {
                        const dept = departments.find((d: Department) => d.id === t.departmentId);
                        const itemCount = t.items?.length || 0;
                        const totalQty = t.items?.reduce((sum: number, i: TransactionItem) => sum + (i.quantity || 0), 0) || 0;
                        return (
                            <React.Fragment key={t.id}>
                            <tr className="hover:bg-slate-50">
                                <td className="px-6 py-3 font-medium text-[#006400]">{t.transactionId}</td>
                                <td className="px-6 py-3">
                                    <span className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${t.type === 'Stock In' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                        {t.type === 'Stock In' ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>} {t.type}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-slate-500">{formatDate(t.date)}</td>
                                <td className="px-6 py-3 text-slate-600">
                                    {t.type === 'Stock In' ? (t.supplier || '-') : (dept ? dept.name : t.departmentId || '-')}
                                </td>
                                <td className="px-6 py-3 text-slate-600">{itemCount} items / {totalQty} qty</td>
                                <td className="px-6 py-3">{statusBadge(t.status)}</td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setExpandedId(expandedId === t.id ? null : t.id)} className="p-1.5 text-slate-500 hover:text-[#006400] hover:bg-green-50 rounded" title="View Items"><ChevronRight size={16} className={`transition-transform ${expandedId === t.id ? 'rotate-90' : ''}`} /></button>
                                        <button onClick={() => onNavigate('transactions-detail', t)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Details"><Eye size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                            {expandedId === t.id && (
                                <tr className="bg-slate-50/60">
                                    <td colSpan={7} className="px-6 py-3">
                                        <div className="text-xs text-slate-500 mb-2">Line Items</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {t.items?.map((item: TransactionItem) => {
                                                const catItem = catalog.find((c: CatalogItem) => c.id === item.catalogItemId);
                                                return (
                                                    <div key={item.id} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                                                        <div>
                                                            <div className="font-semibold text-slate-800">{catItem ? catItem.article : item.catalogItemId}</div>
                                                            <div className="text-xs text-slate-500">{catItem ? catItem.description : ''}</div>
                                                            {item.remarks && <div className="text-xs text-slate-500 mt-1">Remarks: {item.remarks}</div>}
                                                        </div>
                                                        <div className="text-right font-bold text-slate-800">{item.quantity}</div>
                                                    </div>
                                                );
                                            })}
                                            {(!t.items || t.items.length === 0) && <div className="text-slate-400 text-sm">No items</div>}
                                        </div>
                                        {t.remarks && <div className="mt-2 text-sm text-slate-600">Remarks: {t.remarks}</div>}
                                    </td>
                                </tr>
                            )}
                            </React.Fragment>
                        );
                    })}
                    {pageItems.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-400">No transactions found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600">
            <div>Page {currentPage} of {totalPages}</div>
            <div className="flex gap-2">
                <button
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded border ${currentPage === 1 ? 'text-slate-300 border-slate-200' : 'text-slate-700 border-slate-300 hover:border-[#006400] hover:text-[#006400]'}`}
                >
                    Prev
                </button>
                <button
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'text-slate-300 border-slate-200' : 'text-slate-700 border-slate-300 hover:border-[#006400] hover:text-[#006400]'}`}
                >
                    Next
                </button>
            </div>
        </div>
    </div>
    );
};

const StockTransactionForm = ({ onCancel, onSave, catalog, departments, isSaving }: any) => {
    const [type, setType] = useState<TransactionType>('Stock In');
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [departmentId, setDepartmentId] = useState<string>('');
    const [supplier, setSupplier] = useState<string>('');
    const [referenceNo, setReferenceNo] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');
    const [lineItems, setLineItems] = useState<any[]>([]);
    const [error, setError] = useState<string>('');

    const addItem = () => {
        setLineItems([...lineItems, { id: Date.now(), catalogItemId: '', quantity: 1, remarks: '' }]);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...lineItems];
        newItems[index][field] = value;
        setLineItems(newItems);
    };

    const removeItem = (index: number) => {
         setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!date || !type) {
            setError('Please fill in Transaction Type and Date.');
            return;
        }
        if (type === 'Stock In' && (!supplier || !referenceNo)) {
            setError('Supplier and Reference No. are required for Stock In.');
            return;
        }
        if (type === 'Stock Out' && !departmentId) {
            setError('Department is required for Stock Out.');
            return;
        }
        if (lineItems.length === 0) {
            setError('Add at least one line item.');
            return;
        }
        for (const item of lineItems) {
            if (!item.catalogItemId || !item.quantity || item.quantity <= 0) {
                setError('Each line item needs an item and a quantity greater than 0.');
                return;
            }
        }
        setError('');
        onSave({
            type,
            date,
            departmentId: type === 'Stock Out' ? departmentId : undefined,
            supplier: type === 'Stock In' ? supplier : undefined,
            referenceNo: type === 'Stock In' ? referenceNo : undefined,
            items: lineItems.map((i: any) => ({ catalogItemId: i.catalogItemId, quantity: i.quantity, remarks: i.remarks })),
            remarks,
        });
    };

    return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
             <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
             <h1 className="text-2xl font-bold text-slate-800">New Stock Transaction</h1>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
             {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
                    <select className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
                        <option value="Stock In">Stock In</option>
                        <option value="Stock Out">Stock Out</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" value={date} onChange={(e) => setDate(e.target.value)} />
                 </div>
             </div>
             {type === 'Stock Out' ? (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Department / Destination</label>
                    <select className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                        <option value="">Select Department...</option>
                        {departments.map((d:any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
             ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Supplier / Manufacturer</label>
                        <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. ABC Supplies" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reference No. (PO/DR)</label>
                        <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} placeholder="e.g. PO-2025-001" />
                    </div>
                </div>
             )}
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional notes" />
             </div>
             <div className="pt-4 border-t border-slate-100">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-800">Line Items</h3>
                    <button onClick={addItem} className="text-sm bg-green-50 text-[#006400] px-3 py-1 rounded hover:bg-green-100 font-medium">+ Add Item</button>
                 </div>
                 
                 {lineItems.length === 0 ? (
                    <div className="p-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-slate-400 text-sm">
                        No items added. Click "+ Add Item" to start.
                    </div>
                 ) : (
                    <div className="space-y-3">
                        {lineItems.map((item, index) => (
                            <div key={item.id} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div className="flex-1">
                                     <label className="text-xs font-medium text-slate-500 mb-1 block">Item (Consumables Only)</label>
                                     <select 
                                        className="w-full border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-[#006400]"
                                        value={item.catalogItemId}
                                        onChange={(e) => updateItem(index, 'catalogItemId', e.target.value)}
                                     >
                                        <option value="">Select Item...</option>
                                        {catalog.filter((c:any) => c.itemType === 'Consumable').map((c:any) => <option key={c.id} value={c.id}>{c.article} ({c.quantity} on hand)</option>)}
                                     </select>
                                </div>
                                <div className="w-24">
                                     <label className="text-xs font-medium text-slate-500 mb-1 block">Quantity</label>
                                     <input 
                                        type="number" 
                                        className="w-full border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-[#006400]"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                     />
                                </div>
                                <div className="flex-1">
                                     <label className="text-xs font-medium text-slate-500 mb-1 block">Remarks</label>
                                     <input 
                                        type="text" 
                                        className="w-full border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-[#006400]"
                                        value={item.remarks}
                                        onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                                        placeholder="Notes..."
                                     />
                                </div>
                                <button onClick={() => removeItem(index)} className="mt-6 text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                            </div>
                        ))}
                    </div>
                 )}
             </div>
             <div className="flex justify-end gap-3 pt-4">
                <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg" disabled={isSaving}>Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2 rounded-lg text-white ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#006400] hover:bg-[#004d00]'}`}>{isSaving ? 'Saving...' : 'Save Transaction'}</button>
            </div>
        </div>
    </div>
    );
};

const StockTransactionDetail = ({ transaction, catalog, departments, onBack }: any) => {
    if (!transaction) {
        return (
            <div className="space-y-4">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#006400]"><ChevronLeft size={16}/> Back to Transactions</button>
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">Transaction not found.</div>
            </div>
        );
    }

    const dept = departments.find((d: Department) => d.id === transaction.departmentId);

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#006400]"><ChevronLeft size={16}/> Back to Transactions</button>
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none">
                <ESSUHeader />
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{transaction.type} Transaction</h1>
                        <div className="text-slate-500">ID: {transaction.transactionId}</div>
                        {transaction.type === 'Stock In' ? (
                          <div className="text-slate-500">Supplier: {transaction.supplier || '-'}</div>
                        ) : (
                          <div className="text-slate-500">Department: {dept ? dept.name : transaction.departmentId || '-'}</div>
                        )}
                        {transaction.referenceNo && <div className="text-slate-500">Reference: {transaction.referenceNo}</div>}
                        {transaction.remarks && <div className="text-slate-500">Remarks: {transaction.remarks}</div>}
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-500">Date</div>
                        <div className="font-semibold text-slate-800">{formatDate(transaction.date)}</div>
                    </div>
                </div>
                <table className="w-full text-sm text-left mb-8">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-2">Item</th>
                            <th className="px-4 py-2">Description</th>
                            <th className="px-4 py-2 text-right">Qty</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {transaction.items?.map((item: TransactionItem) => {
                            const catItem = catalog.find((c: CatalogItem) => c.id === item.catalogItemId);
                            return (
                                <tr key={item.id}>
                                    <td className="px-4 py-2 font-medium">{catItem ? catItem.article : item.catalogItemId}</td>
                                    <td className="px-4 py-2 text-slate-500">{catItem ? catItem.description : '-'}</td>
                                    <td className="px-4 py-2 text-right font-bold">{item.quantity}</td>
                                </tr>
                            );
                        })}
                        {!transaction.items?.length && (
                            <tr>
                                <td colSpan={3} className="px-4 py-3 text-center text-slate-400">No items recorded.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-slate-200 print:block print:grid-cols-3">
                     <div className="text-center">
                         <div className="mb-8 border-b border-slate-400 w-3/4 mx-auto"></div>
                         <div className="text-xs font-bold uppercase">Requested By</div>
                     </div>
                     <div className="text-center">
                         <div className="mb-8 border-b border-slate-400 w-3/4 mx-auto"></div>
                         <div className="text-xs font-bold uppercase">Approved By</div>
                     </div>
                     <div className="text-center">
                         <div className="mb-8 border-b border-slate-400 w-3/4 mx-auto"></div>
                         <div className="text-xs font-bold uppercase">Received By</div>
                     </div>
                </div>

                <div className="flex justify-end gap-3 print:hidden mt-8">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200" onClick={() => window.print()}><Printer size={16}/> Print</button>
                </div>
            </div>
        </div>
    );
};

// --- MR Modules ---
const MRListView = ({ mrs, onNavigate, employees }: any) => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('All');
    const [custodian, setCustodian] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const term = search.toLowerCase();
        return mrs.filter((m: MemorandumReceipt) => {
            const matchesStatus = status === 'All' || m.status === status;
            const matchesCustodian = custodian === 'All' || m.employeeId === custodian;
            const matchesSearch = term === '' || m.mrNumber.toLowerCase().includes(term) || (m.remarks || '').toLowerCase().includes(term);
            const ts = new Date(m.dateIssued).getTime();
            const matchStart = startDate ? ts >= new Date(startDate).getTime() : true;
            const matchEnd = endDate ? ts <= new Date(endDate).getTime() : true;
            return matchesStatus && matchesCustodian && matchesSearch && matchStart && matchEnd;
        });
    }, [mrs, status, custodian, search, startDate, endDate]);

    const statusBadge = (s: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${s === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{s}</span>
    );

    const custodianName = (id: string) => {
        const emp = employees.find((e: Employee) => e.id === id);
        return getEmployeeFullName(emp);
    };

    const totalValue = (items: MRItem[]) =>
        items.reduce((sum, i) => sum + (i.unitValue || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
                <h1 className="text-2xl font-bold text-slate-800">Memorandum Receipts</h1>
                <button onClick={() => onNavigate('mr-new')} className="px-4 py-2 bg-[#006400] hover:bg-[#004d00] text-white rounded-lg flex items-center gap-2">
                    <Plus size={16} /> Issue MR
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-end">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search MR number or remarks..."
                        className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] min-w-[200px]"
                    />
                </div>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400]">
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                </select>
                <select value={custodian} onChange={(e) => setCustodian(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] w-[180px]">
                    <option value="All">All Custodians</option>
                    {employees.map((e: Employee) => <option key={e.id} value={e.id}>{getEmployeeFullName(e)}</option>)}
                </select>
                <div className="flex gap-2 items-center text-sm text-slate-600 flex-wrap">
                    <div className="flex gap-2 items-center">
                        <span className="text-slate-500">From</span>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-2 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] w-[150px]" />
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-slate-500">To</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-2 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] w-[150px]" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">MR Number</th>
                            <th className="px-6 py-4">Date Issued</th>
                            <th className="px-6 py-4">Custodian</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4 text-right">Total Value</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map((m: MemorandumReceipt) => (
                            <React.Fragment key={m.id}>
                            <tr className="hover:bg-slate-50">
                                <td className="px-6 py-3 font-medium text-[#006400]">{m.mrNumber}</td>
                                <td className="px-6 py-3 text-slate-500">{formatDate(m.dateIssued)}</td>
                                <td className="px-6 py-3 text-slate-700">{custodianName(m.employeeId)}</td>
                                <td className="px-6 py-3 text-slate-600">{m.items?.length || 0} items</td>
                                <td className="px-6 py-3 text-right font-semibold text-slate-800">{formatCurrency(totalValue(m.items || []))}</td>
                                <td className="px-6 py-3">{statusBadge(m.status)}</td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setExpandedId(expandedId === m.id ? null : m.id)} className="p-1.5 text-slate-500 hover:text-[#006400] hover:bg-green-50 rounded" title="View Items"><ChevronRight size={16} className={`transition-transform ${expandedId === m.id ? 'rotate-90' : ''}`} /></button>
                                        <button onClick={() => onNavigate('mr-detail', m)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Details"><Eye size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                            {expandedId === m.id && (
                                <tr className="bg-slate-50/60">
                                    <td colSpan={7} className="px-6 py-3">
                                        <div className="text-xs text-slate-500 mb-2">Items</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {m.items?.map((item: MRItem) => (
                                                <div key={item.assetId} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                                                    <div>
                                                        <div className="font-semibold text-slate-800">{item.propertyNumber}</div>
                                                        <div className="text-xs text-slate-500">{item.description}</div>
                                                    </div>
                                                    <div className="text-right text-sm font-bold text-slate-800">{formatCurrency(item.unitValue)}</div>
                                                </div>
                                            ))}
                                            {(!m.items || m.items.length === 0) && <div className="text-slate-400 text-sm">No items</div>}
                                        </div>
                                        {m.remarks && <div className="mt-2 text-sm text-slate-600">Remarks: {m.remarks}</div>}
                                    </td>
                                </tr>
                            )}
                            </React.Fragment>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">No memorandum receipts found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MRForm = ({ onCancel, onSave, employees, assets, isSaving }: any) => {
    const [dateIssued, setDateIssued] = useState(new Date().toISOString().slice(0, 10));
    const [employeeId, setEmployeeId] = useState('');
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
    const [error, setError] = useState('');

    const availableAssets = assets.filter((a: Asset) => a.status === 'Active');

    const toggleAsset = (id: string) => {
        setSelectedAssetIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (!dateIssued || !employeeId || selectedAssetIds.length === 0) {
            setError('Date, custodian, and at least one asset are required.');
            return;
        }
        setError('');
        const items = selectedAssetIds
            .map((id) => assets.find((a: Asset) => a.id === id))
            .filter(Boolean)
            .map((asset: any) => ({
                assetId: asset.id,
                propertyNumber: asset.propertyNumber,
                description: asset.description,
                unitValue: asset.unitValue,
            }));
        await onSave({
            dateIssued,
            employeeId,
            departmentId: employees.find((e: Employee) => e.id === employeeId)?.departmentId || '',
            items,
            status: 'Active',
        }).catch((err: any) => setError(err?.message || 'Failed to issue MR.'));
    };

    return (
     <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
             <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
             <h1 className="text-2xl font-bold text-slate-800">Issue Memorandum Receipt</h1>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
             {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date Issued</label>
                    <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" value={dateIssued} onChange={(e) => setDateIssued(e.target.value)} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Custodian</label>
                    <select className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                         <option value="">Select Employee...</option>
                         {employees.map((e:any) => <option key={e.id} value={e.id}>{getEmployeeFullName(e)}</option>)}
                    </select>
                 </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Assets to Issue</label>
                <div className="border border-slate-200 rounded-lg max-h-60 overflow-y-auto bg-slate-50 p-2 space-y-2">
                    {availableAssets.map((asset: Asset) => (
                        <label key={asset.id} className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded cursor-pointer hover:border-[#006400]">
                            <input type="checkbox" className="w-4 h-4 text-[#006400] rounded focus:ring-[#006400]" checked={selectedAssetIds.includes(asset.id)} onChange={() => toggleAsset(asset.id)} />
                            <div className="text-sm">
                                <div className="font-medium">{asset.propertyNumber} - {asset.description}</div>
                                <div className="text-xs text-slate-500">Value: {formatCurrency(asset.unitValue)}</div>
                            </div>
                        </label>
                    ))}
                    {availableAssets.length === 0 && <div className="text-slate-400 text-sm p-4 text-center">No active assets available.</div>}
                </div>
             </div>
             <div className="flex justify-end gap-3 pt-4">
                <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg" disabled={isSaving}>Cancel</button>
                <button onClick={handleSubmit} disabled={isSaving} className={`px-6 py-2 rounded-lg text-white ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#006400] hover:bg-[#004d00]'}`}>{isSaving ? 'Issuing...' : 'Issue MR'}</button>
            </div>
        </div>
    </div>
    );
};

const MRDetail = ({ mr, employees, departments, onBack }: any) => {
    if (!mr) {
        return (
            <div className="space-y-4">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#006400]"><ChevronLeft size={16}/> Back to MR List</button>
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">MR not found.</div>
            </div>
        );
    }

    const emp = employees.find((e: Employee) => e.id === mr.employeeId);
    const dept = departments.find((d: Department) => d.id === mr.departmentId);

    return (
         <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#006400]"><ChevronLeft size={16}/> Back to MR List</button>
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                 <ESSUHeader />
                 <h1 className="text-center text-xl font-bold uppercase mb-8">Memorandum Receipt for Property, Plant and Equipment</h1>
                 <div className="grid grid-cols-2 gap-8 text-sm mb-6">
                     <div>
                         <span className="font-semibold">MR Number:</span> {mr.mrNumber}
                     </div>
                     <div className="text-right">
                         <span className="font-semibold">Date:</span> {formatDate(mr.dateIssued)}
                     </div>
                     <div><span className="font-semibold">Custodian:</span> {getEmployeeFullName(emp)}</div>
                     <div className="text-right"><span className="font-semibold">Department:</span> {dept ? dept.name : mr.departmentId}</div>
                 </div>
                 <table className="w-full text-sm text-left border border-slate-300 mb-8">
                    <thead className="bg-slate-100 text-slate-800 font-semibold">
                        <tr>
                            <th className="px-4 py-2 border border-slate-300">Property No.</th>
                            <th className="px-4 py-2 border border-slate-300">Description</th>
                            <th className="px-4 py-2 border border-slate-300 text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mr.items?.map((item: MRItem) => (
                            <tr key={item.assetId}>
                                 <td className="px-4 py-2 border border-slate-300">{item.propertyNumber}</td>
                                 <td className="px-4 py-2 border border-slate-300">{item.description}</td>
                                 <td className="px-4 py-2 border border-slate-300 text-right">{formatCurrency(item.unitValue)}</td>
                            </tr>
                        ))}
                        {!mr.items?.length && (
                            <tr>
                                <td colSpan={3} className="px-4 py-3 text-center text-slate-400 border border-slate-300">No items.</td>
                            </tr>
                        )}
                    </tbody>
                 </table>
                 <div className="grid grid-cols-2 gap-20 mt-12 print:block print:grid-cols-2">
                     <div className="text-center">
                         <div className="mb-8 border-b border-black w-3/4 mx-auto"></div>
                         <div className="text-sm font-bold uppercase">Received By</div>
                         <div className="text-xs">Signature over Printed Name</div>
                     </div>
                     <div className="text-center">
                         <div className="mb-8 border-b border-black w-3/4 mx-auto"></div>
                         <div className="text-sm font-bold uppercase">Issued By</div>
                         <div className="text-xs">Supply Officer</div>
                     </div>
                </div>
                 <div className="flex justify-end gap-3 print:hidden mt-8">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200" onClick={() => window.print()}><Printer size={16}/> Print MR</button>
                </div>
            </div>
        </div>
    );
};

// --- Audit Modules ---
const AuditList = ({ audits, onNavigate, departments, locations }: any) => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('All');
    const [scope, setScope] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const filtered = useMemo(() => {
        const term = search.toLowerCase();
        return audits.filter((a: AuditSession) => {
            const matchesStatus = status === 'All' || a.status === status;
            const scopeName = a.departmentId ? 'Department' : a.locationId ? 'Location' : 'All';
            const matchesScope = scope === 'All' || scopeName === scope;
            const matchesSearch = term === '' || a.sessionId.toLowerCase().includes(term) || a.description.toLowerCase().includes(term);
            const ts = new Date(a.date).getTime();
            const matchStart = startDate ? ts >= new Date(startDate).getTime() : true;
            const matchEnd = endDate ? ts <= new Date(endDate).getTime() : true;
            return matchesStatus && matchesScope && matchesSearch && matchStart && matchEnd;
        });
    }, [audits, status, scope, search, startDate, endDate]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const statusBadge = (s: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${s === 'Draft' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>{s}</span>
    );

    const scopeLabel = (a: AuditSession) => {
        if (a.departmentId) return departments.find((d: Department) => d.id === a.departmentId)?.name || 'Department';
        if (a.locationId) return locations.find((l: Location) => l.id === a.locationId)?.name || 'Location';
        return 'All';
    };

    const scopeChip = (a: AuditSession) => (
        <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600">{scopeLabel(a)}</span>
    );

    const resetPage = () => setPage(1);

    return (
    <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
            <h1 className="text-2xl font-bold text-slate-800">Physical Counts</h1>
            <button onClick={() => onNavigate('audit-new')} className="px-4 py-2 bg-[#006400] hover:bg-[#004d00] text-white rounded-lg flex items-center gap-2">
                <Plus size={16} /> New Session
            </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-end">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                    placeholder="Search session ID or description..."
                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] min-w-[220px]"
                />
            </div>
            <select value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] w-[140px]">
                <option value="All">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Finalized">Finalized</option>
            </select>
            <select value={scope} onChange={(e) => { setScope(e.target.value); resetPage(); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] w-[150px]">
                <option value="All">All Scope</option>
                <option value="Department">Department</option>
                <option value="Location">Location</option>
            </select>
            <div className="flex gap-2 items-center text-sm text-slate-600 flex-wrap">
                <div className="flex gap-2 items-center">
                    <span className="text-slate-500">From</span>
                    <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); resetPage(); }} className="px-2 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] w-[150px]" />
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-slate-500">To</span>
                    <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); resetPage(); }} className="px-2 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#006400] w-[150px]" />
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Session ID</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Scope</th>
                        <th className="px-6 py-4 text-center">Items</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {pageItems.map((a: AuditSession) => {
                        const shortageCount = a.items?.filter((i: AuditItem) => i.status === 'Shortage').length || 0;
                        const overageCount = a.items?.filter((i: AuditItem) => i.status === 'Overage').length || 0;
                        return (
                            <React.Fragment key={a.id}>
                            <tr className="hover:bg-slate-50">
                                <td className="px-6 py-3 font-medium text-[#006400]">{a.sessionId}</td>
                                <td className="px-6 py-3 text-slate-500">{formatDate(a.date)}</td>
                                <td className="px-6 py-3 text-slate-600">{a.description}</td>
                                <td className="px-6 py-3 text-slate-600 flex items-center gap-2">{scopeChip(a)}</td>
                                <td className="px-6 py-3 text-center text-slate-700">{a.items?.length || 0}</td>
                                <td className="px-6 py-3">{statusBadge(a.status)}</td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} className="p-1.5 text-slate-500 hover:text-[#006400] hover:bg-green-50 rounded" title="Preview"><ChevronRight size={16} className={`transition-transform ${expandedId === a.id ? 'rotate-90' : ''}`} /></button>
                                        <button onClick={() => onNavigate('audit-detail', a)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Open"><Eye size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                            {expandedId === a.id && (
                                <tr className="bg-slate-50/60">
                                    <td colSpan={7} className="px-6 py-3">
                                        <div className="text-xs text-slate-500 mb-2">Highlights</div>
                                        <div className="flex gap-2 mb-2">
                                            <span className="px-2 py-1 rounded-full text-xs bg-red-50 text-red-700">Shortages: {shortageCount}</span>
                                            <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">Overages: {overageCount}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {(a.items || []).slice(0, 4).map((item: AuditItem) => (
                                                <div key={item.assetId} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                                                    <div>
                                                        <div className="font-semibold text-slate-800">{item.propertyNumber}</div>
                                                        <div className="text-xs text-slate-500">{item.description}</div>
                                                    </div>
                                                    <div className={`text-right text-sm font-bold ${item.status === 'Shortage' ? 'text-red-600' : item.status === 'Overage' ? 'text-blue-600' : 'text-slate-600'}`}>
                                                        {item.status === 'Uncounted' ? 'Uncounted' : item.shortageOverageQty}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!a.items || a.items.length === 0) && <div className="text-slate-400 text-sm">No items</div>}
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </React.Fragment>
                        );
                    })}
                    {pageItems.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-400">No audit sessions found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600">
            <div>Page {currentPage} of {totalPages}</div>
            <div className="flex gap-2">
                <button
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded border ${currentPage === 1 ? 'text-slate-300 border-slate-200' : 'text-slate-700 border-slate-300 hover:border-[#006400] hover:text-[#006400]'}`}
                >
                    Prev
                </button>
                <button
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'text-slate-300 border-slate-200' : 'text-slate-700 border-slate-300 hover:border-[#006400] hover:text-[#006400]'}`}
                >
                    Next
                </button>
            </div>
        </div>
    </div>
    );
};

const AuditNew = ({ onCancel, onSave, locations, departments, assets, isSaving }: any) => {
    const [sessionId] = useState(`PC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`);
    const [description, setDescription] = useState('');
    const [selectedLoc, setSelectedLoc] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleStart = () => {
        if (!description || (!selectedLoc && !selectedDept)) {
            alert("Description and at least one scope (Location or Department) are required.");
            return;
        }

        // Filter active assets based on selection
        const relevantAssets = assets.filter((a: Asset) => {
            if (a.status !== 'Active') return false;
            const matchLoc = selectedLoc ? a.locationId === selectedLoc : true;
            const matchDept = selectedDept ? a.departmentId === selectedDept : true;
            return matchLoc && matchDept;
        });

        // Create Audit Items Snapshot
        const auditItems: AuditItem[] = relevantAssets.map((a: Asset) => ({
            assetId: a.id,
            propertyNumber: a.propertyNumber,
            description: a.description,
            unitValue: a.unitValue,
            systemQty: a.quantity,
            actualQty: null, // Start uncounted
            shortageOverageQty: 0,
            shortageOverageValue: 0,
            status: 'Uncounted',
            locationName: locations.find((l: Location) => l.id === a.locationId)?.name || 'Unknown',
            custodianName: 'Unknown' // Ideally mapped from employees
        }));

        const newSession: AuditSession = {
            id: generateId(),
            sessionId,
            date,
            departmentId: selectedDept,
            locationId: selectedLoc,
            description,
            items: auditItems,
            status: 'Draft',
            createdBy: 'Jeffrey Meneses',
            createdAt: new Date().toISOString()
        };

        onSave(newSession);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
                <h1 className="text-2xl font-bold text-slate-800">New Physical Count Session</h1>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="p-4 bg-green-50 text-[#006400] text-sm rounded-lg flex gap-2">
                    <Info size={18} className="shrink-0" />
                    <div>Starting a new session will create a snapshot of all currently active assets matching your selected scope.</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Session ID</label>
                        <input type="text" disabled value={sessionId} className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-3 py-2" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" />
                     </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Session Title / Description</label>
                    <input 
                        type="text" 
                        placeholder="e.g. 2024 Year-End Count - College of Education"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Location Scope (Optional)</label>
                        <select 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]"
                            value={selectedLoc}
                            onChange={e => setSelectedLoc(e.target.value)}
                        >
                            <option value="">All Locations</option>
                            {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Department Scope (Optional)</label>
                        <select 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#006400]"
                            value={selectedDept}
                            onChange={e => setSelectedDept(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg" disabled={isSaving}>Cancel</button>
                    <button onClick={handleStart} disabled={isSaving} className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#006400] hover:bg-[#004d00]'}`}>
                        {isSaving ? 'Saving...' : <>Start Counting <ArrowRightLeft size={16} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AuditWorksheet = ({ audit, onBack, onSaveDraft, onFinalize }: any) => {
    const [items, setItems] = useState<AuditItem[]>(audit.items);
    const [searchTerm, setSearchTerm] = useState('');

    const handleCountChange = (index: number, val: string) => {
        const newActual = val === '' ? null : parseFloat(val);
        const newItems = [...items];
        const item = newItems[index];
        
        item.actualQty = newActual;
        
        // Calculate status
        if (newActual === null) {
            item.status = 'Uncounted';
            item.shortageOverageQty = 0;
            item.shortageOverageValue = 0;
        } else {
            const diff = newActual - item.systemQty;
            item.shortageOverageQty = diff;
            item.shortageOverageValue = diff * item.unitValue;
            
            if (diff === 0) item.status = 'Matched';
            else if (diff < 0) item.status = 'Shortage';
            else item.status = 'Overage';
        }
        setItems(newItems);
    };

    const handleRemarkChange = (index: number, val: string) => {
        const newItems = [...items];
        newItems[index].remarks = val;
        setItems(newItems);
    };

    const filteredItems = items.filter(i => 
        i.propertyNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
        i.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: items.length,
        counted: items.filter(i => i.actualQty !== null).length,
        shortages: items.filter(i => i.status === 'Shortage').length,
        value: items.reduce((sum, i) => sum + (i.status === 'Shortage' ? Math.abs(i.shortageOverageValue) : 0), 0)
    };

    const progress = Math.round((stats.counted / stats.total) * 100) || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
                     <div>
                        <h1 className="text-xl font-bold text-slate-800">{audit.sessionId}: {audit.description}</h1>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                             <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${audit.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-[#006400]'}`}>{audit.status}</span>
                             <span>•</span>
                             <span>{formatDate(audit.date)}</span>
                        </div>
                     </div>
                </div>
                <div className="flex gap-2">
                     <button onClick={() => onSaveDraft({...audit, items})} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex gap-2 items-center"><Save size={16}/> Save Draft</button>
                     <button onClick={() => { if(confirm('Finalize this audit? This cannot be undone.')) onFinalize({...audit, items}) }} className="px-4 py-2 bg-[#006400] text-white rounded-lg hover:bg-[#004d00] flex gap-2 items-center"><Check size={16}/> Finalize</button>
                </div>
            </div>

            {/* Metrics Panel */}
            <div className="grid grid-cols-4 gap-4">
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 uppercase font-bold">Progress</div>
                    <div className="text-2xl font-bold text-slate-800">{progress}%</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-[#006400] h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 uppercase font-bold">Matched</div>
                    <div className="text-2xl font-bold text-green-600">{items.filter(i => i.status === 'Matched').length}</div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 uppercase font-bold">Shortages</div>
                    <div className="text-2xl font-bold text-red-600">{stats.shortages}</div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500 uppercase font-bold">Shortage Value</div>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.value)}</div>
                 </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative max-w-md mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter items..." 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Property No</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-center">System Qty</th>
                                <th className="px-4 py-3 text-center w-32">Actual Count</th>
                                <th className="px-4 py-3 text-center">Variance</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.map((item, index) => {
                                const rowClass = item.status === 'Shortage' ? 'bg-red-50/50' : 
                                               item.status === 'Overage' ? 'bg-blue-50/50' : 
                                               item.status === 'Matched' ? 'bg-green-50/30' : '';
                                
                                return (
                                    <tr key={item.assetId} className={rowClass}>
                                        <td className="px-4 py-3 font-medium text-slate-700">{item.propertyNumber}</td>
                                        <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{item.description}</td>
                                        <td className="px-4 py-3 text-center font-bold text-slate-700">{item.systemQty}</td>
                                        <td className="px-4 py-3 text-center">
                                            <input 
                                                type="number" 
                                                className={`w-20 border rounded-lg text-center py-1 outline-none focus:ring-2 ${
                                                    item.status === 'Shortage' ? 'border-red-300 focus:border-red-500 focus:ring-red-200' :
                                                    item.status === 'Matched' ? 'border-green-300 focus:border-green-500 focus:ring-green-200' :
                                                    'border-slate-300 focus:border-[#006400] focus:ring-green-100'
                                                }`} 
                                                value={item.actualQty === null ? '' : item.actualQty}
                                                onChange={(e) => handleCountChange(index, e.target.value)}
                                                placeholder="-"
                                            />
                                        </td>
                                        <td className={`px-4 py-3 text-center font-bold ${item.shortageOverageQty < 0 ? 'text-red-600' : item.shortageOverageQty > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                            {item.shortageOverageQty > 0 ? `+${item.shortageOverageQty}` : item.shortageOverageQty}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                                item.status === 'Shortage' ? 'bg-red-100 text-red-700 border-red-200' :
                                                item.status === 'Matched' ? 'bg-green-100 text-green-700 border-green-200' :
                                                item.status === 'Overage' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                             <input 
                                                type="text" 
                                                className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#006400] outline-none text-xs"
                                                placeholder="Add remarks..."
                                                value={item.remarks || ''}
                                                onChange={(e) => handleRemarkChange(index, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AuditReport = ({ audit, onBack }: any) => {
    const stats = {
        total: audit.items.length,
        shortageCount: audit.items.filter((i: AuditItem) => i.status === 'Shortage').length,
        shortageValue: audit.items.reduce((sum: number, i: AuditItem) => sum + (i.status === 'Shortage' ? Math.abs(i.shortageOverageValue) : 0), 0)
    };

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#006400] print:hidden"><ChevronLeft size={16}/> Back to Sessions</button>
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none">
                <ESSUHeader />
                <div className="text-center mb-8">
                    <h1 className="text-xl font-bold uppercase tracking-wide">Report on the Physical Count of Property, Plant and Equipment</h1>
                    <div className="text-sm mt-2 font-medium text-slate-600">{audit.description}</div>
                    <div className="text-sm text-slate-500">As of {formatDate(audit.date)}</div>
                </div>

                <div className="mb-6 flex justify-between text-sm border p-4 rounded bg-slate-50 print:bg-transparent print:border-none print:p-0">
                     <div>
                        <div className="text-slate-500">Session ID</div>
                        <div className="font-bold">{audit.sessionId}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-slate-500">Total Shortage Value</div>
                        <div className="font-bold text-red-600 text-lg">{formatCurrency(stats.shortageValue)}</div>
                     </div>
                </div>

                <table className="w-full text-sm text-left border-collapse border border-slate-300 mb-8">
                    <thead className="bg-slate-100 text-slate-800 font-semibold print:bg-transparent">
                        <tr>
                            <th className="px-3 py-2 border border-slate-300">Property No</th>
                            <th className="px-3 py-2 border border-slate-300">Description</th>
                            <th className="px-3 py-2 border border-slate-300 text-center">System Qty</th>
                            <th className="px-3 py-2 border border-slate-300 text-center">Actual Count</th>
                            <th className="px-3 py-2 border border-slate-300 text-center">Overage/Shortage</th>
                            <th className="px-3 py-2 border border-slate-300 text-right">Value</th>
                            <th className="px-3 py-2 border border-slate-300">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {audit.items.map((item: AuditItem) => (
                            <tr key={item.assetId}>
                                <td className="px-3 py-2 border border-slate-300">{item.propertyNumber}</td>
                                <td className="px-3 py-2 border border-slate-300 max-w-xs truncate">{item.description}</td>
                                <td className="px-3 py-2 border border-slate-300 text-center">{item.systemQty}</td>
                                <td className="px-3 py-2 border border-slate-300 text-center">{item.actualQty}</td>
                                <td className={`px-3 py-2 border border-slate-300 text-center font-bold ${item.shortageOverageQty < 0 ? 'text-red-600' : ''}`}>
                                    {item.shortageOverageQty}
                                </td>
                                <td className="px-3 py-2 border border-slate-300 text-right">
                                    {item.shortageOverageValue !== 0 ? formatCurrency(Math.abs(item.shortageOverageValue)) : '-'}
                                </td>
                                <td className="px-3 py-2 border border-slate-300">{item.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="grid grid-cols-3 gap-8 mt-12 pt-12 print:block print:grid-cols-3">
                     <div className="text-center">
                         <div className="mb-8 border-b border-black w-3/4 mx-auto"></div>
                         <div className="text-xs font-bold uppercase">Certified Correct By:</div>
                         <div className="text-[10px] mt-1">Inventory Committee</div>
                     </div>
                     <div className="text-center">
                         <div className="mb-8 border-b border-black w-3/4 mx-auto"></div>
                         <div className="text-xs font-bold uppercase">Approved By:</div>
                         <div className="text-[10px] mt-1">Head of Agency</div>
                     </div>
                     <div className="text-center">
                         <div className="mb-8 border-b border-black w-3/4 mx-auto"></div>
                         <div className="text-xs font-bold uppercase">Verified By:</div>
                         <div className="text-[10px] mt-1">COA Representative</div>
                     </div>
                </div>

                <div className="flex justify-end gap-3 print:hidden mt-8">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200" onClick={() => window.print()}><Printer size={16}/> Print Report</button>
                </div>
            </div>
        </div>
    );
};

// --- Master Data Views ---
const EmployeeMasterView = ({ employees, setEmployees, departments, onLog }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({ 
        employeeId: '', 
        firstName: '', 
        lastName: '', 
        middleName: '', 
        position: '', 
        departmentId: '', 
        status: 'Active' 
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('All');
    const [showInactive, setShowInactive] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = (emp: Employee) => {
        setEditingEmployee(emp);
        setFormData({
            employeeId: emp.employeeId,
            firstName: emp.firstName,
            lastName: emp.lastName,
            middleName: emp.middleName || '',
            position: emp.position || '',
            departmentId: emp.departmentId,
            status: emp.status
        });
        setError('');
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingEmployee(null);
        setFormData({ employeeId: '', firstName: '', lastName: '', middleName: '', position: '', departmentId: '', status: 'Active' });
        setError('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this employee?')) return;
        try {
            const updatedEmp = await deactivateEmployee(id);
            setEmployees(employees.map((e: Employee) => e.id === id ? updatedEmp : e));
            if (onLog) onLog('Deactivated Employee', 'Master Data', `Deactivated employee ID: ${id}`, id);
        } catch (err: any) {
            alert(err?.message || 'Failed to deactivate employee.');
        }
    };

    const handleSave = async () => {
        if (!formData.employeeId || !formData.firstName || !formData.lastName || !formData.departmentId) {
            setError('Employee ID, First Name, Last Name, and Department are required.');
            return;
        }

        const isDuplicateId = employees.some((e: Employee) => e.employeeId === formData.employeeId && e.id !== editingEmployee?.id);
        if (isDuplicateId) {
            setError('Employee ID must be unique.');
            return;
        }

        setIsSaving(true);
        setError('');
        try {
            if (editingEmployee) {
                const updated = await updateEmployee(editingEmployee.id, formData);
                setEmployees(employees.map((e: Employee) => e.id === editingEmployee.id ? updated : e));
                if (onLog) onLog('Updated Employee', 'Master Data', `Updated employee: ${formData.employeeId}`, editingEmployee.id);
            } else {
                const created = await createEmployee(formData);
                setEmployees([...employees, created]);
                if (onLog) onLog('Created Employee', 'Master Data', `Created employee: ${formData.employeeId}`, created.id);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err?.message || 'Failed to save employee.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredEmployees = employees.filter((e: Employee) => {
        const matchesSearch = getEmployeeFullName(e).toLowerCase().includes(searchTerm.toLowerCase()) || e.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = filterDept === 'All' || e.departmentId === filterDept;
        const matchesStatus = showInactive ? true : e.status === 'Active';
        return matchesSearch && matchesDept && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-slate-800">Employees Master Data</h1>
                 <button onClick={handleAdd} className="px-4 py-2 bg-[#006400] text-white rounded-lg flex gap-2 items-center hover:bg-[#004d00]">
                    <Plus size={16}/> Add Employee
                </button>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or ID..." 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]"
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                >
                    <option value="All">All Departments</option>
                    {departments.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button onClick={() => setShowInactive(!showInactive)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showInactive ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-600'}`}>
                    {showInactive ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                    {showInactive ? 'Showing Inactive' : 'Hide Inactive'}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Full Name</th>
                            <th className="px-6 py-4">Position</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredEmployees.map((e: Employee) => (
                            <tr key={e.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3 font-medium text-slate-700">{e.employeeId}</td>
                                <td className="px-6 py-3 text-[#006400] font-medium">{getEmployeeFullName(e)}</td>
                                <td className="px-6 py-3 text-slate-600">{e.position || '-'}</td>
                                <td className="px-6 py-3 text-slate-600">{departments.find((d:any) => d.id === e.departmentId)?.code || e.departmentId}</td>
                                <td className="px-6 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${e.status === 'Active' ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-500'}`}>{e.status}</span></td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(e)} className="p-1.5 text-slate-500 hover:text-[#006400] hover:bg-green-50 rounded"><Pencil size={16} /></button>
                                        <button onClick={() => handleDelete(e.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {filteredEmployees.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No employees found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">{editingEmployee ? 'Edit Employee' : 'New Employee'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Employee ID <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                        placeholder="e.g. 2023-001"
                                        value={formData.employeeId}
                                        onChange={e => setFormData({...formData, employeeId: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Department <span className="text-red-500">*</span></label>
                                    <select 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]"
                                        value={formData.departmentId}
                                        onChange={e => setFormData({...formData, departmentId: e.target.value})}
                                    >
                                        <option value="">Select Department...</option>
                                        {departments.filter((d: Department) => d.status === 'Active').map((d: Department) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">First Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                        value={formData.firstName}
                                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Middle Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                        value={formData.middleName}
                                        onChange={e => setFormData({...formData, middleName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                        value={formData.lastName}
                                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Position</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                    placeholder="e.g. Instructor I"
                                    value={formData.position}
                                    onChange={e => setFormData({...formData, position: e.target.value})}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="text-sm font-medium text-slate-700">Active Status</span>
                                <button onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})} className="text-[#006400]">
                                    {formData.status === 'Active' ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-400" />}
                                </button>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm" disabled={isSaving}>Cancel</button>
                                <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2 rounded-lg text-sm text-white ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#006400] hover:bg-[#004d00]'}`}>
                                    {isSaving ? 'Saving...' : 'Save Employee'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DepartmentMasterView = ({ departments, setDepartments, locations, onLog }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState({ code: '', name: '', head: '', locationId: '', status: 'Active' });
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = (dept: Department) => {
        setEditingDept(dept);
        setFormData({
            code: dept.code,
            name: dept.name,
            head: dept.head || '',
            locationId: dept.locationId || '',
            status: dept.status
        });
        setError('');
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingDept(null);
        setFormData({ code: '', name: '', head: '', locationId: '', status: 'Active' });
        setError('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this department?')) return;
        try {
            const updatedDept = await deactivateDepartment(id);
            setDepartments(departments.map((d: Department) => d.id === id ? updatedDept : d));
            if (onLog) onLog('Deactivated Department', 'Master Data', `Deactivated department ID: ${id}`, id);
        } catch (err: any) {
            alert(err?.message || 'Failed to deactivate department.');
        }
    };

    const handleSave = async () => {
        // Validation
        if (!formData.code || !formData.name || !formData.locationId) {
            setError('Code, Name, and Location are required.');
            return;
        }

        // Uniqueness Check
        const isCodeDuplicate = departments.some((d: Department) => d.code === formData.code && d.id !== editingDept?.id);
        const isNameDuplicate = departments.some((d: Department) => d.name === formData.name && d.id !== editingDept?.id);

        if (isCodeDuplicate) { setError('Department Code must be unique.'); return; }
        if (isNameDuplicate) { setError('Department Name must be unique.'); return; }

        setIsSaving(true);
        setError('');
        try {
            if (editingDept) {
                const updated = await updateDepartment(editingDept.id, formData);
                setDepartments(departments.map((d: Department) => d.id === editingDept.id ? updated : d));
                if (onLog) onLog('Updated Department', 'Master Data', `Updated department: ${formData.code}`, editingDept.id);
            } else {
                const created = await createDepartment(formData);
                setDepartments([...departments, created]);
                if (onLog) onLog('Created Department', 'Master Data', `Created department: ${formData.code}`, created.id);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err?.message || 'Failed to save department.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredDepartments = departments.filter((d: Department) => {
        const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = showInactive ? true : d.status === 'Active';
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
                <button onClick={handleAdd} className="px-4 py-2 bg-[#006400] text-white rounded-lg flex gap-2 items-center hover:bg-[#004d00]">
                    <Plus size={16}/> Add Department
                </button>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or code..." 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowInactive(!showInactive)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showInactive ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-600'}`}>
                        {showInactive ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                        {showInactive ? 'Showing Inactive' : 'Hide Inactive'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Head of Office</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredDepartments.map((d: Department) => (
                            <tr key={d.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3 font-medium text-[#006400]">{d.code}</td>
                                <td className="px-6 py-3 text-slate-700">{d.name}</td>
                                <td className="px-6 py-3 text-slate-600">{d.head || '-'}</td>
                                <td className="px-6 py-3 text-slate-600">{locations.find((l:any) => l.id === d.locationId)?.name || '-'}</td>
                                <td className="px-6 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status === 'Active' ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-500'}`}>{d.status}</span></td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(d)} className="p-1.5 text-slate-500 hover:text-[#006400] hover:bg-green-50 rounded"><Pencil size={16} /></button>
                                        <button onClick={() => handleDelete(d.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredDepartments.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No departments found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">{editingDept ? 'Edit Department' : 'New Department'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
                            
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Department Code <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                    placeholder="e.g. CCS"
                                    value={formData.code}
                                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Department Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                    placeholder="e.g. College of Computer Studies"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Head of Office</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                    placeholder="e.g. Dr. Juan Dela Cruz"
                                    value={formData.head}
                                    onChange={e => setFormData({...formData, head: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Location <span className="text-red-500">*</span></label>
                                <select 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]"
                                    value={formData.locationId}
                                    onChange={e => setFormData({...formData, locationId: e.target.value})}
                                >
                                    <option value="">Select Location...</option>
                                    {locations.filter((l:Location) => l.status === 'Active').map((l: Location) => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="text-sm font-medium text-slate-700">Active Status</span>
                                <button onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})} className="text-[#006400]">
                                    {formData.status === 'Active' ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-400" />}
                                </button>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm" disabled={isSaving}>Cancel</button>
                                <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2 rounded-lg text-sm text-white ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#006400] hover:bg-[#004d00]'}`}>
                                    {isSaving ? 'Saving...' : 'Save Department'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LocationMasterView = ({ locations, setLocations, onLog }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLoc, setEditingLoc] = useState<Location | null>(null);
    const [formData, setFormData] = useState({ code: '', name: '', description: '', status: 'Active' });
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = (loc: Location) => {
        setEditingLoc(loc);
        setFormData({
            code: loc.code,
            name: loc.name,
            description: loc.description || '',
            status: loc.status
        });
        setError('');
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingLoc(null);
        setFormData({ code: '', name: '', description: '', status: 'Active' });
        setError('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this location?')) return;
        try {
            const updatedLoc = await deactivateLocation(id);
            setLocations(locations.map((l: Location) => l.id === id ? updatedLoc : l));
            if (onLog) onLog('Deactivated Location', 'Master Data', `Deactivated location ID: ${id}`, id);
        } catch (err: any) {
            alert(err?.message || 'Failed to deactivate location.');
        }
    };

    const handleSave = async () => {
        // Validation
        if (!formData.code || !formData.name) {
            setError('Code and Name are required.');
            return;
        }

        // Uniqueness Check
        const isCodeDuplicate = locations.some((l: Location) => l.code === formData.code && l.id !== editingLoc?.id);
        const isNameDuplicate = locations.some((l: Location) => l.name === formData.name && l.id !== editingLoc?.id);

        if (isCodeDuplicate) { setError('Location Code must be unique.'); return; }
        if (isNameDuplicate) { setError('Location Name must be unique.'); return; }

        setIsSaving(true);
        setError('');
        try {
            if (editingLoc) {
                const updated = await updateLocation(editingLoc.id, formData);
                setLocations(locations.map((l: Location) => l.id === editingLoc.id ? updated : l));
                if (onLog) onLog('Updated Location', 'Master Data', `Updated location: ${formData.code}`, editingLoc.id);
            } else {
                const created = await createLocation(formData);
                setLocations([...locations, created]);
                if (onLog) onLog('Created Location', 'Master Data', `Created location: ${formData.code}`, created.id);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err?.message || 'Failed to save location.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredLocations = locations.filter((l: Location) => {
        const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = showInactive ? true : l.status === 'Active';
        return matchesSearch && matchesStatus;
    });

    return (
     <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold text-slate-800">Locations</h1>
             <button onClick={handleAdd} className="px-4 py-2 bg-[#006400] text-white rounded-lg flex gap-2 items-center hover:bg-[#004d00]">
                <Plus size={16}/> Add Location
            </button>
        </div>

        <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by name or code..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setShowInactive(!showInactive)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showInactive ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-600'}`}>
                    {showInactive ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                    {showInactive ? 'Showing Inactive' : 'Hide Inactive'}
                </button>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Code</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredLocations.map((l: Location) => (
                        <tr key={l.id} className="hover:bg-slate-50">
                            <td className="px-6 py-3 font-medium text-[#006400]">{l.code}</td>
                            <td className="px-6 py-3 text-slate-700">{l.name}</td>
                            <td className="px-6 py-3 text-slate-600">{l.description}</td>
                            <td className="px-6 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${l.status === 'Active' ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-500'}`}>{l.status}</span></td>
                            <td className="px-6 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleEdit(l)} className="p-1.5 text-slate-500 hover:text-[#006400] hover:bg-green-50 rounded"><Pencil size={16} /></button>
                                    <button onClick={() => handleDelete(l.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredLocations.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No locations found matching your criteria.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800">{editingLoc ? 'Edit Location' : 'New Location'}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
                        
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Location Code <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                placeholder="e.g. LIB"
                                value={formData.code}
                                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Location Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                placeholder="e.g. Main Library"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                placeholder="e.g. Ground Floor, Right Wing"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-sm font-medium text-slate-700">Active Status</span>
                            <button onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})} className="text-[#006400]">
                                {formData.status === 'Active' ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-400" />}
                            </button>
                        </div>

                        <div className="pt-2 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm" disabled={isSaving}>Cancel</button>
                            <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2 rounded-lg text-sm text-white ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#006400] hover:bg-[#004d00]'}`}>
                                {isSaving ? 'Saving...' : 'Save Location'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

const FundClusterMasterView = ({ funds, setFunds, onLog }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFund, setEditingFund] = useState<FundCluster | null>(null);
    const [formData, setFormData] = useState({ code: '', name: '', description: '', status: 'Active' });
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = (fund: FundCluster) => {
        setEditingFund(fund);
        setFormData({
            code: fund.code,
            name: fund.name,
            description: fund.description || '',
            status: fund.status
        });
        setError('');
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingFund(null);
        setFormData({ code: '', name: '', description: '', status: 'Active' });
        setError('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this fund cluster?')) return;
        try {
            const updatedFund = await deactivateFund(id);
            setFunds(funds.map((f: FundCluster) => f.id === id ? updatedFund : f));
            if (onLog) onLog('Deactivated Fund Cluster', 'Master Data', `Deactivated fund cluster ID: ${id}`, id);
        } catch (err: any) {
            alert(err?.message || 'Failed to deactivate fund cluster.');
        }
    };

    const handleSave = async () => {
        if (!formData.code || !formData.name) {
            setError('Code and Name are required.');
            return;
        }

        const isCodeDuplicate = funds.some((f: FundCluster) => f.code === formData.code && f.id !== editingFund?.id);
        const isNameDuplicate = funds.some((f: FundCluster) => f.name === formData.name && f.id !== editingFund?.id);

        if (isCodeDuplicate) { setError('Fund Cluster Code must be unique.'); return; }
        if (isNameDuplicate) { setError('Fund Cluster Name must be unique.'); return; }

        setIsSaving(true);
        setError('');
        try {
            if (editingFund) {
                const updated = await updateFund(editingFund.id, formData);
                setFunds(funds.map((f: FundCluster) => f.id === editingFund.id ? updated : f));
                if (onLog) onLog('Updated Fund Cluster', 'Master Data', `Updated fund cluster: ${formData.code}`, editingFund.id);
            } else {
                const created = await createFund(formData);
                setFunds([...funds, created]);
                if (onLog) onLog('Created Fund Cluster', 'Master Data', `Created fund cluster: ${formData.code}`, created.id);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err?.message || 'Failed to save fund cluster.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredFunds = funds.filter((f: FundCluster) => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = showInactive ? true : f.status === 'Active';
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-slate-800">Fund Clusters</h1>
                 <button onClick={handleAdd} className="px-4 py-2 bg-[#006400] text-white rounded-lg flex gap-2 items-center hover:bg-[#004d00]">
                    <Plus size={16}/> Add Fund
                </button>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or code..." 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowInactive(!showInactive)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showInactive ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-600'}`}>
                        {showInactive ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                        {showInactive ? 'Showing Inactive' : 'Hide Inactive'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredFunds.map((f: FundCluster) => (
                            <tr key={f.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3 font-medium text-[#006400]">{f.code}</td>
                                <td className="px-6 py-3 text-slate-700">{f.name}</td>
                                <td className="px-6 py-3 text-slate-600">{f.description}</td>
                                <td className="px-6 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${f.status === 'Active' ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-500'}`}>{f.status}</span></td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(f)} className="p-1.5 text-slate-500 hover:text-[#006400] hover:bg-green-50 rounded"><Pencil size={16} /></button>
                                        <button onClick={() => handleDelete(f.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredFunds.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No fund clusters found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">{editingFund ? 'Edit Fund Cluster' : 'New Fund Cluster'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
                            
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Fund Code <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                    placeholder="e.g. 101"
                                    value={formData.code}
                                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Fund Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                    placeholder="e.g. Regular Agency Fund"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                    placeholder="e.g. General Fund"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="text-sm font-medium text-slate-700">Active Status</span>
                                <button onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})} className="text-[#006400]">
                                    {formData.status === 'Active' ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-400" />}
                                </button>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm" disabled={isSaving}>Cancel</button>
                                <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2 rounded-lg text-sm text-white ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#006400] hover:bg-[#004d00]'}`}>
                                    {isSaving ? 'Saving...' : 'Save Fund Cluster'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CategoryMasterView = ({ categories, setCategories, onLog }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
    const [formData, setFormData] = useState({ code: '', name: '', description: '', type: 'PPE', status: 'Active' });
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [error, setError] = useState('');

    const handleEdit = (cat: AssetCategory) => {
        setEditingCategory(cat);
        setFormData({
            code: cat.code,
            name: cat.name,
            description: cat.description || '',
            type: cat.type || 'PPE',
            status: cat.status
        });
        setError('');
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingCategory(null);
        setFormData({ code: '', name: '', description: '', type: 'PPE', status: 'Active' });
        setError('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this category?')) return;
        try {
            const updatedCat = await deactivateCategory(id);
            setCategories(categories.map((c: AssetCategory) => c.id === id ? updatedCat : c));
            if (onLog) onLog('Deactivated Category', 'Master Data', `Deactivated category ID: ${id}`, id);
        } catch (err: any) {
            alert(err?.message || 'Failed to deactivate category.');
        }
    };

    const handleSave = async () => {
        if (!formData.code || !formData.name) {
            setError('Code and Name are required.');
            return;
        }

        const isCodeDuplicate = categories.some((c: AssetCategory) => c.code === formData.code && c.id !== editingCategory?.id);
        const isNameDuplicate = categories.some((c: AssetCategory) => c.name === formData.name && c.id !== editingCategory?.id);

        if (isCodeDuplicate) { setError('Category Code must be unique.'); return; }
        if (isNameDuplicate) { setError('Category Name must be unique.'); return; }

        setIsSaving(true);
        setError('');
        try {
            if (editingCategory) {
                const updated = await updateCategory(editingCategory.id, formData);
                setCategories(categories.map((c: AssetCategory) => c.id === editingCategory.id ? updated : c));
                if (onLog) onLog('Updated Category', 'Master Data', `Updated category: ${formData.code}`, editingCategory.id);
            } else {
                const created = await createCategory(formData);
                setCategories([...categories, created]);
                if (onLog) onLog('Created Category', 'Master Data', `Created category: ${formData.code}`, created.id);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err?.message || 'Failed to save category.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredCategories = categories.filter((c: AssetCategory) => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = showInactive ? true : c.status === 'Active';
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-slate-800">Asset Categories</h1>
                 <button onClick={handleAdd} className="px-4 py-2 bg-[#006400] text-white rounded-lg flex gap-2 items-center hover:bg-[#004d00]">
                    <Plus size={16}/> Add Category
                </button>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or code..." 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowInactive(!showInactive)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showInactive ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-600'}`}>
                        {showInactive ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                        {showInactive ? 'Showing Inactive' : 'Hide Inactive'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCategories.map((c: AssetCategory) => (
                            <tr key={c.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3 font-medium text-[#006400]">{c.code}</td>
                                <td className="px-6 py-3 text-slate-700">{c.name}</td>
                                <td className="px-6 py-3 text-slate-600">{c.type}</td>
                                <td className="px-6 py-3 text-slate-600">{c.description}</td>
                                <td className="px-6 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'Active' ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span></td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(c)} className="p-1.5 text-slate-500 hover:text-[#006400] hover:bg-green-50 rounded"><Pencil size={16} /></button>
                                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredCategories.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No categories found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
                            
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Category Code <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                    placeholder="e.g. ITE"
                                    value={formData.code}
                                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Category Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                    placeholder="e.g. IT Equipment"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                                <select 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]"
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="PPE">PPE</option>
                                    <option value="Consumable">Consumable</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                    placeholder="e.g. Computers and Peripherals"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="text-sm font-medium text-slate-700">Active Status</span>
                                <button onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})} className="text-[#006400]">
                                    {formData.status === 'Active' ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-400" />}
                                </button>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm" disabled={isSaving}>Cancel</button>
                                <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2 rounded-lg text-sm text-white ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#006400] hover:bg-[#004d00]'}`}>
                                    {isSaving ? 'Saving...' : 'Save Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PPECatalogView = ({ catalog, setCatalog, categories, onLog }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
    const [formData, setFormData] = useState<any>({ 
        article: '', 
        description: '', 
        unit: '', 
        categoryId: '', 
        status: 'Active' 
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [showInactive, setShowInactive] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = (item: CatalogItem) => {
        setEditingItem(item);
        setFormData({
            article: item.article,
            description: item.description,
            unit: item.unit,
            categoryId: item.categoryId,
            status: item.status
        });
        setError('');
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setFormData({ 
            article: '', 
            description: '', 
            unit: '', 
            categoryId: '', 
            status: 'Active' 
        });
        setError('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this item?')) return;
        try {
            const updated = await deactivateCatalogItem(id);
            setCatalog(catalog.map((c: CatalogItem) => c.id === id ? updated : c));
            if (onLog) onLog('Deactivated PPE Item', 'Master Data', `Deactivated item ID: ${id}`, id);
        } catch (err: any) {
            alert(err?.message || 'Failed to deactivate item.');
        }
    };

    const handleSave = async () => {
        if (!formData.article || !formData.description || !formData.unit || !formData.categoryId) {
            setError('All fields are required.');
            return;
        }

        setIsSaving(true);
        setError('');
        const payload = {
            ...formData,
            itemType: 'PPE',
            stockNumber: editingItem?.stockNumber || `PPE-${generateId()}`,
            quantity: editingItem?.quantity ?? 0,
        };
        try {
            if (editingItem) {
                const updated = await updateCatalogItem(editingItem.id, payload);
                setCatalog(catalog.map((c: CatalogItem) => c.id === editingItem.id ? updated : c));
                if (onLog) onLog('Updated PPE Item', 'Master Data', `Updated item: ${formData.article}`, editingItem.id);
            } else {
                const created = await createCatalogItem(payload);
                setCatalog([...catalog, created]);
                if (onLog) onLog('Created PPE Item', 'Master Data', `Created item: ${formData.article}`, created.id);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err?.message || 'Failed to save item.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredItems = catalog.filter((c: CatalogItem) => {
        if (c.itemType !== 'PPE') return false;
        const matchesSearch = c.article.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || c.categoryId === filterCategory;
        const matchesStatus = showInactive ? true : c.status === 'Active';
        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-slate-800">PPE Catalog</h1>
                 <button onClick={handleAdd} className="px-4 py-2 bg-[#006400] text-white rounded-lg flex gap-2 items-center hover:bg-[#004d00]">
                    <Plus size={16}/> Add PPE Item
                </button>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search article or description..." 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    {categories
                        .filter((c: AssetCategory) => c.type === 'PPE')
                        .map((c: AssetCategory) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <button onClick={() => setShowInactive(!showInactive)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showInactive ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-600'}`}>
                    {showInactive ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                    {showInactive ? 'Showing Inactive' : 'Hide Inactive'}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Article</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Unit</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredItems.map((c: CatalogItem) => (
                            <tr key={c.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3 font-medium text-[#006400]">{c.article}</td>
                                <td className="px-6 py-3 text-slate-600 max-w-xs truncate">{c.description}</td>
                                <td className="px-6 py-3 text-slate-600">{c.unit}</td>
                                <td className="px-6 py-3 text-slate-600">{categories.find((cat:any) => cat.id === c.categoryId)?.name || '-'}</td>
                                <td className="px-6 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'Active' ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span></td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(c)} className="p-1.5 text-slate-500 hover:text-[#006400] hover:bg-green-50 rounded"><Pencil size={16} /></button>
                                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredItems.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No PPE items found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">{editingItem ? 'Edit PPE Item' : 'New PPE Item'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Article Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                        placeholder="e.g. Laptop"
                                        value={formData.article}
                                        onChange={e => setFormData({...formData, article: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Unit <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                        placeholder="e.g. unit"
                                        value={formData.unit}
                                        onChange={e => setFormData({...formData, unit: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                                <textarea 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                    placeholder="Full specifications..."
                                    rows={2}
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Category (PPE Only) <span className="text-red-500">*</span></label>
                                <select 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]"
                                    value={formData.categoryId}
                                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                                >
                                    <option value="">Select Category...</option>
                                    {categories
                                        .filter((c: AssetCategory) => c.status === 'Active' && c.type === 'PPE')
                                        .map((c: AssetCategory) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="text-sm font-medium text-slate-700">Active Status</span>
                                <button onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})} className="text-[#006400]">
                                    {formData.status === 'Active' ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-400" />}
                                </button>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm" disabled={isSaving}>Cancel</button>
                                <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2 rounded-lg text-sm text-white ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#006400] hover:bg-[#004d00]'}`}>
                                    {isSaving ? 'Saving...' : 'Save PPE Item'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ConsumablesCatalogView = ({ catalog, setCatalog, categories, onLog }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
    const [formData, setFormData] = useState<any>({ 
        article: '', 
        description: '', 
        unit: '', 
        unitValue: '',
        categoryId: '', 
        status: 'Active' 
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [showInactive, setShowInactive] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = (item: CatalogItem) => {
        setEditingItem(item);
        setFormData({
            article: item.article,
            description: item.description,
            unit: item.unit,
            unitValue: item.unitValue?.toString() || '',
            categoryId: item.categoryId,
            status: item.status
        });
        setError('');
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setFormData({ 
            article: '', 
            description: '', 
            unit: '', 
            unitValue: '',
            categoryId: '', 
            status: 'Active' 
        });
        setError('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this item?')) return;
        try {
            const updated = await deactivateCatalogItem(id);
            setCatalog(catalog.map((c: CatalogItem) => c.id === id ? updated : c));
            if (onLog) onLog('Deactivated Consumable', 'Master Data', `Deactivated item ID: ${id}`, id);
        } catch (err: any) {
            alert(err?.message || 'Failed to deactivate item.');
        }
    };

    const handleSave = async () => {
        if (!formData.article || !formData.description || !formData.unit || !formData.categoryId || !formData.unitValue) {
            setError('All fields are required, including unit cost.');
            return;
        }

        const unitValNum = parseFloat(formData.unitValue);
        if (Number.isNaN(unitValNum) || unitValNum < 0) {
            setError('Unit cost must be a valid number.');
            return;
        }

        setIsSaving(true);
        setError('');
        const payload = {
            ...formData,
            itemType: 'Consumable',
            stockNumber: editingItem?.stockNumber || `SUP-${generateId()}`,
            quantity: editingItem?.quantity ?? 0,
            unitValue: unitValNum,
        };
        try {
            if (editingItem) {
                const updated = await updateCatalogItem(editingItem.id, payload);
                setCatalog(catalog.map((c: CatalogItem) => c.id === editingItem.id ? updated : c));
                if (onLog) onLog('Updated Consumable', 'Master Data', `Updated item: ${formData.article}`, editingItem.id);
            } else {
                const created = await createCatalogItem(payload);
                setCatalog([...catalog, created]);
                if (onLog) onLog('Created Consumable', 'Master Data', `Created item: ${formData.article}`, created.id);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err?.message || 'Failed to save item.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredItems = catalog.filter((c: CatalogItem) => {
        if (c.itemType !== 'Consumable') return false;
        const matchesSearch = c.article.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || c.categoryId === filterCategory;
        const matchesStatus = showInactive ? true : c.status === 'Active';
        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-slate-800">Consumables</h1>
                 <button onClick={handleAdd} className="px-4 py-2 bg-[#006400] text-white rounded-lg flex gap-2 items-center hover:bg-[#004d00]">
                    <Plus size={16}/> Add Consumable
                </button>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search article or description..." 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#006400]"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    {categories
                        .filter((c: AssetCategory) => c.status === 'Active' && c.type === 'Consumable')
                        .map((c: AssetCategory) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <button onClick={() => setShowInactive(!showInactive)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showInactive ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-600'}`}>
                    {showInactive ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                    {showInactive ? 'Showing Inactive' : 'Hide Inactive'}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Article</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4 text-center">On Hand</th>
                            <th className="px-6 py-4">Unit</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredItems.map((c: CatalogItem) => (
                            <tr key={c.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3 font-medium text-[#006400]">{c.article}</td>
                                <td className="px-6 py-3 text-slate-600 max-w-xs truncate">{c.description}</td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`font-bold px-2 py-1 rounded ${c.quantity <= (c.reorderPoint || 0) ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-700'}`}>
                                        {c.quantity}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-slate-600">{c.unit}</td>
                                <td className="px-6 py-3 text-slate-600">{categories.find((cat:any) => cat.id === c.categoryId)?.name || '-'}</td>
                                <td className="px-6 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'Active' ? 'bg-green-100 text-[#006400]' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span></td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(c)} className="p-1.5 text-slate-500 hover:text-[#006400] hover:bg-green-50 rounded"><Pencil size={16} /></button>
                                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredItems.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">No consumable items found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">{editingItem ? 'Edit Consumable' : 'New Consumable'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Article Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                        placeholder="e.g. Bond Paper"
                                        value={formData.article}
                                        onChange={e => setFormData({...formData, article: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Unit <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                        placeholder="e.g. ream"
                                        value={formData.unit}
                                        onChange={e => setFormData({...formData, unit: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Unit Cost <span className="text-red-500">*</span></label>
                                    <input 
                                        type="number" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                        placeholder="e.g. 250"
                                        value={formData.unitValue}
                                        onChange={e => setFormData({...formData, unitValue: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                                <textarea 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" 
                                    placeholder="Full specifications..."
                                    rows={2}
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                                <select 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]"
                                    value={formData.categoryId}
                                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                                >
                                    <option value="">Select Category...</option>
                                    {categories
                                        .filter((c: AssetCategory) => c.status === 'Active' && c.type === 'Consumable')
                                        .map((c: AssetCategory) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="text-sm font-medium text-slate-700">Active Status</span>
                                <button onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})} className="text-[#006400]">
                                    {formData.status === 'Active' ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-400" />}
                                </button>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm" disabled={isSaving}>Cancel</button>
                                <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2 rounded-lg text-sm text-white ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#006400] hover:bg-[#004d00]'}`}>
                                    {isSaving ? 'Saving...' : 'Save Consumable'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<ViewState>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Data State Initialization
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [funds, setFunds] = useState<FundCluster[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [mrs, setMrs] = useState<MemorandumReceipt[]>([]);
  const [audits, setAudits] = useState<AuditSession[]>([]);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedMR, setSelectedMR] = useState<MemorandumReceipt | null>(null);
  const [isSavingMR, setIsSavingMR] = useState(false);
  const [isSavingAudit, setIsSavingAudit] = useState(false);
  
  useEffect(() => {
    const load = async () => {
      setIsBootstrapping(true);
      try {
        const data = await bootstrapDataFromApi();
        setDepartments(data.departments);
        setEmployees(data.employees);
        setLocations(data.locations);
        setFunds(data.funds);
        setCategories(data.categories);
        setCatalog(data.catalog);
        setAssets(data.assets);
        setTransactions(data.transactions);
        setMrs(data.mrs);
        setAudits(data.audits);
        setLogs(data.logs);
        setDataError(null);
      } catch (err) {
        console.error('API bootstrap failed, falling back to mock data.', err);
        setDataError('Failed to load data from the backend. Using local mock data instead.');
        setDepartments(INITIAL_DEPARTMENTS);
        setEmployees(INITIAL_EMPLOYEES);
        setLocations(INITIAL_LOCATIONS);
        setFunds(INITIAL_FUNDS);
        setCategories(INITIAL_CATEGORIES);
        setCatalog(INITIAL_CATALOG);
        setAssets(INITIAL_ASSETS);
        setTransactions(INITIAL_TRANSACTIONS);
        setMrs(INITIAL_MRS);
        setAudits(INITIAL_AUDITS);
        setLogs(INITIAL_LOGS);
      } finally {
        setIsBootstrapping(false);
      }
    };
    load();
  }, []);
  
  // Asset Editing State
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Active Audit Session
  const [activeAudit, setActiveAudit] = useState<AuditSession | null>(null);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);

  // Helper for logging (optimistic + backend)
  const handleLog = (action: string, module: string, description: string, referenceId?: string) => {
      const newLog: LogEntry = {
          id: generateId(),
          timestamp: new Date().toISOString(),
          userId: 'E001',
          username: 'Jeffrey Meneses',
          role: 'Admin Officer V',
          action,
          module,
          description,
          referenceId: referenceId || '-'
      };
      // Optimistic update
      setLogs([newLog, ...logs]);
      // Persist to backend; if it succeeds, replace the temp log with saved data
      createActivityLog(newLog)
        .then(saved => {
            setLogs((prev: LogEntry[]) => {
                const withoutTemp = prev.filter(l => l.id !== newLog.id);
                return [saved, ...withoutTemp];
            });
        })
        .catch(() => {
            // Keep optimistic entry if backend fails
        });
  };

  const handleAssetSave = async (data: any) => {
      setIsSavingAsset(true);
      try {
          const payload = { ...data, quantity: data.quantity ?? (editingAsset?.quantity ?? 1) };
          if (editingAsset) {
              const updated = await updateAsset(editingAsset.id, payload);
              setAssets(assets.map((a: Asset) => a.id === editingAsset.id ? updated : a));
              handleLog('Updated Asset', 'Asset Registry', `Updated asset ${updated.propertyNumber}`, editingAsset.id);
          } else {
              const created = await createAsset(payload);
              setAssets([...assets, created]);
              handleLog('Registered Asset', 'Asset Registry', `Registered new asset ${created.propertyNumber}`, created.id);
          }
          setEditingAsset(null);
          setView('asset-registry');
      } catch (err: any) {
          console.error('Failed to save asset', err);
          setDataError(typeof err?.message === 'string' ? err.message : 'Failed to save asset.');
          throw err;
      } finally {
          setIsSavingAsset(false);
      }
  };

  const handleTransactionSave = async (data: any) => {
      setIsSavingTransaction(true);
      try {
          const created = await createTransaction({ ...data, status: 'Completed', createdBy: 'Jeffrey Meneses' });
          setTransactions([created, ...transactions]);
          // Refresh catalog quantities from backend or adjust locally based on created.items
          if (created.items?.length) {
              setCatalog(catalog.map((c: CatalogItem) => {
                  const delta = created.items
                    .filter((i: any) => i.catalogItemId === c.id)
                    .reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
                  if (!delta || c.itemType !== 'Consumable') return c;
                  if (created.type === 'Stock In') {
                      return { ...c, quantity: (c.quantity || 0) + delta };
                  } else {
                      return { ...c, quantity: Math.max(0, (c.quantity || 0) - delta) };
                  }
              }));
          }
          handleLog('Recorded Transaction', 'Stock Transactions', `Recorded new stock ${data.type.toLowerCase()}`, created.id);
          setView('transactions-list');
      } finally {
          setIsSavingTransaction(false);
      }
  };

  const handleMRSave = async (data: any) => {
      setIsSavingMR(true);
      try {
          const created = await createMemorandumReceipt(data);
          setMrs([created, ...mrs]);
          handleLog('Issued MR', 'Memorandum Receipt', `Issued ${created.mrNumber}`, created.id);
          setView('mr-list');
      } catch (err: any) {
          setDataError(err?.message || 'Failed to issue MR.');
          throw err;
      } finally {
          setIsSavingMR(false);
      }
  };

  if (!isAuthenticated) {
      return <LandingPage onLogin={() => setIsAuthenticated(true)} />;
  }

  if (isAuthenticated && isBootstrapping) {
      return (
        <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-600">
            <div className="flex items-center gap-3 text-sm font-medium">
                <Loader2 className="animate-spin" /> Loading data from server...
            </div>
        </div>
      );
  }

  const renderContent = () => {
      switch (view) {
          case 'dashboard':
              return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                            <div className="text-sm text-slate-500">Overview of Supply Office Operations</div>
                        </div>
                        <div className="text-sm bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            label="Total Asset Value" 
                            value={formatCurrency(assets.reduce((sum, a) => sum + (a.unitValue * a.quantity), 0))} 
                            icon={<Wallet />} 
                            colorClass="bg-emerald-100 text-emerald-700"
                            iconColorClass="text-emerald-700"
                        />
                        <StatCard 
                            label="Total PPE Items" 
                            value={assets.length} 
                            icon={<Box />} 
                            colorClass="bg-blue-100 text-blue-700"
                            iconColorClass="text-blue-700"
                        />
                         <StatCard 
                            label="Low Stock Alerts" 
                            value={catalog.filter(c => c.itemType === 'Consumable' && c.quantity <= (c.reorderPoint || 0)).length} 
                            icon={<AlertTriangle />} 
                            colorClass="bg-red-100 text-red-700"
                            iconColorClass="text-red-700"
                            subtext="Reorder Needed"
                        />
                         <StatCard 
                            label="Active Audits" 
                            value={audits.filter(a => a.status === 'Draft').length} 
                            icon={<ClipboardList />} 
                            colorClass="bg-amber-100 text-amber-700"
                            iconColorClass="text-amber-700"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Stock Movement Analytics</h3>
                            <StockMovementChart transactions={transactions} departments={departments} />
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>
                            <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar max-h-[300px]">
                                {logs.slice(0, 6).map(log => (
                                    <div key={log.id} className="flex gap-3 relative pl-4 border-l-2 border-slate-100">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-800">{log.action}</div>
                                            <div className="text-xs text-slate-500 mb-1">{log.description}</div>
                                            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{formatDateTime(log.timestamp)}</div>
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && <div className="text-sm text-slate-400 text-center py-4">No recent activity.</div>}
                            </div>
                            <button onClick={() => setView('activity-logs')} className="mt-4 text-sm text-[#006400] font-medium hover:underline text-center w-full">View All Activity</button>
                        </div>
                    </div>
                </div>
              );
          case 'activity-logs': return <ActivityLogView logs={logs} setLogs={setLogs} />;
          case 'reports': return <ReportsModule assets={assets} catalog={catalog} transactions={transactions} audits={audits} departments={departments} locations={locations} categories={categories} />;
          case 'settings': return <SettingsView settings={settings} setSettings={setSettings} onLog={handleLog} />;
          
          case 'asset-registry': 
              return <AssetRegistryList 
                  assets={assets} 
                  setAssets={setAssets}
                  departments={departments}
                  locations={locations}
                  catalog={catalog}
                  employees={employees}
                  onNavigate={(view: ViewState, asset?: Asset) => {
                      if (view === 'asset-edit' && asset) {
                          setEditingAsset(asset);
                          setView('asset-new');
                          setSelectedAsset(null);
                      } else if (view === 'asset-detail' && asset) {
                          setSelectedAsset(asset);
                          setView('asset-detail');
                          setEditingAsset(null);
                      } else {
                          setEditingAsset(null);
                          setSelectedAsset(null);
                          setView(view);
                      }
                  }}
                  onLog={handleLog}
              />;
          case 'asset-new': 
              return <AssetForm 
                  onSave={handleAssetSave} 
                  onCancel={() => setView('asset-registry')} 
                  assets={assets}
                  catalog={catalog} 
                  employees={employees} 
                  departments={departments} 
                  locations={locations} 
                  funds={funds}
                  initialData={editingAsset}
                  isSaving={isSavingAsset}
              />;
          case 'asset-detail': return <AssetDetail asset={selectedAsset} catalog={catalog} departments={departments} locations={locations} employees={employees} funds={funds} onBack={() => { setSelectedAsset(null); setView('asset-registry'); }} />;

          case 'transactions-list': return <StockTransactionList transactions={transactions} departments={departments} catalog={catalog} onNavigate={(view: ViewState, txn?: Transaction) => {
              if (view === 'transactions-detail' && txn) {
                  setSelectedTransaction(txn);
                  setView('transactions-detail');
              } else {
                  setSelectedTransaction(null);
                  setView(view);
              }
          }} />;
          case 'transactions-new': return <StockTransactionForm onSave={(data: any) => handleTransactionSave(data)} onCancel={() => setView('transactions-list')} catalog={catalog} departments={departments} isSaving={isSavingTransaction} />;
          case 'transactions-detail': return <StockTransactionDetail transaction={selectedTransaction} catalog={catalog} departments={departments} onBack={() => { setSelectedTransaction(null); setView('transactions-list'); }} />;

          case 'mr-list': return <MRListView mrs={mrs} employees={employees} onNavigate={(view: ViewState, mr?: MemorandumReceipt) => {
              if (view === 'mr-detail' && mr) {
                  setSelectedMR(mr);
                  setView('mr-detail');
              } else {
                  setSelectedMR(null);
                  setView(view);
              }
          }} />;
          case 'mr-new': return <MRForm onSave={handleMRSave} onCancel={() => setView('mr-list')} employees={employees} assets={assets} isSaving={isSavingMR} />;
          case 'mr-detail': return <MRDetail mr={selectedMR} employees={employees} departments={departments} onBack={() => { setSelectedMR(null); setView('mr-list'); }} />;

          case 'audit-list': 
              return <AuditList 
                  audits={audits} 
                  departments={departments}
                  locations={locations}
                  onNavigate={(view: ViewState, audit?: AuditSession) => {
                      if (audit) setActiveAudit(audit);
                      setView(view);
                  }} 
              />;
          case 'audit-new': 
              return <AuditNew 
                  onCancel={() => setView('audit-list')} 
                  onSave={async (session: AuditSession) => {
                      setIsSavingAudit(true);
                      try {
                          const created = await createAuditSession(session);
                          setAudits([created, ...audits]);
                          setActiveAudit(created);
                          handleLog('Created Audit', 'Physical Count', `Created session ${created.sessionId}`, created.id);
                          setView('audit-detail');
                      } catch (err: any) {
                          setDataError(err?.message || 'Failed to create audit session.');
                      } finally {
                          setIsSavingAudit(false);
                      }
                  }}
                  locations={locations}
                  departments={departments}
                  assets={assets}
                  isSaving={isSavingAudit}
              />;
          case 'audit-detail': 
              if (!activeAudit) return <AuditList audits={audits} onNavigate={setView} />;
              
              if (activeAudit.status === 'Draft') {
                  return <AuditWorksheet 
                      audit={activeAudit} 
                      onBack={() => setView('audit-list')} 
                      onSaveDraft={async (updated: AuditSession) => {
                          setIsSavingAudit(true);
                          try {
                              const saved = await updateAuditSession(updated.id, { ...updated, status: 'Draft' });
                              const newAudits = audits.map(a => a.id === saved.id ? saved : a);
                              setAudits(newAudits);
                              setActiveAudit(saved);
                              handleLog('Updated Audit', 'Physical Count', `Saved draft for ${saved.sessionId}`, saved.id);
                          } catch (err: any) {
                              setDataError(err?.message || 'Failed to save audit draft.');
                          } finally {
                              setIsSavingAudit(false);
                          }
                      }}
                      onFinalize={async (final: AuditSession) => {
                          setIsSavingAudit(true);
                          try {
                              const finalized = await updateAuditSession(final.id, { ...final, status: 'Finalized', finalizedAt: new Date().toISOString() });
                              const newAudits = audits.map(a => a.id === finalized.id ? finalized : a);
                              setAudits(newAudits as AuditSession[]);
                              setActiveAudit(finalized as AuditSession);
                              handleLog('Finalized Audit', 'Physical Count', `Finalized session ${finalized.sessionId}`, finalized.id);
                          } catch (err: any) {
                              setDataError(err?.message || 'Failed to finalize audit.');
                          } finally {
                              setIsSavingAudit(false);
                          }
                      }}
                  />;
              } else {
                  return <AuditReport audit={activeAudit} onBack={() => setView('audit-list')} />;
              }

          case 'mdm-employees': return <EmployeeMasterView employees={employees} setEmployees={setEmployees} departments={departments} onLog={handleLog} />;
          case 'mdm-departments': return <DepartmentMasterView departments={departments} setDepartments={setDepartments} locations={locations} onLog={handleLog} />;
          case 'mdm-locations': return <LocationMasterView locations={locations} setLocations={setLocations} onLog={handleLog} />;
          case 'mdm-funds': return <FundClusterMasterView funds={funds} setFunds={setFunds} onLog={handleLog} />;
          case 'mdm-categories': return <CategoryMasterView categories={categories} setCategories={setCategories} onLog={handleLog} />;
          case 'mdm-ppe': return <PPECatalogView catalog={catalog} setCatalog={setCatalog} categories={categories} onLog={handleLog} />;
          case 'mdm-consumables': return <ConsumablesCatalogView catalog={catalog} setCatalog={setCatalog} categories={categories} onLog={handleLog} />;

          default: return <div className="p-8 text-center text-slate-500">Page not found or under construction.</div>;
      }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden print:bg-white print:h-auto print:block">
        <aside className={`bg-[#006400] text-white flex flex-col transition-all duration-300 print:hidden ${isSidebarCollapsed ? 'w-16' : 'w-64'} shadow-2xl z-20`}>
             <div className="p-4 flex items-center justify-between border-b border-green-800/30 h-16 shrink-0">
                {!isSidebarCollapsed && (
                    <div className="flex items-center gap-2 font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden">
                        <div className="w-8 h-8 bg-white text-[#006400] rounded-lg flex items-center justify-center shadow-lg"><Box size={20} strokeWidth={2.5} /></div>
                        <span>ESSU Inventory</span>
                    </div>
                )}
                <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-1.5 hover:bg-white/10 rounded-lg text-green-100 transition-colors mx-auto">
                    {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 space-y-6 custom-scrollbar">
                <NavSection label="Overview" collapsed={isSidebarCollapsed}>
                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} collapsed={isSidebarCollapsed} />
                    <NavItem icon={<Activity size={20} />} label="Activity Logs" active={view === 'activity-logs'} onClick={() => setView('activity-logs')} collapsed={isSidebarCollapsed} />
                    <NavItem icon={<BarChart3 size={20} />} label="Reports" active={view === 'reports'} onClick={() => setView('reports')} collapsed={isSidebarCollapsed} />
                </NavSection>

                <NavSection label="Operations" collapsed={isSidebarCollapsed}>
                     <NavItem icon={<PackageSearch size={20} />} label="Asset Registry" active={view.startsWith('asset')} onClick={() => setView('asset-registry')} collapsed={isSidebarCollapsed} />
                     <NavItem icon={<ArrowRightLeft size={20} />} label="Transactions" active={view.startsWith('transactions')} onClick={() => setView('transactions-list')} collapsed={isSidebarCollapsed} />
                     <NavItem icon={<FileCheck size={20} />} label="Memorandum Receipts" active={view.startsWith('mr')} onClick={() => setView('mr-list')} collapsed={isSidebarCollapsed} />
                     <NavItem icon={<ClipboardList size={20} />} label="Physical Counts" active={view.startsWith('audit')} onClick={() => setView('audit-list')} collapsed={isSidebarCollapsed} />
                </NavSection>

                <NavSection label="Master Data" collapsed={isSidebarCollapsed}>
                     <NavItem icon={<Users size={20} />} label="Employees" active={view === 'mdm-employees'} onClick={() => setView('mdm-employees')} collapsed={isSidebarCollapsed} />
                     <NavItem icon={<Building size={20} />} label="Departments" active={view === 'mdm-departments'} onClick={() => setView('mdm-departments')} collapsed={isSidebarCollapsed} />
                     <NavItem icon={<MapPin size={20} />} label="Locations" active={view === 'mdm-locations'} onClick={() => setView('mdm-locations')} collapsed={isSidebarCollapsed} />
                     <NavItem icon={<Wallet size={20} />} label="Fund Clusters" active={view === 'mdm-funds'} onClick={() => setView('mdm-funds')} collapsed={isSidebarCollapsed} />
                     <NavItem icon={<Tags size={20} />} label="Asset Categories" active={view === 'mdm-categories'} onClick={() => setView('mdm-categories')} collapsed={isSidebarCollapsed} />
                     <NavItem icon={<Monitor size={20} />} label="PPE Catalog" active={view === 'mdm-ppe'} onClick={() => setView('mdm-ppe')} collapsed={isSidebarCollapsed} />
                     <NavItem icon={<ScrollText size={20} />} label="Consumables" active={view === 'mdm-consumables'} onClick={() => setView('mdm-consumables')} collapsed={isSidebarCollapsed} />
                </NavSection>
            </div>

            <div className="p-4 border-t border-green-800/30 shrink-0 space-y-2">
                <button onClick={() => setView('settings')} className={`flex items-center gap-3 px-4 py-2 w-full text-green-100 hover:bg-white/10 hover:text-white rounded-lg transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${view === 'settings' ? 'bg-white/10 text-yellow-400' : ''}`}>
                    <Settings size={20} />
                    {!isSidebarCollapsed && <span>Settings</span>}
                </button>
                <button onClick={() => setIsAuthenticated(false)} className={`flex items-center gap-3 px-4 py-2 w-full text-green-100 hover:bg-white/10 hover:text-white rounded-lg transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                    <LogOut size={20} />
                    {!isSidebarCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
             <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 print:hidden">
                <div className="flex items-center gap-4">
                     <h2 className="text-lg font-bold text-slate-700 hidden md:block">Supply Office Management System</h2>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="h-8 w-px bg-slate-200 mx-1"></div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-slate-800">Jeffrey Meneses</div>
                            <div className="text-xs text-slate-500">Admin Officer V</div>
                        </div>
                        <div className="w-10 h-10 bg-[#006400] text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-green-900/20">JM</div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 md:p-8 print:p-0 print:overflow-visible custom-scrollbar">
                <div className="max-w-7xl mx-auto print:max-w-none print:mx-0">
                    {dataError && (
                        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm font-medium">
                            {dataError}
                        </div>
                    )}
                    {renderContent()}
                </div>
                <div className="mt-12 pt-6 border-t border-slate-200 text-center text-slate-400 text-xs print:hidden">
                    &copy; 2025 Eastern Samar State University - Supply Office Inventory System
                </div>
            </div>
        </main>
    </div>
  );
}

export default App;
