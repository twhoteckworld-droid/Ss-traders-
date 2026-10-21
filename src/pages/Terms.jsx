import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CreditCard, Truck, AlertCircle } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-obsidian pb-24 font-sans text-ivory">
      <header className="sticky top-0 z-30 bg-charcoal/90 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <Link to="/" className="p-2.5 bg-obsidian border border-white/10 rounded-full hover:border-gold-primary/50 transition">
          <ArrowLeft size={20} className="text-gold-primary" />
        </Link>
        <h1 className="text-xl font-serif font-bold tracking-widest text-ivory uppercase">Terms of Service</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        <div className="bg-charcoal p-8 md:p-12 rounded-2xl shadow-2xl border border-[rgba(212,175,55,0.2)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-primary/5 rounded-full blur-3xl"></div>

          <div className="flex justify-center mb-8 relative z-10">
            <div className="bg-obsidian border border-gold-primary/30 p-5 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <FileText size={48} className="text-gold-primary" />
            </div>
          </div>

          <h2 className="text-3xl font-serif font-bold text-center text-ivory mb-2">Terms & Conditions</h2>
          <p className="text-center text-muted-gold text-sm mb-12">Please read carefully before placing an order.</p>

          <div className="space-y-8 relative z-10">
            <section>
              <h3 className="text-lg font-serif font-bold text-gold-primary mb-3 flex items-center gap-2">
                <AlertCircle size={18} /> 1. Order Confirmation
              </h3>
              <p className="text-muted-gold text-sm leading-relaxed">
                All orders placed via our website are subject to availability. An order is only confirmed once our team verifies it and marks it as "Confirmed" in our system. We reserve the right to cancel any order due to stock unavailability or suspicious activity.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-serif font-bold text-gold-primary mb-3 flex items-center gap-2">
                <CreditCard size={18} /> 2. Pricing & Payments
              </h3>
              <p className="text-muted-gold text-sm leading-relaxed">
                All prices listed on the website are inclusive of applicable taxes. We accept online payments via Razorpay (UPI, Cards, Netbanking). Once a payment is successful, the order status will be updated to "Confirmed".
              </p>
            </section>

            <section>
              <h3 className="text-lg font-serif font-bold text-gold-primary mb-3 flex items-center gap-2">
                <Truck size={18} /> 3. Shipping & Delivery
              </h3>
              <p className="text-muted-gold text-sm leading-relaxed">
                We strive to deliver your orders within 3-7 business days. Delivery times may vary depending on your location. Shipping charges (if applicable) are displayed at checkout.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
