import { Database, ShoppingBag, MapPin, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AdminOverview = ({ locations, orders }: { locations: any[], orders: any[] }) => {
  const { t, language } = useLanguage();
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t.dashboard.overview}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
          <p className="text-zinc-500 text-sm mb-1">{t.dashboard.totalLocations}</p>
          <p className="text-4xl font-black">{locations.length}</p>
        </div>
        <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
          <p className="text-zinc-500 text-sm mb-1">{t.dashboard.totalOrders}</p>
          <p className="text-4xl font-black text-primary">{orders.length}</p>
        </div>
        <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
          <p className="text-zinc-500 text-sm mb-1">{t.dashboard.totalIncome}</p>
          <p className="text-4xl font-black text-emerald-500">
            {orders.reduce((sum: number, order: any) => sum + (order.deliveryPrice || order.DeliveryPrice || 0), 0).toFixed(2)} {language === 'ar' ? 'ر.ي' : 'YER'}
          </p>
        </div>
        <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
          <p className="text-zinc-500 text-sm mb-1">{t.dashboard.activeHubs}</p>
          <p className="text-4xl font-black text-emerald-500">{locations.length}</p>
        </div>
        <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
          <p className="text-zinc-500 text-sm mb-1">{t.dashboard.systemStatus}</p>
          <p className="text-xl font-bold text-emerald-500 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {t.dashboard.operational}
          </p>
        </div>
      </div>
    </div>
  );
};
