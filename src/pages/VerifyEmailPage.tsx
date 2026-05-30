import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { verifyEmail, sendEmailCode } from '../services/authService';
import { useToast } from '../context/ToastContext';

export const VerifyEmailPage = () => {
  const { language } = useLanguage();
  const { user, updateVerificationStatus } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Prefill from query parameter OR logged in user's email, otherwise empty
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get('email') || user?.email || '';
    setEmail(emailParam);
  }, [searchParams, user]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email) {
      setError(language === 'ar' ? 'الرجاء إدخال البريد الإلكتروني أولاً' : 'Please enter your email first');
      return;
    }
    setIsSendingCode(true);
    setError('');
    setSuccess('');

    try {
      await sendEmailCode(email);
      setSuccess(
        language === 'ar' 
          ? 'تم إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني.' 
          : 'Verification code sent successfully to your email.'
      );
      setCountdown(60); // 1-minute rate-limit countdown
      showToast(
        language === 'ar' 
          ? 'تم إرسال الرمز بنجاح!' 
          : 'Verification code sent successfully!', 
        'success'
      );
    } catch (err: any) {
      console.error("Send email code error:", err);
      setError(err?.response?.data?.message || err?.message || (language === 'ar' ? 'حدث خطأ أثناء إرسال الرمز' : 'An error occurred while sending the code'));
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      setError(language === 'ar' ? 'الرجاء تعبئة جميع الحقول' : 'Please fill all fields');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    setSuccess('');

    try {
      await verifyEmail(email, code);
      setSuccess(
        language === 'ar' 
          ? 'تهانينا! تم تأكيد بريدك الإلكتروني بنجاح.' 
          : 'Congratulations! Your email has been verified successfully.'
      );
      showToast(
        language === 'ar' 
          ? 'تم التحقق بنجاح!' 
          : 'Email verified successfully!', 
        'success'
      );

      // If the verified email matches the currently logged in user, update state & storage
      if (user && user.email.toLowerCase() === email.toLowerCase()) {
        updateVerificationStatus(true);
      }

      // Smooth redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch (err: any) {
      console.error("Verify email error:", err);
      setError(err?.response?.data?.message || err?.message || (language === 'ar' ? 'رمز التحقق غير صحيح أو منتهي الصلاحية' : 'Verification code is invalid or expired'));
    } finally {
      setIsVerifying(false);
    }
  };

  const isRtl = language === 'ar';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-black/5 border border-black/5 p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <ShieldCheck className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            {isRtl ? 'تأكيد البريد الإلكتروني' : 'Verify Your Email'}
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed px-2">
            {isRtl 
              ? 'الرجاء إدخال البريد الإلكتروني وطلب رمز التحقق لتفعيل الحساب' 
              : 'Please enter your email and request a verification code to activate your account.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-start gap-3 border border-red-100 text-start"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl text-sm flex items-start gap-3 border border-green-100 text-start"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleVerify} className="space-y-6">
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

          <div className="space-y-2 text-start">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-semibold text-zinc-700">
                {isRtl ? 'رمز التحقق (OTP)' : 'Verification Code (OTP)'}
              </label>
              
              <button
                type="button"
                disabled={isSendingCode || countdown > 0}
                onClick={handleSendCode}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingCode && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {countdown > 0 
                  ? `${isRtl ? 'أعد الإرسال خلال' : 'Resend in'} ${countdown}s` 
                  : (isRtl ? 'طلب الرمز' : 'Request Code')}
              </button>
            </div>
            
            <div className="relative">
              <ShieldCheck className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400`} />
              <input
                type="text"
                required
                maxLength={10}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full h-12 bg-zinc-50 border border-black/5 rounded-2xl ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm tracking-widest font-mono font-bold text-center`}
                placeholder={isRtl ? 'أدخل الرمز' : 'Enter code'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying || !code}
            className="w-full h-12 bg-black hover:bg-zinc-900 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-zinc-200"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {isRtl ? 'جاري التحقق...' : 'Verifying...'}
              </>
            ) : (
              isRtl ? 'تأكيد الحساب' : 'Verify Account'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-black/5 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-zinc-500 hover:text-black transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            {isRtl ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
