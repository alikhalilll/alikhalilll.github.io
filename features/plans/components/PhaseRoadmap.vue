<script setup lang="ts">
import { computed, ref } from 'vue';

import type { PhaseKey, PlanPhase, PlanTopic } from '~/features/plan1/types';
import type { NextAction, QuizResult, TopicStatus } from '../composables/usePlanProgress';
import { getPlanRuntime } from '../planRuntime';
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

const lockedNotice = ref('');

const runtime = computed(() => getPlanRuntime(props.planId));
const phases = computed(() => runtime.value?.phases ?? []);
const topics = computed(() => runtime.value?.topics ?? []);

interface WeekGroup {
  number: number;
  stage: string;
  title: string;
  topics: PlanTopic[];
  done: number;
  total: number;
  percent: number;
}

interface PhaseCard {
  phase: PlanPhase;
  weeks: WeekGroup[];
  done: number;
  total: number;
  percent: number;
  state: 'complete' | 'active' | 'locked';
  statusLabel: string;
  gateStatus: 'complete' | 'available' | 'locked';
}

const phaseCards = computed<PhaseCard[]>(() =>
  phases.value.map((phase) => {
    const progress = props.phaseProgress.find((entry) => entry.key === phase.key);
    const weeks = phase.weeksData.map((week) => {
      const weekTopics = runtime.value?.topicsByWeek[week.number] ?? [];
      const done = weekTopics.filter(
        (topic) => props.getTopicStatus(topic.id) === 'complete'
      ).length;

      return {
        number: week.number,
        stage: week.stage,
        title: week.title,
        topics: weekTopics,
        done,
        total: weekTopics.length,
        percent: weekTopics.length === 0 ? 0 : Math.round((done / weekTopics.length) * 100),
      };
    });
    const gateStatus = props.getPhaseQuizStatus(phase.key);
    const done = progress?.done ?? 0;
    const total = progress?.total ?? weeks.reduce((count, week) => count + week.topics.length, 0);
    const state = gateStatus === 'complete' ? 'complete' : progress?.unlocked ? 'active' : 'locked';
    const statusLabel =
      state === 'complete'
        ? 'Complete'
        : gateStatus === 'available'
          ? 'Gate ready'
          : done > 0
            ? 'In progress'
            : state === 'active'
              ? 'Ready'
              : 'Locked';

    return {
      phase,
      weeks,
      done,
      total,
      percent: progress?.percent ?? 0,
      state,
      statusLabel,
      gateStatus,
    };
  })
);

const phaseRows = computed(() => {
  const rows: PhaseCard[][] = [];
  for (let index = 0; index < phaseCards.value.length; index += 2) {
    rows.push(phaseCards.value.slice(index, index + 2));
  }
  return rows;
});

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

const isNextTopic = (topic: PlanTopic) =>
  props.nextAction.kind === 'topic' && props.nextAction.topic.id === topic.id;

const isNextGate = (phaseKey: PhaseKey) =>
  props.nextAction.kind === 'phase' && props.nextAction.phase.key === phaseKey;

