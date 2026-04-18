<script setup lang="ts">
const route = useRoute();

const { data: post } = await useAsyncData(`blog-${route.path}`, () =>
  queryCollection('blog').path(route.path).first()
);

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true });
}

useHead({
  title: `${post.value.title} — Ali Khalil`,
  meta: [{ name: 'description', content: post.value.description ?? '' }],
});
</script>

<template>
  <article class="prose-container py-16 sm:py-24">
    <NuxtLink
      to="/blog"
      class="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground no-underline hover:text-foreground"
    >
      <Icon name="lucide:arrow-left" class="size-4" /> All writing
    </NuxtLink>

    <header class="mb-12 border-b border-border pb-8">
      <h1 class="text-4xl leading-tight sm:text-5xl">{{ post?.title }}</h1>
      <p v-if="post?.description" class="mt-4 text-lg text-muted-foreground">
        {{ post.description }}
      </p>
      <time
        v-if="post?.date"
        class="mt-6 block text-sm text-muted-foreground"
        :datetime="post.date"
      >
        {{
          new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }}
      </time>
    </header>

    <ContentRenderer v-if="post" :value="post" class="post-body" />
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
}

.post-body h3 {
  margin-top: 2rem;
  font-size: 1.35rem;
  color: var(--foreground);
}

.post-body a {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.post-body code {
  background: var(--muted);
  padding: 0.1rem 0.35rem;
  border-radius: 0.35rem;
  font-size: 0.9em;
}

.post-body pre {
  background: var(--foreground);
  color: var(--background);
  padding: 1.25rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  font-size: 0.9rem;
}

.post-body pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}

.post-body blockquote {
  border-left: 3px solid var(--primary);
  padding-left: 1.25rem;
  color: var(--muted-foreground);
  font-style: italic;
}
</style>
