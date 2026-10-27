import type { PlanPhase } from './types';

export const phases: PlanPhase[] = [
  {
    key: 'requirements',
    number: 1,
    weeks: 'Weeks 1–3',
    title: 'Requirements Gathering',
    goal: 'Turn a vague request into a clear, testable spec that developers, QA and the product owner all agree on — before any code is written.',
    proof: 'Full spec for a real backlog feature',
    tone: 'blue',
    role: {
      title: 'Requirements Analyst',
      summary:
        'You can own discovery and specification for a feature from the first question to a signed-off spec.',
      responsibilities: [
        'Run a stakeholder interview and send a decision-ready summary.',
        'Write stories, acceptance criteria, edge cases and non-functional requirements a developer and QA can act on.',
        'Defend the spec in review and keep scope under control.',
      ],
    },
    weeksData: [
      {
        number: 1,
        stage: 'Learn',
        title: 'Understand the problem',
        outcomes: [
          'Ask questions that reveal what people actually do, not what they say they want.',
          'Turn raw interview notes into user stories with testable acceptance criteria.',
          'Spot missing scope before it becomes a development surprise.',
        ],
        task: {
          title: 'Run one real discovery interview',
          brief:
            'Pick one real feature or backlog item. Interview a stakeholder or user for 25 minutes using The Mom Test rules. Do not pitch your idea; ask about what they do now, what breaks, and what they last did.',
          steps: [
            'Write 6 open questions about past behaviour, not opinions about the feature.',
            'Interview one person who actually uses the product. Take notes with their permission.',
            'Turn the notes into 3 user stories, each with 2 Given/When/Then acceptance criteria.',
            'Send the one-page summary back and ask: "Did I get this right?" Fix what you misunderstood.',
          ],
          hints: [
            'Question stems: “Walk me through the last time you did X”, “What happened next?”, “What did you do instead?”, “What was the most annoying part?”',
            'A usable story: “As a team lead, I want to filter contacts by last activity so I can follow up with inactive leads.” Criteria: Given I am on the contacts page, When I filter by “No activity in 30 days”, Then I see only contacts whose last activity is older than 30 days.',
            'If the stakeholder starts asking for a solution, write it down as a request, then return to: “What problem does that solve for you today?”',
            'Test each criterion: can a QA engineer prove it true or false without asking you? If not, rewrite it.',
          ],
          doneWhen:
            'You have a one-page interview note, 3 stories with criteria, and the interviewee confirms the summary is accurate.',
        },
        resources: [
          {
            kind: 'youtube',
            title: 'The Mom Test in 10 minutes',
            href: 'https://www.youtube.com/watch?v=VT_jCvel5Ag',
            source: 'Startup Istanbul · YouTube',
            focus:
              'Listen for the 3 rules: talk about their life, ask about the past, and listen more than you pitch.',
          },
          {
            kind: 'youtube',
            title: 'User stories and acceptance criteria — worked example',
            href: 'https://www.youtube.com/watch?v=q26147zlcMU',
            source: 'The Business Analysis Doctor · YouTube',
            focus: 'Watch how one vague story becomes small, testable Given/When/Then criteria.',
          },
          {
            kind: 'read',
            title: 'Shape Up (free online book)',
            href: 'https://basecamp.com/shapeup',
            source: 'Basecamp · free',
            focus:
              'Read chapters 2–4. Pay attention to finding the right problem and setting a fixed appetite.',
          },
          {
            kind: 'read',
            title: 'User stories',
            href: 'https://www.atlassian.com/agile/project-management/user-stories',
            source: 'Atlassian · free guide',
            focus: 'Use the examples to check that your stories are small, valuable and testable.',
          },
          {
            kind: 'read',
            title: 'User interviews',
            href: 'https://www.nngroup.com/articles/user-interviews/',
            source: 'Nielsen Norman Group · free article',
            focus:
              'Copy the interview structure and the rule about asking for real past behaviour.',
          },
        ],
        items: [
          {
            title: 'Asking the right questions',
            why: 'Most rework starts with a question nobody asked. Good discovery questions expose the real workflow, cost and constraints before a solution is chosen.',
            how: "Ask about past behaviour: 'Walk me through the last time…', 'What did you do next?', 'What breaks today?' Ask one question at a time and record exact words, not your interpretation.",
            impact:
              'You stop solving the wrong problem and become the person teammates trust to turn a vague request into a clear one.',
            body: "Who it's for, what problem, why now, how we'll know it worked, what's out of scope. Ask about past behavior, not opinions on your idea.",
            links: [{ label: 'The Mom Test', href: 'https://www.momtestbook.com/' }],
          },
          {
            title: 'Stakeholder interviews & meeting notes',
            why: 'A conversation without a written summary becomes five different memories. The summary is what the team can actually act on.',
            how: "Prepare 6–8 open questions, capture decisions and open questions live, send a one-page summary within 24 hours, and ask 'Did I get this right?'",
            impact:
              'You build a reputation for closing loops, which makes people more willing to give you access, context and responsibility.',
            body: 'Prepare a question list, listen actively, repeat back what you heard, send a summary with decisions and open questions.',
            links: [
              {
                label: 'Shape Up, chapters 2–4',
                href: 'https://basecamp.com/shapeup',
              },
            ],
          },
          {
            title: 'User stories',
            why: 'A story makes the role, action and benefit explicit, so scope can be estimated and tested instead of guessed.',
            how: "Write 'As a [role], I want [action], so that [benefit]'. Apply INVEST and split any story that contains more than one deliverable or outcome.",
            impact:
              'You learn to shape work into units that developers can build and QA can verify, the foundation of predictable delivery.',
            body: '"As a [role], I want [action], so that [benefit]", following INVEST (independent, negotiable, valuable, estimable, small, testable).',
            links: [
              {
                label: 'Atlassian: User stories',
                href: 'https://www.atlassian.com/agile/project-management/user-stories',
              },
              {
                label: 'INVEST (Agile Alliance)',
                href: 'https://www.agilealliance.org/glossary/invest/',
              },
            ],
          },
          {
            title: 'Acceptance criteria',
            why: "Criteria turn 'it works' into a shared, testable definition of done.",
            how: 'Use Given/When/Then for each important path. Cover positive, negative, permission and boundary cases, and check that QA can prove each one true or false.',
            impact:
              'You catch ambiguity before code exists, which makes you a stronger reviewer and a calmer engineer under deadline.',
            body: 'Given / When / Then.',
            links: [
              {
                label: 'Given When Then (Martin Fowler)',
                href: 'https://martinfowler.com/bliki/GivenWhenThen.html',
              },
              {
                label: 'Gherkin reference',
                href: 'https://cucumber.io/docs/gherkin/reference/',
              },
            ],
          },
          {
            title: 'Functional vs. non-functional requirements',
            why: 'A feature can work and still fail because it is slow, unsafe, unreadable in Arabic or visible to the wrong role.',
            how: 'For each story, ask about performance, security, permissions, audit, RTL/Arabic, accessibility and slow or offline networks. Write each answer as a measurable requirement.',
            impact:
              'You start designing for real users and real constraints, not just the happy-path demo.',
            body: 'What the system does vs. how well — performance, security, roles & permissions, Arabic/RTL, accessibility, audit.',
            links: [
              {
                label: 'ISO 25010 quality model',
                href: 'https://iso25000.com/index.php/en/iso-25000-standards/iso-25010',
              },
            ],
          },
        ],
      },
      {
        number: 2,
        stage: 'Practice',
        title: 'Make it complete and buildable',
        outcomes: [
          'Turn a vague ticket into a story a developer can start without a meeting.',
          'Find edge cases, missing states and non-functional requirements before build.',
          'Break a feature into FE / BE / QA tasks and estimate the work.',
        ],
        task: {
          title: 'Make one real ticket buildable',
          brief:
            'Take the highest-risk ticket on your board and rewrite it until a developer and a QA engineer can start from the ticket alone.',
          steps: [
            'Rewrite the ticket as a user story with at least 3 Given/When/Then criteria.',
            'List 5 unhappy paths and 3 non-functional requirements: roles, RTL/Arabic, performance or security.',
            'Review the linked Figma screen. Write every missing state and open question with an owner.',
            'Split the work into FE / BE / QA tasks, add estimates, and check it against Definition of Ready.',
          ],
          hints: [
            'Good criterion example: Given a broadcast is scheduled, When the scheduled time passes, Then exactly one message is sent and the status changes to Sent.',
            'Edge-case checklist: empty, max length, duplicate, wrong role, expired session, offline, slow network, Arabic/RTL, dark mode, permission denied.',
            'NFR examples: the list returns in under 2 seconds at p95; API failures return 4xx with a useful message; only Admin can delete; every UI string works in Arabic/RTL.',
            'Definition of Ready gate: problem clear, scope clear, criteria testable, design linked, dependencies named, and no open question without an owner.',
            'Split tasks by outcome, not by layer: “API returns the filtered list”, “UI renders the empty state”, “QA verifies the role matrix”.',
          ],
          doneWhen:
            'A developer and a QA engineer can read the ticket and start work without asking you a single question.',
        },
        resources: [
          {
            kind: 'youtube',
            title: 'Behaviour-driven acceptance criteria',
            href: 'https://www.youtube.com/watch?v=YseT9Wlkt5o',
            source: 'Joe Freeman · YouTube',
            focus:
              'Watch the bad-to-good examples. Copy the pattern for one of your own tickets after the video.',
          },
          {
            kind: 'youtube',
            title: 'How to estimate user stories',
            href: 'https://www.youtube.com/watch?v=M9_z0WVwKK8',
            source: 'Vibhor Chandel · YouTube',
            focus:
              'Focus on relative sizing and why the conversation matters more than the number.',
          },
          {
            kind: 'read',
            title: 'Given When Then',
            href: 'https://martinfowler.com/bliki/GivenWhenThen.html',
            source: 'Martin Fowler · free article',
            focus: 'Use this as the grammar for every acceptance criterion you write this week.',
          },
          {
            kind: 'read',
            title: 'Definition of Ready',
            href: 'https://www.agilealliance.org/glossary/definition-of-ready/',
            source: 'Agile Alliance · free glossary',
            focus:
              'Turn the checklist into a 5-question gate you apply before a ticket enters development.',
          },
          {
            kind: 'read',
            title: 'Big List of Naughty Strings',
            href: 'https://github.com/minimaxir/big-list-of-naughty-strings',
            source: 'GitHub · free reference',
            focus: 'Use it as a hostile-input checklist for the edge cases section of your ticket.',
          },
        ],
        items: [
          {
            title: 'Edge cases & unhappy paths',
            why: 'Most production bugs live in the cases nobody wrote down: empty data, duplicate clicks, expired sessions, wrong roles and slow networks.',
            how: 'Use a checklist: empty, maximum length, duplicate, invalid, unauthorized, offline, timeout, Arabic/English, RTL and long text. Write expected behaviour for each.',
            impact:
              'You become the person who finds the expensive problem before a customer does, a defining senior trait.',
            body: "Empty states, errors, limits, duplicates, slow network, other roles, other tenants' data, Arabic + English input, very long text.",
            links: [
              {
                label: 'Big List of Naughty Strings',
                href: 'https://github.com/minimaxir/big-list-of-naughty-strings',
              },
            ],
          },
          {
            title: 'Figma gap review',
            why: 'The design shows the happy screen, not the loading, empty, error and permission states that decide whether the feature feels finished.',
            how: 'Walk every screen through default, loading, empty, error, success, disabled, long content, mobile and RTL. Log each gap with a question and an owner.',
            impact:
              'You learn to read a design as a system rather than a picture, which improves both your planning and your UI implementation.',
            body: 'Missing loading / empty / error states, missing screens, unclear validation, mismatch with the API.',
            links: [{ label: 'Figma Dev Mode', href: 'https://www.figma.com/dev-mode/' }],
          },
          {
            title: 'Task breakdown & estimation',
            why: 'A story that is not broken down cannot be estimated honestly or tested properly.',
            how: 'Split by outcome (API, UI, permissions, QA), list dependencies, estimate relative size and check the ticket against the Definition of Ready.',
            impact:
              'You get better at planning your own work and surfacing risk early instead of discovering it at the end.',
            body: 'Split into FE / BE / QA / DevOps tasks, map dependencies, estimate; define a Definition of Ready.',
            links: [
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
            title: 'Handling scope changes',
            why: 'Scope grows by default. Without an explicit boundary, the team quietly commits to more than it can finish.',
            how: "Fix time and vary scope. Write what is out, log deferrals with a reason and ask: 'What should we remove to add this?'",
            impact:
              'You learn to protect delivery without rejecting every idea, a core product-engineering skill.',
            body: 'Fixed time, variable scope; how to say "not in this version" and log what was deferred.',
            links: [
              {
                label: 'Shape Up: Set Boundaries / appetite',
                href: 'https://basecamp.com/shapeup',
              },
            ],
          },
        ],
        practice: {
          title: 'Practice on real work',
          items: [
            'Rewrite 5 real Jira tickets (ASP or NMA boards) as stories with Given/When/Then criteria.',
            'Pick one NMA Figma screen and list every missing state and open question.',
            'Read crm-backend/CLAUDE.md as an example of a clear technical brief.',
          ],
        },
      },
      {
        number: 3,
        stage: 'Prove',
        title: 'Write and defend the spec',
        outcomes: [
          'Run a stakeholder interview and send a summary with decisions and owners.',
          'Write a complete spec that QA can turn into test cases without asking you questions.',
          'Defend your decisions, accept review feedback and revise the spec.',
        ],
        task: {
          title: 'Write and defend one full spec',
          brief:
            'Run a 30-minute mock stakeholder interview led by your team lead, then write the full spec for one real backlog feature.',
          steps: [
            'Prepare 8 questions and run the interview. Send the summary within 24 hours.',
            'Fill all 8 sections of the spec template: problem, scope, stories, criteria, edge cases, NFRs, design gaps and tasks.',
            'Get a peer review, then a product owner review. Log every comment and resolve it in the spec.',
            'Ask QA to write 3 test cases from the spec without asking you anything.',
          ],
          hints: [
            'Spec order: problem → who is affected → current behaviour → desired behaviour → out of scope → acceptance criteria → edge cases → NFRs → design links → tasks.',
            'Interview questions: “What happens today?”, “Who is allowed to do this?”, “What should happen when it fails?”, “How will we know it worked?”, “What is explicitly not included?”',
            'For every edge case, write the expected behaviour, not just a question. “What if the user is deleted?” is a gap; “If the user is deleted, show a locked state” is a decision.',
            'Review log columns: comment, decision, owner, date, section changed. A comment without a decision is still an open risk.',
            'QA test-case hint: one positive, one permission, one boundary. If QA needs a meeting, the spec is missing a decision.',
          ],
          doneWhen:
            'The product owner signs off and QA writes test cases from the spec without needing a meeting.',
        },
        resources: [
          {
            kind: 'youtube',
            title: 'How to write a great PRD — step by step',
            href: 'https://www.youtube.com/watch?v=jdSFQG7dyrk',
            source: 'ClickUp · YouTube',
            focus:
              'Follow the structure, then compare it with the spec template used in this plan.',
          },
          {
            kind: 'youtube',
            title: 'How to write a product requirements document',
            href: 'https://www.youtube.com/watch?v=JJzODsXsCt0',
            source: 'HelloPM · YouTube',
            focus:
              'Pay attention to the problem and scope sections. Those are where most specs fail.',
          },
          {
            kind: 'read',
            title: 'Shape Up (free online book)',
            href: 'https://basecamp.com/shapeup',
            source: 'Basecamp · free',
            focus:
              'Read chapters 2–4 again, now looking for how a pitch becomes a bounded project.',
          },
          {
            kind: 'read',
            title: 'Product requirements document (PRD)',
            href: 'https://www.productplan.com/learn/product-requirements-document/',
            source: 'ProductPlan · free guide',
            focus: 'Use the outline to sanity-check your spec. Do not copy it word for word.',
          },
        ],
        items: [
          {
            title: 'Live mock stakeholder interview',
            why: 'Discovery is a live skill. Reading about it does not prepare you for a real person who answers in an unexpected direction.',
            how: 'Run 30 minutes with the team lead as stakeholder. Use open questions, summarise decisions and send notes within 24 hours.',
            impact:
              'You gain confidence with stakeholders and learn to recover when an interview does not follow the plan.',
            body: 'The team lead plays the stakeholder for a real feature; you run the interview and send the summary.',
          },
          {
            title: 'Write the full spec',
            why: 'The spec is the artifact that lets design, development and QA work in parallel without guessing.',
            how: 'Use the eight-section template. Record every decision, edge case and non-functional requirement, and give every open question an owner and a date.',
            impact:
              'You build the habit of thinking a feature through end to end, which makes you a stronger developer and reviewer.',
            body: 'Use the template below for a real backlog feature.',
          },
          {
            title: 'Peer review + product owner review',
            why: 'A spec improves when someone attacks it. Review finds ambiguity before code does.',
            how: 'Collect comments in writing, record a decision for each one and revise the spec in the same place. Do not resolve comments verbally and forget them.',
            impact:
              'You become good at receiving feedback and turning it into a better artifact, which is how senior engineers operate.',
            body: 'Then revise. The spec is the deliverable, not the meeting notes.',
          },
        ],
      },
    ],
    template: {
      title: 'Spec template — the deliverable',
      items: [
        'Problem & goal: who, why, success metric',
        'Scope: in / explicitly out',
        'User stories with Given/When/Then acceptance criteria',
        'Edge cases & unhappy paths',
        'Non-functional requirements: performance, security, roles, RTL, accessibility',
        'Design gaps found in Figma',
        'Open questions, each with an owner',
        'Task breakdown with estimates: FE / BE / QA',
      ],
    },
    prompts: [
      "Here's a feature request: [paste]. Ask me the 10 questions a senior business analyst would ask before building it. Don't answer them.",
      "Review my user story and acceptance criteria. Which criteria aren't testable? What edge cases are missing?",
      "Act as the stakeholder for [feature]. I'll interview you; afterwards tell me what I failed to ask.",
    ],
    gates: [
      'A QA engineer can write test cases from your spec without asking a single question.',
      'The product owner signs off on the first or second review.',
      'Every acceptance criterion is testable, and edge cases cover roles, errors and empty states.',
    ],
  },
  {
    key: 'prompt',
    number: 2,
    weeks: 'Weeks 4–6',
    title: 'Prompt Engineering',
    goal: 'Get reliable, repeatable results from AI tools — not lucky ones — for specs, code, reviews and testing, and know when not to trust the output.',
    proof: 'Team prompt library (10 tested prompts)',
    tone: 'violet',
    role: {
      title: 'AI-Assisted Engineer',
      summary:
        'You can use Claude and coding agents as a reliable part of your workflow, not as a magic answer machine.',
      responsibilities: [
        'Choose the right prompt pattern for code, requirements and QA work.',
        'Verify every AI claim against the code, documentation or a test before using it.',
        'Maintain a reusable prompt library and CLAUDE.md rules the team can trust.',
      ],
    },
    weeksData: [
      {
        number: 4,
        stage: 'Learn',
        title: 'How good prompts work',
        outcomes: [
          'Explain the anatomy of a prompt: role, context, task, constraints and output format.',
          'Use examples, XML tags and prompt chaining to make results more reliable.',
          'Recognise a hallucination and verify it against docs or code instead of trusting it.',
        ],
        task: {
          title: 'Finish the prompt tutorial and run a 3-way prompt test',
          brief:
            'Complete chapters 1–9 of Anthropic’s free interactive prompt tutorial, then test one weak prompt three ways on the same real task.',
          steps: [
            'Do chapters 1–9. Write one sentence per chapter describing what changed.',
            'Pick one real task: review a ticket, explain a function, or summarise a meeting.',
            'Write 3 versions of the prompt: minimal, XML-tagged, and with 2 examples.',
            'Run all 3 on the same input. Save the outputs and write down which one won and why.',
          ],
          hints: [
            'Minimal prompt: “Review this ticket for missing acceptance criteria. Return a numbered list of gaps and one improved criterion per gap.”',
            'XML version: <role>Senior QA</role><task>Review this ticket</task><input>…</input><rules>…</rules><output_format>…</output_format>.',
            'Example-based version: include one good review and one bad review, then ask for the same format.',
            'Judge with a rubric: correctness, completeness, format, and evidence. Score each 1–5. Do not pick the winner by vibe.',
            'Verification rule: every factual claim must point to a file, doc, or command output. If it cannot, mark it as unverified.',
          ],
          doneWhen:
            'You can explain the 5 parts of a prompt and show 3 outputs with a clear, evidence-based winner.',
        },
        resources: [
          {
            kind: 'youtube',
            title: 'Prompting 101 | Code w/ Claude',
            href: 'https://www.youtube.com/watch?v=ysPbXH0LpIE',
            source: 'Anthropic · YouTube',
            focus:
              'Watch an Anthropic engineer build one prompt from scratch. Note every change and why it was made.',
          },
          {
            kind: 'youtube',
            title: 'Anthropic’s free prompt engineering workshop',
            href: 'https://www.youtube.com/watch?v=pQ6G9TQfGIA',
            source: 'frugle · YouTube',
            focus:
              'Use this as a second explanation. Compare it with the official tutorial and note where they agree.',
          },
          {
            kind: 'read',
            title: 'Prompt engineering overview',
            href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview',
            source: 'Claude docs · free',
            focus: 'Read the techniques list and mark the 3 you will actually test this week.',
          },
          {
            kind: 'read',
            title: 'Anthropic interactive prompt tutorial',
            href: 'https://github.com/anthropics/prompt-eng-interactive-tutorial',
            source: 'GitHub · free course',
            focus:
              'This is the core reading. Do the exercises; do not just read the chapter titles.',
          },
        ],
        items: [
          {
            title: 'Prompt anatomy',
            why: 'The model does not know your context. The prompt is the only interface between your problem and its output.',
            how: 'Write role, context, task, constraints and output format. State what good looks like and delete any instruction that does not change the result.',
            impact:
              'You learn to think clearly about a task before delegating it, which improves your own problem decomposition.',
            body: 'Role, context, task, constraints, output format. Be clear and direct; say what "good" looks like.',
            links: [
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
            ],
          },
          {
            title: 'Giving context',
            why: 'Most weak answers are missing context, not model capability.',
            how: 'Attach the ticket, code, examples and rules. Use XML tags to separate instructions from data and give one or two examples of good output.',
            impact:
              'You become better at packaging knowledge for humans too: the same clarity improves tickets, reviews and handoffs.',
            body: 'Examples (few-shot), XML tags to separate instructions from data, attaching docs and code, system prompts / roles.',
            links: [
              {
                label: 'Anthropic interactive prompt tutorial',
                href: 'https://github.com/anthropics/prompt-eng-interactive-tutorial',
              },
              {
                label: 'Anthropic courses',
                href: 'https://github.com/anthropics/courses',
              },
            ],
          },
          {
            title: 'Breaking big tasks down',
            why: 'A model asked to do everything at once will skip steps or invent the ones it missed.',
            how: 'Chain prompts in small stages: plan → implement → review → test. Ask for one step at a time and carry the output into the next prompt.',
            impact:
              'You improve at decomposing complex work, the core skill behind estimation, architecture and debugging.',
            body: 'Prompt chaining (output of one step feeds the next), asking the model to reason step by step before answering.',
            links: [
              {
                label: 'ChatGPT Prompt Engineering for Developers (DeepLearning.AI, free)',
                href: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/',
              },
            ],
          },
          {
            title: 'Hallucinations & verification',
            why: 'A confident answer is not the same as a correct one. Models can invent APIs, files and behaviours that look plausible.',
            how: 'Ask for quotes, file paths and sources. Verify every claim against the code, official docs or a test before you use it, and mark anything unverified.',
            impact:
              'You become a safer engineer: you use AI for speed without outsourcing your judgement.',
            body: 'Why models make things up, how to ask for sources/quotes, how to verify against docs and code.',
            links: [
              {
                label: 'Claude prompting best practices',
                href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
              },
            ],
          },
        ],
      },
      {
        number: 5,
        stage: 'Practice',
        title: 'Prompts for our real work',
        outcomes: [
          'Trace a real request through the codebase with Claude Code and verify every claim.',
          'Write prompts for code review, spec gaps and test generation.',
          'Know when an agent or tool is useful, and when it is unsafe to use one.',
        ],
        task: {
          title: 'Trace one real request and test 4 work prompts',
          brief:
            'Use Claude Code on a real repo to trace one request end-to-end, then write and test 4 prompts on your actual work.',
          steps: [
            'Pick one flow, for example creating a contact or sending a broadcast.',
            'Ask Claude Code to trace it from route to database. Open every file it cites and verify the claim.',
            'Write 4 prompts: trace a flow, review a diff, find spec gaps, and generate test cases.',
            'Run each prompt on real input. Record at least one AI mistake you caught and corrected.',
          ],
          hints: [
            'Trace prompt: “Trace the contact creation flow from the Vue route to the Laravel controller and database table. For each step, cite the file path and line. Do not guess; say UNKNOWN when you cannot verify.”',
            'Review prompt: “Review this diff against the ticket criteria. List blocking issues, risks and missing tests. Quote the exact lines.”',
            'Spec-gap prompt: “Compare this spec with the code. List behaviours the spec does not define, with the exact question we must answer.”',
            'Test-gen prompt: “From these acceptance criteria, produce positive, negative, boundary and role-based cases in a table with steps and expected results.”',
            'Safety hint: read before you run. Never paste secrets, and never let an agent push, delete or change production data without review.',
          ],
          doneWhen:
            'You have a verified flow map, 4 tested prompts, and one concrete example of catching an AI error.',
        },
        resources: [
          {
            kind: 'youtube',
            title: 'Claude Code essentials',
            href: 'https://www.youtube.com/watch?v=brLhhkUqcn4',
            source: 'freeCodeCamp.org · YouTube',
            focus:
              'Watch the workflow, not just the commands: plan first, edit, then verify the diff.',
          },
          {
            kind: 'youtube',
            title: 'How Anthropic engineers prompt Claude Code',
            href: 'https://www.youtube.com/watch?v=qOvc9IUKEIc',
            source: 'Austin Marchese · YouTube',
            focus:
              'Look for the rules about giving context, asking for a plan, and forcing verification.',
          },
          {
            kind: 'read',
            title: 'Claude Code best practices',
            href: 'https://code.claude.com/docs/en/best-practices',
            source: 'Claude Code docs · free',
            focus: 'Copy the explore → plan → code → commit loop into your own working habits.',
          },
          {
            kind: 'read',
            title: 'CLAUDE.md and project memory',
            href: 'https://code.claude.com/docs/en/memory',
            source: 'Claude Code docs · free',
            focus: 'Compare the examples with crm-backend/CLAUDE.md and ataa-crm-saas/CLAUDE.md.',
          },
        ],
        items: [
          {
            title: 'Prompting for code',
            why: 'Code prompts fail when they jump straight to an answer without a shared plan.',
            how: 'Give the spec and the relevant files, ask for a plan before code, then review the diff line by line. Put stable project rules in CLAUDE.md.',
            impact:
              'You learn to direct implementation instead of accepting autocomplete, which raises both quality and ownership.',
            body: 'Write a spec first, ask for a plan before code, review the diff; how CLAUDE.md files act as standing prompts.',
            links: [
              {
                label: 'Claude Code best practices',
                href: 'https://code.claude.com/docs/en/best-practices',
              },
              {
                label: 'Claude Code memory / CLAUDE.md',
                href: 'https://code.claude.com/docs/en/memory',
              },
            ],
            list: ['In our code: crm-backend/CLAUDE.md and ataa-crm-saas/CLAUDE.md'],
          },
          {
            title: 'Prompting for requirements',
            why: 'AI is good at finding gaps in a spec because it does not share your assumptions.',
            how: 'Feed the full spec and ask for ambiguities, missing edge cases, conflicting rules and questions the team must answer. Verify each suggestion against the real context.',
            impact:
              'You strengthen your requirements thinking and learn to use a second perspective without giving up responsibility.',
            body: 'Feed your Phase 1 spec and ask the AI to find gaps, ambiguities and missing edge cases.',
          },
          {
            title: 'Prompting for QA',
            why: 'Test design is repetitive enough to benefit from AI, but wrong tests create false confidence.',
            how: 'Give the acceptance criteria and ask for positive, negative, boundary and role-based cases in a fixed table. Review every case against the requirement.',
            impact:
              'You learn to scale careful work, not replace it, which is the difference between a fast engineer and a reckless one.',
            body: 'Generate test cases from acceptance criteria, generate tricky test data, review a bug report for clarity.',
          },
          {
            title: 'Claude Code on our repos',
            why: 'The fastest way to understand a large codebase is to trace one real request through it.',
            how: 'Ask Claude Code to trace a route to the database, cite the file and line for every step and say UNKNOWN when it cannot verify. Open each file.',
            impact:
              'You build a reliable mental model of unfamiliar systems, which makes you useful on any team much faster.',
            body: 'Trace a request, explain a module, find where a rule is enforced.',
          },
          {
            title: 'Agents, tools & MCP',
            why: 'Agents can act on files and tools, so understanding their loop is a safety and quality issue, not a novelty.',
            how: 'Trace how an agent plans, calls a tool and checks the result. Read the MCP docs and try one connector in a sandbox.',
            impact:
              'You learn to automate bounded work while keeping human review at the points that matter.',
            body: 'How an agent plans, calls tools and checks its work; what MCP connectors are.',
            links: [
              {
                label: 'Building effective AI agents (Anthropic)',
                href: 'https://www.anthropic.com/engineering/building-effective-agents',
              },
              {
                label: 'Model Context Protocol intro',
                href: 'https://modelcontextprotocol.io/',
              },
            ],
          },
          {
            title: 'Safety',
            why: 'A single pasted secret or hidden prompt injection can undo months of good engineering.',
            how: 'Never paste secrets, .env files or customer data. Treat page, file and ticket content as untrusted, and read the OWASP LLM risks.',
            impact:
              'You develop the security instinct that separates a professional AI user from an enthusiastic one.',
            body: 'Never paste secrets, .env or customer data; prompt injection (hidden instructions in pages, files or tickets).',
            links: [
              {
                label: 'OWASP Top 10 for LLM applications',
                href: 'https://genai.owasp.org/llm-top-10/',
              },
            ],
          },
        ],
      },
      {
        number: 6,
        stage: 'Prove',
        title: 'Build the team prompt library',
        outcomes: [
          'Build a reusable prompt library with real inputs, expected outputs and failure modes.',
          'Test prompts across multiple inputs instead of trusting one lucky run.',
          'Improve a CLAUDE.md standing prompt and measure the difference.',
        ],
        task: {
          title: 'Ship the 10-prompt library',
          brief:
            'Build and test the team’s reusable prompt library, then improve one CLAUDE.md section and prove the difference.',
          steps: [
            'Write the 10 prompts with purpose, prompt, example input, expected output, failure modes and verification.',
            'Test each prompt on 3 different real inputs. Record where it failed and how you fixed it.',
            'Improve one CLAUDE.md section, for example API conventions, testing or code review rules.',
            'Run the same task before and after the CLAUDE.md change. Save both outputs.',
            'Ask a teammate to use 3 prompts without your help. Fix anything they find confusing.',
          ],
          hints: [
            'Library entry: name, when to use it, prompt, example input, expected output, failure modes, verification step, owner and last tested date.',
            'Test matrix: 3 real inputs × 3 prompt versions. Record pass/fail and the exact failure, not just “bad output”.',
            'CLAUDE.md change: one rule at a time. Example: “Always run the relevant tests and show the command and result before claiming done.”',
            'Before/after test: same repo, same task, same model, same time box. Save both diffs and compare them side by side.',
            'Teammate test: watch silently. Every question they ask is a missing instruction in the library.',
          ],
          doneWhen:
            'The library is in the repo, a teammate uses 3 prompts unaided, and you have before/after evidence for the CLAUDE.md change.',
        },
        resources: [
          {
            kind: 'youtube',
            title: 'How to create reusable prompt templates in Claude',
            href: 'https://www.youtube.com/watch?v=WyD5iJDLx8Y',
            source: 'AndroidKandy · YouTube',
            focus:
              'Focus on how to store and reuse a prompt. Ignore the app-specific parts you do not need.',
          },
          {
            kind: 'youtube',
            title: 'Prompting for agents | Code w/ Claude',
            href: 'https://www.youtube.com/watch?v=XSZP9GhhuAc',
            source: 'Anthropic · YouTube',
            focus:
              'Watch how a prompt becomes a workflow with tools, checks and a clear stopping point.',
          },
          {
            kind: 'read',
            title: 'Claude Code prompt library',
            href: 'https://code.claude.com/docs/en/prompt-library',
            source: 'Claude Code docs · free',
            focus: 'Use this as a model for the shape of each entry in your own library.',
          },
          {
            kind: 'read',
            title: 'Prompting best practices',
            href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
            source: 'Claude docs · free',
            focus:
              'Choose the techniques that solve failures you actually saw in testing, not every technique.',
          },
        ],
        items: [
          {
            title: 'Build the team prompt library',
            why: 'Useful prompts should be shared, versioned and improved, not rediscovered by every person.',
            how: 'Write ten prompts with purpose, prompt text, example input, expected output and known failure modes. Test each one and store it where the team can find it.',
            impact:
              'You create leverage for the whole team and learn to turn personal tricks into a maintainable system.',
            body: '10 prompts, each with purpose, the prompt, example input, expected output, and known failure modes. Minimum set:',
            list: [
              'Explain a file / module',
              'Trace a request through our code',
              'Review code (bugs, security, N+1)',
              'Write tests for a function',
              'Find gaps in a spec',
              'Turn acceptance criteria into test cases',
              'Generate edge-case test data (Arabic + English)',
              'Improve a bug report',
              'Summarize a meeting into decisions + open questions',
              'Plan an implementation before coding',
            ],
          },
          {
            title: 'Test each prompt on 3+ different inputs',
            why: 'A prompt that worked once may be luck. Three inputs reveal whether it is reliable.',
            how: 'Run each prompt on a simple, a messy and an edge-case input. Record failures, change one variable at a time and document the fix.',
            impact:
              'You develop an experimental mindset: evidence over vibes, which makes you better at debugging and performance work too.',
            body: 'Record where it failed and how you fixed it.',
          },
          {
            title: 'Improve one section of a CLAUDE.md',
            why: 'A project memory file is a standing prompt. Small improvements there change every future interaction.',
            how: 'Pick one section, compare the before/after output on the same task, and keep the change only if it is measurably better.',
            impact:
              'You learn to improve the environment around your work, not just your own output.',
            body: 'Do it in our repos and show the before/after difference in output.',
          },
        ],
      },
    ],
    template: {
      title: 'Prompt library entry',
      intro: 'One entry per prompt. If it cannot be reused, it does not belong in the library.',
      items: [
        'Purpose: what job it does',
        'Prompt: the exact text to paste',
        'Example input: a real input you tested',
        'Expected output: what good looks like',
        'Known failure modes: where it drifts or invents',
        'Verification: how you check the answer',
      ],
    },
    prompts: [
      "Here's my prompt and the output I got. Why is the output weak? Rewrite the prompt and explain each change.",
      "Give me 3 versions of this prompt: minimal, structured with XML tags, and with examples. I'll compare the outputs.",
      "Here's an AI answer about our code. List every claim I should verify and where to check it.",
    ],
    gates: [
      'Your prompts give the same quality result 3 runs in a row on different inputs.',
      'You catch AI mistakes before they ship (wrong code, invented APIs, missed edge cases).',
      'Teammates reuse your library prompts without asking you how they work.',
    ],
  },
  {
    key: 'qa',
    number: 3,
    weeks: 'Weeks 7–9',
    title: 'Quality Assurance',
    goal: 'Build quality in from the start — design tests from requirements, find real bugs before users do, and report them so anyone can reproduce them first time.',
    proof: 'Executed test plan + 5 real bugs filed',
    tone: 'teal',
    role: {
      title: 'QA Engineer',
      summary:
        'You can plan, design and execute quality work for a feature, then leave the team with checks that survive the release.',
      responsibilities: [
        'Turn requirements into test designs, test cases and a one-page test plan.',
        'File reproducible bugs and explain severity, priority and evidence.',
        'Run regression checks and propose a Definition of Done the team can enforce.',
      ],
    },
    weeksData: [
      {
        number: 7,
        stage: 'Learn',
        title: 'How to think like QA',
        outcomes: [
          'Design tests from requirements using partitions, boundaries, decision tables and state transitions.',
          'Write a bug report a developer can reproduce on the first try.',
          'Explain severity vs. priority and the bug lifecycle.',
        ],
        task: {
          title: 'Build a test-design sheet for one real feature',
          brief:
            'Take one real feature and design the tests before executing anything. Then file one bug report using the team convention.',
          steps: [
            'List equivalence partitions and boundary values for every important input.',
            'Build a decision table for the 2 most complex business rules.',
            'Draw the state transitions for the main object, for example a broadcast or contact status.',
            'Write 10 test cases with preconditions, steps and expected results.',
            'Find one real bug, write the report, and ask a developer to reproduce it without your help.',
          ],
          hints: [
            'Partition hint: for an age field, test under 18, 18–65 and over 65; then test the boundaries 17/18 and 65/66.',
            'Decision table: conditions as columns (role, status, payment type), actions as rows (allow, block, show error). One column per rule.',
            'State hint: Draft → Scheduled → Sending → Sent / Failed. Test invalid transitions, for example Sent → Scheduled.',
            'Bug report fields: title, environment, preconditions, steps, expected, actual, evidence, severity, priority, reproducibility.',
            'Severity vs priority: severity is damage; priority is urgency. A typo in the CEO’s name can be low severity but high priority.',
          ],
          doneWhen:
            'Another tester can execute your 10 cases, and a developer reproduces your bug on the first attempt.',
        },
        resources: [
          {
            kind: 'youtube',
            title: 'Manual QA testing full course — part 1',
            href: 'https://www.youtube.com/watch?v=QJqNYhiHysM',
            source: 'SDET-QA · YouTube',
            focus:
              'Do not watch all of it in one sitting. Use the chapters on test design and bug lifecycle.',
          },
          {
            kind: 'youtube',
            title: 'How to write a bug report',
            href: 'https://www.youtube.com/watch?v=RH8S4s2ftaU',
            source: 'Codemify · YouTube',
            focus:
              'Compare the example with our convention: title in English, details in Arabic, evidence attached.',
          },
          {
            kind: 'read',
            title: 'ISTQB Foundation Level syllabus',
            href: 'https://www.istqb.org/',
            source: 'ISTQB · free syllabus',
            focus:
              'Read the chapters on test design techniques and defect management. Skip the exam logistics.',
          },
          {
            kind: 'read',
            title: 'The practical test pyramid',
            href: 'https://martinfowler.com/articles/practical-test-pyramid.html',
            source: 'Martin Fowler · free article',
            focus:
              'Understand why we need different levels of tests, not only manual checks at the end.',
          },
          {
            kind: 'read',
            title: 'The art of the bug report',
            href: 'https://www.ministryoftesting.com/insights/the-art-of-the-bug-report',
            source: 'Ministry of Testing · free article',
            focus:
              'Copy the structure: what happened, how to reproduce it, expected vs actual, evidence.',
          },
        ],
        items: [
          {
            title: 'QA mindset',
            why: "QA is not the last step before release; it is how the team decides what 'good' means from the start.",
            how: 'Study the test pyramid, shift-left and risk-based testing. For one feature, ask what could fail, how badly and how you would detect it.',
            impact:
              'You start thinking about failure before writing the first line, which makes you a more reliable engineer.',
            body: 'QA vs. testing, shift-left (test the spec, not just the build), the test pyramid, risk-based testing.',
            links: [
              {
                label: 'The Practical Test Pyramid (Martin Fowler)',
                href: 'https://martinfowler.com/articles/practical-test-pyramid.html',
              },
              {
                label: 'ISTQB Foundation Level syllabus',
                href: 'https://www.istqb.org/',
              },
            ],
          },
          {
            title: 'Test design techniques',
            why: 'Good testers do not test everything; they choose inputs that expose the most risk.',
            how: 'Use equivalence partitions, boundary values, decision tables and state transitions. Turn each technique into a small set of cases with expected results.',
            impact:
              'You learn systematic thinking that transfers directly to API design, validation and debugging.',
            body: 'Equivalence partitioning, boundary values, decision tables, state transitions.',
            links: [
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
            ],
          },
          {
            title: 'Bug lifecycle',
            why: 'A bug is not finished when it is found; it has to be triaged, fixed, retested and closed without ambiguity.',
            how: 'Map the statuses and explain severity versus priority. Walk one real bug through the full lifecycle and record who owns each step.',
            impact:
              'You understand how quality work actually moves through a team, which helps you prioritise and communicate risk.',
            body: 'Severity vs. priority, statuses, retest and regression.',
          },
          {
            title: 'Writing great bug reports',
            why: "A bug that cannot be reproduced wastes developer time and often gets closed as 'not a bug'.",
            how: 'Write one bug per ticket with title, environment, preconditions, steps, expected, actual, evidence and reproducibility. Ask a developer to reproduce without your help.',
            impact:
              'You build a reputation for precise, useful reports, which makes your findings count.',
            body: 'One bug per ticket, clear title, steps to reproduce, expected vs. actual, environment, evidence (screenshot / video / network log).',
            links: [
              {
                label: 'Ministry of Testing',
                href: 'https://www.ministryoftesting.com/',
              },
            ],
            list: ['Team convention: title in English, details in Arabic.'],
          },
        ],
      },
      {
        number: 8,
        stage: 'Practice',
        title: 'Test real products',
        outcomes: [
          'Turn acceptance criteria into positive, negative, boundary and role-based test cases.',
          'Run an exploratory session with a written charter and useful notes.',
          'Test an API with Postman, run a k6 smoke test, and complete an accessibility pass.',
        ],
        task: {
          title: 'Test one feature for real',
          brief:
            'Execute the Week 7 test design and add one exploratory session, a Postman collection, a k6 smoke test and an accessibility pass.',
          steps: [
            'Run the 10 test cases. Log pass/fail with evidence.',
            'Do a 60-minute exploratory session with a written charter. Keep notes as you go.',
            'Build a Postman collection with 5 requests and assertions.',
            'Write and run a k6 smoke test against one staging endpoint.',
            'Check one screen with keyboard only and with axe DevTools. Record the issues.',
          ],
          hints: [
            "Postman: create an environment with `baseUrl` and `token`. Add tests like `pm.response.to.have.status(200)` and `pm.expect(pm.response.json().data).to.be.an('array')`.",
            "k6: start with 1 virtual user for 30 seconds and `http.get(`${__ENV.BASE_URL}/health`)`; assert `check(res, { 'status is 200': (r) => r.status === 200 })`.",
            'Exploratory charter: “Explore [area] with [resources] to find [risks] in 60 minutes.” Write timestamped notes: what you did, what happened, what surprised you.',
            'Accessibility pass: tab through the page. Check focus order, visible focus, labels, error text, contrast and 200% zoom.',
            'Evidence hint: screenshot + request/response + console/network log. A bug without evidence is a rumour.',
          ],
          doneWhen:
            'All 5 artifacts are in one folder, and you have found at least 3 new bugs or accessibility issues.',
        },
        resources: [
          {
            kind: 'youtube',
            title: 'Learn Postman for API testing',
            href: 'https://www.youtube.com/watch?v=wEOLZq-7DYs',
            source: 'Automation Step by Step · YouTube',
            focus:
              'Watch the request, environment and test-script sections. You only need those for the task.',
          },
          {
            kind: 'youtube',
            title: 'Basics of load testing with k6 in 20 minutes',
            href: 'https://www.youtube.com/watch?v=gvounvDSDGg',
            source: 'k6 · YouTube',
            focus:
              'Copy the smallest smoke-test script. Do not build a full performance suite yet.',
          },
          {
            kind: 'youtube',
            title: 'Exploratory testing — a full session on screen',
            href: 'https://www.youtube.com/watch?v=1AQ7w-_Ga70',
            source: 'QA Codes · YouTube',
            focus:
              'Watch how the charter, time box and notes turn exploration into something repeatable.',
          },
          {
            kind: 'youtube',
            title: 'Learn accessibility — full a11y tutorial',
            href: 'https://www.youtube.com/watch?v=e2nkq3h1P68',
            source: 'freeCodeCamp.org · YouTube',
            focus:
              'Focus on keyboard navigation, labels, contrast and semantic HTML. Skip the deep ARIA details for now.',
          },
          {
            kind: 'read',
            title: 'Postman Learning Center',
            href: 'https://learning.postman.com/docs/introduction/overview/',
            source: 'Postman · free docs',
            focus: 'Use the docs while building the collection. Do not read them cover to cover.',
          },
          {
            kind: 'read',
            title: 'k6 documentation',
            href: 'https://grafana.com/docs/k6/latest/',
            source: 'Grafana · free docs',
            focus:
              'Read the getting-started and smoke-testing pages, then copy the example script.',
          },
          {
            kind: 'read',
            title: 'WCAG 2.2 quick reference',
            href: 'https://www.w3.org/WAI/WCAG22/quickref/',
            source: 'W3C · free',
            focus:
              'Check the 5 most common failures: keyboard, focus, labels, contrast and error messages.',
          },
        ],
        items: [
          {
            title: 'Test cases from acceptance criteria',
            why: 'Acceptance criteria are only useful if someone turns them into executable checks.',
            how: 'Convert each criterion into positive, negative, boundary and role-based cases with preconditions, steps and expected results.',
            impact:
              'You learn to close the loop between requirements and verification, which is where many teams quietly fail.',
            body: 'Turn the Phase 1 spec into test cases (positive, negative, boundary, role-based).',
          },
          {
            title: 'Exploratory testing',
            why: 'Scripted tests confirm known paths; exploration finds the paths nobody imagined.',
            how: "Run a time-boxed session with a charter: 'Explore X with Y to discover Z'. Take notes, capture evidence and debrief with what you learned.",
            impact:
              'You develop curiosity and judgement, two qualities that make testing more than checklist execution.',
            body: 'Time-boxed sessions with a charter ("Explore X with Y to discover Z"), note-taking, debrief.',
            list: ['Learn: Explore It!, Elisabeth Hendrickson (book).'],
          },
          {
            title: 'API testing with Postman',
            why: 'Many user-facing bugs start as API contracts that were never tested directly.',
            how: 'Use Postman to check status codes, validation errors, auth and permissions. Save a collection with assertions so it can be rerun.',
            impact:
              'You learn to test at the right layer and build repeatable checks instead of one-off clicks.',
            body: 'Status codes, validation errors, auth, permissions; save a collection with tests.',
            links: [
              {
                label: 'Postman Learning Center',
                href: 'https://learning.postman.com/docs/introduction/overview/',
              },
            ],
            list: [
              'In our code: crm-backend API docs via php artisan scribe:generate (served at /docs, includes a Postman collection).',
            ],
          },
          {
            title: 'Performance smoke test with k6',
            why: 'A feature that works for one user can collapse under a realistic load.',
            how: 'Write a small k6 script for one staging endpoint, run a baseline, then increase load and record response time and error rate.',
            impact: 'You start treating performance as a requirement, not an afterthought.',
            body: 'A simple load script on one endpoint in staging.',
            links: [{ label: 'k6 docs', href: 'https://grafana.com/docs/k6/latest/' }],
          },
          {
            title: 'Accessibility check',
            why: 'Accessibility problems exclude real users and are usually cheaper to fix before release.',
            how: 'Test keyboard navigation, focus order, labels, contrast and RTL layout. Run axe DevTools and manually verify the findings.',
            impact:
              'You learn to build for a wider range of people and catch a class of bugs that automated tests often miss.',
            body: 'Keyboard navigation, contrast, labels, RTL layout.',
            links: [
              {
                label: 'WCAG 2.2 quick reference',
                href: 'https://www.w3.org/WAI/WCAG22/quickref/',
              },
              {
                label: 'axe DevTools',
                href: 'https://www.deque.com/axe/devtools/',
              },
            ],
          },
          {
            title: 'Use your Phase 2 prompts',
            why: 'AI can speed up test design, but only if you review the output with a tester’s judgement.',
            how: 'Use your prompt library to generate cases and test data, then remove duplicates, add missing risk cases and correct anything the model invented.',
            impact:
              'You learn to combine automation with expertise, which is the realistic future of quality work.',
            body: 'Generate test cases and test data, then review and fix what the AI got wrong.',
          },
        ],
      },
      {
        number: 9,
        stage: 'Prove',
        title: 'Prove the quality',
        outcomes: [
          'Write a test plan with scope, risks, environments and entry/exit criteria.',
          'Execute the plan, file real bugs and build a regression checklist.',
          'Propose a Definition of Done and code review checklist the team can adopt.',
        ],
        task: {
          title: 'Write, execute and defend the test plan',
          brief:
            'Use the same feature from Weeks 3 and 7. Write and execute the full test plan, then propose a Definition of Done and code review checklist.',
          steps: [
            'Write the 8-section test plan: scope, risks, test types, environments, entry/exit criteria, schedule, results, bugs.',
            'Execute the plan and log results with evidence.',
            'File 5+ real bugs in Jira using the team convention.',
            'Build a regression checklist a teammate can rerun each release.',
            'Draft the Definition of Done and code review checklist. Review it with the team lead.',
          ],
          hints: [
            'Test plan outline: objective, scope in/out, risks, test types, environments and data, entry/exit criteria, schedule, results, bugs.',
            'Entry criteria: build deployed, smoke test green, test data ready, acceptance criteria signed off. Exit: all P1/P2 closed, no open blockers, regression green, PO accepts.',
            'Regression checklist: 10–15 highest-risk journeys, not every button. Include login, permissions, payments or broadcasts, and the feature you changed.',
            'DoD proposal: code reviewed, tests pass, acceptance criteria met, QA verified, docs updated, no known P1/P2, deployed and smoke-tested.',
            'Code review checklist: correct behaviour, tests cover the change, no secrets, error handling, accessibility, RTL/Arabic, performance impact.',
          ],
          doneWhen:
            'The test plan is executed, 5+ bugs are in Jira, the regression checklist is usable, and the team lead accepts the DoD proposal.',
        },
        resources: [
          {
            kind: 'youtube',
            title: 'How to create an effective test plan',
            href: 'https://www.youtube.com/watch?v=HCbrznlBoAI',
            source: 'The Test Tribe · YouTube',
            focus:
              'Watch how a test plan stays useful and short. Copy the structure, not the slide design.',
          },
          {
            kind: 'youtube',
            title: 'What is regression testing?',
            href: 'https://www.youtube.com/watch?v=fX47TAPRAJI',
            source: 'Joe Colantonio · YouTube',
            focus:
              'Write the regression checklist while watching. A checklist you never reuse is not a deliverable.',
          },
          {
            kind: 'youtube',
            title: 'What is a Definition of Done?',
            href: 'https://www.youtube.com/watch?v=RidSAJVu07E',
            source: 'The Agile Shop · YouTube',
            focus: 'Turn the ideas into 5 checklist items your team can actually enforce.',
          },
          {
            kind: 'read',
            title: 'The one-page test plan',
            href: 'https://www.ministryoftesting.com/insights/the-one-page-test-plan',
            source: 'Ministry of Testing · free article',
            focus: 'Use this to keep the plan short enough that the team will read it.',
          },
          {
            kind: 'read',
            title: 'Google engineering practices: code review',
            href: 'https://google.github.io/eng-practices/review/',
            source: 'Google · free guide',
            focus:
              'Pull 5 rules into the code review checklist. Keep only rules the team can verify.',
          },
          {
            kind: 'read',
            title: 'Scrum Guide — Definition of Done',
            href: 'https://scrumguides.org/scrum-guide.html',
            source: 'Scrum Guides · free',
            focus: 'Read the Definition of Done section and compare it with your proposal.',
          },
        ],
        items: [
          {
            title: 'Write a test plan',
            why: 'A test plan makes scope, risk and evidence explicit so the team knows what was checked and what was not.',
            how: 'Write scope, risks, test types, environments, entry and exit criteria for the feature you specified in Phase 1. Keep it to one page.',
            impact:
              'You learn to communicate quality in business terms, which makes you trusted with bigger releases.',
            body: 'For the feature you specified in Phase 1 (or a live feature in CRM / Ataa / NMA): scope, risks, test types, environments, entry/exit criteria.',
          },
          {
            title: 'Execute it and file 5+ real bugs',
            why: 'A plan only proves something when it is executed against a real build.',
            how: 'Run the plan, record evidence, file at least five bugs in Jira using the team convention and retest the fixes.',
            impact: 'You learn to finish quality work end to end, not stop at documentation.',
            body: 'In Jira, following the team convention.',
          },
          {
            title: 'Regression checklist',
            why: 'Most releases break something that used to work. A short regression list protects the team from repeating old failures.',
            how: 'List the highest-risk existing behaviours for the feature, with the exact check and expected result, ready to rerun each release.',
            impact:
              'You build a long-term quality habit and learn to think about systems over time, not just the current ticket.',
            body: 'For that feature, ready to re-run each release.',
          },
          {
            title: 'Definition of Done & code review checklist',
            why: 'A team without an explicit Definition of Done will disagree about what finished means.',
            how: 'Draft a short DoD and review checklist with test evidence, documentation, accessibility, security and rollout checks. Review it with the team and adapt it.',
            impact:
              'You learn to shape team standards, which is a leadership skill that goes far beyond writing code.',
            body: 'A proposal for the team.',
            links: [
              {
                label: 'Google engineering practices: code review',
                href: 'https://google.github.io/eng-practices/review/',
              },
              {
                label: 'Scrum Guide (Definition of Done)',
                href: 'https://scrumguides.org/scrum-guide.html',
              },
            ],
          },
        ],
      },
    ],
    template: {
      title: 'Test plan contents',
      intro:
        'The plan is a contract: if an acceptance criterion has no test case, it is not covered.',
      items: [
        'Scope and out of scope',
        'Risks and priority',
        'Test types: functional, negative, boundary, role-based, accessibility',
        'Environments and test data',
        'Entry / exit criteria',
        'Schedule and owners',
        'Results summary and evidence',
        'Bugs filed and regression checklist',
      ],
    },
    prompts: [
      'Here are the acceptance criteria: [paste]. Generate test cases using boundary values and decision tables. Mark which ones are negative tests.',
      "Review this bug report. Could a developer reproduce it first time? What's missing?",
      'Give me 20 tricky inputs (Arabic, English, emojis, very long, SQL-like) for this form field and why each matters.',
    ],
    gates: [
      'Anyone can reproduce your bugs on the first try from the report alone.',
      'Your test plan finds issues before release, not after.',
      'Your test cases cover positive, negative, boundary and role-based scenarios for every acceptance criterion.',
    ],
  },
];
