import { computed, type Ref } from 'vue';
import type { SearchResult } from './useSearchIndex';

export function useSearchAutocomplete(query: Ref<string>, results: Ref<SearchResult[]>) {
  const top = computed<SearchResult | null>(() => results.value[0] ?? null);

  const completion = computed(() => {
    const q = query.value;
    if (!q || !top.value) return '';
    const title = top.value.title;
    if (title.toLowerCase().startsWith(q.toLowerCase()) && title.length > q.length) {
      return title.slice(q.length);
    }
    return '';
  });

  return { top, completion };
}
