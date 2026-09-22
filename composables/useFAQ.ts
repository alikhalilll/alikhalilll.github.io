export const useFAQ = () => {
  const { t } = useI18n();
  const tmArray = useTmArray();

  const categories = computed(() => {
    const cats = ['general', 'work', 'process'] as const;
    return cats.map((key) => {
      const questions = tmArray(`home.faq.${key}.questions`);
      const answers = tmArray(`home.faq.${key}.answers`);
      return {
        key,
        label: t(`home.faq.${key}.label`),
        items: questions.map((q, i) => ({ q, a: answers[i] ?? '' })),
      };
    });
  });

  return { categories };
};
