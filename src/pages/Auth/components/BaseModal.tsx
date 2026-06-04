import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const CLOSE_LABEL = 'Close modal';

const getWidthClass = (size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'): string => {
  switch (size) {
    case 'sm': return 'max-w-sm';
    case 'md': return 'max-w-md';
    case 'lg': return 'max-w-lg';
    case 'xl': return 'max-w-xl';
    case '2xl': return 'max-w-2xl';
    case '3xl': return 'max-w-3xl';
    default: return 'max-w-md';
  }
};

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  closeButtonTheme?: 'light' | 'dark'; // 'light' dùng cho header nền tối (màu chữ trắng), 'dark' dùng cho nền sáng (màu chữ xám)
}

export default function BaseModal({
  isOpen,
  onClose,
  children,
  maxWidth = 'md',
  closeButtonTheme = 'light',
}: BaseModalProps) {
  // Lắng nghe phím Escape để đóng modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Nếu không mở, không render gì cả
  if (!isOpen) return null;

  // Lớp màu cho nút close dựa trên theme cấu hình
  const closeBtnClass =
    closeButtonTheme === 'light'
      ? 'text-white/70 hover:text-white'
      : 'text-gray-400 hover:text-gray-600';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay nền tối mờ */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Hộp chứa nội dung Modal */}
      <div
        className={`relative w-full ${getWidthClass(maxWidth)} bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10`}
      >
        {/* Nút bấm đóng cố định góc trên bên phải */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-8 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary/25 rounded-md ${closeBtnClass}`}
          aria-label={CLOSE_LABEL}
        >
          <X className="w-5 h-5" />
        </button>

        {children}
      </div>
    </div>,
    document.body
  ) as any;
}
