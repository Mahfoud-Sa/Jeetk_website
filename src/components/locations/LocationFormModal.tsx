import { useState, useEffect, FormEvent } from 'react';
import { X, MapPin, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { Location, LocationCreateInput, LocationUpdateInput } from '../../types/location';
import MapAddressPicker from '../dashboard/MapAddressPicker';

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  location?: Location | null;
  isSaving: boolean;
}

export const LocationFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  location,
  isSaving
}: LocationFormModalProps) => {
  const { language } = useLanguage();

  const [form, setForm] = useState({
    name: '',
    formattedAddress: '',
    latitude: '',
    longitude: '',
    googlePlaceId: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset/Load existing data when modal state changes or a location is passed (Edit mode)
  useEffect(() => {
    if (location) {
      setForm({
        name: location.name || '',
        formattedAddress: location.formattedAddress || '',
        latitude: location.latitude !== undefined ? String(location.latitude) : '',
        longitude: location.longitude !== undefined ? String(location.longitude) : '',
        googlePlaceId: location.googlePlaceId || '',
        notes: location.notes || ''
      });
    } else {
      setForm({
        name: '',
        formattedAddress: '',
        latitude: '',
        longitude: '',
        googlePlaceId: '',
        notes: ''
      });
    }
    setErrors({});
  }, [location, isOpen]);

  if (!isOpen) return null;

  const t = {
    ar: {
      createTitle: "إضافة موقع جديد",
      editTitle: "تعديل بيانات الموقع الجغرافي",
      cancel: "إلغاء الأمر",
      save: "حفظ ومزامنة",
      nameLabel: "اسم الموقع",
      namePlaceholder: "مثال: فرع العليا الرئيسي",
      addressLabel: "العنوان بالكامل",
      addressPlaceholder: "الشارع، الحي، المنطقة الإدارية",
      latLabel: "خط العرض (Latitude)",
      latPlaceholder: "خط العرض من -90 إلى 90",
      lngLabel: "خط الطول (Longitude)",
      lngPlaceholder: "خط الطول من -180 إلى 180",
      placeLabel: "معرف مكان جوجل (Google Place ID)",
      placePlaceholder: "معرف فريد ومميز لموقع الخرائط",
      notesLabel: "ملاحظات إملائية إضافية",
      notesPlaceholder: "رقم المبنى، علامة مميزة بالقرب من الفرع",
      mapSectionTitle: "تحديد الموقع الجغرافي",
      mapPlaceholder: "محدد الخرائط جوجل قريباً",
      saving: "جاري الإرسال والمزامنة...",
      validation: {
        latRequired: "خط العرض مطلوب",
        latRange: "يجب أن يكون خط العرض بين -90 و 90",
        lngRequired: "خط الطول مطلوب",
        lngRange: "يجب أن يكون خط الطول بين -180 و 180",
        nameRequired: "اسم الموقع مطلوب",
        addressRequired: "العنوان الجغرافي مطلوب"
      }
    },
    en: {
      createTitle: "Create New Location",
      editTitle: "Edit Location Details",
      cancel: "Cancel",
      save: "Save Location",
      nameLabel: "Location Name",
      namePlaceholder: "e.g., Main Office or Riyadh Hub",
      addressLabel: "Formatted Address",
      addressPlaceholder: "Street Name, District, City",
      latLabel: "Latitude",
      latPlaceholder: "Latitude from -90 to 90",
      lngLabel: "Longitude",
      lngPlaceholder: "Longitude from -180 to 180",
      placeLabel: "Google Place ID (Optional)",
      placePlaceholder: "Copy Google place ID key",
      notesLabel: "Internal Notes",
      notesPlaceholder: "Special delivery details, instructions, or landmarks",
      mapSectionTitle: "Location Selection",
      mapPlaceholder: "Google Maps Picker Coming Soon",
      saving: "Saving location details...",
      validation: {
        latRequired: "Latitude is required",
        latRange: "Latitude must be within range -90 to 90",
        lngRequired: "Longitude is required",
        lngRange: "Longitude must be within range -180 to 180",
        nameRequired: "Location Name is required",
        addressRequired: "Formatted Address is required"
      }
    }
  };

  const currentT = language === 'ar' ? t.ar : t.en;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = currentT.validation.nameRequired;
    }
    if (!form.formattedAddress.trim()) {
      newErrors.formattedAddress = currentT.validation.addressRequired;
    }

    const latVal = Number(form.latitude);
    if (form.latitude === '' || isNaN(latVal)) {
      newErrors.latitude = currentT.validation.latRequired;
    } else if (latVal < -90 || latVal > 90) {
      newErrors.latitude = currentT.validation.latRange;
    }

    const lngVal = Number(form.longitude);
    if (form.longitude === '' || isNaN(lngVal)) {
      newErrors.longitude = currentT.validation.lngRequired;
    } else if (lngVal < -180 || lngVal > 180) {
      newErrors.longitude = currentT.validation.lngRange;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      formattedAddress: form.formattedAddress.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      googlePlaceId: form.googlePlaceId.trim() || undefined,
      notes: form.notes.trim() || undefined
    };

    onSubmit(payload);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.9, y: 20 }} 
        className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-150">
          <h2 className="text-2xl font-bold text-zinc-900 font-sans">
            {location ? currentT.editTitle : currentT.createTitle}
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-start">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{currentT.nameLabel}</label>
              <input 
                type="text" 
                required
                placeholder={currentT.namePlaceholder}
                className={`w-full px-4 py-3 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm font-semibold text-zinc-805 ${
                  errors.name ? 'border-rose-450 focus:border-rose-450' : 'border-zinc-200 focus:border-black'
                }`}
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
              />
              {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{currentT.placeLabel}</label>
              <input 
                type="text" 
                placeholder={currentT.placePlaceholder}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-400 text-sm font-semibold text-zinc-805"
                value={form.googlePlaceId} 
                onChange={e => setForm({ ...form, googlePlaceId: e.target.value })} 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{currentT.addressLabel}</label>
            <input 
              type="text" 
              required
              placeholder={currentT.addressPlaceholder}
              className={`w-full px-4 py-3 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm font-semibold text-zinc-805 ${
                errors.formattedAddress ? 'border-rose-450 focus:border-rose-450' : 'border-zinc-200 focus:border-black'
              }`}
              value={form.formattedAddress} 
              onChange={e => setForm({ ...form, formattedAddress: e.target.value })} 
            />
            {errors.formattedAddress && <p className="text-[10px] text-rose-500 mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.formattedAddress}</p>}
          </div>

          {/* Location Selection with Latitude, Longitude and Google Maps Picker placeholder */}
          <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-150 space-y-4">
            <h3 className="text-xs font-bold text-zinc-650 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span>{currentT.mapSectionTitle}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">{currentT.latLabel}</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., 24.7136"
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-xs font-mono font-bold text-zinc-805 ${
                    errors.latitude ? 'border-rose-450 focus:border-rose-450' : 'border-zinc-200 focus:border-black'
                  }`}
                  value={form.latitude} 
                  onChange={e => setForm({ ...form, latitude: e.target.value })} 
                />
                {errors.latitude && <p className="text-[10px] text-rose-500 mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.latitude}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">{currentT.lngLabel}</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., 46.6753"
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-xs font-mono font-bold text-zinc-805 ${
                    errors.longitude ? 'border-rose-450 focus:border-rose-450' : 'border-zinc-200 focus:border-black'
                  }`}
                  value={form.longitude} 
                  onChange={e => setForm({ ...form, longitude: e.target.value })} 
                />
                {errors.longitude && <p className="text-[10px] text-rose-500 mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.longitude}</p>}
              </div>
            </div>

            {/* Live Interactive Google Map Picker */}
            <div className="mt-2 text-start">
              <MapAddressPicker
                onLocationSelect={(data) => {
                  setForm(prev => ({
                    ...prev,
                    name: data.name || prev.name,
                    formattedAddress: data.address || prev.formattedAddress,
                    latitude: String(data.latitude),
                    longitude: String(data.longitude),
                    googlePlaceId: data.googlePlaceId || prev.googlePlaceId
                  }));
                }}
                initialAddress={form.formattedAddress}
                initialName={form.name}
                initialLat={Number(form.latitude) || undefined}
                initialLng={Number(form.longitude) || undefined}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{currentT.notesLabel}</label>
            <textarea 
              rows={3}
              placeholder={currentT.notesPlaceholder}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm font-semibold text-zinc-805 resize-none"
              value={form.notes} 
              onChange={e => setForm({ ...form, notes: e.target.value })} 
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSaving}
              className="px-5 py-3 border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-50 disabled:opacity-50 transition-colors cursor-pointer font-sans"
            >
              {currentT.cancel}
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-6 py-3 bg-black text-white rounded-xl text-xs font-bold hover:bg-zinc-900 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer font-sans"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSaving ? currentT.saving : currentT.save}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
