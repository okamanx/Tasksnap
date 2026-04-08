import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { calculateDistance } from '../lib/location';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import TaskCard from '../components/TaskCard';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [maxRadius, setMaxRadius] = useState(6);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles:created_by(name, avatar_url)')
        .eq('status', 'open')
        .gte('created_at', twoHoursAgo)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const uLat = user?.user_metadata?.lat;
        const uLng = user?.user_metadata?.lng;

        let mappedTasks = data.map(t => {
          let calcDist = null;
          if (uLat && uLng && t.lat && t.lng) {
            calcDist = calculateDistance(uLat, uLng, t.lat, t.lng);
          }
          return {
            ...t,
            poster_name: t.profiles?.name || 'Anonymous',
            poster_avatar: t.profiles?.avatar_url || null,
            distance_km: calcDist
          };
        });

        // Save all mapped tasks
        setTasks(mappedTasks);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-dvh bg-surface text-on-surface pb-32">
      <TopBar />

      <main className="pt-20 px-6 max-w-2xl mx-auto">
        {/* Banner */}
        <section className="mb-8 relative overflow-hidden rounded-lg bg-gradient-to-br from-primary-container to-secondary-container p-8 shadow-[0_12px_30px_0_rgba(255,138,0,0.15)]">
          <div className="relative z-10 max-w-[60%]">
            <p className="text-white/80 text-sm font-semibold mb-1">{greeting()}, {user?.user_metadata?.name?.split(' ')[0] || 'Tasker'} 👋</p>
            <h2 className="text-2xl font-extrabold font-headline text-white leading-tight mb-4">
              Earn money with nearby tasks
            </h2>
            <button
              onClick={() => navigate('/post')}
              className="bg-surface-container-lowest text-primary font-bold px-6 py-2.5 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              Post a Task
            </button>
          </div>
          {/* Banner illustration */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 flex items-end justify-end">
            <div className="w-24 h-24 mb-2 mr-4 bg-white/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                handyman
              </span>
            </div>
          </div>
        </section>

        {/* Tasks */}
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="text-xl font-bold tracking-tight">Active Tasks</h3>
          
          {user?.user_metadata?.lat ? (
            <div className="relative flex items-center bg-surface-container-low rounded-lg border border-surface-container-highest/50 overflow-hidden">
              <span className="material-symbols-outlined text-primary text-[16px] pl-2 absolute pointer-events-none">my_location</span>
              <select
                value={maxRadius}
                onChange={e => setMaxRadius(Number(e.target.value))}
                className="bg-transparent text-on-surface text-xs font-bold border-none py-2 pl-8 pr-8 appearance-none outline-none cursor-pointer w-full"
              >
                <option value={0.5}>&lt; 500m</option>
                <option value={1}>&lt; 1 km</option>
                <option value={2}>&lt; 2 km</option>
                <option value={4}>&lt; 4 km</option>
                <option value={6}>&lt; 6 km</option>
              </select>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px] absolute right-2 pointer-events-none">expand_more</span>
            </div>
          ) : (
            <span className="text-primary text-sm font-bold cursor-pointer">See all</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          </div>
        ) : (() => {
          const uLat = user?.user_metadata?.lat;
          const uLng = user?.user_metadata?.lng;
          const displayedTasks = (uLat && uLng) 
            ? tasks.filter(t => t.distance_km !== null && t.distance_km <= maxRadius)
            : tasks;

          return displayedTasks.length > 0 ? (
            <div className="grid gap-5">
              {displayedTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container-low rounded-xl border border-surface-container-highest border-dashed">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">location_off</span>
              <p className="text-sm font-medium text-on-surface-variant">No tasks found within a {maxRadius}km radius.</p>
              <p className="text-xs text-outline mt-1">Try expanding your search radius or posting a task!</p>
            </div>
          );
        })()}
      </main>

      <BottomNav />
    </div>
  );
}
