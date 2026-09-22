<script setup lang="ts">
import { Motion } from 'motion-v';

withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    subtitle?: string;
    /** Show the avatar + status pill + socials chrome (home hero only). */
    showChrome?: boolean;
    /** Availability status shown in the status pill (home hero only). */
    available?: boolean;
    /** Localized status label ("Available for new roles" / "Currently booked"). */
    statusLabel?: string;
  }>(),
  {
    eyebrow: undefined,
    subtitle: undefined,
    statusLabel: undefined,
    showChrome: false,
    available: true,
  }
);

const socials = [
  { label: 'GitHub', href: 'https://github.com/alikhalilll', icon: 'lucide:github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/alikhalilll', icon: 'lucide:linkedin' },
  { label: 'npm', href: 'https://www.npmjs.com/~alikhalilll', icon: 'lucide:package' },
  { label: 'Email', href: 'mailto:alikhalilll.dev@gmail.com', icon: 'lucide:mail' },
];

const enter = (delay: number) => ({
  initial: { scale: 1.1, opacity: 0, filter: 'blur(20px)' },
  animate: { scale: 1, opacity: 1, filter: 'blur(0px)' },
  transition: { duration: 0.6, delay },
});
</script>

<template>
  <section class="pt-6 pb-10 text-center sm:pt-10 sm:pb-14">
    <div v-if="showChrome" class="mb-6 flex justify-center">
      <Motion v-bind="enter(0.05)">
        <img
          src="/avatar.jpg"
          alt="Ali Khalil"
          width="256"
          height="256"
          decoding="async"
          fetchpriority="high"
          class="size-24 rounded-full object-cover ring-2 ring-border ring-offset-4 ring-offset-background sm:size-28"
        />
      </Motion>
    </div>

    <Motion v-if="eyebrow" v-bind="enter(0.1)">
      <p class="mb-4">
        <span
          class="inline-block rounded-full bg-accent px-3 py-1 text-[11px] font-medium tracking-widest text-accent-foreground uppercase ar:normal-case ar:tracking-normal"
        >
          {{ eyebrow }}
        </span>
      </p>
    </Motion>

    <Motion v-bind="enter(0.2)">
      <h1
        class="mx-auto max-w-xl text-3xl leading-[1.15] text-pretty sm:text-4xl md:text-5xl"
        style="text-shadow: 0 1px 2px color-mix(in oklab, var(--foreground) 8%, transparent)"
      >
        {{ title }}
      </h1>
    </Motion>

    <Motion v-if="subtitle" v-bind="enter(0.3)">
      <p class="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        {{ subtitle }}
      </p>
    </Motion>

    <Motion v-bind="enter(0.4)">
      <slot />
    </Motion>

    <Motion v-if="showChrome && statusLabel" v-bind="enter(0.5)">
      <div class="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span
          class="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm"
        >
          <span class="relative inline-flex size-2">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              :class="available ? 'bg-emerald-500' : 'bg-amber-500'"
            />
            <span
              class="relative inline-flex size-2 rounded-full"
              :class="available ? 'bg-emerald-500' : 'bg-amber-500'"
            />
          </span>
          {{ statusLabel }}
        </span>
      </div>
    </Motion>

    <Motion v-if="showChrome" v-bind="enter(0.6)">
      <div class="mt-6 flex flex-wrap items-center justify-center gap-1">
        <a
          v-for="s in socials"
          :key="s.href"
          :href="s.href"
          target="_blank"
          rel="noopener"
          :aria-label="s.label"
          class="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon :name="s.icon" class="size-4" />
        </a>
      </div>
    </Motion>
  </section>
</template>
