import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-obsidian pb-24 font-sans text-ivory">
      <header className="sticky top-0 z-30 bg-charcoal/90 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <Link to="/" className="p-2.5 bg-obsidian border border-white/10 rounded-full hover:border-gold-primary/50 transition">
          <ArrowLeft size={20} className="text-gold-primary" />
        </Link>
        <h1 className="text-xl font-serif font-bold tracking-widest text-ivory uppercase">Privacy Policy</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        <div className="bg-charcoal p-8 md:p-12 rounded-2xl shadow-2xl border border-[rgba(212,175,55,0.2)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-primary/5 rounded-full blur-3xl"></div>
          
          <div className="flex justify-center mb-8 relative z-10">
            <div className="bg-obsidian border border-gold-primary/30 p-5 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <Shield size={48} className="text-gold-primary" />
            </div>
          </div>
          
          <h2 className="text-3xl font-serif font-bold text-center text-ivory mb-2">Your Privacy Matters</h2>
          <p className="text-center text-muted-gold text-sm mb-12">Last updated: October 2024</p>
          
          <div className="space-y-8 relative z-10">
            <section>
              <h3 className="text-lg font-serif font-bold text-gold-primary mb-3 flex items-center gap-2">
                <Eye size={18} /> 1. Information We Collect
              </h3>
              <p className="text-muted-gold text-sm leading-relaxed">
                When you place an order on SS Traders, we collect your Name, Phone Number, and Delivery Address. This information is used solely to process and deliver your order. We do not collect any sensitive financial information as payments are securely processed by Razorpay.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-serif font-bold text-gold-primary mb-3 flex items-center gap-2">
                <Database size={18} /> 2. How We Use Your Data
              </h3>
              <p className="text-muted-gold text-sm leading-relaxed">
                Your data is stored securely in our database. We do not sell, trade, or share your personal information with third parties. We may use your contact details to send order updates via WhatsApp or Email.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-serif font-bold text-gold-primary mb-3 flex items-center gap-2">
                <Lock size={18} /> 3. Data Security
              </h3>
              <p className="text-muted-gold text-sm leading-relaxed">
                We use industry-standard security protocols to protect your data. Our database is powered by Supabase, ensuring enterprise-grade encryption. Your payment information is handled entirely by Razorpay and never touches our servers.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
