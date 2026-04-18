import tailwindcss from '@tailwindcss/vite';
import { defaultLocale, localeCookieName } from './constants/i18n';

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://alikhalilll.github.io';
const siteName = 'Ali Khalil';
const siteDescription =
  "Software engineer writing about the parts of building software that don't fit in a README.";

export default defineNuxtConfig({
  compatibilityDate: '2026-04-01',
  srcDir: '.',
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/icon', '@nuxtjs/i18n', 'shadcn-nuxt'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      siteUrl,
      siteName,
      siteDescription,
    },
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  icon: {
    serverBundle: {
      collections: ['lucide'],
    },
  },
  i18n: {
    defaultLocale,
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en-us', name: 'English', file: 'en-us/index.ts', dir: 'ltr' },
      { code: 'ar-eg', name: 'العربية (مصر)', file: 'ar-eg/index.ts', dir: 'rtl' },
      { code: 'ar-sa', name: 'العربية (السعودية)', file: 'ar-sa/index.ts', dir: 'rtl' },
    ],
    bundle: {
      optimizeTranslationDirective: false,
    },
    vueI18n: './i18n/vue-i18n.options.ts',
    compilation: {
      strictMessage: false,
      escapeHtml: false,
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: localeCookieName,
      fallbackLocale: defaultLocale,
      redirectOn: 'root',
    },
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
          langs: ['ts', 'js', 'vue', 'bash', 'json', 'html', 'css'],
        },
      },
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/404.html', '/robots.txt', '/sitemap.xml'],
      failOnError: false,
    },
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: siteName,
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@500;600;700&display=swap',
        },
        { rel: 'preload', as: 'image', href: '/og-image.png', type: 'image/png' },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: siteDescription },
        { name: 'author', content: siteName },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#fbfaf7' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#141311' },
        { name: 'color-scheme', content: 'light dark' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: siteName },
        { property: 'og:title', content: siteName },
        { property: 'og:description', content: siteDescription },
        { property: 'og:url', content: siteUrl },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:image', content: `${siteUrl}/og-image.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: `${siteName} — portfolio` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: siteName },
        { name: 'twitter:description', content: siteDescription },
        { name: 'twitter:image', content: `${siteUrl}/og-image.png` },
        { name: 'twitter:image:alt', content: `${siteName} — portfolio` },
      ],
      script: [
        {
          innerHTML: `(()=>{try{var r=document.documentElement;var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s==='dark'||((!s||s==='auto')&&m);r.classList.toggle('dark',d);var a=localStorage.getItem('accent')||'slate';var P={slate:{l:'0.32 0.015 250',d:'0.85 0.015 250'},terracotta:{l:'0.58 0.13 40',d:'0.72 0.14 45'},teal:{l:'0.55 0.12 195',d:'0.72 0.13 195'},rose:{l:'0.6 0.18 15',d:'0.72 0.18 15'},indigo:{l:'0.5 0.18 270',d:'0.7 0.16 270'},olive:{l:'0.5 0.09 130',d:'0.72 0.1 130'},amber:{l:'0.62 0.16 70',d:'0.78 0.15 75'}};var p=P[a]||P.slate;var t='oklch('+(d?p.d:p.l)+')';r.style.setProperty('--primary',t);r.style.setProperty('--ring',t);}catch(e){}})();`,
          tagPosition: 'head',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
});
