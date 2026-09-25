<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { DrawerContent, DrawerPortal } from 'vaul-vue';
import { cn } from '@/lib/utils';
import DrawerOverlay from './DrawerOverlay.vue';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerContent
      data-slot="drawer-content"
      :class="
        cn(
          'group/drawer-content bg-background fixed z-50 flex h-auto flex-col',
          'inset-x-0 bottom-0 mt-24 max-h-[90vh] rounded-t-xl border-t',
          props.class
        )
      "
    >
      <div
        class="mx-auto mt-3 mb-5 hidden h-1.5 w-14 shrink-0 rounded-full bg-muted-foreground/40 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
        aria-hidden="true"
      />
      <slot />
    </DrawerContent>
  </DrawerPortal>
</template>
