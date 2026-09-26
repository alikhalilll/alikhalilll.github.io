<script setup lang="ts">
const { t } = useI18n();
const { formatDate } = useLocalizedDate();
const localePath = useLocalePath();

useSiteSeo({
  title: t('meta.blog.title'),
  description: t('meta.blog.description'),
});

const { data: posts } = await useAsyncData('blog-list', () =>
  queryCollection('blog').order('date', 'DESC').all()
);

const coverFor = (post: { path: string; image?: string }) => {
  if (post.image) return post.image;
  const slug = post.path.replace(/^\/blog\//, '').replace(/\/$/, '');
  return `/blog-covers/${slug}.png`;
};

// Reading time estimate — walks the content AST to sum text nodes, then
// divides by 220 wpm. Server-rendered so the number is in the HTML on
// first paint (no post-hydration flicker).
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
</script>

<template>
  <div>
    <Hero
      :eyebrow="t('writing.eyebrow')"
      :title="t('writing.title')"
      :subtitle="t('writing.subtitle')"
    />

    <section class="pb-24">
      <!-- Editorial index — one full-width row per post. Cover thumbnail on
           the start side (stacked above the text on mobile), then a mono
           meta line, a serif title, and a short excerpt. No cards, no
           borders — just typography and generous rhythm. -->
      <ul v-if="posts && posts.length" class="flex flex-col divide-y divide-border">
        <li v-for="(post, i) in posts" :key="post.path" v-reveal="i * 60">
          <NuxtLink
            :to="localePath(post.path)"
            class="group/post grid gap-5 py-8 no-underline sm:grid-cols-[16rem_minmax(0,1fr)] sm:gap-8 sm:py-10"
          >
            <div
              class="aspect-[16/10] overflow-hidden rounded-xl bg-muted ring-1 ring-border sm:aspect-[4/3]"
            >
              <img
                :src="coverFor(post)"
                :alt="post.title"
                class="size-full object-cover transition-transform duration-500 group-hover/post:scale-[1.04]"
                :loading="i === 0 ? 'eager' : 'lazy'"
                width="512"
                height="384"
              />
            </div>

            <div class="min-w-0 self-center">
              <div
                class="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
              >
                <time v-if="post.date" :datetime="post.date" dir="ltr">
                  {{ formatDate(post.date, { year: 'numeric', month: 'short', day: 'numeric' }) }}
                </time>
                <span aria-hidden="true" class="size-0.5 rounded-full bg-muted-foreground/60" />
                <span>
                  {{ t('blog.min_read', { n: readingTime(post.body) }, readingTime(post.body)) }}
                </span>
              </div>

              <h2
                class="mt-3 font-serif text-2xl leading-[1.15] font-semibold tracking-tight text-balance text-foreground transition-colors group-hover/post:text-primary sm:text-3xl md:text-[2rem]"
              >
                {{ post.title }}
              </h2>

              <p
                v-if="post.description"
                class="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:text-base"
              >
                {{ post.description }}
              </p>

              <span
                class="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                {{ t('home.blog_previews.read_more') }}
                <Icon
                  name="lucide:arrow-right"
                  class="rtl-flip size-3.5 transition-transform group-hover/post:translate-x-1 rtl:group-hover/post:-translate-x-1"
                />
              </span>
            </div>
          </NuxtLink>
        </li>
      </ul>

      <div v-else class="py-16 text-center text-muted-foreground">
        <p>{{ t('writing.empty') }}</p>
      </div>
    </section>
  </div>
</template>
