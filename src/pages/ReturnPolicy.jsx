import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-obsidian pb-24 font-sans text-ivory">
      <header className="sticky top-0 z-30 bg-charcoal/90 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <Link to="/" className="p-2.5 bg-obsidian border border-white/10 rounded-full hover:border-gold-primary/50 transition">
          <ArrowLeft size={20} className="text-gold-primary" />
        </Link>
        <h1 className="text-xl font-serif font-bold tracking-widest text-ivory uppercase">Return Policy</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        <div className="bg-charcoal p-8 md:p-12 rounded-2xl shadow-2xl border border-[rgba(212,175,55,0.2)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-primary/5 rounded-full blur-3xl"></div>

          <div className="flex justify-center mb-8 relative z-10">
            <div className="bg-obsidian border border-gold-primary/30 p-5 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <RefreshCcw size={48} className="text-gold-primary" />
            </div>
          </div>

          <h2 className="text-3xl font-serif font-bold text-center text-ivory mb-2">Returns & Refunds</h2>
          <p className="text-center text-muted-gold text-sm mb-12">Hassle-free returns within 7 days.</p>

          <div className="space-y-8 relative z-10">
            <section>
              <h3 className="text-lg font-serif font-bold text-gold-primary mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} /> 1. Return Eligibility
              </h3>
              <p className="text-muted-gold text-sm leading-relaxed">
                We accept returns only if the product is damaged or if you received the wrong size. The request must be raised within 24 hours of delivery via WhatsApp or Email.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-serif font-bold text-gold-primary mb-3 flex items-center gap-2">
                <XCircle size={18} /> 2. Condition of Return
              </h3>
              <p className="text-muted-gold text-sm leading-relaxed">
                The product must be unused, in its original packaging, and all tags must be intact. Shoes should not show any signs of wear. If the product is found used, the return will be rejected.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-serif font-bold text-gold-primary mb-3 flex items-center gap-2">
                <Clock size={18} /> 3. Refund Process
              </h3>
              <p className="text-muted-gold text-sm leading-relaxed">
                Once we receive the returned item, we will inspect it. If approved, the refund will be processed to your original payment method within 5-7 business days. Shipping charges are non-refundable.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
