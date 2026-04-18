<script setup lang="ts">
const { t } = useI18n();

useSiteSeo({
  title: t('contact.eyebrow'),
  description: t('contact.subtitle'),
});

const channels = computed(() => [
  {
    key: 'email',
    value: 'alikhalilll.dev@gmail.com',
    href: 'mailto:alikhalilll.dev@gmail.com',
    icon: 'lucide:mail',
  },
  {
    key: 'phone',
    value: '+20 106 610 5963',
    href: 'tel:+201066105963',
    icon: 'lucide:phone',
  },
  {
    key: 'linkedin',
    value: 'linkedin.com/in/alikhalilll',
    href: 'https://www.linkedin.com/in/alikhalilll',
    icon: 'lucide:linkedin',
  },
  {
    key: 'github',
    value: '@alikhalilll',
    href: 'https://github.com/alikhalilll',
    icon: 'lucide:github',
  },
  {
    key: 'npm',
    value: '~alikhalilll',
    href: 'https://www.npmjs.com/~alikhalilll',
    icon: 'lucide:package',
  },
]);
</script>

<template>
  <div>
    <Hero
      :eyebrow="t('contact.eyebrow')"
      :title="t('contact.title')"
      :subtitle="t('contact.subtitle')"
    />

    <section class="prose-container pb-24">
      <ul class="flex flex-col gap-2">
        <li v-for="(c, i) in channels" :key="c.key" v-reveal="i * 50">
          <a
            :href="c.href"
            target="_blank"
            rel="noopener"
            class="group hover-gradient flex items-center gap-4 rounded-md border border-border p-4 no-underline transition-colors hover:border-foreground/40"
          >
            <Icon :name="c.icon" class="size-5 shrink-0 text-muted-foreground" />
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {{ t(`contact.channels.${c.key}.label`) }}
              </p>
              <p class="mt-0.5 truncate text-base font-medium text-foreground" dir="ltr">
                {{ c.value }}
              </p>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ t(`contact.channels.${c.key}.hint`) }}
              </p>
            </div>
            <Icon
              name="lucide:arrow-up-right"
              class="rtl-flip size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground rtl:group-hover:-translate-x-0.5"
            />
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>
