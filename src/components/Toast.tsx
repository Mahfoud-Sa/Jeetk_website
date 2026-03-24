import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'error' | 'success' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type, onClose, duration = 5000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    error: 'bg-red-50 border-red-100',
    success: 'bg-emerald-50 border-emerald-100',
    info: 'bg-blue-50 border-blue-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg ${bgColors[type]} min-w-[300px] max-w-md`}
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1 text-sm font-medium text-zinc-800">
        {message}
      </div>
      <button 
        onClick={onClose}
        className="flex-shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors"
      >
        <X className="w-4 h-4 text-zinc-400" />
      </button>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: { id: string; message: string; type: ToastType }[];
  removeToast: (id: string) => void;
}

export const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-0 right-0 p-6 space-y-4 z-[200] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => removeToast(toast.id)} 
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
