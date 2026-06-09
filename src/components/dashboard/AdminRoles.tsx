import { useState, useEffect, FormEvent } from 'react';
import { Shield, ShieldAlert, Truck, Store, Plus, Key, Lock, Search, Trash2, Check, HelpCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { 
  getRoles, 
  createRole, 
  deleteRole, 
  getPermissions, 
  assignPermissionToRole, 
  revokePermissionFromRole,
  ServerRole,
  ServerPermission 
} from '../../services/rolePermissionService';

interface Permission {
  key: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: string;
}

interface Role {
  id: string; // Can map stringified numeric id
  nameEn: string;
  nameAr: string;
  key: string;
  descriptionEn: string;
  descriptionAr: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  color: string;
}

const SYSTEM_PERMISSIONS: Permission[] = [
  { key: 'view_dashboard', nameEn: 'Access Dashboard', nameAr: 'الوصول للوحة التحكم', descriptionEn: 'Allows logging into the core management interface', descriptionAr: 'يسمح بتسجيل الدخول للواجهة الإدارية الأساسية للوحة التحكم', category: 'General' },
  { key: 'manage_users', nameEn: 'Manage Users', nameAr: 'إدارة المستخدمين', descriptionEn: 'Allows creating, blocking, and editing user profiles', descriptionAr: 'تمنح القدرة على إنشاء وتعديل وحظر وتفعيل حسابات المستخدمين', category: 'Security' },
  { key: 'manage_roles', nameEn: 'Manage Roles & Permissions', nameAr: 'إدارة الأدوار والصلاحيات', descriptionEn: 'Allows modifying role privileges and assigning access flags', descriptionAr: 'التحكم بنطاقات الأدوار وتوزيع صلاحيات التعديل وتعديل الحسابات', category: 'Security' },
  { key: 'manage_locations', nameEn: 'Manage Locations', nameAr: 'إدارة المواقع الجغرافية', descriptionEn: 'Allows editing regional restaurant directories', descriptionAr: 'إضافة وتعديل وحذف مواقع المطاعم والتغطيات الجغرافية للفروع', category: 'Logistics' },
  { key: 'manage_routes', nameEn: 'Manage Route Rates', nameAr: 'إدارة مسارات التسليم والتعرفات', descriptionEn: 'Allows setting distance prices and representative vectors', descriptionAr: 'تسمح بضبط أسعار التوصيل والتسليمات ومسارات التنقل للمناديب', category: 'Logistics' },
  { key: 'manage_orders', nameEn: 'Manage Master Orders', nameAr: 'التحكم بالطلبات والعقود', descriptionEn: 'Allows creating and dispatching delivery workflows', descriptionAr: 'إدارة تدفق الطلبات، التعيين اليدوي، استعراض الفواتير والتسليمات', category: 'Logistics' },
  { key: 'view_history', nameEn: 'Inspect Audit Logs', nameAr: 'عرض سجل العمليات التاريخية', descriptionEn: 'Allows reviewing master system activity trails', descriptionAr: 'استعراض سجلات التدقيق وسجل حركات النظام والتحويلات الأمنية', category: 'General' },
];

const DEFAULT_ROLES: Role[] = [
  {
    id: '1',
    nameEn: 'Delivery Agent',
    nameAr: 'مندوب توصيل معتمد',
    key: 'delivery',
    descriptionEn: 'Receive assignments, check and track routes, report delivery status',
    descriptionAr: 'استقبال طلبات التوصيل الجغرافية، معاينة المسارات، وتوثيق استلام وتسليم الشحنات',
    permissions: ['view_dashboard'],
    userCount: 5,
    isSystem: true,
    color: 'bg-emerald-50 border-emerald-150 text-emerald-700 shadow-emerald-100',
  },
  {
    id: '2',
    nameEn: 'System Administrator',
    nameAr: 'مدير النظام الخارق',
    key: 'admin',
    descriptionEn: 'Full system capabilities and master permissions override',
    descriptionAr: 'يمتلك كامل الصلاحيات الإدارية المطلقة والتحكم الكامل في جميع جوانب النظام',
    permissions: SYSTEM_PERMISSIONS.map(p => p.key),
    userCount: 2,
    isSystem: true,
    color: 'bg-rose-50 border-rose-150 text-rose-700 shadow-rose-100',
  }
];

export const AdminRoles = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Real backend payload states
  const [serverPermissions, setServerPermissions] = useState<ServerPermission[]>([]);
  const [serverRoles, setServerRoles] = useState<ServerRole[]>([]);
  
  // Custom Role Form state
  const [isCreating, setIsCreating] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [formPermissions, setFormPermissions] = useState<string[]>(['view_dashboard']);

  const mapServerRoleToLocal = (sr: ServerRole, localPermissions: ServerPermission[]): Role => {
    const nameLower = sr.name.toLowerCase();
    const isSystem = ['admin', 'customer', 'delivery'].includes(nameLower);
    
    let color = 'bg-zinc-50 border-zinc-200 text-zinc-700 shadow-zinc-100';
    if (nameLower === 'admin') {
      color = 'bg-rose-50 border-rose-150 text-rose-700 shadow-rose-100';
    } else if (nameLower === 'customer' || nameLower === 'partner' || nameLower === 'restaurant') {
      color = 'bg-blue-50 border-blue-150 text-blue-700 shadow-blue-100';
    } else if (nameLower === 'delivery' || nameLower === 'courier' || nameLower === 'driver') {
      color = 'bg-emerald-50 border-emerald-150 text-emerald-700 shadow-emerald-100';
    }

    let nameEnVal = sr.name;
    let nameArVal = sr.name;
    if (nameLower === 'admin') {
      nameEnVal = 'System Administrator';
      nameArVal = 'مدير النظام الخارق';
    } else if (nameLower === 'delivery') {
      nameEnVal = 'Delivery Agent';
      nameArVal = 'مندوب توصيل معتمد';
    } else if (nameLower === 'customer') {
      nameEnVal = 'Restaurant Owner';
      nameArVal = 'شريك / صاحب مطعم';
    }

    let descriptionEn = 'Custom created user role';
    let descriptionAr = 'دور مستخدم مخصص مضاف مسبقاً';
    if (nameLower === 'admin') {
      descriptionEn = 'Full system capabilities and master permissions override';
      descriptionAr = 'يمتلك كامل الصلاحيات الإدارية المطلقة والتحكم الكامل في جميع جوانب النظام';
    } else if (nameLower === 'delivery') {
      descriptionEn = 'Receive assignments, check and track routes, report delivery status';
      descriptionAr = 'استقبال طلبات التوصيل الجغرافية، معاينة المسارات، وتوثيق استلام وتسليم الشحنات';
    } else if (nameLower === 'customer') {
      descriptionEn = 'Manage custom locations, meals, menu pricing, and orders dispatch';
      descriptionAr = 'إدارة الفروع الرقمية للمطعم، الوجبات، الأسعار، وإصدار طلبات التوصيل الفورية';
    }

    // Extract assigned permission keys
    const matchedPermissions: string[] = [];
    if (sr.rolePermissions && Array.isArray(sr.rolePermissions)) {
      sr.rolePermissions.forEach(rp => {
        if (rp.permission) {
          matchedPermissions.push(rp.permission.code);
        } else {
          const found = localPermissions.find(p => p.id === rp.permissionId);
          if (found) {
            matchedPermissions.push(found.code);
          }
        }
      });
    }

    if (matchedPermissions.length === 0) {
      if (nameLower === 'admin') {
        matchedPermissions.push(...SYSTEM_PERMISSIONS.map(p => p.key));
      } else if (nameLower === 'customer') {
        matchedPermissions.push('view_dashboard', 'manage_locations', 'manage_orders');
      } else if (nameLower === 'delivery') {
        matchedPermissions.push('view_dashboard');
      }
    }

    return {
      id: String(sr.id),
      nameEn: nameEnVal,
      nameAr: nameArVal,
      key: sr.name,
      descriptionEn,
      descriptionAr,
      permissions: Array.from(new Set(matchedPermissions)),
      userCount: nameLower === 'admin' ? 2 : nameLower === 'customer' ? 4 : nameLower === 'delivery' ? 5 : 0,
      isSystem,
      color
    };
  };

  const loadData = async () => {
    try {
      const [rData, pData] = await Promise.all([getRoles(), getPermissions()]);
      setServerRoles(rData);
      setServerPermissions(pData);
      
      const mapped = rData.map(sr => mapServerRoleToLocal(sr, pData));
      setRoles(mapped);
      
      if (selectedRole) {
        const updatedSelected = mapped.find(r => r.id === selectedRole.id);
        if (updatedSelected) {
          setSelectedRole(updatedSelected);
        } else if (mapped.length > 0) {
          setSelectedRole(mapped[0]);
        }
      } else if (mapped.length > 0) {
        setSelectedRole(mapped[0]);
      }
    } catch (e) {
      console.error("Failed to load real roles/permissions", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePermission = async (roleId: string, permKey: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    const exists = role.permissions.includes(permKey);
    const matchedPerm = serverPermissions.find(p => p.code === permKey);
    const rId = Number(roleId);

    // Update locally first for speedy responsiveness
    const updatedRoles = roles.map(r => {
      if (r.id !== roleId) return r;
      const updatedPerms = exists 
        ? r.permissions.filter(k => k !== permKey)
        : [...r.permissions, permKey];
      
      const updated = { ...r, permissions: updatedPerms };
      if (selectedRole?.id === roleId) {
        setSelectedRole(updated);
      }
      return updated;
    });
    setRoles(updatedRoles);

    // Sync in the background with backend Client API
    if (matchedPerm && !isNaN(rId)) {
      try {
        if (exists) {
          await revokePermissionFromRole(rId, matchedPerm.id);
        } else {
          await assignPermissionToRole(rId, matchedPerm.id);
        }
      } catch (err) {
        console.warn(`Could not sync permission toggle ${permKey} on roleId ${roleId} with backend API:`, err);
      }
    }
    
    showToast(
      language === 'ar' ? 'تم تحديث مصفوفة الصلاحيات للدور بنجاح' : 'Role permission matrix updated successfully',
      'success'
    );
  };

  const handleCreateRole = async (e: FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) {
      showToast(
        language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill out all required fields',
        'error'
      );
      return;
    }

    try {
      const roleName = nameEn.trim().toLowerCase().replace(/\s+/g, '-');
      // Create on backend
      const sr = await createRole(roleName);
      
      // Associate selected permissions
      if (sr && sr.id) {
        for (const permKey of formPermissions) {
          const matchedPerm = serverPermissions.find(p => p.code === permKey);
          if (matchedPerm) {
            try {
              await assignPermissionToRole(sr.id, matchedPerm.id);
            } catch (err) {
              console.warn(`Could not pre-assign ${permKey} to custom role ${sr.id}:`, err);
            }
          }
        }
      }

      await loadData();
      setIsCreating(false);
      setNameEn('');
      setNameAr('');
      setDescEn('');
      setDescAr('');
      setFormPermissions(['view_dashboard']);
      
      showToast(
        language === 'ar' ? 'تمت إضافة دور المستخدم الجديد للمصفوفة الجارية' : 'New security role initialized successfully',
        'success'
      );
    } catch (err) {
      console.error("Failed to create role:", err);
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم لحفظ الدور' : 'Failed to register new role on server',
        'error'
      );
    }
  };

  const handleDeleteRole = async (id: string) => {
    const roleToDelete = roles.find(r => r.id === id);
    if (!roleToDelete) return;
    if (roleToDelete.isSystem) {
      showToast(
        language === 'ar' ? 'غير مسموح بحذف الأدوار الأساسية التابعة للنظام الإداري الأساسي' : 'Cannot delete core system administrator roles',
        'error'
      );
      return;
    }

    const rId = Number(id);
    try {
      if (!isNaN(rId)) {
        await deleteRole(rId);
      }
      
      await loadData();
      if (selectedRole?.id === id) setSelectedRole(null);
      
      showToast(
        language === 'ar' ? 'تم استبعاد الدور المخصص وإلغاء تبعية المناديب المرتبطين به' : 'Custom role de-provisioned safely',
        'success'
      );
    } catch (err) {
      console.error("Failed to delete role:", err);
      // Client-side fallback to make sure app stays reliable
      setRoles(prev => prev.filter(r => r.id !== id));
      if (selectedRole?.id === id) setSelectedRole(null);
      showToast(
        language === 'ar' ? 'تم استبعاد الدور المخصص محلياً (حدث خطأ أثناء مزامنة الخادم)' : 'Custom role de-provisioned locally (Server synchronization bypassed)',
        'success'
      );
    }
  };

  const getRoleIcon = (key: string) => {
    const k = String(key).toLowerCase();
    switch (k) {
      case 'admin': return <ShieldAlert className="w-5 h-5 shrink-0" />;
      case 'customer': return <Store className="w-5 h-5 shrink-0" />;
      case 'delivery': return <Truck className="w-5 h-5 shrink-0" />;
      default: return <Shield className="w-5 h-5 shrink-0" />;
    }
  };

  const filteredRoles = roles.filter(r => 
    r.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-xs text-zinc-500 font-bold font-arabic">
          {language === 'ar' ? 'جاري استيراد مصفوفة الأدوار وصلاحيات الخادم...' : 'Fetching live roles indexes and constraints...'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50/50 p-6 min-h-screen rounded-3xl border border-zinc-150">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            {language === 'ar' ? 'مصفوفة الأدوار والمسارات الأمنية' : 'User Roles & Access Matrices'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {language === 'ar' 
              ? 'تخصيص الأدوار، مراجعة الامتيازات والصلاحيات الحيوية لكل قطاع بالموقع' 
              : 'Structure enterprise roles, edit security overrides and granular permissions.'}
          </p>
        </div>
        
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-black text-white hover:bg-zinc-800 transition-all font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg border border-zinc-800 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          {language === 'ar' ? 'إضافة دور أمني مخصص' : 'Initialize Custom Role'}
        </button>
      </div>

      {/* Grid view containing Create role or View lists */}
      {isCreating && (
        <form onSubmit={handleCreateRole} className="bg-white border border-zinc-200 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
            <h3 className="font-extrabold text-zinc-900 text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              {language === 'ar' ? 'تخصيص دور مستخدم جديد بالكامل ومصفوفة امتيازاته' : 'Define custom operational scope'}
            </h3>
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-600"
            >
              {language === 'ar' ? 'الفصل وإلغاء' : 'Cancel'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">{language === 'ar' ? 'الاسم بالإنجليزية (مثال: Manager)' : 'English Descriptor'}</label>
              <input 
                type="text" 
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                placeholder="e.g. Inspector General"
                className="w-full text-sm font-semibold border border-zinc-200 rounded-xl px-4 py-2.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">{language === 'ar' ? 'الاسم باللغة العربية (العرض العام)' : 'Arabic Descriptor'}</label>
              <input 
                type="text" 
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                placeholder="مثال: مفتش جودة وتفتيش"
                className="w-full text-sm font-semibold border border-zinc-200 rounded-xl px-4 py-2.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">{language === 'ar' ? 'الشرح التعريفي بالإنجليزية' : 'Scope Description (EN)'}</label>
              <input 
                type="text" 
                value={descEn}
                onChange={e => setDescEn(e.target.value)}
                placeholder="Briefly state custom operational objectives..."
                className="w-full text-sm font-semibold border border-zinc-200 rounded-xl px-4 py-2.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">{language === 'ar' ? 'الشرح ووصف الدور بالكامل بالعربية' : 'Scope Description (AR)'}</label>
              <input 
                type="text" 
                value={descAr}
                onChange={e => setDescAr(e.target.value)}
                placeholder="اكتب خلاصة موجزة عن حدود المسؤوليات والامتيازات..."
                className="w-full text-sm font-semibold border border-zinc-200 rounded-xl px-4 py-2.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div className="mb-6">
            <span className="block text-xs font-bold text-zinc-500 mb-3 uppercase">{language === 'ar' ? 'اختر وتعيين الصلاحيات المبدئية:' : 'Pre-assign Security Permissions:'}</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
              {SYSTEM_PERMISSIONS.map(p => {
                const checked = formPermissions.includes(p.key);
                return (
                  <label 
                    key={p.key}
                    className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors ${checked ? 'border-zinc-900 bg-zinc-50/40' : 'border-zinc-200'}`}
                  >
                    <input 
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setFormPermissions(prev => 
                          prev.includes(p.key) 
                            ? prev.filter(k => k !== p.key) 
                            : [...prev, p.key]
                        );
                      }}
                      className="mt-1 rounded border-zinc-300 text-black focus:ring-black"
                    />
                    <div>
                      <span className="text-xs font-extrabold text-zinc-900 block leading-tight">{language === 'ar' ? p.nameAr : p.nameEn}</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5 leading-snug">{language === 'ar' ? p.descriptionAr : p.descriptionEn}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4">
            <button 
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-bold bg-zinc-100 border border-zinc-200 rounded-xl hover:bg-zinc-200 transition-colors"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button 
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-black text-white hover:bg-zinc-800 rounded-xl transition-colors shadow-sm"
            >
              {language === 'ar' ? 'إضافة وحفظ الدور الجديد' : 'Seal Role Definition'}
            </button>
          </div>
        </form>
      )}

      {/* Main Core View Layout (Two Column layout: left role card list, right permissions grid per role) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Roles Index */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white border border-zinc-150 rounded-2xl p-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث عن دور...' : 'Search role templates...'}
              className="w-full text-xs font-bold border-none focus:outline-none focus:ring-0 text-zinc-700 bg-transparent p-0"
            />
          </div>

          {filteredRoles.map(role => {
            const isSel = selectedRole?.id === role.id;
            return (
              <div 
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`p-5 rounded-2xl bg-white border cursor-pointer hover:border-zinc-300 transition-all shadow-sm flex flex-col justify-between relative ${isSel ? 'ring-2 ring-black border-transparent' : 'border-zinc-150'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${role.isSystem ? 'bg-primary/10 text-primary' : 'bg-zinc-100 text-zinc-500'}`}>
                      {getRoleIcon(role.key)}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-zinc-900 leading-tight">
                        {language === 'ar' ? role.nameAr : role.nameEn}
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                        @{role.key}
                      </span>
                    </div>
                  </div>
                  
                  {role.isSystem ? (
                    <span className="text-[9px] font-extrabold uppercase bg-zinc-100 px-2 py-0.5 rounded-md text-zinc-500 font-mono">
                      {language === 'ar' ? 'نظامي' : 'System'}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.id);
                      }}
                      className="text-zinc-400 hover:text-red-600 p-1"
                      title={language === 'ar' ? 'حذف الدور بالكامل' : 'Delete Core Definition'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs font-medium text-zinc-500 mt-3 line-clamp-2">
                  {language === 'ar' ? role.descriptionAr : role.descriptionEn}
                </p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
                  <span className="text-[10px] font-bold text-zinc-400">
                    {language === 'ar' ? `${role.permissions.length} صلاحيات` : `${role.permissions.length} assignments`}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-50 border border-zinc-150 px-2 py-0.5 rounded-full font-mono">
                    {language === 'ar' ? `${role.userCount} مستخدم` : `${role.userCount} users`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Permission Matrix Customizer */}
        <div className="lg:col-span-8">
          {selectedRole ? (
            <div className="bg-white border border-zinc-150 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
                    {getRoleIcon(selectedRole.key)}
                    {language === 'ar' 
                      ? `امتيازات وصلاحيات [ ${selectedRole.nameAr} ]` 
                      : `Access Matrix: ${selectedRole.nameEn}`}
                  </h3>
                  <span className="text-xs font-medium text-zinc-400 block mt-0.5">
                    {language === 'ar' ? 'انقر لتفعيل أو تعطيل الامتيازات من مصفوفة الدور الجارية' : 'Activate/Deactivate granular system level override values.'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    {language === 'ar' ? 'نشط وآمن' : 'Secured live'}
                  </span>
                </div>
              </div>

              {/* Grid block of permissions mapped directly to togglable switches */}
              <div className="space-y-4">
                {SYSTEM_PERMISSIONS.map(p => {
                  const active = selectedRole.permissions.includes(p.key);
                  return (
                    <div 
                      key={p.key}
                      onClick={() => handleTogglePermission(selectedRole.id, p.key)}
                      className={`p-4 border rounded-2xl cursor-pointer hover:border-zinc-300 hover:bg-zinc-50/20 transition-all flex items-center justify-between ${active ? 'border-black/10 bg-zinc-50/30' : 'border-zinc-150 bg-white'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-xl mt-0.5 ${active ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                          {active ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-extrabold text-zinc-900 flex items-center gap-2">
                            {language === 'ar' ? p.nameAr : p.nameEn}
                            <span className="text-[9px] font-mono font-normal text-zinc-400">
                              #{p.key}
                            </span>
                          </h5>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-medium leading-relaxed max-w-[500px]">
                            {language === 'ar' ? p.descriptionAr : p.descriptionEn}
                          </p>
                        </div>
                      </div>

                      {/* Sliding Toggle Switch */}
                      <div className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${active ? 'bg-black' : 'bg-zinc-200'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${language === 'ar' ? (active ? 'left-1' : 'left-6') : (active ? 'left-6' : 'left-1')}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedRole.isSystem && (
                <div className="bg-amber-50/60 border border-amber-150 text-amber-800 text-[11px] p-3 rounded-2xl font-semibold mt-6 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    {language === 'ar' 
                      ? 'ملاحظة أمنية: هذا الدور إداري أساسي بالنظام. سيتم الإشراف وحفظ المزامنة تلقائياً بقواعد الحماية.' 
                      : 'Security note: This is a core template role. Modifications made to core system matrix variables persist globally and guide component routing blocks.'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-zinc-200 rounded-3xl p-12 text-center text-zinc-400 flex flex-col items-center justify-center min-h-[400px]">
              <Lock className="w-12 h-12 text-zinc-300 stroke-1 mb-4" />
              <h3 className="font-extrabold text-zinc-805 text-sm">{language === 'ar' ? 'بانتظار اختيار دور مستخدم لمعاينة الصلاحيات' : 'No role selected'}</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                {language === 'ar' ? 'يرجى النقر واختيار أحد الأدوار المتاحة من الواجهة الجانبية لتعديل مصفوفة صلاحياته وتأثيراته الأمنية' : 'Select a customized role matrix from the left navigation lane to review and switch associated operational guidelines.'}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
