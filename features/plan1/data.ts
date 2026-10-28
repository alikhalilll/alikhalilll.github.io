import type { PlanLink, ResourceGroup, TrackerItem, WeekPathRow } from './types';

export const weekPath: WeekPathRow[] = [
  {
    week: 1,
    phase: 'requirements',
    phaseLabel: 'Requirements',
    stage: 'Learn',
    focus:
      'Asking questions, interviews, user stories, INVEST, Given/When/Then, functional vs non-functional',
    output: 'Notes + 3 practice stories',
  },
  {
    week: 2,
    phase: 'requirements',
    phaseLabel: 'Requirements',
    stage: 'Practice',
    focus: 'Edge cases, Figma gap review, task breakdown, estimation, scope',
    output: '5 real Jira tickets rewritten + 1 Figma gap list',
  },
  {
    week: 3,
    phase: 'requirements',
    phaseLabel: 'Requirements',
    stage: 'Prove',
    focus: 'Mock stakeholder interview, full spec',
    output: 'Spec signed off by PO',
  },
  {
    week: 4,
    phase: 'prompt',
    phaseLabel: 'Prompt engineering',
    stage: 'Learn',
    focus: 'Prompt anatomy, context, examples, XML tags, chaining, hallucinations',
    output: 'Interactive tutorial chapters 1–9 done',
  },
  {
    week: 5,
    phase: 'prompt',
    phaseLabel: 'Prompt engineering',
    stage: 'Practice',
    focus: 'Prompts for code, specs, QA; Claude Code on our repos; agents, MCP, safety',
    output: 'Draft prompts tested on real work',
  },
  {
    week: 6,
    phase: 'prompt',
    phaseLabel: 'Prompt engineering',
    stage: 'Prove',
    focus: 'Team prompt library, testing each prompt, CLAUDE.md improvement',
    output: '10-prompt library + CLAUDE.md before/after',
  },
  {
    week: 7,
    phase: 'qa',
    phaseLabel: 'Quality assurance',
    stage: 'Learn',
    focus: 'QA mindset, test pyramid, test design techniques, bug lifecycle, bug reports',
    output: 'Test-design exercises',
  },
  {
    week: 8,
    phase: 'qa',
    phaseLabel: 'Quality assurance',
    stage: 'Practice',
    focus: 'Test cases from criteria, exploratory sessions, Postman, k6, accessibility',
    output: 'Test cases + Postman collection + k6 script',
  },
  {
    week: 9,
    phase: 'qa',
    phaseLabel: 'Quality assurance',
    stage: 'Prove',
    focus: 'Test plan, execution, 5+ bugs, regression checklist, DoD proposal',
    output: 'Executed test plan + 5 bugs filed',
  },
];

export const roles = [
  {
    role: 'Learner',
    responsibility:
      "Studies, practices on real work, produces each week's output, updates the tracker",
  },
  {
    role: 'Team lead / reviewer',
    responsibility:
      'Runs the weekly review, plays the stakeholder in the mock interview, confirms each "You\'re good when" bar',
  },
  {
    role: 'Product owner',
    responsibility: 'Reviews and signs off the Phase 1 spec',
  },
  {
    role: 'Peer',
    responsibility: "Reviews one teammate's output every week",
  },
];

export const schedule = [
  { day: 'Day 1', time: '2 hrs', activity: "Study the week's topics" },
  { day: 'Day 2', time: '2 hrs', activity: 'Study + small exercises' },
  { day: 'Day 3', time: '2–3 hrs', activity: 'Practice on real work (tickets, repos, Figma)' },
  { day: 'Day 4', time: '2–3 hrs', activity: "Practice / build the week's output" },
  { day: 'Day 5', time: '1 hr', activity: 'Team review session (one good and one bad example)' },
  { day: 'Day 5', time: '1 hr', activity: 'Peer review + update the progress tracker' },
];

