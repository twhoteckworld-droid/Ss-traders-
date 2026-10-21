import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import ReturnPolicy from './pages/ReturnPolicy';
import AdminLogin from './pages/admin/AdminLogin';
import AdminResetPassword from './pages/admin/AdminResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductUpload from './pages/admin/AdminProductUpload';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminEditProduct from './pages/admin/AdminEditProduct';
import AdminSettings from './pages/admin/AdminSettings';
import CartDrawer from './components/CartDrawer';
import { useCartStore } from './store/cartStore';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
  }, []);
  if (loading) return <div className="p-10 text-center text-ivory bg-obsidian min-h-screen">Loading...</div>;
  if (!session) return <Navigate to="/admin/login" />;
  return children;
}

// Alag component banaya taaki useLocation use kar sake
function AppLayout() {
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore((s) => s.items.length);
  const location = useLocation();

  // Agar URL /admin se shuru hota hai, toh cart button mat dikhao
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/return" element={<ReturnPolicy />} />
        
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/upload" element={<ProtectedRoute><AdminProductUpload /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/edit/:id" element={<ProtectedRoute><AdminEditProduct /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
      </Routes>
      
      <CartDrawer />
      
      {/* Sirf tab dikhega jab admin route par nahi honge */}
      {count > 0 && !isAdminRoute && (
        <button onClick={openCart} className="fixed bottom-4 left-4 right-4 bg-charcoal border border-gold-primary text-gold-primary py-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)] font-bold z-40 flex justify-between px-6 uppercase tracking-widest text-sm hover:bg-gold-primary hover:text-obsidian transition">
          <span>View Cart ({count})</span><span>Checkout →</span>
        </button>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
