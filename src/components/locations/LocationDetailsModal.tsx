import { X, MapPin, ClipboardList, Info, ExternalLink, Calendar, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { Location } from '../../types/location';

interface LocationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
}

export const LocationDetailsModal = ({
  isOpen,
  onClose,
  location
}: LocationDetailsModalProps) => {
  const { language } = useLanguage();

  if (!isOpen || !location) return null;

  const t = {
    ar: {
      title: "تفاصيل الموقع الجغرافي",
      name: "اسم الموقع والفرع",
      address: "العنوان الجغرافي الكامل",
      lat: "خط العرض (Latitude)",
      lng: "خط الطول (Longitude)",
      placeId: "معرّف مكان جوجل (Google Place ID)",
      notes: "الملاحظات الإملائية الإضافية",
      coordsCard: "بطاقة الإحداثيات وتحديد الموقع",
      openInMaps: "استعراض على خرائط جوجل",
      none: "غير متوفر",
      close: "إغلاق النافذة"
    },
    en: {
      title: "Location Node Details",
      name: "Location / Branch Name",
      address: "Formatted Address",
      lat: "Latitude",
      lng: "Longitude",
      placeId: "Google Place ID",
      notes: "Additional Notes & Instructions",
      coordsCard: "Coordinates Coordinate Matrix",
      openInMaps: "Open in Google Maps",
      none: "Not provided",
      close: "Close"
    }
  };

  const currentT = language === 'ar' ? t.ar : t.en;

  const handleOpenMaps = () => {
    const url = location.googleMapsUrl || `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, "_blank");
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
        className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[85vh] font-sans"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-150">
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Info className="w-5.5 h-5.5 text-zinc-400" />
            <span>{currentT.title}</span>
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5.5 h-5.5 text-zinc-500" />
          </button>
        </div>

        {/* Content Details */}
        <div className="space-y-6 text-start">
          {/* Main Name & Address */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{currentT.name}</label>
            <p className="text-lg font-extrabold text-zinc-950 font-sans">{location.name}</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{currentT.address}</label>
            <p className="text-sm font-semibold text-zinc-700 flex items-start gap-1.5 leading-relaxed font-sans">
              <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <span>{location.formattedAddress}</span>
            </p>
          </div>

          {/* Coordinates Information Card */}
          <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-150 space-y-4">
            <h3 className="text-xs font-bold text-zinc-650 uppercase tracking-widest flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-zinc-400" />
              <span>{currentT.coordsCard}</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3.5 rounded-xl border border-zinc-100 shadow-sm text-center">
                <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-1 leading-none">{currentT.lat}</span>
                <span className="text-sm font-mono font-bold text-zinc-800">{location.latitude?.toFixed(6) || '-'}</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-zinc-100 shadow-sm text-center">
                <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-1 leading-none">{currentT.lng}</span>
                <span className="text-sm font-mono font-bold text-zinc-800">{location.longitude?.toFixed(6) || '-'}</span>
              </div>
            </div>

            <div>
              <span className="block text-[9px] font-extrabold text-zinc-400 uppercase tracking-wide mb-1 select-none">{currentT.placeId}</span>
              <span className="text-xs font-mono font-bold text-zinc-600 truncate block bg-white border border-zinc-100 px-3 py-1.5 rounded-xl">
                {location.googlePlaceId || <span className="text-zinc-300 font-sans">{currentT.none}</span>}
              </span>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">{currentT.notes}</label>
            <p className="text-xs font-medium text-zinc-600 bg-zinc-50 border border-zinc-100 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
              {location.notes || <span className="text-zinc-300 italic">{currentT.none}</span>}
            </p>
          </div>

          {/* Buttons panel */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-150">
            <button
              type="button"
              onClick={handleOpenMaps}
              className="flex-1 bg-black text-white hover:bg-zinc-900 px-5 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{currentT.openInMaps}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-colors cursor-pointer font-sans"
            >
              {currentT.close}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
