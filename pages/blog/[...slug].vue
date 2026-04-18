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

const postLang = computed(() => post.value?.lang ?? 'en');
const postDir = computed(() => (postLang.value.toLowerCase().startsWith('ar') ? 'rtl' : 'ltr'));

const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '');
const url = `${siteUrl}${route.path}`;
const title = post.value?.title ?? '';
const description = post.value?.description ?? '';
const ogImage = `${siteUrl}/og.svg`;

useSiteSeo({
  title,
  description,
  ogType: 'article',
});

useSeoMeta({
  articleAuthor: [config.public.siteName as string],
  articlePublishedTime: post.value?.date,
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
        datePublished: post.value?.date,
        author: {
          '@type': 'Person',
          name: config.public.siteName,
          url: siteUrl,
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        image: ogImage,
      }),
    },
  ],
});
</script>

<template>
  <article class="py-16 sm:py-24">
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

        <header :dir="postDir" :lang="postLang" class="mb-10 border-b border-border pb-8">
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

        <BlogTocMobile :links="tocLinks" />

        <ContentRenderer
          v-if="post"
          :value="post"
          :dir="postDir"
          :lang="postLang"
          class="post-body"
        />
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
