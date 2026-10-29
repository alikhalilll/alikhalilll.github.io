<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { phases } from '~/features/plan1/phases';
import { planTopics, planTopicsByWeek } from '~/features/plan1/topics';
import type { PhaseKey, PlanPhase, PlanTopic, PlanWeek } from '~/features/plan1/types';
import type { NextAction, QuizResult, TopicStatus } from '../composables/usePlanProgress';
import { getPlanSummary } from '../data';
import { phasePath, topicPath } from '../routes';

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

// The roadmap is a three-canopy tree: one root, three phase boughs, nine
// weekly branches and 39 topic leaves. Everything is measured in pixels so
// the SVG edges and the absolutely positioned cards always line up.
const PAD_X = 20;
const COL_W = 450;
const COL_GAP = 26;
const COL_PAD = 10;

const NODE_W = 207;
const NODE_H = 92;
const NODE_GAP_X = 16;
const NODE_GAP_Y = 12;
const ROWS = 3;

const ROOT_Y = 24;
const ROOT_W = 440;
const ROOT_H = 116;

const PHASE_HEADER_Y = 216;
const PHASE_HEADER_H = 138;
const WEEK_LABEL_H = 64;
const WEEK_LABEL_GAP = 12;
const TOPIC_OFFSET = WEEK_LABEL_H + WEEK_LABEL_GAP;
const GRID_H = ROWS * NODE_H + (ROWS - 1) * NODE_GAP_Y;
const WEEK_BLOCK_H = TOPIC_OFFSET + GRID_H + 22;
const PHASE_START_Y = PHASE_HEADER_Y + PHASE_HEADER_H + 24;
const GATE_H = 104;
const GATE_GAP = 14;
const PHASE_BOTTOM = 36;

const CONTENT_W = COL_W - COL_PAD * 2;
const CONTENT_CENTER = COL_PAD + CONTENT_W / 2;
const CANVAS_W = PAD_X * 2 + 3 * COL_W + 2 * COL_GAP;
const PHASE_GATE_Y = PHASE_START_Y + 3 * WEEK_BLOCK_H + GATE_GAP;
const CANVAS_H = PHASE_GATE_Y + GATE_H + PHASE_BOTTOM;

const plan = computed(() => getPlanSummary(props.planId));

type GraphNodeKind = 'topic' | 'gate';

interface GraphNode {
  id: string;
  kind: GraphNodeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  phase: PlanPhase;
  status: TopicStatus;
  topic?: PlanTopic;
  result?: QuizResult;
  order?: number;
}

type EdgeState = TopicStatus;

interface GraphEdge {
  id: string;
  d: string;
  state: EdgeState;
  weight: 'trunk' | 'branch' | 'stem';
}

interface WeekLayout {
  week: PlanWeek;
  x: number;
  y: number;
  topics: PlanTopic[];
  topicNodes: GraphNode[];
}

interface PhaseLayout {
  phase: PlanPhase;
  x: number;
  headerY: number;
  weeks: WeekLayout[];
  gate: GraphNode;
  state: EdgeState;
}

const lockedNotice = ref('');

const phaseState = (phaseKey: PhaseKey): EdgeState => {
  const phase = props.phaseProgress.find((entry) => entry.key === phaseKey);
  if (!phase) return 'locked';
  if (phase.quizPassed) return 'complete';
  return phase.unlocked ? 'available' : 'locked';
};

