import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { ShoppingBag, Search, X, ChevronRight, Truck, ShieldCheck, Headphones, Image as ImageIcon, MapPin, Phone, Mail, Star, Zap, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all'); 
  
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

  const mapQuery = encodeURIComponent("SS TRADERS, Mangwain Mohalla 264/12, Himachal Pradesh 175001");
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapDirectionUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="min-h-screen bg-black pb-10 font-sans text-white selection:bg-amber-500 selection:text-black">
      
      {/* HEADER - SPARTA STYLE */}
      <header className="sticky top-0 z-40 bg-black border-b-2 border-amber-600/50 shadow-[0_4px_30px_rgba(212,175,55,0.1)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          {!showSearch ? (
            <>
              <Logo isWhite={true} />
              
              {/* Desktop Nav Links (Optional, for look) */}
              <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest text-gray-400">
                <Link to="/" className="hover:text-amber-500 transition-colors">HOME</Link>
                <Link to="/about" className="hover:text-amber-500 transition-colors">STORY</Link>
                <Link to="/category/sneakers" className="hover:text-amber-500 transition-colors">COLLECTION</Link>
              </nav>

              <div className="flex items-center gap-5">
                <Search onClick={() => setShowSearch(true)} size={20} className="text-gray-300 cursor-pointer hover:text-amber-500 transition" />
                <button onClick={openCart} className="relative group">
                  <ShoppingBag size={20} className="text-gray-300 group-hover:text-amber-500 transition" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-600 text-black text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-black">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-top-2 text-white">
              <Search size={20} className="text-amber-500" />
              <input autoFocus placeholder="Search premium footwear..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-medium placeholder-gray-500 uppercase tracking-wider" />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="p-1.5 bg-white/10 rounded hover:bg-white/20"><X size={16} /></button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto">
        {/* HERO SECTION - SPARTA STYLE */}
        {!showSearch && (
          <section className="relative min-h-[70vh] flex items-center overflow-hidden border-b border-white/10 bg-gradient-to-r from-black via-black/80 to-transparent">
            <img src="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1500&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity" />
            
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 px-3 py-1 rounded-sm mb-6">
                  <Award size={14} className="text-amber-500" />
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Exclusive Collection</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white leading-none mb-4 uppercase font-serif tracking-tighter">
                  Step Into <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700">Luxury.</span>
                </h2>
                <p className="text-gray-400 text-sm md:text-base mb-8 max-w-md border-l-2 border-amber-600 pl-4">
                  Engineered for style, comfort, and dominance. Discover premium footwear crafted for those who walk ahead of the curve.
                </p>
                <div className="flex gap-4">
                  <button onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })} className="bg-gradient-to-r from-amber-600 to-amber-400 text-black font-black uppercase tracking-widest text-xs px-8 py-4 rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all active:scale-95 border border-amber-300">
                    Shop Collection
                  </button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* TRUST BADGES - SPARTA GRID STYLE */}
        {!showSearch && (
          <section className="bg-[#0a0a0a] border-b border-white/10 py-8">
            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-3 gap-4 md:gap-8">
              {[
                { icon: Truck, title: 'SAFE SHIPPING', sub: 'Secure Delivery' }, 
                { icon: ShieldCheck, title: 'SECURE PAYMENT', sub: '100% Protected' }, 
                { icon: Headphones, title: '24/7 SUPPORT', sub: 'Always Available' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center text-center md:text-left gap-3 md:gap-5 border border-white/5 bg-[#121212] p-4 rounded-sm shadow-lg group hover:border-amber-500/40 transition">
                  <div className="p-2 md:p-3 bg-black border border-amber-500/20 rounded-sm group-hover:bg-amber-500/10 transition">
                    <item.icon size={22} className="text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-[10px] md:text-xs font-black text-white tracking-widest">{item.title}</h4>
                    <p className="text-[9px] md:text-[10px] text-gray-500 uppercase mt-1">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CATEGORIES - METALLIC PILLS */}
        {!showSearch && categories.length > 0 && (
          <section className="mt-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-gradient-to-r from-amber-600 to-transparent flex-1"></div>
              <h3 className="text-xl md:text-2xl font-serif font-black text-white tracking-widest uppercase">Categories</h3>
              <div className="h-px bg-gradient-to-l from-amber-600 to-transparent flex-1"></div>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x">
              <button
                onClick={() => setActiveCategory('all')}
                className={`relative flex-shrink-0 snap-start rounded-sm px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${activeCategory === 'all' ? 'bg-gradient-to-b from-amber-500 to-amber-700 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-[#121212] text-gray-400 border-white/10 hover:border-amber-500/50'}`}
              >
                All Shoes
              </button>

              {categories.map((cat) => {
                const isActive = activeCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`relative flex-shrink-0 snap-start rounded-sm px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${isActive ? 'bg-gradient-to-b from-amber-500 to-amber-700 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-[#121212] text-gray-400 border-white/10 hover:border-amber-500/50'}`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* PRODUCTS GRID - SPARTA CARDS */}
        <section id="shop" className="mt-8 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <h3 className="text-2xl md:text-3xl font-serif font-black text-white tracking-wider uppercase">
              {showSearch ? `Search Results` : 'The Arsenal'}
            </h3>
            <span className="text-xs text-amber-500 font-bold tracking-widest">{filteredProducts.length} ITEMS</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? <p className="text-amber-500">Loading...</p> : filteredProducts.length === 0 ? <p className="text-gray-500">No products found.</p> :
              filteredProducts.map((p) => (
                <div key={p.id} className={`bg-[#0a0a0a] border border-white/10 rounded-sm overflow-hidden flex flex-col group relative transition-all duration-300 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] ${p.stock <= 0 ? 'opacity-50 grayscale' : ''}`}>
                  
                  <Link to={p.stock > 0 ? `/product/${p.id}` : '#'} className="relative aspect-[3/4] overflow-hidden block">
                    <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    
                    {p.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                        <span className="border border-red-500 text-red-500 text-[10px] font-black px-4 py-1.5 rounded-sm tracking-widest uppercase">Sold Out</span>
                      </div>
                    )}
                    
                    {p.original_price && (
                      <span className="absolute top-2 left-2 bg-amber-600 text-black text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-wider">
                        Save {Math.round(((p.original_price - p.price) / p.original_price) * 100)}%
                      </span>
                    )}

                    {p.stock > 0 && (
                      <button 
                        type="button"
                        onClick={(e) => handleAddClick(e, p)} 
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-amber-600 to-amber-500 text-black text-[11px] font-black uppercase tracking-widest py-3 shadow-lg opacity-0 lg:group-hover:opacity-100 transition-all duration-300 translate-y-full group-hover:translate-y-0 hover:from-amber-500 hover:to-amber-400"
                      >
                        Quick Add
                      </button>
                    )}
                  </Link>
                  
                  <div className="p-4 flex flex-col flex-1 text-center">
                    <p className="text-[9px] text-amber-500 uppercase font-bold tracking-[0.2em] mb-2">{p.category}</p>
                    <Link to={p.stock > 0 ? `/product/${p.id}` : '#'}>
                      <h4 className="text-sm font-bold text-white line-clamp-1 leading-tight group-hover:text-amber-500 transition-colors">{p.title}</h4>
                    </Link>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <span className="text-base font-black text-white">₹{p.price}</span>
                      {p.original_price && <span className="text-[11px] text-gray-600 line-through font-medium">₹{p.original_price}</span>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </main>

      {/* FOOTER - PREMIUM WITH REAL SOCIAL COLORS */}
      <footer className="mt-20 bg-[#050505] text-white border-t border-amber-600/30 pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          <div className="lg:col-span-1">
            <Logo isWhite={true} />
            <p className="text-gray-500 text-xs mt-6 max-w-xs leading-relaxed font-medium uppercase tracking-wider">Elevate your style with SS Traders. Crafted for the bold.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-xs mb-6 text-amber-500 uppercase tracking-[0.2em]">Collection</h4>
            <ul className="space-y-3 text-xs text-gray-400 font-bold uppercase tracking-wider">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition">Our Story</Link></li>
              <li><Link to="/return" className="hover:text-white transition">Return Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-xs mb-6 text-amber-500 uppercase tracking-[0.2em]">Support</h4>
            <ul className="space-y-3 text-xs text-gray-400 font-bold uppercase tracking-wider">
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/admin/login" className="hover:text-white transition">Admin Portal</Link></li>
            </ul>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-sm p-5">
             <h4 className="font-bold text-xs text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
               <MapPin size={14} className="text-red-500"/> Visit Store
             </h4>
             <div className="w-full h-28 rounded-sm overflow-hidden mb-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition duration-500 border border-white/10">
               <iframe src={mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Location"></iframe>
             </div>
             <a href={mapDirectionUrl} target="_blank" rel="noreferrer" className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-4 py-2.5 rounded-sm transition uppercase tracking-widest">Get Directions</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* REAL BRAND COLORS FOR SOCIAL ICONS (Play Store Style) */}
          <div className="flex gap-4">
             {/* Call - Green */}
             <a href="tel:+917018721886" title="Call Us" className="w-10 h-10 rounded-sm bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-[#34A853] hover:bg-[#34A853] hover:text-white hover:border-[#34A853] transition-all duration-300">
               <Phone size={18} />
             </a>
             
             {/* Instagram - Gradient */}
             <a href="https://www.instagram.com/sstradersmandi?dlrf=MWFvdHZwN2xmMXRtag==" target="_blank" rel="noreferrer" title="Instagram" className="w-10 h-10 rounded-sm bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-[#E1306C] hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white hover:border-transparent transition-all duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
             </a>

             {/* Facebook - Blue */}
             <a href="https://www.facebook.com/share/1CEvB1fCnh/" target="_blank" rel="noreferrer" title="Facebook" className="w-10 h-10 rounded-sm bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
             </a>
             
             {/* Email - Red */}
             <a href="mailto:itskunalthakurr@gmail.com" title="Email Us" className="w-10 h-10 rounded-sm bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-[#EA4335] hover:bg-[#EA4335] hover:text-white hover:border-[#EA4335] transition-all duration-300">
               <Mail size={18} />
             </a>
          </div>
          <div className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">
            <p>© 2024 SS Traders. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/90 backdrop-blur-sm px-4">
          <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#121212] border border-amber-500/30 w-full max-w-md rounded-t-lg md:rounded-sm p-6 pb-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="font-serif font-bold text-xl text-white tracking-widest uppercase">Select Size</h3>
              <button onClick={() => setSelectedProduct(null)} className="p-1.5 bg-white/5 rounded-sm hover:bg-white/10 transition text-gray-400"><X size={18} /></button>
            </div>
            <div className="flex gap-4 mb-6 bg-black p-3 rounded-sm border border-white/5">
               <img src={selectedProduct.images?.[0]} className="w-16 h-16 object-cover rounded-sm border border-white/10" />
               <div>
                  <p className="text-xs font-bold text-white line-clamp-2 leading-tight uppercase">{selectedProduct.title}</p>
                  <p className="text-amber-500 font-black mt-1 text-base">₹{selectedProduct.price}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-8">
              {selectedProduct.sizes?.map((size) => {
                const isSizeOut = selectedProduct.size_stock && selectedProduct.size_stock[size] <= 0;
                return (
                  <button key={size} onClick={() => setSelectedSize(size)} disabled={isSizeOut} className={`relative py-3 rounded-sm border font-bold text-sm transition-all ${selectedSize === size ? 'border-amber-500 bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-white/10 text-gray-400 hover:border-amber-500/50'} ${isSizeOut ? 'opacity-40 cursor-not-allowed bg-transparent' : ''}`}>
                    {size}
                    {isSizeOut && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-red-500 rotate-45"></div></div>}
                  </button>
                );
              })}
            </div>

            <button type="button" onClick={handleSizeConfirm} className="w-full bg-gradient-to-r from-amber-600 to-amber-400 text-black py-3.5 rounded-sm font-black text-xs uppercase tracking-widest hover:from-amber-500 hover:to-amber-300 active:scale-95 transition">
              Add to Cart
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
