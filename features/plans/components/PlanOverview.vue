<script setup lang="ts">
import { computed } from 'vue';
import { useHead } from '#imports';

import type { PhaseKey } from '~/features/plan1/types';
import { getPlanSummary } from '../data';
import { getPlanRuntime } from '../planRuntime';
import { phasePath, plansPath, roadmapPath, topicPath } from '../routes';
import { usePlanProgress } from '../composables/usePlanProgress';
import FullStackDiagram from './FullStackDiagram.vue';
import LearningShell from './LearningShell.vue';
import RoadmapFlow from './RoadmapFlow.vue';

const props = defineProps<{
  planId: string;
}>();

const plan = computed(() => getPlanSummary(props.planId));
const runtime = computed(() => getPlanRuntime(props.planId));
const isPlan1 = computed(() => props.planId === 'plan-1');
const planRoles = computed(() => runtime.value?.roles ?? []);
const operations = computed(() => runtime.value?.operations);
const aiTools = computed(() => operations.value?.aiTools ?? []);
const conventions = computed(() => operations.value?.conventions ?? []);
const mainResources = computed(() => operations.value?.mainResources ?? []);
const resourceGroups = computed(() => operations.value?.resourceGroups ?? []);
const roles = computed(() => operations.value?.roles ?? []);
const schedule = computed(() => operations.value?.schedule ?? []);
const studyLoop = computed(() => operations.value?.studyLoop ?? []);
const weeklyRhythm = computed(() => operations.value?.weeklyRhythm ?? []);

const progress = usePlanProgress(props.planId);
const {
  completedPhases,
  completedTopics,
  getPhaseQuizStatus,
  getPhaseResult,
  getTopicResult,
  getTopicStatus,
  nextAction,
  phaseProgress,
  progressPercent,
  resetProgress,
} = progress;

useHead(() => ({
  title: plan.value ? `${plan.value.title} · Learning Paths` : 'Learning Paths',
}));

const nextHref = computed(() => {
  if (nextAction.value.kind === 'topic') {
    return topicPath(props.planId, nextAction.value.topic.id);
  }
  if (nextAction.value.kind === 'phase') {
    return phasePath(props.planId, nextAction.value.phase.key);
  }
  return '#roles';
});

const nextLabel = computed(() => {
  if (nextAction.value.kind === 'topic') {
    return completedTopics.value === 0
      ? 'Start the first topic'
      : `Continue: ${nextAction.value.topic.title}`;
  }
  if (nextAction.value.kind === 'phase') {
    return `Take the ${nextAction.value.phase.title} phase quiz`;
  }
  return 'All phases passed · review your roles';
});

const nextHint = computed(() => {
  if (nextAction.value.kind === 'topic') {
    return `Next up · W${nextAction.value.topic.week} · ${nextAction.value.topic.title}`;
  }
  if (nextAction.value.kind === 'phase') {
    return `Phase gate · pass it to add ${nextAction.value.phase.role.title}`;
  }
  return 'You have completed the full path.';
});

const confirmReset = () => {
  if (window.confirm('Reset all topic progress, phase passes and quiz scores for this plan?')) {
    resetProgress();
  }
};

const roleStatus = (phaseKey: PhaseKey) => {
  const result = getPhaseResult(phaseKey);
  return result?.passed ? 'complete' : 'locked';
};

const phaseOutline = computed(() =>
  (runtime.value?.phases ?? []).map((phase) => {
    const progress = phaseProgress.value.find((entry) => entry.key === phase.key);
    const gateStatus = getPhaseQuizStatus(phase.key);
    const state = gateStatus === 'complete' ? 'complete' : progress?.unlocked ? 'active' : 'locked';

    return {
      key: phase.key,
      number: phase.number,
      title: phase.title,
      goal: phase.goal,
      weeks: phase.weeks,
      role: phase.role.title,
      tone: phase.tone,
      topics: progress?.total ?? 0,
      done: progress?.done ?? 0,
      percent: progress?.percent ?? 0,
      state,
      stateLabel:
        state === 'complete'
          ? 'Complete'
          : gateStatus === 'available'
            ? 'Gate ready'
            : state === 'active'
              ? 'In progress'
              : 'Locked',
    };
  })
);

