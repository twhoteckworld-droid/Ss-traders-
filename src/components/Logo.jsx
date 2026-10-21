import { Link } from 'react-router-dom';

export default function Logo({ isWhite = false }) {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      {/* Logo Graphic */}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-amber-500 bg-black flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] overflow-hidden relative">
        {/* Aap yahan apni logo image laga sakte ho: <img src="/logo.png" className="w-full h-full object-cover" /> */}
        <span className="text-amber-500 font-serif font-black text-xl md:text-2xl tracking-tighter italic">SS</span>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-500/20 to-transparent"></div>
      </div>
      <div>
        <h1 className={`text-lg md:text-xl font-serif font-black tracking-widest leading-none ${isWhite ? 'text-white' : 'text-black'}`}>
          SS TRADERS
        </h1>
        <p className={`text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-bold mt-1 ${isWhite ? 'text-amber-500' : 'text-amber-600'}`}>
          Luxury Footwear
        </p>
      </div>
    </Link>
  );
}
