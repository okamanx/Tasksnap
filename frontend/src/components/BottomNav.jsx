import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/home',     icon: 'home_max',   label: 'Home'    },
  { path: '/post',     icon: 'add_circle',  label: 'Task'    },
  { path: '/history',  icon: 'history',     label: 'History' },
  { path: '/profile',  icon: 'person',      label: 'Profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
      <div className="glass-nav rounded-full border border-surface-container-highest
                      card-shadow flex justify-around items-center px-2 py-2">
        {NAV_ITEMS.map(({ path, icon, label }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center rounded-full p-3 transition-all duration-300 ease-out
                ${active
                  ? 'bg-gradient-to-br from-orange-500 to-orange-300 text-white shadow-lg shadow-orange-500/20 w-16 h-16'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              <span className="text-[11px] font-semibold tracking-wide">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
