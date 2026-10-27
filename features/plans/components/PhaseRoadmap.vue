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

const totalDone = computed(() => phaseCards.value.reduce((total, card) => total + card.done, 0));
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
  <div class="phase-roadmap">
    <div v-if="lockedNotice" class="phase-roadmap-notice" role="status">
      <Icon name="lucide:lock" class="learning-icon" />
      <span>{{ lockedNotice }}</span>
      <button type="button" aria-label="Dismiss message" @click="lockedNotice = ''">
        <Icon name="lucide:x" class="learning-icon" />
      </button>
    </div>

    <div class="phase-roadmap-root">
      <div class="phase-roadmap-root-copy">
        <span class="phase-roadmap-root-kicker">The full path</span>
        <strong>{{ topics.length }} topics · {{ phases.length }} phases</strong>
        <p>
          Follow the phases in order. A topic opens when the previous one is passed; a phase gate
          opens when every topic in that phase is passed.
        </p>
        <span class="phase-roadmap-next">
          <Icon name="lucide:flag" class="learning-icon" />
          {{ nextLabel }}
        </span>
      </div>

      <div class="phase-roadmap-root-side">
        <div class="phase-roadmap-total">
          <strong>{{ overallPercent }}%</strong>
          <span>{{ totalDone }} / {{ topics.length }} topics passed</span>
        </div>
        <div class="phase-roadmap-total-track">
          <span :style="{ width: `${overallPercent}%` }" />
        </div>
        <div class="phase-roadmap-legend">
          <span><i class="legend-dot is-complete" /> Passed</span>
          <span><i class="legend-dot is-available" /> Open</span>
          <span><i class="legend-dot is-locked" /> Locked</span>
        </div>
      </div>
    </div>

    <div class="phase-roadmap-grid">
      <article
        v-for="card in phaseCards"
        :key="card.phase.key"
        class="phase-roadmap-card"
        :data-tone="card.phase.tone"
        :data-state="card.state"
      >
        <header class="phase-roadmap-card-head">
          <div class="phase-roadmap-card-top">
            <span class="phase-roadmap-phase-label">
              Phase {{ card.phase.number }} · {{ card.phase.weeks }}
            </span>
            <span class="phase-roadmap-state" :data-status="card.state">
              <Icon :name="phaseIcon(card.state)" class="learning-icon" />
              {{ card.statusLabel }}
            </span>
          </div>
          <div class="phase-roadmap-title-row">
            <span class="phase-roadmap-watermark" aria-hidden="true">
              {{ String(card.phase.number).padStart(2, '0') }}
            </span>
            <h3>{{ card.phase.title }}</h3>
          </div>
          <p class="phase-roadmap-goal">{{ card.phase.goal }}</p>
          <div class="phase-roadmap-progress">
            <div class="phase-roadmap-progress-copy">
              <span>{{ card.done }} / {{ card.total }} topics passed</span>
              <strong>{{ card.percent }}%</strong>
            </div>
            <div class="roadmap-progress-track">
              <span :style="{ width: `${card.percent}%` }" />
            </div>
          </div>
          <span class="phase-roadmap-role">
            <Icon name="lucide:badge-check" class="learning-icon" />
            {{ card.phase.role.title }}
          </span>
        </header>

        <div class="phase-roadmap-weeks">
          <section v-for="week in card.weeks" :key="week.number" class="phase-roadmap-week">
            <div class="phase-roadmap-week-head">
              <span class="phase-roadmap-week-marker">W{{ week.number }}</span>
              <div class="phase-roadmap-week-copy">
                <strong>{{ week.title }}</strong>
                <small>{{ week.stage }}</small>
              </div>
              <span class="phase-roadmap-week-count">{{ week.done }}/{{ week.total }}</span>
            </div>
            <div class="phase-roadmap-week-track">
              <span :style="{ width: `${week.percent}%` }" />
            </div>

            <div class="phase-roadmap-topics">
              <template v-for="topic in week.topics" :key="topic.id">
                <NuxtLink
                  v-if="getTopicStatus(topic.id) !== 'locked'"
                  :to="topicPath(planId, topic.id)"
                  class="phase-roadmap-topic"
                  :class="{
                    'is-complete': getTopicStatus(topic.id) === 'complete',
                    'is-next': isNextTopic(topic),
                  }"
                  :data-status="getTopicStatus(topic.id)"
                  :aria-label="topicTitle(topic)"
                >
                  <span class="phase-roadmap-topic-top">
                    <span class="phase-roadmap-topic-order">{{ topic.order }}</span>
                    <span class="phase-roadmap-topic-state">
                      <Icon :name="statusIcon(getTopicStatus(topic.id))" class="learning-icon" />
                      {{ topicStatusLabel(topic) }}
                    </span>
                  </span>
                  <strong>{{ topic.title }}</strong>
                  <span class="phase-roadmap-topic-meta">
                    {{ topic.stage }}
                    <template v-if="getTopicResult(topic.id)">
                      · {{ getTopicResult(topic.id)?.bestScore }}/3
                    </template>
                  </span>
                </NuxtLink>

                <button
                  v-else
                  type="button"
                  class="phase-roadmap-topic is-locked"
                  data-status="locked"
                  :aria-label="`${topicTitle(topic)} — locked`"
                  @click="handleLockedTopic(topic)"
                >
                  <span class="phase-roadmap-topic-top">
                    <span class="phase-roadmap-topic-order">{{ topic.order }}</span>
                    <span class="phase-roadmap-topic-state">
                      <Icon name="lucide:lock" class="learning-icon" />
                      Locked
                    </span>
                  </span>
                  <strong>{{ topic.title }}</strong>
                  <span class="phase-roadmap-topic-meta">{{ topic.stage }}</span>
                </button>
              </template>
            </div>
          </section>
        </div>

        <footer class="phase-roadmap-gate-wrap">
          <NuxtLink
            v-if="card.gateStatus !== 'locked'"
            :to="phasePath(planId, card.phase.key)"
            class="phase-roadmap-gate"
            :class="{
              'is-complete': card.gateStatus === 'complete',
              'is-next': isNextGate(card.phase.key),
            }"
            :data-status="card.gateStatus"
            :aria-label="gateTitle(card.phase, card.gateStatus)"
          >
            <span class="phase-roadmap-gate-icon">
              <Icon
                :name="card.gateStatus === 'complete' ? 'lucide:badge-check' : 'lucide:door-open'"
                class="learning-icon"
              />
            </span>
            <span class="phase-roadmap-gate-copy">
              <small>Phase {{ card.phase.number }} gate</small>
              <strong>{{
                card.gateStatus === 'complete' ? card.phase.role.title : 'Take the phase quiz'
              }}</strong>
              <span>{{ gateStatusLabel(card.phase.key) }}</span>
            </span>
            <Icon name="lucide:arrow-right" class="learning-icon" />
          </NuxtLink>

          <button
            v-else
            type="button"
            class="phase-roadmap-gate is-locked"
            data-status="locked"
            :aria-label="gateTitle(card.phase, card.gateStatus)"
            @click="handleLockedGate(card.phase)"
          >
            <span class="phase-roadmap-gate-icon">
              <Icon name="lucide:lock" class="learning-icon" />
            </span>
            <span class="phase-roadmap-gate-copy">
              <small>Phase {{ card.phase.number }} gate</small>
              <strong>{{ card.phase.role.title }}</strong>
              <span>Pass all {{ card.total }} topics to open</span>
            </span>
          </button>
        </footer>
      </article>
    </div>
  </div>