const topicStatusLabel = (topic: PlanTopic) => {
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

const statusIcon = (status: TopicStatus | 'complete' | 'available' | 'locked') => {
  if (status === 'complete') return 'lucide:circle-check-big';
  if (status === 'available') return 'lucide:play';
  return 'lucide:lock';
};

const phaseIcon = (state: PhaseCard['state']) => {
  if (state === 'complete') return 'lucide:circle-check-big';
  if (state === 'active') return 'lucide:compass';
  return 'lucide:lock';
};

const handleLockedTopic = (topic: PlanTopic) => {
  const status = props.getTopicStatus(topic.id);
  if (status === 'complete' || status === 'available') return;

  lockedNotice.value = `Locked. Pass the previous topic quiz first to open “${topic.title}”.`;
};

const handleLockedGate = (phase: PlanPhase) => {
  const status = props.getPhaseQuizStatus(phase.key);
  if (status === 'complete' || status === 'available') return;

  const count = runtime.value?.getTopicsForPhase(phase.key).length ?? 0;
  lockedNotice.value = `Phase ${phase.number} gate is locked. Pass all ${count} topic quizzes in ${phase.title} first.`;
};

const topicTitle = (topic: PlanTopic) => `Topic ${topic.order}: ${topic.title}`;

const gateTitle = (phase: PlanPhase, status: string) => {
  if (status === 'locked') return `Phase ${phase.number} gate is locked`;
  return `Open Phase ${phase.number} gate: ${phase.title}`;
};
</script>

<template>
  <div class="phase-roadmap grid gap-5">
    <!-- Locked notice -->
    <div
      v-if="lockedNotice"
      role="status"
      class="flex items-center gap-2.5 rounded-xl border border-[color-mix(in_oklab,var(--brand)_28%,var(--line))] bg-[color-mix(in_oklab,var(--brand)_8%,var(--surface))] px-3.5 py-3 text-[0.88rem] text-[var(--ink)]"
    >
      <Icon name="lucide:lock" class="learning-icon text-[var(--brand)]" />
      <span class="flex-1">{{ lockedNotice }}</span>
      <button
        type="button"
        aria-label="Dismiss message"
        class="grid rounded-md p-1 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
        @click="lockedNotice = ''"
      >
        <Icon name="lucide:x" class="learning-icon" />
      </button>
    </div>

    <!-- Root summary card -->
    <section
      class="phase-roadmap-root mx-auto flex w-full max-w-[820px] flex-wrap items-center justify-between gap-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm"
    >
      <span class="absolute inset-x-0 top-0 h-[3px] bg-[var(--brand)]" aria-hidden="true" />
      <div class="grid max-w-[720px] gap-1">
        <span
          class="inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-widest text-[var(--brand)]"
        >
          <Icon name="lucide:git-fork" class="learning-icon" />
          Root · Phase tree
        </span>
        <strong
          class="font-[var(--font-display)] text-[1.14rem] font-bold leading-tight text-[var(--ink)]"
        >
          {{ phases.length }} phases · {{ totalWeeks }} weeks · {{ topics.length }} topics
        </strong>
        <p class="m-0 text-[0.92rem] leading-snug text-[var(--muted)]">
          Every phase, week and topic grows from one root. Follow the branches in order: pass a
          topic leaf to open the next, and pass every leaf in a phase to unlock its gate.
        </p>
        <span
          class="mt-1 inline-flex items-center gap-1.5 self-start rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2 py-1 text-[0.78rem] font-semibold text-[var(--ink)]"
        >
          <Icon name="lucide:flag" class="learning-icon text-[var(--brand)]" />
          {{ nextLabel }}
        </span>
      </div>

      <div class="grid w-full max-w-[290px] flex-none gap-2">
        <div class="flex items-baseline justify-between gap-2.5">
          <strong
            class="font-[var(--font-display)] text-[1.55rem] font-bold leading-none text-[var(--ink)]"
          >
            {{ overallPercent }}%
          </strong>
          <span class="text-[0.78rem] text-[var(--muted)]">
            {{ totalDone }} / {{ topics.length }} topics passed
          </span>
        </div>
        <div class="h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
          <span
            class="block h-full rounded-full bg-[var(--brand)] transition-all"
            :style="{ width: `${overallPercent}%` }"
          />
        </div>
        <span class="inline-flex items-center gap-1.5 text-[0.74rem] text-[var(--muted)]">
          <Icon name="lucide:git-fork" class="learning-icon" />
          Root → phase → week → topic
        </span>
        <div class="mt-1 flex flex-wrap gap-3 text-[0.76rem] text-[var(--muted)]">
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
      </div>
    </section>

    <!-- Phase tree -->
    <div class="phase-tree relative mt-2" aria-label="Roadmap tree">
      <div
        v-for="(row, rowIndex) in phaseRows"
        :key="rowIndex"
        class="phase-tree-row relative pt-8"
      >
        <div class="grid gap-14 md:grid-cols-2">
          <div
            v-for="(card, columnIndex) in row"
            :key="card.phase.key"
            class="phase-roadmap-branch relative flex min-w-0"
            :class="columnIndex === 0 ? 'is-left' : 'is-right'"
            :data-tone="card.phase.tone"
          >
            <article
              class="phase-roadmap-card relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-sm"
              :data-state="card.state"
            >
              <!-- Card head -->
              <header class="grid gap-2 border-b border-[var(--line)] bg-[var(--surface-2)] p-5">
                <div class="flex items-center justify-between gap-2.5">
                  <span
                    class="text-[0.72rem] font-bold uppercase tracking-wider text-[color:var(--phase-color)]"
                  >
                    Phase {{ card.phase.number }} · {{ card.phase.weeks }}
                  </span>
                  <span
                    class="phase-roadmap-state inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 text-[0.72rem] font-semibold text-[var(--muted)]"
                    :data-status="card.state"
                  >
                    <Icon :name="phaseIcon(card.state)" class="learning-icon" />
                    {{ card.statusLabel }}
                  </span>
                </div>
                <div class="flex items-center gap-2.5">
                  <span
                    class="flex-none font-[var(--font-display)] text-[1.1rem] font-extrabold leading-none text-[color:var(--phase-color)] opacity-50"
                  >
                    {{ String(card.phase.number).padStart(2, '0') }}
                  </span>
                  <h3 class="m-0 text-[1.24rem] font-bold leading-tight text-[var(--ink)]">
                    {{ card.phase.title }}
                  </h3>
                </div>
                <p class="m-0 text-[0.9rem] leading-snug text-[var(--muted)]">
                  {{ card.phase.goal }}
                </p>
                <div class="grid gap-1">
                  <div
                    class="flex items-center justify-between gap-2 text-[0.76rem] text-[var(--muted)]"
                  >
                    <span>{{ card.done }} / {{ card.total }} topics passed</span>
                    <strong class="text-[var(--ink)]">{{ card.percent }}%</strong>
                  </div>
                  <div class="roadmap-progress-track">
                    <span :style="{ width: `${card.percent}%` }" />
                  </div>
                </div>
                <span
                  class="inline-flex items-center gap-1.5 self-start rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-[0.76rem] font-semibold text-[var(--ink)]"
                >
                  <Icon
                    name="lucide:badge-check"
                    class="learning-icon text-[color:var(--phase-color)]"
                  />
                  {{ card.phase.role.title }}
                </span>
              </header>

              <!-- Weeks + topics -->
              <div class="phase-roadmap-weeks relative px-4 pb-3 pl-8 pt-2">
                <section
                  v-for="week in card.weeks"
                  :key="week.number"
                  class="phase-roadmap-week relative border-b border-[var(--line)] py-3 last:border-b-0"
                >
                  <div class="mb-2 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5">
                    <span
                      class="grid h-6 min-w-[32px] place-items-center rounded-md border border-[color-mix(in_oklab,var(--phase-color)_20%,var(--line))] bg-[color-mix(in_oklab,var(--phase-color)_7%,var(--surface))] text-[0.68rem] font-bold text-[color:var(--phase-color)]"
                    >
                      W{{ week.number }}
                    </span>
                    <div class="grid min-w-0 gap-0">
                      <strong class="truncate text-[0.88rem] font-semibold text-[var(--ink)]">
                        {{ week.title }}
                      </strong>
                      <small class="text-[0.72rem] text-[var(--muted)]">{{ week.stage }}</small>
                    </div>
                    <span class="text-[0.72rem] font-semibold text-[var(--muted)]">
                      {{ week.done }}/{{ week.total }}
                    </span>
                  </div>
                  <div class="mb-2.5 h-[3px] overflow-hidden rounded-full bg-[var(--line)]">
                    <span
                      class="block h-full rounded-full bg-[color:var(--phase-color)] transition-all"
                      :style="{ width: `${week.percent}%` }"
                    />
                  </div>

                  <div class="phase-roadmap-topics relative mt-2 grid gap-1.5 pl-4">
                    <template v-for="topic in week.topics" :key="topic.id">
                      <NuxtLink
                        v-if="getTopicStatus(topic.id) !== 'locked'"
                        :to="topicPath(planId, topic.id)"
                        class="phase-roadmap-topic group relative flex min-w-0 items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-2 text-[var(--ink)] no-underline transition-all hover:border-[color:var(--phase-color)] hover:bg-[var(--surface)]"
                        :class="{
                          'phase-roadmap-topic-complete': getTopicStatus(topic.id) === 'complete',
                          'phase-roadmap-topic-next': isNextTopic(topic),
                        }"
                        :data-status="getTopicStatus(topic.id)"
                        :aria-label="topicTitle(topic)"
                      >
                        <span
                          class="grid h-7 w-7 flex-none place-items-center rounded-md border border-[color-mix(in_oklab,var(--phase-color)_20%,var(--line))] bg-[var(--surface)] text-[0.66rem] font-bold text-[color:var(--phase-color)]"
                        >
                          {{ topic.order }}
                        </span>
                        <span class="grid flex-1 min-w-0 gap-0">
                          <strong class="line-clamp-2 text-[0.86rem] font-semibold leading-snug">
                            {{ topic.title }}
                          </strong>
                          <span class="truncate text-[0.72rem] text-[var(--muted)]">
                            {{ topic.stage }}
                            <template v-if="getTopicResult(topic.id)">
                              · {{ getTopicResult(topic.id)?.bestScore }}/3
                            </template>
                          </span>
                        </span>
                        <span
                          class="inline-flex flex-none items-center gap-1 text-[0.72rem] font-medium text-[var(--muted)]"
                        >
                          <Icon
                            :name="statusIcon(getTopicStatus(topic.id))"
                            class="learning-icon"
                          />
                          <span class="phase-roadmap-topic-label">{{
                            topicStatusLabel(topic)
                          }}</span>
                        </span>
                      </NuxtLink>

                      <button
                        v-else
                        type="button"
                        class="phase-roadmap-topic phase-roadmap-topic-locked relative flex min-w-0 cursor-not-allowed items-center gap-2 rounded-md border border-dashed border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-2 text-left text-[var(--muted)]"
                        data-status="locked"
                        :aria-label="`${topicTitle(topic)} — locked`"
                        @click="handleLockedTopic(topic)"
                      >
                        <span
                          class="grid h-7 w-7 flex-none place-items-center rounded-md border border-dashed border-[var(--line)] bg-[var(--surface-2)] text-[0.66rem] font-bold text-[var(--muted)]"
                        >
                          {{ topic.order }}
                        </span>
                        <span class="grid flex-1 min-w-0 gap-0">
                          <strong class="line-clamp-2 text-[0.86rem] font-semibold leading-snug">
                            {{ topic.title }}
                          </strong>
                          <span class="truncate text-[0.72rem] text-[var(--muted)]">
                            {{ topic.stage }}
                          </span>
                        </span>
                        <span
                          class="inline-flex flex-none items-center gap-1 text-[0.72rem] font-medium"
                        >
                          <Icon name="lucide:lock" class="learning-icon" />
                          <span class="phase-roadmap-topic-label">Locked</span>
                        </span>
                      </button>
                    </template>
                  </div>
                </section>
              </div>

              <!-- Phase gate footer -->
              <footer class="mt-auto border-t border-[var(--line)] px-5 py-4">
                <NuxtLink
                  v-if="card.gateStatus !== 'locked'"
                  :to="phasePath(planId, card.phase.key)"
                  class="group flex items-center gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3 text-[var(--ink)] no-underline transition-all hover:-translate-y-0.5 hover:border-[color:var(--phase-color)]"
                  :class="{
                    'bg-[color-mix(in_oklab,var(--success)_6%,var(--surface-2))] border-[color-mix(in_oklab,var(--success)_32%,var(--line))]':
                      card.gateStatus === 'complete',
                    'bg-[var(--brand-soft)] border-[color-mix(in_oklab,var(--brand)_40%,var(--line))]':
                      isNextGate(card.phase.key),
                  }"
                  :aria-label="gateTitle(card.phase, card.gateStatus)"
                >
                  <span
                    class="grid h-8 w-8 flex-none place-items-center rounded-md border border-[var(--line)] bg-[var(--surface)] text-[color:var(--phase-color)]"
                    :class="card.gateStatus === 'complete' && 'text-[var(--success)]'"
                  >
                    <Icon
                      :name="
                        card.gateStatus === 'complete' ? 'lucide:badge-check' : 'lucide:door-open'
                      "
                      class="learning-icon"
                    />
                  </span>
                  <span class="grid flex-1 min-w-0 gap-0">
                    <small
                      class="text-[0.68rem] font-bold uppercase tracking-widest text-[var(--muted)]"
                    >
                      Phase {{ card.phase.number }} gate
                    </small>
                    <strong class="truncate text-[0.88rem] font-semibold">
                      {{
                        card.gateStatus === 'complete'
                          ? card.phase.role.title
                          : 'Take the phase quiz'
                      }}
                    </strong>
                    <span class="text-[0.74rem] text-[var(--muted)]">
                      {{ gateStatusLabel(card.phase.key) }}
                    </span>
                  </span>
                  <Icon
                    name="lucide:arrow-right"
                    class="learning-icon text-[color:var(--phase-color)] transition-transform group-hover:translate-x-0.5"
                  />
                </NuxtLink>

                <button
                  v-else
                  type="button"
                  class="flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-2)] p-3 text-left text-[var(--muted)]"
                  :aria-label="gateTitle(card.phase, card.gateStatus)"
                  @click="handleLockedGate(card.phase)"
                >
                  <span
                    class="grid h-8 w-8 flex-none place-items-center rounded-md border border-[var(--line)] bg-[var(--surface)]"
                  >
                    <Icon name="lucide:lock" class="learning-icon" />
                  </span>
                  <span class="grid flex-1 min-w-0 gap-0">
                    <small
                      class="text-[0.68rem] font-bold uppercase tracking-widest text-[var(--muted)]"
                    >
                      Phase {{ card.phase.number }} gate
                    </small>
                    <strong class="truncate text-[0.88rem] font-semibold">
                      {{ card.phase.role.title }}
                    </strong>
                    <span class="text-[0.74rem]"> Pass all {{ card.total }} topics to open </span>
                  </span>
                </button>
              </footer>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Root card gets a top accent bar via absolute positioning */
