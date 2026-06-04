import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DeliveryWelcomePage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const isAr = language === 'ar';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-2xl w-full bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden text-center relative"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500" />
        
        <div className="p-8 sm:p-12">
          {/* Animated illustration circle */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </motion.div>

          {/* Sparkles / Badges */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{isAr ? 'حسابك جاهز الآن' : 'Account Ready'}</span>
          </div>

          {/* Main Welcome Message */}
          <div className="space-y-6 text-zinc-800">
            {isAr ? (
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 leading-tight">
                  مرحباً وأهلاً وسهلاً بك في موقع جيتك لتوصيل الطلبات
                </h1>
                <div className="w-16 h-1 bg-zinc-100 mx-auto rounded" />
                <p className="text-lg sm:text-xl text-zinc-600 font-medium">
                  سعداء بانضمامك لفريقنا ...
                </p>
                <p className="text-base sm:text-lg text-zinc-500 font-medium italic">
                  نأمل أن تكون عند حسن الظن فيك ...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight tracking-tight">
                  Welcome to Jeetk for Orders Delivery!
                </h1>
                <div className="w-16 h-1 bg-zinc-100 mx-auto rounded" />
                <p className="text-lg sm:text-xl text-zinc-600 font-medium">
                  We are extremely pleased to have you join our team...
                </p>
                <p className="text-base sm:text-lg text-zinc-500 font-medium italic">
                  We hope to live up to your best expectations and trust...
                </p>
              </div>
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-zinc-100">
            <p className="text-zinc-400 text-sm mb-6">
              {isAr
                ? 'يمكنك الآن تسجيل الدخول والبدء باستقبال وتوجيه الطلبات.'
                : 'You can now log in to begin accepting and delivering orders.'}
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10"
            >
              <span>{isAr ? 'الذهاب لتسجيل الدخول' : 'Go to Login'}</span>
              {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5 animate-bounce-horizontal" />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
