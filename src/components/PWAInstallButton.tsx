import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton({ variant = 'drawer' }: { variant?: 'drawer' | 'footer' }) {
  const { canInstallNatively, isIOS, isInstalled, installApp } = usePWAInstall();
  const [showIOSHint, setShowIOSHint] = useState(false);

  if (isInstalled || (!canInstallNatively && !isIOS)) {
    return null;
  }

  return (
    <div className={variant === 'footer' ? 'pwa-footer-install' : 'pwa-drawer-install'}>
      <button
        type="button"
        className={variant === 'footer' ? 'pwa-install-btn is-dark' : 'pwa-install-btn'}
        onClick={() => {
          if (canInstallNatively) {
            void installApp();
          } else if (isIOS) {
            setShowIOSHint((prev) => !prev);
          }
        }}
        aria-label="Install GhreatnessLabs web app"
      >
        <Download size={14} strokeWidth={2} aria-hidden="true" />
        <span>Install app</span>
      </button>

      {isIOS && showIOSHint && (
        <div className="pwa-ios-hint" role="note">
          <span>
            Tap <Share size={12} strokeWidth={2} className="inline mx-0.5 align-text-bottom" /> then{' '}
            <strong>Add to Home Screen</strong>
          </span>
          <button
            type="button"
            className="pwa-ios-close"
            onClick={() => setShowIOSHint(false)}
            aria-label="Dismiss install instructions"
          >
            <X size={12} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
