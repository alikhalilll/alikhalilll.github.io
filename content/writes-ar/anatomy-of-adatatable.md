---
title: تشريح ADataTable، جدول بيانات مُعمَّم بأنواع في Vue
description: جولة كاملة في جدول بيانات Vue مُعمَّم بأنواع صارمة، بأعمدة مُعرَّفة كسكيمة، وتحديد صفوف قائم على Map، وأزرار إجراءات لكل صف عبر markRaw، ودورة فرز من ثلاث نقرات.
date: 2026-04-19
updatedAt: 2026-04-19
lang: ar
keywords:
  - جدول بيانات Vue 3
  - مكوّن TypeScript مُعمَّم
  - markRaw
  - shallowRef
  - تحديد الصفوف
  - فرز الأعمدة
  - تحليل مسارات بالنقاط
  - debouncedWatch
  - مكوّن واجهة
  - Nuxt
---

كتبتُ جدول البيانات نفسه ثلاث مرات. مرةً على هيئة كتلة JSX، ومرةً على شكل كائن إعدادات مبني على class اسمه `IColumn`، والمرة الثالثة، وهي التي بقيت، مكوّن Vue مُعمَّم ومكتوب بأنواع، مع نوع عمود على هيئة سكيمة. في تلك المرة الثالثة تحديدًا، توقّف الجدول عن أن يكون الشيء الذي أخاف من الاقتراب منه.

هذه التدوينة جولة في شكله الحالي. أضعه في حزمة الـ UI الخاصة بي باسم `ADataTable`، والمثير فيه ليس حيلة بعينها، بل أن المكوّن كفّ عن التضخم. كل طلب ميزة على مدار السنة الأخيرة استوعبته التجريدات الموجودة أصلًا، دون أن أضيف ولو prop جديد. هذه هي صيغة "الاكتمال" التي كنتُ أطاردها.

سأمرّ على الملفات بترتيب قريب من ترتيب تدفّق الطلب داخلها، متوقفًا عند ما يستحق الشرح.

## من كلاس `IColumn` إلى interface مكتوب بأنواع

قبل عامين كان لديّ class بهذا الشكل:

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

مهمّة هذا الكلاس كانت توحيد شكل الـ props والـ events. لو مررتَ كائنًا ثابتًا، فإنه يُلفّه داخل `() => object` كي يستطيع الجدول استدعاءه دائمًا كدالة. الفكرة أنيقة على الورق، ومقبولة تمامًا في JavaScript وحده. المشكلة بدأت حين دخل TypeScript إلى الصورة: أنواع الصفوف المُعمَّمة لا تتدفق بنظافة عبر class يعمل وقت التشغيل، والمستهلك يفقد استنتاج الأنواع بالضبط عند اللحظة التي يريد فيها الوصول إلى `row.user.name`.

الشكل الحالي مجرد interface بسيط ومكتوب بأنواع:

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

تغيّرت ثلاثة أشياء، وكل واحد منها ترك أثرًا واضحًا.

أولًا، لا class. العمود صار كائنًا عاديًا. TypeScript يُضيّق نوعه، والمحرر يقدّم autocomplete جاهزًا، ويتسلسل نظيفًا لو أردتُ يومًا أن أُغذّي الجدول من JSON. أما مهمة التوحيد التي كان يتولّاها الكلاس وقت الإنشاء، فقد نقلتُها إلى دالة مساعدة صغيرة في مسار الـ render اسمها `handleProps`، وسنمرّ عليها بعد قليل. الكلفة صارت فرعًا واحدًا لكل render لخلية بدل فرع واحد لكل _تعريف_ عمود، والمكسب أن العمود يظل قيمة لا كائنًا حيًّا وقت التشغيل.

ثانيًا، صار العمود مُعمَّمًا على `T`. حين تكتب `IDataTableColumn<User>`، فإن `key` يتحوّل إلى `string | (row: User) => ...`، وهذا النوع يتدفّق إلى كل callback لاحق. في اليوم الذي أضفتُ فيه هذا التعميم، كشف ثلاثة مواضع استدعاء في العمل أخطاء في أنواع أعمدة كانت مكسورة بصمت.