const graph = computed(() => {
  const layouts: PhaseLayout[] = [];
  const nodes: GraphNode[] = [];

  phases.forEach((phase, phaseIndex) => {
    const x = PAD_X + phaseIndex * (COL_W + COL_GAP);
    const contentX = x + COL_PAD;

    const weeks: WeekLayout[] = phase.weeksData.map((week, weekIndex) => {
      const topics = planTopicsByWeek[week.number] ?? [];
      const y = PHASE_START_Y + weekIndex * WEEK_BLOCK_H;

      const topicNodes = topics.map((topic, topicIndex) => {
        const row = Math.floor(topicIndex / 2);
        const column = topicIndex % 2;
        const node: GraphNode = {
          id: topic.id,
          kind: 'topic',
          x: contentX + column * (NODE_W + NODE_GAP_X),
          y: y + TOPIC_OFFSET + row * (NODE_H + NODE_GAP_Y),
          w: NODE_W,
          h: NODE_H,
          phase,
          topic,
          order: topic.order,
          status: props.getTopicStatus(topic.id),
          result: props.getTopicResult(topic.id),
        };

        nodes.push(node);
        return node;
      });

      return { week, x: contentX, y, topics, topicNodes };
    });

    const gate: GraphNode = {
      id: `gate-${phase.key}`,
      kind: 'gate',
      x: contentX,
      y: PHASE_GATE_Y,
      w: CONTENT_W,
      h: GATE_H,
      phase,
      status: props.getPhaseQuizStatus(phase.key),
      result: props.getPhaseResult(phase.key),
    };

    nodes.push(gate);

    layouts.push({
      phase,
      x,
      headerY: PHASE_HEADER_Y,
      weeks,
      gate,
      state: phaseState(phase.key),
    });
  });

  const edges: GraphEdge[] = [];

  layouts.forEach((layout) => {
    const headerCenterX = layout.x + COL_W / 2;
    const headerBottomY = layout.headerY + PHASE_HEADER_H;
    const contentCenterX = layout.x + CONTENT_CENTER;
    const firstWeek = layout.weeks[0];
    const firstWeekTopics = firstWeek?.topicNodes ?? [];

    edges.push({
      id: `root-${layout.phase.key}`,
      d: branchPath(CANVAS_W / 2, ROOT_Y + ROOT_H, headerCenterX, layout.headerY),
      state: layout.state,
      weight: 'trunk',
    });

    edges.push({
      id: `phase-${layout.phase.key}-week-1`,
      d: branchPath(headerCenterX, headerBottomY, contentCenterX, firstWeek?.y ?? headerBottomY),
      state: firstWeekTopics[0]?.status ?? layout.state,
      weight: 'branch',
    });

    layout.weeks.forEach((week, weekIndex) => {
      const topicNodes = week.topicNodes;
      const firstNode = topicNodes[0];

      if (firstNode) {
        edges.push({
          id: `${week.week.number}-${firstNode.id}`,
          d: branchPath(
            contentCenterX,
            week.y + WEEK_LABEL_H,
            firstNode.x + firstNode.w / 2,
            firstNode.y
          ),
          state: firstNode.status,
          weight: 'branch',
        });
      }

      for (let index = 0; index < topicNodes.length - 1; index += 1) {
        const from = topicNodes[index];
        const to = topicNodes[index + 1];

        if (!from || !to) continue;

        edges.push({
          id: `${from.id}-${to.id}`,
          d: chainPath(from, to),
          state: to.status,
          weight: 'stem',
        });
      }

      const lastNode = topicNodes[topicNodes.length - 1];
      if (!lastNode) return;

      const nextWeek = layout.weeks[weekIndex + 1];

      if (nextWeek) {
        edges.push({
          id: `${lastNode.id}-week-${nextWeek.week.number}`,
          d: branchPath(
            lastNode.x + lastNode.w / 2,
            lastNode.y + lastNode.h,
            contentCenterX,
            nextWeek.y
          ),
          state: nextWeek.topicNodes[0]?.status ?? 'locked',
          weight: 'branch',
        });
        return;
      }

      edges.push({
        id: `${lastNode.id}-${layout.gate.id}`,
        d: branchPath(
          lastNode.x + lastNode.w / 2,
          lastNode.y + lastNode.h,
          layout.gate.x + layout.gate.w / 2,
          layout.gate.y
        ),
        state: layout.gate.status,
        weight: 'branch',
      });
    });
  });

  return {
    edges,
    height: CANVAS_H,
    nodes,
    phases: layouts,
    width: CANVAS_W,
  };
});

const viewport = ref<HTMLElement | null>(null);
const roadmapScale = ref(1);
let viewportObserver: ResizeObserver | undefined;

const updateRoadmapScale = () => {
  if (!viewport.value) return;

  const availableWidth = viewport.value.clientWidth - 20;
  roadmapScale.value = availableWidth > 0 ? Math.min(1, availableWidth / CANVAS_W) : 1;
};

onMounted(() => {
  updateRoadmapScale();

  viewportObserver = new ResizeObserver(updateRoadmapScale);
  if (viewport.value) viewportObserver.observe(viewport.value);
});

onBeforeUnmount(() => {
  viewportObserver?.disconnect();
});

const scaledHeight = computed(() => Math.ceil(graph.value.height * roadmapScale.value));

const passedTopics = computed(
  () =>
    graph.value.nodes.filter((node) => node.kind === 'topic' && node.status === 'complete').length
);

const passedPhases = computed(() => props.phaseProgress.filter((phase) => phase.quizPassed).length);

const planTitle = computed(() => plan.value?.title ?? 'Core Skills');
const planPercent = computed(() =>
  planTopics.length === 0 ? 0 : Math.round((passedTopics.value / planTopics.length) * 100)
);

function branchPath(fromX: number, fromY: number, toX: number, toY: number) {
  const midY = fromY + (toY - fromY) * 0.55;
  return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
}

function chainPath(from: GraphNode, to: GraphNode) {
  const fromCenterX = from.x + from.w / 2;
  const fromCenterY = from.y + from.h / 2;
  const toCenterX = to.x + to.w / 2;
  const toCenterY = to.y + to.h / 2;
  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;

  if (Math.abs(dy) < NODE_H / 2 && Math.abs(dx) > NODE_H) {
    const startX = dx >= 0 ? from.x + from.w : from.x;
    const endX = dx >= 0 ? to.x : to.x + to.w;
    const control = Math.max(30, Math.abs(endX - startX) * 0.45);

    return `M ${startX} ${fromCenterY} C ${startX + (dx >= 0 ? control : -control)} ${fromCenterY}, ${endX - (dx >= 0 ? control : -control)} ${toCenterY}, ${endX} ${toCenterY}`;
  }

  return branchPath(fromCenterX, from.y + from.h, toCenterX, to.y);
}

const phasePercent = (phaseKey: PhaseKey) =>
  props.phaseProgress.find((phase) => phase.key === phaseKey)?.percent ?? 0;

const nodeHref = (node: GraphNode) =>
  node.kind === 'gate'
    ? phasePath(props.planId, node.phase.key)
    : topicPath(props.planId, node.topic?.id ?? '');

const nodeIsNext = (node: GraphNode) => {
  if (node.kind === 'topic') {
    return props.nextAction.kind === 'topic' && props.nextAction.topic.id === node.topic?.id;
  }

  return props.nextAction.kind === 'phase' && props.nextAction.phase.key === node.phase.key;
};

const handleNodeClick = (event: MouseEvent, node: GraphNode) => {
  if (node.status !== 'locked') {
    lockedNotice.value = '';
    return;
  }

  event.preventDefault();

  if (node.kind === 'topic' && node.topic) {
    lockedNotice.value = `Locked. Pass the previous topic quiz first to open “${node.topic.title}”.`;
    return;
  }

  const phase = node.phase;
  lockedNotice.value = `Phase ${phase.number} gate is locked. Pass all ${phase.weeksData.reduce((total, week) => total + (planTopicsByWeek[week.number]?.length ?? 0), 0)} topic quizzes in ${phase.title} first.`;
};

