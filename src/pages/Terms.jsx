import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link to="/" className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Terms & Conditions</h1>
      </header>
      <main className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-center mb-6"><FileText size={40} className="text-blue-700" /></div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. Order Confirmation</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">All orders placed via our website are subject to availability. An order is only confirmed once our team verifies it via WhatsApp and marks it as "Confirmed" in our system.</p>
          
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. Pricing</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">All prices listed on the website are inclusive of applicable taxes. We reserve the right to change prices without prior notice.</p>
          
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. Shipping & Delivery</h2>
          <p className="text-sm text-gray-600 leading-relaxed">We strive to deliver your orders within 3-7 business days. Delivery times may vary depending on your location.</p>
        </div>
      </main>
    </div>
  );
}