ثالثًا، انقسمت مسؤوليات الـ render انقسامًا نظيفًا. `headRender` لخلية الرأس فقط، و`bodyRender` لخلية الجسم. نسخة الكلاس كانت تجمع الاثنين في `rowComponent` واحد يتفرّع داخليًا، مما يعني أن حالة "رأس مخصّص وجسم افتراضي" كانت تتطلب توليفة غير موثّقة من الحقول الفارغة.

لا شيء من هذا فكرة جديدة. الانتقال من class يعمل وقت التشغيل إلى نوع على هيئة سكيمة هو قصة معظم مشاريع الـ UI في السنوات الخمس الأخيرة. أذكره فقط لأنني كتبتُ نسخة الكلاس _أولًا_، وواصلتُ إطلاقها لفترة طويلة بعد أن أصبحت نسخة الأنواع أرخص بكثير. تكلفة الانتقال لم تكن في إعادة الكتابة نفسها، بل في الاعتراف بأن التصميم الأول قد استُنفد.

## ثلاثي الـ render: `ATHead` و`ATBody` و`ATCell`

مكوّن الجدول لا يعرض الصفوف بشكل مباشر. هو يعرض `<thead>` و`<tbody>`، وهذان بدورهما يعرضان عناصر `<tr>` التي تُركّب مكوّنات `<ATCell>`. الفصل محكم بحيث يبقى لكل ملف عمل واحد فقط.

`ATHead.vue` هو الأبسط:

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

عنصر `<tr>` واحد، ومكوّن `<ATCell>` واحد لكل عمود مع `head={true}`. أما الـ `record` فهو كائن فارغ اصطناعي مُحوَّل بالنوع إلى `S`. الرأس لا يمتلك صفًا حقيقيًا، لكن `ATCell` مُعمَّم على السجل، فلا بدّ من شيء يشغل هذا الموضع. تحويل `{} as S` هو أقل الخيارات سوءًا. لو مرّرنا `undefined` فعلية، لأجبرنا كل خلية على فحص العدم عند كل render.

`ATBody.vue` يأخذ الشكل نفسه لكن بمستوى واحد أعلى:

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

المفاتيح المركّبة (`$index + '_dataItem'` و`collIndex + '_dataItem_' + $index`) ليست وسواسًا. مُطابِق Vue يهتم فقط بأن يكون المفتاح فريدًا _داخل قائمة الأب_، ولذلك `$index` وحده كافٍ. لكن حين أتصفح Vue DevTools وأحاول أن أعرف أيّ صف هو أيّ، فإن ظهور مفتاح بصيغة `3_dataItem` بدل مجرد `3` يوفّر عليّ ثانية. هذا هو السبب الوحيد للاحقة.

الـ `<slot />` داخل `<tbody>` هو الموضع الذي يحلّ فيه صفّ "لا توجد بيانات". المكوّن الخارجي يمرّر عبره `<tr><td>...</td></tr>`. إبقاء حالة الفراغ صفًّا يمرّ عبر slot، بدل جعله عنصرًا منفصلًا، يعني أن حسابات `colspan` تعمل ضمن شبكة الـ `<tr>` نفسها، وأنماط انطباق الحدود لا تنكسر.

العمل الحقيقي كلّه يجري داخل `ATCell.vue`.

## `ATCell`: مكوّن واحد بشكلَين، مبنيّ عبر `h()`

`ATCell` يعرض إما `<th>` وإما `<td>` بحسب قيمة `head`. بدل كتابة قالبَين، يبني الـ vnode ديناميكيًا:

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

ثم يكتفي القالب بتركيب الـ vnode المحسوب:

```vue
<template>
  <component :is="Cell" :key="props.cell.sortValue?.applied || 'ATCell'" />
</template>
```

هنا شيئان يعملان بهدوء.

`handleProps` يقبل إما كائنًا عاديًا وإما دالة تأخذ الصف، ويُعيد كائنًا دائمًا:

```typescript
const handleProps = <T,>(val: IDataTableColumn<T>['props'], record: T) => {
  if (!val) return {};
  return typeof val === 'function' ? val(record) : val;
};
```

هذا هو نفس عقد "قابل للاستدعاء دائمًا" الذي كان كلاس `IColumn` القديم يفرضه وقت الإنشاء، لكنه انتقل الآن إلى مسار الـ render، حيث يكون أرخص في الحالة الشائعة (لا تُغلَّف الـ props الثابتة بلا داعٍ)، ويترك للمستهلك حرية الاختيار.

