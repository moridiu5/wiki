'use client';

import { useState } from 'react';
import { Copy, X } from 'lucide-react';

export default function DuplicatePageModal({ isOpen, onClose, onConfirm, sections, currentPageTitle }) {
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleConfirm = async () => {
    if (!selectedSectionId) {
      alert('Please select a section');
      return;
    }

    setIsDuplicating(true);
    await onConfirm(selectedSectionId);
    setIsDuplicating(false);
    setSelectedSectionId('');
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
          disabled={isDuplicating}
        >
          <X className="w-5 h-5 text-zinc-300" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
            <Copy className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Duplicate Page</h2>
            <p className="text-sm text-zinc-300">Choose a section for the duplicate</p>
          </div>
        </div>

        {/* Page info */}
        <div className="mb-6 p-3 bg-slate-900 rounded-lg border border-slate-700">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-500">Duplicating: </span>
            <span className="font-semibold text-white">{currentPageTitle}</span>
          </p>
        </div>

        {/* Section selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-zinc-300">
            Select destination section
          </label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            disabled={isDuplicating}
            className="w-full border border-slate-600 rounded px-3 py-2 bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Choose a section...</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDuplicating}
            className="flex-1 px-4 py-2 text-sm border border-slate-600 rounded hover:bg-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDuplicating || !selectedSectionId}
            className="flex-1 px-4 py-2 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isDuplicating ? 'Duplicating...' : 'Duplicate'}
          </button>
        </div>
      </div>
    </div>
  );
}
