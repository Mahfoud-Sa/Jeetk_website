import { useState, useEffect, FC, FormEvent, createContext, useContext, useCallback } from 'react';
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
  Sparkles,
  LayoutDashboard,
  Trash2,
  Edit,
  Save,
  Database,
  Settings,
  ArrowRight,
  Lock,
  LogIn,
  LogOut,
  Globe,
  Mail,
  Image as ImageIcon,
  User as UserIcon,
  ClipboardList,
  UserPlus,
  AlertCircle,
  Truck,
  Eye,
  EyeOff,
  History
} from 'lucide-react';
import { RESTAURANTS, MENU_ITEMS } from './constants';
import { Restaurant, MenuItem, CartItem, Order, Location, LocationRequest, DeliveryRoute, ActionEntity } from './types';
import { translations, Language } from './i18n';
import { 
  useLocations, 
  createLocation,
  updateLocation,
  deleteLocation,
} from './services/locationService';
import {
  useDeliveryRoute,
  createDeliveryRoute,
  updateDeliveryRoute,
  deleteDeliveryRoute
} from './services/routeService';
import {
  useUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchUserById
} from './services/userService';
import {
  useOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  useOrderHistory
} from './services/orderService';
import { useActions } from './services/actionService';
import { login, setToken, assignRole, registerDelivery, DeliveryRegisterRequest } from './services/authService';
import { setGlobalErrorHandler } from './services/apiClient';
import { ToastContainer, ToastType } from './components/Toast';
import { UserProfile } from './components/UserProfile';
import { GoogleGenAI } from "@google/genai";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

const ScrollToTop = () => {
  const { pathname } = useParams();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Components ---

const JeetkLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Speed Trail / Liquid Effect */}
    <circle cx="20" cy="50" r="6" fill="#F27D26" />
    <circle cx="28" cy="40" r="4" fill="#F27D26" />
    <circle cx="28" cy="60" r="5" fill="#F27D26" />
    <path 
      d="M20 50C20 50 35 35 50 35V65C35 65 20 50 20 50Z" 
      fill="#F27D26" 
    />
    
    {/* 3D Box / Package */}
    <path 
      d="M45 40L75 25L95 40L65 55L45 40Z" 
      fill="#FFB366" 
    /> {/* Top Face */}
    <path 
      d="M45 40L65 55V85L45 70V40Z" 
      fill="#E67E22" 
    /> {/* Left Face */}
    <path 
      d="M65 55L95 40V70L65 85V55Z" 
      fill="#F39C12" 
    /> {/* Right Face */}
    
    {/* Brand Stripe (The 'J' or 'I' shape) */}
    <path 
      d="M72 38L82 33V63L72 68V38Z" 
      fill="white" 
      fillOpacity="0.9"
    />
  </svg>
);

const Navbar = ({ cartCount, isAuthenticated }: { 
  cartCount: number, 
  isAuthenticated: boolean
}) => {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <JeetkLogo className="w-10 h-10" />
          <span className="logo-gradient">Jeetk</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-full text-sm font-medium">
          <MapPin className="w-4 h-4" />
          <span>{t.nav.deliverTo}</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 rounded-full transition-colors text-sm font-bold"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          <Link to="/locations" className="text-sm font-medium hover:text-black transition-colors hidden sm:block">
            {t.nav.locations}
          </Link>
          <Link to="/restaurants" className="text-sm font-medium hover:text-black transition-colors hidden sm:block">
            {t.nav.restaurants}
          </Link>
          <Link to="/routes" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
            {t.nav.deliveryPrices}
          </Link>
          <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link to="/cart" className="relative p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              {t.nav.dashboard}
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="bg-zinc-100 text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {t.nav.login}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: FC<RestaurantCardProps> = ({ restaurant }) => {
  const { t } = useLanguage();
  return (
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
        <div className="text-start">
          <h3 className="font-semibold text-lg">{restaurant.name}</h3>
          <p className="text-zinc-500 text-sm">{restaurant.category} • {restaurant.deliveryTime}</p>
        </div>
        <div className="text-end">
          <p className="text-sm font-medium">{restaurant.deliveryFee === 0 ? t.home.freeDelivery : `$${restaurant.deliveryFee} ${t.home.deliveryFee}`}</p>
        </div>
      </div>
    </Link>
  );
};

// --- Pages ---