.phase-roadmap-root {
  position: relative;
}

/* Phase tone → phase-color mapping (branch cards + topics) */
.phase-roadmap-branch[data-tone='violet'] {
  --phase-color: var(--phase-violet);
}

.phase-roadmap-branch[data-tone='blue'] {
  --phase-color: var(--phase-blue);
}

.phase-roadmap-branch[data-tone='teal'] {
  --phase-color: var(--phase-teal);
}

.phase-roadmap-branch[data-tone='amber'] {
  --phase-color: var(--phase-amber);
}

.phase-roadmap-branch[data-tone='rose'] {
  --phase-color: var(--phase-rose);
}

.phase-roadmap-branch[data-tone='indigo'] {
  --phase-color: var(--phase-indigo);
}

/* Vertical spine down from the root through the tree */
.phase-tree::before {
  position: absolute;
  top: -30px;
  left: 50%;
  width: 1px;
  height: 30px;
  content: '';
  background: linear-gradient(var(--brand), var(--line-strong));
}

.phase-tree-row + .phase-tree-row {
  margin-top: 20px;
}

/* Horizontal rail across each row */
.phase-tree-row::before {
  position: absolute;
  top: 0;
  right: 25%;
  left: 25%;
  height: 1px;
  content: '';
  background: var(--line-strong);
}

