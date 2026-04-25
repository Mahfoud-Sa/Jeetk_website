import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { RestaurantOwnerDashboard } from '../components/dashboard/RestaurantOwnerDashboard';
import { DeliveryDashboard } from '../components/dashboard/DeliveryDashboard';
import { useQueryClient } from '@tanstack/react-query';

export const DashboardPage = ({ onLogout, userId, isAuthenticated }: { onLogout: () => void, userId: number | null, isAuthenticated: boolean }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole | null>(null);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const savedRole = localStorage.getItem('jeetk_user_role') as UserRole;
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setRole(savedRole);
    }
  }, [navigate, isAuthenticated]);

  const handleSignOut = () => {
    onLogout();
    queryClient.clear();
    navigate('/login');
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

      {role === 'admin' ? (
        <AdminDashboard userId={userId} />
      ) : role === 'customer' ? (
        <RestaurantOwnerDashboard userId={userId} />
      ) : role === 'delivery' ? (
        <DeliveryDashboard userId={userId} />
      ) : (
        <div className="p-8 bg-white border border-zinc-100 rounded-3xl shadow-sm text-center">
          <h2 className="text-xl font-bold text-zinc-400">Dashboard for {role} is coming soon...</h2>
        </div>
      )}
    </div>
  );
};
