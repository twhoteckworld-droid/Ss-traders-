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
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={18} /></Link>
          <h1 className="text-lg font-black capitalize text-gray-900">{slug.replace('-', ' ')}</h1>
        </div>
        <button onClick={openCart} className="relative p-2">
          <ShoppingBag size={22} className="text-gray-700" />
          {cartCount > 0 && <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}
        </button>
      </header>

      <div className="p-4 grid grid-cols-2 gap-4">
        {loading ? <p className="col-span-2 text-center py-10">Loading...</p> :
         products.length === 0 ? <p className="col-span-2 text-center py-10 text-gray-500">No products found in this category.</p> :
         products.map((p) => (
            <Link to={`/product/${p.id}`} key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative">
              <div className="relative aspect-[4/5] bg-gray-50">
                <img src={p.images?.[0]} className="w-full h-full object-cover" />
                {p.images?.length > 1 && (
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                    <ImageIcon size={10} /> 1/{p.images.length}
                  </div>
                )}
                {p.original_price && (
                  <span className="absolute top-2 right-2 bg-amber-400 text-[10px] font-bold px-2 py-1 rounded-sm">
                    {Math.round(((p.original_price - p.price) / p.original_price) * 100)}% OFF
                  </span>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{p.title}</h4>
                <div className="mt-auto pt-2 flex items-end justify-between">
                  <div>
                    {p.original_price && <span className="text-[10px] text-gray-400 line-through block">₹{p.original_price}</span>}
                    <span className="text-base font-black text-emerald-950">₹{p.price}</span>
                  </div>
                  <button className="bg-gray-100 text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full">VIEW</button>
                </div>
              </div>
            </Link>
         ))}
      </div>
    </div>
  );
}
