import type { PlanItem, PlanLink, PlanPhase, WeekResource, WeekTask } from '~/features/plan1/types';

// Small helpers so each item/task/resource is one call, not a wall of keys.
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

// Repo & docs we reference enough to be worth constants.
const vueDocs = 'https://vuejs.org/guide/introduction.html';
const nuxtDocs = 'https://nuxt.com/docs/getting-started/introduction';
const unocssDocs = 'https://unocss.dev/guide/';
const veeValidateDocs = 'https://vee-validate.logaretm.com/v4/guide/overview';
const zodDocs = 'https://zod.dev/';
const vitestDocs = 'https://vitest.dev/guide/';
const playwrightDocs = 'https://playwright.dev/docs/intro';

// Codevolution masterclass playlists — the deep JS + TS series the user chose
// as the backbone of this phase. Linked both as the series index and as the
// first video so learners can jump straight in.
const jsMasterclassPlaylist =
  'https://www.youtube.com/watch?v=CTwLp4XzZis&list=PLH_t3aTgqQcBsTKTja9VXQCoBrctPbxl2';
const tsMasterclassPlaylist =
  'https://www.youtube.com/watch?v=WYSt5e7fLWU&list=PLH_t3aTgqQcAFpAc58kJ4QLIn9y_I9zP1';

