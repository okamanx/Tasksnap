import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, tasks: 0, applications: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [view, setView] = useState('overview'); // 'overview' | 'users'

  useEffect(() => {
    fetchMetrics();
    fetchTasks();
    fetchUsers();
  }, []);

  async function fetchMetrics() {
    try {
      // Profiles count
      const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      // Tasks count
      const { count: tCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
      // Applications count
      const { count: aCount } = await supabase.from('applications').select('*', { count: 'exact', head: true });
      
      setStats({ users: uCount || 0, tasks: tCount || 0, applications: aCount || 0 });
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*, profiles:created_by(name)').order('created_at', { ascending: false }).limit(10);
    if (data) setRecentTasks(data);
  }

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setAllUsers(data);
  }

  function handleLogout() {
    localStorage.removeItem('tasksnap_admin_key');
    navigate('/admin/login');
  }

  function handleDeleteTask(taskId) {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      window.alert('[Superuser Required] Simulating aggressive deletion for demo purposes.');
      setRecentTasks(prev => prev.filter(t => t.id !== taskId));
      setStats(prev => ({ ...prev, tasks: prev.tasks - 1 }));
    }
  }

  function handleDeleteUser(userId) {
    if (window.confirm('Are you sure you want to permanently ban this user target?')) {
      window.alert('[Superuser Required] Simulating user account termination for demo purposes.');
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, users: prev.users - 1 }));
    }
  }

  function handleResetPassword(userId) {
    const newPass = window.prompt('Enter new override password for this user ID:');
    if (newPass) {
      window.alert(`[Superuser Required] Password hypothetically overridden to [${newPass}] using simulated Admin API payload.`);
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-950 flex flex-col md:flex-row text-zinc-300 font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col sticky top-0 md:h-dvh shrink-0">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">database</span>
            </div>
            <strong className="text-white font-bold tracking-tight">Admin System</strong>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => setView('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${view === 'overview' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span> Platform Analytics
          </button>
          <button 
            onClick={() => setView('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${view === 'users' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <span className="material-symbols-outlined text-[20px]">group</span> User Registry
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
            Exit Admin <span className="material-symbols-outlined text-[16px]">logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-dvh">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            {view === 'overview' ? 'Platform Command Center' : 'User Registry'}
          </h1>
          <p className="text-zinc-400">Manage and monitor your live production database securely.</p>
        </header>

        {view === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Users</span>
                <div className="text-4xl font-extrabold text-white mt-2">{stats.users}</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Tasks</span>
                <div className="text-4xl font-extrabold text-white mt-2">{stats.tasks}</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Applications</span>
                <div className="text-4xl font-extrabold text-white mt-2">{stats.applications}</div>
              </div>
            </div>

            {/* Task Feed */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                <h3 className="font-bold text-white tracking-tight">Live Task Feed (Last 10)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] uppercase text-zinc-500 bg-zinc-900/30 font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Task Title</th>
                      <th className="px-6 py-3">Creator</th>
                      <th className="px-6 py-3">Budget</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {recentTasks.map(t => (
                      <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-white truncate max-w-[200px]">{t.title}</td>
                        <td className="px-6 py-4 text-zinc-400">{t.profiles?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 font-mono text-zinc-300">₹{t.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${t.status === 'open' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleDeleteTask(t.id)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors" title="Delete Task">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {recentTasks.length === 0 && (
                      <tr><td colSpan="5" className="px-6 py-8 text-center text-zinc-500">No tasks currently posted.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {view === 'users' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h3 className="font-bold text-white tracking-tight">Active User Database</h3>
                <span className="text-xs text-zinc-500 font-bold">Showing last 50</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] uppercase text-zinc-500 bg-zinc-900/30 font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-3">User ID</th>
                      <th className="px-6 py-3">Full Name</th>
                      <th className="px-6 py-3">Role Status</th>
                      <th className="px-6 py-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {allUsers.map(u => (
                      <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-6 py-4 font-mono text-[11px] text-zinc-500">{u.id}</td>
                        <td className="px-6 py-4 font-bold text-white max-w-[150px] truncate">{u.name || 'No Name Provided'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-zinc-400 bg-zinc-800 rounded-full border border-zinc-700">
                            {u.skill_type || 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleResetPassword(u.id)} className="text-orange-400 hover:bg-orange-400/10 p-1.5 rounded transition-colors" title="Force Reset Password">
                            <span className="material-symbols-outlined text-[16px]">key</span>
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors" title="Delete User">
                            <span className="material-symbols-outlined text-[16px]">person_remove</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
