import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const name = user?.user_metadata?.name || profile?.name || 'Tasker';
  const phone = user?.user_metadata?.phone || '—';
  let skillType = user?.user_metadata?.skill_type || 'User';
  if (skillType === 'Unskilled') skillType = 'User';
  const avatarUrl = user?.user_metadata?.avatar_url || profile?.avatar_url || null;
  const fileRef = useRef(null);
  const [stats, setStats] = useState({ earned: 0, completed: 0 });

  useEffect(() => {
    if (user?.id) fetchStats();
  }, [user]);

  async function fetchStats() {
    const { data } = await supabase
      .from('tasks')
      .select('price')
      .eq('accepted_by', user.id)
      .eq('status', 'completed');
      
    if (data) {
      const earned = data.reduce((acc, curr) => acc + (curr.price || 0), 0);
      setStats({ earned, completed: data.length });
    }
  }

  function toggleDark() {
    setDarkMode(v => !v);
    document.documentElement.classList.toggle('dark');
  }

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 150;
        canvas.width = size;
        canvas.height = size;
        
        // crop to center
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        
        // compress as jpeg
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        
        try {
          await supabase.auth.updateUser({ data: { avatar_url: dataUrl } });
          // AuthContext will automatically re-fetch the session
        } catch (error) {
          console.error("Error uploading avatar:", error);
          alert("Failed to update profile photo");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  const ITEMS = [
    { icon: 'notifications', label: 'Notifications', action: () => {} },
    { icon: 'dark_mode', label: 'Dark Mode', toggle: true },
    { icon: 'support_agent', label: 'Help & Support', action: () => navigate('/support') },
  ];

  return (
    <div className="min-h-dvh bg-surface text-on-surface pb-32">
      <TopBar title="TaskSnap" />

      <main className="pt-24 pb-8 px-6 max-w-2xl mx-auto">
        <section className="flex flex-col items-center mb-10">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            <div className="absolute -inset-1 bg-gradient-to-br from-primary-container to-secondary-container rounded-full blur opacity-25 group-hover:opacity-40 transition duration-700" />
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-lowest shadow-xl flex items-center justify-center bg-surface-container-high">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant text-6xl">person</span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 bg-primary-container text-white p-2 rounded-full shadow-lg border-2 border-surface active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
            <input type="file" className="hidden" accept="image/*" ref={fileRef} onChange={handleAvatarUpload} />
          </div>
          <div className="mt-5 text-center">
            <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">{name}</h2>
            <p className="text-on-surface-variant font-medium mt-1">{phone}</p>
            <span className="inline-block mt-2 bg-primary-container/10 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {skillType}
            </span>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-container-lowest p-6 rounded-lg card-shadow border border-surface-container-highest/10">
            <span className="text-on-surface-variant text-sm font-label uppercase tracking-widest block mb-1">Total Earned</span>
            <span className="text-tertiary text-2xl font-headline font-bold">₹{stats.earned.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-lg card-shadow border border-surface-container-highest/10">
            <span className="text-on-surface-variant text-sm font-label uppercase tracking-widest block mb-1">Tasks Done</span>
            <span className="text-primary text-2xl font-headline font-bold">{stats.completed}</span>
          </div>
        </div>

        {/* Settings list */}
        <div className="space-y-3">
          {ITEMS.map(({ icon, label, action, toggle }) => (
            <div
              key={label}
              onClick={toggle ? undefined : action}
              className={`w-full flex items-center justify-between p-5 bg-surface-container-low hover:bg-surface-container-high transition-all duration-300 rounded-lg group ${!toggle ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-surface-container-lowest rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary">{icon}</span>
                </div>
                <span className="font-semibold text-lg">{label}</span>
              </div>
              {toggle ? (
                <button
                  onClick={toggleDark}
                  className="relative inline-flex items-center cursor-pointer"
                >
                  <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${darkMode ? 'bg-primary-container' : 'bg-outline-variant'}`}>
                    <div className={`absolute top-[2px] w-5 h-5 bg-white border border-gray-300 rounded-full transition-transform duration-300 ${darkMode ? 'translate-x-5 left-[2px]' : 'left-[2px]'}`} />
                  </div>
                </button>
              ) : (
                <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
              )}
            </div>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-5 bg-surface-container-low hover:bg-error-container/10 transition-all duration-300 rounded-lg group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-surface-container-lowest rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-error">logout</span>
              </div>
              <span className="font-semibold text-lg text-error">Logout</span>
            </div>
            <span className="material-symbols-outlined text-error/30">chevron_right</span>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
