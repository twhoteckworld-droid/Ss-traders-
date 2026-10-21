import { Link } from 'react-router-dom';

export default function Logo({ isWhite = false }) {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      {/* Custom SVG Logo */}
      <div className={`p-2 rounded-xl transition-colors ${isWhite ? 'bg-white/10' : 'bg-emerald-900'} group-hover:scale-105`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`w-6 h-6 ${isWhite ? 'text-amber-400' : 'text-amber-400'}`}
        >
          <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"></path>
          <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"></path>
          <path d="M16 17h4"></path>
          <path d="M4 13h4"></path>
        </svg>
      </div>
      <div>
        <h1 className={`text-xl font-black tracking-tight leading-none ${isWhite ? 'text-white' : 'text-emerald-950'}`}>
          SS TRADERS
        </h1>
        <p className={`text-[8px] uppercase tracking-[0.25em] font-bold mt-0.5 ${isWhite ? 'text-emerald-200' : 'text-emerald-700'}`}>
          Premium Footwear
        </p>
      </div>
    </Link>
  );
}
