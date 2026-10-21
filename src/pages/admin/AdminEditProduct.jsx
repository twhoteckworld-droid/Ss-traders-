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
  
  // State for images
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  
  const [form, setForm] = useState({
    title: '', price: '', original_price: '', stock: '', category: '', sizesStr: '',
    is_new: false, is_bestseller: false,
  });

  useEffect(() => {
    // Fetch categories
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []));
    
    // Fetch product details
    const fetchProduct = async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) {
        alert('Product not found!');
        navigate('/admin/products');
      } else {
        setForm({
          title: data.title,
          price: data.price.toString(),
          original_price: data.original_price ? data.original_price.toString() : '',
          stock: data.stock.toString(),
          category: data.category,
          sizesStr: data.sizes ? data.sizes.join(', ') : '',
          is_new: data.is_new,
          is_bestseller: data.is_bestseller,
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
    onDrop,
    accept: { 'image/webp': ['.webp'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
    });
    
    if (!parsed.success) return alert(parsed.error.issues[0].message);
    
    const totalImages = existingImages.length + newFiles.length;
    if (totalImages === 0) return alert('At least 1 image is required');
    if (totalImages > 5) return alert('Maximum 5 images allowed in total');

    const sizesArray = form.sizesStr ? form.sizesStr.split(',').map(s => s.trim()).filter(Boolean) : [];

    setUploading(true);
    try {
      let finalImageUrls = [...existingImages];

      // Upload new images if any
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

      // Update Database
      const { error } = await supabase.from('products').update({
        title: parsed.data.title,
        price: parsed.data.price,
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parsed.data.stock,
        category: parsed.data.category,
        images: finalImageUrls,
        sizes: sizesArray,
        is_new: form.is_new,
        is_bestseller: form.is_bestseller,
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

  if (loading) return <div className="p-10 text-center flex justify-center"><Loader2 className="animate-spin text-emerald-700" /></div>;

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/products" className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* --- IMAGES SECTION --- */}
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-2 block">Product Images (Max 5)</label>
          
          {/* Existing Images Preview */}
          {existingImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {existingImages.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} className="h-24 w-full object-cover rounded-lg border border-gray-200" />
                  <button 
                    type="button" 
                    onClick={() => setExistingImages(existingImages.filter((_, index) => index !== i))} 
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Images Preview */}
          {newFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {newFiles.map((f, i) => (
                <div key={i} className="relative">
                  <img src={f.preview} className="h-24 w-full object-cover rounded-lg border-2 border-emerald-400" />
                  <button 
                    type="button" 
                    onClick={() => setNewFiles(newFiles.filter((_, index) => index !== i))} 
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Dropzone (only show if less than 5 total) */}
          {(existingImages.length + newFiles.length) < 5 && (
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-4 text-center ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'}`}>
              <input {...getInputProps()} />
              <ImagePlus className="mx-auto mb-1 text-gray-400" size={24} />
              <p className="text-xs text-gray-600">Add more images</p>
            </div>
          )}
        </div>

        <input placeholder="Shoe Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg p-3 text-sm font-semibold" />
        
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Selling Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border rounded-lg p-3 text-sm" />
          <input type="number" placeholder="MRP / Original Price" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="border rounded-lg p-3 text-sm" />
          <input type="number" placeholder="Stock Qty" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border rounded-lg p-3 text-sm" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border rounded-lg p-3 text-sm bg-white">
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <input placeholder="Sizes e.g. 6, 7, 8 or 36, 37, 38" value={form.sizesStr} onChange={(e) => setForm({ ...form, sizesStr: e.target.value })} className="w-full border rounded-lg p-3 text-sm" />
          <p className="text-[10px] text-gray-400 mt-1">Separate sizes with commas.</p>
        </div>

        <div className="flex gap-6 mt-2 bg-gray-50 p-3 rounded-lg">
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} className="w-4 h-4" /> Mark as New</label>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.is_bestseller} onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })} className="w-4 h-4" /> Bestseller</label>
        </div>

        <button type="submit" disabled={uploading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-4 shadow-lg shadow-blue-600/30">
          {uploading ? <><Loader2 className="animate-spin" size={18} /> Saving Changes...</> : 'Update Product'}
        </button>
      </form>
    </div>
  );
}
