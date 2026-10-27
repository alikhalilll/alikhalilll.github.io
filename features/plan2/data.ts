import type { PlanLink, ResourceGroup } from '~/features/plan1/types';

export const roles = [
  {
    role: 'Learner',
    responsibility:
      'Studies the week, builds each deliverable, opens merge requests and keeps the tracker current',
  },
  {
    role: 'Team lead / reviewer',
    responsibility:
      'Runs the weekly review, reviews deliverables and confirms each phase’s “You’re good when” bar',
  },
  {
    role: 'Backend mentor',
    responsibility:
      'Answers questions on crm-backend and ataa-crm-saas architecture and reviews the capstone design doc',
  },
  {
    role: 'Product owner',
    responsibility: 'Signs off the capstone spec, scope and final demo',
  },
];

export const schedule = [
  { day: 'Day 1', time: '2 hrs', activity: "Course or docs for the week's topics" },
  { day: 'Day 2', time: '2 hrs', activity: 'Course or docs + read the “In our code” files' },
  { day: 'Day 3', time: '2–3 hrs', activity: "Build the week's task" },
  { day: 'Day 4', time: '2–3 hrs', activity: 'Build + tests' },
  { day: 'Day 5', time: '1 hr', activity: 'NeetCode session (next problems in list order)' },
  { day: 'Day 5', time: '1 hr', activity: 'Team review + code review + tracker update' },
];

export const conventions = [
  {
    title: 'Git',
    body: 'GitLab merge requests, conventional commits and at least one reviewer per MR.',
  },
  {
    title: 'Code style',
    body: 'Run `vendor/bin/pint` before every MR. Tests must pass in CI.',
  },
  {
    title: 'Structure',
    body: 'Follow our `src/Domain/<Module>` structure: Actions, Queries, DTOs, Policies and Events.',
  },
  {
    title: 'Bug reports',
    body: 'Title in English, details in Arabic; steps, expected vs actual, environment and evidence.',
  },
  {
    title: 'AI tools',
    body: 'Tutor only in Phases 1–2; pair programmer from Phase 3. Never paste secrets or customer data.',
  },
];

export const aiTools = [
  {
    name: 'Claude (chat)',
    use: 'Explain a concept, quiz you, review your code and act as a Socratic tutor',
    href: 'https://claude.ai',
    label: 'claude.ai',
  },
  {
    name: 'Claude Code',
    use: 'Trace a request, explain a module, generate practice tasks from real code and review a branch',
    href: 'https://code.claude.com/docs/en/overview',
    label: 'Claude Code docs',
  },
  {
    name: 'NotebookLM',
    use: 'Load docs and videos, then get summaries, audio overviews and flashcards',
    href: 'https://notebooklm.google/',
    label: 'notebooklm.google',
  },
  {
    name: 'GitHub Copilot / Cursor',
    use: 'In-editor help from Phase 3 onward, with every generated block reviewed and explained',
    href: 'https://github.com/features/copilot',
    label: 'Copilot',
  },
  {
    name: 'Perplexity',
    use: 'Research questions with cited sources',
    href: 'https://www.perplexity.ai/',
    label: 'perplexity.ai',
  },
];

export const weeklyRhythm = [
  '~60% courses and reading, ~40% hands-on coding',
  '1 hr topic review session with the team',
  "1 code review of the week's task",
];

export const studyLoop = [
  {
    step: 'Learn',
    time: '~2 hrs',
    title: 'Study the topic, then read the “In our code” files',
    body: 'Read the docs or watch the course section, then open the real files. The goal is to connect the concept to code the team already runs.',
  },
  {
    step: 'Build',
    time: '4–6 hrs',
    title: 'Build the week’s task on a real repo',
    body: 'Use a real branch and a real merge request. If you get stuck, read the hints, close them and try again without looking.',
  },
  {
    step: 'Test',
    time: '~1 hr',
    title: 'Prove it with a test and a review',
    body: 'Add the test that would fail if your change broke. Run Pint and the relevant test suite before asking for review.',
  },
  {
    step: 'Explain',
    time: '~30 min',
    title: 'Explain the artifact and pass the phase bar',
    body: 'Walk a teammate through the decision, the trade-off and the failure mode. If you cannot explain it, you are not done.',
  },
];

export const mainResources: PlanLink[] = [
  { label: 'roadmap.sh: Backend', href: 'https://roadmap.sh/backend' },
  { label: 'roadmap.sh: Laravel', href: 'https://roadmap.sh/laravel' },
  { label: 'Laracasts', href: 'https://laracasts.com/' },
  { label: 'Laravel 12 docs', href: 'https://laravel.com/docs/12.x' },
  {
    label: 'crm-backend / ataa-crm-saas CLAUDE.md guides',
    href: 'https://code.claude.com/docs/en/memory',
  },
];