export const conventions = [
  {
    title: 'Bug reports',
    body: 'Title in English, details in Arabic; one bug per ticket; steps, expected vs actual, environment, evidence.',
  },
  {
    title: 'Jira stories',
    body: '"As a… I want… so that…" + Given/When/Then acceptance criteria.',
  },
  {
    title: 'AI tools',
    body: 'Never paste secrets, .env files, tokens or customer data; verify every AI claim against docs or code.',
  },
  {
    title: 'Reviews',
    body: 'Every deliverable gets a peer review before the team lead review.',
  },
];

export const aiTools = [
  {
    name: 'Claude (chat)',
    use: 'Tutor, stakeholder role-play, reviewing specs, prompts and bug reports',
    href: 'https://claude.ai',
    label: 'claude.ai',
  },
  {
    name: 'Claude Code',
    use: 'Exploring our repos, testing prompts against real code',
    href: 'https://code.claude.com/docs/en/overview',
    label: 'Claude Code docs',
  },
  {
    name: 'NotebookLM',
    use: 'Turning resources into Q&A, summaries and flashcards',
    href: 'https://notebooklm.google/',
    label: 'notebooklm.google',
  },
  {
    name: 'Perplexity',
    use: 'Research with cited sources',
    href: 'https://www.perplexity.ai/',
    label: 'perplexity.ai',
  },
];

export const weeklyRhythm = [
  '~50% study, ~50% practice on real work',
  '1 hr team review session (share one example of good and bad work)',
  "Peer review of each week's output",
];

export const studyLoop = [
  {
    step: 'Watch',
    time: '~90 min',
    title: 'Watch both videos without multitasking',
    body: 'Write down 5 new terms or ideas. Do not code yet. The first pass is for understanding the shape of the skill.',
  },
  {
    step: 'Read',
    time: '~60 min',
    title: 'Read the free readings and steal one example',
    body: 'Copy one structure, checklist or example you can reuse at work. If a reading does not earn its place, skip it and note why.',
  },
  {
    step: 'Do',
    time: '4–6 hrs',
    title: 'Do the task on a real ticket, repo or screen',
    body: 'Use real work, not a fake example. If you get stuck, read the solution hints, then close them and try again without looking. Real work forces you to deal with missing information, which is the actual skill.',
  },
  {
    step: 'Prove',
    time: '~30 min',
    title: 'Explain the artifact and pass the “done when”',
    body: 'Explain it to a teammate and answer their questions. If you cannot explain it, repeat the weak part before moving on.',
  },
];

export const mainResources: PlanLink[] = [
  { label: 'The Mom Test', href: 'https://www.momtestbook.com/' },
  { label: 'Shape Up (free)', href: 'https://basecamp.com/shapeup' },
  {
    label: 'Claude prompt engineering overview',
    href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview',
  },
  {
    label: 'Anthropic interactive prompt tutorial',
    href: 'https://github.com/anthropics/prompt-eng-interactive-tutorial',
  },
  { label: 'ISTQB Foundation Level', href: 'https://www.istqb.org/' },
  { label: 'Ministry of Testing', href: 'https://www.ministryoftesting.com/' },
];

