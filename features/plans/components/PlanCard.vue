<script setup lang="ts">
import { computed } from 'vue';

import type { PlanSummary } from '../data';
import { getPlanRuntime } from '../planRuntime';
import { roadmapPath } from '../routes';

const props = withDefaults(
  defineProps<{
    plan: PlanSummary;
    completedTopics?: number;
    progressPercent?: number;
  }>(),
  {
    completedTopics: 0,
    progressPercent: 0,
  }
);

const planPhases = computed(() => getPlanRuntime(props.plan.id)?.phases ?? []);
const previewItems = computed(() => props.plan.preview.slice(1));
const isComplete = computed(
  () => props.plan.status === 'available' && props.completedTopics >= props.plan.topics
);
const isStarted = computed(() => props.completedTopics > 0);

const progressState = computed(() => {
  if (props.plan.status !== 'available') return 'coming-soon';
  if (isComplete.value) return 'complete';
  return isStarted.value ? 'in-progress' : 'ready';
});

const statusLabel = computed(() => {
  if (props.plan.status !== 'available') return 'Coming soon';
  if (isComplete.value) return 'Complete';
  return isStarted.value ? 'In progress' : 'Ready to start';
});

const statusIcon = computed(() => {
  if (props.plan.status !== 'available') return 'lucide:lock';
  if (isComplete.value) return 'lucide:circle-check-big';
  return isStarted.value ? 'lucide:loader-circle' : 'lucide:play-circle';
});

const actionLabel = computed(() => {
  if (isComplete.value) return 'Review plan';
  return isStarted.value ? 'Continue plan' : 'Start plan';
});
</script>

<template>
  <article
    class="plan-card"
    :data-tone="plan.tone"
    :data-status="plan.status"
    :data-progress="progressState"
  >
    <div class="plan-card-head">
      <span class="plan-card-number">0{{ plan.number }}</span>
      <span class="plan-card-status" :data-progress="progressState">
        <Icon :name="statusIcon" class="learning-icon" />
        {{ statusLabel }}
      </span>
    </div>

    <div class="plan-card-copy">
      <p class="plan-card-eyebrow">{{ plan.shortTitle }} · {{ plan.subtitle }}</p>
      <h2>{{ plan.title }}</h2>
      <p>{{ plan.description }}</p>
    </div>

    <div class="plan-card-stats">
      <span
        ><strong>{{ plan.weeks }}</strong> weeks</span
      >
      <span
        ><strong>{{ plan.topics || '—' }}</strong> topics</span
      >
      <span
        ><strong>{{ plan.phases }}</strong> phases</span
      >
    </div>

    <div class="plan-card-route">
      <span class="plan-card-label">The route</span>
      <div class="plan-card-phases">
        <span
          v-for="phase in planPhases"
          :key="phase.key"
          class="plan-card-phase"
          :data-tone="phase.tone"
        >
          <i />
          <small>0{{ phase.number }}</small>
          <span>{{ phase.title }}</span>
        </span>
      </div>
    </div>

    <ul class="plan-card-preview">
      <li v-for="item in previewItems" :key="item">
        <Icon name="lucide:check" class="learning-icon" />
        {{ item }}
      </li>
    </ul>

    <div class="plan-card-outcome">
      <span class="plan-card-label">
        <Icon name="lucide:flag" class="learning-icon" />
        You leave with
      </span>
      <p>{{ plan.outcome }}</p>
    </div>

    <div class="plan-card-roles">
      <span class="plan-card-label">Roles you unlock</span>
      <div class="plan-card-role-list">
        <span v-for="role in plan.roles" :key="role">{{ role }}</span>
      </div>
    </div>

    <div v-if="plan.status === 'available'" class="plan-card-progress">
      <div class="plan-card-progress-row">
        <span>{{ completedTopics }} of {{ plan.topics }} topics passed</span>
        <strong>{{ progressPercent }}%</strong>
      </div>
      <div class="plan-card-progress-track">
        <span :style="{ width: `${progressPercent}%` }" />
      </div>
    </div>

    <div class="plan-card-foot">
      <NuxtLink
        v-if="plan.status === 'available'"
        :to="roadmapPath(plan.id)"
        class="learning-button learning-button-primary"
      >
        {{ actionLabel }}
        <Icon name="lucide:arrow-right" class="learning-icon" />
      </NuxtLink>
      <span v-else class="learning-button learning-button-disabled">
        <Icon name="lucide:lock" class="learning-icon" />
        Coming soon
      </span>
      <span class="plan-card-save-note">
        <Icon name="lucide:cloud-check" class="learning-icon" />
        Progress saves automatically
      </span>
    </div>
  </article>
</template>

<style scoped>
.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 28px;
  overflow: hidden;
  background: linear-gradient(
    165deg,
    color-mix(in oklab, var(--phase-color) 7%, var(--surface)),
    var(--surface) 42%
  );
  border: 1px solid var(--line);
  border-top: 5px solid var(--phase-color);
  border-radius: 24px;
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.plan-card::after {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 160px;
  height: 160px;
  pointer-events: none;
  content: '';
  background: radial-gradient(
    circle,
    color-mix(in oklab, var(--phase-color) 18%, transparent),
    transparent 68%
  );
}