/* Vertical connector linking rows */
.phase-tree-row:not(:last-child)::after {
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: calc(100% + 20px);
  content: '';
  background: var(--line-strong);
}

/* Each branch gets a stub + dot from the row rail */
.phase-roadmap-branch::before {
  position: absolute;
  top: -30px;
  left: 50%;
  width: 1px;
  height: 30px;
  content: '';
  background: var(--line-strong);
}

.phase-roadmap-branch::after {
  position: absolute;
  top: -4px;
  left: 50%;
  width: 8px;
  height: 8px;
  content: '';
  background: var(--surface);
  border: 2px solid var(--phase-color, var(--brand));
  border-radius: 999px;
  transform: translateX(-50%);
}

/* Dim locked phase cards without changing their layout */
.phase-roadmap-card[data-state='locked'] {
  opacity: 0.74;
}

/* State chip variants (icon color etc.) */
.phase-roadmap-state[data-status='complete'] {
  color: var(--success);
  background: var(--success-soft);
  border-color: color-mix(in oklab, var(--success) 24%, var(--line));
}

.phase-roadmap-state[data-status='active'] {
  color: var(--brand);
  background: var(--brand-soft);
  border-color: color-mix(in oklab, var(--brand) 22%, var(--line));
}

/* Tree spine inside each phase card (vertical rail with elbows) */
.phase-roadmap-weeks::before {
  position: absolute;
  top: 0;
  bottom: 14px;
  left: 18px;
  width: 1px;
  content: '';
  background: linear-gradient(var(--line-strong), var(--line) 86%, transparent);
}

