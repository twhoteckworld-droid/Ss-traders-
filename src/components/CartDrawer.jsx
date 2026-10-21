import { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { supabase } from '../lib/supabase';
import { z } from 'zod';
import { X, Minus, Plus, ShoppingBag, Loader2, CreditCard, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit number required').refine((val) => !/(\d)\1{9}/.test(val), "Fake number not allowed"),
  address: z.string().min(10, 'Address too short'),
});

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, clear, buyNowMode, setBuyNowMode } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [errors, setErrors] = useState({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (buyNowMode && isOpen) {
      setShowCheckout(true);
      setBuyNowMode(false);
    }
  }, [buyNowMode, isOpen, setBuyNowMode]);

  if (!isOpen) return null;
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setErrors({});
    const result = schema.safeParse(form);
    
    if (!result.success) {
      const errs = {};
      result.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const orderNumber = `SST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newOrderId = crypto.randomUUID(); 

      const res = await loadRazorpayScript();
      if (!res) throw new Error('Razorpay SDK failed to load. Check your internet connection.');

      const createOrderResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ amount: subtotal, currency: 'INR', receipt: orderNumber }),
        }
      );
      
      const razorpayOrder = await createOrderResponse.json();
      if (razorpayOrder.error) throw new Error(razorpayOrder.error);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'SS Traders',
        description: 'Luxury Footwear Purchase',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          const verifyResponse = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-razorpay-payment`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );
          const verifyResult = await verifyResponse.json();

          if (verifyResult.status === 'success') {
            const { error: orderError } = await supabase.from('orders').insert({
              id: newOrderId, order_number: orderNumber, customer_name: form.name, customer_phone: form.phone,
              customer_address: form.address, total_amount: subtotal, status: 'Pending', razorpay_payment_id: response.razorpay_payment_id,
            });
            if (orderError) throw orderError;

            const orderItems = items.map((i) => ({
              order_id: newOrderId, product_id: i.id, product_title: i.size ? `${i.title} (Size: ${i.size})` : i.title,
              size: i.size || null, quantity: i.quantity, unit_price: i.price,
            }));
            await supabase.from('order_items').insert(orderItems);
            await supabase.from('orders').update({ status: 'Confirmed' }).eq('id', newOrderId);

            clear(); setShowCheckout(false); setForm({ name: '', phone: '', address: '' });
            setPaymentSuccess(true);
          } else {
            alert('❌ Payment verification failed. Please contact support.');
          }
        },
        prefill: { name: form.name, contact: form.phone },
        theme: { color: '#D4AF37' }, // Royal Gold color for Razorpay
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      alert('Payment Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 backdrop-blur-md px-4">
        <div className="bg-charcoal border border-[rgba(212,175,55,0.3)] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex justify-center mb-6">
            <CheckCircle2 size={70} className="text-gold-primary drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-ivory mb-3">Order Confirmed</h2>
          <p className="text-muted-gold text-sm mb-8">
            Your premium footwear is being prepared. We will notify you soon.
          </p>
          <button 
            onClick={() => { setPaymentSuccess(false); closeCart(); }}
            className="w-full gold-gradient-bg text-obsidian font-bold uppercase tracking-widest text-xs py-4 rounded-md active:scale-95 transition hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeCart} />
      <div className="relative w-full max-w-md h-full bg-obsidian border-l border-[rgba(212,175,55,0.2)] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-serif font-bold text-ivory flex items-center gap-3">
            <ShoppingBag size={20} className="text-gold-primary" /> Your Cart ({items.length})
          </h2>
          <button onClick={closeCart} className="bg-charcoal p-2 rounded-md hover:bg-charcoal-light text-muted-gold transition"><X size={18} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 && <p className="text-center text-muted-gold mt-20 font-light">Your cart is empty.</p>}
          {items.map((item) => (
            <div key={item.cartItemId} className="flex gap-4 border-b border-white/5 pb-6">
              <img src={item.images?.[0]} alt="" className="w-24 h-24 object-cover rounded-md bg-charcoal border border-white/10" />
              <div className="flex-1">
                <p className="text-sm font-serif font-semibold text-ivory line-clamp-2">{item.title}</p>
                {item.size && <p className="text-[10px] text-gold-primary font-bold mt-1 uppercase tracking-widest">Size: {item.size}</p>}
                <p className="text-gold-primary font-bold mt-2 text-lg">₹{item.price}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-white/10 rounded-md bg-charcoal">
                    <button onClick={() => updateQty(item.cartItemId, item.quantity - 1)} className="p-1.5 text-muted-gold hover:text-ivory"><Minus size={14} /></button>
                    <span className="text-sm font-bold text-ivory w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.cartItemId, item.quantity + 1)} className="p-1.5 text-muted-gold hover:text-ivory"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeItem(item.cartItemId)} className="text-[10px] text-red-400 uppercase tracking-widest font-bold hover:text-red-300">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-5 bg-charcoal">
            <div className="flex justify-between text-lg font-bold text-ivory">
              <span className="text-muted-gold text-sm uppercase tracking-widest mt-1">Total</span>
              <span className="text-gold-primary text-2xl font-serif">₹{subtotal.toFixed(2)}</span>
            </div>
            
            {!showCheckout ? (
              <button onClick={() => setShowCheckout(true)} className="w-full gold-gradient-bg py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition">
                Proceed to Checkout
              </button>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-4">
                <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-obsidian border border-white/10 rounded-md p-3 text-sm text-ivory placeholder-muted-gold focus:border-gold-primary outline-none transition" />
                {errors.name && <p className="text-red-400 text-xs font-medium">{errors.name}</p>}
                
                <input placeholder="WhatsApp Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-obsidian border border-white/10 rounded-md p-3 text-sm text-ivory placeholder-muted-gold focus:border-gold-primary outline-none transition" />
                {errors.phone && <p className="text-red-400 text-xs font-medium">{errors.phone}</p>}
                
                <textarea placeholder="Delivery Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} className="w-full bg-obsidian border border-white/10 rounded-md p-3 text-sm text-ivory placeholder-muted-gold focus:border-gold-primary outline-none transition" />
                {errors.address && <p className="text-red-400 text-xs font-medium">{errors.address}</p>}
                
                <button type="submit" disabled={loading} className="w-full bg-ivory text-obsidian py-4 rounded-md font-bold text-sm uppercase tracking-widest flex justify-center items-center gap-3 disabled:opacity-50 mt-4 hover:bg-gold-light transition">
                  {loading ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : <><CreditCard size={18} /> Pay ₹{subtotal} Securely</>}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
