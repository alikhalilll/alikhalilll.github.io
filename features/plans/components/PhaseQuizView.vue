<script setup lang="ts">
import { computed } from 'vue';
import { useHead } from '#imports';

import type { PhaseKey } from '~/features/plan1/types';
import { getPlanRuntime } from '../planRuntime';
import { usePlanProgress } from '../composables/usePlanProgress';
import { roadmapPath, topicPath } from '../routes';
import LearningShell from './LearningShell.vue';
import QuizRunner from './QuizRunner.vue';

const props = defineProps<{
  planId: string;
  phaseKey: PhaseKey;
}>();

const plan = computed(() => getPlanRuntime(props.planId));
const phases = computed(() => plan.value?.phases ?? []);
const phase = computed(() => phases.value.find((entry) => entry.key === props.phaseKey));
const topics = computed(() => plan.value?.getTopicsForPhase(props.phaseKey) ?? []);
const quiz = computed(() => plan.value?.getPhaseQuiz(props.phaseKey) ?? []);
const phasePassingScore = computed(() => plan.value?.phasePassingScore ?? 5);

const progress = usePlanProgress(props.planId);
const {
  completedTopics,
  getPhaseQuizStatus,
  getPhaseResult,
  getTopicStatus,
  hydrated,
  isPhaseUnlocked,
  progressPercent,
  recordPhaseResult,
} = progress;

const result = computed(() => getPhaseResult(props.phaseKey));
const status = computed(() => getPhaseQuizStatus(props.phaseKey));
const phaseUnlocked = computed(() => isPhaseUnlocked(props.phaseKey));
const completedTopicCount = computed(
  () => topics.value.filter((topic) => getTopicStatus(topic.id) === 'complete').length
);

const nextPhase = computed(() => {
  const index = phases.value.findIndex((entry) => entry.key === props.phaseKey);
  return index >= 0 ? phases.value[index + 1] : undefined;
});

const nextStep = computed(() => {
  const next = nextPhase.value;

  if (next) {
    const firstTopic = plan.value?.getTopicsForPhase(next.key)[0];
    return {
      href: firstTopic ? topicPath(props.planId, firstTopic.id) : roadmapPath(props.planId),
      label: `Start Phase ${next.number}: ${next.title}`,
      hint: firstTopic ? `Unlocked · ${firstTopic.title}` : 'Unlocked',
    };
  }

  return {
    href: roadmapPath(props.planId),
    label: 'Back to the full roadmap',
    hint: `All ${phases.value.length} phases are complete.`,
  };
});

const handleQuizPass = (score: number, total: number) => {
  recordPhaseResult(props.phaseKey, score, total);
};

useHead(() => ({
  title: phase.value ? `${phase.value.title} phase quiz · Learning Paths` : 'Phase quiz',
}));
</script>

