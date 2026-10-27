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

const optionClass = (questionIndex: number, optionIndex: number) => {
  if (!submitted.value) return undefined;
  const question = props.questions[questionIndex];
  const selected = answers.value[questionIndex];
  return {
    'is-correct': optionIndex === question?.answer,
    'is-wrong': selected === optionIndex && selected !== question?.answer,
    'is-muted': selected !== optionIndex && optionIndex !== question?.answer,
  };
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
  <section class="quiz-runner" aria-labelledby="quiz-title">
    <header class="quiz-head">
      <div>
        <p class="quiz-kicker">Checkpoint quiz</p>
        <h3 id="quiz-title">{{ title }}</h3>
        <p v-if="description" class="quiz-description">{{ description }}</p>
      </div>
      <div class="quiz-meta">
        <span>{{ questions.length }} questions</span>
        <span>Pass {{ passingScore }}/{{ questions.length }}</span>
        <span v-if="attempts > 0">Attempt {{ attempts + 1 }}</span>
      </div>
    </header>

    <div v-if="alreadyPassed" class="quiz-already">
      <Icon name="lucide:circle-check-big" class="learning-icon" />
      <div>
        <strong>Already passed · best {{ bestScore }}/{{ questions.length }}</strong>
        <span>You can retake it, but your best score is kept.</span>
      </div>
    </div>

    <form v-if="questions.length > 0" class="quiz-form" @submit.prevent="submitQuiz">
      <fieldset
        v-for="(question, questionIndex) in questions"
        :key="question.id"
        class="quiz-question"
        :class="{
          'is-correct': submitted && isCorrect(questionIndex),
          'is-wrong': submitted && !isCorrect(questionIndex),
        }"
      >
        <legend>
          <span class="quiz-question-number">Q{{ questionIndex + 1 }}</span>
          {{ question.prompt }}
        </legend>

        <label
          v-for="(option, optionIndex) in question.options"
          :key="`${question.id}-${optionIndex}`"
          class="quiz-option"
          :class="optionClass(questionIndex, optionIndex)"
        >
          <input
            v-model="answers[questionIndex]"
            type="radio"
            :name="`quiz-${question.id}`"
            :value="optionIndex"
            :disabled="submitted"
          />
          <span class="quiz-option-letter">{{ letter(optionIndex) }}</span>
          <span class="quiz-option-copy">{{ option }}</span>
        </label>

        <p v-if="submitted" class="quiz-explanation">
          <strong>{{ isCorrect(questionIndex) ? 'Correct.' : 'Not quite.' }}</strong>
          {{ question.explanation }}
        </p>
      </fieldset>

      <div v-if="!submitted" class="quiz-actions">
        <span>{{ answeredCount }} / {{ questions.length }} answered</span>
        <button
          type="submit"
          class="learning-button learning-button-primary"
          :disabled="answeredCount < questions.length"
        >
          {{ submitLabel }}
          <Icon name="lucide:arrow-right" class="learning-icon" />
        </button>
      </div>

      <div v-else class="quiz-result" :data-passed="passedNow">
        <div class="quiz-result-copy">
          <span class="quiz-result-score">{{ score }} / {{ questions.length }}</span>
          <strong>{{ passedNow ? 'Level passed' : 'Not yet — keep going' }}</strong>
          <p v-if="passedNow">The next step is unlocked. Continue below.</p>
          <p v-else>Review the explanations and try again. Nothing unlocks until you pass.</p>
        </div>
        <button type="button" class="learning-button learning-button-soft" @click="retry">
          <Icon name="lucide:rotate-ccw" class="learning-icon" />
          Try again
        </button>
      </div>
    </form>

    <p v-else class="quiz-empty">This checkpoint has no questions yet.</p>
  </section>
</template>

<style scoped>
.quiz-runner {
  padding: 28px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: var(--shadow-sm);
}

.quiz-head {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
}

.quiz-kicker {
  margin: 0 0 5px;
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--brand);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.quiz-head h3 {
  margin: 0;
  font-size: 1.38rem;
  line-height: 1.2;
}

.quiz-description {
  max-width: 700px;
  margin: 7px 0 0;
  font-size: 0.94rem;
  line-height: 1.65;
  color: var(--muted);
}

.quiz-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.quiz-meta span {
  padding: 5px 10px;
  font-size: 0.74rem;
  font-weight: 650;
  color: var(--muted);
  white-space: nowrap;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 999px;
}

.quiz-already {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  padding: 14px 16px;
  margin-top: 18px;
  color: var(--success);
  background: var(--success-soft);
  border: 1px solid color-mix(in oklab, var(--success) 28%, var(--line));
  border-radius: 14px;
}

