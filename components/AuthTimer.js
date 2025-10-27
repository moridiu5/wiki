'use client';

import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

export default function AuthTimer({ isAuthenticated, lastAuthTime, onAuthClick }) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

  useEffect(() => {
    const updateTimer = () => {
      if (!lastAuthTime) {
        setTimeRemaining(0);
        return;
      }

      const now = Date.now();
      const elapsed = now - lastAuthTime;
      const remaining = Math.max(0, thirtyMinutes - elapsed);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lastAuthTime, thirtyMinutes]);

  const isActive = isAuthenticated && timeRemaining > 0;
  const strokeColor = isActive ? '#14b8a6' : '#ef4444'; // teal-500 : red-500

  // If not authenticated, show full circle. If authenticated, show countdown
  const percentageRemaining = isActive ? (timeRemaining / thirtyMinutes) * 100 : 100;
  const circumference = 2 * Math.PI * 16; // radius = 16
  const strokeDashoffset = circumference - (percentageRemaining / 100) * circumference;

  return (
    <button
      onClick={onAuthClick}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 cursor-pointer hover:bg-slate-600 transition-colors"
      title={isActive ? `${Math.ceil(timeRemaining / 1000 / 60)} minutes remaining` : 'Authenticate'}
    >
      {/* SVG Circle Timer */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
        {/* Progress circle */}
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease'
          }}
        />
      </svg>

      {/* Lock Icon */}
      <div className="relative z-10">
        <Lock className="w-4 h-4 text-zinc-200" />
      </div>
    </button>
  );
}
