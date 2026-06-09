import { useState, useEffect, FormEvent } from 'react';
import { Plus, X, Search, Edit, Trash2, Utensils, Sparkles, Star, Clock, DollarSign, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Restaurant } from '../../types';
import { 
  getRestaurants, 
  createRestaurant, 
  updateRestaurant, 
  deleteRestaurant 
} from '../../services/restaurantService';

export const AdminRestaurants = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  // Form states for creating & updating
  const [form, setForm] = useState({
    name: '',
    category: 'Burgers',
    deliveryTime: '20-30 min',
    deliveryFee: 500,
    image: '',
    description: '',
    rating: 4.5
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error("Failed to fetch restaurants list", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Listen to reactive restaurant updates in other places
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener("jeetk_restaurants_updated", handleUpdate);
    return () => {
      window.removeEventListener("jeetk_restaurants_updated", handleUpdate);
    };
  }, []);

  const handleCreate = async (e: FormEvent) => {
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

      // Clear form
      setForm({
        name: '',
        category: 'Burgers',
        deliveryTime: '20-30 min',
        deliveryFee: 500,
        image: '',
        description: '',
        rating: 4.5
      });

      await loadData();
      showToast(
        language === 'ar' ? 'تمت إضافة المطعم الجديد بنجاح!' : 'Restaurant added successfully!',
        'success'
      );
    } catch (err) {
      showToast(
        language === 'ar' ? 'فشل إتمام عملية تسجيل المطعم' : 'Failed to register the restaurant',
        'error'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا المطعم بالكامل؟' : 'Are you sure you want to completely delete this restaurant?')) return;
    try {
      await deleteRestaurant(id);
      await loadData();
      showToast(
        language === 'ar' ? 'تم توقيف وإزالة سجل المطعم بنجاح' : 'Restaurant deleted successfully!',
        'success'
      );
    } catch (err) {
      showToast(
        language === 'ar' ? 'فشل استبعاد المطعم من قاعدة البيانات' : 'Failed to delete restaurant',
        'error'
      );
    }
  };

  const openEdit = (res: Restaurant) => {
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

      await loadData();
      setShowModal(false);
      setEditingRestaurant(null);
      // Reset form
      setForm({
        name: '',
        category: 'Burgers',
        deliveryTime: '20-30 min',
        deliveryFee: 500,
        image: '',
        description: '',
        rating: 4.5
      });

      showToast(
        language === 'ar' ? 'تم تعديل مصفوفة بيانات المطعم وبنود الخدمة بنجاح!' : 'Restaurant updated successfully!',
        'success'
      );
    } catch (err) {
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء إجراء التعديل' : 'Failed to update restaurant',
        'error'
      );
    }
  };

  const categoriesList = ['Burgers', 'Japanese', 'Italian', 'Healthy', 'Pizza', 'Desserts', 'Arabic', 'Indian'];

  const filteredRestaurants = restaurants.filter(res => {
    const matchesSearch = 
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-sans text-zinc-900 tracking-tight flex items-center gap-3">
            <Utensils className="w-8 h-8 text-primary shrink-0" />
            {language === 'ar' ? 'إدارة المطاعم الشريكة' : 'Manage Restaurants'}
          </h1>
          <p className="text-sm font-bold text-zinc-500 mt-1">
            {language === 'ar' ? 'إضافة وتعديل وحذف سجلات المطاعم، تحديد التصنيف، وأوقات ورسوم خدمات التوصيل.' : 'Add, edit and monitor corporate restaurants, establish delivery bounds, categories, and service timings.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Aspect: Create Form Panel */}
        <div className="xl:col-span-5 bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="border-b border-zinc-100 pb-4">
            <h2 className="text-xl font-extrabold flex items-center gap-2.5 text-zinc-800">
              <Plus className="w-5.5 h-5.5 text-primary" />
              {language === 'ar' ? 'تسجيل مطعم جديد' : 'Register New Restaurant'}
            </h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                {language === 'ar' ? 'اسم المطعم' : 'Restaurant Name'}
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                required 
                placeholder={language === 'ar' ? 'مثال: برجر هاوس الذهبي' : 'e.g. Golden Burger House'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                  {language === 'ar' ? 'التصنيف الرئيسي' : 'Main Category'}
                </label>
                <select 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold"
                  value={form.category} 
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                  {language === 'ar' ? 'التقييم الأولي' : 'Initial Rating'}
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  max="5"
                  min="1"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold" 
                  value={form.rating} 
                  onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) || 4.5 })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                  {language === 'ar' ? 'وقت التوصيل المقدر' : 'Est. Delivery Time'}
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold" 
                  value={form.deliveryTime} 
                  onChange={e => setForm({ ...form, deliveryTime: e.target.value })} 
                  placeholder="20-30 min"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                  {language === 'ar' ? 'رسوم التوصيل (هللة)' : 'Delivery Fee (Halalas)'}
                </label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold font-mono" 
                  value={form.deliveryFee} 
                  onChange={e => setForm({ ...form, deliveryFee: parseInt(e.target.value) || 0 })} 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                {language === 'ar' ? 'رابط صورة الغلاف المعبرة' : 'Cover Image URL'}
              </label>
              <input 
                type="url" 
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold" 
                value={form.image} 
                onChange={e => setForm({ ...form, image: e.target.value })} 
                placeholder="https://images.unsplash.com/promo-burger..." 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                {language === 'ar' ? 'شرح ووصف المطعم' : 'Restaurant Description'}
              </label>
              <textarea 
                rows={3}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold resize-none" 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })} 
                required 
                placeholder={language === 'ar' ? 'وصف الوجبات والامتيازات...' : 'Describe gourmet bounds, organic secrets, etc.'}
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full py-3.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 active:scale-[0.99] transition-all shadow-sm"
              >
                {language === 'ar' ? 'تسجيل وحفظ المطعم' : 'Register Restaurant'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Aspect: Existing Restaurants Directories with search & filter panel */}
        <div className="xl:col-span-7 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl font-extrabold text-zinc-800">
              {language === 'ar' ? 'المطاعم المسجلة حالياً' : 'Registered Restaurants'}
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 bg-zinc-100/80 text-zinc-600 rounded-full border border-zinc-200 shadow-inner">
              {restaurants.length} {language === 'ar' ? 'شريك' : 'partners'}
            </span>
          </div>

          {/* Search bar and Category filter pills */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-4 gap-4 flex flex-col">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder={language === 'ar' ? 'ابحث باسم المطعم أو التصنيف...' : 'Search by name or category...'}
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all ${
                  selectedCategory === 'all' 
                    ? 'bg-black text-white border-black' 
                    : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {language === 'ar' ? 'الكل' : 'All'}
              </button>
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all ${
                    selectedCategory === cat 
                      ? 'bg-black text-white border-black' 
                      : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white border border-zinc-100 rounded-3xl p-12 text-center text-zinc-400">
              <span className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-3" />
              <p className="text-xs font-bold">{language === 'ar' ? 'جاري استيراد سجلات الشركاء والمطاعم...' : 'Fetching restaurant directory...'}</p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="bg-white border border-zinc-100 rounded-3xl p-12 text-center text-zinc-400 space-y-2">
              <Utensils className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-xs font-bold">
                {language === 'ar' ? 'لم يتم العثور على مطاعم تطابق معايير البحث.' : 'No restaurants matched your queries.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
              {filteredRestaurants.map(res => (
                <div 
                  key={res.id} 
                  className="bg-white border border-zinc-100 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                >
                  {/* Decorative tag for category */}
                  <div className="absolute top-3 right-3 bg-zinc-50/90 text-zinc-500 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-zinc-150">
                    {res.category}
                  </div>

                  <div className="flex gap-3 min-w-0">
                    <img 
                      src={res.image} 
                      alt={res.name} 
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-zinc-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-zinc-800 truncate mb-1 group-hover:text-primary transition-colors pr-10">
                        {res.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-medium line-clamp-2 leading-snug mb-2 pr-1">
                        {res.description}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100/80 pt-3 mt-3 flex items-center justify-between text-[10px] font-bold text-zinc-500">
                    <div className="flex gap-2.5">
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        {res.rating}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {res.deliveryTime}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3 text-zinc-400" />
                        {res.deliveryFee === 0 ? (language === 'ar' ? 'مجاني' : 'Free') : `${(res.deliveryFee / 100).toFixed(2)} SAR`}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <button 
                        onClick={() => openEdit(res)} 
                        className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-md transition-all"
                        title={language === 'ar' ? 'تعديل السجل' : 'Edit directory'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(res.id)} 
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-rose-50 rounded-md transition-all"
                        title={language === 'ar' ? 'تعطيل الشريك' : 'De-provision partner'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Editing Dialog Modal */}
      <AnimatePresence>
        {showModal && editingRestaurant && (
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
                  <Edit className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-extrabold text-zinc-800">
                    {language === 'ar' ? 'تعديل بيانات المطعم' : 'Edit Restaurant'}
                  </h2>
                </div>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setEditingRestaurant(null);
                  }} 
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                    {language === 'ar' ? 'اسم المطعم' : 'Restaurant Name'}
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                      {language === 'ar' ? 'التصنيف الرئيسي' : 'Main Category'}
                    </label>
                    <select 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold"
                      value={form.category} 
                      onChange={e => setForm({ ...form, category: e.target.value })}
                    >
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                      {language === 'ar' ? 'التقييم الحالي' : 'Current Rating'}
                    </label>
                    <input 
                      type="number" 
                      step="0.1"
                      max="5"
                      min="1"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold" 
                      value={form.rating} 
                      onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) || 4.5 })} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                      {language === 'ar' ? 'وقت التوصيل المقدر' : 'Est. Delivery Time'}
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold" 
                      value={form.deliveryTime} 
                      onChange={e => setForm({ ...form, deliveryTime: e.target.value })} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                      {language === 'ar' ? 'رسوم التوصيل (هللة)' : 'Delivery Fee (Halalas)'}
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold font-mono" 
                      value={form.deliveryFee} 
                      onChange={e => setForm({ ...form, deliveryFee: parseInt(e.target.value) || 0 })} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                    {language === 'ar' ? 'رابط صورة الغلاف' : 'Cover Image URL'}
                  </label>
                  <input 
                    type="url" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold" 
                    value={form.image} 
                    onChange={e => setForm({ ...form, image: e.target.value })} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5">
                    {language === 'ar' ? 'شرح ووصف المطعم' : 'Restaurant Description'}
                  </label>
                  <textarea 
                    rows={3} 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold resize-none" 
                    value={form.description} 
                    onChange={e => setForm({ ...form, description: e.target.value })} 
                    required 
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-zinc-100 pt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowModal(false);
                      setEditingRestaurant(null);
                    }} 
                    className="px-5 py-3 border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-colors"
                  >
                    {language === 'ar' ? 'إلغاء الأمر' : 'Cancel'}
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-black text-white rounded-xl text-xs font-bold hover:bg-zinc-800 active:scale-[0.99] transition-all"
                  >
                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
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