</template>

<style scoped>
.phase-roadmap {
  display: grid;
  gap: 20px;
}

.phase-roadmap-notice {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  font-size: 0.88rem;
  color: var(--ink);
  background: color-mix(in oklab, var(--brand) 8%, var(--surface));
  border: 1px solid color-mix(in oklab, var(--brand) 28%, var(--line));
  border-radius: 12px;
}

.phase-roadmap-notice span {
  flex: 1;
}

.phase-roadmap-notice button {
  display: grid;
  padding: 4px;
  color: var(--muted);
  cursor: pointer;
  background: none;
  border: 0;
  border-radius: 6px;
  place-items: center;
}

.phase-roadmap-notice button:hover {
  color: var(--ink);
  background: var(--surface-2);
}

.phase-roadmap-root {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px;
  background:
    radial-gradient(
      circle at 90% 0%,
      color-mix(in oklab, var(--brand) 10%, transparent),
      transparent 18rem
    ),
    var(--surface);
  border: 1px solid var(--line);
  border-top: 4px solid var(--brand);
  border-radius: 18px;
}

.phase-roadmap-root-copy {
  display: grid;
  gap: 3px;
  max-width: 720px;
}

.phase-roadmap-root-kicker {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--brand);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.phase-roadmap-root-copy strong {
  font-size: 1.08rem;
}

.phase-roadmap-root-copy p {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--muted);
}

