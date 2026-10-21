import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { ArrowLeft, ShoppingBag, Star, Share2 } from 'lucide-react';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const setBuyNowMode = useCartStore((s) => s.setBuyNowMode);
  const cartCount = useCartStore((s) => s.items.length);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // 1. Fetch main product
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      
      if (error || !data) { 
        alert('Product not found'); 
        navigate('/'); 
      } else {
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          const firstAvailable = data.sizes.find(s => (data.size_stock?.[s] || 0) > 0);
          setSelectedSize(firstAvailable || '');
        }

        // 2. Fetch related products (Same category, excluding current product)
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(4);
        
        setRelatedProducts(relatedData || []);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-obsidian"><div className="w-8 h-8 border-4 border-gold-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-obsidian pb-32 font-sans relative text-ivory">
      <header className="fixed top-0 left-0 right-0 z-40 px-4 py-4 flex items-center justify-between pointer-events-none">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-full shadow-sm pointer-events-auto active:scale-95 transition text-ivory hover:text-gold-primary"><ArrowLeft size={18} /></button>
        <div className="flex gap-2 pointer-events-auto">
          <button className="p-2.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-full shadow-sm active:scale-95 transition text-ivory hover:text-gold-primary"><Share2 size={18} /></button>
          <button onClick={openCart} className="relative p-2.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-full shadow-sm active:scale-95 transition text-ivory hover:text-gold-primary">
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-gold-primary text-obsidian text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* IMAGE GALLERY */}
      <div className="relative w-full aspect-[4/5] bg-charcoal overflow-hidden border-b border-white/5">
        <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide" onScroll={(e) => setActiveImage(Math.round(e.target.scrollLeft / e.target.clientWidth))}>
          {product.images?.map((img, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 snap-center"><img src={img} alt={product.title} className="w-full h-full object-cover" /></div>
          ))}
        </div>
        {product.images?.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
            {product.images.map((_, idx) => (
              <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === idx ? 'w-6 bg-gold-primary' : 'w-1.5 bg-white/20'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pt-8 pb-4 relative bg-obsidian rounded-t-[2.5rem] -mt-6 z-10 border-t border-white/5">
        <div className="flex justify-between items-start mb-3">
          <p className="text-[10px] text-gold-primary uppercase font-bold tracking-widest border border-gold-primary/30 px-2 py-1 rounded">{product.category}</p>
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded text-xs font-bold text-muted-gold"><Star size={12} className="fill-gold-primary text-gold-primary" /> 4.8</div>
        </div>
        
        <h2 className="text-3xl font-serif font-bold text-ivory leading-[1.1] tracking-wide mb-3">{product.title}</h2>
        
        <div className="flex items-end gap-4 mt-6 mb-8 border-b border-white/10 pb-6">
          <span className="text-3xl font-black text-gold-primary">₹{product.price}</span>
          {product.original_price && (
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm text-muted-gold line-through font-medium">₹{product.original_price}</span>
              <span className="text-[10px] text-black bg-gold-primary px-2 py-0.5 rounded font-black tracking-widest">{discount}% OFF</span>
            </div>
          )}
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-bold text-ivory uppercase tracking-widest">Select Size</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.sizes.map((size) => {
                const isSizeOut = product.size_stock?.[size] !== undefined ? product.size_stock[size] <= 0 : false;
                return (
                  <button key={size} onClick={() => setSelectedSize(size)} disabled={isOutOfStock || isSizeOut} className={`relative py-3.5 rounded-xl border font-bold text-sm transition-all ${selectedSize === size ? 'border-gold-primary bg-gold-primary/10 text-gold-primary shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'border-white/10 text-muted-gold hover:border-gold-primary/50'} ${(isOutOfStock || isSizeOut) ? 'opacity-40 cursor-not-allowed bg-transparent' : ''}`}>
                    {size}
                    {isSizeOut && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-red-500/50 rotate-45"></div></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* DYNAMIC PRODUCT DESCRIPTION */}
        <div className="border-t border-white/10 pt-6">
           <h3 className="text-sm font-bold text-ivory mb-3 uppercase tracking-widest">Product Details</h3>
           <p className="text-sm text-muted-gold leading-relaxed font-medium whitespace-pre-wrap">
             {product.description || "Step into ultimate comfort with SS Traders. Crafted with premium materials, these shoes are designed for all-day wear, providing unmatched support and a timeless style that elevates any outfit."}
           </p>
        </div>
      </div>

      {/* RELATED PRODUCTS (Amazon Style) */}
      {relatedProducts.length > 0 && (
        <div className="px-6 py-8 mt-4 bg-charcoal-light border-t border-white/5">
          <h3 className="text-xl font-serif font-bold text-ivory mb-6 tracking-wide">You May Also Like</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {relatedProducts.map((rp) => (
              <div 
                key={rp.id} 
                onClick={() => { navigate(`/product/${rp.id}`); window.scrollTo(0, 0); }}
                className="w-40 flex-shrink-0 snap-start cursor-pointer group"
              >
                <div className="relative aspect-[3/4] bg-obsidian rounded-lg overflow-hidden border border-white/10 group-hover:border-gold-primary/50 transition">
                  <img src={rp.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="mt-3">
                  <p className="text-[9px] text-gold-primary uppercase font-bold tracking-widest mb-1">{rp.category}</p>
                  <h4 className="text-xs font-bold text-ivory line-clamp-1 group-hover:text-gold-primary transition">{rp.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-ivory">₹{rp.price}</span>
                    {rp.original_price && <span className="text-[10px] text-muted-gold line-through">₹{rp.original_price}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-obsidian/90 backdrop-blur-xl border-t border-white/10 p-4 pb-6 flex gap-3 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button onClick={handleAddToCart} disabled={isOutOfStock} className={`flex-1 font-bold py-4 rounded-xl transition flex items-center justify-center border-2 border-gold-primary text-gold-primary uppercase tracking-widest text-xs ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 hover:bg-gold-primary/10'}`}>
          Add to Cart
        </button>
        <button onClick={handleBuyNow} disabled={isOutOfStock} className={`flex-[1.5] font-black py-4 rounded-xl transition flex items-center justify-center uppercase tracking-widest text-xs ${isOutOfStock ? 'bg-charcoal text-muted-gold cursor-not-allowed' : 'gold-gradient-bg text-obsidian shadow-[0_0_15px_rgba(212,175,55,0.3)] active:scale-95'}`}>
          {isOutOfStock ? 'Sold Out' : 'Buy It Now'}
        </button>
      </div>
    </div>
  );
}
