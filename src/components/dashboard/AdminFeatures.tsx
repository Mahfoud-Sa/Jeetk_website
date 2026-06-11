import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Clock, 
  Navigation, 
  Zap, 
  Shield, 
  Heart, 
  Award, 
  Star, 
  Truck, 
  Settings,
  RefreshCw,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface LandingFeature {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  icon: string;
}

const DEFAULT_FEATURES: LandingFeature[] = [
  {
    id: '1',
    titleEn: 'Lightning Fast',
    titleAr: 'سرعة فائقة مذهلة',
    descEn: "Average delivery time of 25 minutes. We don't just deliver; we sprint.",
    descAr: 'متوسط وقت التوصيل ٢٥ دقيقة فقط. لا نقوم بمجرد التوصيل، بل نسابق الزمن لأجلك.',
    icon: 'Clock'
  },
  {
    id: '2',
    titleEn: 'AI Suggestions',
    titleAr: 'اقتراحات الذكاء الاصطناعي',
    descEn: 'Not sure what to eat? Our AI knows your taste better than you do.',
    descAr: 'متردد في اختيار وجبتك القادمة؟ نظام الذكاء الاصطناعي لدينا يدرك ذوقك بدقة متناهية.',
    icon: 'Sparkles'
  },
  {
    id: '3',
    titleEn: 'Transparent Pricing',
    titleAr: 'تسعير كلي وشفاف',
    descEn: 'No hidden fees. Check delivery prices between any two points instantly.',
    descAr: 'بدون أي رسوم خفية أو مفاجئة. تتبع أسعار التوصيل المباشرة برخص بين أي نقطتين فوراً.',
    icon: 'Navigation'
  }
];

export const getLandingFeatures = (): LandingFeature[] => {
  const data = localStorage.getItem('jeetk_landing_features');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_FEATURES;
};

export const saveLandingFeatures = (features: LandingFeature[]) => {
  localStorage.setItem('jeetk_landing_features', JSON.stringify(features));
  // Dispatch dynamic storage update event for responsive home feed update
  window.dispatchEvent(new Event('storage'));
};

export const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Clock,
  Sparkles,
  Navigation,
  Zap,
  Shield,
  Heart,
  Award,
  Star,
  Truck,
  Settings
};

