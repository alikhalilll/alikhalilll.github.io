<script setup lang="ts">
import { Motion } from 'motion-v';

const { t } = useI18n();
const localePath = useLocalePath();
const { formatDate } = useLocalizedDate();

const { data: posts } = await useAsyncData('blog-previews', () =>
  queryCollection('blog').order('date', 'DESC').limit(3).all()
);
</script>

<template>
  <section v-if="posts && posts.length" class="py-16">
    <div class="flex items-baseline justify-between gap-4">
      <h2 class="text-xl font-medium sm:text-2xl">{{ t('home.blog_previews.title') }}</h2>
      <NuxtLink
        :to="localePath('/blog')"
        class="text-sm text-muted-foreground no-underline hover:text-foreground"
      >
        {{ t('common.all_writing') }} →
      </NuxtLink>
    </div>

    <ul class="mt-6 flex flex-col divide-y divide-border">
      <Motion
        v-for="(post, i) in posts"
        :key="post.path"
        as="li"
        :initial="{ y: 10, opacity: 0 }"
        :while-in-view="{ y: 0, opacity: 1 }"
        :in-view-options="{ once: true, amount: 0.3 }"
        :transition="{ duration: 0.5, delay: 0.15 * i }"
      >
        <NuxtLink
          :to="localePath(post.path)"
          class="group flex items-start justify-between gap-4 py-5 no-underline"
        >
          <div class="min-w-0 flex-1">
            <p class="text-base font-medium text-foreground group-hover:text-primary">
              {{ post.title }}
            </p>
            <p v-if="post.description" class="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {{ post.description }}
            </p>
            <div class="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <time v-if="post.date" :datetime="post.date">
                {{ formatDate(post.date, { year: 'numeric', month: 'short', day: 'numeric' }) }}
              </time>
              <span class="inline-flex items-center gap-1 text-foreground">
                {{ t('home.blog_previews.read_more') }}
                <Icon
                  name="lucide:arrow-right"
                  class="rtl-flip size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                />
              </span>
            </div>
          </div>
        </NuxtLink>
      </Motion>
    </ul>
  </section>
</template>
