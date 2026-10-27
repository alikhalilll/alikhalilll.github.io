<script setup lang="ts">
import { computed } from 'vue';

import TopicDetail from '~/features/plans/components/TopicDetail.vue';

definePageMeta({
  layout: false,
});

defineI18nRoute({
  locales: ['en-us'],
});

const route = useRoute();
const planId = computed(() => String(route.params.plan));
const topicId = computed(() => String(route.params.topic));
</script>

<template>
  <TopicDetail :plan-id="planId" :topic-id="topicId" />
</template>
