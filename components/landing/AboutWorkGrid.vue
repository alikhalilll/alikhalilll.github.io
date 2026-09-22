<script setup lang="ts">
import { Motion } from 'motion-v';

const { t } = useI18n();
const localePath = useLocalePath();
const { roles } = useExperience();
const { formatYear } = useLocalizedDate();

const topRoles = computed(() => roles.slice(0, 4));
</script>

<template>
  <section class="grid gap-10 py-16 lg:grid-cols-2 lg:gap-12">
    <Motion
      :initial="{ y: 20, opacity: 0 }"
      :while-in-view="{ y: 0, opacity: 1 }"
      :in-view-options="{ once: true, amount: 0.3 }"
      :transition="{ duration: 0.5 }"
    >
      <div>
        <h2 class="text-xl font-medium sm:text-2xl">{{ t('home.about.title') }}</h2>
        <p class="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {{ t('home.about.body') }}
        </p>
        <NuxtLink
          :to="localePath('/about')"
          class="mt-6 inline-flex items-center gap-1.5 text-sm text-foreground no-underline hover:text-primary"
        >
          {{ t('home.about.more') }}
          <Icon name="lucide:arrow-right" class="rtl-flip size-4" />
        </NuxtLink>
      </div>
    </Motion>

    <div>
      <h2 class="text-xl font-medium sm:text-2xl">{{ t('home.work.title') }}</h2>
      <ul class="mt-5 flex flex-col divide-y divide-border">
        <Motion
          v-for="(role, i) in topRoles"
          :key="role.company + role.start"
          as="li"
          :initial="{ y: 20, opacity: 0 }"
          :while-in-view="{ y: 0, opacity: 1 }"
          :in-view-options="{ once: true, amount: 0.3 }"
          :transition="{ duration: 0.5, delay: 0.15 * i }"
          class="py-3"
        >
          <div class="flex items-baseline justify-between gap-4">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-foreground">{{ role.title }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ role.company }}</p>
            </div>
            <span class="shrink-0 font-mono text-xs text-muted-foreground ar:font-sans ar:text-sm">
              {{ formatYear(role.start) }}
              <span v-if="role.end">– {{ formatYear(role.end) }}</span>
              <span v-else>– {{ t('common.present') }}</span>
            </span>
          </div>
        </Motion>
      </ul>
    </div>
  </section>
</template>
