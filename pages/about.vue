<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const { t } = useI18n();
const localePath = useLocalePath();
const { formatPeriod } = useLocalizedDate();
const tmArray = useTmArray();

useSiteSeo({
  title: t('meta.about.title'),
  description: t('meta.about.description'),
});

const { roles } = useExperience();

const introParagraphs = computed(() => tmArray('about.intro'));
const currentlyItems = computed(() => tmArray('about.currently_items'));

type StackGroup = { title: string; items: string[] };
const stack: StackGroup[] = [
  {
    title: 'about.stack.frontend',
    items: [
      'Vue.js (2–3)',
      'Nuxt (3–4)',
      'React.js',
      'Angular',
      'TypeScript',
      'JavaScript (ES6+)',
      'HTML5',
      'CSS3',
      'Tailwind CSS',
      'UnoCSS',
      'Vuetify',
      'ShadCN',
      'Naive UI',
      'SCSS / Sass',
      'Pug.js',
    ],
  },
  {
    title: 'about.stack.backend',
    items: [
      'Node.js',
      'Express.js',
      'NestJS',
      'MongoDB (Mongoose)',
      'RESTful APIs',
      'JWT Authentication',
      'RBAC',
      'OAuth',
      'Stripe & PayPal Integration',
      'Axios',
      'Input Validation',
      'Rate Limiting',
      'bcrypt.js',
    ],
  },
  {
    title: 'about.stack.databases',
    items: ['MongoDB', 'Mongoose ODM', 'IndexedDB', 'LocalStorage / SessionStorage'],
  },
  { title: 'about.stack.state', items: ['Pinia', 'Vuex', 'Redux'] },
  {
    title: 'about.stack.realtime',
    items: [
      'Pusher (WebSockets)',
      'IndexedDB',
      'AES-GCM Encryption',
      'PBKDF2',
      'Virtualized Rendering',
      'Lazy Hydration',
      'Code Splitting',
      'Caching & Compression (Brotli / Gzip)',
      'Critical CSS',
    ],
  },
  {
    title: 'about.stack.devops',
    items: ['Vite', 'Webpack', 'Gulp.js', 'GitLab CI/CD', 'Docker', 'Brotli / Gzip Compression'],
  },
  {
    title: 'about.stack.quality',
    items: [
      'ESLint',
      'Prettier',
      'Unit & E2E Testing',
      'Code Review',
      'Mentorship',
      'Team Leadership',
      'Cross-functional Collaboration',
      'Accessibility (WCAG 2.1)',
    ],
  },
];
</script>

