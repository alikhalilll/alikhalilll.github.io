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
          <div class="phase-quiz-topic-list">
            <NuxtLink
              v-for="topic in topics"
              :key="topic.id"
              :to="topicPath(planId, topic.id)"
              class="phase-quiz-topic"
              :data-status="getTopicStatus(topic.id)"
            >
              <span>{{ String(topic.order).padStart(2, '0') }}</span>
              <strong>{{ topic.title }}</strong>
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

      <template v-else>
        <nav class="topic-breadcrumb" aria-label="Breadcrumb">
          <NuxtLink :to="roadmapPath(planId)">Roadmap</NuxtLink>
          <span>/</span>
          <span>Phase {{ phase.number }} gate</span>
        </nav>

        <section class="phase-quiz-hero" :data-tone="phase.tone">
          <div>
            <p class="plans-eyebrow">Phase {{ phase.number }} · {{ phase.weeks }}</p>
            <h1>{{ phase.title }}</h1>
            <p>{{ phase.goal }}</p>
            <div class="plan-hero-stats">
              <span
                ><strong>{{ topics.length }}</strong> topics</span
              >
              <span
                ><strong>{{ completedTopicCount }}</strong> passed</span
              >
              <span
                ><strong>{{ phasePassingScore }} / {{ quiz.length }}</strong> to pass the gate</span
              >
            </div>
          </div>

          <aside class="phase-quiz-role" :data-status="result?.passed ? 'complete' : 'locked'">
            <span class="plan-card-label">
              {{ result?.passed ? 'Role earned' : 'Role waiting' }}
            </span>
            <Icon name="lucide:badge-check" class="phase-quiz-role-icon" />
            <h2>{{ phase.role.title }}</h2>
            <p>{{ phase.role.summary }}</p>
            <span class="phase-quiz-role-status">
              <Icon
                :name="result?.passed ? 'lucide:circle-check-big' : 'lucide:lock'"
                class="learning-icon"
              />
              {{ result?.passed ? 'Added to your profile' : 'Pass the phase quiz to add it' }}
            </span>
          </aside>
        </section>

        <section class="phase-quiz-summary">
          <div>
            <p class="plans-section-kicker">What proves this phase</p>
            <h2>{{ phase.proof }}</h2>
          </div>
          <ul>
            <li v-for="gate in phase.gates" :key="gate">
              <Icon name="lucide:check" class="learning-icon" />
              {{ gate }}
            </li>
          </ul>
        </section>

        <section class="topic-section" aria-labelledby="phase-quiz-title">
          <div class="plan-section-head">
            <div>
              <p class="plans-section-kicker">The gate</p>
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

        <section class="plan-section">
          <div class="plan-section-head">
            <div>
              <p class="plans-section-kicker">The role</p>
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
.phase-quiz-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 30px;
  align-items: center;
  padding: 34px;
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
  border: 1px solid var(--line);
  border-top: 5px solid var(--phase-color);
  border-radius: 30px;
  box-shadow: var(--shadow);
}

.phase-quiz-hero > div > h1 {
  margin: 9px 0 12px;
  font-size: clamp(2.4rem, 4.6vw, 3.8rem);
  line-height: 1;
}

.phase-quiz-hero > div > p:not(.plans-eyebrow) {
  max-width: 720px;
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--muted);
}

.phase-quiz-role {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
}

.phase-quiz-role[data-status='complete'] {
  background: color-mix(in oklab, var(--success) 7%, var(--surface));
  border-color: color-mix(in oklab, var(--success) 30%, var(--line));
}

.phase-quiz-role-icon {
  width: 1.7rem;
  height: 1.7rem;
  margin: 6px 0 4px;
  color: var(--phase-color);
}

.phase-quiz-role h2 {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.15;
}

.phase-quiz-role p {
  margin: 4px 0 8px;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--muted);
}

.phase-quiz-role-status {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 650;
  color: var(--muted);
}

.phase-quiz-role[data-status='complete'] .phase-quiz-role-status {
  color: var(--success);
}

.phase-quiz-summary {
  display: grid;
  grid-template-columns: minmax(240px, 0.65fr) minmax(0, 1.35fr);
  gap: 28px;
  align-items: start;
  padding: 24px;
  margin-top: 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
}

.phase-quiz-summary h2 {
  margin: 5px 0 0;
  font-size: 1.28rem;
  line-height: 1.3;
}

.phase-quiz-summary ul {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.phase-quiz-summary li {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--muted);
}

.phase-quiz-summary li .learning-icon {
  margin-top: 4px;
  color: var(--success);
}

.phase-quiz-topic-list {
  display: grid;
  gap: 6px;
  width: 100%;
  max-height: 380px;
  padding: 2px;
  margin: 8px 0 12px;
  overflow-y: auto;
}

.phase-quiz-topic {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 9px;
  align-items: center;
  padding: 9px 11px;
  color: var(--muted) !important;
  text-decoration: none !important;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 9px;
}

.phase-quiz-topic > span {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--phase-color);
}

.phase-quiz-topic strong {
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.35;
}

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

@media (max-width: 940px) {
  .phase-quiz-hero {
    grid-template-columns: 1fr;
  }

  .phase-quiz-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .phase-quiz-hero {
    padding: 20px;
    border-radius: 24px;
  }

  .phase-quiz-role {
    padding: 18px;
  }

  .phase-quiz-summary {
    padding: 18px;
  }

  .phase-quiz-topic {
    grid-template-columns: 30px minmax(0, 1fr) auto;
  }
}
</style>