ترتيب الـ spread مقصود. `props.cell.props` يُنشر أولًا، ثم `props.binder` بعده. في الواقع، `binder` هو نفسه `cell.props`، ولا يُمرَّر عبر prop منفصل إلا لأسباب تاريخية سأدمجها لو أعدتُ الكتابة. لكن حاليًا يفوز `binder` عند التعارض، وهذا هو ما يتوقعه المستدعون.

### الـ `:key="sortValue?.applied"` الذي يبدو خطأً مطبعيًا

الشيء الثاني هو المفتاح الغريب `:key="props.cell.sortValue?.applied || 'ATCell'"`. الـ `<component :is>` يتفاعل أصلًا مع تغيّر الـ vnode، لكن الـ `:key` هنا موجود لإجبار إعادة تركيب كاملة حين تنقلب حالة الفرز. وهذا بالضبط دوره. آلية التحديث الجزئي في Vue ذكية بما يكفي لعمل diff بين خرجَي `h()`، ولكن حين تأتي props الخلية من دالة على السجل _ويتغيّر_ السجل في اللحظة نفسها التي ينقلب فيها الفرز، فقد يتشبّث `patcher` أحيانًا بسمة قديمة. ربط المفتاح بحالة الفرز يفرض unmount ثم remount نظيفَين عند الانتقال الوحيد الذي قد يهمّ فيه ذلك. سطر واحد فقط. حذفه لم يعضّني حتى الآن، وهذا يعني إما أنه احتياط مضاعف بلا داعٍ، وإما أنه يمنع خطأً بهدوء. لستُ متأكدًا، وقد كففتُ عن محاولة الحسم في أي من الاحتمالين. الكلفة render واحد لكل تبديل فرز.

## `handleValueBasedOnKey`: مسارات بالنقاط داخل الصفوف

حين لا يوفّر العمود لا `headRender` ولا `bodyRender`، تعود الخلية إلى renderer افتراضي:

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

الجزء الذي يستحق التكبير هو `handleValueBasedOnKey`:

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

عمود بمفتاح `key: 'user.profile.displayName'` يسير على النقاط ويسحب القيمة المتشعّبة. هذه الميزة وحدها هي التي تُغني المستهلك عن كتابة دالة `bodyRender` في 80% من الحالات. معظم الجداول لديها ثلاثة أو أربعة أعمدة كل واحد منها ليس أكثر من `row.foo.bar`، ومنحُها مسارًا بالنقاط يجعل نهج "السكيمة كبيانات" يكسب جولة أخرى.

أستخدم `innerHTML` في الـ renderer الافتراضي، وهذا مقصود من أجل العناوين التي تتضمن `<br>` أو قليلًا من التنسيق، وهو في الوقت نفسه فخّ متوقّع مع أي بيانات يتحكم بها المستخدم. الاتفاق الذي استقرّ عليه فريقي في مراجعات الكود هو: استخدم الـ renderer الافتراضي مع العناوين الثابتة والبيانات المُنقّاة، وأما ما يأتي من المستخدم فاكتب له `bodyRender` يمرّر البيانات عبر مكوّن فرعي. لم أجد طريقة أنظف للتعبير عن هذه القاعدة داخل نظام الأنواع، ولستُ متأكدًا أنني أريد أصلًا أن أُجبر الجميع على `bodyRender` لكل خلية.

## مفاتيح الصفوف: البديل حين لا يمرّر أحد مفتاحًا

الـ `:key` الافتراضي في Vue على الصفوف هو `$index`، وهو إجابة خاطئة تمامًا لأي شيء يتغير ترتيبه. لتفعل أفضل من ذلك، تحتاج معرّفًا مستقرًّا لكل صف، وبما أن الجدول مُعمَّم على `T`، فلا يوجد حقل يمكنك الاعتماد عليه في كل الحالات.

الـ interface واضح:

```typescript
type DataTablePropsWithKey<T> = IDataTableProps<T> & {
  /** Optional stable key extractor; recommended */
  rowKey?: (row: T) => string;
};
```

لكن عمليًا، لا أحد يمرّره. لذلك كان لا بدّ أن يعمل البديل مع صفوف اعتباطية:

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

