import React from 'react';

interface OptionTileProps {
  index: number;
  label: string;
  text: string;
  selected: boolean;
  disabled: boolean;
  state: 'idle' | 'selected' | 'correct' | 'wrong' | 'revealed';
  onClick: () => void;
}

export const OptionTile: React.FC<OptionTileProps> = ({
  index,
  label,
  text,
  selected,
  disabled,
  state,
  onClick,
}) => {
  // Styling based on state
  let borderClasses = 'border-white/10 hover:border-white/20';
  let bgClasses = 'bg-surface hover:bg-surface-2';
  let textClasses = 'text-text';
  let badgeClasses = 'bg-white/10 text-muted';
  let extraEffect = '';

  if (state === 'selected') {
    borderClasses = 'border-accent-purple shadow-[0_0_25px_rgba(124,92,255,0.3)] ring-1 ring-accent-purple';
    bgClasses = 'bg-surface-2';
    badgeClasses = 'bg-accent-purple text-white';
  } else if (state === 'correct') {
    borderClasses = 'border-accent-green shadow-[0_0_30px_rgba(61,220,151,0.4)] ring-2 ring-accent-green';
    bgClasses = 'bg-accent-green/10';
    textClasses = 'text-accent-green font-semibold';
    badgeClasses = 'bg-accent-green text-black font-bold';
  } else if (state === 'wrong') {
    borderClasses = 'border-accent-red shadow-[0_0_30px_rgba(255,92,122,0.4)] ring-2 ring-accent-red animate-shake';
    bgClasses = 'bg-accent-red/10';
    textClasses = 'text-accent-red';
    badgeClasses = 'bg-accent-red text-white';
  } else if (state === 'revealed') {
    borderClasses = 'border-accent-green/60 shadow-[0_0_20px_rgba(61,220,151,0.2)] ring-1 ring-accent-green/50';
    bgClasses = 'bg-accent-green/5';
    textClasses = 'text-accent-green';
    badgeClasses = 'bg-accent-green/30 text-accent-green font-bold';
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative flex items-start text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 w-full min-h-[76px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-purple ${borderClasses} ${bgClasses} ${extraEffect} ${
        disabled && state === 'idle' ? 'opacity-40 cursor-not-allowed hover:border-white/10 hover:bg-surface' : ''
      }`}
    >
      {/* Option Key Badge (e.g. A, B, C, D) */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm mr-3.5 transition-colors ${badgeClasses}`}
      >
        {label}
      </div>

      {/* Option Text */}
      <div className="flex-1 pt-1">
        <span className={`text-base font-medium leading-relaxed block ${textClasses}`}>
          {text}
        </span>
      </div>

      {/* Subtle Keyboard Shortcut Hint (1, 2, 3, 4) */}
      <div className="hidden sm:block ml-2 opacity-0 group-hover:opacity-60 transition-opacity">
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/5 rounded border border-white/10 text-muted">
          {index + 1}
        </kbd>
      </div>
    </button>
  );
};
