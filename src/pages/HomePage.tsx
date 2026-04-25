import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, X, Clock, Navigation, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { RESTAURANTS } from '../constants';
import { RestaurantCard } from '../components/RestaurantCard';
import { GoogleGenAI } from "@google/genai";

export const HomePage = () => {
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
            <div key={i} className="p-10 rounded-3xl border border-zinc-100 bg-white hover:border-primary hover:-translate-y-2 transition-all duration-300 group text-start">
              <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-7 h-7 text-zinc-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
            </div>
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
