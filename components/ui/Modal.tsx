"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const frame = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    const timeout = window.setTimeout(() => {
      setIsMounted(false);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMounted, onClose]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      aria-hidden={!isOpen}
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        background: 'rgba(0, 0, 0, 0.60)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 200ms ease-out',
      }}
    >
      <div
        aria-modal="true"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 101,
          width: '100%',
          overflow: 'hidden',
          borderRadius: '24px 24px 0 0',
          borderTop: '1px solid rgba(74, 69, 79, 0.20)',
          background: 'rgba(15, 19, 31, 0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          maxHeight: 'calc(100vh - 12px)',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 250ms ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 20,
            paddingBottom: 16,
          }}
        >
          <h2
            style={{
              margin: 0,
              paddingRight: 8,
              fontSize: 22,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#DFE2F3',
              fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            style={{
              display: 'inline-flex',
              height: 40,
              width: 40,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              border: '1px solid rgba(74,69,79,0.20)',
              background: 'rgba(15,19,31,0.65)',
              color: '#DFE2F3',
              cursor: 'pointer',
              transition: 'background 150ms ease-out',
            }}
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            maxHeight: 'calc(100vh - 104px)',
            overflowY: 'auto',
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
