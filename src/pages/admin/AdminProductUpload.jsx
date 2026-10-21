import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import { z } from 'zod';
import { X, Upload, Loader2, ImagePlus, ArrowLeft, Tag, Layers, IndianRupee, Box, AlignLeft, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  category: z.string().min(1, 'Please select a category'),
});

export default function AdminProductUpload() {
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ 
    title: '', price: '', original_price: '', stock: '', category: '', 
    sizesStr: '', description: '', is_new: false, is_bestseller: false 
  });

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
    if (!files.length) return alert('Please upload at least 1 image');

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
        const { data } = await supabase.storage.from('product-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      
      const { error } = await supabase.from('products').insert({
        title: parsed.data.title, price: parsed.data.price, 
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parsed.data.stock, category: parsed.data.category, images: urls, 
        sizes: sizesArray, size_stock: sizeStock, description: form.description,
        is_new: form.is_new, is_bestseller: form.is_bestseller,
      });
      
      if (error) throw error;
      alert('✅ Product added successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian p-4 md:p-8 pb-24 text-ivory">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/dashboard" className="p-2.5 bg-charcoal border border-white/10 rounded-full hover:border-gold-primary/50 transition">
            <ArrowLeft size={20} className="text-gold-primary" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-ivory">Add New Product</h1>
            <p className="text-xs text-muted-gold mt-1">Fill in the details to publish a new shoe.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. IMAGE UPLOAD SECTION */}
          <div className="bg-charcoal p-6 rounded-2xl border border-white/5 shadow-lg">
            <h2 className="text-sm font-bold text-ivory mb-4 flex items-center gap-2 uppercase tracking-wide">
              <ImagePlus size={18} className="text-gold-primary" /> Product Images (Max 5)
            </h2>
            
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-gold-primary bg-gold-primary/5' : 'border-white/20 hover:border-gold-primary/50 hover:bg-white/5'}`}>
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-3 text-muted-gold" size={32} />
              <p className="text-sm font-semibold text-ivory">Click or drag images here</p>
              <p className="text-xs text-muted-gold mt-1">JPG, WEBP, PNG up to 10MB (Auto-compressed to &lt;1.5MB)</p>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                {files.map((f, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={f.preview} className="w-full h-full object-cover rounded-lg border border-white/10" />
                    <button type="button" onClick={() => setFiles(files.filter((_, x) => x !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition">
                      <X size={14} />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-gold-primary text-obsidian text-[9px] font-bold px-1.5 py-0.5 rounded">MAIN</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. BASIC INFO SECTION */}
          <div className="bg-charcoal p-6 rounded-2xl border border-white/5 shadow-lg space-y-5">
            <h2 className="text-sm font-bold text-ivory mb-2 flex items-center gap-2 uppercase tracking-wide">
              <Tag size={18} className="text-gold-primary" /> Basic Information
            </h2>
            
            <div>
              <label className="text-xs font-semibold text-muted-gold mb-2 block">Product Title</label>
              <input placeholder="e.g. Nike Air Max Premium" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none transition" />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-muted-gold mb-2 block">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none transition appearance-none">
                <option value="">Select a Category</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* 3. PRICING & STOCK SECTION */}
          <div className="bg-charcoal p-6 rounded-2xl border border-white/5 shadow-lg space-y-5">
            <h2 className="text-sm font-bold text-ivory mb-2 flex items-center gap-2 uppercase tracking-wide">
              <IndianRupee size={18} className="text-gold-primary" /> Pricing & Inventory
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-gold mb-2 block">Selling Price (₹)</label>
                <input type="number" placeholder="399" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none transition" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-gold mb-2 block">Original MRP (₹)</label>
                <input type="number" placeholder="999" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none transition" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-gold mb-2 block">Total Stock (Qty)</label>
                <input type="number" placeholder="50" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none transition" />
              </div>
            </div>
          </div>

          {/* 4. SIZES SECTION */}
          <div className="bg-charcoal p-6 rounded-2xl border border-white/5 shadow-lg">
            <h2 className="text-sm font-bold text-ivory mb-2 flex items-center gap-2 uppercase tracking-wide">
              <Layers size={18} className="text-gold-primary" /> Size & Stock Details
            </h2>
            <div>
              <label className="text-xs font-semibold text-muted-gold mb-2 block">Sizes & Stock</label>
              <input placeholder="e.g. 6:5, 7:10, 8:0" value={form.sizesStr} onChange={(e) => setForm({ ...form, sizesStr: e.target.value })} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none transition" />
              <p className="text-[10px] text-muted-gold mt-2">Format: <code className="bg-black px-1 py-0.5 rounded text-gold-primary">Size:Quantity</code> separated by commas. Use 0 for out-of-stock sizes.</p>
            </div>
          </div>

          {/* 5. DESCRIPTION SECTION */}
          <div className="bg-charcoal p-6 rounded-2xl border border-white/5 shadow-lg">
            <h2 className="text-sm font-bold text-ivory mb-2 flex items-center gap-2 uppercase tracking-wide">
              <AlignLeft size={18} className="text-gold-primary" /> Product Description
            </h2>
            <div>
              <label className="text-xs font-semibold text-muted-gold mb-2 block">Description (Optional)</label>
              <textarea placeholder="Describe the material, fit, and features..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none transition resize-none" />
            </div>
          </div>

          {/* 6. FLAGS & SUBMIT */}
          <div className="bg-charcoal p-6 rounded-2xl border border-white/5 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-6 w-full md:w-auto">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} className="w-5 h-5 accent-gold-primary bg-obsidian border-white/20 rounded" />
                <span className="text-sm font-medium text-ivory">Mark as New</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_bestseller} onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })} className="w-5 h-5 accent-gold-primary bg-obsidian border-white/20 rounded" />
                <span className="text-sm font-medium text-ivory">Bestseller</span>
              </label>
            </div>
            
            <button type="submit" disabled={uploading} className="w-full md:w-auto gold-gradient-bg text-obsidian px-8 py-3 rounded-lg font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition disabled:opacity-50">
              {uploading ? <><Loader2 className="animate-spin" size={18} /> Publishing...</> : <><CheckCircle2 size={18} /> Publish Product</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
