<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { DrawerOverlay } from 'vaul-vue';
import { cn } from '@/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
  <DrawerOverlay
    data-slot="drawer-overlay"
    :class="cn('fixed inset-0 z-50 bg-background/70 backdrop-blur-sm', props.class)"
  />
</template>
