---
title: Mastering dynamic data tables with the IColumn class
description: A small utility class that turns table columns into reusable, dynamic, sortable building blocks.
date: 2024-12-04
---

Building scalable and reusable table components is a common challenge. Every table wants slightly different headers, cells, props, and sorting rules — and before long the component that was supposed to save you time has grown a new prop for each new screen.

The `IColumn` class is my attempt at a different approach: describe each column as an object, let the table component render it. The configuration moves out of the table and into plain data, which is much easier to generate, reuse, and test.

## Key features

- **Customizable headers and rows.** Any Vue component can render a header or a cell, with props and events wired in.
- **Flexible props and events.** Pass a static object, or a function that receives the row and returns one.
- **Built-in sorting.** Strings and numbers work out of the box; supply a `sorter` for anything else.
- **Special column types.** `default` for normal data, `actions` for row buttons at the end, `selection` for checkboxes at the start.

## Options

| Property | Type | Description |
| --- | --- | --- |
| `title` | `string \| function` | Column header text |
| `rowKey` | `string \| function` | Data property key for the row |
| `props` | `Object \| function` | Component props (static or dynamic) |
| `rowComponent` | `Object \| undefined` | Cell rendering component |
| `headerComponent` | `Object \| undefined` | Header rendering component |
| `type` | `'default' \| 'actions' \| 'selection'` | Column behavior type |
| `disabled` | `boolean \| function` | Disables column functionality |
| `sortable` | `boolean` | Enables column sorting |
| `sorter` | `function` | Custom comparison function |
| `sortValue` | `Object \| undefined` | Tracks sorting state |

## The constructor

The constructor pulls the options apart, fills in sensible defaults, and normalizes `props` and `events` so the table never has to care whether they were static or functions.

```javascript
export class IColumn {
  constructor(options) {
    const {
      title,
      rowKey,
      type = 'default',
      sortable = false,
      sorter = undefined,
      headerComponent = undefined,
      rowComponent = undefined,
      disabled = false,
      ...extras
    } = options;

    this.title = title;
    this.rowKey = rowKey;
    this.type = type;
    this.sortable = sortable;
    this.sorter =
      sorter || ((row1, row2) => row1[this.rowKey] > row2[this.rowKey]);
    this.headerComponent = this.processComponent(headerComponent);
    this.rowComponent = this.processComponent(rowComponent);
    this.disabled = disabled;
    this.extras = extras;
  }

  processComponent(component) {
    if (!component) return undefined;
    return {
      is: component.is || '',
      props:
        typeof component.props === 'function'
          ? component.props
          : () => component.props,
      events:
        typeof component.events === 'function'
          ? component.events
          : () => component.events,
    };
  }
}
```

## Why bother?

Because column definitions become data, you get three things for free:

- Dynamic behavior per row without branching inside the table.
- A single place to reason about rendering and interactivity.
- Cross-cutting features — sorting, actions, selection — that slot in once and work everywhere.

That's the whole idea: treat each column as a structured, dynamic, reusable object, and let the table stay boring.

Originally published on [LinkedIn](https://www.linkedin.com/pulse/mastering-dynamic-data-tables-icolumn-class-ali-abdelbaqy-dzytc/).