const statusLabel = (node: GraphNode) => {
  if (node.kind === 'gate') {
    if (node.status === 'complete') return 'Passed';
    if (node.status === 'available') return 'Open gate';
    return 'Locked';
  }

  if (node.status === 'complete') return 'Passed';
  if (node.status === 'available') return nodeIsNext(node) ? 'Next up' : 'Open topic';
  return 'Locked';
};

const statusIcon = (node: GraphNode) => {
  if (node.status === 'complete') return 'lucide:circle-check-big';
  if (node.status === 'available')
    return node.kind === 'gate' ? 'lucide:badge-check' : 'lucide:play';
  return 'lucide:lock';
};

const nodeScore = (node: GraphNode) => {
  if (!node.result) return '';
  return `${node.result.bestScore}/${node.kind === 'gate' ? 6 : 3}`;
};
</script>

<template>
  <div class="plan-roadmap">
    <div class="roadmap-legend" aria-label="Roadmap key">
      <span><i class="legend-dot is-complete" /> Passed</span>
      <span><i class="legend-dot is-available" /> Available</span>
      <span><i class="legend-dot is-locked" /> Locked</span>
      <span class="roadmap-legend-note">
        <Icon name="lucide:git-fork" class="learning-icon" />
        One root · three phases · nine weekly branches · {{ planTopics.length }} topics
      </span>
    </div>

    <p v-if="lockedNotice" class="roadmap-notice" role="alert">
      <Icon name="lucide:lock" class="learning-icon" />
      <span>{{ lockedNotice }}</span>
      <button type="button" aria-label="Dismiss" @click="lockedNotice = ''">
        <Icon name="lucide:x" class="learning-icon" />
      </button>
    </p>

    <div ref="viewport" class="roadmap-scroll">
      <div class="roadmap-stage" :style="{ height: `${scaledHeight}px` }">
        <div
          class="roadmap-canvas"
          :style="{
            width: `${graph.width}px`,
            height: `${graph.height}px`,
            transform: `scale(${roadmapScale})`,
          }"
        >
          <svg
            class="roadmap-edges"
            :width="graph.width"
            :height="graph.height"
            :viewBox="`0 0 ${graph.width} ${graph.height}`"
            aria-hidden="true"
          >
            <path
              v-for="edge in graph.edges"
              :key="edge.id"
              :d="edge.d"
              class="roadmap-edge"
              :class="[`is-${edge.state}`, `is-${edge.weight}`]"
            />
          </svg>

          <div
            class="roadmap-root"
            :style="{
              left: `${CANVAS_W / 2 - ROOT_W / 2}px`,
              top: `${ROOT_Y}px`,
              width: `${ROOT_W}px`,
              height: `${ROOT_H}px`,
            }"
          >
            <span class="roadmap-root-mark">
              <Icon name="lucide:sprout" class="learning-icon" />
            </span>
            <div class="roadmap-root-copy">
              <span class="roadmap-root-kicker">Learning tree</span>
              <strong>{{ planTitle }}</strong>
              <span>{{ planTopics.length }} topics · {{ phases.length }} phases · 3 roles</span>
            </div>
            <div class="roadmap-root-progress">
              <strong>{{ planPercent }}%</strong>
              <span>{{ passedTopics }}/{{ planTopics.length }}</span>
              <span>{{ passedPhases }}/{{ phases.length }} gates</span>
            </div>
          </div>

          <div
            v-for="layout in graph.phases"
            :key="`phase-head-${layout.phase.key}`"
            class="roadmap-phase-head"
            :data-tone="layout.phase.tone"
            :style="{
              left: `${layout.x}px`,
              top: `${layout.headerY}px`,
              width: `${COL_W}px`,
              height: `${PHASE_HEADER_H}px`,
            }"
          >
            <div class="roadmap-phase-head-main">
              <div class="roadmap-phase-head-top">
                <span>Phase {{ layout.phase.number }}</span>
                <span>{{ layout.phase.weeks }}</span>
              </div>
              <h3>{{ layout.phase.title }}</h3>
              <p>{{ layout.phase.goal }}</p>
            </div>
            <div class="roadmap-phase-head-side">
              <span class="roadmap-phase-role">
                <Icon name="lucide:badge-check" class="learning-icon" />
                {{ layout.phase.role.title }}
              </span>
              <div class="roadmap-phase-progress">
                <span>{{ phasePercent(layout.phase.key) }}%</span>
                <div class="roadmap-progress-track">
                  <span :style="{ width: `${phasePercent(layout.phase.key)}%` }" />
                </div>
              </div>
            </div>
          </div>

          <div
            v-for="layout in graph.phases"
            :key="`phase-weeks-${layout.phase.key}`"
            class="roadmap-week-labels"
          >
            <div
              v-for="weekLayout in layout.weeks"
              :key="`week-${weekLayout.week.number}`"
              class="roadmap-week-label"
              :data-tone="layout.phase.tone"
              :style="{
                left: `${weekLayout.x}px`,
                top: `${weekLayout.y}px`,
                width: `${CONTENT_W}px`,
                height: `${WEEK_LABEL_H}px`,
              }"
              :title="weekLayout.week.task.title"
            >
              <span class="roadmap-week-index">W{{ weekLayout.week.number }}</span>
              <div>
                <span class="roadmap-week-stage">{{ weekLayout.week.stage }}</span>
                <strong>{{ weekLayout.week.title }}</strong>
              </div>
              <small>{{ weekLayout.week.task.title }}</small>
            </div>
          </div>

          <NuxtLink
            v-for="node in graph.nodes"
            :key="node.id"
            :to="node.status === 'locked' ? undefined : nodeHref(node)"
            class="roadmap-node"
            :class="{
              'is-gate': node.kind === 'gate',
              'is-topic': node.kind === 'topic',
              'is-complete': node.status === 'complete',
              'is-available': node.status === 'available',
              'is-locked': node.status === 'locked',
              'is-next': nodeIsNext(node),
            }"
            :style="{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: `${node.w}px`,
              height: `${node.h}px`,
            }"
            :data-tone="node.phase.tone"
            :aria-disabled="node.status === 'locked'"
            @click="handleNodeClick($event, node)"
          >
            <template v-if="node.kind === 'topic' && node.topic">
              <span class="roadmap-node-top">
                <span class="roadmap-node-order">{{ String(node.order).padStart(2, '0') }}</span>
                <span class="roadmap-node-stage">{{ node.topic.stage }}</span>
              </span>
              <strong class="roadmap-node-title">{{ node.topic.title }}</strong>
              <span class="roadmap-node-foot">
                <span class="roadmap-node-status">
                  <Icon :name="statusIcon(node)" class="learning-icon" />
                  {{ statusLabel(node) }}
                </span>
                <span v-if="nodeScore(node)" class="roadmap-node-score">{{ nodeScore(node) }}</span>
              </span>
              <span class="roadmap-node-track" aria-hidden="true">
                <span :style="{ width: node.status === 'complete' ? '100%' : '0%' }" />
              </span>
            </template>

            <template v-else>
              <span class="roadmap-gate-icon">
                <Icon name="lucide:badge-check" class="learning-icon" />
              </span>
              <span class="roadmap-gate-copy">
                <span class="roadmap-gate-top">
                  <span>Phase {{ node.phase.number }} gate</span>
                  <span class="roadmap-gate-status">
                    <Icon :name="statusIcon(node)" class="learning-icon" />
                    {{ statusLabel(node) }}
                  </span>
                </span>
                <strong class="roadmap-gate-title">{{ node.phase.role.title }}</strong>
                <span class="roadmap-gate-foot">
                  <span v-if="nodeScore(node)" class="roadmap-node-score">{{
                    nodeScore(node)
                  }}</span>
                  <span v-else>
                    {{
                      node.status === 'available'
                        ? 'Pass the phase quiz'
                        : 'Pass every topic in the phase'
                    }}
                  </span>
                </span>
              </span>
              <Icon name="lucide:arrow-right" class="roadmap-gate-arrow" />
            </template>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="roadmap-mobile">
      <div class="roadmap-mobile-root">
        <span class="roadmap-root-mark">
          <Icon name="lucide:sprout" class="learning-icon" />
        </span>
        <div class="roadmap-root-copy">
          <span class="roadmap-root-kicker">Learning tree</span>
          <strong>{{ planTitle }}</strong>
          <span>{{ planTopics.length }} topics · {{ phases.length }} phases · 3 roles</span>
        </div>
        <div class="roadmap-root-progress">
          <strong>{{ planPercent }}%</strong>
          <span>{{ passedTopics }}/{{ planTopics.length }}</span>
          <span>{{ passedPhases }}/{{ phases.length }} gates</span>
        </div>
      </div>

      <div class="roadmap-mobile-branches">
        <section
          v-for="layout in graph.phases"
          :key="`mobile-phase-${layout.phase.key}`"
          class="roadmap-mobile-phase"
          :data-tone="layout.phase.tone"
        >
          <div class="roadmap-mobile-phase-head">
            <div class="roadmap-mobile-phase-top">
              <span>Phase {{ layout.phase.number }}</span>
              <span>{{ layout.phase.weeks }}</span>
              <span class="roadmap-mobile-phase-role">
                <Icon name="lucide:badge-check" class="learning-icon" />
                {{ layout.phase.role.title }}
              </span>
            </div>
            <h3>{{ layout.phase.title }}</h3>
            <p>{{ layout.phase.goal }}</p>
            <div class="roadmap-mobile-progress">
              <span>{{ phasePercent(layout.phase.key) }}%</span>
              <div class="roadmap-progress-track">
                <span :style="{ width: `${phasePercent(layout.phase.key)}%` }" />
              </div>
            </div>
          </div>

          <div class="roadmap-mobile-weeks">
            <section
              v-for="weekLayout in layout.weeks"
              :key="`mobile-week-${weekLayout.week.number}`"
              class="roadmap-mobile-week"
            >
              <div class="roadmap-mobile-week-head">
                <span class="roadmap-week-index">W{{ weekLayout.week.number }}</span>
                <div>
                  <span class="roadmap-week-stage">{{ weekLayout.week.stage }}</span>
                  <strong>{{ weekLayout.week.title }}</strong>
                  <small>{{ weekLayout.week.task.title }}</small>
                </div>
              </div>

              <div class="roadmap-mobile-topics">
                <NuxtLink
                  v-for="node in weekLayout.topicNodes"
                  :key="`mobile-${node.id}`"
                  :to="node.status === 'locked' ? undefined : nodeHref(node)"
                  class="roadmap-mobile-node"
                  :class="{
                    'is-complete': node.status === 'complete',
                    'is-available': node.status === 'available',
                    'is-locked': node.status === 'locked',
                    'is-next': nodeIsNext(node),
                  }"
                  :data-tone="node.phase.tone"
                  :aria-disabled="node.status === 'locked'"
                  @click="handleNodeClick($event, node)"
                >
                  <span class="roadmap-mobile-node-top">
                    <span class="roadmap-node-order">
                      {{ String(node.order).padStart(2, '0') }}
                    </span>
                    <span class="roadmap-node-stage">{{ node.topic?.stage }}</span>
                  </span>
                  <strong class="roadmap-mobile-node-title">{{ node.topic?.title }}</strong>
                  <span class="roadmap-mobile-node-foot">
                    <span class="roadmap-node-status">
                      <Icon :name="statusIcon(node)" class="learning-icon" />
                      {{ statusLabel(node) }}
                    </span>
                    <span v-if="nodeScore(node)" class="roadmap-node-score">
                      {{ nodeScore(node) }}
                    </span>
                  </span>
                </NuxtLink>
              </div>
            </section>
          </div>

          <NuxtLink
            :to="layout.gate.status === 'locked' ? undefined : nodeHref(layout.gate)"
            class="roadmap-mobile-gate"
            :class="{
              'is-complete': layout.gate.status === 'complete',
              'is-available': layout.gate.status === 'available',
              'is-locked': layout.gate.status === 'locked',
              'is-next': nodeIsNext(layout.gate),
            }"
            :data-tone="layout.phase.tone"
            :aria-disabled="layout.gate.status === 'locked'"
            @click="handleNodeClick($event, layout.gate)"
          >
            <span class="roadmap-gate-icon">
              <Icon name="lucide:badge-check" class="learning-icon" />
            </span>
            <span class="roadmap-gate-copy">
              <span class="roadmap-gate-top">
                <span>Phase {{ layout.phase.number }} gate</span>
                <span class="roadmap-gate-status">
                  <Icon :name="statusIcon(layout.gate)" class="learning-icon" />
                  {{ statusLabel(layout.gate) }}
                </span>
              </span>
              <strong class="roadmap-gate-title">{{ layout.phase.role.title }}</strong>
              <span class="roadmap-gate-foot">
                <span v-if="nodeScore(layout.gate)" class="roadmap-node-score">
                  {{ nodeScore(layout.gate) }}
                </span>
                <span v-else>
                  {{
                    layout.gate.status === 'available'
                      ? 'Pass the phase quiz'
                      : 'Pass every topic in the phase'
                  }}
                </span>
              </span>
            </span>
            <Icon name="lucide:arrow-right" class="roadmap-gate-arrow" />
          </NuxtLink>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plan-roadmap {
  position: relative;
}

