import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, Image as ImageIcon, Phone, Mail, Share2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function AdminSettings() {
  const [currentLogo, setCurrentLogo] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    contact_phone: '',
    contact_email: '',
    facebook_url: '',
    instagram_url: ''
  });

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let newLogoUrl = currentLogo;

      // 1. Agar nayi image select ki hai toh upload karo
      if (newFile) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true, fileType: 'image/jpeg' };
        const compressed = await imageCompression(newFile, options);
        const path = `logo-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, compressed);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        newLogoUrl = urlData.publicUrl;
      }

      // 2. Database update karo (Logo + Contact details)
      const { error: dbError } = await supabase
        .from('site_settings')
        .update({ 
          logo_url: newLogoUrl,
          contact_phone: form.contact_phone,
          contact_email: form.contact_email,
          facebook_url: form.facebook_url,
          instagram_url: form.instagram_url,
          updated_at: new Date() 
        })
        .eq('id', 1);
      
      if (dbError) throw dbError;

      setCurrentLogo(newLogoUrl);
      setNewFile(null);
      setPreview('');
      alert('✅ Settings updated successfully!');

    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/dashboard" className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold">Site Settings</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Logo Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ImageIcon size={20} /> Website Logo</h2>
            <div className="flex items-center gap-4">
              {preview || currentLogo ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                  <img src={preview || currentLogo} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">No Img</div>
              )}
              <label className="flex-1 border-2 border-dashed rounded-xl flex items-center justify-center p-3 cursor-pointer bg-gray-50 text-gray-500 hover:bg-gray-100 transition">
                <span className="text-sm font-semibold">Upload New Logo</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) { setNewFile(file); setPreview(URL.createObjectURL(file)); }
                }} />
              </label>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Phone size={20} /> Contact Info</h2>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone Number</label>
              <input type="text" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="w-full border rounded-lg p-3 text-sm" placeholder="+91 XXXXXXXXXX" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Email Address</label>
              <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="w-full border rounded-lg p-3 text-sm" placeholder="email@example.com" />
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Share2 size={20} /> Social Media Links</h2>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Facebook URL</label>
              <input type="url" value={form.facebook_url} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} className="w-full border rounded-lg p-3 text-sm" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Instagram URL</label>
              <input type="url" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} className="w-full border rounded-lg p-3 text-sm" placeholder="https://instagram.com/..." />
            </div>
          </div>

          <button type="submit" disabled={uploading} className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 disabled:opacity-50">
            {uploading ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Save All Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