ثلاثة تفاصيل صغيرة، وكل واحد منها يستحق وزنه:

- **اختصار `id` أولًا.** أغلب سجلات الـ backend فيها حقل `id`. `String(obj.id)` يتعامل مع الأرقام والسلاسل و BigInt دون تفرّع. التحويل بالنوع كذبة في نظام الأنواع وصدق وقت التشغيل.
- **رتّب المفاتيح قبل اشتقاق البصمة.** `Object.keys()` يعيد ترتيب الإدخال. في أغلب الكائنات يكون هذا الترتيب هو نفسه في كل مرة، لكن "أغلب" ليست "كل". كائن أعيد بناؤه من `JSON.parse` لن يتفق بالضرورة مع كائن كُتب مباشرة كـ object literal بالمفاتيح نفسها. الترتيب يقضي على هذا الصنف من الأخطاء دفعة واحدة.
- **`String()` بدل `JSON.stringify`.** `String()` لا يرمي استثناءً أبدًا، بينما `JSON.stringify` يرمي على المراجع الدائرية (وهي تحدث حين تكون مُستهترًا مع Pinia). الهدف هنا مفتاح ثابت، لا مُسلسِل كامل.

هذا المفتاح يُستخدم في مطابقة Vue _و_ في التحديد معًا. وهذه هي الثابتة التي تهمّ. لو استخدم الاثنان مفهومَي هوية مختلفَين (`:key="i"` وتحديد يستخدم `===`)، فقد تُسقط عملية فرز واحدة مربعات الاختيار مع بقاء البيانات نفسها. استخدام `getRowKey` في الموضعَين يضمن أن الاثنين لا يفترقان.

## التحديد على شكل `Map<string, T>`

لا توجد حالة تحديد منفصلة. المكوّن يحتفظ فقط بـ `localSelectedItems` (وهي `shallowRef<T[]>`)، ويشتق منها Map مفهرسة بالمفتاح:

```typescript
const hashedSelectedItems = computed(() => {
  const map = new Map<string, T>();
  localSelectedItems.value.forEach((x) => map.set(getRowKey(x), x));
  return map;
});
```

مربع اختيار رأس عمود التحديد يفحص "هل كل العناصر محدَّدة" بمسح واحد للمصفوفة:

```typescript
const isAllDataSelected = computed(() => {
  const atData = localItems.value.filter((item) =>
    hashedSelectedItems.value.has(getRowKey(item))
  );
  return atData.length === localItems.value.length && localItems.value.length > 0;
});
```

هذا O(n) على العناصر المرئية، وهي أصلًا O(n) بالنسبة إلى الـ render نفسه. لا شيء يمكن فعله لتحسين هذا. أما الفحص لكل صف على حدة فهو O(1):

```typescript
modelValue: hashedSelectedItems.value.has(getRowKey(rowData)),
```

بدون هذه الـ Map المحسوبة، سيقوم كل مربع اختيار بـ `localSelectedItems.value.find(...)` عند كل render. جدول من 100 صف مع 100 عنصر محدَّد كان سينفّذ 10,000 مقارنة في كل إعادة render. الـ Map تحوّل ذلك إلى 100 بحث بزمن ثابت. لا تلاحظ الفرق قبل أن تُفجّر جدولًا ببيانات حقيقية، وعند تلك اللحظة تحفظ النمط وتتوقف عن كتابة النسخة الساذجة.

عمود التحديد نفسه يُبنى عند الطلب. المستهلك إما يصرّح به عمودًا (`type: 'selection'`) وإما يتركه:

```typescript
if (hasSelectColumn) {
  const selectionColumn = handleSelectionColumn();
  _columns = _columns.filter((col) => col.type !== 'selection');
  _columns.unshift(selectionColumn);
}
```

عمود `type: 'selection'` القادم من المستهلك، إن وُجد، يُستبدَل بواحد يبنيه المكوّن داخليًا ويُثبَّت في الموضع 0. نسخة المستهلك مجرد _علامة_ تعني "أريد تحديدًا في هذا الجدول"، والمكوّن نفسه يتولى كتابة الـ renderer الفعلي. بهذا يحصل المستهلك على واجهة "التحديد عمود" دون أن يُطلب منه أن يعرف كيف يُبنى مربع الاختيار أو كيف تُوصَّل حالة `indeterminate`.

