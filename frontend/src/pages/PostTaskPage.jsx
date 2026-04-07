import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const DURATION_OPTIONS = ['~ 1 Hour', '~ 2 Hours', '~ 4 Hours', 'Full Day', 'Custom'];

export default function PostTaskPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    duration: '~ 2 Hours',
    customDuration: '',
    address: '',
    lat: null,
    lng: null,
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function set(key) { return e => setForm(f => ({ ...f, [key]: e.target.value })); }

  function handleImages(e) {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude, address: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }));
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { title, description, price, lat, lng, address } = form;
    if (!title || !price) { setError('Title and budget are required.'); return; }
    setError('');
    setLoading(true);
    try {
      const { error: dbErr } = await supabase.from('tasks').insert({
        title,
        description,
        price: parseInt(price, 10),
        lat: lat || 28.6139,
        lng: lng || 77.2090,
        status: 'open',
        created_by: user?.id,
      });
      if (dbErr) throw dbErr;
      setSuccess(true);
      setTimeout(() => navigate('/home'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to post task. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-surface text-on-surface pb-32">
      <TopBar title="TaskSnap" />

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Post a Task</h2>
          <p className="text-on-surface-variant text-sm mt-1">Need a hand? Describe what you need and get local help.</p>
        </div>

        {/* Image upload */}
        <div
          className="relative group cursor-pointer h-52 w-full rounded-lg bg-surface-container-low flex flex-col items-center justify-center border-2 border-dashed border-outline-variant hover:bg-surface-container-high transition-all"
          onClick={() => fileRef.current?.click()}
        >
          {previews.length ? (
            <div className="flex gap-2 flex-wrap p-3 justify-center">
              {previews.map((p, i) => (
                <img key={i} src={p} className="h-20 w-20 object-cover rounded-lg" alt="" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="bg-primary-container/10 p-4 rounded-full text-primary">
                <span className="material-symbols-outlined text-4xl">add_a_photo</span>
              </div>
              <span className="font-semibold text-on-surface-variant">Add task photos</span>
              <span className="text-xs text-outline">Up to 5 images (JPEG, PNG)</span>
            </div>
          )}
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImages} />
        </div>

        {/* Title & Description */}
        <div className="bg-surface-container-lowest rounded-lg p-6 card-shadow space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface tracking-wide uppercase px-1">Task Title</label>
            <input
              type="text"
              placeholder="e.g., Fix wooden garden fence"
              value={form.title}
              onChange={set('title')}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface placeholder:text-outline/60 font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface tracking-wide uppercase px-1">Description</label>
            <textarea
              rows={4}
              placeholder="Describe the task details, tools needed, etc..."
              value={form.description}
              onChange={set('description')}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface placeholder:text-outline/60 font-medium resize-none"
            />
          </div>
        </div>

        {/* Budget & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest rounded-lg p-5 card-shadow space-y-2">
            <label className="text-sm font-bold text-on-surface tracking-wide uppercase px-1">Budget</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-primary font-bold text-lg">₹</span>
              <input
                type="number"
                placeholder="500"
                value={form.price}
                onChange={set('price')}
                className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-3 text-on-surface font-bold text-lg"
              />
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-lg p-5 card-shadow space-y-2">
            <label className="text-sm font-bold text-on-surface tracking-wide uppercase px-1">Duration</label>
            <select
              value={form.duration}
              onChange={set('duration')}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface font-medium mb-2"
            >
              {DURATION_OPTIONS.map(d => <option key={d}>{d}</option>)}
            </select>
            {form.duration === 'Custom' && (
              <input
                type="text"
                placeholder="e.g. 3 Days"
                value={form.customDuration}
                onChange={set('customDuration')}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-on-surface font-medium"
              />
            )}
          </div>
        </div>



        {/* Location */}
        <div className="bg-surface-container-lowest rounded-lg p-6 card-shadow space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-on-surface tracking-wide uppercase">Location</label>
            <button
              type="button"
              onClick={useCurrentLocation}
              className="text-primary text-xs font-bold flex items-center gap-1 hover:opacity-80"
            >
              <span className="material-symbols-outlined text-sm">
                {locating ? 'progress_activity' : 'my_location'}
              </span>
              {locating ? 'Locating...' : 'Use Current Location'}
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-3.5 material-symbols-outlined text-outline">location_on</span>
            <input
              type="text"
              placeholder="Enter service address"
              value={form.address}
              onChange={set('address')}
              className="w-full bg-surface-container-low border-none rounded-lg pl-11 pr-4 py-3 text-on-surface placeholder:text-outline/60 font-medium"
            />
          </div>
          {form.lat && (
            <div className="bg-surface-container text-on-surface-variant text-xs px-3 py-2 rounded-lg font-mono">
              📍 {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
            </div>
          )}
        </div>

        {/* Error / Success */}
        {error && <p className="text-sm text-error font-medium px-1">{error}</p>}
        {success && (
          <div className="flex items-center gap-2 text-tertiary font-semibold px-1">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Task posted! Redirecting…
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || success}
          className="w-full py-5 rounded-lg bg-gradient-to-br from-orange-500 to-orange-300 text-white font-headline font-extrabold text-lg shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : (
            <>Post Task <span className="material-symbols-outlined">send</span></>
          )}
        </button>
        <p className="text-center text-xs text-on-surface-variant pb-4">
          By posting, you agree to our Terms of Service and Safety Guidelines.
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
