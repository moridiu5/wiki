'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message, itemName }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-md shadow-2xl p-8 relative border border-slate-700">
        {/* Close button - top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded cursor-pointer"
          disabled={isDeleting}
        >
          <X className="w-5 h-5 text-zinc-300" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="text-sm text-zinc-300">{message}</p>
          </div>
        </div>

        {/* Item name display */}
        {itemName && (
          <div className="mb-6 p-3 bg-slate-900 rounded-lg border border-slate-700">
            <p className="text-sm text-zinc-300">
              <span className="text-zinc-500">Item: </span>
              <span className="font-semibold text-white">{itemName}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-sm border border-slate-600 rounded hover:bg-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
