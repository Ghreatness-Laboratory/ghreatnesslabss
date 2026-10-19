import React from 'react';
import { Check, AlertCircle, Info, Copy } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export function SiteToast() {
  const { toasts } = useCms();

  if (!toasts.length) return null;

  return (
    <div
      className="site-toast-container"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isCopy = toast.message.toLowerCase().includes('copied');
        return (
          <div
            key={toast.id}
            className={`site-toast-pill site-toast-${toast.type}`}
            role="status"
          >
            <span className="site-toast-icon">
              {isCopy ? (
                <Copy size={13} />
              ) : toast.type === 'error' ? (
                <AlertCircle size={13} />
              ) : toast.type === 'info' ? (
                <Info size={13} />
              ) : (
                <Check size={13} />
              )}
            </span>
            <span className="site-toast-text">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export default SiteToast;
