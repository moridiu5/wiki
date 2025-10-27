'use client';

import { useState, useRef, useEffect } from 'react';
import { Lock, X } from 'lucide-react';

export default function PinModal({ isOpen, onClose, onSuccess, action }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      // Focus first input when modal opens
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleDigitChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newPin = pin.split('');
    newPin[index] = value.slice(-1); // Take only the last character
    const updatedPin = newPin.join('');
    setPin(updatedPin);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle Enter key to submit
    if (e.key === 'Enter' && pin.length === 6) {
      handleSubmit(e);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      setPin(pastedData.padEnd(6, ''));
      const lastIndex = Math.min(pastedData.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pin.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (data.valid) {
        onSuccess();
        onClose();
      } else {
        setError('Invalid PIN. Please try again.');
        setPin('');
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setError('Failed to verify PIN. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-md shadow-2xl p-12 relative border border-slate-700">
        {/* Close button - top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded cursor-pointer"
          disabled={isVerifying}
        >
          <X className="w-5 h-5 text-zinc-300" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Authentication Required</h2>
            <p className="text-sm text-zinc-300">Enter your 6-digit PIN to {action}</p>
          </div>
        </div>

        {/* PIN Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 justify-center">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={pin[index] || ''}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isVerifying}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-600 rounded-lg focus:border-teal-500 focus:outline-none disabled:bg-slate-700 bg-slate-700 text-white"
              />
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="flex-1 px-4 py-2 text-sm border border-slate-600 rounded hover:bg-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pin.length !== 6 || isVerifying}
              className="flex-1 px-4 py-2 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Confirm'}
            </button>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
            <p className="text-xs text-zinc-400 text-center">
              💡 Default PIN: <span className="font-mono font-bold text-teal-400">123456</span>
              <br />
              Change it using: <span className="font-mono text-teal-400">npm run change-pin</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
