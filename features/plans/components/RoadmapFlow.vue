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

import type { PhaseKey, PlanTopic } from '~/features/plan1/types';
import type { NextAction, QuizResult, TopicStatus } from '../composables/usePlanProgress';
import { getPlanRuntime } from '../planRuntime';
import { phasePath, roadmapPath, topicPath } from '../routes';

const props = defineProps<{
  planId: string;
  phaseProgress: Array<{
    key: PhaseKey;
    title: string;
    tone: string;
    done: number;
    total: number;
    percent: number;
    unlocked: boolean;
    quizPassed: boolean;
  }>;
  nextAction: NextAction;
  getTopicStatus: (topicId: string) => TopicStatus;
  getTopicResult: (topicId: string) => QuizResult | undefined;
  getPhaseQuizStatus: (phaseKey: PhaseKey) => 'complete' | 'available' | 'locked';
  getPhaseResult: (phaseKey: PhaseKey) => QuizResult | undefined;
}>();

interface FlowTopic {
  id: string;
  order: number;
  title: string;
  stage: string;
  href: string;
  status: TopicStatus;
  locked: boolean;
  next: boolean;
  stateLabel: string;
  score?: number;
}

interface FlowWeek {
  number: number;
  title: string;
  stage: string;
  href: string;
  done: number;
  total: number;
  percent: number;
  topics: FlowTopic[];
}

interface FlowGate {
  phaseKey: PhaseKey;
  phaseNumber: number;
  title: string;
  role: string;
  href: string;
  status: 'complete' | 'available' | 'locked';
  statusLabel: string;
  locked: boolean;
  next: boolean;
  topicCount: number;
}

interface FlowPhase {
  key: PhaseKey;
  number: number;
  title: string;
  goal: string;
  tone: string;
  weekRange: string;
  weeks: FlowWeek[];
  role: string;
  done: number;
  total: number;
  percent: number;
  state: 'complete' | 'active' | 'locked';
  stateLabel: string;
  gate: FlowGate;
}

const lockedNotice = ref('');

const runtime = computed(() => getPlanRuntime(props.planId));
const phases = computed(() => runtime.value?.phases ?? []);
const topics = computed(() => runtime.value?.topics ?? []);

const isNextTopic = (topic: PlanTopic) =>
  props.nextAction.kind === 'topic' && props.nextAction.topic.id === topic.id;

const isNextGate = (phaseKey: PhaseKey) =>
  props.nextAction.kind === 'phase' && props.nextAction.phase.key === phaseKey;

const phaseStatusLabel = (state: FlowPhase['state'], gateStatus: FlowGate['status']) => {
  if (state === 'complete') return 'Complete';
  if (gateStatus === 'available') return 'Gate ready';
  return state === 'active' ? 'In progress' : 'Locked';
};

const topicStateLabel = (topic: PlanTopic) => {
  const status = props.getTopicStatus(topic.id);
  if (status === 'complete') return 'Passed';
  if (status === 'available') return isNextTopic(topic) ? 'Next up' : 'Open';
  return 'Locked';
};

const gateStatusLabel = (phaseKey: PhaseKey) => {
  const status = props.getPhaseQuizStatus(phaseKey);
  if (status === 'complete') return 'Gate passed';
  if (status === 'available') return isNextGate(phaseKey) ? 'Next up' : 'Open gate';
  return 'Locked';
};

