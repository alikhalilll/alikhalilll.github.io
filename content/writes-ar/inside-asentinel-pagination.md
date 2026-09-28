---
title: أربع مشكلات في أيّ قائمة infinite-scroll، وطريقة إصلاحها
description: أربع مشكلات تظهر عاجلاً أم آجلاً في أيّ قائمة infinite-scroll، والأسطر المحدَّدة داخل مكوّن Vue من 230 سطراً تُعالج كلاً منها.
date: 2026-02-28
updatedAt: 2026-02-28
lang: ar
keywords:
  - infinite scroll
  - Vue 3
  - IntersectionObserver
  - AbortController
  - Pagination
  - arity dispatch
  - memory leak
  - TypeScript
  - Nuxt
---

الـ infinite scroll من الميزات التي تبدو بسيطة وأنت ترسمها على السبورة، ثم تتحوّل إلى شيء غريب حين تصطدم بالاستخدام الحقيقي. المسار السعيد يتّسع لشريحة واحدة: تضع IntersectionObserver في أسفل القائمة، تُطلق fetch عند التقاطع، وتُلحق النتائج. اشحنها وانتهِ.

بعدها تبدأ المشكلات في العثور عليك. يغيّر المستخدم فلتراً فيرجع لك استدعاء الصفحة التالية ببيانات الفلتر القديم. يخرج طلبَا "load more" في نفس الـ tick لأن المستخدم مرّر بسرعة. يُفرَّغ المكوّن بينما لا يزال observer نشِطاً، ويحتفظ closure الخاص بالـ callback بالصفحة كلها في مأمن من الـ GC. يعمل الـ handler عندك على dev ثم ينكسر على prod لأن أحدهم استدعى `fetcher()` بدلاً من `fetcher(page)`.

`ASentinelPagination` هو جوابي عن هذا كله. بنيتُه في نحو 230 سطراً داخل ملف `.vue` واحد، وليس فيه أي ذكاء استثنائي. ما يستحق الكتابة عنه ليس المعمار، بل قائمة المشكلات المحددة التي يتفاداها، والأسطر التي تتفاداها بالضبط. وهذا محور التدوينة.

سأبني كل شيء حول أربع مشكلات شحنتُ كل واحدة منها مرة على الأقل في محاولات سابقة.

## الـ API الذي يكتبه المستهلك

قبل أن أدخل في المشكلات، هذا ما يكتبه المستهلك فعلاً:

```vue
<ASentinelPagination :fetch-handler="loadProducts">
  <template #card="{ item }">
    <ProductCard :product="item" />
  </template>
  <template #initialLoading="{ count }">
    <ProductCardSkeleton v-for="i in count" :key="i" />
  </template>
  <template #loadingMore="{ count }">
    <ProductCardSkeleton v-for="i in count" :key="i" />
  </template>
  <template #emptyState>
    <NoResults />
  </template>
</ASentinelPagination>
```

أربع slots، وprop واحد يهم فعلاً. الـ handler يرجع `{ items: T[], pagination?: { current_page, per_page, total, last_page } }`. الـ pagination اختياري، فإن لم يرجعه الـ backend تُحمَّل القائمة مرة واحدة وتتوقف. سلوك متواضع، لكنه صادق.

## `fetchHandler.length`: توزيع بحسب الـ arity

بعض واجهات الـ API يحتاج رقم صفحة، وبعضها لا يحتاجه. بعض الـ endpoints يعمل pagination على الـ server، وبعضها يرجع كل شيء دفعة واحدة. لو فرضتُ على المكوّن شكلاً واحداً، لاضطرّ المستهلكون إلى كتابة closures وسيطة تُجبر الـ fetcher على التوقيع المتوقع. ولو فرضتُ الشكل الآخر، لكتب من لا يهتم بالـ pagination شيئاً مثل `(_page) => ...` في كل مكان مع تجاهل الوسيط.

الحل الخاطئ هو إضافة prop باسم `mode: 'paged' | 'stateless'`. هذا إعداد لشيء يعبّر عنه توقيع الدالة نفسها.