.phase-roadmap-next {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-self: start;
  padding: 5px 8px;
  margin-top: 5px;
  font-size: 0.74rem;
  font-weight: 650;
  color: var(--ink);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 7px;
}

.phase-roadmap-next .learning-icon {
  color: var(--brand);
}

.phase-roadmap-root-side {
  display: grid;
  flex: none;
  gap: 8px;
  width: min(100%, 290px);
}

.phase-roadmap-total {
  display: flex;
  gap: 10px;
  align-items: baseline;
  justify-content: space-between;
}

.phase-roadmap-total strong {
  font-family: var(--font-display);
  font-size: 1.55rem;
  font-weight: 750;
  line-height: 1;
  color: var(--brand);
}

.phase-roadmap-total span {
  font-size: 0.74rem;
  color: var(--muted);
}

.phase-roadmap-total-track {
  height: 7px;
  overflow: hidden;
  background: var(--line);
  border-radius: 999px;
}

.phase-roadmap-total-track span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--phase-blue), var(--phase-violet));
  border-radius: inherit;
  transition: width 200ms ease;
}

.phase-roadmap-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.74rem;
  color: var(--muted);
}

.phase-roadmap-legend span {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.legend-dot {
  width: 9px;
  height: 9px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 50%;
}

.legend-dot.is-complete {
  background: #079669;
  border-color: #079669;
}

.legend-dot.is-available {
  background: var(--brand);
  border-color: var(--brand);
}

.legend-dot.is-locked {
  background: var(--muted);
  border-color: var(--muted);
}

.phase-roadmap-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  align-items: start;
}

.phase-roadmap-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--line);
  border-top: 5px solid var(--phase-color, var(--brand));
  border-radius: 18px;
  box-shadow: 0 12px 30px -24px rgb(15 23 42 / 35%);
}

.phase-roadmap-card[data-state='locked'] {
  opacity: 0.8;
  filter: saturate(0.74);
}

.phase-roadmap-card[data-state='active'] {
  box-shadow: 0 18px 36px -30px color-mix(in oklab, var(--phase-color) 42%, transparent);
}

.phase-roadmap-card-head {
  display: grid;
  gap: 9px;
  padding: 20px;
  background:
    radial-gradient(
      circle at 92% -8%,
      color-mix(in oklab, var(--phase-color, var(--brand)) 12%, transparent),
      transparent 14rem
    ),
    color-mix(in oklab, var(--phase-color, var(--brand)) 4%, var(--surface));
  border-bottom: 1px solid var(--line);
}

.phase-roadmap-card-top {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.phase-roadmap-phase-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--phase-color, var(--brand));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.phase-roadmap-state {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 3px 7px;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 999px;
}

.phase-roadmap-state[data-status='complete'] {
  color: #067a57;
  background: var(--success-soft);
  border-color: color-mix(in oklab, var(--success) 24%, var(--line));
}

.phase-roadmap-state[data-status='active'] {
  color: var(--phase-color, var(--brand));
  background: color-mix(in oklab, var(--phase-color) 9%, var(--surface));
  border-color: color-mix(in oklab, var(--phase-color) 25%, var(--line));
}

.phase-roadmap-title-row {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.phase-roadmap-watermark {
  flex: none;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1;
  color: var(--phase-color, var(--brand));
  opacity: 0.42;
}

.phase-roadmap-card-head h3 {
  margin: 0;
  font-size: 1.22rem;
  line-height: 1.2;
}

.phase-roadmap-goal {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.55;
  color: var(--muted);
}

.phase-roadmap-progress {
  display: grid;
  gap: 5px;
  margin-top: 2px;
}

.phase-roadmap-progress-copy {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--muted);
}

.phase-roadmap-progress-copy strong {
  color: var(--phase-color, var(--brand));
}

.phase-roadmap-role {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  justify-self: start;
  padding: 4px 8px;
  margin-top: 2px;
  font-size: 0.72rem;
  font-weight: 650;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 7px;
}

.phase-roadmap-role .learning-icon {
  color: var(--phase-color, var(--brand));
}

.phase-roadmap-week {
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
}

.phase-roadmap-week:last-child {
  border-bottom: 0;
}

.phase-roadmap-week-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 9px;
  align-items: center;
  margin-bottom: 6px;
}

.phase-roadmap-week-marker {
  display: grid;
  min-width: 30px;
  height: 24px;
  font-size: 0.59rem;
  font-weight: 800;
  color: var(--phase-color, var(--brand));
  background: color-mix(in oklab, var(--phase-color) 8%, var(--surface));
  border: 1px solid color-mix(in oklab, var(--phase-color) 20%, var(--line));
  border-radius: 6px;
  place-items: center;
}

