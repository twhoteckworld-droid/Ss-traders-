import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { ShoppingBag, Search, X, ChevronRight, Truck, ShieldCheck, Headphones, Image as ImageIcon, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const openCart = useCartStore((s) => s.openCart);
  const cartCount = useCartStore((s) => s.items.length);

  useEffect(() => {
    (async () => {
      const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      const { data: cats } = await supabase.from('categories').select('*');
      setProducts(prods || []);
      setCategories(cats || []);
      setLoading(false);
    })();
  }, []);

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddClick = (e, product) => {
    e.preventDefault(); 
    if (product.stock <= 0) return alert('This product is currently out of stock.');
    window.location.href = `/product/${product.id}`;
  };

  const mapQuery = encodeURIComponent("SS TRADERS, Mangwain Mohalla 264/12, Himachal Pradesh 175001");
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapDirectionUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-10 font-sans text-gray-900">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        {!showSearch ? (
          <>
            <div>
              <h1 className="text-xl font-black text-emerald-950 tracking-tight leading-none">SS TRADERS</h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mt-1 font-semibold">Premium Footwear</p>
            </div>
            <div className="flex items-center gap-5">
              <Search onClick={() => setShowSearch(true)} size={22} className="text-gray-700 cursor-pointer" />
              <button onClick={openCart} className="relative">
                <ShoppingBag size={22} className="text-gray-700" />
                {cartCount > 0 && <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 w-full animate-in fade-in">
            <Search size={18} className="text-gray-400" />
            <input autoFocus placeholder="Search shoes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-medium" />
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="p-1 bg-gray-100 rounded-full"><X size={16} /></button>
          </div>
        )}
      </header>

      <main>
        {!showSearch && (
          <section className="relative h-[450px] w-full flex items-center justify-center overflow-hidden">
            <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 px-6 text-center max-w-md flex flex-col items-center">
              <span className="bg-amber-500 text-emerald-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-4">New Collection 2024</span>
              <h2 className="text-4xl font-black text-white leading-tight mb-3">Step Into <br/> Ultimate Comfort.</h2>
              <button onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })} className="bg-white text-emerald-950 font-bold px-8 py-3.5 rounded-full shadow-xl flex items-center gap-2">Shop Collection <ChevronRight size={16} /></button>
            </motion.div>
          </section>
        )}

        {!showSearch && (
          <section className="bg-white shadow-sm relative z-20 -mt-6 mx-4 rounded-2xl p-4 flex justify-between items-center">
            {[{ icon: Truck, title: 'Reliable Shipping' }, { icon: ShieldCheck, title: 'Secure Pay' }, { icon: Headphones, title: '24/7 Support' }].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1 flex-1 border-r border-gray-100 last:border-0">
                <item.icon size={22} className="text-emerald-700 mb-1" />
                <span className="text-[10px] font-bold text-gray-900">{item.title}</span>
              </div>
            ))}
          </section>
        )}

        {!showSearch && (
          <section className="mt-8 px-4">
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">Shop by Category</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <Link to={`/category/${cat.slug}`} key={cat.id} className="min-w-[100px] flex-shrink-0">
                  <div className="h-24 w-24 mx-auto bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img src={`https://source.unsplash.com/200x200/?${cat.slug.split('-')[0]},shoes`} className="w-full h-full object-cover" alt={cat.name} />
                  </div>
                  <p className="text-center text-xs font-bold mt-2 text-gray-700 capitalize">{cat.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section id="shop" className="mt-10 px-4">
          <h3 className="text-xl font-extrabold text-gray-900 mb-4">
            {showSearch ? `Search Results (${filteredProducts.length})` : 'Trending Now'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {loading ? <p>Loading...</p> : filteredProducts.length === 0 ? <p className="text-gray-500 text-sm">No shoes found.</p> :
              filteredProducts.map((p) => (
                <Link to={p.stock > 0 ? `/product/${p.id}` : '#'} key={p.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group relative ${p.stock <= 0 ? 'opacity-70' : ''}`}>
                  <div className="relative bg-gray-50 aspect-[4/5] overflow-hidden">
                    <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    
                    {/* Out of stock tag */}
                    {p.stock <= 0 && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">OUT OF STOCK</span>
                      </div>
                    )}

                    {p.images?.length > 1 && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                        <ImageIcon size={10} /> 1/{p.images.length}
                      </div>
                    )}
                    {p.original_price && <span className="absolute top-2 right-2 bg-amber-400 text-emerald-950 text-[10px] font-extrabold px-2 py-1 rounded-sm shadow-sm">{Math.round(((p.original_price - p.price) / p.original_price) * 100)}% OFF</span>}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-1">{p.category}</p>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight mb-2">{p.title}</h4>
                    <div className="mt-auto pt-2 flex items-end justify-between">
                      <div className="flex flex-col">
                        {p.original_price && <span className="text-[11px] text-gray-400 line-through">MRP: ₹{p.original_price}</span>}
                        <span className="text-base font-black text-emerald-950">₹{p.price}</span>
                      </div>
                      
                      {/* Button changes based on stock */}
                      {p.stock > 0 ? (
                        <button onClick={(e) => handleAddClick(e, p)} className="bg-gray-100 text-gray-900 hover:bg-emerald-800 hover:text-white text-[11px] font-bold px-4 py-2 rounded-full active:scale-95 transition-colors">ADD</button>
                      ) : (
                        <button disabled className="bg-gray-200 text-gray-400 text-[10px] font-bold px-3 py-2 rounded-full cursor-not-allowed">SOLD OUT</button>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>

      {/* FOOTER (Same as before) */}
      <footer className="mt-16 bg-emerald-950 text-white rounded-t-[40px] pt-12 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black mb-2 tracking-tight">SS TRADERS</h2>
            <p className="text-emerald-200 text-xs">Step Into Ultimate Comfort.</p>
          </div>
          <div className="bg-emerald-900/50 rounded-2xl p-4 mb-8 border border-emerald-800">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={18} className="text-amber-400" />
              <h4 className="font-bold text-sm text-white">Visit Our Store</h4>
            </div>
            <div className="w-full h-48 rounded-xl overflow-hidden shadow-lg mb-3 border border-emerald-700/50">
              <iframe src={mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Location"></iframe>
            </div>
            <p className="text-emerald-100 text-sm mb-1">Mangwain Mohalla 264/12, Himachal Pradesh 175001</p>
            <div className="flex items-center gap-1 text-emerald-300 text-xs mb-4"><Clock size={12} /><span>Closed · Opens 9 am</span></div>
            <a href={mapDirectionUrl} target="_blank" rel="noreferrer" className="inline-block bg-amber-500 text-emerald-950 font-bold text-xs px-4 py-2 rounded-lg active:scale-95 transition">Get Directions</a>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-8 border-t border-emerald-900 pt-8">
            <div>
              <h4 className="font-bold text-sm mb-4 text-amber-400 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-3 text-sm text-emerald-100">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/admin/login" className="hover:text-white transition">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-amber-400 uppercase tracking-wider">Contact Us</h4>
              <ul className="space-y-3 text-sm text-emerald-100">
                <li className="flex items-center gap-2"><Phone size={14} /> +91 7018721886</li>
                <li className="flex items-center gap-2"><Mail size={14} /> itskunalthakurr@gmail.com</li>
              </ul>
            </div>
          </div>
          <div className="text-center border-t border-emerald-900 pt-6 text-[10px] text-emerald-400/60"><p>© 2024 SS Traders. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
}
