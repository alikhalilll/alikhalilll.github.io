<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const { t } = useI18n();
const localePath = useLocalePath();

const navLinks = computed(() => [
  { to: localePath('/'), label: t('nav.home') },
  { to: localePath('/about'), label: t('nav.about') },
  { to: localePath('/projects'), label: t('nav.projects') },
  { to: localePath('/blog'), label: t('nav.writing') },
  { to: localePath('/contact'), label: t('nav.contact') },
]);

const mobileOpen = ref(false);
const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false;
  }
);
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
    <div class="wide-container flex h-14 items-center justify-between">
      <NuxtLink
        :to="localePath('/')"
        :aria-label="t('nav.home_aria')"
        class="flex items-center gap-2.5 no-underline"
      >
        <SiteLogo :size="28" />
        <span class="font-medium text-foreground">Ali Khalil</span>
      </NuxtLink>

      <div class="flex items-center gap-1">
        <nav class="hidden items-center gap-1 md:flex">
          <NuxtLink
            v-for="link in navLinks.slice(1)"
            :key="link.to"
            :to="link.to"
            class="rounded-md px-3 py-1.5 text-sm text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground"
            active-class="!text-accent-foreground bg-accent"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <Tooltip>
          <TooltipTrigger as-child>
            <a
              href="/resume.pdf"
              download
              :aria-label="t('nav.download_resume')"
              class="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-foreground no-underline hover:bg-accent hover:text-accent-foreground sm:px-3"
            >
              <Icon name="lucide:download" class="size-4" />
              <span class="hidden sm:inline">{{ t('nav.resume') }}</span>
            </a>
          </TooltipTrigger>
          <TooltipContent class="sm:hidden">
            {{ t('nav.resume') }}
          </TooltipContent>
        </Tooltip>

        <LanguageSwitcher />
        <ThemeToggle />

        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
          :aria-expanded="mobileOpen"
          :aria-label="t('nav.toggle_menu')"
          @click="mobileOpen = !mobileOpen"
        >
          <Icon :name="mobileOpen ? 'lucide:x' : 'lucide:menu'" class="size-5" />
        </button>
      </div>
    </div>

    <div v-if="mobileOpen" class="border-t border-border md:hidden">
      <nav class="wide-container flex flex-col gap-0.5 py-3">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-md px-3 py-2.5 text-sm text-muted-foreground no-underline hover:bg-accent hover:text-accent-foreground"
          active-class="!text-accent-foreground bg-accent"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
