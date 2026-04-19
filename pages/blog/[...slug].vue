<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const { t, locales } = useI18n();
const localePath = useLocalePath();
const { formatDate } = useLocalizedDate();

// Posts only exist under /blog/<slug> on disk, but the URL may carry a locale
// prefix (e.g. /ar-eg/blog/<slug>). Strip it so the lookup hits the same file
// regardless of which locale the visitor is viewing the article from.
const lookupPath = computed(() => {
  const codes = locales.value.map((l) => (typeof l === 'string' ? l : l.code));
  for (const code of codes) {
    if (route.path === `/${code}`) return '/';
    if (route.path.startsWith(`/${code}/`)) return route.path.slice(code.length + 1);
  }
  return route.path;
});

const { data: post } = await useAsyncData(`blog-${lookupPath.value}`, () =>
  queryCollection('blog').path(lookupPath.value).first()
);

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true });
}

const tocLinks = computed(() => post.value?.body?.toc?.links ?? []);

const slug = computed(() => {
  const path = post.value?.path ?? lookupPath.value;
  return path.replace(/^\/blog\//, '').replace(/\/$/, '');
});

// Text-bearing block tags — must match the generator's SKIP rules.
// SKIP on generator side: code (→ <pre>), table, hr, image-only paragraph.
const AUDIO_BLOCK_TAGS = new Set([
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'UL',
  'OL',
  'BLOCKQUOTE',
]);
const postBody = useTemplateRef<{ $el?: HTMLElement } | HTMLElement>('postBody');
const activeIndex = ref<number | null>(null);

function contentRoot(): HTMLElement | null {
  const raw = postBody.value as unknown;
  if (!raw) return null;
  if (raw instanceof HTMLElement) return raw;
  const el = (raw as { $el?: HTMLElement }).$el;
  return el ?? null;
}

function textBlocks(): HTMLElement[] {
  const root = contentRoot();
  if (!root) return [];
  const out: HTMLElement[] = [];
  for (const el of Array.from(root.children) as HTMLElement[]) {
    if (!AUDIO_BLOCK_TAGS.has(el.tagName)) continue;
    if (el.tagName === 'P' && !el.textContent?.trim()) continue;
    out.push(el);
  }
  return out;
}

function labelBlocks() {
  const blocks = textBlocks();
  blocks.forEach((el, i) => {
    el.setAttribute('data-audio-index', String(i));
  });
}

watch(activeIndex, (next, prev) => {
  const root = contentRoot();
  if (!root) return;
  if (prev !== null && prev !== undefined) {
    root
      .querySelector<HTMLElement>(`[data-audio-index="${prev}"]`)
      ?.classList.remove('audio-active');
  }
  if (next !== null && next !== undefined) {
    const el = root.querySelector<HTMLElement>(`[data-audio-index="${next}"]`);
    if (el) {
      el.classList.add('audio-active');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});

onMounted(() => {
  nextTick(() => labelBlocks());
});

const postLang = computed(() => post.value?.lang ?? 'en');
const postDir = computed(() => (postLang.value.toLowerCase().startsWith('ar') ? 'rtl' : 'ltr'));

const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '');
const url = `${siteUrl}${route.path}`;
const title = post.value?.title ?? '';
const description = post.value?.description ?? '';
const keywords = post.value?.keywords ?? [];
const publishedAt = post.value?.date;
const modifiedAt = post.value?.updatedAt ?? post.value?.date;
const ogImage = post.value?.image ? `${siteUrl}${post.value.image}` : `${siteUrl}/og-image.png`;
const inLanguage = post.value?.lang ?? 'en';

useSiteSeo({
  title,
  description,
  ogType: 'article',
  image: post.value?.image,
});

useSeoMeta({
  articleAuthor: [config.public.siteName as string],
  articlePublishedTime: publishedAt,
  articleModifiedTime: modifiedAt,
  articleTag: keywords.length ? keywords : undefined,
  keywords: keywords.length ? keywords.join(', ') : undefined,
});

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        datePublished: publishedAt,
        dateModified: modifiedAt,
        author: {
          '@type': 'Person',
          name: config.public.siteName,
          url: siteUrl,
        },
        publisher: {
          '@type': 'Person',
          name: config.public.siteName,
          url: siteUrl,
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        image: ogImage,
        url,
        inLanguage,
        ...(keywords.length ? { keywords: keywords.join(', ') } : {}),
      }),
    },
  ],
});
</script>

