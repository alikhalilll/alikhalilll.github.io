<script setup lang="ts">
const { t } = useI18n();
const year = new Date().getFullYear();

const socials = [
  { label: 'GitHub', href: 'https://github.com/alikhalilll', icon: 'lucide:github' },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/alikhalilll',
    icon: 'lucide:linkedin',
  },
  { label: 'npm', href: 'https://www.npmjs.com/~alikhalilll', icon: 'lucide:package' },
  { label: 'Email', href: 'mailto:alikhalilll.dev@gmail.com', icon: 'lucide:mail' },
];
</script>

<template>
  <footer class="mt-20 border-t border-border">
    <div
      class="wide-container flex flex-col items-start gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
    >
      <p>{{ t('footer.copyright', { year }) }}</p>

      <div class="flex gap-4">
        <a
          v-for="s in socials"
          :key="s.label"
          :href="s.href"
          target="_blank"
          rel="noopener"
          :aria-label="s.label"
          class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Icon :name="s.icon" class="size-4" />
          <span>{{ s.label }}</span>
        </a>
      </div>
    </div>
  </footer>
</template>
