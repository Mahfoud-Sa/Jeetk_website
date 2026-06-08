import { useState, FormEvent, useEffect, useRef } from 'react';
import { 
  Search, Eye, Edit, Trash2, X, CheckCircle2, Truck, UserPlus, User as UserIcon, EyeOff,
  Calendar, Clock, Plus, Loader2, RefreshCw, ShieldCheck,
  Shield, Activity, Mail, Phone, MapPin, Key, ClipboardList, AlertCircle, FileClock,
  Check, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { 
  updateUser, createUser, deleteUser, fetchUserById, verifyUserAccount,
  activateUser, deactivateUser, adminResetUserPassword, fetchUsersPaged
} from '../../services/userService';
import { assignRole } from '../../services/authService';
import { UserRole } from '../../types';
import { fetchWorkingDays, createWorkingDay, deleteWorkingDay, WorkingDay } from '../../services/workingDaysService';
import { fetchUserOrders } from '../../services/orderService';
import { fetchActions } from '../../services/actionService';
import { UserDetailsModal } from './UserDetailsModal';

const DAYS_OF_WEEK = [
  { value: 0, labelEn: 'Sunday', labelAr: 'الأحد' },
  { value: 1, labelEn: 'Monday', labelAr: 'الإثنين' },
  { value: 2, labelEn: 'Tuesday', labelAr: 'الثلاثاء' },
  { value: 3, labelEn: 'Wednesday', labelAr: 'الأربعاء' },
  { value: 4, labelEn: 'Thursday', labelAr: 'الخميس' },
  { value: 5, labelEn: 'Friday', labelAr: 'الجمعة' },
  { value: 6, labelEn: 'Saturday', labelAr: 'السبت' },
];

export const AdminUsers = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  
  // Advanced Server-Side Query, Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer' | 'delivery' | 'restaurant_owner'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [usersPagedData, setUsersPagedData] = useState<any>({
    items: [],
    totalItems: 0,
    totalPages: 1
  });
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  // Modal / Dropdown active tracking states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [viewingUserOrders, setViewingUserOrders] = useState<any[]>([]);
  const [viewingUserActions, setViewingUserActions] = useState<any[]>([]);
  const [viewingUserWorkingDays, setViewingUserWorkingDays] = useState<WorkingDay[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [viewModalDefaultTab, setViewModalDefaultTab] = useState<'overview' | 'activity' | 'security'>('overview');
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [activeDropdownUserId, setActiveDropdownUserId] = useState<number | null>(null);

  // Working Days Admin Management State (for quick roster click option in table)
  const [showWorkingDaysModal, setShowWorkingDaysModal] = useState(false);
  const [selectedUserForSchedule, setSelectedUserForSchedule] = useState<any>(null);
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [newDay, setNewDay] = useState<number>(0);
  const [newFromTime, setNewFromTime] = useState<string>("09:00");
  const [newToTime, setNewToTime] = useState<string>("17:00");

  const [userForm, setUserForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    image: '',
    birthday: '',
    role: 'customer' as UserRole, 
    status: 'active' 
  });

  // Debouncing typed search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // reset to page 1 on active typing
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadPagedUsers = async () => {
    setIsUsersLoading(true);
    try {
      const data = await fetchUsersPaged(
        currentPage,
        pageSize,
        debouncedSearch,
        roleFilter,
        statusFilter
      );
      setUsersPagedData(data);
    } catch (err) {
      console.error("Failed to fetch paginated users:", err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    loadPagedUsers();
  }, [currentPage, pageSize, debouncedSearch, roleFilter, statusFilter]);

  const refetchUsers = () => {
    loadPagedUsers();
  };

  const loadScheduleForUser = async (userId: number) => {
    setIsLoadingSchedule(true);
    try {
      const data = await fetchWorkingDays(userId);
      setWorkingDays(data || []);
    } catch (err) {
      console.error("Failed to load working days:", err);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const openWorkingDaysModal = async (user: any) => {
    setSelectedUserForSchedule(user);
    setShowWorkingDaysModal(true);
    setNewDay(0);
    setNewFromTime("09:00");
    setNewToTime("17:00");
    await loadScheduleForUser(user.id);
  };

  const handleAddSchedule = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUserForSchedule) return;
    setIsAddingSchedule(true);
    try {
      await createWorkingDay({
        userId: selectedUserForSchedule.id,
        day: Number(newDay),
        fromTime: newFromTime,
        toTime: newToTime
      });
      showToast(
        language === 'ar' ? 'تم إضافة يوم العمل للمندوب بنجاح' : 'Driver working day added successfully',
        'success'
      );
      await loadScheduleForUser(selectedUserForSchedule.id);
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || err?.message || 
        (language === 'ar' ? 'فشل إضافة يوم العمل' : 'Failed to add working day'),
        'error'
      );
    } finally {
      setIsAddingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!selectedUserForSchedule) return;
    try {
      await deleteWorkingDay(id);
      showToast(
        language === 'ar' ? 'تم حذف يوم العمل بنجاح' : 'Working day deleted successfully',
        'success'
      );
      setWorkingDays(prev => prev.filter(w => w.id !== id));
    } catch (err: any) {
      showToast(
        language === 'ar' ? 'فشل حذف يوم العمل' : 'Failed to delete working day',
        'error'
      );
    }
  };

  const toggleUserStatus = async (id: number) => {
    const user = usersPagedData.items.find((u: any) => u.id === id);
    if (user) {
      try {
        const isCurrentlyActive = user.isActive;
        if (isCurrentlyActive) {
          await deactivateUser(id);
        } else {
          await activateUser(id);
        }
        refetchUsers();
        showToast(
          language === 'ar' ? 'تم تحديث حالة المستخدم بنجاح' : 'User active status updated successfully',
          'success'
        );
      } catch (error) {
        showToast(
          language === 'ar' ? 'فشل تحديث حالة المستخدم' : 'Failed to update user statusState',
          'error'
        );
      }
    }
  };

  const handleSaveUser = async (e: FormEvent) => {
    e.preventDefault();
    
    const formatDate = (dateStr: string) => {
      if (!dateStr) return new Date().toISOString();
      if (dateStr.includes('T')) return dateStr;
      return `${dateStr}T00:00:00.000Z`;
    };

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          ...editingUser,
          name: userForm.name,
          fullName: userForm.name,
          email: userForm.email,
          password: userForm.password || editingUser.password,
          phoneNumber: userForm.phone,
          address: userForm.location,
          username: userForm.email.split('@')[0],
          isActive: userForm.status === 'active',
          birthDate: formatDate(userForm.birthday),
          updatedAt: new Date().toISOString(),
        });
        
        const roleMapping: Record<string, number> = { admin: 1, customer: 2, delivery: 3, restaurant_owner: 4 };
        await assignRole(editingUser.id, roleMapping[userForm.role] || 2);
        showToast(language === 'ar' ? 'تم تحديث المستخدم بنجاح' : 'User updated successfully', 'success');
      } else {
        await createUser({
          fullName: userForm.name,
          email: userForm.email,
          password: userForm.password,
          confirmPassword: userForm.confirmPassword,
          role: userForm.role,
          birthDate: formatDate(userForm.birthday),
          phoneNumbers: [{ number: userForm.phone, type: 'Mobile' }]
        });
        showToast(language === 'ar' ? 'تم إنشاء المستخدم بنجاح' : 'User created successfully', 'success');
      }
      refetchUsers();
      setShowUserModal(false);
      setEditingUser(null);
    } catch (error: any) {
      showToast(error.message || "Failed to save user", "error");
    }
  };

  const handleVerifyUser = async (id: number) => {
    try {
      await verifyUserAccount(id);
      refetchUsers();
      if (viewingUser && viewingUser.id === id) {
        setViewingUser((prev: any) => ({ ...prev, isAccountVerified: true, isEmailVerified: true }));
      }
      showToast(
        language === 'ar' ? 'تم تفعيل وتأكيد حساب المستخدم بنجاح!' : 'User account verified successfully!',
        'success'
      );
    } catch (error: any) {
      console.error("Failed to verify user account:", error);
      showToast(
        error?.response?.data?.message || error?.message ||
        (language === 'ar' ? 'فشل تأكيد حساب المستخدم.' : 'Failed to verify user account.'),
        'error'
      );
    }
  };

  const handleActivateUser = async (id: number) => {
    try {
      await activateUser(id);
      refetchUsers();
      if (viewingUser && viewingUser.id === id) {
        setViewingUser((prev: any) => ({ ...prev, isActive: true, userStatus: 'Active - Verified' }));
      }
      showToast(
        language === 'ar' ? 'تم تنشيط حساب المستخدم بنجاح!' : 'User account activated successfully!',
        'success'
      );
    } catch (error: any) {
      console.error("Failed to activate user account:", error);
      showToast(
        language === 'ar' ? 'فشل تنشيط الحساب.' : 'Failed to activate user account.',
        'error'
      );
    }
  };

  const handleDeactivateUser = async (id: number) => {
    try {
      await deactivateUser(id);
      refetchUsers();
      if (viewingUser && viewingUser.id === id) {
        setViewingUser((prev: any) => ({ ...prev, isActive: false, userStatus: 'Inactive' }));
      }
      showToast(
        language === 'ar' ? 'تم إلغاء تنشيط حساب المستخدم بنجاح!' : 'User account deactivated successfully!',
        'success'
      );
    } catch (error: any) {
      console.error("Failed to deactivate user account:", error);
      showToast(
        (language === 'ar' ? 'فشل إلغاء تنشيط الحساب.' : 'Failed to deactivate user account.'),
        'error'
      );
    }
  };

  const handleAdminResetPassword = async (id: number, pword: string) => {
    if (!pword || pword.length < 6) {
      showToast(
        language === 'ar' ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.' : 'Password must be at least 6 characters.',
        'error'
      );
      return;
    }
    try {
      await adminResetUserPassword(id, pword);
      showToast(
        language === 'ar' ? `تم إعادة تعيين كلمة المرور بنجاح إلى: ${pword}` : `Password reset successfully to: ${pword}`,
        'success'
      );
    } catch (error: any) {
      console.error("Failed to reset password:", error);
      showToast(
        (language === 'ar' ? 'فشل إعادة تعيين كلمة المرور.' : 'Failed to reset password.'),
        'error'
      );
    }
  };

  const openViewUser = async (user: any) => {
    setIsLoadingDetails(true);
    setShowViewModal(true);
    setViewingUser(user);
    setViewingUserOrders([]);
    setViewingUserActions([]);
    setViewingUserWorkingDays([]);
    try {
      const userDetails = await fetchUserById(user.id);
      setViewingUser(userDetails || user);
      
      const [orders, actions, schedule] = await Promise.all([
        fetchUserOrders(user.id, 1, 100).catch(() => [] as any[]),
        fetchActions(1, 100, user.id).catch(() => [] as any[]),
        fetchWorkingDays(user.id).catch(() => [] as any[])
      ]);

      setViewingUserOrders(Array.isArray(orders) ? orders : []);
      setViewingUserActions(Array.isArray(actions) ? actions : []);
      setViewingUserWorkingDays(Array.isArray(schedule) ? schedule : []);
    } catch (error) {
      console.warn("Failed to fetch complete user details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({ 
      name: '', email: '', password: '', confirmPassword: '', phone: '', 
      location: '', image: '', birthday: '', role: 'customer', status: 'active' 
    });
    setShowUserModal(true);
  };

  const openEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({ 
      name: user.fullName || user.name || '', 
      email: user.email || '', 
      password: '',
      confirmPassword: '',
      phone: user.phoneNumber || (user.phoneNumbers && user.phoneNumbers[0]?.number) || '',
      location: user.address || '',
      image: user.profilePictureUrl || user.image || '',
      birthday: user.birthDate ? user.birthDate.split('T')[0] : '',
      role: user.role || (user.roles && user.roles[0]) || 'customer', 
      status: user.isActive ? 'active' : 'inactive' 
    });
    setShowUserModal(true);
  };

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownUserId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const getInitialsBg = (nameStr: string) => {
    const s = nameStr || '?';
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-indigo-50 border border-indigo-200 text-indigo-700',
      'bg-emerald-50 border border-emerald-200 text-emerald-700',
      'bg-amber-50 border border-amber-200 text-amber-700',
      'bg-purple-50 border border-purple-200 text-purple-700',
      'bg-blue-50 border border-blue-200 text-blue-700',
      'bg-sky-50 border border-sky-200 text-sky-700'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-6 text-start">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">{t.dashboard.users}</h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">{language === 'ar' ? 'تنظيم حسابات العملاء، المناديب، ومدرى النظام في منصة جييتك.' : 'Manage client roster, official delivery riders, and dashboard administrators.'}</p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => { openAddUser(); setUserForm(prev => ({ ...prev, role: 'delivery' })); }}
            className="bg-emerald-550 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 hover:scale-[1.01]"
          >
            <Truck className="w-5 h-5" />
            {language === 'ar' ? 'إضافة مندوب' : 'Add Delivery'}
          </button>
          <button 
            type="button"
            onClick={openAddUser}
            className="bg-black text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-900 transition-all shadow-md hover:scale-[1.01]"
          >
            <UserPlus className="w-5 h-5" />
            {t.dashboard.addUser}
          </button>
        </div>
      </div>
      
      {/* Advanced Filter Racks */}
      <div className="flex flex-col md:flex-row gap-4 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 font-bold" />
          <input 
            type="text" 
            placeholder={t.dashboard.searchUsers}
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm font-semibold font-arabic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Roles Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">{language === 'ar' ? 'فحص الدور' : 'Filter Role'}</span>
          <select 
            className="px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-xs font-bold text-zinc-700 font-sans cursor-pointer"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value as any); setCurrentPage(1); }}
          >
            <option value="all">{t.dashboard.allRoles}</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
            <option value="delivery">Delivery</option>
            <option value="restaurant_owner">Restaurant Owner</option>
          </select>
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">{language === 'ar' ? 'الحالة' : 'Status State'}</span>
          <select 
            className="px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-xs font-bold text-zinc-700 font-sans cursor-pointer"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
          >
            <option value="all">{language === 'ar' ? 'كافة حالات الدخول' : 'All States'}</option>
            <option value="active">{language === 'ar' ? 'حساب نشط' : 'Active Only'}</option>
            <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive Only'}</option>
          </select>
        </div>
      </div>

      {/* Main Enterprise Table Canvas */}
      <div className="bg-white border border-zinc-150 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-150 font-arabic">
                {/* 1. Identity */}
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest">{t.dashboard.userName}</th>
                {/* 2. Roles list */}
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest">{t.dashboard.userRole}</th>
                {/* 3. Status badge */}
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest">{t.dashboard.userStatus}</th>
                {/* 4. Activity timestamps */}
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest">{language === 'ar' ? 'النشاط الأخير' : 'Last Activity'}</th>
                {/* 5. Assigned Orders counts */}
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest">{language === 'ar' ? 'عدد العقود' : 'Assigned Orders'}</th>
                {/* 6. Communication lines check */}
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'خط الاتصال' : 'Contact Check'}</th>
                {/* 7. Action controllers */}
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isUsersLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-500 font-semibold font-sans">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                      <span>{language === 'ar' ? 'جاري جلب قائمة الحسابات والبيانات...' : 'Fetching live profile matrices...'}</span>
                    </div>
                  </td>
                </tr>
              ) : usersPagedData.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-400 font-bold font-sans">
                    {language === 'ar' ? 'لم يعثر على أية حسابات تطابق خيارات التصفية هذه' : 'No records match search parameters.'}
                  </td>
                </tr>
              ) : (
                usersPagedData.items.map((user: any) => {
                  const rolesList = Array.isArray(user.roles) ? user.roles : [user.role || 'customer'];
                  
                  // Compute individual status dynamically matching requirement
                  const computedStatusStr = user.userStatus || (
                    !user.isActive 
                      ? 'Inactive'
                      : (user.isAccountVerified || user.isEmailVerified)
                        ? 'Active - Verified'
                        : 'Active - Email Verified / Pending'
                  );

                  const getStatusStyle = (status: string) => {
                    const s = status.toLowerCase();
                    if (s.includes('verified') && s.includes('active')) {
                      return {
                        dot: 'bg-emerald-500',
                        badge: 'bg-emerald-50/70 text-emerald-800 border border-emerald-150'
                      };
                    }
                    if (s.includes('pending') || s.includes('email') || s.includes('verified')) {
                      return {
                        dot: 'bg-amber-500',
                        badge: 'bg-amber-50/70 text-amber-800 border border-amber-150'
                      };
                    }
                    return {
                      dot: 'bg-rose-500',
                      badge: 'bg-rose-50 text-rose-800 border border-rose-150 bg-rose-100'
                    };
                  };

                  const customStyle = getStatusStyle(computedStatusStr);
                  const activeText = user.lastActiveText || (language === 'ar' ? 'غير نشط مؤخراً' : 'No recent activity');
                  const hasPic = !!user.profilePictureUrl;

                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/40 transition-colors">
                      {/* Column 1: Identity */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {hasPic ? (
                            <img 
                              referrerPolicy="no-referrer"
                              src={user.profilePictureUrl || ''} 
                              alt={user.fullName || user.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-zinc-150 shadow-inner"
                              onError={(e) => {
                                // hide image error seamlessly
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-inner shrink-0 leading-none ${getInitialsBg(user.fullName || user.name || '?')}`}>
                              {user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : '?')}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span 
                              onClick={() => { setViewModalDefaultTab('overview'); openViewUser(user); }}
                              className="text-sm font-extrabold text-zinc-900 block truncate hover:underline cursor-pointer"
                            >
                              {user.fullName || user.name || user.email}
                            </span>
                            <span className="text-xs text-zinc-400 block truncate font-mono">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Roles display as badge */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {rolesList.map((r: string, idx: number) => {
                            const normalizedRole = r.toLowerCase();
                            return (
                              <span 
                                key={idx} 
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                  normalizedRole === 'admin' 
                                    ? 'bg-rose-50 text-rose-700 border-rose-150' 
                                    : normalizedRole === 'delivery'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                                      : 'bg-zinc-100 text-zinc-650 border-zinc-200'
                                }`}
                              >
                                {r}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Column 3: Status Badge */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 leading-none">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase shrink-0 flex items-center gap-1 leading-none ${customStyle.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${customStyle.dot}`} />
                            {language === 'ar' ? (computedStatusStr === 'Inactive' ? 'غير نشط' : computedStatusStr === 'Active - Verified' ? 'نشط ومؤكد' : 'نشط - انتظار') : computedStatusStr}
                          </span>
                        </div>
                      </td>

                      {/* Column 4: Activity Text */}
                      <td className="px-6 py-4">
                        <div className="min-w-0" title={user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : ''}>
                          <span className="text-xs font-semibold text-zinc-700 font-sans block truncate">{activeText}</span>
                          {user.lastActiveAt && (
                            <span className="text-[10px] text-zinc-400 mt-0.5 block truncate font-mono">
                              {new Date(user.lastActiveAt).toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 5: Total Orders counts */}
                      <td className="px-6 py-4 font-mono font-bold text-xs text-zinc-805">
                        {language === 'ar' 
                          ? `${user.ordersCount || 0} طلبات` 
                          : `${user.ordersCount || 0} orders`}
                      </td>

                      {/* Column 6: Phone linked check */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {user.hasPhoneNumber || user.phoneNumbers?.length ? (
                            <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-150" title={language === 'ar' ? 'رقم مسجل ومؤكد للمندوب بقواعدنا' : 'Verified contact checked'}>
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center border border-zinc-200" title={language === 'ar' ? 'بانتظار إضافة تفاصيل الاتصال' : 'No contact info provided'}>
                              <X className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 7: Actions menu */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 text-right relative">
                          <button
                            type="button"
                            onClick={() => { setViewModalDefaultTab('overview'); openViewUser(user); }}
                            className="text-xs font-extrabold px-3 py-1.5 bg-zinc-900 text-white rounded-xl hover:bg-black transition-all shadow-sm leading-none flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'عرض' : 'View'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleUserStatus(user.id)}
                            className={`p-2 rounded-xl border transition-all ${
                              user.isActive 
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-660 border-emerald-150' 
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-660 border-rose-150'
                            }`}
                            title={user.isActive ? (language === 'ar' ? 'إلغاء التنشيط المباشر' : 'Quick Block') : (language === 'ar' ? 'تنشيط مباشر' : 'Quick Activate')}
                          >
                            {user.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          {/* ⋮ More Options menu dropdown */}
                          <div className="inline-block relative text-start">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownUserId(activeDropdownUserId === user.id ? null : user.id);
                              }}
                              className="p-2 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 rounded-xl text-zinc-455 transition-all outline-none"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {activeDropdownUserId === user.id && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95, y: -5 }} 
                                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                  className={`absolute ${language === 'ar' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'} mt-1.5 w-52 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden font-sans`}
                                >
                                  <div className="py-1">
                                    <button
                                      type="button"
                                      onClick={() => { setViewModalDefaultTab('overview'); openViewUser(user); }}
                                      className="w-full px-4 py-2.5 hover:bg-zinc-50 text-xs font-bold text-zinc-800 flex items-center gap-2 text-start"
                                    >
                                      <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                                      <span>{language === 'ar' ? 'عرض التفاصيل والملفات' : 'View Full Details'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => { setViewModalDefaultTab('activity'); openViewUser(user); }}
                                      className="w-full px-4 py-2.5 hover:bg-zinc-50 text-xs font-bold text-zinc-800 flex items-center gap-2 text-start"
                                    >
                                      <FileClock className="w-3.5 h-3.5 text-zinc-400" />
                                      <span>{language === 'ar' ? 'متابعة سجل العمليات' : 'View Activity Log'}</span>
                                    </button>

                                    {rolesList.includes('delivery') && (
                                      <button
                                        type="button"
                                        onClick={() => openWorkingDaysModal(user)}
                                        className="w-full px-4 py-2.5 hover:bg-zinc-50 text-xs font-bold text-zinc-800 flex items-center gap-2 text-start"
                                      >
                                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>{language === 'ar' ? 'جدولة مواعيد العمل' : 'Roster Duties'}</span>
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => openEditUser(user)}
                                      className="w-full px-4 py-2.5 hover:bg-zinc-50 text-xs font-bold text-zinc-800 flex items-center gap-2 text-start border-t border-zinc-100"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-zinc-400" />
                                      <span>{language === 'ar' ? 'تعديل البيانات الأساسية' : 'Edit Main Info'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => { setUserToDelete(user.id); setShowDeleteConfirm(true); }}
                                      className="w-full px-4 py-2.5 hover:bg-rose-50 text-xs font-bold text-rose-700 flex items-center gap-2 text-start border-t border-zinc-100"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                      <span>{language === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account'}</span>
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server Side Pagination Control footer bar */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-150 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold text-zinc-500 font-mono">
              {language === 'ar' 
                ? `عرض ${usersPagedData.items.length} سجل من إجمالي ${usersPagedData.totalItems} مستخدم`
                : `Showing ${usersPagedData.items.length} of ${usersPagedData.totalItems} profiles`}
            </span>

            {/* Page Limit dropdown */}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'ar' ? 'حجم السجل:' : 'Limit:'}</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1 bg-white border border-zinc-200 text-[10px] font-bold rounded-lg outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1 || isUsersLoading}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              {language === 'ar' ? 'السابق' : 'Previous'}
            </button>
            <span className="flex items-center px-3.5 text-xs font-mono font-bold text-zinc-800 bg-white border border-zinc-200 rounded-xl">
              {currentPage} / {usersPagedData.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={currentPage >= usersPagedData.totalPages || isUsersLoading}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, usersPagedData.totalPages))}
              className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              {language === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      {/* MODALS SECTION */}
      <AnimatePresence>
        {/* ADD / EDIT USER FORM */}
        {showUserModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">{editingUser ? t.dashboard.editUser : t.dashboard.addUser}</h2>
                <button type="button" onClick={() => setShowUserModal(false)} className="p-2 hover:bg-zinc-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-start">
                    <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.userName}</label>
                    <input type="text" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none text-sm font-bold text-zinc-800" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
                  </div>
                  <div className="text-start">
                    <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.userEmail}</label>
                    <input type="email" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none text-sm font-bold text-zinc-850" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
                  </div>
                  <div className="text-start">
                    <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.userPassword}</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none pr-12 text-sm font-semibold" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required={!editingUser} />
                      <button type="button" onMouseDown={() => setShowPassword(true)} onMouseUp={() => setShowPassword(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"><Eye className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <div className="text-start">
                    <label className="block text-sm font-medium text-zinc-500 mb-1">{t.dashboard.userPhone}</label>
                    <input type="tel" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none text-sm font-mono font-bold" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} required />
                  </div>
                </div>
                <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-md hover:bg-zinc-800 transition-colors mt-6">{t.dashboard.saveUser}</button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* DRIVER WORKING ROSTER MODAL */}
        {showWorkingDaysModal && selectedUserForSchedule && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-4xl rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                <div className="text-start">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-emerald-500 animate-pulse" />
                    <span>{language === 'ar' ? 'تقويم أيام عمل المندوب' : 'Driver Working Schedule'}</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">
                    {language === 'ar' 
                      ? `إدارة الأيام وأوقات العمل لـ: ${selectedUserForSchedule.fullName || selectedUserForSchedule.name}` 
                      : `Manage working days & times for: ${selectedUserForSchedule.fullName || selectedUserForSchedule.name}`}
                  </p>
                </div>
                <button type="button" onClick={() => setShowWorkingDaysModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column (2/5): Add Form */}
                <div className="lg:col-span-2 bg-zinc-50 border border-zinc-150 p-6 rounded-2xl h-fit">
                  <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3 mb-4 text-start flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-500" />
                    {language === 'ar' ? 'إضافة موعد جديد بانتظام' : 'Add New Duty slot'}
                  </h3>

                  <form onSubmit={handleAddSchedule} className="space-y-4">
                    <div className="space-y-1.5 text-start">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">
                        {language === 'ar' ? 'اليوم' : 'Day'}
                      </label>
                      <select
                        value={newDay}
                        onChange={(e) => setNewDay(Number(e.target.value))}
                        className="w-full h-11 px-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 text-sm font-bold"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                           <option key={d.value} value={d.value}>
                             {language === 'ar' ? d.labelAr : d.labelEn}
                           </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-start">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">
                          {language === 'ar' ? 'من الساعة' : 'From Time'}
                        </label>
                        <input
                          type="time"
                          required
                          value={newFromTime}
                          onChange={(e) => setNewFromTime(e.target.value)}
                          className="w-full h-11 px-3 bg-white border border-zinc-200 rounded-xl outline-none text-sm font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-1.5 text-start">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">
                          {language === 'ar' ? 'إلى الساعة' : 'To Time'}
                        </label>
                        <input
                          type="time"
                          required
                          value={newToTime}
                          onChange={(e) => setNewToTime(e.target.value)}
                          className="w-full h-11 px-3 bg-white border border-zinc-200 rounded-xl outline-none text-sm font-mono font-bold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isAddingSchedule}
                      className="w-full h-11 bg-black hover:bg-zinc-900 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-md mt-6 disabled:opacity-50"
                    >
                      {isAddingSchedule ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {language === 'ar' ? 'جاري الإضافة...' : 'Adding...'}
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          {language === 'ar' ? 'حفظ وإضافة' : 'Save & Add'}
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right Column (3/5): Current Duties list */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-zinc-800 text-start">
                      {language === 'ar' ? 'قائمة الفترات المسجلة' : 'Registered Duty Periods'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => selectedUserForSchedule && loadScheduleForUser(selectedUserForSchedule.id)}
                      className="p-1 px-2.5 border border-zinc-200 hover:bg-zinc-50 text-xs rounded-lg font-medium text-zinc-500 transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3 animate-spin-slow" />
                      <span>{language === 'ar' ? 'تحديث' : 'Reload'}</span>
                    </button>
                  </div>

                  {isLoadingSchedule ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-zinc-150 rounded-2xl bg-zinc-50/20 space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-zinc-350" />
                      <p className="text-xs text-zinc-400 font-bold">
                        {language === 'ar' ? 'تحميل الفترات...' : 'Loading periods...'}
                      </p>
                    </div>
                  ) : workingDays.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                      <div className="p-3 bg-white rounded-full mb-3 text-zinc-300 border border-zinc-150">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                      <p className="text-sm font-bold text-zinc-550 text-center mb-0.5">
                        {language === 'ar' ? 'هذا المندوب ليس لديه مواعيد حالياً' : 'No schedules defined yet'}
                      </p>
                      <p className="text-xs text-zinc-405 text-center max-w-sm">
                        {language === 'ar' 
                          ? 'استخدم النموذج لجدولة أوقات دوام المندوب المتاحة.' 
                          : 'Use the form to schedule the available driver delivery duties.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {workingDays.map((w) => {
                        const dayName = DAYS_OF_WEEK.find((d) => d.value === w.day);
                        return (
                          <div
                            key={w.id}
                            className="p-3 bg-white border border-zinc-150 rounded-xl flex items-center justify-between shadow-sm hover:border-zinc-250 transition-all text-start font-sans"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-zinc-800">
                                  {language === 'ar' ? dayName?.labelAr : dayName?.labelEn}
                                </h4>
                                <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-zinc-400" />
                                  <span>
                                    {w.fromTime?.substring(0, 5)} - {w.toTime?.substring(0, 5)}
                                  </span>
                                </p>
                              </div>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => w.id && handleDeleteSchedule(w.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100 cursor-pointer"
                              title={language === 'ar' ? 'حذف' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* DETAILS modal */}
        <UserDetailsModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          user={viewingUser}
          orders={viewingUserOrders}
          actions={viewingUserActions}
          workingDays={viewingUserWorkingDays}
          isLoading={isLoadingDetails}
          language={language}
          defaultTab={viewModalDefaultTab}
          onVerifyUser={handleVerifyUser}
          onActivateUser={handleActivateUser}
          onDeactivateUser={handleDeactivateUser}
          onResetPassword={handleAdminResetPassword}
          onAssignRole={async (id, roleName) => {
            try {
              const roleMapping: Record<string, number> = { admin: 1, customer: 2, delivery: 3, restaurant_owner: 4 };
              await assignRole(id, roleMapping[roleName] || 2);
              setViewingUser((prev: any) => ({ ...prev, role: roleName, roles: [roleName] }));
              refetchUsers();
              showToast(
                language === 'ar' ? 'تمت إعادة تعيين دور المستخدم وصلاحياته بنجاح!' : 'User role and permissions updated successfully!',
                'success'
              );
            } catch (error) {
              showToast(language === 'ar' ? 'فشل تحديث دور المستخدم.' : 'Failed to assign user role.', 'error');
            }
          }}
          openWorkingDaysForm={(usr) => {
            setShowViewModal(false);
            openWorkingDaysModal(usr);
          }}
          onDeleteWorkingDay={async (scheduleId) => {
            try {
              await deleteWorkingDay(scheduleId);
              setViewingUserWorkingDays(prev => prev.filter(w => w.id !== scheduleId));
              showToast(
                language === 'ar' ? 'تم حذف يوم العمل بنجاح' : 'Working day deleted successfully',
                'success'
              );
            } catch (err) {
              showToast(
                language === 'ar' ? 'فشل حذف يوم العمل' : 'Failed to delete working day',
                'error'
              );
            }
          }}
          onCreateWorkingDay={async (day, fromTime, toTime) => {
            if (!viewingUser) return;
            try {
              await createWorkingDay({
                userId: viewingUser.id,
                day,
                fromTime,
                toTime
              });
              const updatedSchedules = await fetchWorkingDays(viewingUser.id);
              setViewingUserWorkingDays(updatedSchedules || []);
              showToast(
                language === 'ar' ? 'تم إضافة يوم العمل بنجاح' : 'Working day added successfully',
                'success'
              );
            } catch (err: any) {
              showToast(
                err?.response?.data?.message || err?.message ||
                (language === 'ar' ? 'فشل إضافة يوم العمل' : 'Failed to add working day'),
                'error'
              );
              throw err;
            }
          }}
        />

        {/* DELETE CONFIRM DIALOG */}
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center font-sans">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
                <AlertCircle className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1 text-center">
                {language === 'ar' ? 'تأكيد الحذف النهائي' : 'Confirm Deletion'}
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed mb-6 text-center">
                {language === 'ar' 
                  ? 'هل أنت متأكد من رغبتك في حذف حساب هذا المستخدم نهائياً؟ هذا الإجراء لا يمكن الرجوع عنه أبداً.' 
                  : 'Are you sure you want to delete this user account permanently? This action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-20s text-zinc-800 rounded-xl text-xs font-bold transition-all border border-zinc-200 text-center cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء الأمر' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (userToDelete) {
                      try {
                        await deleteUser(userToDelete);
                        refetchUsers();
                        showToast(
                          language === 'ar' ? 'تم حذف حساب المستخدم بنجاح!' : 'User profile deleted successfully!',
                          'success'
                        );
                      } catch (error: any) {
                        showToast(
                          language === 'ar' ? 'فشل حذف هذا المستخدم في النظام.' : 'Failed to delete user profile.',
                          'error'
                        );
                      } finally {
                        setShowDeleteConfirm(false);
                        setUserToDelete(null);
                      }
                    }
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all text-center cursor-pointer"
                >
                  {language === 'ar' ? 'حذف الآن' : 'Delete Permanent'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
