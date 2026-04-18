<script setup lang="ts">
import { Button } from '@/components/ui/button';

const props = defineProps<{
  error: {
    url?: string;
    statusCode?: number;
    statusMessage?: string;
    message?: string;
    description?: string;
    data?: unknown;
  };
}>();

const { t } = useI18n();
const localePath = useLocalePath();

const statusCode = computed(() => props.error?.statusCode ?? 500);
const isNotFound = computed(() => statusCode.value === 404);

const headline = computed(() => {
  if (isNotFound.value) return t('error.not_found');
  if (statusCode.value === 403) return t('error.forbidden');
  if (statusCode.value >= 500) return t('error.server_error');
  return props.error?.statusMessage ?? t('error.generic');
});

const blurb = computed(() => {
  if (isNotFound.value) return t('error.not_found_blurb');
  if (statusCode.value >= 500) return t('error.server_error_blurb');
  return props.error?.message ?? t('error.generic');
});

useSeoMeta({
  title: () => `${statusCode.value} — ${headline.value}`,
  description: () => blurb.value,
  robots: 'noindex, nofollow',
});

const handleHome = () => clearError({ redirect: localePath('/') });
</script>

<template>
  <NuxtLayout>
    <section class="prose-container py-20 sm:py-28">
      <p class="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        {{ t('error.label', { code: statusCode }) }}
      </p>
      <h1 class="mt-4 text-3xl leading-tight sm:text-4xl md:text-5xl">
        {{ headline }}
      </h1>
      <p class="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
        {{ blurb }}
      </p>

      <div class="mt-8 flex flex-wrap gap-3">
        <Button type="button" variant="primary" @click="handleHome">
          <Icon name="lucide:arrow-left" class="rtl-flip" />
          {{ t('common.back_home') }}
        </Button>
        <Button v-if="!isNotFound" type="button" variant="outline" @click="handleHome">
          {{ t('common.try_again') }}
        </Button>
      </div>

      <div v-if="isNotFound" class="mt-14">
        <p class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {{ t('error.try_one_of_these') }}
        </p>
        <ul class="mt-4 space-y-2 text-sm">
          <li>
            <NuxtLink
              :to="localePath('/projects')"
              class="inline-flex items-center gap-1.5 text-foreground no-underline hover:underline"
            >
              {{ t('nav.projects') }}
              <Icon name="lucide:arrow-right" class="rtl-flip size-3.5" />
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              :to="localePath('/blog')"
              class="inline-flex items-center gap-1.5 text-foreground no-underline hover:underline"
            >
              {{ t('nav.writing') }}
              <Icon name="lucide:arrow-right" class="rtl-flip size-3.5" />
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              :to="localePath('/about')"
              class="inline-flex items-center gap-1.5 text-foreground no-underline hover:underline"
            >
              {{ t('nav.about') }}
              <Icon name="lucide:arrow-right" class="rtl-flip size-3.5" />
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              :to="localePath('/contact')"
              class="inline-flex items-center gap-1.5 text-foreground no-underline hover:underline"
            >
              {{ t('nav.contact') }}
              <Icon name="lucide:arrow-right" class="rtl-flip size-3.5" />
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>
  </NuxtLayout>
</template>