const phaseCards = computed<FlowPhase[]>(() =>
  phases.value.map((phase) => {
    const progress = props.phaseProgress.find((entry) => entry.key === phase.key);
    const gateStatus = props.getPhaseQuizStatus(phase.key);
    const done = progress?.done ?? 0;
    const total = progress?.total ?? 0;
    const state = gateStatus === 'complete' ? 'complete' : progress?.unlocked ? 'active' : 'locked';
    const weeks = phase.weeksData.map<FlowWeek>((week) => {
      const weekTopics = runtime.value?.topicsByWeek[week.number] ?? [];
      const topicLeaves = weekTopics.map<FlowTopic>((topic) => {
        const status = props.getTopicStatus(topic.id);
        return {
          id: topic.id,
          order: topic.order,
          title: topic.title,
          stage: topic.stage,
          href: topicPath(props.planId, topic.id),
          status,
          locked: status === 'locked',
          next: isNextTopic(topic),
          stateLabel: topicStateLabel(topic),
          score: props.getTopicResult(topic.id)?.bestScore,
        };
      });
      const weekDone = topicLeaves.filter((topic) => topic.status === 'complete').length;

      return {
        number: week.number,
        title: week.title,
        stage: week.stage,
        href: topicLeaves[0]?.href ?? roadmapPath(props.planId),
        done: weekDone,
        total: topicLeaves.length,
        percent: topicLeaves.length === 0 ? 0 : Math.round((weekDone / topicLeaves.length) * 100),
        topics: topicLeaves,
      };
    });

    return {
      key: phase.key,
      number: phase.number,
      title: phase.title,
      goal: phase.goal,
      tone: phase.tone,
      weekRange: phase.weeks,
      weeks,
      role: phase.role.title,
      done,
      total,
      percent: progress?.percent ?? 0,
      state,
      stateLabel: phaseStatusLabel(state, gateStatus),
      gate: {
        phaseKey: phase.key,
        phaseNumber: phase.number,
        title: phase.title,
        role: phase.role.title,
        href: phasePath(props.planId, phase.key),
        status: gateStatus,
        statusLabel: gateStatusLabel(phase.key),
        locked: gateStatus === 'locked',
        next: isNextGate(phase.key),
        topicCount: total,
      },
    };
  })
);

const totalDone = computed(() => phaseCards.value.reduce((total, card) => total + card.done, 0));
const totalWeeks = computed(() =>
  phaseCards.value.reduce((total, card) => total + card.weeks.length, 0)
);
const overallPercent = computed(() =>
  topics.value.length === 0 ? 0 : Math.round((totalDone.value / topics.value.length) * 100)
);

const nextLabel = computed(() => {
  if (props.nextAction.kind === 'topic') {
    return `Next up · ${props.nextAction.topic.title}`;
  }
  if (props.nextAction.kind === 'phase') {
    return `Gate ready · ${props.nextAction.phase.title}`;
  }
  return 'Path complete · every gate passed';
});

const handleLockedTopic = (topic: FlowTopic) => {
  lockedNotice.value = `Locked. Pass the previous topic quiz first to open “${topic.title}”.`;
};

const handleLockedGate = (gate: FlowGate) => {
  lockedNotice.value = `Phase ${gate.phaseNumber} gate is locked. Pass all ${gate.topicCount} topic quizzes in ${gate.title} first.`;
};

const canvas = ref<HTMLElement | null>(null);
const { width: canvasWidth } = useElementSize(canvas);

const router = useRouter();

// vue-flow owns pointer events on its node wrapper; a child <a>/<button>
// inside can get its click swallowed. We bind @node-click on VueFlow and
// read navigation / locked data off node.data, which works regardless of
// which internal element received the pointer event.
const onNodeClick = ({ event, node }: NodeMouseEvent) => {
  // Fine-grained sub-region nav (set via data-nav-href on inner elements —
  // used in the week node, which has a header + many topic rows + a gate).
  const target = (event?.target ?? null) as HTMLElement | null;
  const navEl = target?.closest('[data-nav-href],[data-nav-locked]') as HTMLElement | null;
  if (navEl) {
    const locked = navEl.dataset.navLocked;
    if (locked) {
      lockedNotice.value = locked;
      return;
    }
    const href = navEl.dataset.navHref;
    if (href) {
      router.push(href);
      return;
    }
  }

  // Fall back: whole-node nav from node.data.
  const data = node.data as { href?: string; lockedMessage?: string } | undefined;
  if (!data) return;
  if (data.lockedMessage) {
    lockedNotice.value = data.lockedMessage;
    return;
  }
  if (data.href) router.push(data.href);
};

