<script setup lang="ts">
const { open } = useSearchDialog();
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <FloatingNav />
    <div class="framed-container flex-1 pt-20 sm:pt-24">
      <main>
        <slot />
      </main>
      <AppFooter />
    </div>
    <ClientOnly>
      <ScrollToTop />
      <LandingSearchDialog v-model:open="open" />
    </ClientOnly>
  </div>
</template>
