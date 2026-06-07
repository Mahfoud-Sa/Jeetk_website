import { useState, FormEvent, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, Trash2, Plus, Eye, EyeOff, CheckCircle2, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { registerDelivery, DeliveryRegisterRequest } from '../services/authService';

export const COUNTRIES = [
  { code: '+967', flag: '🇾🇪', labelAr: 'اليمن', labelEn: 'Yemen' },
  { code: '+966', flag: '🇸🇦', labelAr: 'السعودية', labelEn: 'Saudi Arabia' },
  { code: '+971', flag: '🇦🇪', labelAr: 'الإمارات', labelEn: 'UAE' },
  { code: '+968', flag: '🇴🇲', labelAr: 'عُمان', labelEn: 'Oman' },
  { code: '+974', flag: '🇶🇦', labelAr: 'قطر', labelEn: 'Qatar' },
  { code: '+965', flag: '🇰🇼', labelAr: 'الكويت', labelEn: 'Kuwait' },
  { code: '+973', flag: '🇧🇭', labelAr: 'البحرين', labelEn: 'Bahrain' },
  { code: '+20', flag: '🇪🇬', labelAr: 'مصر', labelEn: 'Egypt' },
  { code: '+962', flag: '🇯🇴', labelAr: 'الأردن', labelEn: 'Jordan' },
];

export const formatPhoneNumber = (num: string): string => {
  if (!num) return '';
  // Strip all characters except digits and '+'
  let cleaned = num.replace(/[^\d+]/g, '');
  
  if (!cleaned) return '';

  // Replace double zeros at the start with '+'
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // If it starts with a '+' we trust it and return
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If it starts with '967' (Yemen) and has 12 digits, convert to '+967...'
  if (cleaned.startsWith('967') && cleaned.length === 12) {
    return '+' + cleaned;
  }

  // If it starts with '0' followed by 9 digits (e.g., 0770266408), remove leading '0' and prefix '+967'
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '+967' + cleaned.slice(1);
  }

  // If it's a 9-digit number starting with 7 (standard Yemeni mobile length)
  if (cleaned.length === 9 && (cleaned.startsWith('77') || cleaned.startsWith('73') || cleaned.startsWith('71') || cleaned.startsWith('70') || cleaned.startsWith('78'))) {
    return '+967' + cleaned;
  }

  // Default: if it has 10 or more digits, prepend '+'
  if (cleaned.length >= 10 && !cleaned.startsWith('+')) {
    return '+' + cleaned;
  }

  return cleaned;
};

