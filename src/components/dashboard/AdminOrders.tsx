import { useState, FormEvent, useEffect, useRef } from 'react';
import { ShoppingBag, Search, Plus, X, Trash2, Utensils, Hash, Upload, Image as ImageIcon, Eye, FileText, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { 
  useOrders, updateOrder, createOrder, deleteOrder 
} from '../../services/orderService';
import { useUsers } from '../../services/userService';
import { getRestaurants } from '../../services/restaurantService';
import { useLocations } from '../../services/locationService';
import { CreateOrderRequest } from '../../types';
import { OrderManagement } from './OrderManagement';

export const parseOrderDescription = (descString: string) => {
  try {
    const parsed = JSON.parse(descString);
    if (parsed && typeof parsed === 'object') {
      return {
        text: parsed.text || '',
        items: Array.isArray(parsed.items) ? parsed.items : [],
        invoiceImages: Array.isArray(parsed.invoiceImages) ? parsed.invoiceImages : [],
        customerName: parsed.customerName || '',
        customerPhone: parsed.customerPhone || '',
        customerEmail: parsed.customerEmail || ''
      };
    }
  } catch (e) {
    // Falls back
  }
  return {
    text: descString || '',
    items: [],
    invoiceImages: [],
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  };
};

export const AdminOrders = ({ userId }: { userId: number | null }) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
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

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<{ name: string; quantity: number; price: number; restaurantName: string }[]>([]);
  const [rawNotes, setRawNotes] = useState('');
  const [invoiceImages, setInvoiceImages] = useState<string[]>([]);
  
  // Customer details state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  
  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemRestaurant, setNewItemRestaurant] = useState('');
  const [isCustomRestaurant, setIsCustomRestaurant] = useState(false);

  const { data: ordersData = [], refetch: refetchOrders, isLoading } = useOrders(1, 100, userId);
  const { data: usersData = [] } = useUsers();
  const users = Array.isArray(usersData) ? usersData : [];
  const { data: locationsData = [] } = useLocations();
  const locations = Array.isArray(locationsData) ? locationsData : [];

  useEffect(() => {
    getRestaurants(1, 100).then(data => {
      setRestaurants(data || []);
      if (data && data.length > 0 && !newItemRestaurant) {
        setNewItemRestaurant(data[0].name);
      }
    }).catch(err => {
      console.error("Failed to load restaurants for order item selection:", err);
    });
  }, []);

  useEffect(() => {
    if (editingOrder) {
      const descObj = parseOrderDescription(editingOrder.description ?? editingOrder.Description ?? '');
      setOrderItems(descObj.items);
      setRawNotes(descObj.text);
      setInvoiceImages(descObj.invoiceImages || []);
      setCustomerName(descObj.customerName || '');
      setCustomerPhone(descObj.customerPhone || '');
      setCustomerEmail(descObj.customerEmail || '');

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
      setOrderItems([]);
      setRawNotes('');
      setInvoiceImages([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
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
        customerName: order.customerName ?? order.CustomerName ?? '',
        customerPhone: order.customerPhone ?? order.CustomerPhone ?? '',
        deliveryLocationDescription: order.deliveryLocationDescription ?? order.DeliveryLocationDescription ?? '',
        locationNote: order.locationNote ?? order.LocationNote ?? '',
        orderState: status,
        receptionDescription: order.receptionDescription ?? order.ReceptionDescription ?? '',
        deliveryUserId: order.deliveryUserId ?? order.DeliveryUserId ?? 0,
        deliveryTime: order.deliveryTime ?? order.DeliveryTime ?? new Date().toISOString(),
        items: order.items ?? order.Items ?? [],
        attachments: order.attachments ?? order.Attachments ?? []
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
      const finalDescription = JSON.stringify({
        text: rawNotes,
        items: orderItems,
        invoiceImages: invoiceImages,
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail
      });

      const updatedForm: CreateOrderRequest = {
        ...orderForm,
        description: finalDescription,
        customerName: customerName,
        customerPhone: customerPhone,
        locationNote: rawNotes,
        items: orderItems.map(item => ({
          name: item.name,
          source: item.restaurantName || '',
          unitPrice: Number(item.price || 0),
          quantity: Number(item.quantity || 1)
        })),
        attachments: invoiceImages.map(imgUrl => ({
          fileUrl: imgUrl,
          fileType: 1,
          description: "Invoice Image"
        }))
      };

      if (editingOrder) {
        await updateOrder(editingOrder.id, updatedForm);
        showToast("Order updated successfully!", "success");
      } else {
        await createOrder(updatedForm);
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

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      showToast(language === 'ar' ? 'يرجى إدخال اسم المنتج' : 'Please enter item name', 'error');
      return;
    }
    const finalRestaurant = isCustomRestaurant ? newItemRestaurant : (newItemRestaurant || (restaurants[0]?.name || ''));
    if (!finalRestaurant.trim()) {
      showToast(language === 'ar' ? 'يرجى تحديد أو إدخال اسم المطعم' : 'Please specify restaurant name', 'error');
      return;
    }

    const newItem = {
      name: newItemName.trim(),
      quantity: Number(newItemQuantity),
      price: Number(newItemPrice),
      restaurantName: finalRestaurant.trim()
    };

    setOrderItems(prev => [...prev, newItem]);
    
    // reset item inputs
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemPrice(0);
    
    showToast(language === 'ar' ? 'تم إضافة المنتج للطلب' : 'Added item to order successfully', 'success');
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
    showToast(language === 'ar' ? 'تمت إزالة المنتج' : 'Item removed', 'success');
  };

  const applyAutoSumPrice = () => {
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setOrderForm(prev => ({ ...prev, deliveryPrice: total }));
    showToast(language === 'ar' ? `تم تحديث التكلفة للتوصيل: ${total}` : `Updated total delivery price to ${total}`, 'success');
  };

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileConvert = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast(language === 'ar' ? 'يرجى تحميل ملف صورة صالح فقط' : 'Please upload valid image files only', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setInvoiceImages(prev => [...prev, result]);
        showToast(language === 'ar' ? 'تم إضافة الفاتورة بنجاح' : 'Invoice image uploaded successfully', 'success');
      }
    };
    reader.onerror = () => {
      showToast('Error reading file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      Array.from(e.dataTransfer.files).forEach((file: any) => {
        handleFileConvert(file);
      });
    }
  };

  const handleFileInputChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      Array.from(e.target.files).forEach((file: any) => {
        handleFileConvert(file);
      });
    }
  };

  const removeInvoiceImage = (index: number) => {
    setInvoiceImages(prev => prev.filter((_, i) => i !== index));
    showToast(language === 'ar' ? 'تمت إزالة الفاتورة' : 'Invoice image removed', 'success');
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
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold">
                  {editingOrder ? t.dashboard.editOrder : t.dashboard.addOrder}
                </h2>
                <button onClick={() => setShowOrderModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveOrder} className="space-y-6 p-6 md:p-8 overflow-y-auto flex-1 text-start">
                {/* 0. CUSTOMER INFORMATION */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-violet-600 font-bold" />
                    <span>{language === 'ar' ? 'معلومات وتفاصيل العميل' : 'Customer Information'}</span>
                  </h3>

                  {/* Customer Manual Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-500">{language === 'ar' ? 'اسم العميل' : 'Customer Name'}</label>
                      <input
                        type="text"
                        placeholder={language === 'ar' ? 'مثال: أحمد محمد' : 'e.g. John Doe'}
                        className="w-full px-4 py-2.5 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-indigo-500 font-sans font-medium"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-500">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                      <input
                        type="text"
                        placeholder={language === 'ar' ? 'مثال: 96777000000' : 'e.g. +96650000000'}
                        className="w-full px-4 py-2.5 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-medium"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 1. ORDER ITEMS MANAGEMENT */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-indigo-600 font-bold" />
                    <span>{language === 'ar' ? 'البضائع والمنتجات المضافة في الطلب' : 'Items & Dishes in the Order'}</span>
                  </h3>

                  {/* Items Sub-form */}
                  <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-3">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      {language === 'ar' ? 'تعيين إضافة منتج جديد للطلب' : 'Add a single item node'}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">{language === 'ar' ? 'اسم المنتج' : 'Item Name'}</label>
                        <input 
                          type="text"
                          placeholder={language === 'ar' ? 'مثال: بيتزا مارغريتا' : 'e.g. Garlic Bread'}
                          className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">{language === 'ar' ? 'المطعم / المصدر' : 'Restaurant Source'}</label>
                        {isCustomRestaurant ? (
                          <div className="flex gap-1.5">
                            <input 
                              type="text"
                              placeholder={language === 'ar' ? 'أدخل اسم المطعم' : 'Type restaurant name'}
                              className="flex-1 px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none"
                              value={newItemRestaurant}
                              onChange={(e) => setNewItemRestaurant(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomRestaurant(false);
                                if (restaurants.length > 0) {
                                  setNewItemRestaurant(restaurants[0].name);
                                }
                              }}
                              className="px-2 py-2 text-[9px] bg-zinc-200 hover:bg-zinc-350 rounded-lg font-bold transition-all"
                            >
                              {language === 'ar' ? 'قائمة' : 'List'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5">
                            <select
                              className="flex-1 px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none"
                              value={newItemRestaurant}
                              onChange={(e) => setNewItemRestaurant(e.target.value)}
                            >
                              {restaurants.map((rest, rid) => (
                                <option key={rid} value={rest.name}>{rest.name}</option>
                              ))}
                              {restaurants.length === 0 && (
                                <option value="">{language === 'ar' ? 'لا توجد مطاعم مسجلة' : 'No restaurants registered'}</option>
                              )}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomRestaurant(true);
                                setNewItemRestaurant('');
                              }}
                              className="px-2 py-2 text-[9px] bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-bold transition-all"
                            >
                              {language === 'ar' ? 'مخصص' : 'Custom'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">{language === 'ar' ? 'الكمية' : 'Quantity'}</label>
                        <input 
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none"
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(Math.max(1, Number(e.target.value)))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">{language === 'ar' ? 'سعر الوحدة' : 'Unit Price'}</label>
                        <input 
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none font-mono"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(Math.max(0, Number(e.target.value)))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-lg transition-transform flex items-center gap-1 hover:scale-[1.02] shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'إضافة إلى منتجات الطلب' : 'Add Item to List'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Added Items table list */}
                  {orderItems.length === 0 ? (
                    <div className="p-6 text-center bg-white border border-dashed border-zinc-200 rounded-xl">
                      <ShoppingBag className="w-7 h-7 text-zinc-300 mx-auto mb-2" />
                      <p className="text-zinc-500 text-xs font-bold">{language === 'ar' ? 'لم يتم إضافة أي منتتجات في الطلب بعد' : 'No items added in this order yet'}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{language === 'ar' ? 'استخدم النموذج أعلاه لإدراج الأطباق والكميات.' : 'Fill the miniature node above to coordinate the product list.'}</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-xs text-start">
                        <thead>
                          <tr className="bg-zinc-50/70 border-b border-zinc-150 text-zinc-500 font-bold">
                            <th className="px-3 py-2 text-start">{language === 'ar' ? 'المنتج' : 'Item'}</th>
                            <th className="px-3 py-2 text-center">{language === 'ar' ? 'المطعم' : 'Restaurant'}</th>
                            <th className="px-3 py-2 text-center">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                            <th className="px-3 py-2 text-end">{language === 'ar' ? 'السعر' : 'Price'}</th>
                            <th className="px-3 py-2 text-end">{language === 'ar' ? 'المجموع' : 'Subtotal'}</th>
                            <th className="px-3 py-2 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {orderItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/40">
                              <td className="px-3 py-2.5 font-extrabold text-zinc-800">{item.name}</td>
                              <td className="px-3 py-2.5 text-center text-zinc-500 font-medium">{item.restaurantName}</td>
                              <td className="px-3 py-2.5 text-center font-bold font-mono text-zinc-600">{item.quantity}</td>
                              <td className="px-3 py-2.5 text-end font-semibold font-mono text-zinc-700">{item.price}</td>
                              <td className="px-3 py-2.5 text-end font-black font-mono text-indigo-650">{(item.price * item.quantity).toFixed(2)}</td>
                              <td className="px-3 py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="p-1 text-zinc-400 hover:text-rose-600 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {/* Sum controls helper */}
                      <div className="bg-zinc-50/50 p-3 flex justify-between items-center border-t border-zinc-150 text-xs">
                        <div>
                          <span className="text-zinc-500 font-medium">{language === 'ar' ? 'القيم الكلية المقدرة:' : 'Calculated sum total:'} </span>
                          <strong className="font-extrabold text-indigo-650 font-mono">
                            {orderItems.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={applyAutoSumPrice}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-indigo-950 text-white text-[10px] font-black rounded-lg transition-all flex items-center gap-1 shadow-3xs"
                        >
                          <Hash className="w-3 h-3" />
                          <span>{language === 'ar' ? 'استيراد القيمة في التكلفة' : 'Sync to delivery fee input'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 1.5. MULTIPLE INVOICES IMAGES UPLOAD (DRAG & DROP + CLICK) */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-black text-zinc-900 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-violet-600 font-bold" />
                      <span>{language === 'ar' ? 'فواتير وإيصالات الطلب المتعددة' : 'Order invoices & Receipts Images'}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold">
                      {invoiceImages.length} {language === 'ar' ? 'مرفوعات' : 'uploaded'}
                    </span>
                  </h3>

                  {/* Drop zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                      dragActive
                        ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                        : 'border-zinc-300 bg-white hover:border-zinc-400'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 mx-auto text-zinc-400 mb-2 animate-pulse" />
                    <p className="text-xs font-bold text-zinc-700">
                      {language === 'ar' ? 'اسحب وأسقط صور فواتير الطلب هنا' : 'Drag and drop order invoice images here'}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {language === 'ar' ? 'أو انقر لاختيار ملفات من جهازك' : 'or click to browse your local device'}
                    </p>
                  </div>



                  {/* Previews Grid */}
                  {invoiceImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      {invoiceImages.map((img, index) => (
                        <div key={index} className="relative aspect-video group rounded-lg overflow-hidden border border-zinc-200 bg-white shadow-2xs">
                          <img
                            src={img}
                            alt={`invoice-${index}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <a
                              href={img}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 px-2 bg-white/95 text-zinc-900 rounded-md text-[9px] font-black flex items-center gap-0.5"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{language === 'ar' ? 'عرض' : 'View'}</span>
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeInvoiceImage(index);
                              }}
                              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-[9px] font-bold"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. MAIN DETAILS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">{t.dashboard.deliveryPrice}</label>
                    <input 
                      type="number"
                      required
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none font-mono"
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
                    value={rawNotes}
                    onChange={(e) => setRawNotes(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: يرجى إضافة تفاصيل إضافية أو كتابة متطلبات ورغبات العميل...' : 'e.g. Please call on arrival, extra sauces...'}
                  />
                </div>

                <div className="space-y-4 bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wide block text-start">
                      {language === 'ar' ? 'اختر من المواقع المسجلة' : 'Select Registered Delivery Location'}
                    </label>
                    <select
                      className="w-full px-4 py-2.5 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-violet-500 font-bold text-zinc-700 font-sans"
                      value=""
                      onChange={(e) => {
                        const selectedLoc = locations.find((l: any) => String(l.id) === e.target.value);
                        if (selectedLoc) {
                          const val = selectedLoc.address 
                            ? `${selectedLoc.name} (${selectedLoc.address})` 
                            : selectedLoc.name;
                          setOrderForm({...orderForm, deliveryLocationDescription: val});
                          showToast(
                            language === 'ar' 
                              ? `تم تحديد موقع التوصيل: ${selectedLoc.name}` 
                              : `Delivery location set to: ${selectedLoc.name}`, 
                            'success'
                          );
                        }
                      }}
                    >
                      <option value="">
                        {language === 'ar' 
                          ? '-- اختر موقعًا مسجلاً للاستيراد السريع --' 
                          : '-- Choose registered location for quick-fill --'}
                      </option>
                      {locations.map((loc: any) => (
                        <option key={loc.id} value={String(loc.id)}>
                          📍 {loc.name} {loc.address ? `(${loc.address})` : ''}
                        </option>
                      ))}
                    </select>
                    
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowOrderModal(false);
                          navigate('/dashboard?tab=locations');
                          showToast(
                            language === 'ar' 
                              ? 'تم توجيهك إلى صفحة إدارة المواقع لإدخال موقع جديد' 
                              : 'Redirecting to Location Management to add a new location', 
                            'info'
                          );
                        }}
                        className="text-[11px] text-violet-600 hover:text-violet-800 font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{language === 'ar' ? 'الموقع غير موجود؟ إضافة موقع جديد ➕' : "Location doesn't exist? Add new ➕"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-wide block text-start">
                      {t.dashboard.deliveryLocation}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder={language === 'ar' ? 'عنوان موقع التوصيل بالتفصيل' : 'Detailed delivery location address'}
                      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none font-sans text-xs font-medium"
                      value={orderForm.deliveryLocationDescription}
                      onChange={(e) => setOrderForm({...orderForm, deliveryLocationDescription: e.target.value})}
                    />
                  </div>
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

                <div className="flex gap-4 pt-4 border-t border-zinc-100 shrink-0">
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

