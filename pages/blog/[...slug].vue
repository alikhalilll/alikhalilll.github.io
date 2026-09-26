<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const { t, locales } = useI18n();
const localePath = useLocalePath();
const { formatDate } = useLocalizedDate();

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

// Inject a "#" permalink into every heading that has an id, so hovering
// reveals a shareable anchor — the standard docs pattern.
function decorateHeadings() {
  const root = contentRoot();
  if (!root) return;
  const headings = root.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]');
  headings.forEach((h) => {
    if (h.querySelector('.heading-anchor')) return;
    const a = document.createElement('a');
    a.className = 'heading-anchor';
    a.setAttribute('href', `#${h.id}`);
    a.setAttribute('aria-label', `Link to ${h.textContent?.trim() ?? 'section'}`);
    a.textContent = '#';
    h.appendChild(a);
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
  nextTick(() => {
    labelBlocks();
    decorateHeadings();
  });
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
  <article :dir="postDir" :lang="postLang" class="py-8 sm:py-12">
    <!-- Docs-style layout: single grid with a reading column and a right rail
         TOC that appears on lg+. Content is centered in a comfortable ~68ch
         column, sidebar is a compact 14rem rail. -->
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-14">
      <div class="min-w-0">
        <NuxtLink
          :to="localePath('/blog')"
          class="mb-8 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
        >
          <Icon name="lucide:chevron-left" class="rtl-flip size-3.5" />
          {{ t('common.all_writing') }}
        </NuxtLink>

        <header class="mx-auto max-w-[68ch]">
          <h1
            class="text-3xl leading-[1.15] font-semibold tracking-tight text-balance sm:text-4xl md:text-[2.75rem]"
          >
            {{ post?.title }}
          </h1>

          <p
            v-if="post?.description"
            class="mt-4 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg"
          >
            {{ post.description }}
          </p>

          <div
            class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] text-muted-foreground ar:font-sans ar:text-xs"
          >
            <time v-if="post?.date" :datetime="post.date" dir="ltr">
              {{ formatDate(post.date, { year: 'numeric', month: 'short', day: 'numeric' }) }}
            </time>
            <span
              v-if="post?.updatedAt && post.updatedAt !== post.date"
              class="inline-flex items-center gap-1.5"
            >
              <span aria-hidden="true" class="size-0.5 rounded-full bg-muted-foreground/60" />
              <span
                >Updated
                {{
                  formatDate(post.updatedAt, { year: 'numeric', month: 'short', day: 'numeric' })
                }}</span
              >
            </span>
            <template v-if="post?.keywords?.length">
              <span aria-hidden="true" class="size-0.5 rounded-full bg-muted-foreground/60" />
              <ul class="flex flex-wrap items-center gap-1.5">
                <li
                  v-for="k in post.keywords.slice(0, 4)"
                  :key="k"
                  class="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] font-medium ar:text-[11px]"
                >
                  {{ k }}
                </li>
              </ul>
            </template>
          </div>
        </header>

        <!-- Cover image: on desktop, breaks out of the reading column into the
             full content grid width so the screenshot has room to breathe.
             On mobile it stays inline with the reading rail. -->
        <div
          v-if="post?.image"
          class="mx-auto mt-10 max-w-[68ch] overflow-hidden rounded-xl bg-muted ring-1 ring-border sm:mt-12 lg:mx-0 lg:max-w-none"
        >
          <img
            :src="post.image"
            :alt="post.title"
            class="aspect-[16/9] size-full object-cover"
            width="1280"
            height="720"
            fetchpriority="high"
          />
        </div>

        <div class="mx-auto mt-10 max-w-[68ch] sm:mt-12">
          <ClientOnly>
            <ArticleAudio :slug="slug" @update:active-index="activeIndex = $event" />
          </ClientOnly>

          <BlogTocMobile :links="tocLinks" />

          <ContentRenderer v-if="post" ref="postBody" :value="post" class="post-body" />

          <footer class="mt-16 border-t border-border pt-8">
            <div class="flex items-center gap-4">
              <img
                src="/avatar.jpg"
                alt="Ali Khalil"
                width="96"
                height="96"
                loading="lazy"
                class="size-10 shrink-0 rounded-full object-cover"
              />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-foreground leading-tight">Ali Khalil</p>
                <p class="mt-0.5 text-xs text-muted-foreground leading-tight">
                  {{ t('meta.home.job_title') }}
                </p>
              </div>
              <div class="flex gap-0.5">
                <a
                  v-for="s in [
                    {
                      href: 'https://github.com/alikhalilll',
                      icon: 'lucide:github',
                      label: 'GitHub',
                    },
                    {
                      href: 'https://www.linkedin.com/in/alikhalilll',
                      icon: 'lucide:linkedin',
                      label: 'LinkedIn',
                    },
                    {
                      href: 'mailto:alikhalilll.dev@gmail.com',
                      icon: 'lucide:mail',
                      label: 'Email',
                    },
                  ]"
                  :key="s.href"
                  :href="s.href"
                  target="_blank"
                  rel="noopener"
                  :aria-label="s.label"
                  class="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Icon :name="s.icon" class="size-4" />
                </a>
              </div>
            </div>

            <NuxtLink
              :to="localePath('/blog')"
              class="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground no-underline transition-colors hover:text-primary"
            >
              <Icon name="lucide:arrow-left" class="rtl-flip size-4" />
              {{ t('common.all_writing') }}
            </NuxtLink>
          </footer>
        </div>
      </div>

      <BlogToc :links="tocLinks" />
    </div>
  </article>
