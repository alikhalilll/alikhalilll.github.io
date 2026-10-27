<script setup lang="ts">
import { computed } from 'vue';

import PlanOverview from '~/features/plans/components/PlanOverview.vue';

definePageMeta({
  layout: false,
});

defineI18nRoute({
  locales: ['en-us'],
});

const route = useRoute();
const planId = computed(() => String(route.params.plan));
</script>

<template>
  <PlanOverview :plan-id="planId" />
</template>