<template>
  <LearningShell
    wide
    :back-to="roadmapPath(planId)"
    back-label="Roadmap"
    :progress-label="`${completedTopics} topics passed`"
    :progress-percent="progressPercent"
  >
    <template v-if="phase">
      <!-- Phase is locked by prerequisite phase -->
      <section v-if="hydrated && !phaseUnlocked" class="topic-locked">
        <div class="topic-locked-card">
          <span class="topic-locked-icon">
            <Icon name="lucide:lock-keyhole" class="learning-icon" />
          </span>
          <p class="plans-eyebrow">Phase {{ phase.number }} gate</p>
          <h1>{{ phase.title }} is locked</h1>
          <p>
            This phase opens after you pass the previous phase gate. Finish the current topics, take
            the phase quiz and add the role that comes with it.
          </p>
          <NuxtLink :to="roadmapPath(planId)" class="learning-button learning-button-primary">
            Back to the roadmap
            <Icon name="lucide:map" class="learning-icon" />
          </NuxtLink>
        </div>
      </section>

      <!-- Phase unlocked but gate quiz still locked (topics incomplete) -->
      <section v-else-if="hydrated && status === 'locked'" class="topic-locked">
        <div class="topic-locked-card">
          <span class="topic-locked-icon">
            <Icon name="lucide:list-checks" class="learning-icon" />
          </span>
          <p class="plans-eyebrow">Phase {{ phase.number }} gate</p>
          <h1>{{ phase.title }} quiz is not open yet</h1>
          <p>
            The phase gate opens after all {{ topics.length }} topic quizzes in this phase are
            passed. You have passed {{ completedTopicCount }} so far.
          </p>
          <div
            class="phase-quiz-topic-list my-3 grid max-h-[380px] w-full gap-1.5 overflow-y-auto p-0.5"
          >
            <NuxtLink
              v-for="topic in topics"
              :key="topic.id"
              :to="topicPath(planId, topic.id)"
              class="phase-quiz-topic grid grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 text-[var(--muted)] no-underline transition-colors"
              :data-status="getTopicStatus(topic.id)"
            >
              <span class="text-[0.72rem] font-extrabold text-[color:var(--phase-color)]">
                {{ String(topic.order).padStart(2, '0') }}
              </span>
              <strong class="text-[0.84rem] font-semibold leading-snug">
                {{ topic.title }}
              </strong>
              <Icon
                :name="
                  getTopicStatus(topic.id) === 'complete'
                    ? 'lucide:circle-check-big'
                    : getTopicStatus(topic.id) === 'available'
                      ? 'lucide:play'
                      : 'lucide:lock'
                "
                class="learning-icon"
              />
            </NuxtLink>
          </div>
          <NuxtLink :to="roadmapPath(planId)" class="learning-button learning-button-primary">
            Continue the roadmap
            <Icon name="lucide:arrow-right" class="learning-icon" />
          </NuxtLink>
        </div>
      </section>

      <!-- Phase gate quiz available -->
      <template v-else>
        <!-- Breadcrumb -->
        <nav class="topic-breadcrumb" aria-label="Breadcrumb">
          <NuxtLink :to="roadmapPath(planId)">Roadmap</NuxtLink>
          <span>/</span>
          <span>Phase {{ phase.number }} gate</span>
        </nav>

        <!-- ============ HERO ============ -->
        <section
          class="phase-quiz-hero relative grid gap-7 overflow-hidden rounded-3xl border border-[var(--line)] p-8 shadow-md md:grid-cols-[minmax(0,1fr)_340px] md:items-center md:p-10"
          :data-tone="phase.tone"
        >
          <span
            class="absolute inset-x-0 top-0 h-[5px] bg-[color:var(--phase-color)]"
            aria-hidden="true"
          />

          <div class="relative min-w-0">
            <p class="plans-eyebrow m-0">Phase {{ phase.number }} · {{ phase.weeks }}</p>
            <h1 class="my-3 text-[clamp(2.4rem,4.6vw,3.8rem)] font-bold leading-[1] tracking-tight">
              {{ phase.title }}
            </h1>
            <p class="m-0 max-w-[720px] text-[1.05rem] leading-relaxed text-[var(--muted)]">
              {{ phase.goal }}
            </p>
            <div class="plan-hero-stats mt-6">
              <span
                ><strong>{{ topics.length }}</strong> topics</span
              >
              <span
                ><strong>{{ completedTopicCount }}</strong> passed</span
              >
              <span>
                <strong>{{ phasePassingScore }} / {{ quiz.length }}</strong> to pass the gate
              </span>
            </div>
          </div>

          <!-- Role card -->
          <aside
            class="phase-quiz-role relative flex flex-col gap-1 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"
            :data-status="result?.passed ? 'complete' : 'locked'"
          >
            <span
              class="plan-card-label inline-flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-widest text-[var(--muted)]"
            >
              {{ result?.passed ? 'Role earned' : 'Role waiting' }}
            </span>
            <Icon
              name="lucide:badge-check"
              class="my-1.5 h-7 w-7 text-[color:var(--phase-color)]"
            />
            <h2 class="m-0 text-[1.35rem] font-bold leading-tight">{{ phase.role.title }}</h2>
            <p class="m-0 mt-1 text-[0.88rem] leading-relaxed text-[var(--muted)]">
              {{ phase.role.summary }}
            </p>
            <span
              class="phase-quiz-role-status mt-2 inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-[var(--muted)]"
            >
              <Icon
                :name="result?.passed ? 'lucide:circle-check-big' : 'lucide:lock'"
                class="learning-icon"
              />
              {{ result?.passed ? 'Added to your profile' : 'Pass the phase quiz to add it' }}
            </span>
          </aside>
        </section>

        <!-- ============ WHAT PROVES THIS PHASE ============ -->
        <section
          class="mt-5 grid gap-7 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 md:grid-cols-[minmax(240px,0.65fr)_minmax(0,1.35fr)]"
        >
          <div>
            <p class="plans-section-kicker m-0">What proves this phase</p>
            <h2 class="mt-1 text-[1.28rem] font-bold leading-tight">{{ phase.proof }}</h2>
          </div>
          <ul class="m-0 grid list-none gap-2 p-0">
            <li
              v-for="gate in phase.gates"
              :key="gate"
              class="flex items-start gap-2 text-[0.92rem] leading-relaxed text-[var(--muted)]"
            >
              <Icon name="lucide:check" class="learning-icon mt-1 text-[var(--success)]" />
              {{ gate }}
            </li>
          </ul>
        </section>

        <!-- ============ THE GATE QUIZ ============ -->
        <section class="topic-section scroll-mt-24" aria-labelledby="phase-quiz-title">
          <div class="plan-section-head">
            <div>
              <div class="flex items-center gap-3">
                <span
                  class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
                >
                  01
                </span>
                <p class="plans-section-kicker m-0">The gate</p>
              </div>
              <h2 id="phase-quiz-title">Phase checkpoint</h2>
            </div>
            <p>
              {{ quiz.length }} questions across the phase. Pass {{ phasePassingScore }} of
              {{ quiz.length }} to unlock the next phase and add the {{ phase.role.title }} role.
              You can retake it; your best score is kept.
            </p>
          </div>

          <QuizRunner
            :key="phase.key"
            :title="`${phase.title} · phase quiz`"
            description="This gate samples the key ideas from every week in the phase. It is deliberately harder than a topic quiz."
            :questions="quiz"
            :passing-score="phasePassingScore"
            :already-passed="result?.passed === true"
            :best-score="result?.bestScore ?? 0"
            :attempts="result?.attempts ?? 0"
            submit-label="Submit phase quiz"
            @pass="handleQuizPass"
          />

          <!-- Next step after pass -->
          <div v-if="result?.passed" class="topic-next">
            <div>
              <span class="plans-section-kicker">
                {{ nextPhase ? 'Next phase unlocked' : 'Plan complete' }}
              </span>
              <h3>{{ nextStep.label }}</h3>
              <p>{{ nextStep.hint }}</p>
            </div>
            <NuxtLink :to="nextStep.href" class="learning-button learning-button-primary">
              {{ nextPhase ? 'Continue' : 'Review the roadmap' }}
              <Icon name="lucide:arrow-right" class="learning-icon" />
            </NuxtLink>
          </div>
        </section>

        <!-- ============ THE ROLE ============ -->
        <section class="plan-section scroll-mt-24">
          <div class="plan-section-head">
            <div>
              <div class="flex items-center gap-3">
                <span
                  class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
                >
                  02
                </span>
                <p class="plans-section-kicker m-0">The role</p>
              </div>
              <h2>What you can own after this gate</h2>
            </div>
            <p>
              A role is only added after the phase quiz passes. These are the responsibilities you
              should be able to take on without hand-holding.
            </p>
          </div>
          <div class="plan-roles">
            <article
              class="plan-role-card"
              :data-tone="phase.tone"
              :data-status="result?.passed ? 'complete' : 'locked'"
            >
              <div class="plan-role-card-top">
                <span>Phase {{ phase.number }} · {{ phase.weeks }}</span>
                <span class="plan-role-status">
                  <Icon
                    :name="result?.passed ? 'lucide:circle-check-big' : 'lucide:lock'"
                    class="learning-icon"
                  />
                  {{ result?.passed ? 'Earned' : 'Locked' }}
                </span>
              </div>
              <h3>{{ phase.role.title }}</h3>
              <p>{{ phase.role.summary }}</p>
              <ul>
                <li v-for="responsibility in phase.role.responsibilities" :key="responsibility">
                  {{ responsibility }}
                </li>
              </ul>
            </article>
          </div>
        </section>
      </template>
    </template>

    <!-- Phase doesn't exist -->
    <section v-else class="plan-coming-soon">
      <div class="plan-coming-card">
        <h1>Phase not found</h1>
        <p>This phase does not exist in the plan.</p>
        <NuxtLink :to="roadmapPath(planId)" class="learning-button learning-button-primary">
          Back to the roadmap
        </NuxtLink>
      </div>
    </section>
  </LearningShell>
