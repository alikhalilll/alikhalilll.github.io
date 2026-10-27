import { phases } from './phases';
import { planTopics } from './topics';
import type { PhaseKey, PlanTopic, QuizQuestion } from '~/features/plan1/types';

type GuidanceKey = 'why' | 'how' | 'impact';

const guidanceKinds: Array<{ key: GuidanceKey; prompt: (topic: PlanTopic) => string }> = [
  {
    key: 'why',
    prompt: (topic) => `Why does “${topic.title}” matter in this plan?`,
  },
  {
    key: 'how',
    prompt: (topic) => `Which practice is the best way to implement “${topic.title}”?`,
  },
  {
    key: 'impact',
    prompt: (topic) => `How does “${topic.title}” make you a stronger full-stack engineer?`,
  },
];

const hashString = (value: string) => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const mulberry32 = (seed: number) => {
  let state = seed;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = <T>(values: T[], seed: number): T[] => {
  const result = [...values];
  const random = mulberry32(seed);

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = result[index] as T;
    result[index] = result[swapIndex] as T;
    result[swapIndex] = current;
  }

  return result;
};

const pickDistractors = (topic: PlanTopic, kind: GuidanceKey, count: number) => {
  const candidates = planTopics.filter(
    (candidate) => candidate.id !== topic.id && candidate[kind] !== topic[kind]
  );
  if (candidates.length === 0) return [];

  const start = hashString(`${topic.id}-${kind}`) % candidates.length;
  const stride = 7;
  const options: string[] = [];
  const seen = new Set<string>([topic[kind]]);

  for (let index = 0; options.length < count && index < candidates.length; index += 1) {
    const candidate = candidates[(start + index * stride) % candidates.length];
    if (!candidate) continue;

    const value = candidate[kind];

    if (!seen.has(value)) {
      seen.add(value);
      options.push(value);
    }
  }

  return options;
};

const buildQuestion = (topic: PlanTopic, kind: GuidanceKey, seedSuffix: string): QuizQuestion => {
  const prompt = guidanceKinds.find((entry) => entry.key === kind)?.prompt(topic);
  const correct = topic[kind];
  const distractors = pickDistractors(topic, kind, 3);
  const options = shuffle(
    [correct, ...distractors],
    hashString(`${topic.id}-${kind}-${seedSuffix}`)
  );
  const answer = options.indexOf(correct);

  return {
    id: `${topic.id}-${kind}-${seedSuffix}`,
    prompt: prompt ?? `What matters most about “${topic.title}”?`,
    options,
    answer,
    explanation: `The plan says: ${correct}`,
  };
};

const buildTopicQuiz = (topic: PlanTopic): QuizQuestion[] =>
  guidanceKinds.map((entry) => buildQuestion(topic, entry.key, 'topic'));

const buildPhaseQuiz = (phaseKey: PhaseKey): QuizQuestion[] => {
  const phaseTopics = planTopics.filter((topic) => topic.phase === phaseKey);
  if (phaseTopics.length === 0) return [];

  const count = Math.min(6, phaseTopics.length);
  const picks = Array.from({ length: count }, (_, index) => {
    const topicIndex = Math.floor((index * phaseTopics.length) / count);
    return phaseTopics[topicIndex];
  }).filter((topic): topic is PlanTopic => Boolean(topic));

  return picks.map((topic, index) => {
    const kind = guidanceKinds[index % guidanceKinds.length]?.key ?? 'why';
    return buildQuestion(topic, kind, `phase-${phaseKey}`);
  });
};

export const topicQuizzes = Object.fromEntries(
  planTopics.map((topic) => [topic.id, buildTopicQuiz(topic)])
) as Record<string, QuizQuestion[]>;

export const phaseQuizzes = Object.fromEntries(
  phases.map((phase) => [phase.key, buildPhaseQuiz(phase.key)])
) as Record<PhaseKey, QuizQuestion[]>;

export const topicPassingScore = 2;
export const phasePassingScore = 5;

export const getTopicQuiz = (topicId: string): QuizQuestion[] => topicQuizzes[topicId] ?? [];

export const getPhaseQuiz = (phaseKey: PhaseKey): QuizQuestion[] => phaseQuizzes[phaseKey] ?? [];
