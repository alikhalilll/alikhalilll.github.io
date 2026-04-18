<script setup lang="ts">
import { ConfigProvider } from 'reka-ui';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getHtmlAttributes, type Locales } from '~/constants/i18n';

const { handleSetLocale, langCookie } = useI18nHandler();
const { locale } = useI18n();
const config = useRuntimeConfig();

const route = useRoute();
const useIdFunction = () => useId();
const pageKey = computed(() => (route.query._t ?? '') as string);

// Reflect the active locale on <html> so assistive tech and search engines
// see the correct language and reading direction on every request.
const htmlAttrs = computed(() => getHtmlAttributes(locale.value as Locales));

useHead({
  htmlAttrs: {
    lang: () => htmlAttrs.value.lang,
    dir: () => htmlAttrs.value.dir,
  },
});

const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '');
const siteName = config.public.siteName as string;
const siteDescription = config.public.siteDescription as string;

// Global WebSite + Organization schema. Per-page schemas (BlogPosting,
// Person) are added inside their own pages on top of this.
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            url: siteUrl,
            name: siteName,
            description: siteDescription,
            inLanguage: htmlAttrs.value.lang,
          },
          {
            '@type': 'Organization',
            '@id': `${siteUrl}/#org`,
            name: siteName,
            url: siteUrl,
            logo: `${siteUrl}/favicon.svg`,
          },
        ],
      }),
    },
  ],
});

onMounted(() => {
  handleSetLocale(langCookie.value);
});
</script>

<template>
  <ConfigProvider :use-id="useIdFunction" :dir="htmlAttrs.dir">
    <TooltipProvider :delay-duration="200">
      <NuxtLayout>
        <NuxtPage :key="pageKey" :keepalive="false" />
      </NuxtLayout>
    </TooltipProvider>
  </ConfigProvider>
</template>