## الإجراءات، و`markRaw` الذي أثبت جدواه

الإجراءات تعمل بالطريقة نفسها تمامًا. المستهلك يصرّح بعمود إجراءات (أو يُلحقه المكوّن تلقائيًا إذا كان `actions.length > 0`)، والـ renderer يُبنى داخليًا:

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

السطر الذي أريد أن أتوقف عنده هو `markRaw(AActionGroup)`.

حين تمرّر تعريف مكوّن إلى `h()`، فإن Vue يلمسه أثناء الـ render. وبدون `markRaw`، لو مرّ هذا التعريف يومًا عبر نظام التفاعلية في Vue، سواء عبر `ref` أو `reactive` أو حتى prop، فإنه يُلفّ في Proxy. تعريفات المكوّنات ليست مصمَّمة أصلًا لتكون تفاعلية، هي بيانات وصفية ثابتة. تغليفها لا يكسر شيئًا، لكنه يجعل كل قراءة لخاصية تمرّ عبر handler يقوم بفحص تتبّع تفاعلية لا يُثمر أبدًا.

دالة الـ render أعلاه تعمل مرة لكل صف. في جدول من 500 صف، يلمس أول render تعريف `AActionGroup` خمسمئة مرة. `markRaw` يضع علامة `__v_skip` على الكائن مرة واحدة، وكل render لاحق يتخطى مسار الـ Proxy تمامًا.

كلفة `markRaw` دائمة، لا يمكن التراجع عنها. وهذا مقبول تمامًا مع تعريف مكوّن، فهو import ثابت في نهاية المطاف. لو أردتَ تبديل مكوّن الإجراءات وقت التشغيل، فالتبديل يحصل في طبقة مختلفة، أي في اختيار _أي_ مكوّن تمرّره إلى `markRaw`، لا بأن تجعل المرجع نفسه تفاعليًا.

هناك أيضًا تنبيه في وضع التطوير نصّه "Vue received a Component that was made a reactive object"، يظهر حين يتسلل مكوّن تفاعلي إلى `h()`. اصطدمتُ به في جدول من 1200 صف كان يمرَّر فيه `AActionGroup` عبر `shallowRef` لأغراض الـ theming. إضافة `markRaw` أسكتت التنبيه وخفّضت زمن أول رسم بشكل ملحوظ.

عدد الإجراءات الظاهرة يمكن أن يكون رقمًا أو دالة على الصف:

```typescript
const getVisibleLength = (rowData: T) =>
  typeof globalProps.visibleActionLength === 'function'
    ? globalProps.visibleActionLength(rowData)
    : globalProps.visibleActionLength;
```

وهذا هو السبيل الوحيد لتنفيذ "اعرض 3 إجراءات للـ admin وإجراءً واحدًا للمستخدم العادي" دون أن نبني عمود إجراءات ثانيًا.

## الفرز: دورة من ثلاث نقرات، محلية أو عن بُعد

حالة الفرز كائن ذو قيمتَين منطقيتَين:

```typescript
export type ISortValue = { applied: boolean; revert: boolean };
```

وليست `'asc' | 'desc' | null`. جرّبتُ النصوص أولًا، لكنها كانت تفقد باستمرار حالة "لم يُطبَّق"، لأن القيم الزائفة من النوع الخاطئ لا تتعايش بلطف مع TypeScript الصارم.

التبديل يمرّ بثلاث حالات:

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

نقرة أولى: تصاعدي. نقرة ثانية: تنازلي. نقرة ثالثة: عودة إلى الترتيب الأصلي. المستخدمون يتوقّعون هذا في كل جدول تعاملوا معه، ويُفاجَؤون دائمًا حين لا يجدون نقرة "إلغاء الفرز".


الفرز الفعلي له مساران: عن بُعد ومحلي.

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

الوضع البعيد يُصدر emit ويترك للأب تولّي الترقيم والفرز على مستوى الـ backend. الوضع المحلي يُشغّل الـ sorter في الذاكرة، مع تفصيلة واحدة: حين يعود المستخدم إلى حالة "غير مفروز"، يُعاد استنساخ العناصر المحلية من `globalProps.items`. هذا يستعيد الترتيب الأصلي دون أن نحتاج إلى تذكّره أصلًا.

