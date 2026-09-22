<script setup lang="ts">
import { Badge } from '@/components/ui/badge';

const props = withDefaults(
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
    /** Horizontal layout with icon panel on one side (template style). */
    horizontal?: boolean;
    /** In horizontal mode, flip the icon panel to the opposite side. */
    reverse?: boolean;
  }>(),
  {
    tags: () => [],
    href: undefined,
    repo: undefined,
    year: undefined,
    icon: undefined,
    dir: 'ltr',
    horizontal: false,
    reverse: false,
  }
);

const { t } = useI18n();
const { formatYear } = useLocalizedDate();

const primaryHref = computed(() => props.href ?? props.repo);
</script>

<template>
  <article
    :dir="dir"
    class="group relative overflow-hidden rounded-lg border border-border p-5 transition-colors hover:border-foreground/40 hover:bg-foreground/[0.02]"
    :class="[
      horizontal && 'flex items-stretch gap-6 sm:p-6',
      horizontal && reverse && 'flex-row-reverse',
    ]"
  >
    <div
      v-if="horizontal"
      class="hidden shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-accent to-muted sm:flex sm:size-32 lg:size-40"
    >
      <Icon :name="icon ?? 'lucide:folder-open'" class="size-10 text-muted-foreground lg:size-12" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="mb-1 flex items-center gap-2">
        <span
          v-if="year"
          class="font-mono text-xs text-muted-foreground ar:font-sans ar:text-sm ar:font-bold"
        >
          {{ formatYear(year) }}
        </span>
        <Icon
          v-if="!horizontal && icon"
          :name="icon"
          class="size-4 shrink-0 text-muted-foreground"
        />
      </div>

      <h3 class="text-base font-semibold text-foreground sm:text-lg">
        <bdi>{{ title }}</bdi>
      </h3>

      <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ description }}</p>

      <div v-if="tags && tags.length" class="mt-4 flex flex-wrap gap-1.5">
        <Badge v-for="tag in tags" :key="tag" variant="outline">{{ tag }}</Badge>
      </div>

      <div v-if="primaryHref || repo" class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
        <a
          v-if="primaryHref"
          :href="primaryHref"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 text-sm text-foreground no-underline hover:text-primary"
        >
          {{ href ? t('common.visit') : t('common.source') }}
          <Icon
            name="lucide:arrow-right"
            class="rtl-flip size-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
          />
        </a>
        <a
          v-if="repo && href"
          :href="repo"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1 text-sm text-muted-foreground no-underline hover:text-foreground"
        >
          {{ t('common.source') }} <Icon name="lucide:github" class="size-3.5" />
        </a>
      </div>
    </div>
  </article>
</template>
