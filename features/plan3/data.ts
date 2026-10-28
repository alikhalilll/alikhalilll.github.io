import type { PlanLink, ResourceGroup } from '~/features/plan1/types';

export const roles = [
  {
    role: 'Learner',
    responsibility:
      "Studies, practices on real work (muslim-academy-platform tickets or a sandbox), produces each week's deliverable, logs decisions in `DECISIONS.md`.",
  },
  {
    role: 'Mentor / reviewer',
    responsibility:
      "Runs the weekly review, defends each `You're good when` bar, and reviews the first MR each week before it goes to the team.",
  },
  {
    role: 'Peer',
    responsibility: `Pairs on one task per week; reviews a teammate's MR before the mentor does.`,
  },
  {
    role: 'Design partner',
    responsibility:
      'Signs off the Figma → tokens mapping and reviews the RTL screen with real Arabic content.',
  },
];

export const schedule = [
  { day: 'Day 1', time: '2 hrs', activity: "Watch the week's playlist chapters + take notes" },
  { day: 'Day 2', time: '2 hrs', activity: 'Read the docs; type-along in a scratch notebook' },
  {
    day: 'Day 3',
    time: '2–3 hrs',
    activity: 'Build the task on a real repo (yours or the sandbox)',
  },
  { day: 'Day 4', time: '2–3 hrs', activity: 'Polish, test, run a11y + Lighthouse, open the MR' },
  { day: 'Day 5', time: '1 hr', activity: 'Mentor review — read the diff + the decision log' },
  { day: 'Day 5', time: '1 hr', activity: 'Peer review + update your progress tracker' },
];

export const conventions = [
  {
    title: 'Decision logs',
    body: 'Every non-obvious call (rendering mode, state scope, component API, performance budget) goes in a short `DECISIONS.md` entry with context + alternative + choice + consequence.',
  },
  {
    title: 'Component naming',
    body: `Vue component files are PascalCase (\`FaqSearch.vue\`). Folder entry is \`index.vue\`. Pages auto-import by path (\`pages/auth/login.vue\` → \`AuthLogin\`).`,
  },
  {
    title: 'Fetch pattern',
    body: 'Fetch directly in the component that needs the data. No per-resource composable, no `useAsyncData`. Shared `api()` helper + per-module `service.ts`.',
  },
  {
    title: 'Styling',
    body: `Never ship arbitrary \`[#hex]\` utilities. Map Figma colours to theme tokens; fall back to the nearest Tailwind palette colour. Reserve \`<style scoped>\` for CSS features utilities can't express.`,
  },
  {
    title: 'i18n',
    body: `Every string wrapped in \`$t()\`. Use \`useLocalePath()\` for internal URLs and \`<NuxtLinkLocale>\` in templates. Treat RTL as the default; test every screen in ar-sa before merging.`,
  },
  {
    title: 'Reviews',
    body: 'Every MR gets a peer review + an a11y pass + a Lighthouse check before the mentor review. No "trust me" merges.',
  },
];

export const aiTools = [
  {
    name: 'Claude (chat)',
    use: 'Explain Vue/Nuxt internals, review TS types, pair on a Zod schema, generate boilerplate.',
    href: 'https://claude.ai',
    label: 'claude.ai',
  },
  {
    name: 'Claude Code',
    use: 'Scaffold a feature module following the conventions. Explain `nuxt.config.ts`. Audit a component for pattern drift.',
    href: 'https://code.claude.com/docs/en/overview',
    label: 'Claude Code docs',
  },
  {
    name: 'TypeScript Playground',
    use: 'Reproduce TS errors in isolation. Share minimal repros in reviews.',
    href: 'https://www.typescriptlang.org/play',
    label: 'typescriptlang.org/play',
  },
  {
    name: 'Vue SFC Playground',
    use: 'Prove a reactivity question in 10 lines. Share the link in reviews instead of pasting code.',
    href: 'https://play.vuejs.org/',
    label: 'play.vuejs.org',
  },
  {
    name: 'Lighthouse (DevTools)',
    use: 'Measure LCP/INP/CLS before and after a change. Attach the before/after to the MR.',
    href: 'https://developer.chrome.com/docs/lighthouse/overview',
    label: 'Chrome DevTools',
  },
];

export const weeklyRhythm = [
  '~40% study (playlist + docs), ~60% build on real work',
  'One MR per week with a `DECISIONS.md` entry explaining non-obvious calls',
  'a11y pass + Lighthouse ≥ 90 before mentor review',
  'Peer review before mentor review — no exceptions',
];