الـ emit يُطلَق في الحالات الثلاث. الـ backend البعيدة تحتاجه لإعادة الجلب، والمستهلك المحلي يستطيع استخدامه لحفظ اختيار المستخدم في query param داخل الـ URL. إطلاق الـ emit بلا شروط أرخص من التفرّع، والمستهلك يستطيع تجاهله ببساطة.

## التفاعلية: `shallowRef` و`cloneDeep` و`debouncedWatch`

المكوّن لا يراقب بيانات المستهلك مراقبة عميقة. `localItems` و`localColumns` و`localActions` و`localSelectedItems`، جميعها `shallowRef`:

```typescript
const localItems = shallowRef<T[]>(_.cloneDeep(globalProps.items));
const localColumns = shallowRef<IDataTableColumn<T>[]>([]);
const localActions = shallowRef<IAction<T>[]>(_.cloneDeep(globalProps.actions));
const localSelectedItems = shallowRef<T[]>(_.cloneDeep(globalProps.selectedItems));
```

الـ `ref` يلفّ المصفوفات في proxy تفاعلي يتتبّع كل تعديل صغير. في جدول من 1000 صف، يعني هذا 1000 proxy على الأقل، مع ما يتبعها من proxies متشعّبة داخل كل صف. معظم هذا الحمل ضائع. المكوّن نفسه يعيد إسناد `.value` بأكمله كل مرة، ولا يعدّل أي صف داخليًا في مكانه. الـ `shallowRef` يقول: تتبّع تغيّر المرجع فقط ولا تتعمّق. وهذا هو العقد المطلوب بالضبط.

الاستنساخ هو النصف الثاني من القصة. `_.cloneDeep(globalProps.items)` يأخذ لقطة من بيانات الأب لحظة الإسناد، ثم يعمل الجدول على نسخته الخاصة. هذا يهمّ في الفرز تحديدًا: حين يفرز المستخدم، يعدّل الجدول `localItems` عنده دون أن يمسّ مصفوفة الأب. لو حذفنا الاستنساخ، لتحوّل الفرز البصري إلى تعديل مباشر على حالة الأب، وهنا يظهر أسوأ صنف من الأخطاء المعروفة بـ "التصدير من الخادم لا يطابق ما كان على الشاشة".

المراقبة المتجدّدة تستعمل `debouncedWatch`:

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

لماذا debounce؟ لأن حالة الأب كثيرًا ما تتخبط. تغيير مرشِّح واحد على مستوى الأب قد يُحدث ثلاث إعادات render متتالية: تحديث الفورم، ثم تحديث سلسلة الاستعلام، ثم استجابة الجلب التي تُبدّل بيانات النائب. دون debounce، سيستنسخ الجدول عناصره ثلاث مرات في نفس الإطار. الـ 100ms للعناصر و50ms للتحديد أرقام استقرّيت عليها من مراقبة السلوك على الإنتاج، وليست مقدّسة. لو كانت لديّ الشهية لجعلتها props بحدّ ذاتها.

مراقب الأعمدة والإجراءات _ليس_ مُخفَّفًا بـ debounce:

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

تغييرات الأعمدة والإجراءات نادرة. عادةً ما تُصرَّح مرة واحدة في أعلى `<script setup>` ولا تُلمس بعدها أبدًا. الـ debounce سيُدخل تأخيرًا محسوسًا في الحالة النادرة التي تتغير فيها فعلًا، مثل admin يبدّل ظهور عمود. عدم التماثل (debounce على العناصر ولا debounce على الأعمدة) يعكس بدقة الطريقة التي يستخدم بها الناس المكوّن.

## التحميل والفراغ والترقيم: الزخارف المحيطة

الزخارف المحيطة قصة صغيرة لا يكتبها أحد.

حالة التحميل عبارة عن طبقة موضوعة بشكل مطلق مع `pointer-events-none`:

```vue
<div
  v-if="globalProps.loading"
  class="bg-white/70 flex pointer-events-none items-center inset-0 justify-center absolute z-10 backdrop-blur-[1px]"
>
  <LoadingComp />
</div>
```

