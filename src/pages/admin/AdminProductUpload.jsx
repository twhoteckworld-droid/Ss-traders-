import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import { z } from 'zod';
import { X, Upload, Loader2, ImagePlus, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

const schema = z.object({
  title: z.string().min(3, 'Title required'),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category: z.string().min(1, 'Select a category'),
});

export default function AdminProductUpload() {
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', price: '', original_price: '', stock: '', category: '', sizesStr: '', is_new: false, is_bestseller: false });

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []));
  }, []);

  const onDrop = useCallback((ok, rej) => {
    if (rej.length) alert(`Rejected: ${rej[0].errors[0].message}`);
    setFiles((prev) => [...prev, ...ok.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/webp': ['.webp'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }, maxSize: 10 * 1024 * 1024, maxFiles: 5,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) });
    if (!parsed.success) return alert(parsed.error.issues[0].message);
    if (!files.length) return alert('Upload at least 1 image');

    const sizesArray = form.sizesStr ? form.sizesStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    setUploading(true);
    try {
      const urls = [];
      for (const { file } of files) {
        const options = { maxSizeMB: 1.5, maxWidthOrHeight: 1200, useWebWorker: true, fileType: 'image/jpeg' };
        let fileToUpload = file;
        try { fileToUpload = await imageCompression(file, options); } catch (err) { console.log(err); }
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error } = await supabase.storage.from('product-images').upload(path, fileToUpload);
        if (error) throw error;
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      const { error } = await supabase.from('products').insert({
        title: parsed.data.title, price: parsed.data.price, original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parsed.data.stock, category: parsed.data.category, images: urls, sizes: sizesArray, is_new: form.is_new, is_bestseller: form.is_bestseller,
      });
      if (error) throw error;
      alert('✅ Product added!');
      navigate('/admin/dashboard');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/dashboard" className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold">Add Shoe Product</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'}`}>
          <input {...getInputProps()} />
          <ImagePlus className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm">Tap to select images (max 5)</p>
        </div>
        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative"><img src={f.preview} className="h-24 w-full object-cover rounded-lg" /><button type="button" onClick={() => setFiles(files.filter((_, x) => x !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10} /></button></div>
            ))}
          </div>
        )}
        <input placeholder="Shoe Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg p-3 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Selling Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border rounded-lg p-3 text-sm" />
          <input type="number" placeholder="MRP / Original Price" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="border rounded-lg p-3 text-sm" />
          <input type="number" placeholder="Stock Qty" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border rounded-lg p-3 text-sm" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border rounded-lg p-3 text-sm">
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <input placeholder="Sizes e.g. 6, 7, 8 or 36, 37, 38" value={form.sizesStr} onChange={(e) => setForm({ ...form, sizesStr: e.target.value })} className="w-full border rounded-lg p-3 text-sm" />
        </div>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} /> New</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_bestseller} onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })} /> Bestseller</label>
        </div>
        <button type="submit" disabled={uploading} className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mt-4">
          {uploading ? <><Loader2 className="animate-spin" size={16} /> Uploading...</> : <><Upload size={16} /> Publish Shoe</>}
        </button>
      </form>
    </div>
  );
}
