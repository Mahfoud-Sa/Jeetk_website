import { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  User as UserIcon, 
  Search, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useOrders, updateOrder } from '../../services/orderService';
import { useUsers } from '../../services/userService';
import { CreateOrderRequest } from '../../types';
import { OrderManagement } from './OrderManagement';
import { UserProfile } from '../UserProfile';

interface DeliveryDashboardProps {
  userId: number | null;
  isCollapsed?: boolean;
  setIsCollapsed?: (val: boolean) => void;
  isWorkspaceFullScreen?: boolean;
  setIsWorkspaceFullScreen?: (enable: boolean) => void;
}

export const DeliveryDashboard = ({ 
  userId,
  isCollapsed: controlledCollapsed,
  setIsCollapsed: setControlledCollapsed,
  isWorkspaceFullScreen = false,
  setIsWorkspaceFullScreen,
}: DeliveryDashboardProps) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile'>('overview');
  
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : localCollapsed;
  const setIsCollapsed = setControlledCollapsed !== undefined ? setControlledCollapsed : setLocalCollapsed;

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
    <div className={`flex flex-col md:flex-row ${isWorkspaceFullScreen ? 'gap-0 min-h-screen bg-white rounded-3xl overflow-hidden' : 'gap-8'}`}>
      {/* Sidebar - Hidden completely in Workspace Full Screen mode */}
      {!isWorkspaceFullScreen && (
        <div className={`w-full ${isCollapsed ? 'md:w-[72px]' : 'md:w-64'} shrink-0 flex flex-col gap-2.5 transition-all duration-300`}>
        <div className={`p-4 mb-2 bg-primary/10 rounded-2xl flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-center' : ''}`}>
          <h2 className="font-extrabold text-primary flex items-center gap-2.5 overflow-hidden truncate">
            <LayoutDashboard className="w-6 h-6 shrink-0" />
            <span className={`${isCollapsed ? 'md:hidden' : 'inline'} transition-all duration-300`}>
              {t.dashboard.deliveryTitle}
            </span>
          </h2>
        </div>

        {isCollapsed ? (
          /* Collapsed State: Standard centered 24px icons and 56px hitboxes */
          <div className="hidden md:flex flex-col items-center gap-2">
            {[
              { id: 'overview', label: t.dashboard.overview, icon: LayoutDashboard },
              { id: 'orders', label: t.dashboard.orders, icon: ShoppingBag },
              { id: 'profile', label: language === 'ar' ? 'الملف الشخصي' : 'Profile', icon: UserIcon },
            ].map(item => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-14 h-14 flex items-center justify-center rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-black text-white shadow-sm scale-102' 
                      : 'hover:bg-zinc-100 text-zinc-600'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-6 h-6 shrink-0" />
                </button>
              );
            })}
          </div>
        ) : (
          /* Expanded State: Left-aligned with comfortable padding and 24px icons */
          <div className="flex flex-col gap-2">
            {[
              { id: 'overview', label: t.dashboard.overview, icon: LayoutDashboard },
              { id: 'orders', label: t.dashboard.orders, icon: ShoppingBag },
              { id: 'profile', label: language === 'ar' ? 'الملف الشخصي' : 'Profile', icon: UserIcon },
            ].map(item => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <Icon className="w-6 h-6 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Collapse/Expand Toggle button (Sticky bottom in sidebar) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center transition-all duration-300 px-4 py-3.5 rounded-xl text-sm font-medium hover:bg-zinc-100 text-zinc-500 mt-auto border border-dashed border-zinc-250 hover:border-zinc-350 justify-center"
          title={language === 'ar' ? (isCollapsed ? 'توسيع القائمة' : 'طي القائمة') : (isCollapsed ? 'Expand Menu' : 'Collapse Menu')}
        >
          {isCollapsed ? (
            language === 'ar' ? <ChevronLeft className="w-5 h-5 shrink-0" /> : <ChevronRight className="w-5 h-5 shrink-0" />
          ) : (
            language === 'ar' ? <ChevronRight className="w-5 h-5 shrink-0" /> : <ChevronLeft className="w-5 h-5 shrink-0" />
          )}
          {!isCollapsed && <span className="ml-2 rtl:mr-2 rtl:ml-0 text-xs font-bold leading-none">{language === 'ar' ? 'طي القائمة' : 'Collapse Menu'}</span>}
        </button>
      </div>
      )}

      <div className={`flex-1 ${isWorkspaceFullScreen ? 'p-6 sm:p-8 min-h-screen bg-white overflow-auto' : ''}`}>
        
        {/* Workspace Focus Mode Trigger */}
        {!isWorkspaceFullScreen && activeTab === 'overview' && setIsWorkspaceFullScreen && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsWorkspaceFullScreen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-zinc-900 to-black hover:from-black hover:to-zinc-900 text-white shadow-md hover:shadow-lg rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer active:scale-95 flex-row shrink-0"
              title={language === 'ar' ? 'تفعيل وضع التركيز (ملء الشاشة)' : 'Enter Focus Mode (Full Screen)'}
              aria-label="Enter Focus Mode"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{language === 'ar' ? 'بدء وضع التركيز' : 'Workspace Focus Mode'}</span>
            </button>
          </div>
        )}
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
