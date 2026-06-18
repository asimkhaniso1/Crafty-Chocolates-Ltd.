import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-choco">Admin Offline</h1>
          <p className="text-clay font-serif italic">
            Supabase credentials aren't configured yet. Set <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> in Vercel env vars and redeploy.
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6 pt-32 pb-24">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6 bg-white p-10 border border-choco/10 shadow-sm">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-choco">Admin Sign-in</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold mt-2">Crafty Chocolates</p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-[10px] uppercase tracking-widest font-bold text-clay">Email</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-stone-50 border border-choco/10 px-4 py-3 text-choco focus:outline-none focus:border-gold"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-[10px] uppercase tracking-widest font-bold text-clay">Password</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-stone-50 border border-choco/10 px-4 py-3 text-choco focus:outline-none focus:border-gold"
          />
        </label>

        {error && (
          <p className="text-red-700 text-sm font-serif italic">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-choco text-white py-3 font-black uppercase tracking-widest text-xs hover:bg-gold transition-all disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export function RedirectIfAuthed({ children }: { children: any }) {
  // unused placeholder
  return children;
}

export { Navigate };
