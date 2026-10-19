import React, { useEffect } from 'react';
import { Mail, MessageSquare, ArrowRight, X, PhoneCall, Sparkles } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { trackConsultationClick } from '../lib/analytics';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (to: string) => void;
}

export function ConsultationModal({ isOpen, onClose, onNavigate }: ConsultationModalProps) {
  const { data } = useCms();
  const { settings } = data;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rawNumber = settings.whatsappNumber || '+2348000000000';
  const cleanPhone = rawNumber.replace(/[^0-9]/g, '');
  const emailUrl = `mailto:${settings.contactEmail}?subject=Studio%20Consultation%20Inquiry%20%E2%80%94%20GhreatnessLabs&body=Hello%20GhreatnessLabs%20team%2C%0A%0AI%20would%20like%20to%20schedule%20a%20consultation%20to%20discuss%3A%0A%0A-%20Project%20Scope%3A%0A-%20Timeline%3A%0A-%20Estimated%20Budget%3A`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello GhreatnessLabs team, I would like to book a consultation for our digital project.'
  )}`;

  const handleOpenForm = () => {
    onClose();
    if (onNavigate) {
      onNavigate('/contact');
    } else {
      window.location.href = '/contact';
    }
  };

  return (
    <div
      className="consultation-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-modal-title"
    >
      <div className="consultation-modal-container">
        {/* Header */}
        <div className="consultation-modal-header">
          <div>
            <span className="consultation-modal-eyebrow">Direct Studio Access</span>
            <h2 id="consultation-modal-title" className="consultation-modal-title">
              Book a Consultation
            </h2>
          </div>
          <button
            type="button"
            className="consultation-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <p className="consultation-modal-intro">
          Connect directly with a senior systems partner to discuss your project brief, architecture
          strategy, and engineering timeline. Choose your preferred channel:
        </p>

        {/* Options */}
        <div className="consultation-options">
          {/* Primary Option: Start a Project Intake Brief */}
          <button
            type="button"
            className="consultation-card consultation-card-primary"
            onClick={() => {
              trackConsultationClick('modal', 'start_project_intake');
              onClose();
              if (onNavigate) {
                onNavigate('/start-project');
              } else {
                window.location.href = '/start-project';
              }
            }}
          >
            <div className="consultation-card-icon-badge badge-featured">
              <Sparkles size={20} />
            </div>
            <div className="consultation-card-body">
              <div className="consultation-card-heading">
                <b>Start a Project Brief</b>
                <span className="consultation-card-badge badge-primary-highlight">Recommended</span>
              </div>
              <p>
                Structured scoping intake for service categories, target timeline, and budget parameters.
              </p>
              <span className="consultation-card-link-text">
                Complete project brief <ArrowRight size={13} />
              </span>
            </div>
          </button>

          {/* WhatsApp Priority Option */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="consultation-card consultation-card-whatsapp"
            onClick={() => {
              trackConsultationClick('whatsapp', 'modal_whatsapp_link');
              onClose();
            }}
          >
            <div className="consultation-card-icon-badge badge-whatsapp">
              <MessageSquare size={20} />
            </div>
            <div className="consultation-card-body">
              <div className="consultation-card-heading">
                <b>WhatsApp Priority Chat</b>
                <span className="consultation-card-badge badge-fast">Fastest Response</span>
              </div>
              <p>Chat directly with our studio lead in Lagos for immediate scoping and availability.</p>
              <span className="consultation-card-link-text">
                Open WhatsApp Chat <ArrowRight size={13} />
              </span>
            </div>
          </a>

          {/* Email Option */}
          <a
            href={emailUrl}
            className="consultation-card"
            onClick={() => {
              trackConsultationClick('email', 'modal_email_link');
              onClose();
            }}
          >
            <div className="consultation-card-icon-badge">
              <Mail size={20} />
            </div>
            <div className="consultation-card-body">
              <div className="consultation-card-heading">
                <b>Email Consultation</b>
                <span className="consultation-card-badge">Direct Studio</span>
              </div>
              <p>Send your project overview and receive an engineering reply within 24 hours.</p>
              <span className="consultation-card-link-text">
                {settings.contactEmail} <ArrowRight size={13} />
              </span>
            </div>
          </a>
        </div>

        {/* Alternative: General Contact Form */}
        <div className="consultation-modal-footer">
          <span>General inquiry or studio partnerships?</span>
          <button
            type="button"
            className="consultation-form-link"
            onClick={handleOpenForm}
          >
            General Contact page <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConsultationModal;
