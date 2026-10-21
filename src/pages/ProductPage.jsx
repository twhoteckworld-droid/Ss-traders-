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
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      
      if (error || !data) { alert('Product not found'); navigate('/'); } 
      else {
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          const firstAvailable = data.sizes.find(s => (data.size_stock?.[s] || 0) > 0);
          setSelectedSize(firstAvailable || '');
        }
        // Fetch Related Products (Limit 10 for sliding)
        const { data: relatedData } = await supabase.from('products').select('*').eq('category', data.category).neq('id', data.id).limit(10);
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

  const handleAddToCart = () => { if (!validateSelection()) return; addItem(product, selectedSize); openCart(); };
  const handleBuyNow = () => { if (!validateSelection()) return; addItem(product, selectedSize); setBuyNowMode(true); openCart(); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-obsidian"><div className="w-8 h-8 border-4 border-gold-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-obsidian pb-10 font-sans text-ivory">
      
      {/* HEADER */}
      <header className="bg-charcoal border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-muted-gold hover:text-ivory transition">
            <ArrowLeft size={18} /> Back
          </button>
          <button onClick={openCart} className="relative text-ivory">
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-gold-primary text-obsidian text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {/* 2-Column Layout like Amazon (Image Left, Details Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-charcoal p-4 md:p-8 rounded-sm border border-white/5 shadow-lg">
          
          {/* LEFT: Image Gallery */}
          <div className="md:col-span-5 flex flex-col md:flex-row gap-4">
            <div className="hidden md:flex flex-col gap-2 w-16">
               {product.images?.map((img, idx) => (
                 <img key={idx} src={img} onClick={() => setActiveImage(idx)} className={`w-full aspect-square object-cover cursor-pointer border ${activeImage === idx ? 'border-gold-primary' : 'border-transparent opacity-50 hover:opacity-100'}`} />
               ))}
            </div>
            <div className="flex-1 relative bg-black rounded-sm overflow-hidden aspect-square border border-white/10">
              <img src={product.images?.[activeImage]} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="md:col-span-7">
            <p className="text-xs text-gold-primary uppercase font-bold tracking-widest mb-2">{product.category}</p>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-ivory mb-2">{product.title}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-gold-primary">
                <Star size={14} className="fill-gold-primary" /><Star size={14} className="fill-gold-primary" /><Star size={14} className="fill-gold-primary" /><Star size={14} className="fill-gold-primary" /><Star size={14} className="fill-gold-primary" />
              </div>
              <span className="text-xs text-muted-gold">4.8 (124 ratings)</span>
            </div>

            <hr className="border-white/10 my-4" />

            <div className="flex items-end gap-3 mb-2">
              {discount > 0 && <span className="text-2xl text-red-500 font-medium">-{discount}%</span>}
              <span className="text-3xl font-bold text-ivory">₹{product.price}</span>
            </div>
            {product.original_price && (
              <p className="text-sm text-muted-gold">M.R.P.: <span className="line-through">₹{product.original_price}</span></p>
            )}
            <p className="text-xs text-green-500 mt-1 font-medium">Inclusive of all taxes</p>

            <hr className="border-white/10 my-6" />

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-ivory mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSizeOut = product.size_stock?.[size] <= 0;
                    return (
                      <button key={size} onClick={() => setSelectedSize(size)} disabled={isOutOfStock || isSizeOut} className={`w-14 py-2 rounded-sm border text-sm font-bold transition-all ${selectedSize === size ? 'border-gold-primary bg-gold-primary/10 text-gold-primary' : 'border-white/20 text-muted-gold hover:border-gold-primary/50'} ${isSizeOut ? 'opacity-30 cursor-not-allowed line-through' : ''}`}>
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-ivory mb-2">About this item</h3>
              <p className="text-sm text-muted-gold leading-relaxed whitespace-pre-wrap">
                {product.description || "Step into ultimate comfort with SS Traders. Crafted with premium materials, these shoes are designed for all-day wear, providing unmatched support and a timeless style that elevates any outfit."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="border border-white/10 p-4 rounded-sm bg-obsidian-light flex flex-col gap-3">
               <button onClick={handleBuyNow} disabled={isOutOfStock} className="w-full gold-gradient-bg text-obsidian py-3 rounded-full font-bold text-sm active:scale-95 transition">
                 {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
               </button>
               <button onClick={handleAddToCart} disabled={isOutOfStock} className="w-full bg-charcoal border border-gold-primary text-gold-primary py-3 rounded-full font-bold text-sm active:scale-95 transition hover:bg-gold-primary/10">
                 Add to Cart
               </button>
            </div>
          </div>
        </div>

        {/* HORIZONTAL SCROLL FOR RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 bg-charcoal p-4 md:p-6 rounded-sm border border-white/5 shadow-lg">
            <h3 className="text-xl font-serif font-bold text-ivory mb-4">Products related to this item</h3>
            
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x">
              {relatedProducts.map((rp) => (
                <div 
                  key={rp.id} 
                  onClick={() => { navigate(`/product/${rp.id}`); window.scrollTo(0,0); }} 
                  className="w-40 md:w-56 flex-shrink-0 snap-start bg-obsidian border border-white/10 p-3 rounded-sm cursor-pointer hover:border-gold-primary/50 transition group"
                >
                  <div className="aspect-square bg-black mb-3 overflow-hidden rounded-sm relative">
                    <img src={rp.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <h4 className="text-xs md:text-sm text-ivory line-clamp-1 group-hover:text-gold-primary transition">{rp.title}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-sm font-bold text-gold-primary">₹{rp.price}</p>
                    {rp.original_price && <p className="text-[10px] text-muted-gold line-through">₹{rp.original_price}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
