import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Logo({ isWhite = false }) {
  const [logoUrl, setLogoUrl] = useState('https://i.supaimg.com/3921581e-9393-4ca3-8664-a7857de8a22d/2aca0a12-85eb-4cbb-a0a4-88b0cd21c9dd.jpg');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('logo_url').eq('id', 1).single();
      if (data && data.logo_url) setLogoUrl(data.logo_url);
    })();
  }, []);

  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-gold-primary/50 overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:border-gold-primary transition-colors duration-300 flex-shrink-0 bg-obsidian">
        <img 
          src={logoUrl} 
          alt="SS Traders Logo" 
          className="w-full h-full object-cover scale-110 object-center"
        />
      </div>
      <div>
        <h1 className={`text-xl md:text-2xl font-serif font-bold tracking-widest leading-none ${isWhite ? 'text-ivory' : 'text-obsidian'}`}>
          SS TRADERS
        </h1>
        <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-semibold mt-1.5 text-gold-primary">
          Premium Footwear
        </p>
      </div>
    </Link>
  );
}
