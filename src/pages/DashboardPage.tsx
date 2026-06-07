import { LogOut, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { RestaurantOwnerDashboard } from '../components/dashboard/RestaurantOwnerDashboard';
import { DeliveryDashboard } from '../components/dashboard/DeliveryDashboard';

export const DashboardPage = () => {
  const { t, language } = useLanguage();
  const { user, role, logout } = useAuth();
  
  const handleSignOut = () => {
    logout();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {role === 'admin' ? t.dashboard.adminTitle : 
             role === 'customer' ? t.dashboard.ownerTitle :
             role === 'delivery' ? t.dashboard.deliveryTitle :
             'Dashboard'}
          </h1>
          <p className="text-zinc-500 text-sm">Welcome back to Jeetk Management</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" /> {t.dashboard.signOut}
        </button>
      </div>

      {user && !user.isAccountVerified && (
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
        <AdminDashboard userId={user?.id || null} />
      ) : role === 'customer' ? (
        <RestaurantOwnerDashboard userId={user?.id || null} />
      ) : role === 'delivery' ? (
        <DeliveryDashboard userId={user?.id || null} />
      ) : (
        <div className="p-8 bg-white border border-zinc-100 rounded-3xl shadow-sm text-center">
          <h2 className="text-xl font-bold text-zinc-400">Dashboard for {role} is coming soon...</h2>
        </div>
      )}
    </div>
  );
};
