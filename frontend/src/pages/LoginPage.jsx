import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!phone || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      await signIn({ phone, password });
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Invalid phone number or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-surface text-on-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-primary-container/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 -right-48 w-[500px] h-[500px] bg-secondary-container/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed -bottom-24 left-1/4 w-80 h-80 bg-tertiary-container/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      <main className="w-full max-w-md flex flex-col items-center space-y-10">
        {/* Branding */}
        <header className="text-center space-y-5">
          <div className="relative inline-block">
            <div className="w-20 h-20 sunlight-gradient rounded-xl rotate-12 flex items-center justify-center shadow-lg shadow-primary-container/20">
              <span
                className="material-symbols-outlined text-white text-4xl -rotate-12"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-tertiary-container rounded-full flex items-center justify-center border-4 border-surface">
              <span className="material-symbols-outlined text-white text-sm">check</span>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
              TaskSnap
            </h1>
            <p className="text-on-surface-variant font-medium">
              Earn instantly by completing nearby tasks
            </p>
          </div>
        </header>

        {/* Form */}
        <section className="w-full space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="login-phone">
                Phone Number
              </label>
              <input
                id="login-phone"
                type="tel"
                autoComplete="tel"
                placeholder="Enter your mobile number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-lg px-5 py-4 text-on-surface placeholder:text-outline/50 font-medium"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-lg px-5 py-4 text-on-surface placeholder:text-outline/50 font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-error font-medium px-1">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full sunlight-gradient text-white font-bold py-5 rounded-lg shadow-[0_12px_30px_0_rgba(255,138,0,0.25)] hover:scale-[0.98] active:scale-95 transition-all duration-300 text-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span>Log In</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </section>

        {/* Social proof */}
        <footer className="w-full">
          <div className="glass-nav px-4 py-3 rounded-full border border-surface-container-highest/40 flex items-center justify-center gap-3 card-shadow">
            <div className="flex -space-x-2">
              {['👩', '👨', '🧑'].map((e, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center border-2 border-surface text-sm">
                  {e}
                </div>
              ))}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              1,200+ taskers active today
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