الحل الصحيح، كما تبيّن، هو فحص الدالة في وقت التشغيل:

```typescript
async function runFetchHandler(): Promise<ISPPaginationHandlerResult<T>> {
  if (props.fetchHandler.length >= 1) {
    const fn = props.fetchHandler as (
      p: ISPPaginationMeta
    ) => Promise<ISPPaginationHandlerResult<T>>;
    return await fn(pagination.value);
  }

  const fn = props.fetchHandler as () => Promise<ISPPaginationHandlerResult<T>>;
  return await fn();
}
```

الـ `Function.prototype.length` يرجع عدد الوسائط الشكلية التي تُصرِّح بها الدالة. لو كتب المستهلك `loadProducts(p)` فالقيمة 1، ولو كتب `loadProducts()` فالقيمة 0. المكوّن يتفرّع بناءً على ذلك.

من ناحية المستهلك، كلا الشكلين مقبول:

```typescript
const loadAllProducts = () => $api('/products');                                   // stateless
const loadProductsPage = (p) => $api('/products', { query: { page: p.current_page } }); // paged
```

الاتحاد في TypeScript على نوع الـ prop يُبقي التوقيعَين متسقَين:

```typescript
export type ISPFetchHandler<T> =
  | ((pagination: ISPPaginationMeta) => Promise<ISPPaginationHandlerResult<T>>)
  | (() => Promise<ISPPaginationHandlerResult<T>>);
```

يبقى فخ واحد جدير بالذكر. الدوال السهمية التي تُصرِّح بوسيط دون أن تستعمله تُحسب أيضاً على أنها arity 1. لو كتب المستهلك `(_p) => $api('/products')` فسيقع على فرع الـ paged. لا مشكلة عملية في هذا لأن الـ handler يتجاهل الوسيط، لكنه من النوع الذي يُدوَّن مرة واحدة كي يجد الشخص التالي إجابة جاهزة لسؤال "لماذا يُمرَّر pagination أصلاً؟"

## `inFlight`: بوابة واحدة، وثلاث قراءات مشتقة

هذه المشكلة كلاسيكية. يصل المستخدم إلى الأسفل، فينطلق observer ويبدأ fetch. يمرّر بكسلاً واحداً، فينطلق observer مرة أخرى لأن الـ sentinel لا يزال ظاهراً، ويبدأ fetch ثانٍ قبل أن يُحلّ الأول. بحسب التوقيت تحصل على:

- كلا الطلبين يرجعان الصفحة 2، فتتكرّر العناصر.
- طلب يخرج بـ `current_page = 2` وآخر بـ `current_page = 3`، فتتشابك العناصر أو تُتخطّى الصفحة 2 بصمت.
- كلاهما يرجع الصفحة نفسها، فينكسر منطق de-dup عند المستهلك، ويقفز الـ layout.

الحل الساذج هو boolean واحد باسم `isLoading`. لكنه لا يكفي، لأن لدينا نوعين مختلفين منطقياً من التحميل: الأولي بـ skeleton يملأ الشاشة، والصفحة التالية بـ skeleton صغير في الأسفل. أي boolean-ين قد يختلفان، وحين يختلفان يبدأ منطق البوابة في السؤال "هل هذا النوع تحديداً جارٍ الآن؟"، وهو سؤال خاطئ من الأساس.

السؤال الصحيح هو: "هل يوجد أي شيء جارٍ الآن؟" مصدر واحد للحقيقة، وقراءتان مشتقتان منه:

```typescript
const initialLoading = ref(true);
const isFetchingMore = ref(false);
const inFlight = ref<'init' | 'next' | null>(null);
```

الـ `inFlight` هو البوابة. أما الاثنان الآخران فيتبدّل الـ template عليهما ليحدّد أي skeleton يعرضه. وتُضبط الثلاثة معاً:

