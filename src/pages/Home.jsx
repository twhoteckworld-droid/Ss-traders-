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
      const { data: config } = await supabase.from('site_settings').select(`*`).eq(`id`, 1).maybeSingle();
      
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

  return (
    <div className="min-h-screen bg-obsidian pb-10 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-charcoal border-b border-[rgba(212,175,55,0.15)] shadow-md">
        <div className="max-w-[1600px] mx-auto px-2 md:px-4 py-2 md:py-3 flex items-center justify-between gap-4">
          
          <Logo isWhite={true} />
          
          <div className="hidden md:flex flex-1 max-w-3xl items-center bg-obsidian rounded-md border border-white/20 overflow-hidden focus-within:border-gold-primary transition">
            <input 
              type="text" placeholder="Search premium footwear..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-transparent px-4 py-2.5 text-sm text-ivory outline-none placeholder-muted-gold"
            />
            <button className="bg-gold-primary text-obsidian px-6 py-2.5 hover:bg-gold-light transition flex items-center justify-center">
              <Search size={18} />
            </button>
          </div>

          <div className="flex items-center gap-5">
            <button onClick={() => setShowSearch(true)} className="md:hidden text-ivory"><Search size={22} /></button>
            <Link to="/admin/login" className="hidden md:block text-xs font-semibold text-muted-gold hover:text-gold-primary transition">Admin</Link>
            <button onClick={openCart} className="relative flex items-center gap-1 text-ivory hover:text-gold-primary transition">
              <div className="relative">
                <ShoppingBag size={24} />
                {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-gold-primary text-obsidian text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-obsidian">{cartCount}</span>}
              </div>
              <span className="hidden md:block font-bold text-sm mt-1">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {showSearch && (
          <div className="md:hidden absolute top-0 left-0 w-full h-full bg-charcoal flex items-center px-4 gap-2 z-50">
            <input autoFocus placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-obsidian border border-white/20 text-ivory px-3 py-2 rounded-md outline-none focus:border-gold-primary" />
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="p-2 bg-white/10 rounded-md text-ivory"><X size={20} /></button>
          </div>
        )}

        {/* Sub-Navbar (Categories) */}
        <div className="bg-obsidian-light border-t border-white/5 overflow-x-auto scrollbar-hide">
          <div className="max-w-[1600px] mx-auto px-2 md:px-4 flex items-center gap-6 text-xs font-medium text-muted-gold py-2">
            <button onClick={() => setActiveCategory('all')} className="hover:text-gold-primary whitespace-nowrap">All</button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.slug)} className="hover:text-gold-primary whitespace-nowrap capitalize">
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-2 md:px-4 mt-4">
        
        {/* HERO BANNER */}
        {!showSearch && activeCategory === 'all' && searchQuery === '' && (
          <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden border border-white/10 rounded-sm mb-6">
            <img src="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/70 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-ivory mb-4 leading-tight">Step Into <span className="gold-gradient-text">Luxury.</span></h1>
              <p className="text-muted-gold text-sm md:text-base mb-6 hidden md:block max-w-lg">Discover a collection crafted for those who demand perfection. Premium materials, timeless design.</p>
              <button onClick={() => document.getElementById('product-grid').scrollIntoView({ behavior: 'smooth' })} className="w-max gold-gradient-bg font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-sm shadow-md hover:opacity-90 transition">
                Shop Now
              </button>
            </div>
          </div>
        )}

        {/* TRUST BADGES */}
        {!showSearch && (
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
            {[{ icon: Truck, title: 'Safe Shipping' }, { icon: ShieldCheck, title: 'Secure Payment' }, { icon: Headphones, title: '24/7 Support' }].map((item, i) => (
              <div key={i} className="flex items-center justify-center gap-2 md:gap-3 bg-charcoal p-3 border border-white/5 rounded-sm">
                <item.icon size={20} className="text-gold-primary" />
                <span className="text-[10px] md:text-xs font-bold text-ivory uppercase tracking-wider">{item.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* AMAZON STYLE HORIZONTAL SLIDER FOR BESTSELLERS */}
        {!showSearch && activeCategory === 'all' && products.length > 0 && (
          <div className="mb-8 bg-charcoal p-4 rounded-sm border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-serif font-bold text-ivory">Trending Now</h2>
              <button className="text-xs text-gold-primary font-bold hover:underline">See all</button>
            </div>
            
            {/* Sliding Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {products.slice(0, 8).map((p) => (
                <div key={p.id} className="w-32 md:w-48 flex-shrink-0 snap-start bg-obsidian border border-white/10 rounded-sm p-2 hover:border-gold-primary/50 transition group">
                   <Link to={`/product/${p.id}`} className="block aspect-square overflow-hidden bg-black mb-2 rounded-sm relative">
                     <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition" />
                     {p.original_price && (
                        <span className="absolute top-1 left-1 bg-gold-primary text-obsidian text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                          {Math.round(((p.original_price - p.price) / p.original_price) * 100)}% OFF
                        </span>
                      )}
                   </Link>
                   <Link to={`/product/${p.id}`}>
                     <h3 className="text-xs text-ivory line-clamp-1 group-hover:text-gold-primary">{p.title}</h3>
                   </Link>
                   <p className="text-sm font-bold text-gold-primary mt-1">₹{p.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIES BANNER SLIDER */}
        {!showSearch && activeCategory === 'all' && categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg md:text-xl font-serif font-bold text-ivory mb-4">Shop By Category</h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`relative flex-shrink-0 snap-start w-32 md:w-48 h-20 md:h-28 rounded-md overflow-hidden border border-white/10 hover:border-gold-primary transition-all group`}
                >
                  <img src={cat.image_url || `https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=500&auto=format&fit=crop`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition duration-500" alt={cat.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent"></div>
                  <span className="absolute bottom-2 left-0 right-0 text-center text-[10px] md:text-xs font-bold text-ivory uppercase tracking-widest">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAIN PRODUCT GRID */}
        <div id="product-grid" className="bg-charcoal p-3 md:p-6 border border-white/5 rounded-sm shadow-lg">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-ivory">
              {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'all' ? 'Featured Products' : `${activeCategory.replace('-', ' ')} Collection`}
            </h2>
            <span className="text-xs text-gold-primary font-bold">{filteredProducts.length} items</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
              {[...Array(12)].map((_, i) => <div key={i} className="animate-pulse bg-obsidian h-64 rounded-sm"></div>)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-muted-gold text-center py-10">No products found in this section.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-4">
              {filteredProducts.map((p) => {
                const isOut = p.stock <= 0;
                return (
                  <div key={p.id} className="bg-obsidian border border-white/10 rounded-sm overflow-hidden flex flex-col hover:border-gold-primary/50 hover:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition group">
                    
                    <Link to={isOut ? '#' : `/product/${p.id}`} className="relative aspect-square block overflow-hidden bg-black">
                      <img src={p.images?.[0]} className={`w-full h-full object-cover group-hover:scale-105 transition duration-500 ${isOut ? 'opacity-50 grayscale' : ''}`} />
                      
                      {isOut && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="text-[10px] font-bold text-red-500 border border-red-500 px-2 py-1 bg-obsidian rounded-sm">SOLD OUT</span>
                        </div>
                      )}
                      
                      {p.original_price && !isOut && (
                        <span className="absolute top-1 left-1 bg-gold-primary text-obsidian text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                          {Math.round(((p.original_price - p.price) / p.original_price) * 100)}% OFF
                        </span>
                      )}
                    </Link>

                    <div className="p-2 md:p-3 flex flex-col flex-1">
                      <Link to={isOut ? '#' : `/product/${p.id}`}>
                        <h3 className="text-xs md:text-sm text-ivory font-medium line-clamp-2 leading-snug group-hover:text-gold-primary transition">{p.title}</h3>
                      </Link>
                      
                      <div className="mt-1 flex items-center gap-1">
                         <div className="flex text-gold-primary">
                            <Star size={10} className="fill-gold-primary" /><Star size={10} className="fill-gold-primary" /><Star size={10} className="fill-gold-primary" /><Star size={10} className="fill-gold-primary" /><Star size={10} className="fill-gold-primary" />
                         </div>
                         <span className="text-[10px] text-muted-gold">(12)</span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-base md:text-lg font-bold text-gold-primary">₹{p.price}</span>
                        {p.original_price && <span className="text-[10px] md:text-xs text-muted-gold line-through">₹{p.original_price}</span>}
                      </div>

                      {!isOut && (
                        <button 
                          onClick={(e) => handleAddClick(e, p)}
                          className="mt-2 w-full bg-charcoal-light border border-gold-primary/30 text-gold-primary text-[10px] font-bold uppercase py-1.5 rounded-sm hover:bg-gold-primary hover:text-obsidian transition"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-12 bg-charcoal border-t border-white/10 pt-10 pb-8 px-4 text-center">
         <Logo isWhite={true} />
         <div className="flex justify-center gap-6 mt-6 text-xs text-muted-gold font-medium">
            <Link to="/about" className="hover:text-gold-primary">About</Link>
            <Link to="/privacy" className="hover:text-gold-primary">Privacy</Link>
            <Link to="/terms" className="hover:text-gold-primary">Terms</Link>
            <Link to="/return" className="hover:text-gold-primary">Returns</Link>
         </div>
         <p className="text-[10px] text-muted-gold mt-6">© 2024 SS Traders. All Rights Reserved.</p>
      </footer>

      {/* SIZE MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} className="bg-charcoal border border-gold-primary/30 w-full max-w-sm rounded-t-lg md:rounded-sm p-6 pb-8">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
              <h3 className="font-serif font-bold text-lg text-ivory">Select Size</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-muted-gold hover:text-ivory"><X size={20} /></button>
            </div>
            <div className="flex gap-3 mb-6">
               <img src={selectedProduct.images?.[0]} className="w-16 h-16 object-cover rounded-sm border border-white/10" />
               <div>
                  <p className="text-sm font-bold text-ivory line-clamp-2">{selectedProduct.title}</p>
                  <p className="text-gold-primary font-bold mt-1">₹{selectedProduct.price}</p>
               </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {selectedProduct.sizes?.map((size) => {
                const isSizeOut = selectedProduct.size_stock?.[size] <= 0;
                return (
                  <button key={size} onClick={() => setSelectedSize(size)} disabled={isSizeOut} className={`py-2 rounded-sm border text-sm font-bold ${selectedSize === size ? 'border-gold-primary bg-gold-primary text-obsidian' : 'border-white/20 text-muted-gold'} ${isSizeOut ? 'opacity-40' : ''}`}>
                    {size}
                  </button>
                );
              })}
            </div>
            <button onClick={handleSizeConfirm} className="w-full gold-gradient-bg text-obsidian py-3 rounded-sm font-bold uppercase text-xs tracking-wider">
              Add to Cart
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
