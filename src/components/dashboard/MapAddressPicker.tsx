import { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Search, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const getApiKey = (): string => {
  const envKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY;
  const sanitizedEnvKey = envKey ? envKey.trim() : '';
  
  if (
    sanitizedEnvKey && 
    sanitizedEnvKey !== '' && 
    sanitizedEnvKey !== 'YOUR_API_KEY' && 
    sanitizedEnvKey !== 'undefined' && 
    sanitizedEnvKey !== 'null'
  ) {
    return sanitizedEnvKey;
  }
  return 'AIzaSyBEiqXmX9-Gp9KXkF1LW9fO9B2GsacXpAc';
};

export const API_KEY = getApiKey();

// Log key loaded for diagnostics
console.log(
  "[Google Maps] Active Key loaded: %s...%s", 
  API_KEY.substring(0, 6), 
  API_KEY.substring(API_KEY.length - 4)
);

export const hasValidKey = Boolean(API_KEY) && 
  API_KEY !== 'YOUR_API_KEY' && 
  API_KEY !== 'undefined' && 
  API_KEY !== 'null' && 
  API_KEY !== '';

interface MapAddressPickerProps {
  onLocationSelect: (data: { 
    name: string; 
    address: string; 
    googleMapsUrl: string;
    latitude: number;
    longitude: number;
    googlePlaceId?: string;
  }) => void;
  initialAddress?: string;
  initialName?: string;
  initialUrl?: string;
  initialLat?: number;
  initialLng?: number;
}

// Coordinate parsing helper
const parseCoordsFromUrl = (url?: string): { lat: number; lng: number } | null => {
  if (!url) return null;
  try {
    // Check if contains q=lat,lng
    const qMatch = url.match(/[?&]q=([-\d.]+),([-\d.]+)/);
    if (qMatch) {
      return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    }
    // Check if contains @lat,lng
    const atMatch = url.match(/@([-\d.]+),([-\d.]+)/);
    if (atMatch) {
      return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    }
  } catch (e) {
    console.warn("Failed to parse coords from URL", e);
  }
  return null;
};

// Internal Map Component that handles geocoding, markers, and places
function InteractiveMap({ 
  position, 
  setPosition, 
  onLocationSelect, 
  initialAddress, 
  initialName 
}: { 
  position: { lat: number; lng: number }; 
  setPosition: (pos: { lat: number; lng: number }) => void;
  onLocationSelect: (data: { 
    name: string; 
    address: string; 
    googleMapsUrl: string;
    latitude: number;
    longitude: number;
    googlePlaceId?: string;
  }) => void;
  initialAddress?: string;
  initialName?: string;
}) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const { language } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [typedAddress, setTypedAddress] = useState(initialAddress || '');
  const [typedName, setTypedName] = useState(initialName || '');
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  // Initialize Services
  useEffect(() => {
    if (!placesLib || !map) return;
    autocompleteService.current = new google.maps.places.AutocompleteService();
    geocoder.current = new google.maps.Geocoder();
  }, [placesLib, map]);

  // Sync map center when position changes
  useEffect(() => {
    if (map && position) {
      map.panTo(position);
    }
  }, [map, position]);

  // Handle Query Changes
  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim() || !autocompleteService.current) {
      setPredictions([]);
      return;
    }

    setIsSearching(true);
    autocompleteService.current.getPlacePredictions(
      {
        input: val,
        locationBias: map?.getCenter() || undefined,
        language: language === 'ar' ? 'ar' : 'en',
      },
      (results, status) => {
        setIsSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
        } else {
          setPredictions([]);
        }
      }
    );
  };

  // Select a Place Prediction
  const handleSelectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesLib || !map) return;
    setSearchQuery(prediction.description);
    setPredictions([]);

    const placesService = new google.maps.places.PlacesService(map);
    placesService.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['name', 'formatted_address', 'geometry'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const newPos = { lat, lng };
          
          setPosition(newPos);
          map.panTo(newPos);
          map.setZoom(16);

          const name = place.name || prediction.structured_formatting.main_text;
          const address = place.formatted_address || prediction.description;
          setTypedName(name);
          setTypedAddress(address);

          // Return result
          onLocationSelect({
            name,
            address,
            googleMapsUrl: `https://www.google.com/maps/?q=${lat},${lng}`,
            latitude: lat,
            longitude: lng,
            googlePlaceId: prediction.place_id
          });
        }
      }
    );
  };

  // Reverse Geocoding on Map Click
  const handleMapClick = (e: any) => {
    // Safely support both standard google maps event and vis.gl custom event wrappers
    let latLng: google.maps.LatLng | null = null;
    if (e.detail && e.detail.latLng) {
      latLng = e.detail.latLng;
    } else if (e.latLng) {
      latLng = e.latLng;
    }

    if (!latLng) return;

    const lat = typeof latLng.lat === 'function' ? latLng.lat() : (latLng as any).lat;
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : (latLng as any).lng;

    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return;

    const newPos = { lat, lng };
    
    // 1. Instantly place the red marker and pan the map
    setPosition(newPos);
    map?.panTo(newPos);

    // 2. IMMEDIATELY update the form coordinate fields for instant user feedback
    onLocationSelect({
      name: typedName || `Branch / Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
      address: typedAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      googleMapsUrl: `https://www.google.com/maps/?q=${lat},${lng}`,
      latitude: lat,
      longitude: lng
    });

    // 3. Reverse Geocode in local background (if geocoder service is ready) to enrich details
    if (!geocoder.current) return;

    geocoder.current.geocode({ location: newPos }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const address = results[0].formatted_address;
        
        // Find compound components to suggest a name, or default
        let nameSuggested = '';
        const types = ['establishment', 'point_of_interest', 'neighborhood', 'premise'];
        for (const res of results) {
          if (res.types.some(t => types.includes(t))) {
            const part = res.address_components[0]?.long_name;
            if (part && isNaN(Number(part))) {
              nameSuggested = part;
              break;
            }
          }
        }
        
        if (!nameSuggested) {
          nameSuggested = `Branch / ${results[0].address_components[1]?.long_name || 'Riyadh Zone'}`;
        }

        setTypedAddress(address);
        setTypedName(nameSuggested);

        // Update again with enriched address information
        onLocationSelect({
          name: nameSuggested,
          address,
          googleMapsUrl: `https://www.google.com/maps/?q=${lat},${lng}`,
          latitude: lat,
          longitude: lng,
          googlePlaceId: results[0].place_id
        });
      }
    });
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Search Bar Input Custom Design */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder={language === 'ar' ? 'ابحث عن فروع، شوارع ومواقع...' : 'Search branches, streets and coordinates...'}
          className="w-full pl-9 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
        />
        {isSearching && (
          <div className="absolute right-3 top-3.5">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        )}

        {/* Prediction Results Dropdown */}
        {predictions.length > 0 && (
          <div className="absolute left-0 right-0 mt-1.5 bg-white border border-zinc-150 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto">
            {predictions.map((p) => (
              <button
                key={p.place_id}
                type="button"
                onClick={() => handleSelectPrediction(p)}
                className="w-full text-left rtl:text-right px-4 py-3 hover:bg-zinc-55 flex items-start gap-2.5 transition-colors text-xs border-b border-zinc-50 last:border-b-0"
              >
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-zinc-800">{p.structured_formatting.main_text}</div>
                  <div className="text-zinc-500 font-extrabold mt-0.5">{p.structured_formatting.secondary_text}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Map Elements Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-150 shadow-inner h-[320px] min-h-[300px] bg-zinc-50 w-full">
        <Map
          defaultCenter={position}
          defaultZoom={14}
          mapId="DEMO_MAP_ID"
          onClick={handleMapClick}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '320px', minHeight: '320px' }}
          gestureHandling="cooperative"
          disableDefaultUI={false}
        >
          <AdvancedMarker position={position}>
            <Pin background="#ea4335" glyphColor="#fff" scale={1.1} />
          </AdvancedMarker>
        </Map>

        {/* Floating guidance note */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-bold text-zinc-600 border border-zinc-100 flex items-center gap-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse shrink-0" />
          <span>
            {language === 'ar' ? 'انقر في أي مكان على الخريطة لتغيير دبوس تحديد الموقع الجغرافي تلقائياً.' : 'Click anywhere on the map to accurately place the geolocation pin.'}
          </span>
        </div>
      </div>

      {/* Extracted suggestions display indicator */}
      {typedAddress && (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4.5">
          <div className="flex gap-2.5">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-extrabold text-zinc-500 block mb-1">
                {language === 'ar' ? 'العنوان الجغرافي المستكشف:' : 'Auto-detected Location details:'}
              </span>
              <p className="font-extrabold text-primary leading-relaxed">{typedAddress}</p>
              {typedName && (
                <p className="mt-1.5 text-zinc-600 font-extrabold">
                  {language === 'ar' ? 'الاسم المقترح: ' : 'Suggested name: '}
                  <span className="text-zinc-800">{typedName}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MapAddressPicker({ 
  onLocationSelect, 
  initialAddress = '', 
  initialName = '', 
  initialUrl = '',
  initialLat,
  initialLng
}: MapAddressPickerProps) {
  const { language } = useLanguage();
  const [position, setPosition] = useState<{ lat: number; lng: number }>(() => {
    if (initialLat !== undefined && initialLng !== undefined && !isNaN(initialLat) && !isNaN(initialLng) && initialLat !== 0 && initialLng !== 0) {
      return { lat: initialLat, lng: initialLng };
    }
    const parsed = parseCoordsFromUrl(initialUrl);
    return parsed || { lat: 24.7136, lng: 46.6753 }; // Riyadh center coords default
  });

  // Handle external initialUrl, initialLat, initialLng updates
  useEffect(() => {
    if (initialLat !== undefined && initialLng !== undefined && !isNaN(initialLat) && !isNaN(initialLng) && initialLat !== 0 && initialLng !== 0) {
      setPosition({ lat: initialLat, lng: initialLng });
    } else {
      const parsed = parseCoordsFromUrl(initialUrl);
      if (parsed) {
        setPosition(parsed);
      }
    }
  }, [initialUrl, initialLat, initialLng]);

  if (!hasValidKey) {
    return (
      <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="font-bold text-zinc-800">
            {language === 'ar' ? 'مفتاح خرائط Google مطلوب' : 'Google Maps Integration Inactive'}
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-bold">
            {language === 'ar' ? 'حدد مفتاح خريطة Google للاستفادة الكاملة من مستكشف العناوين والطلب التفاعلي.' : 'Configure your Maps API Key to enable professional point-and-click address picker.'}
          </p>
        </div>

        {/* Steps info box according to skill constraints */}
        <div className="bg-white border border-zinc-150 rounded-xl p-4 text-left font-sans text-xs text-zinc-600 space-y-2.5">
          <div className="font-bold text-zinc-800 border-b border-zinc-100 pb-1.5">
            {language === 'ar' ? 'خطوات تفعيل الخرائط:' : 'Activation Instructions:'}
          </div>
          <ol className="list-decimal list-inside space-y-1 text-zinc-500 leading-normal">
            <li>
              <a 
                href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                target="_blank" 
                rel="noopener"
                className="text-primary hover:underline font-semibold"
              >
                {language === 'ar' ? 'احصل على مفتاح API الخاص بك' : 'Obtain your Maps API Key'}
              </a>
            </li>
            <li>{language === 'ar' ? 'انقر على الإعدادات (أيقونة الترس ⚙️ في الزاوية العلوية اليمنى) ثم أسرار Secrets.' : 'Open Settings (⚙️ gear icon, top-right corner) -> Choose Secrets.'}</li>
            <li>{language === 'ar' ? 'أدخل اسم المتغير: GOOGLE_MAPS_PLATFORM_KEY وقيمته هى المفتاح.' : 'Add secret with key GOOGLE_MAPS_PLATFORM_KEY and paste your API key.'}</li>
          </ol>
          <div className="pt-1 text-[10px] text-zinc-400 italic">
            * {language === 'ar' ? 'سيتم تصفح الخريطة مباشرة بمجرد الحفظ دون الحاجة لتحديث الصفحة.' : 'The map will activate automatically once you add the secret.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <InteractiveMap
        position={position}
        setPosition={setPosition}
        onLocationSelect={onLocationSelect}
        initialAddress={initialAddress}
        initialName={initialName}
      />
    </APIProvider>
  );
}
