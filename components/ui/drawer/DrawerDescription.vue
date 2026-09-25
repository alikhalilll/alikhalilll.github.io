<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { DrawerDescription } from 'vaul-vue';
import { cn } from '@/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
  <DrawerDescription
    data-slot="drawer-description"
    :class="cn('text-muted-foreground text-sm', props.class)"
  >
    <slot />
  </DrawerDescription>
</template>
