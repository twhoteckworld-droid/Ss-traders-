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
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Success screen ke liye

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
        description: 'Premium Footwear Purchase',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          // Payment verification
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
            // 1. Save Order (Pehle Pending save karo taaki trigger kaam kare)
            const { error: orderError } = await supabase.from('orders').insert({
              id: newOrderId,
              order_number: orderNumber,
              customer_name: form.name,
              customer_phone: form.phone,
              customer_address: form.address,
              total_amount: subtotal,
              status: 'Pending',
              razorpay_payment_id: response.razorpay_payment_id,
            });
            
            if (orderError) throw orderError;

            // 2. Save Order Items
            const orderItems = items.map((i) => ({
              order_id: newOrderId,
              product_id: i.id,
              product_title: i.size ? `${i.title} (Size: ${i.size})` : i.title,
              size: i.size || null, 
              quantity: i.quantity,
              unit_price: i.price,
            }));
            await supabase.from('order_items').insert(orderItems);

            // 3. Update status to 'Confirmed' (Isse stock auto-deduct hoga)
            await supabase.from('orders').update({ status: 'Confirmed' }).eq('id', newOrderId);

            // 4. Send Email to Admin
            const emailKey = import.meta.env.VITE_WEB3FORMS_KEY;
            if (emailKey) {
              fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                  access_key: emailKey, subject: `PAID Order: ${orderNumber} from SS Traders`,
                  Name: form.name, Phone: form.phone, Address: form.address,
                  Items: items.map(i => `${i.title} ${i.size ? `(Size: ${i.size})` : ''} x ${i.quantity}`).join(', '),
                  Total: `₹${subtotal.toFixed(2)}`,
                  Payment_ID: response.razorpay_payment_id
                })
              }).catch(err => console.log(err));
            }

            // 5. Clear Cart & Show Success Message
            clear(); 
            setShowCheckout(false); 
            setForm({ name: '', phone: '', address: '' });
            setPaymentSuccess(true);
          } else {
            alert('❌ Payment verification failed. Please contact support.');
          }
        },
        prefill: { name: form.name, contact: form.phone },
        theme: { color: '#047857' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      alert('Payment Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Success Screen (Jab payment ho jaye)
  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex justify-center mb-4">
            <CheckCircle2 size={70} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Aapka order confirm ho gaya hai. Hum jald hi aapko delivery ke liye update karenge.
          </p>
          <button 
            onClick={() => { setPaymentSuccess(false); closeCart(); }}
            className="w-full bg-emerald-700 text-white font-bold py-3.5 rounded-xl active:scale-95 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={closeCart} />
      <div className="relative w-full max-w-md h-full bg-white flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingBag size={20} /> Cart ({items.length})</h2>
          <button onClick={closeCart} className="bg-gray-100 p-2 rounded-full"><X size={18} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 && <p className="text-center text-gray-400 mt-20">Cart is empty</p>}
          {items.map((item) => (
            <div key={item.cartItemId} className="flex gap-3 border-b pb-3">
              <img src={item.images?.[0]} alt="" className="w-20 h-20 object-cover rounded-lg bg-gray-50" />
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                {item.size && <p className="text-xs text-emerald-700 font-bold mt-0.5">Size: {item.size}</p>}
                <p className="text-emerald-700 font-bold mt-1">₹{item.price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQty(item.cartItemId, item.quantity - 1)} className="border p-1 rounded"><Minus size={12} /></button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.cartItemId, item.quantity + 1)} className="border p-1 rounded"><Plus size={12} /></button>
                  <button onClick={() => removeItem(item.cartItemId)} className="ml-auto text-xs text-red-500 font-semibold">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t space-y-3 bg-white">
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{subtotal.toFixed(2)}</span></div>
            {!showCheckout ? (
              <button onClick={() => setShowCheckout(true)} className="w-full bg-emerald-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-emerald-700/30">Buy Now</button>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-2">
                <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                <input placeholder="WhatsApp Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                <textarea placeholder="Delivery Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full border rounded-lg p-2 text-sm" />
                {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50 mt-2 shadow-lg shadow-blue-600/30">
                  {loading ? <><Loader2 className="animate-spin" size={16} /> Processing...</> : <><CreditCard size={18} /> Pay ₹{subtotal} & Place Order</>}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
