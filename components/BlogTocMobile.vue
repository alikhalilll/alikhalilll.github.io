<script setup lang="ts">
interface TocLink {
  id: string;
  depth: number;
  text: string;
  children?: TocLink[];
}

const props = defineProps<{
  links?: TocLink[];
}>();

const { t } = useI18n();
const isOpen = ref(false);

const flat = computed(() => {
  const out: TocLink[] = [];
  const walk = (nodes: TocLink[] = []) => {
    for (const n of nodes) {
      if (n.depth <= 3) out.push(n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(props.links ?? []);
  return out;
});

const ids = computed(() => flat.value.map((s) => s.id));
const activeId = useActiveHeading(ids);
const activeSection = computed(
  () => flat.value.find((s) => s.id === activeId.value) ?? flat.value[0] ?? null
);

const route = useRoute();
watch(
  () => route.fullPath,
  () => {
    isOpen.value = false;
  }
);

function scrollTo(id: string, e: MouseEvent) {
  e.preventDefault();
  isOpen.value = false;
  nextTick(() => scrollToHash(id));
}
</script>

<template>
  <div
    v-if="flat.length"
    data-mobile-toc-bar
    class="sticky top-16 z-20 -mx-6 my-8 border-y border-border bg-background/85 backdrop-blur-xl lg:hidden"
  >
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 px-6 py-3 text-start transition-colors hover:bg-accent/60 hover:text-accent-foreground"
      :aria-expanded="isOpen"
      :aria-label="t('blog.toc.toggle')"
      @click="isOpen = !isOpen"
    >
      <span class="flex min-w-0 items-center gap-3">
        <span
          class="font-mono text-[11px] font-semibold tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
        >
          {{ t('common.on_this_page') }}
        </span>
        <span class="truncate text-sm font-medium text-primary">
          {{ activeSection?.text ?? t('common.overview') }}
        </span>
      </span>
      <Icon
        name="lucide:chevron-down"
        :class="[
          'size-4 shrink-0 text-muted-foreground transition-transform',
          isOpen ? 'rotate-180' : '',
        ]"
      />
    </button>

    <div v-if="isOpen" class="max-h-[60vh] overflow-y-auto border-t border-border px-6 py-3">
      <ul class="m-0 list-none border-s border-border p-0">
        <li
          v-for="section in flat"
          :key="section.id"
          :class="['-ms-px', section.depth === 3 ? 'ps-3' : '']"
        >
          <a
            :href="`#${section.id}`"
            :class="[
              'block border-s-2 px-3 py-1.5 text-[13px] leading-snug no-underline transition-colors',
              activeId === section.id
                ? 'border-primary bg-primary/10 font-medium text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ]"
            @click="scrollTo(section.id, $event)"
          >
            {{ section.text }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
