import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Heart, ShieldCheck, Footprints, MapPin, Clock } from 'lucide-react';

export default function About() {
  const mapQuery = encodeURIComponent("SS TRADERS, Mangwain Mohalla 264/12, Himachal Pradesh 175001");
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapDirectionUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link to="/" className="p-2 bg-gray-100 rounded-full active:scale-95 transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-emerald-950 tracking-tight">About Us</h1>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-[300px] w-full flex items-center justify-center overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop" 
            alt="SS Traders Store" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-emerald-950/70" />
          <div className="relative z-10 text-center px-6">
            <h2 className="text-3xl font-black text-white mb-2">Our Story</h2>
            <p className="text-emerald-100 text-sm font-medium">Redefining Footwear in India</p>
          </div>
        </section>

        {/* Story Section */}
        <section className="p-6 max-w-2xl mx-auto -mt-10 relative z-20">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <Footprints size={32} className="text-emerald-800" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Welcome to SS Traders</h3>
            <p className="text-gray-600 text-sm leading-relaxed text-center mb-4">
              Founded with a simple vision, SS Traders started as a small dream to provide premium quality footwear to everyone. We noticed that finding the perfect balance between style, comfort, and price was difficult. 
            </p>
            <p className="text-gray-600 text-sm leading-relaxed text-center">
              Today, we curate the finest collections of Sneakers, Formal Shoes, Ladies Footwear, and Kids' shoes. Every pair we sell goes through strict quality checks because we believe your feet deserve nothing but the best.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="px-6 py-8 max-w-2xl mx-auto">
          <h3 className="text-lg font-extrabold text-gray-900 mb-6 text-center">Why Choose SS Traders?</h3>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start">
              <div className="bg-amber-100 p-3 rounded-full shrink-0">
                <Award className="text-amber-600" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">100% Original Products</h4>
                <p className="text-xs text-gray-500 mt-1">We source directly from trusted manufacturers to ensure you get genuine quality every time.</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start">
              <div className="bg-blue-100 p-3 rounded-full shrink-0">
                <ShieldCheck className="text-blue-600" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Secure & Easy Shopping</h4>
                <p className="text-xs text-gray-500 mt-1">Order directly via WhatsApp with zero complicated checkout processes. Safe and secure.</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start">
              <div className="bg-rose-100 p-3 rounded-full shrink-0">
                <Heart className="text-rose-600" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Customer First Approach</h4>
                <p className="text-xs text-gray-500 mt-1">Our support team is always ready to help you with sizes, exchanges, and any queries.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Store Location Section */}
        <section className="px-6 py-4 max-w-2xl mx-auto">
           <h3 className="text-lg font-extrabold text-gray-900 mb-4 text-center">Visit Our Store</h3>
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="w-full h-56 rounded-xl overflow-hidden mb-4 border border-gray-200">
                <iframe 
                  src={mapEmbedUrl}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="SS Traders Location"
                ></iframe>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-emerald-700 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">SS Traders Store</h4>
                  <p className="text-gray-500 text-xs mt-0.5">Mangwain Mohalla 264/12, Himachal Pradesh 175001</p>
                  <div className="flex items-center gap-1 text-gray-400 text-xs mt-2 font-medium">
                    <Clock size={12} />
                    <span>Closed · Opens 9 am</span>
                  </div>
                </div>
              </div>
              <a 
                href={mapDirectionUrl} 
                target="_blank" 
                rel="noreferrer"
                className="mt-4 block w-full text-center bg-emerald-800 text-white font-bold text-sm py-3 rounded-xl shadow-md active:scale-95 transition"
              >
                Get Directions on Maps
              </a>
           </div>
        </section>

        {/* Call to Action */}
        <section className="px-6 py-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Step Up Your Style?</h3>
          <p className="text-sm text-gray-500 mb-6">Explore our latest collection now.</p>
          <Link to="/" className="inline-block bg-emerald-800 text-white font-bold px-8 py-3.5 rounded-full shadow-lg active:scale-95 transition">
            Shop Now
          </Link>
        </section>
      </main>
    </div>
  );
}