const PAD = 10;
const COLUMN_GAP = 26;
const ROOT_H = 176;
const PHASE_H = 212;
const GATE_H = 90;
const TOPIC_ROW_H = 54;
const WEEK_HEADER_H = 76;

const layoutWidth = computed(() => Math.max(320, canvasWidth.value || 1200));
const columns = computed(() => {
  if (layoutWidth.value < 700) return 1;
  if (layoutWidth.value < 1100) return 2;
  return 3;
});
const columnWidth = computed(
  () =>
    Math.floor((layoutWidth.value - PAD * 2 - COLUMN_GAP * (columns.value - 1)) / columns.value) ||
    320
);

const weekHeight = (week: FlowWeek) => WEEK_HEADER_H + week.topics.length * TOPIC_ROW_H + 12;

const edgeStyle = (tone: string, state: FlowPhase['state']) => ({
  stroke: state === 'locked' ? 'var(--line-strong)' : `var(--phase-${tone})`,
  strokeWidth: state === 'active' ? 2 : 1.5,
  opacity: state === 'locked' ? 0.55 : 0.9,
});

const flow = computed(() => {
  const cols = columns.value;
  const colW = columnWidth.value;
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const rootWidth = Math.min(480, layoutWidth.value - PAD * 2);
  const rootY = 18;

  nodes.push({
    id: 'roadmap-root',
    type: 'roadmap-root',
    position: { x: (layoutWidth.value - rootWidth) / 2, y: rootY },
    data: {
      topics: topics.value.length,
      phases: phases.value.length,
      weeks: totalWeeks.value,
      done: totalDone.value,
      percent: overallPercent.value,
      nextLabel: nextLabel.value,
      href:
        props.nextAction.kind === 'topic'
          ? topicPath(props.planId, props.nextAction.topic.id)
          : props.nextAction.kind === 'phase'
            ? phasePath(props.planId, props.nextAction.phase.key)
            : roadmapPath(props.planId),
    },
    draggable: false,
    selectable: false,
    style: { width: `${rootWidth}px`, height: `${ROOT_H}px` },
  });

  let rowY = rootY + ROOT_H + 78;
  const rowCount = Math.ceil(phaseCards.value.length / cols);

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = phaseCards.value.slice(rowIndex * cols, rowIndex * cols + cols);
    const rowOffset = ((cols - row.length) * (colW + COLUMN_GAP)) / 2;
    let rowHeight = 0;

    row.forEach((phase, columnIndex) => {
      const x = PAD + rowOffset + columnIndex * (colW + COLUMN_GAP);
      const style = { width: `${colW}px`, height: `${PHASE_H}px` };
      const position = { x, y: rowY };

      nodes.push({
        id: `phase-${phase.key}`,
        type: 'roadmap-phase',
        position,
        data: { phase, href: phase.gate.href },
        draggable: false,
        selectable: false,
        style,
      });
      edges.push({
        id: `root-${phase.key}`,
        source: 'roadmap-root',
        target: `phase-${phase.key}`,
        type: 'smoothstep',
        style: edgeStyle(phase.tone, phase.state),
      });

      let nextY = rowY + PHASE_H + 30;
      let previousId = `phase-${phase.key}`;

      phase.weeks.forEach((week) => {
        const height = weekHeight(week);
        nodes.push({
          id: `week-${week.number}`,
          type: 'roadmap-week',
          position: { x: x + 18, y: nextY },
          // href is the fallback (clicking the week card background opens the
          // first topic). Per-row data-nav-href on inner elements overrides.
          data: { week, tone: phase.tone, href: week.href },
          draggable: false,
          selectable: false,
          style: { width: `${Math.max(240, colW - 18)}px`, height: `${height}px` },
        });
        edges.push({
          id: `${previousId}-week-${week.number}`,
          source: previousId,
          target: `week-${week.number}`,
          type: 'smoothstep',
          style: edgeStyle(phase.tone, phase.state),
        });
        previousId = `week-${week.number}`;
        nextY += height + 14;
      });

      const gateY = nextY + 12;
      nodes.push({
        id: `gate-${phase.key}`,
        type: 'roadmap-gate',
        position: { x: x + 18, y: gateY },
        data: {
          gate: phase.gate,
          tone: phase.tone,
          ...(phase.gate.locked
            ? {
                lockedMessage: `Phase ${phase.gate.phaseNumber} gate is locked. Pass all ${phase.gate.topicCount} topic quizzes in ${phase.gate.title} first.`,
              }
            : { href: phase.gate.href }),
        },
        draggable: false,
        selectable: false,
        style: { width: `${Math.max(240, colW - 18)}px`, height: `${GATE_H}px` },
      });
      edges.push({
        id: `${previousId}-gate-${phase.key}`,
        source: previousId,
        target: `gate-${phase.key}`,
        type: 'smoothstep',
        style: edgeStyle(phase.tone, phase.state),
      });

      rowHeight = Math.max(rowHeight, gateY + GATE_H - rowY);
    });

    rowY += rowHeight + 80;
  }

  return {
    nodes,
    edges,
    height: rowY + 8,
  };
});
</script>

