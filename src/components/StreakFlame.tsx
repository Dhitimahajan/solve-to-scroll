import React from 'react';
import { Flame } from 'lucide-react';

interface StreakFlameProps {
  count: number;
  showLabel?: boolean;
  className?: string;
}

export const StreakFlame: React.FC<StreakFlameProps> = ({ count, showLabel = true, className = '' }) => {
  const isLit = count > 0;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 border border-border transition-all duration-300 ${
        isLit ? 'border-accent-amber/40 shadow-[0_0_20px_rgba(255,180,92,0.25)]' : 'opacity-80'
      } ${className}`}
      title={`${count} day streak`}
    >
      <Flame
        className={`w-4 h-4 transition-transform duration-300 ${
          isLit ? 'text-accent-amber fill-accent-amber animate-pulse' : 'text-muted'
        }`}
      />
      <span className={`text-sm font-bold tracking-tight ${isLit ? 'text-accent-amber' : 'text-muted'}`}>
        {count}
      </span>
      {showLabel && (
        <span className="text-xs text-muted font-medium ml-0.5">
          {count === 1 ? 'day' : 'days'}
        </span>
      )}
    </div>
  );
};
