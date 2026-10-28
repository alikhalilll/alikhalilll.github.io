<script setup lang="ts">
import { computed, ref } from 'vue';
import { useElementSize } from '@vueuse/core';
import {
  Handle,
  Position,
  VueFlow,
  type Edge,
  type Node,
  type NodeMouseEvent,
} from '@vue-flow/core';
import { useRouter } from 'vue-router';

import { phasePath, roadmapPath } from '../routes';

interface TreeLeaf {
  label: string;
  detail: string;
}

interface TreeBranch {
  key: string;
  kicker: string;
  title: string;
  subtitle: string;
  summary: string;
  icon: string;
  tone: string;
  phaseKey: string;
  leaves: TreeLeaf[];
}

const props = defineProps<{
  planId: string;
}>();

const branches: TreeBranch[] = [
  {
    key: 'frontend',
    kicker: 'Branch 01 · Client',
    title: 'Frontend',
    subtitle: 'Vue 3 SPA',
    summary: 'The interface, navigation and state that turn user intent into API calls.',
    icon: 'lucide:monitor-smartphone',
    tone: 'violet',
    phaseKey: 'api',
    leaves: [
      { label: 'Vue Router', detail: 'Pages, layouts and navigation guards' },
      { label: 'Pinia stores', detail: 'Shared state and server-state caching' },
      { label: 'Components', detail: 'Reusable UI, forms and loading states' },
      { label: 'API client', detail: 'Typed requests, errors and retries' },
    ],
  },
  {
    key: 'backend',
    kicker: 'Branch 02 · Server',
    title: 'Backend',
    subtitle: 'Laravel API',
    summary: 'The contract, authorization and business rules that protect the domain.',
    icon: 'lucide:server',
    tone: 'blue',
    phaseKey: 'laravel',
    leaves: [
      { label: 'Routes & middleware', detail: 'Versioned endpoints and throttling' },
      { label: 'Validation', detail: 'Form requests before the domain runs' },
      { label: 'Controllers & actions', detail: 'Small entry points around real logic' },
      { label: 'Policies & resources', detail: 'Authorization and predictable JSON' },
    ],
  },
  {
    key: 'data',
    kicker: 'Branch 03 · Persistence',
    title: 'Data',
    subtitle: 'MySQL · Redis · S3',
    summary: 'The source of truth, the fast path and the work that happens later.',
    icon: 'lucide:database',
    tone: 'teal',
    phaseKey: 'api',
    leaves: [
      { label: 'MySQL', detail: 'Schema, indexes and transactions' },
      { label: 'Redis', detail: 'Cache, sessions and rate limits' },
      { label: 'Queue workers', detail: 'Jobs, events and retries' },
      { label: 'Object storage', detail: 'Uploads and generated files' },
    ],
  },
  {
    key: 'delivery',
    kicker: 'Branch 04 · Operations',
    title: 'Delivery',
    subtitle: 'CI/CD & observability',
    summary: 'The repeatable release path that turns working code into a safe deployment.',
    icon: 'lucide:rocket',
    tone: 'amber',
    phaseKey: 'quality',
    leaves: [
      { label: 'Automated tests', detail: 'Unit, feature and API coverage' },
      { label: 'GitHub Actions', detail: 'Lint, test, build and release gates' },
      { label: 'Docker', detail: 'One image for staging and production' },
      { label: 'Logs & alerts', detail: 'Health checks, metrics and rollback' },
    ],
  },
];

const canvas = ref<HTMLElement | null>(null);
const { width: canvasWidth } = useElementSize(canvas);

const router = useRouter();

// Programmatic nav: vue-flow owns pointer events on its node wrapper, so a
// child <a>/<NuxtLink> doesn't always get the click. We bind @node-click on
// VueFlow itself and read `href` off node.data.
const onNodeClick = ({ node }: NodeMouseEvent) => {
  const href = (node.data as { href?: string } | undefined)?.href;
  if (href) router.push(href);
};

const PAD = 10;
const COLUMN_GAP = 22;
const ROOT_H = 130;
const BRANCH_HEAD_H = 128;

const layoutWidth = computed(() => Math.max(320, canvasWidth.value || 1200));
const columns = computed(() => {
  if (layoutWidth.value < 680) return 1;
  if (layoutWidth.value < 1080) return 2;
  return 4;
});
const columnWidth = computed(
  () =>
    Math.floor((layoutWidth.value - PAD * 2 - COLUMN_GAP * (columns.value - 1)) / columns.value) ||
    280
);
const branchHeight = computed(() => BRANCH_HEAD_H + branches[0].leaves.length * 52 + 24);

const edgeStyle = (tone: string) => ({
  stroke: `var(--phase-${tone})`,
  strokeWidth: 1.5,
  opacity: 0.85,
});

