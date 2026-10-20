import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, ArrowUpRight } from 'lucide-react';

export function ChatBubble() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 639;
  // Requirement d: Add bottom padding equal to sticky CTA height plus 24px, keeping chat button above CTA
  const minBottom = isMobile ? 96 : 88;
  const defaultPosition = isMobile ? { right: 16, bottom: minBottom } : { right: 24, bottom: minBottom };
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
          const maxBottom = Math.max(minBottom, window.innerHeight - 64);
          setPosition({
            right: Math.min(Math.max(12, value.right), maxRight),
            bottom: Math.min(Math.max(minBottom, value.bottom), maxBottom),
          });
        }
      } catch {
        sessionStorage.removeItem('ghreatness-chat-position');
      }
    }
  }, [minBottom]);

  const drag = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    moved.current = false;
  };

  const move = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    const bubbleSize = window.innerWidth <= 639 ? 48 : 52;
    const right = Math.max(
      10,
      Math.min(window.innerWidth - bubbleSize - 10, window.innerWidth - event.clientX - bubbleSize / 2)
    );
    // Ensure bottom stays above the sticky CTA (CTA height + 24px)
    const bottom = Math.max(
      minBottom,
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
        <div className="flex items-center justify-between pb-2 border-b border-[#eee]">
          <span className="font-medium text-[13px] text-[#111]">Ghreatness assistant</span>
          <button
            type="button"
            aria-label="Close assistant panel"
            onClick={() => setOpen(false)}
            className="w-7 h-7 grid place-items-center rounded hover:bg-[#f6f6f6] transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <p className="my-3 text-[13px] text-[#666] leading-[1.6]">
          How can we help with your next digital system or brand architecture project?
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#111] hover:underline"
        >
          Start a conversation <ArrowUpRight size={13} />
        </a>
      </div>

      <button
        type="button"
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
        <MessageCircle size={20} />
      </button>
    </div>
  );
}
