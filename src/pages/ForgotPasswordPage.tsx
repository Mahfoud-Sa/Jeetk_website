import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Key, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { forgotPassword, resetPassword } from '../services/authService';

export const ForgotPasswordPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await forgotPassword(email);
      setStep(2);
      setSuccess(t.auth.otpSent);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.message || err.message || t.auth.emailNotfound);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t.auth.passwordsDoNotMatch);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await resetPassword(email, otp, newPassword);
      setSuccess(t.auth.passwordSuccess);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.message || err.message || t.auth.passwordError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-black/5 border border-black/5 p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            {step === 1 ? t.auth.forgotPassword : t.auth.resetPassword}
          </h1>
          <p className="text-zinc-500 text-sm">
            {step === 1 
              ? (language === 'ar' ? 'أدخل بريدك الإلكتروني وسنرسل لك رمزاً لإعادة تعيين كلمة المرور' : 'Enter your email and we will send you a code to reset your password')
              : (language === 'ar' ? 'أدخل الرمز المرسل وكلمة المرور الجديدة' : 'Enter the code sent and your new password')}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-green-50 text-green-600 rounded-2xl text-sm flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium px-1">{t.dashboard.userEmail}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-zinc-50 border border-black/5 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder={t.auth.emailPlaceholder}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary text-white rounded-2xl font-bold hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? t.common.loading : t.auth.sendOtp}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium px-1">{t.auth.enterOtp}</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full h-12 bg-zinc-50 border border-black/5 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder={t.auth.otpPlaceholder}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium px-1">{t.auth.newPassword}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-12 bg-zinc-50 border border-black/5 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium px-1">{t.auth.confirmPassword}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 bg-zinc-50 border border-black/5 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary text-white rounded-2xl font-bold hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? t.common.loading : t.auth.resetPassword}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-black/5 text-center">
          <Link 
            to="/login" 
            className="text-sm text-zinc-500 hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            {t.auth.backToLogin}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
