export type PhaseKey = string;

export type PhaseTone = 'blue' | 'violet' | 'teal' | 'amber' | 'rose' | 'indigo';

export type Stage = 'Learn' | 'Practice' | 'Prove';

export type ThemeMode = 'light' | 'dark';

export type WeekResourceKind = 'youtube' | 'read';

export interface PlanLink {
  label: string;
  href: string;
}

export interface WeekResource {
  kind: WeekResourceKind;
  title: string;
  href: string;
  source: string;
  focus: string;
}

export interface WeekTask {
  title: string;
  brief: string;
  steps: string[];
  hints: string[];
  doneWhen: string;
}

export interface PlanItem {
  title: string;
  why: string;
  how: string;
  impact: string;
  body?: string;
  links?: PlanLink[];
  list?: string[];
}

export interface PlanPractice {
  title: string;
  items: string[];
}

export interface PlanWeek {
  number: number;
  stage: Stage;
  title: string;
  outcomes: string[];
  task: WeekTask;
  resources: WeekResource[];
  items: PlanItem[];
  practice?: PlanPractice;
}

export interface PlanTemplate {
  title: string;
  intro?: string;
  items: string[];
}

export interface PhaseRole {
  title: string;
  summary: string;
  responsibilities: string[];
}

export interface PlanPhase {
  key: PhaseKey;
  number: number;
  weeks: string;
  title: string;
  goal: string;
  proof: string;
  tone: PhaseTone;
  role: PhaseRole;
  weeksData: PlanWeek[];
  template?: PlanTemplate;
  prompts: string[];
  gates: string[];
}

export interface PlanTopic {
  id: string;
  order: number;
  title: string;
  week: number;
  weekTitle: string;
  phase: PhaseKey;
  phaseNumber: number;
  stage: Stage;
  outcomes: string[];
  task: WeekTask;
  resources: WeekResource[];
  why: string;
  how: string;
  impact: string;
  body?: string;
  list?: string[];
  links?: PlanLink[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface WeekPathRow {
  week: number;
  phase: PhaseKey;
  phaseLabel: string;
  stage: Stage;
  focus: string;
  output: string;
}

export interface TrackerItem {
  id: number;
  topic: string;
  week: number;
  phase: PhaseKey;
}

export interface ResourceGroup {
  key: PhaseKey;
  label: string;
  tone: PhaseTone;
  items: PlanLink[];
}
