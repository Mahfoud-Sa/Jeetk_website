import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Minus, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { createOrder } from '../services/orderService';
import { CreateOrderRequest, CartItem } from '../types';

export const CartPage = ({ cart, updateQuantity, clearCart }: { 
  cart: CartItem[], 
  updateQuantity: (id: string, delta: number) => void,
  clearCart: () => void
}) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const [deliveryTime, setDeliveryTime] = useState(new Date().toISOString());
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 500; // Updated from 2.99 to 500 YER
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    try {
      const orderData: CreateOrderRequest = {
        deliveryPrice: deliveryFee,
        description: `Order with ${cart.length} items: ${cart.map(i => i.name).join(', ')}`,
        deliveryLocationDescription: 'Customer Address',
        orderState: 'pending',
        receptionDescription: 'Standard Delivery',
        deliveryUserId: 0,
        deliveryTime: deliveryTime
      };
      
      await createOrder(orderData);
      clearCart();
      navigate('/tracking');
      showToast("Order placed successfully!", "success");
    } catch (error) {
      showToast("Failed to place order.", "error");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-zinc-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/" className="bg-black text-white px-8 py-3 rounded-full font-semibold">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      <div className="space-y-6 mb-12">
        {cart.map(item => (
          <div key={item.id} className="flex items-center gap-4 text-start">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-zinc-500 text-sm">{item.price} {language === 'ar' ? 'ر.ي' : 'YER'}</p>
            </div>
            <div className="flex items-center gap-3 bg-zinc-100 px-3 py-1.5 rounded-full">
              <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-black text-zinc-500">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-black text-zinc-500">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-50 p-6 rounded-3xl space-y-4 text-start">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Subtotal</span>
          <span>{subtotal.toFixed(2)} {language === 'ar' ? 'ر.ي' : 'YER'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Delivery Fee</span>
          <span>{deliveryFee.toFixed(2)} {language === 'ar' ? 'ر.ي' : 'YER'}</span>
        </div>
        <div className="h-px bg-zinc-200 my-2" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{total.toFixed(2)} {language === 'ar' ? 'ر.ي' : 'YER'}</span>
        </div>

        <div className="pt-4">
          <label className="block text-sm font-medium text-zinc-500 mb-2">
            {language === 'ar' ? 'وقت التوصيل المفضل' : 'Preferred Delivery Time'}
          </label>
          <input 
            type="datetime-local" 
            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
            value={new Date(deliveryTime).toISOString().slice(0, 16)}
            onChange={e => setDeliveryTime(new Date(e.target.value).toISOString())}
            required
          />
        </div>

        <button 
          onClick={handlePlaceOrder}
          className="w-full bg-black text-white py-4 rounded-2xl font-bold mt-4 hover:scale-[1.02] transition-transform"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};
