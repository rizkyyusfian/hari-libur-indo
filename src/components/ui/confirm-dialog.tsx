'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'default';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getConfirmButtonStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-[#c1121f] hover:bg-[#780000] text-white';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      default:
        return 'bg-[#003049] dark:bg-[#669bbc] hover:bg-[#003049]/90 dark:hover:bg-[#669bbc]/90 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full mx-4 animate-scale-in"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-[#003049]/10 dark:hover:bg-slate-800 text-[#003049]/60 dark:text-gray-400"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {variant === 'danger' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="text-[#c1121f]" size={20} />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#003049] dark:text-gray-100">
                {title}
              </h3>
              <p className="mt-2 text-sm text-[#003049]/70 dark:text-gray-400">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 text-[#003049] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg transition ${getConfirmButtonStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
