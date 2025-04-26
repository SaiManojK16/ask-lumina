'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ children, onClose }) {
  useEffect(() => {
    // Prevent scrolling on mount
    document.body.style.overflow = 'hidden';
    // Re-enable scrolling on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {children}
      </div>
    </div>,
    document.body
  );
}