.roadmap-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 22px;
  align-items: center;
  padding: 14px 18px;
  margin-bottom: 14px;
  font-size: 0.88rem;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
}

.roadmap-legend span {
  display: inline-flex;
  gap: 7px;
  align-items: center;
}

.roadmap-legend-note {
  margin-left: auto;
  font-weight: 550;
  color: var(--ink);
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
}

.legend-dot.is-complete {
  background: var(--success);
}

.legend-dot.is-available {
  background: var(--info);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--info) 16%, transparent);
}

.legend-dot.is-locked {
  background: var(--line-strong);
}

.roadmap-notice {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 16px;
  margin: 0 0 14px;
  font-size: 0.95rem;
  color: var(--warning-ink);
  background: var(--warning-soft);
  border: 1px solid var(--warning-line);
  border-radius: 13px;
}

.roadmap-notice span {
  flex: 1;
}

.roadmap-notice button {
  display: grid;
  padding: 4px;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 6px;
  place-items: center;
}

.roadmap-notice button:hover {
  background: color-mix(in oklab, var(--warning-line) 28%, transparent);
}

.roadmap-scroll {
  position: relative;
  padding: 10px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 0%, rgba(47, 79, 224, 0.08), transparent 34rem),
    radial-gradient(circle at 1px 1px, var(--dot) 1px, transparent 0) 0 0 / 26px 26px,
    var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 26px;
  box-shadow: var(--shadow-sm);
}

