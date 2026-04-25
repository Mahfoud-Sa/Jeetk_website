import { useState, FormEvent } from 'react';
import { Search, Plus, MapPin, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { useLocations } from '../services/locationService';
import { LocationRequest } from '../types';

export const LocationsPage = () => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({});
  const [requests, setRequests] = useState<LocationRequest[]>([
    { id: 'req1', name: 'Neukölln', address: 'Sonnenallee 1, 12047 Berlin', status: 'pending', timestamp: new Date() },
    { id: 'req2', name: 'Charlottenburg', address: 'Kurfürstendamm 1, 10719 Berlin', status: 'approved', timestamp: new Date() },
  ]);
  const [newRequest, setNewRequest] = useState({ name: '', address: '' });

  const { data: locationsData = [], isLoading } = useLocations();
  const locations = Array.isArray(locationsData) ? locationsData : [];

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitRequest = (e: FormEvent) => {
    e.preventDefault();
    if (!newRequest.name || !newRequest.address) return;
    
    const request: LocationRequest = {
      id: `req${Date.now()}`,
      name: newRequest.name,
      address: newRequest.address,
      status: 'pending',
      timestamp: new Date(),
    };
    
    setRequests([request, ...requests]);
    setNewRequest({ name: '', address: '' });
    showToast('Location request sent! It will be added once an admin approves it.', 'success');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-zinc-500">Loading locations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Our Locations</h1>
          <p className="text-zinc-500">Find a Jeetk hub near you.</p>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <Plus className="w-5 h-5" />
          Add My Location Request
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search locations by name or address..."
          className="w-full pl-12 pr-4 py-4 bg-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {filteredLocations.map(loc => {
           return (
            <div key={loc.id} className="group bg-white border border-zinc-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all flex flex-col">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={loc.image || 'https://picsum.photos/seed/jeetk-location/800/600'} 
                  alt={loc.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/jeetk-placeholder/800/600';
                  }}
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2">{loc.name}</h3>
                <p className="text-zinc-500 text-sm mb-4 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {loc.address}
                </p>
                <a 
                  href={loc.googleMapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(loc.address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-black hover:underline mb-6"
                >
                  View on Google Maps
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
        {filteredLocations.length === 0 && (
          <div className="col-span-full text-center py-20 bg-zinc-50 rounded-3xl">
            <p className="text-zinc-500">No locations found matching your search.</p>
          </div>
        )}
      </div>


      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
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
              className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Location Requests</h2>
                <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form */}
                <div>
                  <h3 className="font-bold mb-4">Request New Location</h3>
                  <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Location Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-zinc-100 rounded-xl focus:outline-none"
                        placeholder="e.g. Wedding"
                        value={newRequest.name}
                        onChange={e => setNewRequest({...newRequest, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-500 mb-1">Full Address</label>
                      <textarea 
                        required
                        className="w-full px-4 py-3 bg-zinc-100 rounded-xl focus:outline-none h-24 resize-none"
                        placeholder="Street, Zip, City"
                        value={newRequest.address}
                        onChange={e => setNewRequest({...newRequest, address: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform">
                      Send Request
                    </button>
                  </form>
                </div>

                {/* List of requests */}
                <div>
                  <h3 className="font-bold mb-4">Recent Requests</h3>
                  <div className="space-y-4">
                    {requests.map(req => (
                      <div key={req.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold">{req.name}</h4>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1">{req.address}</p>
                        <p className="text-[10px] text-zinc-400 mt-2">{req.timestamp.toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
