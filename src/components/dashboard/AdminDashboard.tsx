import { useState } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  User as UserIcon, 
  MapPin, 
  Navigation, 
  ShoppingBag, 
  History, 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useLocations } from '../../services/locationService';
import { useOrders } from '../../services/orderService';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminLocations } from './AdminLocations';
import { AdminRoutes } from './AdminRoutes';
import { AdminOrders } from './AdminOrders';
import { SystemHistoryManagement } from './SystemHistoryManagement';
import { UserProfile } from '../UserProfile';

export const AdminDashboard = ({ userId }: { userId: number | null }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'routes' | 'users' | 'orders' | 'profile' | 'history'>('overview');
  
  const { data: locationsData = [] } = useLocations();
  const locations = Array.isArray(locationsData) ? locationsData : [];

  const { data: ordersData = [] } = useOrders(1, 100, userId);
  const orders = Array.isArray(ordersData) ? ordersData : [];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        <div className="p-4 mb-4 bg-primary/10 rounded-2xl">
          <h2 className="font-bold text-primary flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            {t.dashboard.adminTitle}
          </h2>
        </div>
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <Database className="w-4 h-4" /> {t.dashboard.overview}
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <UserIcon className="w-4 h-4" /> {t.dashboard.users}
        </button>
        <button 
          onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'locations' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <MapPin className="w-4 h-4" /> {t.dashboard.locations}
        </button>
        <button 
          onClick={() => setActiveTab('routes')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'routes' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <Navigation className="w-4 h-4" /> {t.dashboard.routes}
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <ShoppingBag className="w-4 h-4" /> {t.dashboard.orders}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <History className="w-4 h-4" /> {language === 'ar' ? 'السجل' : 'History'}
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
        >
          <UserIcon className="w-4 h-4" /> {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'overview' && <AdminOverview locations={locations} orders={orders} />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'locations' && <AdminLocations />}
        {activeTab === 'routes' && <AdminRoutes />}
        {activeTab === 'orders' && <AdminOrders userId={userId} />}
        {activeTab === 'history' && <SystemHistoryManagement />}
        {activeTab === 'profile' && userId && <UserProfile userId={userId} />}
      </div>
    </div>
  );
};
