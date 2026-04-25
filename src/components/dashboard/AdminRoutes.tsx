import { useState, FormEvent } from 'react';
import { Navigation, Plus, Trash2, CheckCircle2, Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useLocations } from '../../services/locationService';
import { 
  useDeliveryRoute, createDeliveryRoute, deleteDeliveryRoute 
} from '../../services/routeService';
import { DeliveryRoute } from '../../types';

export const AdminRoutes = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  
  const { data: locationsData = [] } = useLocations();
  const locations = Array.isArray(locationsData) ? locationsData : [];

  const [selectedOriginId, setSelectedOriginId] = useState<string | null>(null);
  const { data: routesData = [], refetch: refetchRoutes, isLoading } = useDeliveryRoute(selectedOriginId);
  const routes = Array.isArray(routesData) ? routesData : [];

  const [newRoute, setNewRoute] = useState<Omit<DeliveryRoute, 'id'>>({ 
    origin: '', 
    destination: '', 
    distance: '', 
    price: 0, 
    isAvailable: true 
  });

  const handleCreateRoute = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOriginId) return;
    const originName = locations.find(l => l.id === selectedOriginId)?.name || '';
    try {
      await createDeliveryRoute({ ...newRoute, origin: originName });
      setNewRoute({ origin: '', destination: '', distance: '', price: 0, isAvailable: true });
      refetchRoutes();
      showToast('Route created successfully!', 'success');
    } catch (err) {
      showToast('Failed to create route', 'error');
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      await deleteDeliveryRoute(id);
      refetchRoutes();
      showToast('Route deleted successfully!', 'success');
    } catch (err) {
      showToast('Failed to delete route', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t.dashboard.routes}</h1>
      
      <div className="bg-white border border-zinc-100 rounded-3xl p-8 shadow-sm">
        <label className="block text-sm font-bold mb-4">{t.dashboard.selectOrigin}</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button 
            onClick={() => setSelectedOriginId(null)}
            className={`p-4 rounded-2xl border text-sm font-bold transition-all ${selectedOriginId === null ? 'bg-black text-white border-black' : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:bg-zinc-100'}`}
          >
            {t.dashboard.all}
          </button>
          {locations.map(loc => (
            <button 
              key={loc.id}
              onClick={() => setSelectedOriginId(loc.id)}
              className={`p-4 rounded-2xl border text-sm font-bold transition-all ${selectedOriginId === loc.id ? 'bg-black text-white border-black' : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:bg-zinc-100'}`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {selectedOriginId && (
          <div className="bg-white border border-zinc-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {t.dashboard.addRoute}
            </h2>
            <form onSubmit={handleCreateRoute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.destination}</label>
                <input type="text" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none" value={newRoute.destination} onChange={e => setNewRoute({ ...newRoute, destination: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.distance}</label>
                  <input type="text" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none" value={newRoute.distance} onChange={e => setNewRoute({ ...newRoute, distance: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.price}</label>
                  <input type="number" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none" value={newRoute.price} onChange={e => setNewRoute({ ...newRoute, price: parseInt(e.target.value) })} required />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="route_avail" checked={newRoute.isAvailable} onChange={e => setNewRoute({ ...newRoute, isAvailable: e.target.checked })} className="w-4 h-4 accent-black" />
                <label htmlFor="route_avail" className="text-sm font-bold">{t.dashboard.available}</label>
              </div>
              <button type="submit" className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-zinc-800 transition-colors shadow-sm">{t.dashboard.saveRoute}</button>
            </form>
          </div>
        )}

        <div className={`space-y-4 ${!selectedOriginId ? 'lg:col-span-2' : ''}`}>
          <h2 className="text-xl font-bold mb-6">{t.dashboard.existingRoutes}</h2>
          {isLoading ? (
            <div className="text-center py-12 text-zinc-400">Loading...</div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map(route => (
                <div key={route.id} className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center">
                        <Navigation className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold flex items-center gap-2">
                          {route.origin} <span className="text-zinc-300">→</span> {route.destination}
                        </h4>
                        <p className="text-xs text-zinc-400">{route.distance}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${route.isAvailable ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {route.isAvailable ? t.dashboard.available : t.dashboard.unavailable}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                    <p className="font-black text-primary">{route.price.toFixed(2)} {language === 'ar' ? 'ر.ي' : 'YER'}</p>
                    <button onClick={() => handleDeleteRoute(route.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