export const resourceGroups: ResourceGroup[] = [
  {
    key: 'foundations',
    label: 'Phase 1 · Engineering foundations',
    tone: 'blue',
    items: [
      {
        label: 'The Pragmatic Programmer',
        href: 'https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/',
      },
      {
        label: 'SOLID Principles in PHP',
        href: 'https://laracasts.com/series/solid-principles-in-php',
      },
      {
        label: 'Learn Git Branching',
        href: 'https://learngitbranching.js.org/',
      },
      {
        label: 'MDN: HTTP overview',
        href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
      },
      {
        label: 'PHP The Right Way',
        href: 'https://phptherightway.com/',
      },
      { label: 'SQLBolt', href: 'https://sqlbolt.com/' },
    ],
  },
  {
    key: 'laravel',
    label: 'Phase 2 · Laravel core',
    tone: 'violet',
    items: [
      {
        label: '30 Days to Learn Laravel',
        href: 'https://www.youtube.com/playlist?list=PL3VM-unCzF8hy47mt9-chowaHNjfkuEVz',
      },
      {
        label: 'Laravel: Request Lifecycle',
        href: 'https://laravel.com/docs/12.x/lifecycle',
      },
      {
        label: 'Laravel: Eloquent',
        href: 'https://laravel.com/docs/12.x/eloquent',
      },
      {
        label: 'Laravel: Validation',
        href: 'https://laravel.com/docs/12.x/validation',
      },
      {
        label: 'Laravel: Queues',
        href: 'https://laravel.com/docs/12.x/queues',
      },
    ],
  },
  {
    key: 'api',
    label: 'Phase 3 · APIs and integration',
    tone: 'teal',
    items: [
      {
        label: 'Microsoft: RESTful API design',
        href: 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design',
      },
      {
        label: 'Laravel: API Resources',
        href: 'https://laravel.com/docs/12.x/eloquent-resources',
      },
      {
        label: 'spatie/laravel-data',
        href: 'https://spatie.be/docs/laravel-data/v4/introduction',
      },
      {
        label: 'Use The Index, Luke!',
        href: 'https://use-the-index-luke.com/',
      },
      {
        label: 'Laravel: Sanctum SPA auth',
        href: 'https://laravel.com/docs/12.x/sanctum#spa-authentication',
      },
    ],
  },
  {
    key: 'quality',
    label: 'Phase 4 · Testing, security and DevOps',
    tone: 'amber',
    items: [
      { label: 'Pest docs', href: 'https://pestphp.com/docs/installation' },
      {
        label: 'Laravel: HTTP Tests',
        href: 'https://laravel.com/docs/12.x/http-tests',
      },
      { label: 'Playwright docs', href: 'https://playwright.dev/docs/intro' },
      { label: 'OWASP Top 10', href: 'https://owasp.org/www-project-top-ten/' },
      { label: 'Docker: Get started', href: 'https://docs.docker.com/get-started/' },
      {
        label: 'GitLab CI/CD',
        href: 'https://docs.gitlab.com/ci/',
      },
    ],
  },
  {
    key: 'architecture',
    label: 'Phase 5 · Architecture and system design',
    tone: 'rose',
    items: [
      {
        label: 'Refactoring Guru: Design Patterns',
        href: 'https://refactoring.guru/design-patterns/php',
      },
      {
        label: 'Laravel Beyond CRUD',
        href: 'https://laravel-beyond-crud.com/',
      },
      {
        label: 'System Design Primer',
        href: 'https://github.com/donnemartin/system-design-primer',
      },
      { label: 'C4 model', href: 'https://c4model.com/' },
      {
        label: 'Architecture Decision Records',
        href: 'https://adr.github.io/',
      },
    ],
  },
  {
    key: 'capstone',
    label: 'Phase 6 · Capstone',
    tone: 'indigo',
    items: [
      {
        label: 'Laravel: Multi-tenancy scopes',
        href: 'https://laravel.com/docs/12.x/eloquent#global-scopes',
      },
      {
        label: 'spatie/laravel-permission: Teams',
        href: 'https://spatie.be/docs/laravel-permission/v6/basic-usage/teams-permissions',
      },
      { label: 'Moyasar docs', href: 'https://docs.moyasar.com/' },
      { label: 'Stripe: Webhooks', href: 'https://docs.stripe.com/webhooks' },
      {
        label: 'PCI merchant resources',
        href: 'https://www.pcisecuritystandards.org/merchants/',
      },
    ],
  },
];
