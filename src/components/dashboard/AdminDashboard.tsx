import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Sparkles,
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
import { AdminFeatures } from './AdminFeatures';

interface AdminDashboardProps {
  userId: number | null;
  isCollapsed?: boolean;
  setIsCollapsed?: (val: boolean) => void;
  isWorkspaceFullScreen?: boolean;
  setIsWorkspaceFullScreen?: (enable: boolean) => void;
}

export const AdminDashboard = ({ 
  userId,
  isCollapsed: controlledCollapsed,
  setIsCollapsed: setControlledCollapsed,
  isWorkspaceFullScreen = false,
  setIsWorkspaceFullScreen,
}: AdminDashboardProps) => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'restaurants' | 'routes' | 'users' | 'users-roles' | 'users-permissions' | 'orders' | 'profile' | 'history' | 'features'>('overview');

  useEffect(() => {
    if (tabParam && ['overview', 'locations', 'restaurants', 'routes', 'users', 'users-roles', 'users-permissions', 'orders', 'profile', 'history', 'features'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);
  
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : localCollapsed;
  const setIsCollapsed = setControlledCollapsed !== undefined ? setControlledCollapsed : setLocalCollapsed;

  const [usersSubmenuOpen, setUsersSubmenuOpen] = useState(false);
  const [geoSubmenuOpen, setGeoSubmenuOpen] = useState(true);
  
  const { data: locationsData = [] } = useLocations();
  const locations = Array.isArray(locationsData) ? locationsData : [];

  const { data: ordersData = [] } = useOrders(1, 100, userId);
  const orders = Array.isArray(ordersData) ? ordersData : [];

  return (
    <div className={`flex flex-col md:flex-row ${isWorkspaceFullScreen ? 'gap-0 min-h-screen bg-white rounded-3xl overflow-hidden' : 'gap-8'}`}>
      {/* Sidebar */}
      {!isWorkspaceFullScreen && (
        <div className={`w-full ${isCollapsed ? 'md:w-[72px]' : 'md:w-64'} shrink-0 flex flex-col gap-2.5 transition-all duration-300`}>
        <div className={`p-4 mb-2 bg-primary/10 rounded-2xl flex items-center transition-all duration-300 ${isCollapsed ? 'md:justify-center' : ''}`}>
          <h2 className="font-extrabold text-primary flex items-center gap-2.5 overflow-hidden truncate">
            <LayoutDashboard className="w-6 h-6 shrink-0" />
            <span className={`${isCollapsed ? 'md:hidden' : 'inline'} transition-all duration-300`}>
              {t.dashboard.adminTitle}
            </span>
          </h2>
        </div>

        {isCollapsed ? (
          /* Collapsed State: Flat representation with square centered hit areas (56px h-14 w-14) and consistent 24px (w-6 h-6) icons */
          <div className="hidden md:flex flex-col items-center gap-2">
            {[
              { id: 'overview', label: t.dashboard.overview, icon: Database },
              { id: 'features', label: language === 'ar' ? 'بطاقات المزايا والترويج' : 'Website Features', icon: Sparkles },
              { id: 'locations', label: t.dashboard.locations, icon: MapPin },
              { id: 'routes', label: t.dashboard.routes, icon: Navigation },
              { id: 'restaurants', label: language === 'ar' ? 'المطاعم' : 'Restaurants', icon: Utensils },
              { id: 'users', label: language === 'ar' ? 'قائمة المستخدمين' : 'Users Directory', icon: UsersIcon },
              { id: 'users-roles', label: language === 'ar' ? 'أدوار الحسابات' : 'Role Matrix', icon: ShieldAlert },
              { id: 'users-permissions', label: language === 'ar' ? 'صلاحيات الوصول' : 'Access Permissions', icon: ShieldCheck },
              { id: 'orders', label: t.dashboard.orders, icon: ShoppingBag },
              { id: 'history', label: language === 'ar' ? 'السجل' : 'History', icon: History },
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
          /* Expanded State: Grouped structure with comfortable spacing and proper padding */
          <div className="flex flex-col gap-2">
            {/* Geographic Management Collapsible Accordion */}
            <div className="flex flex-col">
              <button 
                onClick={() => {
                  setGeoSubmenuOpen(!geoSubmenuOpen);
                  if (!geoSubmenuOpen && activeTab !== 'overview' && activeTab !== 'locations' && activeTab !== 'routes') {
                    setActiveTab('overview');
                  }
                }}
                className={`flex items-center justify-between transition-all duration-300 px-4 py-3.5 rounded-xl text-sm font-semibold ${
                  (activeTab === 'overview' || activeTab === 'locations' || activeTab === 'routes') && !geoSubmenuOpen
                    ? 'bg-black text-white' 
                    : 'hover:bg-zinc-100 text-zinc-650'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 shrink-0 text-zinc-500" />
                  <span>
                    {language === 'ar' ? 'الإدارة الجغرافية' : 'Geographic Management'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${geoSubmenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Submenu Nested items */}
              {geoSubmenuOpen && (
                <div className="mt-1.5 flex flex-col gap-1 pl-4 rtl:pr-4 rtl:pl-0 border-l rtl:border-r rtl:border-l-0 border-zinc-200">
                  {/* Child 1: Overview */}
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-left rtl:text-right text-xs font-bold transition-all duration-200 ${
                      activeTab === 'overview' ? 'bg-primary/15 text-primary' : 'hover:bg-zinc-50 text-zinc-500'
                    }`}
                  >
                    <Database className="w-6 h-6 shrink-0 text-primary" />
                    <span>{t.dashboard.overview}</span>
                  </button>

                  {/* Child 2: Locations */}
                  <button
                    onClick={() => setActiveTab('locations')}
                    className={`flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-left rtl:text-right text-xs font-bold transition-all duration-200 ${
                      activeTab === 'locations' ? 'bg-primary/15 text-primary' : 'hover:bg-zinc-50 text-zinc-500'
                    }`}
                  >
                    <MapPin className="w-6 h-6 shrink-0 text-primary" />
                    <span>{t.dashboard.locations}</span>
                  </button>

                  {/* Child 3: Routes */}
                  <button
                    onClick={() => setActiveTab('routes')}
                    className={`flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-left rtl:text-right text-xs font-bold transition-all duration-200 ${
                      activeTab === 'routes' ? 'bg-primary/15 text-primary' : 'hover:bg-zinc-50 text-zinc-500'
                    }`}
                  >
                    <Navigation className="w-6 h-6 shrink-0 text-primary" />
                    <span>{t.dashboard.routes}</span>
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
                className={`flex items-center justify-between transition-all duration-300 px-4 py-3.5 rounded-xl text-sm font-semibold ${
                  (activeTab === 'users' || activeTab === 'users-roles' || activeTab === 'users-permissions') && !usersSubmenuOpen
                    ? 'bg-black text-white' 
                    : 'hover:bg-zinc-100 text-zinc-650'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="w-6 h-6 shrink-0 text-zinc-500" />
                  <span>
                    {t.dashboard.users}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${usersSubmenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Submenu Nested Lane */}
              {usersSubmenuOpen && (
                <div className="mt-1.5 flex flex-col gap-1 pl-4 rtl:pr-4 rtl:pl-0 border-l rtl:border-r rtl:border-l-0 border-zinc-200">
                  {/* Child 1: Users Directory */}
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-left rtl:text-right text-xs font-bold transition-all duration-200 ${
                      activeTab === 'users' ? 'bg-primary/15 text-primary' : 'hover:bg-zinc-50 text-zinc-500'
                    }`}
                  >
                    <UsersIcon className="w-6 h-6 shrink-0 text-primary" />
                    <span>{language === 'ar' ? 'قائمة المستخدمين' : 'Users Directory'}</span>
                  </button>

                  {/* Child 2: Roles Matrix */}
                  <button
                    onClick={() => setActiveTab('users-roles')}
                    className={`flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-left rtl:text-right text-xs font-bold transition-all duration-200 ${
                      activeTab === 'users-roles' ? 'bg-primary/15 text-primary' : 'hover:bg-zinc-50 text-zinc-500'
                    }`}
                  >
                    <ShieldAlert className="w-6 h-6 shrink-0 text-primary" />
                    <span>{language === 'ar' ? 'أدوار الحسابات' : 'Role Matrix'}</span>
                  </button>

                  {/* Child 3: Permissions Registry */}
                  <button
                    onClick={() => setActiveTab('users-permissions')}
                    className={`flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-left rtl:text-right text-xs font-bold transition-all duration-200 ${
                      activeTab === 'users-permissions' ? 'bg-primary/15 text-primary' : 'hover:bg-zinc-50 text-zinc-500'
                    }`}
                  >
                    <ShieldCheck className="w-6 h-6 shrink-0 text-primary" />
                    <span>{language === 'ar' ? 'صلاحيات الوصول' : 'Access Permissions'}</span>
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => setActiveTab('features')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'features' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-650'}`}
            >
              <Sparkles className="w-6 h-6 shrink-0 text-zinc-500" /> 
              <span>{language === 'ar' ? 'إدارة بطاقات المزايا' : 'Website Promo Cards'}</span>
            </button>

            <button 
              onClick={() => setActiveTab('restaurants')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'restaurants' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
            >
              <Utensils className="w-6 h-6 shrink-0" /> 
              <span>{language === 'ar' ? 'المطاعم' : 'Restaurants'}</span>
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
            >
              <ShoppingBag className="w-6 h-6 shrink-0" /> 
              <span>{t.dashboard.orders}</span>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'history' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
            >
              <History className="w-6 h-6 shrink-0" /> 
              <span>{language === 'ar' ? 'السجل' : 'History'}</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'profile' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}
            >
              <UserIcon className="w-6 h-6 shrink-0" /> 
              <span>{language === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
            </button>
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

      {/* Content */}
      <div className={`flex-1 ${isWorkspaceFullScreen ? 'p-6 sm:p-8 min-h-screen bg-white overflow-auto' : ''}`}>
        
        {/* Workspace Focus Mode Initiation Button */}
        {!isWorkspaceFullScreen && (activeTab === 'overview' || activeTab === 'locations' || activeTab === 'routes') && setIsWorkspaceFullScreen && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsWorkspaceFullScreen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-zinc-900 to-black hover:from-black hover:to-zinc-900 text-white shadow-md hover:shadow-lg rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer active:scale-95 flex-row shrink-0"
              title={language === 'ar' ? 'تفعيل وضع التركيز' : 'Enter Focus Mode'}
              aria-label="Enter Focus Mode"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{language === 'ar' ? 'بدء وضع التركيز' : 'Workspace Focus Mode'}</span>
            </button>
          </div>
        )}

        {activeTab === 'overview' && <AdminOverview locations={locations} orders={orders} />}
        {activeTab === 'features' && <AdminFeatures />}
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
