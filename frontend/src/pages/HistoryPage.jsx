import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [posted, setPosted] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchHistory();
  }, [user]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const [recRes, postRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('accepted_by', user?.id).in('status', ['completed']),
        supabase.from('tasks').select('*').eq('created_by', user?.id),
      ]);
      if (recRes.data) setReceived(recRes.data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
      if (postRes.data) setPosted(postRes.data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch { /* suppress mock fallback */ }
    setLoading(false);
  }

  const items = tab === 'received' ? received : posted;

  const getTaskStatus = (task) => {
    if (task.status === 'completed') return { label: 'Completed', color: 'bg-green-500/20 text-green-500' };
    if (task.status === 'in_progress') return { label: 'In Progress', color: 'bg-orange-500/20 text-orange-400' };
    if (task.status === 'assigned') return { label: 'Assigned', color: 'bg-blue-500/20 text-blue-400' };
    
    // Check expiration (2 hours)
    if (task.created_at) {
      const ageMs = Date.now() - new Date(task.created_at).getTime();
      if (ageMs > 2 * 60 * 60 * 1000) return { label: 'Expired', color: 'bg-red-500/20 text-red-500' };
    }
    
    return { label: 'Active', color: 'bg-primary-container/20 text-primary' };
  };

  return (
    <div className="min-h-dvh bg-background text-on-surface pb-32">
      <TopBar title="TaskSnap" />

      <main className="pt-24 px-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface mb-1">History</h2>
          <p className="text-on-surface-variant text-sm font-medium">Review your completed and active tasks</p>
        </div>

        {/* Segmented control */}
        <div className="bg-surface-container p-1.5 rounded-full flex gap-1 mb-6 shadow-sm">
          {['received', 'posted'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 px-6 rounded-full font-bold text-sm transition-all duration-300 ${
                tab === t
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          </div>
        ) : items.length === 0 ? (
          /* Empty state */
          <div className="bg-surface-container-low border border-dashed border-outline-variant rounded-lg p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-on-surface-variant">add_task</span>
            </div>
            <h4 className="font-headline font-bold text-on-surface">
              {tab === 'received' ? 'No tasks received yet' : 'Post a New Task'}
            </h4>
            <p className="text-on-surface-variant text-sm max-w-xs mt-2">
              {tab === 'received'
                ? 'Accept a task from the home screen to start earning!'
                : 'Need help with something? Post a task and get it done by local experts.'}
            </p>
            <button
              onClick={() => navigate(tab === 'received' ? '/home' : '/post')}
              className="mt-6 bg-gradient-to-br from-orange-500 to-orange-300 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
            >
              {tab === 'received' ? 'Find Tasks' : 'Get Started'}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map(task => (
              <div key={task.id} className="bg-surface-container-lowest rounded-lg p-6 card-shadow group relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container-high flex items-center justify-center text-3xl shrink-0">
                      {task.image || '📋'}
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-on-surface text-lg leading-tight group-hover:text-primary transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-on-surface-variant text-[11px] mt-1 font-mono uppercase tracking-wider">
                        {new Date(task.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-tertiary font-bold text-xl tracking-tight leading-none">
                      ₹{task.price?.toLocaleString('en-IN')}
                    </span>
                    <span className={`${getTaskStatus(task).color} px-2.5 py-1 rounded-sm text-[9px] font-extrabold uppercase tracking-widest leading-none border border-current/20`}>
                      {getTaskStatus(task).label}
                    </span>
                  </div>
                </div>
                {task.rating && (
                  <div className="flex items-center gap-2 pt-4 border-t border-surface-container-low mt-4">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-sm font-semibold text-on-surface">{task.rating} Rated</span>
                    <span className="mx-1 text-outline-variant">•</span>
                    <span className="text-sm text-on-surface-variant">Client: {task.client}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
