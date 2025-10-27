import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-off-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md transform transition-all border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-poppins text-xl font-semibold text-charcoal dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-charcoal dark:hover:text-white transition">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
