<script setup lang="ts">
const { t, locale } = useI18n();
const { formatDate, formatYear } = useLocalizedDate();
const localePath = useLocalePath();

const isArabicLocaleInitial = locale.value.toLowerCase().startsWith('ar');
const initialCollection = isArabicLocaleInitial ? 'writesAr' : 'writes';

type PostRow = { title?: string; description?: string; lang?: string; path?: string };
const localizedTitle = (p: PostRow) => p.title || '';
const localizedDescription = (p: PostRow) => p.description || '';
const localizedLang = (p: PostRow) => p.lang ?? 'en';
const localizedDir = (p: PostRow) =>
  localizedLang(p).toLowerCase().startsWith('ar') ? 'rtl' : 'ltr';
// External URL is always /writes/<slug> regardless of which collection served it
const externalPath = (p: PostRow) => (p.path ?? '').replace(/^\/writes-ar\//, '/writes/');

useSiteSeo({
  title: t('meta.blog.title'),
  description: t('meta.blog.description'),
});

const { data: posts } = await useAsyncData(`${initialCollection}-list`, () =>
  queryCollection(initialCollection).order('date', 'DESC').all()
);

type AstNode = { type?: string; value?: string; children?: AstNode[] };
function collectText(node: AstNode | undefined): string {
  if (!node) return '';
  if (node.type === 'text' && typeof node.value === 'string') return node.value;
  if (node.children?.length) return node.children.map(collectText).join(' ');
  return '';
}
function readingTime(body: unknown): number {
  const text = collectText(body as AstNode | undefined);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

// Group posts by publication year (stable Latin-digit key for grouping);
// the display year is localized separately via formatYear.
const UNDATED = '__undated__';
const yearGroups = computed(() => {
  const groups = new Map<string, typeof posts.value>();
  for (const p of posts.value ?? []) {
    const y = p.date ? new Date(p.date).getFullYear().toString() : UNDATED;
    if (!groups.has(y)) groups.set(y, []);
    groups.get(y)!.push(p);
  }
  return Array.from(groups.entries());
});

const yearLabel = (key: string) => (key === UNDATED ? t('blog.undated') : formatYear(key));
</script>

<template>
  <div>
    <Hero
      :eyebrow="t('writing.eyebrow')"
      :title="t('writing.title')"
      :subtitle="t('writing.subtitle')"
    />

    <section class="pb-24">
      <div v-if="posts && posts.length" class="flex flex-col gap-14 sm:gap-16">
        <div v-for="([year, group], gi) in yearGroups" :key="year" v-reveal="gi * 100">
          <div class="mb-6 flex items-baseline gap-4">
            <h2
              class="font-serif text-4xl leading-none font-semibold tracking-tight text-foreground sm:text-5xl"
            >
              {{ yearLabel(year) }}
            </h2>
            <span
              class="font-mono text-[11px] tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
            >
              {{ t('blog.entries_count', { n: group?.length ?? 0 }, group?.length ?? 0) }}
            </span>
            <span aria-hidden="true" class="h-px flex-1 self-center bg-border" />
          </div>

          <ul class="flex flex-col divide-y divide-border">
            <li v-for="post in group" :key="post.path">
              <NuxtLink
                :to="localePath(externalPath(post))"
                class="group/post grid gap-2 py-6 no-underline sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline sm:gap-8"
              >
                <div
                  class="flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case sm:justify-start"
                >
                  <time v-if="post.date" :datetime="post.date">
                    {{ formatDate(post.date, { month: 'short', day: '2-digit' }) }}
                  </time>
                  <span aria-hidden="true" class="size-0.5 rounded-full bg-muted-foreground/60" />
                  <span>
                    {{ t('blog.min_read', { n: readingTime(post.body) }, readingTime(post.body)) }}
                  </span>
                </div>

                <div class="min-w-0">
                  <h3
                    :lang="localizedLang(post)"
                    :dir="localizedDir(post)"
                    class="font-serif text-xl leading-[1.2] font-semibold tracking-tight text-balance text-foreground transition-colors group-hover/post:text-primary sm:text-2xl md:text-[1.65rem]"
                  >
                    {{ localizedTitle(post) }}
                  </h3>
                  <p
                    v-if="localizedDescription(post)"
                    :lang="localizedLang(post)"
                    :dir="localizedDir(post)"
                    class="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:text-base"
                  >
                    {{ localizedDescription(post) }}
                  </p>
                  <span
                    class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors group-hover/post:text-primary"
                  >
                    {{ t('home.blog_previews.read_more') }}
                    <Icon
                      name="lucide:arrow-right"
                      class="rtl-flip size-3 transition-transform group-hover/post:translate-x-1 rtl:group-hover/post:-translate-x-1"
                    />
                  </span>
                </div>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div v-else class="py-16 text-center text-muted-foreground">
        <p>{{ t('writing.empty') }}</p>
      </div>
    </section>
  </div>
</template>
