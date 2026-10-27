<script setup lang="ts">
definePageMeta({
  layout: false,
});

defineI18nRoute({
  locales: ['en-us'],
});

const localePath = useLocalePath();

await navigateTo(localePath('/plans/roadmap/plan-1'), { redirectCode: 301 });
</script>

<template>
  <div />
</template>
