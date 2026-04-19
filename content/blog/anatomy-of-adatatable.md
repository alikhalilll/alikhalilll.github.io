---
title: Anatomy of ADataTable — a typed generic Vue data table
description: A typed generic Vue data table with schema-shaped columns, Map-keyed selection, markRaw per-row actions, and a three-click sort cycle. A full tour.
date: 2026-04-19
updatedAt: 2026-04-19
keywords:
  - Vue 3 data table
  - TypeScript generic component
  - markRaw
  - shallowRef
  - row selection
  - column sorting
  - dot-path resolution
  - debouncedWatch
  - UI component
  - Nuxt
---

I've written the same data table three times. Once as a ball of JSX, once as a class-based configuration object called `IColumn`, and once — the one that stuck — as a typed generic Vue component with a schema-shaped column type. The third time, it finally stopped being the thing I dreaded touching.

This post is a tour of the current shape. It lives in my UI package as `ADataTable`, and the interesting thing about it is not any single trick — it's that the component has stopped growing. Every feature request for the last year has fit into the existing abstractions without a new prop. That's the version of "done" I was aiming for.

I'll walk the files in roughly the order the request flows through them, pausing on the bits worth explaining.

## From `IColumn` class to typed interface

Two years ago I had a class:

```javascript
export class IColumn {
  constructor(options) {
    const { title, rowKey, type = 'default', sortable = false, /* ... */ } = options;
    this.title = title;
    this.rowKey = rowKey;
    this.sorter = sorter || ((a, b) => a[this.rowKey] > b[this.rowKey]);
    this.headerComponent = this.processComponent(headerComponent);
    this.rowComponent = this.processComponent(rowComponent);
    // ...
  }

  processComponent(component) {
    if (!component) return undefined;
    return {
      is: component.is || '',
      props: typeof component.props === 'function' ? component.props : () => component.props,
      events: typeof component.events === 'function' ? component.events : () => component.events,
    };
  }
}
```

The class normalized props and events — if you passed a static object, it got wrapped in `() => object` so the table could always call it as a function. It was tidy on paper, and fine in JavaScript. The trouble started when TypeScript came in: generic row types didn't flow through a runtime class cleanly, and consumers lost type inference at exactly the spot where they were trying to reach into `row.user.name`.

The current shape is a plain typed interface:

```typescript
export interface IDataTableColumn<T = unknown> {
  title: string | IDataTableRowFunction<T>;
  key: string | IDataTableRowFunction<T>;
  props?: Record<string, unknown> | IDataTableRowFunction<T>;
  type?: 'default' | 'actions' | 'selection';
  disabled?: boolean | IDataTableRowFunction<T>;

  headRender?: () => Array<IDataTableVNodeChild> | IDataTableVNodeChild;
  bodyRender?: IDataTableRenderFunction<T>;

  sortable?: boolean;
  sorter?: (row1: T, row2: T) => number;
  sortValue?: ISortValue;
  extras?: Record<string, unknown> | IDataTableRowFunction<T>;
}
```

Three things changed, and all three mattered.

