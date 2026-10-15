import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, ArrowUpRight } from 'lucide-react';

export function ChatBubble() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 639;
  const defaultPosition = isMobile ? { right: 14, bottom: 14 } : { right: 20, bottom: 20 };
  const [position, setPosition] = useState(defaultPosition);
  const [open, setOpen] = useState(false);
  const dragging = useRef(false);
  const moved = useRef(false);

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

  const drag = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    moved.current = false;
  };

  const move = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    const bubbleSize = window.innerWidth <= 639 ? 48 : 56;
    const right = Math.max(10, Math.min(window.innerWidth - bubbleSize - 10, window.innerWidth - event.clientX - bubbleSize / 2));
    const bottom = Math.max(10, Math.min(window.innerHeight - bubbleSize - 10, window.innerHeight - event.clientY - bubbleSize / 2));
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

  return (
    <div
      className="chat-widget"
      style={{ right: position.right, bottom: position.bottom }}
    >
      <div
        className={`chat-panel ${open ? 'chat-panel-open' : ''}`}
        role="dialog"
        aria-label="GhreatnessLabs assistant"
        aria-hidden={!open}
      >
        <div>
          <b>Ghreatness assistant</b>
          <button aria-label="Close chat" onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        <p>How can we help with your next digital project?</p>
        <a href="/contact">
          Start a conversation <ArrowUpRight />
        </a>
      </div>
      <button
        className="chat-bubble"
        aria-label={open ? 'Close assistant' : 'Open assistant'}
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
      </button>
    </div>
  );
}
