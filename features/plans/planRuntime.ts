import type {
  PhaseKey,
  PlanLink,
  PlanPhase,
  PlanTopic,
  QuizQuestion,
  ResourceGroup,
} from '~/features/plan1/types';

import * as plan1Data from '~/features/plan1/data';
import { phases as plan1Phases } from '~/features/plan1/phases';
import {
  getNextTopic as getPlan1NextTopic,
  getPhase as getPlan1Phase,
  getTopicsForPhase as getPlan1TopicsForPhase,
  getTopic as getPlan1Topic,
  planRoles as plan1Roles,
  planTopicById as plan1TopicById,
  planTopics as plan1Topics,
  planTopicsByPhase as plan1TopicsByPhase,
  planTopicsByWeek as plan1TopicsByWeek,
} from '~/features/plan1/topics';
import {
  getPhaseQuiz as getPlan1PhaseQuiz,
  getTopicQuiz as getPlan1TopicQuiz,
  phasePassingScore as plan1PhasePassingScore,
  topicPassingScore as plan1TopicPassingScore,
} from '~/features/plan1/quizzes';

import * as plan2Data from '~/features/plan2/data';
import { phases as plan2Phases } from '~/features/plan2/phases';
import {
  getNextTopic as getPlan2NextTopic,
  getPhase as getPlan2Phase,
  getTopicsForPhase as getPlan2TopicsForPhase,
  getTopic as getPlan2Topic,
  planRoles as plan2Roles,
  planTopicById as plan2TopicById,
  planTopics as plan2Topics,
  planTopicsByPhase as plan2TopicsByPhase,
  planTopicsByWeek as plan2TopicsByWeek,
} from '~/features/plan2/topics';
import {
  getPhaseQuiz as getPlan2PhaseQuiz,
  getTopicQuiz as getPlan2TopicQuiz,
  phasePassingScore as plan2PhasePassingScore,
  topicPassingScore as plan2TopicPassingScore,
} from '~/features/plan2/quizzes';

import * as plan3Data from '~/features/plan3/data';
import { phases as plan3Phases } from '~/features/plan3/phases';
import {
  getNextTopic as getPlan3NextTopic,
  getPhase as getPlan3Phase,
  getTopicsForPhase as getPlan3TopicsForPhase,
  getTopic as getPlan3Topic,
  planRoles as plan3Roles,
  planTopicById as plan3TopicById,
  planTopics as plan3Topics,
  planTopicsByPhase as plan3TopicsByPhase,
  planTopicsByWeek as plan3TopicsByWeek,
} from '~/features/plan3/topics';
import {
  getPhaseQuiz as getPlan3PhaseQuiz,
  getTopicQuiz as getPlan3TopicQuiz,
  phasePassingScore as plan3PhasePassingScore,
  topicPassingScore as plan3TopicPassingScore,
} from '~/features/plan3/quizzes';

export interface PlanTeamRole {
  role: string;
  responsibility: string;
}

export interface PlanScheduleSlot {
  day: string;
  time: string;
  activity: string;
}

export interface PlanConvention {
  title: string;
  body: string;
}

export interface PlanAiTool {
  name: string;
  use: string;
  href: string;
  label: string;
}

export interface PlanLoopStep {
  step: string;
  time: string;
  title: string;
  body: string;
}

export interface PlanOperations {
  roles: PlanTeamRole[];
  schedule: PlanScheduleSlot[];
  conventions: PlanConvention[];
  aiTools: PlanAiTool[];
  weeklyRhythm: string[];
  studyLoop: PlanLoopStep[];
  mainResources: PlanLink[];
  resourceGroups: ResourceGroup[];
}

export interface PlanRole {
  phase: PhaseKey;
  number: number;
  title: string;
  summary: string;
  responsibilities: string[];
  tone: PlanPhase['tone'];
  weeks: string;
}

