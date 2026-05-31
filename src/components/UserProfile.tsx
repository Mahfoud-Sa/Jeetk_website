import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, PhoneNumber } from '../types';
import { useUser, updateUser, changePassword } from '../services/userService';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  MapPin, 
  Lock, 
  Phone, 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export const UserProfile = ({ userId }: { userId: number }) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: user, isLoading, refetch } = useUser(userId);
  
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'security'>('info');

  // Change password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Password rules validation
  const isMinLength = newPassword.length >= 6;
  const hasNumber = /\d/.test(newPassword);
  const hasLetter = /[a-zA-Z]/.test(newPassword) || /[\u0600-\u06FF]/.test(newPassword);
  const passwordsMatch = newPassword && newPassword === confirmPassword;
  const isPasswordFormValid = isMinLength && hasNumber && hasLetter && passwordsMatch;

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isPasswordFormValid) return;

    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await changePassword(confirmPassword, newPassword);
      setPasswordSuccess(
        language === 'ar' 
          ? 'تم تغيير كلمة المرور بنجاح! جاري تسجيل الخروج والتحويل...' 
          : 'Password changed successfully! Logging out and redirecting...'
      );
      showToast(
        language === 'ar' 
          ? 'تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول مجدداً.' 
          : 'Password changed successfully. Please log in again.', 
        'success'
      );
      setNewPassword('');
      setConfirmPassword('');
      
      // Securely clear sessions and navigate to Login page after a short time
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error("Change password error:", err);
      setPasswordError(
        err?.response?.data?.message || err?.message || 
        (language === 'ar' 
          ? 'فشل تغيير كلمة المرور. الرجاء المحاولة مجدداً.' 
          : 'Failed to change password. Please try again.')
      );
      setIsChangingPassword(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        address: user.address,
        username: user.username,
        phoneNumbers: user.phoneNumbers || [],
        password: '' // Don't show password
      });
    }
  }, [user]);

  const handleUpdatePhoneNumber = (index: number, field: keyof PhoneNumber, value: string) => {
    const newPhoneNumbers = [...(formData.phoneNumbers || [])];
    newPhoneNumbers[index] = { ...newPhoneNumbers[index], [field]: value };
    setFormData({ ...formData, phoneNumbers: newPhoneNumbers });
  };

  const addPhoneNumber = () => {
    setFormData({
      ...formData,
      phoneNumbers: [...(formData.phoneNumbers || []), { number: '', type: 'Mobile' }]
    });
  };

  const removePhoneNumber = (index: number) => {
    const newPhoneNumbers = (formData.phoneNumbers || []).filter((_, i) => i !== index);
    setFormData({ ...formData, phoneNumbers: newPhoneNumbers });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password;
      
      await updateUser(userId, payload);
      showToast(language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully', 'success');
      refetch();
    } catch (error) {
      showToast(language === 'ar' ? 'فشل تحديث الملف الشخصي' : 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center bg-white border border-zinc-100 rounded-3xl shadow-sm">
        <p className="text-zinc-500">{language === 'ar' ? 'لم يتم العثور على بيانات المستخدم' : 'User data not found'}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white border border-zinc-100 rounded-3xl shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="bg-zinc-50 px-8 py-10 border-b border-zinc-100">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center border-4 border-white shadow-sm">
              <UserIcon className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center md:text-start flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <h2 className="text-3xl font-bold">{user.name}</h2>
                {user.isActive && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {language === 'ar' ? 'نشط' : 'Active'}
                  </span>
                )}
              </div>
              <p className="text-zinc-500 font-medium">@{user.username || 'user'}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'انضم في:' : 'Joined:'} {new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                  ID: #{user.id}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-tab Selection */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/50 px-8">
          <button
            type="button"
            onClick={() => setActiveSubTab('info')}
            className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 outline-none ${
              activeSubTab === 'info'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            {language === 'ar' ? 'معلومات الحساب' : 'Account Details'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('security')}
            className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 outline-none ${
              activeSubTab === 'security'
                ? 'border-black text-black'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Lock className="w-4 h-4" />
            {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
          </button>
        </div>

        {activeSubTab === 'info' ? (
          /* Data Grid */
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Info */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">
              {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
            </h3>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-zinc-50 rounded-lg">
                <Mail className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-0.5">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-zinc-50 rounded-lg">
                <Calendar className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-0.5">{language === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}</p>
                <p className="font-medium">{user.birthDate ? new Date(user.birthDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-zinc-50 rounded-lg">
                <MapPin className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-0.5">{language === 'ar' ? 'العنوان' : 'Address'}</p>
                <p className="font-medium">{user.address || '-'}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">
              {language === 'ar' ? 'معلومات الاتصال' : 'Contact Details'}
            </h3>

            {user.phoneNumbers && user.phoneNumbers.length > 0 ? (
              <div className="space-y-4">
                {user.phoneNumbers.map((phone, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-zinc-50 rounded-2xl border border-zinc-100/50">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                        {phone.type || (language === 'ar' ? 'هاتف' : 'Phone')}
                      </p>
                      <p className="font-bold text-zinc-900">{phone.number}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                <div className="p-3 bg-white rounded-full mb-3">
                  <Phone className="w-5 h-5 text-zinc-300" />
                </div>
                <p className="text-sm text-zinc-400 text-center">
                  {language === 'ar' ? 'لا توجد أرقام هواتف مسجلة' : 'No phone numbers registered'}
                </p>
              </div>
            )}
          </div>
        </div>
        ) : (
          /* Change Password Section */
          <div className="p-8 max-w-lg mx-auto w-full">
            <div className="bg-white/50 space-y-6">
              <div className="text-start">
                <h3 className="text-lg font-bold text-zinc-900 mb-1">
                  {language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password'}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {language === 'ar' 
                    ? 'يرجى إدخال وتأكيد كلمة المرور الجديدة لتغييرها على الفور.' 
                    : 'Please enter and confirm your new password to update it instantly.'}
                </p>
              </div>

              {passwordError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-start gap-3 border border-red-100 text-start animate-fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 animate-pulse text-red-500" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-4 bg-green-50 text-green-700 rounded-2xl text-sm flex items-start gap-3 border border-green-100 text-start animate-fade-in">
                  <Check className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2 text-start">
                  <label className="text-sm font-semibold px-1 text-zinc-700">
                    {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                  </label>
                  <div className="relative">
                    <Lock className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400`} />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                        if (passwordSuccess) setPasswordSuccess('');
                      }}
                      className={`w-full h-12 bg-zinc-50 border border-black/5 rounded-2xl ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm`}
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Password requirements checker */}
                  <div className="mt-3 p-4 bg-zinc-50 border border-black/5 rounded-2xl space-y-2 text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${isMinLength ? 'bg-green-500/10 border-green-500 text-green-600' : 'border-zinc-300'}`}>
                        {isMinLength && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{language === 'ar' ? 'على الأقل 6 خانات' : 'At least 6 characters'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${hasNumber ? 'bg-green-500/10 border-green-500 text-green-600' : 'border-zinc-300'}`}>
                        {hasNumber && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{language === 'ar' ? 'يحتوي على رقم واحد على الأقل' : 'At least one number'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${hasLetter ? 'bg-green-500/10 border-green-500 text-green-600' : 'border-zinc-300'}`}>
                        {hasLetter && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{language === 'ar' ? 'يحتوي على حرف واحد على الأقل' : 'At least one letter'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-start">
                  <label className="text-sm font-semibold px-1 text-zinc-700">
                    {language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                  </label>
                  <div className="relative">
                    <Lock className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400`} />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                        if (passwordSuccess) setPasswordSuccess('');
                      }}
                      className={`w-full h-12 bg-zinc-50 border border-black/5 rounded-2xl ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm`}
                      placeholder="••••••••"
                    />
                  </div>

                  {confirmPassword && (
                    <div className="text-xs transition-all mt-1">
                      {passwordsMatch ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {language === 'ar' ? 'كلمتا المرور متطابقتان' : 'Passwords match'}
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-1">
                          <X className="w-3.5 h-3.5" />
                          {language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword || !isPasswordFormValid}
                  className="w-full h-12 bg-black hover:bg-zinc-900 text-white rounded-2xl font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center">
          <p className="text-[10px] text-zinc-400">
            {language === 'ar' ? 'آخر تحديث:' : 'Last Updated:'} {new Date(user.updatedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">System Synchronized</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
