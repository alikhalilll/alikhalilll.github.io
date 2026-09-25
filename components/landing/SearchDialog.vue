<script setup lang="ts">
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from 'reka-ui';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { useMediaQuery } from '@vueuse/core';

const open = defineModel<boolean>('open', { default: false });

const { t } = useI18n();
const isMobile = useMediaQuery('(max-width: 640px)');
const paletteRef = ref<{ focus: () => void } | null>(null);

function onOpened() {
  nextTick(() => paletteRef.value?.focus());
}

function onNavigate() {
  open.value = false;
}

watch(open, (v) => {
  if (v) onOpened();
});
</script>

<template>
  <!-- Mobile: shadcn-vue Drawer (bottom sheet) -->
  <Drawer v-if="isMobile" v-model:open="open">
    <DrawerContent class="max-h-[85vh] p-0">
      <DrawerTitle class="sr-only">{{ t('search.dialog_title') }}</DrawerTitle>
      <DrawerDescription class="sr-only">
        {{ t('search.dialog_description') }}
      </DrawerDescription>
      <LandingSearchPalette
        ref="paletteRef"
        variant="modal"
        flush
        max-height="65vh"
        :show-shortcut="false"
        @navigate="onNavigate"
      />
    </DrawerContent>
  </Drawer>

  <!-- Desktop: centered Dialog -->
  <DialogRoot v-else v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed left-1/2 top-[15%] z-50 w-full max-w-2xl -translate-x-1/2 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0"
      >
        <DialogTitle class="sr-only">{{ t('search.dialog_title') }}</DialogTitle>
        <DialogDescription class="sr-only">
          {{ t('search.dialog_description') }}
        </DialogDescription>
        <LandingSearchPalette
          ref="paletteRef"
          variant="modal"
          max-height="60vh"
          :show-shortcut="false"
          @navigate="onNavigate"
        />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
