import { LogOut, ShieldAlert, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { RestaurantOwnerDashboard } from '../components/dashboard/RestaurantOwnerDashboard';
import { DeliveryDashboard } from '../components/dashboard/DeliveryDashboard';

export const DashboardPage = () => {
  const { t, language } = useLanguage();
  const { user, role, logout } = useAuth();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWorkspaceFullScreen, setIsWorkspaceFullScreen] = useState(false);
  const [savedSidebarState, setSavedSidebarState] = useState<boolean | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If we exited browser fullscreen, reset the workspace view as well,
      // and restore the sidebar if we saved its state!
      if (!isCurrentlyFullscreen) {
        setIsWorkspaceFullScreen(false);
        if (savedSidebarState !== null) {
          setIsSidebarCollapsed(savedSidebarState);
          setSavedSidebarState(null);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [savedSidebarState]);

  const handleSignOut = () => {
    logout();
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        setSavedSidebarState(isSidebarCollapsed);
        setIsSidebarCollapsed(true);
        
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        setIsWorkspaceFullScreen(false);
        
        if (savedSidebarState !== null) {
          setIsSidebarCollapsed(savedSidebarState);
          setSavedSidebarState(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert(language === 'ar' ? 'عذراً لا يمكن تفعيل وضع ملء الشاشة' : 'Unable to enter Full Screen mode. Your browser may not support this feature.');
    }
  };

  const handleToggleWorkspaceFullScreen = async (enable: boolean) => {
    try {
      if (enable) {
        if (!document.fullscreenElement) {
          setSavedSidebarState(isSidebarCollapsed);
          setIsSidebarCollapsed(true);
          await document.documentElement.requestFullscreen();
        }
        setIsWorkspaceFullScreen(true);
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        setIsWorkspaceFullScreen(false);
        if (savedSidebarState !== null) {
          setIsSidebarCollapsed(savedSidebarState);
          setSavedSidebarState(null);
        }
      }
    } catch (err) {
      console.error(err);
      setIsWorkspaceFullScreen(enable);
    }
  };

  return (
    <div className={`transition-all duration-300 ${isWorkspaceFullScreen ? 'w-full max-w-full p-0 m-0 min-h-screen bg-white' : 'max-w-7xl mx-auto px-4 py-8 min-h-screen'}`}>
      
      {/* Floating Exit Button for Workspace Full Screen mode */}
      {isWorkspaceFullScreen && (
        <button
          onClick={() => handleToggleWorkspaceFullScreen(false)}
          className="fixed top-6 right-6 z-[9999] flex items-center gap-2 px-5 py-3 bg-black hover:bg-zinc-900 text-white shadow-xl rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 border border-zinc-800 cursor-pointer"
          title={language === 'ar' ? 'الخروج من وضع ملء الشاشة' : 'Exit Full Screen'}
          aria-label={language === 'ar' ? 'الخروج من وضع ملء الشاشة' : 'Exit Full Screen'}
        >
          <Minimize2 className="w-5 h-5 animate-pulse" />
          <span>{language === 'ar' ? 'إنهاء وضع التركيز' : 'Exit Focus Mode'}</span>
        </button>
      )}

      {/* Header - Hidden completely in Workspace Full Screen mode */}
      {!isWorkspaceFullScreen && (
        <div className="mb-8 flex justify-between items-center bg-white p-2 rounded-2xl border border-zinc-50 shadow-sm md:p-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-zinc-900">
              {role === 'admin' ? t.dashboard.adminTitle : 
               role === 'customer' ? t.dashboard.ownerTitle :
               role === 'delivery' ? t.dashboard.deliveryTitle :
               'Dashboard'}
            </h1>
            <p className="text-zinc-500 text-xs md:text-sm font-medium mt-0.5">Welcome back to Jeetk Management</p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* Full Screen Button: Displayed on Desktop & Tablet (hidden on mobile width < 768px) */}
            <button
              onClick={toggleFullscreen}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-zinc-50 border border-zinc-150 rounded-xl text-xs md:text-sm font-bold hover:bg-zinc-100 text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-95"
              title={isFullscreen ? (language === 'ar' ? 'إنهاء ملء الشاشة' : 'Exit Full Screen') : (language === 'ar' ? 'ملء الشاشة' : 'Enter Full Screen')}
              aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-zinc-600" />
                  <span>{language === 'ar' ? 'ملء الشاشة' : 'Exit Full Screen'}</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-zinc-650" />
                  <span>{language === 'ar' ? 'ملء الشاشة' : 'Full Screen'}</span>
                </>
              )}
            </button>

            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 text-red-500 hover:text-red-600 rounded-xl text-xs md:text-sm font-bold hover:bg-red-100/85 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" /> 
              <span>{t.dashboard.signOut}</span>
            </button>
          </div>
        </div>
      )}

      {user && !user.isAccountVerified && !isWorkspaceFullScreen && (
        <div className="mb-8 p-6 bg-amber-50 border border-amber-100 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-600 animate-pulse" />
            </div>
            <div className="text-start">
              <h3 className="font-bold text-amber-900">
                {language === 'ar' ? 'الحساب غير مؤكد!' : 'Account Not Verified!'}
              </h3>
              <p className="text-sm text-amber-700/90 mt-0.5">
                {language === 'ar' 
                  ? 'يرجى تأكيد حسابك لتنشيطه بالكامل وتلقي تحديثات حالة الطلب.'
                  : 'Please verify your account to fully activate your status and receive order updates.'}
              </p>
            </div>
          </div>
          <Link
            to="/verify-email"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap shadow-sm shadow-amber-600/15"
          >
            {language === 'ar' ? 'تأكيد الحساب الآن' : 'Verify Account Now'}
            <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      )}

      {role === 'admin' ? (
        <AdminDashboard 
          userId={user?.id || null} 
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isWorkspaceFullScreen={isWorkspaceFullScreen}
          setIsWorkspaceFullScreen={handleToggleWorkspaceFullScreen}
        />
      ) : role === 'customer' ? (
        <RestaurantOwnerDashboard 
          userId={user?.id || null} 
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isWorkspaceFullScreen={isWorkspaceFullScreen}
          setIsWorkspaceFullScreen={handleToggleWorkspaceFullScreen}
        />
      ) : role === 'delivery' ? (
        <DeliveryDashboard 
          userId={user?.id || null} 
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isWorkspaceFullScreen={isWorkspaceFullScreen}
          setIsWorkspaceFullScreen={handleToggleWorkspaceFullScreen}
        />
      ) : (
        <div className="p-8 bg-white border border-zinc-100 rounded-3xl shadow-sm text-center">
          <h2 className="text-xl font-bold text-zinc-400">Dashboard for {role} is coming soon...</h2>
        </div>
      )}
    </div>
  );
};
