import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, Image as ImageIcon, Phone, Mail, Share2, UserCog } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function AdminSettings() {
  const [currentLogo, setCurrentLogo] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    contact_phone: '', contact_email: '', facebook_url: '', instagram_url: ''
  });

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [accMessage, setAccMessage] = useState('');
  const [accLoading, setAccLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (data) {
        setCurrentLogo(data.logo_url || '');
        setForm({
          contact_phone: data.contact_phone || '',
          contact_email: data.contact_email || '',
          facebook_url: data.facebook_url || '',
          instagram_url: data.instagram_url || ''
        });
      }
      setLoading(false);
    })();
  }, []);

  const handleUpdateSite = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let newLogoUrl = currentLogo;
      if (newFile) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true, fileType: 'image/jpeg' };
        const compressed = await imageCompression(newFile, options);
        const path = `logo-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, compressed);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        newLogoUrl = urlData.publicUrl;
      }

      const { error: dbError } = await supabase.from('site_settings').update({ 
        logo_url: newLogoUrl, contact_phone: form.contact_phone, contact_email: form.contact_email,
        facebook_url: form.facebook_url, instagram_url: form.instagram_url, updated_at: new Date() 
      }).eq('id', 1);
      
      if (dbError) throw dbError;
      setCurrentLogo(newLogoUrl);
      setNewFile(null);
      setPreview('');
      alert('✅ Site Settings updated!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) return;
    setAccLoading(true);
    setAccMessage('');
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) setAccMessage('Error: ' + error.message);
    else setAccMessage('✅ Confirmation link sent to new email. Please check both old and new inbox.');
    setAccLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) return setAccMessage('Password must be at least 6 characters.');
    setAccLoading(true);
    setAccMessage('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setAccMessage('Error: ' + error.message);
    else setAccMessage('✅ Password updated successfully!');
    setAccLoading(false);
  };

  if (loading) return <div className="p-10 text-center text-ivory bg-obsidian min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-obsidian p-4 pb-24 text-ivory">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin/dashboard" className="p-2 bg-charcoal border border-white/10 rounded-full hover:border-gold-primary/50 transition"><ArrowLeft size={20} className="text-gold-primary" /></Link>
          <h1 className="text-2xl font-serif font-bold text-ivory">Site Settings</h1>
        </div>

        {/* Account Settings */}
        <div className="bg-charcoal p-6 rounded-2xl shadow-xl border border-[rgba(212,175,55,0.2)] mb-6">
          <h2 className="text-lg font-serif font-bold mb-4 flex items-center gap-2 text-gold-primary"><UserCog size={20} /> Account Settings</h2>
          
          {accMessage && <p className="text-xs text-gold-primary bg-gold-primary/10 p-3 rounded mb-4 border border-gold-primary/20">{accMessage}</p>}
          
          <div className="space-y-5">
            <div>
              <label className="text-xs text-muted-gold mb-2 block font-semibold">Change Email</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="email" placeholder="New Email Address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="flex-1 bg-obsidian border border-white/10 rounded-lg p-3 text-sm text-ivory focus:border-gold-primary outline-none transition" />
                <button onClick={handleUpdateEmail} disabled={accLoading} className="bg-charcoal-light border border-gold-primary/30 text-gold-primary px-5 py-3 rounded-lg text-xs font-bold hover:bg-gold-primary hover:text-obsidian transition">Update</button>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-gold mb-2 block font-semibold">Change Password</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex-1 bg-obsidian border border-white/10 rounded-lg p-3 text-sm text-ivory focus:border-gold-primary outline-none transition" />
                <button onClick={handleUpdatePassword} disabled={accLoading} className="bg-charcoal-light border border-gold-primary/30 text-gold-primary px-5 py-3 rounded-lg text-xs font-bold hover:bg-gold-primary hover:text-obsidian transition">Update</button>
              </div>
            </div>
          </div>
        </div>

        {/* Site Settings */}
        <form onSubmit={handleUpdateSite} className="space-y-6">
          <div className="bg-charcoal p-6 rounded-2xl shadow-xl border border-white/5">
            <h2 className="text-lg font-serif font-bold mb-4 flex items-center gap-2 text-ivory"><ImageIcon size={20} className="text-gold-primary" /> Website Logo</h2>
            <div className="flex items-center gap-4">
              {preview || currentLogo ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gold-primary/30">
                  <img src={preview || currentLogo} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-obsidian flex items-center justify-center text-muted-gold">No Img</div>
              )}
              <label className="flex-1 border border-dashed border-white/20 rounded-xl flex items-center justify-center p-4 cursor-pointer bg-obsidian hover:border-gold-primary/50 transition">
                <span className="text-sm font-semibold text-muted-gold">Upload New Logo</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) { setNewFile(file); setPreview(URL.createObjectURL(file)); }
                }} />
              </label>
            </div>
          </div>

          <div className="bg-charcoal p-6 rounded-2xl shadow-xl border border-white/5 space-y-5">
            <h2 className="text-lg font-serif font-bold mb-2 flex items-center gap-2 text-ivory"><Phone size={20} className="text-gold-primary" /> Contact Info</h2>
            <div>
               <label className="text-xs text-muted-gold mb-2 block">Phone Number</label>
               <input type="text" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="w-full bg-obsidian border border-white/10 rounded-lg p-3 text-sm text-ivory focus:border-gold-primary outline-none transition" placeholder="+91 XXXXXXXXXX" />
            </div>
            <div>
               <label className="text-xs text-muted-gold mb-2 block">Email Address</label>
               <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="w-full bg-obsidian border border-white/10 rounded-lg p-3 text-sm text-ivory focus:border-gold-primary outline-none transition" placeholder="email@example.com" />
            </div>
          </div>

          <div className="bg-charcoal p-6 rounded-2xl shadow-xl border border-white/5 space-y-5">
            <h2 className="text-lg font-serif font-bold mb-2 flex items-center gap-2 text-ivory"><Share2 size={20} className="text-gold-primary" /> Social Media Links</h2>
            <div>
               <label className="text-xs text-muted-gold mb-2 block">Facebook URL</label>
               <input type="url" value={form.facebook_url} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} className="w-full bg-obsidian border border-white/10 rounded-lg p-3 text-sm text-ivory focus:border-gold-primary outline-none transition" placeholder="https://facebook.com/..." />
            </div>
            <div>
               <label className="text-xs text-muted-gold mb-2 block">Instagram URL</label>
               <input type="url" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} className="w-full bg-obsidian border border-white/10 rounded-lg p-3 text-sm text-ivory focus:border-gold-primary outline-none transition" placeholder="https://instagram.com/..." />
            </div>
          </div>

          <button type="submit" disabled={uploading} className="w-full gold-gradient-bg text-obsidian py-4 rounded-xl font-black text-sm uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(212,175,55,0.2)] mt-6">
            {uploading ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Save All Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
