<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { localeLabels, type Locales } from '~/constants/i18n';

const { activeLocale, localeList, handleSetLocale } = useI18nHandler();
const { t } = useI18n();

const open = ref(false);

const currentLabel = computed(() => {
  const code = activeLocale.value as Locales;
  return localeLabels[code]?.native ?? code;
});

async function choose(code: Locales, event?: Event) {
  event?.preventDefault();
  open.value = false;
  if (code === (activeLocale.value as Locales)) return;
  await handleSetLocale(code);
}
</script>

<template>
  <Popover v-model:open="open">
    <span class="group/nav-tt relative inline-flex">
      <PopoverTrigger
        :aria-label="`${t('nav.language')} · ${currentLabel}`"
        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground sm:h-9 sm:w-9"
      >
        <Icon name="lucide:languages" class="size-4" />
      </PopoverTrigger>
      <span
        v-if="!open"
        class="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground opacity-0 shadow-md transition-opacity delay-200 duration-150 group-hover/nav-tt:opacity-100"
        role="tooltip"
      >
        {{ t('nav.language') }} · {{ currentLabel }}
      </span>
    </span>

    <PopoverContent align="end" class="w-56 p-1">
      <Command>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="l in localeList"
              :key="l.code"
              :value="l.code"
              class="flex cursor-pointer items-center justify-between gap-2"
              @select="(e: Event) => choose(l.code as Locales, e)"
              @click="(e: Event) => choose(l.code as Locales, e)"
            >
              <span class="flex items-center gap-2">
                <span aria-hidden="true">{{ localeLabels[l.code as Locales]?.flag }}</span>
                <span>{{ l.name }}</span>
              </span>
              <Icon
                v-if="l.code === activeLocale"
                name="lucide:check"
                class="size-4 text-foreground"
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
