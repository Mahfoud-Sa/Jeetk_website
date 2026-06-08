import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, User as UserIcon, Phone, Calendar, ClipboardList, 
  FileClock, Shield, Key, Activity, Clock, CheckCircle2, EyeOff, RefreshCw, Plus, Loader2,
  AlertCircle, Check, Send, Download, Mail, MapPin, Edit, Eye, Trash2, ArrowUpRight, 
  CheckCircle, Info, Lock, ExternalLink, Settings, PhoneCall, Gift, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateUser } from '../../services/userService';

const DAYS_OF_WEEK = [
  { value: 0, labelEn: 'Sunday', labelAr: 'الأحد' },
  { value: 1, labelEn: 'Monday', labelAr: 'الإثنين' },
  { value: 2, labelEn: 'Tuesday', labelAr: 'الثلاثاء' },
  { value: 3, labelEn: 'Wednesday', labelAr: 'الأربعاء' },
  { value: 4, labelEn: 'Thursday', labelAr: 'الخميس' },
  { value: 5, labelEn: 'Friday', labelAr: 'الجمعة' },
  { value: 6, labelEn: 'Saturday', labelAr: 'السبت' },
];

const RECURRING_PERMISSION_GROUPS = [
  {
    titleEn: 'Order & Packages Service',
    titleAr: 'العمليات والطلبات',
    permissions: [
      { key: 'create_order', labelEn: 'Create & Edit general orders', labelAr: 'إنشاء وتعديل الطلبات العامة', roles: ['admin', 'customer', 'restaurant_owner'] },
      { key: 'cancel_order', labelEn: 'Cancel active contracts', labelAr: 'إلغاء العقود والطلبات النشطة', roles: ['admin', 'customer'] },
      { key: 'track_order', labelEn: 'Real-time GPS tracking', labelAr: 'تتبع خطوط السير والمواقع GPS', roles: ['admin', 'customer', 'delivery'] },
      { key: 'verify_delivery', labelEn: 'Submit digital receipts', labelAr: 'تأكيد التسليم وتوقيع الإيصال', roles: ['admin', 'delivery'] }
    ]
  },
  {
    titleEn: 'Logistics & Duty Roster',
    titleAr: 'إدارة اللوجستيات والمناوبة',
    permissions: [
      { key: 'accept_trip', labelEn: 'Accept logistics contracts', labelAr: 'قبول وتوليد عقود الشحنات والرحلات', roles: ['admin', 'delivery'] },
      { key: 'custom_times', labelEn: 'Update weekly roster times', labelAr: 'تعديل وتحديث تقويم المناوبات الأسبوعية', roles: ['admin', 'delivery'] },
      { key: 'route_planner', labelEn: 'Optimal multi-stop path recalculation', labelAr: 'تخطيط وتعديل المسار الذكي', roles: ['admin', 'delivery'] }
    ]
  },
  {
    titleEn: 'Merchant & Invoice Settings',
    titleAr: 'صلاحيات الحساب التجاري والمطاعم',
    permissions: [
      { key: 'edit_menu', labelEn: 'Modify partner dishes & products', labelAr: 'تعديل قوائم الطعام والوجبات', roles: ['admin', 'restaurant_owner'] },
      { key: 'issue_invoice', labelEn: 'Review financial balance bills', labelAr: 'إصدار ومراجعة الفواتير المالية', roles: ['admin', 'restaurant_owner'] },
      { key: 'set_branch_active', labelEn: 'Toggle restaurant active state', labelAr: 'تعديل حالة فرع المطعم (نشط / مغلق)', roles: ['admin', 'restaurant_owner'] }
    ]
  },
  {
    titleEn: 'Administrative Capabilities',
    titleAr: 'التحويل والصلاحيات الإدارية الفائقة',
    permissions: [
      { key: 'block_user', labelEn: 'Suspend user logins', labelAr: 'حظر وإلغاء تنشيط الحسابات فوراً', roles: ['admin'] },
      { key: 'reset_pass', labelEn: 'Reset security passcodes', labelAr: 'إعادة تعيين كلمات المرور وتجاوز الأمان', roles: ['admin'] },
      { key: 'view_audit', labelEn: 'Inspect system action trails', labelAr: 'الولوج لسجلات تتبع عمليات التدقيق', roles: ['admin'] },
      { key: 'verify_account', labelEn: 'Bypass verification checkpoints', labelAr: 'التحقق اليدوي الخارق وتجاوز OTP', roles: ['admin'] }
    ]
  }
];

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  orders: any[];
  actions: any[];
  workingDays: any[];
  isLoading: boolean;
  language: 'ar' | 'en';
  onVerifyUser: (id: number) => void;
  onActivateUser: (id: number) => void;
  onDeactivateUser: (id: number) => void;
  onResetPassword: (id: number, pword: string) => void;
  onAssignRole: (id: number, role: string) => void;
  openWorkingDaysForm: (user: any) => void;
  onDeleteWorkingDay?: (id: number) => Promise<void>;
  onCreateWorkingDay?: (day: number, fromTime: string, toTime: string) => Promise<void>;
  defaultTab?: 'overview' | 'activity' | 'security';
}

