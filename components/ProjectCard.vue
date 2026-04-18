<script setup lang="ts">
import { Badge } from '@/components/ui/badge';

withDefaults(
  defineProps<{
    title: string;
    description: string;
    tags?: string[];
    href?: string;
    repo?: string;
    year?: string;
    icon?: string;
    /** Content direction. Defaults to LTR — override to 'rtl' for Arabic entries. */
    dir?: 'ltr' | 'rtl';
  }>(),
  { dir: 'ltr' }
);

const { t } = useI18n();
const { formatYear } = useLocalizedDate();
</script>

<template>
  <article
    :dir="dir"
    class="hover-gradient rounded-md border border-border p-5 transition-colors hover:border-foreground/40"
  >
    <div class="mb-2 flex items-baseline justify-between gap-4">
      <h3 class="text-base font-semibold text-foreground">
        <bdi>{{ title }}</bdi>
      </h3>
      <span v-if="year" class="shrink-0 font-mono text-xs text-muted-foreground">
        {{ formatYear(year) }}
      </span>
    </div>

    <p class="text-sm leading-relaxed text-muted-foreground">{{ description }}</p>

    <div v-if="tags && tags.length" class="mt-4 flex flex-wrap gap-1.5">
      <Badge v-for="t in tags" :key="t" variant="outline">{{ t }}</Badge>
    </div>

    <div v-if="href || repo" class="mt-4 flex flex-wrap gap-x-5 gap-y-1">
      <a
        v-if="href"
        :href="href"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-1 text-sm text-foreground no-underline hover:underline"
      >
        {{ t('common.visit') }} <Icon name="lucide:arrow-up-right" class="rtl-flip size-3.5" />
      </a>
      <a
        v-if="repo"
        :href="repo"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-1 text-sm text-muted-foreground no-underline hover:text-foreground"
      >
        {{ t('common.source') }} <Icon name="lucide:github" class="size-3.5" />
      </a>
    </div>
  </article>
</template>
