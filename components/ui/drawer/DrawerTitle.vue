<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { DrawerTitle } from 'vaul-vue';
import { cn } from '@/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
  <DrawerTitle data-slot="drawer-title" :class="cn('text-foreground font-semibold', props.class)">
    <slot />
  </DrawerTitle>
</template>