.plan-card:hover {
  box-shadow: var(--shadow);
  transform: translateY(-3px);
}

.plan-card[data-status='coming-soon'] {
  border-top-color: var(--line-strong);
  filter: saturate(0.72);
}

.plan-card[data-status='coming-soon']:hover {
  transform: none;
}

.plan-card-head {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.plan-card-number {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 750;
  line-height: 0.9;
  color: var(--phase-color);
  opacity: 0.3;
}

.plan-card-status {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 5px 10px;
  font-size: 0.72rem;
  font-weight: 750;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 999px;
}

.plan-card-status[data-progress='ready'] {
  color: var(--success);
  background: var(--success-soft);
  border-color: color-mix(in oklab, var(--success) 30%, var(--line));
}

.plan-card-status[data-progress='in-progress'] {
  color: var(--phase-color);
  background: color-mix(in oklab, var(--phase-color) 10%, var(--surface));
  border-color: color-mix(in oklab, var(--phase-color) 30%, var(--line));
}

.plan-card-status[data-progress='complete'] {
  color: var(--success);
  background: var(--success-soft);
  border-color: color-mix(in oklab, var(--success) 30%, var(--line));
}

.plan-card-copy h2 {
  margin: 2px 0 8px;
  font-size: clamp(1.75rem, 2.7vw, 2.25rem);
  line-height: 1.06;
}

.plan-card-copy p {
  margin: 0;
  font-size: 0.96rem;
  line-height: 1.65;
  color: var(--muted);
}

.plan-card-eyebrow {
  font-size: 0.75rem !important;
  font-weight: 800;
  color: var(--phase-color) !important;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.plan-card-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.plan-card-stats span {
  padding: 6px 10px;
  font-size: 0.78rem;
  color: var(--muted);
  background: color-mix(in oklab, var(--phase-color) 5%, var(--surface-2));
  border: 1px solid var(--line);
  border-radius: 8px;
}

.plan-card-stats strong {
  color: var(--ink);
}

.plan-card-route {
  display: grid;
  gap: 8px;
}

.plan-card-label {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

.plan-card-phases {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.plan-card-phase {
  display: grid;
  grid-template-columns: 6px auto minmax(0, 1fr);
  gap: 6px;
  align-items: center;
  min-width: 0;
  padding: 6px 8px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 7px;
}

.plan-card-phase i {
  width: 6px;
  height: 6px;
  background: var(--phase-color);
  border-radius: 999px;
}

.plan-card-phase small {
  font-size: 0.58rem;
  font-weight: 800;
  color: var(--phase-color);
}

.plan-card-phase > span {
  overflow: hidden;
  font-size: 0.7rem;
  line-height: 1.25;
  color: var(--muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-card-preview {
  display: grid;
  gap: 7px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.plan-card-preview li {
  display: flex;
  gap: 7px;
  align-items: flex-start;
  font-size: 0.84rem;
  line-height: 1.45;
  color: var(--muted);
}

.plan-card-preview .learning-icon {
  flex: none;
  margin-top: 3px;
  color: var(--phase-color);
}

.plan-card-outcome {
  display: grid;
  gap: 6px;
  padding: 13px 14px;
  background: color-mix(in oklab, var(--phase-color) 6%, var(--surface-2));
  border: 1px solid color-mix(in oklab, var(--phase-color) 22%, var(--line));
  border-radius: 11px;
}

.plan-card-outcome .plan-card-label {
  color: var(--phase-color);
}

.plan-card-outcome p {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.55;
  color: var(--ink);
}

.plan-card-roles {
  display: grid;
  gap: 8px;
}

.plan-card-role-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.plan-card-role-list span {
  padding: 5px 9px;
  font-size: 0.78rem;
  color: var(--ink);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 7px;
}

.plan-card-progress {
  display: grid;
  gap: 7px;
}

.plan-card-progress-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  font-size: 0.84rem;
  color: var(--muted);
}

.plan-card-progress-row strong {
  color: var(--phase-color);
}

.plan-card-progress-track {
  height: 7px;
  overflow: hidden;
  background: var(--line);
  border-radius: 999px;
}

.plan-card-progress-track span {
  display: block;
  height: 100%;
  background: var(--phase-color);
  border-radius: inherit;
  transition: width 0.35s ease;
}

.plan-card-foot {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  margin-top: auto;
  padding-top: 2px;
}

.plan-card-save-note {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  font-size: 0.76rem;
  color: var(--muted);
}

.plan-card-save-note .learning-icon {
  color: var(--success);
}

@media (max-width: 700px) {
  .plan-card {
    padding: 22px;
  }
}

@media (max-width: 430px) {
  .plan-card-phases {
    grid-template-columns: 1fr;
  }
}
</style>