<template>
  <div class="roadmap-flow grid gap-4">
    <!-- Locked notice banner -->
    <div
      v-if="lockedNotice"
      role="status"
      class="flex items-center gap-2.5 rounded-lg border border-[color-mix(in_oklab,var(--brand)_30%,var(--line))] bg-[var(--brand-soft)] px-3.5 py-3 text-[0.9rem] text-[var(--ink)]"
    >
      <Icon name="lucide:lock" class="learning-icon text-[var(--brand)]" />
      <span class="flex-1">{{ lockedNotice }}</span>
      <button
        type="button"
        aria-label="Dismiss message"
        class="grid rounded-md p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
        @click="lockedNotice = ''"
      >
        <Icon name="lucide:x" class="learning-icon" />
      </button>
    </div>

    <!-- Toolbar -->
    <header
      class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3"
    >
      <div class="grid gap-0.5">
        <span
          class="inline-flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-[var(--brand)]"
        >
          <Icon name="lucide:git-fork" class="learning-icon" />
          Roadmap tree
        </span>
        <strong class="font-[var(--font-display)] text-[1rem] leading-tight text-[var(--ink)]">
          Root → phase → week → topic — tap any card to jump in
        </strong>
      </div>
      <div class="flex flex-wrap items-center gap-3 text-[0.78rem] text-[var(--muted)]">
        <span class="inline-flex items-center gap-1.5">
          <i class="h-2 w-2 rounded-full bg-[var(--success)]" />
          Passed
        </span>
        <span class="inline-flex items-center gap-1.5">
          <i class="h-2 w-2 rounded-full bg-[var(--brand)]" />
          Open
        </span>
        <span class="inline-flex items-center gap-1.5">
          <i class="h-2 w-2 rounded-full bg-[var(--muted)]" />
          Locked
        </span>
      </div>
    </header>

    <!-- Diagram canvas -->
    <div
      ref="canvas"
      class="rf-canvas relative w-full overflow-hidden rounded-xl border border-[var(--line)]"
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
          class="rf-vue-flow"
          @node-click="onNodeClick"
        >
          <!-- Root node -->
          <template #node-roadmap-root="{ data }">
            <NuxtLink
              :to="data.href"
              class="rf-node rf-root group flex h-full w-full items-center justify-between gap-5 rounded-xl border border-[var(--line)] border-t-[3px] border-t-[var(--brand)] bg-[var(--surface)] px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-md"
              title="Open your next step"
            >
              <div class="grid min-w-0 gap-1">
                <span
                  class="inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-widest text-[var(--brand)]"
                >
                  <Icon name="lucide:git-fork" class="learning-icon" />
                  Learning tree
                </span>
                <strong
                  class="font-[var(--font-display)] text-[1.08rem] leading-tight text-[var(--ink)]"
                >
                  {{ data.phases }} phases · {{ data.weeks }} weeks · {{ data.topics }} topics
                </strong>
                <p class="m-0 text-[0.86rem] leading-snug text-[var(--muted)]">
                  One root, followed in order. Pass a topic to open the next leaf.
                </p>
                <span
                  class="mt-0.5 inline-flex max-w-full items-center gap-1.5 self-start truncate rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2 py-1 text-[0.76rem] font-medium text-[var(--ink)]"
                >
                  <Icon name="lucide:flag" class="learning-icon flex-none text-[var(--brand)]" />
                  <span class="truncate">{{ data.nextLabel }}</span>
                </span>
              </div>
              <div class="grid w-[132px] flex-none gap-1.5">
                <strong
                  class="font-[var(--font-display)] text-[1.6rem] font-bold leading-none text-[var(--ink)]"
                >
                  {{ data.percent }}%
                </strong>
                <div class="h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
                  <span
                    class="block h-full rounded-full bg-[var(--brand)] transition-all"
                    :style="{ width: `${data.percent}%` }"
                  />
                </div>
                <small class="text-[0.74rem] text-[var(--muted)]">
                  {{ data.done }} / {{ data.topics }} topics passed
                </small>
              </div>
              <Handle type="source" :position="Position.Bottom" class="rf-handle" />
            </NuxtLink>
          </template>

          <!-- Phase node -->
          <template #node-roadmap-phase="{ data }">
            <NuxtLink
              :to="data.phase.gate.href"
              class="rf-node rf-phase group flex h-full w-full flex-col gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[color:var(--phase-color)] hover:shadow-md"
              :data-state="data.phase.state"
              :data-tone="data.phase.tone"
              :title="`Open Phase ${data.phase.number}: ${data.phase.title}`"
            >
              <div
                class="flex items-center justify-between gap-2 text-[0.72rem] font-bold uppercase tracking-wider text-[color:var(--phase-color)]"
              >
                <span>Phase {{ data.phase.number }} · {{ data.phase.weekRange }}</span>
                <span
                  class="rf-state inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2 py-0.5 text-[0.7rem] font-semibold normal-case tracking-normal text-[var(--muted)]"
                  :data-status="data.phase.state"
                >
                  <Icon
                    :name="
                      data.phase.state === 'complete'
                        ? 'lucide:circle-check-big'
                        : data.phase.state === 'active'
                          ? 'lucide:compass'
                          : 'lucide:lock'
                    "
                    class="learning-icon"
                  />
                  {{ data.phase.stateLabel }}
                </span>
              </div>
              <h3 class="m-0 text-[1.2rem] font-bold leading-tight text-[var(--ink)]">
                {{ data.phase.title }}
              </h3>
              <p class="m-0 line-clamp-3 text-[0.88rem] leading-snug text-[var(--muted)]">
                {{ data.phase.goal }}
              </p>
              <div class="mt-auto grid gap-1">
                <div
                  class="flex items-center justify-between gap-2 text-[0.76rem] text-[var(--muted)]"
                >
                  <span>{{ data.phase.done }} / {{ data.phase.total }} topics</span>
                  <strong class="text-[var(--ink)]">{{ data.phase.percent }}%</strong>
                </div>
                <div class="h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
                  <span
                    class="block h-full rounded-full bg-[color:var(--phase-color)] transition-all"
                    :style="{ width: `${data.phase.percent}%` }"
                  />
                </div>
              </div>
              <span
                class="inline-flex items-center gap-1.5 self-start rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2 py-1 text-[0.74rem] font-medium text-[var(--ink)]"
              >
                <Icon
                  name="lucide:badge-check"
                  class="learning-icon text-[color:var(--phase-color)]"
                />
                {{ data.phase.role }}
              </span>
              <Handle type="target" :position="Position.Top" class="rf-handle" />
              <Handle type="source" :position="Position.Bottom" class="rf-handle" />
            </NuxtLink>
          </template>

          <!-- Week node: header is a link, topics are their own links -->
          <template #node-roadmap-week="{ data }">
            <div
              class="rf-node rf-week flex h-full w-full flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]"
              :data-tone="data.tone"
            >
              <NuxtLink
                :to="data.week.href"
                :data-nav-href="data.week.href"
                class="rf-week-head grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-[var(--surface-2)] px-3 py-2.5 transition-colors hover:bg-[color-mix(in_oklab,var(--phase-color)_6%,var(--surface-2))]"
                :title="`Open Week ${data.week.number}: ${data.week.title}`"
              >
                <span
                  class="grid h-6 min-w-[34px] place-items-center rounded-md border border-[color-mix(in_oklab,var(--phase-color)_20%,var(--line))] bg-[color-mix(in_oklab,var(--phase-color)_7%,var(--surface))] text-[0.7rem] font-bold text-[color:var(--phase-color)]"
                >
                  W{{ data.week.number }}
                </span>
                <div class="grid min-w-0 gap-0">
                  <strong class="truncate text-[0.86rem] font-semibold text-[var(--ink)]">
                    {{ data.week.title }}
                  </strong>
                  <small class="text-[0.72rem] text-[var(--muted)]">{{ data.week.stage }}</small>
                </div>
                <span class="text-[0.72rem] font-medium text-[var(--muted)]">
                  {{ data.week.done }}/{{ data.week.total }}
                </span>
              </NuxtLink>
              <div class="mx-3 mb-2 h-[3px] overflow-hidden rounded-full bg-[var(--line)]">
                <span
                  class="block h-full rounded-full bg-[color:var(--phase-color)] transition-all"
                  :style="{ width: `${data.week.percent}%` }"
                />
              </div>

              <div class="grid px-2 pb-2">
                <template v-for="topic in data.week.topics" :key="topic.id">
                  <NuxtLink
                    v-if="!topic.locked"
                    :to="topic.href"
                    :data-nav-href="topic.href"
                    class="rf-topic flex h-[54px] items-center gap-2 border-t border-[var(--line)] px-2 py-1.5 hover:bg-[var(--surface-2)]"
                    :class="{
                      'rf-topic-complete bg-[color-mix(in_oklab,var(--success)_6%,transparent)]':
                        topic.status === 'complete',
                      'rf-topic-next bg-[var(--brand-soft)]': topic.next,
                    }"
                    :title="topic.title"
                  >
                    <span
                      class="grid h-6 w-6 flex-none place-items-center rounded-md border border-[color-mix(in_oklab,var(--phase-color)_18%,var(--line))] bg-[var(--surface-2)] text-[0.66rem] font-bold text-[color:var(--phase-color)]"
                    >
                      {{ topic.order }}
                    </span>
                    <span class="grid flex-1 min-w-0 gap-0">
                      <strong
                        class="line-clamp-2 text-[0.82rem] font-medium leading-tight text-[var(--ink)]"
                      >
                        {{ topic.title }}
                      </strong>
                      <small class="truncate text-[0.68rem] text-[var(--muted)]">
                        {{ topic.stage }}
                        <template v-if="topic.score !== undefined"> · {{ topic.score }}/3</template>
                      </small>
                    </span>
                    <span
                      class="inline-flex flex-none items-center gap-1 text-[0.7rem] font-medium text-[var(--muted)]"
                    >
                      <Icon
                        :name="
                          topic.status === 'complete'
                            ? 'lucide:circle-check-big'
                            : topic.next
                              ? 'lucide:play'
                              : 'lucide:arrow-right'
                        "
                        class="learning-icon"
                      />
                      <span class="rf-topic-label">{{ topic.stateLabel }}</span>
                    </span>
                  </NuxtLink>

                  <button
                    v-else
                    type="button"
                    class="rf-topic rf-topic-locked flex h-[54px] cursor-not-allowed items-center gap-2 border-t border-[var(--line)] bg-transparent px-2 py-1.5 text-left text-[var(--muted)]"
                    :title="topic.title"
                    :data-nav-locked="`Locked. Pass the previous topic quiz first to open “${topic.title}”.`"
                    @click="handleLockedTopic(topic)"
                  >
                    <span
                      class="grid h-6 w-6 flex-none place-items-center rounded-md border border-dashed border-[var(--line)] bg-[var(--surface-2)] text-[0.66rem] font-bold text-[var(--muted)]"
                    >
                      {{ topic.order }}
                    </span>
                    <span class="grid flex-1 min-w-0 gap-0">
                      <strong
                        class="line-clamp-2 text-[0.82rem] font-medium leading-tight text-[var(--muted)]"
                      >
                        {{ topic.title }}
                      </strong>
                      <small class="truncate text-[0.68rem] text-[var(--muted)]">
                        {{ topic.stage }}
                      </small>
                    </span>
                    <span
                      class="inline-flex flex-none items-center gap-1 text-[0.7rem] font-medium"
                    >
                      <Icon name="lucide:lock" class="learning-icon" />
                      <span class="rf-topic-label">Locked</span>
                    </span>
                  </button>
                </template>
              </div>
              <Handle type="target" :position="Position.Top" class="rf-handle" />
              <Handle type="source" :position="Position.Bottom" class="rf-handle" />
            </div>
          </template>

          <!-- Gate node -->
          <template #node-roadmap-gate="{ data }">
            <div
              class="rf-node rf-gate-wrap flex h-full w-full items-stretch"
              :data-tone="data.tone"
            >
              <NuxtLink
                v-if="!data.gate.locked"
                :to="data.gate.href"
                class="rf-gate group flex flex-1 items-center gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3 transition-all hover:-translate-y-0.5 hover:border-[color:var(--phase-color)] hover:shadow-sm"
                :class="{
                  'bg-[color-mix(in_oklab,var(--success)_6%,var(--surface))] border-[color-mix(in_oklab,var(--success)_32%,var(--line))]':
                    data.gate.status === 'complete',
                  'bg-[var(--brand-soft)] border-[color-mix(in_oklab,var(--brand)_38%,var(--line))]':
                    data.gate.next,
                }"
              >
                <span
                  class="grid h-9 w-9 flex-none place-items-center rounded-md border border-[var(--line)] bg-[var(--surface-2)] text-[color:var(--phase-color)]"
                  :class="data.gate.status === 'complete' && 'text-[var(--success)]'"
                >
                  <Icon
                    :name="
                      data.gate.status === 'complete' ? 'lucide:badge-check' : 'lucide:door-open'
                    "
                    class="learning-icon"
                  />
                </span>
                <span class="grid flex-1 min-w-0 gap-0">
                  <small
                    class="text-[0.66rem] font-bold uppercase tracking-wider text-[var(--muted)]"
                  >
                    Phase {{ data.gate.phaseNumber }} gate
                  </small>
                  <strong class="truncate text-[0.86rem] font-semibold text-[var(--ink)]">
                    {{ data.gate.role }}
                  </strong>
                  <span class="text-[0.74rem] text-[var(--muted)]">{{
                    data.gate.statusLabel
                  }}</span>
                </span>
                <Icon
                  name="lucide:arrow-right"
                  class="learning-icon text-[color:var(--phase-color)] transition-transform group-hover:translate-x-0.5"
                />
              </NuxtLink>

              <button
                v-else
                type="button"
                class="rf-gate flex flex-1 cursor-not-allowed items-center gap-2.5 rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-2)] p-3 text-left text-[var(--muted)]"
                @click="handleLockedGate(data.gate)"
              >
                <span
                  class="grid h-9 w-9 flex-none place-items-center rounded-md border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
                >
                  <Icon name="lucide:lock" class="learning-icon" />
                </span>
                <span class="grid flex-1 min-w-0 gap-0">
                  <small
                    class="text-[0.66rem] font-bold uppercase tracking-wider text-[var(--muted)]"
                  >
                    Phase {{ data.gate.phaseNumber }} gate
                  </small>
                  <strong class="truncate text-[0.86rem] font-semibold">{{
                    data.gate.role
                  }}</strong>
                  <span class="text-[0.74rem]">
                    Pass all {{ data.gate.topicCount }} topics to open
                  </span>
                </span>
              </button>
              <Handle type="target" :position="Position.Top" class="rf-handle" />
            </div>
          </template>
        </VueFlow>
        <template #fallback>
          <div class="grid h-full place-items-center text-sm text-[var(--muted)]">
            Loading the roadmap tree…
          </div>
        </template>
      </ClientOnly>
    </div>

    <p class="flex items-start gap-2 text-[0.84rem] leading-snug text-[var(--muted)]">
      <Icon
        name="lucide:mouse-pointer-2"
        class="learning-icon mt-0.5 flex-none text-[var(--brand)]"
      />
      Every root, phase, week, topic and gate is clickable. Locked items tell you what to pass
      first.
    </p>
  </div>
