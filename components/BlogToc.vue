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

function flatten(nodes: TocLink[] = []): TocLink[] {
  const out: TocLink[] = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children?.length) out.push(...flatten(n.children));
  }
  return out;
}

const flat = computed(() => flatten(props.links ?? []).filter((n) => n.depth <= 3));
const ids = computed(() => flat.value.map((n) => n.id));
const activeId = useActiveHeading(ids);

function scrollTo(id: string, e: MouseEvent) {
  e.preventDefault();
  scrollToHash(id);
}
</script>

<template>
  <aside
    v-if="flat.length"
    class="sticky top-24 hidden max-h-[calc(100vh-8rem)] self-start overflow-y-auto lg:block"
  >
    <p
      class="mb-4 font-mono text-[11px] font-semibold tracking-widest text-muted-foreground uppercase ar:font-sans ar:text-xs ar:tracking-normal ar:normal-case"
    >
      {{ t('common.on_this_page') }}
    </p>
    <ul class="m-0 list-none border-s border-border p-0">
      <li v-for="link in flat" :key="link.id" :class="['-ms-px', link.depth === 3 ? 'ps-3' : '']">
        <NuxtLink
          :to="`#${link.id}`"
          :class="[
            'block rounded-e-md border-s-2 px-3 py-1.5 text-[13px] leading-snug no-underline transition-colors',
            activeId === link.id
              ? 'border-primary bg-accent font-medium text-primary'
              : 'border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground',
          ]"
          @click="scrollTo(link.id, $event)"
        >
          {{ link.text }}
        </NuxtLink>
      </li>
    </ul>
  </aside>
</template>
