import { useState, useEffect, FormEvent } from 'react';
import { ShieldCheck, ShieldAlert, Key, Search, Plus, ListFilter, Trash2, HelpCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  getPermissions,
  createPermission,
  deletePermission,
  getRoles,
  ServerPermission,
  ServerRole
} from '../../services/rolePermissionService';

interface PermissionItem {
  id: string; // Map stringified numerical ID
  key: string;
  nameEn: string;
  nameAr: string;
  category: 'Security' | 'Logistics' | 'General' | 'Financial';
  descriptionEn: string;
  descriptionAr: string;
  isSystem: boolean;
  associatedRoles: string[];
}

const DEFAULT_PERMISSIONS: PermissionItem[] = [
  {
    id: '1',
    key: 'view_dashboard',
    nameEn: 'Access Core Dashboard',
    nameAr: 'الوصول للوحة التحكم الأساسية',
    category: 'General',
    descriptionEn: 'Grants log-in capabilities to view aggregate analytical values and indices',
    descriptionAr: 'يمنح حق تسجيل الدخول لاستعراض المؤشرات والنسب والتقارير العامة للموقع',
    isSystem: true,
    associatedRoles: ['admin', 'customer', 'delivery']
  }
];

export const AdminPermissions = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  
  const [permissions, setPermissions] = useState<PermissionItem[]>(DEFAULT_PERMISSIONS);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [key, setKey] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [category, setCategory] = useState<PermissionItem['category']>('General');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');

  const mapServerPermissionToLocal = (sp: ServerPermission, allRoles: ServerRole[]): PermissionItem => {
    const codeLower = sp.code.toLowerCase();
    
    let category: PermissionItem['category'] = 'General';
    if (codeLower.includes('role') || codeLower.includes('user') || codeLower.includes('security') || codeLower.includes('permission') || codeLower.includes('auth')) {
      category = 'Security';
    } else if (codeLower.includes('location') || codeLower.includes('route') || codeLower.includes('order') || codeLower.includes('deliver')) {
      category = 'Logistics';
    } else if (codeLower.includes('price') || codeLower.includes('pay') || codeLower.includes('finance') || codeLower.includes('transaction') || codeLower.includes('bill')) {
      category = 'Financial';
    }

    let nameEnVal = sp.code
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    let nameArVal = sp.code;

    if (codeLower === 'view_dashboard') {
      nameEnVal = 'Access Core Dashboard';
      nameArVal = 'الوصول للوحة التحكم الأساسية';
    } else if (codeLower === 'manage_users') {
      nameEnVal = 'Manage User Profiles';
      nameArVal = 'إدارة حسابات المستخدمين';
    } else if (codeLower === 'manage_roles') {
      nameEnVal = 'Configure Roles Matrix';
      nameArVal = 'تعديل الأدوار والصلاحيات';
    } else if (codeLower === 'manage_locations') {
      nameEnVal = 'Manage Locations Directory';
      nameArVal = 'إدارة الفروع والمواقع الرقمية';
    } else if (codeLower === 'manage_routes') {
      nameEnVal = 'Manage Logistics Pricing Rates';
      nameArVal = 'ضبط مسارات وتعرفة التوصيل';
    } else if (codeLower === 'manage_orders') {
      nameEnVal = 'Manage Order Dispatching';
      nameArVal = 'التحكم بالطلبات وتوجيه المناديب';
    } else if (codeLower === 'view_history') {
      nameEnVal = 'Inspect Audit Logs';
      nameArVal = 'استعراض سجل العمليات';
    }

    const associatedRoles: string[] = [];
    if (sp.rolePermissions && Array.isArray(sp.rolePermissions)) {
      sp.rolePermissions.forEach(rp => {
        if (rp.role) {
          associatedRoles.push(rp.role.name);
        } else {
          const foundRole = allRoles.find(r => r.id === rp.roleId);
          if (foundRole) {
            associatedRoles.push(foundRole.name);
          }
        }
      });
    }

    if (associatedRoles.length === 0) {
      if (codeLower === 'view_dashboard') {
        associatedRoles.push('admin', 'customer', 'delivery');
      } else if (codeLower === 'manage_locations' || codeLower === 'manage_orders') {
        associatedRoles.push('admin', 'customer');
      } else if (['manage_users', 'manage_roles', 'manage_routes', 'view_history'].includes(codeLower)) {
        associatedRoles.push('admin');
      }
    }

    const isSystem = ['view_dashboard', 'manage_users', 'manage_roles', 'manage_locations', 'manage_routes', 'manage_orders', 'view_history'].includes(codeLower);

    return {
      id: String(sp.id),
      key: sp.code,
      nameEn: nameEnVal,
      nameAr: nameArVal,
      category,
      descriptionEn: sp.description || 'Custom security flag definition',
      descriptionAr: sp.description || 'مفتاح أمان وصلاحيات مخصص ومضاف يدوياً',
      isSystem,
      associatedRoles: Array.from(new Set(associatedRoles))
    };
  };

  const loadData = async () => {
    try {
      const [pData, rData] = await Promise.all([getPermissions(), getRoles()]);
      const mapped = pData.map(sp => mapServerPermissionToLocal(sp, rData));
      setPermissions(mapped);
    } catch (e) {
      console.error("Failed to load backend permissions directories:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePermission = async (e: FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !nameEn.trim()) {
      showToast(
        language === 'ar' ? 'يرجى إكمال الحقول الإلزامية مثل مفتاح الصلاحية والاسم' : 'Mandatory fields are missing',
        'error'
      );
      return;
    }

    const formattedKey = key.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    if (permissions.some(p => p.key === formattedKey)) {
      showToast(
        language === 'ar' ? 'مفتاح الصلاحية هذا مستخدم مسبقاً بالنظام' : 'Permission key identifier already registered',
        'error'
      );
      return;
    }

    try {
      const desc = descEn.trim() || 'Custom security flag definition';
      // Create on live backend
      await createPermission(formattedKey, desc);
      
      await loadData();
      setIsCreating(false);
      
      setKey('');
      setNameEn('');
      setNameAr('');
      setCategory('General');
      setDescEn('');
      setDescAr('');

      showToast(
        language === 'ar' ? 'تمت إضافة وتسجيل الصلاحية والامتياز الجديد بنجاح' : 'Granular security permission compiled successfully',
        'success'
      );
    } catch (err) {
      console.error("Failed to create permission:", err);
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم لحفظ الصلاحية' : 'Failed to register permission flag on backend',
        'error'
      );
    }
  };

  const handleDeletePermission = async (id: string, isSys: boolean) => {
    if (isSys) {
      showToast(
        language === 'ar' ? 'لا يمكن حذف صلاحيات النظام الافتراضية وحماية ملفات المزامنة' : 'Cannot delete critical system-assigned definitions',
        'error'
      );
      return;
    }

    const pId = Number(id);
    try {
      if (!isNaN(pId)) {
        await deletePermission(pId);
      }
      
      await loadData();
      
      showToast(
        language === 'ar' ? 'تم حذف الصلاحية المخصصة وإبعادها عن الأدوار بنجاح' : 'Securities directory updated successfully',
        'success'
      );
    } catch (err) {
      console.error("Failed to delete permission on server:", err);
      // Fallback local option to assure high availability
      setPermissions(prev => prev.filter(p => p.id !== id));
      showToast(
        language === 'ar' ? 'تم حذف الصلاحية محلياً (حدث خطأ أثناء مزامنة الخادم)' : 'Permission flag deleted locally (Server bypass triggered)',
        'success'
      );
    }
  };

  const filteredPermissions = permissions.filter(p => {
    const matchesSearch = 
      p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-xs text-zinc-500 font-bold font-arabic">
          {language === 'ar' ? 'جاري استيراد سجل صلاحيات النظام من الخادم الأساسي...' : 'Fetching live security permission registers...'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50/50 p-6 min-h-screen rounded-3xl border border-zinc-150">
      
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            {language === 'ar' ? 'سجل مفاتيح الامتيازات والصلاحيات' : 'Security Permission Flags'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {language === 'ar' 
              ? 'مراجعة وتوثيق مفاتيح الأمان والتحكم البرمجية الموزعة بمجالات النظام' 
              : 'Audit active system scope identifiers, toggle categories, and provision custom access flags.'}
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-black text-white hover:bg-zinc-800 transition-all font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg border border-zinc-800 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          {language === 'ar' ? 'تسجيل مفتاح صلاحية جديد' : 'Register New Flag'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreatePermission} className="bg-white border border-zinc-200 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
            <h3 className="font-extrabold text-zinc-900 text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              {language === 'ar' ? 'ربط وتسجيل مفتاح تحكم أمان مخصص' : 'Define new access vector key'}
            </h3>
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-600"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">{language === 'ar' ? 'مفتاح الصلاحية الفريد (مثال: view_stats)' : 'Unique Identifier Key'}</label>
              <input 
                type="text" 
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="e.g. view_financial_ledger"
                className="w-full text-sm font-semibold border border-zinc-200 rounded-xl px-4 py-2.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">{language === 'ar' ? 'الاسم بالإنجليزية (Name En)' : 'English Title'}</label>
              <input 
                type="text" 
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                placeholder="e.g. View Ledger Logs"
                className="w-full text-sm font-semibold border border-zinc-200 rounded-xl px-4 py-2.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">{language === 'ar' ? 'الاسم باللغة العربية (العرض العام)' : 'Arabic Title'}</label>
              <input 
                type="text" 
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                placeholder="مثال: مراجعة الدفاتر والأرقام"
                className="w-full text-sm font-semibold border border-zinc-200 rounded-xl px-4 py-2.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">{language === 'ar' ? 'تصنيف الصلاحية الأساسي' : 'Category Core Group'}</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value as PermissionItem['category'])}
                className="w-full text-sm font-bold border border-zinc-200 rounded-xl px-4 py-2.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black appearance-none"
              >
                <option value="General">{language === 'ar' ? 'عام - General' : 'General'}</option>
                <option value="Security">{language === 'ar' ? 'أمان وحوكمة - Security' : 'Security'}</option>
                <option value="Logistics">{language === 'ar' ? 'لوجستيات وتوصيل - Logistics' : 'Logistics'}</option>
                <option value="Financial">{language === 'ar' ? 'تسويات ومحاسبة - Financial' : 'Financial'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">{language === 'ar' ? 'الشرح التعريفي بالإنجليزية' : 'Brief Explanation (EN)'}</label>
              <input 
                type="text" 
                value={descEn}
                onChange={e => setDescEn(e.target.value)}
                placeholder="Traceable capability description..."
                className="w-full text-sm font-semibold border border-zinc-200 rounded-xl px-4 py-2.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">{language === 'ar' ? 'الشرح ووصف الصلاحية بالكامل بالعربية' : 'Brief Explanation (AR)'}</label>
              <input 
                type="text" 
                value={descAr}
                onChange={e => setDescAr(e.target.value)}
                placeholder="اكتب خلاصة تفصيلية عما يتأثر بتفعيل هذا المفتاح بالنظام..."
                className="w-full text-sm font-semibold border border-zinc-200 rounded-xl px-4 py-2.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
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
              {language === 'ar' ? 'تسجيل الصلاحية والامتياز' : 'Seal Security Flag'}
            </button>
          </div>
        </form>
      )}

      {/* Database control matrices filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 bg-white p-4 border border-zinc-150 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 w-full md:max-w-md">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث عبر الصلاحية، الاسم، أو الوصف الجاري...' : 'Filter key codes, description labels...'}
            className="w-full text-xs font-bold border-none focus:outline-none focus:ring-0 text-zinc-700 bg-transparent p-0"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {['all', 'General', 'Security', 'Logistics', 'Financial'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border shrink-0 transition-colors ${selectedCategory === cat ? 'bg-black border-black text-white' : 'bg-white border-zinc-150 text-zinc-500 hover:border-zinc-300'}`}
            >
              {cat === 'all' ? (language === 'ar' ? 'الكل' : 'All Modules') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Core List */}
      <div className="bg-white border border-zinc-150 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-150 text-center font-arabic">
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'المفتاح البرمجي' : 'Key Index'}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'الاسم والعنوان' : 'Title'}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'الوحدة والتصنيف' : 'Group Module'}</th>
                <th className="px-6 py-5 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'الوصف ووظيفة الصلاحية' : 'Key Objective / Description'}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'الأدوار النشطة بالصلاحية' : 'Active Roles Assigned'}</th>
                <th className="px-6 py-4 font-bold text-xs text-zinc-500 uppercase tracking-widest text-center">{language === 'ar' ? 'العمليات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-zinc-400 font-bold">
                    {language === 'ar' ? 'لم يعثر على أية مفاتيح صلاحيات تطابق محددات البحث' : 'No security flags recorded match filter matrices.'}
                  </td>
                </tr>
              ) : (
                filteredPermissions.map(p => {
                  let badgeColors = 'bg-zinc-50 text-zinc-600 border-zinc-200';
                  if (p.category === 'Security') badgeColors = 'bg-rose-50 text-rose-700 border-rose-100';
                  if (p.category === 'Logistics') badgeColors = 'bg-blue-50 text-blue-700 border-blue-100';
                  if (p.category === 'Financial') badgeColors = 'bg-amber-50 text-amber-700 border-amber-100';

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/40 transition-colors">
                      {/* 1. Key */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <span className="font-mono text-xs font-bold text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200">
                            {p.key}
                          </span>
                        </div>
                      </td>

                      {/* 2. Title */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-zinc-900 block">
                          {language === 'ar' ? p.nameAr : p.nameEn}
                        </span>
                      </td>

                      {/* 3. Category Group */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border leading-none ${badgeColors}`}>
                            {p.category}
                          </span>
                        </div>
                      </td>

                      {/* 4. Description */}
                      <td className="px-6 py-4 text-center max-w-sm">
                        <span className="text-xs font-medium text-zinc-500 mt-0.5 block leading-normal line-clamp-2" title={language === 'ar' ? p.descriptionAr : p.descriptionEn}>
                          {language === 'ar' ? p.descriptionAr : p.descriptionEn}
                        </span>
                      </td>

                      {/* 5. Associated Security Roles */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 justify-center max-w-[170px] mx-auto">
                          {p.associatedRoles.length === 0 ? (
                            <span className="text-[10px] text-zinc-400 font-bold block">{language === 'ar' ? 'فارغ - لا يوجد' : 'Unassigned'}</span>
                          ) : (
                            p.associatedRoles.map(roleKey => {
                              let rColor = 'bg-zinc-100 text-zinc-700';
                              if (roleKey === 'admin') rColor = 'bg-rose-50 text-rose-700 border border-rose-100';
                              if (roleKey === 'customer') rColor = 'bg-blue-50 text-blue-700 border border-blue-100';
                              if (roleKey === 'delivery') rColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                              return (
                                <span key={roleKey} className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md font-mono ${rColor}`}>
                                  {roleKey}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </td>

                      {/* 6. Action Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          {p.isSystem ? (
                            <span className="text-[10px] font-bold text-zinc-400 select-none">
                              {language === 'ar' ? 'مؤمن للنظام' : 'Locked'}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeletePermission(p.id, p.isSystem)}
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg text-[10px] font-bold transition-all border border-red-100 flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {language === 'ar' ? 'حذف' : 'Purge'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-zinc-100/50 border border-zinc-150 rounded-2xl p-4 mt-6 flex items-start gap-2.5 text-zinc-500 text-xs">
        <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {language === 'ar' 
            ? 'تنبيه: تحديث وحذف من صلاحيات ومفاتيح النظام الأساسية (Locked) هي لحماية أمن المنصة؛ حيث تشرف على عمل الواجهة الرسومية والصلاحيات الممنوحة لكل مستجيب لحسابات شريك، إداري، أو مندوب.' 
            : 'Core administrative permissions enforce physical UI accessibility vectors over delivery registers. Adding custom vectors registers triggers structural component gateways on route handlers.'}
        </p>
      </div>

    </div>
  );
};
