import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import TaskCard from '../components/TaskCard';

const MOCK_TASKS = [
  { id: '1', title: 'Urban Balcony Garden Setup', description: 'Need help arranging pots and soil for a small 4x8 balcony. Looking for someone with basic plant knowledge.', price: 800, poster_name: 'Priya S.', distance_km: 1.2, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '2', title: 'IKEA Furniture Assembly', description: 'Looking for someone to assemble a PAX wardrobe and a desk. Should have their own basic tools.', price: 1200, poster_name: 'Rahul M.', distance_km: 2.5, created_at: new Date(Date.now() - 18000000).toISOString() },
  { id: '3', title: 'Grocery Pickup & Delivery', description: 'Need a few items from the organic store nearby delivered to my home. Distance is less than 1km.', price: 500, poster_name: 'Ananya K.', distance_km: 0.8, created_at: new Date(Date.now() - 600000).toISOString() },
];



export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(MOCK_TASKS);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles:created_by(name, avatar_url)')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (!error && data?.length > 0) {
        setTasks(data.map(t => ({
          ...t,
          poster_name: t.profiles?.name || 'Anonymous',
          poster_avatar: t.profiles?.avatar_url || null,
        })));
      }
    } catch {
      // fallback to mock data
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
        <div className="flex justify-between items-end mb-5 px-1">
          <h3 className="text-xl font-bold tracking-tight">Active Tasks</h3>
          <span className="text-primary text-sm font-bold cursor-pointer">See all</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          </div>
        ) : (
          <div className="grid gap-5">
            {tasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
