---
title: تشريح ADataTable، جدول بيانات مُعمَّم ومكتوب بأنواع في Vue
description: جولة كاملة في جدول بيانات مُعمَّم ومكتوب بأنواع في Vue، بأعمدة على شكل سكيمة، ومحدَّد صفوف بمفاتيح Map، وأزرار إجراءات لكل صف عبر markRaw، ودورة فرز ثلاثية النقرات.
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

كتبتُ جدول البيانات نفسه ثلاث مرات. مرةً ككتلة من JSX، ومرةً ككائن إعدادات مبني على class باسم `IColumn`، ومرةً، وهي التي رسخت، كمكوّن Vue مُعمَّم ومكتوب بأنواع، مع نوع عمود على شكل سكيمة. في المرة الثالثة، توقّف أخيرًا عن كونه الشيء الذي أخشى لمسه.

هذه التدوينة جولة في الشكل الحالي. يعيشُ داخل حزمة الـ UI الخاصة بي باسم `ADataTable`، والشيء المُثير في الأمر ليس أي حيلة منفردة. الشيء المهم هو أن المكوّن توقّف عن النمو. كل طلب ميزة خلال السنة الماضية استوعبته التجريدات القائمة دون إضافة أي prop جديد. هذه هي نسخة "الاكتمال" التي كنتُ أستهدفها.

سأمرّ على الملفات تقريبًا بالترتيب الذي يسلكه الطلب خلالها، مع التوقف عند الأجزاء التي تستحق الشرح.

## من كلاس `IColumn` إلى interface مكتوب بأنواع

قبل عامين كان عندي كلاس:

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

كان الكلاس يقوم بتوحيد شكل الـ props والـ events. إن مررت كائنًا ثابتًا، كان يُغلَّف داخل `() => object` كي يستطيع الجدول استدعاءه دائمًا كدالة. كان مرتّبًا على الورق، ولا بأس به في JavaScript. المشكلة بدأت مع دخول TypeScript: أنواع الصفوف المُعمَّمة لم تكن تتدفّق نظيفًا عبر كلاس يعمل في وقت التشغيل، والمستهلكون كانوا يفقدون استنتاج الأنواع في المكان نفسه الذي يحاولون فيه الوصول إلى `row.user.name`.

الشكل الحالي هو interface بسيط ومكتوب بأنواع:

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

ثلاثة أشياء تغيّرت، وكل واحدة منها أحدثت فرقًا.

أولًا، لا كلاس. العمود مجرد كائن بسيط. TypeScript يُضيّق نوعه، والمحررات تُكمله تلقائيًا، ويتسلسل نظيفًا لو أردت يومًا تشغيل الجدول من JSON. عملية التوحيد التي كان يقوم بها الكلاس وقت الإنشاء انتقلت إلى دالة مساعدة صغيرة داخل الـ renderer (وهي `handleProps`، سنمر عليها بعد قليل). الكلفة صارت فرعًا واحدًا لكل render خلية بدلًا من فرع واحد لكل _تعريف_ عمود، والفائدة أن العمود يظل قيمة، لا كائنًا في وقت التشغيل.

ثانيًا، العمود مُعمَّم على `T`. إن قلت `IDataTableColumn<User>` فإن `key` يُصبح مكتوبًا بنوع `string | (row: User) => ...` يتدفق إلى كل callback لاحق. في اليوم الذي أضفتُ فيه هذا، ثلاثة مواضع استدعاء في العمل التقطت بهدوء أخطاء أنواع في أعمدة كانت مكسورة سرًّا.

ثالثًا، مسؤوليات الـ render انقسمت نظيفًا. `headRender` مخصّص لخلية الرأس فقط، و`bodyRender` لخلية الجسم. النسخة القائمة على الكلاس كان لديها `rowComponent` واحد يقوم بالاثنين ويتفرّع داخليًا، مما يعني أن "رأس مخصّص وجسم افتراضي" كان يستلزم توليفة غير موثّقة من الحقول العدمية.

