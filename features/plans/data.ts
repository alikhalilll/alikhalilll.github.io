import { phases as plan1Phases } from '~/features/plan1/phases';
import { planRoles as plan1Roles, planTopics as plan1Topics } from '~/features/plan1/topics';
import type { PhaseTone } from '~/features/plan1/types';
import { phases as plan2Phases } from '~/features/plan2/phases';
import { planRoles as plan2Roles, planTopics as plan2Topics } from '~/features/plan2/topics';

export type PlanStatus = 'available' | 'coming-soon';

export interface PlanSummary {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  status: PlanStatus;
  weeks: number;
  topics: number;
  phases: number;
  roles: string[];
  tone: PhaseTone;
  outcome: string;
  preview: string[];
}

const countWeeks = (topics: Array<{ week: number }>) =>
  new Set(topics.map((topic) => topic.week)).size;

export const planCatalog: PlanSummary[] = [
  {
    id: 'plan-1',
    number: 1,
    title: 'Core Skills',
    shortTitle: 'Plan 1',
    subtitle: 'Requirements, Prompt Engineering & QA',
    description:
      'Learn to understand what to build, use AI reliably and prove the result works. This is the foundation every later project depends on.',
    status: 'available',
    weeks: countWeeks(plan1Topics),
    topics: plan1Topics.length,
    phases: plan1Phases.length,
    roles: plan1Roles.map((role) => role.title),
    tone: 'blue',
    outcome: 'A signed-off spec, a tested prompt library and an executed QA plan.',
    preview: [
      '9 weeks · 39 topics · 3 phases',
      'One real feature carried through every week',
      'Topic quizzes + phase gates',
      '3 roles unlocked as you finish',
    ],
  },
  {
    id: 'plan-2',
    number: 2,
    title: 'Backend / Full-Stack',
    shortTitle: 'Plan 2',
    subtitle: 'Vue, Laravel & production delivery',
    description:
      'The full-stack path builds on Plan 1: ship real Vue + Laravel features with APIs, data, auth, testing, performance and deployment.',
    status: 'available',
    weeks: countWeeks(plan2Topics),
    topics: plan2Topics.length,
    phases: plan2Phases.length,
    roles: plan2Roles.map((role) => role.title),
    tone: 'violet',
    outcome:
      'A deployed full-stack app with a green pipeline, executed test plan and 15-minute demo.',
    preview: [
      '16 weeks · 90 topics · 6 phases',
      'PHP, Laravel, APIs, SQL and Vue integration',
      'Testing, security, DevOps and system design',
      '6 roles unlocked as you finish',
    ],
  },
];

export const plan1Summary = planCatalog[0];

export const getPlanSummary = (id: string): PlanSummary | undefined =>
  planCatalog.find((plan) => plan.id === id);
