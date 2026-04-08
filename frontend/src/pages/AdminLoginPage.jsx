import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('tasksnap_admin_key', 'admin_verified');
      navigate('/admin');
    } else {
      setError('Invalid credentials');
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <span className="material-symbols-outlined text-red-500 text-2xl">shield_person</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Admin</h1>
          <p className="text-zinc-400 text-sm mt-1">Authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500/50 rounded-lg px-4 py-3 text-white outline-none transition-colors"
              placeholder="Enter username"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500/50 rounded-lg px-4 py-3 text-white outline-none transition-colors"
              placeholder="Enter password"
            />
          </div>

          {error && <p className="text-xs text-red-400 font-medium px-1">{error}</p>}

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-lg active:scale-95 transition-all outline-none mt-4 flex items-center justify-center gap-2"
          >
            Authenticate <span className="material-symbols-outlined text-[18px]">lock_open</span>
          </button>
        </form>
      </div>
    </div>
  );
}
