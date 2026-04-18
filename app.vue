<script setup lang="ts">
import { ConfigProvider } from 'reka-ui';
import { getHtmlAttributes } from '~/constants/i18n';

const { handleSetLocale, langCookie } = useI18nHandler();

const route = useRoute();
const useIdFunction = () => useId();
const pageKey = computed(() => (route.query._t ?? '') as string);

onMounted(() => {
  handleSetLocale(langCookie.value);
});
</script>

<template>
  <ConfigProvider :use-id="useIdFunction" :dir="getHtmlAttributes(langCookie).dir">
    <NuxtLayout>
      <NuxtPage :key="pageKey" :keepalive="false" />
    </NuxtLayout>
  </ConfigProvider>
</template>