لا شيء من هذا فكرة جديدة. الانتقال من كلاسات وقت التشغيل إلى أنواع على شكل سكيمة هو قصة أغلب مشاريع الـ UI في السنوات الخمس الأخيرة. السبب الوحيد لذكر هذا هو أنني كتبتُ نسخة الكلاس _أولًا_ وواصلتُ شحنها لفترة طويلة بعد أن كانت نسخة الأنواع ستكون أرخص. تكلفة التبديل لم تكن في إعادة الكتابة، بل في الاعتراف بأن التصميم الأول قد استنفد.

## الثلاثي المسؤول عن الـ render: `ATHead`، `ATBody`، `ATCell`

مكوّن الجدول لا يقوم بعرض الصفوف مباشرة. يقوم بعرض `<thead>` و`<tbody>`، وهذان يقومان بعرض عناصر `<tr>` التي تعرض بدورها مكوّنات `<ATCell>`. الفصل محكم بما يكفي ليكون لكل ملف مهمة واحدة.

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

عنصر `<tr>` واحد. مكوّن `<ATCell>` واحد لكل عمود، مع `head={true}`. الـ `record` كائن فارغ اصطناعي مُحوَّل بالنوع إلى `S`. الرأس ليس لديه صف، لكن `ATCell` مُعمَّم عليه، فلا بدّ من شيء يملأ المكان. تحويل `{} as S` هو أقل الخيارات سوءًا؛ إعطاؤه قيمة `undefined` فعلية سيُجبر كل render خلية على فحص العدم.

`ATBody.vue` بالشكل نفسه، بمستوى أعلى:

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

المفاتيح المركّبة (`$index + '_dataItem'` و`collIndex + '_dataItem_' + $index`) ليست من قبيل جنون الارتياب. المُطابِق في Vue يهتم فقط بأن تكون المفاتيح فريدة _داخل قائمة الأب_، لذلك `$index` وحده يكفي. لكن حين أتصفح Vue DevTools محاولًا معرفة أي صف هو أي، فإن ظهور المفتاح بصيغة "`3_dataItem`" بدل "`3`" يوفر عليّ ثانية. هذا هو السبب الوحيد لللاحقة.

الـ `<slot />` داخل `<tbody>` هو المكان الذي يحلّ فيه صف "لا بيانات". المكوّن الخارجي يمرّر إليه `<tr><td>...</td></tr>`. إبقاء حالة الفراغ كصف مُمرَّر عبر slot بدلًا من كونها عنصرًا منفصلًا يعني أن حسابات `colspan` تعمل ضمن شبكة الـ `<tr>` نفسها، ولا تنكسر أنماط انطباق الحدود.

العمل الحقيقي يجري داخل `ATCell.vue`.

## `ATCell`: مكوّن واحد، شكلان، مبنيّ عبر `h()`

`ATCell` يعرض إما `<th>` أو `<td>` حسب `head`. بدلًا من كتابة قالبين، يبني الـ vnode ديناميكيًا:

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

ثم يقوم القالب بتركيب الـ vnode المحسوب فقط:

```vue
<template>
  <component :is="Cell" :key="props.cell.sortValue?.applied || 'ATCell'" />
</template>
```

شيئان يقومان بعمل هادئ هنا.

`handleProps` يقبل إما كائنًا بسيطًا وإما دالة تأخذ الصف، ويُرجع دائمًا كائنًا:

```typescript
const handleProps = <T,>(val: IDataTableColumn<T>['props'], record: T) => {
  if (!val) return {};
  return typeof val === 'function' ? val(record) : val;
};
```

هذا هو عقد "قابل للاستدعاء دائمًا" الذي كان كلاس `IColumn` القديم يفرضه وقت الإنشاء، منقولًا إلى مسار الـ render، حيث يكون أرخص في الحالة الشائعة (الـ props الثابتة لا تُغلَّف دون داعٍ) ويترك للمستهلكين حرية الاختيار.

