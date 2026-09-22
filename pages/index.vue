<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Motion } from 'motion-v';

useSiteSeo({
  title: 'Ali Khalil — Senior Frontend Developer & Team Lead',
  description:
    'Senior Frontend Developer & Team Lead specializing in Vue, Nuxt, and TypeScript. Six years shipping real-time, multi-tenant SaaS across the Saudi and Egyptian markets.',
});

const config = useRuntimeConfig();
const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '');

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Ali Khalil',
        url: siteUrl,
        jobTitle: 'Senior Frontend Developer & Team Lead',
        image: `${siteUrl}/og-image.png`,
        sameAs: [
          'https://www.linkedin.com/in/alikhalilll',
          'https://github.com/alikhalilll',
          'https://www.npmjs.com/~alikhalilll',
        ],
      }),
    },
  ],
});

const { featured } = useProjects();
const { t } = useI18n();
const localePath = useLocalePath();
const tmArray = useTmArray();

const strengths = computed(() => tmArray('home.strengths'));

const sections = computed(() => [
  {
    title: t('nav.about'),
    to: localePath('/about'),
    blurb: t('home.explore_sections.about_blurb'),
  },
  {
    title: t('nav.projects'),
    to: localePath('/projects'),
    blurb: t('home.explore_sections.projects_blurb'),
  },
  {
    title: t('nav.writing'),
    to: localePath('/blog'),
    blurb: t('home.explore_sections.writing_blurb'),
  },
  {
    title: t('nav.contact'),
    to: localePath('/contact'),
    blurb: t('home.explore_sections.contact_blurb'),
  },
]);
</script>

<template>
  <div>
    <Hero
      :eyebrow="t('home.eyebrow')"
      :title="t('home.title')"
      :subtitle="t('home.subtitle')"
      :show-chrome="true"
      :available="true"
      :status-label="t('hero.status.available')"
    >
      <div
        class="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
      >
        <span class="inline-flex items-center gap-1.5">
          <Icon name="lucide:map-pin" class="size-3.5" />
          {{ t('home.location') }}
        </span>
        <span class="opacity-40">·</span>
        <span class="inline-flex items-center gap-1.5">
          <Icon name="lucide:plane" class="size-3.5" />
          {{ t('home.relocate') }}
        </span>
        <span class="opacity-40">·</span>
        <span class="inline-flex items-center gap-1.5">
          <Icon name="lucide:award" class="size-3.5" />
          {{ t('home.award') }}
        </span>
      </div>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <Button as="a" :href="localePath('/projects')" variant="primary">
          {{ t('home.see_work') }}
          <Icon name="lucide:arrow-right" class="rtl-flip" />
        </Button>
        <Button as="a" :href="localePath('/contact')" variant="outline">
          {{ t('common.get_in_touch') }}
        </Button>
      </div>
    </Hero>

    <LandingHeroMarquee />

    <section class="py-16">
      <h2
        class="text-sm font-semibold tracking-wide text-muted-foreground uppercase ar:normal-case"
      >
        {{ t('common.explore') }}
      </h2>
      <ul class="mt-5 grid gap-2 sm:grid-cols-2">
        <Motion
          v-for="(s, i) in sections"
          :key="s.to"
          as="li"
          :initial="{ y: 10, opacity: 0 }"
          :while-in-view="{ y: 0, opacity: 1 }"
          :in-view-options="{ once: true, amount: 0.3 }"
          :transition="{ duration: 0.4, delay: 0.08 * i }"
        >
          <NuxtLink
            :to="s.to"
            class="group flex items-baseline justify-between gap-4 rounded-lg border border-border p-4 no-underline transition-colors hover:border-foreground/40 hover:bg-foreground/[0.02]"
          >
            <span class="flex-1">
              <span class="block font-medium text-foreground">{{ s.title }}</span>
              <span class="mt-1 block text-sm text-muted-foreground">{{ s.blurb }}</span>
            </span>
            <Icon
              name="lucide:arrow-right"
              class="rtl-flip size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground rtl:group-hover:-translate-x-0.5"
            />
          </NuxtLink>
        </Motion>
      </ul>
    </section>

    <LandingAboutWorkGrid />

    <section class="py-16">
      <div class="flex items-baseline justify-between gap-4">
        <h2 class="text-xl font-medium sm:text-2xl">{{ t('home.selected_work') }}</h2>
        <NuxtLink
          :to="localePath('/projects')"
          class="text-sm text-muted-foreground no-underline hover:text-foreground"
        >
          {{ t('common.all_projects') }} →
        </NuxtLink>
      </div>

      <div class="mt-6 flex flex-col gap-6">
        <Motion
          v-for="(project, i) in featured"
          :key="project.title"
          :initial="{ y: 20, opacity: 0 }"
          :while-in-view="{ y: 0, opacity: 1 }"
          :in-view-options="{ once: true, amount: 0.2 }"
          :transition="{ duration: 0.5, delay: 0.12 * i }"
        >
          <ProjectCard
            :title="project.title"
            :description="project.description"
            :tags="project.tags"
            :href="project.href"
            :repo="project.repo"
            :year="project.year"
            :icon="project.icon"
            :horizontal="true"
            :reverse="i % 2 === 1"
          />
        </Motion>
      </div>
    </section>

    <section class="py-16">
      <h2 class="text-xl font-medium sm:text-2xl">{{ t('home.what_i_do_well') }}</h2>
      <ul class="mt-5 space-y-3 text-foreground/90">
        <Motion
          v-for="(s, i) in strengths"
          :key="i"
          as="li"
          :initial="{ y: 10, opacity: 0 }"
          :while-in-view="{ y: 0, opacity: 1 }"
          :in-view-options="{ once: true, amount: 0.3 }"
          :transition="{ duration: 0.4, delay: 0.08 * i }"
          class="flex items-start gap-3"
        >
          <span class="mt-[0.6rem] size-1 shrink-0 rounded-full bg-foreground/40" />
          <span>{{ s }}</span>
        </Motion>
      </ul>
    </section>

    <LandingTestimonials />

    <LandingFAQ />

    <section class="py-16">
      <div
        class="rounded-lg border border-border p-6 transition-colors hover:border-foreground/40 hover:bg-foreground/[0.02]"
      >
        <h3 class="text-lg font-semibold">{{ t('home.cta.title') }}</h3>
        <p class="mt-2 text-sm text-muted-foreground">{{ t('home.cta.body') }}</p>
        <Button as="a" :href="localePath('/contact')" variant="primary" class="mt-5">
          {{ t('common.get_in_touch') }}
          <Icon name="lucide:arrow-right" class="rtl-flip" />
        </Button>
      </div>
    </section>
  </div>
</template>
