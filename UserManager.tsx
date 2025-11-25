import React, { useState } from 'react';
import { Users, Plus, Ban, CheckCircle2 } from 'lucide-react';

const UserManager = ({ users, onCreateUser, onUpdateUser }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }
    setError('');
    await onCreateUser({ username, password, role: 'Staff', status: 'Active' }).catch((err: any) => setError(err?.message || 'Failed to create user'));
    setUsername('');
    setPassword('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#006400]" />
        <button onClick={handleCreate} className="px-3 py-2 bg-[#006400] text-white rounded-lg text-sm hover:bg-[#004d00] flex items-center gap-1">
          <Plus size={14} /> Add Staff
        </button>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
        {users.map((u: any) => (
          <div key={u.id} className="p-3 flex items-center justify-between text-sm">
            <div>
              <div className="font-semibold text-slate-800">{u.username}</div>
              <div className="text-slate-500 text-xs">Role: {u.role}</div>
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{u.status}</span>
              {u.status === 'Active' ? (
                <button onClick={() => onUpdateUser(u.id, { status: 'Inactive' })} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded flex items-center gap-1"><Ban size={12} /> Deactivate</button>
              ) : (
                <button onClick={() => onUpdateUser(u.id, { status: 'Active' })} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded flex items-center gap-1"><CheckCircle2 size={12} /> Activate</button>
              )}
            </div>
          </div>
        ))}
        {users.length === 0 && <div className="p-3 text-slate-400 text-sm">No users found.</div>}
      </div>
    </div>
  );
};

export default UserManager;
