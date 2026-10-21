import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { ShoppingBag, Search, X, ChevronRight, Truck, ShieldCheck, Headphones, Image as ImageIcon, MapPin, Phone, Mail, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');

  const addItem = useCartStore((s) => s.addItem);
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
    e.stopPropagation();
    if (product.stock <= 0) return alert('This product is out of stock.');
    if (product.sizes && product.sizes.length > 0) {
      setSelectedProduct(product);
      setSelectedSize('');
    } else {
      addItem(product);
      openCart();
    }
  };

  const handleSizeConfirm = () => {
    if (!selectedSize) return alert('Please select a size');
    if (selectedProduct.size_stock && selectedProduct.size_stock[selectedSize] <= 0) return alert('Out of stock!');
    addItem(selectedProduct, selectedSize);
    setSelectedProduct(null);
    openCart();
  };

  const mapQuery = encodeURIComponent("SS TRADERS, Mangwain Mohalla 264/12, Himachal Pradesh 175001");
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapDirectionUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-10 font-sans text-gray-900">
      {/* HEADER (Centered for Desktop) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          {!showSearch ? (
            <>
              <Logo />
              <div className="flex items-center gap-6">
                <Search onClick={() => setShowSearch(true)} size={22} className="text-gray-600 cursor-pointer hover:text-emerald-700 transition" />
                <button onClick={openCart} className="relative group">
                  <ShoppingBag size={22} className="text-gray-600 group-hover:text-emerald-700 transition" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-top-2">
              <Search size={20} className="text-gray-400" />
              <input autoFocus placeholder="Search premium shoes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-medium placeholder-gray-400" />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="p-1.5 bg-gray-100 rounded-full"><X size={16} /></button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto">
        {/* HERO SECTION */}
        {!showSearch && (
          <section className="relative h-[60vh] md:h-[75vh] w-full flex items-end justify-start overflow-hidden pb-12 px-6 md:px-12">
            <img src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1500&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-xl">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 block">New Collection 2024</span>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-4">Redefine Your <br/> Footwear Style.</h2>
              <p className="text-gray-300 text-sm md:text-base mb-8 leading-relaxed max-w-md">
                Discover the perfect blend of comfort, durability, and unmatched premium design.
              </p>
              <button onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })} className="bg-white text-black font-bold px-8 py-4 rounded-full shadow-2xl hover:bg-gray-100 transition active:scale-95 flex items-center gap-2">
                Explore Collection <ChevronRight size={18} />
              </button>
            </motion.div>
          </section>
        )}

        {/* TRUST BADGES */}
        {!showSearch && (
          <section className="bg-white relative z-20 -mt-8 mx-4 md:mx-12 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex justify-between items-center border border-gray-100 max-w-4xl lg:mx-auto">
            {[{ icon: Truck, title: 'Free Shipping' }, { icon: ShieldCheck, title: 'Secure Payment' }, { icon: Headphones, title: '24/7 Support' }].map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center text-center md:text-left gap-2 md:gap-4 flex-1 border-r border-gray-100 last:border-0 px-4">
                <item.icon size={24} className="text-emerald-800" />
                <span className="text-[11px] md:text-sm font-bold text-gray-800">{item.title}</span>
              </div>
            ))}
          </section>
        )}

        {/* CATEGORIES */}
        {!showSearch && categories.length > 0 && (
          <section className="mt-12 px-4 md:px-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Shop by Category</h3>
            </div>
            <div className="flex gap-5 md:gap-8 overflow-x-auto pb-4 scrollbar-hide">
              {categories.map((cat) => (
                <Link to={`/category/${cat.slug}`} key={cat.id} className="min-w-[90px] md:min-w-[120px] flex-shrink-0 group">
                  <div className="h-20 w-20 md:h-28 md:w-28 mx-auto bg-gray-50 rounded-2xl md:rounded-3xl overflow-hidden border border-gray-200 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
                    <img src={`https://source.unsplash.com/200x200/?${cat.slug.split('-')[0]},shoes`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={cat.name} />
                  </div>
                  <p className="text-center text-[11px] md:text-sm font-bold mt-3 text-gray-700 group-hover:text-emerald-800 transition capitalize">{cat.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* PRODUCTS GRID - RESPONSIVE */}
        <section id="shop" className="mt-10 px-4 md:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                {showSearch ? `Search Results (${filteredProducts.length})` : 'Trending Now'}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">Handpicked just for you</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
            {loading ? <p>Loading...</p> : filteredProducts.length === 0 ? <p className="text-gray-500 text-sm">No shoes found.</p> :
              filteredProducts.map((p) => (
                <div key={p.id} className={`flex flex-col group relative ${p.stock <= 0 ? 'opacity-60' : ''}`}>
                  
                  <Link to={p.stock > 0 ? `/product/${p.id}` : '#'} className="relative bg-gray-100 aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden shadow-sm block mb-3">
                    <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    
                    {p.stock <= 0 && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">SOLD OUT</span>
                      </div>
                    )}
                    
                    {p.images?.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-md">
                        <ImageIcon size={10} /> {p.images.length}
                      </div>
                    )}
                    
                    {p.original_price && (
                      <span className="absolute top-3 left-3 bg-amber-400 text-black text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                        {Math.round(((p.original_price - p.price) / p.original_price) * 100)}% OFF
                      </span>
                    )}

                    {/* Floating ADD Button (Desktop Friendly) */}
                    {p.stock > 0 && (
                      <button 
                        type="button"
                        onClick={(e) => handleAddClick(e, p)} 
                        className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md text-black text-xs font-bold py-2.5 rounded-xl shadow-lg opacity-0 lg:group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hover:bg-black hover:text-white"
                      >
                        Quick Add
                      </button>
                    )}
                  </Link>
                  
                  <div className="flex flex-col px-1">
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-1">{p.category}</p>
                    <Link to={p.stock > 0 ? `/product/${p.id}` : '#'}>
                      <h4 className="text-sm md:text-base font-bold text-gray-900 line-clamp-1 leading-tight">{p.title}</h4>
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm md:text-base font-black text-gray-900">₹{p.price}</span>
                      {p.original_price && <span className="text-[11px] md:text-xs text-gray-400 line-through font-medium">₹{p.original_price}</span>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </main>

      {/* PREMIUM DARK FOOTER */}
      <footer className="mt-20 bg-[#0a1f15] text-white rounded-t-[3rem] pt-16 pb-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="lg:col-span-1">
            <Logo isWhite={true} />
            <p className="text-emerald-200/60 text-xs mt-4 max-w-xs leading-relaxed">Experience the pinnacle of footwear comfort and design. Made for those who walk ahead.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-xs mb-5 text-amber-400 uppercase tracking-widest">Shop</h4>
            <ul className="space-y-3 text-sm text-emerald-100/70">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition">Our Story</Link></li>
              <li><Link to="/return" className="hover:text-white transition">Return Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-xs mb-5 text-amber-400 uppercase tracking-widest">Support</h4>
            <ul className="space-y-3 text-sm text-emerald-100/70">
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/admin/login" className="hover:text-white transition">Admin Portal</Link></li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
             <h4 className="font-bold text-sm text-white mb-4 flex items-center gap-2"><MapPin size={16} className="text-amber-400"/> Visit Our Store</h4>
             <div className="w-full h-32 rounded-xl overflow-hidden mb-4 grayscale opacity-80 hover:grayscale-0 transition duration-500">
               <iframe src={mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Location"></iframe>
             </div>
             <p className="text-emerald-100/60 text-xs mb-4">Mangwain Mohalla 264/12, HP 175001</p>
             <a href={mapDirectionUrl} target="_blank" rel="noreferrer" className="block w-full text-center bg-amber-500 text-black font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-amber-400 transition">Get Directions</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4">
             <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-black transition"><Phone size={16} /></a>
             <a href="https://www.facebook.com/share/1CEvB1fCnh/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-black transition"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
             <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-black transition"><Mail size={16} /></a>
          </div>
          <div className="text-[10px] text-emerald-100/40">
            <p>© 2024 SS Traders. Designed with precision.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