.phase-roadmap-week-copy {
  display: grid;
  min-width: 0;
  gap: 1px;
}

.phase-roadmap-week-copy strong {
  overflow: hidden;
  font-size: 0.8rem;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.phase-roadmap-week-copy small {
  font-size: 0.62rem;
  color: var(--muted);
}

.phase-roadmap-week-count {
  font-size: 0.64rem;
  font-weight: 700;
  color: var(--muted);
}

.phase-roadmap-week-track {
  height: 3px;
  margin-bottom: 9px;
  overflow: hidden;
  background: var(--line);
  border-radius: 999px;
}

.phase-roadmap-week-track span {
  display: block;
  height: 100%;
  background: var(--phase-color, var(--brand));
  border-radius: inherit;
}

.phase-roadmap-topics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}

.phase-roadmap-topic {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  padding: 9px 10px;
  color: var(--ink) !important;
  text-align: left;
  text-decoration: none !important;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 9px;
  transition:
    border-color 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease;
}

.phase-roadmap-topic:hover {
  border-color: var(--phase-color, var(--brand));
  transform: translateY(-1px);
  box-shadow: 0 8px 18px -14px rgb(15 23 42 / 40%);
}

.phase-roadmap-topic.is-next {
  background: color-mix(in oklab, var(--phase-color, var(--brand)) 9%, var(--surface));
  border-color: var(--phase-color, var(--brand));
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--phase-color, var(--brand)) 16%, transparent);
}

.phase-roadmap-topic.is-complete {
  border-color: color-mix(in oklab, #079669 38%, var(--line));
}

.phase-roadmap-topic.is-locked {
  color: var(--muted);
  cursor: not-allowed;
  border-style: dashed;
}

.phase-roadmap-topic.is-locked:hover {
  border-color: var(--line);
  transform: none;
  box-shadow: none;
}

.phase-roadmap-topic-top {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
}

.phase-roadmap-topic-order {
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--muted);
}

.phase-roadmap-topic-state {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  font-size: 0.6rem;
  color: var(--muted);
}

.phase-roadmap-topic.is-complete .phase-roadmap-topic-state {
  color: #067a57;
}

.phase-roadmap-topic.is-next .phase-roadmap-topic-state {
  color: var(--phase-color, var(--brand));
}

.phase-roadmap-topic strong {
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.76rem;
  font-weight: 650;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.phase-roadmap-topic-meta {
  font-size: 0.62rem;
  color: var(--muted);
}

.phase-roadmap-gate-wrap {
  padding: 14px 20px 18px;
  margin-top: auto;
  border-top: 1px solid var(--line);
}

.phase-roadmap-gate {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 11px 12px;
  color: var(--ink) !important;
  text-decoration: none !important;
  background: color-mix(in oklab, var(--phase-color, var(--brand)) 7%, var(--surface));
  border: 1px solid color-mix(in oklab, var(--phase-color, var(--brand)) 25%, var(--line));
  border-radius: 11px;
}

.phase-roadmap-gate:hover {
  border-color: var(--phase-color, var(--brand));
}

.phase-roadmap-gate.is-locked {
  cursor: not-allowed;
  background: var(--surface-2);
  border-color: var(--line);
  border-style: dashed;
}

.phase-roadmap-gate.is-complete {
  border-color: #079669;
}

.phase-roadmap-gate-icon {
  display: grid;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  font-size: 0.95rem;
  color: var(--phase-color, var(--brand));
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  place-items: center;
}

.phase-roadmap-gate.is-complete .phase-roadmap-gate-icon {
  color: #079669;
}

.phase-roadmap-gate-copy {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: 1px;
}

.phase-roadmap-gate-copy small {
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.phase-roadmap-gate-copy strong {
  overflow: hidden;
  font-size: 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.phase-roadmap-gate-copy span {
  font-size: 0.66rem;
  color: var(--muted);
}

.phase-roadmap-gate > .learning-icon {
  color: var(--phase-color, var(--brand));
}

@media (max-width: 1400px) {
  .phase-roadmap-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .phase-roadmap-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .phase-roadmap-root {
    padding: 18px;
  }

  .phase-roadmap-root-side {
    width: 100%;
  }

  .phase-roadmap-topics {
    grid-template-columns: 1fr;
  }

  .phase-roadmap-card-head,
  .phase-roadmap-week,
  .phase-roadmap-gate-wrap {
    padding-right: 15px;
    padding-left: 15px;
  }
}
</style>
