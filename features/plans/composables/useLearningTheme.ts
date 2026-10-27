import { computed } from 'vue';
import { usePreferredDark, useStorage } from '@vueuse/core';

export type LearningTheme = 'light' | 'dark';

const THEME_KEY = 'learning-paths-theme-v1';

export const useLearningTheme = () => {
  const prefersDark = usePreferredDark();
  const storedTheme = useStorage<LearningTheme | null>(THEME_KEY, null, undefined, {
    initOnMounted: true,
  });

  const theme = computed<LearningTheme>(
    () => storedTheme.value ?? (prefersDark.value ? 'dark' : 'light')
  );

  const isDark = computed(() => theme.value === 'dark');

  const toggleTheme = () => {
    storedTheme.value = theme.value === 'dark' ? 'light' : 'dark';
  };

  return {
    isDark,
    theme,
    toggleTheme,
  };
};