export interface PlanRuntime {
  id: string;
  phases: PlanPhase[];
  topics: PlanTopic[];
  topicById: Map<string, PlanTopic>;
  topicsByPhase: Record<PhaseKey, PlanTopic[]>;
  topicsByWeek: Record<number, PlanTopic[]>;
  roles: PlanRole[];
  getPhase: (key: PhaseKey) => PlanPhase | undefined;
  getTopic: (id: string) => PlanTopic | undefined;
  getTopicsForPhase: (key: PhaseKey) => PlanTopic[];
  getNextTopic: (topic: PlanTopic) => PlanTopic | undefined;
  getTopicQuiz: (topicId: string) => QuizQuestion[];
  getPhaseQuiz: (phaseKey: PhaseKey) => QuizQuestion[];
  topicPassingScore: number;
  phasePassingScore: number;
  operations: PlanOperations;
}

const plan1Operations: PlanOperations = {
  roles: plan1Data.roles,
  schedule: plan1Data.schedule,
  conventions: plan1Data.conventions,
  aiTools: plan1Data.aiTools,
  weeklyRhythm: plan1Data.weeklyRhythm,
  studyLoop: plan1Data.studyLoop,
  mainResources: plan1Data.mainResources,
  resourceGroups: plan1Data.resourceGroups,
};

const plan2Operations: PlanOperations = {
  roles: plan2Data.roles,
  schedule: plan2Data.schedule,
  conventions: plan2Data.conventions,
  aiTools: plan2Data.aiTools,
  weeklyRhythm: plan2Data.weeklyRhythm,
  studyLoop: plan2Data.studyLoop,
  mainResources: plan2Data.mainResources,
  resourceGroups: plan2Data.resourceGroups,
};

const plan3Operations: PlanOperations = {
  roles: plan3Data.roles,
  schedule: plan3Data.schedule,
  conventions: plan3Data.conventions,
  aiTools: plan3Data.aiTools,
  weeklyRhythm: plan3Data.weeklyRhythm,
  studyLoop: plan3Data.studyLoop,
  mainResources: plan3Data.mainResources,
  resourceGroups: plan3Data.resourceGroups,
};

export const planRuntime: Record<string, PlanRuntime> = {
  'plan-1': {
    id: 'plan-1',
    phases: plan1Phases,
    topics: plan1Topics,
    topicById: plan1TopicById,
    topicsByPhase: plan1TopicsByPhase,
    topicsByWeek: plan1TopicsByWeek,
    roles: plan1Roles,
    getPhase: getPlan1Phase,
    getTopic: getPlan1Topic,
    getTopicsForPhase: getPlan1TopicsForPhase,
    getNextTopic: getPlan1NextTopic,
    getTopicQuiz: getPlan1TopicQuiz,
    getPhaseQuiz: getPlan1PhaseQuiz,
    topicPassingScore: plan1TopicPassingScore,
    phasePassingScore: plan1PhasePassingScore,
    operations: plan1Operations,
  },
  'plan-2': {
    id: 'plan-2',
    phases: plan2Phases,
    topics: plan2Topics,
    topicById: plan2TopicById,
    topicsByPhase: plan2TopicsByPhase,
    topicsByWeek: plan2TopicsByWeek,
    roles: plan2Roles,
    getPhase: getPlan2Phase,
    getTopic: getPlan2Topic,
    getTopicsForPhase: getPlan2TopicsForPhase,
    getNextTopic: getPlan2NextTopic,
    getTopicQuiz: getPlan2TopicQuiz,
    getPhaseQuiz: getPlan2PhaseQuiz,
    topicPassingScore: plan2TopicPassingScore,
    phasePassingScore: plan2PhasePassingScore,
    operations: plan2Operations,
  },
  'plan-3': {
    id: 'plan-3',
    phases: plan3Phases,
    topics: plan3Topics,
    topicById: plan3TopicById,
    topicsByPhase: plan3TopicsByPhase,
    topicsByWeek: plan3TopicsByWeek,
    roles: plan3Roles,
    getPhase: getPlan3Phase,
    getTopic: getPlan3Topic,
    getTopicsForPhase: getPlan3TopicsForPhase,
    getNextTopic: getPlan3NextTopic,
    getTopicQuiz: getPlan3TopicQuiz,
    getPhaseQuiz: getPlan3PhaseQuiz,
    topicPassingScore: plan3TopicPassingScore,
    phasePassingScore: plan3PhasePassingScore,
    operations: plan3Operations,
  },
};

export const getPlanRuntime = (planId: string): PlanRuntime | undefined => planRuntime[planId];