export const AdminFeatures: React.FC = () => {
  const { language } = useLanguage();
  const [features, setFeatures] = useState<LandingFeature[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [icon, setIcon] = useState('Sparkles');
  
  // UI States
  const [isAdding, setIsAdding] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setFeatures(getLandingFeatures());
  }, []);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleStartEdit = (feat: LandingFeature) => {
    setEditingId(feat.id);
    setTitleEn(feat.titleEn);
    setTitleAr(feat.titleAr);
    setDescEn(feat.descEn);
    setDescAr(feat.descAr);
    setIcon(feat.icon);
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    clearForm();
  };

  const clearForm = () => {
    setTitleEn('');
    setTitleAr('');
    setDescEn('');
    setDescAr('');
    setIcon('Sparkles');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !titleAr || !descEn || !descAr) {
      showStatus(language === 'ar' ? 'الرجاء ملء جميع الحقول لكلا اللغتين' : 'Please fill all fields for both languages');
      return;
    }

    const updated = features.map(f => {
      if (f.id === editingId) {
        return { ...f, titleEn, titleAr, descEn, descAr, icon };
      }
      return f;
    });

    setFeatures(updated);
    saveLandingFeatures(updated);
    setEditingId(null);
    clearForm();
    showStatus(language === 'ar' ? 'تم تحديث بطاقة الميزة بنجاح!' : 'Feature card updated successfully!');
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !titleAr || !descEn || !descAr) {
      showStatus(language === 'ar' ? 'الرجاء ملء جميع الحقول لكلا اللغتين' : 'Please fill all fields for both languages');
      return;
    }

    const newFeature: LandingFeature = {
      id: Date.now().toString(),
      titleEn,
      titleAr,
      descEn,
      descAr,
      icon
    };

    const updated = [...features, newFeature];
    setFeatures(updated);
    saveLandingFeatures(updated);
    setIsAdding(false);
    clearForm();
    showStatus(language === 'ar' ? 'تمت إضافة بطاقة ترويجية جديدة!' : 'New promotional card added!');
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الميزة من الموقع؟' : 'Are you sure you want to delete this feature from the website?')) {
      const updated = features.filter(f => f.id !== id);
      setFeatures(updated);
      saveLandingFeatures(updated);
      if (editingId === id) {
        setEditingId(null);
        clearForm();
      }
      showStatus(language === 'ar' ? 'تم حذف الميزة بنجاح' : 'Feature deleted successfully');
    }
  };

  const handleResetDefaults = () => {
    if (confirm(language === 'ar' ? 'هل تود استعادة الإعدادات والبطاقات الافتراضية للشركة؟' : 'Do you want to restore the default corporate promo cards?')) {
      setFeatures(DEFAULT_FEATURES);
      saveLandingFeatures(DEFAULT_FEATURES);
      setEditingId(null);
      setIsAdding(false);
      clearForm();
      showStatus(language === 'ar' ? 'تمت استعادة البطاقات الافتراضية بنجاح' : 'Default cards restored successfully');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-150 shadow-sm p-6 text-start">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-black text-zinc-955 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>{language === 'ar' ? 'إدارة بطاقات المزايا (الواجهة الرئيسية)' : 'Manage Promo & Info Cards'}</span>
          </h2>
          <p className="text-xs text-zinc-500 font-medium mt-1">
            {language === 'ar' 
              ? 'تعديل أو إضافة بطاقات المزايا والترويج المعروضة لزوار الموقع في الصفحة الرئيسية' 
              : 'Customize or add feature & promotional cards displayed to customers on the web homepage'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'استعادة الافتراضي' : 'Reset Defaults'}</span>
          </button>
          
          {!isAdding && !editingId && (
            <button
              type="button"
              onClick={() => {
                setIsAdding(true);
                clearForm();
              }}
              className="px-4 py-2 bg-black hover:bg-zinc-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إضافة بطاقة جديدة' : 'Add Promo Card'}</span>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Adding / Editing Forms panel */}
      {(isAdding || editingId) && (
        <div className="bg-zinc-50/50 rounded-2xl border border-zinc-200 p-5 mb-8">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-200/60">
            <h3 className="text-sm font-black text-zinc-800">
              {isAdding 
                ? (language === 'ar' ? 'إضافة بطاقة ترويجية جديدة للموقع' : 'Add New Promo Feature Card')
                : (language === 'ar' ? 'تعديل بيانات بطاقة الميزة' : 'Edit Feature Card Details')}
            </h3>
            <button 
              onClick={handleCancelEdit}
              className="p-1 hover:bg-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={isAdding ? handleAddNew : handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ENGLISH SECTION */}
              <div className="space-y-4 p-4 bg-white rounded-xl border border-zinc-150">
                <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider block">English Contents</span>
                
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 uppercase block mb-1">Feature Title (EN)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Free Delivery"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-zinc-800 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-500 uppercase block mb-1">Description / Slogan (EN)</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe this outstanding feature or service..."
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-zinc-800 font-medium leading-relaxed"
                  />
                </div>
              </div>

              {/* ARABIC SECTION */}
              <div className="space-y-4 p-4 bg-white rounded-xl border border-zinc-150 text-right">
                <span className="text-[10px] font-bold text-amber-650 uppercase tracking-wider block">العناوين والمحتوى العربي</span>
                
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">عنوان الميزة (العربية)</label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    placeholder="مثال: توصيل مجاني كامل"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-zinc-850 font-bold text-right"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-500 block mb-1">وصف الميزة وموجز الإعلان (العربية)</label>
                  <textarea
                    required
                    dir="rtl"
                    rows={2}
                    placeholder="اكتب وصفاً جذاباً ومختصراً لهذه الميزة الرائعة تصف بها جودة الخدمة..."
                    value={descAr}
                    onChange={(e) => setDescAr(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-zinc-850 font-bold leading-relaxed text-right"
                  />
                </div>
              </div>
            </div>

            {/* ICON SELECTOR */}
            <div className="p-4 bg-white rounded-xl border border-zinc-150">
              <label className="text-[11px] font-bold text-zinc-500 uppercase block mb-2">Select Visual Icon</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(ICON_MAP).map((iconKey) => {
                  const IconComp = ICON_MAP[iconKey];
                  const isSelected = icon === iconKey;
                  return (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setIcon(iconKey)}
                      className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 min-w-[70px] cursor-pointer ${
                        isSelected 
                          ? 'bg-black text-white border-black scale-102 font-extrabold shadow-sm' 
                          : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-650'
                      }`}
                    >
                      <IconComp className="w-5 h-5 shrink-0" />
                      <span className="text-[9px] font-semibold font-mono tracking-tight">{iconKey}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BUTTONS ROW */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 rounded-xl text-xs font-bold cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'حفظ وحجز البطاقة' : 'Save Feature Card'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((item) => {
          const IconComponent = ICON_MAP[item.icon] || Sparkles;
          return (
            <div 
              key={item.id} 
              className="rounded-3xl border border-zinc-150 bg-zinc-50/20 p-6 flex flex-col justify-between group relative hover:border-black/20 hover:bg-white transition-all duration-300"
            >
              {/* Management Control Badges */}
              <div className="absolute top-4 right-4 flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleStartEdit(item)}
                  className="p-1.5 bg-white hover:bg-zinc-100 text-zinc-700 hover:text-black rounded-lg border border-zinc-200 cursor-pointer transition-all"
                  title={language === 'ar' ? 'تعديل' : 'Edit'}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-150 cursor-pointer transition-all"
                  title={language === 'ar' ? 'حذف' : 'Delete'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                {/* Icon wrapper */}
                <div className="w-11 h-11 bg-white rounded-xl border border-zinc-150 flex items-center justify-center mb-4 text-zinc-500 shadow-xs">
                  <IconComponent className="w-5 h-5 text-zinc-700" />
                </div>

                {/* English & Arabic visual block */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-indigo-400 block mb-0.5">English View</span>
                    <h3 className="text-sm font-black text-zinc-900 leading-snug">{item.titleEn}</h3>
                    <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">{item.descEn}</p>
                  </div>

                  <div className="border-t border-dashed border-zinc-200/80 pt-2 text-right">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-500 block mb-0.5">المعاينة باللغة العربية</span>
                    <h3 className="text-sm font-black text-zinc-950 leading-snug">{item.titleAr}</h3>
                    <p className="text-[11px] text-zinc-650 leading-relaxed mt-0.5" dir="rtl">{item.descAr}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 mt-4 pt-3 flex items-center justify-between text-[10px] text-zinc-400 font-semibold font-mono">
                <span>ID: {item.id}</span>
                <span className="px-1.5 py-0.5 bg-zinc-100 rounded text-zinc-550 uppercase text-[8px] font-bold">Icon: {item.icon}</span>
              </div>
            </div>
          );
        })}
        
        {features.length === 0 && (
          <div className="col-span-full py-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <Sparkles className="w-8 h-8 text-zinc-300 mx-auto mb-2.5" />
            <p className="text-zinc-400 font-bold text-xs">{language === 'ar' ? 'لا توجد ميزات مصممة للموقع حالياً' : 'No feature cards configured'}</p>
            <button
              onClick={handleResetDefaults}
              className="mt-3 text-xs text-primary font-bold hover:underline"
            >
              {language === 'ar' ? 'استعادة مزايا النظام الافتراضية' : 'Restore Default Systems'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
