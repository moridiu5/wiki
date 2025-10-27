'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function InputModal({ isOpen, onClose, onSubmit, title, placeholder, defaultValue = '' }) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-md shadow-2xl p-8 relative border border-slate-700">
        {/* Close button - top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded cursor-pointer"
        >
          <X className="w-5 h-5 text-zinc-300" />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold mb-6 text-white">{title}</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-3 text-sm border-2 border-slate-600 rounded-lg focus:border-teal-500 focus:outline-none bg-slate-700 text-white placeholder-zinc-400"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-slate-600 rounded hover:bg-slate-700 cursor-pointer text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex-1 px-4 py-2 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
