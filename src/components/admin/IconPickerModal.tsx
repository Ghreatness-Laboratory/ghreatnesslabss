import React from 'react';
import { X } from 'lucide-react';
import { icons } from '../SharedSections';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIcon: string;
  onSelect: (iconName: string) => void;
}

export function IconPickerModal({
  isOpen,
  onClose,
  currentIcon,
  onSelect,
}: IconPickerModalProps) {
  if (!isOpen) return null;

  const iconKeys = Object.keys(icons);

  return (
    <div className="admin-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Select Lucide Icon</h3>
          <button className="admin-btn-icon" onClick={onClose} aria-label="Close icon picker">
            <X size={18} />
          </button>
        </div>
        <div className="admin-icon-grid">
          {iconKeys.map((key) => {
            const Icon = icons[key];
            const isSelected = currentIcon === key;
            return (
              <button
                type="button"
                key={key}
                className={`admin-icon-choice ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  onSelect(key);
                  onClose();
                }}
              >
                <span className="icon-badge">
                  <Icon size={20} />
                </span>
                <span className="admin-icon-name">{key}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
