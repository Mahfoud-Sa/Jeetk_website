import { useState, FormEvent } from 'react';
import { Plus, X, Search, Edit, Trash2, MapPin, Sparkles, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { 
  useLocations, createLocation, updateLocation, deleteLocation 
} from '../../services/locationService';
import { Location } from '../../types';
import MapAddressPicker, { hasValidKey } from './MapAddressPicker';

export const AdminLocations = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  
  const { data: locationsData = [], refetch: refetchLocations, isLoading } = useLocations();
  const locations = Array.isArray(locationsData) ? locationsData : [];

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  
  const [locationForm, setLocationForm] = useState({ name: '', address: '', image: '', googleMapsUrl: '' });
  const [newLocation, setNewLocation] = useState<Omit<Location, 'id'>>({ name: '', address: '', image: '', googleMapsUrl: '' });

  const handleCreateLocation = async (e: FormEvent) => {
    e.preventDefault();
    if (!newLocation.name.trim() || !newLocation.address.trim()) {
      showToast(
        language === 'ar' ? 'يرجى تحديد الموقع على الخريطة أو إدخال البيانات المطلوبة' : 'Please pick a location or fill in all fields',
        'error'
      );
      return;
    }
    try {
      await createLocation(newLocation);
      setNewLocation({ name: '', address: '', image: '', googleMapsUrl: '' });
      refetchLocations();
      showToast(
        language === 'ar' ? 'تم حفظ وإضافة موقع الفرع الجديد بنجاح!' : 'Location created successfully!',
        'success'
      );
    } catch (err) {
      showToast(
        language === 'ar' ? 'فشل حركية حفظ الفرع على الخادم' : 'Failed to create location',
        'error'
      );
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الموقع نهائياً؟' : 'Are you sure you want to delete this location?')) return;
    try {
      await deleteLocation(id);
      refetchLocations();
      showToast(
        language === 'ar' ? 'تم استبعاد وحذف الموقع بنجاح' : 'Location deleted successfully!',
        'success'
      );
    } catch (err) {
      showToast(
        language === 'ar' ? 'فشل استبعاد الموقع من الخادم' : 'Failed to delete location',
        'error'
      );
    }
  };

  const openEditLocation = (loc: any) => {
    setEditingLocation(loc);
    setLocationForm({ 
      name: loc.name, 
      address: loc.address, 
      image: loc.image || '', 
      googleMapsUrl: loc.googleMapsUrl || '' 
    });
    setShowLocationModal(true);
  };

  const onUpdateLocationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      try {
        await updateLocation(editingLocation.id, locationForm);
        refetchLocations();
        showToast(
          language === 'ar' ? 'تم تحديث الفرع وبيانات الخريطة بنجاح!' : 'Location updated successfully!',
          'success'
        );
        setShowLocationModal(false);
        setEditingLocation(null);
      } catch (err) {
        showToast(
          language === 'ar' ? 'فشل التحديث، يرجى مراجعة معلمات الاتصال' : 'Failed to update location',
          'error'
        );
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-sans text-zinc-900 tracking-tight flex items-center gap-3">
            <MapIcon className="w-8 h-8 text-primary shrink-0" />
            {t.dashboard.locations}
          </h1>
          <p className="text-sm font-bold text-zinc-500 mt-1">
            {language === 'ar' ? 'إدارة النطاقات الجغرافية وفروع المطاعم وتعيين إحداثيات خرائط جوجل.' : 'Manage coverage boundaries, local branches, and specify precise Google Maps coordinates.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Creation/Adding Section with Google Maps Address Picker */}
        <div className="xl:col-span-7 bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <h2 className="text-xl font-extrabold flex items-center gap-2.5 text-zinc-800">
              <Plus className="w-5.5 h-5.5 text-primary" />
              {t.dashboard.addLocation}
            </h2>
            {hasValidKey && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-150 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {language === 'ar' ? 'الخريطة نشطة' : 'Live Maps Enabled'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Columns: The Interactive Map */}
            <div className="lg:col-span-7">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {language === 'ar' ? 'حدد فرع بالخريطة للتعبئة التلقائية' : 'Find / Drop Pin to Auto-Fill'}
              </div>
              <MapAddressPicker
                initialAddress={newLocation.address}
                initialName={newLocation.name}
                initialUrl={newLocation.googleMapsUrl}
                onLocationSelect={(data) => {
                  setNewLocation({
                    ...newLocation,
                    name: data.name,
                    address: data.address,
                    googleMapsUrl: data.googleMapsUrl
                  });
                }}
              />
            </div>

            {/* Right 5 Columns: Confirmation Form */}
            <form onSubmit={handleCreateLocation} className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">{t.dashboard.locationName}</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold" 
                  value={newLocation.name} 
                  onChange={e => setNewLocation({ ...newLocation, name: e.target.value })} 
                  required 
                  placeholder={language === 'ar' ? 'مثال: فرع العليا الرئيسي' : 'e.g. Olaya Main Branch'}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">{t.dashboard.locationAddress}</label>
                <textarea 
                  rows={2}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold resize-none" 
                  value={newLocation.address} 
                  onChange={e => setNewLocation({ ...newLocation, address: e.target.value })} 
                  required 
                  placeholder={language === 'ar' ? 'العنوان الجغرافي التفصيلي' : 'Precise street address'}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">{t.dashboard.locationImage}</label>
                <input 
                  type="url" 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold" 
                  value={newLocation.image} 
                  onChange={e => setNewLocation({ ...newLocation, image: e.target.value })} 
                  placeholder="https://images.unsplash.com/..." 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">{t.dashboard.locationMapsUrl}</label>
                <input 
                  type="url" 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold font-mono text-zinc-650" 
                  value={newLocation.googleMapsUrl} 
                  onChange={e => setNewLocation({ ...newLocation, googleMapsUrl: e.target.value })} 
                  placeholder="https://maps.google.com/..." 
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 active:scale-[0.99] transition-all shadow-sm"
                >
                  {t.dashboard.saveLocation}
                </button>
              </div>
            </form>

          </div>
        </div>

        {/* Existing Locations Directories on the Right Side */}
        <div className="xl:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xl font-extrabold text-zinc-800">{t.dashboard.existingLocations}</h2>
            <span className="text-xs font-bold px-2.5 py-1 bg-zinc-100/80 text-zinc-650 rounded-full border border-zinc-200 shadow-inner">
              {locations.length} {language === 'ar' ? 'فروع مسجلة' : 'branches registered'}
            </span>
          </div>

          {isLoading ? (
            <div className="bg-white border border-zinc-100 rounded-3xl p-12 text-center text-zinc-400">
              <span className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-3" />
              <p className="text-xs font-bold">{language === 'ar' ? 'جاري استيراد سجل الفروع والمناطق...' : 'Fetching registered coverage zones...'}</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="bg-white border border-zinc-100 rounded-3xl p-12 text-center text-zinc-400 space-y-2">
              <MapPin className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-xs font-bold">{language === 'ar' ? 'لا توجد فروع مضافة حالياً بالنظام.' : 'No active branches found in your directory yet.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 max-h-[580px] overflow-y-auto pr-1">
              {locations.map(loc => (
                <div 
                  key={loc.id} 
                  className="p-4 bg-white border border-zinc-100 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                       <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-zinc-800 truncate mb-0.5">{loc.name}</h4>
                      <p className="text-xs text-zinc-500 font-medium truncate max-w-[200px] sm:max-w-xs">{loc.address}</p>
                      {loc.googleMapsUrl && (
                        <a 
                          href={loc.googleMapsUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-bold mt-1.5"
                        >
                          <MapIcon className="w-3 h-3" />
                          {language === 'ar' ? 'استعراض على خرائط جوجل' : 'View on Google Maps'}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button 
                      onClick={() => openEditLocation(loc)} 
                      className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"
                      title={language === 'ar' ? 'تعديل بيانات الفرع الجغرافي' : 'Edit coordinates'}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteLocation(loc.id)} 
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title={language === 'ar' ? 'حذف الموقع وتجريد المسارات' : 'De-provision location'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Editing Modal Dialog with exact responsive styling */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 15 }} 
              className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <Edit className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-extrabold text-zinc-800">{t.dashboard.editLocation}</h2>
                </div>
                <button 
                  onClick={() => {
                    setShowLocationModal(false);
                    setEditingLocation(null);
                  }} 
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={onUpdateLocationSubmit} className="space-y-6">
                
                {/* Map in Modal */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
                    {language === 'ar' ? 'أعد تحديد الإحداثيات من الخريطة:' : 'Update Geoposition / Coordinates Marker:'}
                  </label>
                  <MapAddressPicker
                    initialAddress={locationForm.address}
                    initialName={locationForm.name}
                    initialUrl={locationForm.googleMapsUrl}
                    onLocationSelect={(data) => {
                      setLocationForm({
                        ...locationForm,
                        name: data.name,
                        address: data.address,
                        googleMapsUrl: data.googleMapsUrl
                      });
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5">{t.dashboard.locationName}</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold" 
                      value={locationForm.name} 
                      onChange={e => setLocationForm({ ...locationForm, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5">{t.dashboard.locationImage}</label>
                    <input 
                      type="url" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold" 
                      value={locationForm.image} 
                      onChange={e => setLocationForm({ ...locationForm, image: e.target.value })} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">{t.dashboard.locationAddress}</label>
                  <textarea 
                    rows={2} 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold resize-none" 
                    value={locationForm.address} 
                    onChange={e => setLocationForm({ ...locationForm, address: e.target.value })} 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">{t.dashboard.locationMapsUrl}</label>
                  <input 
                    type="url" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold font-mono text-zinc-600" 
                    value={locationForm.googleMapsUrl} 
                    onChange={e => setLocationForm({ ...locationForm, googleMapsUrl: e.target.value })} 
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3.5 border-t border-zinc-100 pt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowLocationModal(false);
                      setEditingLocation(null);
                    }} 
                    className="px-5 py-3 border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-colors"
                  >
                    {language === 'ar' ? 'إلغاء الأمر' : 'Cancel'}
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-black text-white rounded-xl text-xs font-bold hover:bg-zinc-800 active:scale-[0.99] transition-all"
                  >
                    {t.dashboard.saveChanges}
                  </button>
                </div>
              </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

