<script setup lang="ts">
import { cn } from '@/lib/utils';

const props = defineProps<{ class?: string }>();
</script>

<template>
  <div
    :class="
      cn(
        'rounded-xl border border-border bg-card text-card-foreground transition-all',
        'hover:border-foreground/40 hover:shadow-[0_10px_30px_-20px_rgba(60,40,20,0.35)]',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
