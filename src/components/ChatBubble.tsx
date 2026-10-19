import React, { useEffect, useRef, useState } from 'react';
import {
  MessageCircle,
  X,
  ArrowUpRight,
  Send,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  User,
  Bot,
  FileText,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { ConsultationModal } from './ConsultationModal';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  action?: {
    type: 'whatsapp' | 'consultation' | 'services' | 'deck';
    label: string;
  };
}

export function ChatBubble() {
  const { data } = useCms();
  const { settings } = data;

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 639;
  const defaultPosition = isMobile ? { right: 14, bottom: 14 } : { right: 20, bottom: 20 };
  const [position, setPosition] = useState(defaultPosition);
  const [open, setOpen] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [input, setInput] = useState('');
  const [exchangeCount, setExchangeCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const moved = useRef(false);

  const rawNumber = settings.whatsappNumber || '+2348000000000';
  const cleanPhone = rawNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello GhreatnessLabs, I would like to speak directly with a team member about our project.'
  )}`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "Hello. I'm the GhreatnessLabs assistant. How can we help with your digital systems, brand architecture, or infrastructure project?",
      timestamp: 'Just now',
    },
  ]);

  useEffect(() => {
    const saved = sessionStorage.getItem('ghreatness-chat-position');
    if (saved) {
      try {
        const value = JSON.parse(saved);
        if (typeof value.right === 'number' && typeof value.bottom === 'number') {
          const maxRight = Math.max(10, window.innerWidth - 64);
          const maxBottom = Math.max(10, window.innerHeight - 64);
          setPosition({
            right: Math.min(Math.max(12, value.right), maxRight),
            bottom: Math.min(Math.max(12, value.bottom), maxBottom),
          });
        }
      } catch {
        sessionStorage.removeItem('ghreatness-chat-position');
      }
    }
  }, []);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const drag = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    moved.current = false;
  };

  const move = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    const bubbleSize = window.innerWidth <= 639 ? 48 : 56;
    const right = Math.max(
      10,
      Math.min(window.innerWidth - bubbleSize - 10, window.innerWidth - event.clientX - bubbleSize / 2)
    );
    const bottom = Math.max(
      10,
      Math.min(window.innerHeight - bubbleSize - 10, window.innerHeight - event.clientY - bubbleSize / 2)
    );
    moved.current = true;
    setPosition({ right, bottom });
  };

  const end = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setPosition((value) => {
      sessionStorage.setItem('ghreatness-chat-position', JSON.stringify(value));
      return value;
    });
  };

  const generateBotReply = (userQuery: string, currentExchanges: number): { reply: string; action?: ChatMessage['action'] } => {
    const q = userQuery.toLowerCase();

    // Human or WhatsApp or quote requests
    if (
      q.includes('human') ||
      q.includes('person') ||
      q.includes('agent') ||
      q.includes('representative') ||
      q.includes('speak') ||
      q.includes('talk') ||
      q.includes('call') ||
      q.includes('whatsapp')
    ) {
      return {
        reply: `You can connect directly with our studio partners right now. Choose WhatsApp for instant priority messaging or book a scoped consultation call.`,
        action: { type: 'whatsapp', label: 'Open WhatsApp Chat' },
      };
    }

    if (
      q.includes('deck') ||
      q.includes('download') ||
      q.includes('overview') ||
      q.includes('pdf') ||
      q.includes('brochure')
    ) {
      return {
        reply: `You can download our complete Services Overview PDF to review our capabilities and infrastructure methodology.`,
        action: { type: 'deck', label: 'Download Services Overview' },
      };
    }

    if (
      q.includes('service') ||
      q.includes('capability') ||
      q.includes('offer') ||
      q.includes('what do you do') ||
      q.includes('build')
    ) {
      return {
        reply: `GhreatnessLabs architects high-impact digital systems across two core practices: Digital Services (Brand Identity, UI/UX Systems, Web Platforms) and Information Technology (Enterprise Architecture, Cloud Infrastructure, Custom Engineering).`,
        action: { type: 'services', label: 'Explore All Services' },
      };
    }

    if (
      q.includes('pricing') ||
      q.includes('cost') ||
      q.includes('rate') ||
      q.includes('budget') ||
      q.includes('quote')
    ) {
      return {
        reply: `Every engagement is scoped specifically to requirements, timeline, and architectural scale. We invite you to schedule a confidential consultation to review your brief.`,
        action: { type: 'consultation', label: 'Book a Consultation' },
      };
    }

    if (
      q.includes('location') ||
      q.includes('office') ||
      q.includes('lagos') ||
      q.includes('where') ||
      q.includes('address')
    ) {
      return {
        reply: `Our headquarters is situated in Victoria Island, Lagos, Nigeria. We collaborate with ambitious enterprises and technology ventures globally.`,
      };
    }

    if (
      q.includes('timeline') ||
      q.includes('available') ||
      q.includes('availability') ||
      q.includes('when') ||
      q.includes('q2')
    ) {
      return {
        reply: `The studio is currently accepting select engagements for ${settings.availabilityText || 'Q2 projects'}. We recommend initiating scoping early.`,
        action: { type: 'consultation', label: 'Inquire About Availability' },
      };
    }

    // After 2 or more exchanges, provide thoughtful answer with natural human handoff option
    if (currentExchanges >= 2) {
      return {
        reply: `Thanks for the details. For specific architecture specs or bespoke timelines, our engineering partners in Lagos can consult directly with your team.`,
        action: { type: 'consultation', label: 'Talk to a Partner' },
      };
    }

    return {
      reply: `Thank you for reaching out. We build end-to-end platforms, brand identities, and high-performance infrastructure. Would you like to review our services or speak with a human partner?`,
      action: { type: 'consultation', label: 'Book a Consultation' },
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    const newExchanges = exchangeCount + 1;
    setExchangeCount(newExchanges);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulate conversational bot latency
    setTimeout(() => {
      const { reply, action } = generateBotReply(text, newExchanges);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: reply,
        timestamp: 'Just now',
        action,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 450);
  };

  const handleActionClick = (action: ChatMessage['action']) => {
    if (!action) return;
    if (action.type === 'whatsapp') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } else if (action.type === 'consultation') {
      setConsultationOpen(true);
    } else if (action.type === 'services') {
      window.location.href = '/services';
    } else if (action.type === 'deck') {
      const link = document.createElement('a');
      link.href = settings.capabilityDeckUrl || '/GhreatnessLabs-Services-Overview.pdf';
      link.download = 'GhreatnessLabs-Services-Overview.pdf';
      link.click();
    }
  };

  return (
    <>
      <div
        className="chat-widget"
        style={{ right: position.right, bottom: position.bottom }}
      >
        <div
          className={`chat-panel chat-panel-enhanced ${open ? 'chat-panel-open' : ''}`}
          role="dialog"
          aria-label="GhreatnessLabs Systems Assistant"
          aria-hidden={!open}
        >
          {/* Header */}
          <div className="chat-panel-header">
            <div className="chat-panel-header-info">
              <span className="chat-assistant-dot" />
              <div>
                <b>Ghreatness Assistant</b>
                <span className="chat-desk-status">Lagos Systems Desk · Active</span>
              </div>
            </div>
            <button
              aria-label="Close chat"
              className="chat-close-btn"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick prompt suggestions (shown early) */}
          {messages.length <= 2 && (
            <div className="chat-quick-chips">
              <button
                type="button"
                className="chat-chip"
                onClick={() => handleSend('What services do you provide?')}
              >
                Services
              </button>
              <button
                type="button"
                className="chat-chip"
                onClick={() => handleSend('Book a consultation')}
              >
                Book consultation
              </button>
              <button
                type="button"
                className="chat-chip"
                onClick={() => handleSend('Download services deck')}
              >
                <FileText size={11} /> Overview deck
              </button>
              <button
                type="button"
                className="chat-chip"
                onClick={() => handleSend('Talk to a human')}
              >
                Talk to human
              </button>
            </div>
          )}

          {/* Messages list */}
          <div className="chat-messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message-row ${
                  msg.sender === 'user' ? 'msg-user' : 'msg-bot'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="chat-avatar bot-avatar">
                    <Bot size={13} />
                  </div>
                )}
                <div className="chat-bubble-bubble">
                  <p>{msg.text}</p>
                  {msg.action && (
                    <button
                      type="button"
                      className="chat-action-btn"
                      onClick={() => handleActionClick(msg.action)}
                    >
                      {msg.action.type === 'whatsapp' ? (
                        <MessageSquare size={12} />
                      ) : msg.action.type === 'deck' ? (
                        <FileText size={12} />
                      ) : (
                        <ArrowUpRight size={12} />
                      )}
                      <span>{msg.action.label}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Persistent Human Handoff Banner: Always available & visible at the bottom of the chat window */}
          <div className="chat-human-handoff-bar">
            <div className="chat-handoff-left">
              <span className="chat-handoff-dot" />
              <span>Need human assistance?</span>
            </div>
            <div className="chat-handoff-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="chat-handoff-link whatsapp-link"
                title="Chat with our Lagos team on WhatsApp"
              >
                <MessageSquare size={12} />
                <span>WhatsApp</span>
              </a>
              <span className="chat-handoff-divider">·</span>
              <button
                type="button"
                className="chat-handoff-link consultation-link"
                onClick={() => setConsultationOpen(true)}
                title="Open Book a Consultation options"
              >
                <span>Consultation</span>
                <ArrowUpRight size={11} />
              </button>
            </div>
          </div>

          {/* Input field */}
          <form
            className="chat-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about systems, services, or team..."
              aria-label="Message to assistant"
              className="chat-text-input"
            />
            <button
              type="submit"
              className="chat-send-btn"
              aria-label="Send message"
              disabled={!input.trim()}
            >
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* Floating Bubble */}
        <button
          className="chat-bubble"
          aria-label={open ? 'Close assistant' : 'Open Ghreatness assistant'}
          aria-expanded={open}
          onPointerDown={drag}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onClick={() => {
            if (!moved.current) setOpen((value) => !value);
            moved.current = false;
          }}
        >
          <MessageCircle />
          {!open && <span className="chat-bubble-ping" />}
        </button>
      </div>

      {/* Consultation Modal Triggered From Chat */}
      <ConsultationModal
        isOpen={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        onNavigate={(to) => {
          setConsultationOpen(false);
          window.location.href = to;
        }}
      />
    </>
  );
}
export default ChatBubble;
