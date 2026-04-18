<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

useHead({ title: 'About — Ali Khalil' });

const { roles } = useExperience();

const currentlyItems = [
  { icon: 'lucide:hammer', text: 'Leading the frontend at eDialogue Corner Society on Ataa SaaS.' },
  { icon: 'lucide:package', text: 'Publishing open-source Nuxt modules under @alikhalilll.' },
  { icon: 'lucide:plane', text: 'Ready to relocate to Riyadh, Saudi Arabia.' },
];

const stack = {
  Frontend: [
    'Vue 2 / 3',
    'Nuxt 3 / 4',
    'React',
    'Angular',
    'TypeScript',
    'Tailwind',
    'ShadCN',
    'UnoCSS',
    'Vuetify',
    'Naive UI',
    'Pug',
    'SCSS',
  ],
  'Real-time & perf': [
    'Pusher (WebSockets)',
    'IndexedDB',
    'AES-GCM',
    'PBKDF2',
    'Virtualized rendering',
    'Lazy hydration',
    'Critical CSS',
    'Brotli / Gzip',
  ],
  'Backend & APIs': [
    'Node.js',
    'Express',
    'NestJS',
    'MongoDB',
    'REST',
    'JWT',
    'OAuth',
    'RBAC',
    'Stripe',
    'PayPal',
    'Moyasar',
  ],
  'Build & DevOps': ['Vite', 'Webpack', 'Gulp', 'GitLab CI/CD', 'Docker'],
  'Quality & team': [
    'ESLint',
    'Prettier',
    'Unit + E2E testing',
    'Code review',
    'Mentorship',
    'WCAG 2.1',
  ],
};
</script>

<template>
  <div>
    <Hero
      eyebrow="About"
      title="Senior Frontend Developer & Team Lead."
      subtitle="Five years in the trenches. Vue, Nuxt, TypeScript, and real-time systems. Comfortable owning an end-to-end frontend and the team that ships it."
    />

    <article class="prose-container pb-16">
      <section class="space-y-6 text-lg leading-relaxed text-foreground/90">
        <p>
          I'm Ali. I've spent the last five years shipping web apps — mostly SaaS, mostly in the
          Saudi and Egyptian markets, increasingly at the lead / senior level. Recently that's meant
          owning the frontend of multi-tenant platforms with heavy real-time requirements, building
          the registries and patterns that let a small team move fast without things getting
          tangled.
        </p>
        <p>
          I care about the boring details — the ones that turn a passable app into something that
          survives three years of feature churn. Clear types. Honest error states. Pages that load
          quickly enough that nobody has to apologize for them. Accessibility that isn't an
          afterthought. Docs that admit what a thing <em>won't</em> do.
        </p>
        <p>
          I lead by example. I review pull requests carefully, mentor willingly, and push hard on
          performance and accessibility standards. I've been Employee of the Month twice — which I
          mention only because it's a decent proxy for "the work held up under load."
        </p>
      </section>

      <h2 class="mt-14 flex items-center gap-3 text-2xl sm:text-3xl">
        <Icon name="lucide:coffee" class="size-6 text-primary" />
        Currently
      </h2>
      <ul class="mt-5 space-y-3">
        <li v-for="item in currentlyItems" :key="item.text" class="flex items-start gap-3">
          <Icon :name="item.icon" class="mt-1 size-5 shrink-0 text-primary" />
          <span class="text-foreground/90">{{ item.text }}</span>
        </li>
      </ul>
    </article>

    <Separator class="mx-auto max-w-md" />

    <section class="prose-container py-16">
      <h2 class="flex items-center gap-3 text-2xl sm:text-3xl">
        <Icon name="lucide:history" class="size-6 text-primary" />
        Experience
      </h2>

      <ol class="mt-8 space-y-10 border-l-2 border-border pl-8">
        <li v-for="role in roles" :key="role.company + role.period" class="relative">
          <span
            class="absolute -left-[42px] top-1.5 grid size-8 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground"
          >
            <Icon name="lucide:briefcase" class="size-4" />
          </span>

          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 class="font-serif text-xl font-semibold text-foreground">
              {{ role.title }}
            </h3>
            <span class="text-sm text-muted-foreground">{{ role.period }}</span>
          </div>
          <p class="mt-1 text-sm text-muted-foreground">
            <a v-if="role.link" :href="role.link" target="_blank" rel="noopener">
              {{ role.company }}
            </a>
            <span v-else>{{ role.company }}</span>
            · {{ role.location }}
          </p>

          <ul class="mt-4 space-y-2 text-foreground/90">
            <li
              v-for="(h, i) in role.highlights"
              :key="i"
              class="flex items-start gap-2.5 text-[0.975rem] leading-relaxed"
            >
              <Icon name="lucide:check" class="mt-1.5 size-3.5 shrink-0 text-primary" />
              <span>{{ h }}</span>
            </li>
          </ul>
        </li>
      </ol>
    </section>

    <Separator class="mx-auto max-w-md" />

    <section class="prose-container py-16">
      <h2 class="flex items-center gap-3 text-2xl sm:text-3xl">
        <Icon name="lucide:wrench" class="size-6 text-primary" />
        Tools of the trade
      </h2>

      <div class="mt-8 space-y-6">
        <div v-for="(items, group) in stack" :key="group">
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {{ group }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="s in items" :key="s" variant="outline">{{ s }}</Badge>
          </div>
        </div>
      </div>
    </section>

    <section class="prose-container pb-24">
      <div class="rounded-xl border border-border bg-card p-6 sm:p-8">
        <h3 class="flex items-center gap-3 text-xl sm:text-2xl">
          <Icon name="lucide:graduation-cap" class="size-5 text-primary" />
          Education
        </h3>
        <p class="mt-3 font-serif text-lg font-semibold text-foreground">BSc in Computer Science</p>
        <p class="mt-1 text-muted-foreground">Mansoura University, Egypt · 10/2018 — 10/2022</p>
        <p class="mt-3 text-foreground/90">
          Focus on software engineering, web development, and algorithms. Final-year projects
          centered on frontend architecture and RESTful API design.
        </p>

        <Separator class="my-6" />

        <p class="text-sm text-muted-foreground">
          <span class="font-medium text-foreground">Languages:</span> Arabic (native) · English
          (advanced, B2–C1)
        </p>

        <div class="mt-6">
          <Button as="a" href="/contact" variant="primary">
            Get in touch
            <Icon name="lucide:arrow-right" />
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>
