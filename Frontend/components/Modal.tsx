'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-2 sm:p-4">
      {/* Backdrop with cosmic theme */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-indigo-900/40 to-purple-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Animated cosmic background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/30 rounded-full animate-pulse" style={{animationDuration: '3s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-blue-200/40 rounded-full animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-indigo-300/30 rounded-full animate-pulse" style={{animationDuration: '2.5s', animationDelay: '0.5s'}}></div>
          <div className="absolute top-2/3 right-1/4 w-0.5 h-0.5 bg-purple-200/40 rounded-full animate-bounce" style={{animationDuration: '3.5s', animationDelay: '2s'}}></div>

          {/* Cosmic dust effect */}
          <div className="absolute inset-0 bg-gradient-radial from-indigo-500/5 via-transparent to-transparent opacity-50"></div>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-900/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-900/10 to-transparent"></div>
        </div>
      </div>

      {/* Modal Content */}
      <div className={`
        relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900
        border border-slate-700/50 shadow-2xl rounded-xl
        w-full ${sizeClasses[size]}
        max-h-[90vh] overflow-hidden
        transform transition-all duration-300 ease-out
        animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4
      `}>
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 animate-pulse"></div>

        {/* Header */}
        <div className="relative flex justify-between items-center p-4 sm:p-6 border-b border-slate-700/30 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
          {/* Animated particles around title */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 left-2 w-1 h-1 bg-indigo-400/30 rounded-full animate-pulse" style={{animationDuration: '2s'}}></div>
            <div className="absolute top-3 right-8 w-0.5 h-0.5 bg-purple-400/25 rounded-full animate-bounce" style={{animationDuration: '3s', animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-2 left-4 w-1 h-1 bg-slate-300/20 rounded-full animate-pulse" style={{animationDuration: '2.5s', animationDelay: '1s'}}></div>
          </div>

          <h3 className="relative text-lg sm:text-xl font-semibold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent pr-2 z-10">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="relative z-10 p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:scale-110 group"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Content */}
        <div className="relative p-4 sm:p-6 max-h-[calc(90vh-120px)] overflow-y-auto custom-scrollbar">
          {/* Custom scrollbar styling */}
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(71, 85, 105, 0.1);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(148, 163, 184, 0.3);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(148, 163, 184, 0.5);
            }
          `}</style>

          {children}
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50"></div>
      </div>
    </div>
  );
};

export default Modal;
