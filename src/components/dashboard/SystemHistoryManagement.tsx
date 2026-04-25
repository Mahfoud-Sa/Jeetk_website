import { useState } from 'react';
import { History, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useActions } from '../../services/actionService';

export const SystemHistoryManagement = () => {
  const { language } = useLanguage();
  const { data: actionsData = [], isLoading } = useActions();
  const actions = Array.isArray(actionsData) ? actionsData : [];
  const [selectedAction, setSelectedAction] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          {language === 'ar' ? 'سجل النظام' : 'System History'}
        </h3>
      </div>

      <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'النوع' : 'Type'}</th>
                <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'الكيان' : 'Entity'}</th>
                <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'المعرف' : 'ID'}</th>
                <th className="px-6 py-4 font-bold text-sm">{language === 'ar' ? 'الوقت' : 'Time'}</th>
                <th className="px-6 py-4 font-bold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : actions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    {language === 'ar' ? 'لا يوجد سجلات' : 'No history records found.'}
                  </td>
                </tr>
              ) : (
                actions.map((action: any) => (
                  <tr key={action.id || action.Id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-bold">
                        {(action.user || action.User)?.fullName || (action.user || action.User)?.FullName || (action.user || action.User)?.name || (action.user || action.User)?.Name || 'System'}
                      </div>
                      <div className="text-xs text-zinc-400">ID: {action.userId || action.UserId || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        (action.actionType || action.ActionType) === 'Create' ? 'bg-emerald-100 text-emerald-700' :
                        (action.actionType || action.ActionType) === 'Update' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {action.actionType || action.ActionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{action.entityName || action.EntityName}</td>
                    <td className="px-6 py-4 text-sm font-mono">#{action.entityId || action.EntityId}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {new Date(action.timestamp || action.Timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedAction(action)}
                        className="p-2 text-zinc-400 hover:text-primary transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Detail Modal */}
      <AnimatePresence>
        {selectedAction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-3xl p-8 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{language === 'ar' ? 'تفاصيل السجل' : 'History Details'}</h2>
                  <p className="text-zinc-500 text-sm">
                    {selectedAction.entityName || selectedAction.EntityName} #{selectedAction.entityId || selectedAction.EntityId}
                  </p>
                </div>
                <button onClick={() => setSelectedAction(null)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(selectedAction.oldValues || selectedAction.OldValues) && (
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-3">Old Values</p>
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                        {(() => {
                          const val = selectedAction.oldValues || selectedAction.OldValues;
                          if (typeof val === 'object') return JSON.stringify(val, null, 2);
                          try { return JSON.stringify(JSON.parse(val as string), null, 2); } catch (e) { return val; }
                        })()}
                      </pre>
                    </div>
                  )}
                  {(selectedAction.newValues || selectedAction.NewValues) && (
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      <p className="text-[10px] font-bold text-primary/60 uppercase mb-3">New Values</p>
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                        {(() => {
                          const val = selectedAction.newValues || selectedAction.NewValues;
                          if (typeof val === 'object') return JSON.stringify(val, null, 2);
                          try { return JSON.stringify(JSON.parse(val as string), null, 2); } catch (e) { return val; }
                        })()}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
