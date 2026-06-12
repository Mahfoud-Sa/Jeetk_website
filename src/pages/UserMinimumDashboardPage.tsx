import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, FileText, Upload, CheckCircle2, AlertCircle, Clock, Eye, Trash2, 
  User as UserIcon, Calendar, Mail, Phone, ShieldCheck, MapPin, Building,
  Plus, Check, Download, ExternalLink, RefreshCw, FileCheck, Landmark, Truck, Loader2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useUser, fetchUserById, updateUser } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { fetchUserOrders, updateOrderState } from '../services/orderService';
import { fetchWorkingDays, createWorkingDay, deleteWorkingDay, WorkingDay } from '../services/workingDaysService';
import { Order } from '../types';
import { ShoppingBag, ChevronRight, Activity, TrendingUp } from 'lucide-react';

interface DocumentFile {
  id: string;
  nameAr: string;
  nameEn: string;
  type: string;
  status: 'verified' | 'pending' | 'missing' | 'rejected';
  uploadedAt?: string;
  verifiedAt?: string;
  fileSize?: string;
  commentsAr?: string;
  commentsEn?: string;
}

export function UserMinimumDashboardPage() {
  const { language } = useLanguage();
  const { user: currentUser, role: userRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Resolve which user-ID we are viewing: from query param or fallback to current logged in user
  const paramId = searchParams.get('id');
  const targetIdStr = paramId || (currentUser ? String(currentUser.id) : null);
  const targetId = targetIdStr ? Number(targetIdStr) : null;

  // Load user data using our existing query hook
  const { data: user, isLoading, refetch, error } = useUser(targetId);

  const [activeTab, setActiveTab] = useState<'documents' | 'vehicle' | 'orders' | 'schedule' | 'logs'>('documents');
  const [selectedDoc, setSelectedDoc] = useState<DocumentFile | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Orders and Work Days States
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);

  // Schedule formulation states
  const [newDay, setNewDay] = useState<number>(0);
  const [newFromTime, setNewFromTime] = useState<string>("09:00");
  const [newToTime, setNewToTime] = useState<string>("17:00");

  const loadOrders = async () => {
    if (!targetId) return;
    setIsLoadingOrders(true);
    try {
      const data = await fetchUserOrders(targetId);
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to fetch user orders detailed view:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadSchedule = async () => {
    if (!targetId) return;
    setIsLoadingSchedule(true);
    try {
      const data = await fetchWorkingDays(targetId);
      setWorkingDays(data || []);
    } catch (err) {
      console.error("Failed to load working days configuration:", err);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  useEffect(() => {
    if (targetId) {
      loadOrders();
      loadSchedule();
    }
  }, [targetId]);

  // Initialize interactive state for simulated documents
  const [docs, setDocs] = useState<DocumentFile[]>([
    {
      id: 'national_id',
      nameAr: 'الهوية الوطنية / الإقامة',
      nameEn: 'National ID / Iqama Card',
      type: 'PDF / Image',
      status: 'verified',
      uploadedAt: '2026-06-10 14:30',
      verifiedAt: '2026-06-11 09:15',
      fileSize: '1.2 MB',
      commentsAr: 'الهوية سارية المفعول حتى عام 2029.',
      commentsEn: 'ID card valid until 2029.'
    },
    {
      id: 'driving_license',
      nameAr: 'رخصة القيادة العمومية',
      nameEn: 'Public Driving License',
      type: 'Image (JPG)',
      status: 'pending',
      uploadedAt: '2026-06-11 11:22',
      fileSize: '840 KB',
      commentsAr: 'قيد المراجعة والتدقيق والمطابقة مع ساهر وبوابات المرور الموحدة.',
      commentsEn: 'Pending validation against unified traffic databases.'
    },
    {
      id: 'good_conduct',
      nameAr: 'صحيفة الحالة الجنائية (شهادة حسن السيرة)',
      nameEn: 'Criminal Record Clearance (Good Conduct)',
      type: 'PDF Document',
      status: 'missing',
      commentsAr: 'يرجى استخراج شهادة الخلو من السوابق ورفعها قبل بدء الدورة التدريبية.',
      commentsEn: 'Please obtain your criminal history clearance before starting active service.'
    },
    {
      id: 'vehicle_registration',
      nameAr: 'رخصة سير المركبة (الاستمارة)',
      nameEn: 'Vehicle Registration Document',
      type: 'PDF / Image',
      status: 'verified',
      uploadedAt: '2026-06-09 10:14',
      verifiedAt: '2026-06-11 11:00',
      fileSize: '2.1 MB',
      commentsAr: 'تم مطابقة رقم هيكل المركبة ونوع اللوحة بنجاح.',
      commentsEn: 'Vehicle VIN and plate classification matches successfully.'
    },
    {
      id: 'vehicle_insurance',
      nameAr: 'وثيقة تأمين المركبة المعتمدة',
      nameEn: 'Third-Party / Comprehensive Insurance Policy',
      type: 'PDF Document',
      status: 'rejected',
      uploadedAt: '2026-06-08 16:45',
      fileSize: '1.7 MB',
      commentsAr: 'تم رفص الوثيقة لأن صلاحية التأمين منتهية. الرجاء رفع التأمين الجديد الممتد.',
      commentsEn: 'Insurance certificate rejected due to expiry. Please upload active renewal policy.'
    }
  ]);

  // Handle simple doc upload simulation
  const handleSimulateUpload = (docId: string) => {
    setIsUploading(docId);
    setTimeout(() => {
      setDocs(prev => prev.map(d => {
        if (d.id === docId) {
          return {
            ...d,
            status: 'pending',
            uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
            commentsAr: 'تم رفع الملف بنجاح وهو الآن تحت المراجعة الفورية.',
            commentsEn: 'File uploaded successfully and is currently under verification.'
          };
        }
        return d;
      }));
      setIsUploading(null);
      showToast(
        language === 'ar' ? 'تم رفع المستند بنجاح للمراجعة.' : 'Document uploaded successfully for review.',
        'success'
      );
    }, 1500);
  };

  // Quick verification toggle for admins
  const handleVerifyToggle = (docId: string, action: 'verify' | 'reject') => {
    setDocs(prev => prev.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: action === 'verify' ? 'verified' : 'rejected',
          verifiedAt: action === 'verify' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
          commentsAr: action === 'verify' ? 'تمت الموافقة على المستند من قبل الإدارة.' : 'تم رفض المستند للتناقض في البيانات. يرجى مراجعة الملف والمحاولة مرة أخرى.',
          commentsEn: action === 'verify' ? 'Approved by current Administrator session.' : 'Document invalid or illegible. Please double-check formatting and re-upload.'
        };
      }
      return d;
    }));
    showToast(
      language === 'ar' ? 'تم تحديث حالة المستند ومزامنته.' : 'Document status updated and synchronized.',
      'success'
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-zinc-500 font-extrabold text-sm font-sans animate-pulse">
            {language === 'ar' ? 'جاري تحميل الملفات والوثائق الشاملة...' : 'Synchronizing secure files catalog...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-zinc-200 p-8 text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">
            {language === 'ar' ? 'حدث خطأ في جلب بيانات المستخدم' : 'Could Not Retrieve Target Profile'}
          </h2>
          <p className="text-zinc-500 text-sm mb-6">
            {language === 'ar' ? 'يبدو أن الملف التعريفي غير متوفر أو غير متوافق مع خادم البيانات.' : 'The requested profile node could not be loaded from database registry.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-zinc-900 text-white font-extrabold rounded-xl hover:bg-zinc-805 transition-colors"
          >
            {language === 'ar' ? 'العودة للوحة التحكم الرئيسية' : 'Return to Core Console'}
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats for file hub
  const totalUploaded = docs.filter(d => d.status !== 'missing').length;
  const totalVerified = docs.filter(d => d.status === 'verified').length;
  const progressPercent = Math.round((totalVerified / docs.length) * 100);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-20">
      {/* HEADER BAR */}
      <div className="bg-white border-b border-zinc-200/80 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-xl font-bold text-sm transition-all"
          >
            <ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            <span>{language === 'ar' ? 'الرجوع للخلف' : 'Back'}</span>
          </button>

          <div className="text-center font-bold text-lg font-sans text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-indigo-950">
            {language === 'ar' ? 'تفاصيل المستخدم' : 'Verified Agent Docs Registry'}
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 text-zinc-400 hover:text-indigo-600 rounded-xl hover:bg-zinc-100 transition-all"
            title={language === 'ar' ? 'تحديث البيانات' : 'Sync latest updates'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* TOP COMPLIANCE PANEL HERO */}
        <div className="bg-gradient-to-br from-indigo-950 to-zinc-900 text-white rounded-3xl p-6 md:p-8 shadow-xl mb-8 border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 text-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/15">
                <UserIcon className="w-8 h-8 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-extrabold font-sans select-all">{user.fullName || user.username}</h1>
                  {user.isActive ? (
                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {language === 'ar' ? 'نشط ومصرح' : 'Active Duty'}
                    </span>
                  ) : (
                    <span className="bg-zinc-500/20 border border-zinc-500/30 text-zinc-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {language === 'ar' ? 'حساب غير نشط' : 'Inactive'}
                    </span>
                  )}
                </div>
                <p className="text-zinc-300 text-xs mt-1 font-mono flex items-center gap-1">
                  <span>@{user.username}</span>
                  <span className="text-zinc-500">•</span>
                  <span>ID: #{user.id}</span>
                </p>
              </div>
            </div>

            {/* PROGRESS CHART */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 max-w-sm">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="24" className="text-white/10" strokeWidth="4" fill="transparent" stroke="currentColor"/>
                  <circle cx="28" cy="28" r="24" className="text-indigo-400" strokeWidth="4" fill="transparent" strokeDasharray={2 * Math.PI * 24} strokeDashoffset={2 * Math.PI * 24 * (1 - progressPercent / 100)} stroke="currentColor"/>
                </svg>
                <span className="absolute text-xs font-black font-mono">{progressPercent}%</span>
              </div>
              <div className="text-start">
                <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  {language === 'ar' ? 'نسبة اكتمال الوثائق' : 'Compliance Level'}
                </div>
                <div className="text-sm font-extrabold mt-0.5 text-zinc-100">
                  {language === 'ar' ? `${totalVerified} من أصل ${docs.length} مستندات جاهزة` : `${totalVerified} of ${docs.length} assets audited`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OPERATIONS GRID AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* USER PROFILE INFO ASIDE BAR */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-zinc-200 p-6 space-y-6 text-start shadow-sm">
            <div>
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-500" />
                <span>{language === 'ar' ? 'تفاصيل الاتصال الأساسية' : 'Core Identification Node'}</span>
              </h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{language === 'ar' ? 'البريد الإلكتروني' : 'Mail Agent'}</p>
                    <p className="font-bold text-zinc-800 break-all select-all">{user.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{language === 'ar' ? 'رقم الهاتف' : 'Contact Phone'}</p>
                    <p className="font-bold text-zinc-800 select-all">{user.phoneNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{language === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}</p>
                    <p className="font-bold text-zinc-800">{user.birthDate ? user.birthDate.substring(0, 10) : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{language === 'ar' ? 'العنوان والبلد' : 'Branch Address'}</p>
                    <p className="font-bold text-zinc-850 text-xs lines-clamp-2">{user.address || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE COORDINATES DESK MAP PREVIEW */}
            <div className="pt-4 border-t border-zinc-150">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-3 block">
                {language === 'ar' ? 'نظام تحديد المواقع GPS والمسار' : 'Fleet Telemetry Coordinate'}
              </h4>
              
              {((user as any).latitude || (user as any).longitude) ? (
                <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between text-xs">
                    <div>
                      <span className="text-zinc-400 block text-[9px] uppercase font-bold">Latitude</span>
                      <strong className="font-mono text-zinc-800">{Number((user as any).latitude).toFixed(6)}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[9px] uppercase font-bold">Longitude</span>
                      <strong className="font-mono text-zinc-800">{Number((user as any).longitude).toFixed(6)}</strong>
                    </div>
                  </div>
                  
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${(user as any).latitude},${(user as any).longitude}`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-750 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إظهار على خرائط جوجل الرسمية' : 'Open in Google Maps'}</span>
                  </a>
                </div>
              ) : (
                <div className="text-center py-6 px-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                  <MapPin className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-zinc-500">
                    {language === 'ar' ? 'لم يتم تحديد إحداثيات موقع دقيقة للناقل بعد.' : 'No GPS telemetry mapped on this user profile node.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MAIN CHANNELS CATALOG CARD */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TABS SELECTOR */}
            <div className="flex flex-wrap bg-white border border-zinc-200 p-1.5 rounded-2xl gap-1">
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex-1 min-w-[110px] py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${activeTab === 'documents' ? 'bg-black text-white shadow-sm' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}
              >
                {language === 'ar' ? 'ملفات الهوية والتعليم' : 'Identity & Training Files'}
              </button>
              <button
                onClick={() => setActiveTab('vehicle')}
                className={`flex-1 min-w-[110px] py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${activeTab === 'vehicle' ? 'bg-black text-white shadow-sm' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}
              >
                {language === 'ar' ? 'رخص المركبة والتأمين' : 'Fleet Registration Docs'}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 min-w-[110px] py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-black text-white shadow-sm' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}
              >
                {language === 'ar' ? 'الطلبات والمهام' : 'Orders & Tasks'}
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex-1 min-w-[110px] py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${activeTab === 'schedule' ? 'bg-black text-white shadow-sm' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}
              >
                {language === 'ar' ? 'جدول أيام العمل' : 'Days of Work'}
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex-1 min-w-[110px] py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${activeTab === 'logs' ? 'bg-black text-white shadow-sm' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}
              >
                {language === 'ar' ? 'سجل العمليات' : 'Audit Action Logs'}
              </button>
            </div>

            {/* DOCUMENTS TAB PANEL */}
            {(activeTab === 'documents' || activeTab === 'vehicle') && (
              <div className="space-y-4 text-start">
                {docs
                  .filter(doc => {
                    if (activeTab === 'documents') {
                      return ['national_id', 'driving_license', 'good_conduct'].includes(doc.id);
                    } else {
                      return ['vehicle_registration', 'vehicle_insurance'].includes(doc.id);
                    }
                  })
                  .map((doc, idx) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.08 }}
                      className="bg-white rounded-3xl border border-zinc-200 p-5 md:p-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                    >
                      {/* CARD FLAG ICON & CONTENT DESCRIPTION */}
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-zinc-50 border border-zinc-150 rounded-2xl flex items-center justify-center text-zinc-500 shrink-0">
                          {doc.status === 'verified' && <FileCheck className="w-6 h-6 text-emerald-600" />}
                          {doc.status === 'pending' && <Clock className="w-6 h-6 text-amber-500 animate-pulse" />}
                          {doc.status === 'rejected' && <AlertCircle className="w-6 h-6 text-rose-500" />}
                          {doc.status === 'missing' && <FileText className="w-6 h-6 text-zinc-400" />}
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold font-sans text-zinc-900">
                            {language === 'ar' ? doc.nameAr : doc.nameEn}
                          </h4>
                          <p className="text-zinc-400 text-xs font-mono font-bold flex items-center gap-1.5">
                            <span>{doc.type}</span>
                            <span>•</span>
                            {doc.fileSize && (
                              <>
                                <span>{doc.fileSize}</span>
                                <span>•</span>
                              </>
                            )}
                            <span className="uppercase tracking-wide font-extrabold">
                              {doc.id}
                            </span>
                          </p>
                          {(language === 'ar' ? doc.commentsAr : doc.commentsEn) && (
                            <p className="text-xs text-zinc-500 mt-2 p-3 bg-zinc-50/70 border border-zinc-100 rounded-2xl italic font-serif">
                              {language === 'ar' ? doc.commentsAr : doc.commentsEn}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS ELEMENT GRID / COMPLIANCE STATUS */}
                      <div className="flex flex-wrap md:flex-col items-start md:items-end justify-between md:justify-center gap-2shrink-0 min-w-[150px]">
                        {/* CURRENT STATUS */}
                        <div className="mb-2">
                          {doc.status === 'verified' && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 text-[10px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-3xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'مقبول ومعتمد' : 'Audited & Approved'}</span>
                            </span>
                          )}

                          {doc.status === 'pending' && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-150 text-[10px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-3xs">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'قيد التدقيق والتحقق' : 'Under Review'}</span>
                            </span>
                          )}

                          {doc.status === 'rejected' && (
                            <span className="bg-rose-50 text-rose-700 border border-rose-150 text-[10px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-3xs">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'بحاجة لتحديث' : 'Rejected / Action Required'}</span>
                            </span>
                          )}

                          {doc.status === 'missing' && (
                            <span className="bg-zinc-100 text-zinc-500 border border-zinc-205 text-[10px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'لم يرفع بعد' : 'Not Uploaded'}</span>
                            </span>
                          )}
                        </div>

                        {/* INTERACTIVE ACTIONS ROW */}
                        <div className="flex gap-2 w-full md:w-auto">
                          {doc.status !== 'missing' && (
                            <button
                              onClick={() => setSelectedDoc(doc)}
                              className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                              title={language === 'ar' ? 'معاينة المستند' : 'Preview doc'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'معاينة' : 'Preview'}</span>
                            </button>
                          )}

                          {/* ACTION BUTTON TRIGGER OR SIMULATION */}
                          {isUploading === doc.id ? (
                            <div className="px-3 py-2 flex items-center gap-1.5 text-zinc-400 font-bold text-xs">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                              <span>{language === 'ar' ? 'جاري الرفع...' : 'Processing...'}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSimulateUpload(doc.id)}
                              className="px-3 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{language === 'ar' ? 'رفع جديد' : 'Upload'}</span>
                            </button>
                          )}
                        </div>

                        {/* ADMIN ONLY DECISION TREE */}
                        {userRole === 'admin' && doc.status === 'pending' && (
                          <div className="pt-2 border-t border-zinc-100 mt-2 flex gap-1 justify-end w-full">
                            <button
                              onClick={() => handleVerifyToggle(doc.id, 'verify')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-extrabold transition-all"
                            >
                              {language === 'ar' ? 'قبول' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleVerifyToggle(doc.id, 'reject')}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-extrabold transition-all"
                            >
                              {language === 'ar' ? 'رفض' : 'Reject'}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}

            {/* ORDERS TAB PANEL */}
            {activeTab === 'orders' && (
              <div className="space-y-6 text-start">
                {/* Stats row inside panel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">{language === 'ar' ? 'إجمالي طلبات الناقل' : 'Total Orders'}</span>
                      <strong className="text-2xl font-black font-sans text-zinc-900 mt-1 block">{orders.length}</strong>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-indigo-650" />
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">{language === 'ar' ? 'الطلبات المكتملة' : 'Completed Deliveries'}</span>
                      <strong className="text-2xl font-black font-sans text-emerald-600 mt-1 block">
                        {orders.filter(o => (o.orderState || '').toLowerCase() === 'delivered' || (o.orderState || '').toLowerCase() === 'completed').length}
                      </strong>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">{language === 'ar' ? 'قيد التنفيذ' : 'Active Tasks'}</span>
                      <strong className="text-2xl font-black font-sans text-amber-600 mt-1 block">
                        {orders.filter(o => (o.orderState || '').toLowerCase() !== 'delivered' && (o.orderState || '').toLowerCase() !== 'completed').length}
                      </strong>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-55" />
                    </div>
                  </div>
                </div>

                {isLoadingOrders ? (
                  <div className="py-12 text-center bg-white border border-zinc-150 rounded-3xl">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm font-bold">{language === 'ar' ? 'جاري جلب الطلبات والمهام والتحقق منها...' : 'Synchronizing assignments ledger...'}</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center shadow-xs">
                    <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-zinc-900 mb-2">
                      {language === 'ar' ? 'لا توجد طلبات جارية لهذا المسار' : 'No Order Assignments Map'}
                    </h4>
                    <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                      {language === 'ar' 
                        ? 'لم يتم إسناد أي شحنات أو رحلات لوجستية لهذا الناقل حتى الآن.' 
                        : 'There are currently no logistical cargo blocks or deliveries assigned to this driver node.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, idx) => {
                      const stateVal = (order.orderState || 'preparing').toLowerCase();
                      const stateColors: Record<string, string> = {
                        'preparing': 'bg-zinc-100 text-zinc-700 border-zinc-200',
                        'on-the-way': 'bg-amber-50 text-amber-700 border-amber-200',
                        'delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      };
                      const resolvedColor = stateColors[stateVal] || 'bg-indigo-50 text-indigo-700 border-indigo-200';

                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.05 }}
                          className="bg-white rounded-3xl border border-zinc-200 p-5 md:p-6 shadow-xs relative overflow-hidden"
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-zinc-400">#{order.id}</span>
                                <h5 className="font-extrabold text-sm text-zinc-900">{order.description || (language === 'ar' ? 'طلب توصيل' : 'Delivery Assignment')}</h5>
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                                {order.createdAt ? new Date(order.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US') : 'N/A'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${resolvedColor} uppercase tracking-wider`}>
                                {language === 'ar' ? (order.orderState === 'preparing' ? 'جاري التجهيز' : order.orderState === 'on-the-way' ? 'في الطريق' : order.orderState === 'delivered' ? 'تم التوصيل' : order.orderState) : order.orderState}
                              </span>

                              <div className="text-end shrink-0">
                                <span className="text-[9px] text-zinc-400 font-bold block uppercase">{language === 'ar' ? 'تكلفة التوصيل' : 'Fee'}</span>
                                <strong className="text-sm font-black font-mono text-indigo-650">{order.deliveryPrice} {language === 'ar' ? 'ر.س' : 'SAR'}</strong>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
                            <div className="space-y-1">
                              <span className="text-zinc-400 font-bold uppercase text-[9px] block">{language === 'ar' ? 'موقع التسليم والعميل' : 'Dropoff Registry'}</span>
                              <p className="text-zinc-800 font-bold">{order.deliveryLocationDescription || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-zinc-400 font-bold uppercase text-[9px] block">{language === 'ar' ? 'تعليمات الاستلام' : 'Reception Note'}</span>
                              <p className="text-zinc-800 font-bold">{order.receptionDescription || 'N/A'}</p>
                            </div>
                          </div>

                          {/* Quick Admin Actions */}
                          {userRole === 'admin' && (
                            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase">{language === 'ar' ? 'تعديل حالة الشحنة آلياً (المشرف)' : 'Overseer Switch Control'}</span>
                              <div className="flex gap-1">
                                {['preparing', 'on-the-way', 'delivered'].map(st => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await updateOrderState(order.id, st);
                                        showToast(language === 'ar' ? 'تم تحديث حالة الشحنة بنجاح' : 'Order state successfully updated', 'success');
                                        loadOrders();
                                      } catch (err) {
                                        showToast(language === 'ar' ? 'حدث خطأ أثناء تعديل الشحنة' : 'Could not change state', 'error');
                                      }
                                    }}
                                    className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${
                                      stateVal === st
                                        ? 'bg-zinc-900 text-white shadow-xs'
                                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-650'
                                    }`}
                                  >
                                    {language === 'ar' ? (st === 'preparing' ? 'تجهيز' : st === 'on-the-way' ? 'بالطريق' : 'تم التوصيل') : st}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SCHEDULE TAB PANEL */}
            {activeTab === 'schedule' && (
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 text-start shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-150">
                  <div>
                    <h4 className="text-sm font-extrabold text-zinc-900">
                      {language === 'ar' ? 'جدول أيام العمل الأسبوعية المعتمدة' : 'Weekly Operations Schedule'}
                    </h4>
                    <p className="text-zinc-500 text-xs mt-1">
                      {language === 'ar' ? 'أيام وفترات تقديم الخدمة النشطة لتنسيق الرحلات التلقائي.' : 'Assigned work days and timeline slots for intelligent dispatch.'}
                    </p>
                  </div>
                  <span className="shrink-0 bg-indigo-50 border border-indigo-100 text-indigo-750 text-[10px] font-extrabold px-3 py-1 rounded-xl uppercase tracking-wider font-mono">
                    {workingDays.length} {language === 'ar' ? 'فترات محددة' : 'time slots'}
                  </span>
                </div>

                {/* Schedule list */}
                {isLoadingSchedule ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mx-auto mb-3" />
                    <p className="text-zinc-500 text-xs font-bold">{language === 'ar' ? 'جاري جلب فترات العمل المسجلة...' : 'Syncing schedule ledger...'}</p>
                  </div>
                ) : workingDays.length === 0 ? (
                  <div className="py-8 text-center bg-zinc-50 border border-zinc-150 rounded-2xl w-full">
                    <Calendar className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-500">{language === 'ar' ? 'لا يوجد جدول عمل محدد بعد للناقل' : 'No schedules mapped yet'}</p>
                    <p className="text-[10px] text-zinc-400 mt-1 max-w-sm mx-auto">
                      {language === 'ar' ? 'الرجاء إضافة فترات عمل أدناه ليتمكن النظام من إسناد الطلبات بنجاح.' : 'Add operational days of work down below to coordinate deliveries.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workingDays.map((wd) => {
                      const daysMapAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                      const daysMapEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      const dayName = language === 'ar' ? daysMapAr[wd.day] : daysMapEn[wd.day];

                      // format timeline from ISO or regular time string
                      const fmtTime = (timeStr: string) => {
                        if (!timeStr) return '';
                        const parts = timeStr.split(':');
                        if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
                        return timeStr;
                      };

                      return (
                        <div
                          key={wd.id}
                          className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all shadow-3xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-center text-indigo-750 shrink-0">
                              <Clock className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <strong className="text-sm font-extrabold text-zinc-800 block">{dayName}</strong>
                              <span className="text-zinc-500 text-xs font-mono mt-0.5 block">{fmtTime(wd.fromTime)} - {fmtTime(wd.toTime)}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              if (!wd.id) return;
                              if (!confirm(language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف يوم العمل هذا؟' : 'Are you sure you want to remove this day?')) return;
                              try {
                                await deleteWorkingDay(wd.id);
                                setWorkingDays(prev => prev.filter(w => w.id !== wd.id));
                                showToast(language === 'ar' ? 'تم حذف يوم العمل بنجاح' : 'Success', 'success');
                              } catch (err) {
                                showToast(language === 'ar' ? 'فشل حذف يوم العمل' : 'Error', 'error');
                              }
                            }}
                            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title={language === 'ar' ? 'حذف الفترة' : 'Delete slot'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add working hours form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!targetId) return;
                    setIsAddingSchedule(true);
                    try {
                      await createWorkingDay({
                        userId: targetId,
                        day: Number(newDay),
                        fromTime: newFromTime,
                        toTime: newToTime
                      });
                      showToast(language === 'ar' ? 'تم إضافة يوم العمل بنجاح' : 'Working day setup finished', 'success');
                      loadSchedule();
                    } catch (err) {
                      showToast(language === 'ar' ? 'فشل إضافة فترة العمل' : 'Could not add working day', 'error');
                    } finally {
                      setIsAddingSchedule(false);
                    }
                  }}
                  className="p-5 bg-zinc-50 border border-zinc-200 rounded-3xl space-y-4"
                >
                  <h5 className="text-xs font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-indigo-600" />
                    <span>{language === 'ar' ? 'تخصيص فترة وأيام عمل جديدة' : 'Add New Operational Hours'}</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5">{language === 'ar' ? 'يوم الخدمة' : 'Target Weekday'}</label>
                      <select
                        value={newDay}
                        onChange={(e) => setNewDay(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-bold bg-white border border-zinc-205 rounded-xl text-zinc-805"
                      >
                        <option value={0}>{language === 'ar' ? 'الأحد' : 'Sunday'}</option>
                        <option value={1}>{language === 'ar' ? 'الاثنين' : 'Monday'}</option>
                        <option value={2}>{language === 'ar' ? 'الثلاثاء' : 'Tuesday'}</option>
                        <option value={3}>{language === 'ar' ? 'الأربعاء' : 'Wednesday'}</option>
                        <option value={4}>{language === 'ar' ? 'الخميس' : 'Thursday'}</option>
                        <option value={5}>{language === 'ar' ? 'الجمعة' : 'Friday'}</option>
                        <option value={6}>{language === 'ar' ? 'السبت' : 'Saturday'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5">{language === 'ar' ? 'من الساعة' : 'From Time'}</label>
                      <input
                        type="time"
                        value={newFromTime}
                        onChange={(e) => setNewFromTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold font-mono bg-white border border-zinc-200 rounded-xl text-zinc-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5">{language === 'ar' ? 'إلى الساعة' : 'To Time'}</label>
                      <input
                        type="time"
                        value={newToTime}
                        onChange={(e) => setNewToTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold font-mono bg-white border border-zinc-200 rounded-xl text-zinc-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isAddingSchedule}
                      className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-extrabold rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
                    >
                      {isAddingSchedule ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{language === 'ar' ? 'جاري الحفظ والجدولة...' : 'Scheduling...'}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'إضافة إلى جدول العمل' : 'Add Time slot'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* AUDIT LOGS TAB PANEL */}
            {activeTab === 'logs' && (
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 text-start shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-150">
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">
                    {language === 'ar' ? 'سلسلة تدقيق حركة ورفع الوثائق المعتمدة' : 'Compliance Ledger Trail'}
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                    Blockchain Log Active
                  </span>
                </div>

                <div className="relative border-l-2 border-zinc-150 pl-6 ml-3 space-y-6 pt-2">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow-xs" />
                    <p className="text-xs text-zinc-400 font-mono">2026-06-11 11:00</p>
                    <p className="text-xs font-extrabold text-zinc-800 mt-0.5">
                      {language === 'ar' ? 'مطبّق: تم قبول وتدقيق رخصة المركبة رقم REG-878-9580 من قبل الإدارة' : 'Node update: Vehicle Registration #REG-878-9580 accepted by administrator.'}
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-4 h-4 bg-amber-500 rounded-full border-4 border-white shadow-xs animate-pulse" />
                    <p className="text-xs text-zinc-400 font-mono">2026-06-11 11:22</p>
                    <p className="text-xs font-extrabold text-zinc-800 mt-0.5">
                      {language === 'ar' ? 'رفع مستند: تم تسليم رخصة القيادة بنجاح والملف تحت الفحص' : 'Submission: Public License file parsed successfully. Status: Pending Validation.'}
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow-xs" />
                    <p className="text-xs text-zinc-400 font-mono">2026-06-11 09:15</p>
                    <p className="text-xs font-extrabold text-zinc-800 mt-0.5">
                      {language === 'ar' ? 'تدقيق آلي: تم بنجاح التحقق والمصادقة على الهوية الوطنية/الإقامة' : 'Verification: Unified National API approved Identity / Iqama status.'}
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-4 h-4 bg-rose-500 rounded-full border-4 border-white shadow-xs" />
                    <p className="text-xs text-zinc-400 font-mono">2026-06-08 16:45</p>
                    <p className="text-xs font-extrabold text-zinc-800 mt-0.5">
                      {language === 'ar' ? 'فشل التحقق: تم رفض وثيقة التأمين لوجود تاريخ منتهي الصلاحية' : 'Validation Error: Insurance certificate invalid due to temporal scope expiration.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DOCUMENT DETAILED PREVIEW MODAL */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-lg w-full overflow-hidden text-start"
            >
              <div className="p-6 border-b border-zinc-150 flex items-center justify-between bg-zinc-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-extrabold font-sans text-zinc-900">
                    {language === 'ar' ? 'تفاصيل ومعاينة المستند' : 'Audit Document Spec'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="p-1 text-zinc-400 hover:text-black hover:bg-zinc-155 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-zinc-950 text-white rounded-2xl p-5 flex flex-col items-center justify-center border border-white/5 relative min-h-[160px] overflow-hidden select-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-transparent to-white/5 pointer-events-none" />
                  <FileText className="w-12 h-12 text-indigo-400 mb-2 animate-bounce" />
                  <span className="text-sm font-extrabold font-mono tracking-wide">{selectedDoc.id.toUpperCase()}_AUDIT.pdf</span>
                  <span className="text-[10px] text-zinc-400 mt-1 font-mono">256-bit GCM Encrypted Node</span>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => showToast(language === 'ar' ? 'بدأ تنزيل المستند المشفر لسطح المكتب.' : 'Secure download started.', 'success')}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تنزيل آمن' : 'Secure Download'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="p-3 bg-zinc-50 rounded-xl">
                    <span className="text-zinc-400 block font-bold mb-0.5 uppercase">{language === 'ar' ? 'الاسم المصنف' : 'Classification'}</span>
                    <strong className="text-zinc-800">{language === 'ar' ? selectedDoc.nameAr : selectedDoc.nameEn}</strong>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl">
                    <span className="text-zinc-400 block font-bold mb-0.5 uppercase">{language === 'ar' ? 'حالة التدقيق' : 'Verification Status'}</span>
                    <strong className="text-zinc-800">{selectedDoc.status.toUpperCase()}</strong>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl">
                    <span className="text-zinc-400 block font-bold mb-0.5 uppercase">{language === 'ar' ? 'تاريخ الرفع' : 'Uploaded At'}</span>
                    <strong className="text-zinc-800 font-mono">{selectedDoc.uploadedAt || 'N/A'}</strong>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl">
                    <span className="text-zinc-400 block font-bold mb-0.5 uppercase">{language === 'ar' ? 'تاريخ التدقيق' : 'Audited At'}</span>
                    <strong className="text-zinc-800 font-mono">{selectedDoc.verifiedAt || 'N/A'}</strong>
                  </div>
                </div>

                {selectedDoc.commentsAr && (
                  <div className="bg-amber-50/50 border border-amber-200/55 p-4 rounded-xl">
                    <span className="text-[10px] text-amber-700 font-extrabold block mb-1 uppercase tracking-wider">
                      {language === 'ar' ? 'ملاحظات الإدارة والتحقق' : 'Auditor Ledger Commentary'}
                    </span>
                    <p className="text-xs text-amber-900 border-l-2 border-amber-300 pl-3 italic font-serif leading-relaxed">
                      {language === 'ar' ? selectedDoc.commentsAr : selectedDoc.commentsEn}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-zinc-50 border-t border-zinc-150 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {language === 'ar' ? 'إغلاق المعاينة' : 'Dismiss'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
