import { useNavigate } from 'react-router-dom';

export default function TopBar({ title, showBack = false, showNotifications = true, showMenu = true }) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full z-50 glass-nav border-b border-surface-container/50">
      <div className="flex justify-between items-center px-6 py-4 max-w-2xl mx-auto w-full">
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
          <button className="p-2 hover:bg-on-surface/5 rounded-full transition-colors">
            <span className="material-symbols-outlined text-primary">notifications</span>
          </button>
        )}
      </div>
    </header>
  );
}
