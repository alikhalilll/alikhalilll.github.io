import { computed, onMounted, ref } from 'vue';
import { useStorage } from '@vueuse/core';

import type { PhaseKey, PlanPhase, PlanTopic } from '~/features/plan1/types';
import { getPlanRuntime } from '../planRuntime';

export interface QuizResult {
  passed: boolean;
  bestScore: number;
  attempts: number;
  completedAt?: string;
}

export interface PlanProgressState {
  topics: Record<string, QuizResult>;
  phases: Record<string, QuizResult>;
}

export type TopicStatus = 'complete' | 'available' | 'locked';

export type NextAction =
  | { kind: 'topic'; topic: PlanTopic }
  | { kind: 'phase'; phase: PlanPhase }
  | { kind: 'done' };

const emptyProgress = (): PlanProgressState => ({ topics: {}, phases: {} });

export const usePlanProgress = (planId: string) => {
  const storageKey = `learning-path-${planId}-progress-v1`;
  const plan = getPlanRuntime(planId);
  const phases = plan?.phases ?? [];
  const planTopics = plan?.topics ?? [];
  const planTopicById = plan?.topicById ?? new Map<string, PlanTopic>();
  const planTopicsByPhase = plan?.topicsByPhase ?? {};
  const getPlanPhase = plan?.getPhase ?? (() => undefined);
  const getPlanTopicsForPhase = plan?.getTopicsForPhase ?? (() => []);
  const getPlanTopicQuiz = plan?.getTopicQuiz;
  const getPlanPhaseQuiz = plan?.getPhaseQuiz;
  const topicPassingScore = plan?.topicPassingScore ?? 2;
  const phasePassingScore = plan?.phasePassingScore ?? 5;

  const progress = useStorage<PlanProgressState>(storageKey, emptyProgress(), undefined, {
    initOnMounted: true,
    mergeDefaults: true,
  });

  const hydrated = ref(false);

  onMounted(() => {
    hydrated.value = true;
  });

  const getTopicResult = (topicId: string): QuizResult | undefined =>
    progress.value.topics[topicId];

  const getPhaseResult = (phaseKey: PhaseKey): QuizResult | undefined =>
    progress.value.phases[phaseKey];

  const phaseKeys = phases.map((phase) => phase.key);

  const isTopicComplete = (topicId: string) => getTopicResult(topicId)?.passed === true;

  const isPhaseComplete = (phaseKey: PhaseKey) => getPhaseResult(phaseKey)?.passed === true;

  const isPhaseUnlocked = (phaseKey: PhaseKey) => {
    const index = phaseKeys.indexOf(phaseKey);
    if (index <= 0) return true;
    const previousPhase = phaseKeys[index - 1];
    return previousPhase ? isPhaseComplete(previousPhase) : false;
  };

  const isTopicUnlocked = (topicId: string) => {
    const topic = planTopicById.get(topicId);
    if (!topic) return false;
    if (isTopicComplete(topicId)) return true;
    if (!isPhaseUnlocked(topic.phase)) return false;

    const phaseTopics = planTopicsByPhase[topic.phase] ?? [];
    const topicIndex = phaseTopics.findIndex((entry) => entry.id === topicId);
    if (topicIndex <= 0) return true;

    const previousTopic = phaseTopics[topicIndex - 1];
    return previousTopic ? isTopicComplete(previousTopic.id) : false;
  };

  const getTopicStatus = (topicId: string): TopicStatus => {
    if (isTopicComplete(topicId)) return 'complete';
    return isTopicUnlocked(topicId) ? 'available' : 'locked';
  };

  const isPhaseQuizUnlocked = (phaseKey: PhaseKey) => {
    if (!isPhaseUnlocked(phaseKey)) return false;
    const topics = getPlanTopicsForPhase(phaseKey);
    return topics.length > 0 && topics.every((topic) => isTopicComplete(topic.id));
  };

  const getPhaseQuizStatus = (phaseKey: PhaseKey) => {
    if (isPhaseComplete(phaseKey)) return 'complete' as const;
    return isPhaseQuizUnlocked(phaseKey) ? ('available' as const) : ('locked' as const);
  };

  const completedTopics = computed(
    () => planTopics.filter((topic) => isTopicComplete(topic.id)).length
  );

  const completedPhases = computed(
    () => phases.filter((phase) => isPhaseComplete(phase.key)).length
  );

  const progressPercent = computed(() =>
    planTopics.length === 0 ? 0 : Math.round((completedTopics.value / planTopics.length) * 100)
  );

  const phaseProgress = computed(() =>
    phases.map((phase) => {
      const topics = getPlanTopicsForPhase(phase.key);
      const done = topics.filter((topic) => isTopicComplete(topic.id)).length;
      const percent = topics.length === 0 ? 0 : Math.round((done / topics.length) * 100);
      return {
        key: phase.key,
        title: phase.title,
        tone: phase.tone,
        done,
        total: topics.length,
        percent,
        unlocked: isPhaseUnlocked(phase.key),
        quizPassed: isPhaseComplete(phase.key),
      };
    })
  );

  const nextAction = computed<NextAction>(() => {
    for (const phase of phases) {
      if (!isPhaseUnlocked(phase.key)) continue;

      const topics = getPlanTopicsForPhase(phase.key);
      const nextTopic = topics.find(
        (topic) => !isTopicComplete(topic.id) && isTopicUnlocked(topic.id)
      );

      if (nextTopic) return { kind: 'topic', topic: nextTopic };
      if (isPhaseQuizUnlocked(phase.key) && !isPhaseComplete(phase.key)) {
        return { kind: 'phase', phase };
      }
    }

    return { kind: 'done' };
  });

  const recordTopicResult = (topicId: string, score: number, total: number) => {
    const topic = planTopicById.get(topicId);
    if (!topic) return;

    const passingScore = Math.max(topicPassingScore, Math.ceil(total * 0.66));
    const previous = getTopicResult(topicId);
    const passed = score >= passingScore;
    const next: QuizResult = {
      passed: previous?.passed === true || passed,
      bestScore: Math.max(previous?.bestScore ?? 0, score),
      attempts: (previous?.attempts ?? 0) + 1,
      completedAt: previous?.completedAt ?? (passed ? new Date().toISOString() : undefined),
    };

    progress.value.topics[topicId] = next;
  };

  const recordPhaseResult = (phaseKey: PhaseKey, score: number, total: number) => {
    const phase = getPlanPhase(phaseKey);
    if (!phase) return;

    const passingScore = Math.max(phasePassingScore, Math.ceil(total * 0.8));
    const previous = getPhaseResult(phaseKey);
    const passed = score >= passingScore;
    const next: QuizResult = {
      passed: previous?.passed === true || passed,
      bestScore: Math.max(previous?.bestScore ?? 0, score),
      attempts: (previous?.attempts ?? 0) + 1,
      completedAt: previous?.completedAt ?? (passed ? new Date().toISOString() : undefined),
    };

    progress.value.phases[phaseKey] = next;
  };

  const resetProgress = () => {
    progress.value = emptyProgress();
  };

  const getNextTopic = (topicId: string) => {
    const topic = planTopicById.get(topicId);
    if (!topic) return undefined;
    return planTopics.find((candidate) => candidate.order === topic.order + 1);
  };

  const getTopicNumber = (topicId: string) => planTopicById.get(topicId)?.order ?? 0;

  const getTopicName = (topicId: string) => planTopicById.get(topicId)?.title ?? '';

  return {
    completedPhases,
    completedTopics,
    getNextTopic,
    getPhaseQuizStatus,
    getPhaseResult,
    getPlanPhaseQuiz,
    getPlanTopicQuiz,
    getTopicName,
    getTopicNumber,
    getTopicResult,
    getTopicStatus,
    hydrated,
    isPhaseComplete,
    isPhaseQuizUnlocked,
    isPhaseUnlocked,
    isTopicComplete,
    isTopicUnlocked,
    nextAction,
    phaseProgress,
    progressPercent,
    recordPhaseResult,
    recordTopicResult,
    resetProgress,
  };
};