.roadmap-stage {
  position: relative;
  width: 100%;
}

.roadmap-canvas {
  position: relative;
  margin: 0 auto;
  transform-origin: top left;
  will-change: transform;
}

.roadmap-edges {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: visible;
  pointer-events: none;
}

.roadmap-edge {
  fill: none;
  stroke: var(--line-strong);
  stroke-linecap: round;
  stroke-width: 2.5;
  opacity: 0.55;
}

.roadmap-edge.is-trunk {
  stroke-width: 3.5;
}

.roadmap-edge.is-branch {
  stroke-width: 3;
}

.roadmap-edge.is-complete {
  stroke: var(--success);
  opacity: 0.9;
}

.roadmap-edge.is-available {
  stroke: var(--info);
  opacity: 0.95;
  stroke-dasharray: 7 6;
  animation: roadmap-dash 1.3s linear infinite;
}

@keyframes roadmap-dash {
  to {
    stroke-dashoffset: -26;
  }
}

.roadmap-root {
  position: absolute;
  z-index: 3;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 16px 20px;
  background:
    radial-gradient(circle at 100% 0%, rgba(47, 79, 224, 0.14), transparent 14rem),
    linear-gradient(145deg, var(--surface), color-mix(in oklab, var(--brand) 5%, var(--surface)));
  border: 1px solid color-mix(in oklab, var(--brand) 34%, var(--line));
  border-radius: 22px;
  box-shadow: 0 16px 40px rgba(35, 56, 140, 0.15);
}

