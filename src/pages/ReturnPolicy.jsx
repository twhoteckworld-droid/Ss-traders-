import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCcw } from 'lucide-react';

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link to="/" className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Return Policy</h1>
      </header>
      <main className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-center mb-6"><RefreshCcw size={40} className="text-amber-600" /></div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. Return Eligibility</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">We accept returns only if the product is damaged or if you received the wrong size. The request must be raised within 24 hours of delivery via WhatsApp.</p>
          
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. Condition of Return</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">The product must be unused, in its original packaging, and all tags must be intact. Shoes should not show any signs of wear.</p>
          
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. Refund Process</h2>
          <p className="text-sm text-gray-600 leading-relaxed">Once we receive the returned item, we will inspect it. If approved, the refund will be processed to your original payment method within 5-7 business days.</p>
        </div>
      </main>
    </div>
  );
}