export const trackerItems: TrackerItem[] = [
  { id: 1, topic: 'Asking the right questions', week: 1, phase: 'requirements' },
  {
    id: 2,
    topic: 'Stakeholder interviews & meeting notes',
    week: 1,
    phase: 'requirements',
  },
  { id: 3, topic: 'User stories (INVEST)', week: 1, phase: 'requirements' },
  {
    id: 4,
    topic: 'Acceptance criteria (Given/When/Then)',
    week: 1,
    phase: 'requirements',
  },
  { id: 5, topic: 'Functional vs non-functional', week: 1, phase: 'requirements' },
  { id: 6, topic: 'Edge cases & unhappy paths', week: 2, phase: 'requirements' },
  { id: 7, topic: 'Figma gap review', week: 2, phase: 'requirements' },
  { id: 8, topic: 'Task breakdown & estimation', week: 2, phase: 'requirements' },
  { id: 9, topic: 'Scope changes', week: 2, phase: 'requirements' },
  { id: 10, topic: '5 Jira tickets rewritten', week: 2, phase: 'requirements' },
  { id: 11, topic: 'NMA Figma gap list', week: 2, phase: 'requirements' },
  { id: 12, topic: 'Mock stakeholder interview', week: 3, phase: 'requirements' },
  { id: 13, topic: 'Full spec written', week: 3, phase: 'requirements' },
  { id: 14, topic: 'Peer + PO review passed', week: 3, phase: 'requirements' },
  { id: 15, topic: 'Prompt anatomy', week: 4, phase: 'prompt' },
  {
    id: 16,
    topic: 'Context: examples, XML tags, roles',
    week: 4,
    phase: 'prompt',
  },
  {
    id: 17,
    topic: 'Chaining & step-by-step reasoning',
    week: 4,
    phase: 'prompt',
  },
  { id: 18, topic: 'Hallucinations & verification', week: 4, phase: 'prompt' },
  {
    id: 19,
    topic: 'Interactive tutorial chapters 1–9',
    week: 4,
    phase: 'prompt',
  },
  { id: 20, topic: 'Prompting for code & CLAUDE.md', week: 5, phase: 'prompt' },
  { id: 21, topic: 'Prompting for requirements', week: 5, phase: 'prompt' },
  { id: 22, topic: 'Prompting for QA', week: 5, phase: 'prompt' },
  { id: 23, topic: 'Claude Code on our repos', week: 5, phase: 'prompt' },
  { id: 24, topic: 'Agents, tools & MCP', week: 5, phase: 'prompt' },
  { id: 25, topic: 'Safety & prompt injection', week: 5, phase: 'prompt' },
  { id: 26, topic: 'Prompt library (10 prompts)', week: 6, phase: 'prompt' },
  {
    id: 27,
    topic: 'Each prompt tested on 3+ inputs',
    week: 6,
    phase: 'prompt',
  },
  { id: 28, topic: 'CLAUDE.md section improved', week: 6, phase: 'prompt' },
  { id: 29, topic: 'QA mindset & test pyramid', week: 7, phase: 'qa' },
  { id: 30, topic: 'Test design techniques', week: 7, phase: 'qa' },
  { id: 31, topic: 'Bug lifecycle', week: 7, phase: 'qa' },
  { id: 32, topic: 'Writing great bug reports', week: 7, phase: 'qa' },
  {
    id: 33,
    topic: 'Test cases from acceptance criteria',
    week: 8,
    phase: 'qa',
  },
  { id: 34, topic: 'Exploratory testing', week: 8, phase: 'qa' },
  { id: 35, topic: 'API testing with Postman', week: 8, phase: 'qa' },
  { id: 36, topic: 'k6 smoke test', week: 8, phase: 'qa' },
  { id: 37, topic: 'Accessibility check', week: 8, phase: 'qa' },
  {
    id: 38,
    topic: 'AI-generated test cases reviewed',
    week: 8,
    phase: 'qa',
  },
  { id: 39, topic: 'Test plan written', week: 9, phase: 'qa' },
  {
    id: 40,
    topic: 'Test plan executed, 5+ bugs filed',
    week: 9,
    phase: 'qa',
  },
  { id: 41, topic: 'Regression checklist', week: 9, phase: 'qa' },
  { id: 42, topic: 'DoD & code review checklist', week: 9, phase: 'qa' },
];