export const phases: PlanPhase[] = [
  // =====================================================================
  // Phase 1 — Web Fundamentals + Thinking Like a Frontend Engineer
  // =====================================================================
  {
    key: 'fundamentals',
    number: 1,
    weeks: 'Weeks 1–4',
    title: 'Web Fundamentals + Frontend Thinking',
    goal: 'Get the browser, modern JavaScript, strict TypeScript and the frontend engineer mindset under your belt before adding any framework.',
    proof:
      'A responsive, accessible, strictly-typed single-page app with a documented decision log',
    tone: 'blue',
    role: {
      title: 'Frontend Fundamentals Engineer',
      summary:
        'You can build and defend a frontend without a framework: semantic HTML, modern CSS, deep JavaScript, strict TypeScript — and you reason about rendering, state and performance like an engineer, not a tutorial follower.',
      responsibilities: [
        'Write semantic HTML and keyboard-reachable interactive elements.',
        'Lay a page out with Flexbox + Grid without hacks; theme with CSS tokens.',
        'Explain JavaScript deeply: types, scope, closures, prototypes, event loop, async, modules.',
        'Use strict TypeScript — narrowing, generics, utility types, discriminated unions — not just as "JS with types".',
        'Reason about rendering, data flow, state scope and performance budgets *before* writing code.',
      ],
    },
    weeksData: [
      // ---------- Week 1 — HTML, CSS, the browser ----------
      {
        number: 1,
        stage: 'Learn',
        title: 'HTML, CSS & the browser',
        outcomes: [
          'Pick semantic tags over divs and know when ARIA is actually needed.',
          'Build a two-column layout with Grid and a card list with Flexbox.',
          'Define a design-token palette with CSS custom properties.',
          'Explain the URL → request → parse → paint → interactive pipeline.',
        ],
        task: task(
          'Build a two-page static site in semantic HTML + modern CSS',
          'Rebuild a real marketing page from the muslim-academy-platform statically from scratch — no framework, no copy-paste from the repo.',
          [
            'Write the markup first with semantic tags: header/main/nav/section/article/footer.',
            'Lay out the hero + section grid with CSS Grid; use Flexbox for inline rows.',
            'Define a tiny token system in `:root` (--surface, --ink, --brand) and theme-switch via `[data-theme="dark"]`.',
            'Make it responsive to 360px with one breakpoint if possible, or container queries.',
            'Verify with keyboard-only navigation and 200% zoom. Open DevTools → Performance tab, record a load, name every phase.',
          ],
          [
            'Semantic HTML is accessibility *for free*. If you reach for `role="button"`, use `<button>` instead.',
            'Grid for 2D layouts (hero, galleries). Flexbox for 1D rows (nav, chips). Mixing them is normal.',
            'Design tokens as CSS vars let you theme without re-authoring every component.',
            'Keyboard test: Tab, Shift+Tab, Enter, Space, Escape. Every interactive node must respond.',
            'Open Performance tab and spot the DOMContentLoaded, LCP and Load markers. You will reason about these forever.',
          ],
          'Semantic, responsive, keyboard-reachable, dark-mode themed via tokens; a teammate reviewed the MR; you can explain the Performance tab trace.'
        ),
        resources: [
          read(
            'MDN: HTML elements reference',
            'https://developer.mozilla.org/en-US/docs/Web/HTML/Element',
            'MDN · free',
            'Skim the semantic sectioning section. If a div has a role, there is usually a better tag.'
          ),
          read(
            'web.dev: Learn CSS',
            'https://web.dev/learn/css',
            'web.dev · free',
            'Work through "Box model" through "Grid". Skip animations for now.'
          ),
          read(
            'Josh W. Comeau: Interactive guide to Flexbox',
            'https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/',
            'joshwcomeau.com · free',
            'Best 30-minute Flexbox model you can get.'
          ),
          read(
            'CSS-Tricks: Complete guide to Grid',
            'https://css-tricks.com/snippets/css/complete-guide-grid/',
            'CSS-Tricks · free',
            'The reference you will keep bookmarked.'
          ),
          watch(
            'Kevin Powell: CSS custom properties crash course',
            'https://www.youtube.com/watch?v=PHO6TBq_auI',
            'Kevin Powell · YouTube',
            'The "fallback value" idiom and global-vs-local pattern.'
          ),
          read(
            'web.dev: How browsers work',
            'https://web.dev/articles/howbrowserswork',
            'web.dev · free',
            'The parse → style → layout → paint → composite pipeline. Essential context.'
          ),
        ],
        items: [
          item(
            'Semantic HTML & accessibility defaults',
            'Semantics *are* the accessibility layer. A `<button>` gives you focus, keyboard and screen-reader support for free.',
            'Prefer semantic elements over `<div role="…">`. Reach for ARIA only when there is no semantic equivalent, and test with keyboard + screen reader.',
            'You stop re-implementing browser features badly and ship accessible pages by default.',
            [
              link(
                'MDN: HTML elements',
                'https://developer.mozilla.org/en-US/docs/Web/HTML/Element'
              ),
              link(
                'MDN: ARIA states and properties',
                'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes'
              ),
            ]
          ),
          item(
            'The CSS box model & modern layout',
            'Every CSS bug is a box-model bug until proven otherwise. Flexbox and Grid replace 90% of the hacks we used to need.',
            'Set `box-sizing: border-box` globally. Flexbox for 1D rows, Grid for 2D layouts, `gap` instead of margins between siblings.',
            'You lay out complex pages without `float`, absolute-position hacks or 400 lines of margins.',
            [
              link(
                'Josh Comeau: Interactive Flexbox',
                'https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/'
              ),
              link(
                'CSS-Tricks: Grid guide',
                'https://css-tricks.com/snippets/css/complete-guide-grid/'
              ),
            ]
          ),
          item(
            'Design tokens with CSS custom properties',
            'Hard-coded colors and spacing turn every theme change into find-and-replace. Tokens make themes a one-line change.',
            'Define semantic tokens (`--surface`, `--ink`, `--brand`) in `:root`, override under `[data-theme="dark"]`, consume them in utilities and components.',
            'You ship light/dark mode, re-brand the site and swap palettes without touching components.',
            [
              link(
                'MDN: CSS custom properties',
                'https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties'
              ),
              link('OKLCH color picker', 'https://oklch.com/'),
            ],
            'The muslim-academy-platform uses OKLCH tokens — scan `app/assets/css/main.css` to see the pattern you adopt in Phase 4.'
          ),
          item(
            'Responsive design: breakpoints vs container queries',
            'Device-width breakpoints break when the same component ships into a sidebar and a hero. Container queries fix that.',
            'Start mobile-first with a few device breakpoints, then upgrade shared components to container queries so they adapt to their *container*.',
            'You ship one component that looks right in every slot without conditional classes.',
            [
              link(
                'MDN: @container',
                'https://developer.mozilla.org/en-US/docs/Web/CSS/@container'
              ),
              link(
                'MDN: CSS containment & container queries',
                'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries'
              ),
            ]
          ),
          item(
            'The browser render pipeline',
            'LCP, CLS and INP are all explained by one picture: parse → style → layout → paint → composite. Learn it once; apply it forever.',
            'Open DevTools Performance tab. Record a page load. Name every bar: Parse HTML, Recalculate Style, Layout, Paint, Composite. Spot the LCP marker.',
            'You stop guessing why a page is slow and start reading the trace.',
            [
              link('web.dev: How browsers work', 'https://web.dev/articles/howbrowserswork'),
              link(
                'Chrome DevTools: Performance panel',
                'https://developer.chrome.com/docs/devtools/performance'
              ),
            ]
          ),
        ],
      },

      // ---------- Week 2 — JavaScript Deep ----------
      {
        number: 2,
        stage: 'Learn',
        title: 'JavaScript, deep (not just syntax)',
        outcomes: [
          'Explain `var` vs `let` vs `const`, hoisting and the TDZ.',
          'Explain `this`, arrow functions and how context binding actually works.',
          'Draw the event loop: call stack, Web APIs, task queue, microtask queue.',
          'Reason about closures, prototypes and the module system from first principles.',
        ],
        task: task(
          'Write a JavaScript deep-dive notebook — one short program per concept',
          'Follow the Codevolution JavaScript playlist (link below). For every chapter, write a tiny self-contained script in a notebook repo, plus a short written explanation in your own words. No framework, no bundler — just node + a scratch HTML file.',
          [
            'Chapters 1–10: data types, operators, control flow, loops, functions, scope.',
            'Chapters 11–20: closures, hoisting, `this`, arrow functions, callbacks, promises, async/await.',
            'Chapters 21–30: prototypes, classes, modules, iterators/generators, error handling.',
            'For each chapter, write a 3-line summary + 1 "when I would use this" + 1 "gotcha I saw".',
            'Verify your mental models by predicting the output of 10 tricky snippets before running them.',
          ],
          [
            `"Say what you expect first, then run" — the gap between prediction and reality is where real understanding lives.`,
            `Closures = a function + the variable environment it was created in. If you can explain it to a non-developer, you have it.`,
            `\`this\` isn't magic: it's "where was the function invoked, and how?" Arrow functions capture lexically; regular functions bind at call site.`,
            `The event loop is the single biggest mental model shift from blocking languages. Draw it on paper.`,
            `JavaScript's module system is now ESM. CommonJS is for Node interop. Learn ESM first.`,
          ],
          'The notebook has one short, verified program per concept with your written explanation. You can predict the output of tricky snippets without running them.'
        ),
        resources: [
          watch(
            'Codevolution: JavaScript Masterclass (full playlist)',
            jsMasterclassPlaylist,
            'Codevolution · YouTube',
            'Watch end to end at 1.25×. For every chapter, write code in your notebook before moving on. This is the backbone of this week.'
          ),
          read(
            'MDN: JavaScript guide',
            'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
            'MDN · free',
            'Reference as you watch. "Expressions and operators" through "Modules" is the required sweep.'
          ),
          read(
            'JavaScript.info',
            'https://javascript.info/',
            'javascript.info · free',
            'Deepest free JS textbook on the web. Read Parts 1 and 2 in parallel with the playlist.'
          ),
          watch(
            'Philip Roberts: What the heck is the event loop',
            'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
            'JSConf · YouTube',
            'The 26-minute talk that teaches more about async JS than most courses. Required.'
          ),
          read(
            "You Don't Know JS Yet (2nd ed.)",
            'https://github.com/getify/You-Dont-Know-JS',
            'getify · free book series',
            'Read "Scope & Closures" and "Objects & Classes" after the playlist. Rewires your mental model.'
          ),
          read(
            'MDN: Equality comparisons',
            'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness',
            'MDN · free',
            '`==`, `===`, `Object.is`, `SameValueZero`. Know the differences cold.'
          ),
        ],
        items: [
          item(
            'Types, coercion & equality',
            'Half of JavaScript bugs are "I thought this was a string". Picking the right primitive and the right equality check removes a whole class of them.',
            'Know the 8 primitive types and the one object type. Use `===` by default; use `==` only when you understand coercion. Use `Object.is` for NaN and -0 edge cases.',
            'You stop debugging the same type-coercion bug every week.',
            [
              link(
                'MDN: Data types',
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures'
              ),
              link(
                'MDN: Equality comparisons',
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness'
              ),
            ]
          ),
          item(
            'Scope, hoisting & the TDZ',
            '`var` hoists to the top of a function; `let`/`const` hoist too but are unreachable in the Temporal Dead Zone. Different mental model, different bugs.',
            'Use `const` by default, `let` when you reassign, never `var`. If a `let` throws "cannot access before initialization", that is the TDZ saving you.',
            'You stop writing bugs that happen because a variable existed when you did not expect it to.',
            [
              link(
                'MDN: var vs let vs const',
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let'
              ),
              link('MDN: Hoisting', 'https://developer.mozilla.org/en-US/docs/Glossary/Hoisting'),
            ]
          ),
          item(
            'Closures',
            'A closure is a function plus the variables it was created with. It is the mechanism behind composables, factories, data privacy, almost everything functional in JS.',
            'A function that captures an outer-scope variable keeps that variable alive. Use them for private state (`counter`), lazy evaluation and composables that remember their inputs.',
            'You stop treating closures as magic and start using them deliberately for state encapsulation.',
            [
              link(
                "You Don't Know JS: Scope & Closures",
                'https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-%26-closures'
              ),
            ]
          ),
          item(
            '`this`, arrow functions & call/apply/bind',
            'The `this` keyword is the single most-asked JS interview question because people get it wrong daily. The rule is "how was the function invoked, not where was it defined" — except for arrow functions.',
            'Regular functions bind `this` at call site (`obj.fn()` → `obj`). Arrow functions inherit `this` lexically. `call`/`apply` set `this` explicitly; `bind` returns a bound copy.',
            'You stop writing `const self = this` and start picking function types deliberately.',
            [
              link(
                'MDN: this',
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this'
              ),
            ]
          ),
          item(
            'Prototypes, classes & inheritance',
            'ES classes are syntactic sugar over prototype chains. Understanding the chain explains how `instanceof` works, why `Object.create` is useful, and what Vue proxies hide.',
            'Every object has a `[[Prototype]]`. Look up with `Object.getPrototypeOf`. Classes compile to prototype chains. Favor composition (mixins, composables) over deep inheritance.',
            'You read any OO JS codebase (Vue internals, test library) without being surprised.',
            [
              link(
                'MDN: Inheritance and the prototype chain',
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain'
              ),
            ]
          ),
          item(
            'The event loop, microtasks & async',
            'Promises resolve as microtasks, which run after the current task but before the next. `setTimeout` is a task. Getting the order wrong is where "race condition" bugs come from.',
            'Draw: call stack → Web APIs → task queue + microtask queue. Microtasks drain fully between tasks. `queueMicrotask` and `Promise.resolve().then` are microtasks; `setTimeout(0)` is a task.',
            'You can predict the execution order of mixed sync/async code.',
            [
              link('Philip Roberts: event loop', 'https://www.youtube.com/watch?v=8aGhZQkoFbQ'),
              link('Jake Archibald: In the loop', 'https://www.youtube.com/watch?v=cCOL7MC4Pl0'),
            ]
          ),
          item(
            'Promises, async/await & error handling',
            'A rejected promise with no handler is an unhandled rejection — in production it is a Sentry alert. `try/catch` around `await` is non-negotiable.',
            'Prefer `async/await` for linear code. Wrap awaits in `try/catch`. Return a result type `{ok, data} | {ok: false, error}` instead of throwing when the error is a known case.',
            'You handle every failure path; no silent rejections, no "it worked locally" surprises.',
            [
              link(
                'MDN: Promise',
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise'
              ),
            ]
          ),
          item(
            'ES modules — the modern unit of code',
            'Script tags and IIFEs are history. ESM is how modern JavaScript is organised: static imports, tree-shaking, one default + many named exports.',
            'Prefer named exports (clearer refactor). Use dynamic `import()` for code-splitting. Avoid default exports unless the file *is* one concept.',
            'You design modules that bundlers can tree-shake and reviewers can follow.',
            [
              link(
                'MDN: JavaScript modules',
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules'
              ),
            ]
          ),
          item(
            'Modern JS features you will use daily',
            'The language shipped the features we used Lodash for. Knowing them makes code shorter, immutable and faster.',
            'Optional chaining, nullish coalescing, destructuring, spread/rest, `Array.at`, `Object.groupBy`, structuredClone, `Promise.allSettled`, async iterators.',
            'Your code looks like 2025, not 2017, and uses the runtime instead of helpers.',
            [
              link(
                'MDN: JavaScript guide',
                'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide'
              ),
              link('TC39 proposals', 'https://github.com/tc39/proposals'),
            ]
          ),
        ],
      },

      // ---------- Week 3 — TypeScript Deep ----------
      {
        number: 3,
        stage: 'Practice',
        title: 'TypeScript, deep (not just JS with types)',
        outcomes: [
          'Enable strict mode and defend every `any` you leave behind.',
          'Model data with union types, discriminated unions and generics.',
          'Use utility types (`Pick`, `Omit`, `Partial`, `ReturnType`, `Awaited`) idiomatically.',
          'Design type-safe APIs: generic functions, type predicates, assertion functions.',
        ],
        task: task(
          'Rewrite the Week 1 site in strict TypeScript with a typed API layer',
          'Take the HTML/CSS page from Week 1 and port it to a tiny TS project: Vite + strict TS + a typed `fetch()` layer that validates with Zod. No framework yet.',
          [
            'Scaffold with `pnpm create vite` + `vanilla-ts` template.',
            'Enable *all* strict flags: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`.',
            'Model the API response as a Zod schema; infer the TS type with `z.infer`.',
            'Write a generic `fetchJson<T>(url, schema)` that validates and returns a `Result<T, Error>` discriminated union.',
            'Use utility types to derive view-model types (`Pick<User, "id" | "name">`).',
            'Follow the Codevolution TypeScript playlist in parallel; keep a notes file per chapter.',
          ],
          [
            'If TypeScript lets you forget a case, write a `switch` that exhaustively narrows via `never`.',
            'Prefer `type` for unions, `interface` for extensible objects. Pick one convention per codebase and stick to it.',
            '`as` is a lie you tell the compiler. Avoid it; parse first (Zod) and narrow instead.',
            'For HTTP, model success and failure as a discriminated union: `{ok: true, data} | {ok: false, error}`.',
            'Utility types compose. `ReturnType<typeof fn>` and `Awaited<Promise<T>>` cover 80% of needs.',
          ],
          'The site runs on strict TS with zero `any`; the API layer parses with Zod and returns a Result union; a teammate can read the types and know what every function accepts and returns.'
        ),
        resources: [
          watch(
            'Codevolution: TypeScript Masterclass (full playlist)',
            tsMasterclassPlaylist,
            'Codevolution · YouTube',
            'Watch end to end at 1.25×. For every chapter, open a scratch `.ts` file and type along. This is the backbone of this week.'
          ),
          read(
            'TypeScript Handbook',
            'https://www.typescriptlang.org/docs/handbook/intro.html',
            'typescriptlang.org · free',
            'Read "Everyday Types", "Narrowing", "Functions", "Object Types" and "Generics" end to end.'
          ),
          read(
            'Matt Pocock: Total TypeScript tips',
            'https://www.totaltypescript.com/tips',
            'totaltypescript.com · free',
            'Pick 5 tips/week and apply them to real code. Short, dense, excellent.'
          ),
          read(
            'Matt Pocock: Beginners TypeScript tutorial',
            'https://www.totaltypescript.com/tutorials/beginners-typescript',
            'totaltypescript.com · free',
            '18 lessons that get the fundamentals right the first time.'
          ),
          read(
            'TypeScript Deep Dive (free book)',
            'https://basarat.gitbook.io/typescript/',
            'basarat.gitbook.io · free',
            'Depth reference. Chapters on "Types", "Type System" and "JSX" are essential.'
          ),
          read(
            'Zod docs',
            zodDocs,
            'zod.dev · free',
            'You will use this in every form, every API response, every env parse. Learn the schema builders cold.'
          ),
          read(
            'TypeScript release notes',
            'https://www.typescriptlang.org/docs/handbook/release-notes/overview.html',
            'typescriptlang.org · free',
            'Skim the last 3 releases. The language keeps shipping — stay current.'
          ),
        ],
        items: [
          item(
            'Strict mode & what each flag catches',
            'Non-strict TS is JS with slower feedback. Each strict flag turns a class of runtime bugs into compile errors.',
            'Enable `strict`, `noUncheckedIndexedAccess` (array indexing returns `T | undefined`), `exactOptionalPropertyTypes` (optional ≠ undefined), `noImplicitOverride`. Fix errors by modelling, not by `as`.',
            'You stop debugging the same "undefined is not a function" bug three times. The compiler finds it before you run the code.',
            [
              link('TS: strict', 'https://www.typescriptlang.org/tsconfig#strict'),
              link(
                'TS: noUncheckedIndexedAccess',
                'https://www.typescriptlang.org/tsconfig#noUncheckedIndexedAccess'
              ),
            ],
            'The muslim-academy-platform runs on strict TS. Scan `tsconfig.json` and the `type.ts` files inside `app/features/*/`.'
          ),
          item(
            'Union types & discriminated unions',
            'A function that accepts "a string or null" models reality. One that accepts `any` gives up.',
            'Model state as a discriminated union: `{ status: "loading" } | { status: "ok", data: T } | { status: "error", error: E }`. Narrow with `if`, `switch` and `never` checks. Use a `kind`/`type`/`status` tag per variant.',
            'You handle every state the compiler says exists — no "forgot the error state" bugs in review.',
            [link('TS: Narrowing', 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html')]
          ),
          item(
            'Generics: write once, type right everywhere',
            'A generic function captures the relationship between inputs and outputs. Without generics you overload or lose types.',
            'Think "I want this function to work for *any* T". Use `<T>` for the parameter, constrain with `<T extends ...>` when needed, let TS infer at call site.',
            'You write reusable functions that keep type information instead of degrading to `any` or `unknown`.',
            [link('TS: Generics', 'https://www.typescriptlang.org/docs/handbook/2/generics.html')]
          ),
          item(
            'Utility types (`Pick`, `Omit`, `Partial`, `Required`, `ReturnType`, `Awaited`)',
            'Utility types let you derive one type from another instead of repeating definitions. Change the source, every derivative updates.',
            'Learn `Pick`, `Omit`, `Partial`, `Required`, `Readonly`, `Record`, `ReturnType`, `Parameters`, `Awaited`. Use them for view models, patch payloads and inferring from functions.',
            'You stop maintaining three near-duplicate types for the same entity.',
            [
              link(
                'TS: Utility types',
                'https://www.typescriptlang.org/docs/handbook/utility-types.html'
              ),
            ]
          ),
          item(
            'Type predicates & assertion functions',
            'When narrowing needs a helper, type predicates make the helper teach TypeScript how to narrow too.',
            "Return `value is T` from a predicate (`isUser(x): x is IUser`). Use `asserts` for runtime-checked guards. Combine with Zod's `parse` for best of both worlds.",
            'Your runtime checks and your compile-time narrowing stay in sync.',
            [
              link(
                'TS: Type predicates',
                'https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates'
              ),
            ]
          ),
          item(
            'Runtime schema validation with Zod',
            'TypeScript types are erased at runtime. Zod gives you the type *and* the runtime check in one line.',
            'Define a Zod schema, infer the TS type with `z.infer<typeof schema>`, parse untrusted input (API, form, env) at the boundary. Never trust unparsed JSON.',
            'One shape protects the compiler and the runtime; bad server responses fail loudly the moment they arrive.',
            [
              link('Zod docs', zodDocs),
              link(
                '@vee-validate/zod bridge',
                'https://vee-validate.logaretm.com/v4/examples/zod/'
              ),
            ],
            'This is the schema layer you reuse in Phase 5 when wiring forms with VeeValidate.'
          ),
          item(
            'Type-safe `fetch` wrappers',
            `A \`fetch<T>\` that returns \`T\` is a lie — the response could be anything. A \`fetch<T>\` that returns a validated \`Result<T, Error>\` tells the truth.`,
            `Write \`async function fetchJson<T>(url: string, schema: ZodSchema<T>): Promise<Result<T, FetchError>>\`. Parse with the schema inside. Model success/failure as a union, not thrown errors.`,
            `Every call site handles the error case because the compiler won't let it ignore it.`,
            []
          ),
          item(
            'When to reach for `any` / `unknown` / `never`',
            '`any` is "turn off the compiler". `unknown` is "I will narrow before using it". `never` is "this cannot happen".',
            'Default to `unknown` for untrusted input. Reserve `any` for third-party interop you cannot type (rare). Use `never` to prove exhaustive switches via `const _exhaustive: never = kind`.',
            'You never surprise a reviewer with an unexplained `any`.',
            [
              link(
                'TS: unknown vs any',
                'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type'
              ),
            ]
          ),
          item(
            'TypeScript module system & declaration files',
            `Modern TS uses ESM. Declaration files (\`.d.ts\`) describe untyped code (legacy JS, globals). Knowing the difference stops many build-mode mysteries.`,
            'Co-locate types in `type.ts` (per the project convention). Only write `.d.ts` for ambient declarations (`declare module`, `declare global`). Prefer typing source directly.',
            'You keep types next to code, and reach for `.d.ts` only when you truly need ambient declarations.',
            [link('TS: Modules', 'https://www.typescriptlang.org/docs/handbook/2/modules.html')]
          ),
        ],
      },

      // ---------- Week 4 — Thinking Like a Frontend Engineer ----------
      {
        number: 4,
        stage: 'Prove',
        title: 'Thinking like a frontend engineer',
        outcomes: [
          'Decide between SSR, CSR and SSG per route by reasoning, not habit.',
          'Pick the right state scope: local, lifted, cross-cutting or URL.',
          'Design component APIs: props vs slots vs composables.',
          'Set a performance budget and defend it with measurement.',
          'Design for accessibility from the first commit, not the last.',
        ],
        task: task(
          'Build a small app with a written decision log',
          'Build a 3-screen app (list → detail → form) in strict TS + vanilla Vue, but *before every design decision* write a short entry in `DECISIONS.md` explaining the trade-off and the choice.',
          [
            'Decide and record: rendering (SSR? SPA? SSG?), state scope (where does the filter live?), component API (props-first or slot-first?), performance budget (LCP target, bundle budget).',
            'For each component, write a props/emits/slots contract before writing the template.',
            'Set a Lighthouse target; measure baseline; keep a log of changes and their effect.',
            'Audit each screen with axe + keyboard before considering it done.',
            'Open DevTools Performance tab, record one interaction, name what you see.',
          ],
          [
            `A design decision without a trade-off is a reflex. Write the alternative you rejected and why.`,
            `Rule of thumb: if two components need the same state, lift it to the nearest common ancestor. If many unrelated components need it, make it cross-cutting.`,
            `URL state is free "undo". If a user might want to share or refresh and keep the view, it belongs in the URL.`,
            `Props are a tight contract (one shape). Slots are an escape hatch (any shape). Composables carry logic that outlives one component.`,
            `Performance budgets are promises. "LCP ≤ 2.5s on mobile throttled" is a promise. Pick one, measure, defend.`,
          ],
          'The app works, the decision log explains every non-obvious call, Lighthouse ≥ 90, and a reviewer can read `DECISIONS.md` and understand the architecture in 10 minutes.'
        ),
        resources: [
          read(
            'Patterns.dev: Rendering Patterns',
            'https://www.patterns.dev/#rendering-patterns',
            'patterns.dev · free',
            'SSR, SSG, ISR, streaming, islands. The vocabulary of modern frontend rendering.'
          ),
          read(
            'web.dev: Performance budgets',
            'https://web.dev/articles/performance-budgets-101',
            'web.dev · free',
            'How to pick budgets and defend them.'
          ),
          read(
            'web.dev: Core Web Vitals',
            'https://web.dev/articles/vitals',
            'web.dev · free',
            'LCP, INP, CLS — the metrics you will defend forever.'
          ),
          read(
            'A11y Project: checklist',
            'https://www.a11yproject.com/checklist/',
            'a11yproject.com · free',
            'A pragmatic a11y checklist you can run on any page.'
          ),
          read(
            'web.dev: Think like an engineer, not a tutorial follower',
            'https://web.dev/learn/',
            'web.dev · free',
            'Browse the "Learn" tracks. The pattern of "pick the primitive, understand the trade-off" is the frontend mindset.'
          ),
          read(
            'Addy Osmani: Image optimisation',
            'https://images.guide/',
            'images.guide · free',
            'The engineering mindset applied to images. Mirror it for everything.'
          ),
          watch(
            'Jake Archibald: The main thread is overworked & underpaid',
            'https://www.youtube.com/watch?v=7Rrv9qFMWNM',
            'JSConf · YouTube',
            'A classic on how to think about where work happens in the browser.'
          ),
          read(
            'Rich Harris: Rethinking reactivity',
            'https://www.youtube.com/watch?v=AdNJ3fydeao',
            'YouTube · talk',
            'The mental model behind modern reactive frameworks. Watch after Week 2.'
          ),
        ],
        items: [
          item(
            'Rendering strategy as a trade-off',
            'SSR, CSR and SSG are not fashion choices. They trade off first-paint, interactivity, SEO, caching and complexity.',
            'For each route, ask: does this need SEO? Does the first paint carry data? Can it be pre-rendered at build time? Is it behind auth? Pick accordingly.',
            'You pick the right mode per route instead of defaulting one for the whole app.',
            [link('Patterns.dev: Rendering', 'https://www.patterns.dev/#rendering-patterns')]
          ),
          item(
            'Reactivity, data flow & the mental model',
            'Modern UI frameworks all share a core idea: state → derive → render. Framework syntax varies; the mental model is the same.',
            'Think in state transitions, not in event handlers. For every piece of state ask: what *derives* from this? What *reacts* to it? Draw the arrows before writing code.',
            'You pick the right primitive (ref/computed/watch, useState/useMemo/useEffect) deliberately instead of by reflex.',
            [
              link(
                'Rich Harris: Rethinking reactivity',
                'https://www.youtube.com/watch?v=AdNJ3fydeao'
              ),
            ]
          ),
          item(
            'State scope: a decision tree',
            'Shared state is the biggest source of frontend bugs. Choosing scope badly causes stale UIs, cache mysteries and refactor pain.',
            'Decision tree: used by one component → local `ref`. Used by two siblings → lift to parent. Used across routes → cross-cutting composable (`useState` or Pinia). Shareable/bookmarkable → URL state.',
            'You stop making everything "global just in case" and start placing state where it belongs.',
            []
          ),
          item(
            'Component API design: props, slots, composables',
            'A good component API is a contract. Reviewers can predict what it does without opening the file.',
            'Props = fixed shape (data in). Emits = fixed events (data out). Slots = flexible content (user shape). Composables = reusable logic (lifecycle-aware). Pick the smallest API that covers the use case.',
            'You design components other engineers can extend without forking.',
            []
          ),
          item(
            'Performance budgets as promises',
            'A budget turns "fast enough" into a measurable commitment. No budget = inevitable regression.',
            'Pick numbers you can defend: LCP ≤ 2.5s mobile throttled, INP ≤ 200ms, CLS ≤ 0.1, JS ≤ 170KB gzipped per route. Measure in CI. A regression is a bug, not a surprise.',
            'You stop debating "is this fast?" and start answering "does it meet the budget?"',
            [
              link(
                'web.dev: Performance budgets',
                'https://web.dev/articles/performance-budgets-101'
              ),
            ]
          ),
          item(
            'Accessibility-first mindset',
            'Retrofitting a11y is 5× harder than designing for it. The first commit is where you win.',
            'For every feature ask: semantic markup? Keyboard reachable? Visible focus? Labels and roles? Contrast? Screen-reader order? Fix during design, not during audit.',
            'Your features pass axe + keyboard + screen reader on day one.',
            [link('A11y Project checklist', 'https://www.a11yproject.com/checklist/')]
          ),
          item(
            'DevTools as a diagnostic skill',
            'The browser hands you an X-ray. Most frontend engineers never learn to read it.',
            'Learn: Elements (semantics), Console (runtime), Sources (debugger), Network (requests + waterfall), Performance (trace), Lighthouse (audit), Coverage (unused code), Memory (leaks).',
            'You diagnose problems in minutes instead of guessing in hours.',
            [link('Chrome DevTools', 'https://developer.chrome.com/docs/devtools')]
          ),
          item(
            'Writing a decision log (`DECISIONS.md`)',
            'A decision made silently is a decision no one can review. A decision logged is one the team can revisit.',
            'For every non-obvious call, record: context, options considered, decision, consequences. Keep entries short (≤10 lines). Grow a `DECISIONS.md` per feature or project.',
            'Future-you (and new teammates) understand the "why" instead of inheriting a mystery.',
            []
          ),
          item(
            'Reviewing code like an engineer',
            'A good review catches the bug the author would have missed. A great review catches the design flaw before it ships.',
            'Review in two passes: first the design (does this belong here? is the API right?), then the implementation (edge cases, errors, tests, a11y). Comment with specifics, link docs, suggest the fix.',
            'You raise the ceiling of the whole team, not just your own output.',
            [
              link(
                'Google engineering practices: code review',
                'https://google.github.io/eng-practices/review/'
              ),
            ]
          ),
        ],
      },
    ],
    template: {
      title: 'Fundamentals checklist',
      items: [
        'Static page rebuilt in semantic HTML with Grid + Flexbox',
        'Design tokens defined in CSS custom properties with dark-mode override',
        'JavaScript notebook: one program + explanation per Codevolution chapter',
        'TypeScript strict mode with zero `any`, Zod-validated API layer',
        'Decision log explaining rendering, state scope, component API and performance budget',
        'Lighthouse ≥ 90, axe clean, keyboard-reachable, 200% zoom tested',
      ],
    },
    prompts: [
      'Predict the output of this JS snippet (closures/hoisting/async). Explain your reasoning, then run it.',
      'Convert this TypeScript to strict mode. For each error, explain the fix instead of adding `as`.',
      'Review this component for state-scope choices. Suggest which state should move to local / lifted / cross-cutting / URL.',
      'Audit this page against the performance budget. List the three highest-leverage fixes with evidence.',
    ],
    gates: [
      'You can explain closures, `this`, prototypes and the event loop without hand-waving.',
      'You can turn on strict TS and defend every `any` you leave behind.',
      'You can parse an API response with Zod and model success/failure as a discriminated union.',
      'You can decide rendering mode, state scope and component API deliberately — and write it down.',
      'You can pick a performance budget and defend it with Lighthouse evidence.',
    ],
  },

  // =====================================================================
  // Phase 2 — Vue 3 Core
  // =====================================================================
  {
    key: 'vue',
    number: 2,
    weeks: 'Weeks 5–6',
    title: 'Vue 3 Core',
    goal: 'Think in reactivity and composition. Build components with `<script setup>` and compose logic into reusable composables.',
    proof: 'A small Vue 3 app with typed props/emits, composables and router',
    tone: 'violet',
    role: {
      title: 'Vue Component Developer',
      summary:
        'You can author Vue 3 SFCs idiomatically — ref/reactive/computed, typed props/emits, slots, provide/inject and composables — without reaching for Options API.',
      responsibilities: [
        'Write `<script setup lang="ts">` components that compile cleanly.',
        'Compose feature logic into `use<Job>Handler` composables with clear state ownership.',
        'Pick the right reactivity primitive for the job (ref vs reactive vs computed vs shallowRef).',
        'Use Composition API lifecycle hooks correctly, not Options-API habits.',
      ],
    },
    weeksData: [
      {
        number: 5,
        stage: 'Learn',
        title: 'SFCs & the reactivity system',
        outcomes: [
          'Explain reactivity in two sentences: proxies + dependency tracking.',
          'Choose between `ref`, `reactive`, `computed` and `watch` based on the data shape.',
          'Bind a form input with `v-model` and understand what the compiler expands it to.',
        ],
        task: task(
          'Build a small Vue 3 app with reactive state and derived computed values',
          'Rebuild the Phase 1 app as a Vue 3 app with `<script setup>`. Add a filter box + sort toggle driven by reactive state.',
          [
            'Scaffold with `pnpm create vite` + `vue-ts`.',
            'Convert the page to one `App.vue` + 3 child SFCs.',
            'Hold state in `ref`s; derive filtered/sorted lists with `computed`.',
            'Add a `watch` that syncs the filter query to the URL hash.',
            'Type every prop and emit via `defineProps<...>()` / `defineEmits<...>()`.',
          ],
          [
            '`ref` for primitives + top-level values; `reactive` for objects you unwrap inline; `shallowRef` when the content is huge and you only replace it.',
            '`computed` is cached. If the function is cheap and used once, inline it.',
            '`watch` runs on change; `watchEffect` runs on access. Prefer `watch` for clarity.',
            'Compiler expansion: `v-model="x"` becomes `:modelValue="x" @update:modelValue="x = $event"`. Knowing this unlocks custom components.',
          ],
          'Filter and sort react instantly; URL hash reflects the filter; every prop and emit is typed; devtools shows reactive effects you can defend.'
        ),
        resources: [
          read(
            'Vue 3 docs: Essentials',
            vueDocs,
            'vuejs.org · free',
            'Read "Reactivity Fundamentals" and "Computed Properties" end to end.'
          ),
          read(
            'Vue 3 docs: Reactivity in depth',
            'https://vuejs.org/guide/extras/reactivity-in-depth.html',
            'vuejs.org · free',
            'Pay attention to the proxy + effect model.'
          ),
          watch(
            'Vue Mastery: Reactivity deep dive',
            'https://www.youtube.com/watch?v=NZfNS4sJ8CI',
            'Vue Mastery · YouTube',
            'Shows the mental model with real code.'
          ),
          read(
            'Vue 3 docs: Script Setup',
            'https://vuejs.org/api/sfc-script-setup.html',
            'vuejs.org · free',
            'Reference for `defineProps`, `defineEmits`, `defineExpose`.'
          ),
          watch(
            'LearnVue: ref vs reactive',
            'https://www.youtube.com/watch?v=NAE2wT3lkbQ',
            'LearnVue · YouTube',
            'The clearest explanation of when to use each.'
          ),
        ],
        items: [
          item(
            '`<script setup lang="ts">` is the default',
            'Options API is still supported but every new SFC in a modern codebase uses `<script setup>`. Learning it directly saves re-learning later.',
            'Import, define state, declare props/emits, define functions — no `return` needed. Everything in `<script setup>` is auto-exposed to the template.',
            'You read any modern Vue codebase without translating from Options API.',
            [link('Script Setup', 'https://vuejs.org/api/sfc-script-setup.html')],
            'In the muslim-academy-platform convention: every SFC uses `<script setup lang="ts">`. Never Options API.'
          ),
          item(
            'ref, reactive, computed, watch',
            'Picking the wrong reactivity primitive is how you fight the framework. Each one has a shape it is best for.',
            '`ref` for primitives + top-level mutable values; `reactive` for stable objects destructured inline; `computed` for derived state; `watch` for side effects. `shallowRef` for huge replaced-whole objects.',
            'You stop writing `watch` where `computed` is enough, and stop writing `reactive` where `ref` is enough.',
            [
              link(
                'Reactivity Fundamentals',
                'https://vuejs.org/guide/essentials/reactivity-fundamentals.html'
              ),
            ]
          ),
          item(
            'Template directives: v-if, v-for, v-model, v-bind',
            'The Vue template is HTML + a few directives. Learn them well and you render anything without reaching for a render function.',
            'Use `v-if` for conditional *mount*, `v-show` for toggling display. Use `v-for` with a stable `:key`. Use `v-model` on inputs, custom components and modifiers (`.lazy`, `.trim`, `.number`).',
            'Your templates are small, readable and never fall into render-function escape hatches.',
            [link('Template Syntax', 'https://vuejs.org/guide/essentials/template-syntax.html')]
          ),
          item(
            'Props, emits & two-way binding',
            'A component with untyped props is a bug waiting to happen. TypeScript makes props a contract.',
            'Type props with `defineProps<{...}>()`; type emits similarly. For two-way binding use `defineModel()` or `modelValue` + `update:modelValue`.',
            'You get autocomplete, red squiggles on misuse, and a template that documents itself.',
            [link('defineModel', 'https://vuejs.org/api/sfc-script-setup.html#definemodel')]
          ),
          item(
            'How Vue reactivity actually works (proxies + effect tracking)',
            `Reactivity isn't magic. Vue 3 wraps your state in a Proxy; when you *read* a reactive value during an effect, Vue records the dependency; when you *write*, Vue re-runs every effect that depended on it. That's it.`,
            `Read "Reactivity in depth" to see the \`track\`/\`trigger\` loop. Experiment in the SFC Playground: wrap an object in \`reactive\`, log inside a \`watchEffect\`, mutate — and watch the effect re-run. The reason \`reactive()\` can't be destructured and \`ref().value\` has that suffix becomes obvious.`,
            `You stop fighting the framework. You know why some things trigger updates and others don't, and you can debug "my computed isn't recomputing" in seconds.`,
            [
              link(
                'Vue: Reactivity in depth',
                'https://vuejs.org/guide/extras/reactivity-in-depth.html'
              ),
              link(
                'Vue: Rendering mechanism',
                'https://vuejs.org/guide/extras/rendering-mechanism.html'
              ),
              link(
                'Michael Thiessen: Reactivity visualised',
                'https://vuejs.org/guide/extras/reactivity-in-depth.html#how-reactivity-works-in-vue'
              ),
            ]
          ),
          item(
            'How an SFC compiles (template compiler + render functions)',
            'A `.vue` file is compiled at build time into a plain JavaScript module: a render function plus setup state. Knowing the output explains most SFC quirks (why `v-if` discards state, why `key` matters).',
            'Open the SFC Playground, write a 10-line component, click the "JS Output" tab. Read the generated render function. Spot the compiled `v-if`, `v-for` and `v-model`.',
            'You stop treating templates as a black box and start reasoning about re-renders in terms of what the compiler actually produces.',
            [
              link('Vue SFC Playground', 'https://play.vuejs.org/'),
              link(
                'Vue: Render functions & JSX',
                'https://vuejs.org/guide/extras/render-function.html'
              ),
              link(
                'Vue: Rendering mechanism',
                'https://vuejs.org/guide/extras/rendering-mechanism.html'
              ),
            ]
          ),
        ],
      },
      {
        number: 6,
        stage: 'Practice',
        title: 'Composables, slots & composition',
        outcomes: [
          'Extract reusable feature logic into a `use<Job>Handler` composable.',
          'Pass structured content via named + scoped slots.',
          'Share state with provide/inject when prop drilling becomes noise.',
        ],
        task: task(
          'Extract a feature into components + a composable',
          'Take a Week 5 feature (filter, sort, pagination) and extract it into (a) a reusable component with slots and (b) a `useFilter` composable that owns the state and exposes helpers.',
          [
            'Define `useFilter<T>` with inputs (list, searchKeys) and outputs (query, filtered).',
            'Build a `FilterBar.vue` component that consumes the composable via props/model.',
            'Use a named slot for actions so pages customise without forking.',
            'Use a scoped slot to let pages render each item their own way.',
            'Wire it on two pages that share the filter logic with different items.',
          ],
          [
            'A composable is a function that returns reactive state. Not every helper is a composable; only ones that *own* state.',
            'Name composables `useXxx`. If it takes a ref as input, accept `MaybeRefOrGetter`.',
            'A named slot carries fixed semantics ("actions", "empty"). A scoped slot exposes data to the parent.',
            'In the muslim-academy-platform, composables live in `app/features/<module>/composables/use<Job>Handler.ts` — filename mirrors the exported function.',
          ],
          'The same filter logic powers two pages; the composable has one source of truth; props/emits are typed; slots let pages render differently without copy-paste.'
        ),
        resources: [
          read(
            'Vue 3 docs: Composables',
            'https://vuejs.org/guide/reusability/composables.html',
            'vuejs.org · free',
            'Memorise the "`use...` prefix, accepts refs, returns refs" shape.'
          ),
          read(
            'Vue 3 docs: Slots',
            'https://vuejs.org/guide/components/slots.html',
            'vuejs.org · free',
            'Named + scoped slots are 80% of component library ergonomics.'
          ),
          read(
            'Vue 3 docs: Provide / Inject',
            'https://vuejs.org/guide/components/provide-inject.html',
            'vuejs.org · free',
            'The right escape hatch for deep prop drilling.'
          ),
          read(
            'VueUse: core composables',
            'https://vueuse.org/functions.html',
            'vueuse.org · free',
            'Steal the shape, not necessarily the dependency. 100+ examples.'
          ),
          watch(
            'Alex Vipond: Composition API lifecycle',
            'https://www.youtube.com/watch?v=lf-xTO85uw0',
            'Alex Vipond · YouTube',
            'When each hook actually fires and why.'
          ),
        ],
        items: [
          item(
            'Composables (`use<Job>Handler`)',
            'Logic that outlives a single component belongs in a composable, not a mixin and not a util.',
            'A composable is a function that owns reactive state and returns refs/computeds plus helpers. Accept `MaybeRefOrGetter` for inputs. Clean up in `onScopeDispose`.',
            'You stop copy-pasting state across components and start composing features from reusable units.',
            [link('Vue: Composables', 'https://vuejs.org/guide/reusability/composables.html')],
            'In the muslim-academy-platform, cross-feature composables go in `app/composables/useXxx.ts`; feature-owned ones live in `app/features/<module>/composables/`.'
          ),
          item(
            'Slots: default, named, scoped',
            'Slots are the API your component exposes to its users. Named slots carry structure; scoped slots carry data.',
            'Use the default slot for the primary content. Use named slots (`<template #actions>`) for fixed positions. Use scoped slots to hand data up to the parent.',
            'You build components other engineers can extend without forking.',
            [link('Vue: Slots', 'https://vuejs.org/guide/components/slots.html')]
          ),
          item(
            'provide / inject',
            'Passing a prop through five intermediate components is a code smell. Provide/inject skips the chain.',
            'Provide in an ancestor (page or layout), inject in the descendant. Type the injection key with `InjectionKey<T>`. Default-value it for tests.',
            'Deep prop drilling disappears and tests can swap the provided value without rewriting the component tree.',
            [
              link(
                'Vue: Provide / Inject',
                'https://vuejs.org/guide/components/provide-inject.html'
              ),
            ]
          ),
          item(
            'Lifecycle hooks in `<script setup>`',
            'The Composition API lifecycle is different from Options. Pick the right hook or your effect runs at the wrong time.',
            'Use `onMounted` for DOM access, `onBeforeUnmount` for cleanup, `onUpdated` sparingly. In SSR, `onMounted` only runs on the client — rely on it, do not fight it.',
            'Your component effects run exactly once in the right lifecycle slot, and SSR stays correct.',
            [link('Vue: Lifecycle hooks', 'https://vuejs.org/guide/essentials/lifecycle.html')]
          ),
        ],
      },
    ],
    template: {
      title: 'Vue component checklist',
      items: [
        'Every SFC uses `<script setup lang="ts">`',
        'Props and emits are typed via the generic form',
        'Shared logic lives in a `use<Job>Handler` composable',
        'Named/scoped slots are used where the component is reused',
        'No Options-API code anywhere in new work',
      ],
    },
    prompts: [
      'Convert this Options-API component to `<script setup lang="ts">`. Preserve behaviour exactly.',
      'Review this component and tell me which state should be a `computed` instead of a `watch`.',
      'Extract this duplicated logic into a `useX` composable. Keep the component API unchanged.',
    ],
    gates: [
      'You can explain reactivity in two sentences without using the word "magic".',
      'You can author a Vue 3 SFC with typed props/emits and a composable in one sitting.',
      'You pick ref vs reactive vs computed deliberately, not by habit.',
      'You use slots and provide/inject instead of prop drilling.',
    ],
  },

  // =====================================================================
  // Phase 3 — Nuxt 4 & Project Architecture
  // =====================================================================
  {
    key: 'nuxt',
    number: 3,
    weeks: 'Weeks 7–9',
    title: 'Nuxt 4 & Project Architecture',
    goal: 'Move from Vite + Vue to Nuxt 4. Learn the file-based conventions and the feature-module architecture this codebase uses.',
    proof:
      'A Nuxt 4 feature module scaffolded end to end (type.ts, service.ts, composable, component)',
    tone: 'teal',
    role: {
      title: 'Nuxt Application Developer',
      summary:
        'You can scaffold a Nuxt 4 project, understand what auto-imports and server routes give you, and build a feature module that follows the project conventions.',
      responsibilities: [
        'Explain file-based routing, layouts, middleware and auto-imports.',
        'Pick the right rendering mode per route (SSR vs client-only).',
        'Scaffold a feature under `app/features/<module>/` with service, composable, type and component.',
        'Use Nuxt plugins and modules without turning them into magic.',
      ],
    },
    weeksData: [
      {
        number: 7,
        stage: 'Learn',
        title: 'Nuxt 4 fundamentals',
        outcomes: [
          'Explain the Nuxt directory structure (pages, layouts, middleware, plugins, server).',
          'Pick between SSR, client-only and prerendered per route.',
          'Use auto-imports deliberately — know what resolves without an import.',
        ],
        task: task(
          'Scaffold a 3-page Nuxt 4 app with layouts and middleware',
          'Create a fresh Nuxt 4 project with three pages (public home, protected dashboard, login), one shared layout and one auth-check middleware.',
          [
            'Scaffold with `pnpm dlx nuxi init`. Open `nuxt.config.ts` and read every option.',
            'Create `pages/index.vue`, `pages/dashboard.vue`, `pages/auth/login.vue`.',
            'Add `layouts/default.vue` with header/footer; use `definePageMeta({ layout: "default" })`.',
            'Add `middleware/auth.ts` that redirects to login if not authenticated.',
            'Verify auto-imports work: `useRoute`, `useRouter`, your own `~/composables/useFoo.ts`.',
          ],
          [
            'In the muslim-academy-platform convention: one component per page file, named per Nuxt auto-import rules (e.g. `pages/auth/login.vue` → `AuthLogin`).',
            'Auto-imports are not magic — they are declared in `nuxt.config.ts`. Scan it to see what is auto-registered.',
            'In the project this plan references, `@alikhalilll/nuxt-auto-middleware` applies middleware by layout. Read `ai/context/project-structure.md` to understand the rules.',
          ],
          'The three pages route cleanly; the auth middleware blocks the dashboard; layouts render; auto-imports resolve with zero manual imports for Nuxt helpers.'
        ),
        resources: [
          read(
            'Nuxt docs: Introduction',
            nuxtDocs,
            'nuxt.com · free',
            'Read "Views", "Routing" and "Rendering" end to end.'
          ),
          read(
            'Nuxt docs: Directory structure',
            'https://nuxt.com/docs/guide/directory-structure/app',
            'nuxt.com · free',
            'The map of what each folder does. Keep bookmarked.'
          ),
          read(
            'Nuxt docs: Rendering modes',
            'https://nuxt.com/docs/guide/concepts/rendering',
            'nuxt.com · free',
            'Understand universal, client-only, prerendered and hybrid.'
          ),
          read(
            'Nuxt docs: Auto imports',
            'https://nuxt.com/docs/guide/concepts/auto-imports',
            'nuxt.com · free',
            'Know what resolves without an import — and why that is sometimes a trap.'
          ),
          watch(
            'LearnVue: Nuxt 3 in 60 minutes',
            'https://www.youtube.com/watch?v=dCxSsr5xuL8',
            'LearnVue · YouTube',
            'Fast practical tour of the directories.'
          ),
        ],
        items: [
          item(
            'File-based routing & pages',
            'The folder structure *is* the route tree. Learning it saves you 90% of the routing config you would otherwise write.',
            'Create `pages/<name>.vue`; dynamic segments use `[id].vue`; catch-alls use `[...slug].vue`. Nested routes map to nested layouts via `<NuxtPage>`.',
            'You stop writing router config by hand and start thinking in URLs that map to files.',
            [link('Nuxt: Routing', 'https://nuxt.com/docs/getting-started/routing')]
          ),
          item(
            'Layouts & `<NuxtPage>`',
            'Layouts avoid wrapping every page in the same chrome. One default + a few overrides is usually enough.',
            'Create `layouts/default.vue` with `<slot />`. Override per page with `definePageMeta({ layout: "auth" })`. Pass data from layout to page via provide/inject or `useState`.',
            'In the muslim-academy-platform you see `layouts/default.vue`, `layouts/auth.vue`, `layouts/protected*.vue` — each a complete chrome variant.',
            [link('Nuxt: Views', 'https://nuxt.com/docs/getting-started/views')]
          ),
          item(
            'Auto-imports: components, composables, utilities',
            'Nuxt auto-imports your `components/`, `composables/`, `utils/` and framework helpers. Convenient — and sometimes confusing.',
            'Know what gets auto-imported from `nuxt.config.ts > components / imports`. Use `.nuxt/imports.d.ts` to see every registered name.',
            'You trust the auto-imports because you know exactly which ones exist.',
            [link('Nuxt: Auto imports', 'https://nuxt.com/docs/guide/concepts/auto-imports')]
          ),
          item(
            'Rendering modes: SSR vs client-only vs prerender',
            'Rendering is a trade-off, not a default. SSR for SEO + first paint; client-only for pages behind auth; prerender for marketing surfaces.',
            'Pick per route via `routeRules` in `nuxt.config.ts`. Prerender static marketing, SSR for public pages, `ssr: false` for auth-wall dashboards.',
            'In the muslim-academy-platform `nuxt.config.ts` the `routeRules` block prerenders /resources and disables SSR for /auth/social-callback. Scan it.',
            [link('Nuxt: Rendering', 'https://nuxt.com/docs/guide/concepts/rendering')]
          ),
          item(
            'Nitro server routes & runtime config',
            'Nuxt ships with Nitro — a server runtime. You can add API routes, middleware and background jobs without a separate backend.',
            'Add `server/api/<name>.ts` for API endpoints. Use `runtimeConfig` for env; prefer the public/private split; access via `useRuntimeConfig()`.',
            'You can glue a small server (webhooks, OAuth callbacks, revalidation) without spinning up a separate service.',
            [link('Nuxt: Server routes', 'https://nuxt.com/docs/getting-started/server')]
          ),
          item(
            'How SSR + hydration actually works',
            'SSR renders the first HTML on the server, then the client "resumes" the same tree instead of re-rendering it. If server and client state disagree, you get hydration mismatch warnings — the single most common Nuxt bug.',
            'Think in two passes: server render (no browser APIs, no `window`), client hydrate (browser APIs available in `onMounted`). Serialize state with `useState`/`useAsyncData` so both passes see the same values. Never read `window` outside `onMounted`.',
            'You stop hitting hydration errors in production and start writing components that work the same on both passes.',
            [
              link('Nuxt: Rendering modes', 'https://nuxt.com/docs/guide/concepts/rendering'),
              link('Vue: SSR guide', 'https://vuejs.org/guide/scaling-up/ssr.html'),
              link(
                'Nuxt: Hydration mismatch',
                'https://nuxt.com/docs/getting-started/data-fetching#serialisation'
              ),
            ]
          ),
          item(
            'The build pipeline: Vite + Nitro + modulepreload',
            'Nuxt wraps Vite (client bundling) + Nitro (server runtime) + a route-based code split. "The bundle" is actually dozens of chunks + preload directives + prerender HTML, all orchestrated by `nuxt build`.',
            'Run `nuxt build` and inspect `.output/`. Look at the client manifest, the server bundle, the prerendered HTML, the `<link rel="modulepreload">` chain. Understand that every imported chunk gets a preload tag — that is why `experimentalMinChunkSize` matters.',
            'You read your own build output as evidence instead of as noise. Performance regressions become diagnoseable.',
            [
              link('Vite: Guide', 'https://vite.dev/guide/'),
              link('Nitro: Introduction', 'https://nitro.unjs.io/guide'),
              link('web.dev: Modulepreload', 'https://web.dev/articles/modulepreload'),
            ]
          ),
        ],
      },
      {
        number: 8,
        stage: 'Practice',
        title: 'The feature-module architecture',
        outcomes: [
          'Scaffold a self-contained feature module at `app/features/<module>/`.',
          'Co-locate type.ts, service.ts, composables and components in one folder.',
          'Expose a feature via auto-registered Nuxt components prefixed with the module name.',
        ],
        task: task(
          'Scaffold one real feature module end to end',
          'Pick a small feature (e.g. an FAQ list with search). Scaffold it under `app/features/faq/` with everything co-located, following the muslim-academy-platform conventions exactly.',
          [
            'Create `app/features/faq/type.ts` — Zod schema + `IFaq`, `IFaqListResponse`.',
            'Create `app/features/faq/service.ts` — one exported function per endpoint; use the shared `api()` helper.',
            'Create `app/features/faq/composables/useFaqHandler.ts` — owns the fetched state and the search query.',
            'Create `app/features/faq/components/index.vue` — orchestrates the feature; children in sibling .vue files.',
            'Verify components auto-register with the `Faq` prefix (`<FaqIndex />`).',
          ],
          [
            'Module folder is camelCase (`faq`, `emailBuilder`, `announcement`). Component files inside are PascalCase.',
            'Types live in `type.ts` (singular, never `.d.ts`, never `types.ts`).',
            'Composables are named `use<Job>Handler.ts` and the filename matches the exported function.',
            'Fetch state is held in the *component* that uses it. Composables own cross-cutting handlers, not per-resource loaders.',
            'Read `ai/rules/module-scaffolding.md` in the muslim-academy-platform for the full contract.',
          ],
          'The module compiles, components auto-register under the module prefix, a page can render `<FaqIndex />` and the feature works end to end.'
        ),
        resources: [
          read(
            'Nuxt docs: Components auto-register',
            'https://nuxt.com/docs/guide/directory-structure/components',
            'nuxt.com · free',
            'Understand `pathPrefix` — it is why your module prefix appears in component names.'
          ),
          read(
            'Nuxt docs: Composables directory',
            'https://nuxt.com/docs/guide/directory-structure/composables',
            'nuxt.com · free',
            'Why `app/composables/` auto-imports and how to add module-local ones.'
          ),
          read(
            'Nuxt docs: Server routes & Nitro',
            'https://nuxt.com/docs/getting-started/server',
            'nuxt.com · free',
            'Reference for `server/api/`, `server/middleware/` and route rules.'
          ),
          read(
            'Antfu: ESLint + Nuxt auto-import',
            'https://github.com/antfu/eslint-config',
            'github.com · free',
            'How to lint auto-imports so bad shadowing fails CI.'
          ),
          watch(
            'Alex Lichter: Nuxt 3 composables',
            'https://www.youtube.com/watch?v=xaRPYw1XuTw',
            'Alex Lichter · YouTube',
            'When to extract a composable, when not to.'
          ),
        ],
        items: [
          item(
            'The feature-module layout',
            'A feature folder keeps *everything* for one capability in one place. Grepping, deleting and reviewing are faster.',
            'Create `app/features/<module>/` with `components/`, `composables/`, `service.ts`, `type.ts`. The module folder is camelCase.',
            'You can find any feature in two keystrokes and delete one safely without hunting for scattered files.',
            [],
            'In the muslim-academy-platform the pattern is enforced via `nuxt.config.ts` auto-registering each `app/features/*/components/` folder with its own component prefix. See `features/auth/`, `features/courses/`, `features/faqs/`.'
          ),
          item(
            'service.ts: one function per endpoint',
            'Scattering `fetch` calls across components makes refactoring painful. A service file centralises them per module.',
            'Export one async function per endpoint from `<module>/service.ts`. Always call the shared `api()` helper from `~/services/_api`. Never call `api()` directly inside a component or page.',
            'When the API shape changes, you edit one function instead of searching for every call site.',
            [],
            'In the muslim-academy-platform: `services/_api.ts` is the base helper. Per-module services live inside the module as `service.ts`.'
          ),
          item(
            'Composables: `use<Job>Handler`',
            'Composables name the capability (`useAuthHandler`, `useFaqHandler`). The filename matches the exported function. One job per composable.',
            'Create cross-cutting ones in `app/composables/`. Feature-local ones go in `app/features/<module>/composables/`. If a composable grows past one job, split it.',
            'You find any composable by its filename and know exactly what it does without opening it.',
            [],
            'In the muslim-academy-platform, `useAuthHandler` holds the only cross-cutting user state. Everything else is feature-local.'
          ),
          item(
            'Types in a singular `type.ts`',
            'A singular `type.ts` per module (not `types.ts`, not `.d.ts`) keeps the convention greppable and discourages global type sprawl.',
            'Define types + Zod schemas in `type.ts`. Prefix interfaces with `I` (`IFaq`, `IOnRequest`). Reserve a global `types/` folder for shared contracts only — rare.',
            'New engineers know exactly where types live and never argue about naming.',
            []
          ),
          item(
            'Component naming & auto-registration',
            `Nuxt's \`pathPrefix\` option prefixes every module's components with the module name, so \`<FaqIndex />\` resolves to \`features/faq/components/index.vue\`.`,
            'Vue component files are PascalCase (`FaqSearch.vue`); the folder entry is `index.vue`. Pages are PascalCase per the Nuxt auto-import convention.',
            'You never collide component names across features and `<FeatureThing />` tells you where it lives from the tag alone.',
            []
          ),
        ],
      },
      {
        number: 9,
        stage: 'Prove',
        title: 'Plugins, middleware & the auto-middleware pattern',
        outcomes: [
          'Write a Nuxt plugin that extends `$fetch` with request/response hooks.',
          'Apply middleware per route, per layout and via `@alikhalilll/nuxt-auto-middleware`.',
          'Encrypt tokens before storing them in cookies (via `@alikhalilll/nuxt-crypto`).',
        ],
        task: task(
          'Build a protected-route pipeline that mirrors the real codebase',
          'Add an auth plugin, an encrypted-token cookie, an API provider with request/response hooks, and auto-middleware that gates `protected*` layouts behind an auth check.',
          [
            'Install `@alikhalilll/nuxt-api-provider`, `@alikhalilll/nuxt-crypto`, `@alikhalilll/nuxt-auto-middleware`.',
            'Create `plugins/01.auth.ts` that initialises the user state on app start.',
            'Create `utils/api-on-request.ts` + `api-on-success.ts` + `api-on-error.ts`. Attach Accept-Language + Authorization.',
            'Configure `autoMiddleware` so layouts named `protected`/`protected-*` apply the `auth` middleware.',
            'Store the token encrypted via `$crypto` and decrypt on load. Never store raw tokens in cookies.',
          ],
          [
            'In the muslim-academy-platform convention, the auth middleware is `@protected` — scoped to layouts, not individual pages.',
            'The `apiProvider` config in `nuxt.config.ts` wires `onRequestPath`/`onSuccessPath`/`onErrorPath`. Read them to see what runs on every request.',
            'Tokens in cookies are a tracking + XSS risk if raw. The `$crypto` plugin wraps them with a passphrase from env.',
            'Read `ai/memory/decisions/2026-09-22-api-provider-v2-cache-opt-out.md` to understand why cache is disabled by default.',
          ],
          'Protected pages route through the middleware, requests carry the right headers, the token is never stored raw, and the dev experience matches the real repo.'
        ),
        resources: [
          read(
            'Nuxt docs: Plugins',
            'https://nuxt.com/docs/guide/directory-structure/plugins',
            'nuxt.com · free',
            'Order with numeric prefixes (`01.auth.ts`). Register injections via `provide`.'
          ),
          read(
            'Nuxt docs: Middleware',
            'https://nuxt.com/docs/guide/directory-structure/middleware',
            'nuxt.com · free',
            'Route-level, named and global middleware.'
          ),
          read(
            'ali-nuxt-toolkit: nuxt-auto-middleware',
            'https://alikhalilll.github.io/ali-nuxt-toolkit/auto-middleware',
            'github.com · free',
            'How layout-based middleware application works.'
          ),
          read(
            'ali-nuxt-toolkit: nuxt-api-provider',
            'https://alikhalilll.github.io/ali-nuxt-toolkit/api-provider',
            'github.com · free',
            'Hooks, SWR cache, provide name — the mental model you will use for every API call.'
          ),
          read(
            'ali-nuxt-toolkit: nuxt-crypto',
            'https://alikhalilll.github.io/ali-nuxt-toolkit/crypto',
            'ali-nuxt-toolkit docs · free',
            'Why we encrypt the token cookie.'
          ),
          watch(
            'LearnVue: Vue 3 plugins & middleware patterns',
            'https://www.youtube.com/watch?v=NAE2wT3lkbQ',
            'LearnVue · YouTube',
            'Fast tour of composable + plugin patterns. Watch, then wire your own auth plugin.'
          ),
        ],
        items: [
          item(
            'Plugins (`plugins/*.ts`)',
            'Plugins extend the Nuxt runtime once per app. Prefix with a number to order them deterministically.',
            'Use `defineNuxtPlugin(nuxtApp => ...)`. Inject helpers with `nuxtApp.provide("name", value)`. Access via `useNuxtApp().$name` or auto-injected `$name`.',
            'You extend the framework in a controlled way instead of monkey-patching components.',
            [link('Nuxt: Plugins', 'https://nuxt.com/docs/guide/directory-structure/plugins')],
            'In the muslim-academy-platform you see `plugins/01.i18n.ts` — the number prefix forces load order.'
          ),
          item(
            'Middleware: route, layout, auto',
            'Middleware runs before a route resolves. It is where auth, redirects and locale enforcement live.',
            `Create \`middleware/<name>.ts\`. Apply per page with \`definePageMeta({ middleware: ["auth"] })\`. For whole-layout rules, use \`@alikhalilll/nuxt-auto-middleware\` and its \`autoMiddleware\` config.`,
            'Auth and locale rules apply uniformly without decorating every page by hand.',
            [
              link(
                'Nuxt: Middleware',
                'https://nuxt.com/docs/guide/directory-structure/middleware'
              ),
            ],
            'In the muslim-academy-platform `nuxt.config.ts`: `protected*` layouts auto-apply the `@protected` middleware; `auth` layout auto-applies `guest`.'
          ),
          item(
            'The API provider pattern',
            'Every app needs one place where "attach headers, parse errors, retry" lives. The API provider is that place.',
            'Install `@alikhalilll/nuxt-api-provider` and configure `onRequestPath`, `onSuccessPath`, `onErrorPath` in `nuxt.config.ts`. Keep hook files in `utils/api-on-*.ts`.',
            'Every component shares the same request lifecycle, so error handling, locale headers and auth are consistent.',
            [
              link(
                'nuxt-api-provider',
                'https://alikhalilll.github.io/ali-nuxt-toolkit/api-provider'
              ),
            ]
          ),
          item(
            'Encrypted token cookies',
            'A raw token in a cookie is a theft-ready credential if anything XSS-adjacent lands. Encrypting at rest is cheap insurance.',
            'Use `@alikhalilll/nuxt-crypto` with a passphrase in env. Encrypt on write, decrypt on read. Access via the `$crypto` injection.',
            'Even if a cookie leaks, the attacker has an opaque blob instead of a token.',
            [link('nuxt-crypto', 'https://alikhalilll.github.io/ali-nuxt-toolkit/crypto')]
          ),
          item(
            'Runtime config & env',
            'Keep secrets out of code. `runtimeConfig` splits public (shipped) from private (server-only). Scan `.env.example` before you touch `.env`.',
            'Define `runtimeConfig.public.API_BASE_URL` for client-facing values; put secrets under `runtimeConfig`. Access via `useRuntimeConfig()`. Read env with `getEnv()` helper when the host cannot inject.',
            'No secret ever leaks into a bundle; every env has a documented variable.',
            [
              link(
                'Nuxt: runtime config',
                'https://nuxt.com/docs/guide/going-further/runtime-config'
              ),
            ]
          ),
        ],
      },
    ],
    template: {
      title: 'Feature module checklist',
      items: [
        '`app/features/<module>/` with components, composables, service.ts, type.ts',
        'Service functions call the shared `api()` helper, never raw `$fetch`',
        'Composables named `use<Job>Handler` with filename matching the function',
        'Components auto-registered with the module prefix',
        'Auth-protected routes gated by the layout-based middleware',
      ],
    },
    prompts: [
      'Scaffold a Nuxt feature module for [capability] following the muslim-academy-platform conventions. Include type.ts, service.ts, composable, components/index.vue.',
      'Explain which routes in this `nuxt.config.ts` are prerendered, SSR or client-only, and why.',
      'Review this component for direct `$fetch` calls that should go through a module `service.ts`.',
    ],
    gates: [
      'You can scaffold a feature module from memory and explain every file.',
      'You pick the right rendering mode per route and defend it.',
      'You know which auto-imports exist in the project and how to add new ones.',
      'You can read `nuxt.config.ts` for a project you have never seen and explain what loads.',
    ],
  },

  // =====================================================================
  // Phase 4 — Styling, UI & i18n
  // =====================================================================
  {
    key: 'ui',
    number: 4,
    weeks: 'Weeks 10–11',
    title: 'Styling, UI & i18n',
    goal: 'Style with UnoCSS the way this project does: atomic utilities + mapped theme tokens + shadcn-style components. Ship RTL support correctly on day one.',
    proof: 'A themed, RTL-aware feature screen built with UnoCSS + @pkgs/ui',
    tone: 'amber',
    role: {
      title: 'UI Developer',
      summary:
        'You can style the project the way the design system does: tokens, atomic utilities, reusable primitives and locale-aware RTL layouts.',
      responsibilities: [
        'Map every Figma color to a theme token; never ship arbitrary `[#hex]` utilities.',
        'Compose UI with `@pkgs/ui` components + `reka-ui` primitives.',
        'Build RTL-aware layouts that are symmetric by default.',
        'Pick `<style scoped>` only when truly necessary; prefer utilities.',
      ],
    },
    weeksData: [
      {
        number: 10,
        stage: 'Learn',
        title: 'UnoCSS + theming the way this project does it',
        outcomes: [
          'Explain why this stack uses UnoCSS instead of Tailwind.',
          'Compose shortcuts and presets without re-authoring everything.',
          'Define semantic OKLCH tokens and map Figma hex to tokens.',
        ],
        task: task(
          'Rebuild a Figma screen using only theme tokens and UnoCSS utilities',
          'Pick one Figma screen from the muslim-academy-platform designs. Rebuild it as a page using only mapped tokens — no `bg-[#hex]` anywhere.',
          [
            'Open the Figma and list every colour used.',
            'Map each colour to an existing theme token (`primary`, `secondary`, `accent` + `-foreground`) or the nearest Tailwind palette colour by RGB distance.',
            'Build the page using UnoCSS utilities + mapped tokens.',
            'Toggle dark mode via `[data-theme="dark"]` and verify every surface still looks right.',
            'Run `uno lint` or `eslint` to confirm no `[#hex]` leaked in.',
          ],
          [
            'Never use arbitrary `[#hex]` colour utilities. If a Figma colour is a brand colour, use a theme token. Otherwise round to the nearest Tailwind palette colour (`bg-gray-50` not `bg-[#f9fafb]`).',
            'Fall back to `[#hex]` only when neither a theme token nor any Tailwind colour is close — rare, and flag it in review.',
            'In the muslim-academy-platform, resolved mappings live in `ai/memory/mistakes/2026-06-29-hardcoded-hex-instead-of-theme-color.md`.',
            'OKLCH tokens let the same semantic token read differently in light vs dark without hand-authoring both.',
          ],
          'The screen matches Figma, zero arbitrary hex utilities, dark mode works via one attribute toggle, and the tokens map 1:1 to the design.'
        ),
        resources: [
          read(
            'UnoCSS: Introduction',
            unocssDocs,
            'unocss.dev · free',
            'Learn the atomic philosophy and what a preset is.'
          ),
          read(
            'UnoCSS: Shortcuts',
            'https://unocss.dev/config/shortcuts',
            'unocss.dev · free',
            'How to collapse "cluster of utilities you always use together" into one name.'
          ),
          read(
            'UnoCSS: Rules',
            'https://unocss.dev/config/rules',
            'unocss.dev · free',
            'Writing custom rules — only when a utility is missing, never for one-offs.'
          ),
          read(
            'OKLCH color picker',
            'https://oklch.com/',
            'oklch.com · free',
            'Why OKLCH gives you perceptually uniform palettes.'
          ),
          watch(
            'web.dev: Modern CSS colour',
            'https://www.youtube.com/watch?v=o-Xon3EvOV4',
            'web.dev · YouTube',
            'Short tour of OKLCH, color-mix and relative color.'
          ),
        ],
        items: [
          item(
            'Why UnoCSS (not Tailwind)',
            'This stack uses UnoCSS. The API is Tailwind-like, but the engine is faster, more composable and runs on presets you can swap.',
            'Install `@unocss/nuxt` + a preset (`preset-wind4` here). Define tokens in `uno.config.ts`. Use utilities in templates — same muscle memory as Tailwind.',
            'You use the fast path the project is built on, and you know when to reach for a preset vs a custom rule.',
            [link('UnoCSS: Presets', 'https://unocss.dev/presets/')],
            'In the muslim-academy-platform: `uno.config.ts` + `@unocss/preset-wind4`.'
          ),
          item(
            'Theme tokens: OKLCH + semantic names',
            'Semantic tokens (`primary`, `surface`, `ink`) let you re-theme without touching components. OKLCH makes light/dark pairs consistent.',
            'Define tokens as CSS custom properties in a root stylesheet; expose them to UnoCSS via theme config. Pair every token with a `-foreground` variant.',
            'You ship light and dark themes, and brand variants, as config changes — not code changes.',
            [
              link(
                'Using CSS custom properties',
                'https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties'
              ),
            ]
          ),
          item(
            'Mapping Figma → tokens (the project rule)',
            'Arbitrary `[#hex]` is design debt. One tokenised palette prevents a thousand near-duplicate colors creeping in.',
            'Rule: brand colour → theme token. Otherwise round to the nearest Tailwind palette colour by RGB distance. Only drop to `[#hex]` when nothing is close.',
            'Reviews stop arguing about colour choices; the palette stays small and consistent.',
            [],
            'In the muslim-academy-platform see `ai/memory/mistakes/2026-06-29-hardcoded-hex-instead-of-theme-color.md` for the recorded resolution.'
          ),
          item(
            'Shortcuts & presets',
            'A UnoCSS "shortcut" is a named cluster of utilities. Use it for the one-liner you keep typing, not for every component.',
            'Define shortcuts in `uno.config.ts`. Keep them small and semantic (`btn-primary`, `card`). If a shortcut hides important choices, inline instead.',
            'You stop pasting the same 10 utilities everywhere, without turning your utility sheet into a second component library.',
            [link('UnoCSS: Shortcuts', 'https://unocss.dev/config/shortcuts')]
          ),
        ],
      },
      {
        number: 11,
        stage: 'Practice',
        title: '@pkgs/ui components, reka-ui primitives & RTL i18n',
        outcomes: [
          'Use `@pkgs/ui` components without re-authoring them.',
          'Reach for `reka-ui` only when you need headless primitives.',
          'Build RTL-correct layouts and labels with vue-i18n.',
        ],
        task: task(
          'Build a localised, RTL-correct form screen',
          'Build a sign-up screen with 4 fields using `@pkgs/ui` + VeeValidate + vue-i18n, verified in both en-us and ar-sa.',
          [
            'Compose the form with `<UiForm>`, `<UiFormField>`, `<UiInput>`, `<UiButton>`, `<UiAlert>` from `@pkgs/ui`.',
            'Use `$t()` for every string. Add both en-us and ar-sa translations.',
            'Use `useLocalePath()` for all internal links; use `<NuxtLinkLocale>` not `<NuxtLink>` in templates.',
            'Test in both locales by swapping the cookie. Fix any mirrored-icon or margin asymmetry.',
            'Verify form errors render under their input with `:invalid="!!errorMessage"` and `<UiAlert variant="destructive">`.',
          ],
          [
            'Use `UiXxx` prefix for all `@pkgs/ui` components; they auto-resolve.',
            'Never hardcode strings — always `$t()`.',
            'Use logical properties (`ms-`/`me-`/`ps-`/`pe-`) over physical (`ml-`/`mr-`) for symmetric RTL.',
            'Mirror icons that have direction (arrows, carets); keep logos and language-neutral icons unchanged.',
            'The muslim-academy-platform ships `ar-sa` as the default locale. Treat RTL as the default, not the afterthought.',
          ],
          'The form works in both locales, errors render correctly, the layout is symmetric in RTL and the design matches Figma in both directions.'
        ),
        resources: [
          read(
            'reka-ui: Introduction',
            'https://reka-ui.com/docs/overview/introduction',
            'reka-ui.com · free',
            'The headless primitives `@pkgs/ui` is built on.'
          ),
          read(
            'shadcn-vue (reference)',
            'https://www.shadcn-vue.com/',
            'shadcn-vue.com · free',
            'The design system @pkgs/ui is inspired by. Copy-paste architecture mindset.'
          ),
          read(
            '@nuxtjs/i18n docs',
            'https://i18n.nuxtjs.org/',
            'i18n.nuxtjs.org · free',
            'Learn `useLocalePath`, `useSwitchLocalePath`, strategy modes.'
          ),
          read(
            'MDN: Logical properties',
            'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values',
            'MDN · free',
            'CSS that works in both LTR and RTL without `[dir=rtl]` overrides.'
          ),
          read(
            'RTL Styling 101 (rtlstyling.com)',
            'https://rtlstyling.com/',
            'rtlstyling.com · free',
            'The dedicated RTL guide. Mirror what belongs mirrored; keep language-neutral content unchanged.'
          ),
          watch(
            'web.dev: Modern CSS colour & OKLCH',
            'https://www.youtube.com/watch?v=o-Xon3EvOV4',
            'web.dev · YouTube',
            'The short tour of OKLCH, color-mix and relative color. Watch before building your token system.'
          ),
        ],
        items: [
          item(
            '@pkgs/ui: shadcn-style component library',
            'A good internal component library is "copy the pattern, not the dependency". Each component is a thin wrapper you can customise.',
            'Import as `<UiButton>`, `<UiFormField>`, etc. The prefix is auto-resolved. Reach for `reka-ui` directly only when you need a primitive the library does not expose.',
            'You compose UI from one coherent system instead of re-styling every button.',
            [link('reka-ui', 'https://reka-ui.com/docs/overview/introduction')],
            'In the muslim-academy-platform: `@pkgs/ui` is a Nuxt module; it also ships the UnoCSS preset and base styles.'
          ),
          item(
            'reka-ui: headless primitives',
            'Headless primitives (Dialog, Popover, Menu) give you behaviour without opinions. You decide the look.',
            'Reach for reka-ui when `@pkgs/ui` does not ship the primitive you need. Mount with the `asChild` pattern to pass through your styling.',
            'You stop re-implementing focus traps, keyboard nav and ARIA. The primitive handles it.',
            [link('reka-ui', 'https://reka-ui.com/')]
          ),
          item(
            'vue-i18n + @nuxtjs/i18n',
            'Every production app ships multiple locales eventually. Baking i18n in from the start is cheaper than retrofitting.',
            'Use `$t()` for all display strings. Use `useLocalePath()` for internal URLs. Use `<NuxtLinkLocale>` instead of `<NuxtLink>` in templates.',
            'No hardcoded strings leak into production. Switching locales is one cookie change.',
            [link('@nuxtjs/i18n', 'https://i18n.nuxtjs.org/')],
            'In the muslim-academy-platform: `ar-sa` is the default locale, `en-us` is secondary. Cookie-driven detection via `localeCookieName`.'
          ),
          item(
            'RTL layouts & logical properties',
            'An RTL layout is not a mirror of the LTR one. Icons, numbers and some labels stay in reading order.',
            'Use CSS logical properties (`margin-inline-start` → `ms-*`, `padding-inline-end` → `pe-*`) so the same utilities work in both directions. Mirror only direction-bearing icons.',
            'A single stylesheet works in both directions, with no `[dir=rtl]` overrides scattered through components.',
            [
              link(
                'MDN: Logical properties',
                'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values'
              ),
            ]
          ),
          item(
            'When to use `<style scoped>`',
            'Utility-first means you rarely need scoped styles. Reserve them for truly local overrides, animations and CSS-only state.',
            'Prefer utilities + shortcuts. Use `<style scoped>` only for CSS features utilities cannot express (pseudo-elements, keyframes, container queries). Shared styles belong in global CSS, not per-component.',
            'Your SFCs stay small and reviewable, and global style churn is contained.',
            []
          ),
        ],
      },
    ],
    template: {
      title: 'UI checklist',
      items: [
        'Zero `[#hex]` utilities (theme tokens or palette-rounded)',
        '`@pkgs/ui` components used before anything is hand-rolled',
        'Every string wrapped in `$t()`',
        'Logical properties for direction-aware spacing',
        'Verified in both en-us and ar-sa',
      ],
    },
    prompts: [
      'Map each color in this Figma frame to a theme token or Tailwind palette color. Flag anything that needs a new token.',
      'Rewrite this component to use `@pkgs/ui` primitives instead of hand-rolled divs.',
      'Review this template for untranslated strings and physical margins that should be logical.',
    ],
    gates: [
      'You can look at a Figma and translate it into tokens + utilities without arbitrary hex.',
      'You compose UI from `@pkgs/ui` first, reka-ui second, hand-rolled last.',
      'You ship RTL-correct layouts by default.',
      'You use `$t()`, `useLocalePath()` and `<NuxtLinkLocale>` without being reminded.',
    ],
  },

  // =====================================================================
  // Phase 5 — Forms, Data & State
  // =====================================================================
  {
    key: 'data',
    number: 5,
    weeks: 'Weeks 12–14',
    title: 'Forms, Data & State',
    goal: 'Wire real features: validated forms, API calls through the project pattern and shared state without Pinia.',
    proof: 'A real end-to-end feature (form → API → UI → error states) merged into a working app',
    tone: 'rose',
    role: {
      title: 'Full-Stack Frontend Engineer',
      summary:
        'You can ship a real feature: VeeValidate + Zod form, API call through the shared provider, correct loading/empty/error UI, and cross-cutting state via `useState` composables.',
      responsibilities: [
        'Compose Zod schemas and bridge them to VeeValidate.',
        'Map server-side field errors onto the right inputs.',
        'Fetch directly in the component (no per-resource `useAsyncData`).',
        'Pick the right state scope: local ref, component composable, or cross-cutting `useState`.',
      ],
    },
    weeksData: [
      {
        number: 12,
        stage: 'Learn',
        title: 'VeeValidate + Zod forms',
        outcomes: [
          'Define a Zod schema, bridge to VeeValidate with `toTypedSchema`.',
          'Bind inputs with `componentField`.',
          'Progressive validation: validate on blur until dirty, then on change.',
        ],
        task: task(
          'Build a validated multi-field form end to end',
          'Build a sign-up form (email, password, phone, country) with Zod schema, VeeValidate state, server-error mapping and both locales translated.',
          [
            'Define `formSchema` in Zod with real rules (min length, email regex, password complexity).',
            'Bridge to VeeValidate via `toTypedSchema(formSchema)`.',
            'Build the form with `<UiFormField v-slot="{ componentField }">` + `v-bind="componentField"`.',
            'Progressive validation: `:validate-on-blur="!isFieldDirty"`.',
            'Submit, catch server errors, map field errors with `setFieldError` and form error with `serverError.value`.',
          ],
          [
            'Field-level server errors go through `setFieldError(field, message)` so they render under the input.',
            'Form-level errors (no field) go into a `serverError` ref rendered with `<UiAlert variant="destructive">`.',
            'Use `:invalid="!!errorMessage"` on inputs so they get the error style automatically.',
            'In the muslim-academy-platform the pattern is codified in `references/patterns/error-handling.md`.',
          ],
          'The form validates client-side via Zod, maps server errors to the right inputs, works in both locales, and does not re-fire validation until the user actually interacts.'
        ),
        resources: [
          read(
            'VeeValidate docs',
            veeValidateDocs,
            'vee-validate.logaretm.com · free',
            'Read "Composition API" and "Validation" end to end.'
          ),
          read(
            '@vee-validate/zod bridge',
            'https://vee-validate.logaretm.com/v4/examples/zod/',
            'vee-validate.logaretm.com · free',
            'The `toTypedSchema()` pattern you will use everywhere.'
          ),
          read(
            'Zod docs',
            zodDocs,
            'zod.dev · free',
            'Focus on `.object`, `.refine`, `.transform` and discriminated unions.'
          ),
          watch(
            'Alex Vipond: VeeValidate deep dive',
            'https://www.youtube.com/watch?v=7LAgTkv72a4',
            'Alex Vipond · YouTube',
            'Walks through the composition-API form shape.'
          ),
          read(
            'MDN: HTML form controls',
            'https://developer.mozilla.org/en-US/docs/Learn/Forms',
            'MDN · free',
            'Browser semantics that still matter — autocomplete, inputmode, validation attributes.'
          ),
        ],
        items: [
          item(
            'Zod schemas as the source of truth',
            'A schema that defines the shape *and* the validation gives you one place to change rules.',
            'Define a `formSchema` in Zod. Infer the TS type with `z.infer`. Use `.refine()` for cross-field rules.',
            'You stop maintaining duplicate TypeScript interfaces + validation rules.',
            [link('Zod', zodDocs)]
          ),
          item(
            '`toTypedSchema` bridge',
            'VeeValidate manages state; Zod validates. The bridge glues them so you type the schema once.',
            'Call `toTypedSchema(formSchema)` and pass to `useForm({ validationSchema })`. Field types flow through to `defineField`.',
            'Changing a schema rule updates every bound component with no extra wiring.',
            [link('VeeValidate + Zod', 'https://vee-validate.logaretm.com/v4/examples/zod/')]
          ),
          item(
            'Field binding & progressive validation',
            'Validating on every keystroke is noisy. Validating only on submit is late. The sweet spot is "blur until dirty, then change".',
            'Use `<UiFormField v-slot="{ componentField, isFieldDirty, errorMessage }">` with `v-bind="componentField"` and `:validate-on-blur="!isFieldDirty"`.',
            'Users see errors at the right moment: after they leave a field they interacted with.',
            [],
            'This is the project convention. Mirror it in every form.'
          ),
          item(
            'Server error mapping',
            'A server error is still a form error — it just arrives late. Mapping it correctly makes the form feel one-piece.',
            'Field errors: call `setFieldError(field, message)` from the `useForm` return. Form-level: assign to a `serverError` ref rendered as `<UiAlert variant="destructive">`.',
            'The form reads one way: client errors and server errors render in the same places.',
            []
          ),
          item(
            'VeeValidate ↔ `<UiAlert>` conventions',
            'A convention for *where* errors appear makes forms predictable across the whole app.',
            'Per-field errors render inside the field. Form-level errors render in a single `<UiAlert>` above the submit button. Never both.',
            'A user glance always lands on the right error, whether it is one field or the whole form.',
            []
          ),
        ],
      },
      {
        number: 13,
        stage: 'Practice',
        title: 'Data fetching the project way',
        outcomes: [
          'Fetch directly in the component — no per-resource `useAsyncData`.',
          'Use `services/<module>/service.ts` + the shared `api()` helper.',
          'Model local request state: `ref<T | null>`, `loading`, `error`.',
        ],
        task: task(
          'Rewrite a feature to use the project data-fetching pattern',
          'Take any existing feature and refactor it to the direct-in-component pattern: no per-resource composable, no `useAsyncData`, no `useFetch`.',
          [
            'Create or reuse the module `service.ts` with one exported function per endpoint.',
            'In the component: `const data = ref<T | null>(null)`, `const loading = ref(false)`, `const error = ref<Error | null>(null)`.',
            'Write `async function fetchData()` with `try/catch/finally`. Trigger in `onMounted` or `watch` for param changes.',
            'After a mutation, re-call `fetchData()` directly instead of chaining state.',
            'Verify no `useAsyncData`/`useLazyAsyncData`/`useFetch` is left anywhere in the feature.',
          ],
          [
            'Cross-cutting composables (auth, user, breadcrumbs) still live in `app/composables/`. Per-resource loaders do not.',
            'The exception is the logged-in user: it lives stateful in `useAuthHandler` (`useState("auth-user")`), loads once with a `loaded` guard, and only refreshes on an explicit `refreshUser()`.',
            `When one component's fetch/filter/watch logic grows heavy, extract it to a co-located \`useIndex.ts\` next to the component — not the global folder.`,
            'Read the project decision: `ai/memory/decisions/2026-06-29-fetch-directly-in-component-no-per-resource-composable.md`.',
          ],
          'The feature holds its own request state, uses the module `service.ts`, and no `useAsyncData`/`useFetch`/per-resource composable remains.'
        ),
        resources: [
          read(
            'Nuxt docs: Data fetching',
            'https://nuxt.com/docs/getting-started/data-fetching',
            'nuxt.com · free',
            'Know what Nuxt gives you — and why this project opts out of the SWR default.'
          ),
          read(
            'Nuxt docs: $fetch',
            'https://nuxt.com/docs/api/utils/dollarfetch',
            'nuxt.com · free',
            'The thin wrapper around ofetch you use via the API provider.'
          ),
          read(
            'ali-nuxt-toolkit: nuxt-api-provider',
            'https://alikhalilll.github.io/ali-nuxt-toolkit/api-provider',
            'github.com · free',
            'How the provider wraps `$fetch` with request/success/error hooks.'
          ),
          read(
            'ofetch docs',
            'https://github.com/unjs/ofetch',
            'github.com · free',
            'The low-level library both Nuxt and the provider build on.'
          ),
          read(
            'NN/g: Skeleton screens',
            'https://www.nngroup.com/articles/skeleton-screens/',
            'Nielsen Norman Group · free',
            'A good loading state turns a 400ms wait into a non-event.'
          ),
          watch(
            'Alex Vipond: VeeValidate + composition API',
            'https://www.youtube.com/watch?v=7LAgTkv72a4',
            'Alex Vipond · YouTube',
            'Walkthrough of the composition-API form shape. Watch, then wire the Zod schema into a real form.'
          ),
        ],
        items: [
          item(
            'Direct-in-component fetching',
            'The team learned the hard way that per-resource composables and shared `useState(KEY)` singletons create more bugs than they prevent.',
            'In the component that renders the data, hold `ref<T | null>`, `loading`, `error`, and an `async function fetchX()`. Trigger in `onMounted` or `watch`. Re-call directly after mutations.',
            'State lifecycle matches the component lifecycle. No stale-cache mysteries, no "which page refetched this?" bugs.',
            [],
            'In the muslim-academy-platform the decision is recorded in `ai/memory/decisions/2026-06-29-fetch-directly-in-component-no-per-resource-composable.md`.'
          ),
          item(
            'The shared `api()` helper',
            'One wrapper around `$fetch` is the single place where baseURL, headers and error parsing live. Every call goes through it.',
            `Import \`api\` from \`~/services/_api\`. Each module's \`service.ts\` calls \`api()\`; components call module functions, never \`api()\` directly.`,
            'Headers, locale and error parsing stay consistent across every call.',
            [],
            'In the muslim-academy-platform: `app/services/_api.ts` is the base; new per-module services live inside the module as `service.ts`.'
          ),
          item(
            'Loading, empty, error & success',
            'A real feature has four UI states, not one. Users notice the three you forgot.',
            'Render a skeleton for `loading`, an empty-state card for `data === []`, an alert for `error`, and the real UI for success. Never conflate "no data yet" with "zero results".',
            'Users always know what the UI is doing, and QA stops filing "nothing happens" bugs.',
            [
              link(
                'web.dev: Loading skeletons',
                'https://www.nngroup.com/articles/skeleton-screens/'
              ),
            ]
          ),
          item(
            'The one cross-cutting exception: `useAuthHandler`',
            'The logged-in user is a cross-cutting identity, not page data. It stays stateful across routes.',
            '`useAuthHandler` wraps `useState("auth-user")` with a `loaded` guard. `fetchUser()` loads once; `refreshUser()` re-pulls after a mutation. Do not refetch per page.',
            'Auth state is single-source and refreshes exactly when it should.',
            []
          ),
          item(
            'Co-located heavy fetch logic',
            `When one component's fetch/filter/sort logic grows past a page of code, extract it — but keep it next to the component, not in the global folder.`,
            'Create `useIndex.ts` next to the component. Export a single composable. Do not put it in `app/composables/` unless multiple features consume it.',
            'Heavy page logic stays discoverable (same folder as the page) without cluttering the global composables surface.',
            []
          ),
        ],
      },
      {
        number: 14,
        stage: 'Prove',
        title: 'State without Pinia: `useState`, composables & URL state',
        outcomes: [
          'Pick the right state scope: local ref, module composable, cross-cutting `useState`.',
          'Reflect filter/pagination state in the URL so refreshes preserve it.',
          'Avoid Pinia (this stack does not use it).',
        ],
        task: task(
          'Add URL-synced filter + pagination to a list feature',
          'Pick a list page. Add filter + pagination state, back it with URL params so refresh/share works, and prove it reacts to `watch`.',
          [
            'Hold filter and page in `ref`s inside the component. Derive `fetchParams` as a `computed`.',
            'Sync both ways with the URL using `useRoute` + `useRouter().replace({ query })`.',
            '`watch([filter, page], refetch)` so URL/UI stay in lockstep.',
            'Refresh and verify the filter + pagination are restored.',
            'Use `useLocalePath` so URLs stay locale-prefixed.',
          ],
          [
            'URL state is free "undo" — users expect refresh and back-button to work.',
            'Use `router.replace` for filter changes (no history entry per keystroke) and `router.push` for user-initiated navigation (page change).',
            'Debounce text filters at ~250ms so you do not blast the API on every keystroke.',
            'Cross-cutting state (user, breadcrumbs, i18n) uses `useState(KEY)`. Per-page state does not.',
          ],
          'The list filter and page round-trip through the URL; refresh preserves state; share-link opens the same view; the right state scope is used throughout.'
        ),
        resources: [
          read(
            'Nuxt docs: useState',
            'https://nuxt.com/docs/api/composables/use-state',
            'nuxt.com · free',
            'The SSR-safe cross-component ref you use instead of Pinia.'
          ),
          read(
            'Nuxt docs: useRoute',
            'https://nuxt.com/docs/api/composables/use-route',
            'nuxt.com · free',
            'Reading the current route reactively.'
          ),
          read(
            'Nuxt docs: useRouter',
            'https://nuxt.com/docs/api/composables/use-router',
            'nuxt.com · free',
            'Programmatic navigation and `replace` vs `push`.'
          ),
          read(
            'VueUse: useDebounceFn',
            'https://vueuse.org/shared/useDebounceFn/',
            'vueuse.org · free',
            'The debounce you drop onto text filters.'
          ),
          read(
            'MDN: History API',
            'https://developer.mozilla.org/en-US/docs/Web/API/History_API',
            'MDN · free',
            'The browser API behind shareable URL state and back/forward support.'
          ),
        ],
        items: [
          item(
            '`useState` for cross-cutting shared state',
            `Nuxt's \`useState\` is an SSR-safe shared ref. It is enough for the shared state most apps need.`,
            `Call \`useState<T>("key", () => initialValue)\`. Key must be unique app-wide. Access from any component.`,
            'You get Pinia-like sharing without the dependency, lifecycle rules and devtools weight.',
            [link('Nuxt: useState', 'https://nuxt.com/docs/api/composables/use-state')]
          ),
          item(
            'Composable-encapsulated state',
            'Composables can own state too. A composable with internal `useState` is a one-stop-shop for a cross-cutting capability.',
            'Wrap `useState` inside a composable: `useAuthHandler`, `useBreadcrumbs`. Export `state`, `actions`, `refreshers`. Consumers never touch the raw key.',
            'You get the convenience of a store with the typing + testing of a composable.',
            []
          ),
          item(
            'URL state (filters, pagination)',
            'URL state is state the user owns. Refresh, share and bookmark should always "just work".',
            `Read with \`useRoute().query\`. Write with \`useRouter().replace({ query: { ...route.query, filter } })\`. Keep param names short and stable.`,
            'Users can share a filtered list, refresh without losing context, and go back/forward safely.',
            [link('useRoute', 'https://nuxt.com/docs/api/composables/use-route')]
          ),
          item(
            'Why not Pinia',
            'This stack explicitly skips Pinia. The combination of `useState` + co-located composables covers the real needs.',
            'Default to local `ref`. If multiple components need it, wrap `useState` in a composable. Reach for Pinia only if the project *starts* using it. In this stack it does not.',
            'You stop over-engineering state. Features stay simple and testable.',
            []
          ),
          item(
            'Debouncing & throttling',
            'A text filter that fires on every keystroke is a DOS attack on your own API. Debouncing is one import away.',
            'Use `useDebounceFn` from VueUse (~250ms for text filters). For scroll + resize use `useThrottleFn` (16–32ms).',
            'Your API load drops, your UI stays responsive, and search feels smooth.',
            [link('VueUse: debounce', 'https://vueuse.org/shared/useDebounceFn/')]
          ),
        ],
      },
    ],
    template: {
      title: 'Feature checklist',
      items: [
        'Zod schema shared by TS types and VeeValidate',
        'Server errors mapped field-by-field with a form-level fallback',
        'Direct-in-component fetch; module `service.ts` for all endpoints',
        'Loading / empty / error / success states all designed',
        'List filters synced to the URL, locale paths preserved',
      ],
    },
    prompts: [
      'Review this form for `setFieldError` + `<UiAlert>` consistency. Flag anything that mixes field and form errors.',
      'Rewrite this component to the direct-in-component fetch pattern. Remove any per-resource composable or `useAsyncData`.',
      'Add URL-synced filter + pagination to this list. Debounce the text filter.',
    ],
    gates: [
      'You can build a Zod/VeeValidate form and map server errors correctly.',
      'You fetch directly in the component and know the one `useAuthHandler` exception.',
      'You pick state scope deliberately: local, composable or cross-cutting `useState`.',
      'Your lists survive refresh, share and back-button via URL state.',
    ],
  },

  // =====================================================================
  // Phase 6 — Testing, A11y & Shipping
  // =====================================================================
  {
    key: 'shipping',
    number: 6,
    weeks: 'Weeks 15–16',
    title: 'Testing, A11y & Shipping',
    goal: 'Prove the feature works, ship it to production with a green pipeline and verify it operates — tests, a11y, performance, deploys.',
    proof:
      'A merged feature with Vitest + Playwright coverage, a11y clean, Lighthouse ≥ 90, deployed preview URL',
    tone: 'indigo',
    role: {
      title: 'Quality & Release Frontend Engineer',
      summary:
        'You can ship frontend code that is tested, accessible, fast and deployable without a manual step. You know what Core Web Vitals mean and how to defend them.',
      responsibilities: [
        'Write Vitest unit/component tests + Playwright user flows.',
        'Audit a page against WCAG 2.2 and fix what matters.',
        'Measure and defend LCP, INP and CLS.',
        'Ship via the GitLab CI pipeline and verify the preview.',
      ],
    },
    weeksData: [
      {
        number: 15,
        stage: 'Practice',
        title: 'Vitest + Playwright + accessibility',
        outcomes: [
          'Write a Vitest component test that fails when behaviour breaks.',
          'Write a Playwright test that covers one critical user flow.',
          'Run an accessibility audit (axe + manual keyboard) and fix the real issues.',
        ],
        task: task(
          'Cover one feature with meaningful tests + an a11y pass',
          `Pick a real feature. Write Vitest tests for its composable + component, a Playwright flow for the happy path, and run an axe audit.`,
          [
            'Set up Vitest with `happy-dom` + `@nuxt/test-utils`. Add one unit test and one component test.',
            `Test the composable's state transitions directly (loading → success → error).`,
            'Test the component via its public interface (what the user sees), not internals.',
            'Add a Playwright test for the happy path (login → create → view).',
            'Run axe DevTools on the feature. Fix every serious or critical issue. Verify keyboard-only navigation top to bottom.',
          ],
          [
            'A test that cannot fail is documentation. Break the behaviour and watch the test fail before you ship.',
            `Prefer Testing-Library-style queries ("find by role 'button' with name"). Avoid \`querySelector\` + CSS classes.`,
            'Do not test the implementation; test the user-visible result.',
            'Playwright is for end-to-end; Vitest is for everything else. Reach for Playwright only when the browser matters.',
            'In the muslim-academy-platform: `pnpm test:unit` + `pnpm test:e2e` are the entry points.',
          ],
          'The feature has Vitest coverage of critical paths, a Playwright flow proves end-to-end integration, the axe scan is clean and the feature is fully keyboard-usable.'
        ),
        resources: [
          read(
            'Vitest docs',
            vitestDocs,
            'vitest.dev · free',
            'Read "Getting started", "Features" and the "Mock" guides.'
          ),
          read(
            '@nuxt/test-utils',
            'https://nuxt.com/docs/getting-started/testing',
            'nuxt.com · free',
            'Nuxt-aware setup that gives you auto-imports in tests.'
          ),
          read(
            'Vue Test Utils',
            'https://test-utils.vuejs.org/',
            'vuejs.org · free',
            'How to mount components under test idiomatically.'
          ),
          read(
            'Playwright: Getting started',
            playwrightDocs,
            'playwright.dev · free',
            'Install, auth state, fixtures.'
          ),
          read(
            'WCAG 2.2 quick reference',
            'https://www.w3.org/WAI/WCAG22/quickref/',
            'W3C · free',
            'The real spec. Scan it per criterion when auditing.'
          ),
          read(
            'axe DevTools',
            'https://www.deque.com/axe/devtools/',
            'deque.com · free',
            'Browser extension; run it on every page you touch.'
          ),
          watch(
            'Kent C. Dodds: Testing JavaScript intro',
            'https://www.youtube.com/watch?v=urxcj5fdxcA',
            'Kent C. Dodds · YouTube',
            'The free intro to the "test behaviour, not implementation" mindset. Watch before writing Vitest tests.'
          ),
        ],
        items: [
          item(
            'Vitest + happy-dom',
            'Vitest is Vite-native and fast. happy-dom is a lighter JSDOM; `@nuxt/test-utils` wires Nuxt into both.',
            `Install \`vitest\`, \`happy-dom\`, \`@nuxt/test-utils\`, \`@vue/test-utils\`. Configure \`vitest.config.ts\` with \`environment: 'happy-dom'\`. Run with \`pnpm test:unit\`.`,
            'You get fast feedback on every change, and your tests know about Nuxt auto-imports.',
            [
              link('Vitest', vitestDocs),
              link('@nuxt/test-utils', 'https://nuxt.com/docs/getting-started/testing'),
            ]
          ),
          item(
            'Component tests via the public interface',
            'Testing component internals is coupling your test to the implementation. The next refactor breaks every test.',
            'Mount the component. Query by role/label/text (user-visible). Assert what the user would see. Mock the API at the service-function boundary.',
            `Refactors stop breaking tests, and the tests document the component's contract.`,
            [link('Vue Test Utils', 'https://test-utils.vuejs.org/')]
          ),
          item(
            'Playwright for end-to-end',
            'Playwright drives a real browser. One flow per critical path is enough; more is maintenance debt.',
            'Script the happy path: login, create, verify. Use fixtures for auth state. Store videos + traces for failures. Run in CI headlessly, locally with `--ui` to debug.',
            'You verify the full system (frontend + backend + auth) without clicking through screens manually.',
            [link('Playwright', playwrightDocs)]
          ),
          item(
            'Accessibility: axe + keyboard + screen reader',
            'An axe scan catches ~50% of a11y issues. The other 50% need a human — keyboard, screen reader, zoom.',
            'Run axe DevTools on every page. Fix serious/critical immediately. Then test keyboard-only (Tab/Shift+Tab/Enter/Space/Escape) and screen reader for one flow.',
            'You stop shipping forms you cannot submit with the keyboard or pages with 10 duplicate landmarks.',
            [
              link('WCAG 2.2', 'https://www.w3.org/WAI/WCAG22/quickref/'),
              link('axe DevTools', 'https://www.deque.com/axe/devtools/'),
            ]
          ),
          item(
            'Hex-free theming → high contrast',
            'The token system you built in Phase 4 is also a contrast system. Picking tokens that meet WCAG AA at design time saves rework.',
            'For every token pair (surface + ink), verify contrast ratio ≥ 4.5:1 for body text and ≥ 3:1 for large text. Add tooling (e.g. `color-contrast-checker`) if you ship themes.',
            'New themes pass contrast on day one instead of needing a round of reviews.',
            [link('WebAIM contrast checker', 'https://webaim.org/resources/contrastchecker/')]
          ),
        ],
      },
      {
        number: 16,
        stage: 'Prove',
        title: 'Performance, SEO & deployment',
        outcomes: [
          'Measure and defend Core Web Vitals (LCP, INP, CLS).',
          'Optimise images and fonts without hand-wavy guesses.',
          'Ship via the GitLab CI pipeline and verify the preview URL.',
        ],
        task: task(
          'Ship the feature to production with a Lighthouse ≥ 90 run',
          'Measure, optimise and ship. The feature must land in staging with a green pipeline and a Lighthouse score ≥ 90 on the critical page.',
          [
            'Baseline the feature with Lighthouse (mobile throttled). Record LCP, INP, CLS, TBT, TTI.',
            'Convert hero images to AVIF/WebP via `vite-imagetools`. Pre-size and lazy-load.',
            'Switch fonts to `@nuxt/fonts` with the right `subsets` for RTL locales. Avoid blocking render.',
            'Audit the chunk graph. If modulepreload spam hurts LCP, tune `experimentalMinChunkSize`.',
            'Deploy via `.gitlab-ci.yml` with install → lint → test → build → deploy stages. Verify the staging URL end to end.',
          ],
          [
            'LCP ≤ 2.5s on mobile throttled, INP ≤ 200ms, CLS ≤ 0.1 — anything else is a regression.',
            'The muslim-academy-platform has a documented LCP fix in `nuxt.config.ts` via `experimentalMinChunkSize: 20_000`. Read why.',
            'AVIF ~5-8× smaller than PNG for photos. WebP as fallback. `<picture>` with `<source>` elements handles both.',
            'For fonts: declare `subsets: ["latin", "latin-ext", "arabic"]` when shipping Arabic. Default is latin-only and will silently fall back on Arabic glyphs.',
            'Prerender marketing pages (`routeRules: { "/": { prerender: true } }`); SSR for public dynamic ones; `ssr: false` for auth-wall dashboards.',
          ],
          'Lighthouse ≥ 90 on the critical page; the pipeline is green; the preview URL serves the feature end to end; the release notes include what you measured and fixed.'
        ),
        resources: [
          read(
            'web.dev: Core Web Vitals',
            'https://web.dev/articles/vitals',
            'web.dev · free',
            'LCP, INP, CLS — thresholds and interpretation.'
          ),
          read(
            'web.dev: Optimize LCP',
            'https://web.dev/articles/optimize-lcp',
            'web.dev · free',
            'A systematic walkthrough. Preload is a last resort, not a first move.'
          ),
          read(
            'web.dev: Optimize INP',
            'https://web.dev/articles/optimize-inp',
            'web.dev · free',
            'The input-latency metric that replaced FID.'
          ),
          read(
            'Nuxt docs: Rendering + routeRules',
            'https://nuxt.com/docs/guide/concepts/rendering',
            'nuxt.com · free',
            'Per-route prerender, SSR, SPA.'
          ),
          read(
            '@nuxt/fonts',
            'https://fonts.nuxt.com/',
            'nuxt.com · free',
            'Zero-blocking font loading with build-time woff2 downloads.'
          ),
          read(
            'vite-imagetools',
            'https://github.com/JonasKruckenberg/imagetools',
            'github.com · free',
            'Build-time image transforms. Use `?format=avif;webp&as=picture`.'
          ),
          read(
            'GitLab CI docs',
            'https://docs.gitlab.com/ci/',
            'docs.gitlab.com · free',
            'Pipelines, stages, caching, environments.'
          ),
          watch(
            'Jake Archibald: The main thread is overworked',
            'https://www.youtube.com/watch?v=7Rrv9qFMWNM',
            'JSConf · YouTube',
            'The talk that reframes "web performance" as "scheduling the main thread". Required before INP work.'
          ),
        ],
        items: [
          item(
            'Core Web Vitals: LCP, INP, CLS',
            'The browser measures these on real users. Fixing them raises both SEO ranking and user satisfaction.',
            'Measure with Lighthouse (lab) + CrUX / Chrome UX Report (field). Targets: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1. Fix the highest-leverage one first.',
            'You optimise what matters to users and search, not vanity metrics.',
            [link('web.dev: Core Web Vitals', 'https://web.dev/articles/vitals')]
          ),
          item(
            'Image optimisation (AVIF/WebP + sizes)',
            'Images are usually the heaviest asset. AVIF/WebP + correct sizes + lazy-loading is 5-10× cheaper than PNG with no visible difference.',
            'Use `vite-imagetools` to emit AVIF + WebP from source. Build a `<picture>` with `<source>` elements. Set `loading="lazy"` + explicit width/height to prevent CLS.',
            'Hero images stop being the LCP bottleneck and layouts stop shifting.',
            [link('vite-imagetools', 'https://github.com/JonasKruckenberg/imagetools')],
            'In the muslim-academy-platform: `?format=avif;webp&as=picture` is the convention. Hero visual + About page use it.'
          ),
          item(
            'Font loading without blocking',
            '`@nuxt/fonts` downloads woff2 at build time, self-hosts them under `/_fonts/` and emits `@font-face` with `font-display: swap`.',
            'Configure families in `nuxt.config.ts`. Set `global: true` for families referenced via CSS vars. Declare `subsets` explicitly when shipping non-Latin scripts.',
            'Fonts stop blocking render and non-Latin locales stop silently falling back.',
            [link('@nuxt/fonts', 'https://fonts.nuxt.com/')],
            `In the muslim-academy-platform the Arabic locale needs \`subsets: ["latin", "latin-ext", "arabic"]\`. Missing \`arabic\` makes IBM Plex Sans Arabic fall back silently.`
          ),
          item(
            'Chunk graph & modulepreload',
            'Nuxt auto-emits `<link rel="modulepreload">` per imported chunk. Too many tiny chunks starve the LCP image of connection.',
            'In `nuxt.config.ts` set `vite.build.rollupOptions.output.experimentalMinChunkSize: 20_000`. Merge chunks under 20 KB into their importer. Verify preload tag count drops in `<head>`.',
            'LCP recovers because the critical path is no longer competing with dozens of small preloads.',
            [],
            'In the muslim-academy-platform: Lighthouse 2026-10-14 observed LCP = 606 ms real / 4172 ms Lantern-simulated. Fix was `experimentalMinChunkSize: 20_000`.'
          ),
          item(
            'Rendering strategy: prerender / SSR / SPA',
            'The right rendering mode is a performance choice. Prerender marketing pages, SSR public dynamic ones, SPA auth-wall dashboards.',
            'Set via `routeRules` in `nuxt.config.ts`. Prerender at build; SSR per request; `ssr: false` for pages that only make sense signed in.',
            'First paint, SEO and auth all land correctly, each with the mode they need.',
            [link('Nuxt: routeRules', 'https://nuxt.com/docs/guide/concepts/rendering')]
          ),
          item(
            'GitLab CI: install → lint → test → build → deploy',
            `A manual deploy is a release that fails on someone's laptop. The pipeline is the release contract.`,
            'Write `.gitlab-ci.yml` with cached dependencies, parallel lint/test/typecheck, build artifacts and a protected-branch deploy. Fail fast on lint; fail hard on test.',
            'You deploy with confidence because every merge went through the same gates.',
            [link('GitLab CI', 'https://docs.gitlab.com/ci/')],
            'In the muslim-academy-platform: scan `.gitlab-ci.yml` to see the deploy pipeline shape you will mirror.'
          ),
        ],
      },
    ],
    template: {
      title: 'Shipping checklist',
      items: [
        'Vitest covers composables + components by their public interface',
        'One Playwright happy-path flow per critical feature',
        'axe clean + keyboard-only verified',
        'Lighthouse mobile ≥ 90 on the critical page',
        'Images converted to AVIF/WebP with explicit sizes',
        'Fonts self-hosted with correct subsets',
        'Pipeline deploys to a preview URL and the release is verified',
      ],
    },
    prompts: [
      'Review this component test — flag anywhere it is testing implementation instead of behaviour.',
      'Audit this page for Lighthouse LCP/INP/CLS. Suggest the three highest-leverage fixes with evidence.',
      'Explain every stage of this `.gitlab-ci.yml`. What would happen if the test stage silently passed on zero tests?',
    ],
    gates: [
      'You can write a Vitest test that fails when behaviour breaks, in under 15 minutes.',
      'You can audit a page for a11y with axe + keyboard + screen reader and fix the real issues.',
      'You can defend LCP, INP and CLS with measurements, not opinions.',
      'You can ship via the pipeline and verify the preview URL end to end.',
    ],
  },
];
