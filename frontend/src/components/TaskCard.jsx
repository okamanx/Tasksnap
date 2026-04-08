import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function TaskCard({ task }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applying, setApplying] = useState(false);
  const {
    id,
    title,
    description,
    price,
    created_at,
    poster_name = 'Anonymous',
    poster_avatar = null,
    distance_km = null,
  } = task;

  const postedAgo = created_at
    ? formatAgo(new Date(created_at))
    : '';

  return (
    <div
      className="bg-surface-container-lowest p-6 rounded-lg card-shadow group transition-all"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden flex-shrink-0 flex items-center justify-center">
            {poster_avatar ? (
              <img src={poster_avatar} alt={poster_name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant text-2xl">person</span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">{poster_name}</p>
            {distance_km !== null && (
              <div className="flex items-center text-[11px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px] mr-1">location_on</span>
                {distance_km} km away
              </div>
            )}
          </div>
        </div>
        {/* Price badge */}
        <div className="bg-tertiary-container/20 text-on-tertiary-container px-3 py-1 rounded-full text-sm font-bold flex-shrink-0">
          ₹{price?.toLocaleString('en-IN') || '—'}
        </div>
      </div>

      {/* Body */}
      <h4 className="text-lg font-bold mb-2 cursor-pointer group-hover:text-primary transition-colors line-clamp-1">
        {title}
      </h4>
      <p className="text-sm text-on-surface-variant cursor-pointer leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-surface-container flex justify-between items-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant opacity-60">
          {postedAgo}
        </span>
        {task.created_by === user?.id ? (
          <button onClick={() => navigate(`/messages`)} className="text-on-surface-variant font-bold text-sm bg-surface-container-high px-4 py-1.5 rounded-full hover:bg-surface-container-highest transition-colors">
            Manage
          </button>
        ) : (
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              if (!user) return navigate('/');
              setApplying(true);
              try {
                // Insert application
                await supabase.from('applications').insert({ task_id: id, applicant_id: user.id });
                // Notify Task owner
                await supabase.from('notifications').insert({
                  user_id: task.created_by,
                  message: `${user.user_metadata?.name || 'A user'} applied to your task: ${title}`,
                  link: `/chat/${id}/${user.id}`
                });
                alert('Application sent successfully!');
                navigate(`/chat/${id}/${user.id}`);
              } catch (err) {
                if (err?.code === '23505') { // unique violation
                  navigate(`/chat/${id}/${user.id}`); // already applied
                } else {
                  console.error(err);
                }
              }
              setApplying(false);
            }}
            disabled={applying}
            className="text-primary font-bold text-sm flex items-center gap-1 disabled:opacity-50 hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors"
          >
            {applying ? 'Applying...' : 'Apply Now'}
            {!applying && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          </button>
        )}
      </div>
    </div>
  );
}

function formatAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}
