import { useState } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  User as UserIcon, 
  MapPin, 
  Navigation, 
  ShoppingBag, 
  History, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldAlert,
  Users as UsersIcon,
  Utensils,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useLocations } from '../../services/locationService';
import { useOrders } from '../../services/orderService';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminRoles } from './AdminRoles';
import { AdminPermissions } from './AdminPermissions';
import { AdminLocations } from './AdminLocations';
import { AdminRestaurants } from './AdminRestaurants';
import { AdminRoutes } from './AdminRoutes';
import { AdminOrders } from './AdminOrders';
import { SystemHistoryManagement } from './SystemHistoryManagement';
import { UserProfile } from '../UserProfile';

export const AdminDashboard = ({ userId }: { userId: number | null }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'restaurants' | 'routes' | 'users' | 'users-roles' | 'users-permissions' | 'orders' | 'profile' | 'history'>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [usersSubmenuOpen, setUsersSubmenuOpen] = useState(false);
  const [geoSubmenuOpen, setGeoSubmenuOpen] = useState(true);
  
  const { data: locationsData = [] } = useLocations();
  const locations = Array.isArray(locationsData) ? locationsData : [];

  const { data: ordersData = [] } = useOrders(1, 100, userId);
  const orders = Array.isArray(ordersData) ? ordersData : [];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className={`w-full ${isCollapsed ? 'md:w-20' : 'md:w-64'} shrink-0 flex flex-col gap-2 transition-all duration-300`}>
        <div className={`p-4 mb-4 bg-primary/10 rounded-2xl flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-center' : ''}`}>
          <h2 className="font-bold text-primary flex items-center gap-2 overflow-hidden truncate">
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span className={`${isCollapsed ? 'md:hidden' : 'inline'} transition-all duration-300`}>
              {t.dashboard.adminTitle}
            </span>
          </h2>
        </div>
        {/* Geographic Management Collapsible Accordion */}
        <div className="flex flex-col">
          <button 
            onClick={() => {
              setGeoSubmenuOpen(!geoSubmenuOpen);
              if (!geoSubmenuOpen && activeTab !== 'overview' && activeTab !== 'locations' && activeTab !== 'routes') {
                setActiveTab('overview');
              }
            }}
            className={`flex items-center justify-between transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'px-4 py-3'} rounded-xl text-sm font-medium ${
              (activeTab === 'overview' || activeTab === 'locations' || activeTab === 'routes') && !geoSubmenuOpen
                ? 'bg-black text-white' 
                : 'hover:bg-zinc-100 text-zinc-600 font-semibold'
            }`}
            title={isCollapsed ? (language === 'ar' ? 'الإدارة الجغرافية' : 'Geographic Management') : ''}
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 shrink-0 text-zinc-500" />
              <span className={`${isCollapsed ? 'md:hidden' : 'inline'} transition-all duration-300`}>
                {language === 'ar' ? 'الإدارة الجغرافية' : 'Geographic Management'}
              </span>
            </div>
            {!isCollapsed && (
              geoSubmenuOpen ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            )}
          </button>

          {/* Submenu Nested items */}
          {geoSubmenuOpen && (
            <div className={`mt-1.5 flex flex-col gap-1 transition-all duration-300 ${isCollapsed ? 'items-center pl-0' : 'pl-4 rtl:pr-4 rtl:pl-0 border-l rtl:border-r rtl:border-l-0 border-zinc-200'}`}>
              
              {/* Child 1: Overview */}
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0 w-8 h-8 rounded-full' : 'gap-2.5 px-3 py-2 w-full rounded-lg text-left rtl:text-right'} text-xs font-extrabold ${
                  activeTab === 'overview' ? 'bg-primary/15 text-primary' : 'hover:bg-zinc-100 text-zinc-500'
                }`}
                title={isCollapsed ? t.dashboard.overview : ''}
              >
                <Database className="w-3.5 h-3.5 shrink-0 text-primary" />
                {!isCollapsed && <span>{t.dashboard.overview}</span>}
              </button>

              {/* Child 2: Locations */}
              <button
                onClick={() => setActiveTab('locations')}
                className={`flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0 w-8 h-8 rounded-full' : 'gap-2.5 px-3 py-2 w-full rounded-lg text-left rtl:text-right'} text-xs font-extrabold ${
                  activeTab === 'locations' ? 'bg-primary/15 text-primary' : 'hover:bg-zinc-100 text-zinc-500'
                }`}
                title={isCollapsed ? t.dashboard.locations : ''}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                {!isCollapsed && <span>{t.dashboard.locations}</span>}
              </button>

              {/* Child 3: Routes */}
              <button
                onClick={() => setActiveTab('routes')}
                className={`flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0 w-8 h-8 rounded-full' : 'gap-2.5 px-3 py-2 w-full rounded-lg text-left rtl:text-right'} text-xs font-extrabold ${
                  activeTab === 'routes' ? 'bg-primary/15 text-primary' : 'hover:bg-zinc-100 text-zinc-500'
                }`}
                title={isCollapsed ? t.dashboard.routes : ''}
              >
                <Navigation className="w-3.5 h-3.5 shrink-0 text-primary" />
                {!isCollapsed && <span>{t.dashboard.routes}</span>}
              </button>

            </div>
          )}
        </div>

        {/* Users Collapsible Accordion Header */}
        <div className="flex flex-col">
          <button 
            onClick={() => {
              setUsersSubmenuOpen(!usersSubmenuOpen);
              if (!usersSubmenuOpen && activeTab !== 'users' && activeTab !== 'users-roles' && activeTab !== 'users-permissions') {
                setActiveTab('users');
              }
            }}
            className={`flex items-center justify-between transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'px-4 py-3'} rounded-xl text-sm font-medium ${
              (activeTab === 'users' || activeTab === 'users-roles' || activeTab === 'users-permissions') && !usersSubmenuOpen
                ? 'bg-black text-white' 
                : 'hover:bg-zinc-100 text-zinc-600 font-semibold'
            }`}
            title={isCollapsed ? t.dashboard.users : ''}
          >
            <div className="flex items-center gap-3">
              <UserIcon className="w-4 h-4 shrink-0 text-zinc-500" />
              <span className={`${isCollapsed ? 'md:hidden' : 'inline'} transition-all duration-300`}>
                {t.dashboard.users}
              </span>
            </div>
            {!isCollapsed && (
              usersSubmenuOpen ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            )}
          </button>

          {/* Submenu Nested Lane */}
          {usersSubmenuOpen && (
            <div className={`mt-1.5 flex flex-col gap-1 transition-all duration-300 ${isCollapsed ? 'items-center pl-0' : 'pl-4 rtl:pr-4 rtl:pl-0 border-l rtl:border-r rtl:border-l-0 border-zinc-200'}`}>
              
              {/* Child 1: Users Directory */}
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0 w-8 h-8 rounded-full' : 'gap-2.5 px-3 py-2 w-full rounded-lg text-left rtl:text-right'} text-xs font-extrabold ${
                  activeTab === 'users' ? 'bg-primary/15 text-primary' : 'hover:bg-zinc-100 text-zinc-500'
                }`}
                title={isCollapsed ? (language === 'ar' ? 'قائمة المستخدمين' : 'Users Directory') : ''}
              >
                <UsersIcon className="w-3.5 h-3.5 shrink-0 text-primary" />
                {!isCollapsed && <span>{language === 'ar' ? 'قائمة المستخدمين' : 'Users Directory'}</span>}
              </button>

              {/* Child 2: Roles Matrix */}
              <button
                onClick={() => setActiveTab('users-roles')}
                className={`flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0 w-8 h-8 rounded-full' : 'gap-2.5 px-3 py-2 w-full rounded-lg text-left rtl:text-right'} text-xs font-extrabold ${
                  activeTab === 'users-roles' ? 'bg-primary/15 text-primary' : 'hover:bg-zinc-100 text-zinc-500'
                }`}
                title={isCollapsed ? (language === 'ar' ? 'أدوار الحسابات' : 'Role Matrix') : ''}
              >
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-primary" />
                {!isCollapsed && <span>{language === 'ar' ? 'أدوار الحسابات' : 'Role Matrix'}</span>}
              </button>

              {/* Child 3: Permissions Registry */}
              <button
                onClick={() => setActiveTab('users-permissions')}
                className={`flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0 w-8 h-8 rounded-full' : 'gap-2.5 px-3 py-2 w-full rounded-lg text-left rtl:text-right'} text-xs font-extrabold ${
                  activeTab === 'users-permissions' ? 'bg-primary/15 text-primary' : 'hover:bg-zinc-100 text-zinc-500'
                }`}
                title={isCollapsed ? (language === 'ar' ? 'صلاحيات ومفاتيح الوصول' : 'Access Permissions') : ''}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-primary" />
                {!isCollapsed && <span>{language === 'ar' ? 'صلاحيات الوصول' : 'Access Permissions'}</span>}
              </button>

            </div>
          )}
        </div>

        <button 
          onClick={() => setActiveTab('restaurants')}
          className={`flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'gap-3 px-4 py-3'} rounded-xl text-sm font-medium ${activeTab === 'restaurants' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
          title={isCollapsed ? (language === 'ar' ? 'المطاعم' : 'Restaurants') : ''}
        >
          <Utensils className="w-4 h-4 shrink-0" /> 
          <span className={`${isCollapsed ? 'md:hidden' : 'inline'} transition-all duration-300`}>{language === 'ar' ? 'المطاعم' : 'Restaurants'}</span>
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'gap-3 px-4 py-3'} rounded-xl text-sm font-medium ${activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
          title={isCollapsed ? t.dashboard.orders : ''}
        >
          <ShoppingBag className="w-4 h-4 shrink-0" /> 
          <span className={`${isCollapsed ? 'md:hidden' : 'inline'} transition-all duration-300`}>{t.dashboard.orders}</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'gap-3 px-4 py-3'} rounded-xl text-sm font-medium ${activeTab === 'history' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
          title={isCollapsed ? (language === 'ar' ? 'السجل' : 'History') : ''}
        >
          <History className="w-4 h-4 shrink-0" /> 
          <span className={`${isCollapsed ? 'md:hidden' : 'inline'} transition-all duration-300`}>{language === 'ar' ? 'السجل' : 'History'}</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'gap-3 px-4 py-3'} rounded-xl text-sm font-medium ${activeTab === 'profile' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
          title={isCollapsed ? (language === 'ar' ? 'الملف الشخصي' : 'Profile') : ''}
        >
          <UserIcon className="w-4 h-4 shrink-0" /> 
          <span className={`${isCollapsed ? 'md:hidden' : 'inline'} transition-all duration-300`}>{language === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
        </button>

        {/* Dynamic Collapse/Expand Toggle button (Sticky bottom in sidebar) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center transition-all duration-300 px-4 py-3 rounded-xl text-sm font-medium hover:bg-zinc-100 text-zinc-500 mt-auto border border-dashed border-zinc-200 hover:border-zinc-300 justify-center"
          title={language === 'ar' ? (isCollapsed ? 'توسيع القائمة' : 'طي القائمة') : (isCollapsed ? 'Expand Menu' : 'Collapse Menu')}
        >
          {isCollapsed ? (
            language === 'ar' ? <ChevronLeft className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            language === 'ar' ? <ChevronRight className="w-4 h-4 shrink-0" /> : <ChevronLeft className="w-4 h-4 shrink-0" />
          )}
          {!isCollapsed && <span className="ml-2 rtl:mr-2 rtl:ml-0">{language === 'ar' ? 'طي القائمة' : 'Collapse Menu'}</span>}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'overview' && <AdminOverview locations={locations} orders={orders} />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'users-roles' && <AdminRoles />}
        {activeTab === 'users-permissions' && <AdminPermissions />}
        {activeTab === 'locations' && <AdminLocations />}
        {activeTab === 'restaurants' && <AdminRestaurants />}
        {activeTab === 'routes' && <AdminRoutes />}
        {activeTab === 'orders' && <AdminOrders userId={userId} />}
        {activeTab === 'history' && <SystemHistoryManagement />}
        {activeTab === 'profile' && userId && <UserProfile userId={userId} />}
      </div>
    </div>
  );
};
