<script setup lang="ts">
useHead({ title: 'Writing — Ali Khalil' });

const { data: posts } = await useAsyncData('blog-list', () =>
  queryCollection('blog').order('date', 'DESC').all()
);
</script>

<template>
  <div>
    <Hero
      eyebrow="Writing"
      title="Notes, mostly on the edges."
      subtitle="Short posts on frontend craft, Nuxt, TypeScript, performance, and leading small teams."
    />

    <section class="prose-container pb-24">
      <ul v-if="posts && posts.length" class="flex flex-col divide-y divide-border">
        <li v-for="post in posts" :key="post.path" class="py-8 first:pt-0">
          <NuxtLink
            :to="post.path"
            class="group flex flex-col gap-3 no-underline sm:flex-row sm:items-baseline sm:justify-between"
          >
            <div class="flex-1">
              <h2
                class="font-serif text-2xl font-semibold text-foreground group-hover:text-primary sm:text-3xl"
              >
                {{ post.title }}
              </h2>
              <p v-if="post.description" class="mt-2 text-muted-foreground">
                {{ post.description }}
              </p>
            </div>
            <time
              v-if="post.date"
              class="shrink-0 text-sm text-muted-foreground sm:ml-8"
              :datetime="post.date"
            >
              {{
                new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              }}
            </time>
          </NuxtLink>
        </li>
      </ul>
      <div v-else class="py-12 text-center text-muted-foreground">
        <p>Nothing published yet — but ideas are brewing.</p>
      </div>
    </section>
  </div>
</template>
