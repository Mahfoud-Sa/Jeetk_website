import { useState } from 'react';
import { Clock, Calendar, History, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';

export const OrderManagement = ({ role, orders, users = [], onUpdateStatus, onEdit, onDelete, onViewHistory }: { role: UserRole, orders: any[], users?: any[], onUpdateStatus: (id: number, status: string) => void, onEdit?: (order: any) => void, onDelete?: (id: number) => void, onViewHistory?: (id: number) => void }) => {
  const { t, language } = useLanguage();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<number, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'createdAt', direction: 'desc' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'preparing': return 'bg-blue-100 text-blue-700';
      case 'onTheWay': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    setLocalStatuses(prev => ({ ...prev, [id]: newStatus }));
    try {
      await onUpdateStatus(id, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aValue: any = a[key] || a[key.charAt(0).toUpperCase() + key.slice(1)];
    let bValue: any = b[key] || b[key.charAt(0).toUpperCase() + key.slice(1)];

    if (key === 'createdAt' || key === 'deliveryTime') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const SortButton = ({ label, sortKey }: { label: string, sortKey: string }) => (
    <button 
      onClick={() => requestSort(sortKey)}
      className="flex items-center gap-1 hover:text-black transition-colors group"
    >
      <span>{label}</span>
      <div className="flex flex-col -space-y-1">
        <ChevronUp className={`w-2.5 h-2.5 transition-colors ${sortConfig?.key === sortKey && sortConfig.direction === 'asc' ? 'text-black' : 'text-zinc-300 group-hover:text-zinc-400'}`} />
        <ChevronDown className={`w-2.5 h-2.5 transition-colors ${sortConfig?.key === sortKey && sortConfig.direction === 'desc' ? 'text-black' : 'text-zinc-300 group-hover:text-zinc-400'}`} />
      </div>
    </button>
  );

  return (
    <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="px-6 py-4 font-bold text-sm">
                <SortButton label={t.dashboard.orderId} sortKey="id" />
              </th>
              <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'الوصف' : 'Description'}</th>
              <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'المندوب' : 'Delivery'}</th>
              <th className="px-6 py-4 font-bold text-sm">
                <SortButton label={t.dashboard.createdAt} sortKey="createdAt" />
              </th>
              <th className="px-6 py-4 font-bold text-sm">
                <SortButton label={t.dashboard.deliveryTime} sortKey="deliveryTime" />
              </th>
              <th className="px-6 py-4 font-bold text-sm">{t.dashboard.status}</th>
              <th className="px-6 py-4 font-bold text-sm text-right">
                <SortButton label={language === 'ar' ? 'السعر' : 'Price'} sortKey="deliveryPrice" />
              </th>
              <th className="px-6 py-4 font-bold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {sortedOrders.map((order, index) => {
              const orderId = order.id || order.Id;
              const currentStatus = localStatuses[orderId] || order.orderState || order.OrderState || order.status || order.Status || 'pending';
              const isUpdating = updatingId === orderId;

              return (
                <tr key={orderId || index} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold">
                    <div>{orderId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="max-w-[200px] truncate" title={order.description || order.Description}>
                      {order.description || order.Description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {(() => {
                      if (order.deliveryName || order.DeliveryName) return order.deliveryName || order.DeliveryName;
                      const dId = order.deliveryUserId || order.DeliveryUserId;
                      if (dId && dId !== 0) {
                        const user = users.find((u: any) => u.id === dId);
                        return user ? (user.fullName || user.name) : `ID: ${dId}`;
                      }
                      return '-';
                    })()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px]">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString(language === 'ar' ? 'ar-YE' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {order.deliveryTime ? (
                      <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">
                          {new Date(order.deliveryTime).toLocaleString(language === 'ar' ? 'ar-YE' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-[10px]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(currentStatus)} ${isUpdating ? 'opacity-50 animate-pulse' : ''}`}>
                        {(t.dashboard as any)[currentStatus] || currentStatus}
                      </span>
                      {role !== 'customer' && (
                        <select 
                          className="text-[10px] font-bold bg-zinc-50 border border-zinc-100 rounded-lg px-2 py-1 focus:outline-none disabled:opacity-50"
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(orderId, e.target.value)}
                          disabled={isUpdating}
                        >
                          <option value="pending">{t.dashboard.pending}</option>
                          <option value="preparing">{t.dashboard.preparing}</option>
                          <option value="onTheWay">{t.dashboard.onTheWay}</option>
                          <option value="delivered">{t.dashboard.delivered}</option>
                          <option value="cancelled">{t.dashboard.cancelled}</option>
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right">{(order.deliveryPrice || order.DeliveryPrice || 0).toFixed(2)} {language === 'ar' ? 'ر.ي' : 'YER'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {onViewHistory && (
                        <button 
                          onClick={() => onViewHistory(orderId)}
                          className="p-2 text-zinc-400 hover:text-primary transition-colors"
                          title={language === 'ar' ? 'السجل' : 'History'}
                        >
                          <History className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(order)}
                          className="p-2 text-zinc-400 hover:text-black transition-colors"
                          title={t.common.edit}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(orderId)}
                          className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                          title={t.common.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-zinc-400 font-medium">No orders found.</p>
        </div>
      )}
    </div>
  );
};
