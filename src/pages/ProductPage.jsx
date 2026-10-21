import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { ArrowLeft, ShoppingBag, Star } from 'lucide-react';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const cartCount = useCartStore((s) => s.items.length);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error || !data) {
        alert('Product not found');
        navigate('/');
      } else {
        setProduct(data);
        // Auto select first available size
        if (data.sizes && data.sizes.length > 0) {
          const firstAvailable = data.sizes.find(s => (data.size_stock?.[s] || 0) > 0);
          setSelectedSize(firstAvailable || '');
        }
      }
      setLoading(false);
    })();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product.stock <= 0) return alert('Product out of stock!');
    if (product.sizes && product.sizes.length > 0 && !selectedSize) return alert('Please select an available size');
    
    // Check size stock
    if (selectedSize && (product.size_stock?.[selectedSize] || 0) <= 0) {
      return alert('This size is out of stock!');
    }

    addItem(product, selectedSize);
    openCart();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={18} /></button>
        <h1 className="text-sm font-bold text-gray-900 line-clamp-1 flex-1 px-4">{product.title}</h1>
        <button onClick={openCart} className="relative p-2">
          <ShoppingBag size={22} className="text-gray-700" />
          {cartCount > 0 && <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}
        </button>
      </header>

      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide" onScroll={(e) => setActiveImage(Math.round(e.target.scrollLeft / e.target.clientWidth))}>
          {product.images?.map((img, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 snap-center"><img src={img} alt={product.title} className="w-full h-full object-cover" /></div>
          ))}
        </div>
        {product.images?.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {product.images.map((_, idx) => (
              <div key={idx} className={`h-1.5 rounded-full transition-all ${activeImage === idx ? 'w-4 bg-emerald-700' : 'w-1.5 bg-gray-300'}`} />
            ))}
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-lg font-bold px-6 py-2 rounded-full shadow-2xl rotate-[-10deg]">SOLD OUT</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 mt-1 leading-tight">{product.title}</h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 text-xs font-bold"><Star size={12} className="fill-emerald-700" /> 4.8</div>
          <span className="text-xs text-gray-400">|</span>
          <span className={`text-xs font-medium ${isOutOfStock ? 'text-red-500' : 'text-gray-500'}`}>
            {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
          </span>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <span className="text-3xl font-black text-gray-900">₹{product.price}</span>
          {product.original_price && (
            <div className="flex flex-col mb-1">
              <span className="text-sm text-gray-400 line-through">MRP: ₹{product.original_price}</span>
              <span className="text-xs text-emerald-600 font-bold">{discount}% OFF</span>
            </div>
          )}
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Select Size</h3>
            <div className="grid grid-cols-4 gap-2">
              {product.sizes.map((size) => {
                const sizeQty = product.size_stock?.[size] || 0;
                const isSizeOut = sizeQty <= 0;
                return (
                  <button 
                    key={size} 
                    onClick={() => setSelectedSize(size)} 
                    disabled={isOutOfStock || isSizeOut} 
                    className={`relative py-3 rounded-xl border-2 font-bold text-sm transition-all 
                      ${selectedSize === size ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-gray-200 text-gray-600'} 
                      ${(isOutOfStock || isSizeOut) ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : ''}`}
                  >
                    {size}
                    {isSizeOut && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-red-400 rotate-45 transform origin-center"></div></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 z-40 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
        <button onClick={openCart} className="flex-1 bg-gray-100 text-gray-900 font-bold py-3.5 rounded-xl">Go to Cart</button>
        <button onClick={handleAddToCart} disabled={isOutOfStock} className={`flex-[2] font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 ${isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/20'}`}>
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