</template>

<style scoped>
/* Dotted canvas background. */
.rf-canvas {
  background:
    radial-gradient(var(--dot) 1px, transparent 1px) 0 0 / 18px 18px,
    var(--surface);
}

.rf-canvas :deep(.vue-flow) {
  width: 100%;
  height: 100%;
}

.rf-canvas :deep(.vue-flow__pane) {
  cursor: default;
}

.rf-canvas :deep(.vue-flow__node) {
  padding: 0;
  font-family: var(--font-body);
  background: transparent;
  border: 0;
  box-shadow: none;
  cursor: pointer;
}

.rf-canvas :deep(.vue-flow__edge-path) {
  stroke-linecap: round;
}

/* Invisible handles (edges need anchor points, we don't want visible dots) */
.rf-handle {
  width: 1px;
  height: 1px;
  min-width: 1px;
  min-height: 1px;
  opacity: 0;
  pointer-events: none;
  border: 0;
}

/* Phase tone → CSS variable mapping (shared with FullStackDiagram) */
.rf-phase[data-tone='violet'],
.rf-week[data-tone='violet'],
.rf-gate-wrap[data-tone='violet'] {
  --phase-color: var(--phase-violet);
}
.rf-phase[data-tone='blue'],
.rf-week[data-tone='blue'],
.rf-gate-wrap[data-tone='blue'] {
  --phase-color: var(--phase-blue);
}
.rf-phase[data-tone='teal'],
.rf-week[data-tone='teal'],
.rf-gate-wrap[data-tone='teal'] {
  --phase-color: var(--phase-teal);
}
.rf-phase[data-tone='amber'],
.rf-week[data-tone='amber'],
.rf-gate-wrap[data-tone='amber'] {
  --phase-color: var(--phase-amber);
}
.rf-phase[data-tone='rose'],
.rf-week[data-tone='rose'],
.rf-gate-wrap[data-tone='rose'] {
  --phase-color: var(--phase-rose);
}
.rf-phase[data-tone='indigo'],
.rf-week[data-tone='indigo'],
.rf-gate-wrap[data-tone='indigo'] {
  --phase-color: var(--phase-indigo);
}

/* Phase state subtleties beyond Tailwind reach */
.rf-phase[data-state='locked'] {
  opacity: 0.72;
}

.rf-phase[data-state='active'] {
  border-color: color-mix(in oklab, var(--brand) 36%, var(--line));
}

.rf-state[data-status='complete'] {
  color: var(--success);
  background: var(--success-soft);
  border-color: color-mix(in oklab, var(--success) 22%, var(--line));
}

.rf-state[data-status='active'] {
  color: var(--brand);
  background: var(--brand-soft);
  border-color: color-mix(in oklab, var(--brand) 22%, var(--line));
}

.rf-topic-complete .rf-topic-label,
.rf-topic-complete > span:first-child {
  color: var(--success) !important;
}

.rf-topic-next .rf-topic-label {
  color: var(--brand) !important;
}

@media (max-width: 760px) {
  .rf-topic-label {
    display: none;
  }
}
</style>
