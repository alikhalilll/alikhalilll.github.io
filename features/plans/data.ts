import { phases as plan1Phases } from '~/features/plan1/phases';
import { planRoles as plan1Roles, planTopics as plan1Topics } from '~/features/plan1/topics';
import type { PhaseTone } from '~/features/plan1/types';
import { phases as plan2Phases } from '~/features/plan2/phases';
import { planRoles as plan2Roles, planTopics as plan2Topics } from '~/features/plan2/topics';
import { phases as plan3Phases } from '~/features/plan3/phases';
import { planRoles as plan3Roles, planTopics as plan3Topics } from '~/features/plan3/topics';

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
      'Learn to understand what to build, use AI reliably and prove the result works. This is the foundation every later project depends on. Each week produces a real artifact — an interview summary, a tested prompt, an executed test plan — not a reading list.',
    status: 'available',
    weeks: countWeeks(plan1Topics),
    topics: plan1Topics.length,
    phases: plan1Phases.length,
    roles: plan1Roles.map((role) => role.title),
    tone: 'blue',
    outcome:
      'A signed-off spec, a tested prompt library, an executed QA plan and a Postman + k6 collection you can hand to a developer.',
    preview: [
      '9 weeks · 39 topics · 3 phases',
      'Full-time pace: 10–12 hrs/wk · part-time: double the calendar',
      'One real feature carried through every week',
      'Topic quizzes + phase gates · best score is kept',
      '3 roles unlocked: Requirements Analyst → Prompt Engineer → QA Engineer',
    ],
  },
  {
    id: 'plan-2',
    number: 2,
    title: 'Backend / Full-Stack',
    shortTitle: 'Plan 2',
    subtitle: 'Vue, Laravel & production delivery',
    description:
      'The full-stack path builds on Plan 1: ship real Vue + Laravel features with APIs, data, auth, testing, performance, observability and deployment. The stack is opinionated (Laravel 12 + Vue 3), but the principles — HTTP, data modelling, testing, release engineering, system design — transfer to any framework.',
    status: 'available',
    weeks: countWeeks(plan2Topics),
    topics: plan2Topics.length,
    phases: plan2Phases.length,
    roles: plan2Roles.map((role) => role.title),
    tone: 'violet',
    outcome:
      'A deployed full-stack app with a green pipeline, executed test plan, Sentry + structured logs wired up, a documented SLO, a 15-minute demo and a reviewed design doc with trade-offs and ADRs.',
    preview: [
      '16 weeks · 90 topics · 6 phases',
      'Full-time pace: 12–15 hrs/wk · plan for buffer weeks on top',
      'PHP, Laravel, APIs, SQL and Vue integration',
      'Testing, security, observability, DevOps and system design',
      '6 roles unlocked: Foundations → Laravel → API → Quality & Release → Architect → Full-Stack Owner',
    ],
  },
  {
    id: 'plan-3',
    number: 3,
    title: 'Frontend / Nuxt 4',
    shortTitle: 'Plan 3',
    subtitle: 'Fundamentals → Vue 3 → Nuxt 4 → shipping',
    description:
      'Learn frontend end to end on the real stack from the muslim-academy-platform: Nuxt 4 + Vue 3 + strict TypeScript + UnoCSS + VeeValidate/Zod + i18n/RTL + Vitest/Playwright. Starts from HTML/CSS and goes deep on JavaScript, TypeScript and "how to think as a frontend engineer" before any framework.',
    status: 'available',
    weeks: countWeeks(plan3Topics),
    topics: plan3Topics.length,
    phases: plan3Phases.length,
    roles: plan3Roles.map((role) => role.title),
    tone: 'teal',
    outcome:
      'A real Nuxt 4 feature module shipped end to end: typed service + composable, UnoCSS + @pkgs/ui UI, VeeValidate/Zod form, Vitest + Playwright coverage, a11y clean, Lighthouse ≥ 90, deployed to staging.',
    preview: [
      '16 weeks · ~60 topics · 6 phases',
      'Full-time pace: 10–14 hrs/wk · acknowledges buffer weeks',
      'Dedicated weeks on deep JS, deep TS and "thinking like a frontend engineer"',
      'Based on the muslim-academy-platform stack: Nuxt 4 + Vue 3 + UnoCSS + @pkgs/ui',
      '6 roles unlocked: Fundamentals → Vue → Nuxt → UI → Full-Stack FE → Quality & Release',
    ],
  },
];

export const plan1Summary = planCatalog[0];

export const getPlanSummary = (id: string): PlanSummary | undefined =>
  planCatalog.find((plan) => plan.id === id);
