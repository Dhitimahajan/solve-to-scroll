import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  loadAllAppState,
  recordSolvedQuestion,
  Question,
  Settings,
  Streak,
  DEFAULT_SETTINGS,
  DEFAULT_STREAK,
  DEFAULT_PROFILE,
  DEFAULT_PROGRESS,
} from '../../lib/storage';
import { selectNextQuestion } from '../../engine/selectQuestion';
import { evaluateAnswer } from '../../engine/scoring';
import { sound } from '../../lib/SoundEffects';
import { fireCelebrationConfetti } from '../../components/Confetti';
import { StreakFlame } from '../../components/StreakFlame';
import { CodePanel } from '../../components/CodePanel';
import { OptionTile } from '../../components/OptionTile';
import { HotspotDiagram } from '../../components/HotspotDiagram';
import { VisualDiagram } from '../../components/VisualDiagram';
import { ExplanationSheet } from '../../components/ExplanationSheet';
import { TimerRing } from '../../components/TimerRing';
import { Lock, ArrowUpRight, Volume2, VolumeX, ShieldAlert, Sparkles, X } from 'lucide-react';

export const BlockedApp: React.FC = () => {
  // Query parameters: ?site=instagram.com&url=...
  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const siteDomain = queryParams.get('site') || 'instagram.com';
  const targetUrl = queryParams.get('url') || `https://${siteDomain}`;

  // App state
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [streak, setStreak] = useState<Streak>(DEFAULT_STREAK);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [requiredQuestions, setRequiredQuestions] = useState(2);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [evaluation, setEvaluation] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  // Unlocked screen state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [remainingUnlockSeconds, setRemainingUnlockSeconds] = useState(600);

  // Initialize
  useEffect(() => {
    async function init() {
      const state = await loadAllAppState();
      setSettings(state.settings);
      setStreak(state.streak);
      sound.enabled = state.settings.sounds;

      const perUnlock = Math.max(1, state.settings.questionsPerUnlock || 2);
      setRequiredQuestions(perUnlock);

      const next = selectNextQuestion({
        profile: state.profile || DEFAULT_PROFILE,
        progress: state.progress || DEFAULT_PROGRESS,
      });

      setCurrentQuestion(next.question);
      setLoading(false);
    }
    init();
  }, []);

  // Keyboard navigation for options (1-4, Enter)
  useEffect(() => {
    if (isUnlocked || !currentQuestion || isEvaluated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key) && currentQuestion.options) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < currentQuestion.options.length) {
          e.preventDefault();
          setSelectedAnswer(idx);
          sound.playSelect();
        }
      } else if (e.key === 'Enter' && selectedAnswer !== null) {
        e.preventDefault();
        handleSubmitAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, selectedAnswer, isEvaluated, isUnlocked]);

  // Submit Answer
  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || selectedAnswer === null || isEvaluated) return;

    const evalResult = evaluateAnswer(currentQuestion, selectedAnswer);
    setIsEvaluated(true);
    setEvaluation({
      isCorrect: evalResult.isCorrect,
      explanation: evalResult.explanation,
    });

    if (evalResult.isCorrect) {
      sound.playCorrect();
    } else {
      sound.playError();
      // Wrong answer -> requires +1 more question to unlock
      setRequiredQuestions((prev) => prev + 1);
    }

    // Persist answer in storage & update streak/difficulty
    const updated = await recordSolvedQuestion(
      currentQuestion.topic,
      evalResult.isCorrect,
      currentQuestion.id
    );
    setStreak(updated.streak);
  }, [currentQuestion, selectedAnswer, isEvaluated]);

  // Next Question or Unlock
  const handleNext = async () => {
    if (!evaluation) return;

    // If answer was correct and we reached target question count, unlock!
    if (evaluation.isCorrect && questionNumber >= requiredQuestions) {
      unlockSite();
      return;
    }

    // Else move to next question
    setQuestionNumber((prev) => prev + 1);
    setSelectedAnswer(null);
    setIsEvaluated(false);
    setEvaluation(null);

    const state = await loadAllAppState();
    const next = selectNextQuestion({
      profile: state.profile || DEFAULT_PROFILE,
      progress: state.progress || DEFAULT_PROGRESS,
      lastQuestionType: currentQuestion?.type,
      excludeId: currentQuestion?.id,
    });

    setCurrentQuestion(next.question);
  };

  // Perform Unlock
  const unlockSite = async () => {
    setIsUnlocked(true);
    sound.playUnlock();
    fireCelebrationConfetti();

    const siteObj = settings.sites.find((s) => s.domain === siteDomain) || { id: siteDomain };
    const minutes = settings.unlockMinutes || 10;
    setRemainingUnlockSeconds(minutes * 60);

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'UNLOCK_SITE',
        siteId: siteObj.id,
        minutes: minutes,
      });
    }

    // Start local countdown
    const interval = setInterval(() => {
      setRemainingUnlockSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Close tab ("Not now")
  const handleCloseTab = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.getCurrent((tab) => {
        if (tab && tab.id) chrome.tabs.remove(tab.id);
        else window.close();
      });
    } else {
      window.close();
    }
  };

  // Toggle sounds
  const handleToggleSound = () => {
    const nextVal = !settings.sounds;
    sound.enabled = nextVal;
    setSettings((prev) => ({ ...prev, sounds: nextVal }));
  };

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono text-muted tracking-wider">PREPARING QUESTION...</span>
        </div>
      </div>
    );
  }

  // Difficulty dots representation
  const renderDifficultyDots = (diff: string) => {
    const total = 3;
    const filled = diff === 'easy' ? 1 : diff === 'medium' ? 2 : 3;
    return (
      <div className="flex items-center gap-1" title={`Difficulty: ${diff}`}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < filled
                ? diff === 'hard'
                  ? 'bg-accent-red'
                  : diff === 'medium'
                  ? 'bg-accent-amber'
                  : 'bg-accent-green'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-background text-text overflow-hidden">
      {/* Ambient background blobs */}
      <div className="ambient-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* SVG noise texture */}
      <div className="noise-overlay" />

      {/* Top Floating Controls */}
      <div className="fixed top-5 right-5 z-20 flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleSound}
          className="p-2.5 rounded-full bg-surface-2/80 hover:bg-surface-3 border border-border backdrop-blur text-muted hover:text-white transition-all cursor-pointer"
          title={settings.sounds ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {settings.sounds ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-accent-red" />}
        </button>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[720px] transition-all duration-300">
        {!isUnlocked ? (
          /* QUIZ CARD */
          <div className="w-full bg-surface/90 backdrop-blur-xl border border-white/10 rounded-card p-6 sm:p-8 shadow-2xl">
            {/* Top Row: Lock Status & Streak Flame */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-white/5 border border-white/10">
                <Lock className="w-3.5 h-3.5 text-accent-amber" />
                <span className="text-xs font-semibold text-text/90 tracking-wide font-mono">
                  {siteDomain} is locked
                </span>
              </div>
              <StreakFlame count={streak.current} />
            </div>

            {/* Meta Row: Topic, Difficulty, Progress */}
            <div className="flex items-center justify-between mt-4 mb-5 text-xs">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-pill bg-accent-purple/15 text-accent-purple font-mono uppercase font-bold tracking-wider border border-accent-purple/30">
                  {currentQuestion.topic}
                </span>
                <div className="flex items-center gap-1.5 text-muted">
                  <span className="capitalize">{currentQuestion.difficulty}</span>
                  {renderDifficultyDots(currentQuestion.difficulty)}
                </div>
              </div>

              <span className="font-mono text-muted font-medium bg-white/5 px-2.5 py-1 rounded-pill">
                Question {questionNumber} of {requiredQuestions}
              </span>
            </div>

            {/* Question Prompt */}
            <h2 className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-text leading-snug mb-3">
              {currentQuestion.prompt}
            </h2>

            {/* Code Panel if code question */}
            {currentQuestion.code && (
              <CodePanel code={currentQuestion.code} language={currentQuestion.language || 'cpp'} />
            )}

            {/* Visual MCQ Diagram */}
            {currentQuestion.type === 'visual_mcq' && currentQuestion.diagram && (
              <VisualDiagram diagram={currentQuestion.diagram} />
            )}

            {/* Hotspot Interactive Diagram */}
            {currentQuestion.type === 'hotspot' && (
              <HotspotDiagram
                questionId={currentQuestion.id}
                selectedHotspot={selectedAnswer as string | null}
                correctHotspot={isEvaluated ? (currentQuestion.answer as string) : null}
                isEvaluated={isEvaluated}
                onSelectHotspot={(hotspotId) => {
                  if (isEvaluated) return;
                  setSelectedAnswer(hotspotId);
                  sound.playSelect();
                }}
              />
            )}

            {/* Multiple Choice Options (2x2 grid) */}
            {currentQuestion.options && currentQuestion.options.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {currentQuestion.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  let state: 'idle' | 'selected' | 'correct' | 'wrong' | 'revealed' = 'idle';

                  if (isEvaluated) {
                    if (idx === Number(currentQuestion.answer)) {
                      state = 'correct';
                    } else if (idx === selectedAnswer) {
                      state = 'wrong';
                    }
                  } else if (selectedAnswer === idx) {
                    state = 'selected';
                  }

                  return (
                    <OptionTile
                      key={idx}
                      index={idx}
                      label={letter}
                      text={opt}
                      selected={selectedAnswer === idx}
                      disabled={isEvaluated}
                      state={state}
                      onClick={() => {
                        if (isEvaluated) return;
                        setSelectedAnswer(idx);
                        sound.playSelect();
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Action Bar: Check Button or Explanation */}
            {!isEvaluated ? (
              <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  disabled={selectedAnswer === null}
                  onClick={handleSubmitAnswer}
                  className={`w-full py-4 rounded-btn font-extrabold text-base tracking-wide text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                    selectedAnswer !== null
                      ? 'bg-accent-gradient shadow-[0_0_35px_rgba(124,92,255,0.4)] hover:opacity-95 active:scale-[0.99]'
                      : 'bg-surface-2 text-muted border border-white/5 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span>Check Answer</span>
                  {selectedAnswer !== null && (
                    <kbd className="hidden sm:inline-block ml-1 px-2 py-0.5 text-xs bg-black/25 rounded font-mono text-white/80">
                      Enter ↵
                    </kbd>
                  )}
                </button>

                {!settings.strict && (
                  <button
                    type="button"
                    onClick={handleCloseTab}
                    className="w-full sm:w-auto px-5 py-4 rounded-btn text-muted hover:text-text hover:bg-white/5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <X className="w-4 h-4" />
                    <span>Not now</span>
                  </button>
                )}
              </div>
            ) : (
              <ExplanationSheet
                isCorrect={evaluation?.isCorrect || false}
                explanation={evaluation?.explanation || ''}
                isLastQuestion={questionNumber >= requiredQuestions}
                onNext={handleNext}
              />
            )}
          </div>
        ) : (
          /* UNLOCKED SUCCESS CARD */
          <div className="w-full bg-surface/90 backdrop-blur-xl border border-accent-green/30 rounded-card p-8 sm:p-12 text-center shadow-[0_0_60px_rgba(61,220,151,0.2)] animate-in zoom-in-95 duration-400">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-accent-green/10 text-accent-green border border-accent-green/30 text-xs font-bold font-mono uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" />
              Scroll Earned!
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight mb-2">
              Unlocked for {settings.unlockMinutes}:00
            </h1>
            <p className="text-muted text-sm sm:text-base max-w-md mx-auto mb-8">
              Great algorithmic intuition. {siteDomain} is now open until the timer ends.
            </p>

            {/* Animated Timer Ring */}
            <div className="flex justify-center mb-8">
              <TimerRing
                totalSeconds={(settings.unlockMinutes || 10) * 60}
                remainingSeconds={remainingUnlockSeconds}
                size={160}
                strokeWidth={10}
              />
            </div>

            {/* Launch Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <a
                href={targetUrl}
                className="w-full py-4 px-8 rounded-btn font-extrabold text-base text-white bg-accent-gradient hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_0_40px_rgba(124,92,255,0.4)] flex items-center justify-center gap-2 cursor-pointer no-underline"
              >
                <span>Take me to {siteDomain}</span>
                <ArrowUpRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
