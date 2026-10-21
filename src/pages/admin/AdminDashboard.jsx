import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Package, ShoppingBag, RefreshCw, Layers, Bell, Tag, X, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) alert(error.message);
    else {
      if (newStatus === 'Confirmed') alert("✅ Order Confirmed!\n\nProduct stock has been deducted.");
      fetchOrders(); 
    }
  };

  // Naya function: Fake order delete karne ke liye
  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure? This will permanently delete this order.")) return;
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) alert("Error deleting: " + error.message);
    else {
      alert("🗑️ Fake/Abandoned order deleted.");
      fetchOrders();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const displayedOrders = showOnlyPending ? orders.filter(o => o.status === 'Pending') : orders;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-emerald-900">Admin Panel</h1>
          <div className="relative">
            <Bell size={22} className="text-gray-600" />
            {pendingOrdersCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{pendingOrdersCount}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchOrders} className="p-2 bg-gray-100 rounded-full"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button>
          <button onClick={handleLogout} className="text-red-500 text-sm font-semibold bg-red-50 px-3 py-1.5 rounded-lg"><LogOut size={16}/> Logout</button>
        </div>
      </header>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/admin/upload" className="bg-emerald-700 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2"><Package size={24} /> <span className="text-xs font-semibold">Add Product</span></Link>
          <Link to="/admin/products" className="bg-gray-800 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2"><Layers size={24} /> <span className="text-xs font-semibold">Products</span></Link>
          <Link to="/admin/categories" className="bg-indigo-600 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2"><Tag size={24} /> <span className="text-xs font-semibold">Categories</span></Link>
          <button onClick={() => setShowOnlyPending(!showOnlyPending)} className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 relative ${showOnlyPending ? 'bg-amber-600 ring-2 ring-amber-300' : 'bg-amber-500'} text-white`}>
            <ShoppingBag size={24} /> <span className="text-xs font-semibold">{showOnlyPending ? 'All Orders' : 'Pending Orders'}</span>
            {pendingOrdersCount > 0 && <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{pendingOrdersCount}</span>}
          </button>
        </div>

        {displayedOrders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-sm text-emerald-900">{order.order_number}</p>
                <p className="text-xs text-gray-500 font-medium">{order.customer_name} • {order.customer_phone}</p>
                <p className="text-[11px] text-gray-400 mt-1">{order.customer_address}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>{order.status}</span>
            </div>
            
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3 mt-2">
              {order.order_items?.map(item => (
                <div key={item.id} className="flex justify-between py-1 border-b border-gray-200 last:border-0">
                  <span>{item.product_title} <span className="text-gray-400">× {item.quantity}</span></span>
                  <span className="font-bold">₹{item.unit_price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 font-bold text-right text-emerald-900">Total: ₹{order.total_amount}</div>
            </div>

            {order.status === 'Pending' && (
              <div className="flex gap-2">
                <button onClick={() => updateStatus(order.id, 'Confirmed')} className="flex-1 bg-emerald-600 text-white text-sm py-2.5 rounded-lg font-semibold shadow-md">
                  Confirm Order
                </button>
                {/* Naya Delete Button */}
                <button onClick={() => deleteOrder(order.id)} className="px-4 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
