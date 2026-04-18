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
    class="sticky top-24 hidden max-h-[calc(100vh-8rem)] self-start overflow-y-auto xl:block"
  >
    <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      On this page
    </p>
    <ul class="m-0 list-none border-l border-border p-0">
      <li v-for="link in flat" :key="link.id" :class="['-ml-px', link.depth === 3 ? 'pl-3' : '']">
        <a
          :href="`#${link.id}`"
          :class="[
            'block rounded-r-md border-l-2 px-3 py-1 text-[13px] leading-snug no-underline transition-colors',
            activeId === link.id
              ? 'border-primary bg-accent font-medium text-primary'
              : 'border-transparent text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground',
          ]"
          @click="scrollTo(link.id, $event)"
        >
          {{ link.text }}
        </a>
      </li>
    </ul>
  </aside>
</template>
