<script setup lang="ts">
import PlansLanding from '~/features/plans/components/PlansLanding.vue';

definePageMeta({
  layout: false,
});

defineI18nRoute({
  locales: ['en-us'],
});
</script>

<template>
  <PlansLanding />
</template>