ترتيب الـ spread مهم: `props.cell.props` يُنشر أولًا، ثم `props.binder` بعده. `binder` هو نفسه `cell.props`؛ وإنما يُمرَّر عبر prop منفصل لأسباب تاريخية سأدمجها لو أعدتُ الكتابة. حتى ذلك الحين، `binder` يفوز عند التعارض، وهو ما يتوقعه المستدعون.

### الـ `:key="sortValue?.applied"` الذي يبدو خطأً مطبعيًا

الشيء الثاني هو ذلك المفتاح الغريب `:key="props.cell.sortValue?.applied || 'ATCell'"`. الـ `<component :is>` يتفاعل مع تغيّرات الـ vnode، لكن الـ `:key` يبدو موجودًا لإجبار إعادة تركيب حين تنقلب حالة الفرز. وهذا بالضبط ما وُضع من أجله. الترقيع في Vue ذكي بما يكفي لعمل diff بين خرجَي `h()`، لكن إن جاءت props الخلية من دالة على السجل _وتغيّر_ السجل في اللحظة نفسها التي انقلب فيها الفرز، فقد يتمسك المُرقِّع أحيانًا بسمة قديمة. جعل المفتاح مرتبطًا بحالة الفرز يفرض unmount/remount نظيفًا عند الانتقال الذي قد يهمّ فيه ذلك. سطر واحد. إزالته لم تعضّني حتى الآن، وهذا يعني إما أنه مُفرِط في الاحتياط، وإما أنه يمنع الخطأ بهدوء. لستُ متأكدًا، وقد توقفتُ عن محاولة إثبات أي من الاحتمالين. كلفة المفتاح render واحد لكل تبديل فرز.

## `handleValueBasedOnKey`: مسارات بالنقاط داخل الصفوف

حين لا يوفّر العمود `headRender` أو `bodyRender`، تعود الخلية إلى renderer افتراضي:

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

عمود بمفتاح `key: 'user.profile.displayName'` يسير على النقاط ويسحب القيمة المتشعّبة. هذه هي الميزة الوحيدة التي تمنع المستهلكين من كتابة دالة `bodyRender` في 80% من الأحيان. أغلب الجداول لديها ثلاثة أو أربعة أعمدة تكون مجرد `row.foo.bar`؛ إعطاؤها مسارًا بالنقاط يعني أن نهج "السكيمة كبيانات" يكسب جولة أخرى.

أستخدمُ `innerHTML` في الـ renderer الافتراضي. هذا مقصود لعناوين تحتاج تضمين `<br>` أو قليلًا من التأكيد، وهو رصاصة في القدم مع البيانات التي يتحكم بها المستخدم. الاصطلاح الذي استقرّ عندي في مراجعات الكود هو: "استخدم الافتراضي للعناوين الثابتة والبيانات المُنقّاة، وأما لأي شيء يُولّده المستخدم فاكتب `bodyRender` يستخدم مكوّنًا فرعيًا." لم أجد طريقة أنظف للتعبير عن ذلك في نظام الأنواع، ولستُ متأكدًا أنني أريد إجبار الجميع على المرور بـ `bodyRender` لكل خلية.

## مفاتيح الصفوف: البديل حين لا يوفّر أحد واحدًا

الـ `:key` الافتراضي في Vue على الصفوف هو `$index`، وهو إجابة خاطئة لأي شيء يُغيّر ترتيبه. لتفعل أفضل من ذلك تحتاج معرّفًا ثابتًا لكل صف، وبما أن الجدول مُعمَّم على `T` فلا يوجد حقل يمكن الاعتماد عليه عالميًا.

الـ interface هو الواضح:

```typescript
type DataTablePropsWithKey<T> = IDataTableProps<T> & {
  /** Optional stable key extractor; recommended */
  rowKey?: (row: T) => string;
};
```

عمليًا، لا أحد يُمرّره. البديل كان لا بدّ أن يعمل مع صفوف اعتباطية:

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

ثلاثة استدعاءات صغيرة، وكل واحد يستحق وزنه:

