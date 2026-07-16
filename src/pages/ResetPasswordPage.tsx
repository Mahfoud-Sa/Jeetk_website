import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Check, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { resetPassword } from '../services/authService';
import { useToast } from '../context/ToastContext';

export const ResetPasswordPage = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract query parameters
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [hasStartedRedirect, setHasStartedRedirect] = useState(false);

  // Validation rules states
  const isMinLength = newPassword.length >= 6;
  const hasNumber = /\d/.test(newPassword);
  const hasLetter = /[a-zA-Z]/.test(newPassword) || /[\u0600-\u06FF]/.test(newPassword); // supports arabic chars too as letters
  const passwordsMatch = newPassword && newPassword === confirmPassword;
  
  const isFormValid = isMinLength && hasNumber && hasLetter && passwordsMatch;

  const isRtl = language === 'ar';

  // Link validation
  const isValidLink = !!(email && token);

  // Auto redirect countdown
  useEffect(() => {
    let interval: any;
    if (success && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (success && countdown === 0 && !hasStartedRedirect) {
      setHasStartedRedirect(true);
      navigate('/login');
    }
    return () => clearInterval(interval);
  }, [success, countdown, navigate, hasStartedRedirect]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidLink) {
      setError(
        isRtl 
          ? 'المعلومات المطلوبة لإعادة التعيين مفقودة أو منتهية الصلاحية.' 
          : 'The required information for reset is missing or expired.'
      );
      return;
    }

    if (!isFormValid) {
      setError(
        isRtl 
          ? 'الرجاء التحقق من شروط كلمة المرور وتطابق الحقلين.' 
          : 'Please make sure password requirements are met and passwords match.'
      );
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (token.startsWith('mock-') || token === '123456' || token === '654321') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccess(
          isRtl 
            ? 'تم إعادة تعيين كلمة المرور الخاصة بك بنجاح (بيئة تجريبية).' 
            : 'Your password has been successfully reset (Sandbox simulation).'
        );
        showToast(
          isRtl 
            ? 'تم تغيير كلمة المرور بنجاح (تجريبي)!' 
            : 'Password reset successfully (Sandbox)!', 
          'success'
        );
      } else {
        await resetPassword(email, token, newPassword);
        setSuccess(
          isRtl 
            ? 'تم إعادة تعيين كلمة المرور الخاصة بك بنجاح.' 
            : 'Your password has been successfully reset.'
        );
        showToast(
          isRtl 
            ? 'تم تغيير كلمة المرور بنجاح!' 
            : 'Password reset successfully!', 
          'success'
        );
      }
    } catch (err: any) {
      console.error("Reset password submission error:", err);
      // UX Security Principle: Avoid exposing raw stack/system DB detail. Show custom helper message
      const status = err?.response?.status;
      if (status === 400 || status === 401) {
        setError(
          isRtl 
            ? 'رابط إعادة التعيين هذا لم يعد صالحاً. يرجى طلب رابط جديد.' 
            : 'This reset link is no longer valid. Please request a new one.'
        );
      } else {
        setError(
          err?.response?.data?.message || err?.message || 
          (isRtl 
            ? 'حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.' 
            : 'A connection error occurred. Please try again later.')
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-black/5 border border-black/5 p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            {isRtl ? 'تعيين كلمة مرور جديدة' : 'Reset Password'}
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed px-2">
            {isRtl 
              ? 'الرجاء إدخال والتأكيد على كلمة المرور الجديدة للحساب.' 
              : 'Please enter and confirm your new account password.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isValidLink && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center space-y-4"
            >
              <AlertCircle className="w-10 h-10 mx-auto text-red-500 animate-bounce" />
              <div className="space-y-1">
                <h3 className="font-bold">
                  {isRtl ? 'رابط غير صالح أو منتهي الصلاحية' : 'Invalid or expired reset link'}
                </h3>
                <p className="text-xs opacity-90 leading-relaxed">
                  {isRtl 
                    ? 'رابط إعادة التعيين هذا غير مكتمل أو انتهت صلاحيته. يرجى طلب رابط جديد من صفحة نسيت كلمة المرور.' 
                    : 'This reset link is incomplete or has expired. Please request a new one from the forgot password page.'}
                </p>
              </div>
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all"
              >
                {isRtl ? 'طلب رابط جديد' : 'Request New Link'}
              </Link>
            </motion.div>
          )}

          {isValidLink && error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-start gap-3 border border-red-100 text-start"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
              <span>{error}</span>
            </motion.div>
          )}

          {isValidLink && success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-6 bg-green-50 text-green-800 rounded-2xl border border-green-100 text-center space-y-4"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-lg">
                  {isRtl ? 'تم تغيير كلمة المرور!' : 'Password Changed!'}
                </h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  {success}
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  {isRtl 
                    ? `سيتم تحويلك لصفحة تسجيل الدخول تلقائياً خلال ${countdown} ثوانٍ...` 
                    : `Redirecting you to login automatically in ${countdown}s...`}
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full h-12 bg-black hover:bg-zinc-900 text-white rounded-2xl font-bold text-sm transition-all"
              >
                {isRtl ? 'الانتقال لتسجيل الدخول' : 'Go to Login'}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {isValidLink && !success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-start">
              <label className="text-sm font-semibold px-1 text-zinc-700">
                {isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400`} />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full h-12 bg-zinc-50 border border-black/5 rounded-2xl ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm`}
                  placeholder="••••••••"
                />
              </div>

              {/* Password strength indicators */}
              <div className="mt-3 p-3 bg-zinc-50 border border-black/5 rounded-2xl space-y-2 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${isMinLength ? 'bg-green-500/10 border-green-500 text-green-600' : 'border-zinc-300'}`}>
                    {isMinLength && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{isRtl ? 'على الأقل 6 خانات' : 'At least 6 characters'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${hasNumber ? 'bg-green-500/10 border-green-500 text-green-600' : 'border-zinc-300'}`}>
                    {hasNumber && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{isRtl ? 'يحتوي على رقم واحد على الأقل' : 'At least one number'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${hasLetter ? 'bg-green-500/10 border-green-500 text-green-600' : 'border-zinc-300'}`}>
                    {hasLetter && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{isRtl ? 'يحتوي على حرف واحد على الأقل' : 'At least one letter'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-start">
              <label className="text-sm font-semibold px-1 text-zinc-700">
                {isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
              </label>
              <div className="relative">
                <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400`} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full h-12 bg-zinc-50 border border-black/5 rounded-2xl ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm`}
                  placeholder="••••••••"
                />
              </div>

              {confirmPassword && (
                <div className="text-xs transition-all mt-1">
                  {passwordsMatch ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {isRtl ? 'كلمتا المرور متطابقتان' : 'Passwords match'}
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" />
                      {isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="w-full h-12 bg-black hover:bg-zinc-900 text-white rounded-2xl font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-md"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {isRtl ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                isRtl ? 'إعادة تعيين كلمة المرور' : 'Reset Password'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-black/5 text-center">
          <Link 
            to="/login" 
            className="text-sm text-zinc-500 hover:text-black transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {isRtl ? 'العودة إلى صفحة الدخول' : 'Back to Login'}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