.phase-roadmap-week::before {
  position: absolute;
  top: 24px;
  left: -14px;
  width: 14px;
  height: 1px;
  content: '';
  background: var(--line-strong);
}

.phase-roadmap-week::after {
  position: absolute;
  top: 21px;
  left: -17px;
  width: 6px;
  height: 6px;
  content: '';
  background: var(--surface);
  border: 1px solid var(--phase-color, var(--brand));
  border-radius: 999px;
}

/* Topic rail — inner tree with dot per leaf */
.phase-roadmap-topics::before {
  position: absolute;
  top: 0;
  bottom: 14px;
  left: 4px;
  width: 1px;
  content: '';
  background: linear-gradient(var(--line-strong), var(--line) 84%, transparent);
}

.phase-roadmap-topic::before {
  position: absolute;
  top: 50%;
  left: -12px;
  width: 12px;
  height: 1px;
  content: '';
  background: var(--line-strong);
}

.phase-roadmap-topic::after {
  position: absolute;
  top: calc(50% - 3px);
  left: -15px;
  width: 6px;
  height: 6px;
  content: '';
  background: var(--surface);
  border: 1px solid var(--phase-color, var(--brand));
  border-radius: 999px;
}

/* Topic variants beyond Tailwind reach */
.phase-roadmap-topic-complete {
  border-color: color-mix(in oklab, var(--success) 32%, var(--line));
}

.phase-roadmap-topic-next {
  background: var(--brand-soft);
  border-color: color-mix(in oklab, var(--brand) 45%, var(--line));
}

.phase-roadmap-topic-complete .phase-roadmap-topic-label {
  color: var(--success);
}

.phase-roadmap-topic-next .phase-roadmap-topic-label {
  color: var(--brand);
}

@media (max-width: 760px) {
  .phase-roadmap-topic-label {
    display: none;
  }
}

@media (max-width: 620px) {
  .phase-roadmap-root {
    padding: 18px;
  }

  /* Collapse the two-column tree to one column + straight stems */
  .phase-tree-row > .grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .phase-tree-row::before {
    right: 50%;
    left: 50%;
    display: none;
  }
}
</style>
