import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, Trash2, Plus, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { registerDelivery, DeliveryRegisterRequest } from '../services/authService';

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
  const navigate = useNavigate();

  const updatePhoneNumber = (index: number, field: 'number' | 'type', value: string) => {
    const newPhoneNumbers = [...formData.phoneNumbers];
    newPhoneNumbers[index][field] = value;
    setFormData({ ...formData, phoneNumbers: newPhoneNumbers });
    
    if (index === 0 && field === 'number') {
      setFormData(prev => ({ ...prev, phoneNumber: value, phoneNumbers: newPhoneNumbers }));
    }
  };

  const addPhoneNumber = () => {
    setFormData({
      ...formData,
      phoneNumbers: [...formData.phoneNumbers, { number: '', type: 'Secondary' }]
    });
  };

  const removePhoneNumber = (index: number) => {
    if (formData.phoneNumbers.length > 1) {
      const newPhoneNumbers = formData.phoneNumbers.filter((_, i) => i !== index);
      setFormData({ ...formData, phoneNumbers: newPhoneNumbers });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const payload = {
        ...formData,
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
              <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
              <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
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
              <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
              />
              <p className="text-zinc-400 text-xs mt-1 ml-1 text-start">
                {language === 'ar' ? 'يجب أن لا يقل العمر عن 18 عاماً.' : 'Must be at least 18 years old.'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'العنوان الحالي' : 'Current Address'}</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder={language === 'ar' ? 'المحافظة - المديرية - الشارع' : 'Governorate - District - Street'}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
              <p className="text-zinc-400 text-xs mt-1 ml-1 text-start">
                {language === 'ar' ? 'مثال: صنعاء - حدة - جولة الرويشان' : 'e.g., Sanaa - Hadda - Rowishan Roundabout'}
              </p>
            </div>
          </div>

          <div className="bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100 space-y-3">
            <label className="block text-sm font-bold ml-1 text-start">{language === 'ar' ? 'أرقام الهاتف للتواصل' : 'Contact Phone Numbers'}</label>
            <div className="space-y-3">
              {formData.phoneNumbers.map((phone, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-2">
                  <div className="flex-[2] text-start">
                    <input 
                      type="tel" 
                      className="w-full px-4 py-3 bg-white border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder={index === 0 ? (language === 'ar' ? 'رقم الهاتف الأساسي (مثال: 770266408)' : 'Primary phone number (e.g. 770266408)') : (language === 'ar' ? 'رقم هاتف إضافي' : 'Secondary phone number')}
                      value={phone.number}
                      onChange={(e) => updatePhoneNumber(index, 'number', e.target.value)}
                      required
                    />
                    <p className="text-zinc-400 text-[11px] mt-1 ml-1">
                      {index === 0 
                        ? (language === 'ar' ? 'ملاحظة: هذا الرقم سيستخدم لاستقبال الإشعارات وتوصيل الطلبات.' : 'Note: This number is used to receive notifications and complete deliveries.') 
                        : (language === 'ar' ? 'رقم احتياطي للتواصل في حال تعذر الأول.' : 'Backup number if primary is unreachable.')}
                    </p>
                  </div>
                  <div className="flex-1 text-start">
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-white border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder={language === 'ar' ? 'نوع الرقم (مثلاً: أساسي)' : 'Type (e.g. Primary)'}
                      value={phone.type}
                      onChange={(e) => updatePhoneNumber(index, 'type', e.target.value)}
                      required
                    />
                    <p className="text-zinc-400 text-[11px] mt-1 ml-1">
                      {language === 'ar' ? 'مثال: واتساب، اتصال، منزلي' : 'e.g., WhatsApp, Mobile, Home'}
                    </p>
                  </div>
                  {index > 0 && (
                    <button 
                      type="button" 
                      onClick={() => removePhoneNumber(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors self-end md:self-center"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button 
              type="button" 
              onClick={addPhoneNumber}
              className="flex items-center gap-2 text-sm font-bold text-primary hover:underline ml-1 pt-1"
            >
              <Plus className="w-4 h-4" />
              {language === 'ar' ? 'إضافة رقم هاتف آخر' : 'Add another phone number'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1.5 ml-1">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-12"
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
              <UserPlus className="w-5 h-5" />
            )}
            {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
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