</template>

<style scoped>
/* Hero background wash per tone */
.phase-quiz-hero {
  background:
    radial-gradient(
      circle at 92% 4%,
      color-mix(in oklab, var(--phase-color) 15%, transparent),
      transparent 24rem
    ),
    linear-gradient(
      145deg,
      var(--surface),
      color-mix(in oklab, var(--phase-color) 4%, var(--surface))
    );
}

/* Role card tint when earned */
.phase-quiz-role[data-status='complete'] {
  background: color-mix(in oklab, var(--success) 7%, var(--surface));
  border-color: color-mix(in oklab, var(--success) 30%, var(--line));
}

.phase-quiz-role[data-status='complete'] .phase-quiz-role-status {
  color: var(--success);
}

/* Topic list variants (locked gate state) */
.phase-quiz-topic[data-status='complete'] {
  color: var(--ink) !important;
  background: var(--success-soft);
  border-color: color-mix(in oklab, var(--success) 24%, var(--line));
}

.phase-quiz-topic[data-status='complete'] .learning-icon {
  color: var(--success);
}

.phase-quiz-topic[data-status='available'] {
  color: var(--ink) !important;
  background: var(--info-soft);
  border-color: color-mix(in oklab, var(--info) 28%, var(--line));
}

.phase-quiz-topic[data-status='available'] .learning-icon {
  color: var(--info);
}

.phase-quiz-topic[data-status='locked'] {
  opacity: 0.58;
}
</style>