const flow = computed(() => {
  const cols = columns.value;
  const colW = columnWidth.value;
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const rootWidth = Math.min(520, layoutWidth.value - PAD * 2);
  const rootY = 20;

  nodes.push({
    id: 'stack-root',
    type: 'stack-root',
    position: { x: (layoutWidth.value - rootWidth) / 2, y: rootY },
    data: { href: roadmapPath(props.planId) },
    draggable: false,
    selectable: false,
    style: { width: `${rootWidth}px`, height: `${ROOT_H}px` },
  });

  const rowCount = Math.ceil(branches.length / cols);
  let rowY = rootY + ROOT_H + 72;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = branches.slice(rowIndex * cols, rowIndex * cols + cols);
    const rowOffset = ((cols - row.length) * (colW + COLUMN_GAP)) / 2;

    row.forEach((branch, columnIndex) => {
      const x = PAD + rowOffset + columnIndex * (colW + COLUMN_GAP);
      nodes.push({
        id: `stack-branch-${branch.key}`,
        type: 'stack-branch',
        position: { x, y: rowY },
        data: { branch, href: phasePath(props.planId, branch.phaseKey) },
        draggable: false,
        selectable: false,
        style: { width: `${colW}px`, height: `${branchHeight.value}px` },
      });
      edges.push({
        id: `stack-root-${branch.key}`,
        source: 'stack-root',
        target: `stack-branch-${branch.key}`,
        type: 'smoothstep',
        style: edgeStyle(branch.tone),
      });
    });

    rowY += branchHeight.value + 56;
  }

  return {
    nodes,
    edges,
    height: rowY + 8,
  };
});
</script>

<template>
  <div class="stack-flow grid gap-4">
    <!-- Toolbar: title + hint -->
    <header
      class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3"
    >
      <div class="grid gap-0.5">
        <span
          class="stack-kicker text-[0.7rem] font-bold uppercase tracking-widest text-[var(--brand)]"
        >
          Stack tree
        </span>
        <strong class="font-[var(--font-display)] text-[1.02rem] leading-tight text-[var(--ink)]">
          One system, four branches — tap any node to open its phase
        </strong>
      </div>
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1 text-[0.76rem] text-[var(--muted)]"
      >
        <Icon name="lucide:git-fork" class="learning-icon text-[var(--brand)]" />
        Root → branch → capability
      </span>
    </header>

    <!-- Canvas with vue-flow diagram -->
    <div
      ref="canvas"
      class="stack-canvas relative w-full overflow-hidden rounded-xl border border-[var(--line)]"
      :style="{ height: `${flow.height}px` }"
    >
      <ClientOnly>
        <VueFlow
          :nodes="flow.nodes"
          :edges="flow.edges"
          :default-viewport="{ x: 0, y: 0, zoom: 1 }"
          :min-zoom="1"
          :max-zoom="1"
          :nodes-draggable="false"
          :nodes-connectable="false"
          :elements-selectable="false"
          :pan-on-drag="false"
          :zoom-on-scroll="false"
          :zoom-on-pinch="false"
          :zoom-on-double-click="false"
          :prevent-scrolling="false"
          :fit-view-on-init="false"
          class="stack-vue-flow"
          @node-click="onNodeClick"
        >
          <!-- Root node: links to roadmap -->
          <template #node-stack-root>
            <NuxtLink
              :to="roadmapPath(planId)"
              class="stack-node stack-root group flex h-full w-full items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-md"
              title="Open the plan roadmap"
            >
              <span
                class="grid h-11 w-11 flex-none place-items-center rounded-lg border border-[var(--brand)]/20 bg-[var(--brand-soft)] text-[var(--brand)] transition-transform group-hover:scale-105"
              >
                <Icon name="lucide:workflow" class="learning-icon text-lg" />
              </span>
              <div class="grid min-w-0 gap-0.5">
                <span class="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--brand)]">
                  Full-stack roadmap
                </span>
                <strong
                  class="font-[var(--font-display)] text-[1.18rem] font-bold leading-tight text-[var(--ink)]"
                >
                  Product engineering
                </strong>
                <small class="text-[0.82rem] text-[var(--muted)]">
                  Client → API → Data → Delivery
                </small>
              </div>
              <span
                class="ml-auto hidden items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2 py-1 text-[0.72rem] text-[var(--muted)] group-hover:text-[var(--brand)] sm:inline-flex"
              >
                Open
                <Icon name="lucide:arrow-right" class="learning-icon" />
              </span>
              <Handle type="source" :position="Position.Bottom" class="stack-handle" />
            </NuxtLink>
          </template>

          <!-- Branch node: links to that layer's phase -->
          <template #node-stack-branch="{ data }">
            <NuxtLink
              :to="phasePath(planId, data.branch.phaseKey)"
              class="stack-node stack-branch group flex h-full w-full flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[color:var(--phase-color)] hover:shadow-md"
              :data-tone="data.branch.tone"
              :title="`Open the ${data.branch.title} phase`"
            >
              <div class="grid gap-1 border-b border-[var(--line)] bg-[var(--surface-2)] p-4">
                <div class="flex items-center justify-between gap-2">
                  <span
                    class="grid h-8 w-8 place-items-center rounded-md border border-[var(--line)] bg-[var(--surface)] text-[color:var(--phase-color)]"
                  >
                    <Icon :name="data.branch.icon" class="learning-icon" />
                  </span>
                  <span
                    class="truncate text-[0.64rem] font-bold uppercase tracking-wider text-[color:var(--phase-color)]"
                  >
                    {{ data.branch.kicker }}
                  </span>
                </div>
                <h3 class="m-0 text-[1.16rem] font-bold leading-tight text-[var(--ink)]">
                  {{ data.branch.title }}
                </h3>
                <small class="text-[0.78rem] text-[var(--muted)]">{{ data.branch.subtitle }}</small>
                <p class="m-0 mt-0.5 line-clamp-2 text-[0.82rem] leading-snug text-[var(--muted)]">
                  {{ data.branch.summary }}
                </p>
              </div>
              <ul class="m-0 grid list-none p-0">
                <li
                  v-for="(leaf, idx) in data.branch.leaves"
                  :key="leaf.label"
                  class="flex min-h-[52px] items-start gap-2 px-3 py-2"
                  :class="idx !== 0 && 'border-t border-[var(--line)]'"
                >
                  <span
                    class="mt-[7px] h-1.5 w-1.5 flex-none rounded-full border border-[color:var(--phase-color)] bg-[var(--surface)]"
                  />
                  <div class="grid min-w-0 gap-0">
                    <strong class="text-[0.84rem] font-semibold leading-snug text-[var(--ink)]">
                      {{ leaf.label }}
                    </strong>
                    <span class="truncate text-[0.72rem] leading-tight text-[var(--muted)]">
                      {{ leaf.detail }}
                    </span>
                  </div>
                </li>
              </ul>
              <span
                class="mt-auto flex items-center justify-between gap-2 border-t border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-[0.74rem] font-semibold text-[var(--muted)] transition-colors group-hover:text-[color:var(--phase-color)]"
              >
                Open phase
                <Icon name="lucide:arrow-right" class="learning-icon" />
              </span>
              <Handle type="target" :position="Position.Top" class="stack-handle" />
            </NuxtLink>
          </template>
        </VueFlow>
        <template #fallback>
          <div class="grid h-full place-items-center text-sm text-[var(--muted)]">
            Loading the stack tree…
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap items-center gap-3 text-[0.78rem] text-[var(--muted)]">
      <span class="font-semibold text-[var(--ink)]">Read the tree</span>
      <span class="inline-flex items-center gap-1.5">
        <i class="h-2 w-2 rounded-full bg-[var(--brand)]" />
        Root: the system
      </span>
      <span class="inline-flex items-center gap-1.5">
        <i class="h-2 w-2 rounded-full bg-[var(--phase-blue)]" />
        Branch: a layer
      </span>
      <span class="inline-flex items-center gap-1.5">
        <i class="h-2 w-2 rounded-full border border-[var(--line-strong)] bg-[var(--surface)]" />
        Leaf: a capability
      </span>
      <span class="ml-auto inline-flex items-center gap-1 text-[var(--brand)]">
        <Icon name="lucide:mouse-pointer-2" class="learning-icon" />
        Click any node
      </span>
    </div>
  </div>
