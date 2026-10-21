import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { ShoppingBag, Search, X, ChevronRight, Truck, ShieldCheck, Headphones, Image as ImageIcon, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all'); // Category filter state
  
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

  // Combined Filter: Search + Category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

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

  // Gradients for Glossy Buttons
  const buttonGradients = [
    'from-cyan-400 to-cyan-600',
    'from-purple-500 to-purple-700',
    'from-gray-300 to-gray-500 text-black drop-shadow-none',
    'from-green-500 to-green-700',
    'from-red-500 to-red-700',
    'from-pink-500 to-pink-700',
    'from-orange-400 to-orange-600',
    'from-blue-500 to-blue-700'
  ];

  const mapQuery = encodeURIComponent("SS TRADERS, Mangwain Mohalla 264/12, Himachal Pradesh 175001");
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapDirectionUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="min-h-screen bg-[#111111] pb-10 font-sans text-white">
      {/* HEADER (Cleaner, Lighter background) */}
      <header className="sticky top-0 z-40 bg-[#111111]/90 backdrop-blur-xl border-b border-white/5 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          {!showSearch ? (
            <>
              <Logo isWhite={true} />
              <div className="flex items-center gap-6">
                <Search onClick={() => setShowSearch(true)} size={22} className="text-gray-300 cursor-pointer hover:text-amber-500 transition" />
                <button onClick={openCart} className="relative group">
                  <ShoppingBag size={22} className="text-gray-300 group-hover:text-amber-500 transition" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#111111] shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-top-2 text-white">
              <Search size={20} className="text-amber-500" />
              <input autoFocus placeholder="Search luxury footwear..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-medium placeholder-gray-500" />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="p-1.5 bg-white/10 rounded-full hover:bg-white/20"><X size={16} /></button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto">
        {/* HERO SECTION */}
        {!showSearch && (
          <section className="relative h-[65vh] md:h-[80vh] w-full flex items-center justify-center overflow-hidden">
            <img src="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1500&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/50 to-transparent" />
            
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative z-10 text-center max-w-2xl px-6">
              <span className="text-amber-500 text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-4 block">The Gold Standard</span>
              <h2 className="text-5xl md:text-7xl font-serif font-black text-white leading-[1.1] mb-6 drop-shadow-2xl">Step Into <br/> Luxury.</h2>
              <p className="text-gray-300 text-sm md:text-base mb-8 leading-relaxed max-w-md mx-auto">
                Discover a collection crafted for those who demand perfection. Premium materials, timeless design.
              </p>
              <button onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })} className="bg-gradient-to-r from-amber-600 to-amber-400 text-black font-black uppercase tracking-widest text-xs px-10 py-4 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all active:scale-95">
                Explore Collection
              </button>
            </motion.div>
          </section>
        )}

        {/* TRUST BADGES */}
        {!showSearch && (
          <section className="bg-[#1a1a1a] relative z-20 -mt-10 mx-4 md:mx-12 rounded-2xl shadow-2xl p-6 flex justify-between items-center border border-white/5 max-w-4xl lg:mx-auto">
            {[{ icon: Truck, title: 'Free Shipping' }, { icon: ShieldCheck, title: 'Secure Payment' }, { icon: Headphones, title: '24/7 Support' }].map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center text-center md:text-left gap-2 md:gap-4 flex-1 border-r border-white/10 last:border-0 px-4">
                <item.icon size={24} className="text-amber-500" />
                <span className="text-[10px] md:text-sm font-bold text-gray-300 tracking-wider uppercase">{item.name || item.title}</span>
              </div>
            ))}
          </section>
        )}

        {/* GLOSSY CATEGORY PILLS (Horizontal Scroll) */}
        {!showSearch && (
          <section className="mt-16 px-4 md:px-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-3xl font-serif font-bold text-white tracking-wide">Categories</h3>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x">
              {/* 'All' Button */}
              <button
                onClick={() => setActiveCategory('all')}
                className={`relative flex-shrink-0 snap-start overflow-hidden rounded-full px-8 py-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all duration-300 shadow-xl border border-white/20 active:scale-95 bg-gradient-to-b from-amber-400 to-amber-600 text-black ${activeCategory === 'all' ? 'ring-2 ring-white scale-105' : 'opacity-80 hover:opacity-100'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent h-1/2 rounded-t-full"></div>
                <span className="relative z-10 drop-shadow-sm">All Shoes</span>
              </button>

              {/* Dynamic Category Buttons */}
              {categories.map((cat, index) => {
                const gradient = buttonGradients[index % buttonGradients.length];
                const isActive = activeCategory === cat.slug;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`relative flex-shrink-0 snap-start overflow-hidden rounded-full px-8 py-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.5)] border border-white/20 active:scale-95 bg-gradient-to-b ${gradient} ${isActive ? 'ring-2 ring-white scale-105' : 'opacity-80 hover:opacity-100'}`}
                  >
                    {/* Glass/Glossy Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent h-1/2 rounded-t-full"></div>
                    <span className="relative z-10 drop-shadow-md">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* PRODUCTS GRID */}
        <section id="shop" className="mt-8 px-4 md:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-wide">
                {showSearch ? `Search Results` : 'The Collection'}
              </h3>
              <div className="w-16 h-1 bg-amber-500 mt-3"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
            {loading ? <p className="text-amber-500">Loading...</p> : filteredProducts.length === 0 ? <p className="text-gray-500">No products found in this category.</p> :
              filteredProducts.map((p) => (
                <div key={p.id} className={`flex flex-col group relative ${p.stock <= 0 ? 'opacity-50' : ''}`}>
                  
                  <Link to={p.stock > 0 ? `/product/${p.id}` : '#'} className="relative bg-[#1a1a1a] aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 hover:border-amber-500/50 shadow-lg transition-all duration-500 block mb-4">
                    <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    
                    {p.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="border border-red-500 text-red-500 text-[10px] font-bold px-4 py-2 rounded-full shadow-lg tracking-widest">SOLD OUT</span>
                      </div>
                    )}
                    
                    {p.images?.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/60 text-amber-500 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-md border border-white/10">
                        <ImageIcon size={10} /> {p.images.length}
                      </div>
                    )}
                    
                    {p.original_price && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-sm shadow-[0_0_10px_rgba(245,158,11,0.5)] tracking-wider">
                        {Math.round(((p.original_price - p.price) / p.original_price) * 100)}% OFF
                      </span>
                    )}

                    {p.stock > 0 && (
                      <button 
                        type="button"
                        onClick={(e) => handleAddClick(e, p)} 
                        className="absolute bottom-4 left-4 right-4 bg-amber-500 text-black text-xs font-black uppercase tracking-widest py-3 rounded-xl shadow-lg opacity-0 lg:group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 hover:bg-amber-400"
                      >
                        Quick Add
                      </button>
                    )}
                  </Link>
                  
                  <div className="flex flex-col px-1 text-center">
                    <p className="text-[9px] text-amber-500 uppercase font-bold tracking-[0.2em] mb-2">{p.category}</p>
                    <Link to={p.stock > 0 ? `/product/${p.id}` : '#'}>
                      <h4 className="text-sm md:text-base font-serif font-bold text-white line-clamp-1 leading-tight">{p.title}</h4>
                    </Link>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <span className="text-base md:text-lg font-black text-amber-500">₹{p.price}</span>
                      {p.original_price && <span className="text-xs text-gray-600 line-through font-medium">₹{p.original_price}</span>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-24 bg-black text-white border-t border-white/10 pt-16 pb-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="lg:col-span-1">
            <Logo isWhite={true} />
            <p className="text-gray-500 text-xs mt-6 max-w-xs leading-relaxed font-medium">Experience the pinnacle of footwear comfort and design. Made for those who walk ahead.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-xs mb-6 text-white uppercase tracking-[0.2em]">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><Link to="/" className="hover:text-amber-500 transition">Home</Link></li>
              <li><Link to="/about" className="hover:text-amber-500 transition">Our Story</Link></li>
              <li><Link to="/return" className="hover:text-amber-500 transition">Return Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-xs mb-6 text-white uppercase tracking-[0.2em]">Support</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><Link to="/privacy" className="hover:text-amber-500 transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-amber-500 transition">Terms of Service</Link></li>
              <li><Link to="/admin/login" className="hover:text-amber-500 transition">Admin Portal</Link></li>
            </ul>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-3xl p-6">
             <h4 className="font-bold text-xs text-white mb-5 flex items-center gap-2 uppercase tracking-widest"><MapPin size={14} className="text-amber-500"/> Visit Our Store</h4>
             <div className="w-full h-32 rounded-xl overflow-hidden mb-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition duration-500 border border-white/10">
               <iframe src={mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Location"></iframe>
             </div>
             <p className="text-gray-400 text-xs mb-5 font-medium">Mangwain Mohalla 264/12, HP 175001</p>
             <a href={mapDirectionUrl} target="_blank" rel="noreferrer" className="block w-full text-center border border-amber-500 text-amber-500 font-bold text-xs px-4 py-3 rounded-xl hover:bg-amber-500 hover:text-black transition uppercase tracking-widest">Get Directions</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4">
             <a href="tel:+917018721886" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-black hover:bg-amber-500 hover:border-amber-500 transition"><Phone size={16} /></a>
             <a href="https://www.instagram.com/sstradersmandi?dlrf=MWFvdHZwN2xmMXRtag==" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-black hover:bg-amber-500 hover:border-amber-500 transition">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
             </a>
             <a href="https://www.facebook.com/share/1CEvB1fCnh/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-black hover:bg-amber-500 hover:border-amber-500 transition"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
             <a href="mailto:itskunalthakurr@gmail.com" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-black hover:bg-amber-500 hover:border-amber-500 transition"><Mail size={16} /></a>
          </div>
          <div className="text-[10px] text-gray-600 font-medium tracking-widest uppercase">
            <p>© 2024 SS Traders. Designed with precision.</p>
          </div>
        </div>
      </footer>

      {/* SIZE MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-t-[2.5rem] md:rounded-3xl p-8 pb-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif font-bold text-2xl text-white tracking-wide">Select Size</h3>
              <button onClick={() => setSelectedProduct(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition text-gray-400"><X size={18} /></button>
            </div>
            <div className="flex gap-4 mb-8 bg-black/50 p-4 rounded-2xl border border-white/5">
               <img src={selectedProduct.images?.[0]} className="w-20 h-20 object-cover rounded-xl border border-white/10" />
               <div>
                  <p className="text-sm font-bold text-white line-clamp-2 leading-tight">{selectedProduct.title}</p>
                  <p className="text-amber-500 font-black mt-2 text-lg">₹{selectedProduct.price}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mb-10">
              {selectedProduct.sizes?.map((size) => {
                const isSizeOut = selectedProduct.size_stock && selectedProduct.size_stock[size] <= 0;
                return (
                  <button key={size} onClick={() => setSelectedSize(size)} disabled={isSizeOut} className={`relative py-3.5 rounded-xl border font-bold text-sm transition-all ${selectedSize === size ? 'border-amber-500 bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-white/10 text-gray-400 hover:border-amber-500/50'} ${isSizeOut ? 'opacity-40 cursor-not-allowed bg-transparent' : ''}`}>
                    {size}
                    {isSizeOut && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-red-500 rotate-45"></div></div>}
                  </button>
                );
              })}
            </div>

            <button type="button" onClick={handleSizeConfirm} className="w-full bg-amber-500 text-black py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-amber-400 active:scale-95 transition">
              Add to Cart
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
