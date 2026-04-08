import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const MOCK_CONVOS = [
  { task_id: '1', name: 'Priya S.', task_title: 'Balcony Garden', last_message: 'The hydrangeas look perfect! Should I add more mulch tomorrow?', time: '12:45 PM', unread: 2, online: true },
  { task_id: '2', name: 'Rahul M.', task_title: 'Furniture Assembly', last_message: "I'll be there around 10 AM with the power tools.", time: 'Yesterday', unread: 0, online: false },
  { task_id: '3', name: 'Elena K.', task_title: 'Pet Sitting', last_message: 'Coco had his dinner and is now sleeping soundly.', time: 'Tue', unread: 0, online: false },
];

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [convos, setConvos] = useState(MOCK_CONVOS);

  useEffect(() => {
    fetchConvos();
  }, [user]);

  async function fetchConvos() {
    if (!user) return;
    try {
      // 1. Get apps where I am the applicant
      const { data: myApps } = await supabase.from('applications').select('*, tasks(title, created_by, profiles!tasks_created_by_fkey(name))').eq('applicant_id', user.id);
      
      // 2. Get my tasks, then get their apps
      const { data: myTasks } = await supabase.from('tasks').select('id, title').eq('created_by', user.id);
      const myTaskIds = myTasks?.map(t => t.id) || [];
      const { data: receivedApps } = await supabase.from('applications').select('*, profiles!applications_applicant_id_fkey(name)').in('task_id', myTaskIds);

      let merged = [];
      
      if (myApps) {
        myApps.forEach(a => merged.push({
          room_id: `${a.task_id}_${a.applicant_id}`,
          task_id: a.task_id,
          task_title: a.tasks.title,
          name: a.tasks.profiles?.name || 'Tasker',
          link: `/chat/${a.task_id}/${a.applicant_id}`
        }));
      }

      if (receivedApps && myTasks) {
        receivedApps.forEach(a => {
          const t = myTasks.find(x => x.id === a.task_id);
          merged.push({
            room_id: `${a.task_id}_${a.applicant_id}`,
            task_id: a.task_id,
            task_title: t?.title,
            name: a.profiles?.name || 'Applicant',
            link: `/chat/${a.task_id}/${a.applicant_id}`
          });
        });
      }

      // dedup
      merged = merged.filter((v,i,a)=>a.findIndex(v2=>(v2.room_id===v.room_id))===i);

      if (merged.length > 0) setConvos(merged);
    } catch { /* use mock */ }
  }

  return (
    <div className="min-h-dvh bg-surface text-on-surface pb-32">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-nav shadow-[0_12px_30px_0_rgba(0,0,0,0.06)] flex items-center justify-between px-6 h-16 border-b border-surface-container/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant">person</span>
          </div>
          <span className="text-xl font-bold font-headline text-on-surface tracking-tight">
            {user?.user_metadata?.name || 'Messages'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto">
        <div className="mb-7 text-center md:text-left">
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-2">Messages</h1>
          <p className="text-on-surface-variant font-medium">Keep track of your ongoing task updates.</p>
        </div>

        <div className="space-y-3">
          {convos.map((c, i) => (
            <div
              key={c.room_id || i}
              onClick={() => navigate(c.link || `/chat/${c.task_id}`)}
              className={`group relative rounded-lg p-5 card-shadow hover:scale-[0.99] transition-all cursor-pointer ${
                c.unread > 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low hover:bg-surface-container-high'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-2xl ${
                    c.unread ? 'ring-2 ring-primary-container ring-offset-2' : ''
                  } bg-surface-container-highest`}>
                    {c.name.split('').find(x => x !== ' ') || '?'}
                  </div>
                  {c.online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-tertiary-container rounded-full border-2 border-surface-container-lowest" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-headline font-bold text-lg text-on-surface">{c.name}</h3>
                    <span className={`text-xs font-${c.unread ? 'bold text-primary' : 'medium text-on-surface-variant'}`}>
                      {c.time}
                    </span>
                  </div>
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-[10px] font-bold text-on-secondary-container mb-2 tracking-wide uppercase">
                    Regarding: {c.task_title}
                  </div>
                  <p className={`truncate leading-tight text-sm ${c.unread ? 'font-semibold text-on-surface' : 'font-medium text-on-surface-variant'}`}>
                    {c.last_message}
                  </p>
                </div>

                {/* Unread badge */}
                {c.unread > 0 && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0 self-center">
                    <span className="text-[10px] font-bold text-white">{c.unread}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
        <div className="bg-white/70 backdrop-blur-2xl rounded-full border border-white/20 shadow-[0_12px_30px_0_rgba(0,0,0,0.06)] flex justify-around items-center px-4 py-3">
          {[
            { icon: 'explore', path: '/home' },
            { icon: 'assignment', path: '/post' },
            { icon: 'chat', path: '/messages', active: true },
            { icon: 'payments', path: '/history' },
            { icon: 'person', path: '/profile' },
          ].map(({ icon, path, active }) => (
            <button
              key={icon}
              onClick={() => navigate(path)}
              className={`p-3 rounded-full transition-all ${
                active
                  ? 'bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-orange-400'
              }`}
            >
              <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {icon}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
