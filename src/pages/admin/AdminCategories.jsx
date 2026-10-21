import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Loader2, ImagePlus, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    const slug = name.toLowerCase().replace(/ /g, '-'); 
    
    try {
      let imageUrl = null;
      if (imageFile) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1000, useWebWorker: true, fileType: 'image/jpeg' };
        const compressed = await imageCompression(imageFile, options);
        const path = `cat-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, compressed);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        imageUrl = data.publicUrl;
      }

      const { error } = await supabase.from('categories').insert({ name, slug, image_url: imageUrl });
      if (error) throw error;
      
      setName(''); setImageFile(null); setPreview(''); fetchCategories();
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Products in this category will remain but might not show up.')) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  return (
    <div className="min-h-screen bg-obsidian p-4 pb-24 text-ivory">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/dashboard" className="p-2.5 bg-charcoal border border-white/10 rounded-full hover:border-gold-primary/50 transition">
            <ArrowLeft size={20} className="text-gold-primary" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-ivory">Manage Categories</h1>
            <p className="text-xs text-muted-gold mt-1">Add or remove product categories.</p>
          </div>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="bg-charcoal p-6 rounded-2xl shadow-xl border border-white/5 mb-8 space-y-5">
          <div>
            <label className="text-xs font-semibold text-muted-gold mb-2 block">Category Name</label>
            <input placeholder="e.g. Sneakers, Ladies Shoes" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none transition" />
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-white/10 bg-obsidian flex-shrink-0">
              {preview ? (
                <><img src={preview} className="w-full h-full object-cover" /><button type="button" onClick={() => { setImageFile(null); setPreview(''); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10} /></button></>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-muted-gold hover:text-gold-primary transition">
                  <ImagePlus size={16} />
                  <span className="text-[8px] font-bold mt-1">Add Img</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) { setImageFile(file); setPreview(URL.createObjectURL(file)); }
                  }} />
                </label>
              )}
            </div>
            
            <button type="submit" disabled={saving} className="w-full sm:w-auto gold-gradient-bg text-obsidian px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /> Add Category</>}
            </button>
          </div>
        </form>

        {/* List */}
        <div className="space-y-3">
          {loading ? <p className="text-center text-muted-gold py-10">Loading categories...</p> : categories.map(cat => (
            <div key={cat.id} className="bg-charcoal p-4 rounded-xl shadow-lg border border-white/5 flex justify-between items-center group hover:border-gold-primary/30 transition">
              <div className="flex items-center gap-4">
                {cat.image_url ? (
                  <img src={cat.image_url} className="w-16 h-10 rounded-md object-cover border border-white/10" />
                ) : (
                  <div className="w-16 h-10 bg-obsidian rounded-md border border-white/10 flex items-center justify-center text-[9px] text-muted-gold">No Img</div>
                )}
                <div>
                  <p className="font-bold text-ivory text-sm capitalize">{cat.name}</p>
                  <p className="text-[10px] text-gold-primary uppercase tracking-widest mt-1">/{cat.slug}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(cat.id)} className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md hover:bg-red-500 hover:text-white transition">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
