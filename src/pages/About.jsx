import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Heart, ShieldCheck, Footprints, MapPin, Clock, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function About() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (data) setSettings(data);
    })();
  }, []);

  const mapQuery = encodeURIComponent("SS TRADERS, Mangwain Mohalla 264/12, Himachal Pradesh 175001");
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapDirectionUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24 font-sans text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <Link to="/" className="p-2.5 bg-white/5 border border-white/10 rounded-full active:scale-95 transition hover:bg-white/10">
          <ArrowLeft size={20} className="text-amber-500" />
        </Link>
        <h1 className="text-xl font-serif font-bold tracking-widest text-white uppercase">Our Story</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6">
        {/* Hero Section */}
        <section className="relative h-[300px] w-full flex items-center justify-center overflow-hidden rounded-3xl border border-white/10">
          <img 
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop" 
            alt="SS Traders Store" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/50 to-transparent" />
          <div className="relative z-10 text-center px-6">
            <h2 className="text-3xl font-serif font-black text-white mb-2 tracking-wide">Redefining Footwear</h2>
            <p className="text-amber-500 text-xs font-bold tracking-widest uppercase">Since Inception</p>
          </div>
        </section>

        {/* Story Section */}
        <section className="mt-8">
          <div className="bg-[#121212] p-8 rounded-3xl shadow-xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="flex justify-center mb-6 relative z-10">
              <div className="bg-black border border-amber-500/30 p-4 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Footprints size={36} className="text-amber-500" />
              </div>
            </div>
            <h3 className="text-2xl font-serif font-bold text-white text-center mb-5 tracking-wide">Welcome to SS Traders</h3>
            <p className="text-gray-400 text-sm leading-relaxed text-center mb-5 font-medium">
              Founded with a simple vision, SS Traders started as a small dream to provide premium quality footwear to everyone. We noticed that finding the perfect balance between style, comfort, and price was difficult.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed text-center font-medium">
              Today, we curate the finest collections of Sneakers, Formal Shoes, Ladies Footwear, and Kids' shoes. Every pair we sell goes through strict quality checks because we believe your feet deserve nothing but the best.
            </p>
          </div>
        </section>

        {/* VALUES SUB-TABLE SECTION (Naya Design) */}
        <section className="mt-12">
          <div className="bg-[#121212] border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            {/* Top Gold Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            
            <h3 className="text-xl font-serif font-bold text-white mb-6 text-center tracking-widest uppercase">Why Choose Us?</h3>
            
            {/* Sub-Table Container */}
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40 divide-y divide-white/10">
              
              {/* Row 1 */}
              <div className="p-5 flex gap-5 items-start hover:bg-white/5 transition duration-300">
                <div className="bg-amber-500/10 p-3 rounded-xl shrink-0 border border-amber-500/20">
                  <Award className="text-amber-500" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm tracking-wide">100% Original Products</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">We source directly from trusted manufacturers to ensure genuine quality.</p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="p-5 flex gap-5 items-start hover:bg-white/5 transition duration-300">
                <div className="bg-amber-500/10 p-3 rounded-xl shrink-0 border border-amber-500/20">
                  <ShieldCheck className="text-amber-500" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm tracking-wide">Secure & Easy Shopping</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">Shop seamlessly with our encrypted payment gateway and quick checkout.</p>
                </div>
              </div>

              {/* Row 3 */}
              <div className="p-5 flex gap-5 items-start hover:bg-white/5 transition duration-300">
                <div className="bg-amber-500/10 p-3 rounded-xl shrink-0 border border-amber-500/20">
                  <Heart className="text-amber-500" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm tracking-wide">Customer First Approach</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">Our support team is always ready to help you with sizes and queries.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Store Location */}
        <section className="mt-10">
           <h3 className="text-xl font-serif font-bold text-white mb-4 text-center tracking-wide">Visit Our Store</h3>
           <div className="bg-[#121212] rounded-3xl shadow-xl border border-white/5 p-5">
              <div className="w-full h-56 rounded-2xl overflow-hidden mb-5 border border-white/10">
                <iframe 
                  src={mapEmbedUrl}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="SS Traders Location"
                  className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition duration-500"
                ></iframe>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-red-500 mt-0.5 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-white text-sm tracking-wide">SS Traders Mandi</h4>
                  <p className="text-gray-400 text-xs mt-1 font-medium">Mangwain Mohalla 264/12, Himachal Pradesh 175001</p>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-2 font-medium">
                    <Clock size={12} />
                    <span>Closed · Opens 9 am</span>
                  </div>
                </div>
              </div>
              <a href={mapDirectionUrl} target="_blank" rel="noreferrer" className="mt-5 block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3.5 rounded-xl transition uppercase tracking-widest">
                Get Directions
              </a>
           </div>
        </section>

        {/* Social Media Connect */}
        <section className="mt-12 text-center">
          <h3 className="text-xl font-serif font-bold text-white mb-4 tracking-wide">Follow Our Journey</h3>
          <p className="text-gray-500 text-xs mb-6 max-w-sm mx-auto">Get a sneak peek into our latest collections, offers, and behind-the-scenes updates.</p>
          <div className="flex justify-center gap-4">
             <a href={settings?.instagram_url || '#'} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center text-[#E1306C] hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white transition-all duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
             </a>
             <a href={settings?.facebook_url || '#'} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
             </a>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 text-center mb-8">
          <Link to="/" className="inline-block bg-gradient-to-r from-amber-600 to-amber-400 text-black font-black uppercase tracking-widest text-xs px-10 py-4 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all active:scale-95">
            Explore Collection
          </Link>
        </section>
      </main>
    </div>
  );
}
