import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getCurrentLocation } from '../lib/location';


export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    isProfessional: false,
    portfolioFile: null,
  });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key) { return e => setForm(f => ({ ...f, [key]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    const { name, phone, password, confirmPassword, skillType } = form;
    if (!name || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields.'); return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (form.isProfessional && !form.portfolioFile) {
      setError('Please upload your portfolio/testimonial.'); return;
    }
    setError('');
    setLoading(true);
    try {
      const skillType = form.isProfessional ? 'Professional' : 'User';
      await signUp({ name, phone, password, skillType });

      // Request location after successful signup
      try {
        const coords = await getCurrentLocation();
        await supabase.auth.updateUser({ data: { lat: coords.lat, lng: coords.lng } });
      } catch (locErr) {
        console.warn('Location access denied or failed', locErr);
      }

      navigate('/home');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background text-on-surface flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-surface z-50 px-6 py-5 flex items-center justify-between border-b border-surface-container">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <span className="text-xl font-headline font-bold tracking-tight text-orange-500">TaskSnap</span>
        <div className="w-10" />
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto px-6 pb-16 pt-8 flex flex-col">
        {/* Hero */}
        <section className="mb-10">
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-2">
            Create Account
          </h1>
          <p className="text-on-surface-variant">
            Join the community of local taskers and clients today.
          </p>
        </section>

        {/* Form card */}
        <div className="bg-surface-container-lowest rounded-lg p-7 card-shadow border border-surface-container-highest/20">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-wide px-1" htmlFor="reg-name">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={set('name')}
                className="w-full h-14 px-5 rounded-lg bg-surface-container-low border-none text-on-surface placeholder:text-outline/50"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-wide px-1" htmlFor="reg-phone">
                Phone Number
              </label>
              <input
                id="reg-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={set('phone')}
                className="w-full h-14 px-5 rounded-lg bg-surface-container-low border-none text-on-surface placeholder:text-outline/50"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-wide px-1" htmlFor="reg-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  className="w-full h-14 px-5 pr-12 rounded-lg bg-surface-container-low border-none text-on-surface placeholder:text-outline/50"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline">
                  <span className="material-symbols-outlined text-[22px]">{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-wide px-1" htmlFor="reg-confirm">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showCpw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  className="w-full h-14 px-5 pr-12 rounded-lg bg-surface-container-low border-none text-on-surface placeholder:text-outline/50"
                />
                <button type="button" onClick={() => setShowCpw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline">
                  <span className="material-symbols-outlined text-[22px]">{showCpw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Professional Toggle */}
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-wide px-1">
                Who are you?
              </label>
              <div
                onClick={() => setForm(f => ({ ...f, isProfessional: !f.isProfessional }))}
                className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-on-surface">I am a Professional</span>
                  <span className="text-xs text-on-surface-variant">Turn on to offer specialized skills</span>
                </div>
                <div className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-300 ${form.isProfessional ? 'bg-primary-container' : 'bg-outline-variant'}`}>
                  <div className={`absolute top-[2px] w-5 h-5 bg-white border border-gray-300 rounded-full transition-transform duration-300 ${form.isProfessional ? 'translate-x-[20px] left-[2px]' : 'left-[2px]'}`} />
                </div>
              </div>

              {form.isProfessional && (
                <div className="p-4 bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl text-center">
                  <label className="cursor-pointer block">
                    <span className="material-symbols-outlined text-3xl text-primary mb-1">upload_file</span>
                    <span className="block text-sm font-bold text-on-surface">Upload Portfolio / Testimonial</span>
                    <span className="block text-xs text-on-surface-variant mt-1">(PDF or DOCX required)</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => setForm(f => ({ ...f, portfolioFile: e.target.files[0] }))}
                    />
                  </label>
                  {form.portfolioFile && (
                    <div className="mt-3 text-sm font-semibold text-tertiary">
                      Selected: {form.portfolioFile.name}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-error font-medium px-1">{error}</p>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 text-white font-headline font-extrabold text-lg shadow-[0_12px_24px_-8px_rgba(255,138,0,0.5)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : 'Register'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Already have an account?{' '}
          <Link to="/" className="text-primary font-bold hover:underline">Log In</Link>
        </p>
      </main>
    </div>
  );
}
