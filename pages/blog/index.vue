<script setup lang="ts">
const { t } = useI18n();
const { formatDate } = useLocalizedDate();

useSiteSeo({
  title: t('writing.eyebrow'),
  description: t('writing.subtitle'),
});

const { data: posts } = await useAsyncData('blog-list', () =>
  queryCollection('blog').order('date', 'DESC').all()
);
</script>

<template>
  <div>
    <Hero
      :eyebrow="t('writing.eyebrow')"
      :title="t('writing.title')"
      :subtitle="t('writing.subtitle')"
    />

    <section class="prose-container pb-24">
      <ul v-if="posts && posts.length" class="flex flex-col">
        <li
          v-for="(post, i) in posts"
          :key="post.path"
          v-reveal="i * 50"
          class="border-b border-border py-6 last:border-b-0 first:pt-0"
        >
          <NuxtLink
            :to="post.path"
            class="group flex flex-col gap-2 no-underline sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
          >
            <div class="flex-1">
              <h2 class="text-lg font-semibold text-foreground group-hover:underline sm:text-xl">
                {{ post.title }}
              </h2>
              <p v-if="post.description" class="mt-1 text-sm text-muted-foreground">
                {{ post.description }}
              </p>
            </div>
            <time
              v-if="post.date"
              class="shrink-0 font-mono text-xs text-muted-foreground ar:font-sans ar:text-sm ar:font-bold"
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