const HomePage = () => {
  const { t, language } = useLanguage();
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
        contents: `You are a helpful food delivery assistant. Suggest 2-3 specific dishes or restaurant types from our platform (Burgers, Sushi, Pizza, Salads, Desserts) based on this user request: "${prompt}". Keep it concise and appetizing. Respond in ${language === 'ar' ? 'Arabic' : 'English'}.`,
      });
      setAiResponse(response.text || (language === 'ar' ? 'عذراً، لم أتمكن من العثور على شيء حالياً.' : 'Sorry, I couldn\'t think of anything right now.'));
    } catch (error) {
      setAiResponse(language === 'ar' ? 'خطأ في الاتصال بمساعد الذكاء الاصطناعي.' : 'Error connecting to AI assistant.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search & AI Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={t.home.searchPlaceholder}
            className="w-full ps-12 pe-4 py-4 bg-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => {
            const mood = prompt(language === 'ar' ? "كيف تشعر اليوم؟ (مثلاً: 'جائع لشيء حار'، 'أبحث عن غداء صحي')" : "How are you feeling today? (e.g., 'hungry for something spicy', 'looking for a healthy lunch')");
            if (mood) askAi(mood);
          }}
          className="bg-black text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <Sparkles className="w-5 h-5" />
          {language === 'ar' ? 'اقتراح وجبة بالذكاء الاصطناعي' : 'AI Meal Suggest'}
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
              
              <div className="min-h-[100px] text-zinc-700 leading-relaxed text-start">
                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium animate-pulse">{language === 'ar' ? 'جاري استشارة الطهاة...' : 'Consulting the chefs...'}</p>
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
                  {language === 'ar' ? 'فهمت!' : 'Got it!'}
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
              {t.home.heroTitle}
            </h1>
            <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              {t.home.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                {language === 'ar' ? 'اطلب الآن' : 'Order Now'}
              </button>
              <Link to="/routes" className="bg-white text-black border border-zinc-200 px-10 py-4 rounded-full font-bold hover:bg-zinc-50 transition-colors">
                {t.nav.deliveryPrices}
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {searchQuery ? `Search results for "${searchQuery}"` : t.home.featuredRestaurants}
          </h2>
          {!searchQuery && (
            <Link to="/restaurants" className="text-sm font-medium flex items-center gap-1 hover:underline">
              {t.home.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.slice(0, searchQuery ? undefined : 3).map(res => (
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

const RestaurantsPage = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRestaurants = RESTAURANTS.filter(res => 
    res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{t.home.allRestaurants}</h1>
        <p className="text-zinc-500">Browse all restaurants available on Jeetk.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-12">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder={t.home.searchPlaceholder}
          className="w-full ps-12 pe-4 py-4 bg-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRestaurants.map(res => (
          <RestaurantCard key={res.id} restaurant={res} />
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl">
          <p className="text-zinc-500">No restaurants found matching your search.</p>
        </div>
      )}
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
  const { showToast } = useToast();
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
    showToast('Location request sent! It will be added once an admin approves it.', 'success');
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


export type UserRole = 'admin' | 'customer' | 'delivery';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  userEmail: string | null;
}

const DeliveryRegistrationPage = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState<DeliveryRegisterRequest>({
    name: '',
    birthDate: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    username: '',
    phoneNumbers: [{ number: '', type: 'Primary' }]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const updatePhoneNumber = (index: number, field: 'number' | 'type', value: string) => {
    const newPhoneNumbers = [...formData.phoneNumbers];
    newPhoneNumbers[index][field] = value;
    setFormData({ ...formData, phoneNumbers: newPhoneNumbers });
    
    // Also update the main phoneNumber field if it's the first one's number
    if (index === 0 && field === 'number') {
      setFormData(prev => ({ ...prev, phoneNumber: value, phoneNumbers: newPhoneNumbers }));
    }
  };

  const addPhoneNumber = () => {
    setFormData({
      ...formData,
      phoneNumbers: [...formData.phoneNumbers, { number: '', type: 'Secondary' }]
    });
  };

  const removePhoneNumber = (index: number) => {
    if (formData.phoneNumbers.length > 1) {
      const newPhoneNumbers = formData.phoneNumbers.filter((_, i) => i !== index);
      setFormData({ ...formData, phoneNumbers: newPhoneNumbers });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Ensure birthDate is in ISO format
      const payload = {
        ...formData,
        birthDate: new Date(formData.birthDate).toISOString()
      };
      await registerDelivery(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMsg = err.response?.data?.message || err.message || (language === 'ar' ? 'فشل التسجيل.' : 'Registration failed.');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {language === 'ar' ? 'تم التسجيل بنجاح!' : 'Registration Successful!'}
          </h1>
          <p className="text-zinc-500 mb-6">
            {language === 'ar' 
              ? 'تم إنشاء حسابك بنجاح. سيتم توجيهك إلى صفحة تسجيل الدخول...' 
              : 'Your account has been created successfully. Redirecting to login...'}
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-black text-white py-4 rounded-xl font-bold"
          >
            {t.nav.login}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">
            {language === 'ar' ? 'التسجيل كمندوب توصيل' : 'Register as Delivery'}
          </h1>
          <p className="text-zinc-500 text-sm">
            {language === 'ar' 
              ? 'انضم إلى فريقنا وابدأ في كسب المال اليوم' 
              : 'Join our team and start earning today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder={language === 'ar' ? 'محمد احمد' : 'John Doe'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'اسم المستخدم' : 'Username'}</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          <div className="space-y-4">
            <label className="block text-sm font-bold ml-1">{language === 'ar' ? 'أرقام الهاتف' : 'Phone Numbers'}</label>
            {formData.phoneNumbers.map((phone, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-2">
                <div className="flex-[2]">
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder={index === 0 ? "770266408" : (language === 'ar' ? 'رقم الهاتف' : 'Phone number')}
                    value={phone.number}
                    onChange={(e) => updatePhoneNumber(index, 'number', e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder={language === 'ar' ? 'النوع (مثلاً: أساسي)' : 'Type (e.g. Primary)'}
                    value={phone.type}
                    onChange={(e) => updatePhoneNumber(index, 'type', e.target.value)}
                    required
                  />
                </div>
                {index > 0 && (
                  <button 
                    type="button" 
                    onClick={() => removePhoneNumber(index)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors self-end md:self-center"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={addPhoneNumber}
              className="flex items-center gap-2 text-sm font-bold text-primary hover:underline ml-1"
            >
              <Plus className="w-4 h-4" />
              {language === 'ar' ? 'إضافة رقم آخر' : 'Add another number'}
            </button>
          </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'العنوان' : 'Address'}</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder={language === 'ar' ? 'الشارع، المدينة' : 'Street, City'}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {error && (
            <p className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-zinc-500 mt-4">
            {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'} {' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              {t.nav.login}
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (role: UserRole, email: string, id: number) => void }) => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'newPassword'>('email');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await login({ email, password });
      
      // If the API returns a token, store it
      if (response && response.token) {
        setToken(response.token);
      }
      
      // Check if user has roles
      if (!response.roles || response.roles.length === 0) {
        setError(language === 'ar' 
          ? 'لا توجد أدوار لهذا المستخدم، يرجى التواصل مع المسؤول لمنحك الصلاحيات.' 
          : 'There are no roles with this user, contact admin to give you.');
        return;
      }
      
      // Map API roles to app roles
      const userRolesStrings = response.roles.map((r: any) => 
        (typeof r === 'string' ? r : r?.name || r?.role || '').toLowerCase()
      );
      
      let finalRole: UserRole = 'customer';
      
      if (userRolesStrings.includes('admin')) {
        finalRole = 'admin';
      } else if (userRolesStrings.includes('delivery')) {
        finalRole = 'delivery';
      } else if (userRolesStrings.includes('customer')) {
        finalRole = 'customer';
      }
      
      onLogin(finalRole, email, response.id);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.message || err.message || (language === 'ar' ? 'فشل تسجيل الدخول.' : 'Login failed.');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t.nav.login}</h1>
          <p className="text-zinc-500 text-sm">{language === 'ar' ? 'أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم' : 'Enter your credentials to access the dashboard'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="admin@jeetk.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-sm font-bold">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
              <button 
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setResetStep('email');
                }}
                className="text-xs font-bold text-primary hover:underline"
              >
                {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
              </button>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {error && (
            <p className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {t.nav.login}
          </button>

          <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-500 mb-2">
              {language === 'ar' ? 'هل تريد العمل معنا؟' : 'Want to work with us?'}
            </p>
            <Link 
              to="/register/delivery" 
              className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
            >
              <UserPlus className="w-4 h-4" />
              {language === 'ar' ? 'سجل كمندوب توصيل' : 'Register as Delivery'}
            </Link>
          </div>
        </form>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative"
          >
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute right-6 top-6 p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">
                {resetStep === 'email' 
                  ? (language === 'ar' ? 'نسيت كلمة المرور' : 'Forgot Password')
                  : (language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password')}
              </h2>
              <p className="text-zinc-500 text-sm mt-2">
                {resetStep === 'email'
                  ? (language === 'ar' ? 'أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين' : 'Enter your email to receive a reset link')
                  : (language === 'ar' ? 'أدخل كلمة المرور الجديدة الخاصة بك' : 'Enter your new password below')}
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (resetStep === 'email') {
                setResetStep('newPassword');
              } else {
                alert(language === 'ar' ? 'تم تغيير كلمة المرور بنجاح!' : 'Password changed successfully!');
                setShowForgotModal(false);
              }
            }} className="space-y-4">
              {resetStep === 'email' ? (
                <div>
                  <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onMouseDown={() => setShowNewPassword(true)}
                      onMouseUp={() => setShowNewPassword(false)}
                      onMouseLeave={() => setShowNewPassword(false)}
                      onTouchStart={() => setShowNewPassword(true)}
                      onTouchEnd={() => setShowNewPassword(false)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-black text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform"
              >
                {resetStep === 'email' 
                  ? (language === 'ar' ? 'إرسال الرابط' : 'Send Link')
                  : (language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const OrderManagement = ({ role, orders, onUpdateStatus, onEdit, onDelete, onViewHistory }: { role: UserRole, orders: any[], onUpdateStatus: (id: number, status: string) => void, onEdit?: (order: any) => void, onDelete?: (id: number) => void, onViewHistory?: (id: number) => void }) => {
  const { t, language } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'preparing': return 'bg-blue-100 text-blue-700';
      case 'onTheWay': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-100">
            <th className="px-6 py-4 font-bold text-sm">{t.dashboard.orderId}</th>
            <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'الوصف' : 'Description'}</th>
            <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'المندوب' : 'Delivery'}</th>
            <th className="px-6 py-4 font-bold text-sm">{t.dashboard.status}</th>
            <th className="px-6 py-4 font-bold text-sm text-right">{language === 'ar' ? 'السعر' : 'Price'}</th>
            <th className="px-6 py-4 font-bold text-sm text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {orders.map((order, index) => (
            <tr key={order.id || order.Id || index} className="hover:bg-zinc-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-bold">#ORD-{(order.id || order.Id)?.toString().padStart(4, '0') || '0000'}</td>
              <td className="px-6 py-4 text-sm">
                <div className="max-w-[200px] truncate" title={order.description || order.Description}>
                  {order.description || order.Description}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-zinc-500">{order.deliveryName || order.DeliveryName || '-'}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.orderState || order.OrderState || order.status || order.Status)}`}>
                    {(t.dashboard as any)[order.orderState || order.OrderState || order.status || order.Status] || order.orderState || order.OrderState || order.status || order.Status}
                  </span>
                  <select 
                    className="text-[10px] font-bold bg-zinc-50 border border-zinc-100 rounded-lg px-2 py-1 focus:outline-none"
                    value={order.orderState || order.OrderState || order.status || order.Status || 'pending'}
                    onChange={(e) => onUpdateStatus(order.id || order.Id, e.target.value)}
                  >
                    <option value="pending">{t.dashboard.pending}</option>
                    <option value="preparing">{t.dashboard.preparing}</option>
                    <option value="onTheWay">{t.dashboard.onTheWay}</option>
                    <option value="delivered">{t.dashboard.delivered}</option>
                    <option value="cancelled">{t.dashboard.cancelled}</option>
                  </select>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-right">${(order.deliveryPrice || order.DeliveryPrice || 0).toFixed(2)}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  {onViewHistory && (
                    <button 
                      onClick={() => onViewHistory(order.id || order.Id)}
                      className="p-2 text-zinc-400 hover:text-primary transition-colors"
                      title={language === 'ar' ? 'السجل' : 'History'}
                    >
                      <History className="w-4 h-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(order)}
                      className="p-2 text-zinc-400 hover:text-black transition-colors"
                      title={t.common.edit}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={() => onDelete(order.id || order.Id)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                      title={t.common.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-zinc-400 font-medium">No orders found.</p>
        </div>
      )}
    </div>
  );
};

const SystemHistoryManagement = () => {
  const { t, language } = useLanguage();
  const { data: actionsData = [], isLoading } = useActions();
  const actions = Array.isArray(actionsData) ? actionsData : [];
  const [selectedAction, setSelectedAction] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          {language === 'ar' ? 'سجل النظام' : 'System History'}
        </h3>
      </div>

      <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'النوع' : 'Type'}</th>
                <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'الكيان' : 'Entity'}</th>
                <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'المعرف' : 'ID'}</th>
                <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'الوقت' : 'Time'}</th>
                <th className="px-6 py-4 font-bold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : actions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    {language === 'ar' ? 'لا يوجد سجلات' : 'No history records found.'}
                  </td>
                </tr>
              ) : (
                actions.map((action: any) => (
                  <tr key={action.id || action.Id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-bold">
                        {(action.user || action.User)?.fullName || (action.user || action.User)?.FullName || (action.user || action.User)?.name || (action.user || action.User)?.Name || 'System'}
                      </div>
                      <div className="text-xs text-zinc-400">ID: {action.userId || action.UserId || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        (action.actionType || action.ActionType) === 'Create' ? 'bg-emerald-100 text-emerald-700' :
                        (action.actionType || action.ActionType) === 'Update' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {action.actionType || action.ActionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{action.entityName || action.EntityName}</td>
                    <td className="px-6 py-4 text-sm font-mono">#{action.entityId || action.EntityId}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {new Date(action.timestamp || action.Timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedAction(action)}
                        className="p-2 text-zinc-400 hover:text-primary transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Detail Modal */}
      <AnimatePresence>
        {selectedAction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-3xl p-8 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{language === 'ar' ? 'تفاصيل السجل' : 'History Details'}</h2>
                  <p className="text-zinc-500 text-sm">
                    {selectedAction.entityName || selectedAction.EntityName} #{selectedAction.entityId || selectedAction.EntityId}
                  </p>
                </div>
                <button onClick={() => setSelectedAction(null)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(selectedAction.oldValues || selectedAction.OldValues) && (
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-3">Old Values</p>
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                        {(() => {
                          const val = selectedAction.oldValues || selectedAction.OldValues;
                          if (typeof val === 'object') return JSON.stringify(val, null, 2);
                          try { return JSON.stringify(JSON.parse(val as string), null, 2); } catch (e) { return val; }
                        })()}
                      </pre>
                    </div>
                  )}
                  {(selectedAction.newValues || selectedAction.NewValues) && (
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      <p className="text-[10px] font-bold text-primary/60 uppercase mb-3">New Values</p>
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                        {(() => {
                          const val = selectedAction.newValues || selectedAction.NewValues;
                          if (typeof val === 'object') return JSON.stringify(val, null, 2);
                          try { return JSON.stringify(JSON.parse(val as string), null, 2); } catch (e) { return val; }
                        })()}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminDashboard = ({ locations, routes, selectedOriginId, setSelectedOriginId, handleCreateLocation, handleDeleteLocation, handleUpdateLocation, handleCreateRoute, handleDeleteRoute, newLocation, setNewLocation, newRoute, setNewRoute, userId }: any) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'routes' | 'users' | 'orders' | 'profile' | 'history'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string | 'all'>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [orderForm, setOrderForm] = useState({
    deliveryPrice: 0,
    description: '',
    deliveryLocationDescription: '',
    orderState: 'pending',
    receptionDescription: '',
    deliveryName: ''
  });
  const [locationForm, setLocationForm] = useState({ name: '', address: '', image: '', googleMapsUrl: '' });
  const [userForm, setUserForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    image: '',
    birthday: '',
    role: 'customer' as UserRole, 
    status: 'active' 
  });

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyOrderId, setHistoryOrderId] = useState<number | null>(null);
  const { data: orderHistoryData = [], isLoading: isHistoryLoading } = useOrderHistory(historyOrderId);
  const orderHistory = Array.isArray(orderHistoryData) ? orderHistoryData : [];

  const { data: ordersData = [], refetch: refetchOrders } = useOrders();
  const orders = Array.isArray(ordersData) ? ordersData.filter((order: any) => {
    const matchesSearch = (order.description || order.Description || '').toLowerCase().includes(orderSearchTerm.toLowerCase()) || 
                          (order.deliveryName || order.DeliveryName || '').toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                          (order.id || order.Id || '').toString().includes(orderSearchTerm);
    
    const currentStatus = order.orderState || order.OrderState || order.status || order.Status || 'pending';
    const matchesStatus = orderStatusFilter === 'all' || currentStatus === orderStatusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const { data: usersData = [], refetch: refetchUsers } = useUsers();
  const users = Array.isArray(usersData) ? usersData : [];

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      await updateOrder(id, { orderState: status });
      refetchOrders();
      showToast("Order status updated!", "success");
    } catch (error) {
      showToast("Failed to update order status.", "error");
    }
  };

  const handleSaveOrder = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, orderForm);
        showToast("Order updated successfully!", "success");
      } else {
        await createOrder(orderForm);
        showToast("Order created successfully!", "success");
      }
      refetchOrders();
      setShowOrderModal(false);
      setEditingOrder(null);
      setOrderForm({
        deliveryPrice: 0,
        description: '',
        deliveryLocationDescription: '',
        orderState: 'pending',
        receptionDescription: '',
        deliveryName: ''
      });
    } catch (error) {
      showToast("Failed to save order.", "error");
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(id);
      refetchOrders();
      showToast("Order deleted successfully!", "success");
    } catch (error) {
      showToast("Failed to delete order.", "error");
    }
  };

  const openAddOrder = () => {
    setEditingOrder(null);
    setOrderForm({
      deliveryPrice: 0,
      description: '',
      deliveryLocationDescription: '',
      orderState: 'pending',
      receptionDescription: '',
      deliveryName: ''
    });
    setShowOrderModal(true);
  };

  const openEditOrder = (order: any) => {
    setEditingOrder(order);
    setOrderForm({
      deliveryPrice: order.deliveryPrice || 0,
      description: order.description || '',
      deliveryLocationDescription: order.deliveryLocationDescription || '',
      orderState: order.orderState || 'pending',
      receptionDescription: order.receptionDescription || '',
      deliveryName: order.deliveryName || ''
    });
    setShowOrderModal(true);
  };

  const handleViewHistory = (id: number) => {
    setHistoryOrderId(id);
    setShowHistoryModal(true);
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = (user.name || user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || (user.role || (user.roles && user.roles[0]) || 'customer') === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleUserStatus = async (id: number) => {
    const user = users.find((u: any) => u.id === id);
    if (user) {
      try {
        await updateUser(id, { 
          ...user,
          isActive: !user.isActive,
          updatedAt: new Date().toISOString()
        });
        refetchUsers();
      } catch (error) {
        console.error("Error toggling user status:", error);
        showToast("Failed to toggle user status.", "error");
      }
    }
  };

  const handleSaveUser = async (e: FormEvent) => {
    e.preventDefault();
    
    const formatDate = (dateStr: string) => {
      if (!dateStr) return new Date().toISOString();
      if (dateStr.includes('T')) return dateStr;
      return `${dateStr}T00:00:00.000Z`;
    };

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          ...editingUser,
          name: userForm.name,
          email: userForm.email,
          password: userForm.password || editingUser.password,
          phoneNumber: userForm.phone,
          address: userForm.location,
          username: userForm.email.split('@')[0],
          isActive: userForm.status === 'active',
          birthDate: formatDate(userForm.birthday),
          updatedAt: new Date().toISOString(),
        });
        
        // Also update role if changed
        const roleMapping: Record<string, number> = {
          admin: 1,
          customer: 2,
          delivery: 3
        };
        await assignRole(editingUser.id, roleMapping[userForm.role] || 2);
      } else {
        const newUser = await createUser({
          fullName: userForm.name,
          email: userForm.email,
          password: userForm.password,
          confirmPassword: userForm.confirmPassword,
          role: userForm.role,
          birthDate: formatDate(userForm.birthday),
          phoneNumbers: [
            {
              number: userForm.phone,
              type: 'Mobile'
            }
          ]
        });

        // No need to call assignRole separately if the role is included in creation
      }
      refetchUsers();
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ 
        name: '', 
        email: '', 
        password: '',
        phone: '',
        location: '',
        image: '',
        birthday: '',
        role: 'customer' as UserRole, 
        status: 'active' 
      });
    } catch (error: any) {
      console.error("Error saving user:", error);
      const errorMsg = error.response?.data?.message || error.message || "Bad Request (400)";
      showToast(`Failed to save user: ${errorMsg}`, "error");
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete);
        refetchUsers();
        showToast("User deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting user:", error);
        showToast("Failed to delete user.", "error");
      } finally {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      }
    }
  };

  const confirmDeleteUser = (id: number) => {
    setUserToDelete(id);
    setShowDeleteConfirm(true);
  };

  const openViewUser = async (user: any) => {
    try {
      const userDetails = await fetchUserById(user.id);
      setViewingUser(userDetails);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Fallback to the user object from the list if the detail fetch fails
      setViewingUser(user);
      setShowViewModal(true);
      showToast("Failed to fetch full user details.", "error");
    }
  };

  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({ 
      name: '', 
      email: '', 
      password: '',
      confirmPassword: '',
      phone: '',
      location: '',
      image: '',
      birthday: '',
      role: 'customer' as UserRole, 
      status: 'active' 
    });
    setShowUserModal(true);
  };

  const openEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({ 
      name: user.name || user.fullName || '', 
      email: user.email || '', 
      password: '',
      confirmPassword: '',
      phone: user.phoneNumber || (user.phoneNumbers && user.phoneNumbers[0]?.number) || '',
      location: user.address || '',
      image: user.image || '',
      birthday: user.birthDate ? user.birthDate.split('T')[0] : '',
      role: user.role || (user.roles && user.roles[0]) || 'customer', 
      status: user.isActive ? 'active' : 'inactive' 
    });
    setShowUserModal(true);
  };

  const openEditLocation = (loc: any) => {
    setEditingLocation(loc);
    setLocationForm({ 
      name: loc.name, 
      address: loc.address, 
      image: loc.image || '', 
      googleMapsUrl: loc.googleMapsUrl || '' 
    });
    setShowLocationModal(true);
  };

  const onUpdateLocationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      await handleUpdateLocation(editingLocation.id, locationForm);
      setShowLocationModal(false);
      setEditingLocation(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        <div className="p-4 mb-4 bg-primary/10 rounded-2xl">
          <h2 className="font-bold text-primary flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            {t.dashboard.adminTitle}
          </h2>
        </div>
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <Database className="w-4 h-4" /> {t.dashboard.overview}
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <UserIcon className="w-4 h-4" /> {t.dashboard.users}
        </button>
        <button 
          onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'locations' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <MapPin className="w-4 h-4" /> {t.dashboard.locations}
        </button>
        <button 
          onClick={() => setActiveTab('routes')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'routes' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <Navigation className="w-4 h-4" /> {t.dashboard.routes}
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <ShoppingBag className="w-4 h-4" /> {t.dashboard.orders}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <History className="w-4 h-4" /> {language === 'ar' ? 'السجل' : 'History'}
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <UserIcon className="w-4 h-4" /> {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{t.dashboard.overview}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                <p className="text-zinc-500 text-sm mb-1">{t.dashboard.totalLocations}</p>
                <p className="text-4xl font-black">{locations.length}</p>
              </div>
              <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                <p className="text-zinc-500 text-sm mb-1">{t.dashboard.totalOrders}</p>
                <p className="text-4xl font-black text-primary">{orders.length}</p>
              </div>
              <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                <p className="text-zinc-500 text-sm mb-1">{t.dashboard.totalIncome}</p>
                <p className="text-4xl font-black text-emerald-500">
                  ${orders.reduce((sum: number, order: any) => sum + (order.deliveryPrice || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                <p className="text-zinc-500 text-sm mb-1">{t.dashboard.activeHubs}</p>
                <p className="text-4xl font-black text-emerald-500">{locations.length}</p>
              </div>
              <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                <p className="text-zinc-500 text-sm mb-1">{t.dashboard.systemStatus}</p>
                <p className="text-xl font-bold text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> {t.dashboard.operational}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{t.dashboard.users}</h1>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    openAddUser();
                    setUserForm(prev => ({ ...prev, role: 'delivery' }));
                  }}
                  className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-sm"
                >
                  <Truck className="w-5 h-5" />
                  {language === 'ar' ? 'إضافة مندوب' : 'Add Delivery'}
                </button>
                <button 
                  onClick={openAddUser}
                  className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-sm"
                >
                  <UserPlus className="w-5 h-5" />
                  {t.dashboard.addUser}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder={t.dashboard.searchUsers}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-3 bg-white border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
              >
                <option value="all">{t.dashboard.allRoles}</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="px-6 py-4 font-bold text-sm">{t.dashboard.userName}</th>
                    <th className="px-6 py-4 font-bold text-sm">{t.dashboard.userEmail}</th>
                    <th className="px-6 py-4 font-bold text-sm">{t.dashboard.userRole}</th>
                    <th className="px-6 py-4 font-bold text-sm">{t.dashboard.userStatus}</th>
                    <th className="px-6 py-4 font-bold text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold">{user.name || user.fullName}</td>
                      <td className="px-6 py-4 text-sm text-zinc-500">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {user.role || (user.roles && user.roles[0]) || 'customer'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {user.isActive ? t.dashboard.active : t.dashboard.inactive}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openViewUser(user)}
                            className="p-2 text-zinc-400 hover:text-primary transition-colors"
                            title={language === 'ar' ? 'عرض' : 'View'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEditUser(user)}
                            className="p-2 text-zinc-400 hover:text-black transition-colors"
                            title={t.common.edit}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => toggleUserStatus(user.id)}
                            className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-zinc-400 hover:text-red-500' : 'text-zinc-400 hover:text-emerald-500'}`}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <X className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => confirmDeleteUser(user.id)}
                            className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-zinc-400 font-medium">No users found matching your criteria.</p>
                </div>
              )}
            </div>

            {/* User Modal */}
            <AnimatePresence>
              {showUserModal && (
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
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold">{editingUser ? t.dashboard.editUser : t.dashboard.addUser}</h2>
                      <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveUser} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.userName}</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                            value={userForm.name}
                            onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.userEmail}</label>
                          <input 
                            type="email" 
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                            value={userForm.email}
                            onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.userPassword}</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none pr-12"
                              value={userForm.password}
                              onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                              required={!editingUser}
                              placeholder={editingUser ? "Leave blank to keep same" : ""}
                            />
                            <button
                              type="button"
                              onMouseDown={() => setShowPassword(true)}
                              onMouseUp={() => setShowPassword(false)}
                              onMouseLeave={() => setShowPassword(false)}
                              onTouchStart={() => setShowPassword(true)}
                              onTouchEnd={() => setShowPassword(false)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        {!editingUser && (
                          <div>
                            <label className="block text-sm font-medium text-zinc-500 mb-1">Confirm Password</label>
                            <div className="relative">
                              <input 
                                type={showPassword ? "text" : "password"} 
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none pr-12"
                                value={userForm.confirmPassword}
                                onChange={e => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                                required
                              />
                              <button
                                type="button"
                                onMouseDown={() => setShowPassword(true)}
                                onMouseUp={() => setShowPassword(false)}
                                onMouseLeave={() => setShowPassword(false)}
                                onTouchStart={() => setShowPassword(true)}
                                onTouchEnd={() => setShowPassword(false)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.userPhone}</label>
                          <input 
                            type="tel" 
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                            value={userForm.phone}
                            onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.userLocation}</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                            value={userForm.location}
                            onChange={e => setUserForm({ ...userForm, location: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.userBirthday}</label>
                          <input 
                            type="date" 
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                            value={userForm.birthday}
                            onChange={e => setUserForm({ ...userForm, birthday: e.target.value })}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.userImage}</label>
                          <input 
                            type="url" 
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                            value={userForm.image}
                            onChange={e => setUserForm({ ...userForm, image: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.userRole}</label>
                          <select 
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none font-medium"
                            value={userForm.role}
                            onChange={e => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                          >
                            <option value="admin">Admin</option>
                            <option value="customer">Customer</option>
                            <option value="delivery">Delivery</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.userStatus}</label>
                          <select 
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none font-medium"
                            value={userForm.status}
                            onChange={e => setUserForm({ ...userForm, status: e.target.value })}
                          >
                            <option value="active">{t.dashboard.active}</option>
                            <option value="inactive">{t.dashboard.inactive}</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button 
                          type="button"
                          onClick={() => setShowUserModal(false)}
                          className="flex-1 px-6 py-3 bg-zinc-100 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                        >
                          {t.common.cancel}
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                        >
                          {t.dashboard.saveUser}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* View User Details Modal */}
            <AnimatePresence>
              {showViewModal && viewingUser && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold">{language === 'ar' ? 'تفاصيل المستخدم' : 'User Details'}</h2>
                      <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-8">
                      {/* Header Info */}
                      <div className="flex items-center gap-6 pb-6 border-b border-zinc-100">
                        <div className="w-24 h-24 bg-zinc-100 rounded-3xl flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                          {viewingUser.profilePictureUrl || viewingUser.image ? (
                            <img src={viewingUser.profilePictureUrl || viewingUser.image} alt={viewingUser.fullName || viewingUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <UserIcon className="w-12 h-12 text-zinc-300" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black">{viewingUser.fullName || viewingUser.name}</h3>
                          <p className="text-zinc-500 font-medium">{viewingUser.email}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {/* Handle roles from different potential structures */}
                            {viewingUser.roles && Array.isArray(viewingUser.roles) && viewingUser.roles.length > 0 ? (
                              viewingUser.roles.map((role: any, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                                  {typeof role === 'string' ? role : (role.name || role.roleName || JSON.stringify(role))}
                                </span>
                              ))
                            ) : viewingUser.userRoles && Array.isArray(viewingUser.userRoles) && viewingUser.userRoles.length > 0 ? (
                              viewingUser.userRoles.map((ur: any, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                                  {typeof ur === 'string' ? ur : (ur.role?.name || ur.name || ur.roleName || JSON.stringify(ur))}
                                </span>
                              ))
                            ) : (
                              <span className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {viewingUser.role || 'customer'}
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${viewingUser.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                              {viewingUser.isActive ? t.dashboard.active : t.dashboard.inactive}
                            </span>
                            {viewingUser.isDeleted && (
                              <span className="px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {language === 'ar' ? 'محذوف' : 'Deleted'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{language === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}</p>
                          <p className="font-medium">
                            {viewingUser.birthDate && viewingUser.birthDate !== "0001-01-01T00:00:00" 
                              ? new Date(viewingUser.birthDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') 
                              : '-'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{language === 'ar' ? 'اسم المستخدم' : 'Username'}</p>
                          <p className="font-medium">@{viewingUser.username || viewingUser.email?.split('@')[0]}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{language === 'ar' ? 'العنوان' : 'Address'}</p>
                          <p className="font-medium">{viewingUser.address || '-'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{language === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}</p>
                          <p className="font-medium">{viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US') : '-'}</p>
                        </div>
                        {viewingUser.deletedAt && (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{language === 'ar' ? 'تاريخ الحذف' : 'Deleted At'}</p>
                            <p className="font-medium text-red-500">{new Date(viewingUser.deletedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                          </div>
                        )}
                      </div>

                      {/* Phone Numbers */}
                      {viewingUser.phoneNumbers && viewingUser.phoneNumbers.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{language === 'ar' ? 'أرقام الهاتف' : 'Phone Numbers'}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {viewingUser.phoneNumbers.map((phone: any, idx: number) => (
                              <div key={idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex justify-between items-center">
                                <span className="font-bold">{phone.number}</span>
                                <span className="text-[10px] font-bold uppercase text-zinc-400 bg-white px-2 py-1 rounded-md border border-zinc-100">{phone.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Permissions */}
                      {viewingUser.userPermissions && viewingUser.userPermissions.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{language === 'ar' ? 'الصلاحيات' : 'Permissions'}</p>
                          <div className="flex flex-wrap gap-2">
                            {viewingUser.userPermissions.map((perm: any, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-bold uppercase border border-zinc-200">
                                {typeof perm === 'string' ? perm : (perm.name || perm.permissionName || JSON.stringify(perm))}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* System Info */}
                      <div className="pt-6 border-t border-zinc-100 flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        <span>ID: {viewingUser.id}</span>
                        <span>{language === 'ar' ? 'آخر تحديث' : 'Last Updated'}: {viewingUser.updatedAt ? new Date(viewingUser.updatedAt).toLocaleDateString() : '-'}</span>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button 
                        onClick={() => setShowViewModal(false)}
                        className="w-full py-4 bg-zinc-100 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
                      >
                        {t.common.close || 'Close'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center"
                  >
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trash2 className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Delete User?</h2>
                    <p className="text-zinc-500 mb-8">This action cannot be undone. All data associated with this user will be permanently removed.</p>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-6 py-3 bg-zinc-100 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleDeleteUser}
                        className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{t.dashboard.locations}</h1>
            <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
              <h3 className="font-bold mb-4">{t.dashboard.addNewHub}</h3>
              <form onSubmit={handleCreateLocation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Location Name" 
                  className="px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100 text-sm"
                  value={newLocation.name} onChange={e => setNewLocation({...newLocation, name: e.target.value})}
                  required
                />
                <input 
                  type="text" placeholder="Full Address" 
                  className="px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100 text-sm"
                  value={newLocation.address} onChange={e => setNewLocation({...newLocation, address: e.target.value})}
                  required
                />
                <button type="submit" className="md:col-span-2 bg-black text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                  {t.dashboard.addNewHub}
                </button>
              </form>
            </div>
            <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="px-6 py-4 font-bold text-sm">Name</th>
                    <th className="px-6 py-4 font-bold text-sm">Address</th>
                    <th className="px-6 py-4 font-bold text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {locations.map((loc: any) => (
                    <tr key={loc.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{loc.name}</td>
                      <td className="px-6 py-4 text-sm text-zinc-500 truncate max-w-xs">{loc.address}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditLocation(loc)} className="p-2 text-zinc-400 hover:text-black transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteLocation(loc.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Location Edit Modal */}
            <AnimatePresence>
              {showLocationModal && (
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
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold">Edit Location</h2>
                      <button onClick={() => setShowLocationModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={onUpdateLocationSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">Location Name</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                          value={locationForm.name}
                          onChange={e => setLocationForm({ ...locationForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">Full Address</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                          value={locationForm.address}
                          onChange={e => setLocationForm({ ...locationForm, address: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">Image URL</label>
                        <input 
                          type="url" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                          value={locationForm.image}
                          onChange={e => setLocationForm({ ...locationForm, image: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-500 mb-1">Google Maps URL</label>
                        <input 
                          type="url" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                          value={locationForm.googleMapsUrl}
                          onChange={e => setLocationForm({ ...locationForm, googleMapsUrl: e.target.value })}
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button 
                          type="button"
                          onClick={() => setShowLocationModal(false)}
                          className="flex-1 px-6 py-3 bg-zinc-100 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                        >
                          {t.common.cancel}
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                        >
                          {t.common.save}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{t.dashboard.routes}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                <h3 className="font-bold mb-4">1. Select Origin Hub</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {locations.map((loc: any) => (
                    <button 
                      key={loc.id}
                      onClick={() => setSelectedOriginId(loc.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${selectedOriginId === loc.id ? 'bg-primary text-white font-bold' : 'bg-zinc-50 hover:bg-zinc-100'}`}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm transition-opacity ${!selectedOriginId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <h3 className="font-bold mb-4">2. Add Route</h3>
                <form onSubmit={handleCreateRoute} className="space-y-4">
                  <input 
                    type="text" placeholder="Destination Name" 
                    className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100 text-sm"
                    value={newRoute.destination} onChange={e => setNewRoute({...newRoute, destination: e.target.value})}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" placeholder="Distance" 
                      className="px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100 text-sm"
                      value={newRoute.distance} onChange={e => setNewRoute({...newRoute, distance: e.target.value})}
                      required
                    />
                    <input 
                      type="number" step="0.01" placeholder="Price" 
                      className="px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100 text-sm"
                      value={newRoute.price} onChange={e => setNewRoute({...newRoute, price: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                    Add Route
                  </button>
                </form>
              </div>
            </div>
            {selectedOriginId && (
              <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="px-6 py-4 font-bold text-sm">Destination</th>
                      <th className="px-6 py-4 font-bold text-sm">Distance</th>
                      <th className="px-6 py-4 font-bold text-sm">Price</th>
                      <th className="px-6 py-4 font-bold text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {routes.map((route: any) => (
                      <tr key={route.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium">{route.destination}</td>
                        <td className="px-6 py-4 text-sm text-zinc-500">{route.distance}</td>
                        <td className="px-6 py-4 text-sm font-bold">${route.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteRoute(route.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{t.dashboard.orders}</h1>
              <button 
                onClick={openAddOrder}
                className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-sm"
              >
                <ShoppingBag className="w-5 h-5" />
                {language === 'ar' ? 'طلب جديد' : 'New Order'}
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder={language === 'ar' ? 'البحث في الطلبات...' : 'Search orders...'}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-3 bg-white border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
              >
                <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="pending">{t.dashboard.pending}</option>
                <option value="preparing">{t.dashboard.preparing}</option>
                <option value="onTheWay">{t.dashboard.onTheWay}</option>
                <option value="delivered">{t.dashboard.delivered}</option>
                <option value="cancelled">{t.dashboard.cancelled}</option>
              </select>
            </div>

            <OrderManagement 
              role="admin" 
              orders={orders} 
              onUpdateStatus={handleUpdateOrderStatus} 
              onEdit={openEditOrder}
              onDelete={handleDeleteOrder}
              onViewHistory={handleViewHistory}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <SystemHistoryManagement />
        )}

        {activeTab === 'profile' && userId && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{language === 'ar' ? 'الملف الشخصي' : 'Profile'}</h1>
            <UserProfile userId={userId} />
          </div>
        )}

        {/* Order Modal */}
        <AnimatePresence>
          {showOrderModal && (
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
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">{editingOrder ? (language === 'ar' ? 'تعديل الطلب' : 'Edit Order') : (language === 'ar' ? 'طلب جديد' : 'New Order')}</h2>
                  <button onClick={() => setShowOrderModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveOrder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">{language === 'ar' ? 'الوصف' : 'Description'}</label>
                    <textarea 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none min-h-[100px]"
                      value={orderForm.description}
                      onChange={e => setOrderForm({ ...orderForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">{language === 'ar' ? 'سعر التوصيل' : 'Delivery Price'}</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                        value={isNaN(orderForm.deliveryPrice) ? '' : orderForm.deliveryPrice}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setOrderForm({ ...orderForm, deliveryPrice: isNaN(val) ? 0 : val });
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">{language === 'ar' ? 'الحالة' : 'Status'}</label>
                      <select 
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                        value={orderForm.orderState}
                        onChange={e => setOrderForm({ ...orderForm, orderState: e.target.value })}
                      >
                        <option value="pending">{t.dashboard.pending}</option>
                        <option value="preparing">{t.dashboard.preparing}</option>
                        <option value="onTheWay">{t.dashboard.onTheWay}</option>
                        <option value="delivered">{t.dashboard.delivered}</option>
                        <option value="cancelled">{t.dashboard.cancelled}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">{language === 'ar' ? 'اسم المندوب' : 'Delivery Name'}</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                      value={orderForm.deliveryName}
                      onChange={e => setOrderForm({ ...orderForm, deliveryName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">{language === 'ar' ? 'وصف موقع التوصيل' : 'Delivery Location Description'}</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                      value={orderForm.deliveryLocationDescription}
                      onChange={e => setOrderForm({ ...orderForm, deliveryLocationDescription: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">{language === 'ar' ? 'وصف الاستلام' : 'Reception Description'}</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none"
                      value={orderForm.receptionDescription}
                      onChange={e => setOrderForm({ ...orderForm, receptionDescription: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowOrderModal(false)}
                      className="flex-1 px-6 py-3 bg-zinc-100 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                    >
                      {t.common.cancel}
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                    >
                      {t.common.save}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order History Modal */}
        <AnimatePresence>
          {showHistoryModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-4xl rounded-3xl p-8 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{language === 'ar' ? 'سجل تغييرات الطلب' : 'Order Change History'}</h2>
                    <p className="text-zinc-500 text-sm">#ORD-{historyOrderId?.toString().padStart(4, '0')}</p>
                  </div>
                  <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {isHistoryLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : orderHistory.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400">
                      {language === 'ar' ? 'لا يوجد سجل لهذا الطلب' : 'No history found for this order.'}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orderHistory.map((action: any) => (
                        <div key={action.id || action.Id} className="relative pl-8 border-l-2 border-zinc-100 pb-6 last:pb-0">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary" />
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                (action.actionType || action.ActionType) === 'Create' ? 'bg-emerald-100 text-emerald-700' :
                                (action.actionType || action.ActionType) === 'Update' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {action.actionType || action.ActionType}
                              </span>
                              <span className="ml-2 text-sm font-bold">
                                {(action.user || action.User)?.fullName || 
                                 (action.user || action.User)?.FullName || 
                                 (action.user || action.User)?.name || 
                                 (action.user || action.User)?.Name || 
                                 'System'}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-400">
                              {new Date(action.timestamp || action.Timestamp).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            {(action.oldValues || action.OldValues) && (
                              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Old Values</p>
                                <pre className="text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                                  {(() => {
                                    const val = action.oldValues || action.OldValues;
                                    if (typeof val === 'object') {
                                      return JSON.stringify(val, null, 2);
                                    }
                                    try {
                                      return JSON.stringify(JSON.parse(val as string), null, 2);
                                    } catch (e) {
                                      return val;
                                    }
                                  })()}
                                </pre>
                              </div>
                            )}
                            {(action.newValues || action.NewValues) && (
                              <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                                <p className="text-[10px] font-bold text-primary/60 uppercase mb-2">New Values</p>
                                <pre className="text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                                  {(() => {
                                    const val = action.newValues || action.NewValues;
                                    if (typeof val === 'object') {
                                      return JSON.stringify(val, null, 2);
                                    }
                                    try {
                                      return JSON.stringify(JSON.parse(val as string), null, 2);
                                    } catch (e) {
                                      return val;
                                    }
                                  })()}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const RestaurantOwnerDashboard = ({ userId }: { userId: number | null }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'messages' | 'images' | 'location' | 'orders' | 'meals' | 'categories' | 'user_profile'>('profile');
  const [categories, setCategories] = useState<any[]>([
    { id: 1, name: 'Juices' },
    { id: 2, name: 'Meat' },
    { id: 3, name: 'Chicken' }
  ]);
  const [meals, setMeals] = useState<any[]>([
    {
      id: 1,
      name: 'Classic Cheeseburger',
      price: 12.99,
      description: 'Juicy beef patty with cheddar cheese, lettuce, and tomato.',
      isAvailable: true,
      baseImage: 'https://picsum.photos/seed/burger1/400',
      gallery: ['https://picsum.photos/seed/burger2/400', 'https://picsum.photos/seed/burger3/400'],
      quantity: 50,
      sizes: ['Small', 'Medium', 'Large'],
      categories: [2] // Meat
    }
  ]);

  const [orders, setOrders] = useState<any[]>([
    { id: 2001, description: 'Order from John Doe', deliveryName: 'Mandoob 1', orderState: 'preparing', deliveryPrice: 45.00 },
    { id: 2002, description: 'Order from Jane Smith', deliveryName: 'Mandoob 2', orderState: 'pending', deliveryPrice: 28.50 },
  ]);

  const handleUpdateOrderStatus = (id: number, status: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, orderState: status, status } : o));
  };

  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<any>(null);

  const handleSaveMeal = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const mealData = {
      id: editingMeal ? editingMeal.id : Date.now(),
      name: formData.get('name'),
      price: parseFloat(formData.get('price') as string),
      description: formData.get('description'),
      isAvailable: formData.get('isAvailable') === 'on',
      baseImage: formData.get('baseImage'),
      quantity: parseInt(formData.get('quantity') as string),
      sizes: (formData.get('sizes') as string).split(',').map(s => s.trim()),
      gallery: (formData.get('gallery') as string).split(',').map(s => s.trim()).filter(s => s !== ''),
      categories: Array.from(formData.getAll('categories')).map(id => parseInt(id as string))
    };

    if (editingMeal) {
      setMeals(meals.map(m => m.id === editingMeal.id ? mealData : m));
    } else {
      setMeals([...meals, mealData]);
    }
    setIsAddingMeal(false);
    setEditingMeal(null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        <div className="p-4 mb-4 bg-primary/10 rounded-2xl">
          <h2 className="font-bold text-primary flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            {t.dashboard.ownerTitle}
          </h2>
        </div>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <UserIcon className="w-4 h-4" /> {t.dashboard.profile}
        </button>
        <button 
          onClick={() => setActiveTab('meals')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'meals' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <ClipboardList className="w-4 h-4" /> {t.dashboard.meals}
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'categories' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <Database className="w-4 h-4" /> {t.dashboard.manageCategories}
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'messages' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <Mail className="w-4 h-4" /> {t.dashboard.messages}
        </button>
        <button 
          onClick={() => setActiveTab('images')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'images' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <ImageIcon className="w-4 h-4" /> {t.dashboard.images}
        </button>
        <button 
          onClick={() => setActiveTab('location')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'location' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <MapPin className="w-4 h-4" /> {t.dashboard.locations}
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <ShoppingBag className="w-4 h-4" /> {t.dashboard.orders}
        </button>
        <button 
          onClick={() => setActiveTab('user_profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'user_profile' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <UserIcon className="w-4 h-4" /> {language === 'ar' ? 'الملف الشخصي' : 'User Profile'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{t.dashboard.profile}</h1>
            <div className="p-8 bg-white border border-zinc-100 rounded-3xl shadow-sm">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-zinc-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img src="https://picsum.photos/seed/restaurant/200" alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">The Burger Joint</h2>
                  <p className="text-zinc-500">Premium Burgers & Shakes</p>
                </div>
              </div>
              <form className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-bold mb-1.5">Restaurant Name</label>
                  <input type="text" defaultValue="The Burger Joint" className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">Description</label>
                  <textarea rows={3} defaultValue="Serving the best burgers in town since 2010." className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100" />
                </div>
                <button className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                  {t.common.save}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{t.dashboard.meals}</h1>
              <button 
                onClick={() => setIsAddingMeal(true)}
                className="bg-black text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> {t.dashboard.addMeal}
              </button>
            </div>

            {isAddingMeal || editingMeal ? (
              <div className="p-8 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                <h2 className="text-xl font-bold mb-6">{editingMeal ? t.dashboard.editMeal : t.dashboard.addMeal}</h2>
                <form onSubmit={handleSaveMeal} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-1.5">{t.dashboard.mealName}</label>
                      <input name="name" type="text" defaultValue={editingMeal?.name} className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5">{t.dashboard.mealPrice}</label>
                      <input name="price" type="number" step="0.01" defaultValue={editingMeal?.price} className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">{t.dashboard.mealDescription}</label>
                    <textarea name="description" rows={3} defaultValue={editingMeal?.description} className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-1.5">{t.dashboard.baseImage}</label>
                      <input name="baseImage" type="url" defaultValue={editingMeal?.baseImage} className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5">{t.dashboard.mealQuantity}</label>
                      <input name="quantity" type="number" defaultValue={editingMeal?.quantity} className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">{t.dashboard.mealSizes} ({language === 'ar' ? 'افصل بينها بفواصل' : 'comma separated'})</label>
                    <input name="sizes" type="text" defaultValue={editingMeal?.sizes?.join(', ')} placeholder="Small, Medium, Large" className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">{t.dashboard.galleryImages} ({language === 'ar' ? 'افصل بينها بفواصل' : 'comma separated URLs'})</label>
                    <textarea name="gallery" rows={2} defaultValue={editingMeal?.gallery?.join(', ')} placeholder="https://image1.com, https://image2.com" className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">{t.dashboard.selectCategories}</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map(cat => (
                        <label key={cat.id} className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100 cursor-pointer hover:bg-zinc-100 transition-colors">
                          <input 
                            type="checkbox" 
                            name="categories" 
                            value={cat.id} 
                            defaultChecked={editingMeal?.categories?.includes(cat.id)}
                            className="w-4 h-4 accent-black"
                          />
                          <span className="text-sm">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input name="isAvailable" type="checkbox" defaultChecked={editingMeal ? editingMeal.isAvailable : true} className="w-5 h-5 accent-black" />
                    <label className="text-sm font-bold">{t.dashboard.mealAvailability}</label>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                      {t.common.save}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setIsAddingMeal(false); setEditingMeal(null); }}
                      className="bg-zinc-100 text-zinc-600 px-8 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                    >
                      {t.common.cancel}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.map(meal => (
                  <div key={meal.id} className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-video relative">
                      <img src={meal.baseImage} alt={meal.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${meal.isAvailable ? 'bg-emerald-500 text-white' : 'bg-zinc-500 text-white'}`}>
                          {meal.isAvailable ? t.dashboard.operational : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{meal.name}</h3>
                        <span className="font-black text-primary">${meal.price.toFixed(2)}</span>
                      </div>
                      <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{meal.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {meal.categories?.map((catId: number) => {
                          const cat = categories.find(c => c.id === catId);
                          return cat ? (
                            <span key={catId} className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold">
                              {cat.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {meal.sizes.map((s: string) => (
                          <span key={s} className="px-2 py-1 bg-zinc-100 rounded-lg text-[10px] font-bold text-zinc-600">{s}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-zinc-50">
                        <span className="text-xs text-zinc-400">{t.dashboard.mealQuantity}: {meal.quantity}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingMeal(meal)}
                            className="p-2 text-zinc-400 hover:text-black transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setMeals(meals.filter(m => m.id !== meal.id))}
                            className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{t.dashboard.manageCategories}</h1>
            </div>
            
            <div className="p-8 bg-white border border-zinc-100 rounded-3xl shadow-sm">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get('categoryName') as string;
                  if (name) {
                    setCategories([...categories, { id: Date.now(), name }]);
                    e.currentTarget.reset();
                  }
                }}
                className="flex gap-4 mb-8"
              >
                <div className="flex-1">
                  <input 
                    name="categoryName"
                    type="text" 
                    placeholder={t.dashboard.categoryName}
                    className="w-full px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t.dashboard.addCategory}
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex justify-between items-center">
                    <span className="font-bold">{cat.name}</span>
                    <button 
                      onClick={() => setCategories(categories.filter(c => c.id !== cat.id))}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{t.dashboard.messages}</h1>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-zinc-400" />
                    </div>
                    <div>
                      <h4 className="font-bold">Customer #{i}</h4>
                      <p className="text-sm text-zinc-500">Is my order on the way?</p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">2h ago</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{t.dashboard.images}</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="aspect-square bg-zinc-100 rounded-2xl overflow-hidden relative group">
                  <img src={`https://picsum.photos/seed/dish${i}/400`} alt="Dish" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="p-2 bg-white rounded-full text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button className="aspect-square border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:border-black hover:text-black transition-all">
                <Plus className="w-8 h-8" />
                <span className="text-xs font-bold">Add Image</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{t.dashboard.locations}</h1>
            <div className="p-8 bg-white border border-zinc-100 rounded-3xl shadow-sm">
              <div className="h-[300px] bg-zinc-100 rounded-2xl mb-6 flex items-center justify-center text-zinc-400">
                <MapPin className="w-12 h-12" />
                <span className="ml-2 font-bold">Map Preview</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">Address</label>
                  <input type="text" defaultValue="123 Burger St, Food City" className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100" />
                </div>
                <button className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                  Update Location
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{t.dashboard.orders}</h1>
            <OrderManagement role="customer" orders={orders} onUpdateStatus={handleUpdateOrderStatus} />
          </div>
        )}

        {activeTab === 'user_profile' && userId && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{language === 'ar' ? 'الملف الشخصي' : 'User Profile'}</h1>
            <UserProfile userId={userId} />
          </div>
        )}
      </div>
    </div>
  );
};

const DeliveryDashboard = ({ userId }: { userId: number | null }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile'>('overview');
  const [orders, setOrders] = useState<any[]>([
    { id: 3001, description: 'Order for Mike Ross', deliveryName: 'Self', orderState: 'onTheWay', deliveryPrice: 15.00 },
    { id: 3002, description: 'Order for Harvey Specter', deliveryName: 'Self', orderState: 'preparing', deliveryPrice: 85.00 },
  ]);

  const handleUpdateOrderStatus = (id: number, status: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, orderState: status, status } : o));
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 flex flex-col gap-2">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> {t.dashboard.overview}
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <ShoppingBag className="w-4 h-4" /> {t.dashboard.orders}
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <UserIcon className="w-4 h-4" /> {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
        </button>
      </div>

      <div className="flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{t.dashboard.deliveryTitle}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                <h3 className="font-bold mb-2">{t.dashboard.totalOrders}</h3>
                <p className="text-3xl font-black text-primary">{orders.length}</p>
              </div>
              <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                <h3 className="font-bold mb-2">{t.dashboard.totalIncome}</h3>
                <p className="text-3xl font-black text-primary">
                  ${orders.reduce((sum: number, o: any) => sum + (o.deliveryPrice || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                <h3 className="font-bold mb-2">{t.dashboard.systemStatus}</h3>
                <p className="text-xl font-bold text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> {t.dashboard.operational}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{t.dashboard.orders}</h1>
            <OrderManagement role="delivery" orders={orders} onUpdateStatus={handleUpdateOrderStatus} />
          </div>
        )}

        {activeTab === 'profile' && userId && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{language === 'ar' ? 'الملف الشخصي' : 'Profile'}</h1>
            <UserProfile userId={userId} />
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ onLogout, userId, isAuthenticated }: { onLogout: () => void, userId: number | null, isAuthenticated: boolean }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole | null>(null);
  
  useEffect(() => {
    const savedRole = localStorage.getItem('jeetk_user_role') as UserRole;
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setRole(savedRole);
    }
  }, [navigate, isAuthenticated]);

  const { data: locationsData = [], refetch: refetchLocations } = useLocations();
  const locations = Array.isArray(locationsData) ? locationsData : [];

  const [selectedOriginId, setSelectedOriginId] = useState<string | null>(null);
  const { data: routesData = [], refetch: refetchRoutes } = useDeliveryRoute(selectedOriginId);
  const routes = Array.isArray(routesData) ? routesData : [];

  const [newLocation, setNewLocation] = useState<Omit<Location, 'id'>>({ name: '', address: '', image: '', googleMapsUrl: '' });
  const [newRoute, setNewRoute] = useState<Omit<DeliveryRoute, 'id'>>({ 
    origin: '', 
    destination: '', 
    distance: '', 
    price: 0, 
    isAvailable: true 
  });

  const handleCreateLocation = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createLocation(newLocation);
      setNewLocation({ name: '', address: '', image: '', googleMapsUrl: '' });
      refetchLocations();
      showToast('Location created successfully!', 'success');
    } catch (err) {
      showToast('Failed to create location', 'error');
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    try {
      await deleteLocation(id);
      refetchLocations();
      showToast('Location deleted successfully!', 'success');
    } catch (err) {
      showToast('Failed to delete location', 'error');
    }
  };

  const handleUpdateLocation = async (id: string, location: Partial<Location>) => {
    try {
      await updateLocation(id, location);
      refetchLocations();
      showToast('Location updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update location', 'error');
    }
  };

  const handleCreateRoute = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOriginId) return;
    const originName = locations.find(l => l.id === selectedOriginId)?.name || '';
    try {
      await createDeliveryRoute({ ...newRoute, origin: originName });
      setNewRoute({ origin: '', destination: '', distance: '', price: 0, isAvailable: true });
      refetchRoutes();
      showToast('Route created successfully!', 'success');
    } catch (err) {
      showToast('Failed to create route', 'error');
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      await deleteDeliveryRoute(id);
      refetchRoutes();
      showToast('Route deleted successfully!', 'success');
    } catch (err) {
      showToast('Failed to delete route', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {role === 'admin' ? t.dashboard.adminTitle : 
             role === 'customer' ? t.dashboard.ownerTitle :
             role === 'delivery' ? t.dashboard.deliveryTitle :
             'Dashboard'}
          </h1>
          <p className="text-zinc-500 text-sm">Welcome back to Jeetk Management</p>
        </div>
        <button 
          onClick={() => {
            onLogout();
            navigate('/login');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" /> {t.dashboard.signOut}
        </button>
      </div>

      {role === 'admin' ? (
        <AdminDashboard 
          locations={locations} 
          routes={routes} 
          selectedOriginId={selectedOriginId} 
          setSelectedOriginId={setSelectedOriginId}
          handleCreateLocation={handleCreateLocation}
          handleDeleteLocation={handleDeleteLocation}
          handleUpdateLocation={handleUpdateLocation}
          handleCreateRoute={handleCreateRoute}
          handleDeleteRoute={handleDeleteRoute}
          newLocation={newLocation}
          setNewLocation={setNewLocation}
          newRoute={newRoute}
          setNewRoute={setNewRoute}
          refetchLocations={refetchLocations}
          refetchRoutes={refetchRoutes}
          userId={userId}
        />
      ) : role === 'customer' ? (
        <RestaurantOwnerDashboard userId={userId} />
      ) : role === 'delivery' ? (
        <DeliveryDashboard userId={userId} />
      ) : (
        <div className="p-8 bg-white border border-zinc-100 rounded-3xl shadow-sm text-center">
          <h2 className="text-xl font-bold text-zinc-400">Dashboard for {role} is coming soon...</h2>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType }[]>([]);
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('jeetk_lang') as Language) || 'en';
  });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    setGlobalErrorHandler((message) => {
      showToast(message, 'error');
    });
  }, [showToast]);

  useEffect(() => {
    localStorage.setItem('jeetk_lang', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.title = translations[language].title;
  }, [language]);

  const t = translations[language];

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const [userId, setUserId] = useState<number | null>(null);

  const handleLogin = (role: UserRole, email: string, id: number) => {
    localStorage.setItem('jeetk_admin_auth', 'true');
    localStorage.setItem('jeetk_user_role', role);
    localStorage.setItem('jeetk_user_id', id?.toString() || '');
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('jeetk_admin_auth');
    localStorage.removeItem('jeetk_user_role');
    localStorage.removeItem('jeetk_user_id');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
  };

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
    <ToastContext.Provider value={{ showToast }}>
      <LanguageContext.Provider value={{ language, setLanguage, t }}>
        <Router>
          <ScrollToTop />
          <div className={`min-h-screen bg-white font-sans text-zinc-900 ${language === 'ar' ? 'font-arabic' : ''}`}>
            <Navbar 
              cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
              isAuthenticated={isAuthenticated}
            />
            
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/restaurant/:id" element={<RestaurantPage addToCart={addToCart} />} />
                <Route path="/cart" element={<CartPage cart={cart} updateQuantity={updateQuantity} clearCart={clearCart} />} />
                <Route path="/tracking" element={<TrackingPage />} />
                <Route path="/locations" element={<LocationsPage />} />
                <Route path="/routes" element={<DeliveryRoutesPage />} />
                <Route path="/register/delivery" element={<DeliveryRegistrationPage />} />
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} userId={userId} isAuthenticated={isAuthenticated} />} />
              </Routes>
            </main>

            <footer className="bg-zinc-50 border-t border-black/5 py-12 mt-20">
              <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-start">
                <div className="col-span-1 md:col-span-2">
                  <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 mb-4">
                    <JeetkLogo className="w-10 h-10" />
                    <span className="logo-gradient">Jeetk</span>
                  </div>
                  <p className="text-zinc-500 max-w-sm">
                    {t.footer.tagline}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-4">{t.footer.quickLinks}</h4>
                  <ul className="space-y-2 text-zinc-500 text-sm">
                    <li><Link to="/">{t.footer.home}</Link></li>
                    <li><Link to="/locations">{t.footer.locations}</Link></li>
                    <li><Link to="/routes">{t.footer.deliveryPrices}</Link></li>
                    <li><Link to="/cart">{t.footer.cart}</Link></li>
                    <li><Link to="/tracking">{t.footer.trackOrder}</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">{t.footer.support}</h4>
                  <ul className="space-y-2 text-zinc-500 text-sm">
                    <li>{t.footer.helpCenter}</li>
                    <li>{t.footer.contactUs}</li>
                    <li>{t.footer.privacyPolicy}</li>
                  </ul>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-4 pt-12 mt-12 border-t border-black/5 text-center text-zinc-400 text-xs">
                © 2026 Jeetk. {t.footer.rights}
              </div>
            </footer>
          </div>
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </Router>
      </LanguageContext.Provider>
    </ToastContext.Provider>
  );
}
