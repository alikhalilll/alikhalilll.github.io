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
    class="plan-card group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    :data-tone="plan.tone"
    :data-status="plan.status"
    :data-progress="progressState"
  >
    <!-- Phase-color top accent -->
    <span
      class="absolute inset-x-0 top-0 h-[5px] bg-[color:var(--phase-color)]"
      aria-hidden="true"
    />
    <!-- Soft corner glow -->
    <span
      class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
      aria-hidden="true"
      :style="{
        background:
          'radial-gradient(circle, color-mix(in oklab, var(--phase-color) 18%, transparent), transparent 68%)',
      }"
    />

    <!-- Head: number + status pill -->
    <div class="relative flex items-center justify-between gap-3">
      <span
        class="font-[var(--font-display)] text-[2.5rem] font-bold leading-none text-[color:var(--phase-color)] opacity-30"
      >
        0{{ plan.number }}
      </span>
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-wider text-[var(--muted)]"
        :data-progress="progressState"
      >
        <Icon :name="statusIcon" class="learning-icon" />
        {{ statusLabel }}
      </span>
    </div>

    <!-- Copy -->
    <div class="relative grid gap-2">
      <p
        class="plan-card-eyebrow m-0 text-[0.75rem] font-extrabold uppercase tracking-widest text-[color:var(--phase-color)]"
      >
        {{ plan.shortTitle }} · {{ plan.subtitle }}
      </p>
      <h2 class="my-0 text-[clamp(1.75rem,2.7vw,2.25rem)] font-bold leading-tight tracking-tight">
        {{ plan.title }}
      </h2>
      <p class="m-0 text-[0.96rem] leading-relaxed text-[var(--muted)]">
        {{ plan.description }}
      </p>
    </div>

    <!-- Stats pills -->
    <div class="relative flex flex-wrap gap-1.5">
      <span
        class="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[0.78rem] text-[var(--muted)]"
      >
        <strong class="text-[var(--ink)]">{{ plan.weeks }}</strong> weeks
      </span>
      <span
        class="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[0.78rem] text-[var(--muted)]"
      >
        <strong class="text-[var(--ink)]">{{ plan.topics || '—' }}</strong> topics
      </span>
      <span
        class="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[0.78rem] text-[var(--muted)]"
      >
        <strong class="text-[var(--ink)]">{{ plan.phases }}</strong> phases
      </span>
    </div>

    <!-- Phase route (plans with runtime) -->
    <div v-if="planPhases.length" class="relative grid gap-2">
      <span
        class="inline-flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-widest text-[var(--muted)]"
      >
        The route
      </span>
      <div class="grid gap-1.5 sm:grid-cols-2">
        <span
          v-for="phase in planPhases"
          :key="phase.key"
          class="plan-card-phase grid grid-cols-[6px_auto_minmax(0,1fr)] items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1.5"
          :data-tone="phase.tone"
        >
          <i class="h-1.5 w-1.5 rounded-full bg-[color:var(--phase-color)]" />
          <small class="text-[0.6rem] font-extrabold text-[color:var(--phase-color)]">
            0{{ phase.number }}
          </small>
          <span class="truncate text-[0.72rem] leading-tight text-[var(--muted)]">
            {{ phase.title }}
          </span>
        </span>
      </div>
    </div>

    <!-- Preview bullets -->
    <ul class="relative m-0 grid list-none gap-1.5 p-0">
      <li
        v-for="item in previewItems"
        :key="item"
        class="flex items-start gap-2 text-[0.86rem] leading-snug text-[var(--muted)]"
      >
        <Icon
          name="lucide:check"
          class="learning-icon mt-1 flex-none text-[color:var(--phase-color)]"
        />
        <span>{{ item }}</span>
      </li>
    </ul>

    <!-- Outcome callout -->
    <div
      class="relative grid gap-1.5 rounded-xl border p-3.5"
      :style="{
        background: 'color-mix(in oklab, var(--phase-color) 6%, var(--surface-2))',
        borderColor: 'color-mix(in oklab, var(--phase-color) 22%, var(--line))',
      }"
    >
      <span
        class="inline-flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-widest text-[color:var(--phase-color)]"
      >
        <Icon name="lucide:flag" class="learning-icon" />
        You leave with
      </span>
      <p class="m-0 text-[0.86rem] leading-snug text-[var(--ink)]">{{ plan.outcome }}</p>
    </div>

    <!-- Roles earned -->
    <div class="relative grid gap-2">
      <span
        class="inline-flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-widest text-[var(--muted)]"
      >
        Roles you unlock
      </span>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="role in plan.roles"
          :key="role"
          class="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1 text-[0.78rem] text-[var(--ink)]"
        >
          {{ role }}
        </span>
      </div>
    </div>

    <!-- Progress bar (available plans only) -->
    <div v-if="plan.status === 'available'" class="relative grid gap-1.5">
      <div class="flex items-center justify-between gap-3 text-[0.84rem] text-[var(--muted)]">
        <span>{{ completedTopics }} of {{ plan.topics }} topics passed</span>
        <strong class="text-[color:var(--phase-color)]">{{ progressPercent }}%</strong>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
        <span
          class="block h-full rounded-full bg-[color:var(--phase-color)] transition-all duration-300"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </div>

    <!-- Foot: CTA -->
    <div class="relative mt-auto flex flex-col items-start gap-2.5 pt-0.5">
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
      <span class="inline-flex items-center gap-1.5 text-[0.78rem] text-[var(--muted)]">
        <Icon name="lucide:cloud-check" class="learning-icon text-[var(--success)]" />
        Progress saves automatically
      </span>
    </div>
  </article>