const jumpLinks = computed(() => [
  { href: '#roadmap', label: 'Roadmap', icon: 'lucide:map' },
  ...(isPlan1.value ? [] : [{ href: '#stack', label: 'Architecture', icon: 'lucide:git-fork' }]),
  { href: '#rhythm', label: 'How it works', icon: 'lucide:repeat-2' },
  { href: '#roles', label: 'Roles', icon: 'lucide:badge-check' },
  { href: '#resources', label: 'Resources', icon: 'lucide:library' },
]);

const sections = computed(() => ({
  roadmap: '01',
  stack: '02',
  rhythm: isPlan1.value ? '02' : '03',
  roles: isPlan1.value ? '03' : '04',
  resources: isPlan1.value ? '04' : '05',
}));
</script>

<template>
  <LearningShell
    wide
    :back-to="plansPath()"
    back-label="All plans"
    :progress-label="`${completedTopics} topics passed`"
    :progress-percent="progressPercent"
  >
    <template v-if="plan?.status === 'available'">
      <!-- ============ HERO ============ -->
      <section
        class="plan-hero relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm"
        :data-tone="plan.tone"
      >
        <span
          class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand)] via-[color:var(--phase-color)] to-[var(--brand)]"
        />
        <div class="grid gap-10 p-7 md:grid-cols-[minmax(0,1fr)_360px] md:items-center md:p-10">
          <div class="min-w-0">
            <p class="plans-eyebrow m-0">{{ plan.shortTitle }} · {{ plan.subtitle }}</p>
            <h1
              class="my-4 max-w-[18ch] text-[clamp(2.1rem,3.6vw,3.1rem)] font-bold leading-[1.08] tracking-tight"
            >
              {{ plan.title }}
            </h1>
            <p class="m-0 max-w-[62ch] text-[1.06rem] leading-relaxed text-[var(--muted)]">
              {{ plan.description }}
            </p>

            <div class="mt-6 flex flex-wrap gap-2.5">
              <NuxtLink :to="nextHref" class="learning-button learning-button-primary">
                {{ nextLabel }}
                <Icon name="lucide:arrow-right" class="learning-icon" />
              </NuxtLink>
              <a href="#roadmap" class="learning-button learning-button-soft">
                Explore the roadmap
                <Icon name="lucide:map" class="learning-icon" />
              </a>
            </div>
            <p class="mt-4 inline-flex items-center gap-1.5 text-[0.88rem] text-[var(--muted)]">
              <Icon name="lucide:flag" class="learning-icon text-[var(--brand)]" />
              {{ nextHint }}
            </p>
          </div>

          <aside
            class="grid gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-5"
            aria-label="Plan at a glance"
          >
            <div
              class="flex items-center justify-between gap-2.5 border-b border-[var(--line)] pb-3"
            >
              <span class="text-[0.78rem] font-bold text-[var(--ink)]">Plan at a glance</span>
              <small
                class="inline-flex items-center gap-1 text-[0.74rem] font-medium text-[var(--muted)]"
              >
                <Icon name="lucide:cloud-check" class="learning-icon" />
                Saved locally
              </small>
            </div>

            <div class="flex items-center gap-4">
              <div class="plans-progress-ring" :style="{ '--p': progressPercent }">
                <span>{{ progressPercent }}%</span>
              </div>
              <div class="grid gap-0.5">
                <strong class="text-[0.98rem] font-semibold text-[var(--ink)]">
                  {{ completedTopics }} of {{ plan.topics }} topics
                </strong>
                <span class="text-[0.84rem] text-[var(--muted)]">
                  {{ completedPhases }} of {{ plan.phases }} phase gates passed
                </span>
              </div>
            </div>

            <div class="h-1.5 overflow-hidden rounded-full bg-[var(--line)]" aria-hidden="true">
              <span
                class="block h-full rounded-full bg-[var(--brand)] transition-all duration-300"
                :style="{ width: `${progressPercent}%` }"
              />
            </div>

            <dl
              class="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--line)] p-px"
            >
              <div class="bg-[var(--surface)] p-2.5">
                <dt class="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Phases
                </dt>
                <dd class="mt-0.5 font-[var(--font-display)] text-[1.2rem] font-bold leading-none">
                  {{ plan.phases }}
                </dd>
              </div>
              <div class="bg-[var(--surface)] p-2.5">
                <dt class="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Weeks
                </dt>
                <dd class="mt-0.5 font-[var(--font-display)] text-[1.2rem] font-bold leading-none">
                  {{ plan.weeks }}
                </dd>
              </div>
              <div class="bg-[var(--surface)] p-2.5">
                <dt class="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Topics
                </dt>
                <dd class="mt-0.5 font-[var(--font-display)] text-[1.2rem] font-bold leading-none">
                  {{ plan.topics }}
                </dd>
              </div>
              <div class="bg-[var(--surface)] p-2.5">
                <dt class="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Roles
                </dt>
                <dd class="mt-0.5 font-[var(--font-display)] text-[1.2rem] font-bold leading-none">
                  {{ plan.roles.length }}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <!-- ============ STICKY JUMP NAV ============ -->
      <nav
        class="plan-jump-nav sticky top-[70px] z-20 mt-5 rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_92%,transparent)] p-1.5 shadow-sm backdrop-blur"
        aria-label="Plan sections"
      >
        <div class="flex items-center gap-1 overflow-x-auto">
          <span
            class="flex-none px-2 pl-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-[var(--muted)]"
          >
            Jump to
          </span>
          <a
            v-for="link in jumpLinks"
            :key="link.href"
            :href="link.href"
            class="inline-flex flex-none items-center gap-1.5 rounded-md border border-transparent px-2.5 py-1.5 text-[0.84rem] font-medium text-[var(--muted)] no-underline transition-colors hover:border-[var(--line)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
          >
            <Icon :name="link.icon" class="learning-icon text-[var(--brand)]" />
            {{ link.label }}
          </a>
          <span
            class="ml-auto inline-flex flex-none items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[0.78rem] text-[var(--muted)]"
          >
            <strong class="text-[var(--ink)]">{{ progressPercent }}%</strong>
            complete
          </span>
        </div>
      </nav>

      <!-- ============ § 01 — ROADMAP ============ -->
      <section id="roadmap" class="plan-section scroll-mt-[160px]" aria-labelledby="roadmap-title">
        <header
          class="flex flex-wrap items-end justify-between gap-10 border-t border-[var(--line)] pt-7"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-3">
              <span
                class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
              >
                {{ sections.roadmap }}
              </span>
              <p class="plans-section-kicker m-0">The roadmap</p>
            </div>
            <h2
              id="roadmap-title"
              class="mt-2 max-w-[760px] text-[clamp(1.65rem,2.3vw,2.15rem)] font-bold leading-tight"
            >
              {{ plan.topics }} topics, in the order they make sense
            </h2>
          </div>
          <p class="m-0 max-w-[500px] text-[0.98rem] leading-relaxed text-[var(--muted)]">
            Every topic appears once, in the order you should learn it. Pass a topic quiz to open
            the next leaf; pass every topic in a phase to unlock its gate and role.
          </p>
        </header>

        <!-- Phase outline cards -->
        <div
          class="plan-phase-outline mt-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3"
          aria-label="Phase overview"
        >
          <article
            v-for="phase in phaseOutline"
            :key="phase.key"
            class="plan-phase-item group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:border-[color:var(--phase-color)] hover:shadow-md"
            :data-tone="phase.tone"
            :data-state="phase.state"
          >
            <span
              class="absolute inset-x-0 top-0 h-0.5 bg-[color:var(--phase-color)] opacity-70"
              aria-hidden="true"
            />
            <div class="flex items-center justify-between gap-2">
              <span
                class="text-[0.72rem] font-bold uppercase tracking-wider text-[color:var(--phase-color)]"
              >
                Phase {{ phase.number }}
              </span>
              <span
                class="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2 py-0.5 text-[0.7rem] font-semibold text-[var(--muted)]"
              >
                <Icon
                  :name="
                    phase.state === 'complete'
                      ? 'lucide:circle-check-big'
                      : phase.state === 'active'
                        ? 'lucide:compass'
                        : 'lucide:lock'
                  "
                  class="learning-icon"
                />
                {{ phase.stateLabel }}
              </span>
            </div>
            <h3 class="m-0 text-[1.1rem] font-bold leading-tight text-[var(--ink)]">
              {{ phase.title }}
            </h3>
            <p class="m-0 line-clamp-2 text-[0.88rem] leading-snug text-[var(--muted)]">
              {{ phase.goal }}
            </p>
            <div class="flex items-center justify-between gap-2 text-[0.76rem] text-[var(--muted)]">
              <span>{{ phase.weeks }}</span>
              <span>
                <strong class="text-[var(--ink)]">{{ phase.done }}</strong>
                / {{ phase.topics }} topics
              </span>
            </div>
            <div class="h-1 overflow-hidden rounded-full bg-[var(--line)]">
              <span
                class="block h-full rounded-full bg-[color:var(--phase-color)] transition-all"
                :style="{ width: `${phase.percent}%` }"
              />
            </div>
            <span
              class="inline-flex items-center gap-1.5 self-start rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2 py-1 text-[0.76rem] font-medium text-[var(--ink)]"
            >
              <Icon
                name="lucide:badge-check"
                class="learning-icon text-[color:var(--phase-color)]"
              />
              {{ phase.role }}
            </span>
          </article>
        </div>

        <div class="mt-6">
          <RoadmapFlow
            :plan-id="planId"
            :phase-progress="phaseProgress"
            :next-action="nextAction"
            :get-topic-status="getTopicStatus"
            :get-topic-result="getTopicResult"
            :get-phase-quiz-status="getPhaseQuizStatus"
            :get-phase-result="getPhaseResult"
          />
        </div>
      </section>

      <!-- ============ § 02 — ARCHITECTURE (plan 2 only) ============ -->
      <section
        v-if="!isPlan1"
        id="stack"
        class="plan-section scroll-mt-[160px]"
        aria-labelledby="stack-title"
      >
        <header
          class="flex flex-wrap items-end justify-between gap-10 border-t border-[var(--line)] pt-7"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-3">
              <span
                class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
              >
                {{ sections.stack }}
              </span>
              <p class="plans-section-kicker m-0">Architecture</p>
            </div>
            <h2
              id="stack-title"
              class="mt-2 max-w-[760px] text-[clamp(1.65rem,2.3vw,2.15rem)] font-bold leading-tight"
            >
              Full-stack architecture
            </h2>
          </div>
          <p class="m-0 max-w-[500px] text-[0.98rem] leading-relaxed text-[var(--muted)]">
            Start at the product root, then read each branch: the Vue interface, the Laravel API,
            the data layer and the delivery path that turns working code into a safe release.
          </p>
        </header>

        <div class="mt-6">
          <FullStackDiagram :plan-id="planId" />
        </div>
      </section>

      <!-- ============ § 03 — HOW IT WORKS ============ -->
      <section id="rhythm" class="plan-section scroll-mt-[160px]" aria-labelledby="rhythm-title">
        <header
          class="flex flex-wrap items-end justify-between gap-10 border-t border-[var(--line)] pt-7"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-3">
              <span
                class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
              >
                {{ sections.rhythm }}
              </span>
              <p class="plans-section-kicker m-0">How it works</p>
            </div>
            <h2
              id="rhythm-title"
              class="mt-2 max-w-[760px] text-[clamp(1.65rem,2.3vw,2.15rem)] font-bold leading-tight"
            >
              A weekly rhythm you can keep
            </h2>
          </div>
          <p class="m-0 max-w-[500px] text-[0.98rem] leading-relaxed text-[var(--muted)]">
            Each week uses the same four-step loop. Each phase follows Learn → Practice → Prove, so
            you always know what to do next and what “finished” means.
          </p>
        </header>

        <!-- Study loop -->
        <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="step in studyLoop"
            :key="step.step"
            class="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--brand)]"
          >
            <span
              class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--brand)] to-transparent opacity-60"
            />
            <div class="flex items-center justify-between gap-2">
              <span class="text-[0.72rem] font-bold uppercase tracking-widest text-[var(--brand)]">
                {{ step.step }}
              </span>
              <small class="text-[0.76rem] text-[var(--muted)]">{{ step.time }}</small>
            </div>
            <h3 class="m-0 text-[1.04rem] font-bold leading-tight">{{ step.title }}</h3>
            <p class="m-0 text-[0.92rem] leading-relaxed text-[var(--muted)]">{{ step.body }}</p>
          </article>
        </div>

        <!-- 2×2 operations grid -->
        <div class="mt-4 grid gap-3.5 md:grid-cols-2">
          <!-- Weekly rhythm + schedule -->
          <article
            class="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6"
          >
            <div class="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div class="flex items-center gap-2.5">
                <span
                  class="grid h-8 w-8 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_20%,transparent)] bg-[var(--brand-soft)] text-[var(--brand)]"
                >
                  <Icon name="lucide:calendar-days" class="learning-icon" />
                </span>
                <h3 class="m-0 text-[1.08rem] font-bold">Weekly rhythm</h3>
              </div>
              <span class="text-[0.72rem] font-bold uppercase tracking-widest text-[var(--muted)]">
                10–12 hrs
              </span>
            </div>
            <ul class="m-0 mt-4 grid list-none gap-2 p-0">
              <li
                v-for="item in weeklyRhythm"
                :key="item"
                class="flex items-start gap-2 text-[0.92rem] leading-snug text-[var(--muted)]"
              >
                <Icon name="lucide:check" class="learning-icon mt-1 text-[var(--brand)]" />
                <span>{{ item }}</span>
              </li>
            </ul>
            <div class="mt-4 grid border-t border-[var(--line)] text-[0.86rem]">
              <div
                v-for="(item, index) in schedule"
                :key="`${item.day}-${index}`"
                class="grid grid-cols-[60px_minmax(0,1fr)_auto] items-baseline gap-2.5 border-b border-[var(--line)] py-2.5 last:border-b-0"
              >
                <span class="font-bold text-[var(--ink)]">{{ item.day }}</span>
                <strong class="font-medium text-[var(--muted)]">{{ item.activity }}</strong>
                <small class="text-[var(--muted)]">{{ item.time }}</small>
              </div>
            </div>
          </article>

          <!-- Team roles -->
          <article class="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6">
            <div class="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div class="flex items-center gap-2.5">
                <span
                  class="grid h-8 w-8 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_20%,transparent)] bg-[var(--brand-soft)] text-[var(--brand)]"
                >
                  <Icon name="lucide:users" class="learning-icon" />
                </span>
                <h3 class="m-0 text-[1.08rem] font-bold">Who does what</h3>
              </div>
              <span class="text-[0.72rem] font-bold uppercase tracking-widest text-[var(--muted)]">
                Team roles
              </span>
            </div>
            <div class="mt-4 grid gap-4">
              <div
                v-for="role in roles"
                :key="role.role"
                class="grid gap-0.5 border-l-2 border-[var(--brand)] pl-3"
              >
                <strong class="text-[0.95rem] font-semibold text-[var(--ink)]">
                  {{ role.role }}
                </strong>
                <p class="m-0 text-[0.86rem] leading-snug text-[var(--muted)]">
                  {{ role.responsibility }}
                </p>
              </div>
            </div>
          </article>

          <!-- Conventions -->
          <article class="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6">
            <div class="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div class="flex items-center gap-2.5">
                <span
                  class="grid h-8 w-8 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_20%,transparent)] bg-[var(--brand-soft)] text-[var(--brand)]"
                >
                  <Icon name="lucide:ruler" class="learning-icon" />
                </span>
                <h3 class="m-0 text-[1.08rem] font-bold">Conventions</h3>
              </div>
              <span class="text-[0.72rem] font-bold uppercase tracking-widest text-[var(--muted)]">
                Team rules
              </span>
            </div>
            <div class="mt-4 grid gap-4">
              <div
                v-for="item in conventions"
                :key="item.title"
                class="grid gap-0.5 border-l-2 border-[var(--brand)] pl-3"
              >
                <strong class="text-[0.95rem] font-semibold text-[var(--ink)]">
                  {{ item.title }}
                </strong>
                <p class="m-0 text-[0.86rem] leading-snug text-[var(--muted)]">{{ item.body }}</p>
              </div>
            </div>
          </article>

          <!-- AI tools -->
          <article class="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6">
            <div class="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div class="flex items-center gap-2.5">
                <span
                  class="grid h-8 w-8 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_20%,transparent)] bg-[var(--brand-soft)] text-[var(--brand)]"
                >
                  <Icon name="lucide:sparkles" class="learning-icon" />
                </span>
                <h3 class="m-0 text-[1.08rem] font-bold">AI tools</h3>
              </div>
              <span class="text-[0.72rem] font-bold uppercase tracking-widest text-[var(--muted)]">
                Use, then verify
              </span>
            </div>
            <div class="mt-4 grid gap-2.5">
              <a
                v-for="tool in aiTools"
                :key="tool.name"
                :href="tool.href"
                target="_blank"
                rel="noopener noreferrer"
                class="group grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3 text-[var(--ink)] no-underline transition-colors hover:border-[var(--brand)]"
              >
                <div class="min-w-0">
                  <strong class="block text-[0.9rem] font-semibold">{{ tool.name }}</strong>
                  <p class="m-0 mt-0.5 text-[0.8rem] text-[var(--muted)]">{{ tool.use }}</p>
                </div>
                <span
                  class="rounded-md bg-[var(--surface)] px-2 py-0.5 text-[0.72rem] font-medium text-[var(--muted)]"
                >
                  {{ tool.label }}
                </span>
                <Icon
                  name="lucide:arrow-up-right"
                  class="learning-icon text-[var(--brand)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </article>
        </div>
      </section>

      <!-- ============ § 04 — ROLES ============ -->
      <section id="roles" class="plan-section scroll-mt-[160px]" aria-labelledby="roles-title">
        <header
          class="flex flex-wrap items-end justify-between gap-10 border-t border-[var(--line)] pt-7"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-3">
              <span
                class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
              >
                {{ sections.roles }}
              </span>
              <p class="plans-section-kicker m-0">Your progress</p>
            </div>
            <h2
              id="roles-title"
              class="mt-2 max-w-[760px] text-[clamp(1.65rem,2.3vw,2.15rem)] font-bold leading-tight"
            >
              Roles you earn along the way
            </h2>
          </div>
          <p class="m-0 max-w-[500px] text-[0.98rem] leading-relaxed text-[var(--muted)]">
            Each role is tied to a phase gate and the work you produce. It stays locked until you
            pass the gate, then it's added to your plan profile.
          </p>
        </header>

        <div class="plan-roles mt-6">
          <article
            v-for="role in planRoles"
            :key="role.title"
            class="plan-role-card"
            :data-tone="role.tone"
            :data-status="roleStatus(role.phase)"
          >
            <div class="plan-role-card-top">
              <span>Phase {{ role.number }} · {{ role.weeks }}</span>
              <span class="plan-role-status">
                <Icon
                  :name="
                    roleStatus(role.phase) === 'complete'
                      ? 'lucide:circle-check-big'
                      : 'lucide:lock'
                  "
                  class="learning-icon"
                />
                {{ roleStatus(role.phase) === 'complete' ? 'Earned' : 'Locked' }}
              </span>
            </div>
            <h3>{{ role.title }}</h3>
            <p>{{ role.summary }}</p>
            <ul>
              <li v-for="responsibility in role.responsibilities" :key="responsibility">
                {{ responsibility }}
              </li>
            </ul>
          </article>
        </div>
      </section>

      <!-- ============ § 05 — RESOURCES ============ -->
      <section
        id="resources"
        class="plan-section scroll-mt-[160px]"
        aria-labelledby="resources-title"
      >
        <header
          class="flex flex-wrap items-end justify-between gap-10 border-t border-[var(--line)] pt-7"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-3">
              <span
                class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
              >
                {{ sections.resources }}
              </span>
              <p class="plans-section-kicker m-0">Resource library</p>
            </div>
            <h2
              id="resources-title"
              class="mt-2 max-w-[760px] text-[clamp(1.65rem,2.3vw,2.15rem)] font-bold leading-tight"
            >
              Resources by phase
            </h2>
          </div>
          <p class="m-0 max-w-[500px] text-[0.98rem] leading-relaxed text-[var(--muted)]">
            Each topic page repeats the exact videos and readings for that week. Use this shortlist
            when you want to browse the whole plan before you start.
          </p>
        </header>

        <div class="mt-6 grid gap-3.5 md:grid-cols-3">
          <article
            v-for="group in resourceGroups"
            :key="group.key"
            class="relative rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5"
            :data-tone="group.tone"
          >
            <span
              class="absolute inset-x-0 top-0 h-[3px] rounded-t-xl bg-[color:var(--phase-color)]"
            />
            <h3 class="mb-3 mt-2 text-[1rem] font-bold">{{ group.label }}</h3>
            <a
              v-for="item in group.items"
              :key="item.href"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-start justify-between gap-2 border-b border-[var(--line)] py-2 text-[0.9rem] leading-snug no-underline last:border-b-0 hover:text-[color:var(--phase-color)]"
            >
              <span>{{ item.label }}</span>
              <Icon
                name="lucide:arrow-up-right"
                class="learning-icon mt-1 text-[0.9rem] text-[var(--muted)] transition-colors group-hover:text-[color:var(--phase-color)]"
              />
            </a>
          </article>
        </div>

        <div
          class="mt-4 flex flex-wrap items-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4"
        >
          <span class="mr-1 text-[0.72rem] font-bold uppercase tracking-widest text-[var(--muted)]">
            Start here
          </span>
          <a
            v-for="item in mainResources"
            :key="item.href"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-[0.84rem] no-underline transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            {{ item.label }}
            <Icon name="lucide:arrow-up-right" class="learning-icon" />
          </a>
        </div>
      </section>

      <!-- ============ RESET ============ -->
      <section
        class="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6"
      >
        <div>
          <h2 class="m-0 text-[1.14rem] font-bold">Want a clean run?</h2>
          <p class="m-0 mt-1 text-[0.92rem] text-[var(--muted)]">
            This clears topic passes, phase gates and quiz scores for this plan in this browser.
          </p>
        </div>
        <button type="button" class="learning-button learning-button-danger" @click="confirmReset">
          <Icon name="lucide:rotate-ccw" class="learning-icon" />
          Reset plan progress
        </button>
      </section>
    </template>

    <section v-else-if="plan" class="plan-coming-soon">
      <div class="plan-coming-card" :data-tone="plan.tone">
        <span class="plans-eyebrow">Plan {{ plan.number }}</span>
        <h1>{{ plan.title }} is coming next</h1>
        <p>{{ plan.description }}</p>
        <div class="plan-card-stats">
          <span
            ><strong>{{ plan.weeks }}</strong> weeks</span
          >
          <span
            ><strong>{{ plan.phases }}</strong> phases</span
          >
          <span
            ><strong>{{ plan.roles.length }}</strong> roles</span
          >
        </div>
        <ul class="plan-card-preview">
          <li v-for="item in plan.preview" :key="item">
            <Icon name="lucide:check" class="learning-icon" />
            {{ item }}
          </li>
        </ul>
        <NuxtLink :to="roadmapPath('plan-1')" class="learning-button learning-button-primary">
          Start with Plan 1
          <Icon name="lucide:arrow-right" class="learning-icon" />
        </NuxtLink>
      </div>
    </section>

    <section v-else class="plan-coming-soon">
      <div class="plan-coming-card">
        <h1>Plan not found</h1>
        <p>That learning plan does not exist yet.</p>
        <NuxtLink :to="plansPath()" class="learning-button learning-button-primary">
          Back to all plans
        </NuxtLink>
      </div>
    </section>
  </LearningShell>
</template>

<style scoped>
/* Hero decorative glow */
.plan-hero::after {
  position: absolute;
  top: -40%;
  right: -10%;
  width: 420px;
  height: 420px;
  content: '';
  background: radial-gradient(
    circle,
    color-mix(in oklab, var(--brand) 18%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

/* Hide horizontal scrollbar on the jump nav */
.plan-jump-nav > div {
  scrollbar-width: none;
}

.plan-jump-nav > div::-webkit-scrollbar {
  display: none;
}

.plan-section {
  margin-top: 72px;
}

@media (max-width: 680px) {
  .plan-section {
    margin-top: 48px;
  }
}
</style>
