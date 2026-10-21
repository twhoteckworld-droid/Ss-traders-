import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Trash2, ArrowLeft, Loader2, Pencil, Plus, AlertTriangle, PackageSearch } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) alert(error.message);
    else setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, title) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert('Error deleting: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian pb-24 font-sans text-ivory">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-charcoal border-b border-white/10 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="p-2.5 bg-obsidian border border-white/10 rounded-full hover:border-gold-primary/50 transition">
              <ArrowLeft size={18} className="text-gold-primary" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-ivory">Manage Products</h1>
              <p className="text-xs text-muted-gold mt-0.5">{products.length} products total</p>
            </div>
          </div>
          
          <Link to="/admin/upload" className="flex items-center justify-center gap-2 gold-gradient-bg text-obsidian px-5 py-2.5 rounded-md font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition">
            <Plus size={16} /> Add New
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-gold-primary mb-4" size={32} />
            <p className="text-muted-gold text-sm">Loading your inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-charcoal border border-white/5 rounded-2xl">
            <PackageSearch size={48} className="text-muted-gold mb-4 opacity-50" />
            <h3 className="text-lg font-serif font-bold text-ivory mb-2">No Products Found</h3>
            <p className="text-sm text-muted-gold mb-6">Your store is empty. Start by adding your first product.</p>
            <Link to="/admin/upload" className="bg-white/5 border border-white/10 text-ivory px-6 py-2 rounded-md font-bold text-xs uppercase hover:bg-white/10 transition">
              Add Product
            </Link>
          </div>
        ) : (
          <div className="bg-charcoal border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-black/40 text-[10px] font-bold uppercase tracking-widest text-muted-gold">
              <div className="col-span-6">Product Info</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Stock</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Product List */}
            <div className="divide-y divide-white/5">
              {products.map((product) => {
                const isOut = product.stock <= 0;
                return (
                  <div key={product.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition group relative">
                    
                    {/* Image & Title */}
                    <div className="col-span-6 flex gap-4 items-center">
                      <div className="w-16 h-16 shrink-0 bg-black rounded-lg border border-white/10 overflow-hidden relative">
                        <img 
                          src={product.images?.[0] || 'https://via.placeholder.com/150'} 
                          className={`w-full h-full object-cover ${isOut ? 'opacity-50 grayscale' : ''}`} 
                          alt={product.title} 
                        />
                        {isOut && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-red-500 bg-black/80 px-1 py-0.5 rounded">OUT</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-serif font-bold text-ivory line-clamp-1">{product.title}</h3>
                        <p className="text-[10px] text-gold-primary uppercase tracking-widest mt-1">{product.category}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 md:text-center flex md:block items-center justify-between mt-2 md:mt-0">
                      <span className="md:hidden text-xs text-muted-gold">Price:</span>
                      <div>
                        <span className="text-base font-bold text-ivory block">₹{product.price}</span>
                        {product.original_price && <span className="text-[10px] text-muted-gold line-through">₹{product.original_price}</span>}
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="col-span-2 md:text-center flex md:block items-center justify-between mt-1 md:mt-0">
                      <span className="md:hidden text-xs text-muted-gold">Stock:</span>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${isOut ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                        {isOut && <AlertTriangle size={12} />}
                        {product.stock} Qty
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-2 mt-3 md:mt-0">
                      <Link 
                        to={`/admin/edit/${product.id}`}
                        className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md hover:bg-blue-500 hover:text-white transition"
                        title="Edit Product"
                      >
                        <Pencil size={16} />
                      </Link>
                      
                      <button 
                        onClick={() => handleDelete(product.id, product.title)}
                        disabled={deletingId === product.id}
                        className="p-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                        title="Delete Product"
                      >
                        {deletingId === product.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