export const studyLoop = [
  {
    step: 'Watch',
    time: '~90 min',
    title: `Watch the week's playlist chapters at 1.25×`,
    body: 'Take notes in your own words. Prediction before pressing play: say what you expect each snippet to output; the gap is where learning happens.',
  },
  {
    step: 'Read',
    time: '~60 min',
    title: 'Read the official docs for the same concept',
    body: 'Docs > videos as a reference. Steal one code snippet per concept you can reuse at work. Flag anything the docs disagree with the video on.',
  },
  {
    step: 'Build',
    time: '4–6 hrs',
    title: `Build the week's deliverable on a real repo`,
    body: 'A toy example teaches syntax. Real repos teach engineering: missing docs, legacy code, broken assumptions. Build on the muslim-academy-platform or a sandbox clone of it.',
  },
  {
    step: 'Prove',
    time: '~30 min',
    title: `Explain the artifact and pass the "done when" bar`,
    body: 'Walk a teammate through the MR + the decision log. If you cannot defend a line, revisit it. Prediction + explanation is what makes knowledge stick.',
  },
];

export const mainResources: PlanLink[] = [
  { label: 'Vue 3 docs', href: 'https://vuejs.org/guide/introduction.html' },
  { label: 'Nuxt 4 docs', href: 'https://nuxt.com/docs/getting-started/introduction' },
  { label: 'TypeScript Handbook', href: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
  { label: 'Zod', href: 'https://zod.dev/' },
  { label: 'VeeValidate', href: 'https://vee-validate.logaretm.com/v4/guide/overview' },
  { label: 'UnoCSS', href: 'https://unocss.dev/guide/' },
  {
    label: 'Codevolution: JavaScript Masterclass',
    href: 'https://www.youtube.com/watch?v=CTwLp4XzZis&list=PLH_t3aTgqQcBsTKTja9VXQCoBrctPbxl2',
  },
  {
    label: 'Codevolution: TypeScript Masterclass',
    href: 'https://www.youtube.com/watch?v=WYSt5e7fLWU&list=PLH_t3aTgqQcAFpAc58kJ4QLIn9y_I9zP1',
  },
  { label: 'web.dev: Learn CSS', href: 'https://web.dev/learn/css' },
  { label: 'web.dev: Core Web Vitals', href: 'https://web.dev/articles/vitals' },
];

export const resourceGroups: ResourceGroup[] = [
  {
    key: 'fundamentals',
    label: 'Phase 1 · Weeks 1–4',
    tone: 'blue',
    items: [
      {
        label: 'MDN: HTML elements',
        href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element',
      },
      { label: 'web.dev: Learn CSS', href: 'https://web.dev/learn/css' },
      {
        label: 'Josh Comeau: Interactive Flexbox',
        href: 'https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/',
      },
      {
        label: 'CSS-Tricks: Grid guide',
        href: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
      },
      { label: 'OKLCH color picker', href: 'https://oklch.com/' },
      {
        label: 'Codevolution: JavaScript Masterclass',
        href: 'https://www.youtube.com/watch?v=CTwLp4XzZis&list=PLH_t3aTgqQcBsTKTja9VXQCoBrctPbxl2',
      },
      {
        label: 'Codevolution: TypeScript Masterclass',
        href: 'https://www.youtube.com/watch?v=WYSt5e7fLWU&list=PLH_t3aTgqQcAFpAc58kJ4QLIn9y_I9zP1',
      },
      {
        label: 'MDN: JavaScript guide',
        href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
      },
      { label: 'JavaScript.info', href: 'https://javascript.info/' },
      {
        label: "You Don't Know JS Yet (2nd ed.)",
        href: 'https://github.com/getify/You-Dont-Know-JS',
      },
      {
        label: 'Philip Roberts: What the heck is the event loop',
        href: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
      },
      {
        label: 'TypeScript Handbook',
        href: 'https://www.typescriptlang.org/docs/handbook/intro.html',
      },
      { label: 'Matt Pocock: Total TypeScript tips', href: 'https://www.totaltypescript.com/tips' },
      { label: 'TypeScript Deep Dive', href: 'https://basarat.gitbook.io/typescript/' },
      { label: 'Zod docs', href: 'https://zod.dev/' },
      { label: 'Patterns.dev: Rendering', href: 'https://www.patterns.dev/#rendering-patterns' },
      {
        label: 'web.dev: Performance budgets',
        href: 'https://web.dev/articles/performance-budgets-101',
      },
      { label: 'A11y Project checklist', href: 'https://www.a11yproject.com/checklist/' },
      {
        label: 'Rich Harris: Rethinking reactivity',
        href: 'https://www.youtube.com/watch?v=AdNJ3fydeao',
      },
    ],
  },
  {
    key: 'vue',
    label: 'Phase 2 · Weeks 5–6',
    tone: 'violet',
    items: [
      { label: 'Vue 3 docs', href: 'https://vuejs.org/guide/introduction.html' },
      {
        label: 'Vue 3: Reactivity in depth',
        href: 'https://vuejs.org/guide/extras/reactivity-in-depth.html',
      },
      {
        label: 'Vue 3: Rendering mechanism',
        href: 'https://vuejs.org/guide/extras/rendering-mechanism.html',
      },
      { label: 'Vue 3: Script Setup', href: 'https://vuejs.org/api/sfc-script-setup.html' },
      { label: 'Vue 3: Composables', href: 'https://vuejs.org/guide/reusability/composables.html' },
      { label: 'Vue 3: Slots', href: 'https://vuejs.org/guide/components/slots.html' },
      {
        label: 'Vue 3: Provide / Inject',
        href: 'https://vuejs.org/guide/components/provide-inject.html',
      },
      { label: 'VueUse (100+ composables)', href: 'https://vueuse.org/functions.html' },
      { label: 'Vue SFC Playground', href: 'https://play.vuejs.org/' },
      {
        label: 'Net Ninja: Vue 3 full playlist (free)',
        href: 'https://www.youtube.com/watch?v=KL8MQJs8Z3U&list=PL4cUxeGkcC9hYYGbV60Vq3IXYNfDk8At1',
      },
      {
        label: 'Vue Mastery: free lessons',
        href: 'https://www.vuemastery.com/courses-path/beginner',
      },
      {
        label: 'Michael Thiessen: Vue articles',
        href: 'https://michaelnthiessen.com/articles',
      },
      {
        label: 'Rich Harris: Rethinking reactivity',
        href: 'https://www.youtube.com/watch?v=AdNJ3fydeao',
      },
    ],
  },
  {
    key: 'nuxt',
    label: 'Phase 3 · Weeks 7–9',
    tone: 'teal',
    items: [
      // Readable
      { label: 'Nuxt 4 docs', href: 'https://nuxt.com/docs/getting-started/introduction' },
      { label: 'Nuxt: Routing', href: 'https://nuxt.com/docs/getting-started/routing' },
      { label: 'Nuxt: Rendering', href: 'https://nuxt.com/docs/guide/concepts/rendering' },
      { label: 'Nuxt: Auto imports', href: 'https://nuxt.com/docs/guide/concepts/auto-imports' },
      {
        label: 'Nuxt: Components auto-register',
        href: 'https://nuxt.com/docs/guide/directory-structure/components',
      },
      { label: 'Nuxt: Server routes', href: 'https://nuxt.com/docs/getting-started/server' },
      { label: 'Nuxt: Plugins', href: 'https://nuxt.com/docs/guide/directory-structure/plugins' },
      {
        label: 'Nuxt: Middleware',
        href: 'https://nuxt.com/docs/guide/directory-structure/middleware',
      },
      { label: 'Nitro (Nuxt server runtime) docs', href: 'https://nitro.unjs.io/guide' },
      { label: 'Vite guide', href: 'https://vite.dev/guide/' },
      // Interactive
      { label: 'Nuxt Playground (interactive)', href: 'https://nuxt.new/' },
      { label: 'Nuxt Modules directory', href: 'https://nuxt.com/modules' },
      // Watchable
      {
        label: 'Alex Lichter: Nuxt YouTube channel',
        href: 'https://www.youtube.com/@TheAlexLichter',
      },
      {
        label: 'LearnVue: Nuxt 3 in 60 minutes',
        href: 'https://www.youtube.com/watch?v=dCxSsr5xuL8',
      },
      { label: 'Nuxt Nation (conference talks)', href: 'https://nuxtnation.com/' },
      // Project-specific
      {
        label: 'ali-nuxt-toolkit: nuxt-api-provider',
        href: 'https://alikhalilll.github.io/ali-nuxt-toolkit/api-provider',
      },
      {
        label: 'ali-nuxt-toolkit: nuxt-auto-middleware',
        href: 'https://alikhalilll.github.io/ali-nuxt-toolkit/auto-middleware',
      },
      {
        label: 'ali-nuxt-toolkit: nuxt-crypto',
        href: 'https://alikhalilll.github.io/ali-nuxt-toolkit/crypto',
      },
    ],
  },
  {
    key: 'ui',
    label: 'Phase 4 · Weeks 10–11',
    tone: 'amber',
    items: [
      // Readable
      { label: 'UnoCSS docs', href: 'https://unocss.dev/guide/' },
      { label: 'UnoCSS: Shortcuts', href: 'https://unocss.dev/config/shortcuts' },
      { label: 'UnoCSS: Presets', href: 'https://unocss.dev/presets/' },
      { label: 'reka-ui docs', href: 'https://reka-ui.com/' },
      { label: 'shadcn-vue', href: 'https://www.shadcn-vue.com/' },
      { label: '@nuxtjs/i18n docs', href: 'https://i18n.nuxtjs.org/' },
      {
        label: 'MDN: Logical properties',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values',
      },
      {
        label: 'web.dev: RTL styling best practices',
        href: 'https://rtlstyling.com/',
      },
      {
        label: 'Josh Comeau: CSS for JS devs (free selected lessons)',
        href: 'https://www.joshwcomeau.com/css/',
      },
      // Interactive
      { label: 'OKLCH color picker (interactive)', href: 'https://oklch.com/' },
      {
        label: 'UnoCSS Playground (interactive)',
        href: 'https://unocss.dev/play/',
      },
      {
        label: 'CSS Grid Garden (game)',
        href: 'https://cssgridgarden.com/',
      },
      {
        label: 'Flexbox Froggy (game)',
        href: 'https://flexboxfroggy.com/',
      },
      // Watchable
      {
        label: 'Kevin Powell: Modern CSS YouTube',
        href: 'https://www.youtube.com/@KevinPowell',
      },
    ],
  },
  {
    key: 'data',
    label: 'Phase 5 · Weeks 12–14',
    tone: 'rose',
    items: [
      // Readable
      { label: 'VeeValidate docs', href: 'https://vee-validate.logaretm.com/v4/guide/overview' },
      {
        label: '@vee-validate/zod bridge',
        href: 'https://vee-validate.logaretm.com/v4/examples/zod/',
      },
      { label: 'Zod docs', href: 'https://zod.dev/' },
      { label: 'Nuxt: Data fetching', href: 'https://nuxt.com/docs/getting-started/data-fetching' },
      { label: 'Nuxt: $fetch', href: 'https://nuxt.com/docs/api/utils/dollarfetch' },
      { label: 'ofetch', href: 'https://github.com/unjs/ofetch' },
      { label: 'Nuxt: useState', href: 'https://nuxt.com/docs/api/composables/use-state' },
      {
        label: 'web.dev: Reflect state in URL',
        href: 'https://developer.mozilla.org/en-US/docs/Web/API/History_API',
      },
      {
        label: 'MDN: Learn forms (deep guide)',
        href: 'https://developer.mozilla.org/en-US/docs/Learn/Forms',
      },
      // Interactive
      { label: 'Zod Playground', href: 'https://zod-playground.vercel.app/' },
      {
        label: 'VueUse: useDebounceFn (interactive)',
        href: 'https://vueuse.org/shared/useDebounceFn/',
      },
      // Watchable
      {
        label: 'Alex Vipond: VeeValidate deep dive',
        href: 'https://www.youtube.com/watch?v=7LAgTkv72a4',
      },
      {
        label: 'LearnVue: forms + validation YouTube',
        href: 'https://www.youtube.com/@LearnVue',
      },
    ],
  },
  {
    key: 'shipping',
    label: 'Phase 6 · Weeks 15–16',
    tone: 'indigo',
    items: [
      // Readable
      { label: 'Vitest', href: 'https://vitest.dev/guide/' },
      { label: '@nuxt/test-utils', href: 'https://nuxt.com/docs/getting-started/testing' },
      { label: 'Vue Test Utils', href: 'https://test-utils.vuejs.org/' },
      { label: 'Playwright', href: 'https://playwright.dev/docs/intro' },
      {
        label: 'Testing Library: Guiding principles',
        href: 'https://testing-library.com/docs/guiding-principles/',
      },
      { label: 'WCAG 2.2 quick reference', href: 'https://www.w3.org/WAI/WCAG22/quickref/' },
      { label: 'WebAIM articles', href: 'https://webaim.org/articles/' },
      { label: 'web.dev: Core Web Vitals', href: 'https://web.dev/articles/vitals' },
      { label: 'web.dev: Optimize LCP', href: 'https://web.dev/articles/optimize-lcp' },
      { label: 'web.dev: Optimize INP', href: 'https://web.dev/articles/optimize-inp' },
      { label: '@nuxt/fonts', href: 'https://fonts.nuxt.com/' },
      { label: 'vite-imagetools', href: 'https://github.com/JonasKruckenberg/imagetools' },
      { label: 'GitLab CI', href: 'https://docs.gitlab.com/ci/' },
      // Interactive
      {
        label: 'web.dev Measure (interactive Lighthouse)',
        href: 'https://pagespeed.web.dev/',
      },
      { label: 'axe DevTools (browser extension)', href: 'https://www.deque.com/axe/devtools/' },
      {
        label: 'Playwright Trace Viewer (interactive)',
        href: 'https://playwright.dev/docs/trace-viewer',
      },
      // Watchable
      {
        label: 'Kent C. Dodds: Testing JavaScript (free intro)',
        href: 'https://www.youtube.com/watch?v=urxcj5fdxcA',
      },
      {
        label: 'Marcy Sutton: web a11y talks',
        href: 'https://marcysutton.com/talks',
      },
      {
        label: 'Jake Archibald: The main thread is overworked',
        href: 'https://www.youtube.com/watch?v=7Rrv9qFMWNM',
      },
    ],
  },
];
