<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { ThemeMode } from '~/composables/useTheme';

const { mode, accent, setMode, setAccent, presets } = useTheme();
const { t } = useI18n();

const open = ref(false);

const modes: { key: ThemeMode; icon: string }[] = [
  { key: 'light', icon: 'lucide:sun' },
  { key: 'dark', icon: 'lucide:moon' },
  { key: 'auto', icon: 'lucide:monitor' },
];

const triggerIcon = computed(
  () => modes.find((m) => m.key === mode.value)?.icon ?? 'lucide:monitor'
);

const swatchColor = (preset: (typeof presets)[number]) =>
  `oklch(${mode.value === 'dark' ? preset.dark.primary : preset.light.primary})`;
</script>

<template>
  <Popover v-model:open="open">
    <span class="group/nav-tt relative inline-flex">
      <PopoverTrigger
        :aria-label="t('nav.theme_settings')"
        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground sm:h-9 sm:w-9"
      >
        <ClientOnly>
          <Icon :name="triggerIcon" class="size-4" />
          <template #fallback>
            <Icon name="lucide:monitor" class="size-4" />
          </template>
        </ClientOnly>
      </PopoverTrigger>
      <span
        v-if="!open"
        class="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground opacity-0 shadow-md transition-opacity delay-200 duration-150 group-hover/nav-tt:opacity-100"
        role="tooltip"
      >
        {{ t('nav.theme_settings') }}
      </span>
    </span>

    <PopoverContent align="end" class="w-60 p-3">
      <p
        class="px-1 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase ar:normal-case"
      >
        {{ t('theme.mode') }}
      </p>
      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="m in modes"
          :key="m.key"
          type="button"
          class="flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs transition-colors"
          :class="
            mode === m.key
              ? 'border-foreground/30 bg-accent text-accent-foreground'
              : 'border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          "
          @click="setMode(m.key)"
        >
          <Icon :name="m.icon" class="size-4" />
          {{ t(`theme.modes.${m.key}`) }}
        </button>
      </div>

      <p
        class="mt-4 px-1 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase ar:normal-case"
      >
        {{ t('theme.accent') }}
      </p>
      <div class="grid grid-cols-7 gap-1.5">
        <button
          v-for="p in presets"
          :key="p.key"
          type="button"
          class="relative grid size-7 place-items-center rounded-full border-2 transition-transform hover:scale-110"
          :class="accent === p.key ? 'border-foreground' : 'border-transparent'"
          :style="{ backgroundColor: swatchColor(p) }"
          :aria-label="t(`theme.accents.${p.key}`)"
          :title="t(`theme.accents.${p.key}`)"
          @click="setAccent(p.key)"
        >
          <Icon
            v-if="accent === p.key"
            name="lucide:check"
            class="size-3.5 text-primary-foreground"
          />
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>
