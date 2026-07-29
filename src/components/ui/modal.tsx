import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div
        className={`bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
          <h3 className="font-display font-bold text-lg text-zinc-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