- **اختصار `id` أولًا.** أغلب سجلات الـ backend عندها واحد. `String(obj.id)` يتعامل مع الأرقام والسلاسل والـ BigInt دون تفرّع. التحويل بالنوع غير أمين نظاميًا وأمين وقت التشغيل.
- **رتّب المفاتيح قبل الهاش.** `Object.keys()` تُعيد ترتيب الإدخال. لأغلب الكائنات يكون هذا الترتيب هو نفسه في كل مرة، لكن "أغلب" ليست "كل". كائن أُعيد بناؤه من `JSON.parse` لن يتفق بالضرورة مع كائن بُني من object literal بالمفاتيح نفسها. الترتيب يقتل هذا الصنف كاملًا.
- **`String()` بدلًا من `JSON.stringify`.** `String()` لا يرمي أبدًا؛ `JSON.stringify` يرمي على المراجع الدائرية (وهي تحدث حين تكون مُستهترًا مع Pinia). الهدف مفتاح ثابت، لا مُسلسِل.

المفتاح يُستخدَم في مُطابقة Vue _و_ في التحديد. هذه هي الثابتة التي تهمّ. لو استخدم الاثنان مفهومَي هوية مختلفَين (`:key="i"` وتحديد يستخدم `===`)، لكانت عملية فرز قد تُسقط مربعات الاختيار مع الإبقاء على البيانات. استخدام `getRowKey` في الموضعين يعني أنهما لا يستطيعان الافتراق.

## التحديد بوصفه `Map<string, T>`

لا توجد حالة تحديد منفصلة. المكوّن يحتفظ بـ `localSelectedItems` (وهو `shallowRef<T[]>`) ويُشتقّ منه Map مفهرس بالمفتاح:

```typescript
const hashedSelectedItems = computed(() => {
  const map = new Map<string, T>();
  localSelectedItems.value.forEach((x) => map.set(getRowKey(x), x));
  return map;
});
```

مربع اختيار رأس عمود التحديد يفحص "هل كل العناصر محدَّدة" بمسح مصفوفة واحد:

```typescript
const isAllDataSelected = computed(() => {
  const atData = localItems.value.filter((item) =>
    hashedSelectedItems.value.has(getRowKey(item))
  );
  return atData.length === localItems.value.length && localItems.value.length > 0;
});
```

O(n) عبر العناصر المرئية، وهي أصلًا O(n) للـ render. لا شيء يمكننا فعله لتحسين ذلك. لكن فحوص التحديد لكل صف هي O(1):

```typescript
modelValue: hashedSelectedItems.value.has(getRowKey(rowData)),
```

بدون الـ Map المحسوب، سيقوم كل مربع اختيار بـ `localSelectedItems.value.find(...)` عند كل render. جدول من 100 صف مع 100 عنصر محدَّد كان سيقوم بـ 10,000 مقارنة لكل إعادة render. الـ Map يُحوّل ذلك إلى 100 بحث بزمن ثابت. لا تلاحظ هذا إلا بعد أن تُفجّر جدولًا ببيانات حقيقية. عند تلك النقطة تتعلم النمط وتتوقف عن كتابة النسخة الساذجة.

عمود التحديد نفسه يُبنى عند الطلب. المستهلك إما يُصرّح به كعمود (`type: 'selection'`) وإما لا يفعل:

```typescript
if (hasSelectColumn) {
  const selectionColumn = handleSelectionColumn();
  _columns = _columns.filter((col) => col.type !== 'selection');
  _columns.unshift(selectionColumn);
}
```

عمود `type: 'selection'` القائم، إن وُجد، يُستبدَل بالمبنيّ داخليًا ويُفرَض في الموضع 0. نسخة المستهلك هي _علامة_ ("أريد تحديدًا في هذا الجدول")، والمكوّن يكتب الـ renderers الفعلية. هذا يمنح المستهلكين واجهة "التحديد عمود" دون أن يُطلب منهم معرفة كيف يُبنى مربع الاختيار وكيف تُوصَل حالة `indeterminate`.

## الإجراءات، و`markRaw` الذي كسب مكانه

