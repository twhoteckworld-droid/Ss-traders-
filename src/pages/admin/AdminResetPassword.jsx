import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function AdminResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) setError(error.message);
    else {
      setMessage('✅ Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/admin/login'), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian px-4">
      <form onSubmit={handleUpdate} className="bg-charcoal p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-[rgba(212,175,55,0.2)]">
        <div className="flex justify-center mb-6">
          <div className="bg-obsidian p-4 rounded-full border border-gold-primary/30">
            <Lock size={32} className="text-gold-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-serif font-bold text-center text-ivory mb-2">Set New Password</h2>
        <p className="text-xs text-center text-muted-gold mb-6">Enter your new secure password below.</p>
        
        {error && <p className="text-red-400 text-xs text-center mb-4">{error}</p>}
        {message && <p className="text-gold-primary text-xs text-center mb-4 font-bold">{message}</p>}
        
        <div className="space-y-4">
          <input 
            type="password" 
            placeholder="New Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full bg-obsidian border border-white/10 text-ivory p-3 rounded-lg text-sm focus:border-gold-primary outline-none transition" 
            required 
          />
          <input 
            type="password" 
            placeholder="Confirm New Password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className="w-full bg-obsidian border border-white/10 text-ivory p-3 rounded-lg text-sm focus:border-gold-primary outline-none transition" 
            required 
          />
        </div>

        <button type="submit" disabled={loading} className="w-full gold-gradient-bg text-obsidian font-bold py-3 rounded-lg mt-6 active:scale-95 transition">
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
