import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link to="/" className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
      </header>
      <main className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-center mb-6"><Shield size={40} className="text-emerald-700" /></div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. Information We Collect</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">When you place an order on SS Traders, we collect your Name, Phone Number, and Delivery Address. This information is used solely to process and deliver your order.</p>
          
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. How We Use Your Data</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">Your data is stored securely in our database. We do not sell, trade, or share your personal information with third parties. We may send you order updates via WhatsApp or Email.</p>
          
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. Data Security</h2>
          <p className="text-sm text-gray-600 leading-relaxed">We use industry-standard security protocols to protect your data. Our database is powered by Supabase, ensuring enterprise-grade encryption.</p>
        </div>
      </main>
    </div>
  );
}
