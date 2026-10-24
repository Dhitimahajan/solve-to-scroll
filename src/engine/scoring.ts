import { Question } from '../lib/storage';

export interface EvaluationResult {
  isCorrect: boolean;
  correctAnswer: number | string;
  explanation: string;
}

export function evaluateAnswer(question: Question, selectedAnswer: number | string): EvaluationResult {
  let isCorrect = false;

  if (question.type === 'hotspot') {
    isCorrect = String(selectedAnswer).trim() === String(question.answer).trim();
  } else {
    isCorrect = Number(selectedAnswer) === Number(question.answer);
  }

  return {
    isCorrect,
    correctAnswer: question.answer,
    explanation: question.explanation,
  };
}

export function shuffleOptions(question: Question): { question: Question; indexMap: number[] } {
  if (!question.options || question.options.length === 0 || question.type === 'hotspot') {
    return { question, indexMap: [] };
  }

  const originalOptions = [...question.options];
  const originalAnswerIdx = Number(question.answer);

  // Create indexed array
  const items = originalOptions.map((opt, i) => ({ opt, originalIndex: i }));

  // Fisher-Yates shuffle
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  const newOptions = items.map((x) => x.opt);
  const newAnswerIdx = items.findIndex((x) => x.originalIndex === originalAnswerIdx);

  return {
    question: {
      ...question,
      options: newOptions,
      answer: newAnswerIdx,
    },
    indexMap: items.map((x) => x.originalIndex),
  };
}
