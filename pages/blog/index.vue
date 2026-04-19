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
          class="border-b border-border last:border-b-0"
        >
          <NuxtLink
            :to="post.path"
            class="group -mx-3 flex flex-col gap-2 rounded-md px-3 py-5 no-underline transition-colors hover:bg-foreground/[0.04] sm:flex-row sm:items-center sm:gap-6"
          >
            <div class="min-w-0 flex-1">
              <h2
                class="inline-flex items-baseline gap-1.5 text-lg font-semibold text-foreground decoration-primary/60 decoration-2 underline-offset-4 group-hover:text-primary group-hover:underline sm:text-xl"
              >
                <span>{{ post.title }}</span>
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
            <Icon
              name="lucide:arrow-right"
              class="rtl-flip size-5 shrink-0 self-center text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary rtl:group-hover:-translate-x-1"
            />
          </NuxtLink>
        </li>
      </ul>
      <div v-else class="py-12 text-center text-muted-foreground">
        <p>{{ t('writing.empty') }}</p>
      </div>
    </section>
  </div>
</template>
