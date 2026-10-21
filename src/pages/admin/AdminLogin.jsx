import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/admin/dashboard');
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) return setError('Please enter your email address first to reset password.');
    
    setLoading(true);
    setError('');
    setMessage('');
    
    // Password reset email bhej rahe hain
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (error) setError(error.message);
    else setMessage('Password reset link sent to your email. Please check your inbox.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian px-4">
      <form onSubmit={handleLogin} className="bg-charcoal p-8 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.1)] w-full max-w-sm border border-[rgba(212,175,55,0.2)] relative">
        
        <Link to="/" className="absolute top-4 left-4 text-muted-gold hover:text-gold-primary transition">
          <ArrowLeft size={20} />
        </Link>

        <h2 className="text-2xl font-serif font-bold text-center text-ivory mb-6 mt-2">Admin Portal</h2>
        
        {error && <p className="text-red-400 text-xs text-center mb-4 bg-red-400/10 p-2 rounded">{error}</p>}
        {message && <p className="text-gold-primary text-xs text-center mb-4 bg-gold-primary/10 p-2 rounded">{message}</p>}
        
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full bg-obsidian border border-white/10 text-ivory p-3 rounded-lg text-sm focus:border-gold-primary outline-none transition" 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full bg-obsidian border border-white/10 text-ivory p-3 rounded-lg text-sm focus:border-gold-primary outline-none transition" 
            required 
          />
        </div>

        <button type="submit" disabled={loading} className="w-full gold-gradient-bg text-obsidian font-bold py-3 rounded-lg mt-6 active:scale-95 transition">
          {loading ? 'Processing...' : 'Login'}
        </button>

        <div className="mt-4 text-center">
          <button type="button" onClick={handleForgotPassword} className="text-xs text-muted-gold hover:text-gold-primary transition">
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}
