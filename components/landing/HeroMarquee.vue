<script setup lang="ts">
import { Motion } from 'motion-v';

const { t } = useI18n();
const { formatDate, formatYear } = useLocalizedDate();
const localePath = useLocalePath();
const { work, openSource } = useProjects();

const { data: posts } = await useAsyncData('highlights-posts', () =>
  queryCollection('blog').order('date', 'DESC').limit(3).all()
);

type Kind = 'article' | 'project' | 'opensource';
interface Highlight {
  kind: Kind;
  title: string;
  description: string;
  date?: string;
  year?: string;
  href: string;
  external?: boolean;
  icon: string;
}

// Kind differentiation reuses the site's own brand triad tokens
// (--brand-1 / --brand-2 / --brand-3 defined in main.css). The rest of the
// card stays on the neutral foreground/muted/border scale so it reads as
// part of the same restrained design language as ProjectCard, the CTA cards,
// and the Explore grid.
const kindMeta: Record<Kind, { icon: string; key: string; accentVar: string }> = {
  article: {
    icon: 'lucide:pen-line',
    key: 'article',
    accentVar: 'var(--brand-1)',
  },
  project: {
    icon: 'lucide:briefcase-business',
    key: 'project',
    accentVar: 'var(--brand-3)',
  },
  opensource: {
    icon: 'lucide:package',
    key: 'opensource',
    accentVar: 'var(--brand-2)',
  },
};

const labelFor = (kind: Kind) => t(`home.highlights.${kindMeta[kind].key}`);

const items = computed<Highlight[]>(() => {
  const list: Highlight[] = [];

  posts.value?.slice(0, 3).forEach((p) => {
    list.push({
      kind: 'article',
      title: p.title,
      description: p.description ?? '',
      date: p.date,
      href: localePath(p.path),
      icon: kindMeta.article.icon,
    });
  });

  work
    .filter((w) => w.featured)
    .slice(0, 2)
    .forEach((w) => {
      list.push({
        kind: 'project',
        title: w.title,
        description: w.description,
        year: w.year,
        href: w.href ?? w.repo ?? localePath('/projects'),
        external: Boolean(w.href ?? w.repo),
        icon: w.icon ?? kindMeta.project.icon,
      });
    });

  openSource
    .filter((o) => o.featured)
    .slice(0, 2)
    .forEach((o) => {
      list.push({
        kind: 'opensource',
        title: o.title,
        description: o.description,
        year: o.year,
        href: o.href ?? o.repo ?? localePath('/projects'),
        external: Boolean(o.href ?? o.repo),
        icon: o.icon ?? kindMeta.opensource.icon,
      });
    });

  return list;
});

const dateLabel = (item: Highlight) => {
  if (item.date) return formatDate(item.date, { year: 'numeric', month: 'short' });
  if (item.year) return formatYear(item.year);
  return '';
};

const accentFor = (kind: Kind) => kindMeta[kind].accentVar;
</script>

<template>
  <section v-if="items.length" class="mt-8 sm:mt-14">
    <div class="mb-8 flex items-baseline justify-between gap-4">
      <h2 class="text-xl font-medium text-foreground sm:text-2xl">
        {{ t('home.highlights.title') }}
      </h2>
      <p class="hidden text-sm text-muted-foreground sm:block">
        {{ t('home.highlights.subtitle') }}
      </p>
    </div>

    <ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Motion
        v-for="(item, i) in items"
        :key="item.href + i"
        as="li"
        :initial="{ y: 10, opacity: 0 }"
        :while-in-view="{ y: 0, opacity: 1 }"
        :in-view-options="{ once: true, amount: 0.2 }"
        :transition="{ duration: 0.4, delay: 0.05 * i }"
      >
        <NuxtLink
          v-if="!item.external"
          :to="item.href"
          class="group flex h-full flex-col rounded-lg border border-border bg-card p-6 no-underline transition-colors duration-200 hover:border-foreground/40"
        >
          <div class="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span
              class="inline-flex items-center gap-1.5 uppercase ar:normal-case ar:tracking-normal"
              style="letter-spacing: 0.08em"
            >
              <span
                class="inline-block size-1.5 rounded-full"
                :style="{ background: accentFor(item.kind) }"
                aria-hidden="true"
              />
              {{ labelFor(item.kind) }}
            </span>
            <span v-if="dateLabel(item)" class="font-mono whitespace-nowrap ar:font-sans">
              {{ dateLabel(item) }}
            </span>
          </div>

          <h3
            class="mt-6 text-base leading-snug font-semibold text-foreground text-balance sm:text-lg"
          >
            <bdi>{{ item.title }}</bdi>
          </h3>

          <p
            v-if="item.description"
            class="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground"
          >
            {{ item.description }}
          </p>

          <div class="mt-6 flex items-center text-sm font-medium text-foreground">
            <span>{{ t('home.highlights.explore') }}</span>
            <Icon
              name="lucide:arrow-right"
              class="rtl-flip ms-1.5 size-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
            />
          </div>
        </NuxtLink>

        <a
          v-else
          :href="item.href"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex h-full flex-col rounded-lg border border-border bg-card p-6 no-underline transition-colors duration-200 hover:border-foreground/40"
        >
          <div class="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span
              class="inline-flex items-center gap-1.5 uppercase ar:normal-case ar:tracking-normal"
              style="letter-spacing: 0.08em"
            >
              <span
                class="inline-block size-1.5 rounded-full"
                :style="{ background: accentFor(item.kind) }"
                aria-hidden="true"
              />
              {{ labelFor(item.kind) }}
            </span>
            <span v-if="dateLabel(item)" class="font-mono whitespace-nowrap ar:font-sans">
              {{ dateLabel(item) }}
            </span>
          </div>

          <h3
            class="mt-6 text-base leading-snug font-semibold text-foreground text-balance sm:text-lg"
          >
            <bdi>{{ item.title }}</bdi>
          </h3>

          <p
            v-if="item.description"
            class="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground"
          >
            {{ item.description }}
          </p>

          <div class="mt-6 flex items-center text-sm font-medium text-foreground">
            <span>{{ t('home.highlights.explore') }}</span>
            <Icon
              name="lucide:arrow-up-right"
              class="rtl-flip ms-1.5 size-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
            />
          </div>
        </a>
      </Motion>
    </ul>
  </section>
</template>
