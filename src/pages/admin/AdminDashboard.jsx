import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Package, ShoppingBag, RefreshCw, Layers, Bell, Tag, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnlyActionable, setShowOnlyActionable] = useState(false); // Filter state
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
      if (newStatus === 'Delivered') alert("✅ Order marked as Delivered!");
      fetchOrders(); 
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure? This will permanently delete this order.")) return;
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) alert("Error deleting: " + error.message);
    else {
      alert("🗑️ Order deleted.");
      fetchOrders();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // 🔥 Naya Logic: "Actionable" matlab wo orders jo Delivered ya Cancelled nahi hue hain
  const actionableOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const actionableCount = actionableOrders.length;

  const displayedOrders = showOnlyActionable ? actionableOrders : orders;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-emerald-900">Admin Panel</h1>
          
          <div className="relative">
            <Bell size={22} className="text-gray-600" />
            {actionableCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-sm animate-pulse">
                {actionableCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={fetchOrders} className="p-2 bg-gray-100 rounded-full active:bg-gray-200 text-gray-700">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleLogout} className="text-red-500 text-sm flex items-center gap-1 font-semibold bg-red-50 px-3 py-1.5 rounded-lg active:scale-95 transition">
            <LogOut size={16}/> Logout
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/admin/upload" className="bg-emerald-700 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition shadow-sm">
            <Package size={24} /> <span className="text-xs font-semibold text-center">Add Product</span>
          </Link>
          <Link to="/admin/products" className="bg-gray-800 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition shadow-sm">
            <Layers size={24} /> <span className="text-xs font-semibold text-center">Manage Products</span>
          </Link>
          <Link to="/admin/categories" className="bg-indigo-600 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition shadow-sm">
            <Tag size={24} /> <span className="text-xs font-semibold text-center">Manage Categories</span>
          </Link>
          
          {/* Actionable Orders Card */}
          <button 
            onClick={() => setShowOnlyActionable(!showOnlyActionable)}
            className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-sm transition-all ${
              showOnlyActionable ? 'bg-amber-600 ring-4 ring-amber-200' : 'bg-amber-500'
            } text-white active:scale-95`}
          >
            <ShoppingBag size={24} /> 
            <span className="text-xs font-semibold text-center">
              {showOnlyActionable ? 'Show All Orders' : 'New Orders'}
            </span>
            {actionableCount > 0 && (
              <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-md">
                {actionableCount}
              </span>
            )}
          </button>
        </div>

        <h2 className="text-lg font-bold mt-6 mb-2 flex items-center gap-2">
          {showOnlyActionable ? 'Orders to Process' : 'Recent Orders'}
          {actionableCount > 0 && !showOnlyActionable && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
              {actionableCount} Action Req.
            </span>
          )}
        </h2>

        {loading && orders.length === 0 && <p className="text-gray-500 text-sm text-center py-10">Loading orders...</p>}
        
        {!loading && displayedOrders.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-10">
            {showOnlyActionable ? 'No new orders to process.' : 'No orders yet.'}
          </p>
        )}
        
        {displayedOrders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-sm text-emerald-900">{order.order_number}</p>
                <p className="text-xs text-gray-500 font-medium">{order.customer_name} • {order.customer_phone}</p>
                <p className="text-[11px] text-gray-400 mt-1">{order.customer_address}</p>
                {/* Razorpay Payment ID */}
                {order.razorpay_payment_id && <p className="text-[10px] text-blue-600 font-bold mt-1">Paid: {order.razorpay_payment_id}</p>}
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>{order.status}</span>
            </div>
            
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3 mt-2">
              {order.order_items?.map(item => (
                <div key={item.id} className="flex justify-between py-1 border-b border-gray-200 last:border-0">
                  <span className="font-medium">{item.product_title} <span className="text-gray-400">× {item.quantity}</span></span>
                  <span className="font-bold">₹{item.unit_price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-gray-300 mt-2 pt-2 font-bold text-right text-emerald-900 text-sm">Total: ₹{order.total_amount}</div>
            </div>

            {/* Buttons for Action */}
            {order.status !== 'Delivered' && (
              <div className="flex gap-2">
                {order.status === 'Confirmed' && (
                  <button onClick={() => updateStatus(order.id, 'Delivered')} className="flex-1 bg-blue-600 text-white text-sm py-2.5 rounded-lg font-semibold active:bg-blue-800 transition">
                    Mark as Delivered
                  </button>
                )}
                <button onClick={() => deleteOrder(order.id)} className="px-4 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-100">
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
