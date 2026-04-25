import { useState, FormEvent } from 'react';
import { 
  LayoutDashboard, 
  User as UserIcon, 
  ClipboardList, 
  Database, 
  Mail, 
  ImageIcon, 
  MapPin, 
  ShoppingBag, 
  Search, 
  Plus, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useOrders, updateOrder } from '../../services/orderService';
import { useUsers } from '../../services/userService';
import { CreateOrderRequest } from '../../types';
import { OrderManagement } from './OrderManagement';
import { UserProfile } from '../UserProfile';

export const RestaurantOwnerDashboard = ({ userId }: { userId: number | null }) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'messages' | 'images' | 'location' | 'orders' | 'meals' | 'categories' | 'user_profile'>('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  
  const { data: ordersData = [], refetch: refetchOrders } = useOrders(1, 100, userId);
  const { data: usersData = [] } = useUsers();
  const users = Array.isArray(usersData) ? usersData : [];

  const [categories, setCategories] = useState<any[]>([
    { id: 1, name: 'Juices' },
    { id: 2, name: 'Meat' },
    { id: 3, name: 'Chicken' }
  ]);
  
  const [meals, setMeals] = useState<any[]>([
    {
      id: 1,
      name: 'Classic Cheeseburger',
      price: 2500,
      description: 'Juicy beef patty with cheddar cheese, lettuce, and tomato.',
      isAvailable: true,
      baseImage: 'https://picsum.photos/seed/burger1/400',
      gallery: ['https://picsum.photos/seed/burger2/400', 'https://picsum.photos/seed/burger3/400'],
      quantity: 50,
      sizes: ['Small', 'Medium', 'Large'],
      categories: [2]
    }
  ]);

  const orders = Array.isArray(ordersData) ? ordersData.filter((order: any) => {
    const matchesSearch = (order.description || order.Description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.id || order.Id || '').toString().includes(searchTerm);
    
    const currentStatus = order.orderState || order.OrderState || order.status || order.Status || 'pending';
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      const order = ordersData.find((o: any) => (o.id || o.Id) === id);
      if (!order) return;

      const updatePayload: CreateOrderRequest = {
        deliveryPrice: order.deliveryPrice ?? order.DeliveryPrice ?? 0,
        description: order.description ?? order.Description ?? '',
        deliveryLocationDescription: order.deliveryLocationDescription ?? order.DeliveryLocationDescription ?? '',
        orderState: status,
        receptionDescription: order.receptionDescription ?? order.ReceptionDescription ?? '',
        deliveryUserId: order.deliveryUserId ?? order.DeliveryUserId ?? 0,
        deliveryTime: order.deliveryTime ?? order.DeliveryTime ?? new Date().toISOString()
      };

      await updateOrder(id, updatePayload);
      refetchOrders();
      showToast("Order status updated!", "success");
    } catch (error) {
      showToast("Failed to update order status.", "error");
    }
  };

  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<any>(null);

  const handleSaveMeal = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const mealData = {
      id: editingMeal ? editingMeal.id : Date.now(),
      name: formData.get('name'),
      price: parseFloat(formData.get('price') as string),
      description: formData.get('description'),
      isAvailable: formData.get('isAvailable') === 'on',
      baseImage: formData.get('baseImage'),
      quantity: parseInt(formData.get('quantity') as string),
      sizes: (formData.get('sizes') as string).split(',').map(s => s.trim()),
      gallery: (formData.get('gallery') as string).split(',').map(s => s.trim()).filter(s => s !== ''),
      categories: Array.from(formData.getAll('categories')).map(id => parseInt(id as string))
    };

    if (editingMeal) {
      setMeals(meals.map(m => m.id === editingMeal.id ? mealData : m));
    } else {
      setMeals([...meals, mealData]);
    }
    setIsAddingMeal(false);
    setEditingMeal(null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        <div className="p-4 mb-4 bg-primary/10 rounded-2xl">
          <h2 className="font-bold text-primary flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            {t.dashboard.ownerTitle}
          </h2>
        </div>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <UserIcon className="w-4 h-4" /> {t.dashboard.profile}
        </button>
        <button 
          onClick={() => setActiveTab('meals')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'meals' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <ClipboardList className="w-4 h-4" /> {t.dashboard.meals}
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'categories' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <Database className="w-4 h-4" /> {t.dashboard.manageCategories}
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'messages' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <Mail className="w-4 h-4" /> {t.dashboard.messages}
        </button>
        <button 
          onClick={() => setActiveTab('images')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'images' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <ImageIcon className="w-4 h-4" /> {t.dashboard.images}
        </button>
        <button 
          onClick={() => setActiveTab('location')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'location' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <MapPin className="w-4 h-4" /> {t.dashboard.locations}
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <ShoppingBag className="w-4 h-4" /> {t.dashboard.orders}
        </button>
        <button 
          onClick={() => setActiveTab('user_profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'user_profile' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <UserIcon className="w-4 h-4" /> {language === 'ar' ? 'الملف الشخصي' : 'User Profile'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{t.dashboard.profile}</h1>
            <div className="p-8 bg-white border border-zinc-100 rounded-3xl shadow-sm">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-zinc-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img src="https://picsum.photos/seed/restaurant/200" alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">The Burger Joint</h2>
                  <p className="text-zinc-500">Premium Burgers & Shakes</p>
                </div>
              </div>
              <form className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-bold mb-1.5">Restaurant Name</label>
                  <input type="text" defaultValue="The Burger Joint" className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">Description</label>
                  <textarea rows={3} defaultValue="Serving the best burgers in town since 2010." className="w-full px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100" />
                </div>
                <button className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                  {t.common.save}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{t.dashboard.meals}</h1>
              <button 
                onClick={() => setIsAddingMeal(true)}
                className="bg-black text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> {t.dashboard.addMeal}
              </button>
            </div>

            {/* Meal implementation follows... */}
          </div>
        )}

        {/* ... Other tabs ... */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold">{t.dashboard.orders}</h1>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search and filter UI */}
              </div>
            </div>
            <OrderManagement role="customer" orders={orders} users={users} onUpdateStatus={handleUpdateOrderStatus} />
          </div>
        )}

        {activeTab === 'user_profile' && userId && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{language === 'ar' ? 'الملف الشخصي' : 'User Profile'}</h1>
            <UserProfile userId={userId} />
          </div>
        )}
      </div>
    </div>
  );
};
