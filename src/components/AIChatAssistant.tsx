import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, Sparkles, User, Loader2 } from 'lucide-react';
import OpenAI from 'openai';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatAssistant = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: language === 'ar' 
        ? 'مرحباً! أنا مساعد Jeetk الذكي (مدعوم بـ ChatGPT). كيف يمكنني مساعدتك في العثور على وجبتك المثالية اليوم؟' 
        : 'Hi! I\'m Jeetk AI assistant (Powered by ChatGPT). How can I help you find your perfect meal today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      setMessages(prev => [...prev, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: language === 'ar' 
          ? 'عذراً، لم يتم ضبط مفتاح API الخاص بـ OpenAI. يرجى إضافته في إعدادات البيئة (VITE_OPENAI_API_KEY).' 
          : 'Sorry, OpenAI API Key is not configured. Please add VITE_OPENAI_API_KEY to your environment variables.' 
        }
      ]);
      setInput('');
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Warning: Client-side keys are vulnerable
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Using 4o for better performance
        messages: [
          {
            role: "system",
            content: `You are Jeetk AI assistant, a helpful and friendly food delivery expert for the Jeetk platform in Yemen. 
            Your goals:
            1. Help users discover food (Burgers, Sushi, Pizza, Salads, Desserts, Traditional Yemeni food).
            2. Assist with platform questions (delivery prices, locations, how to order).
            3. Be concise, appetising, and professional.
            4. Respond in the user's language (${language === 'ar' ? 'Arabic' : 'English'}).
            5. If asked about prices, mention they vary by location but are generally competitive.
            6. Use emojis occasionally to be friendly 🍔🍕🛵.`
          },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage }
        ],
      });

      const responseText = response.choices[0].message.content;

      if (responseText) {
        setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      }
    } catch (error: any) {
      console.error("OpenAI Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: language === 'ar' 
          ? `عذراً، حدث خطأ: ${error.message || 'خطأ في الاتصال بالخادم'}` 
          : `Sorry, an error occurred: ${error.message || 'Connection error'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-zinc-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Jeetk AI Assistant</h3>
                  <p className="text-[10px] text-zinc-400">Online & ready to help</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50"
            >
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-black' : 'bg-white border border-zinc-200'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-black" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-white border border-zinc-100 shadow-sm rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 p-3 bg-white border border-zinc-100 shadow-sm rounded-2xl rounded-tl-none items-center">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    <span className="text-xs text-zinc-400">{language === 'ar' ? 'جاري التفكير...' : 'Thinking...'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-zinc-100">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={language === 'ar' ? 'اسأل أي شيء...' : "Ask me anything..."}
                  className="w-full pl-4 pr-12 py-3 bg-zinc-100 rounded-2xl focus:outline-none text-sm"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-black text-white rounded-2xl shadow-xl shadow-black/20 flex items-center justify-center hover:bg-zinc-900 transition-colors relative group"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute right-full mr-4 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-zinc-100">
            {language === 'ar' ? 'تحدث مع مساعدنا الذكي' : 'Talk to AI Assistant'}
          </span>
        )}
      </motion.button>
    </div>
  );
};
