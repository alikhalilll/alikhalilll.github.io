import type { PlanItem, PlanLink, PlanPhase, WeekResource, WeekTask } from '~/features/plan1/types';

const link = (label: string, href: string): PlanLink => ({ label, href });

const read = (title: string, href: string, source: string, focus: string): WeekResource => ({
  kind: 'read',
  title,
  href,
  source,
  focus,
});

const watch = (title: string, href: string, source: string, focus: string): WeekResource => ({
  kind: 'youtube',
  title,
  href,
  source,
  focus,
});

const task = (
  title: string,
  brief: string,
  steps: string[],
  hints: string[],
  doneWhen: string
): WeekTask => ({ title, brief, steps, hints, doneWhen });

const item = (
  title: string,
  why: string,
  how: string,
  impact: string,
  links: PlanLink[] = [],
  body?: string,
  list?: string[]
): PlanItem => ({ title, why, how, impact, links, body, list });

const laravelDocs = 'https://laravel.com/docs/12.x';

export const phases: PlanPhase[] = [
  {
    key: 'foundations',
    number: 1,
    weeks: 'Weeks 1–3',
    title: 'Engineering Foundations',
    goal: 'Think like a software engineer and get comfortable with PHP, SQL and how the web works from the server side.',
    proof: 'PHP OOP mini app on MySQL, opened as a reviewed merge request',
    tone: 'blue',
    role: {
      title: 'Backend Foundations Engineer',
      summary:
        'You can reason about the web, write clean object-oriented PHP and model data in SQL without copying a tutorial line by line.',
      responsibilities: [
        'Explain the path from a URL to a database query and back.',
        'Write PHP classes, interfaces and traits with clear boundaries.',
        'Model related data and write JOIN / GROUP BY queries with confidence.',
        'Use Git branches, conventional commits and merge requests as a daily habit.',
      ],
    },
    weeksData: [
      {
        number: 1,
        stage: 'Learn',
        title: 'Engineering mindset, clean code & Git',
        outcomes: [
          'Break an ambiguous problem into small, verifiable steps.',
          'Recognise SOLID violations and simple refactorings in PHP.',
          'Use branches, conventional commits and merge requests without hand-holding.',
        ],
        task: task(
          'Set up your practice repo and open your first merge request',
          'Create a small Git practice repository, make three focused commits on a branch, and get a teammate to review the merge request.',
          [
            'Create a public or team-visible repository with a README and a useful .gitignore.',
            'Create a branch called feat/hello-backend and make three conventional commits.',
            'Open a merge request with a summary, a short test plan and one screenshot or command output.',
            'Ask a teammate to review it, resolve every comment, then merge the branch.',
          ],
          [
            'Commit examples: feat: add health endpoint, docs: explain local setup, test: cover the health endpoint.',
            'A good MR description says what changed, why it changed, how it was tested and what is deliberately out of scope.',
            'If a reviewer asks a question, answer it in the thread and update the code or the description. Do not resolve it silently.',
            'Read `crm-backend/.gitlab-ci.yml` and `ataa-crm-saas/.gitlab-ci.yml` to see what the team automates.',
          ],
          'A teammate has reviewed the MR, every comment is resolved, and the branch is merged with a clean conventional-commit history.'
        ),
        resources: [
          read(
            'The Pragmatic Programmer',
            'https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/',
            'Pragmatic Bookshelf · book',
            'Read chapters 1–2. Write down the ideas you can apply to your next task.'
          ),
          read(
            'How to think like a programmer',
            'https://www.freecodecamp.org/news/how-to-think-like-a-programmer-lessons-in-problem-solving-d1d8bf1de7d2/',
            'freeCodeCamp · free article',
            'Use the problem-solving loop on one task you are avoiding this week.'
          ),
          read(
            'SOLID Principles in PHP',
            'https://laracasts.com/series/solid-principles-in-php',
            'Laracasts · free series',
            'Watch the first three lessons and name one violation in code you have written.'
          ),
          read(
            'Refactoring Guru: Refactoring & code smells',
            'https://refactoring.guru/refactoring',
            'Refactoring Guru · free',
            'Use the code-smell catalogue as a review checklist for your first MR.'
          ),
          read(
            'Learn Git Branching',
            'https://learngitbranching.js.org/',
            'learngitbranching.js.org · interactive',
            'Finish the main and remote sections. Do not skip the rebase exercises.'
          ),
          read(
            'Conventional Commits',
            'https://www.conventionalcommits.org/',
            'conventionalcommits.org · free',
            'Use the format for every commit in your first MR.'
          ),
        ],
        items: [
          item(
            'How to think like a software engineer',
            'Most blocked work is not a coding problem. It is an unclear problem that was never broken into smaller decisions.',
            'Write the problem, the inputs, the constraints and the smallest next check. Split the work until each step can be verified in minutes.',
            'You become the person who turns a vague request into a plan instead of waiting for someone to hand you a task.',
            [
              link(
                'How to think like a programmer',
                'https://www.freecodecamp.org/news/how-to-think-like-a-programmer-lessons-in-problem-solving-d1d8bf1de7d2/'
              ),
            ],
            'Ask “why” before “how”, then reduce the problem until the next action is obvious.'
          ),
          item(
            'Clean code & SOLID principles',
            'Code is read far more often than it is written. SOLID is a vocabulary for spotting code that will be painful to change.',
            'Keep functions small, name things for intent, depend on interfaces and isolate change. Review one file after every lesson and refactor one small thing.',
            'You write code that teammates can review and extend without a translation layer.',
            [
              link(
                'SOLID Principles in PHP',
                'https://laracasts.com/series/solid-principles-in-php'
              ),
              link('Refactoring Guru', 'https://refactoring.guru/refactoring'),
            ],
            'The goal is not to memorise the acronym. It is to notice when one change forces edits in too many places.'
          ),
          item(
            'Git workflow, merge requests & conventional commits',
            'A branch is cheap. A messy history is expensive when you need to find what broke production.',
            'Branch from main, keep commits focused, use conventional commit messages, open an MR with context and get at least one review before merging.',
            'You move from “pushing files” to collaborating in a way a real team can trust.',
            [
              link('Learn Git Branching', 'https://learngitbranching.js.org/'),
              link('Pro Git', 'https://git-scm.com/book/en/v2'),
              link('Conventional Commits', 'https://www.conventionalcommits.org/'),
            ],
            'In our code: every project uses GitLab merge requests and a CI pipeline.'
          ),
          item(
            'Debugging & reading other people’s code',
            'Production debugging is mostly reading code you did not write and reducing uncertainty one observation at a time.',
            'Reproduce the bug, read the error from the bottom up, find the entry point, add one observation, and change one thing at a time.',
            'You stop guessing and become calm around unfamiliar code, which is the skill that scales to every project.',
            [
              link(
                'Missing Semester: Debugging and Profiling',
                'https://missing.csail.mit.edu/2020/debugging-profiling/'
              ),
            ],
            'In our code: read `crm-backend/CLAUDE.md`, then trace one feature in `src/Domain/Contact/`.',
            ['Read `crm-backend/CLAUDE.md` before opening a single class.']
          ),
        ],
      },
      {
        number: 2,
        stage: 'Learn',
        title: 'HTTP, the web and the terminal',
        outcomes: [
          'Explain DNS, TLS, HTTP requests and responses without hand-waving.',
          'Read status codes, headers and cookies well enough to debug an integration.',
          'Use the terminal to inspect a running service and its logs.',
        ],
        task: task(
          'Trace one URL end to end, then work in the terminal',
          'Pick a real URL from one of our projects and explain every hop from the browser to the response. Then complete a short terminal exercise on a local service.',
          [
            'Use the browser network panel and `curl -v` to inspect one real request.',
            'Write down the DNS lookup, TLS handshake, request, response status and important headers.',
            'Open a shell in `crm-backend` and run the project’s local commands.',
            'Find one log line that proves which controller or job handled a request.',
          ],
          [
            'Start with the request: method, URL, headers, body. Then read the response: status, headers, body.',
            '`curl -v https://example.com` shows the TLS and HTTP conversation. Do not just run it; read it.',
            'In our code: `make up`, `make sh`, `make logs` are the first commands to learn.',
            'If you cannot find a request in the logs, ask what happens before the application code runs.',
          ],
          'You can explain every hop from URL to response and show one log line that proves where the request was handled.'
        ),
        resources: [
          read(
            'MDN: An overview of HTTP',
            'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
            'MDN · free',
            'Read the request/response and statelessness sections, then inspect a real request.'
          ),
          read(
            'MDN: CORS',
            'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
            'MDN · free',
            'Understand why the browser blocks some requests before the server sees them.'
          ),
          read(
            'MDN: How the web works',
            'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works',
            'MDN · free',
            'Use the diagrams to write your own one-page explanation.'
          ),
          read(
            'roadmap.sh: Backend',
            'https://roadmap.sh/backend',
            'roadmap.sh · free',
            'Use the Internet section as a map, not a checklist to finish in one sitting.'
          ),
          read(
            'Missing Semester: The Shell',
            'https://missing.csail.mit.edu/2020/course-shell/',
            'MIT · free course',
            'Complete the exercises. The shell is part of the job, not an optional extra.'
          ),
        ],
        items: [
          item(
            'HTTP fundamentals',
            'Every backend bug eventually becomes an HTTP conversation. If you cannot read it, you cannot debug it.',
            'Learn methods, status codes, headers, cookies, sessions and CORS. Inspect one real request with the browser and `curl`.',
            'You debug integrations from evidence instead of guessing which layer is broken.',
            [
              link(
                'MDN: HTTP overview',
                'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview'
              ),
              link('MDN: CORS', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS'),
            ]
          ),
          item(
            'How the web works',
            'DNS, TLS and the browser-to-server path explain a whole class of “it works locally” failures.',
            'Draw the path from URL to response. For each step, name what can fail and what the user sees when it does.',
            'You can debug environment, certificate and proxy problems without escalating immediately.',
            [
              link(
                'MDN: How the web works',
                'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works'
              ),
              link('roadmap.sh: Backend', 'https://roadmap.sh/backend'),
            ]
          ),
          item(
            'Linux & terminal basics',
            'The server is a Linux box. The terminal is how you see what it is doing when the browser only shows a 500.',
            'Learn navigation, pipes, file permissions, processes, environment variables, logs, curl and basic process inspection.',
            'You can investigate a running service and read its logs without waiting for DevOps.',
            [
              link(
                'Missing Semester: The Shell',
                'https://missing.csail.mit.edu/2020/course-shell/'
              ),
            ],
            'In our code: `make up`, `make sh`, `make logs` in `crm-backend` and `ataa-crm-saas`.'
          ),
        ],
      },
      {
        number: 3,
        stage: 'Prove',
        title: 'PHP OOP and SQL deliverable',
        outcomes: [
          'Write modern PHP with types, namespaces, enums and Composer.',
          'Use classes, interfaces, traits and dependency injection to structure an app.',
          'Design a small normalized schema and query it with JOIN and GROUP BY.',
        ],
        task: task(
          'Build the PHP OOP mini app on MySQL',
          'Build a small task manager in plain PHP and MySQL. It must use classes, at least one interface, one trait, a normalized schema and a real JOIN query.',
          [
            'Model users, projects and tasks. Decide the keys and relationships before coding.',
            'Create the schema in MySQL and seed a few rows by hand or with a script.',
            'Build classes with typed properties, an interface for the repository and a trait for shared timestamps.',
            'Add create, list and update flows using PDO prepared statements.',
            'Add one JOIN / GROUP BY report, for example tasks per project.',
            'Open an MR with a README, schema and test notes, then get it reviewed.',
          ],
          [
            'Keep the app boring: no framework, no ORM. The point is to feel what Laravel will later automate.',
            'Use prepared statements with bound parameters. Never concatenate user input into SQL.',
            'Normalize first: one table per entity, foreign keys, no repeated project names in the tasks table.',
            'Use `EXPLAIN` on your report query and write one sentence about what the database is doing.',
            'If the app has no tests, add a tiny script that seeds data and checks the expected counts.',
          ],
          'The mini app runs locally, supports CRUD on related data, shows one JOIN report, and the reviewed MR contains the schema and setup instructions.'
        ),
        resources: [
          watch(
            'PHP for Beginners 2023',
            'https://www.youtube.com/playlist?list=PL3VM-unCzF8ipG50KDjnzhugceoSG3RTC',
            'Laracasts · YouTube',
            'Watch the sections you need. Do not watch the whole playlist passively.'
          ),
          read(
            'PHP The Right Way',
            'https://phptherightway.com/',
            'phptherightway.com · free',
            'Use the basics and dependency-injection sections as your reference while building.'
          ),
          read(
            'Composer: Getting started',
            'https://getcomposer.org/doc/00-intro.md',
            'getcomposer.org · free',
            'Set up autoloading so the app does not turn into a pile of requires.'
          ),
          read(
            'PHP manual: Classes and Objects',
            'https://www.php.net/manual/en/language.oop5.php',
            'php.net · free',
            'Read interfaces, traits and visibility. Write a small example for each.'
          ),
          read(
            'SQLBolt',
            'https://sqlbolt.com/',
            'sqlbolt.com · interactive',
            'Finish the JOIN and aggregation lessons before writing the report query.'
          ),
          read(
            'PostgreSQL Tutorial',
            'https://www.postgresqltutorial.com/',
            'postgresqltutorial.com · free',
            'Use the JOIN and GROUP BY examples alongside SQLBolt.'
          ),
          read(
            'Database normalization explained',
            'https://www.freecodecamp.org/news/database-normalization-1nf-2nf-3nf-table-examples/',
            'freeCodeCamp · free',
            'Apply 1NF–3NF to your schema and write down each decision.'
          ),
        ],
        items: [
          item(
            'PHP syntax & modern features',
            'Modern PHP is typed, namespaced and Composer-driven. Older tutorial code will teach you habits you have to unlearn.',
            'Use strict types, typed properties, enums, namespaces and Composer autoloading. Keep one class per file and one clear responsibility per class.',
            'You can read the team’s PHP codebase without treating every file as magic.',
            [
              link('PHP The Right Way', 'https://phptherightway.com/'),
              link('Composer: Getting started', 'https://getcomposer.org/doc/00-intro.md'),
            ],
            'In our code: enums live in `crm-backend/src/Domain/Contact/Enums/`; autoloading is managed by Composer.'
          ),
          item(
            'Object-oriented PHP',
            'Interfaces and dependency injection are how large PHP applications stay testable and replaceable.',
            'Create classes with clear constructors, depend on interfaces instead of concrete classes, and use traits only for genuinely shared behaviour.',
            'You can add a feature without editing five unrelated files and can test the class in isolation.',
            [
              link(
                'PHP manual: Classes and Objects',
                'https://www.php.net/manual/en/language.oop5.php'
              ),
              link(
                'Object-Oriented Principles in PHP',
                'https://laracasts.com/series/object-oriented-principles-in-php'
              ),
            ],
            'In our code: traits in `crm-backend/src/Support/MultiTenancy/Concerns/BelongsToTenant.php`; interfaces are used across domain and infrastructure.',
            ['In our code: `src/Support/MultiTenancy/Concerns/BelongsToTenant.php`']
          ),
          item(
            'SQL queries',
            'Almost every backend feature is a query. If you cannot write the query, you cannot verify that the feature is correct or fast.',
            'Practise SELECT, JOIN, GROUP BY and subqueries. Read the result set and explain what each clause changed.',
            'You can inspect data directly and debug “the list is empty” without waiting for another developer.',
            [
              link('SQLBolt', 'https://sqlbolt.com/'),
              link('PostgreSQL Tutorial', 'https://www.postgresqltutorial.com/'),
            ]
          ),
          item(
            'Keys & normalization basics',
            'A schema mistake is expensive later because every feature and report inherits it.',
            'Choose primary and foreign keys, remove repeated data, and check each table against 1NF, 2NF and 3NF. Use a migration or SQL file so the schema is reproducible.',
            'You design data that stays understandable as the product grows, instead of patching inconsistent rows forever.',
            [
              link(
                'Database normalization explained',
                'https://www.freecodecamp.org/news/database-normalization-1nf-2nf-3nf-table-examples/'
              ),
            ],
            'In our code: `crm-backend` runs on PostgreSQL, while `ataa-crm-saas` uses MySQL 8. Browse `database/migrations/` in both.'
          ),
        ],
      },
    ],
    template: {
      title: 'Mini app checklist',
      items: [
        'A README with local setup and demo credentials',
        'A reproducible schema with primary and foreign keys',
        'At least one interface and one trait used for a real reason',
        'Prepared statements for every write',
        'One JOIN / GROUP BY report',
        'A reviewed merge request with conventional commits',
      ],
    },
    prompts: [
      'I am a Vue developer learning PHP. Explain classes, interfaces and traits using JavaScript and TypeScript analogies, then quiz me.',
      'Here is a SQL query I wrote: [paste]. What is wrong or slow? Give hints, not the answer.',
      'Explain what each folder in crm-backend is for as if I am new to backend. Cite the files you inspected.',
    ],
    gates: [
      'You can explain what happens between typing a URL and seeing a page.',
      'You write PHP classes with interfaces and traits without looking everything up.',
      'You write JOIN / GROUP BY queries and can explain why your schema is normalized.',
      'Your merge request passes peer review with conventional commits.',
    ],
  },
  {
    key: 'laravel',
    number: 2,
    weeks: 'Weeks 4–7',
    title: 'Laravel Core',
    goal: 'Build a complete Laravel application and understand what happens from the first request to the final response.',
    proof: 'Laravel app with auth, CRUD on related models and a queued email',
    tone: 'violet',
    role: {
      title: 'Laravel Application Developer',
      summary:
        'You can build a Laravel feature end to end and trace exactly which files, services and database queries it touches.',
      responsibilities: [
        'Trace any request from route to controller, action and database.',
        'Design migrations, models and relationships without N+1 surprises.',
        'Add validation, authorization and background jobs to a real feature.',
        'Explain when Laravel’s conventions help and when they hide a problem.',
      ],
    },
    weeksData: [
      {
        number: 4,
        stage: 'Learn',
        title: 'How a Laravel app is put together',
        outcomes: [
          'Trace the request lifecycle from entry point to response.',
          'Explain the service container and when a provider is the right place to bind something.',
          'Read routes and single-action controllers in `crm-backend`.',
        ],
        task: task(
          'Trace a crm-backend request end to end',
          'Pick one real request, from route to controller to domain action and database, and produce a file-by-file trace.',
          [
            'Choose a small route such as archiving a contact.',
            'Open the route file, controller, action and model. Write down each file’s job.',
            'Use `php artisan route:list` and Telescope to confirm the path.',
            'Draw the lifecycle and mark where middleware and validation run.',
          ],
          [
            'Do not guess. If you cannot verify a step, write UNKNOWN and investigate.',
            'In our code: start at `crm-backend/routes/admin/contact.php`, then `app/Api/V1/Controllers/Admin/Contact/ArchiveContactController.php`, then `src/Domain/Contact/Actions/`.',
            'The controller should be thin. If it contains business logic, ask why that logic is not in an action.',
            'A good trace names the request, middleware, controller, action, model and response resource.',
          ],
          'You can present a file-by-file trace of a real request and point to the exact place each responsibility lives.'
        ),
        resources: [
          watch(
            '30 Days to Learn Laravel',
            'https://www.youtube.com/playlist?list=PL3VM-unCzF8hy47mt9-chowaHNjfkuEVz',
            'Laracasts · YouTube',
            'Use this as the main course. Stop and reproduce each concept in your own app.'
          ),
          read(
            'MDN: MVC',
            'https://developer.mozilla.org/en-US/docs/Glossary/MVC',
            'MDN · free',
            'Use the definition to explain what Laravel adds to the pattern.'
          ),
          read(
            'Laravel: Directory Structure',
            `${laravelDocs}/structure`,
            'Laravel docs · free',
            'Map the default folders to the folders in `crm-backend`.'
          ),
          read(
            'Laravel: Request Lifecycle',
            `${laravelDocs}/lifecycle`,
            'Laravel docs · free',
            'Read this twice. Draw your own diagram without looking.'
          ),
          read(
            'Laravel: Service Container',
            `${laravelDocs}/container`,
            'Laravel docs · free',
            'Focus on binding, singletons and dependency injection.'
          ),
          read(
            'Laravel: Service Providers',
            `${laravelDocs}/providers`,
            'Laravel docs · free',
            'Learn the difference between register and boot.'
          ),
          read(
            'Laravel: Routing',
            `${laravelDocs}/routing`,
            'Laravel docs · free',
            'Use route groups and middleware instead of one giant routes file.'
          ),
          read(
            'Laravel: Controllers',
            `${laravelDocs}/controllers`,
            'Laravel docs · free',
            'Prefer single-action controllers for complex operations.'
          ),
        ],
        items: [
          item(
            'MVC in Laravel',
            'MVC is not “three folders”. It is a separation of concerns that keeps HTTP, business logic and persistence from collapsing into one class.',
            'Learn the pattern, then map it to Laravel’s routes, controllers, actions, models and resources. Keep controllers thin.',
            'You can read a Laravel codebase and know where a new responsibility belongs.',
            [
              link('MDN: MVC', 'https://developer.mozilla.org/en-US/docs/Glossary/MVC'),
              link('Laravel: Directory Structure', `${laravelDocs}/structure`),
            ]
          ),
          item(
            'Request lifecycle',
            'Understanding the lifecycle is the difference between “Laravel magic” and a system you can debug.',
            'Trace entry point → HTTP kernel → middleware → router → controller → response. Use a real route and verify every step.',
            'You can place a breakpoint or log in the right layer instead of scattering debug statements.',
            [link('Laravel: Request Lifecycle', `${laravelDocs}/lifecycle`)],
            'In our code: `crm-backend/routes/admin/contact.php` → `app/Api/V1/Controllers/Admin/Contact/ArchiveContactController.php` → `src/Domain/Contact/Actions/`.'
          ),
          item(
            'Service container & service providers',
            'The container is how Laravel wires dependencies without every class constructing its own collaborators.',
            'Bind interfaces in providers, inject dependencies through constructors, and understand when a singleton is safe.',
            'You can replace an implementation in tests or switch a payment gateway without editing the caller.',
            [
              link('Laravel: Service Container', `${laravelDocs}/container`),
              link('Laravel: Service Providers', `${laravelDocs}/providers`),
            ],
            'In our code: `crm-backend/src/Domain/Contact/Providers/ContactServiceProvider.php`.'
          ),
          item(
            'Routing & controllers',
            'Routes are the contract between the outside world and your code. A messy route file becomes a messy API.',
            'Group routes by module and middleware, name them, and keep controllers focused on HTTP concerns. Use form requests for validation.',
            'You can add an endpoint without duplicating middleware, permissions or response logic.',
            [
              link('Laravel: Routing', `${laravelDocs}/routing`),
              link('Laravel: Controllers', `${laravelDocs}/controllers`),
            ],
            'In our code: one route file per module under `crm-backend/routes/admin/`.'
          ),
        ],
      },
      {
        number: 5,
        stage: 'Practice',
        title: 'The data layer',
        outcomes: [
          'Create migrations, seeders and factories that produce useful test data.',
          'Model relationships and query them with Eloquent.',
          'Spot and fix N+1 queries before they reach production.',
        ],
        task: task(
          'Build the data layer of your Laravel app',
          'Add three related models to your Laravel app with migrations, factories and seeders, then expose one list query without an N+1 problem.',
          [
            'Create migrations for the three models with foreign keys and indexes.',
            'Add relationships in both directions and use casts for dates and enums.',
            'Write factories and seeders that create a realistic data set.',
            'Build one list endpoint and verify the query count with Telescope or Debugbar.',
            'Fix every N+1 by adding eager loading or a query join.',
          ],
          [
            'Factories are code. Keep them realistic enough that a test failure means something.',
            'Add an index for every foreign key and every column you filter or sort by.',
            'N+1 symptom: one query for the list and one extra query per row. Use `with()` or `load()` deliberately.',
            'In our code: `crm-backend/src/Domain/Contact/Database/Seeders/` and `src/Domain/Contact/Models/`.',
          ],
          'The app has three related models, seeded data, a list endpoint and a documented before/after query count.'
        ),
        resources: [
          read(
            'Laravel: Migrations',
            `${laravelDocs}/migrations`,
            'Laravel docs · free',
            'Write reversible migrations and use foreign-key constraints.'
          ),
          read(
            'Laravel: Seeding',
            `${laravelDocs}/seeding`,
            'Laravel docs · free',
            'Use seeders to make local and staging environments useful.'
          ),
          read(
            'Laravel: Factories',
            `${laravelDocs}/eloquent-factories`,
            'Laravel docs · free',
            'Learn states and relationships, not just `fake()` fields.'
          ),
          read(
            'Laravel: Eloquent',
            `${laravelDocs}/eloquent`,
            'Laravel docs · free',
            'Read the query builder and collection sections.'
          ),
          read(
            'Laravel: Relationships',
            `${laravelDocs}/eloquent-relationships`,
            'Laravel docs · free',
            'Know the difference between hasMany, belongsTo and belongsToMany.'
          ),
          read(
            'Laravel: Eager Loading',
            `${laravelDocs}/eloquent-relationships#eager-loading`,
            'Laravel docs · free',
            'This is the cure for most N+1 bugs.'
          ),
          read(
            'Eloquent Performance Patterns',
            'https://laracasts.com/series/eloquent-performance-patterns',
            'Laracasts · series',
            'Watch the N+1 and query-count lessons before optimising.'
          ),
        ],
        items: [
          item(
            'Migrations, seeders & factories',
            'A database you cannot recreate is a database you cannot test, deploy or recover.',
            'Put every schema change in a migration. Seed useful local data and create factories for tests and demos.',
            'You can stand up a clean environment and reproduce a bug from scratch.',
            [
              link('Laravel: Migrations', `${laravelDocs}/migrations`),
              link('Laravel: Seeding', `${laravelDocs}/seeding`),
              link('Laravel: Factories', `${laravelDocs}/eloquent-factories`),
            ],
            'In our code: `crm-backend/src/Domain/Contact/Database/Seeders/`.'
          ),
          item(
            'Eloquent ORM',
            'Eloquent makes the common case fast. It also makes it easy to hide an expensive query behind a property access.',
            'Use relationships, scopes, casts and accessors intentionally. Inspect the generated SQL when a query matters.',
            'You write expressive data access without losing sight of the database.',
            [
              link('Laravel: Eloquent', `${laravelDocs}/eloquent`),
              link('Laravel: Relationships', `${laravelDocs}/eloquent-relationships`),
              link('Laravel: Mutators & Casts', `${laravelDocs}/eloquent-mutators`),
            ],
            'In our code: `crm-backend/src/Domain/Contact/Models/` and `ataa-crm-saas/src/Support/MultiTenancy/Casts/TenantStatusCast.php`.'
          ),
          item(
            'N+1 queries & eager loading',
            'A page that feels fine with 10 rows can time out with 10,000. N+1 is the most common cause.',
            'Count queries for one request, eager-load the relationships you render and select only the columns you need.',
            'You catch performance bugs in review instead of in production.',
            [
              link('Laravel: Eager Loading', `${laravelDocs}/eloquent-relationships#eager-loading`),
              link(
                'Eloquent Performance Patterns',
                'https://laracasts.com/series/eloquent-performance-patterns'
              ),
            ]
          ),
        ],
      },
      {
        number: 6,
        stage: 'Practice',
        title: 'Requests, auth and permissions',
        outcomes: [
          'Validate input with form requests or DTOs and return useful errors.',
          'Use middleware for cross-cutting concerns without polluting controllers.',
          'Add authentication and authorization that matches real roles.',
        ],
        task: task(
          'Add auth, validation and permissions to your app',
          'Protect the app with real authentication and a policy, then show validation errors in the UI and API.',
          [
            'Install Sanctum or Passport and implement login and logout.',
            'Move validation into form requests or DTOs. Return consistent 422 errors.',
            'Create a policy for one model and test an allowed and a denied action.',
            'Add middleware for locale or tenant context if the feature needs it.',
            'Write down the role matrix the feature must enforce.',
          ],
          [
            'Authentication answers “who are you?”. Authorization answers “can you do this?”. Do not blur them.',
            'Test the negative case first: a normal user must not be able to perform an admin action.',
            'Validation belongs at the boundary. Do not let invalid data reach the action.',
            'In our code: `crm-backend/src/Domain/Contact/Policies/`; Sanctum in `crm-backend`, Passport with UUIDs in `ataa-crm-saas`.',
          ],
          'Login works, one protected endpoint rejects the wrong role, validation errors are usable in the UI and an automated test covers the denied case.'
        ),
        resources: [
          read(
            'Laravel: Validation',
            `${laravelDocs}/validation`,
            'Laravel docs · free',
            'Use form requests and custom messages where they help the user.'
          ),
          read(
            'Laravel: Middleware',
            `${laravelDocs}/middleware`,
            'Laravel docs · free',
            'Learn before/after middleware and terminate.'
          ),
          read(
            'Laravel: Sanctum',
            `${laravelDocs}/sanctum`,
            'Laravel docs · free',
            'Use SPA cookie auth for the team SPA and tokens for machine clients.'
          ),
          read(
            'Laravel: Passport',
            `${laravelDocs}/passport`,
            'Laravel docs · free',
            'Understand when OAuth is the right tool and when it is overkill.'
          ),
          read(
            'Laravel: Authorization',
            `${laravelDocs}/authorization`,
            'Laravel docs · free',
            'Policies and gates are the default; use them before custom checks.'
          ),
          read(
            'spatie/laravel-permission',
            'https://spatie.be/docs/laravel-permission/v6/introduction',
            'spatie · free docs',
            'Read the roles and permissions basics, including teams if multi-tenant.'
          ),
          read(
            'spatie/laravel-data',
            'https://spatie.be/docs/laravel-data/v4/introduction',
            'spatie · free docs',
            'Use DTOs to validate and type request data.'
          ),
        ],
        items: [
          item(
            'Validation & DTOs',
            'Invalid input at the boundary becomes a confusing bug deep inside the app. Validate once, with clear messages.',
            'Use form requests for simple HTTP validation and DTOs when the data crosses layers. Return field-level errors the UI can display.',
            'You prevent bad data and give users a path to fix their input.',
            [
              link('Laravel: Validation', `${laravelDocs}/validation`),
              link('spatie/laravel-data', 'https://spatie.be/docs/laravel-data/v4/introduction'),
            ],
            'In our code: `crm-backend/src/Domain/Contact/DataTransferObjects/`.'
          ),
          item(
            'Middleware',
            'Some concerns apply to many requests. Middleware keeps them out of every controller.',
            'Use middleware for auth, locale, tenancy and request IDs. Keep it small and test the order when it matters.',
            'You add cross-cutting behaviour consistently instead of copying it into every action.',
            [link('Laravel: Middleware', `${laravelDocs}/middleware`)],
            'In our code: `crm-backend/app/Http/Middleware/SetLocaleFromRequest.php` and `src/Support/MultiTenancy/Middleware/InitializeTenancy.php`.'
          ),
          item(
            'Authentication with Sanctum & Passport',
            'A feature is not done when anyone can call it. Auth is part of the contract.',
            'Learn cookie-based SPA auth, token auth and the trade-offs. Store secrets safely and expire sessions deliberately.',
            'You can connect a real SPA or mobile client without inventing an auth scheme.',
            [
              link('Laravel: Sanctum', `${laravelDocs}/sanctum`),
              link('Laravel: Passport', `${laravelDocs}/passport`),
            ],
            'In our code: Sanctum in `crm-backend`; Passport with UUIDs in `ataa-crm-saas`.'
          ),
          item(
            'Authorization, policies & roles',
            'Broken access control is a security bug and a business problem. Permissions must be explicit and tested.',
            'Create policies for model actions, use gates for one-off abilities, and use spatie/laravel-permission for role management. Test allowed and denied paths.',
            'You can hand a feature to support or an admin without exposing another customer’s data.',
            [
              link('Laravel: Authorization', `${laravelDocs}/authorization`),
              link(
                'spatie/laravel-permission',
                'https://spatie.be/docs/laravel-permission/v6/introduction'
              ),
            ],
            'In our code: `crm-backend/src/Domain/Contact/Policies/`.'
          ),
        ],
      },
      {
        number: 7,
        stage: 'Prove',
        title: 'Queues, events and the Laravel deliverable',
        outcomes: [
          'Move slow work into queued jobs and handle failures.',
          'Use events and listeners to decouple side effects.',
          'Ship a Laravel app with auth, CRUD, queued email and seeded data.',
        ],
        task: task(
          'Ship the Laravel app with a queued email',
          'Finish the app from the previous weeks and add a real queued notification. The deliverable must run from a clean setup.',
          [
            'Add a queued job that sends an email notification for one real event.',
            'Configure the queue driver locally and verify the job runs with a worker.',
            'Add one scheduled task or event/listener pair with a clear purpose.',
            'Store one uploaded file or generated export through Laravel’s filesystem.',
            'Seed a demo user and data, write the setup README and open the final MR.',
          ],
          [
            'Queue the slow part, not everything. The request should still return a useful response.',
            'Test the job directly and test that the event dispatches it.',
            'Set `failed_jobs` and retry behaviour. A job that silently disappears is worse than a slow request.',
            'In our code: `crm-backend/src/Domain/Contact/Jobs/ProcessContactImportJob.php` and `src/Domain/EmailBroadcast/Jobs/SendBroadcastRecipientJob.php`.',
          ],
          'A clean checkout can run the app, log in, perform CRUD, trigger a queued email and show the seeded demo data.'
        ),
        resources: [
          read(
            'Laravel: Queues',
            `${laravelDocs}/queues`,
            'Laravel docs · free',
            'Learn connections, workers, retries and failed jobs.'
          ),
          read(
            'Laravel: Events',
            `${laravelDocs}/events`,
            'Laravel docs · free',
            'Use events for side effects, not for hiding the main flow.'
          ),
          read(
            'Laravel: Task Scheduling',
            `${laravelDocs}/scheduling`,
            'Laravel docs · free',
            'Know how the scheduler is triggered in production.'
          ),
          read(
            'Laravel: Notifications',
            `${laravelDocs}/notifications`,
            'Laravel docs · free',
            'Use notifications when the same message can go to multiple channels.'
          ),
          read(
            'Laravel: Mail',
            `${laravelDocs}/mail`,
            'Laravel docs · free',
            'Use Mailables and a local mail catcher.'
          ),
          read(
            'Laravel: File Storage',
            `${laravelDocs}/filesystem`,
            'Laravel docs · free',
            'Know the difference between local and S3 disks.'
          ),
          read(
            'spatie/laravel-medialibrary',
            'https://spatie.be/docs/laravel-medialibrary/v11/introduction',
            'spatie · free docs',
            'Compare it with plain file storage before adding a dependency.'
          ),
        ],
        items: [
          item(
            'Queues & jobs',
            'Email, imports and third-party calls should not block a user request.',
            'Dispatch a job for slow work, make it idempotent and configure retries and failed-job handling.',
            'You build features that remain responsive when the slow part fails.',
            [link('Laravel: Queues', `${laravelDocs}/queues`)],
            'In our code: `crm-backend/src/Domain/Contact/Jobs/ProcessContactImportJob.php`, `src/Domain/EmailBroadcast/Jobs/SendBroadcastRecipientJob.php`.'
          ),
          item(
            'Events & listeners',
            'Events let the main action finish without knowing every side effect that follows.',
            'Dispatch a domain event after a meaningful state change and let listeners handle email, provisioning or audit.',
            'You add side effects without turning one action into a pile of unrelated calls.',
            [link('Laravel: Events', `${laravelDocs}/events`)],
            'In our code: `ataa-crm-saas/src/Domain/Organization/Events/OrganizationProvisioned.php` → `Listeners/ProvisionCrmTenantListener.php`.'
          ),
          item(
            'Scheduling, notifications & mail',
            'Some work must happen on a clock, and some messages need more than one channel.',
            'Schedule commands with `withoutOverlapping`, use notifications for multi-channel messages and test mail with a fake.',
            'You can ship reminders, digests and alerts without a separate cron script for every one.',
            [
              link('Laravel: Task Scheduling', `${laravelDocs}/scheduling`),
              link('Laravel: Notifications', `${laravelDocs}/notifications`),
              link('Laravel: Mail', `${laravelDocs}/mail`),
            ]
          ),
          item(
            'File storage',
            'Uploads are a real feature with permissions, validation, size limits and cleanup.',
            'Validate type and size, store outside the public root when needed, use signed URLs and delete files when the record is deleted.',
            'You can ship file features without exposing private customer documents.',
            [
              link('Laravel: File Storage', `${laravelDocs}/filesystem`),
              link(
                'spatie/laravel-medialibrary',
                'https://spatie.be/docs/laravel-medialibrary/v11/introduction'
              ),
            ]
          ),
        ],
      },
    ],
    template: {
      title: 'Laravel app checklist',
      items: [
        'Auth, logout and protected routes',
        'CRUD on at least three related models',
        'Validation with usable error responses',
        'One policy with an allowed and denied test',
        'One queued job and one event/listener flow',
        'Seed data and a clean setup README',
      ],
    },
    prompts: [
      'Trace a request to archive a contact in crm-backend, from route to database. List every file and why it is there.',
      'Find a queued job in this repo. Explain when it is dispatched, how it retries and what happens if it fails.',
      'Explain Laravel’s service container using Vue provide/inject as an analogy, then give me three exercises.',
    ],
    gates: [
      'You can trace any crm-backend request from route to database and name every file it passes.',
      'You spot and fix N+1 queries in review.',
      'You add auth, a policy and a queued job to a feature on your own.',
      'The Laravel app runs from a clean checkout with seeded data and a working demo.',
    ],
  },
  {
    key: 'api',
    number: 3,
    weeks: 'Weeks 8–10',
    title: 'APIs, Database & Vue ↔ Laravel',
    goal: 'Design solid APIs and a good database, then connect a Vue frontend to them. This is where frontend skills meet backend skills.',
    proof: 'Vue SPA + Laravel API with auth, a filtered list, validation errors and an upload',
    tone: 'teal',
    role: {
      title: 'API & Integration Engineer',
      summary:
        'You can design a versioned API, optimise its queries and build a Vue client that handles auth, errors, pagination and uploads correctly.',
      responsibilities: [
        'Design consistent REST resources, DTOs and error responses.',
        'Choose indexes and fix slow queries using real query plans.',
        'Connect a Vue app to the API with proper auth and error handling.',
        'Explain how webhook signatures and tenant context protect the integration.',
      ],
    },
    weeksData: [
      {
        number: 8,
        stage: 'Learn',
        title: 'API design, resources and documentation',
        outcomes: [
          'Design versioned REST endpoints with consistent naming and errors.',
          'Return stable JSON through API resources and DTOs.',
          'Document the API and verify a webhook signature.',
        ],
        task: task(
          'Design and document a versioned API',
          'Take your Laravel app and expose a versioned API for its main resources. Document it with Scribe and add one webhook endpoint with signature verification.',
          [
            'Define the resources, endpoints, status codes and error shape before coding.',
            'Add API resources and DTOs so the response shape does not leak the database schema.',
            'Add pagination, filtering, sorting and a consistent validation error response.',
            'Generate Scribe docs and add one webhook endpoint that verifies a signature.',
          ],
          [
            'Start with the contract: request, success response, validation error, not-found and forbidden.',
            'Use plural resource names and nested routes only when the child cannot exist alone.',
            'Do not return a model directly. A resource is the stable public shape.',
            'In our code: versioned API under `crm-backend/app/Api/V1/`; docs at `/docs`.',
          ],
          'The API has a written contract, generated docs, consistent errors and a webhook endpoint that rejects an invalid signature.'
        ),
        resources: [
          read(
            'Microsoft: RESTful web API design',
            'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design',
            'Microsoft Learn · free',
            'Use the resource naming and versioning guidance as a review checklist.'
          ),
          read(
            'Laravel: Eloquent API Resources',
            `${laravelDocs}/eloquent-resources`,
            'Laravel docs · free',
            'Resources are the boundary between models and the public API.'
          ),
          read(
            'spatie/laravel-data docs',
            'https://spatie.be/docs/laravel-data/v4/introduction',
            'spatie · free docs',
            'Use DTOs for input and transformed output when arrays stop being enough.'
          ),
          read(
            'Laravel: Pagination',
            `${laravelDocs}/pagination`,
            'Laravel docs · free',
            'Return pagination metadata the frontend can actually use.'
          ),
          read(
            'Laravel: Error Handling',
            `${laravelDocs}/errors`,
            'Laravel docs · free',
            'Define one error envelope and keep it stable.'
          ),
          read(
            'MDN: HTTP status codes',
            'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status',
            'MDN · free',
            'Use 401, 403, 404, 422 and 500 correctly.'
          ),
          read(
            'Scribe for Laravel',
            'https://scribe.knuckles.wtf/laravel/',
            'Scribe · free docs',
            'Generate docs from routes and examples.'
          ),
          read(
            'Stripe: Receive webhook events',
            'https://docs.stripe.com/webhooks',
            'Stripe docs · free',
            'The signature and idempotency ideas apply to every provider.'
          ),
        ],
        items: [
          item(
            'REST design & versioning',
            'An API is a contract. Changing it casually breaks clients you cannot see.',
            'Use nouns for resources, HTTP methods for actions, version the surface and document breaking changes.',
            'You can evolve the API without surprising the Vue or mobile client.',
            [
              link(
                'Microsoft: RESTful web API design',
                'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design'
              ),
            ],
            'In our code: versioned API under `crm-backend/app/Api/V1/`.'
          ),
          item(
            'API resources & JSON responses',
            'Returning models directly couples the client to database columns and leaks fields you did not intend to expose.',
            'Create resources for every public shape, include relationships explicitly and keep one response envelope.',
            'You control what leaves the server and make frontend types stable.',
            [link('Laravel: Eloquent API Resources', `${laravelDocs}/eloquent-resources`)],
            'In our code: `crm-backend/src/Domain/Contact/Resources/ContactTransformer.php`.'
          ),
          item(
            'DTOs with spatie/laravel-data',
            'DTOs give one typed object for validation, transformation and passing data between layers.',
            'Define a DTO for each request shape, validate it at the boundary and use it instead of passing raw arrays around.',
            'You reduce duplicate validation and make refactors safer.',
            [
              link(
                'spatie/laravel-data docs',
                'https://spatie.be/docs/laravel-data/v4/introduction'
              ),
            ],
            'In our code: `crm-backend/src/Domain/Contact/DataTransferObjects/SearchContactsData.php`.'
          ),
          item(
            'Pagination, filtering & sorting',
            'Unbounded lists are a performance and UX problem. Filtering and sorting must be part of the contract.',
            'Use cursor or page pagination deliberately, whitelist sortable fields and make filters composable and testable.',
            'You ship lists that stay fast and predictable as data grows.',
            [link('Laravel: Pagination', `${laravelDocs}/pagination`)],
            'In our code: `crm-backend/src/Domain/Contact/Filtering/` (`FilterApplier`, `ContactSortApplier`).'
          ),
          item(
            'Error handling & status codes',
            'A frontend cannot recover from an error it cannot interpret.',
            'Use one error envelope with a message, field errors and a stable code. Return the correct status for auth, validation and missing resources.',
            'You make failure states a designed part of the product.',
            [
              link('Laravel: Error Handling', `${laravelDocs}/errors`),
              link(
                'MDN: HTTP status codes',
                'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status'
              ),
            ]
          ),
          item(
            'API docs with Scribe',
            'Undocumented endpoints create a support queue and slow down every client developer.',
            'Add examples and descriptions, generate docs in CI and review them when the API changes.',
            'You give frontend, mobile and support one source of truth.',
            [link('Scribe for Laravel', 'https://scribe.knuckles.wtf/laravel/')],
            'In our code: `php artisan scribe:generate`, served at `/docs`.'
          ),
          item(
            'Webhooks with signature checks',
            'A webhook endpoint is public by definition. Without signature verification, anyone can pretend to be the provider.',
            'Verify the raw body against the provider signature, reject stale timestamps, make handling idempotent and return quickly.',
            'You can integrate external services without opening a data-integrity hole.',
            [link('Stripe: Receive webhook events', 'https://docs.stripe.com/webhooks')],
            'In our code: `crm-backend/app/Http/Middleware/VerifyLmsWebhookSignature.php` and `app/Api/V1/Controllers/Webhook/`.'
          ),
        ],
      },
      {
        number: 9,
        stage: 'Practice',
        title: 'Database performance and caching',
        outcomes: [
          'Read a query plan and add the right index.',
          'Use transactions for multi-step writes.',
          'Cache expensive data without serving stale or cross-tenant results.',
        ],
        task: task(
          'Optimise a slow query and add a cache',
          'Take one slow list or report in your app, measure it, read its plan, add an index or rewrite it, then cache the safe part.',
          [
            'Measure the endpoint with a realistic data set and record the query count and time.',
            'Run `EXPLAIN` and identify the scan or missing index.',
            'Add the index or rewrite the query, then measure again and save both numbers.',
            'Add a Redis cache for one expensive read with a clear invalidation rule.',
          ],
          [
            'Measure first. Optimising without a number is guessing.',
            'An index helps reads but costs writes. Add it for a real query pattern.',
            'Wrap multi-step writes in a transaction so a failure cannot leave half a record.',
            'In our code: `crm-backend` runs PostgreSQL; `ataa-crm-saas` runs MySQL 8.',
          ],
          'You have a before/after measurement, a query plan explanation, the new index and a cache with a documented invalidation rule.'
        ),
        resources: [
          read(
            'Use The Index, Luke!',
            'https://use-the-index-luke.com/',
            'use-the-index-luke.com · free',
            'Read the indexing and query-plan chapters for your database.'
          ),
          read(
            'Laravel: Database Transactions',
            `${laravelDocs}/database#database-transactions`,
            'Laravel docs · free',
            'Use transactions for writes that must succeed together.'
          ),
          read(
            'PostgreSQL: Using EXPLAIN',
            'https://www.postgresql.org/docs/current/using-explain.html',
            'PostgreSQL docs · free',
            'Learn to read seq scan, index scan and cost.'
          ),
          read(
            'Eloquent Performance Patterns',
            'https://laracasts.com/series/eloquent-performance-patterns',
            'Laracasts · series',
            'Use the query-count lessons on your own endpoint.'
          ),
          read(
            'Laravel: Cache',
            `${laravelDocs}/cache`,
            'Laravel docs · free',
            'Know when to invalidate and when not to cache.'
          ),
          read(
            'Laravel: Redis',
            `${laravelDocs}/redis`,
            'Laravel docs · free',
            'Use Redis for cache, sessions or queues deliberately.'
          ),
        ],
        items: [
          item(
            'Database design: normalization, indexing & transactions',
            'A correct schema and the right index are worth more than a clever query.',
            'Normalize to remove duplication, index the columns you filter by, and wrap related writes in a transaction.',
            'You prevent data corruption and keep the app fast as data grows.',
            [
              link('Use The Index, Luke!', 'https://use-the-index-luke.com/'),
              link(
                'Laravel: Database Transactions',
                `${laravelDocs}/database#database-transactions`
              ),
            ]
          ),
          item(
            'Query plans & EXPLAIN',
            'A query can look fine and still scan a million rows. The plan tells you what actually happens.',
            'Run `EXPLAIN`, look for sequential scans on large tables and verify the index is used after the change.',
            'You fix performance from evidence and can defend the change in review.',
            [
              link(
                'PostgreSQL: Using EXPLAIN',
                'https://www.postgresql.org/docs/current/using-explain.html'
              ),
            ]
          ),
          item(
            'Caching with Redis',
            'Some data is expensive to compute and safe to reuse for a short time. Caching is a trade-off, not a default.',
            'Cache one expensive read with a key that includes tenant and filters, set a TTL and invalidate on writes.',
            'You reduce load without serving stale or leaked data.',
            [
              link('Laravel: Cache', `${laravelDocs}/cache`),
              link('Laravel: Redis', `${laravelDocs}/redis`),
            ]
          ),
        ],
      },
      {
        number: 10,
        stage: 'Prove',
        title: 'Vue SPA + Laravel API deliverable',
        outcomes: [
          'Authenticate a Vue SPA with Sanctum cookies and CSRF.',
          'Handle pagination, validation errors and uploads in the UI.',
          'Explain when to use Inertia and when a separate SPA is the better fit.',
        ],
        task: task(
          'Ship the Vue SPA + Laravel API',
          'Connect a Vue 3 app to your Laravel API with login, a paginated filtered list, a validated form, an upload and one real-time or RTL feature.',
          [
            'Implement login and logout with Sanctum SPA auth and protected routes.',
            'Build a paginated, filtered list against the API.',
            'Build a create/edit form that displays server-side validation errors.',
            'Add a file upload with progress and a visible success state.',
            'Add one of: Reverb live updates, Arabic RTL, or a documented Inertia comparison.',
            'Open the final MR with screenshots and a demo script.',
          ],
          [
            'Read the API contract before writing the Vue store. The UI should not guess the response shape.',
            'Keep server state in a query layer or a small Pinia store. Do not duplicate the same state in five components.',
            'Show the actual server error message next to the field. “Something went wrong” is not validation.',
            'In our code: `crm-backend/app/Http/Middleware/SetLocaleFromRequest.php` and `lang/` for locale; SPA auth docs for Sanctum.',
          ],
          'The SPA logs in, lists and filters data, creates a record, shows validation errors, uploads a file and runs from a clean setup.'
        ),
        resources: [
          read(
            'Laravel: Sanctum SPA Authentication',
            `${laravelDocs}/sanctum#spa-authentication`,
            'Laravel docs · free',
            'Use cookies and CSRF correctly; do not mix token and cookie auth by accident.'
          ),
          read(
            'Vue: Composition API guide',
            'https://vuejs.org/guide/introduction.html',
            'Vue docs · free',
            'Use composables to keep API logic out of components.'
          ),
          read(
            'Pinia',
            'https://pinia.vuejs.org/',
            'Pinia docs · free',
            'Use stores for shared client state, not for every server response.'
          ),
          read(
            'Axios',
            'https://axios-http.com/docs/intro',
            'Axios docs · free',
            'Configure one client with interceptors and error handling.'
          ),
          read(
            'Inertia.js docs',
            'https://inertiajs.com/',
            'Inertia docs · free',
            'Compare the Inertia model with a separate SPA honestly.'
          ),
          read(
            'Laravel: File Uploads',
            `${laravelDocs}/requests#files`,
            'Laravel docs · free',
            'Validate the file on the server; never trust the extension.'
          ),
          read(
            'Laravel: Broadcasting',
            `${laravelDocs}/broadcasting`,
            'Laravel docs · free',
            'Understand channels and authorization before adding Reverb.'
          ),
          read(
            'Laravel: Reverb',
            `${laravelDocs}/reverb`,
            'Laravel docs · free',
            'Use Reverb for first-party WebSockets.'
          ),
          read(
            'Laravel: Localization',
            `${laravelDocs}/localization`,
            'Laravel docs · free',
            'Keep Arabic strings in lang files, not in controllers.'
          ),
          read(
            'Vue I18n',
            'https://vue-i18n.intlify.dev/',
            'Vue I18n docs · free',
            'Plan RTL and message keys from the start.'
          ),
        ],
        items: [
          item(
            'SPA authentication with Sanctum',
            'Auth is the first integration problem every SPA hits. Cookies, CSRF and CORS must be understood together.',
            'Use Sanctum SPA auth with the correct domain, credentials and CSRF cookie. Test login, refresh, logout and an expired session.',
            'You can connect a real frontend without inventing a token-storage anti-pattern.',
            [
              link(
                'Laravel: Sanctum SPA Authentication',
                `${laravelDocs}/sanctum#spa-authentication`
              ),
            ]
          ),
          item(
            'Vue 3 + Pinia + Axios against the API',
            'The frontend needs one predictable API client and a clear place for shared state.',
            'Create a typed API client, use composables for requests and Pinia only for state that must be shared. Handle loading, empty and error states.',
            'You build features that behave well on slow and failing networks.',
            [
              link('Vue: Composition API guide', 'https://vuejs.org/guide/introduction.html'),
              link('Pinia', 'https://pinia.vuejs.org/'),
              link('Axios', 'https://axios-http.com/docs/intro'),
            ]
          ),
          item(
            'Inertia.js vs a separate SPA',
            'Both are valid. The wrong choice creates complexity the team has to maintain for years.',
            'Compare routing, auth, deployment, SEO and team skills. Pick one and write down why.',
            'You can contribute to an architecture decision instead of treating the framework as a given.',
            [link('Inertia.js docs', 'https://inertiajs.com/')]
          ),
          item(
            'File uploads end to end',
            'Uploads cross the browser, network, validation, storage and permissions. Every layer can fail.',
            'Validate type and size on both sides, stream the upload, store safely and return a usable URL or ID.',
            'You can add documents and images without exposing files or breaking on large uploads.',
            [link('Laravel: File Uploads', `${laravelDocs}/requests#files`)]
          ),
          item(
            'Real-time with Reverb & WebSockets',
            'Real-time is not automatically better. It adds connection state, authorization and failure modes.',
            'Use channels with authorization, handle reconnects and fall back to polling when the socket cannot connect.',
            'You can add live updates where they genuinely improve the product.',
            [
              link('Laravel: Broadcasting', `${laravelDocs}/broadcasting`),
              link('Laravel: Reverb', `${laravelDocs}/reverb`),
            ]
          ),
          item(
            'Localization & Arabic RTL',
            'Arabic is not a translation layer added at the end. Direction, layout and validation messages are product requirements.',
            'Keep messages in lang files, use logical CSS properties, test RTL layouts and send the locale with the request.',
            'You ship a product that works for Arabic-speaking users, not an English app with translated labels.',
            [
              link('Laravel: Localization', `${laravelDocs}/localization`),
              link('Vue I18n', 'https://vue-i18n.intlify.dev/'),
            ],
            'In our code: `crm-backend/lang/` and `app/Http/Middleware/SetLocaleFromRequest.php`.'
          ),
        ],
      },
    ],
    template: {
      title: 'Full-stack integration checklist',
      items: [
        'Written API contract and generated docs',
        'Versioned routes with consistent errors',
        'Paginated filtered list with loading and empty states',
        'Server-side validation shown next to fields',
        'File upload with server-side validation',
        'Sanctum SPA auth and a protected route',
      ],
    },
    prompts: [
      'Explain how contact filtering works in crm-backend/src/Domain/Contact/Filtering/. Then give me a task to add a filter, without writing it.',
      'How does VerifyLmsWebhookSignature protect us? What attack would succeed without it?',
      'Design REST endpoints for [feature]. I will propose mine first; critique the trade-offs.',
    ],
    gates: [
      'You design consistent, versioned REST endpoints with DTOs and API resources.',
      'Your Vue app handles auth, validation errors, pagination and uploads against your API.',
      'You can explain how webhook signature checks protect the integration.',
      'You have a measured before/after query improvement.',
    ],
  },
  {
    key: 'quality',
    number: 4,
    weeks: 'Weeks 11–12',
    title: 'Testing, Security & DevOps',
    goal: 'Ship code that is tested, secure and deployable without manual steps.',
    proof: 'Tested app in Docker with a GitLab CI pipeline that deploys to staging',
    tone: 'amber',
    role: {
      title: 'Quality & Release Engineer',
      summary:
        'You can prove a feature works, review it for common security failures, move it to staging through an automated pipeline and operate it with real signals — logs, errors, SLOs and a runbook — once it ships.',
      responsibilities: [
        'Write Pest and frontend tests that fail when behaviour breaks.',
        'Review code against the OWASP Top 10 and fix the real risks.',
        'Containerise the app and explain every stage of the CI pipeline.',
        'Deploy to staging and use structured logs, metrics and Sentry to verify the release.',
        "Define SLOs that reflect user pain and alerts that don't cry wolf.",
        'Lead the first 10 minutes of an incident and write a blameless post-mortem after.',
      ],
    },
    weeksData: [
      {
        number: 11,
        stage: 'Learn',
        title: 'Testing, security and code quality',
        outcomes: [
          'Write feature and unit tests that describe behaviour.',
          'Test the database with factories and `RefreshDatabase`.',
          'Identify the OWASP risks that matter in a Laravel app.',
        ],
        task: task(
          'Build the test suite and security review',
          'Add backend and frontend tests to your feature until the critical paths are covered, then review it against the OWASP Top 10.',
          [
            'Write Pest feature tests for the happy path, validation, auth and one failure case.',
            'Use factories and `RefreshDatabase` so each test starts clean.',
            'Add a Vitest test for one frontend behaviour and a Playwright test for login + create.',
            'Run Pint and PHPStan. Fix the issues you can explain.',
            'Review the feature against the OWASP Top 10 and record one real risk with a fix.',
          ],
          [
            'A test that cannot fail is documentation, not a test. Break the behaviour and watch it fail.',
            'Test the negative path first: wrong role, invalid input, missing record.',
            'Do not chase 100%. Cover the critical paths and the bugs that would hurt a customer.',
            'In our code: `crm-backend/tests/Feature/Contact/` uses SQLite in memory; run `make test`.',
          ],
          'The critical paths have tests, coverage is at least 70% on the feature, and the security review names one real risk and its fix.'
        ),
        resources: [
          read(
            'Pest docs',
            'https://pestphp.com/docs/installation',
            'Pest · free docs',
            'Use expectations and higher-order tests, not copy-pasted PHPUnit noise.'
          ),
          read(
            'Laravel: HTTP Tests',
            `${laravelDocs}/http-tests`,
            'Laravel docs · free',
            'Test the route and response, not every internal method.'
          ),
          read(
            'Pest From Scratch',
            'https://laracasts.com/series/pest-from-scratch',
            'Laracasts · series',
            'Watch the feature-test lessons and apply them immediately.'
          ),
          read(
            'Laravel: Database Testing',
            `${laravelDocs}/database-testing`,
            'Laravel docs · free',
            'Use factories, `RefreshDatabase` and database assertions.'
          ),
          read(
            'Vitest guide',
            'https://vitest.dev/guide/',
            'Vitest docs · free',
            'Test behaviour through the public interface.'
          ),
          read(
            'Vue: Testing',
            'https://vuejs.org/guide/scaling-up/testing.html',
            'Vue docs · free',
            'Use Testing Library-style queries and avoid implementation details.'
          ),
          read(
            'Playwright docs',
            'https://playwright.dev/docs/intro',
            'Playwright docs · free',
            'Write one end-to-end test that a user would recognise.'
          ),
          read(
            'Laravel Pint',
            `${laravelDocs}/pint`,
            'Laravel docs · free',
            'Run it before every MR.'
          ),
          read(
            'Larastan',
            'https://github.com/larastan/larastan',
            'GitHub · free',
            'Start at a level you can maintain and raise it deliberately.'
          ),
          read(
            'PHPStan',
            'https://phpstan.org/user-guide/getting-started',
            'phpstan.org · free',
            'Understand the level you choose and why.'
          ),
          read(
            'OWASP Top 10',
            'https://owasp.org/www-project-top-ten/',
            'OWASP · free',
            'Focus on broken access control, injection and security misconfiguration.'
          ),
          read(
            'OWASP Laravel Cheat Sheet',
            'https://cheatsheetseries.owasp.org/cheatsheets/Laravel_Cheat_Sheet.html',
            'OWASP · free',
            'Use it as a review checklist for your feature.'
          ),
        ],
        items: [
          item(
            'Pest feature & unit tests',
            'Tests are how you change code without fear and prove a bug is actually fixed.',
            'Write one feature test per critical path and unit tests for pure logic. Use factories, fakes and clear test names.',
            'You can refactor and ship with evidence instead of hope.',
            [
              link('Pest docs', 'https://pestphp.com/docs/installation'),
              link('Laravel: HTTP Tests', `${laravelDocs}/http-tests`),
            ],
            'In our code: `crm-backend/tests/Feature/Contact/` has 151 test files and runs on in-memory SQLite.'
          ),
          item(
            'Database testing with factories',
            'A test that depends on shared data is flaky. Each test should own its state.',
            'Use `RefreshDatabase`, factories and relationship states. Assert the database only when the query itself is the behaviour.',
            'You trust your test suite enough to run it before every merge.',
            [link('Laravel: Database Testing', `${laravelDocs}/database-testing`)],
            'In our code: `crm-backend/tests/Concerns/` and `tests/TestCase.php`.'
          ),
          item(
            'Frontend tests with Vitest',
            'Frontend bugs are still bugs. Test the behaviour users depend on, not the component internals.',
            'Test loading, empty, error and success states. Mock the API at the boundary and assert what the user sees.',
            'You catch regressions in the UI before a manual QA pass.',
            [
              link('Vitest guide', 'https://vitest.dev/guide/'),
              link('Vue: Testing', 'https://vuejs.org/guide/scaling-up/testing.html'),
            ]
          ),
          item(
            'End-to-end tests with Playwright',
            'E2E tests prove the whole system works together, including auth and the real browser.',
            'Write a small critical-path suite: login, create, edit and the permission failure. Keep it fast and stable.',
            'You can verify a release without clicking through the same screens manually.',
            [link('Playwright docs', 'https://playwright.dev/docs/intro')]
          ),
          item(
            'Static analysis & code style',
            'Formatting and static analysis remove a whole class of review comments and catch real mistakes early.',
            'Run Pint and PHPStan in CI. Fix issues or document a justified ignore; never suppress silently.',
            'You raise the baseline quality of every MR you touch.',
            [
              link('Laravel Pint', `${laravelDocs}/pint`),
              link('Larastan', 'https://github.com/larastan/larastan'),
              link('PHPStan', 'https://phpstan.org/user-guide/getting-started'),
            ],
            'In our code: `vendor/bin/pint`; the NMA API uses `phpstan.neon.dist` and `phpcs.xml`.'
          ),
          item(
            'OWASP Top 10',
            'Security is not a separate phase. Most incidents come from a small set of avoidable mistakes.',
            'Learn broken access control, injection, XSS, CSRF and misconfiguration. Review one feature against each risk.',
            'You catch security issues in review before they become incidents.',
            [
              link('OWASP Top 10', 'https://owasp.org/www-project-top-ten/'),
              link(
                'OWASP Laravel Cheat Sheet',
                'https://cheatsheetseries.owasp.org/cheatsheets/Laravel_Cheat_Sheet.html'
              ),
            ]
          ),
          item(
            'Rate limiting & API tokens',
            'An unprotected endpoint is an invitation to abuse and accidental load.',
            'Add rate limits per user or IP, scope tokens to the minimum permission and test the limit response.',
            'You make the API resilient to abuse without blocking legitimate clients.',
            [link('Laravel: Rate Limiting', `${laravelDocs}/rate-limiting`)]
          ),
          item(
            'Passwords, encryption & secrets',
            'Secrets in Git are forever. Passwords stored incorrectly are a breach waiting to happen.',
            'Use `Hash` for passwords, encrypt sensitive fields and keep secrets in environment variables. Rotate anything that leaks.',
            'You can handle credentials and customer data responsibly.',
            [
              link('Laravel: Hashing', `${laravelDocs}/hashing`),
              link('Laravel: Encryption', `${laravelDocs}/encryption`),
              link('Laravel: Configuration & .env', `${laravelDocs}/configuration`),
            ]
          ),
        ],
      },
      {
        number: 12,
        stage: 'Prove',
        title: 'Docker, CI/CD and staging',
        outcomes: [
          'Containerise the app and run it with Docker Compose.',
          'Explain every stage of the GitLab CI pipeline.',
          'Deploy to staging, verify it and document rollback.',
          'Define one SLO for the feature and know what fires an alert.',
          'Walk a hypothetical outage through structured logs with a correlation ID.',
        ],
        task: task(
          'Dockerise, deploy to staging and wire observability',
          'Wrap the app in Docker, add a pipeline that installs, lints, tests, builds and deploys, then verify the staging release *through* logs, errors and one documented SLO.',
          [
            'Write a Dockerfile and Compose setup for app, database and queue worker.',
            'Add a GitLab CI pipeline with install, lint, test, build and deploy stages.',
            'Use environment variables and a migration step that is safe to rerun.',
            'Deploy to staging and verify the health endpoint, login and one critical flow.',
            'Add Sentry + a structured log formatter (JSON) and attach a request/correlation ID that threads through logs and errors.',
            'Define one SLO for the critical path (e.g. 99% of login requests under 500ms over 7 days) and write the alert condition.',
            'Write the rollback steps, the incident runbook (first 10 minutes) and where to find logs, metrics and errors.',
          ],
          [
            'A container is not a deployment. It is one artifact in a repeatable release.',
            'Run the same image locally and in staging. If they differ, you will debug a ghost.',
            'CI should fail on a real test failure, not just on a syntax error.',
            'An SLO is a promise *to users*. Pick one indicator that reflects user pain, pick a target you can defend, pick a window. Write what you will do when the budget burns.',
            'Correlation IDs: generate on the edge, pass through middleware, attach to every log line and the Sentry scope. Without them, debugging a distributed failure is archaeology.',
            'In our code: `Dockerfile`, `docker/nginx/`, `docker/php/`, `docker-compose.yml`, `Makefile`, `.gitlab-ci.yml`.',
          ],
          'Staging runs the app in Docker, the pipeline is green, the release is verified through logs, Sentry is capturing errors with request IDs, one SLO + alert is documented, and the rollback + first-10-minutes runbook is written down.'
        ),
        resources: [
          read(
            'Docker: Get started',
            'https://docs.docker.com/get-started/',
            'Docker docs · free',
            'Build one image and run one service before composing everything.'
          ),
          read(
            'roadmap.sh: Docker',
            'https://roadmap.sh/docker',
            'roadmap.sh · free',
            'Use it as a map for images, volumes, networks and Compose.'
          ),
          read(
            'The Twelve-Factor App',
            'https://12factor.net/',
            '12factor.net · free',
            'Focus on config, processes and logs.'
          ),
          read(
            'Laravel: Deployment',
            `${laravelDocs}/deployment`,
            'Laravel docs · free',
            'Read the production checklist before writing the pipeline.'
          ),
          read(
            'GitLab: Get started with CI/CD',
            'https://docs.gitlab.com/ci/',
            'GitLab docs · free',
            'Understand stages, jobs, artifacts and environments.'
          ),
          read(
            'Nginx beginner’s guide',
            'https://nginx.org/en/docs/beginners_guide.html',
            'nginx.org · free',
            'Know how Nginx passes a request to PHP-FPM.'
          ),
          read(
            'Laravel: Supervisor config',
            `${laravelDocs}/queues#supervisor-configuration`,
            'Laravel docs · free',
            'A queue that is not supervised is a queue that stops.'
          ),
          read(
            'Laravel Telescope',
            `${laravelDocs}/telescope`,
            'Laravel docs · free',
            'Use it in staging, not as a permanent production dependency.'
          ),
          read(
            'Laravel Pail',
            `${laravelDocs}/logging#tailing-log-messages-using-pail`,
            'Laravel docs · free',
            'Tail logs while verifying the release.'
          ),
          read(
            'Sentry for Laravel',
            'https://docs.sentry.io/platforms/php/guides/laravel/',
            'Sentry docs · free',
            'Capture errors with enough context to fix them.'
          ),
          read(
            'Google SRE: Service Level Objectives',
            'https://sre.google/sre-book/service-level-objectives/',
            'Google SRE Book · free',
            'Read the SLI/SLO/SLA chapter end to end. Pick one indicator for your feature.'
          ),
          read(
            'Google SRE: Monitoring Distributed Systems',
            'https://sre.google/sre-book/monitoring-distributed-systems/',
            'Google SRE Book · free',
            'The four golden signals: latency, traffic, errors, saturation. Everything else is noise.'
          ),
          read(
            'How to write an incident post-mortem',
            'https://response.pagerduty.com/after/post_mortem_process/',
            'PagerDuty · free playbook',
            "Blameless, factual, actionable. Copy the structure; make it your team's."
          ),
          read(
            'Twelve-Factor: Logs',
            'https://12factor.net/logs',
            '12factor.net · free',
            'Treat logs as event streams. Write JSON to stdout; let the platform ship them.'
          ),
        ],
        items: [
          item(
            'Docker & Docker Compose',
            '“Works on my machine” is a configuration bug. Containers make the runtime explicit.',
            'Build a small image, run app, database and worker with Compose, and keep secrets out of the image.',
            'You can reproduce the staging environment locally and onboard a teammate faster.',
            [
              link('Docker: Get started', 'https://docs.docker.com/get-started/'),
              link('roadmap.sh: Docker', 'https://roadmap.sh/docker'),
            ],
            'In our code: `Dockerfile`, `docker/nginx/`, `docker/php/`, `docker-compose.yml`, `Makefile`.'
          ),
          item(
            'Environments & configuration',
            'Local, staging and production differ. If those differences live in code, every release is a surprise.',
            'Use environment variables for config, separate secrets from defaults and document every required variable.',
            'You can promote the same artifact through environments safely.',
            [
              link('The Twelve-Factor App', 'https://12factor.net/'),
              link('Laravel: Configuration & .env', `${laravelDocs}/configuration`),
            ],
            'In our code: `crm-backend/scripts/prepare_variables.sh` and `scripts/prepare_provision_vars.sh`.'
          ),
          item(
            'Deployment flow & rollbacks',
            'A release is not done until you know how to undo it.',
            'Use build → test → migrate → release → verify. Keep migrations backward compatible and document the rollback command.',
            'You can deploy with confidence because failure has a path back.',
            [link('Laravel: Deployment', `${laravelDocs}/deployment`)],
            'In our code: `crm-backend/deploy/`.'
          ),
          item(
            'CI/CD with GitLab CI',
            'Manual steps are where releases fail. The pipeline is the release contract.',
            'Define stages, cache dependencies, fail fast on lint and tests, and deploy only from the protected branch.',
            'You can explain exactly what will happen before a merge reaches staging.',
            [link('GitLab: Get started with CI/CD', 'https://docs.gitlab.com/ci/')],
            'In our code: `.gitlab-ci.yml` with install → lint → test → build → deploy.'
          ),
          item(
            'Nginx, PHP-FPM & Supervisor',
            'Most production incidents are configuration and process failures, not application logic.',
            'Understand how Nginx forwards to PHP-FPM, how workers are supervised and what happens when a worker dies.',
            'You can debug a 502 or a stuck queue without guessing.',
            [
              link('Nginx beginner’s guide', 'https://nginx.org/en/docs/beginners_guide.html'),
              link('Laravel: Supervisor config', `${laravelDocs}/queues#supervisor-configuration`),
            ]
          ),
          item(
            'Monitoring & error tracking',
            'You cannot fix what you cannot see. Logs, errors and metrics are part of the feature.',
            'Add structured logs and error tracking, verify the release with real requests and know where to look first.',
            'You shorten the time between a failure and a fix.',
            [
              link('Laravel Telescope', `${laravelDocs}/telescope`),
              link('Laravel Pail', `${laravelDocs}/logging#tailing-log-messages-using-pail`),
              link('Sentry for Laravel', 'https://docs.sentry.io/platforms/php/guides/laravel/'),
            ],
            'In our code: Telescope is installed in both Laravel projects.'
          ),
          item(
            'Structured logs & correlation IDs',
            'A log line without context is a line in a haystack. Correlation IDs turn a thousand lines into one trace.',
            'Emit JSON logs to stdout. Generate a request ID at the edge (middleware), attach it to the Laravel log context, the Sentry scope, every outbound HTTP call and every queued job.',
            "You can reconstruct a single user's request end to end, across web / queue / DB, in minutes rather than hours.",
            [
              link('Twelve-Factor: Logs', 'https://12factor.net/logs'),
              link('Laravel: Logging', `${laravelDocs}/logging`),
              link('Monolog JsonFormatter', 'https://github.com/Seldaek/monolog'),
            ],
            'Set `LOG_CHANNEL=stderr` + a JSON formatter in production. In our code: tie the ID into `Log::withContext(["request_id" => $id])` at the start of the request lifecycle.'
          ),
          item(
            "SLOs, SLIs & alerting that doesn't cry wolf",
            'Uptime is not the goal; user-perceived reliability is. An SLO forces you to pick a number you will defend.',
            'For each critical path, pick one SLI (latency p95, error rate), set a target (e.g. 99.5% over 7 days), compute the error budget, and alert *only* when the budget burns fast enough to miss the target.',
            'You stop paging on noise and start paging on things that actually matter to users.',
            [
              link('Google SRE: SLOs', 'https://sre.google/sre-book/service-level-objectives/'),
              link(
                'Google SRE: Monitoring',
                'https://sre.google/sre-book/monitoring-distributed-systems/'
              ),
              link('Burn-rate alerts', 'https://sre.google/workbook/alerting-on-slos/'),
            ],
            'Start with ONE SLO per phase gate. More targets than you can defend is noise with a dashboard.'
          ),
          item(
            'Incident response & post-mortems',
            'The question is not *if* production breaks; it is *how fast* you detect, communicate, mitigate and learn.',
            'Write a 10-minute runbook (who leads, who comms, where logs live, how to roll back). After every incident, write a blameless post-mortem with timeline, impact, root cause, action items with owners.',
            'You turn outages into permanent improvements instead of permanent anxiety.',
            [
              link(
                'PagerDuty: post-mortems',
                'https://response.pagerduty.com/after/post_mortem_process/'
              ),
              link('PagerDuty: incident response', 'https://response.pagerduty.com/'),
              link(
                'Google SRE: Managing incidents',
                'https://sre.google/sre-book/managing-incidents/'
              ),
            ],
            'Blameless means: the system allowed the mistake. Fix the system. Humans in incidents did the best they could with what they had.'
          ),
        ],
      },
    ],
    template: {
      title: 'Release checklist',
      items: [
        'Pest tests for the critical paths and one failure case',
        'Frontend test for a user-visible state',
        'Pint and PHPStan running in CI',
        'OWASP review with one real risk documented',
        'Docker Compose for app, database and worker',
        'Green pipeline that deploys to staging',
        'Structured JSON logs with a request/correlation ID threaded end to end',
        'One documented SLO with its SLI, target, window and alert condition',
        'A 10-minute incident runbook + rollback steps',
      ],
    },
    prompts: [
      'List the test cases missing for [my feature]. I will write them, then you review them.',
      'Explain every stage of .gitlab-ci.yml and what would happen if each one failed.',
      'Act as a security reviewer. Check this code against the OWASP Top 10 and explain each risk you find.',
    ],
    gates: [
      'Your feature has Pest tests that fail when the behaviour breaks.',
      'You can run, read and fix the GitLab CI pipeline.',
      'You can review code against the OWASP Top 10.',
      'Staging is running the Dockerised app and you can verify it with logs and metrics.',
      'You can trace one request end to end using a correlation ID.',
      'You have defined one SLO and can explain when it would page you.',
      'You have a written incident runbook and a template for a blameless post-mortem.',
    ],
  },
  {
    key: 'architecture',
    number: 5,
    weeks: 'Weeks 13–14',
    title: 'Architecture & System Design',
    goal: 'Move from writing features to making engineering decisions and designing systems end to end.',
    proof: 'A reviewed capstone design doc with trade-offs, C4 diagram and ADRs',
    tone: 'rose',
    role: {
      title: 'Software Architect',
      summary:
        'You can explain why the code is structured the way it is, design a system end to end and defend the trade-offs in review.',
      responsibilities: [
        'Choose patterns and boundaries based on change, not fashion.',
        'Explain the domain structure in `crm-backend` and `ataa-crm-saas`.',
        'Design for failure, scale and multi-tenancy with explicit trade-offs.',
        'Write a design doc that a team can build from.',
      ],
    },
    weeksData: [
      {
        number: 13,
        stage: 'Learn',
        title: 'Patterns and our domain architecture',
        outcomes: [
          'Recognise the patterns already used in our codebase.',
          'Explain why we split Actions, Queries, DTOs and Policies.',
          'Compare framework-free Slim with a full Laravel application.',
        ],
        task: task(
          'Write pattern notes from our code',
          'Pick three patterns in `crm-backend` or `ataa-crm-saas`, find the real code, and write notes on why each exists and what would happen without it.',
          [
            'Find one Strategy, one Action/Query split and one Event/Listener flow.',
            'Open every file involved and trace the call path.',
            'Write a short note per pattern: problem, implementation, trade-off, alternative.',
            'Compare the same responsibility in `new-muslim-academy-slim-api` if it exists.',
          ],
          [
            'A pattern is a response to a pressure. If you cannot name the pressure, the pattern is decoration.',
            'In our code: Strategy in `ataa-crm-saas/src/Domain/Billing/Services/PaymentGatewayManager.php`; Actions and Queries in `crm-backend/src/Domain/Contact/`.',
            'Do not copy a pattern from a blog without checking how this team uses it.',
            'Write the trade-off in plain language: what becomes easier, what becomes harder.',
          ],
          'You have three short pattern notes, each with a real call path, the pressure it solves and the trade-off it introduces.'
        ),
        resources: [
          read(
            'Refactoring Guru: Design Patterns (PHP)',
            'https://refactoring.guru/design-patterns/php',
            'Refactoring Guru · free',
            'Use the PHP examples, then find one in our code.'
          ),
          read(
            'Laravel Beyond CRUD',
            'https://laravel-beyond-crud.com/',
            'Spatie · book',
            'This is the closest published model to our domain structure.'
          ),
          read(
            'roadmap.sh: Software Design & Architecture',
            'https://roadmap.sh/software-design-architecture',
            'roadmap.sh · free',
            'Use it to name the concepts you do not yet know.'
          ),
          read(
            'Martin Fowler: Monolith First',
            'https://martinfowler.com/bliki/MonolithFirst.html',
            'Martin Fowler · free',
            'Understand why starting with a monolith is often the lower-risk choice.'
          ),
          read(
            'Martin Fowler: Bounded Context',
            'https://martinfowler.com/bliki/BoundedContext.html',
            'Martin Fowler · free',
            'Use bounded contexts to reason about `ataa-crm-saas` and `crm-backend`.'
          ),
          read(
            'Slim 4 docs',
            'https://www.slimframework.com/docs/v4/',
            'Slim · free docs',
            'Compare the framework surface with Laravel.'
          ),
        ],
        items: [
          item(
            'Common design patterns',
            'Patterns give the team a shared name for a decision and its trade-offs.',
            'Learn Repository, Service, Strategy, Observer, Factory and Pipeline. Find one real use and one place where a pattern would be overkill.',
            'You can discuss design without arguing about taste.',
            [
              link(
                'Refactoring Guru: Design Patterns (PHP)',
                'https://refactoring.guru/design-patterns/php'
              ),
            ],
            'In our code: Strategy in `ataa-crm-saas/src/Domain/Billing/Services/PaymentGatewayManager.php` with `ManualPaymentGateway` and `NullPaymentGateway`.'
          ),
          item(
            'Our domain-driven structure',
            'The structure is not ceremony. It keeps business rules out of HTTP controllers and makes them testable.',
            'Learn how Actions, Queries, DTOs, Repositories, Policies and Events divide responsibility. Trace one feature through each layer.',
            'You can add a feature in the right place instead of growing a controller.',
            [link('Laravel Beyond CRUD', 'https://laravel-beyond-crud.com/')],
            'In our code: the Architecture section of `crm-backend/CLAUDE.md`; `src/Domain/Contact/` and contracts in `src/Infrastructure/Contact/`.'
          ),
          item(
            'Modularity, coupling & cohesion',
            'A module should change for one reason and hide its details from the rest of the system.',
            'Look for modules with one clear responsibility, explicit interfaces and few reasons to edit unrelated files.',
            'You reduce the blast radius of a change.',
            [
              link(
                'roadmap.sh: Software Design & Architecture',
                'https://roadmap.sh/software-design-architecture'
              ),
            ]
          ),
          item(
            'Monolith vs. microservices & DDD basics',
            'Microservices are an organisational and operational choice, not a maturity badge.',
            'Compare deployment, failure, data ownership and team boundaries. Use bounded contexts to decide where a split could make sense later.',
            'You can challenge “we should split it” with a real trade-off.',
            [
              link(
                'Martin Fowler: Monolith First',
                'https://martinfowler.com/bliki/MonolithFirst.html'
              ),
              link(
                'Martin Fowler: Bounded Context',
                'https://martinfowler.com/bliki/BoundedContext.html'
              ),
            ],
            'In our code: `ataa-crm-saas` and `crm-backend` are two services that talk via webhooks.'
          ),
          item(
            'Framework-free contrast with Slim',
            'A framework hides decisions. Seeing a small app without one makes those decisions visible.',
            'Compare routing, dependency injection, middleware and error handling in Slim with Laravel.',
            'You understand what Laravel gives you and what you give up by using it.',
            [link('Slim 4 docs', 'https://www.slimframework.com/docs/v4/')],
            'In our code: `new-muslim-academy-slim-api` (Slim 4 + PHP-DI).'
          ),
        ],
      },
      {
        number: 14,
        stage: 'Prove',
        title: 'System design and the design doc',
        outcomes: [
          'Turn requirements into a system design with explicit constraints.',
          'Estimate load, choose boundaries and design for failure.',
          'Write and defend a design doc with C4 diagrams and ADRs.',
        ],
        task: task(
          'Write and defend the capstone design doc',
          'Write a 1–2 page design doc for your capstone, then have the team review every trade-off before you build.',
          [
            'Write the problem, users, functional and non-functional requirements.',
            'Estimate the important numbers: data volume, requests, queue load and storage.',
            'Draw a C4-style context and container diagram.',
            'Describe the API contract, data model, failure modes and rollback.',
            'Record at least two ADRs with the alternatives considered.',
            'Present it to the team and log every challenge and decision.',
          ],
          [
            'A design doc is not a wish list. Every box should have a reason and a failure mode.',
            'Use the team’s real scale, not a fictional billion users.',
            'If you cannot estimate it, name the assumption and how you would verify it.',
            'In our code: Scribe docs at `/docs` are our API contract; `ataa-crm-saas` → `crm-backend` provisioning is a real distributed flow to study.',
          ],
          'The team has reviewed the doc, every open question has an owner, and the trade-offs and failure modes are explicit.'
        ),
        resources: [
          read(
            'System Design Primer',
            'https://github.com/donnemartin/system-design-primer',
            'GitHub · free',
            'Use the index and the exercises, not the whole repo in one sitting.'
          ),
          read(
            'roadmap.sh: System Design',
            'https://roadmap.sh/system-design',
            'roadmap.sh · free',
            'Use it to find gaps in your design vocabulary.'
          ),
          read(
            'System Design Primer: Back-of-the-envelope',
            'https://github.com/donnemartin/system-design-primer#appendix',
            'GitHub · free',
            'Practise one estimate with explicit assumptions.'
          ),
          read(
            'ByteByteGo',
            'https://bytebytego.com/',
            'ByteByteGo · free/paid',
            'Use the free articles and videos for caching, queues and scaling.'
          ),
          read(
            'Stripe: Idempotent requests',
            'https://docs.stripe.com/api/idempotent_requests',
            'Stripe docs · free',
            'Idempotency is a design requirement for retries and payments.'
          ),
          read(
            'Designing Data-Intensive Applications',
            'https://dataintensive.net/',
            'Martin Kleppmann · book',
            'Read chapters 1 and 8 for reliability, scalability and failure.'
          ),
          read(
            'Frontend System Design (Arabic)',
            'https://www.youtube.com/watch?v=CTwLp4XzZis&list=PLH_t3aTgqQcBsTKTja9VXQCoBrctPbxl2',
            'Abdallah Hemdan · YouTube',
            'Connect frontend state and performance to the backend design.'
          ),
          read(
            'Frontend Performance (Arabic)',
            'https://www.youtube.com/watch?v=WYSt5e7fLWU&list=PLH_t3aTgqQcAFpAc58kJ4QLIn9y_I9zP1',
            'Abdallah Hemdan · YouTube',
            'Name one performance budget for the capstone.'
          ),
          read(
            'Martin Fowler: Is High Quality Software Worth the Cost?',
            'https://martinfowler.com/articles/is-quality-worth-cost.html',
            'Martin Fowler · free',
            'Use it to discuss quality trade-offs without absolutes.'
          ),
          read(
            'C4 model',
            'https://c4model.com/',
            'c4model.com · free',
            'Draw the context and container levels, not every class.'
          ),
          read(
            'Architecture Decision Records',
            'https://adr.github.io/',
            'adr.github.io · free',
            'Write one ADR for every decision you expect to revisit.'
          ),
          read(
            'Design Docs at Google',
            'https://www.industrialempathy.com/posts/design-docs-at-google/',
            'industrialempathy.com · free',
            'Use the structure as a model, not a template to copy blindly.'
          ),
          read(
            'Google SRE book: Postmortem Culture',
            'https://sre.google/sre-book/postmortem-culture/',
            'Google SRE · free',
            'Design for learning from failure, not blaming people.'
          ),
          read(
            'OpenAPI: Getting started',
            'https://learn.openapis.org/',
            'OpenAPI · free',
            'Describe the API contract in a tool-readable format if it helps.'
          ),
        ],
        items: [
          item(
            'Requirements: functional & non-functional',
            'A design without constraints is just a diagram. Requirements tell you what the system must optimise for.',
            'Write what the system does and how well: latency, availability, security, tenancy, compliance and accessibility.',
            'You make design decisions against explicit goals instead of taste.',
            [
              link('System Design Primer', 'https://github.com/donnemartin/system-design-primer'),
              link('roadmap.sh: System Design', 'https://roadmap.sh/system-design'),
            ]
          ),
          item(
            'Back-of-the-envelope estimation',
            'Rough numbers expose whether a design is plausible before you build it.',
            'Estimate users, requests per second, data growth, queue volume and storage. State every assumption and its source.',
            'You can challenge an unrealistic design with a simple calculation.',
            [
              link(
                'System Design Primer: Back-of-the-envelope',
                'https://github.com/donnemartin/system-design-primer#appendix'
              ),
            ]
          ),
          item(
            'Caching, queues & horizontal scaling',
            'These tools solve specific problems. Used blindly, they add failure modes and cost.',
            'Know what to cache, what to queue and what must stay consistent. Describe the failure behaviour of each.',
            'You can scale a system without making correctness optional.',
            [
              link('ByteByteGo', 'https://bytebytego.com/'),
              link('ByteByteGo YouTube', 'https://www.youtube.com/@ByteByteGo'),
            ]
          ),
          item(
            'Designing for failure',
            'Networks fail, providers time out and jobs retry. A reliable system assumes failure.',
            'Use timeouts, bounded retries with backoff, idempotency keys and dead-letter handling. Document what the user sees.',
            'You build systems that degrade gracefully instead of cascading.',
            [link('Stripe: Idempotent requests', 'https://docs.stripe.com/api/idempotent_requests')]
          ),
          item(
            'Frontend system design & performance',
            'The user experiences the whole system. Backend latency and frontend rendering are one performance budget.',
            'Define loading states, caching, pagination, optimistic updates and a measurable performance target.',
            'You design the end-to-end experience, not just the API.',
            [
              link(
                'Frontend System Design (Arabic)',
                'https://www.youtube.com/watch?v=CTwLp4XzZis&list=PLH_t3aTgqQcBsTKTja9VXQCoBrctPbxl2'
              ),
              link(
                'Frontend Performance (Arabic)',
                'https://www.youtube.com/watch?v=WYSt5e7fLWU&list=PLH_t3aTgqQcAFpAc58kJ4QLIn9y_I9zP1'
              ),
            ]
          ),
          item(
            'Trade-off thinking',
            'There is no best architecture, only one that fits the constraints and the team.',
            'Name what you optimise for, what you sacrifice and how you would know the decision was wrong.',
            'You make decisions that can survive review and changing requirements.',
            [
              link(
                'Martin Fowler: Is High Quality Software Worth the Cost?',
                'https://martinfowler.com/articles/is-quality-worth-cost.html'
              ),
            ]
          ),
          item(
            'Design docs, C4 & ADRs',
            'A design is only useful if the team can build from it and revisit the decisions later.',
            'Write a short design doc, draw context and container diagrams, and record decisions with alternatives and consequences.',
            'You create shared understanding before code exists.',
            [
              link('C4 model', 'https://c4model.com/'),
              link('Architecture Decision Records', 'https://adr.github.io/'),
              link(
                'Design Docs at Google',
                'https://www.industrialempathy.com/posts/design-docs-at-google/'
              ),
            ]
          ),
          item(
            'Product thinking & MVP mindset',
            'The goal is a useful release, not the most complete system.',
            'Find the smallest end-to-end slice that proves the idea, then add capability behind it.',
            'You ship value early and learn before investing in the wrong thing.',
            [
              link(
                'The Pragmatic Programmer',
                'https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/'
              ),
            ]
          ),
          item(
            'Ownership & postmortems',
            'Ownership does not end at deploy. Learning from failure is part of the job.',
            'Define who owns the feature, how it is monitored and how incidents are reviewed without blame.',
            'You build trust by handling failure transparently.',
            [
              link(
                'Google SRE book: Postmortem Culture',
                'https://sre.google/sre-book/postmortem-culture/'
              ),
            ]
          ),
          item(
            'API contracts with OpenAPI',
            'A contract that only lives in a wiki drifts. Make it executable and review it with the client team.',
            'Describe endpoints, schemas and errors, then generate or validate docs from the contract.',
            'You prevent frontend/backend integration surprises.',
            [link('OpenAPI: Getting started', 'https://learn.openapis.org/')],
            'In our code: Scribe docs at `/docs` are our current API contract.'
          ),
        ],
      },
    ],
    template: {
      title: 'Design doc outline',
      items: [
        'Problem, users and success metrics',
        'Functional and non-functional requirements',
        'Back-of-the-envelope estimates with assumptions',
        'Context and container diagrams',
        'Data model and API contract',
        'Failure modes, retries and rollback',
        'At least two ADRs with alternatives',
        'Open questions with owners',
      ],
    },
    prompts: [
      'Draw the flow when a new organization is created in ataa-crm-saas until its tenant exists in crm-backend. Mark where it could fail.',
      'Why does this project split Actions, Queries and DTOs? Compare it with putting everything in controllers.',
      'Run a mock system design interview with me: design a multi-tenant email broadcast system. Ask follow-up questions like an interviewer.',
    ],
    gates: [
      'You can explain why our code is split into Actions, Queries and DTOs.',
      'You can draw the tenant provisioning flow and name its failure points.',
      'Your design doc names its trade-offs and passes team review.',
    ],
  },
  {
    key: 'capstone',
    number: 6,
    weeks: 'Weeks 15–16',
    title: 'Capstone Project',
    goal: 'Prove full-stack ownership by building, testing and deploying one real project, in pairs or individually.',
    proof: 'Deployed full-stack app with a green pipeline, executed test plan and 15-minute demo',
    tone: 'indigo',
    role: {
      title: 'Full-Stack Owner',
      summary:
        'You can take a scoped idea from spec to deployed product, explain every trade-off and support it after release.',
      responsibilities: [
        'Build a multi-tenant or payment feature end to end with Vue and Laravel.',
        'Prove it with a test plan, automated tests and a green pipeline.',
        'Deploy it to staging in Docker and demo the trade-offs.',
        'Write down what AI helped with and where it was wrong.',
      ],
    },
    weeksData: [
      {
        number: 15,
        stage: 'Practice',
        title: 'Build the capstone core',
        outcomes: [
          'Choose the multi-tenant or payment path and scope the core.',
          'Build one complete vertical slice with tenant or payment safety.',
          'Keep the API contract and design doc in sync with the code.',
        ],
        task: task(
          'Build the capstone core',
          'Pick Option A (multi-tenant SaaS) or Option B (payment app) and build one complete vertical slice against the approved design doc.',
          [
            'Choose the option and write the smallest end-to-end slice that proves it.',
            'Build the backend endpoint, the Vue screen and the error states.',
            'Add tenant or payment isolation and prove it with a test.',
            'Update the API contract and design doc with what changed.',
            'Open an MR with a draft demo script.',
          ],
          [
            'A vertical slice is better than five half-built layers. Ship one path a user can complete.',
            'Test the dangerous case: another tenant accessing the record, or a duplicate webhook charging twice.',
            'Keep the capstone smaller than you want. The two weeks are for a working core, not a finished product.',
            'In our code: `crm-backend/src/Support/MultiTenancy/` for tenancy; `ataa-crm-saas/src/Domain/Billing/` for payments.',
          ],
          'One user journey works end to end, the tenant or payment safety test passes, and the design doc matches the code.'
        ),
        resources: [
          read(
            'Laravel: Global Scopes',
            `${laravelDocs}/eloquent#global-scopes`,
            'Laravel docs · free',
            'Understand what a global scope does before relying on it for isolation.'
          ),
          read(
            'spatie/laravel-permission: Teams',
            'https://spatie.be/docs/laravel-permission/v6/basic-usage/teams-permissions',
            'spatie · free docs',
            'Use teams only if roles really differ per tenant.'
          ),
          read(
            'Laravel: Queues',
            `${laravelDocs}/queues`,
            'Laravel docs · free',
            'Make tenant context explicit in queued jobs.'
          ),
          read(
            'Laravel: Cache tags',
            `${laravelDocs}/cache#cache-tags`,
            'Laravel docs · free',
            'Cache tags help, but tenant-aware keys are still required.'
          ),
          read(
            'Moyasar docs',
            'https://docs.moyasar.com/',
            'Moyasar · free docs',
            'Use the sandbox and read the webhook section.'
          ),
          read(
            'Tap Payments docs',
            'https://developers.tap.company/',
            'Tap · free docs',
            'Compare the payment intent and webhook models.'
          ),
          read(
            'Stripe docs',
            'https://docs.stripe.com/',
            'Stripe · free docs',
            'Use the sandbox and idempotency examples.'
          ),
        ],
        items: [
          item(
            'Tenant isolation',
            'Multi-tenancy fails when one missing scope exposes another customer’s data.',
            'Choose one database scoped by `organization_id` or a database per tenant. Apply the scope in models, middleware, jobs and cache keys.',
            'You can build a SaaS feature without crossing tenant boundaries.',
            [link('Laravel: Global Scopes', `${laravelDocs}/eloquent#global-scopes`)],
            'In our code: `crm-backend/src/Support/MultiTenancy/` (`TenantScope`, `BelongsToTenant`, `InitializeTenancy`, `TenantResolver`).'
          ),
          item(
            'Tenant provisioning across two services',
            'Provisioning crosses an API boundary. Partial success is the hard part.',
            'Make the webhook idempotent, persist the provisioning state and define what happens if one service succeeds and the other fails.',
            'You can add a tenant without leaving orphaned or half-created data.',
            [],
            'In our code: `ataa-crm-saas/src/Domain/Organization/Services/TenantProvisionService.php` → webhook → `crm-backend/app/Api/V1/Controllers/Webhook/SaasCreateTenantWebhookController.php` → `src/Support/MultiTenancy/Actions/ProvisionTenantFromSaasAction.php`.'
          ),
          item(
            'Roles & permissions per tenant',
            'A global admin role is not enough when permissions differ by organization.',
            'Use spatie teams or an explicit tenant-role table. Test the same user with different roles in two tenants.',
            'You can support enterprise permissions without leaking access across customers.',
            [
              link(
                'spatie/laravel-permission: Teams',
                'https://spatie.be/docs/laravel-permission/v6/basic-usage/teams-permissions'
              ),
            ]
          ),
          item(
            'Tenant-aware queues, cache & storage',
            'Background work and cached data do not automatically inherit the request’s tenant context.',
            'Put the tenant ID in the job payload, prefix cache keys, and separate storage paths per tenant.',
            'You avoid the most common multi-tenant production incidents.',
            [
              link('Laravel: Queues', `${laravelDocs}/queues`),
              link('Laravel: Cache tags', `${laravelDocs}/cache#cache-tags`),
            ]
          ),
        ],
      },
      {
        number: 16,
        stage: 'Prove',
        title: 'Ship, test, deploy and demo',
        outcomes: [
          'Add the second capstone path or deepen the chosen one.',
          'Execute the test plan and get the pipeline green.',
          'Deploy to staging and demo the trade-offs and AI corrections.',
        ],
        task: task(
          'Ship, test, deploy and demo the capstone',
          'Finish the capstone, execute the test plan, deploy to staging through CI, and deliver a 15-minute demo with trade-offs.',
          [
            'Complete the payment path or the tenant path, whichever you chose.',
            'Execute the Plan 1 test plan and file every bug you find.',
            'Get the automated tests and GitLab CI pipeline green.',
            'Deploy to staging in Docker and run the demo script twice.',
            'Present the demo, the trade-offs and one place AI helped and one place you corrected it.',
          ],
          [
            'Demo the product, not the code tour. Show the user problem, the flow and the failure handling.',
            'If a bug is still open, say so and explain the impact. Hiding it is worse than the bug.',
            'The prompt log should show your thinking, not a wall of copy-pasted prompts.',
            'In our code: use the Plan 1 spec and QA templates, not a new process invented for the demo.',
          ],
          'The app is deployed to staging through CI, the test plan is executed, the demo runs, and the trade-offs and AI corrections are documented.'
        ),
        resources: [
          read(
            'Moyasar docs',
            'https://docs.moyasar.com/',
            'Moyasar · free docs',
            'Use the sandbox for the demo.'
          ),
          read(
            'Tap Payments docs',
            'https://developers.tap.company/',
            'Tap · free docs',
            'Use the sandbox for the demo.'
          ),
          read(
            'Stripe: Webhooks',
            'https://docs.stripe.com/webhooks',
            'Stripe docs · free',
            'Verify signatures and handle duplicate events.'
          ),
          read(
            'Stripe: Idempotent requests',
            'https://docs.stripe.com/api/idempotent_requests',
            'Stripe docs · free',
            'Show how a retry does not create a second charge.'
          ),
          read(
            'PCI Security Standards: Merchant resources',
            'https://www.pcisecuritystandards.org/merchants/',
            'PCI SSC · free',
            'Never store card data. Use the provider’s hosted fields.'
          ),
          read(
            'NeetCode Problems',
            'https://neetcode.io/problems',
            'NeetCode · free',
            'Keep the weekly problem-solving session going through the capstone.'
          ),
          read(
            'Anthropic: Prompt engineering overview',
            'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview',
            'Anthropic · free',
            'Reuse the Plan 1 prompt library and record where it failed.'
          ),
          read(
            'Claude Code best practices',
            'https://code.claude.com/docs/en/best-practices',
            'Claude Code docs · free',
            'Plan first, review every diff and never merge code you cannot explain.'
          ),
          read(
            'TypeScript Handbook',
            'https://www.typescriptlang.org/docs/handbook/intro.html',
            'TypeScript docs · free',
            'Use the capstone to tighten the frontend types.'
          ),
          read(
            'Vue guide',
            'https://vuejs.org/guide/introduction.html',
            'Vue docs · free',
            'Use Composition API and Pinia deliberately.'
          ),
          read(
            'Nuxt docs',
            'https://nuxt.com/docs',
            'Nuxt docs · free',
            'Know when Nuxt adds value over a plain Vue SPA.'
          ),
          read(
            'Tailwind docs',
            'https://tailwindcss.com/docs',
            'Tailwind docs · free',
            'Keep the UI consistent without custom CSS for everything.'
          ),
          read(
            'Atlassian: Story points and estimation',
            'https://www.atlassian.com/agile/project-management/estimation',
            'Atlassian · free',
            'Use estimation to protect the two-week scope.'
          ),
          read(
            'Google: Technical Writing courses',
            'https://developers.google.com/tech-writing',
            'Google · free',
            'Write the demo and README clearly.'
          ),
          read(
            'Atlassian Agile Coach',
            'https://www.atlassian.com/agile',
            'Atlassian · free',
            'Use the review and retrospective formats.'
          ),
          read(
            'Scrum Guide',
            'https://scrumguides.org/scrum-guide.html',
            'Scrum Guides · free',
            'Use the review and retrospective ideas without ceremony for its own sake.'
          ),
        ],
        items: [
          item(
            'Payment gateway integration',
            'Payments are where correctness, security and user trust meet.',
            'Use the provider sandbox, keep gateway code behind an interface and never store raw card data.',
            'You can add a real payment path without coupling the app to one provider.',
            [
              link('Moyasar docs', 'https://docs.moyasar.com/'),
              link('Tap Payments docs', 'https://developers.tap.company/'),
              link('Stripe docs', 'https://docs.stripe.com/'),
            ],
            'In our code: `ataa-crm-saas/src/Domain/Billing/` and `src/Infrastructure/Billing/Gateways/PaymentGatewayInterface.php`.'
          ),
          item(
            'Payment webhooks: verification & idempotency',
            'A webhook can arrive twice, late or not at all. The system must survive all three.',
            'Verify the signature, store the event ID, process idempotently and return before doing slow work.',
            'You can reconcile payments without double-charging or losing an event.',
            [
              link('Stripe: Webhooks', 'https://docs.stripe.com/webhooks'),
              link(
                'Stripe: Idempotent requests',
                'https://docs.stripe.com/api/idempotent_requests'
              ),
            ]
          ),
          item(
            'Invoices, payments & refunds',
            'Money state must be explicit. “Paid” is not a boolean you flip and hope.',
            'Model invoice, payment and refund states with allowed transitions. Test the failure and refund paths.',
            'You can explain the money state at any point in the flow.',
            [],
            'In our code: `ataa-crm-saas/src/Infrastructure/Billing/Actions/` (`CreateInvoice`, `IssueInvoice`, `RecordInvoicePayment`, `CancelInvoice`).'
          ),
          item(
            'PCI basics',
            'Card data is a liability. The safest card data is the card data you never store.',
            'Use hosted fields or a provider SDK, keep card data out of logs and understand the merchant scope.',
            'You can ship payments without increasing the company’s compliance surface unnecessarily.',
            [
              link(
                'PCI Security Standards: Merchant resources',
                'https://www.pcisecuritystandards.org/merchants/'
              ),
            ]
          ),
          item(
            'Capstone spec signed off by the PO',
            'A capstone without a signed-off scope becomes an endless project.',
            'Use the Plan 1 spec template, get the PO to sign off the problem, scope and success criteria.',
            'You practise the handoff between product and engineering.',
            [],
            'In our code: reuse the Plan 1 spec template and review process.'
          ),
          item(
            'Capstone design doc approved',
            'The design doc is the bridge between the spec and the implementation.',
            'Get the Phase 5 design doc reviewed and update it when the implementation changes.',
            'You keep architecture decisions visible instead of discovering them in code review.',
            [],
            'In our code: reuse the Phase 5 design doc and ADR format.'
          ),
          item(
            'Prompt log & AI corrections',
            'AI is part of the workflow, but ownership requires knowing where it helped and where it was wrong.',
            'Record the prompts, the useful outputs and at least one correction. Never paste secrets or customer data.',
            'You demonstrate judgement, not just tool usage.',
            [
              link(
                'Anthropic: Prompt engineering overview',
                'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview'
              ),
            ],
            'In our code: reuse the Plan 1 prompt library and its verification rules.'
          ),
          item(
            'Vue frontend + Laravel API',
            'The capstone must prove the full path, not just one layer.',
            'Build the user flow, handle loading/empty/error states and keep the API contract in sync.',
            'You can own a feature across the whole stack.',
            []
          ),
          item(
            'Test plan executed & CI green',
            'A demo without a test plan is a rehearsal, not evidence.',
            'Execute the Plan 1 QA template, file bugs, fix the critical ones and get the pipeline green.',
            'You can prove the release is ready and explain what is still risky.',
            []
          ),
          item(
            'Docker deployment to staging',
            'The capstone must run outside your laptop.',
            'Deploy the same image to staging, run migrations safely and verify with logs and a real user flow.',
            'You can hand the project to someone else without a setup call.',
            []
          ),
          item(
            '15-minute demo & trade-offs',
            'The demo is where you show that you understand what you built and why.',
            'Show the problem, the flow, the failure handling, the trade-offs and one AI correction.',
            'You build confidence with the team and product owner.',
            []
          ),
          item(
            'Weekly NeetCode session',
            'Problem solving is a long game. One session a week keeps the muscle alive.',
            'Continue the NeetCode list in order and note the last problem solved in your tracker.',
            'You keep improving the algorithmic thinking that supports backend work.',
            [
              link('NeetCode Problems', 'https://neetcode.io/problems'),
              link('NeetCode roadmap', 'https://neetcode.io/roadmap'),
              link('Big-O Cheat Sheet', 'https://www.bigocheatsheet.com/'),
            ],
            'Ongoing weeks 1–16: one session a week, in list order, without skipping ahead.'
          ),
          item(
            'Weekly AI engineering learning',
            'Using AI well is a skill, not a shortcut. Reflect on one useful pattern or failure each week.',
            'Write one prompt you will reuse or one time AI was wrong and how you caught it.',
            'You build a personal, verified prompt library instead of relying on luck.',
            [
              link(
                'Anthropic: Building effective AI agents',
                'https://www.anthropic.com/engineering/building-effective-agents'
              ),
              link('Claude Code docs', 'https://code.claude.com/docs/en/overview'),
              link('Claude Code best practices', 'https://code.claude.com/docs/en/best-practices'),
            ],
            'In our code: `CLAUDE.md` files in `crm-backend` and `ataa-crm-saas` show how the team guides an agent.'
          ),
          item(
            'Weekly frontend level-up',
            'You are becoming full-stack, not leaving the frontend behind.',
            'Make one small improvement to your Vue, TypeScript, Nuxt or Tailwind knowledge and apply it to the current screen.',
            'You keep shipping better UI while growing backend depth.',
            [
              link(
                'TypeScript Handbook',
                'https://www.typescriptlang.org/docs/handbook/intro.html'
              ),
              link('Vue guide', 'https://vuejs.org/guide/introduction.html'),
              link('Nuxt docs', 'https://nuxt.com/docs'),
              link('Tailwind docs', 'https://tailwindcss.com/docs'),
            ]
          ),
          item(
            'Weekly soft-skills review',
            'The last 10% of a project is usually communication, not code.',
            'Practise estimating, writing docs, working with QA and product, and giving a clear status update.',
            'You become easier to trust with larger work.',
            [
              link(
                'Atlassian: Story points and estimation',
                'https://www.atlassian.com/agile/project-management/estimation'
              ),
              link(
                'Google: Technical Writing courses',
                'https://developers.google.com/tech-writing'
              ),
              link('Atlassian Agile Coach', 'https://www.atlassian.com/agile'),
              link('Scrum Guide', 'https://scrumguides.org/scrum-guide.html'),
            ]
          ),
        ],
      },
    ],
    template: {
      title: 'Capstone delivery checklist',
      items: [
        'Signed-off spec and approved design doc',
        'One complete tenant or payment vertical slice',
        'Vue frontend + Laravel API with error handling',
        'Executed test plan, automated tests and green CI',
        'Docker deployment to staging',
        '15-minute demo with trade-offs and AI corrections',
      ],
    },
    prompts: [
      'Read my design doc and propose an implementation plan. Do not write code until I approve the plan.',
      'Review my branch like a senior engineer before I open the merge request. Focus on tenancy, payments, tests and failure modes.',
      'Ask me the 10 hardest questions the team might ask in my demo.',
    ],
    gates: [
      'Your app is deployed to staging through CI and passes its own test plan.',
      'You can answer the team’s questions on every trade-off in the demo.',
      'You can show one place AI helped and one place you corrected it.',
    ],
  },
];
