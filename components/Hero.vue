<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <section class="prose-container pt-16 pb-14 sm:pt-24 sm:pb-20">
    <p v-if="eyebrow" class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
      <span class="h-px w-8 bg-primary" aria-hidden="true" />
      {{ eyebrow }}
    </p>
    <h1 class="text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
      {{ title }}
    </h1>
    <p v-if="subtitle" class="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
      {{ subtitle }}
    </p>
    <slot />
  </section>
</template>
