import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface ExplanationSheetProps {
  isCorrect: boolean;
  explanation: string;
  isLastQuestion: boolean;
  onNext: () => void;
}

export const ExplanationSheet: React.FC<ExplanationSheetProps> = ({
  isCorrect,
  explanation,
  isLastQuestion,
  onNext,
}) => {
  // Allow Enter key to trigger Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext]);

  return (
    <div className="w-full mt-6 p-5 sm:p-6 rounded-2xl bg-surface-2 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          {isCorrect ? (
            <div className="w-10 h-10 rounded-xl bg-accent-green/20 flex items-center justify-center border border-accent-green/30">
              <CheckCircle2 className="w-6 h-6 text-accent-green" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-accent-red/20 flex items-center justify-center border border-accent-red/30">
              <XCircle className="w-6 h-6 text-accent-red" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-base font-bold ${isCorrect ? 'text-accent-green' : 'text-accent-red'}`}>
              {isCorrect ? 'Spot on! Correct answer.' : 'Not quite right.'}
            </h4>
          </div>
          <p className="text-sm text-text/90 leading-relaxed">
            {explanation}
          </p>
          {!isCorrect && (
            <p className="text-xs text-accent-amber mt-2 font-medium">
              +1 question added to unlock queue. You can do this!
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-btn font-bold text-sm text-white bg-accent-gradient hover:opacity-95 active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(124,92,255,0.3)] cursor-pointer"
        >
          <span>{isLastQuestion && isCorrect ? 'Unlock Site' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-black/20 rounded font-mono text-white/80">
            ↵
          </kbd>
        </button>
      </div>
    </div>
  );
};