التفصيلة المهمّة هي `pointer-events-none`. بدونها، تعترض الطبقة النقرات على الصفوف تحتها. الطبقة شفافة بصريًا، ومع ذلك لن يستطيع المستخدم التفاعل مع الجدول المشوّش. النيّة هنا "أظهِر أن شيئًا يجري، لا تحرم المستخدم من تحديد صف لا يزال يراه". الطبقة مجرد إشارة، لا حاجز.

حالة الفراغ صف داخل الجدول نفسه، لا شقيقًا له:

```vue
<ATBody :columns="localColumns" :items="localItems">
  <tr v-if="localItems.length === 0 && !globalProps.loading">
    <td :colspan="localColumns.length" class="p-4">
      <NoData :title="globalProps.noDataTitle" />
    </td>
  </tr>
</ATBody>
```

تمريرها عبر slot الـ `<tbody>` هو ما يجعلها ترث حدّ الجدول ومسافاته. لو وضعناها في `<div>` شقيق، لاحتجنا أنماطًا منفصلة لضبط محاذاتها، أما `<tr colspan>` فيحصل على التخطيط مجانًا.

الترقيم اختياري ويعمل عبر prop اسمه `pagination`:

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

هناك تفصيلتان تستحقّان الإشارة. أولًا، مكوّن الترقيم مخفيّ أثناء التحميل. لو تركناه ظاهرًا، لبقيت قائمة حجم الصفحة نشطة أثناء الجلب، وقد تُطلق نقرة سريعة ثانية طلب صفحة إضافيًا. وثانيًا، تُمرَّر callbacks داخل كائن `pagination` كحقول (`onPageSizeChange` و`onUpdateCurrentPage`) لا كـ props منفصلة. لستُ متأكدًا أن هذا كان القرار الصائب، وإصدار emit كان سيبدو أقرب إلى روح Vue. لكنه يحافظ على قصة "الترقيم كتلة إعداد واحدة" نظيفة.

## ما كنتُ سأغيّره في إعادة كتابة رابعة

بضعة مواضع لا يمثّل كود اليوم فيها ما كنتُ سأكتبه لو بدأت من الصفر:

- **ازدواج `binder` و`cell.props` داخل `ATCell`.** prop منفصلان يشيران إلى البيانات نفسها. دمجهما في prop واحد كان سيوفّر spread إضافيًا وفرعًا زائدًا. تركتُهما لأن مواقع الاستدعاء القديمة تعتمد على الاسم.
- **`innerHTML` في الخلايا الافتراضية.** الفخّ حقيقي، لكن الأرغونومية تستحقّ. لو أعدتُ الكتابة، فسأذهب إما إلى `textContent` افتراضيًا مع جعل الـ HTML خيارًا صريحًا عبر حقل في العمود (`unsafe: true`)، وإما إلى نهج مبني بالكامل على slots. كلاهما يحتاج إعادة كتابة، ولا أحدهما مستعجل.
- **تحويل `{} as S` داخل الرأس.** يعمل، لكن جعل `record?: S` اختياريًا داخل `ATCell` سيكون أكثر أمانة. الرأس لا يمتلك سجلًا، فليقل النوع ذلك صراحة.
- **قيم الـ debounce المكتوبة يدويًا (50ms و100ms).** يجب أن تكون props. ثلاث دقائق عمل، ومع ذلك أؤجّلها كل مرة.
- **الـ `Cell` المحسوب مع `<component :is>` المفتاح فيه معلَّق على حالة الفرز.** ما زلتُ أُحدّق فيها. إما أن المفتاح غير ضروري (احذفه وانتظر ماذا يحصل)، وإما أنه يُخفي خطأ توقيت في `patcher` يجب أن أستطيع إعادة إنتاجه. أنا مدين للكود بذلك التحقيق.

لا شيء من هذه هو السبب في أنني أنصح بهذا النمط. السبب أبسط وأملّ من هذا كلّه: سكيمة العمود كبيانات، وإيقاع `shallowRef` مع الاستنساخ مع الـ debounce، والتحديد المفهرَس بـ Map، و`markRaw` على مكوّن الصف. كل واحد منها من الأشياء التي تكتبها في المرة الثانية، بعد أن تكون النسخة الأولى قد عضّتك بالفعل. وهذه هي قصة `ADataTable` كلها. الشكل الذي استقرّ عليه هو شكل الشيء الذي كففتُ عن إعادة كتابته.