```typescript
const fetchData = async (mode: 'init' | 'next') => {
  if (inFlight.value !== null) return;
  if (mode === 'next' && (!hasNextPage.value || isFetchingMore.value)) return;

  inFlight.value = mode;

  try {
    if (mode === 'init') initialLoading.value = true;
    if (mode === 'next') isFetchingMore.value = true;

    const result = await runFetchHandler();
    applyPaginationFromHandlerResult(result);
    items.value = mode === 'init' ? result.items : [...items.value, ...result.items];
  } finally {
    if (mode === 'init') initialLoading.value = false;
    if (mode === 'next') isFetchingMore.value = false;
    inFlight.value = null;
  }
};
```

قاعدتان صغيرتان تُبقيان هذا مستقيماً. الـ early return يفحص `inFlight.value !== null` لا أي boolean بعينه، فإن كان init جارياً وأُطلق trigger للصفحة التالية، يُرفض الـ fetch الثاني حتى لو كان `isFetchingMore` لا يزال false. والإفراج عن البوابة يقع في `finally` لا في `try`، فحين يرمي fetch استثناءً تُحرَّر البوابة أيضاً، ولا يُقفل المكوّن نفسه بصمت في وضع "أرفض تحميل أي شيء" بعد أول تعثّر شبكي.

### الـ sentinel، وعتبة الـ 0.6

الـ sentinel نفسه عبارة عن div بارتفاع 1px مع `aria-hidden`:

```vue
<div ref="sentinelRef" class="h-1 min-w-[1px] w-full" aria-hidden="true" />
```

وفي الـ observer ضمانتان أحبّ أن أعزلهما:

```typescript
observer = new IntersectionObserver(
  (entries) => {
    const entry = entries[0];
    if (!entry?.isIntersecting) return;
    if (!initialLoading.value && !isFetchingMore.value && hasNextPage.value) {
      void fetchNextPage();
    }
  },
  { root: null, rootMargin: '0px', threshold: 0.6 }
);
```

`threshold: 0.6` بدل `0`. الـ sentinel بارتفاع 1px، وعند `threshold: 0` يكفي أن يهتز بكسلاً واحداً داخل الـ viewport وخارجه أثناء التمرير حتى يُطلق الـ callback عدة مرات. عند 0.6 يصبح التقاطع أكثر معنى، فـ 60% من هدف بحجم 1px ليست كبيرة لكنها مستقرة أمام هذا الاهتزاز. وفحص الحالة داخل الـ callback يعيد تأكيد البوابة، لأنه بين لحظة إطلاق التقاطع ولحظة تشغيل الـ callback ربما بدأ تحميل آخر. الحارس ثلاثي الشروط هو خط الدفاع الثاني الـ idempotent خلف `inFlight`.

## إعادة الضبط عند تغيّر هوية الـ fetcher

يضغط المستخدم على "Category: Shoes". يمرّر المكوّن الأب `fetchHandler` جديداً يحمل الفلتر الجديد. ما ينبغي أن يحدث: مسح القائمة، جلب الصفحة الأولى بالـ handler الجديد، وتركيب observer جديد.

أما إن لم تتعامل مع الموقف، فتبقى القائمة القديمة على الشاشة، وتُلحَق الصفحة الثانية للفلتر الجديد بالصفحة الأولى للفلتر القديم. يرى المستخدم مزيجاً من الأحذية وعناصر لا علاقة لها، وتخرج طلبات "الصفحة 3" مقابل handler بينما تُفسَّر مقابل حالة pagination تخص handler آخر.

المُشغِّل هو watch على الـ handler نفسه:

```typescript
watch(
  () => props.fetchHandler,
  async () => {
    observer?.disconnect();

    items.value = [];
    hasNextPage.value = false;
    pagination.value = {
      current_page: 1,
      per_page: pagination.value.per_page,
      total: 0,
      last_page: 1,
    };

    await fetchData('init');
    setupObserver();
  }
);
```

تحدث أربعة أشياء بالترتيب، وكل واحدة منها تحمل وزناً حقيقياً.

