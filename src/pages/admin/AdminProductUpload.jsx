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
  const [form, setForm] = useState({ title: '', price: '', original_price: '', stock: '', category: '', sizesStr: '', description: '', is_new: false, is_bestseller: false });

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

    const sizesArray = [];
    const sizeStock = {};
    if (form.sizesStr) {
      form.sizesStr.split(',').forEach(item => {
        const [size, qty] = item.split(':').map(s => s.trim());
        if (size && qty !== undefined) {
          sizesArray.push(size);
          sizeStock[size] = parseInt(qty, 10);
        } else if (size) {
          sizesArray.push(size);
          sizeStock[size] = 0;
        }
      });
    }

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
        stock: parsed.data.stock, category: parsed.data.category, images: urls, 
        sizes: sizesArray, size_stock: sizeStock,
        description: form.description, // Naya field
        is_new: form.is_new, is_bestseller: form.is_bestseller,
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
    <div className="max-w-2xl mx-auto p-4 pb-24 text-ivory bg-obsidian min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/dashboard" className="p-2 bg-charcoal rounded-full border border-white/10"><ArrowLeft size={20} className="text-gold-primary" /></Link>
        <h1 className="text-2xl font-serif font-bold">Add Shoe Product</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center ${isDragActive ? 'border-gold-primary bg-gold-primary/10' : 'border-white/20'}`}>
          <input {...getInputProps()} />
          <ImagePlus className="mx-auto mb-2 text-gold-primary" size={32} />
          <p className="text-sm text-muted-gold">Tap to select images (max 5)</p>
        </div>
        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative"><img src={f.preview} className="h-24 w-full object-cover rounded-lg border border-white/10" /><button type="button" onClick={() => setFiles(files.filter((_, x) => x !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10} /></button></div>
            ))}
          </div>
        )}
        
        <input placeholder="Shoe Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
        
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Selling Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
          <input type="number" placeholder="MRP / Original Price" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
          <input type="number" placeholder="Total Stock Qty" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none">
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        
        <div>
          <input placeholder="Sizes & Stock e.g. 6:5, 7:10, 8:0" value={form.sizesStr} onChange={(e) => setForm({ ...form, sizesStr: e.target.value })} className="w-full bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
        </div>

        {/* Naya Description Field */}
        <div>
          <textarea 
            placeholder="Product Description (Material, Features, etc.)" 
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
            rows={4} 
            className="w-full bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" 
          />
        </div>

        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-2 text-sm text-muted-gold"><input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} className="accent-gold-primary" /> New</label>
          <label className="flex items-center gap-2 text-sm text-muted-gold"><input type="checkbox" checked={form.is_bestseller} onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })} className="accent-gold-primary" /> Bestseller</label>
        </div>
        
        <button type="submit" disabled={uploading} className="w-full gold-gradient-bg text-obsidian py-4 rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 mt-4 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition">
          {uploading ? <><Loader2 className="animate-spin" size={16} /> Uploading...</> : <><Upload size={16} /> Publish Shoe</>}
        </button>
      </form>
    </div>
  );
}
