import { Site, PRESET_SITES } from './sites';

export type QuestionType = 'mcq' | 'code_output' | 'spot_bug' | 'complexity' | 'visual_mcq' | 'hotspot';
export type Level = 'beginner' | 'intermediate' | 'expert';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Topic = 'arrays' | 'linked-list' | 'stacks-queues' | 'trees' | 'graphs' | 'sorting' | 'big-o';

export interface Question {
  id: string;
  topic: Topic;
  level: Level;
  difficulty: Difficulty;
  type: QuestionType;
  prompt: string;
  options?: string[];
  answer: number | string; // 0-3 for index-based, string id for hotspot
  explanation: string;
  tags?: string[];
  code?: string;
  language?: string;
  diagram?: string;
  hotspots?: string[];
  svgContent?: string;
}

export interface Settings {
  sites: Site[];
  unlockMinutes: number;
  questionsPerUnlock: number;
  strict: boolean;
  sounds: boolean;
  theme: 'dark' | 'light';
  enabled: boolean;
}

export interface Profile {
  level: Level;
  topics: Topic[];
  onboarded: boolean;
}

export interface ProgressTopic {
  answered: number;
  correct: number;
  difficulty: Difficulty;
  streak: number;
}

export interface Progress {
  perTopic: Record<string, ProgressTopic>;
  seen: Record<string, number>;
  wrongQueue: string[];
}

export type Unlocks = Record<string, number>; // siteId -> expiry ms

export interface Streak {
  current: number;
  best: number;
  lastDay: string; // YYYY-MM-DD
  history: Record<string, number>; // YYYY-MM-DD -> count
}

export const DEFAULT_SETTINGS: Settings = {
  sites: PRESET_SITES,
  unlockMinutes: 10,
  questionsPerUnlock: 2,
  strict: false,
  sounds: true,
  theme: 'dark',
  enabled: true,
};

export const DEFAULT_PROFILE: Profile = {
  level: 'beginner',
  topics: ['arrays', 'linked-list', 'stacks-queues', 'trees', 'big-o'],
  onboarded: false,
};

export const DEFAULT_PROGRESS: Progress = {
  perTopic: {},
  seen: {},
  wrongQueue: [],
};

export const DEFAULT_STREAK: Streak = {
  current: 0,
  best: 0,
  lastDay: '',
  history: {},
};

function getLocalToday(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getStorage<T>(key: string, defaultValue: T): Promise<T> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        if (result && result[key] !== undefined) {
          resolve(result[key]);
        } else {
          resolve(defaultValue);
        }
      });
    });
  }
  try {
    const raw = localStorage.getItem(`s2s_${key}`);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function setStorage<T>(key: string, value: T): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  }
  try {
    localStorage.setItem(`s2s_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export async function loadAllAppState() {
  const [settings, profile, progress, unlocks, streak] = await Promise.all([
    getStorage<Settings>('settings', DEFAULT_SETTINGS),
    getStorage<Profile>('profile', DEFAULT_PROFILE),
    getStorage<Progress>('progress', DEFAULT_PROGRESS),
    getStorage<Unlocks>('unlocks', {}),
    getStorage<Streak>('streak', DEFAULT_STREAK),
  ]);

  return { settings, profile, progress, unlocks, streak };
}

export async function recordSolvedQuestion(topic: string, isCorrect: boolean, questionId: string) {
  const [progress, streak] = await Promise.all([
    getStorage<Progress>('progress', DEFAULT_PROGRESS),
    getStorage<Streak>('streak', DEFAULT_STREAK),
  ]);

  // Update topic progress
  const topicData = progress.perTopic[topic] || {
    answered: 0,
    correct: 0,
    difficulty: 'easy',
    streak: 0,
  };

  topicData.answered += 1;
  if (isCorrect) {
    topicData.correct += 1;
    topicData.streak += 1;
    // 2 correct in a row moves it up one step
    if (topicData.streak >= 2) {
      if (topicData.difficulty === 'easy') topicData.difficulty = 'medium';
      else if (topicData.difficulty === 'medium') topicData.difficulty = 'hard';
      topicData.streak = 0;
    }
  } else {
    topicData.streak = 0;
    // 1 wrong moves down one step
    if (topicData.difficulty === 'hard') topicData.difficulty = 'medium';
    else if (topicData.difficulty === 'medium') topicData.difficulty = 'easy';
  }

  progress.perTopic[topic] = topicData;
  progress.seen[questionId] = Date.now();

  // Spaced repetition queue
  if (!isCorrect) {
    if (!progress.wrongQueue.includes(questionId)) {
      progress.wrongQueue.push(questionId);
    }
  } else {
    // If was in wrongQueue, remove after correct answer
    progress.wrongQueue = progress.wrongQueue.filter((id) => id !== questionId);
  }

  // Update streak
  const today = getLocalToday();
  streak.history[today] = (streak.history[today] || 0) + 1;

  if (streak.lastDay !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (streak.lastDay === yStr) {
      streak.current += 1;
    } else {
      streak.current = 1;
    }
    streak.lastDay = today;
  }

  if (streak.current > streak.best) {
    streak.best = streak.current;
  }

  await Promise.all([
    setStorage('progress', progress),
    setStorage('streak', streak),
  ]);

  return { progress, streak };
}
