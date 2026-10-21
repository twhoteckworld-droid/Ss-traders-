import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { ArrowLeft, ShoppingBag, Image as ImageIcon } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const openCart = useCartStore((s) => s.openCart);
  const cartCount = useCartStore((s) => s.items.length);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('category', slug);
      setProducts(data || []);
      setLoading(false);
    })();
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 font-sans">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition"><ArrowLeft size={18} /></Link>
            <h1 className="text-xl md:text-2xl font-black capitalize text-gray-900 tracking-tight">{slug.replace('-', ' ')}</h1>
          </div>
          <button onClick={openCart} className="relative p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <ShoppingBag size={20} className="text-gray-800" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">{cartCount}</span>}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
          {loading ? <p className="col-span-full text-center py-10">Loading...</p> :
           products.length === 0 ? <p className="col-span-full text-center py-10 text-gray-500">No products found in this category.</p> :
           products.map((p) => (
              <Link to={`/product/${p.id}`} key={p.id} className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative group">
                <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                  <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  {p.images?.length > 1 && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                      <ImageIcon size={10} /> {p.images.length}
                    </div>
                  )}
                  {p.original_price && (
                    <span className="absolute top-2 right-2 bg-amber-400 text-[10px] font-bold px-2 py-1 rounded-sm">
                      {Math.round(((p.original_price - p.price) / p.original_price) * 100)}% OFF
                    </span>
                  )}
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-1">
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-1">{p.category}</p>
                  <h4 className="text-sm md:text-base font-bold text-gray-900 line-clamp-1 leading-tight">{p.title}</h4>
                  <div className="mt-auto pt-3 flex items-end justify-between">
                    <div>
                      {p.original_price && <span className="text-[10px] md:text-xs text-gray-400 line-through block">₹{p.original_price}</span>}
                      <span className="text-sm md:text-base font-black text-emerald-950">₹{p.price}</span>
                    </div>
                  </div>
                </div>
              </Link>
           ))}
        </div>
      </main>
    </div>
  );
}
