import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import { z } from 'zod';
import { X, Upload, Loader2, ImagePlus, ArrowLeft, Tag, Layers, IndianRupee, AlignLeft, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

const schema = z.object({
  title: z.string().min(3, 'Title required'),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category: z.string().min(1, 'Select a category'),
});

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  
  const [form, setForm] = useState({ 
    title: '', price: '', original_price: '', stock: '', category: '', 
    sizesStr: '', description: '', is_new: false, is_bestseller: false 
  });

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []));
    
    const fetchProduct = async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) { alert('Product not found!'); navigate('/admin/products'); } 
      else {
        let sizesStr = '';
        if (data.sizes && data.sizes.length > 0) {
          sizesStr = data.sizes.map(s => `${s}:${data.size_stock?.[s] || 0}`).join(', ');
        }
        setForm({
          title: data.title, price: data.price.toString(), original_price: data.original_price ? data.original_price.toString() : '',
          stock: data.stock.toString(), category: data.category, sizesStr: sizesStr,
          description: data.description || '',
          is_new: data.is_new, is_bestseller: data.is_bestseller,
        });
        setExistingImages(data.images || []);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id, navigate]);

  const onDrop = useCallback((ok, rej) => {
    if (rej.length) alert(`Rejected: ${rej[0].errors[0].message}`);
    setNewFiles((prev) => [...prev, ...ok.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/webp': ['.webp'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }, maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) });
    if (!parsed.success) return alert(parsed.error.issues[0].message);
    const totalImages = existingImages.length + newFiles.length;
    if (totalImages === 0) return alert('At least 1 image required');
    if (totalImages > 5) return alert('Maximum 5 images allowed');

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
      let finalImageUrls = [...existingImages];
      for (const { file } of newFiles) {
        const options = { maxSizeMB: 1.5, maxWidthOrHeight: 1200, useWebWorker: true, fileType: 'image/jpeg' };
        let fileToUpload = file;
        try { fileToUpload = await imageCompression(file, options); } catch (err) { console.log(err); }
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error } = await supabase.storage.from('product-images').upload(path, fileToUpload);
        if (error) throw error;
        const { data } = await supabase.storage.from('product-images').getPublicUrl(path);
        finalImageUrls.push(data.publicUrl);
      }
      
      const { error } = await supabase.from('products').update({
        title: parsed.data.title, price: parsed.data.price, original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parsed.data.stock, category: parsed.data.category, images: finalImageUrls,
        sizes: sizesArray, size_stock: sizeStock, description: form.description,
        is_new: form.is_new, is_bestseller: form.is_bestseller,
      }).eq('id', id);
      
      if (error) throw error;
      alert('✅ Product updated successfully!');
      navigate('/admin/products');
    } catch (err) {
      alert('Error updating: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-center flex justify-center bg-obsidian min-h-screen"><Loader2 className="animate-spin text-gold-primary" size={32} /></div>;

  return (
    <div className="min-h-screen bg-obsidian p-4 md:p-8 pb-24 text-ivory">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/products" className="p-2.5 bg-charcoal border border-white/10 rounded-full hover:border-gold-primary/50 transition">
            <ArrowLeft size={20} className="text-gold-primary" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-ivory">Edit Product</h1>
            <p className="text-xs text-muted-gold mt-1">Update details for "{form.title}"</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* IMAGES */}
          <div className="bg-charcoal p-6 rounded-2xl border border-white/5 shadow-lg">
            <h2 className="text-sm font-bold text-ivory mb-4 flex items-center gap-2 uppercase tracking-wide"><ImagePlus size={18} className="text-gold-primary" /> Product Images (Max 5)</h2>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
              {/* Existing Images */}
              {existingImages.map((url, i) => (
                <div key={`exist-${i}`} className="relative group aspect-square">
                  <img src={url} className="w-full h-full object-cover rounded-lg border border-white/10" />
                  <button type="button" onClick={() => setExistingImages(existingImages.filter((_, index) => index !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition"><X size={14} /></button>
                </div>
              ))}
              {/* New Images */}
              {newFiles.map((f, i) => (
                <div key={`new-${i}`} className="relative group aspect-square">
                  <img src={f.preview} className="w-full h-full object-cover rounded-lg border-2 border-gold-primary" />
                  <button type="button" onClick={() => setNewFiles(newFiles.filter((_, index) => index !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition"><X size={14} /></button>
                  <span className="absolute bottom-1 left-1 bg-gold-primary text-obsidian text-[9px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                </div>
              ))}
            </div>

            {(existingImages.length + newFiles.length) < 5 && (
              <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-gold-primary bg-gold-primary/5' : 'border-white/20 hover:border-gold-primary/50 hover:bg-white/5'}`}>
                <input {...getInputProps()} />
                <Upload className="mx-auto mb-2 text-muted-gold" size={24} />
                <p className="text-xs font-semibold text-ivory">Click to add more images</p>
              </div>
            )}
          </div>

          {/* BASIC INFO */}
          <div className="bg-charcoal p-6 rounded-2xl border border-white/5 shadow-lg space-y-5">
            <h2 className="text-sm font-bold text-ivory mb-2 flex items-center gap-2 uppercase tracking-wide"><Tag size={18} className="text-gold-primary" /> Basic Information</h2>
            <div>
              <label className="text-xs font-semibold text-muted-gold mb-2 block">Product Title</label>
              <input placeholder="Shoe Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-gold mb-2 block">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none appearance-none">
                <option value="">Select a Category</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* PRICING */}
          <div className="bg-charcoal p-6 rounded-2xl border border-white/5 shadow-lg space-y-5">
            <h2 className="text-sm font-bold text-ivory mb-2 flex items-center gap-2 uppercase tracking-wide"><IndianRupee size={18} className="text-gold-primary" /> Pricing & Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-gold mb-2 block">Selling Price (₹)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-gold mb-2 block">Original MRP (₹)</label>
                <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-gold mb-2 block">Total Stock (Qty)</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
              </div>
            </div>
          </div>

          {/* SIZES */}
          <div className="bg-charcoal p-6 rounded-2xl border border-white/5 shadow-lg">
            <h2 className="text-sm font-bold text-ivory mb-2 flex items-center gap-2 uppercase tracking-wide"><Layers size={18} className="text-gold-primary" /> Size & Stock Details</h2>
            <div>
              <label className="text-xs font-semibold text-muted-gold mb-2 block">Sizes & Stock</label>
              <input value={form.sizesStr} onChange={(e) => setForm({ ...form, sizesStr: e.target.value })} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
              <p className="text-[10px] text-muted-gold mt-2">Format: <code className="bg-black px-1 py-0.5 rounded text-gold-primary">Size:Quantity</code> separated by commas.</p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="bg-charcoal p-6 rounded-2xl border border-white/5 shadow-lg">
            <h2 className="text-sm font-bold text-ivory mb-2 flex items-center gap-2 uppercase tracking-wide"><AlignLeft size={18} className="text-gold-primary" /> Product Description</h2>
            <div>
              <label className="text-xs font-semibold text-muted-gold mb-2 block">Description (Optional)</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full bg-obsidian border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none resize-none" />
            </div>
          </div>

          {/* SUBMIT */}
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
              {uploading ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : <><CheckCircle2 size={18} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
