'use client';

import React, { useState, useRef } from 'react';

interface RangeLogoProps {
  className?: string;
}

export default function RangeLogo({
  className = 'text-[22px] leading-[1.35] font-semibold tracking-[-0.5px] text-(--content-primary) sm:text-[35px] cursor-pointer select-none',
}: RangeLogoProps) {
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [clickCount, setClickCount] = useState(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Stop any parent form submit or link navigation
    e.preventDefault();
    e.stopPropagation();

    clickCountRef.current += 1;
    const current = clickCountRef.current;
    setClickCount(current);

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (current >= 12) {
      clickCountRef.current = 0;
      setClickCount(0);
      window.location.assign('/admin/dashboard');
      return;
    }

    // Reset if inactive for 4 seconds
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
      setClickCount(0);
    }, 4000);
  };

  return (
    <span
      className="relative inline-flex items-center"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        onPointerDown={handlePointerDown}
        className={`bg-transparent border-0 p-0 text-left transition-transform active:scale-95 cursor-pointer select-none ${className}`}
        title="RangeRange"
        aria-label="RangeRange"
      >
        RangeRange
      </button>
      {/* Live feedback counter */}
      {clickCount > 0 && clickCount < 12 && (
        <span
          className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-md animate-bounce select-none pointer-events-none"
        >
          {clickCount}/12
        </span>
      )}
    </span>
  );
}
