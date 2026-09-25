<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';

const { t } = useI18n();
const { open, show } = useSearchDialog();

function handleShortcut(e: KeyboardEvent) {
  const isK = e.key === 'k' || e.key === 'K';
  if (isK && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    show();
  }
}

onMounted(() => window.addEventListener('keydown', handleShortcut));
onBeforeUnmount(() => window.removeEventListener('keydown', handleShortcut));
</script>

<template>
  <section class="mt-10 sm:mt-16">
    <p
      class="text-center font-mono text-xs tracking-widest text-muted-foreground uppercase ar:font-sans ar:normal-case ar:tracking-normal"
    >
      {{ t('search.eyebrow') }}
    </p>
    <h2
      class="mx-auto mt-3 max-w-xl text-center font-serif text-3xl leading-tight font-semibold text-foreground text-balance sm:text-4xl ar:font-arabic-display"
    >
      {{ t('search.headline') }}
    </h2>

    <!-- Inline preview palette (click opens the dialog) -->
    <div
      class="relative mt-8 cursor-pointer"
      role="button"
      tabindex="0"
      :aria-label="t('search.open_search')"
      @click="show"
      @keydown.enter.prevent="show"
      @keydown.space.prevent="show"
    >
      <!-- Non-interactive overlay stops the child palette from stealing the click -->
      <div class="pointer-events-none">
        <LandingSearchPalette variant="inline" featured-only :show-shortcut="true" />
      </div>
    </div>

    <LandingSearchDialog v-model:open="open" />
  </section>
</template>
