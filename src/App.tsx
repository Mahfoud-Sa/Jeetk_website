import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { translations, Language } from './i18n';
import { MenuItem, CartItem, UserRole } from './types';
import { setGlobalErrorHandler } from './services/apiClient';

import { LanguageContext } from './context/LanguageContext';
import { ToastContext } from './context/ToastContext';
import { ToastContainer, ToastType } from './components/Toast';
import { Navbar } from './components/Navbar';
import { JeetkLogo } from './components/JeetkLogo';
import { ScrollToTop } from './components/ScrollToTop';
import { AIChatAssistant } from './components/AIChatAssistant';

// Pages
import { HomePage } from './pages/HomePage';
import { RestaurantsPage } from './pages/RestaurantsPage';
import { RestaurantPage } from './pages/RestaurantPage';
import { CartPage } from './pages/CartPage';
import { TrackingPage } from './pages/TrackingPage';
import { LocationsPage } from './pages/LocationsPage';
import { DeliveryRoutesPage } from './pages/DeliveryRoutesPage';
import { DeliveryRegistrationPage } from './pages/DeliveryRegistrationPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

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

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('jeetk_admin_auth') === 'true';
  });

  const [userId, setUserId] = useState<number | null>(() => {
    const saved = localStorage.getItem('jeetk_user_id');
    return saved ? parseInt(saved) : null;
  });

  const queryClient = useQueryClient();

  const handleLogin = (role: UserRole, email: string, id: number, token?: string) => {
    localStorage.setItem('jeetk_admin_auth', 'true');
    localStorage.setItem('jeetk_user_role', role);
    localStorage.setItem('jeetk_user_id', id?.toString() || '');
    if (token) {
      localStorage.setItem('token', token);
    }
    setIsAuthenticated(true);
    setUserId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('jeetk_admin_auth');
    localStorage.removeItem('jeetk_user_role');
    localStorage.removeItem('jeetk_user_id');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserId(null);
    queryClient.clear();
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
                <Route path="/dashboard" element={<DashboardPage onLogout={handleLogout} userId={userId} isAuthenticated={isAuthenticated} />} />
              </Routes>
            </main>

            <footer className="bg-zinc-50 border-t border-black/5 py-12 mt-20">
              <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-start">
                <div className="col-span-1 md:col-span-2">
                  <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 mb-4 text-start">
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
          <AIChatAssistant />
        </Router>
      </LanguageContext.Provider>
    </ToastContext.Provider>
  );
}