</template>

<style scoped>
/* Dotted canvas background. */
.stack-canvas {
  background:
    radial-gradient(var(--dot) 1px, transparent 1px) 0 0 / 18px 18px,
    var(--surface);
}

.stack-canvas :deep(.vue-flow) {
  width: 100%;
  height: 100%;
}

.stack-canvas :deep(.vue-flow__pane) {
  cursor: default;
}

.stack-canvas :deep(.vue-flow__node) {
  padding: 0;
  font-family: var(--font-body);
  background: transparent;
  border: 0;
  box-shadow: none;
  cursor: pointer;
}

.stack-canvas :deep(.vue-flow__edge-path) {
  stroke-linecap: round;
}

/* vue-flow handles exist only for edge connectivity. Keep them invisible but
   on the page so edges can resolve their positions. */
.stack-handle {
  width: 1px;
  height: 1px;
  min-width: 1px;
  min-height: 1px;
  opacity: 0;
  pointer-events: none;
  border: 0;
}

/* Keep the tone CSS variable mapping — PlanOverview sets data-tone on the
   diagram container, and these branches inherit by matching their own tone. */
.stack-branch[data-tone='violet'] {
  --phase-color: var(--phase-violet);
}

.stack-branch[data-tone='blue'] {
  --phase-color: var(--phase-blue);
}

.stack-branch[data-tone='teal'] {
  --phase-color: var(--phase-teal);
}

.stack-branch[data-tone='amber'] {
  --phase-color: var(--phase-amber);
}

.stack-branch[data-tone='rose'] {
  --phase-color: var(--phase-rose);
}

.stack-branch[data-tone='indigo'] {
  --phase-color: var(--phase-indigo);
}
</style>
