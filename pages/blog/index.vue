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

const tilt = (i: number) => (i % 2 === 0 ? '-rotate-1' : 'rotate-1');

const coverFor = (post: { path: string; image?: string }) => {
  if (post.image) return post.image;
  const slug = post.path.replace(/^\/blog\//, '').replace(/\/$/, '');
  return `/blog-covers/${slug}.png`;
};
</script>

<template>
  <div>
    <Hero
      :eyebrow="t('writing.eyebrow')"
      :title="t('writing.title')"
      :subtitle="t('writing.subtitle')"
    />

    <section class="pb-24">
      <ul v-if="posts && posts.length" class="grid gap-8 sm:grid-cols-2 sm:gap-10">
        <li v-for="(post, i) in posts" :key="post.path" v-reveal="i * 80">
          <NuxtLink :to="localePath(post.path)" class="group/blog-post block no-underline">
            <div
              class="mb-4 aspect-[4/3] overflow-hidden rounded-lg border-4 border-background shadow-lg ring-2 ring-border transition-transform duration-300 group-hover/blog-post:scale-105"
              :class="tilt(i)"
            >
              <img
                :src="coverFor(post)"
                :alt="post.title"
                class="size-full object-cover"
                loading="lazy"
                width="480"
                height="360"
              />
            </div>
            <h2
              class="text-lg font-semibold text-foreground group-hover/blog-post:text-primary sm:text-xl"
            >
              {{ post.title }}
            </h2>
            <p v-if="post.description" class="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {{ post.description }}
            </p>
            <time
              v-if="post.date"
              class="mt-3 block font-mono text-xs text-muted-foreground ar:font-sans ar:text-sm"
              :datetime="post.date"
            >
              {{ formatDate(post.date, { year: 'numeric', month: 'short', day: 'numeric' }) }}
            </time>
          </NuxtLink>
        </li>
      </ul>
      <div v-else class="py-12 text-center text-muted-foreground">
        <p>{{ t('writing.empty') }}</p>
      </div>
    </section>
  </div>
</template>
