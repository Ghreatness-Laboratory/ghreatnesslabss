import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, ArrowUpRight } from 'lucide-react';

export function ChatBubble() {
  const defaultPosition = { right: 20, bottom: 20 };
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
          setPosition(value);
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
    const size = 56;
    const right = Math.max(12, Math.min(innerWidth - size - 12, innerWidth - event.clientX - size / 2));
    const bottom = Math.max(12, Math.min(innerHeight - size - 12, innerHeight - event.clientY - size / 2));
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