</template>

<style scoped>
/* Phase tone → variable mapping. The phases inside the "route" also carry
   their own data-tone, overriding at the inner level. */
.plan-card[data-tone='blue'] {
  --phase-color: var(--phase-blue);
}

.plan-card[data-tone='violet'] {
  --phase-color: var(--phase-violet);
}

.plan-card[data-tone='teal'] {
  --phase-color: var(--phase-teal);
}

.plan-card[data-tone='amber'] {
  --phase-color: var(--phase-amber);
}

.plan-card[data-tone='rose'] {
  --phase-color: var(--phase-rose);
}

.plan-card[data-tone='indigo'] {
  --phase-color: var(--phase-indigo);
}

.plan-card-phase[data-tone='blue'] {
  --phase-color: var(--phase-blue);
}

.plan-card-phase[data-tone='violet'] {
  --phase-color: var(--phase-violet);
}

.plan-card-phase[data-tone='teal'] {
  --phase-color: var(--phase-teal);
}

.plan-card-phase[data-tone='amber'] {
  --phase-color: var(--phase-amber);
}

.plan-card-phase[data-tone='rose'] {
  --phase-color: var(--phase-rose);
}

.plan-card-phase[data-tone='indigo'] {
  --phase-color: var(--phase-indigo);
}

/* Subtle background wash tinted by phase color */
.plan-card {
  background: linear-gradient(
    165deg,
    color-mix(in oklab, var(--phase-color) 7%, var(--surface)),
    var(--surface) 42%
  );
}

.plan-card[data-status='coming-soon'] {
  border-top-color: var(--line-strong);
  filter: saturate(0.72);
}

.plan-card[data-status='coming-soon']:hover {
  transform: none;
}

/* Status pill variants beyond Tailwind reach */
[data-progress='ready'] {
  color: var(--success);
  background: var(--success-soft);
  border-color: color-mix(in oklab, var(--success) 30%, var(--line));
}

[data-progress='in-progress'] {
  color: var(--phase-color);
  background: color-mix(in oklab, var(--phase-color) 10%, var(--surface));
  border-color: color-mix(in oklab, var(--phase-color) 30%, var(--line));
}

[data-progress='complete'] {
  color: var(--success);
  background: var(--success-soft);
  border-color: color-mix(in oklab, var(--success) 30%, var(--line));
}
</style>
