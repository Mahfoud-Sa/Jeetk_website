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
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail('');
    setIsLoading(true);
    
    try {
      await login({ email, password });
    } catch (err: any) {
      console.warn("Login error:", err);
      if (err.message && err.message.startsWith("delivery_unverified:")) {
        const unverified = err.message.substring("delivery_unverified:".length);
        setUnverifiedEmail(unverified);
        setError(
          language === 'ar'
            ? 'يجب عليك تأكيد حسابك اولا لتتمكن من تسجيل الدخول'
            : 'You must verify your account first to be able to log in.'
        );
      } else {
        const errorMsg = err.response?.data?.message || err.message || (language === 'ar' ? 'فشل تسجيل الدخول.' : 'Login failed.');
        setError(errorMsg);
      }
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
            <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex flex-col gap-3 text-start">
              <p className="text-red-700 text-sm font-bold leading-relaxed">{error}</p>
              
              {unverifiedEmail && (
                <div className="mt-1 space-y-2 border-t border-red-200/50 pt-2">
                  <p className="text-xs font-bold text-red-800">
                    {language === 'ar' ? 'تأكيد الحساب عبر:' : 'Verify account via:'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}&channel=email`}
                      className="bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 text-center py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </Link>
                    <Link
                      to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}&channel=whatsapp`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse" />
                      {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                    </Link>
                    <Link
                      to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}&channel=sms`}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                      {language === 'ar' ? 'رسالة نصية (SMS)' : 'SMS'}
                    </Link>
                    <Link
                      to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}&channel=call`}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                      {language === 'ar' ? 'مكالمة هاتفية مباشرة' : 'Direct Call'}
                    </Link>
                  </div>
                </div>
              )}
            </div>
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
