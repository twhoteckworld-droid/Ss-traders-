import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import { z } from 'zod';
import { X, Upload, Loader2, ImagePlus, ArrowLeft } from 'lucide-react';
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
  const [form, setForm] = useState({ title: '', price: '', original_price: '', stock: '', category: '', sizesStr: '', description: '', is_new: false, is_bestseller: false });

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
          description: data.description || '', // Load Description
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
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        finalImageUrls.push(data.publicUrl);
      }
      const { error } = await supabase.from('products').update({
        title: parsed.data.title, price: parsed.data.price, original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parsed.data.stock, category: parsed.data.category, images: finalImageUrls,
        sizes: sizesArray, size_stock: sizeStock, 
        description: form.description, // Update Description
        is_new: form.is_new, is_bestseller: form.is_bestseller,
      }).eq('id', id);
      if (error) throw error;
      alert('✅ Product updated!');
      navigate('/admin/products');
    } catch (err) {
      alert('Error updating: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-center flex justify-center bg-obsidian min-h-screen"><Loader2 className="animate-spin text-gold-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 text-ivory bg-obsidian min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/products" className="p-2 bg-charcoal rounded-full border border-white/10"><ArrowLeft size={20} className="text-gold-primary" /></Link>
        <h1 className="text-2xl font-serif font-bold">Edit Product</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {existingImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {existingImages.map((url, i) => (
                <div key={i} className="relative"><img src={url} className="h-24 w-full object-cover rounded-lg border border-white/10" /><button type="button" onClick={() => setExistingImages(existingImages.filter((_, index) => index !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10} /></button></div>
              ))}
            </div>
          )}
          {newFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {newFiles.map((f, i) => (
                <div key={i} className="relative"><img src={f.preview} className="h-24 w-full object-cover rounded-lg border-2 border-gold-primary" /><button type="button" onClick={() => setNewFiles(newFiles.filter((_, index) => index !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10} /></button></div>
              ))}
            </div>
          )}
          {(existingImages.length + newFiles.length) < 5 && (
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-4 text-center ${isDragActive ? 'border-gold-primary bg-gold-primary/10' : 'border-white/20'}`}>
              <input {...getInputProps()} />
              <ImagePlus className="mx-auto mb-1 text-gold-primary" size={24} />
              <p className="text-xs text-muted-gold">Add more images</p>
            </div>
          )}
        </div>
        
        <input placeholder="Shoe Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Selling Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
          <input type="number" placeholder="MRP" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
          <input type="number" placeholder="Total Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none">
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        
        <div>
          <input placeholder="Sizes & Stock e.g. 6:5, 7:10" value={form.sizesStr} onChange={(e) => setForm({ ...form, sizesStr: e.target.value })} className="w-full bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" />
        </div>

        {/* Naya Description Field */}
        <div>
          <textarea 
            placeholder="Product Description" 
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
            rows={4} 
            className="w-full bg-charcoal border border-white/10 text-ivory rounded-lg p-3 text-sm focus:border-gold-primary outline-none" 
          />
        </div>

        <div className="flex gap-6 mt-2 bg-charcoal p-3 rounded-lg border border-white/10">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-gold"><input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} className="accent-gold-primary" /> New</label>
          <label className="flex items-center gap-2 text-sm font-medium text-muted-gold"><input type="checkbox" checked={form.is_bestseller} onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })} className="accent-gold-primary" /> Bestseller</label>
        </div>
        
        <button type="submit" disabled={uploading} className="w-full gold-gradient-bg text-obsidian py-4 rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 mt-4 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition">
          {uploading ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : 'Update Product'}
        </button>
      </form>
    </div>
  );
}
