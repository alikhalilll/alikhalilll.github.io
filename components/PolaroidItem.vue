<script setup lang="ts">
withDefaults(
  defineProps<{
    src: string;
    alt: string;
    caption?: string;
    /** Tilt direction. Alternate between siblings for the scrapbook feel. */
    tilt?: 'left' | 'right';
  }>(),
  { caption: undefined, tilt: 'left' }
);
</script>

<template>
  <figure
    class="group relative w-40 shrink-0 bg-white p-2 drop-shadow-2xl transition-all duration-300 hover:z-10 hover:scale-105 sm:w-48"
    :class="
      tilt === 'left'
        ? '-rotate-5 hover:-translate-x-2 hover:rotate-0'
        : 'rotate-5 hover:translate-x-2 hover:rotate-0'
    "
  >
    <img :src="src" :alt="alt" class="aspect-square w-full object-cover" width="192" height="192" />
    <figcaption
      v-if="caption"
      class="mt-2 pb-1 text-center font-serif text-sm text-neutral-800"
      style="font-family: var(--font-serif)"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>
