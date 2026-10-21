import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/admin/dashboard');
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) return setError('Please enter your email address first.');
    setLoading(true); setError(''); setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    if (error) setError(error.message);
    else setMessage('Password reset link sent. Check your inbox.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl"></div>
      
      <form onSubmit={handleLogin} className="bg-charcoal p-8 md:p-10 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.05)] w-full max-w-md border border-[rgba(212,175,55,0.2)] relative z-10">
        
        <Link to="/" className="absolute top-6 left-6 text-muted-gold hover:text-gold-primary transition">
          <ArrowLeft size={20} />
        </Link>

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-obsidian border border-gold-primary/30 rounded-full shadow-lg">
            <ShieldCheck size={36} className="text-gold-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-serif font-bold text-center text-ivory mb-2">Admin Portal</h2>
        <p className="text-center text-xs text-muted-gold mb-8 uppercase tracking-widest">Authorized Access Only</p>
        
        {error && <p className="text-red-400 text-xs text-center mb-6 bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}
        {message && <p className="text-gold-primary text-xs text-center mb-6 bg-gold-primary/10 p-3 rounded-lg border border-gold-primary/20">{message}</p>}
        
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-muted-gold mb-2 block">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-obsidian border border-white/10 text-ivory p-3.5 rounded-lg text-sm focus:border-gold-primary outline-none transition" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-gold mb-2 block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-obsidian border border-white/10 text-ivory p-3.5 rounded-lg text-sm focus:border-gold-primary outline-none transition" required />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full gold-gradient-bg text-obsidian font-black py-4 rounded-lg mt-8 uppercase tracking-widest text-xs active:scale-95 transition hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        <div className="mt-6 text-center">
          <button type="button" onClick={handleForgotPassword} className="text-xs text-muted-gold hover:text-gold-primary transition font-medium">
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}
