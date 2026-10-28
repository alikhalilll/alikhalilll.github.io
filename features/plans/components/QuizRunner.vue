<script setup lang="ts">
import { computed, ref } from 'vue';

import type { QuizQuestion } from '~/features/plan1/types';

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    questions: QuizQuestion[];
    passingScore: number;
    alreadyPassed?: boolean;
    bestScore?: number;
    attempts?: number;
    submitLabel?: string;
  }>(),
  {
    description: undefined,
    alreadyPassed: false,
    bestScore: 0,
    attempts: 0,
    submitLabel: 'Submit quiz',
  }
);

const emit = defineEmits<{
  pass: [score: number, total: number];
  submit: [score: number, total: number];
}>();

const answers = ref<Record<number, number>>({});
const submitted = ref(false);
const score = ref(0);
const passedNow = ref(false);

const answeredCount = computed(
  () => Object.values(answers.value).filter((answer) => answer !== undefined).length
);

const isCorrect = (index: number) => answers.value[index] === props.questions[index]?.answer;

const optionState = (questionIndex: number, optionIndex: number) => {
  if (!submitted.value) return 'pending';
  const question = props.questions[questionIndex];
  const selected = answers.value[questionIndex];
  if (optionIndex === question?.answer) return 'correct';
  if (selected === optionIndex) return 'wrong';
  return 'muted';
};

const letter = (index: number) => String.fromCharCode(65 + index);

const submitQuiz = () => {
  if (answeredCount.value < props.questions.length) return;

  score.value = props.questions.reduce(
    (total, question, index) => total + (answers.value[index] === question.answer ? 1 : 0),
    0
  );
  passedNow.value = score.value >= props.passingScore;
  submitted.value = true;

  emit('submit', score.value, props.questions.length);

  if (passedNow.value) {
    emit('pass', score.value, props.questions.length);
  }
};

const retry = () => {
  answers.value = {};
  submitted.value = false;
  score.value = 0;
  passedNow.value = false;
};
</script>

