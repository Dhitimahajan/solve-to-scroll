import { getStorage, setStorage, loadAllAppState, Unlocks, Settings } from '../lib/storage';
import { Site } from '../lib/sites';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSiteRuleId(siteId: string): number {
  let hash = 0;
  for (let i = 0; i < siteId.length; i++) {
    hash = (hash << 5) - hash + siteId.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 8000) + 100;
}

async function reconcileAndSync() {
  const { settings, unlocks } = await loadAllAppState();
  const now = Date.now();
  const activeUnlocks: Unlocks = {};
  let unlocksChanged = false;

  // Clean expired unlocks
  for (const [siteId, expiry] of Object.entries(unlocks || {})) {
    if (expiry > now) {
      activeUnlocks[siteId] = expiry;
      // Ensure alarm exists
      if (typeof chrome !== 'undefined' && chrome.alarms) {
        chrome.alarms.get(`unlock_expiry_${siteId}`, (alarm) => {
          if (!alarm) {
            chrome.alarms.create(`unlock_expiry_${siteId}`, { when: expiry });
          }
        });
      }
    } else {
      unlocksChanged = true;
      // Expired: lock tabs currently on this site
      const site = settings.sites.find((s) => s.id === siteId);
      if (site) {
        lockOpenTabsForSite(site);
      }
    }
  }

  if (unlocksChanged) {
    await setStorage('unlocks', activeUnlocks);
  }

  // Update DeclarativeNetRequest dynamic rules
  await syncDNRRules(settings, activeUnlocks);
}

async function syncDNRRules(settings: Settings, activeUnlocks: Unlocks) {
  if (typeof chrome === 'undefined' || !chrome.declarativeNetRequest) {
    return;
  }

  const blockedHtmlUrl = chrome.runtime.getURL('blocked.html');
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map((r) => r.id);

  // If master toggle is off, remove all blocking rules
  if (!settings.enabled) {
    if (removeRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds,
        addRules: [],
      });
    }
    return;
  }

  const addRules: chrome.declarativeNetRequest.Rule[] = [];

  for (const site of settings.sites) {
    // Only block if site is enabled and not currently unlocked
    const isUnlocked = activeUnlocks[site.id] && activeUnlocks[site.id] > Date.now();
    if (site.enabled && !isUnlocked) {
      const ruleId = getSiteRuleId(site.id);
      const cleanDom = site.domain.replace(/^www\./, '');
      const regexFilter = `^https?:\\/\\/([a-zA-Z0-9-]+\\.)*${escapeRegex(cleanDom)}(\\/.*)?$`;

      addRules.push({
        id: ruleId,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            regexSubstitution: `${blockedHtmlUrl}?site=${encodeURIComponent(cleanDom)}&url=\\0`,
          },
        },
        condition: {
          regexFilter,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
      });
    }
  }

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules,
    });
    console.log(`[Solve-to-Scroll] Synced ${addRules.length} dynamic blocking rules.`);
  } catch (err) {
    console.error('[Solve-to-Scroll] Failed to update dynamic DNR rules:', err);
  }
}

function lockOpenTabsForSite(site: Site) {
  if (typeof chrome === 'undefined' || !chrome.tabs) return;

  const blockedHtmlUrl = chrome.runtime.getURL('blocked.html');
  const cleanDom = site.domain.replace(/^www\./, '');

  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.id && tab.url) {
        try {
          const tabUrl = new URL(tab.url);
          const tabHost = tabUrl.hostname.replace(/^www\./, '');
          if (tabHost === cleanDom || tabHost.endsWith('.' + cleanDom)) {
            // Redirect open tab to blocked page
            const dest = `${blockedHtmlUrl}?site=${encodeURIComponent(cleanDom)}&url=${encodeURIComponent(tab.url)}`;
            chrome.tabs.update(tab.id, { url: dest });
          }
        } catch {}
      }
    }
  });
}

// Lifecycle listeners
if (typeof chrome !== 'undefined') {
  chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('[Solve-to-Scroll] Extension installed / updated.');
    const { profile } = await loadAllAppState();
    await reconcileAndSync();

    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL && !profile.onboarded) {
      chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
    }
  });

  chrome.runtime.onStartup.addListener(async () => {
    console.log('[Solve-to-Scroll] Browser startup.');
    await reconcileAndSync();
  });

  // Alarm listener for timer expiry
  if (chrome.alarms) {
    chrome.alarms.onAlarm.addListener(async (alarm) => {
      console.log('[Solve-to-Scroll] Alarm fired:', alarm.name);
      if (alarm.name.startsWith('unlock_expiry_')) {
        const siteId = alarm.name.replace('unlock_expiry_', '');
        const unlocks = await getStorage<Unlocks>('unlocks', {});
        delete unlocks[siteId];
        await setStorage('unlocks', unlocks);
        await reconcileAndSync();
      }
    });
  }

  // Runtime message handler
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'UNLOCK_SITE') {
      const { siteId, minutes } = message;
      const expiry = Date.now() + (minutes || 10) * 60 * 1000;

      getStorage<Unlocks>('unlocks', {}).then(async (unlocks) => {
        unlocks[siteId] = expiry;
        await setStorage('unlocks', unlocks);

        if (chrome.alarms) {
          chrome.alarms.create(`unlock_expiry_${siteId}`, { when: expiry });
        }

        const settings = await getStorage<Settings>('settings', {
          sites: [],
          unlockMinutes: 10,
          questionsPerUnlock: 2,
          strict: false,
          sounds: true,
          theme: 'dark',
          enabled: true,
        });

        await syncDNRRules(settings, unlocks);
        sendResponse({ success: true, expiry });
      });

      return true; // Keep message channel open for async response
    }

    if (message.type === 'SYNC_RULES') {
      reconcileAndSync().then(() => sendResponse({ success: true }));
      return true;
    }

    if (message.type === 'LOCK_SITE_NOW') {
      const { siteId } = message;
      getStorage<Unlocks>('unlocks', {}).then(async (unlocks) => {
        delete unlocks[siteId];
        await setStorage('unlocks', unlocks);
        if (chrome.alarms) {
          chrome.alarms.clear(`unlock_expiry_${siteId}`);
        }
        await reconcileAndSync();
        sendResponse({ success: true });
      });
      return true;
    }
  });
}
