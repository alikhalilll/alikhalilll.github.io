<script setup lang="ts">
const navLinks = [
  { to: '/', label: 'Home', icon: 'lucide:home' },
  { to: '/about', label: 'Me', icon: 'lucide:user-round' },
  { to: '/projects', label: 'Projects', icon: 'lucide:hammer' },
  { to: '/blog', label: 'Writing', icon: 'lucide:book-open' },
  { to: '/contact', label: 'Contact', icon: 'lucide:mail' },
];

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
    <div class="wide-container flex h-16 items-center justify-between">
      <NuxtLink to="/" class="group flex items-center gap-2.5 no-underline">
        <span
          class="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-rotate-6"
        >
          <span class="font-serif text-sm font-bold">Ak</span>
        </span>
        <span class="font-serif text-lg font-semibold text-foreground">Ali Khalil</span>
      </NuxtLink>

      <nav class="hidden items-center gap-1 md:flex">
        <NuxtLink
          v-for="link in navLinks.slice(1)"
          :key="link.to"
          :to="link.to"
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground"
          active-class="!text-foreground bg-muted"
        >
          <Icon :name="link.icon" class="size-4" />
          {{ link.label }}
        </NuxtLink>
      </nav>

      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted md:hidden"
        :aria-expanded="mobileOpen"
        aria-label="Toggle navigation"
        @click="mobileOpen = !mobileOpen"
      >
        <Icon :name="mobileOpen ? 'lucide:x' : 'lucide:menu'" class="size-5" />
      </button>
    </div>

    <div v-if="mobileOpen" class="border-t border-border md:hidden">
      <nav class="wide-container flex flex-col gap-1 py-4">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="inline-flex items-center gap-3 rounded-lg px-3 py-3 text-base text-muted-foreground no-underline"
          active-class="!text-foreground bg-muted"
        >
          <Icon :name="link.icon" class="size-4" />
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
