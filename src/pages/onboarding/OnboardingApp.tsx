import React, { useState } from 'react';
import {
  Topic,
  Level,
  DEFAULT_SETTINGS,
  DEFAULT_PROFILE,
  setStorage,
  getStorage,
  Settings,
  Profile,
} from '../../lib/storage';
import { PRESET_SITES, Site, cleanDomain, requestSitePermission } from '../../lib/sites';
import { LevelCard } from '../../components/LevelCard';
import { fireCelebrationConfetti } from '../../components/Confetti';
import { sound } from '../../lib/SoundEffects';
import {
  Sparkles,
  ArrowRight,
  Check,
  Plus,
  Shield,
  Layers,
  Flame,
  Globe,
  Sliders,
  HelpCircle,
} from 'lucide-react';

const TOPIC_LIST: { id: Topic; name: string }[] = [
  { id: 'arrays', name: 'Arrays' },
  { id: 'linked-list', name: 'Linked Lists' },
  { id: 'stacks-queues', name: 'Stacks & Queues' },
  { id: 'trees', name: 'Trees' },
  { id: 'graphs', name: 'Graphs' },
  { id: 'sorting', name: 'Sorting' },
  { id: 'big-o', name: 'Big-O Analysis' },
];

export const OnboardingApp: React.FC = () => {
  const [step, setStep] = useState<number>(1);

  // User selections
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([
    'arrays',
    'linked-list',
    'trees',
    'big-o',
  ]);
  const [selectedLevel, setSelectedLevel] = useState<Level>('beginner');
  const [sites, setSites] = useState<Site[]>(PRESET_SITES);
  const [customDomain, setCustomDomain] = useState<string>('');
  const [unlockMinutes, setUnlockMinutes] = useState<number>(10);
  const [questionsPerUnlock, setQuestionsPerUnlock] = useState<number>(2);

  // Mini placement check
  const [showPlacementCheck, setShowPlacementCheck] = useState(false);
  const [placementStep, setPlacementStep] = useState(0);
  const [placementScore, setPlacementScore] = useState(0);

  const PLACEMENT_QUESTIONS = [
    {
      prompt: 'What is the time complexity to find an element in an unsorted array of length n?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      answer: 2,
    },
    {
      prompt: 'Which data structure is naturally used to implement recursion and call stacks?',
      options: ['Queue', 'Stack', 'Heap', 'Graph'],
      answer: 1,
    },
    {
      prompt: 'In a Binary Search Tree (BST), where are keys smaller than the root located?',
      options: ['Left subtree', 'Right subtree', 'At any leaf', 'In the parent node'],
      answer: 0,
    },
  ];

  const handleToggleTopic = (t: Topic) => {
    sound.playSelect();
    if (selectedTopics.includes(t)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((item) => item !== t));
      }
    } else {
      setSelectedTopics([...selectedTopics, t]);
    }
  };

  const handleToggleSite = async (siteId: string) => {
    sound.playSelect();
    const site = sites.find((s) => s.id === siteId);
    if (!site) return;

    if (!site.enabled) {
      // Request permission
      await requestSitePermission(site.domain);
    }

    setSites(
      sites.map((s) => (s.id === siteId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleAddCustomSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomain.trim()) return;
    const dom = cleanDomain(customDomain);
    if (!dom) return;

    await requestSitePermission(dom);
    const newSite: Site = {
      id: dom.replace(/[^a-z0-9]/g, '_'),
      domain: dom,
      name: dom,
      icon: 'globe',
      enabled: true,
    };

    setSites([...sites, newSite]);
    setCustomDomain('');
    sound.playSelect();
  };

  const handlePlacementAnswer = (optIdx: number) => {
    const q = PLACEMENT_QUESTIONS[placementStep];
    const isCorrect = optIdx === q.answer;
    if (isCorrect) {
      sound.playCorrect();
      setPlacementScore((prev) => prev + 1);
    } else {
      sound.playError();
    }

    if (placementStep < PLACEMENT_QUESTIONS.length - 1) {
      setPlacementStep((prev) => prev + 1);
    } else {
      // Finished placement
      const finalScore = isCorrect ? placementScore + 1 : placementScore;
      if (finalScore >= 3) {
        setSelectedLevel('intermediate');
      } else if (finalScore <= 1) {
        setSelectedLevel('beginner');
      }
      setShowPlacementCheck(false);
    }
  };

  const handleFinish = async () => {
    sound.playUnlock();
    fireCelebrationConfetti();

    const newSettings: Settings = {
      ...DEFAULT_SETTINGS,
      sites,
      unlockMinutes,
      questionsPerUnlock,
    };

    const newProfile: Profile = {
      level: selectedLevel,
      topics: selectedTopics,
      onboarded: true,
    };

    await Promise.all([
      setStorage('settings', newSettings),
      setStorage('profile', newProfile),
    ]);

    // Notify service worker to update rules
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'SYNC_RULES' });
    }

    setTimeout(() => {
      // Open dashboard or close onboarding
      window.location.href = 'dashboard.html';
    }, 1200);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-background text-text overflow-hidden">
      {/* Ambient background */}
      <div className="ambient-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="noise-overlay" />

      <div className="relative z-10 w-full max-w-[700px] bg-surface/90 backdrop-blur-xl border border-white/10 rounded-card p-6 sm:p-10 shadow-2xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-gradient flex items-center justify-center shadow-glow">
              <Flame className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">Solve-to-Scroll</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className={`w-7 h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'bg-accent-gradient w-10' : s < step ? 'bg-accent-purple/50' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="text-center py-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-accent-purple/40 shadow-glow flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-accent-purple" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Earn your scroll.
            </h1>
            <p className="text-muted text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-8">
              Transform impulsive doomscrolling into daily algorithmic mastery. Answer short DSA concept questions to unlock your favorite websites.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
              <div className="p-4 rounded-xl bg-surface-2 border border-white/5">
                <Shield className="w-5 h-5 text-accent-green mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">100% Offline</h4>
                <p className="text-xs text-muted">No accounts, no cloud sync, zero tracking.</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-2 border border-white/5">
                <Layers className="w-5 h-5 text-accent-pink mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Adaptive DSA</h4>
                <p className="text-xs text-muted">Difficulty tunes automatically as you answer.</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-2 border border-white/5">
                <Flame className="w-5 h-5 text-accent-amber mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Daily Streaks</h4>
                <p className="text-xs text-muted">Build consistent discipline you are proud of.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playSelect();
                setStep(2);
              }}
              className="w-full py-4 rounded-btn font-extrabold text-base text-white bg-accent-gradient hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_0_35px_rgba(124,92,255,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 2: TOPICS */}
        {step === 2 && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-extrabold text-white mb-2">Pick your focus topics</h2>
            <p className="text-sm text-muted mb-6">
              Choose the data structures and algorithmic patterns you want to practice.
            </p>

            <div className="flex flex-wrap gap-2.5 mb-8">
              {TOPIC_LIST.map((topic) => {
                const isSelected = selectedTopics.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleToggleTopic(topic.id)}
                    className={`px-4 py-2.5 rounded-pill text-sm font-semibold border transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-accent-purple/20 border-accent-purple text-white shadow-[0_0_15px_rgba(124,92,255,0.25)]'
                        : 'bg-surface-2 border-white/10 text-muted hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{topic.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-accent-green" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-muted hover:text-white font-medium cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playSelect();
                  setStep(3);
                }}
                className="px-6 py-3 rounded-btn font-bold text-sm text-white bg-accent-gradient hover:opacity-95 shadow-glow flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LEVEL & PLACEMENT */}
        {step === 3 && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-extrabold text-white">Choose your starting level</h2>
              {!showPlacementCheck && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playSelect();
                    setShowPlacementCheck(true);
                    setPlacementStep(0);
                    setPlacementScore(0);
                  }}
                  className="text-xs font-semibold text-accent-amber hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Take 3-question placement</span>
                </button>
              )}
            </div>
            <p className="text-sm text-muted mb-6">
              Difficulty adapts as you answer. Level sets your starting mix and upper threshold.
            </p>

            {showPlacementCheck ? (
              <div className="p-6 rounded-2xl bg-surface-2 border border-accent-purple/40 mb-6">
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-muted">
                  <span>PLACEMENT CHECK</span>
                  <span>Question {placementStep + 1} of 3</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">
                  {PLACEMENT_QUESTIONS[placementStep].prompt}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PLACEMENT_QUESTIONS[placementStep].options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePlacementAnswer(i)}
                      className="p-3 text-left rounded-xl bg-surface border border-white/10 hover:border-accent-purple text-sm text-text font-medium cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {(['beginner', 'intermediate', 'expert'] as Level[]).map((lvl) => (
                  <LevelCard
                    key={lvl}
                    level={lvl}
                    selected={selectedLevel === lvl}
                    onSelect={() => {
                      sound.playSelect();
                      setSelectedLevel(lvl);
                    }}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm text-muted hover:text-white font-medium cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playSelect();
                  setStep(4);
                }}
                className="px-6 py-3 rounded-btn font-bold text-sm text-white bg-accent-gradient hover:opacity-95 shadow-glow flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SITES & RULES */}
        {step === 4 && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-extrabold text-white mb-2">Block sites & unlock rules</h2>
            <p className="text-sm text-muted mb-6">
              Pick which sites to block and configure how long unlocks last.
            </p>

            {/* Site Toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
              {sites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => handleToggleSite(site.id)}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    site.enabled
                      ? 'bg-accent-purple/20 border-accent-purple text-white shadow-[0_0_15px_rgba(124,92,255,0.2)]'
                      : 'bg-surface-2 border-white/10 text-muted opacity-60 hover:opacity-100'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>{site.name}</span>
                </button>
              ))}
            </div>

            {/* Custom Domain Input */}
            <form onSubmit={handleAddCustomSite} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Add custom domain (e.g. news.ycombinator.com)"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-btn bg-surface-2 border border-white/10 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent-purple"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-btn bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>

            {/* Unlock Duration & Questions Slider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-2 border border-white/5 mb-8">
              <div>
                <label className="text-xs font-semibold text-muted flex items-center justify-between mb-2">
                  <span>Unlock Duration:</span>
                  <span className="text-white font-mono font-bold">{unlockMinutes} minutes</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={unlockMinutes}
                  onChange={(e) => setUnlockMinutes(Number(e.target.value))}
                  className="w-full accent-accent-purple cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted flex items-center justify-between mb-2">
                  <span>Questions per unlock:</span>
                  <span className="text-white font-mono font-bold">{questionsPerUnlock} questions</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="1"
                  value={questionsPerUnlock}
                  onChange={(e) => setQuestionsPerUnlock(Number(e.target.value))}
                  className="w-full accent-accent-purple cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-sm text-muted hover:text-white font-medium cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-8 py-3.5 rounded-btn font-extrabold text-sm text-white bg-accent-gradient hover:opacity-95 shadow-[0_0_30px_rgba(124,92,255,0.4)] flex items-center gap-2 cursor-pointer"
              >
                <span>Save & Start Scrolling Smart</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
