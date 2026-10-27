<script setup lang="ts">
import { computed } from 'vue';

import PhaseQuizView from '~/features/plans/components/PhaseQuizView.vue';
import type { PhaseKey } from '~/features/plan1/types';

definePageMeta({
  layout: false,
});

defineI18nRoute({
  locales: ['en-us'],
});

const route = useRoute();
const planId = computed(() => String(route.params.plan));
const phaseKey = computed(() => String(route.params.phase) as PhaseKey);
</script>

<template>
  <PhaseQuizView :plan-id="planId" :phase-key="phaseKey" />
</template>
