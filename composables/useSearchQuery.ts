import { computed, type Ref } from 'vue';
import type { SearchKind } from './useSearchIndex';

export type SortMode = 'relevance' | 'newest' | 'oldest';

const KIND_VALUES: SearchKind[] = ['article', 'project', 'opensource', 'page'];
const SORT_VALUES: SortMode[] = ['relevance', 'newest', 'oldest'];
const OPERATORS = ['is', 'tag', 'sort', 'from', 'to'] as const;
type Operator = (typeof OPERATORS)[number];

export interface ParsedQuery {
  text: string;
  kinds: Set<SearchKind>;
  tags: Set<string>;
  sort?: SortMode;
  from?: string;
  to?: string;
}

export interface TokenSuggestion {
  insert: string;
  label: string;
  hint?: string;
}

function tokenize(input: string): string[] {
  return input.match(/\S+/g) ?? [];
}

export function parseSearchQuery(input: string): ParsedQuery {
  const parsed: ParsedQuery = {
    text: '',
    kinds: new Set(),
    tags: new Set(),
  };
  const words: string[] = [];

  for (const token of tokenize(input)) {
    const m = token.match(/^([a-z]+):(.+)$/i);
    if (!m) {
      words.push(token);
      continue;
    }
    const op = m[1]!.toLowerCase() as Operator;
    const value = m[2]!;
    if (op === 'is' && KIND_VALUES.includes(value as SearchKind)) {
      parsed.kinds.add(value as SearchKind);
    } else if (op === 'tag') {
      parsed.tags.add(value);
    } else if (op === 'sort' && SORT_VALUES.includes(value as SortMode)) {
      parsed.sort = value as SortMode;
    } else if (op === 'from' && /^\d{4}(-\d{2})?$/.test(value)) {
      parsed.from = value.length === 4 ? `${value}-01` : value;
    } else if (op === 'to' && /^\d{4}(-\d{2})?$/.test(value)) {
      parsed.to = value.length === 4 ? `${value}-12` : value;
    } else {
      words.push(token);
    }
  }

  parsed.text = words.join(' ');
  return parsed;
}

interface SuggestionContext {
  allTags: string[];
}

export function useSearchQuery(input: Ref<string>, ctx: SuggestionContext) {
  const parsed = computed(() => parseSearchQuery(input.value));

  const currentTokenAt = (caret: number) => {
    const before = input.value.slice(0, caret);
    const match = before.match(/(\S+)$/);
    if (!match) return { token: '', start: caret };
    return { token: match[1]!, start: caret - match[1]!.length };
  };

  /**
   * Given the current trailing token, return the ghost-text tail that
   * would complete it. Priority: operator name (e.g. `is` → `:`), then
   * value (e.g. `is:pro` → `ject`). Returns '' when nothing to add.
   */
  function completeToken(token: string): string {
    if (!token) return '';
    if (!token.includes(':')) {
      const lower = token.toLowerCase();
      const op = OPERATORS.find((o) => o.startsWith(lower) && o !== lower);
      return op ? `${op.slice(token.length)}:` : '';
    }
    const [rawOp, ...rest] = token.split(':');
    const op = (rawOp ?? '').toLowerCase();
    const value = rest.join(':');
    const lower = value.toLowerCase();
    let candidates: string[] = [];
    if (op === 'is') candidates = KIND_VALUES;
    else if (op === 'sort') candidates = SORT_VALUES;
    else if (op === 'tag') candidates = ctx.allTags;
    else return '';
    const match = candidates.find(
      (c) => c.toLowerCase().startsWith(lower) && c.toLowerCase() !== lower
    );
    return match ? match.slice(value.length) : '';
  }

  function suggestionsFor(token: string): TokenSuggestion[] {
    if (!token) return [];
    const [rawOp, ...rest] = token.split(':');
    const op = rawOp?.toLowerCase() ?? '';
    const valuePrefix = rest.join(':');
    const has = token.includes(':');

    if (!has) {
      return OPERATORS.filter((o) => o.startsWith(op)).map((o) => ({
        insert: `${o}:`,
        label: `${o}:`,
        hint: hintFor(o),
      }));
    }
    if (op === 'is') {
      return KIND_VALUES.filter((k) => k.startsWith(valuePrefix.toLowerCase())).map((k) => ({
        insert: `is:${k}`,
        label: `is:${k}`,
      }));
    }
    if (op === 'sort') {
      return SORT_VALUES.filter((s) => s.startsWith(valuePrefix.toLowerCase())).map((s) => ({
        insert: `sort:${s}`,
        label: `sort:${s}`,
      }));
    }
    if (op === 'tag') {
      const q = valuePrefix.toLowerCase();
      return ctx.allTags
        .filter((t) => t.toLowerCase().includes(q))
        .slice(0, 8)
        .map((t) => ({ insert: `tag:${t}`, label: `tag:${t}` }));
    }
    return [];
  }

  function hintFor(op: string): string {
    switch (op) {
      case 'is':
        return 'article | project | opensource | page';
      case 'tag':
        return 'e.g. tag:Nuxt';
      case 'sort':
        return 'relevance | newest | oldest';
      case 'from':
      case 'to':
        return 'YYYY-MM';
      default:
        return '';
    }
  }

  return { parsed, currentTokenAt, suggestionsFor, completeToken };
}