الفصل أولاً. لو لم أفصل الـ observer القديم لظلّ حياً أثناء إعادة الضبط، والـ sentinel لا يزال يتقاطع مع الـ viewport لأنه لا شيء تمرّر. حينها يستطيع الـ observer القديم إطلاق `fetchNextPage()` مقابل حالة pagination قديمة في منتصف إعادة الضبط، فيخرج طلب بـ `current_page: 2` مقابل handler يظن نفسه يرجع الصفحة الأولى. هذا الطلب خاطئ جوهرياً، ويجب أن يُمنع لا أن يُصحَّح.

بعدها أمسح items والـ pagination. أُبقي على `per_page` لأنها في الغالب تفضيل مستخدم لا ينبغي للفلتر أن يعبث به. أما الحقول الثلاثة الأخرى فتعود إلى قيمها الافتراضية.

ثم أُطلق `fetchData('init')`. يظهر الـ skeleton، ويعمل الـ fetch بالـ handler الجديد، وتصل العناصر.

وأخيراً أُعيد ربط الـ observer. عقدة الـ DOM نفسها لم تتغيّر، لكنني أربط نسخة observer جديدة بحالة ما بعد إعادة الضبط.


ثمة تفصيلة دقيقة تستحق التدوين هنا. الـ watch يجري على `props.fetchHandler` بهوية المرجع. فإن مرّر المستهلك `() => $api('/products', { query: { category } })` بشكل inline داخل الـ template، تُنشأ دالة جديدة في كل re-render للأب، وينطلق الـ watch في كل re-render. غالباً هذا ليس ما تريده. على المستهلكين أن ينضبطوا: memoize الـ handler عبر `computed`، أو أخذه من composable هويته مستقرة، أو القبول بأن القائمة ستعيد الجلب مع كل render للأب.

فكّرتُ في أن أُضيف prop مستقلاً باسم `key` لإطلاق إعادة الضبط صراحةً بدلاً من الاعتماد على هوية المرجع، لكن هذا يدفع بالتعقيد إلى كل مستهلك. عقد watch القائم على هوية المرجع أبسط بكثير إن كنت مستعداً لتوضيح فكرة هوية الدالة للفريق مرة واحدة.

## تنظيف الـ observer، والتسريب الذي يمنعه

هذه هي المشكلة الهادئة. ينتقل المستخدم من مسار كان يحتوي على `ASentinelPagination`. تُفرِّغ Vue المكوّن. لكن الـ IntersectionObserver يبقى حياً إن لم تنظّفه، محتفظاً بمرجع لعقدة الـ sentinel في الـ DOM، وبـ closure الـ callback الذي التقط نطاق `<script setup>` كاملاً: `items` و`pagination` وكل الـ refs ومثيل المكوّن نفسه.

لا شيء من هذا يذهب إلى الـ GC حتى يُفلته الـ observer. وعلى مسار فيه حركة كثيفة دخولاً وخروجاً، يتراكم التسريب. لاحظتُ واحداً كهذا في تطبيق سابق بعد أن أبلغ مستخدم بأن الصفحة تصير أبطأ كلما طال استخدامه لها. جلسته كانت تُجمِّع حالة عشرات المكوّنات الميتة.

الحل استدعاء واحد:

```typescript
onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
```

يسهل كتابته، ويسهل نسيانه بنفس القدر. ما يمسك هذا في code review هو قائمة تحقق ذهنية: كل `new IntersectionObserver`، `new MutationObserver`، `addEventListener`، `setInterval`، `requestAnimationFrame` يستدعي teardown مقابلاً في `onBeforeUnmount` أو `onUnmounted`. إن لم تستطع الإشارة إلى الـ teardown، فأنت تُسرّب. في كل مرة.

### `v-scroll-reveal`: observer لكل بطاقة

توجيه scroll-reveal الذي يعمل على مستوى كل بطاقة داخل المكوّن نفسه له نسخته الخاصة من القصة:

```typescript
const vScrollReveal = {
  mounted(el: HTMLElement) {
    // ... setup observer, stash on el._scrollObserver
    observer.observe(el);
  },
  unmounted(el: HTMLElement) {
    const observer = (el as HTMLElement & { _scrollObserver?: IntersectionObserver })._scrollObserver;
    observer?.disconnect();
  },
} as const;
```

