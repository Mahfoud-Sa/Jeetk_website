import { useState, useEffect, FormEvent } from 'react';
import { 
  Plus, X, Search, Edit, Trash2, Utensils, Star, Clock, DollarSign, 
  Image as ImageIcon, Loader2, RefreshCw, AlertCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Restaurant } from '../../types';
import { 
  getRestaurantsPaged, 
  createRestaurant, 
  updateRestaurant, 
  deleteRestaurant,
  PaginatedRestaurantsResponse
} from '../../services/restaurantService';

export const AdminRestaurants = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  
  // Advanced Server-Side Pagination, Debounced Search, and Category Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [restaurantsPagedData, setRestaurantsPagedData] = useState<PaginatedRestaurantsResponse>({
    items: [],
    totalItems: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  // Form states for creating & updating
  const [form, setForm] = useState({
    name: '',
    category: 'Burgers',
    deliveryTime: '20-30 min',
    deliveryFee: 350,
    image: '',
    description: '',
    rating: 4.5
  });

  // Debouncing search updates to optimize network requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on active search typing
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadPagedRestaurants = async () => {
    setIsLoading(true);
    try {
      const data = await getRestaurantsPaged(
        currentPage,
        pageSize,
        debouncedSearch,
        selectedCategory
      );
      setRestaurantsPagedData(data);
    } catch (err) {
      console.error("Failed to fetch paginated restaurants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPagedRestaurants();
  }, [currentPage, pageSize, debouncedSearch, selectedCategory]);

  useEffect(() => {
    // Listen to reactive restaurant updates across the platform (such as menu items updates)
    const handleUpdate = () => {
      loadPagedRestaurants();
    };
    window.addEventListener("jeetk_restaurants_updated", handleUpdate);
    return () => {
      window.removeEventListener("jeetk_restaurants_updated", handleUpdate);
    };
  }, [currentPage, pageSize, debouncedSearch, selectedCategory]);

  const refetchRestaurants = () => {
    loadPagedRestaurants();
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      showToast(
        language === 'ar' ? 'يرجى إكمال الحقول الإلزامية المطلوبة' : 'Please fill in all mandatory fields',
        'error'
      );
      return;
    }

    try {
      const imgToUse = form.image.trim() || `https://picsum.photos/seed/${form.name.toLowerCase().replace(/\s+/g, '')}/800/600`;
      
      await createRestaurant({
        name: form.name.trim(),
        category: form.category,
        deliveryTime: form.deliveryTime,
        deliveryFee: Number(form.deliveryFee) || 0,
        image: imgToUse,
        description: form.description.trim(),
        rating: Number(form.rating) || 4.5
      });

      // Clear form & close modal
      setForm({
        name: '',
        category: 'Burgers',
        deliveryTime: '20-30 min',
        deliveryFee: 350,
        image: '',
        description: '',
        rating: 4.5
      });
      setShowModal(false);

      await loadPagedRestaurants();
      showToast(
        language === 'ar' ? 'تمت إضافة المطعم الجديد بنجاح في النظام!' : 'New restaurant added successfully in the API backend!',
        'success'
      );
    } catch (err) {
      showToast(
        language === 'ar' ? 'فشل إتمام عملية تسجيل المطعم' : 'Failed to register the restaurant in the backend',
        'error'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا المطعم بالكامل؟' : 'Are you sure you want to completely delete this restaurant?')) return;
    try {
      await deleteRestaurant(id);
      await loadPagedRestaurants();
      showToast(
        language === 'ar' ? 'تم حذف سجل المطعم بنجاح' : 'Restaurant deleted successfully from the API backend!',
        'success'
      );
    } catch (err) {
      showToast(
        language === 'ar' ? 'فشل حذف المطعم من قاعدة البيانات' : 'Failed to delete restaurant from the backend',
        'error'
      );
    }
  };

  const openAddModal = () => {
    setEditingRestaurant(null);
    setForm({
      name: '',
      category: 'Burgers',
      deliveryTime: '20-30 min',
      deliveryFee: 350,
      image: '',
      description: '',
      rating: 4.5
    });
    setShowModal(true);
  };

  const openEditModal = (res: Restaurant) => {
    setEditingRestaurant(res);
    setForm({
      name: res.name,
      category: res.category,
      deliveryTime: res.deliveryTime,
      deliveryFee: res.deliveryFee,
      image: res.image,
      description: res.description,
      rating: res.rating
    });
    setShowModal(true);
  };

  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant) return;
    if (!form.name.trim() || !form.description.trim()) {
      showToast(
        language === 'ar' ? 'يرجى إدخال اسم ووصف المطعم' : 'Please provide a restaurant name and description',
        'error'
      );
      return;
    }

    try {
      await updateRestaurant(editingRestaurant.id, {
        name: form.name.trim(),
        category: form.category,
        deliveryTime: form.deliveryTime,
        deliveryFee: Number(form.deliveryFee) || 0,
        image: form.image.trim(),
        description: form.description.trim(),
        rating: Number(form.rating) || 4.5
      });

      setShowModal(false);
      setEditingRestaurant(null);
      // Reset form
      setForm({
        name: '',
        category: 'Burgers',
        deliveryTime: '20-30 min',
        deliveryFee: 350,
        image: '',
        description: '',
        rating: 4.5
      });

      await loadPagedRestaurants();
      showToast(
        language === 'ar' ? 'تم تعديل بيانات المطعم بنجاح!' : 'Restaurant updated successfully in the API backend!',
        'success'
      );
    } catch (err) {
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء إجراء التعديل' : 'Failed to update restaurant in the backend',
        'error'
      );
    }
  };

  const categoriesList = ['Burgers', 'Japanese', 'Italian', 'Healthy', 'Pizza', 'Desserts', 'Arabic', 'Indian'];

  return (
    <div className="space-y-6 text-start font-arabic">
      {/* Enterprise Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">{language === 'ar' ? 'إدارة المطاعم الشريكة' : 'Partner Restaurants'}</h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
            {language === 'ar' 
              ? 'إدارة سجلات المطاعم الشريكة، ربط الفروع الجغرافية، تعيين الأطباق وتصنيف الأطعمة والأسعار.' 
              : 'Add, update and oversee corporate dining partners, culinary classifications, ratings and delivery rates.'}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Refresh Action Trigger */}
          <button
            type="button"
            onClick={refetchRestaurants}
            className="p-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-2xl text-zinc-600 transition-all cursor-pointer hover:rotate-180 duration-500 shadow-sm"
            title={language === 'ar' ? 'تحديث البيانات' : 'Refresh database'}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          {/* Add Restaurant button matching the style of Add User */}
          <button 
            type="button"
            onClick={openAddModal}
            className="bg-black text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-900 transition-all shadow-md hover:scale-[1.01] cursor-pointer"
          >
            <Plus className="w-5 h-5 text-white" />
            <span>{language === 'ar' ? 'إضافة مطعم شريك' : 'Add Restaurant'}</span>
          </button>
        </div>
      </div>
      
      {/* Advanced Filter Racks */}
      <div className="flex flex-col md:flex-row gap-4 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 font-bold" />
          <input 
            type="text" 
            placeholder={language === 'ar' ? 'ابحث باسم المطعم، التصنيف، الوصف...' : 'Search by name, category, profile details...'}
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">{language === 'ar' ? 'التصنيف' : 'Category'}</span>
          <select 
            className="px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-xs font-bold text-zinc-700 font-sans cursor-pointer"
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">{language === 'ar' ? 'كافة التصنيفات' : 'All Categories'}</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Enterprise Restaurants Table Canvas */}
      <div className="bg-white border border-zinc-150 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-150 text-center">
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'الغلاف' : 'Cover'}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'اسم الـمـطـعـم والـوصـف' : 'Restaurant & Description'}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'التصنيف الرئيسي' : 'Main Category'}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'التقييم' : 'Rating'}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'وقت التوصيل' : 'Delivery Time'}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'العمليات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-500 font-semibold font-sans">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                      <span>{language === 'ar' ? 'جاري استيراد وجلب قائمة المطاعم الشريكة...' : 'Connecting to API server and fetching live directory...'}</span>
                    </div>
                  </td>
                </tr>
              ) : restaurantsPagedData.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-400 font-bold font-sans">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Utensils className="w-8 h-8 text-zinc-300" />
                      <span>{language === 'ar' ? 'لم يتم العثور على أي مطاعم مسجلة حالياً تطابق الشروط.' : 'No restaurant profiles matched the current query.'}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                restaurantsPagedData.items.map((res) => {
                  return (
                    <tr key={res.id} className="hover:bg-zinc-50/40 transition-colors">
                      {/* Column 1: Cover image */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <img 
                            referrerPolicy="no-referrer"
                            src={res.image} 
                            alt={res.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-150 shadow-inner"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/restaurant/200';
                            }}
                          />
                        </div>
                      </td>

                      {/* Column 2: Name & Description */}
                      <td className="px-6 py-4 text-center max-w-xs">
                        <div className="font-extrabold text-sm text-zinc-800 leading-tight block">{res.name}</div>
                        <p className="text-xs text-zinc-500 font-medium line-clamp-2 mt-1 mx-auto leading-relaxed">{res.description}</p>
                      </td>

                      {/* Column 3: Category with Beautiful Custom Badges style */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                            res.category === 'Burgers' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                            res.category === 'Italian' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                            res.category === 'Arabic' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                            res.category === 'Japanese' ? 'bg-purple-50 border-purple-100 text-purple-700' :
                            res.category === 'Healthy' ? 'bg-sky-50 border-sky-100 text-sky-700' :
                            'bg-zinc-100 border-zinc-200 text-zinc-700'
                          }`}>
                            {res.category}
                          </span>
                        </div>
                      </td>

                      {/* Column 4: Rating */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-xs font-mono text-zinc-800">
                          <Star className="w-3.5 h-3.5 text-amber-550 fill-current" />
                          <span>{res.rating}</span>
                        </div>
                      </td>

                      {/* Column 5: Delivery Time */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs font-bold text-zinc-500 font-sans">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{res.deliveryTime}</span>
                        </div>
                      </td>

                      {/* Column 6: Delivery Fee */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-xs text-zinc-800 font-mono">
                          <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{res.deliveryFee === 0 ? (language === 'ar' ? 'مجاني' : 'Free') : `${res.deliveryFee} ${language === 'ar' ? 'رس' : 'YER'}`}</span>
                        </div>
                      </td>

                      {/* Column 7: Action Controllers */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            type="button"
                            onClick={() => openEditModal(res)} 
                            className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
                            title={language === 'ar' ? 'تعديل بيانات الشريك' : 'Edit Partner Info'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDelete(res.id)} 
                            className="p-2 text-zinc-400 hover:text-red-650 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title={language === 'ar' ? 'حذف الشريك نهائياً' : 'Delete Partner'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server Side Pagination Control footer bar matching AdminUsers.tsx */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-150 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold text-zinc-500 font-mono">
              {language === 'ar' 
                ? `عرض ${restaurantsPagedData.items.length} سجل من إجمالي ${restaurantsPagedData.totalItems} مطعم شريك`
                : `Showing ${restaurantsPagedData.items.length} of ${restaurantsPagedData.totalItems} registered partners`}
            </span>

            {/* Page Limit selector dropdown */}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'ar' ? 'حجم السجل:' : 'Limit:'}</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1 bg-white border border-zinc-200 text-[10px] font-bold rounded-lg outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              {language === 'ar' ? 'السابق' : 'Previous'}
            </button>
            <span className="flex items-center px-3.5 text-xs font-mono font-bold text-zinc-800 bg-white border border-zinc-200 rounded-xl">
              {currentPage} / {restaurantsPagedData.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={currentPage >= restaurantsPagedData.totalPages || isLoading}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, restaurantsPagedData.totalPages))}
              className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              {language === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      {/* Editing & Addition Dialogue Overlay Modal */}
      <AnimatePresence>
        {showModal && (
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
              className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <Utensils className="w-5 h-5 text-zinc-900" />
                  <h2 className="text-xl font-black text-zinc-905">
                    {editingRestaurant 
                      ? (language === 'ar' ? 'تعديل بيانات المطعم الشريك' : 'Edit Restaurant Profile')
                      : (language === 'ar' ? 'تسجيل مطعم جديد' : 'Register New Partner')}
                  </h2>
                </div>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setEditingRestaurant(null);
                  }} 
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={editingRestaurant ? handleUpdateSubmit : handleCreateSubmit} className="space-y-4">
                {/* Name */}
                <div className="text-start">
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                    {language === 'ar' ? 'اسم المطعم (مطلوب)' : 'Restaurant Name (Required)'}
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-xs font-bold text-zinc-800" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    required 
                    placeholder={language === 'ar' ? 'مثال: مطعم مذاقي السياحي' : 'e.g. My Taste Restaurant'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="text-start">
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                      {language === 'ar' ? 'التصنيف الرئيسي' : 'Main Category'}
                    </label>
                    <select 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-xs font-bold text-zinc-800 cursor-pointer"
                      value={form.category} 
                      onChange={e => setForm({ ...form, category: e.target.value })}
                    >
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rating */}
                  <div className="text-start">
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                      {language === 'ar' ? 'التقييم الأصلي' : 'Initial Rating'}
                    </label>
                    <input 
                      type="number" 
                      step="0.1"
                      max="5"
                      min="1"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-xs font-bold font-mono text-zinc-800" 
                      value={form.rating} 
                      onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) || 4.5 })} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Delivery time */}
                  <div className="text-start">
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                      {language === 'ar' ? 'وقت التوصيل المقدر' : 'Est. Delivery Time'}
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-xs font-bold text-zinc-800" 
                      value={form.deliveryTime} 
                      onChange={e => setForm({ ...form, deliveryTime: e.target.value })} 
                      placeholder="20-30 min"
                    />
                  </div>

                  {/* Delivery fee */}
                  <div className="text-start">
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                      {language === 'ar' ? 'رسوم التوصيل (ريال)' : 'Delivery Fee (YER)'}
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-xs font-bold font-mono text-zinc-800" 
                      value={form.deliveryFee} 
                      onChange={e => setForm({ ...form, deliveryFee: parseInt(e.target.value) || 0 })} 
                    />
                  </div>
                </div>

                {/* Banner image URL */}
                <div className="text-start">
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                    {language === 'ar' ? 'رابط صورة الغلاف (اختياري)' : 'Cover Image URL (Optional)'}
                  </label>
                  <input 
                    type="url" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-xs font-bold text-zinc-800" 
                    value={form.image} 
                    onChange={e => setForm({ ...form, image: e.target.value })} 
                    placeholder="https://images.unsplash.com/..." 
                  />
                </div>

                {/* Description */}
                <div className="text-start">
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                    {language === 'ar' ? 'وصف المطعم والوجبات (مطلوب)' : 'Restaurant Description (Required)'}
                  </label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 text-xs font-bold resize-none font-arabic text-zinc-800 leading-relaxed" 
                    value={form.description} 
                    onChange={e => setForm({ ...form, description: e.target.value })} 
                    required 
                    placeholder={language === 'ar' ? 'برجر مشوي ممتاز وذو تقييم عالي يقدم أشهى المأكولات...' : 'Gourmet burgers and local delicacies with ultra-fast delivery.'}
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100 mt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowModal(false);
                      setEditingRestaurant(null);
                    }} 
                    className="px-5 py-3 border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    {language === 'ar' ? 'إلغاء الأمر' : 'Cancel'}
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-black text-white rounded-xl text-xs font-bold hover:bg-zinc-900 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
                  >
                    {editingRestaurant 
                      ? (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                      : (language === 'ar' ? 'إضافة المطعم الشريك' : 'Register Restaurant Partner')}
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
