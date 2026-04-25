import { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  User as UserIcon, 
  Search, 
  CheckCircle2 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useOrders, updateOrder } from '../../services/orderService';
import { useUsers } from '../../services/userService';
import { CreateOrderRequest } from '../../types';
import { OrderManagement } from './OrderManagement';
import { UserProfile } from '../UserProfile';

export const DeliveryDashboard = ({ userId }: { userId: number | null }) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');

  const { data: ordersData = [], refetch: refetchOrders } = useOrders(1, 100, userId);
  const { data: usersData = [] } = useUsers();
  const users = Array.isArray(usersData) ? usersData : [];

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

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 flex flex-col gap-2">
        <div className="p-4 mb-4 bg-primary/10 rounded-2xl">
          <h2 className="font-bold text-primary flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            {t.dashboard.deliveryTitle}
          </h2>
        </div>
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> {t.dashboard.overview}
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <ShoppingBag className="w-4 h-4" /> {t.dashboard.orders}
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <UserIcon className="w-4 h-4" /> {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
        </button>
      </div>

      <div className="flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{t.dashboard.deliveryTitle}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                <h3 className="font-bold mb-2">{t.dashboard.totalOrders}</h3>
                <p className="text-3xl font-black text-primary">{orders.length}</p>
              </div>
              <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                <h3 className="font-bold mb-2">{t.dashboard.totalIncome}</h3>
                <p className="text-3xl font-black text-primary">
                  {orders.reduce((sum: number, o: any) => sum + (o.deliveryPrice || 0), 0).toFixed(2)} {language === 'ar' ? 'ر.ي' : 'YER'}
                </p>
              </div>
              <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                <h3 className="font-bold mb-2">{t.dashboard.systemStatus}</h3>
                <p className="text-xl font-bold text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> {t.dashboard.operational}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold">{t.dashboard.orders}</h1>
              {/* Search and filter UI */}
            </div>
            <OrderManagement role="delivery" orders={orders} users={users} onUpdateStatus={handleUpdateOrderStatus} />
          </div>
        )}

        {activeTab === 'profile' && userId && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">{language === 'ar' ? 'الملف الشخصي' : 'Profile'}</h1>
            <UserProfile userId={userId} />
          </div>
        )}
      </div>
    </div>
  );
};