export const combineAndFormatPhone = (countryCode: string, num: string): string => {
  if (!num) return '';
  // Strip all non-digit characters from the input
  let cleaned = num.replace(/[^\d]/g, '');

  // Strip leading zero(s)
  while (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  // If the user accidentally typed the country code digits (e.g. 967 or 966) at the beginning, strip them
  const countryDigits = countryCode.replace('+', '');
  if (cleaned.startsWith(countryDigits)) {
    cleaned = cleaned.slice(countryDigits.length);
  }

  return countryCode + cleaned;
};

export const DeliveryRegistrationPage = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState<DeliveryRegisterRequest>({
    name: '',
    birthDate: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    username: '',
    phoneNumbers: [{ number: '', type: 'Primary' }]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneCountryCodes, setPhoneCountryCodes] = useState<string[]>(['+967']);
  const navigate = useNavigate();

  const updatePhoneNumber = useCallback((index: number, field: 'number' | 'type', value: string) => {
    setFormData(prev => {
      const newPhoneNumbers = [...prev.phoneNumbers];
      newPhoneNumbers[index] = {
        ...newPhoneNumbers[index],
        [field]: value
      };
      
      const update: Partial<DeliveryRegisterRequest> = { phoneNumbers: newPhoneNumbers };
      if (index === 0 && field === 'number') {
        update.phoneNumber = value;
      }
      return { ...prev, ...update };
    });
  }, []);

  const addPhoneNumber = () => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, { number: '', type: 'Secondary' }]
    }));
    setPhoneCountryCodes(prev => [...prev, '+967']);
  };

  const removePhoneNumber = (index: number) => {
    if (formData.phoneNumbers.length > 1) {
      setFormData(prev => ({
        ...prev,
        phoneNumbers: prev.phoneNumbers.filter((_, i) => i !== index)
      }));
      setPhoneCountryCodes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== confirmPassword) {
      setError(language === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }

    // Ensure at least one phone number with a local component exists
    const hasValidPhone = formData.phoneNumbers.some(p => {
      if (!p.number) return false;
      const digitsOnly = p.number.replace(/[^\d]/g, '');
      // If we only have country code (e.g. 967 or 966, which is 3 digits), it's not valid
      return digitsOnly.length > 4;
    });

    if (!hasValidPhone) {
      setError(language === 'ar' ? 'يجب إدخال رقم هاتف هاتف واحد على الأقل للتواصل.' : 'At least one contact phone number is required.');
      return;
    }

    setIsLoading(true);
    
    try {
      const formattedPrimaryPhone = formatPhoneNumber(formData.phoneNumber);
      const formattedPhoneNumbers = formData.phoneNumbers.map(p => ({
        ...p,
        number: formatPhoneNumber(p.number)
      }));

      const payload = {
        ...formData,
        phoneNumber: formattedPrimaryPhone,
        phoneNumbers: formattedPhoneNumbers,
        username: formData.email, // Automatically use email as username
        birthDate: new Date(formData.birthDate).toISOString()
      };
      await registerDelivery(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/delivery-welcome');
      }, 2500);
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMsg = err.response?.data?.message || err.message || (language === 'ar' ? 'فشل التسجيل.' : 'Registration failed.');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {language === 'ar' ? 'تم التسجيل بنجاح!' : 'Registration Successful!'}
          </h1>
          <p className="text-zinc-500 mb-6">
            {language === 'ar' 
              ? 'تم إنشاء حسابك بنجاح. سيتم توجيهك إلى صفحة الترحيب والملاحظات...' 
              : 'Your account has been created successfully. Redirecting to the welcome page...'}
          </p>
          <button 
            onClick={() => navigate('/delivery-welcome')}
            className="w-full bg-black text-white py-4 rounded-xl font-bold"
          >
            {language === 'ar' ? 'عرض صفحة الملاحظات' : 'View Notes Page'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">
            {language === 'ar' ? 'التسجيل كمندوب توصيل' : 'Register as Delivery'}
          </h1>
          <p className="text-zinc-500 text-sm">
            {language === 'ar' 
              ? 'انضم إلى فريقنا وابدأ في كسب المال اليوم' 
              : 'Join our team and start earning today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1.5 ml-1 text-start">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-start"
                placeholder={language === 'ar' ? 'أدخل اسمك الكامل مثلاً: أحمد محمد علي' : 'Enter your full name e.g., Ahmad Mohammad Ali'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <p className="text-zinc-400 text-xs mt-1 ml-1 text-start">
                {language === 'ar' ? 'ملاحظة: يرجى كتابة اسمك الثلاثي/الرباعي كما في الهوية.' : 'Note: Please write your full name as on your ID card.'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 ml-1 text-start">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <p className="text-zinc-400 text-xs mt-1 ml-1 text-start">
                {language === 'ar' ? 'بريدك الإلكتروني المستخدم لتسجيل الدخول والاشعارات.' : 'Your email for logging in and notifications.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1.5 ml-1 text-start">{language === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-start"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 ml-1 text-start">{language === 'ar' ? 'العنوان الحالي' : 'Current Address'}</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-start"
                placeholder={language === 'ar' ? 'المحافظة - المديرية - الشارع' : 'Governorate - District - Street'}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
              <p className="text-zinc-400 text-xs mt-1 ml-1 text-start">
                {language === 'ar' ? 'مثال: صنعاء - حدة - جولة الرويشان' : 'e.g., Sanaa - Hadda - Ruwaishan Roundabout'}
              </p>
            </div>
          </div>

          <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-150 space-y-4">
            <label className="block text-base font-bold text-start text-zinc-800">{language === 'ar' ? 'أرقام هاتف للتواصل مع المندوب والتنسيق' : 'Contact Phone Numbers'}</label>
            <div className="space-y-5">
              {formData.phoneNumbers.map((phone, index) => {
                const currentCode = phoneCountryCodes[index] || '+967';
                const localValue = phone.number.startsWith(currentCode) 
                  ? phone.number.slice(currentCode.length) 
                  : phone.number;

                const quickTypesAr = ['أساسي', 'اتصال', 'واتساب', 'منزلي', 'عمل'];
                const quickTypesEn = ['Primary', 'Call', 'WhatsApp', 'Home', 'Work'];
                const chips = language === 'ar' ? quickTypesAr : quickTypesEn;

                return (
                  <div key={index} className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm space-y-4 text-start">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <span className="text-xs font-bold bg-zinc-100 text-zinc-600 px-3 py-1.5 rounded-lg">
                        {index === 0 
                          ? (language === 'ar' ? 'رقم الهاتف الأساسي (يفضل له واتساب)' : 'Primary Phone (WhatsApp preferred)') 
                          : (language === 'ar' ? `رقم هاتف إضافي #${index + 1}` : `Secondary Phone #${index + 1}`)}
                      </span>
                      {index > 0 && (
                        <button 
                          type="button" 
                          onClick={() => removePhoneNumber(index)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors font-bold"
                        >
                          <Trash2 className="w-4 h-4" />
                          {language === 'ar' ? 'حذف الرقم' : 'Remove'}
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Phone Number Field */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 block">
                          {language === 'ar' ? 'رقم الهاتف المتنقل' : 'Mobile Phone Number'}
                        </label>
                        <div className="flex gap-2">
                          {/* Country Code Picker */}
                          <div className="relative shrink-0">
                            <select
                              className={`h-full min-w-[95px] px-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-semibold cursor-pointer appearance-none ${language === 'ar' ? 'pl-8 pr-3' : 'pr-8 pl-3'}`}
                              value={currentCode}
                              onChange={(e) => {
                                const newCodes = [...phoneCountryCodes];
                                newCodes[index] = e.target.value;
                                setPhoneCountryCodes(newCodes);
                                
                                const combined = combineAndFormatPhone(e.target.value, localValue);
                                updatePhoneNumber(index, 'number', combined);
                              }}
                            >
                              {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.flag} {c.code}
                                </option>
                              ))}
                            </select>
                            <div className={`absolute inset-y-0 flex items-center pointer-events-none text-zinc-500 ${language === 'ar' ? 'left-2.5' : 'right-2.5'}`}>
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                              </svg>
                            </div>
                          </div>

                          {/* Local Phone input number */}
                          <input 
                            type="tel" 
                            className="flex-1 min-w-0 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-base font-semibold"
                            placeholder="770266408"
                            value={localValue}
                            onChange={(e) => {
                              const combined = combineAndFormatPhone(currentCode, e.target.value);
                              updatePhoneNumber(index, 'number', combined);
                            }}
                            onBlur={(e) => {
                              const combined = combineAndFormatPhone(currentCode, e.target.value);
                              updatePhoneNumber(index, 'number', combined);
                            }}
                            required
                          />
                        </div>

                        {phone.number && (
                          <div className="mt-2 flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 w-fit text-xs font-bold font-sans">
                            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                            {language === 'ar' 
                              ? `تنسيق الرقم المحفوظ للتوصيل: ${phone.number}` 
                              : `Formatted for database routing: ${phone.number}`}
                          </div>
                        )}
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          {index === 0 
                            ? (language === 'ar' ? 'ملاحظة: هذا الرقم سيستخدم لتلقي إشعارات رحلات واستلام الطلبات وتفعيل الحساب.' : 'Note: This number will receive routing alerts, trip sheets, and verification codes.') 
                            : (language === 'ar' ? 'رقم تواصل إضافي لتسهيل التنسيق عند تعذر الرد على الرقم الأساسي.' : 'Backup contact number if primary is unavailable.')}
                        </p>
                      </div>

                      {/* Phone Type input full width to make the placeholder and interactive chips super readable */}
                      <div className="space-y-3.5 border-t border-zinc-100 pt-3">
                        <label className="text-xs font-bold text-zinc-700 block">
                          {language === 'ar' 
                            ? 'تصنيف الرقم / نوع الاتصال والشبكة (مثال: اتصال وواتساب، واتساب فقط، مكالمات، عائلي، عمل)' 
                            : 'Label / Usage details (e.g., Call & WhatsApp, WhatsApp only, Calls only, Personal, Work)'}
                        </label>
                        
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-semibold text-zinc-800"
                          placeholder={language === 'ar' ? 'اكتب مثلاً: واتساب مكالمات، اتصال فقط، رقم البيت' : 'e.g., WhatsApp & Calls, or Calls only, Home number'}
                          value={phone.type}
                          onChange={(e) => updatePhoneNumber(index, 'type', e.target.value)}
                          required
                        />

                        {/* Elegant Chips to quickly select labels */}
                        <div className="space-y-1">
                          <span className="text-[11px] text-zinc-500 font-medium block">
                            {language === 'ar' ? 'توصية: اختر تصنيفاً سريعاً لتحديد نوع الرقم:' : 'Recommendation: Choose a quick label to classify this number:'}
                          </span>
                          <div className="flex flex-wrap gap-2 pt-1 font-sans">
                            {chips.map((chip) => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => updatePhoneNumber(index, 'type', chip)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                  phone.type === chip
                                    ? 'bg-black border-black text-white shadow-sm'
                                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300'
                                }`}
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              type="button" 
              onClick={addPhoneNumber}
              className="w-full mt-2 py-3 border-2 border-dashed border-zinc-200 hover:border-black/30 text-zinc-650 hover:text-black rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              {language === 'ar' ? 'إضافة رقم هاتف مخصص للتواصل' : 'Add another contact phone number'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1.5 ml-1 text-start">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-12 text-start"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
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
              <p className="text-zinc-400 text-xs mt-1 ml-1 text-start">
                {language === 'ar' 
                  ? 'استخدم كلمة مرور قوية مكونة من 8 خانات على الأقل (أرقام وحروف).' 
                  : 'Use a strong password with at least 8 characters (including numbers & letters).'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5 ml-1 text-start">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-12 text-start"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onMouseDown={() => setShowConfirmPassword(true)}
                  onMouseUp={() => setShowConfirmPassword(false)}
                  onMouseLeave={() => setShowConfirmPassword(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-zinc-400 text-xs mt-1 ml-1 text-start">
                {language === 'ar' 
                  ? 'أعد كتابة كلمة المرور للتأكيد.' 
                  : 'Retype your password to confirm.'}
              </p>
            </div>
          </div>
          
          {error && (
            <p className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg text-start">{error}</p>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-md"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            {language === 'ar' ? 'إنشاء حساب المندوب' : 'Create Delivery Account'}
          </button>

          <p className="text-center text-sm text-zinc-500 mt-4">
            {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'} {' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              {t.nav.login}
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};
