<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const { t } = useI18n();
const localePath = useLocalePath();

const navLinks = computed(() => [
  { to: localePath('/'), label: t('nav.home'), icon: 'lucide:home' },
  { to: localePath('/about'), label: t('nav.about'), icon: 'lucide:user' },
  { to: localePath('/projects'), label: t('nav.projects'), icon: 'lucide:folder-open' },
  { to: localePath('/blog'), label: t('nav.writing'), icon: 'lucide:pen-line' },
  { to: localePath('/contact'), label: t('nav.contact'), icon: 'lucide:mail' },
]);
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-2 z-30 flex justify-center sm:top-4">
    <nav
      :aria-label="t('nav.home_aria')"
      class="pointer-events-auto flex items-center gap-0.5 rounded-full border border-border/50 bg-background/70 px-1.5 py-1 shadow-lg shadow-black/5 backdrop-blur-md sm:gap-1 sm:px-2"
    >
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="group inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-sm text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground sm:h-9 sm:px-3"
        active-class="!text-foreground bg-accent"
      >
        <Icon :name="link.icon" class="size-4 sm:hidden" />
        <span class="hidden sm:inline">{{ link.label }}</span>
      </NuxtLink>

      <span class="mx-0.5 h-5 w-px bg-border sm:mx-1" />

      <Tooltip>
        <TooltipTrigger as-child>
          <a
            href="/ALI_KHALIL_FRONTEND.pdf"
            download
            :aria-label="t('nav.download_resume')"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground sm:h-9 sm:w-9"
          >
            <Icon name="lucide:download" class="size-4" />
          </a>
        </TooltipTrigger>
        <TooltipContent>{{ t('nav.resume') }}</TooltipContent>
      </Tooltip>

      <LanguageSwitcher />
      <ThemeToggle />
    </nav>
  </div>
</template>