<template>
  <div>
    <section class="pt-6 pb-10 sm:pt-10 sm:pb-14">
      <div class="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
        <img
          src="/avatar.jpg"
          alt="Ali Khalil"
          width="384"
          height="384"
          decoding="async"
          fetchpriority="high"
          class="size-32 shrink-0 rounded-lg object-cover shadow-lg ring-2 ring-border ring-offset-4 ring-offset-background sm:size-40 sm:rotate-3"
        />
        <div class="min-w-0">
          <p class="mb-4">
            <span
              class="inline-block rounded-full bg-accent px-3 py-1 text-[11px] font-medium tracking-widest text-accent-foreground uppercase ar:normal-case ar:tracking-normal"
            >
              {{ t('about.eyebrow') }}
            </span>
          </p>
          <h1 class="text-3xl leading-[1.15] sm:text-4xl md:text-5xl">{{ t('about.title') }}</h1>
          <p class="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {{ t('about.subtitle') }}
          </p>
        </div>
      </div>
    </section>

    <article class="pb-20">
      <section class="space-y-5 text-base leading-relaxed text-foreground/90 sm:text-lg">
        <p v-for="(p, i) in introParagraphs" :key="i">{{ p }}</p>
      </section>

      <h2
        class="mt-14 text-sm font-semibold tracking-wide text-muted-foreground uppercase ar:normal-case"
      >
        {{ t('about.currently') }}
      </h2>
      <ul class="mt-4 space-y-2 text-foreground/90">
        <li
          v-for="(item, i) in currentlyItems"
          :key="item"
          v-reveal="i * 50"
          class="flex items-start gap-3"
        >
          <span class="mt-[0.6rem] size-1 shrink-0 rounded-full bg-foreground/40" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </article>

    <section class="pb-20">
      <h2
        class="text-sm font-semibold tracking-wide text-muted-foreground uppercase ar:normal-case"
      >
        {{ t('about.experience') }}
      </h2>

      <ol class="mt-6 space-y-8 border-s border-border ps-6 sm:ms-2 sm:space-y-10 sm:ps-8">
        <li
          v-for="(role, i) in roles"
          :key="role.company + role.start"
          v-reveal="i * 60"
          class="relative"
        >
          <span
            class="absolute top-2 -start-[29px] block size-2 rounded-full bg-foreground sm:-start-[37px]"
            aria-hidden="true"
          />

          <div
            class="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4"
          >
            <h3
              class="min-w-0 text-base leading-snug font-semibold text-foreground text-balance sm:text-lg"
            >
              <bdi>{{ role.title }}</bdi>
            </h3>
            <span
              class="font-mono text-xs whitespace-nowrap text-muted-foreground ar:font-sans ar:text-sm ar:font-semibold"
            >
              {{ formatPeriod(role.start, role.end) }}
            </span>
          </div>
          <p class="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-sm text-muted-foreground">
            <a
              v-if="role.link"
              :href="role.link"
              target="_blank"
              rel="noopener"
              class="min-w-0 truncate hover:text-foreground"
            >
              <bdi>{{ role.company }}</bdi>
            </a>
            <span v-else class="min-w-0"
              ><bdi>{{ role.company }}</bdi></span
            >
            <span class="opacity-40" aria-hidden="true">·</span>
            <span>{{ role.location }}</span>
          </p>

          <ul class="mt-3 space-y-1.5 text-sm leading-relaxed text-foreground/90 sm:mt-4">
            <li v-for="(h, j) in role.highlights" :key="j" class="flex items-start gap-2">
              <span
                class="mt-[0.55rem] size-1 shrink-0 rounded-full bg-foreground/40"
                aria-hidden="true"
              />
              <span class="min-w-0">{{ h }}</span>
            </li>
          </ul>
        </li>
      </ol>
    </section>

    <section class="pb-20">
      <h2
        class="text-sm font-semibold tracking-wide text-muted-foreground uppercase ar:normal-case"
      >
        {{ t('about.skills') }}
      </h2>

      <div class="mt-6 space-y-5">
        <div v-for="(group, i) in stack" :key="group.title" v-reveal="i * 50">
          <h3 class="mb-2 text-xs font-semibold tracking-wide text-foreground uppercase">
            {{ t(group.title) }}
          </h3>
          <div class="flex flex-wrap gap-1.5">
            <Badge v-for="s in group.items" :key="s" variant="outline">{{ s }}</Badge>
          </div>
        </div>
      </div>
    </section>

    <section class="pb-24">
      <div
        v-reveal
        class="rounded-lg border border-border p-6 transition-colors hover:border-foreground/40 hover:bg-foreground/[0.02]"
      >
        <h3
          class="text-sm font-semibold tracking-wide text-muted-foreground uppercase ar:normal-case"
        >
          {{ t('about.education') }}
        </h3>
        <p class="mt-3 text-base font-semibold text-foreground">
          {{ t('about.education_degree') }}
        </p>
        <p class="mt-0.5 text-sm text-muted-foreground">{{ t('about.education_meta') }}</p>
        <p class="mt-3 text-sm text-foreground/90">{{ t('about.education_blurb') }}</p>
        <p class="mt-4 text-sm text-muted-foreground">
          <span class="font-medium text-foreground">{{ t('about.languages_label') }}:</span>
          {{ t('about.languages_value') }}
        </p>

        <div class="mt-6">
          <Button as="a" :href="localePath('/contact')" variant="primary">
            {{ t('common.get_in_touch') }}
            <Icon name="lucide:arrow-right" class="rtl-flip" />
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>
