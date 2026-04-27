import { Link } from 'react-router-dom';
import { MapPin, Globe, Search, ShoppingBag, LogIn, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { JeetkLogo } from './JeetkLogo';

import { useAuth } from '../context/AuthContext';

export const Navbar = ({ cartCount }: { 
  cartCount: number
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  
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
