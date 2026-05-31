import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, KeyRound, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Inbox, HelpCircle, Timer } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { forgotPassword } from '../services/authService';
import { useToast } from '../context/ToastContext';

export const ForgotPasswordPage = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const isRtl = language === 'ar';

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendResetLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      // Promptly invoke the forgot-password background api endpoint
      await forgotPassword(email);
    } catch (err: any) {
      console.warn("Forgot password API warning:", err);
      // UX Security Rule: Do NOT reveal whether the email exists.
      // Therefore, we do not throw error for 404/not found. We only show error for serious network/server failures if critical.
      // But according to "Always show generic success message after email submission", we will directly transition to success anyway.
    } finally {
      // Transition to screen 2, showing the generic secure message
      setSubmitted(true);
      setIsLoading(false);
      setCountdown(60); // 1-minute rate limit cooldown
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-black/5 border border-black/5 p-8"
      >
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="forgot-form"
              initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                  <KeyRound className="w-8 h-8 text-red-600 animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">
                  {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </h1>
                <p className="text-zinc-500 text-sm leading-relaxed px-2">
                  {isRtl 
                    ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.' 
                    : 'Enter your email and we will send you a password reset link.'}
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-start gap-3 border border-red-100 text-start">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSendResetLink} className="space-y-6">
                <div className="space-y-2 text-start">
                  <label className="text-sm font-semibold px-1 text-zinc-700">
                    {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400`} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full h-12 bg-zinc-50 border border-black/5 rounded-2xl ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm`}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-12 bg-black hover:bg-zinc-900 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-zinc-200"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {isRtl ? 'جاري الإرسال...' : 'Sending Link...'}
                    </>
                  ) : (
                    isRtl ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="forgot-success"
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 text-start"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-100">
                  <Inbox className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-2 text-center">
                  {isRtl ? 'تحقق من بريدك الإلكتروني' : 'Check your inbox'}
                </h1>
              </div>

              <div className="p-5 bg-green-50 text-green-800 rounded-3xl border border-green-100 space-y-3">
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600 mt-0.5" />
                  <p className="text-sm leading-relaxed font-medium">
                    {isRtl 
                      ? 'إذا كان هذا البريد الإلكتروني مسجلاً لدينا، فستتلقى رابطاً لإعادة تعيين كلمة المرور قريباً.' 
                      : 'If this email is registered, you will receive a password reset link shortly.'}
                  </p>
                </div>
              </div>

              <div className="p-5 bg-zinc-50 border border-black/5 rounded-3xl space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-zinc-400" />
                  {isRtl ? 'إرشادات هامة لمساعدتك' : 'Important Tips'}
                </h3>
                <ul className="space-y-2 text-sm text-zinc-600 list-disc list-inside pl-1 pr-1 font-medium leading-relaxed">
                  <li>
                    {isRtl 
                      ? 'تفقد صندوق الوارد في بريدك الإلكتروني.' 
                      : 'Check your email inbox.'}
                  </li>
                  <li>
                    {isRtl 
                      ? 'قد يستغرق وصول رابط إعادة التعيين بضع دقائق.' 
                      : 'The reset link may take a few minutes to arrive.'}
                  </li>
                  <li>
                    {isRtl 
                      ? 'إذا لم تجده، يرجى التحقق من مجلد الرسائل غير المرغوب فيها (Spam/Junk).' 
                      : "If you don’t see it, check your spam or junk folder."}
                  </li>
                </ul>
              </div>

              {countdown > 0 ? (
                <div className="w-full h-12 bg-zinc-50 border border-black/5 text-zinc-500 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold select-none">
                  <Timer className="w-4 h-4 animate-spin text-zinc-400" />
                  <span>
                    {isRtl 
                      ? `يمكنك إعادة إرسال الرابط بعد ${countdown} ثانية` 
                      : `You can resend the link in ${countdown}s`}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full h-12 bg-zinc-900 hover:bg-black text-white rounded-2xl font-bold transition-all flex items-center justify-center text-sm shadow-md"
                >
                  {isRtl ? 'إعادة إرسال الرابط' : 'Resend Link'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-black/5 text-center">
          <Link 
            to="/login" 
            className="text-sm text-zinc-500 hover:text-black transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {isRtl ? 'العودة لتسجيل الدخول' : t.auth.backToLogin}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
