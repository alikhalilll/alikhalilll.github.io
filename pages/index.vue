<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

useHead({
  title: 'Ali Khalil — Senior Frontend Developer & Team Lead',
});

const { featured } = useProjects();

const sections = [
  {
    icon: 'lucide:user-round',
    title: 'Me',
    to: '/about',
    blurb: 'A little about who I am and how I work.',
  },
  {
    icon: 'lucide:hammer',
    title: 'Projects',
    to: '/projects',
    blurb: 'Products I have shipped and tools I have built.',
  },
  {
    icon: 'lucide:book-open',
    title: 'Writing',
    to: '/blog',
    blurb: 'Notes on frontend craft and team leadership.',
  },
  {
    icon: 'lucide:mail',
    title: 'Contact',
    to: '/contact',
    blurb: 'Say hello — I read everything.',
  },
];
</script>

<template>
  <div>
    <Hero
      eyebrow="Hi, I'm Ali."
      title="Senior Frontend Developer & Team Lead."
      subtitle="I build scalable, high-performance web apps with Vue, Nuxt, and TypeScript — and lead the teams that ship them. Five years in, most of my recent work has been on real-time, multi-tenant SaaS in the Saudi and Egyptian markets."
    >
      <div class="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span class="inline-flex items-center gap-1.5">
          <Icon name="lucide:map-pin" class="size-4 text-primary" />
          Mansoura, Egypt
        </span>
        <span class="opacity-50">·</span>
        <span class="inline-flex items-center gap-1.5">
          <Icon name="lucide:plane" class="size-4 text-primary" />
          Ready to relocate to Riyadh
        </span>
        <span class="opacity-50">·</span>
        <span class="inline-flex items-center gap-1.5">
          <Icon name="lucide:award" class="size-4 text-primary" />
          2× Employee of the Month
        </span>
      </div>

      <div class="mt-10 flex flex-wrap gap-3">
        <Button as="a" href="/projects" variant="primary">
          <Icon name="lucide:arrow-right" />
          See my work
        </Button>
        <Button as="a" href="/about" variant="outline"> About me </Button>
        <Button as="a" href="/contact" variant="ghost"> Get in touch </Button>
      </div>
    </Hero>

    <section class="prose-container pb-16">
      <h2 class="flex items-center gap-3 text-2xl sm:text-3xl">
        <Icon name="lucide:compass" class="size-6 text-primary" />
        Where to go from here
      </h2>
      <ul class="mt-6 grid gap-3 sm:grid-cols-2">
        <li v-for="s in sections" :key="s.to">
          <NuxtLink
            :to="s.to"
            class="group flex items-start gap-4 rounded-lg border border-border p-4 no-underline transition-colors hover:border-foreground"
          >
            <span
              class="mt-0.5 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"
            >
              <Icon :name="s.icon" class="size-5" />
            </span>
            <span class="flex-1">
              <span class="block font-serif text-lg font-semibold text-foreground">
                {{ s.title }}
              </span>
              <span class="mt-0.5 block text-sm text-muted-foreground">{{ s.blurb }}</span>
            </span>
            <Icon
              name="lucide:arrow-right"
              class="mt-3 size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
            />
          </NuxtLink>
        </li>
      </ul>
    </section>

    <Separator class="mx-auto max-w-md" />

    <section class="prose-container py-16">
      <div class="flex items-end justify-between gap-4">
        <h2 class="flex items-center gap-3 text-2xl sm:text-3xl">
          <Icon name="lucide:sparkles" class="size-6 text-primary" />
          Selected work
        </h2>
        <NuxtLink
          to="/projects"
          class="hidden text-sm font-medium text-muted-foreground no-underline hover:text-foreground sm:inline"
        >
          All projects →
        </NuxtLink>
      </div>
      <p class="mt-3 text-muted-foreground">
        Real-time SaaS, AI-powered platforms, and open-source modules.
      </p>

      <div class="mt-8 grid gap-5">
        <ProjectCard
          v-for="project in featured"
          :key="project.title"
          :title="project.title"
          :description="project.description"
          :tags="project.tags"
          :href="project.href"
          :repo="project.repo"
          :year="project.year"
          :icon="project.icon"
        />
      </div>
    </section>

    <Separator class="mx-auto max-w-md" />

    <section class="prose-container py-16">
      <h2 class="flex items-center gap-3 text-2xl sm:text-3xl">
        <Icon name="lucide:trending-up" class="size-6 text-primary" />
        What I do well
      </h2>
      <ul class="mt-6 space-y-4 text-foreground/90">
        <li class="flex items-start gap-3">
          <Icon name="lucide:gauge" class="mt-1 size-5 shrink-0 text-primary" />
          <span
            >Performance work that shows up in the numbers — recent role lifted LCP by ~40% and cut
            CLS by ~60% through lazy hydration and code-splitting.</span
          >
        </li>
        <li class="flex items-start gap-3">
          <Icon name="lucide:users" class="mt-1 size-5 shrink-0 text-primary" />
          <span
            >Leading small frontend teams: code review, mentorship, and setting the bar for
            accessibility and DX.</span
          >
        </li>
        <li class="flex items-start gap-3">
          <Icon name="lucide:radio" class="mt-1 size-5 shrink-0 text-primary" />
          <span
            >Real-time systems on Pusher / WebSockets — registry-based event layers, multi-tab
            presence, message deduplication.</span
          >
        </li>
        <li class="flex items-start gap-3">
          <Icon name="lucide:shield-check" class="mt-1 size-5 shrink-0 text-primary" />
          <span
            >Client-side security: AES-GCM + PBKDF2 for local data, Apple Pay / Google Pay / Moyasar
            integrations.</span
          >
        </li>
      </ul>

      <div class="mt-10 flex flex-wrap gap-2">
        <Badge variant="outline">Vue 2 / 3</Badge>
        <Badge variant="outline">Nuxt 3 / 4</Badge>
        <Badge variant="outline">TypeScript</Badge>
        <Badge variant="outline">Pinia</Badge>
        <Badge variant="outline">Tailwind</Badge>
        <Badge variant="outline">ShadCN</Badge>
        <Badge variant="outline">UnoCSS</Badge>
        <Badge variant="outline">Pusher</Badge>
        <Badge variant="outline">Node.js</Badge>
        <Badge variant="outline">Docker</Badge>
      </div>
    </section>

    <section class="prose-container pb-24">
      <div class="rounded-xl border border-border bg-card p-6 sm:p-8">
        <h3 class="flex items-center gap-3 text-xl sm:text-2xl">
          <Icon name="lucide:hand" class="size-5 text-primary" />
          Working on something interesting?
        </h3>
        <p class="mt-3 text-muted-foreground">
          Roles, collaborations, or tricky frontend problems — I'd love to hear about it.
        </p>
        <Button as="a" href="/contact" variant="primary" class="mt-5">
          Get in touch
          <Icon name="lucide:arrow-right" />
        </Button>
      </div>
    </section>
  </div>
</template>
