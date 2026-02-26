import { useState, useEffect, FC, FormEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Star, 
  ChevronRight, 
  Menu as MenuIcon, 
  X, 
  Plus, 
  Minus,
  ArrowLeft,
  Navigation,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { RESTAURANTS, MENU_ITEMS } from './constants';
import { Restaurant, MenuItem, CartItem, Order, Location, LocationRequest, DeliveryRoute } from './types';
import { useLocations, useDeliveryRoute } from './services/deliveryService';
import { GoogleGenAI } from "@google/genai";

const ScrollToTop = () => {
  const { pathname } = useParams();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Components ---

const Navbar = ({ cartCount }: { cartCount: number }) => (
  <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <Navigation className="w-5 h-5 text-white" />
        </div>
        <span className="logo-gradient">Jeetk</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-full text-sm font-medium">
        <MapPin className="w-4 h-4" />
        <span>Deliver to: 123 Main St, Berlin</span>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/locations" className="text-sm font-medium hover:text-black transition-colors hidden sm:block">
          Locations
        </Link>
        <Link to="/routes" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
          Delivery Prices
        </Link>
        <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <Link to="/cart" className="relative p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  </nav>
);

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: FC<RestaurantCardProps> = ({ restaurant }) => (
  <Link to={`/restaurant/${restaurant.id}`} className="group">
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-3">
      <img 
        src={restaurant.image} 
        alt={restaurant.name}
        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        {restaurant.rating}
      </div>
    </div>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-lg">{restaurant.name}</h3>
        <p className="text-zinc-500 text-sm">{restaurant.category} • {restaurant.deliveryTime}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{restaurant.deliveryFee === 0 ? 'Free Delivery' : `$${restaurant.deliveryFee} Delivery`}</p>
      </div>
    </div>
  </Link>
);

// --- Pages ---

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const filteredRestaurants = RESTAURANTS.filter(res => 
    res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const askAi = async (prompt: string) => {
    setIsAiLoading(true);
    setShowAiModal(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a helpful food delivery assistant. Suggest 2-3 specific dishes or restaurant types from our platform (Burgers, Sushi, Pizza, Salads, Desserts) based on this user request: "${prompt}". Keep it concise and appetizing.`,
      });
      setAiResponse(response.text || 'Sorry, I couldn\'t think of anything right now.');
    } catch (error) {
      setAiResponse('Error connecting to AI assistant.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search & AI Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search for restaurants or cuisines..."
            className="w-full pl-12 pr-4 py-4 bg-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => {
            const mood = prompt("How are you feeling today? (e.g., 'hungry for something spicy', 'looking for a healthy lunch')");
            if (mood) askAi(mood);
          }}
          className="bg-black text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <Sparkles className="w-5 h-5" />
          AI Meal Suggest
        </button>
      </div>

      {/* AI Modal */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Jeetk AI</h3>
                </div>
                <button onClick={() => setShowAiModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="min-h-[100px] text-zinc-700 leading-relaxed">
                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium animate-pulse">Consulting the chefs...</p>
                  </div>
                ) : (
                  <p>{aiResponse}</p>
                )}
              </div>

              {!isAiLoading && (
                <button 
                  onClick={() => setShowAiModal(false)}
                  className="w-full bg-zinc-100 py-3 rounded-xl font-bold mt-8 hover:bg-zinc-200 transition-colors"
                >
                  Got it!
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      {!searchQuery && (
        <section className="py-20 md:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 hero-gradient-text">
              Cravings delivered <br className="hidden md:block" /> to your doorstep.
            </h1>
            <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              The fastest way to get your favorite food from the best local restaurants, 
              delivered with precision and care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                Order Now
              </button>
              <Link to="/routes" className="bg-white text-black border border-zinc-200 px-10 py-4 rounded-full font-bold hover:bg-zinc-50 transition-colors">
                Check Delivery Prices
              </Link>
            </div>
          </motion.div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 border-t border-zinc-100">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Why choose Jeetk?</h2>
          <p className="text-zinc-500">Experience the next generation of food delivery.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Lightning Fast', 
              desc: 'Average delivery time of 25 minutes. We don\'t just deliver; we sprint.',
              icon: Clock
            },
            { 
              title: 'AI Suggestions', 
              desc: 'Not sure what to eat? Our AI knows your taste better than you do.',
              icon: Sparkles
            },
            { 
              title: 'Transparent Pricing', 
              desc: 'No hidden fees. Check delivery prices between any two points instantly.',
              icon: Navigation
            }
          ].map((feature, i) => (
            <div key={i} className="p-10 rounded-3xl border border-zinc-100 bg-white hover:border-primary hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-7 h-7 text-zinc-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Promotions Bento Grid */}
      {!searchQuery && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
            <div className="md:col-span-2 bg-emerald-500 rounded-3xl p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Limited Time</span>
                <h3 className="text-4xl font-bold text-white mt-4 mb-2">50% OFF <br />on your first order</h3>
                <p className="text-emerald-100 mb-6">Use code: SWIFT50</p>
                <button className="bg-white text-emerald-600 px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform">Claim Offer</button>
              </div>
              <div className="absolute right-[-50px] bottom-[-50px] w-[300px] h-[300px] bg-emerald-400 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="bg-orange-500 rounded-3xl p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Free Delivery</h3>
                <p className="text-orange-100 text-sm mb-4">On all orders over $25 from Sushi Zen.</p>
                <button className="text-white border border-white/30 px-4 py-2 rounded-full text-sm font-bold hover:bg-white/10 transition-colors">Order Now</button>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-orange-400 rounded-full blur-2xl opacity-50" />
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Quick Categories</h2>
          <button className="text-sm font-medium flex items-center gap-1 hover:underline">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {['Burgers', 'Sushi', 'Pizza', 'Salads', 'Desserts', 'Drinks'].map((cat) => (
            <button key={cat} className="bg-zinc-100 hover:bg-zinc-200 p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                {/* Placeholder for icons */}
                <Sparkles className="w-6 h-6 text-zinc-400" />
              </div>
              <span className="text-sm font-medium">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          {searchQuery ? `Search results for "${searchQuery}"` : 'Featured Restaurants'}
        </h2>
        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map(res => (
              <RestaurantCard key={res.id} restaurant={res} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-50 rounded-3xl">
            <p className="text-zinc-500">No restaurants found matching your search.</p>
          </div>
        )}
      </section>
    </div>
  );
};

const RestaurantPage = ({ addToCart }: { addToCart: (item: MenuItem) => void }) => {
  const { id } = useParams();
  const restaurant = RESTAURANTS.find(r => r.id === id);
  const menu = MENU_ITEMS[id || ''] || [];

  if (!restaurant) return <div>Restaurant not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to restaurants
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-1/2 rounded-3xl overflow-hidden aspect-video">
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
          <p className="text-zinc-500 mb-4">{restaurant.description}</p>
          <div className="flex items-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {restaurant.rating} (500+ ratings)
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {restaurant.deliveryTime}
            </div>
            <div className="flex items-center gap-1">
              <ShoppingBag className="w-4 h-4" />
              {restaurant.deliveryFee === 0 ? 'Free Delivery' : `$${restaurant.deliveryFee} Delivery`}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menu.map(item => (
          <div key={item.id} className="bg-white border border-zinc-100 p-4 rounded-2xl flex gap-4 hover:shadow-md transition-shadow">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
              <p className="text-zinc-500 text-sm mb-3 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold">${item.price}</span>
                <button 
                  onClick={() => addToCart(item)}
                  className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CartPage = ({ cart, updateQuantity, clearCart }: { 
  cart: CartItem[], 
  updateQuantity: (id: string, delta: number) => void,
  clearCart: () => void
}) => {
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 2.99;
  const total = subtotal + deliveryFee;

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
          <div key={item.id} className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-zinc-500 text-sm">${item.price}</p>
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

      <div className="bg-zinc-50 p-6 rounded-3xl space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        <div className="h-px bg-zinc-200 my-2" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button 
          onClick={() => {
            clearCart();
            navigate('/tracking');
          }}
          className="w-full bg-black text-white py-4 rounded-2xl font-bold mt-4 hover:scale-[1.02] transition-transform"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

const TrackingPage = () => {
  const [status, setStatus] = useState<number>(0);
  const statuses = [
    { label: 'Order Confirmed', icon: CheckCircle2 },
    { label: 'Preparing your food', icon: Clock },
    { label: 'On the way', icon: Navigation },
    { label: 'Delivered', icon: CheckCircle2 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(prev => (prev < 3 ? prev + 1 : prev));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Tracking Order #SW-12345</h1>
        <p className="text-zinc-500">Estimated delivery: 25-35 min</p>
      </div>

      <div className="relative h-[400px] bg-zinc-100 rounded-3xl overflow-hidden mb-12">
        {/* Simulated Map */}
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/800')] bg-cover opacity-50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-xl"
          >
            <Navigation className="w-6 h-6 text-white" />
          </motion.div>
        </div>
      </div>

      <div className="space-y-8">
        {statuses.map((s, i) => (
          <div key={i} className={`flex items-center gap-4 ${i > status ? 'opacity-30' : 'opacity-100'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= status ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">{s.label}</h3>
              <p className="text-sm text-zinc-500">{i <= status ? 'Completed' : 'Pending'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LocationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({});
  const [requests, setRequests] = useState<LocationRequest[]>([
    { id: 'req1', name: 'Neukölln', address: 'Sonnenallee 1, 12047 Berlin', status: 'pending', timestamp: new Date() },
    { id: 'req2', name: 'Charlottenburg', address: 'Kurfürstendamm 1, 10719 Berlin', status: 'approved', timestamp: new Date() },
  ]);
  const [newRequest, setNewRequest] = useState({ name: '', address: '' });

  const { data: locationsData = [], isLoading } = useLocations();
  const locations = Array.isArray(locationsData) ? locationsData : [];

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLocation = (id: string) => {
    setExpandedLocations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmitRequest = (e: FormEvent) => {
    e.preventDefault();
    if (!newRequest.name || !newRequest.address) return;
    
    const request: LocationRequest = {
      id: `req${Date.now()}`,
      name: newRequest.name,
      address: newRequest.address,
      status: 'pending',
      timestamp: new Date(),
    };
    
    setRequests([request, ...requests]);
    setNewRequest({ name: '', address: '' });
    alert('Location request sent! It will be added once an admin approves it.');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-zinc-500">Loading locations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Our Locations</h1>
          <p className="text-zinc-500">Find a Jeetk hub near you.</p>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <Plus className="w-5 h-5" />
          Add My Location Request
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search locations by name or address..."
          className="w-full pl-12 pr-4 py-4 bg-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {filteredLocations.map(loc => {
          const isExpanded = expandedLocations[loc.id];
          // Note: In a real app, we might fetch routes per location or have them nested
          // For now, we'll show the location details.
          
          return (
            <div key={loc.id} className="group bg-white border border-zinc-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all flex flex-col">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={loc.image || 'https://picsum.photos/seed/jeetk-location/800/600'} 
                  alt={loc.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/jeetk-placeholder/800/600';
                  }}
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2">{loc.name}</h3>
                <p className="text-zinc-500 text-sm mb-4 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {loc.address}
                </p>
                <a 
                  href={loc.googleMapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(loc.address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-black hover:underline mb-6"
                >
                  View on Google Maps
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
        {filteredLocations.length === 0 && (
          <div className="col-span-full text-center py-20 bg-zinc-50 rounded-3xl">
            <p className="text-zinc-500">No locations found matching your search.</p>
          </div>
        )}
      </div>


      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Location Requests</h2>
                <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form */}
                <div>
                  <h3 className="font-bold mb-4">Request New Location</h3>
                  <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Location Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-zinc-100 rounded-xl focus:outline-none"
                        placeholder="e.g. Wedding"
                        value={newRequest.name}
                        onChange={e => setNewRequest({...newRequest, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Full Address</label>
                      <textarea 
                        required
                        className="w-full px-4 py-3 bg-zinc-100 rounded-xl focus:outline-none h-24 resize-none"
                        placeholder="Street, Zip, City"
                        value={newRequest.address}
                        onChange={e => setNewRequest({...newRequest, address: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform">
                      Send Request
                    </button>
                  </form>
                </div>

                {/* List of requests */}
                <div>
                  <h3 className="font-bold mb-4">Recent Requests</h3>
                  <div className="space-y-4">
                    {requests.map(req => (
                      <div key={req.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold">{req.name}</h4>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1">{req.address}</p>
                        <p className="text-[10px] text-zinc-400 mt-2">{req.timestamp.toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DeliveryRoutesPage = () => {
  const [originSearch, setOriginSearch] = useState('');
  const [selectedOriginId, setSelectedOriginId] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);

  const { data: locationsData = [], isLoading: isLoadingLocations } = useLocations();
  const { data: routesData = [], isLoading: isLoadingRoutes } = useDeliveryRoute(selectedOriginId);

  const locations = Array.isArray(locationsData) ? locationsData : [];
  const availableRoutes = Array.isArray(routesData) ? routesData : [];

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(originSearch.toLowerCase())
  );

  const selectedOrigin = locations.find(l => l.id === selectedOriginId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Delivery Prices</h1>
        <p className="text-zinc-500">Check delivery prices and availability between locations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Origin Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              1. Select Origin
            </h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search origin..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-100 rounded-xl focus:outline-none text-sm"
                value={originSearch}
                onChange={(e) => {
                  setOriginSearch(e.target.value);
                  setSelectedOriginId(null);
                  setSelectedRoute(null);
                }}
              />
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {isLoadingLocations ? (
                <p className="text-xs text-zinc-400 text-center py-4">Loading locations...</p>
              ) : (
                filteredLocations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setSelectedOriginId(loc.id);
                      setSelectedRoute(null);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                      selectedOriginId === loc.id 
                        ? 'bg-primary text-white font-bold' 
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {loc.name}
                  </button>
                ))
              )}
              {!isLoadingLocations && filteredLocations.length === 0 && (
                <p className="text-xs text-zinc-400 text-center py-4">No origins found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Destination Selection */}
        <div className="lg:col-span-1">
          <div className={`bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm transition-opacity ${!selectedOriginId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              2. Select Destination
            </h3>
            {!selectedOriginId ? (
              <p className="text-sm text-zinc-400 py-8 text-center">Please select an origin first.</p>
            ) : isLoadingRoutes ? (
              <p className="text-sm text-zinc-400 py-8 text-center">Loading routes...</p>
            ) : availableRoutes.length === 0 ? (
              <p className="text-sm text-zinc-400 py-8 text-center">No routes available from this origin.</p>
            ) : (
              <div className="space-y-2">
                {availableRoutes.map(route => (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex justify-between items-center ${
                      selectedRoute?.id === route.id 
                        ? 'bg-primary text-white font-bold' 
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <span>{route.destination}</span>
                    {!route.isAvailable && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Unavailable</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Route Details */}
        <div className="lg:col-span-1">
          <div className={`bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm h-full transition-opacity ${!selectedRoute ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              3. Route Details
            </h3>
            {!selectedRoute ? (
              <p className="text-sm text-zinc-400 py-8 text-center">Select a destination to see details.</p>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm">Distance</span>
                  <span className="font-bold">{selectedRoute.distance}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm">Delivery Price</span>
                  <span className="text-2xl font-black">${selectedRoute.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm">Status</span>
                  <span className={`font-bold ${selectedRoute.isAvailable ? 'text-emerald-500' : 'text-red-500'}`}>
                    {selectedRoute.isAvailable ? 'Available Now' : 'Currently Unavailable'}
                  </span>
                </div>
                
                {selectedRoute.isAvailable ? (
                  <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold mt-4 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
                    Start Order from this Route
                  </button>
                ) : (
                  <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm text-center">
                    This route is currently not accepting new orders.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main App ---

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white font-sans text-zinc-900">
        <Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/restaurant/:id" element={<RestaurantPage addToCart={addToCart} />} />
            <Route path="/cart" element={<CartPage cart={cart} updateQuantity={updateQuantity} clearCart={clearCart} />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/routes" element={<DeliveryRoutesPage />} />
          </Routes>
        </main>

        <footer className="bg-zinc-50 border-t border-black/5 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <span className="logo-gradient">Jeetk</span>
              </div>
              <p className="text-zinc-500 max-w-sm">
                The fastest way to get your favorite food delivered. We partner with the best local restaurants to bring you quality meals.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-zinc-500 text-sm">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/locations">Locations</Link></li>
                <li><Link to="/routes">Delivery Prices</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/tracking">Track Order</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-zinc-500 text-sm">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 pt-12 mt-12 border-t border-black/5 text-center text-zinc-400 text-xs">
            © 2026 Jeetk. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}