<template>
  <article :dir="postDir" :lang="postLang" class="py-16 sm:py-24">
    <div
      class="mx-auto grid max-w-[80rem] gap-12 px-6 xl:grid-cols-[minmax(0,42rem)_minmax(0,18rem)] xl:justify-center xl:gap-16"
    >
      <div class="min-w-0">
        <NuxtLink
          :to="localePath('/blog')"
          class="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground no-underline hover:text-foreground"
        >
          <Icon name="lucide:arrow-left" class="rtl-flip size-4" /> {{ t('common.all_writing') }}
        </NuxtLink>

        <header class="mb-10 border-b border-border pb-8">
          <time
            v-if="post?.date"
            class="mb-3 block font-mono text-xs tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-base ar:font-bold ar:tracking-normal ar:normal-case"
            :datetime="post.date"
            dir="ltr"
          >
            {{ formatDate(post.date) }}
          </time>
          <h1 class="text-3xl leading-tight sm:text-4xl">{{ post?.title }}</h1>
          <p v-if="post?.description" class="mt-4 text-base text-muted-foreground sm:text-lg">
            {{ post.description }}
          </p>
        </header>

        <ClientOnly>
          <ArticleAudio :slug="slug" @update:active-index="activeIndex = $event" />
        </ClientOnly>

        <BlogTocMobile :links="tocLinks" />

        <ContentRenderer v-if="post" ref="postBody" :value="post" class="post-body pb-20" />
      </div>

      <BlogToc :links="tocLinks" />
    </div>
  </article>
</template>

<style>
.post-body {
  font-size: 1.05rem;
  line-height: 1.75;
  color: color-mix(in oklab, var(--foreground) 90%, transparent);
}

.post-body > * + * {
  margin-top: 1.25rem;
}

.post-body h2 {
  margin-top: 2.5rem;
  font-size: 1.75rem;
  color: var(--foreground);
  scroll-margin-top: 6rem;
}

.post-body [data-audio-index] {
  scroll-margin-top: 6rem;
  border-radius: 0.5rem;
  transition: background-color 250ms ease;
}

.post-body .audio-active {
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  box-shadow:
    -0.75rem 0 0 color-mix(in oklab, var(--primary) 14%, transparent),
    0.75rem 0 0 color-mix(in oklab, var(--primary) 14%, transparent);
}

.post-body h3 {
  margin-top: 2rem;
  font-size: 1.35rem;
  color: var(--foreground);
  scroll-margin-top: 6rem;
}

.post-body a {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.post-body :not(pre) > code {
  background: var(--accent);
  color: var(--accent-foreground);
  padding: 0.1rem 0.4rem;
  border-radius: 0.35rem;
  font-size: 0.9em;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}

.post-body pre {
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  overflow-x: auto;
  font-size: 0.88rem;
  line-height: 1.6;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}

/* Shiki multi-theme: inline styles set the light theme; variables the dark one.
   Swap both on .dark so the code block actually matches the site theme. */
.dark .post-body .shiki,
.dark .post-body .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}

.post-body pre code {
  display: block;
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
}

.post-body blockquote {
  border-left: 3px solid var(--primary);
  padding-left: 1.25rem;
  color: var(--muted-foreground);
  font-style: italic;
}

.post-body table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.post-body th,
.post-body td {
  border: 1px solid var(--border);
  padding: 0.6rem 0.8rem;
  text-align: left;
}

.post-body th {
  background: var(--accent);
  font-weight: 600;
  color: var(--accent-foreground);
}
</style>