</template>

<style>
/* Post body — modern documentation aesthetic. Comfortable reading column,
   generous line height, subtle color mix so long-form text is easy on the
   eye. Everything hits the 68ch reading rail unless it explicitly breaks
   out. */
.post-body {
  font-size: 1rem;
  line-height: 1.75;
  color: color-mix(in oklab, var(--foreground) 86%, transparent);
}

.post-body > * + * {
  margin-top: 1.25rem;
}

/* Section headings — tighter tracking, hover-revealed anchor.
   The anchor sits outside the reading rail (in the gutter) via absolute
   positioning so it never nudges the heading itself. */
.post-body h2,
.post-body h3,
.post-body h4 {
  position: relative;
  scroll-margin-top: 6rem;
  color: var(--foreground);
  letter-spacing: -0.015em;
}

.post-body h2 {
  margin-top: 3rem;
  margin-bottom: 0.4rem;
  font-size: 1.5rem;
  line-height: 1.3;
}

.post-body h3 {
  margin-top: 2.25rem;
  margin-bottom: 0.25rem;
  font-size: 1.2rem;
  line-height: 1.35;
}

.post-body h4 {
  margin-top: 1.75rem;
  font-size: 1.05rem;
}

.post-body h2 + p,
.post-body h3 + p,
.post-body h4 + p {
  margin-top: 0.75rem;
}

.post-body .heading-anchor {
  position: absolute;
  inset-inline-end: calc(100% + 0.4rem);
  top: 50%;
  transform: translateY(-50%);
  color: color-mix(in oklab, var(--muted-foreground) 60%, transparent);
  font-weight: 400;
  text-decoration: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.post-body h2:hover .heading-anchor,
.post-body h3:hover .heading-anchor,
.post-body h4:hover .heading-anchor,
.post-body .heading-anchor:focus-visible {
  opacity: 1;
}

/* Audio-follow highlight — kept from the previous design, tuned for the
   quieter typography around it. */
.post-body [data-audio-index] {
  scroll-margin-top: 6rem;
  border-radius: 0.5rem;
  transition: background-color 250ms ease;
}

.post-body .audio-active {
  background: color-mix(in oklab, var(--primary) 12%, transparent);
  box-shadow:
    -0.75rem 0 0 color-mix(in oklab, var(--primary) 12%, transparent),
    0.75rem 0 0 color-mix(in oklab, var(--primary) 12%, transparent);
}

/* Inline links — quiet by default, primary on hover. */
.post-body a:not(.heading-anchor) {
  color: var(--foreground);
  text-decoration: underline;
  text-decoration-color: color-mix(in oklab, var(--primary) 55%, transparent);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  transition:
    color 0.15s,
    text-decoration-color 0.15s;
}

.post-body a:not(.heading-anchor):hover {
  color: var(--primary);
  text-decoration-color: var(--primary);
}

/* Lists — comfy indentation with tinted markers. */
.post-body ul,
.post-body ol {
  padding-inline-start: 1.3rem;
}

.post-body ul > li,
.post-body ol > li {
  margin-top: 0.35rem;
}

.post-body ul > li::marker {
  color: color-mix(in oklab, var(--primary) 60%, transparent);
}

/* Inline code — muted background chip, subtle. */
.post-body :not(pre) > code {
  background: color-mix(in oklab, var(--foreground) 6%, var(--background));
  color: var(--foreground);
  padding: 0.12rem 0.4rem;
  border-radius: 0.35rem;
  border: 1px solid color-mix(in oklab, var(--foreground) 8%, transparent);
  font-size: 0.86em;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}

/* Code blocks — quiet card, hairline border, no shadow so it blends into
   the document flow like Stripe/Linear docs. */
.post-body pre {
  margin-top: 1.75rem;
  margin-bottom: 1.75rem;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.65;
  background: color-mix(in oklab, var(--foreground) 3%, var(--background));
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}

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
  border: none;
}

/* Blockquotes — an editorial pull-quote treatment, but calibrated so it
   doesn't compete with headings visually. */
.post-body blockquote {
  margin-top: 1.75rem;
  margin-bottom: 1.75rem;
  padding: 0.25rem 0 0.25rem 1.15rem;
  border-inline-start: 3px solid color-mix(in oklab, var(--primary) 55%, var(--border));
  color: color-mix(in oklab, var(--foreground) 78%, transparent);
  font-style: italic;
}

.post-body blockquote p {
  margin-top: 0;
}

.post-body hr {
  margin-top: 2.5rem;
  margin-bottom: 2.5rem;
  border: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    var(--border) 30%,
    var(--border) 70%,
    transparent
  );
}

.post-body img {
  border-radius: 0.75rem;
  border: 1px solid var(--border);
}

/* Tables — docs style: hairline outer border, header row with muted uppercase
   labels, zebra-free body rows. */
.post-body table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.925rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  overflow: hidden;
}

.post-body th,
.post-body td {
  border-bottom: 1px solid var(--border);
  padding: 0.65rem 0.9rem;
  text-align: start;
}

.post-body tr:last-child td {
  border-bottom: none;
}

.post-body th {
  background: color-mix(in oklab, var(--foreground) 4%, var(--background));
  font-weight: 600;
  color: var(--foreground);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
