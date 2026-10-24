import React, { useState, useEffect } from 'react';
import {
  loadAllAppState,
  setStorage,
  Settings,
  Streak,
  Unlocks,
  DEFAULT_SETTINGS,
  DEFAULT_STREAK,
} from '../../lib/storage';
import { StreakFlame } from '../../components/StreakFlame';
import { TimerRing } from '../../components/TimerRing';
import { sound } from '../../lib/SoundEffects';
import {
  Flame,
  Power,
  Sliders,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Lock,
} from 'lucide-react';

export const PopupApp: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [streak, setStreak] = useState<Streak>(DEFAULT_STREAK);
  const [unlocks, setUnlocks] = useState<Unlocks>({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  const getLocalToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todaySolved = streak.history[getLocalToday()] || 0;

  useEffect(() => {
    async function load() {
      const state = await loadAllAppState();
      setSettings(state.settings);
      setStreak(state.streak);
      setUnlocks(state.unlocks);
    }
    load();

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMaster = async () => {
    sound.playSelect();
    const updated = !settings.enabled;
    const newSettings = { ...settings, enabled: updated };
    setSettings(newSettings);
    await setStorage('settings', newSettings);

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'SYNC_RULES' });
    }
  };

  const handleLockNow = async (siteId: string) => {
    sound.playSelect();
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'LOCK_SITE_NOW', siteId }, () => {
        const next = { ...unlocks };
        delete next[siteId];
        setUnlocks(next);
      });
    } else {
      const next = { ...unlocks };
      delete next[siteId];
      setUnlocks(next);
      setStorage('unlocks', next);
    }
  };

  const openDashboard = () => {
    sound.playSelect();
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('dashboard.html', '_blank');
    }
  };

  // Filter active unlocks
  const activeUnlockList = Object.entries(unlocks)
    .filter(([_, expiry]) => expiry > currentTime)
    .map(([siteId, expiry]) => {
      const site = settings.sites.find((s) => s.id === siteId) || {
        id: siteId,
        name: siteId,
        domain: siteId,
      };
      const remainingSeconds = Math.max(0, Math.floor((expiry - currentTime) / 1000));
      return { site, remainingSeconds, expiry };
    });

  return (
    <div className="w-[380px] min-h-[520px] p-5 bg-background text-text flex flex-col justify-between select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-gradient flex items-center justify-center shadow-glow">
              <Flame className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white leading-none">Solve-to-Scroll</h1>
              <span className="text-[10px] font-mono text-muted">Earn your scroll</span>
            </div>
          </div>

          <StreakFlame count={streak.current} />
        </div>

        {/* Master Protection Toggle Card */}
        <div className="mt-4 p-4 rounded-2xl bg-surface border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                settings.enabled
                  ? 'bg-accent-green/20 text-accent-green border border-accent-green/30'
                  : 'bg-white/5 text-muted border border-white/10'
              }`}
            >
              {settings.enabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {settings.enabled ? 'Blocking Active' : 'Blocking Paused'}
              </div>
              <div className="text-xs text-muted">
                {settings.enabled ? 'Sites locked until solved' : 'All websites open'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleMaster}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${
              settings.enabled ? 'bg-accent-purple' : 'bg-white/10'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                settings.enabled ? 'left-[26px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Daily Solved Stats */}
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          <div className="p-3.5 rounded-xl bg-surface-2 border border-white/5 text-center">
            <span className="text-[11px] font-mono text-muted uppercase block mb-0.5">Today's Solved</span>
            <span className="text-2xl font-extrabold text-white">{todaySolved}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2 border border-white/5 text-center">
            <span className="text-[11px] font-mono text-muted uppercase block mb-0.5">Best Streak</span>
            <span className="text-2xl font-extrabold text-accent-amber">{streak.best}d</span>
          </div>
        </div>

        {/* Active Unlocks Section */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent-purple" />
              Active Unlocks ({activeUnlockList.length})
            </span>
          </div>

          {activeUnlockList.length === 0 ? (
            <div className="p-4 rounded-xl bg-surface/50 border border-white/5 text-center">
              <Lock className="w-5 h-5 text-muted/60 mx-auto mb-1" />
              <p className="text-xs text-muted">All tracked sites are currently locked.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeUnlockList.map(({ site, remainingSeconds }) => (
                <div
                  key={site.id}
                  className="p-3 rounded-xl bg-surface border border-accent-green/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                    <span className="text-xs font-bold text-white">{site.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-accent-green">
                      {Math.floor(remainingSeconds / 60)}:
                      {String(remainingSeconds % 60).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLockNow(site.id)}
                      className="text-[10px] font-semibold text-muted hover:text-accent-red underline cursor-pointer"
                    >
                      Lock now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Dashboard Launcher */}
      <div className="pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={openDashboard}
          className="w-full py-3 rounded-btn bg-surface-2 hover:bg-surface-3 border border-white/10 font-bold text-xs text-text hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Sliders className="w-4 h-4 text-accent-purple" />
          <span>Open Dashboard & Settings</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted ml-auto" />
        </button>
      </div>
    </div>
  );
};
