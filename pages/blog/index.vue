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

const [featured, ...rest] = posts.value ?? [];
</script>

<template>
  <div>
    <Hero
      :eyebrow="t('writing.eyebrow')"
      :title="t('writing.title')"
      :subtitle="t('writing.subtitle')"
    />

    <section class="pb-24">
      <template v-if="featured">
        <!-- Featured post — full-width editorial card, image + text side by
             side on desktop, stacked on mobile. Sets the tone for the page. -->
        <NuxtLink
          :to="localePath(featured.path)"
          class="group/feat mb-14 grid gap-6 no-underline sm:mb-20 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:items-center sm:gap-10"
        >
          <div class="aspect-[16/10] overflow-hidden rounded-xl bg-muted ring-1 ring-border">
            <img
              :src="coverFor(featured)"
              :alt="featured.title"
              class="size-full object-cover transition-transform duration-500 group-hover/feat:scale-[1.03]"
              loading="eager"
              width="960"
              height="600"
            />
          </div>

          <div class="min-w-0">
            <p
              class="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
            >
              <span
                class="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground"
              >
                {{ t('writing.eyebrow') }}
              </span>
              <time v-if="featured.date" :datetime="featured.date">
                {{ formatDate(featured.date, { year: 'numeric', month: 'short', day: 'numeric' }) }}
              </time>
            </p>

            <h2
              class="text-2xl leading-tight font-semibold text-foreground transition-colors group-hover/feat:text-primary sm:text-3xl md:text-4xl"
            >
              {{ featured.title }}
            </h2>
            <p
              v-if="featured.description"
              class="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base"
            >
              {{ featured.description }}
            </p>
            <span class="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              {{ t('home.blog_previews.read_more') }}
              <Icon
                name="lucide:arrow-right"
                class="rtl-flip size-4 transition-transform group-hover/feat:translate-x-1 rtl:group-hover/feat:-translate-x-1"
              />
            </span>
          </div>
        </NuxtLink>
      </template>

      <ul v-if="rest.length" class="grid gap-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14">
        <li v-for="(post, i) in rest" :key="post.path" v-reveal="i * 80">
          <NuxtLink :to="localePath(post.path)" class="group/post block no-underline">
            <div class="aspect-[16/10] overflow-hidden rounded-xl bg-muted ring-1 ring-border">
              <img
                :src="coverFor(post)"
                :alt="post.title"
                class="size-full object-cover transition-transform duration-500 group-hover/post:scale-[1.04]"
                loading="lazy"
                width="640"
                height="400"
              />
            </div>
            <div class="mt-4">
              <time
                v-if="post.date"
                class="block font-mono text-[11px] tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
                :datetime="post.date"
              >
                {{ formatDate(post.date, { year: 'numeric', month: 'short', day: 'numeric' }) }}
              </time>
              <h3
                class="mt-2 text-lg leading-snug font-semibold text-foreground transition-colors group-hover/post:text-primary sm:text-xl"
              >
                {{ post.title }}
              </h3>
              <p
                v-if="post.description"
                class="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground"
              >
                {{ post.description }}
              </p>
            </div>
          </NuxtLink>
        </li>
      </ul>

      <div v-if="!posts || !posts.length" class="py-16 text-center text-muted-foreground">
        <p>{{ t('writing.empty') }}</p>
      </div>
    </section>
  </div>
</template>