الإجراءات تعمل بالطريقة نفسها: المستهلك يُصرّح بعمود إجراءات (أو يُلحقه المكوّن تلقائيًا إذا كان `actions.length > 0`)، والـ renderer يُبنى داخليًا:

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

`markRaw(AActionGroup)` هو السطر الذي أريد عزله.

حين تُمرّر تعريف مكوّن إلى `h()`، فإن Vue يلمسه أثناء الـ render. بدون `markRaw`، إن مرّ ذلك التعريف يومًا عبر نظام التفاعلية في Vue (سواء `ref` أو `reactive` أو prop) فإنه يُغلَّف في Proxy. تعريفات المكوّنات ليست مصمَّمة لتكون تفاعلية. هي بيانات وصفية ثابتة. تغليفها لا يكسر شيئًا؛ فقط يجعل كل قراءة خاصية تمرّ عبر handler يقوم بفحص تتبّع تفاعلية لا يُثمر أبدًا.

دالة الـ render أعلاه تعمل مرة لكل صف. لجدول من 500 صف، الـ render الأول يلمس تعريف `AActionGroup` بمقدار 500 مرة. `markRaw` يضع علامة `__v_skip` على الكائن مرة واحدة، وكل render لاحق يتخطى مسار الـ Proxy.

كلفة `markRaw` دائمة. لا تستطيع إلغاء العلامة. وهذا مقبول لتعريف مكوّن: هو import ثابت. لو أردتَ تبديل مكوّن الإجراءات وقت التشغيل، فستفعل ذلك في طبقة مختلفة (باختيار _أي_ مكوّن تُمرّره إلى `markRaw`)، لا بجعل المرجع تفاعليًا.

هناك أيضًا تحذير في وضع التطوير ("Vue received a Component that was made a reactive object") يظهر حين يتسلل مكوّن تفاعلي إلى `h()`. اصطدمتُ به في جدول من 1200 صف حيث كان `AActionGroup` يُمرَّر عبر `shallowRef` بغرض الـ theming. إضافة `markRaw` أسكتته وخفّض زمن أول رسم بشكل ملحوظ.

عدد الإجراءات الظاهرة يمكن أن يكون إما رقمًا وإما دالة على الصف:

```typescript
const getVisibleLength = (rowData: T) =>
  typeof globalProps.visibleActionLength === 'function'
    ? globalProps.visibleActionLength(rowData)
    : globalProps.visibleActionLength;
```

وهو الطريق الوحيد لعمل "أظهر 3 إجراءات للـ admin، وواحدًا للمستخدمين العاديين" دون بناء عمود إجراءات ثانٍ.

## الفرز: دورة من ثلاث نقرات، محلية أو عن بُعد

حالة الفرز كائن ذو قيمتين منطقيتين:

```typescript
export type ISortValue = { applied: boolean; revert: boolean };
```

لا `'asc' | 'desc' | null`. جرّبتُ السلاسل أولًا؛ ظلت تُضيّع حالة "غير مُطبَّق" لأن القيم الزائفة من النوع الخاطئ لا تتعايش بلطف مع TypeScript الصارم.

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

انقر مرة: تصاعدي. انقر مرة ثانية: تنازلي. انقر مرة ثالثة: عودة إلى الترتيب الأصلي. المستخدمون يتوقعون هذا في كل جدول استعملوه، ويُفاجَؤون دائمًا حين لا يمتلك الجدول نقرة "إلغاء الفرز".


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

الوضع البعيد يُصدر emit ويترك للأب التعامل مع الترقيم والفرز مقابل الـ backend. الوضع المحلي يُشغّل الـ sorter في الذاكرة، مع خصوصية واحدة: حين يعود المستخدم إلى حالة "غير مفروز"، تُستنسَخ العناصر المحلية من جديد عن `globalProps.items`. هذا يُعيد الترتيب الأصلي دون الحاجة إلى تذكّره.

