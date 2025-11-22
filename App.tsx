
import React, { useState, useMemo } from 'react';
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
  INITIAL_LOGS
} from './constants';
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
  LogEntry
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
  ShieldCheck
} from 'lucide-react';

// --- Utility Functions ---
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const formatDateTime = (dateStr: string) => new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

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

// --- Master Data Configuration Types ---
type FieldType = 'text' | 'number' | 'select';

interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: string }[];
  required?: boolean;
}

interface ModuleConfig {
  title: string;
  fields: FieldConfig[];
  columns: { key: string; label: string; render?: (val: any) => React.ReactNode }[];
}

// --- Helper Components ---

const NavSection = ({ label, children, collapsed }: any) => (
  <div className="mb-4">
    {!collapsed && <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</div>}
    <div className="space-y-1">{children}</div>
  </div>
);

const NavItem = ({ icon, label, active, onClick, collapsed }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors rounded-lg mx-2 w-auto ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-400'}`}>{icon}</span>
    {!collapsed && <span>{label}</span>}
  </button>
);

const StatCard = ({ label, value, subtext, icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
         {React.cloneElement(icon, { className: `w-6 h-6 ${colorClass.replace('bg-', 'text-')}` })}
      </div>
      {subtext && <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{subtext}</span>}
    </div>
    <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</div>
  </div>
);

// --- Custom Simple Bar Chart ---
const StockMovementChart = ({ transactions }: { transactions: Transaction[] }) => {
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(m => ({
      month: m,
      in: Math.floor(Math.random() * 50) + 10,
      out: Math.floor(Math.random() * 40) + 5
    }));
  }, [transactions]);

  const maxVal = Math.max(...chartData.map(d => Math.max(d.in, d.out)));

  return (
    <div className="h-64 flex items-end justify-between gap-2 pt-8">
      {chartData.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group">
          <div className="flex gap-1 w-full justify-center items-end h-full relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
               In: {d.in} | Out: {d.out}
            </div>
            
            <div 
              className="w-3 md:w-6 bg-emerald-500 rounded-t-sm transition-all duration-500 hover:bg-emerald-400" 
              style={{ height: `${(d.in / maxVal) * 100}%` }} 
            />
            <div 
              className="w-3 md:w-6 bg-amber-500 rounded-t-sm transition-all duration-500 hover:bg-amber-400" 
              style={{ height: `${(d.out / maxVal) * 100}%` }} 
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// --- Landing Page Component ---
const LandingPage = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-[#006400] skew-y-[-5deg] origin-top-left transform -translate-y-20 z-0"></div>
      
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500">
        {/* Header Section with ESSU Color */}
        <div className="bg-[#006400] p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10 z-0"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
              <span className="text-4xl font-bold tracking-tighter">ES</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">ESSU Supply Office</h1>
            <p className="text-green-100 text-xs font-medium tracking-widest uppercase opacity-90">Inventory Management System</p>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-8">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4 text-[#006400]">
               <ShieldCheck className="w-10 h-10 opacity-80" strokeWidth={1.5} />
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Digitizing inventory, assets, and audit workflows for Eastern Samar State University.
            </p>
          </div>

          <button 
            onClick={onLogin}
            className="w-full bg-[#006400] hover:bg-green-900 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-green-900/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
          >
            <span>Login to System</span>
            <LogIn className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
         <p className="text-slate-400 text-xs font-medium">&copy; 2025 Eastern Samar State University</p>
         <p className="text-slate-300 text-[10px] mt-1">Supply Office Inventory System v1.0</p>
      </div>
    </div>
  );
};

// --- Dashboard View ---

const DashboardView = ({ 
  assets, 
  transactions, 
  mrs, 
  audits, 
  catalog, 
  onNavigate 
}: any) => {
  
  const metrics = useMemo(() => {
    const activeAssets = assets.filter((a: Asset) => a.status === 'Active').length;
    
    const issuedAssetsCount = mrs
      .filter((m: MemorandumReceipt) => m.status === 'Active')
      .reduce((acc: number, m: MemorandumReceipt) => {
         return acc + m.items.filter(i => !i.returnDate).length;
      }, 0);
      
    const repairRetired = assets.filter((a: Asset) => ['Retired', 'Under Repair'].includes(a.status)).length;
    
    const lastAudit = audits.find((a: AuditSession) => a.status === 'Finalized');
    const shortageValue = lastAudit 
      ? lastAudit.items.reduce((acc: number, i: AuditItem) => i.status === 'Shortage' ? acc + Math.abs(i.shortageOverageValue) : acc, 0)
      : 0;
      
    const lowStockItems = catalog.filter((c: CatalogItem) => 
      c.itemType === 'Consumable' && c.quantity <= (c.reorderPoint || 10)
    );

    return {
      activeAssets,
      issuedAssetsCount,
      repairRetired,
      shortageValue,
      lowStockItems,
      openAudits: audits.filter((a: AuditSession) => a.status === 'Draft').length
    };
  }, [assets, mrs, audits, catalog]);

  const activityFeed = useMemo(() => {
    const feed = [
       ...transactions.map((t: Transaction) => ({
          id: t.id, type: 'Transaction', 
          label: `${t.type} - ${t.transactionId}`, 
          date: t.date, 
          icon: t.type === 'Stock In' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />,
          color: t.type === 'Stock In' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
       })),
       ...audits.map((a: AuditSession) => ({
          id: a.id, type: 'Audit',
          label: `Audit Session: ${a.sessionId}`,
          date: a.createdAt,
          icon: <PackageSearch size={14} />,
          color: 'text-purple-600 bg-purple-50'
       })),
       ...mrs.map((m: MemorandumReceipt) => ({
          id: m.id, type: 'MR',
          label: `MR Issued: ${m.mrNumber}`,
          date: m.dateIssued,
          icon: <ClipboardList size={14} />,
          color: 'text-blue-600 bg-blue-50'
       }))
    ];
    return feed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [transactions, audits, mrs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Registered PPE Assets" 
            value={metrics.activeAssets} 
            subtext="Active in Registry"
            icon={<Monitor />} 
            colorClass="bg-blue-500"
          />
          <StatCard 
            label="Issued Assets" 
            value={metrics.issuedAssetsCount} 
            subtext="Assigned to Employees"
            icon={<UserCircle />} 
            colorClass="bg-emerald-500"
          />
          <StatCard 
            label="Repair / Retired" 
            value={metrics.repairRetired} 
            subtext="Non-Functional"
            icon={<Archive />} 
            colorClass="bg-slate-500"
          />
          <StatCard 
            label="Shortage Value" 
            value={formatCurrency(metrics.shortageValue)} 
            subtext={metrics.openAudits > 0 ? `${metrics.openAudits} Audit In-Progress` : "Last Finalized Audit"}
            icon={<AlertTriangle />} 
            colorClass="bg-red-500"
          />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <div>
                   <h3 className="font-bold text-slate-800">Stock Movement</h3>
                   <p className="text-sm text-slate-500">In vs Out transactions over last 6 months</p>
                </div>
                <div className="flex gap-3 text-xs font-medium">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> Stock In</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-500"></div> Stock Out</div>
                </div>
             </div>
             <StockMovementChart transactions={transactions} />
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => onNavigate('transactions-new')} className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-100 rounded-xl transition-all group">
                   <div className="p-2 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform text-emerald-600"><ArrowDownLeft size={20} /></div>
                   <span className="text-xs font-semibold text-slate-600">Stock In</span>
                </button>
                <button onClick={() => onNavigate('transactions-new')} className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-100 rounded-xl transition-all group">
                   <div className="p-2 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform text-amber-600"><ArrowUpRight size={20} /></div>
                   <span className="text-xs font-semibold text-slate-600">Stock Out</span>
                </button>
                <button onClick={() => onNavigate('asset-new')} className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-100 rounded-xl transition-all group">
                   <div className="p-2 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform text-indigo-600"><Tags size={20} /></div>
                   <span className="text-xs font-semibold text-slate-600">Register Asset</span>
                </button>
                <button onClick={() => onNavigate('mr-new')} className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-100 rounded-xl transition-all group">
                   <div className="p-2 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform text-purple-600"><ClipboardList size={20} /></div>
                   <span className="text-xs font-semibold text-slate-600">Issue MR</span>
                </button>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <AlertCircle className="text-red-500" size={18} /> Low Stock Alerts
                </h3>
                <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded-full">{metrics.lowStockItems.length} items</span>
             </div>
             <div className="flex-1 overflow-y-auto max-h-64 p-0">
                {metrics.lowStockItems.length > 0 ? (
                  <table className="w-full text-sm text-left">
                     <tbody className="divide-y divide-slate-50">
                        {metrics.lowStockItems.slice(0, 5).map((item: CatalogItem) => (
                           <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-6 py-3 font-medium text-slate-700">{item.article}</td>
                              <td className="px-6 py-3 text-slate-500 text-xs">{item.description}</td>
                              <td className="px-6 py-3 text-right font-bold text-red-600">{item.quantity} {item.unit}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">All stock levels are healthy.</div>
                )}
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
             <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <Activity className="text-blue-500" size={18} /> Recent Activity
                </h3>
             </div>
             <div className="flex-1 overflow-y-auto p-0">
                 <div className="divide-y divide-slate-50">
                    {activityFeed.map((item: any) => (
                       <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50">
                          <div className={`p-2 rounded-full ${item.color} shrink-0`}>
                             {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="text-sm font-medium text-slate-800 truncate">{item.label}</div>
                             <div className="text-xs text-slate-500">{formatDate(item.date)}</div>
                          </div>
                       </div>
                    ))}
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const ActivityLogView = ({ logs }: { logs: LogEntry[] }) => {
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('All');
  
  const filteredLogs = logs.filter(log => {
     const matchesSearch = 
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase());
     const matchesModule = filterModule === 'All' || log.module === filterModule;
     return matchesSearch && matchesModule;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleExport = () => {
     exportToCSV(filteredLogs, `Activity_Logs_${new Date().toISOString().split('T')[0]}`);
  }

  const modules = Array.from(new Set(logs.map(l => l.module)));

  return (
     <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-xl font-bold text-slate-800">Activity Logs</h2>
               <p className="text-sm text-slate-500">Audit trail of user actions across the system</p>
            </div>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
               <Download className="w-4 h-4" /> Export CSV
            </button>
         </div>

         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-64">
               <label className="block text-xs font-medium text-slate-700 mb-1">Search Logs</label>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                     className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" 
                     placeholder="Search user, action..."
                     value={search} 
                     onChange={e => setSearch(e.target.value)} 
                  />
               </div>
            </div>
            <div className="w-full md:w-48">
               <label className="block text-xs font-medium text-slate-700 mb-1">Filter Module</label>
               <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={filterModule} onChange={e => setFilterModule(e.target.value)}>
                  <option value="All">All Modules</option>
                  {modules.map(m => <option key={m} value={m}>{m}</option>)}
               </select>
            </div>
         </div>

         <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
                  <tr>
                     <th className="px-6 py-3">Timestamp</th>
                     <th className="px-6 py-3">User</th>
                     <th className="px-6 py-3">Module</th>
                     <th className="px-6 py-3">Action</th>
                     <th className="px-6 py-3">Details</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map(log => (
                     <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-mono text-xs">{formatDateTime(log.timestamp)}</td>
                        <td className="px-6 py-4">
                           <div className="font-medium text-slate-800">{log.user}</div>
                           <div className="text-xs text-slate-500">{log.role}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{log.module}</td>
                        <td className="px-6 py-4 font-medium text-blue-600">{log.action}</td>
                        <td className="px-6 py-4 text-slate-600">{log.details}</td>
                     </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                     <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No logs found matching your criteria.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
     </div>
  );
};


const ReportLayout = ({ title, children, onBack, onExportCSV, onPrint }: any) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <button onClick={onBack} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
        <Undo2 size={20} className="text-slate-500" />
      </button>
      <h1 className="text-xl font-bold text-slate-800">{title}</h1>
      <div className="ml-auto flex gap-2">
        <button onClick={onExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
          <Download className="w-4 h-4" /> Export CSV
        </button>
        <button onClick={onPrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>
    </div>
    {children}
  </div>
);

const PPEInventoryReport = ({ assets, departments, locations, categories, onBack }: any) => {
  const [filterDept, setFilterDept] = useState('All');
  const [filterLoc, setFilterLoc] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredData = useMemo(() => {
    return assets.filter((a: Asset) => {
      if (filterDept !== 'All' && a.departmentId !== filterDept) return false;
      if (filterLoc !== 'All' && a.locationId !== filterLoc) return false;
      if (filterStatus !== 'All' && a.status !== filterStatus) return false;
      return true;
    });
  }, [assets, filterDept, filterLoc, filterStatus]);

  const totalValue = filteredData.reduce((sum: number, a: Asset) => sum + a.unitValue, 0);

  const handleExport = () => {
    const exportData = filteredData.map((a: Asset) => ({
       PropertyNo: a.propertyNumber,
       Description: a.description,
       DateAcquired: a.dateAcquired,
       UnitValue: a.unitValue,
       Status: a.status,
       Department: departments.find((d: Department) => d.id === a.departmentId)?.code || '',
       Location: locations.find((l: Location) => l.id === a.locationId)?.name || ''
    }));
    exportToCSV(exportData, `PPE_Report_${new Date().toISOString().split('T')[0]}`);
  };

  const handlePrint = () => window.print();

  return (
    <ReportLayout title="PPE Inventory Report" onBack={onBack} onExportCSV={handleExport} onPrint={handlePrint}>
       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end no-print">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
            <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
              <option value="All">All Departments</option>
              {departments.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
            <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={filterLoc} onChange={e => setFilterLoc(e.target.value)}>
              <option value="All">All Locations</option>
              {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
            <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Retired">Retired</option>
              <option value="Missing">Missing</option>
            </select>
          </div>
       </div>

       <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden print-border-none">
          <div className="hidden print:block p-4 text-center font-bold text-lg uppercase">PPE Inventory Report</div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Property No</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Acquired</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredData.map((a: Asset) => (
                 <tr key={a.id}>
                    <td className="px-6 py-4 font-mono text-xs">{a.propertyNumber}</td>
                    <td className="px-6 py-4">{a.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(a.dateAcquired)}</td>
                    <td className="px-6 py-4">{departments.find((d: Department) => d.id === a.departmentId)?.code}</td>
                    <td className="px-6 py-4 text-xs font-medium uppercase">{a.status}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(a.unitValue)}</td>
                 </tr>
               ))}
               <tr className="bg-slate-50 font-bold">
                 <td colSpan={5} className="px-6 py-4 text-right uppercase">Total Asset Value</td>
                 <td className="px-6 py-4 text-right">{formatCurrency(totalValue)}</td>
               </tr>
            </tbody>
          </table>
       </div>
    </ReportLayout>
  );
};

const ConsumableReport = ({ catalog, transactions, onBack }: any) => {
  const consumables = catalog.filter((c: CatalogItem) => c.itemType === 'Consumable');
  const [search, setSearch] = useState('');
  
  // Calculate movement
  const reportData = useMemo(() => {
     return consumables.filter((c: CatalogItem) => c.article.toLowerCase().includes(search.toLowerCase())).map((c: CatalogItem) => {
        const relevantTxItems = transactions.flatMap((t: Transaction) => 
           t.items.filter(ti => ti.catalogItemId === c.id).map(ti => ({ ...ti, type: t.type }))
        );
        
        const totalIn = relevantTxItems.filter((i: any) => i.type === 'Stock In').reduce((acc: number, i: any) => acc + i.quantity, 0);
        const totalOut = relevantTxItems.filter((i: any) => i.type === 'Stock Out').reduce((acc: number, i: any) => acc + i.quantity, 0);

        return {
          ...c,
          totalIn,
          totalOut,
          balance: c.quantity
        };
     });
  }, [consumables, transactions, search]);

  const handleExport = () => {
    const exportData = reportData.map((r: any) => ({
      Item: r.article,
      Description: r.description,
      Unit: r.unit,
      TotalIn: r.totalIn,
      TotalOut: r.totalOut,
      Balance: r.balance
    }));
    exportToCSV(exportData, 'Consumable_Stock_Report');
  };

  return (
    <ReportLayout title="Consumable Stock Report" onBack={onBack} onExportCSV={handleExport} onPrint={() => window.print()}>
       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-end no-print">
          <div className="w-64">
            <label className="block text-xs font-medium text-slate-700 mb-1">Search Item</label>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" 
                  placeholder="e.g. Bond Paper"
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
               />
            </div>
          </div>
       </div>
       
       <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
               <tr>
                 <th className="px-6 py-3">Item Name</th>
                 <th className="px-6 py-3">Description</th>
                 <th className="px-6 py-3 text-center">Unit</th>
                 <th className="px-6 py-3 text-center">Total Stock In</th>
                 <th className="px-6 py-3 text-center">Total Stock Out</th>
                 <th className="px-6 py-3 text-center font-bold text-slate-800">Current Balance</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {reportData.map((r: any) => (
                  <tr key={r.id}>
                     <td className="px-6 py-4 font-medium text-slate-800">{r.article}</td>
                     <td className="px-6 py-4 text-slate-600">{r.description}</td>
                     <td className="px-6 py-4 text-center text-xs uppercase">{r.unit}</td>
                     <td className="px-6 py-4 text-center text-emerald-600 font-medium">+{r.totalIn}</td>
                     <td className="px-6 py-4 text-center text-amber-600 font-medium">-{r.totalOut}</td>
                     <td className="px-6 py-4 text-center font-bold text-blue-700 bg-blue-50">{r.balance}</td>
                  </tr>
               ))}
            </tbody>
          </table>
       </div>
    </ReportLayout>
  );
};

const StockMovementReport = ({ transactions, catalog, departments, onBack }: any) => {
   const [filterType, setFilterType] = useState('All');
   const [filterDept, setFilterDept] = useState('All');
   
   const flatTransactions = useMemo(() => {
      return transactions.flatMap((t: Transaction) => 
         t.items.map(item => ({
            ...item,
            txDate: t.date,
            txId: t.transactionId,
            txType: t.type,
            txDept: t.departmentId,
            itemName: catalog.find((c: CatalogItem) => c.id === item.catalogItemId)?.article || 'Unknown'
         }))
      ).filter((row: any) => {
         if (filterType !== 'All' && row.txType !== filterType) return false;
         if (filterDept !== 'All' && row.txDept !== filterDept) return false;
         return true;
      });
   }, [transactions, catalog, filterType, filterDept]);

   const handleExport = () => {
      const exportData = flatTransactions.map((r: any) => ({
         TxID: r.txId,
         Date: r.txDate,
         Type: r.txType,
         Department: departments.find((d: Department) => d.id === r.txDept)?.code || '',
         Item: r.itemName,
         Quantity: r.quantity,
         Remarks: r.remarks
      }));
      exportToCSV(exportData, 'Stock_Movement_Report');
   }

   return (
      <ReportLayout title="Stock Movement Report" onBack={onBack} onExportCSV={handleExport} onPrint={() => window.print()}>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4 items-end no-print">
            <div>
               <label className="block text-xs font-medium text-slate-700 mb-1">Transaction Type</label>
               <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="All">All Types</option>
                  <option value="Stock In">Stock In</option>
                  <option value="Stock Out">Stock Out</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
               <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                  <option value="All">All Departments</option>
                  {departments.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
               </select>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
                  <tr>
                     <th className="px-6 py-3">Date</th>
                     <th className="px-6 py-3">Tx ID</th>
                     <th className="px-6 py-3">Type</th>
                     <th className="px-6 py-3">Department</th>
                     <th className="px-6 py-3">Item</th>
                     <th className="px-6 py-3 text-center">Qty</th>
                     <th className="px-6 py-3">Remarks</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {flatTransactions.map((row: any, idx: number) => (
                     <tr key={idx}>
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{formatDate(row.txDate)}</td>
                        <td className="px-6 py-4 font-mono text-xs">{row.txId}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.txType === 'Stock In' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {row.txType}
                           </span>
                        </td>
                        <td className="px-6 py-4">{departments.find((d: Department) => d.id === row.txDept)?.code || '-'}</td>
                        <td className="px-6 py-4 font-medium">{row.itemName}</td>
                        <td className="px-6 py-4 text-center font-medium">{row.quantity}</td>
                        <td className="px-6 py-4 text-slate-500 italic">{row.remarks}</td>
                     </tr>
                  ))}
               </tbody>
             </table>
          </div>
      </ReportLayout>
   );
};

const ReportsModule = ({ assets, departments, locations, categories, catalog, transactions, audits }: any) => {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  if (activeReport === 'ppe') return <PPEInventoryReport assets={assets} departments={departments} locations={locations} categories={categories} onBack={() => setActiveReport(null)} />;
  if (activeReport === 'consumable') return <ConsumableReport catalog={catalog} transactions={transactions} onBack={() => setActiveReport(null)} />;
  if (activeReport === 'movement') return <StockMovementReport transactions={transactions} catalog={catalog} departments={departments} onBack={() => setActiveReport(null)} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div onClick={() => setActiveReport('ppe')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all group">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform"><Monitor size={24} /></div>
          <h3 className="font-bold text-slate-800 mb-2">PPE Inventory Report</h3>
          <p className="text-sm text-slate-500">Detailed list of all Property, Plant, and Equipment by department and location.</p>
       </div>
       <div onClick={() => setActiveReport('consumable')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all group">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform"><Archive size={24} /></div>
          <h3 className="font-bold text-slate-800 mb-2">Consumable Stock Report</h3>
          <p className="text-sm text-slate-500">Current stock levels, total in/out movements for supplies and consumables.</p>
       </div>
       <div onClick={() => setActiveReport('movement')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all group">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform"><ArrowRightLeft size={24} /></div>
          <h3 className="font-bold text-slate-800 mb-2">Stock Movement Report</h3>
          <p className="text-sm text-slate-500">History of all stock transactions (in/out) filtered by date and type.</p>
       </div>
    </div>
  );
};

const StockTransactionForm = ({ departments, locations, catalog, employees, onCancel, onSave }: any) => {
  const [transactionId] = useState(`TXN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('Stock In');
  const [departmentId, setDepartmentId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [qty, setQty] = useState(1);
  const [itemRemarks, setItemRemarks] = useState('');
  const [itemCustodian, setItemCustodian] = useState('');

  const catalogItem = catalog.find((c: CatalogItem) => c.id === selectedCatalogId);
  
  const handleAddItem = () => {
     if (!selectedCatalogId || qty <= 0) return;
     
     // Validate Stock Out quantity
     if (type === 'Stock Out' && catalogItem) {
        if (qty > catalogItem.quantity) {
           alert(`Insufficient stock! Only ${catalogItem.quantity} available.`);
           return;
        }
     }

     const newItem: TransactionItem = {
        id: generateId(),
        catalogItemId: selectedCatalogId,
        quantity: qty,
        remarks: itemRemarks,
        custodianId: itemCustodian
     };
     
     setItems([...items, newItem]);
     setSelectedCatalogId('');
     setQty(1);
     setItemRemarks('');
     setItemCustodian('');
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const handleSave = () => {
     if (!departmentId || items.length === 0) {
        alert('Please select a department and add at least one item.');
        return;
     }

     const tx: Transaction = {
        id: generateId(),
        transactionId,
        date,
        type,
        departmentId,
        items,
        status: 'Completed',
        remarks,
        createdBy: 'Admin',
        createdAt: new Date().toISOString()
     };
     
     onSave(tx);
  };

  // Filter for Consumables only as per rules
  const consumableItems = catalog.filter((c: CatalogItem) => c.itemType === 'Consumable' && c.status === 'Active');

  return (
     <div className="max-w-4xl mx-auto">
         <div className="flex items-center gap-2 mb-6 text-slate-500 text-sm">
            <button onClick={onCancel} className="hover:text-blue-600">Stock Transactions</button>
            <ChevronRight size={14} />
            <span className="font-medium text-slate-800">New Transaction</span>
         </div>

         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100">
               <h2 className="font-semibold text-lg text-slate-800">New Stock Transaction</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Transaction Type</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={type} onChange={e => { setType(e.target.value as TransactionType); setItems([]); }}>
                     <option value="Stock In">Stock In (Receiving)</option>
                     <option value="Stock Out">Stock Out (Issuance)</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={date} onChange={e => setDate(e.target.value)} />
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Department (Source/Destination)</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
                     <option value="">Select Department...</option>
                     {departments.filter((d: Department) => d.status === 'Active').map((d: Department) => (
                        <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">General Remarks</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional notes..." />
               </div>
            </div>
         </div>

         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-end gap-3">
               <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Select Consumable Item</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={selectedCatalogId} onChange={e => setSelectedCatalogId(e.target.value)}>
                     <option value="">Search Item...</option>
                     {consumableItems.map((c: CatalogItem) => (
                        <option key={c.id} value={c.id}>{c.article} ({c.quantity} on hand)</option>
                     ))}
                  </select>
               </div>
               <div className="w-24">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Qty</label>
                  <input type="number" min="1" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={qty} onChange={e => setQty(parseInt(e.target.value))} />
               </div>
                <div className="w-48">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Item Remarks</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={itemRemarks} onChange={e => setItemRemarks(e.target.value)} placeholder="Details..." />
               </div>
               <button onClick={handleAddItem} disabled={!selectedCatalogId} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">Add</button>
            </div>
            
            <table className="w-full text-left text-sm">
               <thead className="text-slate-500 border-b border-slate-100">
                  <tr>
                     <th className="px-6 py-3">Item</th>
                     <th className="px-6 py-3 text-center">Qty</th>
                     <th className="px-6 py-3">Remarks</th>
                     <th className="px-6 py-3"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {items.map(item => {
                     const catItem = catalog.find((c: CatalogItem) => c.id === item.catalogItemId);
                     return (
                        <tr key={item.id}>
                           <td className="px-6 py-3 font-medium">{catItem?.article}</td>
                           <td className="px-6 py-3 text-center">{item.quantity}</td>
                           <td className="px-6 py-3 text-slate-500">{item.remarks}</td>
                           <td className="px-6 py-3 text-right"><button onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14}/></button></td>
                        </tr>
                     )
                  })}
                  {items.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No items added yet.</td></tr>}
               </tbody>
            </table>
         </div>

         <div className="flex justify-end gap-3 mt-6">
             <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
             <button onClick={handleSave} disabled={items.length === 0 || !departmentId} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">Submit Transaction</button>
         </div>
     </div>
  )
}

// --- Consumables Catalog View Component (Redesigned) ---
const ConsumablesCatalogView = ({ catalog, setCatalog, categories, funds, onLog }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'article', direction: 'asc' });
  
  const [formData, setFormData] = useState<Partial<CatalogItem>>({
    article: '',
    description: '',
    unit: 'pc',
    itemType: 'Consumable',
    categoryId: '',
    fundClusterId: '',
    unitValue: 0,
    quantity: 0,
    reorderPoint: 10,
    status: 'Active'
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Standardized Units
  const UNIT_OPTIONS = ['pc', 'box', 'ream', 'bottle', 'set', 'roll', 'pack', 'can', 'meter', 'liter', 'pad', 'cartridge'];

  const handleSave = () => {
    // Validation
    if (!formData.article || !formData.unit || !formData.categoryId) {
       alert('Please fill in all required fields (Item Name, Unit, Category).');
       return;
    }

    // Unique Name Check
    const duplicate = catalog.find((c: CatalogItem) => 
      c.itemType === 'Consumable' && 
      c.status === 'Active' && 
      c.article.toLowerCase() === formData.article?.toLowerCase() && 
      c.id !== editingId
    );

    if (duplicate) {
      alert('An active consumable item with this name already exists. Please use a unique name.');
      return;
    }

    if (editingId) {
       setCatalog((prev: CatalogItem[]) => prev.map(item => item.id === editingId ? { ...item, ...formData } : item));
       onLog('Updated Consumable', 'Consumables', `Updated item ${formData.article}`);
    } else {
       const newItem = { ...formData, id: generateId(), quantity: 0 }; // Initial On Hand is 0 (System Calculated)
       setCatalog((prev: CatalogItem[]) => [...prev, newItem]);
       onLog('Created Consumable', 'Consumables', `Created item ${formData.article}`);
    }
    setIsModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      article: '', 
      description: '', 
      unit: 'pc', 
      itemType: 'Consumable', 
      categoryId: '', 
      fundClusterId: '', 
      unitValue: 0, 
      quantity: 0, 
      reorderPoint: 10, 
      status: 'Active' 
    });
  };

  const handleEdit = (item: CatalogItem) => {
    setFormData(item);
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to deactivate this item? It will be hidden from transaction selections.')) {
       setCatalog((prev: CatalogItem[]) => prev.map(item => item.id === id ? { ...item, status: 'Inactive' } : item));
       onLog('Deactivated Consumable', 'Consumables', `Deactivated item ID ${id}`);
    }
  };

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    let data = catalog.filter((item: CatalogItem) => {
       // Strict Filter: Only Consumables
       if (item.itemType !== 'Consumable') return false;

       const matchesSearch = item.article.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
       const matchesCategory = filterCategory === 'All' || item.categoryId === filterCategory;
       const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
       return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sorting
    data.sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [catalog, searchTerm, filterCategory, filterStatus, sortConfig]);

  const handleExport = () => {
    const exportData = filteredData.map((c: CatalogItem) => ({
      ItemName: c.article,
      Description: c.description,
      Category: categories.find((cat: AssetCategory) => cat.id === c.categoryId)?.name || '',
      Unit: c.unit,
      OnHand: c.quantity,
      ReorderPoint: c.reorderPoint,
      Status: c.status
    }));
    exportToCSV(exportData, 'Consumables_Master_List');
  };

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center">
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                   className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none w-64" 
                   placeholder="Search Item Name..."
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="All">All Categories</option>
                {categories.filter((c:AssetCategory) => c.type === 'Consumable').map((c: AssetCategory) => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
              <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
             </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
                <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={() => { setEditingId(null); resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
               <Plus className="w-4 h-4" /> Add Consumable
            </button>
          </div>
       </div>

       <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                   <th className="px-6 py-3 cursor-pointer hover:text-blue-600" onClick={() => handleSort('article')}>Item Name <ArrowUpDown className="inline w-3 h-3 ml-1"/></th>
                   <th className="px-6 py-3">Category</th>
                   <th className="px-6 py-3">Unit</th>
                   <th className="px-6 py-3 text-center cursor-pointer hover:text-blue-600" onClick={() => handleSort('quantity')}>On Hand <ArrowUpDown className="inline w-3 h-3 ml-1"/></th>
                   <th className="px-6 py-3 text-center">Reorder Level</th>
                   <th className="px-6 py-3 text-center">Status</th>
                   <th className="px-6 py-3 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {filteredData.map((item: CatalogItem) => {
                   const isLowStock = item.quantity <= (item.reorderPoint || 0) && item.status === 'Active';
                   return (
                   <tr key={item.id} className={`hover:bg-slate-50 ${item.status === 'Inactive' ? 'opacity-50 bg-slate-50' : ''}`}>
                      <td className="px-6 py-4">
                         <div className="font-medium text-slate-800">{item.article}</div>
                         {item.description && <div className="text-xs text-slate-500 truncate max-w-xs" title={item.description}>{item.description}</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{categories.find((c: AssetCategory) => c.id === item.categoryId)?.name}</td>
                      <td className="px-6 py-4 text-slate-600 uppercase text-xs">{item.unit}</td>
                      <td className="px-6 py-4 text-center font-medium">
                        <div className={`flex items-center justify-center gap-1 ${isLowStock ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                          {isLowStock && <AlertCircle className="w-3 h-3" />}
                          {item.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 text-xs">{item.reorderPoint || '-'}</td>
                      <td className="px-6 py-4 text-center">
                         {item.status === 'Active' ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Active</span> : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">Inactive</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-blue-600 mx-1" title="Edit"><Pencil className="w-4 h-4" /></button>
                         {item.status === 'Active' && <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600 mx-1" title="Deactivate"><Trash2 className="w-4 h-4" /></button>}
                      </td>
                   </tr>
                )})}
                {filteredData.length === 0 && (
                   <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No consumable items found.</td></tr>
                )}
             </tbody>
          </table>
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="font-semibold text-slate-800">{editingId ? 'Edit Consumable' : 'New Consumable Item'}</h3>
                   <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Item Name *</label>
                      <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" value={formData.article} onChange={e => setFormData({...formData, article: e.target.value})} placeholder="e.g. Bond Paper A4" />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Description (Specs)</label>
                      <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brand, Size, Color, etc." rows={2} />
                   </div>
                   
                   {/* Hidden Item Type - Always Consumable */}
                   
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Category *</label>
                      <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                         <option value="">Select Category...</option>
                         {categories.filter((c:AssetCategory) => c.type === 'Consumable').map((c: AssetCategory) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Unit of Measurement *</label>
                      <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                         {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Fund Cluster (Optional)</label>
                      <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500" value={formData.fundClusterId} onChange={e => setFormData({...formData, fundClusterId: e.target.value})}>
                         <option value="">Select Fund...</option>
                         {funds.map((f: FundCluster) => <option key={f.id} value={f.id}>{f.code} - {f.description}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Reorder Threshold</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" value={formData.reorderPoint} onChange={e => setFormData({...formData, reorderPoint: parseFloat(e.target.value)})} />
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Unit Value (Cost)</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" value={formData.unitValue} onChange={e => setFormData({...formData, unitValue: parseFloat(e.target.value)})} />
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                      <div className="flex items-center gap-4 mt-2">
                         <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="radio" name="status" value="Active" checked={formData.status === 'Active'} onChange={() => setFormData({...formData, status: 'Active'})} /> Active
                         </label>
                         <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="radio" name="status" value="Inactive" checked={formData.status === 'Inactive'} onChange={() => setFormData({...formData, status: 'Inactive'})} /> Inactive
                         </label>
                      </div>
                   </div>
                   
                   <div className="md:col-span-2 mt-2 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700">
                        <strong>Note:</strong> "On Hand" quantity is not editable here. It is automatically calculated based on Stock In and Stock Out transactions.
                      </p>
                   </div>

                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
                   <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                   <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Item</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

// --- PPE Catalog View Component ---
const PPECatalogView = ({ catalog, setCatalog, categories, funds, onLog }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [formData, setFormData] = useState<Partial<CatalogItem>>({
    article: '',
    description: '',
    unit: 'unit',
    itemType: 'PPE',
    categoryId: '',
    fundClusterId: '',
    unitValue: 0,
    quantity: 0,
    reorderPoint: 0,
    status: 'Active'
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Standardized Units
  const UNIT_OPTIONS = ['unit', 'pc', 'box', 'ream', 'bottle', 'set', 'roll', 'pack', 'can', 'meter', 'lot'];

  const handleSave = () => {
    if (!formData.article || !formData.description || !formData.categoryId || !formData.fundClusterId || !formData.unit) {
       alert('Please fill in all required fields.');
       return;
    }

    if (editingId) {
       setCatalog((prev: CatalogItem[]) => prev.map(item => item.id === editingId ? { ...item, ...formData } : item));
       onLog('Updated Catalog Item', 'PPE Catalog', `Updated item ${formData.article}`);
    } else {
       const newItem = { ...formData, id: generateId(), quantity: 0 }; // Initial Quantity is 0
       setCatalog((prev: CatalogItem[]) => [...prev, newItem]);
       onLog('Created Catalog Item', 'PPE Catalog', `Created item ${formData.article}`);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ article: '', description: '', unit: 'unit', itemType: 'PPE', categoryId: '', fundClusterId: '', unitValue: 0, quantity: 0, reorderPoint: 0, status: 'Active' });
  };

  const handleEdit = (item: CatalogItem) => {
    setFormData(item);
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item? It will be marked as inactive.')) {
       setCatalog((prev: CatalogItem[]) => prev.map(item => item.id === id ? { ...item, status: 'Inactive' } : item));
       onLog('Deactivated Catalog Item', 'PPE Catalog', `Deactivated item ID ${id}`);
    }
  };

  const filteredData = useMemo(() => {
    return catalog.filter((item: CatalogItem) => {
       const matchesSearch = item.article.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
       const matchesType = filterType === 'All' || item.itemType === filterType;
       const matchesCategory = filterCategory === 'All' || item.categoryId === filterCategory;
       const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
       return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
  }, [catalog, searchTerm, filterType, filterCategory, filterStatus]);

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center">
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                   className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none w-64" 
                   placeholder="Search Article or Description..."
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="All">All Types</option>
                <option value="PPE">PPE</option>
                <option value="Consumable">Consumable</option>
             </select>
             <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="All">All Categories</option>
                {categories.map((c: AssetCategory) => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
              <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
             </select>
          </div>
          <button onClick={() => { setEditingId(null); setFormData({ article: '', description: '', unit: 'unit', itemType: 'PPE', categoryId: '', fundClusterId: '', unitValue: 0, quantity: 0, reorderPoint: 0, status: 'Active' }); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
             <Plus className="w-4 h-4" /> Add Item
          </button>
       </div>

       <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                   <th className="px-6 py-3">Article</th>
                   <th className="px-6 py-3">Type</th>
                   <th className="px-6 py-3">Category</th>
                   <th className="px-6 py-3">Unit</th>
                   <th className="px-6 py-3 text-center">On Hand</th>
                   <th className="px-6 py-3 text-center">Reorder</th>
                   <th className="px-6 py-3 text-center">Active</th>
                   <th className="px-6 py-3 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {filteredData.map((item: CatalogItem) => (
                   <tr key={item.id} className={`hover:bg-slate-50 ${item.status === 'Inactive' ? 'opacity-50 bg-slate-50' : ''}`}>
                      <td className="px-6 py-4">
                         <div className="font-medium text-slate-800">{item.article}</div>
                         <div className="text-xs text-slate-500 truncate max-w-xs">{item.description}</div>
                      </td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${item.itemType === 'PPE' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.itemType}</span></td>
                      <td className="px-6 py-4 text-slate-600">{categories.find((c: AssetCategory) => c.id === item.categoryId)?.name}</td>
                      <td className="px-6 py-4 text-slate-600">{item.unit}</td>
                      <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                      <td className="px-6 py-4 text-center text-slate-500">{item.reorderPoint || '-'}</td>
                      <td className="px-6 py-4 text-center">
                         {item.status === 'Active' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-400 mx-auto" />}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-blue-600 mx-1"><Pencil className="w-4 h-4" /></button>
                         {item.status === 'Active' && <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600 mx-1"><Trash2 className="w-4 h-4" /></button>}
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="font-semibold text-slate-800">{editingId ? 'Edit Catalog Item' : 'New Catalog Item'}</h3>
                   <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Article (Name) *</label>
                      <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={formData.article} onChange={e => setFormData({...formData, article: e.target.value})} />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Description (Specs) *</label>
                      <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Item Type *</label>
                      <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={formData.itemType} onChange={e => setFormData({...formData, itemType: e.target.value as 'PPE' | 'Consumable'})}>
                         <option value="PPE">PPE</option>
                         <option value="Consumable">Consumable</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Category *</label>
                      <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                         <option value="">Select Category...</option>
                         {categories.map((c: AssetCategory) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Unit of Measurement *</label>
                      <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                         {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Fund Cluster *</label>
                      <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none" value={formData.fundClusterId} onChange={e => setFormData({...formData, fundClusterId: e.target.value})}>
                         <option value="">Select Fund...</option>
                         {funds.map((f: FundCluster) => <option key={f.id} value={f.id}>{f.code} - {f.description}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Unit Value (Standard Cost)</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={formData.unitValue} onChange={e => setFormData({...formData, unitValue: parseFloat(e.target.value)})} />
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Reorder Threshold (Optional)</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={formData.reorderPoint} onChange={e => setFormData({...formData, reorderPoint: parseFloat(e.target.value)})} />
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                      <div className="flex items-center gap-4 mt-2">
                         <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input type="radio" name="status" value="Active" checked={formData.status === 'Active'} onChange={() => setFormData({...formData, status: 'Active'})} /> Active
                         </label>
                         <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input type="radio" name="status" value="Inactive" checked={formData.status === 'Inactive'} onChange={() => setFormData({...formData, status: 'Inactive'})} /> Inactive
                         </label>
                      </div>
                   </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
                   <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                   <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Item</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

const AssetForm = ({ asset, catalog, employees, departments, locations, funds, onSave, onCancel }: any) => {
   const [formData, setFormData] = useState<Partial<Asset>>(
    asset || {
      propertyNumber: '',
      quantity: 1,
      dateAcquired: new Date().toISOString().split('T')[0],
      status: 'Active',
      unitValue: 0
    }
  );

  const handleCatalogChange = (catalogId: string) => {
    const item = catalog.find((c: CatalogItem) => c.id === catalogId);
    setFormData(prev => ({
      ...prev,
      catalogItemId: catalogId,
      description: item ? item.description : '',
      fundClusterId: item ? item.fundClusterId : prev.fundClusterId, // Auto-populate fund
      unitValue: item ? item.unitValue : prev.unitValue // Auto-populate cost
    }));
  };

  const isValid = formData.propertyNumber && formData.catalogItemId && formData.unitValue && formData.departmentId && formData.fundClusterId && formData.locationId;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6 text-slate-500 text-sm">
        <button onClick={onCancel} className="hover:text-blue-600">Asset Registry</button>
        <ChevronRight size={14} />
        <span className="font-medium text-slate-800">{asset ? 'Edit Asset' : 'New Asset Registration'}</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Property Number *</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm" value={formData.propertyNumber} onChange={e => setFormData({...formData, propertyNumber: e.target.value})} />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">PPE Item (Catalog) *</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm bg-white" value={formData.catalogItemId || ''} onChange={e => handleCatalogChange(e.target.value)}>
                   <option value="">Select Item...</option>
                   {catalog.filter((c: CatalogItem) => c.itemType === 'PPE' && c.status === 'Active').map((c: CatalogItem) => <option key={c.id} value={c.id}>{c.article}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Unit Value *</label>
                <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm" value={formData.unitValue} onChange={e => setFormData({...formData, unitValue: parseFloat(e.target.value)})} />
            </div>
             <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date Acquired</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm" value={formData.dateAcquired} onChange={e => setFormData({...formData, dateAcquired: e.target.value})} />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Fund Cluster *</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm bg-white" value={formData.fundClusterId || ''} onChange={e => setFormData({...formData, fundClusterId: e.target.value})}>
                   <option value="">Select Fund...</option>
                   {funds.filter((f: FundCluster) => f.status === 'Active').map((f: FundCluster) => <option key={f.id} value={f.id}>{f.code} - {f.description}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Department *</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm bg-white" value={formData.departmentId || ''} onChange={e => setFormData({...formData, departmentId: e.target.value})}>
                   <option value="">Select Department...</option>
                   {departments.filter((d: Department) => d.status === 'Active').map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Location *</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm bg-white" value={formData.locationId || ''} onChange={e => setFormData({...formData, locationId: e.target.value})}>
                   <option value="">Select Location...</option>
                   {locations.filter((l: Location) => l.status === 'Active').map((l: Location) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Custodian (Optional)</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm bg-white" value={formData.custodianId || ''} onChange={e => setFormData({...formData, custodianId: e.target.value})}>
                   <option value="">Select Employee...</option>
                   {employees.filter((e: Employee) => e.status === 'Active').map((e: Employee) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
           <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
           <button onClick={() => isValid && onSave(formData)} disabled={!isValid} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">Save Asset</button>
        </div>
      </div>
    </div>
  );
};

const MasterDataView = ({ title, data, setData, config, hiddenFields, onLog }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = () => {
    const newItem = { ...formData, id: generateId(), ...hiddenFields };
    setData([...data, newItem]);
    if(onLog) onLog('Created Record', `Master Data - ${title}`, `Created ${newItem[config.fields[0].name] || 'record'}`);
    setIsModalOpen(false);
    setFormData({});
  };

  const filteredData = data.filter((item: any) => 
     Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none w-64 focus:border-blue-500" 
              placeholder={`Search ${title}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add {config.title}
         </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
             <tr>
                {config.columns.map((col: any) => <th key={col.key} className="px-6 py-3">{col.label}</th>)}
                <th className="px-6 py-3 text-right">Actions</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {filteredData.map((item: any) => (
               <tr key={item.id} className="hover:bg-slate-50">
                  {config.columns.map((col: any) => (
                    <td key={col.key} className="px-6 py-4">
                      {col.render ? col.render(item[col.key]) : item[col.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                     <button className="text-slate-400 hover:text-blue-600 mx-1"><Pencil className="w-4 h-4" /></button>
                     <button className="text-slate-400 hover:text-red-600 mx-1"><Trash2 className="w-4 h-4" /></button>
                  </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-semibold text-slate-800">New {config.title}</h3>
                 <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                 {config.fields.map((field: FieldConfig) => (
                    <div key={field.name}>
                       <label className="block text-xs font-medium text-slate-700 mb-1">{field.label} {field.required && '*'}</label>
                       {field.type === 'select' ? (
                          <select 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                            value={formData[field.name] || ''}
                            onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                          >
                             <option value="">Select...</option>
                             {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                       ) : (
                          <input 
                            type={field.type} 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                            value={formData[field.name] || ''}
                            onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                          />
                       )}
                    </div>
                 ))}
              </div>
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                 <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Record</button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

const AuditList = ({ sessions, departments, onNew, onView }: any) => (
   <div className="space-y-4">
      <div className="flex justify-end">
         <button onClick={onNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Audit Session
         </button>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
               <tr>
                  <th className="px-6 py-3">Session ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {sessions.map((s: AuditSession) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                     <td className="px-6 py-4 font-mono text-xs">{s.sessionId}</td>
                     <td className="px-6 py-4">{formatDate(s.date)}</td>
                     <td className="px-6 py-4">{s.description}</td>
                     <td className="px-6 py-4">{departments.find((d: Department) => d.id === s.departmentId)?.code || 'All'}</td>
                     <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'Finalized' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{s.status}</span></td>
                     <td className="px-6 py-4 text-right"><button onClick={() => onView(s)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">View</button></td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   </div>
);

const CreateAuditModal = ({ departments, locations, onClose, onCreate }: any) => {
   const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], departmentId: '', locationId: '', description: '' });
   return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
         <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-semibold text-slate-800">New Audit Session</h3>
               <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
               <div><label className="block text-xs font-medium text-slate-700 mb-1">Date</label><input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
               <div><label className="block text-xs font-medium text-slate-700 mb-1">Target Department</label><select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})}><option value="">All Departments</option>{departments.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
               <div><label className="block text-xs font-medium text-slate-700 mb-1">Specific Location (Optional)</label><select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})}><option value="">All Locations</option>{locations.map((l: Location) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
               <div><label className="block text-xs font-medium text-slate-700 mb-1">Description</label><input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button><button onClick={() => onCreate(formData)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Start Session</button></div>
         </div>
      </div>
   );
};

const AuditDetail = ({ session, onUpdate, onFinalize, onBack, departments }: any) => {
   const handleCount = (itemId: string, count: number) => {
      const updatedItems = session.items.map((item: AuditItem) => {
         if (item.assetId === itemId) {
            const actualQty = count;
            const diff = actualQty - item.systemQty;
            let status: AuditStatus = 'Matched';
            if (diff < 0) status = 'Shortage';
            if (diff > 0) status = 'Overage';
            return { ...item, actualQty, shortageOverageQty: diff, shortageOverageValue: diff * item.unitValue, status };
         }
         return item;
      });
      onUpdate({ ...session, items: updatedItems });
   };
   
   return (
     <div className="space-y-6">
        <div className="flex justify-between items-start">
           <div>
              <button onClick={onBack} className="text-slate-500 hover:text-blue-600 text-sm mb-2 flex items-center gap-1"><ChevronLeft size={14}/> Back to Sessions</button>
              <h1 className="text-xl font-bold text-slate-800">{session.description}</h1>
              <div className="text-sm text-slate-500 mt-1">{session.sessionId} • {formatDate(session.date)} • {departments.find((d: Department) => d.id === session.departmentId)?.name || 'All Departments'}</div>
           </div>
           {session.status === 'Draft' && (
              <button onClick={onFinalize} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 shadow-sm">Finalize Audit</button>
           )}
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
           <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
                 <tr>
                    <th className="px-6 py-3">Property No</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Location / Custodian</th>
                    <th className="px-6 py-3 text-center">System Qty</th>
                    <th className="px-6 py-3 text-center">Actual Qty</th>
                    <th className="px-6 py-3 text-center">Variance</th>
                    <th className="px-6 py-3">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {session.items.map((item: AuditItem) => (
                    <tr key={item.assetId} className="hover:bg-slate-50">
                       <td className="px-6 py-4 font-mono text-xs">{item.propertyNumber}</td>
                       <td className="px-6 py-4"><div className="font-medium text-slate-800">{item.description}</div></td>
                       <td className="px-6 py-4"><div className="text-xs text-slate-500">{item.locationName}</div><div className="text-xs text-slate-400">{item.custodianName}</div></td>
                       <td className="px-6 py-4 text-center">{item.systemQty}</td>
                       <td className="px-6 py-4 text-center">
                          {session.status === 'Draft' ? (
                             <input type="number" min="0" className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-sm" value={item.actualQty ?? ''} onChange={(e) => handleCount(item.assetId, parseInt(e.target.value) || 0)} />
                          ) : (
                             <span className="font-bold">{item.actualQty}</span>
                          )}
                       </td>
                       <td className="px-6 py-4 text-center text-slate-500">{item.shortageOverageQty > 0 ? `+${item.shortageOverageQty}` : item.shortageOverageQty}</td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium 
                             ${item.status === 'Matched' ? 'bg-emerald-100 text-emerald-700' : 
                               item.status === 'Shortage' ? 'bg-red-100 text-red-700' : 
                               item.status === 'Overage' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                             {item.status}
                          </span>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
     </div>
   );
};

const StockTransactionList = ({ transactions, departments, onNew, onView }: any) => (
   <div className="space-y-4">
      <div className="flex justify-end">
         <button onClick={onNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Transaction
         </button>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
               <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {transactions.map((t: Transaction) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                     <td className="px-6 py-4 font-mono text-xs">{t.transactionId}</td>
                     <td className="px-6 py-4">{formatDate(t.date)}</td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === 'Stock In' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{t.type}</span>
                     </td>
                     <td className="px-6 py-4">{departments.find((d: Department) => d.id === t.departmentId)?.code}</td>
                     <td className="px-6 py-4 text-slate-500">{t.items.length} items</td>
                     <td className="px-6 py-4 text-right"><button onClick={() => onView(t)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">View Details</button></td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   </div>
);

const StockTransactionDetail = ({ transaction, departments, catalog, employees, onBack }: any) => (
   <div className="space-y-6">
      <button onClick={onBack} className="text-slate-500 hover:text-blue-600 text-sm flex items-center gap-1"><ChevronLeft size={14}/> Back to List</button>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <div className="flex justify-between items-start mb-6">
            <div>
               <h1 className="text-2xl font-bold text-slate-800">{transaction.transactionId}</h1>
               <p className="text-slate-500">{transaction.type} • {formatDate(transaction.date)}</p>
            </div>
            <div className="text-right">
               <div className="text-sm font-semibold text-slate-700">Department: {departments.find((d: Department) => d.id === transaction.departmentId)?.name}</div>
               <div className="text-xs text-slate-500">Created by: {transaction.createdBy}</div>
            </div>
         </div>
         
         <table className="w-full text-left text-sm border-t border-slate-100">
            <thead className="text-slate-500 text-xs uppercase">
               <tr>
                  <th className="py-3">Item</th>
                  <th className="py-3 text-center">Quantity</th>
                  <th className="py-3">Remarks</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {transaction.items.map((item: TransactionItem) => (
                  <tr key={item.id}>
                     <td className="py-3 font-medium">{catalog.find((c: CatalogItem) => c.id === item.catalogItemId)?.article}</td>
                     <td className="py-3 text-center">{item.quantity}</td>
                     <td className="py-3 text-slate-500">{item.remarks}</td>
                  </tr>
               ))}
            </tbody>
         </table>
         
         {transaction.remarks && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
               <span className="font-bold">Notes:</span> {transaction.remarks}
            </div>
         )}
      </div>
   </div>
);

const AssetRegistryList = ({ assets, departments, employees, catalog, onNew, onView }: any) => (
   <div className="space-y-4">
      <div className="flex justify-between items-center">
         <h2 className="text-lg font-bold text-slate-800">Asset Registry</h2>
         <button onClick={onNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Register Asset
         </button>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
               <tr>
                  <th className="px-6 py-3">Property No</th>
                  <th className="px-6 py-3">Article</th>
                  <th className="px-6 py-3">Date Acquired</th>
                  <th className="px-6 py-3">Custodian</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Value</th>
                  <th className="px-6 py-3"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {assets.map((a: Asset) => (
                  <tr key={a.id} className="hover:bg-slate-50 group cursor-pointer" onClick={() => onView(a)}>
                     <td className="px-6 py-4 font-mono text-xs font-medium text-blue-600">{a.propertyNumber}</td>
                     <td className="px-6 py-4 font-medium">{catalog.find((c: CatalogItem) => c.id === a.catalogItemId)?.article}</td>
                     <td className="px-6 py-4 text-slate-500">{formatDate(a.dateAcquired)}</td>
                     <td className="px-6 py-4">{employees.find((e: Employee) => e.id === a.custodianId)?.name || '-'}</td>
                     <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${a.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{a.status}</span></td>
                     <td className="px-6 py-4 text-right">{formatCurrency(a.unitValue)}</td>
                     <td className="px-6 py-4 text-right"><ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" /></td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   </div>
);

const AssetDetail = ({ asset, catalog, employees, departments, locations, funds, onBack, onEdit, onRetire }: any) => {
   const item = catalog.find((c: CatalogItem) => c.id === asset.catalogItemId);
   return (
      <div className="space-y-6">
         <button onClick={onBack} className="text-slate-500 hover:text-blue-600 text-sm flex items-center gap-1"><ChevronLeft size={14}/> Back to Registry</button>
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
               <div>
                  <h1 className="text-2xl font-bold text-slate-800">{item?.article}</h1>
                  <p className="text-slate-500 text-sm">{asset.propertyNumber}</p>
               </div>
               <div className="flex gap-2">
                  <button onClick={onEdit} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">Edit</button>
                  {asset.status === 'Active' && <button onClick={onRetire} className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 text-sm font-medium rounded-lg hover:bg-red-100">Retire</button>}
               </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
               <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Asset Information</h3>
                  <div className="space-y-3 text-sm">
                     <div className="flex justify-between"><span className="text-slate-500">Description</span> <span className="font-medium text-right max-w-[60%]">{asset.description}</span></div>
                     <div className="flex justify-between"><span className="text-slate-500">Unit Value</span> <span className="font-medium">{formatCurrency(asset.unitValue)}</span></div>
                     <div className="flex justify-between"><span className="text-slate-500">Date Acquired</span> <span className="font-medium">{formatDate(asset.dateAcquired)}</span></div>
                     <div className="flex justify-between"><span className="text-slate-500">Fund Cluster</span> <span className="font-medium">{funds.find((f: FundCluster) => f.id === asset.fundClusterId)?.code}</span></div>
                  </div>
               </div>
               <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Assignment & Location</h3>
                  <div className="space-y-3 text-sm">
                     <div className="flex justify-between"><span className="text-slate-500">Department</span> <span className="font-medium">{departments.find((d: Department) => d.id === asset.departmentId)?.name}</span></div>
                     <div className="flex justify-between"><span className="text-slate-500">Location</span> <span className="font-medium">{locations.find((l: Location) => l.id === asset.locationId)?.name}</span></div>
                     <div className="flex justify-between"><span className="text-slate-500">Custodian</span> <span className="font-medium">{employees.find((e: Employee) => e.id === asset.custodianId)?.name || 'Unassigned'}</span></div>
                     <div className="flex justify-between"><span className="text-slate-500">Status</span> <span className={`font-medium ${asset.status === 'Active' ? 'text-emerald-600' : 'text-red-600'}`}>{asset.status}</span></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

const MRListView = ({ mrs, employees, departments, onNew, onView }: any) => (
   <div className="space-y-4">
      <div className="flex justify-end">
         <button onClick={onNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Issue MR
         </button>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
               <tr>
                  <th className="px-6 py-3">MR Number</th>
                  <th className="px-6 py-3">Date Issued</th>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {mrs.map((mr: MemorandumReceipt) => (
                  <tr key={mr.id} className="hover:bg-slate-50">
                     <td className="px-6 py-4 font-mono text-xs font-medium">{mr.mrNumber}</td>
                     <td className="px-6 py-4">{formatDate(mr.dateIssued)}</td>
                     <td className="px-6 py-4 font-medium">{employees.find((e: Employee) => e.id === mr.employeeId)?.name}</td>
                     <td className="px-6 py-4">{departments.find((d: Department) => d.id === mr.departmentId)?.code}</td>
                     <td className="px-6 py-4">{mr.items.length} items</td>
                     <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${mr.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{mr.status}</span></td>
                     <td className="px-6 py-4 text-right"><button onClick={() => onView(mr)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">View</button></td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   </div>
);

const MRForm = ({ employees, departments, assets, mrs, onSave, onCancel }: any) => {
   const [mrNumber] = useState(`MR-${new Date().getFullYear()}-${String(mrs.length + 1).padStart(3, '0')}`);
   const [dateIssued, setDateIssued] = useState(new Date().toISOString().split('T')[0]);
   const [employeeId, setEmployeeId] = useState('');
   const [selectedAssetId, setSelectedAssetId] = useState('');
   const [items, setItems] = useState<any[]>([]);

   const availableAssets = assets.filter((a: Asset) => a.status === 'Active' && !a.custodianId && !items.find(i => i.assetId === a.id));

   const handleAddItem = () => {
      const asset = assets.find((a: Asset) => a.id === selectedAssetId);
      if (asset) {
         setItems([...items, { assetId: asset.id, propertyNumber: asset.propertyNumber, description: asset.description, unitValue: asset.unitValue }]);
         setSelectedAssetId('');
      }
   };

   const handleSubmit = () => {
      if (!employeeId || items.length === 0) return;
      const employee = employees.find((e: Employee) => e.id === employeeId);
      const newMR: MemorandumReceipt = {
         id: generateId(),
         mrNumber,
         dateIssued,
         employeeId,
         departmentId: employee?.departmentId || '',
         items,
         status: 'Active'
      };
      onSave(newMR, items.map(i => i.assetId));
   };

   return (
      <div className="max-w-3xl mx-auto">
         <div className="flex items-center gap-2 mb-6 text-slate-500 text-sm"><button onClick={onCancel}>MR List</button> <ChevronRight size={14} /> <span className="font-medium text-slate-800">New MR</span></div>
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 grid grid-cols-2 gap-6">
            <div><label className="block text-xs font-medium text-slate-700 mb-1">MR Number</label><input disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={mrNumber} /></div>
            <div><label className="block text-xs font-medium text-slate-700 mb-1">Date Issued</label><input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={dateIssued} onChange={e => setDateIssued(e.target.value)} /></div>
            <div className="col-span-2"><label className="block text-xs font-medium text-slate-700 mb-1">Employee</label><select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={employeeId} onChange={e => setEmployeeId(e.target.value)}><option value="">Select Employee...</option>{employees.filter((e: Employee) => e.status === 'Active').map((e: Employee) => <option key={e.id} value={e.id}>{e.name} - {departments.find((d: Department) => d.id === e.departmentId)?.code}</option>)}</select></div>
         </div>
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-3">
               <select className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" value={selectedAssetId} onChange={e => setSelectedAssetId(e.target.value)}><option value="">Select Asset to Issue...</option>{availableAssets.map((a: Asset) => <option key={a.id} value={a.id}>{a.propertyNumber} - {a.description}</option>)}</select>
               <button onClick={handleAddItem} disabled={!selectedAssetId} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">Add Asset</button>
            </div>
            <table className="w-full text-left text-sm">
               <thead className="text-slate-500 border-b border-slate-100"><tr><th className="px-6 py-3">Property No</th><th className="px-6 py-3">Description</th><th className="px-6 py-3 text-right">Value</th><th className="px-6 py-3"></th></tr></thead>
               <tbody className="divide-y divide-slate-50">
                  {items.map(item => (
                     <tr key={item.assetId}>
                        <td className="px-6 py-3 font-mono text-xs">{item.propertyNumber}</td>
                        <td className="px-6 py-3">{item.description}</td>
                        <td className="px-6 py-3 text-right">{formatCurrency(item.unitValue)}</td>
                        <td className="px-6 py-3 text-right"><button onClick={() => setItems(items.filter(i => i.assetId !== item.assetId))} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14}/></button></td>
                     </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No assets added.</td></tr>}
               </tbody>
            </table>
         </div>
         <div className="flex justify-end gap-3 mt-6"><button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button><button onClick={handleSubmit} disabled={!employeeId || items.length === 0} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">Issue MR</button></div>
      </div>
   );
};

const MRDetail = ({ mr, employees, departments, onReturnItem, onBack }: any) => {
   const employee = employees.find((e: Employee) => e.id === mr.employeeId);
   const dept = departments.find((d: Department) => d.id === mr.departmentId);
   return (
      <div className="space-y-6">
         <button onClick={onBack} className="text-slate-500 hover:text-blue-600 text-sm flex items-center gap-1"><ChevronLeft size={14}/> Back to List</button>
         <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-center mb-8">
               <h1 className="text-xl font-bold text-slate-800 uppercase">Memorandum Receipt for Equipment, Semi-Expendable and Non-Expendable Property</h1>
               <p className="text-sm text-slate-500 mt-2">MR Number: {mr.mrNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
               <div><span className="text-slate-500 block mb-1">Received From:</span><div className="font-medium">Supply Office</div></div>
               <div><span className="text-slate-500 block mb-1">Received By:</span><div className="font-medium">{employee?.name}</div><div className="text-slate-500 text-xs">{employee?.position}, {dept?.name}</div></div>
               <div><span className="text-slate-500 block mb-1">Date Issued:</span><div className="font-medium">{formatDate(mr.dateIssued)}</div></div>
            </div>
            <table className="w-full text-left text-sm border border-slate-200 mb-8">
               <thead className="bg-slate-50 border-b border-slate-200"><tr><th className="px-4 py-2 border-r border-slate-200">Qty</th><th className="px-4 py-2 border-r border-slate-200">Unit</th><th className="px-4 py-2 border-r border-slate-200">Description</th><th className="px-4 py-2 border-r border-slate-200">Property No</th><th className="px-4 py-2 border-r border-slate-200">Unit Cost</th><th className="px-4 py-2">Action</th></tr></thead>
               <tbody className="divide-y divide-slate-200">
                  {mr.items.map((item: MRItem) => (
                     <tr key={item.assetId}>
                        <td className="px-4 py-2 border-r border-slate-200 text-center">1</td>
                        <td className="px-4 py-2 border-r border-slate-200 text-center">Unit</td>
                        <td className="px-4 py-2 border-r border-slate-200">{item.description}</td>
                        <td className="px-4 py-2 border-r border-slate-200 font-mono text-xs">{item.propertyNumber}</td>
                        <td className="px-4 py-2 border-r border-slate-200 text-right">{formatCurrency(item.unitValue)}</td>
                        <td className="px-4 py-2 text-center">
                           {item.returnDate ? (
                              <span className="text-xs font-medium text-slate-500">Returned {formatDate(item.returnDate)}</span>
                           ) : (
                              <button onClick={() => onReturnItem(mr.id, item.assetId)} className="text-xs text-blue-600 hover:underline">Return</button>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            <div className="text-xs text-slate-500 text-center mt-12">System Generated Document</div>
         </div>
      </div>
   );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // --- Data States ---
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [funds, setFunds] = useState<FundCluster[]>(INITIAL_FUNDS);
  const [categories, setCategories] = useState<AssetCategory[]>(INITIAL_CATEGORIES);
  const [catalog, setCatalog] = useState<CatalogItem[]>(INITIAL_CATALOG);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // --- Asset Registry State ---
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // --- MR State ---
  const [mrs, setMrs] = useState<MemorandumReceipt[]>(INITIAL_MRS);
  const [selectedMr, setSelectedMr] = useState<MemorandumReceipt | null>(null);

  // --- Audit State ---
  const [audits, setAudits] = useState<AuditSession[]>(INITIAL_AUDITS);
  const [selectedAudit, setSelectedAudit] = useState<AuditSession | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  
  // --- Activity Log State ---
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // --- Shared Logic ---
  const triggerSave = () => {
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const logAction = (action: string, module: string, details: string) => {
     const newLog: LogEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        user: 'Jeffrey Meneses',
        role: 'Admin Officer V',
        action,
        module,
        details
     };
     setLogs(prev => [newLog, ...prev]);
  }

  const handleSaveTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
    setCatalog(prevCatalog => prevCatalog.map(item => {
       const txItem = newTransaction.items.find(t => t.catalogItemId === item.id);
       if (txItem) {
           const qtyChange = newTransaction.type === 'Stock In' ? txItem.quantity : -txItem.quantity;
           return { ...item, quantity: item.quantity + qtyChange };
       }
       return item;
    }));
    logAction('Created Transaction', 'Stock Transactions', `${newTransaction.type} - ${newTransaction.transactionId}`);
    triggerSave();
    setViewState('transactions-list');
  };

  const handleSaveAsset = (assetData: Partial<Asset>) => {
    if (assetData.id) {
      // Edit
      setAssets(prev => prev.map(a => a.id === assetData.id ? { ...a, ...assetData } as Asset : a));
      logAction('Updated Asset', 'Asset Registry', `Updated details for ${assetData.propertyNumber}`);
    } else {
      // New
      const newAsset = { ...assetData, id: generateId() } as Asset;
      setAssets(prev => [...prev, newAsset]);
      logAction('Registered Asset', 'Asset Registry', `Registered new asset ${newAsset.propertyNumber}`);
    }
    triggerSave();
    setViewState('asset-registry');
  };

  const handleRetireAsset = (assetId: string) => {
    if (confirm('Are you sure you want to retire this asset? It will be marked as inactive.')) {
      const asset = assets.find(a => a.id === assetId);
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'Retired' } : a));
      logAction('Retired Asset', 'Asset Registry', `Retired asset ${asset?.propertyNumber}`);
      triggerSave();
      setViewState('asset-registry');
    }
  };

  // --- MR Logic ---
  const handleSaveMR = (newMR: MemorandumReceipt, assetIds: string[]) => {
    setMrs(prev => [newMR, ...prev]);
    setAssets(prev => prev.map(a => {
      if (assetIds.includes(a.id)) {
        return { ...a, custodianId: newMR.employeeId };
      }
      return a;
    }));
    logAction('Issued MR', 'Memorandum Receipt', `Issued MR ${newMR.mrNumber} with ${newMR.items.length} items`);
    triggerSave();
    setViewState('mr-list');
  };

  const handleReturnItem = (mrId: string, assetId: string) => {
    if (confirm('Mark this item as returned? This will release the asset back to the supply pool.')) {
      const mr = mrs.find(m => m.id === mrId);
      const item = mr?.items.find(i => i.assetId === assetId);
      
      setMrs(prev => prev.map(mr => {
        if (mr.id === mrId) {
          const updatedItems = mr.items.map(item => {
            if (item.assetId === assetId) {
              return { ...item, returnDate: new Date().toISOString().split('T')[0] };
            }
            return item;
          });
          const allReturned = updatedItems.every(i => !!i.returnDate);
          return { ...mr, items: updatedItems, status: allReturned ? 'Closed' : 'Active' };
        }
        return mr;
      }));
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, custodianId: '' } : a));
      logAction('Returned Item', 'Memorandum Receipt', `Item ${item?.propertyNumber} returned from MR ${mr?.mrNumber}`);
      triggerSave();
    }
  };

  // --- Audit Logic ---
  const handleCreateAudit = ({ date, departmentId, locationId, description }: any) => {
    const sessionItems: AuditItem[] = assets
      .filter(a => a.status === 'Active')
      .filter(a => !departmentId || a.departmentId === departmentId)
      .filter(a => !locationId || a.locationId === locationId)
      .map(a => {
         const loc = locations.find(l => l.id === a.locationId);
         const emp = employees.find(e => e.id === a.custodianId);
         return {
           assetId: a.id,
           propertyNumber: a.propertyNumber,
           description: a.description,
           unitValue: a.unitValue,
           systemQty: a.quantity,
           actualQty: null, // Start uncounted
           shortageOverageQty: 0,
           shortageOverageValue: 0,
           status: 'Uncounted',
           locationName: loc?.name || 'Unassigned',
           custodianName: emp?.name || 'Unassigned'
         };
      });

    const newSession: AuditSession = {
      id: generateId(),
      sessionId: `PC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      date,
      departmentId,
      locationId,
      description,
      items: sessionItems,
      status: 'Draft',
      createdBy: 'Admin',
      createdAt: new Date().toISOString()
    };

    setAudits([newSession, ...audits]);
    logAction('Created Session', 'Physical Count', `Started audit session ${newSession.sessionId}`);
    setIsAuditModalOpen(false);
    setSelectedAudit(newSession);
    setViewState('audit-detail');
    triggerSave();
  };

  const handleUpdateAudit = (updatedSession: AuditSession) => {
     setAudits(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
     setSelectedAudit(updatedSession);
     triggerSave();
  };

  const handleFinalizeAudit = () => {
    if (!selectedAudit) return;
    if (confirm('Finalize this audit session? This will lock the records and cannot be undone.')) {
       const finalized = { ...selectedAudit, status: 'Finalized' as AuditSessionStatus, finalizedAt: new Date().toISOString() };
       handleUpdateAudit(finalized);
       logAction('Finalized Session', 'Physical Count', `Finalized audit ${selectedAudit.sessionId}`);
    }
  };

  const renderContent = () => {
    switch(viewState) {
      case 'dashboard':
        return (
          <DashboardView 
             assets={assets} 
             transactions={transactions} 
             mrs={mrs} 
             audits={audits}
             catalog={catalog}
             onNavigate={setViewState}
          />
        );
      
      case 'activity-logs':
         return <ActivityLogView logs={logs} />;
         
      // --- Audit Views ---
      case 'audit-list':
        return (
          <>
            <AuditList 
              sessions={audits} 
              departments={departments} 
              onNew={() => setIsAuditModalOpen(true)} 
              onView={(s: AuditSession) => { setSelectedAudit(s); setViewState('audit-detail'); }}
            />
            {isAuditModalOpen && (
              <CreateAuditModal 
                departments={departments} 
                locations={locations} 
                assets={assets} 
                onClose={() => setIsAuditModalOpen(false)} 
                onCreate={handleCreateAudit} 
              />
            )}
          </>
        );
      case 'audit-detail':
        return selectedAudit ? (
          <AuditDetail 
             session={selectedAudit} 
             onUpdate={handleUpdateAudit} 
             onFinalize={handleFinalizeAudit}
             onBack={() => setViewState('audit-list')}
             departments={departments}
          />
        ) : <div/>;

      case 'transactions-list':
        return (
          <StockTransactionList 
            transactions={transactions} 
            departments={departments}
            onNew={() => setViewState('transactions-new')}
            onView={(tx: Transaction) => { setSelectedTransaction(tx); setViewState('transactions-detail'); }}
            setTransactions={setTransactions}
          />
        );
      case 'transactions-new':
        return (
          <StockTransactionForm 
            departments={departments}
            locations={locations}
            catalog={catalog}
            employees={employees}
            onCancel={() => setViewState('transactions-list')}
            onSave={handleSaveTransaction}
          />
        );
      case 'transactions-detail':
        return selectedTransaction ? (
          <StockTransactionDetail 
             transaction={selectedTransaction}
             departments={departments}
             catalog={catalog}
             employees={employees}
             onBack={() => setViewState('transactions-list')}
          />
        ) : <div/>;
      case 'asset-registry':
        return (
          <AssetRegistryList 
            assets={assets} 
            departments={departments}
            employees={employees}
            catalog={catalog}
            onNew={() => { setSelectedAsset(null); setViewState('asset-new'); }}
            onView={(asset: Asset) => { setSelectedAsset(asset); setViewState('asset-detail'); }}
          />
        );
      case 'asset-new':
        return (
          <AssetForm 
             asset={selectedAsset}
             catalog={catalog}
             employees={employees}
             departments={departments}
             locations={locations}
             funds={funds}
             onSave={handleSaveAsset}
             onCancel={() => setViewState('asset-registry')}
          />
        );
      case 'asset-detail':
        return selectedAsset ? (
          <AssetDetail 
            asset={selectedAsset}
            catalog={catalog}
            employees={employees}
            departments={departments}
            locations={locations}
            funds={funds}
            onBack={() => setViewState('asset-registry')}
            onEdit={() => { setViewState('asset-new'); }}
            onRetire={() => handleRetireAsset(selectedAsset.id)}
          />
        ) : <div/>;
      case 'mr-list':
        return (
          <MRListView 
            mrs={mrs} 
            employees={employees} 
            departments={departments} 
            onNew={() => setViewState('mr-new')} 
            onView={(mr: MemorandumReceipt) => { setSelectedMr(mr); setViewState('mr-detail'); }} 
          />
        );
      case 'mr-new':
        return (
          <MRForm 
            employees={employees}
            departments={departments}
            assets={assets}
            mrs={mrs}
            onSave={handleSaveMR}
            onCancel={() => setViewState('mr-list')}
          />
        );
      case 'mr-detail':
        return selectedMr ? (
          <MRDetail 
            mr={selectedMr}
            employees={employees}
            departments={departments}
            onReturnItem={handleReturnItem}
            onBack={() => setViewState('mr-list')}
          />
        ) : <div/>;
      case 'reports':
         return (
            <ReportsModule 
               assets={assets} 
               departments={departments} 
               locations={locations} 
               categories={categories} 
               catalog={catalog} 
               transactions={transactions} 
               audits={audits} 
            />
         );
      case 'mdm-departments':
        return (
          <MasterDataView 
            title="Departments" 
            data={departments} 
            setData={setDepartments}
            onLog={logAction}
            config={{
              title: 'Department',
              fields: [
                { name: 'code', label: 'Code', type: 'text', required: true },
                { name: 'name', label: 'Department Name', type: 'text', required: true },
                { name: 'status', label: 'Status', type: 'select', options: [{label: 'Active', value: 'Active'}, {label: 'Inactive', value: 'Inactive'}], required: true }
              ],
              columns: [
                { key: 'code', label: 'Code' },
                { key: 'name', label: 'Name' },
              ]
            }}
          />
        );
      case 'mdm-employees':
        return (
           <MasterDataView 
              title="Employees" 
              data={employees} 
              setData={setEmployees} 
              onLog={logAction} 
              config={{ 
                 title: 'Employee', 
                 fields: [
                    {name: 'name', label: 'Name', type: 'text', required: true},
                    {name: 'employeeId', label: 'Employee ID', type: 'text', required: true},
                    {name: 'position', label: 'Position', type: 'text'},
                    {name: 'departmentId', label: 'Department', type: 'select', options: departments.map((d: Department) => ({label: d.name, value: d.id})), required: true},
                    {name: 'status', label: 'Status', type: 'select', options: [{label: 'Active', value: 'Active'}, {label: 'Inactive', value: 'Inactive'}]}
                 ], 
                 columns: [
                    {key: 'employeeId', label: 'ID'}, 
                    {key: 'name', label: 'Name'},
                    {key: 'departmentId', label: 'Department', render: (val: string) => departments.find((d: Department) => d.id === val)?.code}
                 ] 
              }} 
           />
        );
      case 'mdm-locations':
        return <MasterDataView title="Locations" data={locations} setData={setLocations} onLog={logAction} config={{ title: 'Location', fields: [{name: 'name', label: 'Name', type: 'text'}, {name: 'building', label: 'Building', type: 'text'}], columns: [{key: 'name', label: 'Name'}, {key: 'building', label: 'Building'}] }} />
      case 'mdm-funds':
         return <MasterDataView title="Fund Clusters" data={funds} setData={setFunds} onLog={logAction} config={{ title: 'Fund Cluster', fields: [{name: 'code', label: 'Code', type: 'text'}, {name: 'description', label: 'Description', type: 'text'}], columns: [{key: 'code', label: 'Code'}, {key: 'description', label: 'Description'}] }} />
      case 'mdm-categories':
         return <MasterDataView title="Asset Categories" data={categories} setData={setCategories} onLog={logAction} config={{ title: 'Category', fields: [{name: 'name', label: 'Name', type: 'text'}, {name: 'code', label: 'Code', type: 'text'}], columns: [{key: 'name', label: 'Name'}, {key: 'type', label: 'Type'}] }} />
      case 'mdm-ppe':
         return (
           <PPECatalogView 
              catalog={catalog} 
              setCatalog={setCatalog} 
              categories={categories} 
              funds={funds}
              onLog={logAction}
           />
         );
      case 'mdm-consumables':
         return (
           <ConsumablesCatalogView
              catalog={catalog} 
              setCatalog={setCatalog} 
              categories={categories} 
              funds={funds}
              onLog={logAction}
           />
         );

      default:
        return (
           <DashboardView 
             assets={assets} 
             transactions={transactions} 
             mrs={mrs} 
             audits={audits}
             catalog={catalog}
             onNavigate={setViewState}
          />
        );
    }
  };

  // --- Auth Check ---
  if (!isAuthenticated) {
     return <LandingPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-20 overflow-y-auto no-print`}>
        <div className="h-16 flex items-center justify-center border-b border-slate-800 shrink-0">
          {isSidebarOpen ? (
            <div className="font-bold text-xl tracking-tight">ESSU <span className="text-blue-400">Supply</span></div>
          ) : (
            <div className="font-bold text-xl">ES</div>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavSection label="Main" collapsed={!isSidebarOpen}>
            <NavItem 
              icon={<LayoutDashboard />} 
              label="Dashboard" 
              active={viewState === 'dashboard'} 
              onClick={() => setViewState('dashboard')} 
              collapsed={!isSidebarOpen} 
            />
            <NavItem 
              icon={<Monitor />} 
              label="Asset Registry" 
              active={viewState.startsWith('asset')} 
              onClick={() => setViewState('asset-registry')} 
              collapsed={!isSidebarOpen} 
            />
             <NavItem 
              icon={<ClipboardList />} 
              label="Memorandum Receipt" 
              active={viewState.startsWith('mr')} 
              onClick={() => setViewState('mr-list')} 
              collapsed={!isSidebarOpen} 
            />
            <NavItem 
              icon={<ArrowRightLeft />} 
              label="Stock Transactions" 
              active={viewState.startsWith('transactions')} 
              onClick={() => setViewState('transactions-list')} 
              collapsed={!isSidebarOpen} 
            />
            <NavItem 
              icon={<PackageSearch />} 
              label="Physical Count" 
              active={viewState.startsWith('audit')} 
              onClick={() => setViewState('audit-list')} 
              collapsed={!isSidebarOpen} 
            />
             <NavItem 
              icon={<FileText />} 
              label="Reports" 
              active={viewState === 'reports'} 
              onClick={() => setViewState('reports')} 
              collapsed={!isSidebarOpen} 
            />
          </NavSection>

          <NavSection label="Master Data" collapsed={!isSidebarOpen}>
            <NavItem icon={<Database />} label="Departments" active={viewState === 'mdm-departments'} onClick={() => setViewState('mdm-departments')} collapsed={!isSidebarOpen} />
            <NavItem icon={<Users />} label="Employees" active={viewState === 'mdm-employees'} onClick={() => setViewState('mdm-employees')} collapsed={!isSidebarOpen} />
            <NavItem icon={<MapPin />} label="Locations" active={viewState === 'mdm-locations'} onClick={() => setViewState('mdm-locations')} collapsed={!isSidebarOpen} />
            <NavItem icon={<Wallet />} label="Fund Clusters" active={viewState === 'mdm-funds'} onClick={() => setViewState('mdm-funds')} collapsed={!isSidebarOpen} />
            <NavItem icon={<Tags />} label="Asset Categories" active={viewState === 'mdm-categories'} onClick={() => setViewState('mdm-categories')} collapsed={!isSidebarOpen} />
            <NavItem icon={<Box />} label="PPE Catalog" active={viewState === 'mdm-ppe'} onClick={() => setViewState('mdm-ppe')} collapsed={!isSidebarOpen} />
            <NavItem icon={<Archive />} label="Consumables" active={viewState === 'mdm-consumables'} onClick={() => setViewState('mdm-consumables')} collapsed={!isSidebarOpen} />
          </NavSection>
          
          <NavSection label="System" collapsed={!isSidebarOpen}>
             <NavItem icon={<History />} label="Activity Logs" active={viewState === 'activity-logs'} onClick={() => setViewState('activity-logs')} collapsed={!isSidebarOpen} />
             <NavItem icon={<Settings />} label="Settings" active={viewState === 'settings'} onClick={() => setViewState('settings')} collapsed={!isSidebarOpen} />
          </NavSection>
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">JM</div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <div className="text-sm font-medium truncate">Jeffrey Meneses</div>
                <div className="text-xs text-slate-400 truncate">Admin Officer V</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-6 flex items-center justify-between shadow-sm no-print">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">
                {viewState === 'dashboard' && 'Supply Office Dashboard'}
                {viewState === 'audit-list' && 'Physical Count Sessions'}
                {viewState === 'audit-detail' && 'Audit Worksheet'}
                {viewState.startsWith('mdm') && 'Master Data Management'}
                {viewState === 'transactions-list' && 'Stock Transactions'}
                {viewState === 'transactions-new' && 'New Stock Transaction'}
                {viewState === 'transactions-detail' && 'Transaction Details'}
                {viewState === 'asset-registry' && 'Asset Registry'}
                {viewState === 'asset-new' && 'Asset Registration'}
                {viewState === 'asset-detail' && 'Asset Details'}
                {viewState === 'mr-list' && 'Memorandum Receipts'}
                {viewState === 'mr-new' && 'New Memorandum Receipt'}
                {viewState === 'mr-detail' && 'MR Details'}
                {viewState === 'reports' && 'Generated Reports'}
                {viewState === 'activity-logs' && 'System Activity Logs'}
                {viewState === 'settings' && 'System Settings'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-6">
           {renderContent()}
        </div>
      </main>

      {/* Notification Toast */}
      {showSaveNotification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50 no-print">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="font-medium text-sm">Operation Successful</p>
            <p className="text-xs text-slate-400">System updated at {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
