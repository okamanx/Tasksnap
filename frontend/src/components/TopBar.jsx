import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function TopBar({ title, showBack = false, showNotifications = true, showMenu = true }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchNotifs();
    const ch = supabase.channel('notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, p => setNotifications(n => [p.new, ...n]))
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [user]);

  async function fetchNotifs() {
    try {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
      if (data) setNotifications(data);
    } catch { }
  }

  async function handleRead(id, link) {
    setShowDropdown(false);
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
    if (link) navigate(link);
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="fixed top-0 w-full z-50 glass-nav border-b border-surface-container/50">
      <div className="flex justify-between items-center px-6 py-4 max-w-2xl mx-auto w-full relative">
        {/* Left */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-on-surface/5 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface">arrow_back</span>
            </button>
          ) : showMenu ? (
            <img src="/logo.png" alt="logo" className="w-11 h-11 object-contain" />
          ) : null}

          {title && (
            <h1 className="text-xl font-extrabold text-primary font-headline tracking-tight">
              {title}
            </h1>
          )}
        </div>

        {/* Center logo (when no title) */}
        {!title && (
          <span className="text-xl font-extrabold text-primary font-headline tracking-tight absolute left-1/2 -translate-x-1/2">
            TaskSnap
          </span>
        )}

        {/* Right */}
        {showNotifications && (
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="p-2 hover:bg-on-surface/5 rounded-full transition-colors relative">
              <span className="material-symbols-outlined text-primary">notifications</span>
              {unreadCount > 0 && <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-error rounded-full shadow-sm" />}
            </button>
            {showDropdown && (
              <div className="absolute top-12 right-0 w-72 bg-surface-container-lowest border border-surface-container-highest/20 card-shadow rounded-xl overflow-hidden py-3 z-[60]">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-4 pb-2 mb-1 border-b border-surface-container-highest/10">Notifications</h4>
                {notifications.length === 0 ? (
                   <div className="p-4 text-center text-sm font-medium text-on-surface-variant">No new notifications</div>
                ) : (
                  <div className="max-h-[70vh] overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} onClick={() => handleRead(n.id, n.link)} className={`px-4 py-3 cursor-pointer hover:bg-surface-container transition-colors ${!n.is_read ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}>
                        <p className="text-sm text-on-surface leading-snug font-medium line-clamp-3">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
