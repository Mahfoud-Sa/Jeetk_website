import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, X, Clock, Navigation, ChevronRight, Truck, Utensils, Percent, MapPin, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { RestaurantCard } from '../components/RestaurantCard';
import { GoogleGenAI } from "@google/genai";
import { getRestaurants } from '../services/restaurantService';
import { Restaurant } from '../types';
import { getLandingFeatures, ICON_MAP } from '../components/dashboard/AdminFeatures';

interface WebMainContent {
  title: string;
  subtitle: string;
  imageUrl: string;
  lastUpdated?: string;
}

interface WebCard {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
}

interface WebPathContent {
  title: string;
  path: string;
}

export const HomePage = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [landingFeatures, setLandingFeatures] = useState<any[]>([]);

  // API dynamic contents
  const [mainContent, setMainContent] = useState<WebMainContent | null>(null);
  const [apiCards, setApiCards] = useState<WebCard[]>([]);
  const [activePath, setActivePath] = useState<WebPathContent | null>(null);

  useEffect(() => {
    getRestaurants().then(setRestaurants);
    
    // Load dynamic homepage cards
    setLandingFeatures(getLandingFeatures());
    
    const handleStorageChange = () => {
      setLandingFeatures(getLandingFeatures());
    };
    window.addEventListener('storage', handleStorageChange);

    // Fetch dynamic content from endpoints
    fetch('https://jeetk-api.runasp.net/api/WebsiteContent/main-content')
      .then(res => {
        if (!res.ok) throw new Error('API request failed');
        return res.json();
      })
      .then((data: WebMainContent) => setMainContent(data))
      .catch(err => console.error("Error fetching main-content:", err));

    fetch('https://jeetk-api.runasp.net/api/WebsiteContent/cards')
      .then(res => {
        if (!res.ok) throw new Error('API request failed');
        return res.json();
      })
      .then((data: WebCard[]) => setApiCards(data))
      .catch(err => console.error("Error fetching cards:", err));

    fetch('https://jeetk-api.runasp.net/api/WebsiteContent/path')
      .then(res => {
        if (!res.ok) throw new Error('API request failed');
        return res.json();
      })
      .then((data: WebPathContent) => setActivePath(data))
      .catch(err => console.error("Error fetching path:", err));

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const filteredRestaurants = restaurants.filter(res => 
    res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const askAi = async (prompt: string) => {
    setIsAiLoading(true);
    setShowAiModal(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `You are a helpful food delivery assistant. Suggest 2-3 specific dishes or restaurant types from our platform (Burgers, Sushi, Pizza, Salads, Desserts) based on this user request: "${prompt}". Keep it concise and appetizing. Respond in ${language === 'ar' ? 'Arabic' : 'English'}.`
      });
      const text = response.text;
      setAiResponse(text || (language === 'ar' ? 'عذراً، لم أتمكن من العثور على شيء حالياً.' : 'Sorry, I couldn\'t think of anything right now.'));
    } catch (error) {
      console.error("AI Error:", error);
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
            className="w-full ps-12 pe-4 py-4 bg-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-start"
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
        <section className="py-20 md:py-24 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full flex flex-col"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 hero-gradient-text">
              {mainContent ? mainContent.title : t.home.heroTitle}
            </h1>
            <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              {mainContent ? mainContent.subtitle : t.home.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/25 cursor-pointer">
                {language === 'ar' ? 'اطلب الآن' : 'Order Now'}
              </button>
              <Link to="/routes" className="bg-white text-black border border-zinc-200 px-10 py-4 rounded-full font-bold hover:bg-zinc-50 transition-colors">
                {t.nav.deliveryPrices}
              </Link>
            </div>

            {/* Custom hero background banner derived from mainContent API imageUrl */}
            {mainContent?.imageUrl && (
              <div className="mt-12 max-w-5xl w-full mx-auto rounded-3xl overflow-hidden shadow-2xl border border-zinc-150 relative group bg-neutral-50 aspect-[21/9]">
                <img 
                  src={mainContent.imageUrl} 
                  onError={(e) => {
                    // Fallback to high-quality unsplash food collage background if local image is unavailable
                    e.currentTarget.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80";
                  }}
                  alt={mainContent.title}
                  className="w-full h-full object-cover group-hover:scale-101 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col md:flex-row items-start md:items-end p-6 md:p-10 justify-between text-start gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-white/70 uppercase">
                      {language === 'ar' ? 'الواجهة مدمجة عبر ملقم جيتك' : 'API SYNCHRONIZED INTERFACE'}
                    </span>
                    <h4 className="text-lg md:text-3xl font-extrabold text-white mt-1">
                      {mainContent.title}
                    </h4>
                  </div>
                  {mainContent.lastUpdated && (
                    <span className="text-[9px] font-mono text-white/60 bg-white/15 px-3 py-1.5 rounded-lg backdrop-blur-xs select-none border border-white/10">
                      Sync: {new Date(mainContent.lastUpdated).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 border-t border-zinc-100">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {language === 'ar' ? 'لماذا تختار جيتك؟' : 'Why choose Jeetk?'}
          </h2>
          <p className="text-zinc-500">
            {language === 'ar' 
              ? 'جرّب الجيل القادم من خدمات توصيل الأطعمة السريعة والمبتكرة.' 
              : 'Experience the next generation of food delivery.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {apiCards && apiCards.length > 0 ? (
            apiCards.map((card) => {
              const cardNormalized = (card.icon || '').toLowerCase();
              let CompIcon = Sparkles;
              let textAccent = 'group-hover:text-amber-500';
              
              if (cardNormalized.includes('delivery')) {
                CompIcon = Truck;
                textAccent = 'group-hover:text-rose-500';
              } else if (cardNormalized.includes('restaurant')) {
                CompIcon = Utensils;
                textAccent = 'group-hover:text-amber-500';
              } else if (cardNormalized.includes('discount') || cardNormalized.includes('deal')) {
                CompIcon = Percent;
                textAccent = 'group-hover:text-emerald-500';
              }

              return (
                <div 
                  key={card.id}
                  className="p-10 rounded-3xl border border-zinc-100 bg-white hover:border-primary hover:-translate-y-2 transition-all duration-300 group text-start flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                      <CompIcon className={`w-7 h-7 text-zinc-400 ${textAccent} transition-colors`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                    <p className="text-zinc-500 leading-relaxed text-sm">{card.subtitle}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                    <span>ID: #{card.id}</span>
                    <span className="uppercase text-[8px] tracking-wider font-extrabold text-primary">Active Node</span>
                  </div>
                </div>
              );
            })
          ) : (
            landingFeatures.map((feature, i) => {
              const IconComponent = ICON_MAP[feature.icon] || Sparkles;
              const cardTitle = language === 'ar' ? feature.titleAr || feature.titleEn : feature.titleEn || feature.titleAr;
              const cardDesc = language === 'ar' ? feature.descAr || feature.descEn : feature.descEn || feature.descAr;
              return (
                <div key={feature.id || i} className="p-10 rounded-3xl border border-zinc-100 bg-white hover:border-primary hover:-translate-y-2 transition-all duration-300 group text-start">
                  <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                    <IconComponent className="w-7 h-7 text-zinc-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{cardTitle}</h3>
                  <p className="text-zinc-500 leading-relaxed text-sm">{cardDesc}</p>
                </div>
              );
            })
          )}
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
