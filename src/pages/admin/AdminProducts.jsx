import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Trash2, ArrowLeft, Loader2, Pencil } from 'lucide-react';

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
    const confirmDelete = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
      alert('✅ Product deleted successfully!');
    } catch (err) {
      alert('Error deleting: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <Link to="/admin/dashboard" className="p-2 bg-gray-100 rounded-full active:bg-gray-200">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-emerald-900">Manage Products</h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-emerald-700" size={32} />
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No products found.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 items-center">
              <img 
                src={product.images?.[0] || 'https://via.placeholder.com/150'} 
                className="w-16 h-16 object-cover rounded-lg bg-gray-100" 
                alt={product.title} 
              />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{product.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Price: ₹{product.price} | Stock: {product.stock}</p>
                <p className="text-[10px] text-gray-400 uppercase mt-1">{product.category}</p>
              </div>
              
              <div className="flex gap-2">
                {/* Edit Button */}
                <Link 
                  to={`/admin/edit/${product.id}`}
                  className="p-2.5 bg-blue-50 text-blue-600 rounded-lg active:scale-95 transition hover:bg-blue-100"
                >
                  <Pencil size={18} />
                </Link>
                
                {/* Delete Button */}
                <button 
                  onClick={() => handleDelete(product.id, product.title)}
                  disabled={deletingId === product.id}
                  className="p-2.5 bg-red-50 text-red-600 rounded-lg active:scale-95 transition hover:bg-red-100 disabled:opacity-50"
                >
                  {deletingId === product.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
