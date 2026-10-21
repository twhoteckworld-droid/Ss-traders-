import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Package, ShoppingBag, RefreshCw, Layers, Bell, Tag, Trash2, Settings, AlertTriangle, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnlyActionable, setShowOnlyActionable] = useState(false);
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
    else fetchOrders();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const actionableOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const actionableCount = actionableOrders.length;
  const displayedOrders = showOnlyActionable ? actionableOrders : orders;

  return (
    <div className="min-h-screen bg-obsidian pb-24 font-sans text-ivory">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-charcoal border-b border-white/10 shadow-lg px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-serif font-bold text-ivory tracking-wide">Admin Panel</h1>
            <div className="relative">
              <Bell size={20} className="text-muted-gold" />
              {actionableCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold-primary text-obsidian text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border border-obsidian animate-pulse">
                  {actionableCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={fetchOrders} className="p-2.5 bg-obsidian border border-white/10 rounded-md text-muted-gold hover:text-gold-primary transition">
              <RefreshCw size={18} className={loading ? "animate-spin text-gold-primary" : ""} />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-bold bg-obsidian border border-red-500/30 text-red-400 px-4 py-2.5 rounded-md hover:bg-red-500/10 transition uppercase tracking-wider">
              <LogOut size={16}/> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6 mt-4">
        
        {/* ACTION GRID (Premium Black & Gold) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Link to="/admin/upload" className="bg-charcoal border border-white/5 hover:border-gold-primary/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition group shadow-lg">
            <div className="p-2.5 bg-obsidian rounded-full group-hover:bg-gold-primary/10 transition"><Package size={22} className="text-gold-primary" /></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-center text-muted-gold group-hover:text-ivory">Add Product</span>
          </Link>
          
          <Link to="/admin/products" className="bg-charcoal border border-white/5 hover:border-gold-primary/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition group shadow-lg">
            <div className="p-2.5 bg-obsidian rounded-full group-hover:bg-gold-primary/10 transition"><Layers size={22} className="text-gold-primary" /></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-center text-muted-gold group-hover:text-ivory">Manage Products</span>
          </Link>
          
          <Link to="/admin/categories" className="bg-charcoal border border-white/5 hover:border-gold-primary/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition group shadow-lg">
            <div className="p-2.5 bg-obsidian rounded-full group-hover:bg-gold-primary/10 transition"><Tag size={22} className="text-gold-primary" /></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-center text-muted-gold group-hover:text-ivory">Categories</span>
          </Link>

          <Link to="/admin/settings" className="bg-charcoal border border-white/5 hover:border-gold-primary/50 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition group shadow-lg">
            <div className="p-2.5 bg-obsidian rounded-full group-hover:bg-gold-primary/10 transition"><Settings size={22} className="text-gold-primary" /></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-center text-muted-gold group-hover:text-ivory">Site Settings</span>
          </Link>
          
          {/* Orders Toggle Button */}
          <button onClick={() => setShowOnlyActionable(!showOnlyActionable)} className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition group shadow-lg border ${showOnlyActionable ? 'border-gold-primary bg-gold-primary/10' : 'border-white/5 bg-charcoal hover:border-gold-primary/50'} relative`}>
            <div className="p-2.5 bg-obsidian rounded-full group-hover:bg-gold-primary/10 transition"><ShoppingBag size={22} className="text-gold-primary" /></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-center text-muted-gold group-hover:text-ivory">{showOnlyActionable ? 'Show All' : 'New Orders'}</span>
            {actionableCount > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {actionableCount}
              </span>
            )}
          </button>
        </div>

        {/* ORDERS LIST */}
        <div className="bg-charcoal border border-white/5 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
            <h2 className="text-lg font-serif font-bold text-ivory tracking-wide">
              {showOnlyActionable ? 'Orders to Process' : 'Recent Orders'}
            </h2>
            {actionableCount > 0 && !showOnlyActionable && (
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                {actionableCount} Pending Action
              </span>
            )}
          </div>

          <div className="divide-y divide-white/5">
            {loading && orders.length === 0 && <p className="text-center text-muted-gold py-10">Loading orders...</p>}
            {!loading && displayedOrders.length === 0 && <p className="text-center text-muted-gold py-10">No orders found.</p>}
            
            {displayedOrders.map(order => (
              <div key={order.id} className="p-5 hover:bg-white/[0.02] transition">
                <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                  <div>
                    <p className="font-bold text-sm text-gold-primary tracking-wide">{order.order_number}</p>
                    <p className="text-xs font-semibold text-ivory mt-1">{order.customer_name} <span className="text-muted-gold font-normal">• {order.customer_phone}</span></p>
                    <p className="text-[11px] text-muted-gold mt-1 max-w-md">{order.customer_address}</p>
                    {order.razorpay_payment_id && <p className="text-[10px] text-blue-400 font-bold mt-1.5 bg-blue-500/10 inline-block px-2 py-0.5 rounded border border-blue-500/20">Paid: {order.razorpay_payment_id}</p>}
                  </div>
                  <span className={`text-[10px] px-3 py-1.5 rounded-md font-bold uppercase tracking-widest ${
                    order.status === 'Pending' ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/20' :
                    order.status === 'Confirmed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                    'bg-green-500/10 text-green-400 border border-green-500/20'
                  }`}>{order.status}</span>
                </div>
                
                {/* Items Table */}
                <div className="bg-obsidian border border-white/5 rounded-lg p-3 mb-4">
                  {order.order_items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0 text-xs">
                      <span className="font-medium text-muted-gold">{item.product_title} <span className="text-[10px] text-white/30">× {item.quantity}</span></span>
                      <span className="font-bold text-ivory">₹{item.unit_price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                    <span className="text-xs text-muted-gold uppercase tracking-widest">Total Amount</span>
                    <span className="font-bold text-lg text-gold-primary">₹{order.total_amount}</span>
                  </div>
                </div>

                {/* Actions */}
                {order.status !== 'Delivered' && (
                  <div className="flex gap-2">
                    {order.status === 'Confirmed' && (
                      <button onClick={() => updateStatus(order.id, 'Delivered')} className="flex-1 bg-charcoal border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-obsidian text-xs py-2.5 rounded-md font-bold uppercase tracking-wider transition">
                        Mark Delivered
                      </button>
                    )}
                    <button onClick={() => deleteOrder(order.id)} className="px-4 bg-charcoal border border-red-500/30 text-red-500 rounded-md hover:bg-red-500 hover:text-obsidian transition flex items-center justify-center">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
