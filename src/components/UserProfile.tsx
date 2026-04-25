import { useState, useEffect, FormEvent } from 'react';
import { User, PhoneNumber } from '../types';
import { useUser, updateUser } from '../services/userService';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
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
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

export const UserProfile = ({ userId }: { userId: number }) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { data: user, isLoading, refetch } = useUser(userId);
  
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);

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

        {/* Data Grid */}
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
