import { useState, FormEvent } from 'react';
import { ShoppingBag, Search, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { 
  useOrders, updateOrder, createOrder, deleteOrder 
} from '../../services/orderService';
import { useUsers } from '../../services/userService';
import { CreateOrderRequest } from '../../types';
import { OrderManagement } from './OrderManagement';

export const AdminOrders = ({ userId }: { userId: number | null }) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [orderForm, setOrderForm] = useState({
    deliveryPrice: 0,
    description: '',
    deliveryLocationDescription: '',
    orderState: 'pending',
    receptionDescription: '',
    deliveryUserId: 0,
    deliveryTime: new Date().toISOString()
  });

  const { data: ordersData = [], refetch: refetchOrders, isLoading } = useOrders(1, 100, userId);
  const { data: usersData = [] } = useUsers();
  const users = Array.isArray(usersData) ? usersData : [];

  const orders = Array.isArray(ordersData) ? ordersData.filter((order: any) => {
    const desc = (order.description || order.Description || '').toLowerCase();
    const dName = (order.deliveryName || order.DeliveryName || '').toLowerCase();
    const idStr = (order.id || order.Id || '').toString();
    const searchLow = searchTerm.toLowerCase();

    const matchesSearch = desc.includes(searchLow) || 
                          dName.includes(searchLow) ||
                          idStr.includes(searchLow);
    
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

  const handleSaveOrder = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, orderForm);
        showToast("Order updated successfully!", "success");
      } else {
        await createOrder(orderForm);
        showToast("Order created successfully!", "success");
      }
      refetchOrders();
      setShowOrderModal(false);
    } catch (error) {
      showToast("Failed to save order.", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t.dashboard.orders}</h1>
        <button 
          onClick={() => { setEditingOrder(null); setShowOrderModal(true); }}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-sm"
        >
          <Plus className="w-5 h-5" />
          {t.common.checkout}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder={language === 'ar' ? 'بحث في الطلبات...' : "Search orders..."}
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-100 rounded-2xl focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-3 bg-white border border-zinc-100 rounded-2xl focus:outline-none font-medium"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">{language === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
          <option value="pending">{t.dashboard.pending}</option>
          <option value="preparing">{t.dashboard.preparing}</option>
          <option value="onTheWay">{t.dashboard.onTheWay}</option>
          <option value="delivered">{t.dashboard.delivered}</option>
          <option value="cancelled">{t.dashboard.cancelled}</option>
        </select>
      </div>

      <OrderManagement 
        role="admin" 
        orders={orders} 
        users={users} 
        onUpdateStatus={handleUpdateOrderStatus} 
      />

      {/* Modal for Order implementation would follow logic from App.tsx */}
    </div>
  );
};
