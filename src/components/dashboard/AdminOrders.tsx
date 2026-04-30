import { useState, FormEvent, useEffect } from 'react';
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
  const [orderForm, setOrderForm] = useState<CreateOrderRequest>({
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

  useEffect(() => {
    if (editingOrder) {
      setOrderForm({
        deliveryPrice: editingOrder.deliveryPrice ?? editingOrder.DeliveryPrice ?? 0,
        description: editingOrder.description ?? editingOrder.Description ?? '',
        deliveryLocationDescription: editingOrder.deliveryLocationDescription ?? editingOrder.DeliveryLocationDescription ?? '',
        orderState: editingOrder.orderState ?? editingOrder.OrderState ?? 'pending',
        receptionDescription: editingOrder.receptionDescription ?? editingOrder.ReceptionDescription ?? '',
        deliveryUserId: editingOrder.deliveryUserId ?? editingOrder.DeliveryUserId ?? 0,
        deliveryTime: editingOrder.deliveryTime ?? editingOrder.DeliveryTime ?? new Date().toISOString()
      });
    } else {
      setOrderForm({
        deliveryPrice: 0,
        description: '',
        deliveryLocationDescription: '',
        orderState: 'pending',
        receptionDescription: '',
        deliveryUserId: 0,
        deliveryTime: new Date().toISOString()
      });
    }
  }, [editingOrder]);

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

  const handleDeleteOrder = async (id: number) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id);
        showToast("Order deleted successfully!", "success");
        refetchOrders();
      } catch (error) {
        showToast("Failed to delete order.", "error");
      }
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
          {t.dashboard.addOrder}
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
        onEdit={(order) => { setEditingOrder(order); setShowOrderModal(true); }}
        onDelete={handleDeleteOrder}
      />

      <AnimatePresence>
        {showOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOrderModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">
                    {editingOrder ? t.dashboard.editOrder : t.dashboard.addOrder}
                  </h2>
                  <button onClick={() => setShowOrderModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSaveOrder} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-500">{t.dashboard.deliveryPrice}</label>
                      <input 
                        type="number"
                        required
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none"
                        value={orderForm.deliveryPrice}
                        onChange={(e) => setOrderForm({...orderForm, deliveryPrice: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-500">{t.dashboard.status}</label>
                      <select 
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none"
                        value={orderForm.orderState}
                        onChange={(e) => setOrderForm({...orderForm, orderState: e.target.value})}
                      >
                        <option value="pending">{t.dashboard.pending}</option>
                        <option value="preparing">{t.dashboard.preparing}</option>
                        <option value="onTheWay">{t.dashboard.onTheWay}</option>
                        <option value="delivered">{t.dashboard.delivered}</option>
                        <option value="cancelled">{t.dashboard.cancelled}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">{t.dashboard.orderDescription}</label>
                    <textarea 
                      required
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none h-24"
                      value={orderForm.description}
                      onChange={(e) => setOrderForm({...orderForm, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">{t.dashboard.deliveryLocation}</label>
                    <input 
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none"
                      value={orderForm.deliveryLocationDescription}
                      onChange={(e) => setOrderForm({...orderForm, deliveryLocationDescription: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">{t.dashboard.receptionDescription}</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none"
                      value={orderForm.receptionDescription}
                      onChange={(e) => setOrderForm({...orderForm, receptionDescription: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-500">{t.dashboard.deliveryUser}</label>
                      <select 
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none"
                        value={orderForm.deliveryUserId}
                        onChange={(e) => setOrderForm({...orderForm, deliveryUserId: Number(e.target.value)})}
                      >
                        <option value={0}>{language === 'ar' ? 'اختر عامل توصيل' : 'Select Delivery User'}</option>
                        {users.filter(u => (u.role || (Array.isArray(u.roles) && u.roles[0]) === 'delivery') || u.userRoles?.some((r: any) => r.role?.name === 'delivery')).map((user: any) => (
                          <option key={user.id} value={user.id}>{user.fullName || user.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-500">{t.dashboard.deliveryTime}</label>
                      <input 
                        type="datetime-local"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none"
                        value={orderForm.deliveryTime.substring(0, 16)}
                        onChange={(e) => setOrderForm({...orderForm, deliveryTime: new Date(e.target.value).toISOString()})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowOrderModal(false)}
                      className="flex-1 px-8 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
                    >
                      {t.common.cancel}
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-8 py-4 bg-black text-white rounded-2xl font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-black/20"
                    >
                      {t.common.save}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

