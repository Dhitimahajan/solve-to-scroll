import React from 'react';
import { Level } from '../lib/storage';
import { Sparkles, Zap, Award } from 'lucide-react';

interface LevelCardProps {
  level: Level;
  selected: boolean;
  onSelect: () => void;
}

export const LevelCard: React.FC<LevelCardProps> = ({ level, selected, onSelect }) => {
  const details = {
    beginner: {
      title: 'Beginner',
      subtitle: 'Starting your DSA journey',
      mix: '~70% Easy, ~30% Medium',
      icon: Sparkles,
      preview: 'Single loop complexity, basic array access, pointer concepts',
    },
    intermediate: {
      title: 'Intermediate',
      subtitle: 'Comfortable with core patterns',
      mix: '~20% Easy, ~60% Medium, ~20% Hard',
      icon: Zap,
      preview: 'BST properties, stack parsers, binary search boundaries',
    },
    expert: {
      title: 'Expert',
      subtitle: 'Interview-ready mastery',
      mix: '~10% Medium, ~90% Hard',
      icon: Award,
      preview: 'Master Theorem, AVL tree balance factors, complex graph traversals',
    },
  }[level];

  const Icon = details.icon;

  return (
    <div
      onClick={onSelect}
      className={`relative p-5 rounded-card border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        selected
          ? 'bg-surface-2 border-accent-purple shadow-glow ring-1 ring-accent-purple'
          : 'bg-surface border-white/10 hover:border-white/20 hover:bg-surface-2'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              selected ? 'bg-accent-purple text-white' : 'bg-white/5 text-muted'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono font-medium text-muted bg-white/5 px-2.5 py-1 rounded-pill">
            {details.mix}
          </span>
        </div>

        <h3 className="text-lg font-bold text-text mb-1">{details.title}</h3>
        <p className="text-xs text-muted mb-3">{details.subtitle}</p>

        <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs font-mono text-muted/90">
          <span className="text-accent-amber font-semibold block mb-0.5">Preview:</span>
          {details.preview}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs font-medium text-muted">
          {selected ? 'Active selection' : 'Click to select'}
        </span>
        <div
          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
            selected ? 'border-accent-purple bg-accent-purple' : 'border-white/20'
          }`}
        >
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
    </div>
  );
};
