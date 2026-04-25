import { useState, FormEvent } from 'react';
import { Plus, X, Search, Edit, Trash2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { 
  useLocations, createLocation, updateLocation, deleteLocation 
} from '../../services/locationService';
import { Location } from '../../types';

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
    try {
      await createLocation(newLocation);
      setNewLocation({ name: '', address: '', image: '', googleMapsUrl: '' });
      refetchLocations();
      showToast('Location created successfully!', 'success');
    } catch (err) {
      showToast('Failed to create location', 'error');
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    try {
      await deleteLocation(id);
      refetchLocations();
      showToast('Location deleted successfully!', 'success');
    } catch (err) {
      showToast('Failed to delete location', 'error');
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
        showToast('Location updated successfully!', 'success');
        setShowLocationModal(false);
        setEditingLocation(null);
      } catch (err) {
        showToast('Failed to update location', 'error');
      }
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t.dashboard.locations}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-zinc-100 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t.dashboard.addLocation}
          </h2>
          <form onSubmit={handleCreateLocation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.locationName}</label>
              <input type="text" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none" value={newLocation.name} onChange={e => setNewLocation({ ...newLocation, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.locationAddress}</label>
              <input type="text" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none" value={newLocation.address} onChange={e => setNewLocation({ ...newLocation, address: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.locationImage}</label>
              <input type="url" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none" value={newLocation.image} onChange={e => setNewLocation({ ...newLocation, image: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.locationMapsUrl}</label>
              <input type="url" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none" value={newLocation.googleMapsUrl} onChange={e => setNewLocation({ ...newLocation, googleMapsUrl: e.target.value })} placeholder="https://maps.google.com/..." />
            </div>
            <button type="submit" className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-zinc-800 transition-colors shadow-sm">{t.dashboard.saveLocation}</button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-6">{t.dashboard.existingLocations}</h2>
          {isLoading ? (
            <div className="text-center py-12 text-zinc-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {locations.map(loc => (
                <div key={loc.id} className="p-4 bg-white border border-zinc-100 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                       <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold">{loc.name}</h4>
                      <p className="text-xs text-zinc-500">{loc.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditLocation(loc)} className="p-2 text-zinc-400 hover:text-black transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteLocation(loc.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showLocationModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">{t.dashboard.editLocation}</h2>
                <button onClick={() => setShowLocationModal(false)} className="p-2 hover:bg-zinc-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={onUpdateLocationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.locationName}</label>
                  <input type="text" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none" value={locationForm.name} onChange={e => setLocationForm({ ...locationForm, name: e.target.value })} required />
                </div>
                {/* ... other fields ... */}
                <button type="submit" className="w-full py-4 bg-black text-white rounded-2xl font-bold">{t.dashboard.saveChanges}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
