import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Heart, ShieldCheck, Footprints, MapPin, Clock } from 'lucide-react';
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
    <div className="min-h-screen bg-obsidian pb-24">
      <header className="sticky top-0 z-30 bg-obsidian/90 backdrop-blur-md border-b border-[rgba(212,175,55,0.15)] px-4 py-4 flex items-center gap-4">
        <Link to="/" className="p-2.5 bg-charcoal border border-white/10 rounded-full active:scale-95 transition hover:border-gold-primary/50">
          <ArrowLeft size={20} className="text-gold-primary" />
        </Link>
        <h1 className="text-xl font-serif font-bold tracking-widest text-ivory uppercase">Our Story</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        {/* Hero Section */}
        <section className="relative h-[350px] w-full flex items-center justify-center overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.2)]">
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-transparent" />
          <div className="relative z-10 text-center px-6">
            <h2 className="text-4xl font-serif font-bold text-ivory mb-3">Redefining Footwear</h2>
            <p className="text-gold-primary text-xs font-bold tracking-[0.2em] uppercase">Since Inception</p>
          </div>
        </section>

        {/* Story Section */}
        <section className="mt-8">
          <div className="bg-charcoal p-8 rounded-2xl shadow-xl border border-white/5 relative overflow-hidden luxury-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-primary/5 rounded-full blur-3xl"></div>
            <div className="flex justify-center mb-6 relative z-10">
              <div className="bg-obsidian border border-gold-primary/30 p-4 rounded-full">
                <Footprints size={36} className="text-gold-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-serif font-bold text-ivory text-center mb-6">Welcome to SS Traders</h3>
            <p className="text-muted-gold text-sm leading-relaxed text-center mb-5">
              Founded with a simple vision, SS Traders started as a small dream to provide premium quality footwear to everyone. We noticed that finding the perfect balance between style, comfort, and price was difficult.
            </p>
            <p className="text-muted-gold text-sm leading-relaxed text-center">
              Today, we curate the finest collections of Sneakers, Formal Shoes, Ladies Footwear, and Kids' shoes. Every pair we sell goes through strict quality checks because we believe your feet deserve nothing but the best.
            </p>
          </div>
        </section>

        {/* VALUES SUB-TABLE */}
        <section className="mt-12">
          <div className="bg-charcoal border border-[rgba(212,175,55,0.2)] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-primary to-transparent"></div>
            
            <h3 className="text-xl font-serif font-bold text-ivory mb-6 text-center tracking-widest">Why Choose Us?</h3>
            
            <div className="border border-white/10 rounded-xl overflow-hidden bg-obsidian/50 divide-y divide-white/10">
              <div className="p-5 flex gap-5 items-start hover:bg-white/5 transition duration-300">
                <div className="bg-gold-primary/10 p-3 rounded-lg shrink-0 border border-gold-primary/20">
                  <Award className="text-gold-primary" size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-ivory text-sm">100% Original Products</h4>
                  <p className="text-xs text-muted-gold mt-1">We source directly from trusted manufacturers to ensure genuine quality.</p>
                </div>
              </div>

              <div className="p-5 flex gap-5 items-start hover:bg-white/5 transition duration-300">
                <div className="bg-gold-primary/10 p-3 rounded-lg shrink-0 border border-gold-primary/20">
                  <ShieldCheck className="text-gold-primary" size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-ivory text-sm">Secure & Easy Shopping</h4>
                  <p className="text-xs text-muted-gold mt-1">Shop seamlessly with our encrypted payment gateway and quick checkout.</p>
                </div>
              </div>

              <div className="p-5 flex gap-5 items-start hover:bg-white/5 transition duration-300">
                <div className="bg-gold-primary/10 p-3 rounded-lg shrink-0 border border-gold-primary/20">
                  <Heart className="text-gold-primary" size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-ivory text-sm">Customer First Approach</h4>
                  <p className="text-xs text-muted-gold mt-1">Our support team is always ready to help you with sizes and queries.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Store Location */}
        <section className="mt-10">
           <h3 className="text-xl font-serif font-bold text-ivory mb-4 text-center tracking-wide">Visit Our Store</h3>
           <div className="bg-charcoal rounded-2xl shadow-xl border border-white/5 p-5 luxury-card">
              <div className="w-full h-56 rounded-xl overflow-hidden mb-5 border border-white/10">
                <iframe src={mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Location" className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition duration-500"></iframe>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-gold-primary mt-0.5 shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-ivory text-sm">SS Traders Mandi</h4>
                  <p className="text-muted-gold text-xs mt-1">Mangwain Mohalla 264/12, Himachal Pradesh 175001</p>
                  <div className="flex items-center gap-1 text-muted-gold text-xs mt-2">
                    <Clock size={12} />
                    <span>Closed · Opens 9 am</span>
                  </div>
                </div>
              </div>
              <a href={mapDirectionUrl} target="_blank" rel="noreferrer" className="mt-5 block w-full text-center gold-gradient-bg font-bold text-xs py-3.5 rounded-md transition uppercase tracking-widest hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                Get Directions
              </a>
           </div>
        </section>

        {/* Social Media */}
        <section className="mt-12 text-center">
          <h3 className="text-lg font-serif font-bold text-ivory mb-4 tracking-wide">Follow Our Journey</h3>
          <div className="flex justify-center gap-4">
             <a href={settings?.instagram_url || '#'} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-charcoal border border-white/10 flex items-center justify-center text-muted-gold hover:text-gold-primary hover:border-gold-primary transition-all duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
             </a>
             <a href={settings?.facebook_url || '#'} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-charcoal border border-white/10 flex items-center justify-center text-muted-gold hover:text-gold-primary hover:border-gold-primary transition-all duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
             </a>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 text-center mb-8">
          <Link to="/" className="inline-block bg-transparent border border-gold-primary/50 text-gold-primary hover:bg-gold-primary hover:text-obsidian font-bold uppercase tracking-widest text-xs px-10 py-4 rounded-md transition-all active:scale-95">
            Explore Collection
          </Link>
        </section>
      </main>
    </div>
  );
}
