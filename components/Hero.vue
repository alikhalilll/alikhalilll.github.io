<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <section class="prose-container pt-14 pb-10 sm:pt-20 sm:pb-14">
    <p v-if="eyebrow" class="mb-4">
      <span
        class="inline-block rounded-full bg-accent px-3 py-1 text-[11px] font-medium tracking-widest text-accent-foreground uppercase"
      >
        {{ eyebrow }}
      </span>
    </p>
    <h1 class="text-3xl leading-[1.15] sm:text-4xl md:text-5xl">
      {{ title }}
    </h1>
    <p v-if="subtitle" class="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
      {{ subtitle }}
    </p>
    <slot />
  </section>
</template>
