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

      // Upload Image if selected
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
      
      setName('');
      setImageFile(null);
      setPreview('');
      fetchCategories();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/dashboard" className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold">Manage Categories</h1>
        </div>

        <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">
          <input 
            placeholder="Category Name (e.g., Sneakers)" 
            value={name} onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-xl p-3 text-sm shadow-sm"
          />
          
          <div className="flex items-center gap-4">
            {preview ? (
              <div className="relative w-24 h-16 rounded-lg overflow-hidden border">
                <img src={preview} className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setPreview(''); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
              </div>
            ) : (
              <label className="w-24 h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gray-50 text-gray-400 hover:bg-gray-100">
                <ImagePlus size={16} />
                <span className="text-[8px] font-bold mt-1">Add Img</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) { setImageFile(file); setPreview(URL.createObjectURL(file)); }
                }} />
              </label>
            )}
            <button type="submit" disabled={saving} className="flex-1 bg-emerald-700 text-white p-3 rounded-xl font-bold shadow-md active:scale-95 disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Add Category'}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {loading ? <p>Loading...</p> : categories.map(cat => (
            <div key={cat.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {cat.image_url ? (
                  <img src={cat.image_url} className="w-12 h-8 rounded object-cover border" />
                ) : (
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-[8px] text-gray-400">No Img</div>
                )}
                <div>
                  <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
                  <p className="text-[10px] text-gray-400">/{cat.slug}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 bg-red-50 rounded-lg"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