export const UserDetailsModal = ({
  isOpen,
  onClose,
  user,
  orders = [],
  actions = [],
  workingDays = [],
  isLoading,
  language,
  onVerifyUser,
  onActivateUser,
  onDeactivateUser,
  onResetPassword,
  onAssignRole,
  openWorkingDaysForm,
  onDeleteWorkingDay,
  onCreateWorkingDay,
  defaultTab = 'overview'
}: UserDetailsModalProps) => {
  // Dual layout mode: 'drawer' (default Quick View) -> 'full' (Deep Management)
  const [viewMode, setViewMode] = useState<'drawer' | 'full'>('drawer');
  
  // Selected detailed tab
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'orders' | 'security' | 'roles' | 'contact'>('overview');
  
  // Modals inside user details
  const [showActivateConfirm, setShowActivateConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  
  // Inline edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    birthDate: '',
    address: '',
    phoneNumber: ''
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Scheduled shift composer panel
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [newInlineDay, setNewInlineDay] = useState<number>(0);
  const [newInlineFromTime, setNewInlineFromTime] = useState<string>("09:00");
  const [newInlineToTime, setNewInlineToTime] = useState<string>("17:00");
  const [isSavingInline, setIsSavingInline] = useState(false);

  // Messaging Composer state
  const [showComposer, setShowComposer] = useState(false);
  const [composerForm, setComposerForm] = useState({
    channel: 'email' as 'email' | 'sms' | 'push',
    subject: '',
    message: ''
  });
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Filters within Full details
  const [activityFilter, setActivityFilter] = useState<'all' | 'Create' | 'Update' | 'Delete'>('all');
  const [orderFilter, setOrderFilter] = useState<'all' | 'Pending' | 'Delivered' | 'Cancelled'>('all');

  useEffect(() => {
    if (isOpen) {
      setViewMode('drawer');
      setActiveTab('overview');
      setShowComposer(false);
      setIsEditing(false);
    }
  }, [isOpen]);

  // Load editing values when switching to Edit or Full screen
  useEffect(() => {
    if (user) {
      const primaryPhone = user.phoneNumber || (user.phoneNumbers && user.phoneNumbers[0]?.number) || '';
      setEditForm({
        fullName: user.fullName || user.name || '',
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
        address: user.address || '',
        phoneNumber: primaryPhone
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // Primary calculations matched with system structures
  const ordersCount = typeof user.ordersCount === 'number' ? user.ordersCount : (orders?.length || 0);
  const lastActiveText = user.lastActiveText || (language === 'ar' ? 'نشط اليوم' : 'Active today');
  const userRole = user.role || (user.roles && user.roles[0]) || 'customer';

  const statusStr = user.userStatus || (
    !user.isActive 
      ? 'Inactive'
      : (user.isAccountVerified || user.isEmailVerified)
        ? 'Active - Verified'
        : 'Active - Pending Phone / OTP'
  );

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('verified') && s.includes('active')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-100',
        dot: 'bg-emerald-500',
        labelEn: 'Active - Verified',
        labelAr: 'نشط ومؤكد'
      };
    }
    if (s.includes('pending') || s.includes('email') || s.includes('otp')) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-100',
        dot: 'bg-amber-500',
        labelEn: 'Pending Verification',
        labelAr: 'بانتظار التحقق'
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-800 border border-rose-100 bg-rose-100/45',
      dot: 'bg-rose-500',
      labelEn: 'Suspended / Inactive',
      labelAr: 'معطل / موقوف'
    };
  };

  const statusStyle = getStatusColor(statusStr);

  const getInitialsBg = (nameStr: string) => {
    const s = nameStr || '?';
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-indigo-600 text-white',
      'bg-emerald-600 text-white',
      'bg-amber-600 text-white',
      'bg-purple-600 text-white',
      'bg-blue-600 text-white',
      'bg-rose-600 text-white',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const currentInitials = user.fullName 
    ? user.fullName.split(' ').map((n: string) => n.charAt(0)).slice(0, 2).join('').toUpperCase()
    : (user.name ? user.name.charAt(0).toUpperCase() : '?');

  // Trigger export profiles to download JSON
  const handleExportProfile = () => {
    const exportObject = {
      meta: {
        exportedAt: new Date().toISOString(),
        system: 'GEETEC Administrative Suite',
        operator: 'System Administrator'
      },
      profile: {
        id: user.id,
        fullName: user.fullName || user.name,
        email: user.email,
        phoneNumber: editForm.phoneNumber,
        address: user.address,
        birthDate: user.birthDate,
        role: userRole,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isAccountVerified: user.isAccountVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tripsSummary: {
        totalRegisteredTrips: orders.length,
        trips: orders
      },
      actionsAuditTrail: actions
    };

    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const exportFileDefaultName = `GEETEC_PROFMTRX_USR_${user.id}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Perform localized custom message/sms/push mock dispatch
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerForm.message) return;
    setIsSendingMessage(true);

    const targetRecipient = user.fullName || user.name || user.email;
    setTimeout(() => {
      setIsSendingMessage(false);
      setShowComposer(false);
      setComposerForm({ channel: 'email', subject: '', message: '' });
      // Show simulated response via notification
      alert(language === 'ar' 
        ? `تم إرسال الرسالة إلى ${targetRecipient} عبر خط القناة (${composerForm.channel.toUpperCase()}) بنجاح!` 
        : `Message successfully dispatched to ${targetRecipient} via (${composerForm.channel.toUpperCase()}) channel!`
      );
    }, 1200);
  };

  // Real API database write for Profile properties
  const handleSaveProfileEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      // Call standard updateUser API
      await updateUser(user.id, {
        fullName: editForm.fullName,
        name: editForm.fullName,
        birthDate: editForm.birthDate ? `${editForm.birthDate}T00:00:00.000Z` : undefined,
        address: editForm.address,
        phoneNumber: editForm.phoneNumber
      });

      // Update user parent fields dynamically
      user.fullName = editForm.fullName;
      user.name = editForm.fullName;
      user.birthDate = editForm.birthDate ? `${editForm.birthDate}T00:00:00.000Z` : undefined;
      user.address = editForm.address;
      user.phoneNumber = editForm.phoneNumber;

      setIsEditing(false);
      alert(language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح!' : 'User profile updated successfully in Geetech Roster!');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile details.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Filter logs & orders
  const filteredActions = actions.filter(a => activityFilter === 'all' || a.actionType === activityFilter);
  const filteredOrders = orders.filter(o => {
    const s = o.orderState || o.OrderState || 'Pending';
    return orderFilter === 'all' || s.toLowerCase() === orderFilter.toLowerCase();
  });

  return (
    <>
      {/* Dynamic Backdrop Mask */}
      <div 
        className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[80] transition-opacity duration-300"
        onClick={onClose}
      />

      <AnimatePresence mode="wait">
        {/* ======================================================== */}
        {/* 🟨 LAYOUT A: USER DRAWER (QUICK VIEW PANEL) */}
        {/* ======================================================== */}
        {viewMode === 'drawer' ? (
          <motion.div
            key="drawer"
            initial={{ x: language === 'ar' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: language === 'ar' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className={`fixed top-0 ${language === 'ar' ? 'left-0 border-r' : 'right-0 border-l'} h-full w-full max-w-md md:max-w-lg bg-white shadow-2xl z-[90] border-zinc-200 overflow-y-auto flex flex-col font-sans`}
          >
            {/* Header section with actions and title */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 bg-zinc-50/70 shrink-0">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-400 font-sans">
                {language === 'ar' ? 'معاينة هوية سريعة' : 'Quick Profile Matrix'}
              </span>
              <button 
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-zinc-200 text-zinc-500 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main scrollable body of quick drawer */}
            <div className="flex-1 p-6 space-y-6 text-start">
              
              {/* LARGE IDENTITY AVATAR */}
              <div className="flex flex-col items-center text-center space-y-3 pb-2 border-b border-zinc-100">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-extrabold text-3xl shadow-md ${getInitialsBg(user.fullName || user.name || '?')}`}>
                  {currentInitials}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight">
                    {user.fullName || user.name || user.email}
                  </h3>
                  <p className="text-xs text-zinc-455 font-mono">{user.email}</p>
                </div>

                <div className="flex gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 flex items-center gap-1 border ${statusStyle.bg}`}>
                    <span className={`w-1 w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                    {language === 'ar' ? statusStyle.labelAr : statusStyle.labelEn}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-zinc-100 text-zinc-800 border border-zinc-200 shrink-0">
                    {userRole}
                  </span>
                </div>
              </div>

              {/* QUICK STATS ROW */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="bg-zinc-50/50 p-3.5 border border-zinc-150 rounded-2xl flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block">{language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</span>
                    <span className="text-sm font-extrabold text-zinc-800 font-mono block leading-none mt-1">{ordersCount}</span>
                  </div>
                </div>

                <div className="bg-zinc-50/50 p-3.5 border border-zinc-150 rounded-2xl flex items-center gap-3">
                  <Clock className="w-5 h-5 text-indigo-650 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block">{language === 'ar' ? 'النشاط الأخير' : 'Last Activity'}</span>
                    <span className="text-xs font-bold text-zinc-800 truncate block mt-0.5 leading-none">{lastActiveText}</span>
                  </div>
                </div>

                <div className="bg-zinc-50/50 p-3.5 border border-zinc-150 rounded-2xl flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block">{language === 'ar' ? 'الاتصال الهاتفي' : 'Phone Line'}</span>
                    <span className="text-xs font-bold text-zinc-800 block mt-0.5 leading-none">
                      {user.hasPhoneNumber || user.phoneNumbers?.length || user.phoneNumber ? (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <Check className="w-3 h-3 font-bold text-emerald-650" />
                          {language === 'ar' ? 'مسجل' : 'Linked'}
                        </span>
                      ) : (
                        <span className="text-zinc-400">{language === 'ar' ? 'غير مسجل' : 'None'}</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-50/50 p-3.5 border border-zinc-150 rounded-2xl flex items-center gap-3">
                  <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block">{language === 'ar' ? 'حالة الحساب' : 'Account State'}</span>
                    <span className="text-xs font-bold text-zinc-800 block mt-0.5 leading-none">
                      {user.isActive ? (
                        <span className="text-emerald-600 font-bold">{language === 'ar' ? 'مفعل' : 'Active'}</span>
                      ) : (
                        <span className="text-rose-650 font-bold">{language === 'ar' ? 'معطل' : 'Blocked'}</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS PANEL (UNDER 10 SECONDS INTERACTION) */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-400 block">
                  {language === 'ar' ? 'إجراءات سريعة فورية' : 'Instant Administration actions'}
                </span>

                {/* VIEW FULL DETAILS PRIMARY ENTRY POINT */}
                <button
                  type="button"
                  onClick={() => setViewMode('full')}
                  className="w-full py-3.5 bg-black hover:bg-zinc-900 text-white font-extrabold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm scale-[1.01]"
                >
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ar' ? 'فتح الملف والمستندات الكاملة' : 'View Full Profile Workspace'}</span>
                  <ArrowUpRight className="w-4 h-4 text-white hover:translate-x-0.5 transition-transform" />
                </button>

                {/* ACTIVATE / DEACTIVATE TOGGLE */}
                <div className="grid grid-cols-2 gap-3">
                  {user.isActive ? (
                    <button
                      type="button"
                      onClick={() => {
                        onDeactivateUser(user.id);
                        user.isActive = false;
                      }}
                      className="py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all text-center"
                    >
                      <EyeOff className="w-3.5 h-3.5 inline-block mr-1 shrink-0" />
                      <span>{language === 'ar' ? 'حظر دخول الحساب' : 'Suspend Account'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onActivateUser(user.id);
                        user.isActive = true;
                      }}
                      className="py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all text-center"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 inline-block mr-1 shrink-0" />
                      <span>{language === 'ar' ? 'تنشيط وتمكين الحساب' : 'Unsuspend Account'}</span>
                    </button>
                  )}

                  {/* RESET PASSWORD */}
                  <button
                    type="button"
                    onClick={() => {
                      const randPass = Math.random().toString(36).substring(2, 10);
                      onResetPassword(user.id, randPass);
                      alert(language === 'ar' 
                        ? `تم إعادة تعيين كلمة المرور بنجاح للمستخدم إلى: ${randPass}` 
                        : `Password successfully reset for customer/rider to: ${randPass}`
                      );
                    }}
                    className="py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{language === 'ar' ? 'تعيين كلمة المرور' : 'Reset Password'}</span>
                  </button>
                </div>

                {/* EMAIL/SMS DIALOG TOGGLER */}
                <button
                  type="button"
                  onClick={() => setShowComposer(!showComposer)}
                  className="w-full py-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{language === 'ar' ? 'إرسال خطاب / رسالة بريدية' : 'Send Message / Custom Email'}</span>
                </button>
              </div>

              {/* MESSAGING INTEGRATION DRAWER */}
              {showComposer && (
                <motion.form 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3"
                  onSubmit={handleSendMessage}
                >
                  <div className="flex gap-2 justify-center border-b border-zinc-150 pb-2">
                    {['email', 'sms', 'push'].map((chan) => (
                      <button
                        key={chan}
                        type="button"
                        onClick={() => setComposerForm({ ...composerForm, channel: chan as any })}
                        className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-lg font-extrabold border transition-all ${
                          composerForm.channel === chan 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-zinc-500 border-zinc-200'
                        }`}
                      >
                        {chan}
                      </button>
                    ))}
                  </div>

                  {composerForm.channel === 'email' && (
                    <input
                      type="text"
                      required
                      placeholder={language === 'ar' ? 'موضوع الرسالة...' : 'Email topic/subject...'}
                      value={composerForm.subject}
                      onChange={(e) => setComposerForm({ ...composerForm, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-white text-xs border border-zinc-200 rounded-xl outline-none"
                    />
                  )}

                  <textarea
                    required
                    rows={3}
                    placeholder={language === 'ar' ? 'اكتب مضمون الرسالة هنا...' : 'Write message contents here...'}
                    value={composerForm.message}
                    onChange={(e) => setComposerForm({ ...composerForm, message: e.target.value })}
                    className="w-full px-3 py-2 bg-white text-xs border border-zinc-200 rounded-xl outline-none resize-none"
                  />

                  <button
                    type="submit"
                    disabled={isSendingMessage}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSendingMessage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{language === 'ar' ? 'إرسال الرسالة الآن' : 'Send Message Now'}</span>
                  </button>
                </motion.form>
              )}

              {/* MINI DETAILS INFO SECTION (RESTRICTED TO LIGHT METADATA) */}
              <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 space-y-2 text-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block mb-2">
                  {language === 'ar' ? 'تفاصيل أمان الحساب الحيوية' : 'Roster Account Credentials'}
                </span>
                
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <span className="text-zinc-500">{language === 'ar' ? 'تأكيد الحساب ومجموع OTP' : 'Verification Status'}</span>
                  <span className="font-bold flex items-center gap-1">
                    {user.isAccountVerified || user.isEmailVerified ? (
                      <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        {language === 'ar' ? 'مؤكد' : 'Verified'}
                      </span>
                    ) : (
                      <button 
                        onClick={() => {
                          onVerifyUser(user.id);
                          user.isAccountVerified = true;
                        }}
                        className="text-[10px] text-indigo-600 hover:underline font-extrabold"
                      >
                        {language === 'ar' ? 'تجاوز الهاتف يدوياً' : 'Verify Accounts Now'}
                      </button>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <span className="text-zinc-500">{language === 'ar' ? 'تاريخ تشييد الحساب' : 'Date Created'}</span>
                  <span className="font-semibold text-zinc-700 font-mono">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US') : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">{language === 'ar' ? 'رقم الهوية الداخلي' : 'Unique ID'}</span>
                  <span className="font-bold text-zinc-700 font-mono">#{user.id}</span>
                </div>
              </div>

            </div>

            {/* Bottom layout footer bar */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق المعاينة' : 'Close Preview'}
              </button>
            </div>
          </motion.div>
        ) : (
          /* ======================================================== */
          /* 🟥 LAYOUT B: FULL USER DETAILS PAGE (DEEP MANAGEMENT) */
          /* ======================================================== */
          <motion.div
            key="full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-8 overflow-y-auto"
          >
            <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans border border-zinc-200">
              
              {/* identity bar + HEADER */}
              <div className="p-6 bg-zinc-50 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 text-start">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-inner shrink-0 ${getInitialsBg(user.fullName || user.name || '?')}`}>
                    {currentInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-zinc-900 truncate">
                        {user.fullName || user.name || user.email}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 flex items-center gap-1 border ${statusStyle.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        {language === 'ar' ? statusStyle.labelAr : statusStyle.labelEn}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-200 text-zinc-700 border border-zinc-200 uppercase shrink-0">
                        {userRole}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono truncate mt-0.5">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => setViewMode('drawer')}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all border border-zinc-200"
                  >
                    {language === 'ar' ? 'الرجوع للمعاينة' : 'Quick Preview Mode'}
                  </button>
                  <button 
                    type="button"
                    onClick={onClose} 
                    className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-500 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* QUICK ACTION BAR (ALWAYS VISIBLE ADMIN CONTROLS) */}
              <div className="px-6 py-3 bg-zinc-100/60 border-b border-zinc-150 flex flex-wrap items-center justify-between gap-3 shrink-0 text-start">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  {language === 'ar' ? 'موجهات التشغيل السريعة' : 'Global Workspace command bar'}
                </span>

                <div className="flex flex-wrap gap-2">
                  {/* ACTIVATE / DEACTIVATE */}
                  {user.isActive ? (
                    <button
                      type="button"
                      onClick={() => {
                        onDeactivateUser(user.id);
                        user.isActive = false;
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-150 rounded-xl text-[11px] font-bold transition-all"
                    >
                      <EyeOff className="w-3.5 h-3.5 inline mr-1" />
                      {language === 'ar' ? 'تعطيل الحساب' : 'Block User'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onActivateUser(user.id);
                        user.isActive = true;
                      }}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-150 rounded-xl text-[11px] font-bold transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                      {language === 'ar' ? 'تنشيط المستخدم' : 'Activate User'}
                    </button>
                  )}

                  {/* RESET PASSWORD */}
                  <button
                    type="button"
                    onClick={() => {
                      const pass = Math.random().toString(36).substring(2, 11);
                      onResetPassword(user.id, pass);
                      alert(language === 'ar' 
                        ? `تم توليد وإعادة تعيين كلمة مرور جديدة للمستخدم: ${pass}` 
                        : `Credential reset successfully to: ${pass}`
                      );
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 rounded-xl text-[11px] font-bold transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5 inline mr-1 shrink-0" />
                    {language === 'ar' ? 'توليد كلمة مرور' : 'Reset Password'}
                  </button>

                  {/* EXPORT PROFILE */}
                  <button
                    type="button"
                    onClick={handleExportProfile}
                    className="px-3 py-1.5 bg-white hover:bg-zinc-50 text-zinc-850 border border-zinc-200 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'تصدير البيانات JSON' : 'Export Profile'}</span>
                  </button>

                  {/* INLINE MSG COMPOSER DRAWER TOOGLE */}
                  <button
                    type="button"
                    onClick={() => setShowComposer(!showComposer)}
                    className="px-3 py-1.5 bg-black hover:bg-zinc-900 text-white rounded-xl text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'ar' ? 'مراسلة العميل' : 'Send Message'}</span>
                  </button>
                </div>
              </div>

              {/* OPTIONAL MESSAGING SYSTEM BOX */}
              {showComposer && (
                <div className="bg-zinc-50 border-b border-zinc-150 p-5 text-start">
                  <h4 className="text-xs font-bold text-zinc-800 mb-3 block">{language === 'ar' ? 'إرسال إشعار مباشر أو رسالة إلكترونية للمستخدم' : 'Secure Messenger Gateway'}</h4>
                  <form onSubmit={handleSendMessage} className="max-w-xl space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {['email', 'sms', 'push'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setComposerForm({ ...composerForm, channel: m as any })}
                          className={`py-2 text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all border ${
                            composerForm.channel === m ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-zinc-200'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    <textarea
                      required
                      placeholder={language === 'ar' ? 'اكتب الرسالة الموجهة...' : 'Write notification summary...'}
                      value={composerForm.message}
                      onChange={(e) => setComposerForm({ ...composerForm, message: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl outline-none"
                    />

                    <div className="flex gap-2">
                      <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md">
                        {language === 'ar' ? 'إرسال الآن' : 'Dispatch Now'}
                      </button>
                      <button type="button" onClick={() => setShowComposer(false)} className="px-4 py-2 bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold">
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TABS SELECTOR SYSTEM (6 TABS) */}
              <div className="flex border-b border-zinc-100 bg-white px-6 overflow-x-auto gap-2 scrollbar-none shrink-0 border-t border-zinc-50">
                {[
                  { id: 'overview', labelAr: 'الديموغرافيا الأساسية', labelEn: 'Basic Info', icon: UserIcon },
                  { id: 'activity', labelAr: 'سجلات التدقيق', labelEn: 'Audit Trail', icon: FileClock },
                  { id: 'orders', labelAr: 'الطلبات والمركبات', labelEn: 'Registered Trips', icon: ClipboardList },
                  { id: 'security', labelAr: 'إدارة الأمن والأمان', labelEn: 'Credential Security', icon: Shield },
                  { id: 'roles', labelAr: 'الأدوار والصلاحيات', labelEn: 'Roles & Scopes', icon: Settings },
                  { id: 'contact', labelAr: 'العناوين والاتصال', labelEn: 'Contact Channels', icon: Phone }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-4 px-3 border-b-2 font-bold text-xs md:text-sm transition-all whitespace-nowrap ${
                        isActive 
                          ? 'border-black text-black font-extrabold' 
                          : 'border-transparent text-zinc-400 hover:text-zinc-650'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                      <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* DETAILS MAIN WORKSPACE SCROLLBAR */}
              <div className="flex-1 p-6 overflow-y-auto bg-zinc-50/75 text-start">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-9 h-9 animate-spin text-zinc-450 mb-3" />
                    <p className="text-zinc-500 font-bold text-xs">{language === 'ar' ? 'جاري جلب تفاصيل الحساب...' : 'Syncing CRM credentials...'}</p>
                  </div>
                ) : (
                  <>
                    {/* ======================================================== */}
                    {/* OVERVIEW TAB */}
                    {/* ======================================================== */}
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Profile editor / Basic Demographics */}
                          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-2.5">
                              <UserIcon className="w-4 h-4 text-zinc-400" />
                              <span>{language === 'ar' ? 'المعلومات التعريفية وتحديث البيانات' : 'Profile Demographics'}</span>
                            </h3>

                            {!isEditing ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</span>
                                    <span className="text-sm font-extrabold text-zinc-800">{user.fullName || user.name || '-'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</span>
                                    <span className="text-xs font-semibold text-zinc-700 font-mono break-all">{user.email || '-'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">{language === 'ar' ? 'تاريخ الميلاد' : 'Birthdate'}</span>
                                    <span className="text-sm font-bold text-zinc-800">
                                      {user.birthDate ? new Date(user.birthDate).toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US') : '-'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">{language === 'ar' ? 'تاريخ تشييد الحساب' : 'Date Created'}</span>
                                    <span className="text-sm font-bold text-zinc-800">
                                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US') : '-'}
                                    </span>
                                  </div>
                                </div>

                                {user.address && (
                                  <div className="pt-2 border-t border-zinc-100">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">{language === 'ar' ? 'العنوان الجغرافي الحالي' : 'Registered Address'}</span>
                                    <span className="text-sm font-bold text-zinc-700">{user.address}</span>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setIsEditing(true)}
                                  className="mt-4 px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm shrink-0"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>{language === 'ar' ? 'تعديل البيانات' : 'Update Profile Info'}</span>
                                </button>
                              </div>
                            ) : (
                              <form onSubmit={handleSaveProfileEdit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                                    <input
                                      type="text"
                                      required
                                      value={editForm.fullName}
                                      onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-bold"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">{language === 'ar' ? 'الهاتف' : 'Phone'}</label>
                                    <input
                                      type="tel"
                                      value={editForm.phoneNumber}
                                      onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-bold"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">{language === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}</label>
                                    <input
                                      type="date"
                                      value={editForm.birthDate}
                                      onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})}
                                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-bold"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">{language === 'ar' ? 'العنوان' : 'Address'}</label>
                                    <input
                                      type="text"
                                      value={editForm.address}
                                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-2 justify-end pt-3">
                                  <button
                                    type="submit"
                                    disabled={isSavingEdit}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                                  >
                                    {isSavingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{language === 'ar' ? 'حفظ البيانات' : 'Save Changes'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2.5 bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold"
                                  >
                                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>

                          {/* Quick statistics checklist */}
                          <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-zinc-805 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-2.5">
                              <ShieldCheck className="w-4 h-4 text-zinc-400" />
                              <span>{language === 'ar' ? 'فحص التوثيق وحالة الحساب' : 'Security Checks'}</span>
                            </h3>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100">
                                <span className="text-xs text-zinc-500 font-bold">{language === 'ar' ? 'تأكيد البريد والتوثيق' : 'Email/Account Verified'}</span>
                                {user.isAccountVerified || user.isEmailVerified ? (
                                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-150">
                                    <Check className="w-3 h-3" />
                                    {language === 'ar' ? 'موثق' : 'Verified'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-extrabold text-amber-600 uppercase flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-150">
                                    {language === 'ar' ? 'قيد الانتظار' : 'Pending OTP'}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100">
                                <span className="text-xs text-zinc-500 font-bold">{language === 'ar' ? 'رقم الهاتف بقواعدنا' : 'Roster Phone'}</span>
                                {user.phoneNumber || editForm.phoneNumber ? (
                                  <span className="text-zinc-600 font-mono text-xs">{user.phoneNumber || editForm.phoneNumber}</span>
                                ) : (
                                  <span className="text-zinc-400 italic text-[11px]">{language === 'ar' ? 'غير مسجل' : 'Unregistered'}</span>
                                )}
                              </div>

                              <div className="flex items-center justify-between py-1.5">
                                <span className="text-xs text-zinc-500 font-bold">{language === 'ar' ? 'صلاحيات الحظر' : 'Block status'}</span>
                                {user.isActive ? (
                                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-150 rounded-full py-0.5 px-2.5 uppercase font-bold">{language === 'ar' ? 'مفعل' : 'Active'}</span>
                                ) : (
                                  <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-150 rounded-full py-0.5 px-2.5 uppercase font-bold">{language === 'ar' ? 'معطل وموقوف' : 'Deactivated'}</span>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* DRIVER SPECIAL ROSTER (Only rendered for delivery agent) */}
                        {userRole === 'delivery' && (
                          <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-100 pb-3 flex-wrap gap-2">
                              <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-emerald-500 animate-pulse" />
                                <span>{language === 'ar' ? 'تقويم مواعيد ووردية عمل المندوب' : 'Weekly Delivery service Roster'}</span>
                              </h3>

                              {onCreateWorkingDay && (
                                <button
                                  type="button"
                                  onClick={() => setIsAddingInline(!isAddingInline)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{isAddingInline ? (language === 'ar' ? 'إغلاق' : 'Close') : (language === 'ar' ? 'إضافة وردية' : 'Add Shift')}</span>
                                </button>
                              )}
                            </div>

                            {isAddingInline && onCreateWorkingDay && (
                              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                                  <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">{language === 'ar' ? 'اليوم' : 'Day'}</label>
                                    <select
                                      value={newInlineDay}
                                      onChange={(e) => setNewInlineDay(Number(e.target.value))}
                                      className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-xl outline-none text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                                    >
                                      {DAYS_OF_WEEK.map((d) => (
                                        <option key={d.value} value={d.value}>{language === 'ar' ? d.labelAr : d.labelEn}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">{language === 'ar' ? 'من الساعة' : 'From Time'}</label>
                                    <input
                                      type="time"
                                      value={newInlineFromTime}
                                      onChange={(e) => setNewInlineFromTime(e.target.value)}
                                      className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-xl outline-none text-xs font-bold"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">{language === 'ar' ? 'إلى الساعة' : 'To Time'}</label>
                                    <input
                                      type="time"
                                      value={newInlineToTime}
                                      onChange={(e) => setNewInlineToTime(e.target.value)}
                                      className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-xl outline-none text-xs font-bold"
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    disabled={isSavingInline}
                                    onClick={async () => {
                                      setIsSavingInline(true);
                                      try {
                                        await onCreateWorkingDay(newInlineDay, newInlineFromTime, newInlineToTime);
                                        setIsAddingInline(false);
                                      } catch (err) {} finally { setIsSavingInline(false); }
                                    }}
                                    className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{language === 'ar' ? 'إضافة' : 'Save Duty'}</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Roster Layout cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
                              {DAYS_OF_WEEK.map((day) => {
                                const schedulesForDay = workingDays.filter((w) => Number(w.day) === day.value);
                                const hasSchedules = schedulesForDay.length > 0;

                                return (
                                  <div
                                    key={day.value}
                                    className={`p-3 rounded-2xl border transition-all text-center flex flex-col justify-between min-h-[120px] ${
                                      hasSchedules ? 'bg-emerald-50/45 border-emerald-200 text-emerald-950 shadow-sm' : 'bg-zinc-50/50 border-zinc-150 text-zinc-400'
                                    }`}
                                  >
                                    <div>
                                      <span className={`text-[10px] font-extrabold block mb-2 uppercase tracking-wider ${hasSchedules ? 'text-emerald-800' : 'text-zinc-500'}`}>
                                        {language === 'ar' ? day.labelAr : day.labelEn}
                                      </span>

                                      {hasSchedules ? (
                                        <div className="space-y-1.5">
                                          {schedulesForDay.map((schedule) => (
                                            <div key={schedule.id} className="relative p-1.5 bg-white border border-emerald-100 rounded-lg text-start flex flex-col justify-center">
                                              <span className="text-[9px] font-extrabold text-zinc-800 font-mono flex items-center gap-0.5 leading-none">
                                                <Clock className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                                                <span className="truncate">
                                                  {schedule.fromTime?.substring(0, 5)} - {schedule.toTime?.substring(0, 5)}
                                                </span>
                                              </span>
                                              {onDeleteWorkingDay && (
                                                <button
                                                  type="button"
                                                  onClick={() => onDeleteWorkingDay(schedule.id)}
                                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-100 text-rose-700 hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                                                >
                                                  <X className="w-2" />
                                                </button>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="py-4 flex flex-col items-center justify-center opacity-30">
                                          <Clock className="w-4 h-4 text-zinc-300" />
                                          <span className="text-[8px] tracking-wider uppercase mt-1">Off Duty</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ======================================================== */}
                    {/* AUDIT TRAIL / ACTIVITY TIMELINE TAB */}
                    {/* ======================================================== */}
                    {activeTab === 'activity' && (
                      <div className="space-y-4">
                        <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm">
                          
                          {/* Filter selectors inside logs */}
                          <div className="flex flex-wrap items-center justify-between border-b border-zinc-100 pb-3 mb-4 gap-3">
                            <span className="text-xs font-bold text-zinc-800 block">{language === 'ar' ? 'سجل العمليات الإدارية المطروحة للتدقيق الأمني' : 'System Action Trailing logs'}</span>
                            
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">Type:</span>
                              <select
                                value={activityFilter}
                                onChange={(e) => setActivityFilter(e.target.value as any)}
                                className="px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-700 outline-none cursor-pointer"
                              >
                                <option value="all">All Logs</option>
                                <option value="Create">Creates</option>
                                <option value="Update">Updates</option>
                                <option value="Delete">Deletes</option>
                              </select>
                            </div>
                          </div>

                          {filteredActions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center opacity-65">
                              <FileClock className="w-8 h-8 text-zinc-300 mb-2" />
                              <h5 className="font-bold text-sm text-zinc-700">{language === 'ar' ? 'سجل تتبع العمليات فارغ حالياً' : 'Audit Trail is clean'}</h5>
                              <p className="text-xs text-zinc-400 mt-1 max-w-sm">{language === 'ar' ? 'لم يتم رصد أية حركة إدارية أو تغييرات ملموسة صادرة عن هذا المستخدم.' : 'No administration database updates are recorded under this account.'}</p>
                            </div>
                          ) : (
                            <div className="relative border-l border-zinc-200 pl-6 space-y-6 text-start">
                              {filteredActions.map((log: any) => {
                                const oldVal = log.oldValues ?? log.OldValues;
                                const newVal = log.newValues ?? log.NewValues;
                                const actionTypeVal = log.actionType ?? log.ActionType;
                                const timestampVal = log.timestamp ?? log.Timestamp;
                                const entityNameVal = log.entityName ?? log.EntityName;

                                return (
                                  <div key={log.id} className="relative">
                                    <span className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 border-2 border-black bg-white rounded-full flex items-center justify-center shadow-xs" />
                                    
                                    <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg border ${
                                          actionTypeVal === 'Create' ? 'bg-emerald-50 text-emerald-800 border-emerald-150' :
                                          actionTypeVal === 'Delete' ? 'bg-rose-50 text-rose-800 border-rose-150' :
                                          'bg-blue-50 text-blue-800 border-blue-150'
                                        }`}>
                                          {actionTypeVal}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 font-mono font-bold">
                                          {timestampVal ? new Date(timestampVal).toLocaleString() : ''}
                                        </span>
                                      </div>

                                      <p className="text-xs font-bold text-zinc-800">
                                        {language === 'ar' ? `تعديل الكيان السيستمي [${entityNameVal}]` : `Modified system Entity [${entityNameVal}]`}
                                      </p>

                                      {(oldVal || newVal) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-2.5 border-t border-zinc-200/55 font-mono text-[9px]">
                                          {oldVal && (
                                            <div>
                                              <span className="text-[8px] text-red-500 font-bold block mb-1 uppercase tracking-wider">Before</span>
                                              <pre className="max-h-[60px] overflow-y-auto bg-rose-50/20 text-rose-700/85 p-2 rounded-lg border border-rose-100 font-mono scrollbar-none leading-relaxed">
                                                {typeof oldVal === 'object' ? JSON.stringify(oldVal, null, 2) : oldVal}
                                              </pre>
                                            </div>
                                          )}
                                          {newVal && (
                                            <div>
                                              <span className="text-[8px] text-emerald-600 font-bold block mb-1 uppercase tracking-wider">After</span>
                                              <pre className="max-h-[60px] overflow-y-auto bg-emerald-50/20 text-emerald-700/85 p-2 rounded-lg border border-emerald-100 font-mono scrollbar-none leading-relaxed">
                                                {typeof newVal === 'object' ? JSON.stringify(newVal, null, 2) : newVal}
                                              </pre>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ======================================================== */}
                    {/* REGISTERED TRIPS / ORDERS HISTORICAL TAB */}
                    {/* ======================================================== */}
                    {activeTab === 'orders' && (
                      <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-zinc-150 shadow-sm overflow-hidden text-start">
                          <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/65 flex items-center justify-between flex-wrap gap-2">
                            <h4 className="font-bold text-xs text-zinc-800 uppercase tracking-widest flex items-center gap-1.5">
                              <ClipboardList className="w-4 h-4 text-zinc-400" />
                              <span>{language === 'ar' ? 'تاريخ وسجلات تسليم الشحنات والرحلات' : 'Operational Contract history'}</span>
                            </h4>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] uppercase font-bold text-zinc-400">State:</span>
                              <select
                                value={orderFilter}
                                onChange={(e) => setOrderFilter(e.target.value as any)}
                                className="px-2 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-bold outline-none cursor-pointer"
                              >
                                <option value="all">All States</option>
                                <option value="Pending">Pending</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          {filteredOrders.length === 0 ? (
                            <div className="py-16 text-center opacity-65 flex flex-col items-center">
                              <ClipboardList className="w-8 h-8 text-zinc-300 mb-2" />
                              <span className="text-xs font-bold text-zinc-700">{language === 'ar' ? 'لا يوجد سجل تسليم يطابق الترشيح' : 'No Trip Contracts match filter'}</span>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] uppercase font-bold text-zinc-455">
                                    <th className="px-5 py-3 text-start">ID</th>
                                    <th className="px-5 py-3 text-start">{language === 'ar' ? 'تفاصيل المضمون' : 'Trip Contents'}</th>
                                    <th className="px-5 py-3 text-start">{language === 'ar' ? 'عنوان الوِجهة' : 'Shipping Place'}</th>
                                    <th className="px-5 py-3 text-start">{language === 'ar' ? 'رسوم التكلفة' : 'Delivery Fee'}</th>
                                    <th className="px-5 py-3 text-end">{language === 'ar' ? 'حالة الطلب' : 'Status badge'}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-xs text-zinc-805">
                                  {filteredOrders.map((order: any) => {
                                    const idVal = order.id || order.Id;
                                    const descVal = order.description || order.Description || '-';
                                    const locVal = order.deliveryLocationDescription || order.DeliveryLocationDescription || '-';
                                    const priceVal = order.deliveryPrice || order.DeliveryPrice || 0;
                                    const stateVal = order.orderState || order.OrderState || 'Pending';

                                    return (
                                      <tr key={idVal} className="hover:bg-zinc-50/50 transition-all">
                                        <td className="px-5 py-4 font-mono font-bold text-zinc-900">#{idVal}</td>
                                        <td className="px-5 py-4 font-extrabold max-w-xs truncate">{descVal}</td>
                                        <td className="px-5 py-4 text-zinc-500 max-w-xs truncate">{locVal}</td>
                                        <td className="px-5 py-4 font-mono font-bold text-zinc-800">{priceVal} {language === 'ar' ? 'ر.ي' : 'YER'}</td>
                                        <td className="px-5 py-4 text-end">
                                          <span className={`px-2.5 py-0.5 rounded-full uppercase text-[9px] font-extrabold border inline-block ${
                                            stateVal === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-250' :
                                            stateVal === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-250' :
                                            stateVal === 'Cancelled' ? 'bg-rose-50 text-rose-800 border-rose-250' : 'bg-blue-50 text-blue-800'
                                          }`}>
                                            {stateVal}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ======================================================== */}
                    {/* CREDENTIAL & SECURITY CONTROL PANEL TAB */}
                    {/* ======================================================== */}
                    {activeTab === 'security' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Status bypass & administrative overrides */}
                        <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm space-y-4">
                          <h4 className="text-xs font-bold text-zinc-850 uppercase tracking-widest border-b border-zinc-100 pb-2 flex items-center gap-1">
                            <Key className="w-4 h-4 text-zinc-400" />
                            <span>{language === 'ar' ? 'لوحة تفتيش ومصداقية الحساب' : 'Bypass overrides'}</span>
                          </h4>

                          <div className="space-y-3.5">
                            <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-150 rounded-xl">
                              <div>
                                <span className="text-xs font-extrabold text-zinc-800 block leading-none">{language === 'ar' ? 'أمان دخول الجلسة' : 'Login accessibility state'}</span>
                                <span className="text-[10px] text-zinc-450 mt-1 block">{language === 'ar' ? 'تعطيل الحساب مؤقتاً لسحب الصلاحيات' : 'Revoke user interface authorization'}</span>
                              </div>

                              {user.isActive ? (
                                <button
                                  type="button"
                                  onClick={() => setShowDeactivateConfirm(true)}
                                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 shadow-sm border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-all"
                                >
                                  {language === 'ar' ? 'إيقاف وتعطيل الحساب' : 'Revoke Action'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setShowActivateConfirm(true)}
                                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 shadow-sm border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl transition-all"
                                >
                                  {language === 'ar' ? 'تمكين وتنشيط الحساب' : 'Grant Session Access'}
                                </button>
                              )}
                            </div>

                            <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-150 rounded-xl">
                              <div>
                                <span className="text-xs font-extrabold text-zinc-800 block leading-none">{language === 'ar' ? 'التفتيش الخارق OTP' : 'Verification checkpoint bypass'}</span>
                                <span className="text-[10px] text-zinc-450 mt-1 block">{language === 'ar' ? 'تجاوز بوابات التحقق للأرقام يدويًا' : 'Force mark credentials status as verified'}</span>
                              </div>

                              {user.isAccountVerified || user.isEmailVerified ? (
                                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-150 px-3 py-1.5 rounded-xl flex items-center gap-0.5">
                                  <Check className="w-3.5 h-3.5" />
                                  {language === 'ar' ? 'موثق بالكامل' : 'Bypassed'}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onVerifyUser(user.id);
                                    user.isAccountVerified = true;
                                  }}
                                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-750 text-xs font-bold rounded-xl transition-all shadow-sm"
                                >
                                  {language === 'ar' ? 'تجاوز هاتف الآن' : 'Force Verify OTP'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Force Reset password block */}
                        <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm space-y-4">
                          <h4 className="text-xs font-bold text-zinc-850 uppercase tracking-widest border-b border-zinc-100 pb-2 flex items-center gap-1.5">
                            <Key className="w-4 h-4 text-rose-500" />
                            <span>{language === 'ar' ? 'تعديل كلمات المرور الإجرائي' : 'Credentials write override'}</span>
                          </h4>

                          <div className="space-y-3">
                            <p className="text-[11px] text-zinc-455 leading-relaxed">
                              {language === 'ar' 
                                ? 'يحق للإدارة الإدارية الفائقة إعادة تصفير كتابة كلمات المرور وتجاوز معايير الأمان المباشرة للمندوب أو المتجر.' 
                                : 'Administrative authorization bypass allows rewriting login passcodes on the spot for clients, restaurant owners, or riders.'}
                            </p>

                            <button
                              type="button"
                              onClick={() => {
                                const newPasswordStr = Math.random().toString(36).substring(2, 11);
                                setNewPasswordInput(newPasswordStr);
                                setShowResetPasswordConfirm(true);
                              }}
                              className="px-4 py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md flex items-center gap-1 text-center"
                            >
                              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                              <span>{language === 'ar' ? 'توليد وتعيين كلمة مرور مخصصة' : 'Generate & Write credentials override'}</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* ======================================================== */}
                    {/* ROLES & SERVICE CAPABILITY MAP TAB */}
                    {/* ======================================================== */}
                    {activeTab === 'roles' && (
                      <div className="space-y-6">
                        <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm space-y-4">
                          <h4 className="text-xs font-bold text-zinc-850 uppercase tracking-widest border-b border-zinc-100 pb-2">
                            {language === 'ar' ? 'تغيير وتعيين الصلاحيات وموجة مستويات الوصول' : 'Roles & Access vectors'}
                          </h4>

                          <div className="max-w-md pt-1">
                            <label className="text-[11px] uppercase font-bold text-zinc-400 block mb-2">{language === 'ar' ? 'تبديل نطاق الصلاحيات الأساسي:' : 'Modify Core Domain Role:'}</label>
                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 flex items-center select-none shadow-inner">
                              <select
                                value={userRole}
                                onChange={(e) => onAssignRole(user.id, e.target.value)}
                                className="w-full bg-transparent text-xs font-bold text-zinc-800 border-none outline-none cursor-pointer"
                              >
                                <option value="customer">{language === 'ar' ? 'عميل مواطن زبون (Customer)' : 'Customer Client'}</option>
                                <option value="delivery">{language === 'ar' ? 'مندوب رسمي شريك لوجستي (Delivery Driver)' : 'Official Delivery Driver'}</option>
                                <option value="admin">{language === 'ar' ? 'رئيس ومدير نظام مطلق (Admin Administrator)' : 'Full System Administrator'}</option>
                                <option value="restaurant_owner">{language === 'ar' ? 'مالك متجر مطعم شريك (Restaurant Owner)' : 'Restaurant / Merchant Owner'}</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Grouped Permissions checklist display */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {RECURRING_PERMISSION_GROUPS.map((grp, index) => (
                            <div key={index} className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm space-y-3 text-start">
                              <h5 className="font-extrabold text-[11px] uppercase tracking-widest text-zinc-450 border-b border-zinc-100 pb-1.5 leading-none">
                                {language === 'ar' ? grp.titleAr : grp.titleEn}
                              </h5>

                              <div className="space-y-2">
                                {grp.permissions.map((p) => {
                                  const isActivePermission = p.roles.includes(userRole.toLowerCase());
                                  return (
                                    <div key={p.key} className={`flex items-start gap-2 p-2 border rounded-xl ${
                                      isActivePermission ? 'bg-emerald-50/45 border-emerald-100 text-emerald-850' : 'bg-zinc-50 text-zinc-400 border-zinc-150/60 opacity-60'
                                    }`}>
                                      <div className="shrink-0 mt-0.5">
                                        {isActivePermission ? (
                                          <div className="w-4.5 h-4.5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 font-extrabold" />
                                          </div>
                                        ) : (
                                          <div className="w-4.5 h-4.5 bg-zinc-205 text-zinc-400 rounded-full flex items-center justify-center">
                                            <Lock className="w-2.5 h-2.5" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <span className="text-[11px] font-extrabold block">
                                          {language === 'ar' ? p.labelAr : p.labelEn}
                                        </span>
                                        <span className="text-[8px] font-mono uppercase tracking-wider block mt-1">
                                          {p.key}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}

                    {/* ======================================================== */}
                    {/* CONTACTS CHANNELS & ADDRESS SYSTEM TAB */}
                    {/* ======================================================== */}
                    {activeTab === 'contact' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Registered dynamic contact channels */}
                          <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm space-y-4 text-start">
                            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-widest border-b border-zinc-100 pb-2">
                              {language === 'ar' ? 'قنوات وأرقام الاتصال الهاتفي' : 'Communication channels'}
                            </h4>

                            {user.phoneNumbers && user.phoneNumbers.length > 0 ? (
                              <div className="space-y-3">
                                {user.phoneNumbers.map((phone: any, idx: number) => (
                                  <div key={idx} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                      <span className="text-sm font-bold font-mono tracking-wider text-zinc-800 block">{phone.number}</span>
                                      <span className="text-[9px] font-extrabold uppercase bg-zinc-200 text-zinc-650 px-2 py-0.5 border rounded-lg mt-1 inline-block">
                                        {phone.type || 'MOBILE'}
                                      </span>
                                    </div>

                                    <div className="flex gap-1">
                                      <a href={`tel:${phone.number}`} className="p-2 bg-white hover:bg-black hover:text-white border border-zinc-200 text-zinc-700 rounded-xl transition-all shadow-xs shrink-0">
                                        <PhoneCall className="w-3.5 h-3.5" />
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : user.phoneNumber || editForm.phoneNumber ? (
                              <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                  <span className="text-sm font-bold font-mono tracking-widest text-zinc-800 block">{user.phoneNumber || editForm.phoneNumber}</span>
                                  <span className="text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 border border-emerald-100 rounded-lg mt-1 inline-block">
                                    Primary Contact
                                  </span>
                                </div>

                                <a href={`tel:${user.phoneNumber || editForm.phoneNumber}`} className="p-2.5 bg-white hover:bg-black hover:text-white border border-zinc-200 text-zinc-700 rounded-xl transition-all shadow-xs shrink-0">
                                  <PhoneCall className="w-4 h-4" />
                                </a>
                              </div>
                            ) : (
                              <div className="py-10 text-center text-zinc-400 font-medium">
                                {language === 'ar' ? 'لم يتم رصد أية أرقام هواتف مسجلة' : 'No communication channels links registered.'}
                              </div>
                            )}
                          </div>

                          {/* Full physical shipping address card */}
                          <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm space-y-4 text-start">
                            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-widest border-b border-zinc-100 pb-2 flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-zinc-400" />
                              <span>{language === 'ar' ? 'عنوان الشحن واللوجستيات المعتمد' : 'Fulfillment Destination address'}</span>
                            </h4>

                            <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 animate-bounce" />
                              <div className="min-w-0">
                                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block mb-1">{language === 'ar' ? 'الموقع الفعلي للمستخدم' : 'Physical Location'}</span>
                                <p className="text-sm font-semibold text-zinc-800 leading-relaxed">
                                  {user.address || editForm.address || (language === 'ar' ? 'الجمهورية اليمنية، صنعاء' : 'Republic of Yemen, Sana\'a')}
                                </p>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Bottom static action bar footer */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-black hover:bg-zinc-950 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'إنهاء المعاينة والإغلاق' : 'Save & Exit Workspace'}
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* SECURITY BYPASS VERIFICATION MODALS AND CONFIRMS */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showActivateConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center font-sans border border-zinc-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 mb-1">
                {language === 'ar' ? 'تأكيد تنشيط الحساب' : 'Unsuspend User Session'}
              </h4>
              <p className="text-zinc-500 text-xs leading-relaxed mb-6">
                {language === 'ar' 
                  ? 'هل أنت متأكد من رغبتك في إعادة تفعيل حساب هذا المستخدم وتمكينه من الولوج للنظام فوراً؟' 
                  : 'Are you sure you want to unblock this profile? They will immediately regain authorization to use their UI and APIs.'}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowActivateConfirm(false)}
                  className="flex-1 py-3 bg-zinc-105 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all border border-zinc-200"
                >
                  {language === 'ar' ? 'إلغاء الأمر' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onActivateUser(user.id);
                    user.isActive = true;
                    setShowActivateConfirm(false);
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  {language === 'ar' ? 'نشط وتفعيل' : 'Grant Activation'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeactivateConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center font-sans border border-zinc-200">
              <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
                <EyeOff className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 mb-1">
                {language === 'ar' ? 'حظر وتعطيل الحساب' : 'Suspend User Session'}
              </h4>
              <p className="text-zinc-550 text-xs leading-relaxed mb-6">
                {language === 'ar' 
                  ? 'هل أنت متأكد من رغبتك في حظر حساب هذا المستخدم مؤقتًا؟ سيفقد الحساب صلاحيات التسجيل الحالية.' 
                  : 'Are you sure you want to suspend this user? This will instantly close their active API sessions and lock their screens.'}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeactivateConfirm(false)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all border border-zinc-200"
                >
                  {language === 'ar' ? 'إلغاء الأمر' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeactivateUser(user.id);
                    user.isActive = false;
                    setShowDeactivateConfirm(false);
                  }}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  {language === 'ar' ? 'تأكيد الحظر' : 'Confirm Suspension'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showResetPasswordConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-start font-sans border border-zinc-200">
              <h4 className="text-base font-extrabold text-zinc-900 mb-4 text-center">
                {language === 'ar' ? 'تعديل كلمة مرور الحساب' : 'Override Password write'}
              </h4>
              
              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-zinc-400 block mb-1">
                  {language === 'ar' ? 'كلمة المرور المقترحة كبديل:' : 'Override target String:'}
                </label>
                <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5">
                  <input
                    type="text"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="bg-transparent text-sm font-extrabold text-zinc-800 font-mono flex-1 outline-none font-sans"
                    placeholder={language === 'ar' ? 'أدخل الرمز السري الجديد...' : 'Type override word...'}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const passStr = Math.random().toString(36).substring(2, 10);
                      setNewPasswordInput(passStr);
                    }}
                    className="text-xs font-extrabold text-emerald-600 hover:underline cursor-pointer"
                  >
                    {language === 'ar' ? 'توليد' : 'Regen'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordConfirm(false)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold border border-zinc-200 text-center"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetPassword(user.id, newPasswordInput);
                    setShowResetPasswordConfirm(false);
                    alert(language === 'ar' 
                      ? `تم تعيين كلمة المرور الجديدة للمستخدم إلى: ${newPasswordInput} بنجاح!` 
                      : `Password write verified successfully to: ${newPasswordInput}`
                    );
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md text-center"
                >
                  {language === 'ar' ? 'تأكيد الحفظ' : 'Confirm Rewrite'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
