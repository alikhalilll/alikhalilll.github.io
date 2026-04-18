<script setup lang="ts">
const year = new Date().getFullYear();

const socials = [
  { label: 'GitHub', href: 'https://github.com/alikhalilll', icon: 'lucide:github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/alikhalilll', icon: 'lucide:linkedin' },
  { label: 'Email', href: 'mailto:alikhalilll.dev@gmail.com', icon: 'lucide:mail' },
];
</script>

<template>
  <footer class="mt-24 border-t border-border">
    <div
      class="wide-container flex flex-col items-start gap-6 py-10 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="font-serif text-lg font-semibold">Ali Khalil</p>
        <p class="mt-1 text-sm text-muted-foreground">
          Built with Nuxt. Sharpened with coffee. © {{ year }}
        </p>
      </div>

      <div class="flex gap-4">
        <a
          v-for="s in socials"
          :key="s.label"
          :href="s.href"
          target="_blank"
          rel="noopener"
          :aria-label="s.label"
          class="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground no-underline transition-colors hover:border-foreground hover:text-foreground"
        >
          <Icon :name="s.icon" class="size-4" />
        </a>
      </div>
    </div>
  </footer>
</template>
