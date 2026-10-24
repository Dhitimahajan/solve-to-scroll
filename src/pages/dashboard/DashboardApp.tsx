import React, { useState, useEffect, useMemo } from 'react';
import {
  loadAllAppState,
  setStorage,
  Settings,
  Profile,
  Progress,
  Streak,
  Level,
  DEFAULT_SETTINGS,
  DEFAULT_PROFILE,
  DEFAULT_PROGRESS,
  DEFAULT_STREAK,
} from '../../lib/storage';
import { Site, cleanDomain, requestSitePermission } from '../../lib/sites';
import { generateShareCard } from '../../lib/shareCard';
import { StreakFlame } from '../../components/StreakFlame';
import { LevelCard } from '../../components/LevelCard';
import { sound } from '../../lib/SoundEffects';
import {
  Flame,
  Award,
  Target,
  BarChart3,
  Calendar,
  AlertTriangle,
  Settings as SettingsIcon,
  Download,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Shield,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export const DashboardApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'settings'>('analytics');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);
  const [streak, setStreak] = useState<Streak>(DEFAULT_STREAK);
  const [customDomain, setCustomDomain] = useState('');
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      const state = await loadAllAppState();
      setSettings(state.settings);
      setProfile(state.profile);
      setProgress(state.progress);
      setStreak(state.streak);
    }
    load();
  }, []);

  // Aggregated analytics
  const totalQuestions = useMemo(() => {
    return Object.values(progress.perTopic).reduce((sum, t) => sum + t.answered, 0);
  }, [progress]);

  const totalCorrect = useMemo(() => {
    return Object.values(progress.perTopic).reduce((sum, t) => sum + t.correct, 0);
  }, [progress]);

  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 100;

  // Identify weak spots (topics with accuracy < 70% or lowest accuracy)
  const topicStats = useMemo(() => {
    const list = Object.entries(progress.perTopic).map(([topic, stat]) => {
      const acc = stat.answered > 0 ? Math.round((stat.correct / stat.answered) * 100) : 0;
      return { topic, answered: stat.answered, correct: stat.correct, accuracy: acc, difficulty: stat.difficulty };
    });
    return list;
  }, [progress]);

  const weakSpots = useMemo(() => {
    return topicStats.filter((t) => t.answered > 0 && t.accuracy < 75).sort((a, b) => a.accuracy - b.accuracy);
  }, [topicStats]);

  const topTopic = useMemo(() => {
    if (topicStats.length === 0) return 'General DSA';
    const sorted = [...topicStats].sort((a, b) => b.correct - a.correct);
    return sorted[0].topic;
  }, [topicStats]);

  // Generate GitHub-style heatmap (last 16 weeks / 112 days)
  const heatmapDays = useMemo(() => {
    const days: { dateStr: string; count: number; dayOfWeek: number }[] = [];
    const today = new Date();

    for (let i = 111; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        dateStr: str,
        count: streak.history[str] || 0,
        dayOfWeek: d.getDay(),
      });
    }
    return days;
  }, [streak]);

  // Generate share card
  const handleGenerateShareCard = () => {
    sound.playSelect();
    const url = generateShareCard({
      streak: streak.current,
      totalSolved: totalQuestions,
      accuracy: overallAccuracy,
      topTopic: topTopic,
      level: profile.level,
    });
    setShareCardUrl(url);
  };

  // Settings handlers
  const handleToggleSite = async (siteId: string) => {
    sound.playSelect();
    const site = settings.sites.find((s) => s.id === siteId);
    if (!site) return;

    if (!site.enabled) {
      await requestSitePermission(site.domain);
    }

    const updatedSites = settings.sites.map((s) => (s.id === siteId ? { ...s, enabled: !s.enabled } : s));
    const nextSettings = { ...settings, sites: updatedSites };
    setSettings(nextSettings);
    await setStorage('settings', nextSettings);

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'SYNC_RULES' });
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
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

    const nextSites = [...settings.sites, newSite];
    const nextSettings = { ...settings, sites: nextSites };
    setSettings(nextSettings);
    setCustomDomain('');
    await setStorage('settings', nextSettings);

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'SYNC_RULES' });
    }
    sound.playSelect();
  };

  const handleDeleteSite = async (siteId: string) => {
    sound.playSelect();
    const nextSites = settings.sites.filter((s) => s.id !== siteId);
    const nextSettings = { ...settings, sites: nextSites };
    setSettings(nextSettings);
    await setStorage('settings', nextSettings);

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'SYNC_RULES' });
    }
  };

  const handleSaveProfileLevel = async (lvl: Level) => {
    sound.playSelect();
    const nextProfile = { ...profile, level: lvl };
    setProfile(nextProfile);
    await setStorage('profile', nextProfile);
  };

  const handleToggleSound = async () => {
    sound.playSelect();
    const nextVal = !settings.sounds;
    sound.enabled = nextVal;
    const nextSettings = { ...settings, sounds: nextVal };
    setSettings(nextSettings);
    await setStorage('settings', nextSettings);
  };

  const handleToggleStrict = async () => {
    sound.playSelect();
    const nextVal = !settings.strict;
    const nextSettings = { ...settings, strict: nextVal };
    setSettings(nextSettings);
    await setStorage('settings', nextSettings);
  };

  const handleResetAllData = async () => {
    sound.playSelect();
    await Promise.all([
      setStorage('settings', DEFAULT_SETTINGS),
      setStorage('profile', DEFAULT_PROFILE),
      setStorage('progress', DEFAULT_PROGRESS),
      setStorage('streak', DEFAULT_STREAK),
      setStorage('unlocks', {}),
    ]);
    window.location.reload();
  };

  return (
    <div className="min-h-screen relative bg-background text-text selection:bg-accent-purple/30 pb-20">
      {/* Ambient background */}
      <div className="ambient-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="noise-overlay" />

      {/* Main Wrapper */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-gradient flex items-center justify-center shadow-glow">
              <Flame className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Solve-to-Scroll</h1>
              <span className="text-xs font-mono text-muted">Daily DSA Mastery Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StreakFlame count={streak.current} />
            <div className="flex p-1 rounded-pill bg-surface border border-white/10">
              <button
                type="button"
                onClick={() => {
                  sound.playSelect();
                  setActiveTab('analytics');
                }}
                className={`px-4 py-1.5 rounded-pill text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'analytics' ? 'bg-accent-purple text-white shadow-sm' : 'text-muted hover:text-white'
                }`}
              >
                Analytics
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playSelect();
                  setActiveTab('settings');
                }}
                className={`px-4 py-1.5 rounded-pill text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'settings' ? 'bg-accent-purple text-white shadow-sm' : 'text-muted hover:text-white'
                }`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 4 Stat Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-surface/90 border border-white/10 backdrop-blur shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted uppercase">Day Streak</span>
                  <Flame className="w-4 h-4 text-accent-amber" />
                </div>
                <div className="text-3xl font-extrabold text-white">{streak.current}</div>
                <span className="text-[11px] text-muted">Personal best: {streak.best} days</span>
              </div>

              <div className="p-5 rounded-2xl bg-surface/90 border border-white/10 backdrop-blur shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted uppercase">Total Solved</span>
                  <Award className="w-4 h-4 text-accent-purple" />
                </div>
                <div className="text-3xl font-extrabold text-white">{totalQuestions}</div>
                <span className="text-[11px] text-muted">{totalCorrect} correct answers</span>
              </div>

              <div className="p-5 rounded-2xl bg-surface/90 border border-white/10 backdrop-blur shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted uppercase">Accuracy</span>
                  <Target className="w-4 h-4 text-accent-green" />
                </div>
                <div className="text-3xl font-extrabold text-accent-green">{overallAccuracy}%</div>
                <span className="text-[11px] text-muted">Across all attempts</span>
              </div>

              <div className="p-5 rounded-2xl bg-surface/90 border border-white/10 backdrop-blur shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted uppercase">Adaptive Level</span>
                  <BarChart3 className="w-4 h-4 text-accent-pink" />
                </div>
                <div className="text-3xl font-extrabold text-white capitalize">{profile.level}</div>
                <span className="text-[11px] text-muted">{profile.topics.length} active topics</span>
              </div>
            </div>

            {/* Streak Activity Heatmap */}
            <div className="p-6 rounded-card bg-surface/90 border border-white/10 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent-amber" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Activity Heatmap (16 Weeks)
                  </h3>
                </div>
                <span className="text-xs text-muted">Consistent daily practice earns scroll</span>
              </div>

              {/* Heatmap Grid */}
              <div className="overflow-x-auto pb-2">
                <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5">
                  {heatmapDays.map((day, idx) => {
                    let bg = 'bg-white/5';
                    if (day.count >= 6) bg = 'bg-accent-green shadow-[0_0_8px_rgba(61,220,151,0.6)]';
                    else if (day.count >= 3) bg = 'bg-accent-green/80';
                    else if (day.count >= 1) bg = 'bg-accent-green/40';

                    return (
                      <div
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 ${bg}`}
                        title={`${day.dateStr}: ${day.count} solved`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Topic Mastery & Weak Spots Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Topic Mastery Bars */}
              <div className="p-6 rounded-card bg-surface/90 border border-white/10 backdrop-blur">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent-purple" />
                  Topic Mastery
                </h3>

                {topicStats.length === 0 ? (
                  <p className="text-xs text-muted py-6 text-center">Solve questions to populate mastery metrics.</p>
                ) : (
                  <div className="space-y-4">
                    {topicStats.map((t) => (
                      <div key={t.topic} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-text uppercase font-mono">{t.topic}</span>
                          <span className="text-muted">
                            {t.accuracy}% ({t.correct}/{t.answered}) • Diff: {t.difficulty}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent-gradient transition-all duration-500"
                            style={{ width: `${t.accuracy}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weak Spots & Share Card Trigger */}
              <div className="space-y-6">
                {/* Weak spots card */}
                <div className="p-6 rounded-card bg-surface/90 border border-white/10 backdrop-blur">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-accent-amber" />
                    Target Weak Spots
                  </h3>

                  {weakSpots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-accent-green/10 border border-accent-green/20 text-center">
                      <CheckCircle2 className="w-6 h-6 text-accent-green mx-auto mb-1" />
                      <p className="text-xs text-accent-green font-semibold">No critical weak spots detected!</p>
                      <p className="text-[11px] text-muted mt-0.5">Keep answering to challenge higher difficulties.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {weakSpots.map((ws) => (
                        <div
                          key={ws.topic}
                          className="p-3.5 rounded-xl bg-surface-2 border border-accent-amber/20 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs font-bold text-white uppercase font-mono block">{ws.topic}</span>
                            <span className="text-[11px] text-accent-amber">{ws.accuracy}% accuracy</span>
                          </div>
                          <span className="text-xs font-mono text-muted bg-white/5 px-2 py-1 rounded">
                            Diff: {ws.difficulty}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Share Card Generator */}
                <div className="p-6 rounded-card bg-gradient-to-br from-surface to-surface-2 border border-accent-purple/30 backdrop-blur text-center">
                  <Sparkles className="w-6 h-6 text-accent-purple mx-auto mb-2" />
                  <h3 className="text-base font-bold text-white mb-1">Generate Social Share Card</h3>
                  <p className="text-xs text-muted max-w-xs mx-auto mb-4">
                    Render a high-resolution PNG showing your streak and DSA mastery.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateShareCard}
                    className="px-6 py-2.5 rounded-btn font-bold text-xs text-white bg-accent-gradient hover:opacity-95 shadow-glow inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Create Share Image</span>
                  </button>

                  {shareCardUrl && (
                    <div className="mt-4 pt-4 border-t border-white/5 animate-in zoom-in-95">
                      <img
                        src={shareCardUrl}
                        alt="Share Card Preview"
                        className="w-full rounded-xl border border-white/10 shadow-lg mb-3"
                      />
                      <a
                        href={shareCardUrl}
                        download={`solve-to-scroll-streak-${streak.current}d.png`}
                        className="px-4 py-2 rounded-btn bg-accent-green text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer no-underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PNG</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
            {/* Manage Blocked Sites */}
            <div className="p-6 rounded-card bg-surface/90 border border-white/10 backdrop-blur">
              <h3 className="text-base font-bold text-white mb-1">Blocked Websites</h3>
              <p className="text-xs text-muted mb-4">Sites that require DSA concept unlocks.</p>

              {/* Site List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {settings.sites.map((site) => (
                  <div
                    key={site.id}
                    className="p-3.5 rounded-xl bg-surface-2 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleSite(site.id)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer outline-none ${
                          site.enabled ? 'bg-accent-purple' : 'bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                            site.enabled ? 'left-[18px]' : 'left-0.5'
                          }`}
                        />
                      </button>
                      <div>
                        <span className="text-xs font-bold text-white block">{site.name}</span>
                        <span className="text-[10px] text-muted font-mono">{site.domain}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSite(site.id)}
                      className="p-1.5 text-muted hover:text-accent-red transition-colors cursor-pointer"
                      title="Remove site"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Site Form */}
              <form onSubmit={handleAddSite} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom domain (e.g. twitter.com, reddit.com)"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-btn bg-surface-2 border border-white/10 text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent-purple"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-btn bg-accent-purple hover:bg-accent-purple/90 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Site</span>
                </button>
              </form>
            </div>

            {/* Unlock Rules */}
            <div className="p-6 rounded-card bg-surface/90 border border-white/10 backdrop-blur">
              <h3 className="text-base font-bold text-white mb-4">Unlock Rules & Timers</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-muted flex items-center justify-between mb-2">
                    <span>Unlock Duration:</span>
                    <span className="text-white font-mono font-bold">{settings.unlockMinutes} minutes</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={settings.unlockMinutes}
                    onChange={async (e) => {
                      const next = { ...settings, unlockMinutes: Number(e.target.value) };
                      setSettings(next);
                      await setStorage('settings', next);
                    }}
                    className="w-full accent-accent-purple cursor-pointer"
                  />
                  <span className="text-[11px] text-muted mt-1 block">After this time, the site re-locks automatically.</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted flex items-center justify-between mb-2">
                    <span>Questions per unlock:</span>
                    <span className="text-white font-mono font-bold">{settings.questionsPerUnlock} questions</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={settings.questionsPerUnlock}
                    onChange={async (e) => {
                      const next = { ...settings, questionsPerUnlock: Number(e.target.value) };
                      setSettings(next);
                      await setStorage('settings', next);
                    }}
                    className="w-full accent-accent-purple cursor-pointer"
                  />
                  <span className="text-[11px] text-muted mt-1 block">Number of correct answers required to unlock.</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2 border border-white/5">
                  <div>
                    <span className="text-xs font-bold text-white block">Sound Effects</span>
                    <span className="text-[11px] text-muted">Tactile audio feedback on answers</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer outline-none ${
                      settings.sounds ? 'bg-accent-purple' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                        settings.sounds ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2 border border-white/5">
                  <div>
                    <span className="text-xs font-bold text-white block">Strict Mode</span>
                    <span className="text-[11px] text-muted">Disables the 'Not now' skip button</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleStrict}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer outline-none ${
                      settings.strict ? 'bg-accent-purple' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                        settings.strict ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Level */}
            <div className="p-6 rounded-card bg-surface/90 border border-white/10 backdrop-blur">
              <h3 className="text-base font-bold text-white mb-2">DSA Profile Level</h3>
              <p className="text-xs text-muted mb-4">Set your starting baseline difficulty mix.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['beginner', 'intermediate', 'expert'] as Level[]).map((lvl) => (
                  <LevelCard
                    key={lvl}
                    level={lvl}
                    selected={profile.level === lvl}
                    onSelect={() => handleSaveProfileLevel(lvl)}
                  />
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 rounded-card bg-accent-red/5 border border-accent-red/20 backdrop-blur">
              <h3 className="text-sm font-bold text-accent-red mb-1">Reset Extension Data</h3>
              <p className="text-xs text-muted mb-4">
                Clears all question progress, streak records, and restores factory defaults.
              </p>
              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 rounded-btn bg-accent-red/10 border border-accent-red/30 hover:bg-accent-red text-accent-red hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Reset All Data
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetAllData}
                    className="px-4 py-2 rounded-btn bg-accent-red text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="text-xs text-muted hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