الـ emit يُطلَق في الحالات الثلاث. الـ backends البعيدة تحتاجه لإعادة الجلب؛ المستهلكون المحليون يمكنهم استخدامه لحفظ اختيار الفرز في query param في الـ URL. إصدار emit دون شروط أرخص من التفرّع، والمستهلكون يستطيعون تجاهله.

## التفاعلية: `shallowRef`، `cloneDeep`، `debouncedWatch`

المكوّن لا يراقب بيانات المستهلك مراقبة عميقة. `localItems` و`localColumns` و`localActions` و`localSelectedItems` كلها `shallowRef`:

```typescript
const localItems = shallowRef<T[]>(_.cloneDeep(globalProps.items));
const localColumns = shallowRef<IDataTableColumn<T>[]>([]);
const localActions = shallowRef<IAction<T>[]>(_.cloneDeep(globalProps.actions));
const localSelectedItems = shallowRef<T[]>(_.cloneDeep(globalProps.selectedItems));
```

الـ `ref` يُغلّف المصفوفات في proxy تفاعلي يتتبّع كل تعديل. لجدول من 1000 صف، هذا يعني 1000 proxy (وأيًّا كان عدد الـ proxies المتشعّبة لكل صف). معظمه عبء زائد. المكوّن يُعيد إسناد `.value` بأكمله فقط، ولا يُعدّل صفوفًا فردية في مكانها أبدًا. `shallowRef` يقول "تتبّع حين يتغيّر المرجع، لا تتعمّق". وهذا بالضبط العقد الذي يحتاجه المكوّن.

الاستنساخ هو النصف الثاني من القصة. `_.cloneDeep(globalProps.items)` يلتقط لقطة من بيانات الأب وقت الإسناد؛ الجدول يعمل على نسخته. هذا مهم للفرز: حين يفرز المستخدم، يُعدّل الجدول `localItems` الخاص به دون التأثير على مصفوفة الأب. تخطي الاستنساخ سيُحوّل فرزًا مرئيًا إلى تعديل على حالة الأب، وهو المصدر لأسوأ فئة من الأخطاء المسمّاة "التصدير من جهة الخادم لم يطابق ما كان على الشاشة".

إعادة المراقبة تستخدم `debouncedWatch`:

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

لماذا debounce؟ لأن حالة الأب كثيرًا ما تتخبّط. تغيير مُرشِّح على مستوى الأب قد يُطلق ثلاث عمليات إعادة render متتالية سريعة: تحديث الفورم، تحديث سلسلة الاستعلام، والاستجابة المجلوبة تُبدّل النائب. بدون debounce، سيُستنسَخ الجدول عناصره ثلاث مرات في إطار واحد. 100ms للعناصر و50ms للتحديد أرقام استقرّيتُ عليها بتقدير عيني للسلوك في الإنتاج؛ ليست مقدَّسة. لو كان لديّ الشهية لجعلتُها props.

مراقب الأعمدة/الإجراءات _ليس_ مُخفَّفًا بـ debounce:

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

تغييرات الأعمدة والإجراءات نادرة. عادةً ما تُصرَّح مرة واحدة في أعلى `<script setup>` ولا تُلمس بعدها. الـ debounce سيُحدث تأخيرًا محسوسًا في الحالة غير الشائعة حين تتغير فعلًا (مثلًا admin يُبدّل ظهور عمود). عدم التماثل (debounce للعناصر، ولا debounce للأعمدة) يعكس كيف يستخدم المستهلكون المكوّن فعلًا.

## التحميل، الفراغ، والترقيم: الطلاء المحيط

الطلاء المحيط قصة صغيرة لا يكتبها أحد.

حالة التحميل عبارة عن طبقة موضوعة بشكل مطلق مع `pointer-events-none`:

```vue
<div
  v-if="globalProps.loading"
  class="bg-white/70 flex pointer-events-none items-center inset-0 justify-center absolute z-10 backdrop-blur-[1px]"
>
  <LoadingComp />
</div>
```

