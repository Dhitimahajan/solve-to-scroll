import questionsData from '../data/questions.json';
import { Question, Profile, Progress, Difficulty, Topic } from '../lib/storage';
import { clampDifficulty, getStartingDifficulty } from './adaptive';
import { shuffleOptions } from './scoring';

const ALL_QUESTIONS: Question[] = questionsData as Question[];

export interface SelectionContext {
  profile: Profile;
  progress: Progress;
  lastQuestionType?: string;
  excludeId?: string;
}

export function pickWeightedTopic(topics: Topic[], progress: Progress): Topic {
  if (!topics || topics.length === 0) return 'arrays';
  if (topics.length === 1) return topics[0];

  // Calculate weights inversely proportional to accuracy
  const weights = topics.map((t) => {
    const stat = progress.perTopic[t];
    if (!stat || stat.answered === 0) return 3.0; // High weight for unpracticed topics
    const accuracy = stat.correct / stat.answered;
    // Lower accuracy = higher weight (e.g. 0% acc -> weight 4.0; 100% acc -> weight 1.0)
    return Math.max(0.5, 4.0 - accuracy * 3.0);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < topics.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return topics[i];
    }
  }

  return topics[0];
}

export function selectNextQuestion(ctx: SelectionContext): { question: Question; shuffledAnswer: number | string } {
  const { profile, progress, lastQuestionType, excludeId } = ctx;

  // 1. Spaced repetition check: If wrongQueue has items, 30% chance to pull one
  if (progress.wrongQueue && progress.wrongQueue.length > 0 && Math.random() < 0.3) {
    const wrongId = progress.wrongQueue[Math.floor(Math.random() * progress.wrongQueue.length)];
    const q = ALL_QUESTIONS.find((item) => item.id === wrongId);
    if (q && q.id !== excludeId) {
      const { question: shuffledQ } = shuffleOptions(q);
      return { question: shuffledQ, shuffledAnswer: shuffledQ.answer };
    }
  }

  // 2. Select topic based on weights
  const activeTopics: Topic[] =
    profile.topics && profile.topics.length > 0
      ? profile.topics
      : (['arrays', 'linked-list', 'trees'] as Topic[]);
  const topic = pickWeightedTopic(activeTopics, progress);

  // 3. Determine target difficulty
  let targetDiff: Difficulty;
  const topicStat = progress.perTopic[topic];
  if (topicStat && topicStat.answered > 0) {
    targetDiff = clampDifficulty(topicStat.difficulty, profile.level);
  } else {
    targetDiff = getStartingDifficulty(profile.level);
  }

  // 4. Candidate filtering
  // Seen timestamp threshold (filter out seen in last 30 entries)
  const sortedSeenIds = Object.entries(progress.seen || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([id]) => id);

  let pool = ALL_QUESTIONS.filter(
    (q) => q.topic === topic && q.difficulty === targetDiff && q.id !== excludeId && !sortedSeenIds.includes(q.id)
  );

  // Fallback 1: relaxing seen restriction in same topic & difficulty
  if (pool.length === 0) {
    pool = ALL_QUESTIONS.filter((q) => q.topic === topic && q.difficulty === targetDiff && q.id !== excludeId);
  }

  // Fallback 2: any allowed difficulty in same topic
  if (pool.length === 0) {
    pool = ALL_QUESTIONS.filter((q) => q.topic === topic && q.id !== excludeId);
  }

  // Fallback 3: any question in any user active topic
  if (pool.length === 0) {
    pool = ALL_QUESTIONS.filter((q) => activeTopics.includes(q.topic) && q.id !== excludeId);
  }

  // Fallback 4: all questions except excluded
  if (pool.length === 0) {
    pool = ALL_QUESTIONS.filter((q) => q.id !== excludeId);
  }

  if (pool.length === 0) {
    pool = ALL_QUESTIONS;
  }

  // 5. Mix question types: prefer questions where type != lastQuestionType
  let finalCandidates = pool;
  if (lastQuestionType) {
    const diversePool = pool.filter((q) => q.type !== lastQuestionType);
    if (diversePool.length > 0) {
      finalCandidates = diversePool;
    }
  }

  const selected = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];
  const { question: shuffledQ } = shuffleOptions(selected);

  return {
    question: shuffledQ,
    shuffledAnswer: shuffledQ.answer,
  };
}
