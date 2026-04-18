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
    <PopoverTrigger
      :aria-label="t('nav.language')"
      :title="t('nav.language')"
      class="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Icon name="lucide:languages" class="size-4" />
      <span class="hidden sm:inline">{{ currentLabel }}</span>
    </PopoverTrigger>

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