export const resourceGroups: ResourceGroup[] = [
  {
    key: 'requirements',
    label: 'Phase 1 · Weeks 1–3',
    tone: 'blue',
    items: [
      { label: 'The Mom Test', href: 'https://www.momtestbook.com/' },
      { label: 'Shape Up, chapters 2–4', href: 'https://basecamp.com/shapeup' },
      {
        label: 'Atlassian: User stories',
        href: 'https://www.atlassian.com/agile/project-management/user-stories',
      },
      {
        label: 'INVEST (Agile Alliance)',
        href: 'https://www.agilealliance.org/glossary/invest/',
      },
      {
        label: 'Given When Then (Martin Fowler)',
        href: 'https://martinfowler.com/bliki/GivenWhenThen.html',
      },
      {
        label: 'Gherkin reference',
        href: 'https://cucumber.io/docs/gherkin/reference/',
      },
      {
        label: 'ISO 25010 quality model',
        href: 'https://iso25000.com/index.php/en/iso-25000-standards/iso-25010',
      },
      {
        label: 'Big List of Naughty Strings',
        href: 'https://github.com/minimaxir/big-list-of-naughty-strings',
      },
      { label: 'Figma Dev Mode', href: 'https://www.figma.com/dev-mode/' },
      {
        label: 'Atlassian: Estimation',
        href: 'https://www.atlassian.com/agile/project-management/estimation',
      },
      {
        label: 'Definition of Ready (Agile Alliance)',
        href: 'https://www.agilealliance.org/glossary/definition-of-ready/',
      },
    ],
  },
  {
    key: 'prompt',
    label: 'Phase 2 · Weeks 4–6',
    tone: 'violet',
    items: [
      {
        label: 'Claude prompting best practices',
        href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
      },
      {
        label: 'Prompt engineering overview',
        href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview',
      },
      {
        label: 'Anthropic interactive prompt tutorial',
        href: 'https://github.com/anthropics/prompt-eng-interactive-tutorial',
      },
      {
        label: 'Anthropic courses',
        href: 'https://github.com/anthropics/courses',
      },
      {
        label: 'ChatGPT Prompt Engineering for Developers (DeepLearning.AI, free)',
        href: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/',
      },
      {
        label: 'Claude Code best practices',
        href: 'https://code.claude.com/docs/en/best-practices',
      },
      {
        label: 'Claude Code memory / CLAUDE.md',
        href: 'https://code.claude.com/docs/en/memory',
      },
      {
        label: 'Building effective AI agents (Anthropic)',
        href: 'https://www.anthropic.com/engineering/building-effective-agents',
      },
      {
        label: 'Model Context Protocol intro',
        href: 'https://modelcontextprotocol.io/',
      },
      {
        label: 'OWASP Top 10 for LLM applications',
        href: 'https://genai.owasp.org/llm-top-10/',
      },
    ],
  },
  {
    key: 'qa',
    label: 'Phase 3 · Weeks 7–9',
    tone: 'teal',
    items: [
      {
        label: 'The Practical Test Pyramid (Martin Fowler)',
        href: 'https://martinfowler.com/articles/practical-test-pyramid.html',
      },
      {
        label: 'Test Automation University (Applitools, free courses)',
        href: 'https://testautomationu.applitools.com/',
      },
      {
        label: 'ISTQB Foundation Level syllabus',
        href: 'https://www.istqb.org/',
      },
      {
        label: 'Boundary Value Analysis & Equivalence Partitioning (Guru99)',
        href: 'https://www.guru99.com/equivalence-partitioning-boundary-value-analysis.html',
      },
      {
        label: 'Decision table testing',
        href: 'https://www.guru99.com/decision-table-testing.html',
      },
      {
        label: 'State transition testing',
        href: 'https://www.guru99.com/state-transition-testing.html',
      },
      {
        label: 'Ministry of Testing',
        href: 'https://www.ministryoftesting.com/',
      },
      {
        label: 'Postman Learning Center',
        href: 'https://learning.postman.com/docs/introduction/overview/',
      },
      { label: 'k6 docs', href: 'https://grafana.com/docs/k6/latest/' },
      {
        label: 'WCAG 2.2 quick reference',
        href: 'https://www.w3.org/WAI/WCAG22/quickref/',
      },
      {
        label: 'WebAIM articles',
        href: 'https://webaim.org/articles/',
      },
      {
        label: 'axe DevTools',
        href: 'https://www.deque.com/axe/devtools/',
      },
      {
        label: 'Google engineering practices: code review',
        href: 'https://google.github.io/eng-practices/review/',
      },
      {
        label: 'Scrum Guide (Definition of Done)',
        href: 'https://scrumguides.org/scrum-guide.html',
      },
      {
        label: 'Simon Willison on prompt security',
        href: 'https://simonwillison.net/tags/prompt-injection/',
      },
    ],
  },
];