First, no class. A column is just a plain object. TypeScript narrows it, editors autocomplete it, it serializes cleanly if you ever want to drive the table from JSON. The normalization the class used to do at construction time moved to a tiny helper in the renderer (`handleProps`, which we'll hit in a minute) — the cost is one branch per cell render instead of one branch per column _definition_, and the benefit is the column stays a value, not a runtime object.

Second, the column is generic over `T`. `IDataTableColumn<User>` means `key` typed as `string | (row: User) => ...`, which flows into every downstream callback. The day I added this, three call-sites at work silently picked up type errors for columns that had been quietly broken.

Third, render responsibilities split cleanly. `headRender` is for the header cell only, `bodyRender` for the body cell. The class version had a single `rowComponent` that did both and branched internally — which meant "custom header, default body" required an undocumented combination of nullish fields.

None of this is a new idea. The move from runtime classes to schema-shaped types is the story of most UI codebases in the last five years. The only reason it's worth mentioning is that I wrote the class version _first_ and kept shipping it long after the typed version would have been cheaper. The cost of switching wasn't the refactor; it was admitting that the first design had run out.

## The render trio: `ATHead`, `ATBody`, `ATCell`

The table component does not render rows directly. It renders a `<thead>`, a `<tbody>`, and those render `<tr>` elements that render `<ATCell>` components. The split is tight enough that each file has one job.

`ATHead.vue` is the simplest:

```vue
<template>
  <thead>
    <tr>
      <ATCell
        v-for="(column, collIndex) in props.columns"
        :key="collIndex"
        :binder="column.props"
        :cell="column"
        :head="true"
        :record="{} as S"
        :row-index="collIndex"
        @update-sorter="emit('updateSorter', collIndex)"
      />
    </tr>
  </thead>
</template>
```

One `<tr>`. One `<ATCell>` per column, with `head={true}`. The `record` is a synthetic empty object cast to `S` — the header doesn't have a row, but `ATCell` is generic over it, so something has to fill the slot. Casting `{} as S` is the least-bad option; giving it an actual `undefined` would force every cell render to null-check.

`ATBody.vue` is the same shape, one level up:

```vue
<tbody>
  <tr v-for="(dataItem, $index) in props.items" :key="$index + '_dataItem'">
    <ATCell
      v-for="(column, collIndex) in props.columns"
      :key="collIndex + '_dataItem_' + $index"
      :record="dataItem"
      :head="false"
      :row-index="$index"
      :cell="column"
      :binder="column.props"
    />
  </tr>
  <slot />
</tbody>
```

The composed keys (`$index + '_dataItem'`, `collIndex + '_dataItem_' + $index`) aren't paranoia — Vue's reconciler only cares about keys being unique _within their parent list_, so the `$index` alone would be enough. But when I'm scrolling through Vue DevTools trying to figure out which row is which, having the key say "`3_dataItem`" instead of just "`3`" saves me a second. That's the only reason for the suffix.

The `<slot />` inside `<tbody>` is where the no-data row lands — the outer component pipes `<tr><td>...</td></tr>` through it. Keeping the empty-state as a slotted row rather than a separate element means `colspan` math works against the same `<tr>` grid, and the border-collapsing styles don't break.

The real work happens in `ATCell.vue`.

## `ATCell`: one component, two shapes, built via `h()`

`ATCell` renders either a `<th>` or a `<td>`, depending on `head`. Rather than writing two templates, it builds the vnode dynamically:

```typescript
const Cell = computed(() => {
  return h(
    props.head ? 'th' : 'td',
    {
      class: 'p-[16px] text-md gap-2 relative',
      colspan: '1',
      rowspan: '1',
      ...handleProps<T>(props.cell.props, props.record),
      ...handleProps<T>(props.binder, props.record),
    },
    h('div', { class: 'flex items-center gap-2 w-full' },
      props.head
        ? props.cell.sortable
          ? [children(props.cell, props.record), sortButton(props.cell.sortValue?.applied)]
          : children(props.cell, props.record)
        : children(props.cell, props.record)
    )
  );
});
```

Then the template just mounts the computed vnode:

```vue
<template>
  <component :is="Cell" :key="props.cell.sortValue?.applied || 'ATCell'" />
</template>
```

Two things are doing quiet work here.

`handleProps` accepts either a plain object or a function of the row and always returns an object:

```typescript
const handleProps = <T,>(val: IDataTableColumn<T>['props'], record: T) => {
  if (!val) return {};
  return typeof val === 'function' ? val(record) : val;
};
```

That's the "always callable" contract the old `IColumn` class enforced at construction — moved to the render path, where it's cheaper in the common case (static props don't get wrapped unnecessarily) and still gives consumers the choice.

The spread order matters: `props.cell.props` is spread first, `props.binder` second. `binder` is the same as `cell.props` — it's passed in via a separate prop for historical reasons I'd collapse if I rewrote this. Until then, `binder` wins on conflict, which is what callers expect.

### The `:key="sortValue?.applied"` that looks like a typo

The second thing is that odd `:key="props.cell.sortValue?.applied || 'ATCell'"`. The component's `<component :is>` reacts to changes in the vnode, but the `:key` looks like it's there to force a remount when the sort state flips. That's exactly what it's for. Vue's patching is smart enough to diff two `h()` outputs, but if the cell's props came from a function of the record _and_ the record changed at the same time the sort flipped, the patcher can sometimes hold onto a stale attribute. Keying by sort state forces a clean unmount/remount on exactly the transition where that can matter. It's one line. Removing it hasn't bitten me yet — which either means it's over-cautious, or it's quietly preventing the bug. I'm not sure, and I've stopped trying to prove it either way. The cost of the key is a single render per sort toggle.

## `handleValueBasedOnKey`: dot-paths into rows

When a column doesn't supply `headRender` or `bodyRender`, the cell falls back to a default renderer:

```typescript
const children = (cell: IDataTableColumn<T>, record: T) => {
  const defaultHeadCell = h('span', {
    class: 'text-[16px] text-secondary font-medium capitalize',
    innerHTML: typeof cell.title === 'function' ? cell.title(record) : cell.title,
  });
  const defaultBodyCell = h('span', {
    class: 'text-[16px] text-foreground capitalize',
    innerHTML: handleValueBasedOnKey(cell.key as string, record),
  });
  if (props.head) {
    return cell.headRender ? cell.headRender() : defaultHeadCell;
  }
  return cell.bodyRender ? cell.bodyRender(record, props.rowIndex) : defaultBodyCell;
};
```

The piece worth zooming in on is `handleValueBasedOnKey`:

```typescript
const handleValueBasedOnKey = (key: string, receivedData: T): unknown => {
  return key.split('.').reduce((acc: unknown, curr) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[curr];
    }
    return undefined;
  }, receivedData);
};
```

A column with `key: 'user.profile.displayName'` walks the dots and pulls the nested value. This is the single feature that stops consumers from writing a `bodyRender` function 80% of the time. Most tables have three or four columns that are just `row.foo.bar`; giving them a dot-path means the schema-as-data approach wins one more round.

I'm using `innerHTML` for the default renderer. That's deliberate for titles that want to include `<br>` or a small bit of emphasis — and it's a footgun for user-controlled data. The convention I ended up with in code review is "use the default for static titles and sanitized data; for anything user-generated, write a `bodyRender` that uses a child component." I haven't found a cleaner way to express that in the type system, and I'm not sure I want to force everyone through `bodyRender` for every cell.

## Row keys: the fallback when nobody supplies one

The default Vue `:key` on rows is `$index`, which is the wrong answer for anything that changes order. To do better you need a stable identifier per row, and since the table is generic over `T`, there's no field you can rely on universally.

The interface is the obvious one:

```typescript
type DataTablePropsWithKey<T> = IDataTableProps<T> & {
  /** Optional stable key extractor; recommended */
  rowKey?: (row: T) => string;
};
```

In practice, nobody passes it. The fallback had to work for arbitrary rows:

```typescript
function stableKeyFromObject(obj: Record<string, unknown>): string {
  if ('id' in obj && typeof obj.id !== 'undefined') {
    return String(obj.id as unknown);
  }
  const keys = Object.keys(obj).sort();
  return keys
    .map((k) => `${k}:${String(obj[k])}`)
    .join('|');
}

function getRowKey(row: T): string {
  if (typeof globalProps.rowKey === 'function') return globalProps.rowKey(row);
  return stableKeyFromObject(row as unknown as Record<string, unknown>);
}
```

Three small calls, each earning its weight:

- **`id` shortcut first.** Most backend records have one. `String(obj.id)` handles numbers, strings, and BigInts without branching. The cast is dishonest in the type system and honest at runtime.
- **Sort the keys before hashing.** `Object.keys()` returns insertion order. For most objects that order is the same every time, but "most" isn't "all" — an object rebuilt from `JSON.parse` won't necessarily agree with one built from an object literal with the same keys. Sorting kills the whole class.
- **`String()` over `JSON.stringify`.** `String()` never throws; `JSON.stringify` throws on circular references (which happen when you're careless with Pinia). The goal is a key that's stable, not a serializer.

The key is used both for Vue's reconciliation _and_ for selection. That's the invariant that matters. If the two used different notions of identity — `:key="i"` and selection using `===` — a sort could drop checkboxes while keeping the data. Using `getRowKey` in both places means they can't drift.

## Selection as a `Map<string, T>`

There's no separate selection state. The component holds `localSelectedItems` (a `shallowRef<T[]>`) and derives a Map by key:

```typescript
const hashedSelectedItems = computed(() => {
  const map = new Map<string, T>();
  localSelectedItems.value.forEach((x) => map.set(getRowKey(x), x));
  return map;
});
```

The selection column's header checkbox checks "are all items selected" with one array-scan:

```typescript
const isAllDataSelected = computed(() => {
  const atData = localItems.value.filter((item) =>
    hashedSelectedItems.value.has(getRowKey(item))
  );
  return atData.length === localItems.value.length && localItems.value.length > 0;
});
```

O(n) across the visible items — which is already O(n) to render. Nothing we can do to improve that. But per-row selection checks are O(1):

```typescript
modelValue: hashedSelectedItems.value.has(getRowKey(rowData)),
```

Without the computed Map, each checkbox would do `localSelectedItems.value.find(...)` on render. A 100-row table with 100 selected items would be doing 10,000 comparisons per re-render. The Map turns that into 100 constant-time lookups. You only notice this once you've blown up a table with real data, at which point you learn the pattern and stop writing the naïve version.

The selection column itself is built on demand. The consumer either declares it as a column (`type: 'selection'`) or doesn't:

```typescript
if (hasSelectColumn) {
  const selectionColumn = handleSelectionColumn();
  _columns = _columns.filter((col) => col.type !== 'selection');
  _columns.unshift(selectionColumn);
}
```

The existing `type: 'selection'` column, if any, is replaced with the internally-built one and forced to position 0. The consumer's instance is a _marker_ — "I want selection in this table" — and the component writes the actual renderers. This gives consumers the API surface of "selection is a column" without requiring them to know how to build checkboxes and wire up the `indeterminate` state.

## Actions, and the `markRaw` that earned its keep

Actions work the same way: the consumer declares an actions column (or the component auto-appends one if `actions.length > 0`), and the renderer is built internally:

```typescript
const actionsComponent: IDataTableRenderFunction<T> = (rowData, index) =>
  h(markRaw(AActionGroup), {
    actions: localActions.value as IAction<unknown>[],
    record: rowData,
    popover: globalProps.popover,
    maxMainCount: getVisibleLength(rowData),
    onUpdateAction: (action) =>
      emit('updateAction', { action, row: rowData, rowIndex: index }),
  });
```

`markRaw(AActionGroup)` is the line I want to isolate.

When you pass a component definition to `h()`, Vue touches it during render. Without `markRaw`, if that component definition ever passes through Vue's reactivity system — a `ref`, a `reactive`, a prop — it gets wrapped in a Proxy. Component definitions aren't meant to be reactive. They're static metadata. Wrapping them doesn't break anything; it just makes every property read go through a handler that does a reactivity-tracking check that never pays off.

The render function above runs once per row. For a table with 500 rows, the first render touches `AActionGroup`'s definition 500 times. `markRaw` sets a `__v_skip` flag on the object once, and every subsequent render skips the Proxy path.

The cost of `markRaw` is permanent — you can't un-mark it. That's fine for a component definition: it's a static import. If you wanted to hot-swap the action component at runtime, you'd do that at a different layer (picking _which_ component you pass to `markRaw`), not by making the reference reactive.

There's also a dev-mode warning — "Vue received a Component that was made a reactive object" — that fires when a reactive component slips into `h()`. I hit that on a 1200-row table where `AActionGroup` was passed through a `shallowRef` for theming. Adding `markRaw` silenced it and dropped the first-paint time noticeably.

The visible-action count can be either a number or a function of the row:

```typescript
const getVisibleLength = (rowData: T) =>
  typeof globalProps.visibleActionLength === 'function'
    ? globalProps.visibleActionLength(rowData)
    : globalProps.visibleActionLength;
```

Which is the only way to do "show 3 actions for admins, 1 for regular users" without building a second actions column.

## Sorting: a three-click cycle, local or remote

Sort state is a two-boolean object:

```typescript
export type ISortValue = { applied: boolean; revert: boolean };
```

Not `'asc' | 'desc' | null`. I tried strings first; they kept losing the "unapplied" state because falsy values of the wrong type don't coexist gracefully with strict TypeScript.

The toggle cycles through three states:

```typescript
function handleToggleSortButton(sorterValue: ISortValue): ISortValue {
  if (!sorterValue.applied) {
    sorterValue.applied = true;
  } else if (!sorterValue.revert) {
    sorterValue.revert = true;
  } else {
    sorterValue.applied = false;
    sorterValue.revert = false;
  }
  return sorterValue;
}
```

Click once: ascending. Click again: descending. Click a third time: back to the original order. Users expect this on every table they've ever used, and they're always surprised when a table _doesn't_ have the "unsort" click.

The actual sorting has two paths: remote and local.

```typescript
function sortCell(columnIndex: number) {
  const column = localColumns.value[columnIndex]!;
  const sorterFunction = column.sorter;
  const sorterValue = handleToggleSortButton(column.sortValue!);

  if (globalProps.remote) {
    emit('updateSorter', { column, sorterValue, rowIndex: columnIndex });
    return;
  }

  if (!sorterValue.applied && !sorterValue.revert) {
    localItems.value = _.cloneDeep(globalProps.items);
    emit('updateSorter', { column, sorterValue, rowIndex: columnIndex });
    return;
  }

  localItems.value = [...localItems.value].sort((a, b) => {
    const result = sorterFunction!(a, b);
    return sorterValue.revert ? -result : result;
  });
  emit('updateSorter', { column, sorterValue, rowIndex: columnIndex });
}
```

Remote mode emits and lets the parent handle pagination + sorting against the backend. Local mode runs the sorter in-memory, with one quirk: when the user returns to the "unsorted" state, the local items get re-cloned from `globalProps.items`. That restores original order without needing to remember what it was.

The emit fires in all three cases. Remote backends need it to refetch; local consumers can use it to persist the user's sort choice to a URL query param. Emitting unconditionally is cheaper than branching, and consumers can ignore it.

## Reactivity: `shallowRef`, `cloneDeep`, `debouncedWatch`

The component does not deep-watch the consumer's data. `localItems`, `localColumns`, `localActions`, and `localSelectedItems` are all `shallowRef`:

```typescript
const localItems = shallowRef<T[]>(_.cloneDeep(globalProps.items));
const localColumns = shallowRef<IDataTableColumn<T>[]>([]);
const localActions = shallowRef<IAction<T>[]>(_.cloneDeep(globalProps.actions));
const localSelectedItems = shallowRef<T[]>(_.cloneDeep(globalProps.selectedItems));
```

A `ref` wraps arrays in a reactive proxy that tracks every mutation. For a 1000-row table, that's 1000 proxies (and however many nested proxies per row). Most of it is overhead — the component only ever reassigns `.value` wholesale, never mutates individual rows in place. `shallowRef` says "track when the reference changes, don't recurse." Which is exactly the contract the component needs.

The cloning is the second half of that story. `_.cloneDeep(globalProps.items)` snapshots the parent's data at assignment time; the table operates on its copy. This matters for sort: when the user sorts, the table mutates its `localItems` without affecting the parent's array. Skipping the clone would turn a visual sort into a mutation on the parent's state — which is where the worst class of "the server-side export didn't match what was on screen" bugs come from.

Re-watching uses `debouncedWatch`:

```typescript
debouncedWatch(
  () => globalProps.items,
  () => (localItems.value = _.cloneDeep(globalProps.items)),
  { deep: true, debounce: 100 }
);

debouncedWatch(
  () => globalProps.selectedItems,
  () => (localSelectedItems.value = _.cloneDeep(globalProps.selectedItems)),
  { deep: true, immediate: true, debounce: 50 }
);
```

Why debounce? Because parent state often thrashes. A filter change at the parent level can trigger three re-renders in quick succession — form update, query string update, fetched response replacing the placeholder. Without a debounce, the table would clone its items three times in a single frame. 100ms for items and 50ms for selection are numbers I landed on by eyeballing the production behavior; they're not hallowed. If I had the appetite I'd make them props.

The columns/actions watcher is _not_ debounced:

```typescript
localColumns.value = handleColumns();
watch(
  () => [globalProps.columns, globalProps.actions],
  () => {
    localActions.value = _.cloneDeep(globalProps.actions);
    localColumns.value = handleColumns();
  },
  { deep: true, immediate: true }
);
```

Column and action changes are rare — usually they're declared once at the top of a `<script setup>` and never touched again. A debounce would introduce perceptible lag for the uncommon case where they do change (e.g. an admin toggling a column visibility). The asymmetry — debounce items, don't debounce columns — maps to how consumers actually use the component.

## Loading, empty, paginated — the surrounding chrome

The surrounding chrome is a small story that nobody writes down.

The loading state is an absolutely-positioned overlay with `pointer-events-none`:

```vue
<div
  v-if="globalProps.loading"
  class="bg-white/70 flex pointer-events-none items-center inset-0 justify-center absolute z-10 backdrop-blur-[1px]"
>
  <LoadingComp />
</div>
```

`pointer-events-none` is the detail. Without it, the overlay intercepts clicks on the rows underneath — even though it's visually translucent, the user can't interact with the blurred table. The intent is "show that something's happening, don't block the user from selecting a row they can still see." The overlay is just a hint.

The empty state is a row inside the table, not a sibling:

```vue
<ATBody :columns="localColumns" :items="localItems">
  <tr v-if="localItems.length === 0 && !globalProps.loading">
    <td :colspan="localColumns.length" class="p-4">
      <NoData :title="globalProps.noDataTitle" />
    </td>
  </tr>
</ATBody>
```

Piping it through the `<tbody>`'s slot is how it inherits the table's border and spacing. A sibling `<div>` would need separate styles to line up; a `<tr colspan>` gets layout for free.

Pagination is optional and driven by the `pagination` prop:

```vue
<div v-if="globalProps.pagination && !globalProps.loading">
  <APagination
    :model-value="globalProps.pagination.modelValue"
    :page-size="globalProps.pagination.pageSize"
    :total-items="globalProps.pagination.totalItems"
    @update:page-size="globalProps.pagination.onPageSizeChange"
    @update:model-value="globalProps.pagination.onUpdateCurrentPage"
  />
</div>
```

Two things worth flagging. The pagination component is hidden during loading — without this, a page-size dropdown would be active during fetch, and a second rapid click could fire a second page request. And the callbacks are passed inside the `pagination` object as fields (`onPageSizeChange`, `onUpdateCurrentPage`) rather than as separate props. I'm not sure that was the right call; emitting would have been more idiomatic Vue. But it keeps the "pagination is a single config blob" story clean.

## What I'd change on a fourth rewrite

A few places where today's code isn't the version I'd write fresh:

- **The `binder` vs `cell.props` duplication in `ATCell`.** Two separate props pointing at the same data. Collapsing to one prop would remove one spread and one branch. I left it because old call-sites depend on the name.
- **`innerHTML` for default cells.** The footgun is real, the ergonomics are worth it. If I did it over I'd either go `textContent` by default and make HTML opt-in via a column field (`unsafe: true`), or commit fully to a slot-based approach. Both are refactors; neither is urgent.
- **The `{} as S` cast in the header.** Works, but an optional `record?: S` on `ATCell` would be more honest — headers don't have a record, say so in the type.
- **The hardcoded debounce values (50ms, 100ms).** Should be props. Three minutes of work; I keep not doing it.
- **The computed `Cell` paired with `<component :is>` keyed on sort state.** Still squinting at this one. Either the key is unnecessary (delete it and watch what happens) or it's hiding a timing bug in the patcher I should reproduce. I owe the code base that investigation.

None of those are the reason I'd recommend this pattern. The reason is smaller and duller: the column-as-data schema, the `shallowRef` + clone + debounce rhythm, the Map-keyed selection, the `markRaw` on the per-row component. Each of them is the kind of thing you write the second time, after the first version has bitten you once. Which is the whole story of `ADataTable` — the shape it landed in is the shape of a thing I stopped rewriting.
