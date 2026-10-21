import { Link } from 'react-router-dom';

export default function Logo({ isWhite = false }) {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      
      {/* Perfect Circular Logo Container */}
      <div className="w-11 h-11 md:w-14 md:h-14 rounded-full border-2 border-amber-500 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform duration-300 flex-shrink-0 bg-black">
        <img 
          src="https://i.supaimg.com/3921581e-9393-4ca3-8664-a7857de8a22d/2aca0a12-85eb-4cbb-a0a4-88b0cd21c9dd.jpg" 
          alt="SS Traders Logo" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text Branding */}
      <div>
        <h1 className={`text-lg md:text-xl font-serif font-black tracking-widest leading-none ${isWhite ? 'text-white' : 'text-black'}`}>
          SS TRADERS
        </h1>
        <p className={`text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-bold mt-1 text-amber-500`}>
          Luxury Footwear
        </p>
      </div>
      
    </Link>
  );
}
