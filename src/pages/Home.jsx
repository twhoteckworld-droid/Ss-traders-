import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { ShoppingBag, Search, X, Truck, ShieldCheck, Headphones, Image as ImageIcon, MapPin, Phone, Mail, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
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
      const { data: config } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      
      setProducts(prods || []);
      setCategories(cats || []);
      if (config) setSettings(config);
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
    e.preventDefault(); e.stopPropagation();
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
    <div className="min-h-screen bg-obsidian pb-10">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-obsidian/90 backdrop-blur-md border-b border-[rgba(212,175,55,0.15)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          {!showSearch ? (
            <>
              <Logo isWhite={true} />
              <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest text-muted-gold">
                <Link to="/" className="hover:text-gold-primary transition-colors">HOME</Link>
                <Link to="/about" className="hover:text-gold-primary transition-colors">OUR STORY</Link>
                <Link to="/category/sneakers" className="hover:text-gold-primary transition-colors">COLLECTION</Link>
              </nav>
              <div className="flex items-center gap-6">
                <Search onClick={() => setShowSearch(true)} size={20} className="text-ivory cursor-pointer hover:text-gold-primary transition" />
                <button onClick={openCart} className="relative group">
                  <ShoppingBag size={20} className="text-ivory group-hover:text-gold-primary transition" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 gold-gradient-bg text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-obsidian">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 w-full animate-in fade-in text-ivory">
              <Search size={20} className="text-gold-primary" />
              <input autoFocus placeholder="Search collection..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-medium placeholder-muted-gold tracking-wider" />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="p-1.5 bg-charcoal rounded-full hover:bg-charcoal-light"><X size={16} /></button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto">
        {/* HERO SECTION */}
        {!showSearch && (
          <section className="relative min-h-[75vh] flex items-center overflow-hidden border-b border-[rgba(212,175,55,0.1)]">
            <img src="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1500&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-transparent" />
            
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold-primary mb-4 block">The Gold Standard</span>
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-ivory leading-[1.1] mb-6">
                  Step Into <br/>
                  <span className="gold-gradient-text">Luxury.</span>
                </h1>
                <p className="text-muted-gold text-sm md:text-base mb-10 max-w-md leading-relaxed">
                  Discover a collection crafted for those who demand perfection. Premium materials, timeless design, unmatched comfort.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })} className="gold-gradient-bg font-semibold text-xs uppercase tracking-widest px-8 py-4 rounded-md shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all active:scale-95 flex items-center gap-2">
                    Shop Collection <ArrowRight size={16} />
                  </button>
                  <button onClick={() => window.location.href='/about'} className="bg-transparent border border-gold-primary/50 text-ivory font-semibold text-xs uppercase tracking-widest px-8 py-4 rounded-md hover:border-gold-primary hover:text-gold-primary transition-all active:scale-95">
                    Our Story
                  </button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* TRUST BADGES */}
        {!showSearch && (
          <section className="bg-charcoal py-8 border-b border-[rgba(212,175,55,0.1)]">
            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-3 gap-4">
              {[
                { icon: Truck, title: 'SAFE SHIPPING', sub: 'Secure Delivery' }, 
                { icon: ShieldCheck, title: 'SECURE PAYMENT', sub: '100% Protected' }, 
                { icon: Headphones, title: '24/7 SUPPORT', sub: 'Always Available' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center text-center md:text-left gap-3 luxury-card p-4">
                  <item.icon size={22} className="text-gold-primary" />
                  <div>
                    <h4 className="text-[10px] md:text-xs font-bold text-ivory tracking-widest">{item.title}</h4>
                    <p className="text-[9px] text-muted-gold uppercase mt-1">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CATEGORIES */}
        {!showSearch && categories.length > 0 && (
          <section className="mt-16 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-8">
              <h2 className="text-2xl font-serif font-bold text-ivory tracking-wide">Shop By Category</h2>
              <div className="h-px bg-gradient-to-r from-gold-primary/50 to-transparent flex-1"></div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
              <button
                onClick={() => setActiveCategory('all')}
                className={`relative flex-shrink-0 snap-start w-40 md:w-56 h-24 md:h-32 rounded-lg overflow-hidden border transition-all duration-300 bg-charcoal ${activeCategory === 'all' ? 'border-gold-primary ring-2 ring-gold-primary/30' : 'border-white/5 hover:border-gold-primary/50'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gold-primary/10 to-transparent flex flex-col items-center justify-center">
                  <span className="text-lg md:text-xl font-serif font-bold text-ivory uppercase tracking-widest">All Shoes</span>
                </div>
              </button>

              {categories.map((cat) => {
                const isActive = activeCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`relative flex-shrink-0 snap-start w-40 md:w-56 h-24 md:h-32 rounded-lg overflow-hidden border transition-all duration-300 group ${isActive ? 'border-gold-primary ring-2 ring-gold-primary/30' : 'border-white/5 hover:border-gold-primary/50'}`}
                  >
                    <img 
                      src={cat.image_url || `https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=500&auto=format&fit=crop`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-60 group-hover:opacity-80" 
                      alt={cat.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent"></div>
                    <span className="absolute bottom-3 left-0 right-0 text-center text-sm md:text-base font-serif font-bold text-ivory uppercase tracking-widest drop-shadow-md">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* PRODUCTS */}
        <section id="shop" className="mt-8 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 border-b border-[rgba(212,175,55,0.15)] pb-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-ivory tracking-wide">
              {showSearch ? `Search Results` : 'The Collection'}
            </h2>
            <span className="text-xs text-gold-primary font-bold tracking-widest">{filteredProducts.length} ITEMS</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? <p className="text-gold-primary">Loading...</p> : filteredProducts.length === 0 ? <p className="text-muted-gold">No products found.</p> :
              filteredProducts.map((p) => (
                <div key={p.id} className={`luxury-card overflow-hidden flex flex-col group relative ${p.stock <= 0 ? 'opacity-50 grayscale' : ''}`}>
                  
                  <Link to={p.stock > 0 ? `/product/${p.id}` : '#'} className="relative aspect-[3/4] overflow-hidden block bg-charcoal-light">
                    <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    
                    {p.stock <= 0 && (
                      <div className="absolute inset-0 bg-obsidian/70 flex items-center justify-center backdrop-blur-sm">
                        <span className="border border-red-500/50 text-red-500 text-[10px] font-bold px-4 py-1.5 rounded-sm tracking-widest uppercase">Sold Out</span>
                      </div>
                    )}
                    
                    {p.original_price && (
                      <span className="absolute top-3 left-3 gold-gradient-bg text-[9px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                        Save {Math.round(((p.original_price - p.price) / p.original_price) * 100)}%
                      </span>
                    )}

                    {p.stock > 0 && (
                      <button 
                        type="button"
                        onClick={(e) => handleAddClick(e, p)} 
                        className="absolute bottom-0 left-0 right-0 bg-charcoal/90 backdrop-blur-md text-ivory text-[11px] font-bold uppercase tracking-widest py-3 shadow-lg opacity-0 lg:group-hover:opacity-100 transition-all duration-300 translate-y-full group-hover:translate-y-0 hover:bg-gold-primary hover:text-obsidian"
                      >
                        Quick Add
                      </button>
                    )}
                  </Link>
                  
                  <div className="p-4 flex flex-col flex-1 text-center bg-charcoal">
                    <p className="text-[9px] text-gold-primary uppercase font-bold tracking-[0.2em] mb-1">{p.category}</p>
                    <Link to={p.stock > 0 ? `/product/${p.id}` : '#'}>
                      <h3 className="text-sm md:text-base font-serif font-bold text-ivory line-clamp-1 leading-tight group-hover:text-gold-primary transition-colors">{p.title}</h3>
                    </Link>
                    <div className="flex items-center justify-center gap-3 mt-3">
                      <span className="text-base font-bold text-gold-primary">₹{p.price}</span>
                      {p.original_price && <span className="text-[11px] text-muted-gold line-through">₹{p.original_price}</span>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-24 bg-charcoal border-t border-[rgba(212,175,55,0.2)] pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Logo isWhite={true} />
            <p className="text-muted-gold text-xs mt-6 max-w-xs leading-relaxed">Experience the pinnacle of footwear comfort and design. Made for those who walk ahead.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-xs mb-6 text-gold-primary uppercase tracking-[0.2em]">Collection</h4>
            <ul className="space-y-4 text-xs text-muted-gold font-medium">
              <li><Link to="/" className="hover:text-ivory transition">Home</Link></li>
              <li><Link to="/about" className="hover:text-ivory transition">Our Story</Link></li>
              <li><Link to="/return" className="hover:text-ivory transition">Return Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-xs mb-6 text-gold-primary uppercase tracking-[0.2em]">Support</h4>
            <ul className="space-y-4 text-xs text-muted-gold font-medium">
              <li><Link to="/privacy" className="hover:text-ivory transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-ivory transition">Terms of Service</Link></li>
              <li><Link to="/admin/login" className="hover:text-ivory transition">Admin Portal</Link></li>
            </ul>
          </div>

          <div className="bg-charcoal-light border border-white/5 rounded-2xl p-6">
             <h4 className="font-bold text-xs text-ivory mb-4 flex items-center gap-2 uppercase tracking-widest">
               <MapPin size={14} className="text-gold-primary"/> Visit Store
             </h4>
             <div className="w-full h-28 rounded-xl overflow-hidden mb-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition duration-500 border border-white/10">
               <iframe src={mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Location"></iframe>
             </div>
             <a href={mapDirectionUrl} target="_blank" rel="noreferrer" className="block w-full text-center border border-gold-primary/50 text-gold-primary hover:bg-gold-primary hover:text-obsidian font-bold text-[10px] px-4 py-2.5 rounded-md transition uppercase tracking-widest">Get Directions</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[rgba(212,175,55,0.1)] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4">
             <a href={`tel:${settings?.contact_phone || '+917018721886'}`} className="w-10 h-10 rounded-full bg-obsidian border border-white/10 flex items-center justify-center text-muted-gold hover:text-gold-primary hover:border-gold-primary transition-all duration-300"><Phone size={16} /></a>
             <a href={settings?.instagram_url || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-obsidian border border-white/10 flex items-center justify-center text-muted-gold hover:text-gold-primary hover:border-gold-primary transition-all duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
             </a>
             <a href={settings?.facebook_url || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-obsidian border border-white/10 flex items-center justify-center text-muted-gold hover:text-gold-primary hover:border-gold-primary transition-all duration-300"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
             <a href={`mailto:${settings?.contact_email || 'itskunalthakurr@gmail.com'}`} className="w-10 h-10 rounded-full bg-obsidian border border-white/10 flex items-center justify-center text-muted-gold hover:text-gold-primary hover:border-gold-primary transition-all duration-300"><Mail size={16} /></a>
          </div>
          <div className="text-[10px] text-muted-gold tracking-widest uppercase">
            <p>© 2024 SS Traders. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-obsidian/90 backdrop-blur-sm px-4">
          <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-charcoal border border-[rgba(212,175,55,0.3)] w-full max-w-md rounded-t-2xl md:rounded-xl p-6 pb-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="font-serif font-bold text-xl text-ivory tracking-widest uppercase">Select Size</h3>
              <button onClick={() => setSelectedProduct(null)} className="p-1.5 bg-charcoal-light rounded-md hover:bg-white/10 transition text-muted-gold"><X size={18} /></button>
            </div>
            <div className="flex gap-4 mb-6 bg-obsidian p-3 rounded-lg border border-white/5">
               <img src={selectedProduct.images?.[0]} className="w-16 h-16 object-cover rounded-md border border-white/10" />
               <div>
                  <p className="text-xs font-bold text-ivory line-clamp-2 leading-tight uppercase">{selectedProduct.title}</p>
                  <p className="text-gold-primary font-bold mt-1 text-base">₹{selectedProduct.price}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-8">
              {selectedProduct.sizes?.map((size) => {
                const isSizeOut = selectedProduct.size_stock && selectedProduct.size_stock[size] <= 0;
                return (
                  <button key={size} onClick={() => setSelectedSize(size)} disabled={isSizeOut} className={`relative py-3 rounded-md border font-bold text-sm transition-all ${selectedSize === size ? 'border-gold-primary bg-gold-primary/10 text-gold-primary' : 'border-white/10 text-muted-gold hover:border-gold-primary/50'} ${isSizeOut ? 'opacity-40 cursor-not-allowed bg-transparent' : ''}`}>
                    {size}
                    {isSizeOut && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-red-500/50 rotate-45"></div></div>}
                  </button>
                );
              })}
            </div>

            <button type="button" onClick={handleSizeConfirm} className="w-full gold-gradient-bg py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] active:scale-95 transition">
              Add to Cart
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
