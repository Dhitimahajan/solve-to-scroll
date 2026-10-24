import { Level, Difficulty } from '../lib/storage';

export function getAllowedDifficulties(level: Level): Difficulty[] {
  switch (level) {
    case 'beginner':
      return ['easy', 'medium'];
    case 'intermediate':
      return ['easy', 'medium', 'hard'];
    case 'expert':
      return ['medium', 'hard'];
  }
}

export function getStartingDifficulty(level: Level): Difficulty {
  const rand = Math.random();
  if (level === 'beginner') {
    // 70% easy, 30% medium
    return rand < 0.7 ? 'easy' : 'medium';
  } else if (level === 'intermediate') {
    // 20% easy, 60% medium, 20% hard
    if (rand < 0.2) return 'easy';
    if (rand < 0.8) return 'medium';
    return 'hard';
  } else {
    // 10% medium, 90% hard
    return rand < 0.1 ? 'medium' : 'hard';
  }
}

export function clampDifficulty(diff: Difficulty, level: Level): Difficulty {
  const allowed = getAllowedDifficulties(level);
  if (allowed.includes(diff)) return diff;
  if (level === 'beginner' && diff === 'hard') return 'medium';
  if (level === 'expert' && diff === 'easy') return 'medium';
  return allowed[0];
}