`pointer-events-none` هي التفصيلة. بدونها، تعترض الطبقة النقرات على الصفوف تحتها. رغم أنها شفافة بصريًا، لا يستطيع المستخدم التفاعل مع الجدول المشوّش. النيّة "أظهِر أن شيئًا يجري، لا تمنع المستخدم من تحديد صف لا يزال يراه". الطبقة مجرد إشارة.

حالة الفراغ صف داخل الجدول، لا شقيق له:

```vue
<ATBody :columns="localColumns" :items="localItems">
  <tr v-if="localItems.length === 0 && !globalProps.loading">
    <td :colspan="localColumns.length" class="p-4">
      <NoData :title="globalProps.noDataTitle" />
    </td>
  </tr>
</ATBody>
```

تمريرها عبر slot الـ `<tbody>` هو كيف ترث حد الجدول ومسافاته. `<div>` شقيق سيحتاج أنماطًا منفصلة لتصطف؛ أما `<tr colspan>` فيحصل على التخطيط مجانًا.

الترقيم اختياري ويُقاد بـ prop `pagination`:

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

شيئان يستحقان الإشارة. مكوّن الترقيم مُخفى أثناء التحميل. بدون هذا، سيكون منسدل حجم الصفحة نشِطًا أثناء الجلب، ونقرة سريعة ثانية قد تُطلق طلب صفحة ثانيًا. والـ callbacks تُمرَّر داخل كائن `pagination` كحقول (`onPageSizeChange`، `onUpdateCurrentPage`) لا كـ props منفصلة. لستُ متأكدًا أن هذا كان القرار الصحيح؛ إصدار emit كان سيكون أكثر توافقًا مع أسلوب Vue. لكنه يُبقي قصة "الترقيم كتلة إعداد واحدة" نظيفة.

## ما كنتُ سأغيّره في إعادة كتابة رابعة

بضعة مواضع لا يمثّل فيها كود اليوم النسخة التي كنتُ سأكتبها من جديد:

- **ازدواج `binder` مع `cell.props` داخل `ATCell`.** prop اثنان منفصلان يُشيران إلى البيانات نفسها. دمجهما في prop واحد سيُزيل spread وفرعًا. تركتُه لأن مواقع الاستدعاء القديمة تعتمد على الاسم.
- **`innerHTML` للخلايا الافتراضية.** الرصاصة في القدم حقيقية، ولكن الأرغونومية تستحق. لو أعدتُ الكتابة، سأذهب إما إلى `textContent` افتراضيًا وأجعل الـ HTML خيارًا مُفعَّلًا عبر حقل في العمود (`unsafe: true`)، وإما ألتزم بالكامل بنهج قائم على slots. الاثنان يستلزمان إعادة كتابة، ولا يستعجل أي منهما.
- **تحويل `{} as S` داخل الرأس.** يعمل، لكن جعل `record?: S` اختياريًا في `ATCell` سيكون أكثر أمانة. الرأس ليس لديه سجل؛ فليقل النوع ذلك.
- **قيم الـ debounce المكتوبة يدويًا (50ms، 100ms).** ينبغي أن تكون props. ثلاث دقائق عمل؛ ما زلتُ لا أفعلها.
- **الـ `Cell` المحسوب المقرون بـ `<component :is>` بمفتاح على حالة الفرز.** ما زلتُ أُحدّق في هذه. إما أن المفتاح غير ضروري (احذفه وشاهد ما يحدث)، وإما أنه يُخفي خطأ توقيت في المُرقِّع يجب أن أُعيد إنتاجه. عليّ للكود قاعدة تلك التحقيقة.

لا شيء مما سبق هو السبب الذي أنصح من أجله بهذا النمط. السبب أصغر وأملّ: سكيمة العمود كبيانات، إيقاع `shallowRef` مع الاستنساخ مع الـ debounce، التحديد المفهرَس بـ Map، و`markRaw` على مكوّن الصف. كل واحدة منها من الأشياء التي تكتبها في المرة الثانية، بعد أن تكون النسخة الأولى قد عضّتك مرة. وهذه هي كل قصة `ADataTable`. الشكل الذي استقرّ عليه هو شكل شيء توقفتُ عن إعادة كتابته.