يخبّئ التوجيه observer الخاص به على العنصر نفسه في `el._scrollObserver` كي يجده `unmounted` لاحقاً. يوجد أيضاً استدعاء `observer.unobserve(el)` داخل callback الـ mount. متى ظهرت البطاقة بالـ fade، لا يبقى شيء يستحق المراقبة، وإبقاء الـ observer مرتبطاً يعني عملاً إضافياً على كل حدث تمرير بلا عائد. أما `unmounted` فهو احتياط مضاعف للبطاقات التي أُفرِّغت قبل أن تُرى أصلاً، سواء لأن المستخدم مرّ عليها بسرعة، أو غادر المسار، أو أزالها فلتر.

الـ type assertion على `_scrollObserver` أقبح مما أرغب. مفتاح `Symbol` كان سيوفّر الـ cast، لكنه سيكسر أيضاً استعراضه في DevTools. اخترتُ النسخة التي أستطيع قراءتها فعلاً.

## Type guards من دون `zod`

يبقى شيئان خارج إطار المشكلات الأربع، لكنهما استحقّا مكانهما داخل المكوّن.

أولاً، الـ type guards لبيانات الـ pagination الوصفية:

```typescript
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
function isPaginationMeta(value: unknown): value is ISPPaginationMeta {
  if (!isRecord(value)) return false;
  return (
    isNumber(value.current_page) &&
    isNumber(value.per_page) &&
    isNumber(value.total) &&
    isNumber(value.last_page)
  );
}
```

لا `zod`، ولا `yup`. ثلاث دوال، وثلاثون سطراً، دون إضافة أي اعتمادية جديدة إلى مكوّن UI. القضية ليست الأداء، بل أن أي مكوّن UI يعتمد على مكتبة validator يُسرِّب هذا الاختيار إلى كل مستهلك. الـ guards المكتوبة يدوياً تُبقي رسم الاعتماديات نظيفاً، ولهذا الشكل من الفحص (أربعة حقول كلها أرقام) فهي أقصر من أي schema. فحص `Number.isFinite` مهم هنا. من دونه يجتاز `NaN` و`Infinity` فحص `typeof === 'number'`، فتنتهي بسلوك "الصفحة 3 من Infinity" في مراحل لاحقة.

ثانياً، الـ `void fetchNextPage()` داخل callback الـ observer صغير ومقصود. الـ callback ليس async، فالانتظار بـ await لا يفعل شيئاً. والـ floating promises تُوقع أغلب الـ linters. أما `void` فهو إشارة صادقة: "أعرف أن هذا async، وقصدي ألا أنتظره، وقد فكّرت في الأمر." كلمة واحدة، والفرق بينها وبين تعليق suppress هو الفرق بين lint نظيف وآخر مقيّد.

## ملخّص الدفاعات الأربع

على نحو 230 سطراً، هذا المكوّن من النوع الذي تُعيد كتابته في بعد ظهر واحد. ما يجعله يعمل ليس أي قطعة منفصلة (توزيع الـ arity، `inFlight` بوصفه حالة discriminated، تنظيف الـ observer، إعادة الضبط بهوية المرجع، الـ type guards المكتوبة يدوياً). كل واحدة منها صغيرة لدرجة أنك لو سمعتها منفصلة لهززتَ رأسك وتابعتَ.

ما جعل هذا المكوّن يتوقف عن كونه مصنعاً للمشكلات هو أنني رأيتُ أنماط الفشل الأربعة وكتبتُ حارساً محدداً لكل واحدة منها. لا مكتبة ولا تجريد، بل حفنة من الدفاعات الصغيرة، دفعتُ ثمن كل واحدة منها بمشكلة شحنتُها في نسخة سابقة. هذا في الغالب هو ما يعنيه "التقسية" عملياً: ليست ذكاءً، بل ذاكرة أطول.
