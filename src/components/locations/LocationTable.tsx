import { useState, useEffect, MouseEvent } from 'react';
import { 
  Eye, Edit, Trash2, MapPin, RefreshCw, Loader2, ArrowUpRight, Search, Plus, Map as MapIcon, ChevronLeft, ChevronRight, MoreVertical 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Location } from '../../types/location';

interface LocationTableProps {
  locations: Location[];
  isLoading: boolean;
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onView: (location: Location) => void;
  onEdit: (location: Location) => void;
  onDelete: (id: number) => void;
  onCreateOpen: () => void;
  isError: boolean;
}

export const LocationTable = ({
  locations,
  isLoading,
  totalRecords,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  onView,
  onEdit,
  onDelete,
  onCreateOpen,
  isError
}: LocationTableProps) => {
  const { language } = useLanguage();
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

  // Close dropdown when clicking elsewhere
  useEffect(() => {
    const handleCloseDropdown = () => setActiveDropdownId(null);
    window.addEventListener('click', handleCloseDropdown);
    return () => window.removeEventListener('click', handleCloseDropdown);
  }, []);

  const t = {
    ar: {
      title: "قائمة الفروع والمواقع الجغرافية",
      subtitle: "تعيين وتنظيم الإحداثيات والعناوين الجغرافية لشركاء التوصيل والفروع.",
      addBtn: "إضافة موقع جديد",
      searchPlaceholder: "البحث عن المواقع والبحث بالاسم...",
      id: "المعرف",
      name: "اسم الموقع",
      address: "العنوان الكامل",
      lat: "خط العرض",
      lng: "خط الطول",
      notes: "الملاحظات",
      actions: "العمليات",
      view: "عرض التفاصيل",
      edit: "تعديل البيانات",
      delete: "حذف الموقع",
      openInMaps: "فتح في خرائط جوجل",
      viewOnMap: "معاينة سريعة",
      refresh: "تحديث البيانات",
      loading: "جاري جلب المواقع والخرائط الجغرافية...",
      empty: "لم يتم العثور على أية مواقع جغرافية مسجلة.",
      error: "فشل الاتصال مسبقاً، يرجى إعادة المحاولة.",
      limit: "حجم السجل:",
      showing: "عرض {count} من إجمالي {total} موقع"
    },
    en: {
      title: "Location Management",
      subtitle: "Map precise geographical coordinate pins and manage physical hub locations.",
      addBtn: "Add New Location",
      searchPlaceholder: "Search locations by name or address...",
      id: "ID",
      name: "Name",
      address: "Formatted Address",
      lat: "Latitude",
      lng: "Longitude",
      notes: "Notes",
      actions: "Actions",
      view: "View Details",
      edit: "Edit Location",
      delete: "Delete Location",
      openInMaps: "Open in Google Maps",
      viewOnMap: "Quick Map Preview",
      refresh: "Refresh Directory",
      loading: "Fetching registered coverage zones...",
      empty: "No locations found in the directory.",
      error: "Failed to load locations. Please try again.",
      limit: "Limit:",
      showing: "Showing {count} of {total} records"
    }
  };

  const currentT = language === 'ar' ? t.ar : t.en;

  const handleOpenInMaps = (loc: Location, e: MouseEvent) => {
    e.stopPropagation();
    const url = loc.googleMapsUrl || `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 text-start">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 font-sans">{currentT.title}</h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium font-sans">{currentT.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={onRefresh}
            className="p-3 bg-white border border-zinc-200 text-zinc-700 rounded-2xl hover:bg-zinc-50 active:scale-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            title={currentT.refresh}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            type="button"
            onClick={onCreateOpen}
            className="bg-black text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-900 transition-all shadow-md hover:scale-[1.01] cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span className="font-sans">{currentT.addBtn}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Rack */}
      <div className="flex flex-col md:flex-row gap-4 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 font-bold" />
          <input 
            type="text" 
            placeholder={currentT.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm font-semibold font-sans placeholder-zinc-400"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Main Enterprise Location Canvas Table */}
      <div className="bg-white border border-zinc-150 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-150 text-center">
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center font-sans">{currentT.id}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center font-sans">{currentT.name}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center font-sans">{currentT.address}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center font-sans">{currentT.lat}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center font-sans">{currentT.lng}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center font-sans">{currentT.notes}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center font-sans">{currentT.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-center font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-500 font-semibold">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                      <span className="font-sans">{currentT.loading}</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-rose-500 font-semibold font-sans">
                    {currentT.error}
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-400 font-bold font-sans">
                    {currentT.empty}
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-zinc-50/40 transition-colors">
                    {/* ID */}
                    <td className="px-6 py-4 font-mono text-zinc-500 font-semibold text-xs">
                      #{loc.id}
                    </td>

                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center max-w-[180px] mx-auto min-w-0">
                        <span 
                          onClick={() => onView(loc)}
                          className="text-sm font-extrabold text-zinc-900 block truncate hover:underline cursor-pointer"
                        >
                          {loc.name}
                        </span>
                      </div>
                    </td>

                    {/* Formatted Address */}
                    <td className="px-6 py-4 text-xs font-semibold text-zinc-500 max-w-[220px] truncate mx-auto" title={loc.formattedAddress}>
                      {loc.formattedAddress}
                    </td>

                    {/* Latitude */}
                    <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-700">
                      {loc.latitude?.toFixed(5) || 0}
                    </td>

                    {/* Longitude */}
                    <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-700">
                      {loc.longitude?.toFixed(5) || 0}
                    </td>

                    {/* Notes */}
                    <td className="px-6 py-4 text-xs font-medium text-zinc-400 max-w-[150px] truncate" title={loc.notes || ""}>
                      {loc.notes || '-'}
                    </td>

                    {/* Actions controllers */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Short View Details button */}
                        <button
                          type="button"
                          onClick={() => onView(loc)}
                          className="text-xs font-extrabold px-3 py-1.5 bg-zinc-900 text-white rounded-xl hover:bg-black transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'عرض' : 'View'}</span>
                        </button>

                        {/* Direct map picker quick map preview button (BONUS REQUIREMENT) */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenInMaps(loc, e)}
                          className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-150 rounded-xl transition-all cursor-pointer"
                          title={currentT.viewOnMap}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Inline options menu slider dropdown */}
                        <div className="inline-block relative text-start">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(activeDropdownId === loc.id ? null : loc.id);
                            }}
                            className="p-2 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 rounded-xl text-zinc-455 transition-all outline-none cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeDropdownId === loc.id && (
                            <div className={`absolute ${language === 'ar' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'} mt-1.5 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden font-sans`}>
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => onView(loc)}
                                  className="w-full px-4 py-2.5 hover:bg-zinc-50 text-xs font-bold text-zinc-805 flex items-center gap-2 text-start cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>{currentT.view}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onEdit(loc)}
                                  className="w-full px-4 py-2.5 hover:bg-zinc-50 text-xs font-bold text-zinc-805 flex items-center gap-2 text-start cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>{currentT.edit}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenInMaps(loc, e)}
                                  className="w-full px-4 py-2.5 hover:bg-zinc-50 text-xs font-bold text-indigo-700 flex items-center gap-2 text-start cursor-pointer"
                                >
                                  <MapIcon className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>{currentT.openInMaps}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDelete(loc.id)}
                                  className="w-full px-4 py-2.5 hover:bg-rose-50 text-xs font-bold text-rose-700 flex items-center gap-2 text-start border-t border-zinc-100 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                  <span>{currentT.delete}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server Side Pagination Bar matching style of AdminUsers */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-150 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold text-zinc-500 font-sans">
              {currentT.showing
                .replace("{count}", String(locations.length))
                .replace("{total}", String(totalRecords))
              }
            </span>

            {/* Page Limit selects */}
            <div className="flex items-center gap-1.5 ml-2 font-sans">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{currentT.limit}</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-2 py-1 bg-white border border-zinc-200 text-[10px] font-bold rounded-lg outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="flex items-center px-3.5 text-xs font-mono font-bold text-zinc-800 bg-white border border-zinc-200 rounded-xl">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