.quiz-already .learning-icon {
  margin-top: 3px;
  font-size: 1.1rem;
}

.quiz-already strong {
  display: block;
  font-size: 0.9rem;
}

.quiz-already span {
  display: block;
  margin-top: 2px;
  font-size: 0.82rem;
  color: var(--muted);
}

.quiz-form {
  display: grid;
  gap: 18px;
  margin-top: 22px;
}

.quiz-question {
  padding: 18px 20px 20px;
  margin: 0;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 16px;
  transition:
    border-color 0.16s ease,
    background 0.16s ease;
}

.quiz-question.is-correct {
  background: color-mix(in oklab, var(--success) 5%, var(--surface-2));
  border-color: color-mix(in oklab, var(--success) 36%, var(--line));
}

.quiz-question.is-wrong {
  background: color-mix(in oklab, var(--warning-line) 8%, var(--surface-2));
  border-color: var(--warning-line);
}

.quiz-question legend {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  padding: 0 4px;
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.45;
  color: var(--ink);
}

.quiz-question-number {
  flex: none;
  padding: 2px 7px;
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 5px;
}

.quiz-option {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 11px 12px;
  margin-top: 8px;
  font-size: 0.94rem;
  line-height: 1.5;
  color: var(--muted);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 11px;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.quiz-option:hover {
  color: var(--ink);
  border-color: var(--line-strong);
}

.quiz-option input {
  position: absolute;
  width: 1px;
  height: 1px;
  pointer-events: none;
  opacity: 0;
}

.quiz-option:has(input:checked) {
  color: var(--ink);
  background: var(--brand-soft);
  border-color: color-mix(in oklab, var(--brand) 52%, var(--line));
}

.quiz-option:has(input:disabled) {
  cursor: default;
}

.quiz-option-letter {
  display: grid;
  flex: none;
  width: 26px;
  height: 26px;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--muted);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 999px;
  place-items: center;
}

.quiz-option:has(input:checked) .quiz-option-letter {
  color: var(--on-brand);
  background: var(--brand);
  border-color: var(--brand);
}

.quiz-option-copy {
  padding-top: 3px;
}

.quiz-option.is-correct {
  color: var(--ink);
  background: var(--success-soft);
  border-color: color-mix(in oklab, var(--success) 42%, var(--line));
}

.quiz-option.is-correct .quiz-option-letter {
  color: var(--on-brand);
  background: var(--success);
  border-color: var(--success);
}

.quiz-option.is-wrong {
  color: var(--warning-ink);
  background: var(--warning-soft);
  border-color: var(--warning-line);
}

.quiz-option.is-wrong .quiz-option-letter {
  color: var(--warning-ink);
  border-color: var(--warning-line);
}

.quiz-option.is-muted {
  opacity: 0.62;
}

.quiz-explanation {
  padding: 10px 12px;
  margin: 10px 0 0;
  font-size: 0.86rem;
  line-height: 1.6;
  color: var(--muted);
  background: var(--surface);
  border-left: 3px solid var(--line-strong);
  border-radius: 0 8px 8px 0;
}

.quiz-explanation strong {
  color: var(--ink);
}

.quiz-actions,
.quiz-result {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding-top: 2px;
}

.quiz-actions > span {
  font-size: 0.84rem;
  color: var(--muted);
}

.quiz-result {
  padding: 18px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 15px;
}

.quiz-result[data-passed='true'] {
  background: var(--success-soft);
  border-color: color-mix(in oklab, var(--success) 32%, var(--line));
}

.quiz-result[data-passed='false'] {
  background: var(--warning-soft);
  border-color: var(--warning-line);
}

.quiz-result-copy {
  display: grid;
  gap: 2px;
}

.quiz-result-score {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 750;
  line-height: 1.1;
  color: var(--ink);
}

.quiz-result-copy strong {
  font-size: 0.94rem;
}

.quiz-result-copy p {
  margin: 2px 0 0;
  font-size: 0.86rem;
  color: var(--muted);
}

.quiz-empty {
  margin: 18px 0 0;
  font-size: 0.94rem;
  color: var(--muted);
}

@media (max-width: 680px) {
  .quiz-runner {
    padding: 20px;
  }

  .quiz-head,
  .quiz-actions,
  .quiz-result {
    display: block;
  }

  .quiz-meta {
    justify-content: flex-start;
    margin-top: 10px;
  }

  .quiz-actions .learning-button,
  .quiz-result .learning-button {
    width: 100%;
    margin-top: 12px;
  }

  .quiz-question {
    padding: 14px;
  }
}
</style>
