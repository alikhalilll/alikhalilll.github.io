<script setup lang="ts">
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: string;
  orientation?: 'horizontal' | 'vertical';
}>();
</script>

<template>
  <div
    role="separator"
    :aria-orientation="orientation ?? 'horizontal'"
    :class="
      cn(
        'shrink-0 bg-border',
        orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full',
        props.class
      )
    "
  />
</template>