<template>
  <section
    class="quiz-runner relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-sm"
    aria-labelledby="quiz-title"
  >
    <!-- Decorative top accent -->
    <span
      class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand)] via-[var(--phase-blue)] to-[var(--brand)]"
      aria-hidden="true"
    />

    <!-- Head -->
    <header class="flex flex-wrap items-start justify-between gap-6">
      <div class="min-w-0 flex-1">
        <p
          class="plans-eyebrow m-0 mb-1 text-[0.74rem] font-extrabold uppercase tracking-widest text-[var(--brand)]"
        >
          Checkpoint quiz
        </p>
        <h3 id="quiz-title" class="m-0 text-[1.38rem] font-bold leading-tight">
          {{ title }}
        </h3>
        <p
          v-if="description"
          class="m-0 mt-2 max-w-[700px] text-[0.94rem] leading-relaxed text-[var(--muted)]"
        >
          {{ description }}
        </p>
      </div>
      <div class="flex flex-wrap justify-end gap-1.5">
        <span
          class="whitespace-nowrap rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[0.74rem] font-semibold text-[var(--muted)]"
        >
          {{ questions.length }} questions
        </span>
        <span
          class="whitespace-nowrap rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[0.74rem] font-semibold text-[var(--muted)]"
        >
          Pass {{ passingScore }}/{{ questions.length }}
        </span>
        <span
          v-if="attempts > 0"
          class="whitespace-nowrap rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[0.74rem] font-semibold text-[var(--muted)]"
        >
          Attempt {{ attempts + 1 }}
        </span>
      </div>
    </header>

    <!-- Already passed notice -->
    <div
      v-if="alreadyPassed"
      class="mt-5 flex items-start gap-2.5 rounded-xl border border-[color-mix(in_oklab,var(--success)_28%,var(--line))] bg-[var(--success-soft)] p-4 text-[var(--success)]"
    >
      <Icon name="lucide:circle-check-big" class="learning-icon mt-0.5 text-lg" />
      <div>
        <strong class="block text-[0.9rem]">
          Already passed · best {{ bestScore }}/{{ questions.length }}
        </strong>
        <span class="mt-0.5 block text-[0.82rem] text-[var(--muted)]">
          You can retake it, but your best score is kept.
        </span>
      </div>
    </div>

    <!-- Quiz form -->
    <form v-if="questions.length > 0" class="mt-6 grid gap-4" @submit.prevent="submitQuiz">
      <fieldset
        v-for="(question, questionIndex) in questions"
        :key="question.id"
        class="quiz-question m-0 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-5 transition-colors"
        :class="{
          'quiz-question-correct': submitted && isCorrect(questionIndex),
          'quiz-question-wrong': submitted && !isCorrect(questionIndex),
        }"
      >
        <legend
          class="flex items-start gap-2.5 px-1 text-[1rem] font-semibold leading-snug text-[var(--ink)]"
        >
          <span
            class="rounded-md bg-[var(--brand-soft)] px-2 py-0.5 text-[0.72rem] font-extrabold text-[var(--brand)]"
          >
            Q{{ questionIndex + 1 }}
          </span>
          <span>{{ question.prompt }}</span>
        </legend>

        <label
          v-for="(option, optionIndex) in question.options"
          :key="`${question.id}-${optionIndex}`"
          class="quiz-option relative mt-2 flex cursor-pointer items-start gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-[0.94rem] leading-snug text-[var(--muted)] transition-all hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
          :data-state="optionState(questionIndex, optionIndex)"
        >
          <input
            v-model="answers[questionIndex]"
            type="radio"
            :name="`quiz-${question.id}`"
            :value="optionIndex"
            :disabled="submitted"
            class="pointer-events-none absolute h-px w-px opacity-0"
          />
          <span
            class="quiz-option-letter grid h-7 w-7 flex-none place-items-center rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-[0.72rem] font-extrabold text-[var(--muted)]"
          >
            {{ letter(optionIndex) }}
          </span>
          <span class="pt-0.5">{{ option }}</span>
        </label>

        <p
          v-if="submitted"
          class="quiz-explanation mt-2.5 rounded-r-lg border-l-[3px] border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2.5 text-[0.86rem] leading-relaxed text-[var(--muted)]"
        >
          <strong class="text-[var(--ink)]">
            {{ isCorrect(questionIndex) ? 'Correct.' : 'Not quite.' }}
          </strong>
          {{ question.explanation }}
        </p>
      </fieldset>

      <!-- Actions row -->
      <div v-if="!submitted" class="flex flex-wrap items-center justify-between gap-4 pt-0.5">
        <span class="text-[0.84rem] text-[var(--muted)]">
          {{ answeredCount }} / {{ questions.length }} answered
        </span>
        <button
          type="submit"
          class="learning-button learning-button-primary"
          :disabled="answeredCount < questions.length"
        >
          {{ submitLabel }}
          <Icon name="lucide:arrow-right" class="learning-icon" />
        </button>
      </div>

      <!-- Result banner -->
      <div
        v-else
        class="quiz-result flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-5"
        :data-passed="passedNow"
      >
        <div class="grid min-w-0 gap-0.5">
          <span
            class="font-[var(--font-display)] text-[1.6rem] font-bold leading-tight text-[var(--ink)]"
          >
            {{ score }} / {{ questions.length }}
          </span>
          <strong class="text-[0.94rem] font-semibold text-[var(--ink)]">
            {{ passedNow ? 'Level passed' : 'Not yet — keep going' }}
          </strong>
          <p v-if="passedNow" class="m-0 mt-0.5 text-[0.86rem] text-[var(--muted)]">
            The next step is unlocked. Continue below.
          </p>
          <p v-else class="m-0 mt-0.5 text-[0.86rem] text-[var(--muted)]">
            Review the explanations and try again. Nothing unlocks until you pass.
          </p>
        </div>
        <button type="button" class="learning-button learning-button-soft" @click="retry">
          <Icon name="lucide:rotate-ccw" class="learning-icon" />
          Try again
        </button>
      </div>
    </form>

    <p v-else class="m-0 mt-5 text-[0.94rem] text-[var(--muted)]">
      This checkpoint has no questions yet.
    </p>
  </section>
</template>

<style scoped>
/* Submitted-state variants per question card */
.quiz-question-correct {
  background: color-mix(in oklab, var(--success) 5%, var(--surface-2));
  border-color: color-mix(in oklab, var(--success) 36%, var(--line));
}

.quiz-question-wrong {
  background: color-mix(in oklab, var(--warning-line) 8%, var(--surface-2));
  border-color: var(--warning-line);
}

/* Option visual states — these piggy-back on the data-state attribute set
   from JS once the quiz is submitted. */
.quiz-option:has(input:checked) {
  color: var(--ink);
  background: var(--brand-soft);
  border-color: color-mix(in oklab, var(--brand) 52%, var(--line));
}

.quiz-option:has(input:checked) .quiz-option-letter {
  color: var(--on-brand);
  background: var(--brand);
  border-color: var(--brand);
}

.quiz-option[data-state='correct'] {
  color: var(--ink);
  background: var(--success-soft);
  border-color: color-mix(in oklab, var(--success) 42%, var(--line));
}

.quiz-option[data-state='correct'] .quiz-option-letter {
  color: var(--on-brand);
  background: var(--success);
  border-color: var(--success);
}

.quiz-option[data-state='wrong'] {
  color: var(--warning-ink);
  background: var(--warning-soft);
  border-color: var(--warning-line);
}

.quiz-option[data-state='wrong'] .quiz-option-letter {
  color: var(--warning-ink);
  border-color: var(--warning-line);
}

.quiz-option[data-state='muted'] {
  opacity: 0.62;
}

/* Result banner tints */
.quiz-result[data-passed='true'] {
  background: var(--success-soft);
  border-color: color-mix(in oklab, var(--success) 32%, var(--line));
}

.quiz-result[data-passed='false'] {
  background: var(--warning-soft);
  border-color: var(--warning-line);
}

@media (max-width: 680px) {
  .quiz-runner {
    padding: 20px;
  }
}
</style>
