import { phases } from './phases';
import type { PhaseKey, PlanPhase, PlanTopic } from '~/features/plan1/types';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const orderedTopics: PlanTopic[] = phases.flatMap((phase) =>
  phase.weeksData.flatMap((week) =>
    week.items.map((item) => ({
      id: `w${week.number}-${slugify(item.title)}`,
      order: 0,
      title: item.title,
      week: week.number,
      weekTitle: week.title,
      phase: phase.key,
      phaseNumber: phase.number,
      stage: week.stage,
      outcomes: week.outcomes,
      task: week.task,
      resources: week.resources,
      why: item.why,
      how: item.how,
      impact: item.impact,
      body: item.body,
      list: item.list,
      links: item.links,
    }))
  )
);

orderedTopics.forEach((topic, index) => {
  topic.order = index + 1;
});

export const planTopics = orderedTopics;

export const planTopicById = new Map(planTopics.map((topic) => [topic.id, topic]));

export const planTopicsByPhase = phases.reduce(
  (result, phase) => {
    result[phase.key] = planTopics.filter((topic) => topic.phase === phase.key);
    return result;
  },
  {} as Record<PhaseKey, PlanTopic[]>
);

export const planTopicsByWeek = planTopics.reduce(
  (result, topic) => {
    const topics = result[topic.week] ?? [];
    topics.push(topic);
    result[topic.week] = topics;
    return result;
  },
  {} as Record<number, PlanTopic[]>
);

export const phaseByKey = new Map(phases.map((phase) => [phase.key, phase]));

export const planRoles = phases.map((phase) => ({
  phase: phase.key,
  number: phase.number,
  title: phase.role.title,
  summary: phase.role.summary,
  responsibilities: phase.role.responsibilities,
  tone: phase.tone,
  weeks: phase.weeks,
}));

export const getPhase = (key: PhaseKey): PlanPhase | undefined => phaseByKey.get(key);

export const getTopic = (id: string): PlanTopic | undefined => planTopicById.get(id);

export const getTopicsForPhase = (key: PhaseKey): PlanTopic[] => planTopicsByPhase[key] ?? [];

export const getNextTopic = (topic: PlanTopic): PlanTopic | undefined =>
  planTopics.find((candidate) => candidate.order === topic.order + 1);

export const getPreviousTopic = (topic: PlanTopic): PlanTopic | undefined =>
  planTopics.find((candidate) => candidate.order === topic.order - 1);