.roadmap-root-mark {
  display: grid;
  width: 48px;
  height: 48px;
  font-size: 1.35rem;
  color: var(--on-brand);
  background: linear-gradient(145deg, #5d76ff, #2039b8);
  border-radius: 15px;
  box-shadow: 0 8px 18px rgba(47, 79, 224, 0.28);
  place-items: center;
}

.roadmap-root-copy {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.roadmap-root-kicker {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--brand);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.roadmap-root-copy strong {
  overflow: hidden;
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 750;
  line-height: 1.15;
  color: var(--ink);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.roadmap-root-copy > span:last-child {
  font-size: 0.8rem;
  color: var(--muted);
}

.roadmap-root-progress {
  display: grid;
  gap: 1px;
  justify-items: end;
  font-size: 0.72rem;
  color: var(--muted);
}

.roadmap-root-progress strong {
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 750;
  line-height: 1;
  color: var(--brand);
}

.roadmap-phase-head {
  position: absolute;
  z-index: 1;
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  overflow: hidden;
  background: linear-gradient(
    125deg,
    color-mix(in oklab, var(--phase-color) 13%, var(--surface)),
    var(--surface) 72%
  );
  border: 1px solid color-mix(in oklab, var(--phase-color) 32%, var(--line));
  border-left: 5px solid var(--phase-color);
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
}

.roadmap-phase-head-main {
  min-width: 0;
}

.roadmap-phase-head-top {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--phase-color);
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

.roadmap-phase-head-top span + span {
  color: var(--muted);
  letter-spacing: 0;
  text-transform: none;
}

.roadmap-phase-head h3 {
  margin: 4px 0 4px;
  font-size: 1.42rem;
  line-height: 1.1;
  color: var(--ink);
}

.roadmap-phase-head p {
  display: -webkit-box;
  max-width: 290px;
  margin: 0;
  overflow: hidden;
  font-size: 0.88rem;
  line-height: 1.45;
  color: var(--muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.roadmap-phase-head-side {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  width: 150px;
}

.roadmap-phase-role {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 0.84rem;
  font-weight: 650;
  color: var(--phase-color);
  text-align: right;
}

.roadmap-phase-progress {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--muted);
}

.roadmap-progress-track {
  flex: 1;
  height: 6px;
  overflow: hidden;
  background: var(--line);
  border-radius: 999px;
}

.roadmap-progress-track span {
  display: block;
  height: 100%;
  background: var(--phase-color);
  border-radius: inherit;
  transition: width 0.35s ease;
}

.roadmap-week-labels {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.roadmap-week-label {
  position: absolute;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 0 14px;
  overflow: hidden;
  background: color-mix(in oklab, var(--surface) 92%, transparent);
  border: 1px solid var(--line);
  border-left: 3px solid var(--phase-color);
  border-radius: 13px;
  box-shadow: 0 3px 10px rgba(18, 30, 58, 0.04);
}

.roadmap-week-index {
  display: grid;
  flex: none;
  width: 38px;
  height: 38px;
  font-family: var(--font-display);
  font-size: 0.86rem;
  font-weight: 800;
  color: var(--phase-color);
  background: color-mix(in oklab, var(--phase-color) 10%, var(--surface));
  border: 1px solid color-mix(in oklab, var(--phase-color) 28%, var(--line));
  border-radius: 10px;
  place-items: center;
}

.roadmap-week-label > div {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.roadmap-week-stage {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--phase-color);
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

.roadmap-week-label strong {
  overflow: hidden;
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--ink);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.roadmap-week-label small {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 0.74rem;
  color: var(--muted);
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.roadmap-node {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
  padding: 10px 13px 12px;
  color: var(--ink);
  text-decoration: none;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 4px 0 color-mix(in oklab, var(--line) 78%, transparent);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease;
}

.roadmap-node:hover {
  z-index: 4;
  border-color: var(--line-strong);
  box-shadow: 0 10px 24px color-mix(in oklab, var(--line-strong) 38%, transparent);
  transform: translateY(-2px);
}

.roadmap-node.is-complete {
  background: color-mix(in oklab, var(--success) 8%, var(--surface));
  border-color: color-mix(in oklab, var(--success) 42%, var(--line));
}

.roadmap-node.is-available {
  background: color-mix(in oklab, var(--info) 8%, var(--surface));
  border-color: color-mix(in oklab, var(--info) 48%, var(--line));
}

.roadmap-node.is-next {
  box-shadow:
    0 0 0 3px color-mix(in oklab, var(--info) 18%, transparent),
    0 12px 30px color-mix(in oklab, var(--info) 24%, transparent);
  animation: roadmap-next 2.6s ease-in-out infinite;
}

@keyframes roadmap-next {
  50% {
    box-shadow:
      0 0 0 5px color-mix(in oklab, var(--info) 11%, transparent),
      0 14px 34px color-mix(in oklab, var(--info) 30%, transparent);
  }
}

.roadmap-node.is-locked {
  color: var(--muted);
  cursor: not-allowed;
  opacity: 0.58;
  filter: saturate(0.65);
}

.roadmap-node.is-locked:hover {
  border-color: var(--line);
  box-shadow: 0 4px 0 color-mix(in oklab, var(--line) 78%, transparent);
  transform: none;
}

.roadmap-node-top,
.roadmap-node-foot,
.roadmap-gate-top,
.roadmap-gate-foot {
  display: flex;
  flex: none;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.roadmap-node-order {
  font-family: var(--font-display);
  color: var(--ink);
  letter-spacing: 0;
}

.roadmap-node-stage {
  font-size: 0.65rem;
  color: var(--muted);
}

.roadmap-node-title {
  display: -webkit-box;
  flex: none;
  overflow: hidden;
  font-family: var(--font-display);
  font-size: 0.93rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--ink);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.roadmap-node-foot {
  font-size: 0.7rem;
  text-transform: none;
  letter-spacing: 0;
}

.roadmap-node-status,
.roadmap-gate-status {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  text-transform: none;
  letter-spacing: 0;
}

.roadmap-node-status .learning-icon,
.roadmap-gate-status .learning-icon {
  font-size: 0.9rem;
}

.roadmap-node.is-complete .roadmap-node-status {
  color: var(--success);
}

.roadmap-node.is-available .roadmap-node-status {
  color: var(--info);
}

.roadmap-node-score {
  padding: 1px 7px;
  font-size: 0.65rem;
  color: var(--muted);
  background: var(--surface-2);
  border-radius: 999px;
}

.roadmap-node-track {
  position: absolute;
  right: 13px;
  bottom: 6px;
  left: 13px;
  height: 2px;
  overflow: hidden;
  background: var(--line);
  border-radius: 999px;
}

.roadmap-node-track span {
  display: block;
  height: 100%;
  background: var(--success);
  border-radius: inherit;
}

.roadmap-node.is-gate {
  flex-direction: row;
  gap: 14px;
  align-items: center;
  padding: 14px 18px;
  background: linear-gradient(
    110deg,
    color-mix(in oklab, var(--phase-color) 14%, var(--surface)),
    var(--surface) 78%
  );
  border-color: color-mix(in oklab, var(--phase-color) 40%, var(--line));
  border-radius: 18px;
  box-shadow: 0 5px 0 color-mix(in oklab, var(--phase-color) 20%, transparent);
}

.roadmap-node.is-gate.is-complete {
  background: linear-gradient(
    110deg,
    color-mix(in oklab, var(--success) 16%, var(--surface)),
    var(--surface) 78%
  );
  border-color: color-mix(in oklab, var(--success) 46%, var(--line));
}

.roadmap-node.is-gate.is-available {
  background: linear-gradient(
    110deg,
    color-mix(in oklab, var(--info) 16%, var(--surface)),
    var(--surface) 78%
  );
  border-color: color-mix(in oklab, var(--info) 52%, var(--line));
}

.roadmap-gate-icon {
  display: grid;
  flex: none;
  width: 44px;
  height: 44px;
  font-size: 1.2rem;
  color: var(--phase-color);
  background: color-mix(in oklab, var(--phase-color) 12%, var(--surface));
  border: 1px solid color-mix(in oklab, var(--phase-color) 30%, var(--line));
  border-radius: 13px;
  place-items: center;
}

.roadmap-gate-copy {
  display: grid;
  flex: 1;
  gap: 2px;
  min-width: 0;
}

.roadmap-gate-top {
  color: var(--phase-color);
  letter-spacing: 0.07em;
}

.roadmap-gate-title {
  overflow: hidden;
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 750;
  color: var(--ink);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.roadmap-gate-foot {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: none;
  letter-spacing: 0;
}

.roadmap-gate-arrow {
  flex: none;
  font-size: 1.1rem;
  color: var(--phase-color);
}

.roadmap-mobile {
  display: none;
  padding: 4px;
}

.roadmap-mobile-root {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 16px 18px;
  background:
    radial-gradient(circle at 100% 0%, rgba(47, 79, 224, 0.14), transparent 14rem),
    linear-gradient(145deg, var(--surface), color-mix(in oklab, var(--brand) 5%, var(--surface)));
  border: 1px solid color-mix(in oklab, var(--brand) 34%, var(--line));
  border-radius: 20px;
  box-shadow: 0 14px 32px rgba(35, 56, 140, 0.13);
}

.roadmap-mobile-branches {
  position: relative;
  display: grid;
  gap: 16px;
  padding-left: 18px;
  margin-top: 20px;
}

.roadmap-mobile-branches::before {
  position: absolute;
  top: -20px;
  bottom: 30px;
  left: 6px;
  width: 2px;
  content: '';
  background: linear-gradient(var(--brand), color-mix(in oklab, var(--line) 70%, transparent));
  opacity: 0.48;
}

.roadmap-mobile-phase {
  position: relative;
  display: grid;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(
    135deg,
    color-mix(in oklab, var(--phase-color) 8%, var(--surface)),
    var(--surface) 68%
  );
  border: 1px solid color-mix(in oklab, var(--phase-color) 28%, var(--line));
  border-left: 4px solid var(--phase-color);
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
}

.roadmap-mobile-phase::before {
  position: absolute;
  top: 35px;
  left: -12px;
  width: 12px;
  height: 2px;
  content: '';
  background: var(--phase-color);
}

.roadmap-mobile-phase::after {
  position: absolute;
  top: 30px;
  left: -17px;
  width: 8px;
  height: 8px;
  content: '';
  background: var(--surface);
  border: 2px solid var(--phase-color);
  border-radius: 999px;
}

.roadmap-mobile-phase-top {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  align-items: center;
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--phase-color);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.roadmap-mobile-phase-top > span:nth-child(2) {
  color: var(--muted);
  text-transform: none;
  letter-spacing: 0;
}

.roadmap-mobile-phase-role {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  margin-left: auto;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--phase-color);
  text-transform: none;
  letter-spacing: 0;
}

.roadmap-mobile-phase-head h3 {
  margin: 6px 0 5px;
  font-family: var(--font-display);
  font-size: 1.42rem;
  line-height: 1.12;
  color: var(--ink);
}

.roadmap-mobile-phase-head p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--muted);
}

.roadmap-mobile-progress {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 11px;
  font-size: 0.78rem;
  font-weight: 750;
  color: var(--muted);
}

.roadmap-mobile-weeks {
  display: grid;
  gap: 14px;
}

.roadmap-mobile-week {
  display: grid;
  gap: 10px;
  padding-left: 14px;
  border-left: 2px solid color-mix(in oklab, var(--phase-color) 20%, var(--line));
}

.roadmap-mobile-week-head {
  display: flex;
  gap: 10px;
  align-items: center;
}

.roadmap-mobile-week-head > div {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.roadmap-mobile-week-head strong {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 750;
  line-height: 1.25;
  color: var(--ink);
}

.roadmap-mobile-week-head small {
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.76rem;
  line-height: 1.4;
  color: var(--muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.roadmap-mobile-topics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.roadmap-mobile-node {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px 13px;
  color: var(--ink);
  text-decoration: none;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 3px 0 color-mix(in oklab, var(--line) 78%, transparent);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease;
}

.roadmap-mobile-node:hover {
  border-color: var(--line-strong);
  box-shadow: 0 8px 18px color-mix(in oklab, var(--line-strong) 30%, transparent);
  transform: translateY(-2px);
}

.roadmap-mobile-node.is-complete {
  background: color-mix(in oklab, var(--success) 8%, var(--surface));
  border-color: color-mix(in oklab, var(--success) 42%, var(--line));
}

.roadmap-mobile-node.is-available {
  background: color-mix(in oklab, var(--info) 8%, var(--surface));
  border-color: color-mix(in oklab, var(--info) 48%, var(--line));
}

.roadmap-mobile-node.is-next {
  box-shadow:
    0 0 0 3px color-mix(in oklab, var(--info) 18%, transparent),
    0 10px 24px color-mix(in oklab, var(--info) 22%, transparent);
}

.roadmap-mobile-node.is-locked {
  color: var(--muted);
  cursor: not-allowed;
  opacity: 0.58;
  filter: saturate(0.65);
}

.roadmap-mobile-node.is-locked:hover {
  border-color: var(--line);
  box-shadow: 0 3px 0 color-mix(in oklab, var(--line) 78%, transparent);
  transform: none;
}

.roadmap-mobile-node-top {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  font-size: 0.66rem;
  font-weight: 750;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.roadmap-mobile-node-title {
  font-family: var(--font-display);
  font-size: 0.98rem;
  font-weight: 750;
  line-height: 1.25;
  color: var(--ink);
}

.roadmap-mobile-node-foot {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 2px;
  font-size: 0.7rem;
  color: var(--muted);
}

.roadmap-mobile-node.is-complete .roadmap-node-status {
  color: var(--success);
}

.roadmap-mobile-node.is-available .roadmap-node-status {
  color: var(--info);
}

.roadmap-mobile-gate {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 15px;
  margin-top: 2px;
  color: var(--ink);
  text-decoration: none;
  background: linear-gradient(
    110deg,
    color-mix(in oklab, var(--phase-color) 14%, var(--surface)),
    var(--surface) 78%
  );
  border: 1px solid color-mix(in oklab, var(--phase-color) 40%, var(--line));
  border-radius: 16px;
  box-shadow: 0 4px 0 color-mix(in oklab, var(--phase-color) 20%, transparent);
}

.roadmap-mobile-gate.is-complete {
  background: linear-gradient(
    110deg,
    color-mix(in oklab, var(--success) 16%, var(--surface)),
    var(--surface) 78%
  );
  border-color: color-mix(in oklab, var(--success) 46%, var(--line));
}

.roadmap-mobile-gate.is-available {
  border-color: color-mix(in oklab, var(--info) 52%, var(--line));
}

.roadmap-mobile-gate.is-locked {
  cursor: not-allowed;
  opacity: 0.58;
  filter: saturate(0.65);
}

.roadmap-mobile-gate .roadmap-gate-title {
  font-size: 1rem;
  white-space: normal;
}

.roadmap-mobile-gate .roadmap-gate-foot {
  font-size: 0.7rem;
}

[data-tone='blue'] {
  --phase-color: var(--phase-blue);
}

[data-tone='violet'] {
  --phase-color: var(--phase-violet);
}

[data-tone='teal'] {
  --phase-color: var(--phase-teal);
}

@media (max-width: 1300px) {
  .roadmap-scroll {
    display: none;
  }

  .roadmap-mobile {
    display: block;
  }

  .roadmap-legend-note {
    display: none;
  }
}

@media (max-width: 720px) {
  .roadmap-mobile {
    padding: 0;
  }

  .roadmap-mobile-root {
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 12px;
    padding: 14px;
    border-radius: 17px;
  }

  .roadmap-mobile-root .roadmap-root-mark {
    width: 44px;
    height: 44px;
  }

  .roadmap-mobile-root .roadmap-root-progress {
    grid-column: 1 / -1;
    grid-auto-flow: column;
    gap: 8px;
    justify-content: start;
    justify-items: start;
    padding-top: 9px;
    border-top: 1px solid var(--line);
  }

  .roadmap-mobile-root .roadmap-root-progress strong {
    font-size: 1.2rem;
  }

  .roadmap-mobile-branches {
    padding-left: 14px;
  }

  .roadmap-mobile-branches::before {
    left: 4px;
  }

  .roadmap-mobile-phase {
    padding: 14px;
    border-radius: 17px;
  }

  .roadmap-mobile-phase::before {
    left: -10px;
    width: 10px;
  }

  .roadmap-mobile-phase::after {
    left: -15px;
  }

  .roadmap-mobile-phase-role {
    width: 100%;
    margin-left: 0;
  }

  .roadmap-mobile-topics {
    grid-template-columns: 1fr;
  }

  .roadmap-legend {
    gap: 8px 14px;
    padding: 11px 14px;
    font-size: 0.8rem;
  }
}
</style>
