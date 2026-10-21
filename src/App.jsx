import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductUpload from './pages/admin/AdminProductUpload';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminEditProduct from './pages/admin/AdminEditProduct';
import CartDrawer from './components/CartDrawer';
import { useCartStore } from './store/cartStore';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
  }, []);
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!session) return <Navigate to="/admin/login" />;
  return children;
}

export default function App() {
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore((s) => s.items.length);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/return" element={<ReturnPolicy />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/upload" element={<ProtectedRoute><AdminProductUpload /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/edit/:id" element={<ProtectedRoute><AdminEditProduct /></ProtectedRoute>} />
      </Routes>
      
      {/* Yahan CartDrawer render ho raha hai */}
      <CartDrawer />
      
      {count > 0 && (
        <button onClick={openCart} className="fixed bottom-4 left-4 right-4 bg-emerald-700 text-white py-4 rounded-2xl shadow-2xl font-bold z-40 flex justify-between px-6">
          <span>View Cart ({count})</span><span>Checkout →</span>
        </button>
      )}
    </BrowserRouter>
  );
}
