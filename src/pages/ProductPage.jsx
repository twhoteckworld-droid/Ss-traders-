import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { ArrowLeft, ShoppingBag, Star, ChevronRight, Share2 } from 'lucide-react';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const setBuyNowMode = useCartStore((s) => s.setBuyNowMode);
  const cartCount = useCartStore((s) => s.items.length);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error || !data) { alert('Product not found'); navigate('/'); } 
      else {
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          const firstAvailable = data.sizes.find(s => (data.size_stock?.[s] || 0) > 0);
          setSelectedSize(firstAvailable || '');
        }
      }
      setLoading(false);
    })();
  }, [id, navigate]);

  const validateSelection = () => {
    if (product.stock <= 0) { alert('Product out of stock!'); return false; }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) { alert('Please select an available size'); return false; }
    if (selectedSize && (product.size_stock?.[selectedSize] || 0) <= 0) { alert('This size is out of stock!'); return false; }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    addItem(product, selectedSize);
    openCart();
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    addItem(product, selectedSize);
    setBuyNowMode(true);
    openCart();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-white pb-32 font-sans relative">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 py-4 flex items-center justify-between pointer-events-none">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm pointer-events-auto active:scale-95 transition"><ArrowLeft size={18} /></button>
        <div className="flex gap-2 pointer-events-auto">
          <button className="p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm active:scale-95 transition"><Share2 size={18} /></button>
          <button onClick={openCart} className="relative p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm active:scale-95 transition">
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* Full Image Gallery */}
      <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden">
        <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide" onScroll={(e) => setActiveImage(Math.round(e.target.scrollLeft / e.target.clientWidth))}>
          {product.images?.map((img, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 snap-center"><img src={img} alt={product.title} className="w-full h-full object-cover" /></div>
          ))}
        </div>
        {product.images?.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
            {product.images.map((_, idx) => (
              <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === idx ? 'w-6 bg-black' : 'w-1.5 bg-black/20'}`} />
            ))}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="px-6 pt-8 pb-4 relative bg-white rounded-t-[2.5rem] -mt-6 z-10">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] text-emerald-800 uppercase font-bold tracking-widest bg-emerald-50 px-2 py-1 rounded-md">{product.category}</p>
          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-xs font-bold"><Star size={12} className="fill-black" /> 4.8</div>
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 leading-[1.1] tracking-tight mb-2">{product.title}</h2>
        
        <div className="flex items-end gap-3 mt-4 mb-8">
          <span className="text-3xl font-black text-gray-900">₹{product.price}</span>
          {product.original_price && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-400 line-through font-medium">₹{product.original_price}</span>
              <span className="text-xs text-white bg-green-600 px-2 py-0.5 rounded font-bold">{discount}% OFF</span>
            </div>
          )}
        </div>

        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900">Select Size</h3>
              <button className="text-xs text-gray-500 font-medium underline underline-offset-2">Size Guide</button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.sizes.map((size) => {
                const isSizeOut = product.size_stock?.[size] !== undefined ? product.size_stock[size] <= 0 : false;
                return (
                  <button key={size} onClick={() => setSelectedSize(size)} disabled={isOutOfStock || isSizeOut} className={`relative py-3.5 rounded-2xl border-2 font-bold text-sm transition-all ${selectedSize === size ? 'border-black bg-black text-white shadow-lg' : 'border-gray-200 text-gray-600 hover:border-gray-300'} ${(isOutOfStock || isSizeOut) ? 'opacity-40 cursor-not-allowed bg-gray-50' : ''}`}>
                    {size}
                    {isSizeOut && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-red-500 rotate-45"></div></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-gray-100 pt-6">
           <h3 className="text-sm font-bold text-gray-900 mb-3">Product Description</h3>
           <p className="text-sm text-gray-500 leading-relaxed">
             Step into ultimate comfort with SS Traders. Crafted with premium materials, these shoes are designed for all-day wear, providing unmatched support and a timeless style that elevates any outfit.
           </p>
        </div>
      </div>

      {/* Sticky Bottom Bar (Precision Designed) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 pb-6 flex gap-3 z-40 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
        <button onClick={handleAddToCart} disabled={isOutOfStock} className={`flex-1 font-bold py-4 rounded-2xl transition flex items-center justify-center border-2 border-black text-black ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}>
          Add to Cart
        </button>
        <button onClick={handleBuyNow} disabled={isOutOfStock} className={`flex-[1.5] font-bold py-4 rounded-2xl transition flex items-center justify-center ${isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white shadow-xl shadow-black/20 active:scale-95'}`}>
          {isOutOfStock ? 'Sold Out' : 'Buy It Now'}
        </button>
      </div>
    </div>
  );
}
