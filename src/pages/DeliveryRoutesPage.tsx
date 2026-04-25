import { useState } from 'react';
import { Search, MapPin, Navigation, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLocations } from '../services/locationService';
import { useDeliveryRoute } from '../services/routeService';
import { DeliveryRoute } from '../types';

export const DeliveryRoutesPage = () => {
  const { language } = useLanguage();
  const [originSearch, setOriginSearch] = useState('');
  const [selectedOriginId, setSelectedOriginId] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);

  const { data: locationsData = [], isLoading: isLoadingLocations } = useLocations();
  const { data: routesData = [], isLoading: isLoadingRoutes } = useDeliveryRoute(selectedOriginId);

  const locations = Array.isArray(locationsData) ? locationsData : [];
  const availableRoutes = Array.isArray(routesData) ? routesData : [];

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(originSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Delivery Prices</h1>
        <p className="text-zinc-500">Check delivery prices and availability between locations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Origin Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              1. Select Origin
            </h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search origin..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-100 rounded-xl focus:outline-none text-sm"
                value={originSearch}
                onChange={(e) => {
                  setOriginSearch(e.target.value);
                  setSelectedOriginId(null);
                  setSelectedRoute(null);
                }}
              />
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {isLoadingLocations ? (
                <p className="text-xs text-zinc-400 text-center py-4">Loading locations...</p>
              ) : (
                filteredLocations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setSelectedOriginId(loc.id);
                      setSelectedRoute(null);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                      selectedOriginId === loc.id 
                        ? 'bg-primary text-white font-bold' 
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {loc.name}
                  </button>
                ))
              )}
              {!isLoadingLocations && filteredLocations.length === 0 && (
                <p className="text-xs text-zinc-400 text-center py-4">No origins found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Destination Selection */}
        <div className="lg:col-span-1">
          <div className={`bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm transition-opacity ${!selectedOriginId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              2. Select Destination
            </h3>
            {!selectedOriginId ? (
              <p className="text-sm text-zinc-400 py-8 text-center">Please select an origin first.</p>
            ) : isLoadingRoutes ? (
              <p className="text-sm text-zinc-400 py-8 text-center">Loading routes...</p>
            ) : availableRoutes.length === 0 ? (
              <p className="text-sm text-zinc-400 py-8 text-center">No routes available from this origin.</p>
            ) : (
              <div className="space-y-2">
                {availableRoutes.map(route => (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex justify-between items-center ${
                      selectedRoute?.id === route.id 
                        ? 'bg-primary text-white font-bold' 
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <span>{route.destination}</span>
                    {!route.isAvailable && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Unavailable</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Route Details */}
        <div className="lg:col-span-1">
          <div className={`bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm h-full transition-opacity ${!selectedRoute ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              3. Route Details
            </h3>
            {!selectedRoute ? (
              <p className="text-sm text-zinc-400 py-8 text-center">Select a destination to see details.</p>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm">Distance</span>
                  <span className="font-bold">{selectedRoute.distance}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm">Delivery Price</span>
                  <span className="text-2xl font-black">{selectedRoute.price.toFixed(2)} {language === 'ar' ? 'ر.ي' : 'YER'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm">Status</span>
                  <span className={`font-bold ${selectedRoute.isAvailable ? 'text-emerald-500' : 'text-red-500'}`}>
                    {selectedRoute.isAvailable ? 'Available Now' : 'Currently Unavailable'}
                  </span>
                </div>
                
                {selectedRoute.isAvailable ? (
                  <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold mt-4 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
                    Start Order from this Route
                  </button>
                ) : (
                  <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm text-center">
                    This route is currently not accepting new orders.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
