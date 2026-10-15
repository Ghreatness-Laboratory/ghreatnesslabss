import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useCms } from '../../context/CmsContext';

export function ToastContainer() {
  const { toasts } = useCms();

  if (!toasts.length) return null;

  return (
    <div className="admin-toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`admin-toast admin-toast-${toast.type}`}>
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle size={16} className="text-rose-400" />}
          {toast.type === 'info' && <Info size={16} className="text-sky-400" />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
