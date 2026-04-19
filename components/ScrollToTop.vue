<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core';

const { t } = useI18n();
const { y } = useWindowScroll({ behavior: 'smooth' });
const visible = computed(() => y.value > 600);
const playerOpen = useState('audioPlayerOpen', () => false);

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <button
      v-show="visible"
      type="button"
      :aria-label="t('common.scroll_to_top')"
      :title="t('common.scroll_to_top')"
      :class="[
        'fixed start-4 z-40 inline-flex size-11 items-center justify-center rounded-full sm:start-6',
        'border border-white/20 text-foreground ring-1 ring-white/10 ring-inset',
        'bg-card/50 backdrop-blur-xl backdrop-saturate-150',
        'supports-[backdrop-filter]:bg-card/40 hover:bg-accent hover:text-accent-foreground',
        'transition-[bottom] duration-200',
        playerOpen ? 'bottom-20 sm:bottom-6' : 'bottom-6',
      ]"
      @click="scrollToTop"
    >
      <Icon name="lucide:arrow-up" class="size-5" />
    </button>
  </Transition>
</template>
