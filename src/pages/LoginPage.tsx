import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { t, language } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login({ email, password });
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
              <Link 
                to="/forgot-password"
                className="text-xs font-bold text-primary hover:underline"
              >
                {t.auth.forgotPassword}
              </Link>
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
            <Link to="/register-delivery" className="text-primary font-bold hover:underline">
              {language === 'ar' ? 'سجل كمندوب توصيل' : 'Register as Delivery'}
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
