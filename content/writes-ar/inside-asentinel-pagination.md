---
title: أربع مشكلات في أي قائمة infinite-scroll، وطريقة إصلاحها
description: أربع مشكلات تشحنها أي قائمة infinite-scroll في النهاية، والأسطر المحدَّدة داخل مكوّن Vue من 230 سطراً تمنع كل واحدة منها.
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

الـ infinite scroll واحدة من تلك الميزات التي تبدو تافهة على السبورة وتصبح غريبة عند الاستخدام الفعلي. المسار السعيد يتّسع في شريحة واحدة: IntersectionObserver في أسفل القائمة، ثم fetch عند التقاطع، ثم إلحاق النتائج. اشحنها.

ثم تجدك المشكلات. يغيّر المستخدم فلتراً فيعود استدعاء الصفحة التالية ببيانات الفلتر القديم. يخرج طلبا "load more" في الـ tick نفسه لأن المستخدم مرّر بسرعة. يُفصَل المكوّن (unmount) بينما لا يزال observer حياً، ويظل closure للـ callback مُبقياً على الصفحة كاملة قابلة للوصول من قِبَل GC. يعمل الـ handler في development ولا يعمل في prod لأن أحداً ما استخدم `fetcher()` بدلاً من `fetcher(page)`.

الـ `ASentinelPagination` هو إجابتي. يقع في نحو 230 سطراً داخل ملف `.vue` واحد، وهو ليس ذكياً. ما يستحق الكتابة عنه ليس المعمار، بل قائمة المشكلات المحددة التي يتفاداها والأسطر المحددة التي تتفاداها. هذا ما تدور حوله هذه التدوينة.

سأؤطّر كل شيء حول أربع مشكلات شحنتُها مرة واحدة على الأقل في محاولات سابقة.

## الـ API الذي يكتبه المستهلك

قبل المشكلات، هذا ما يكتبه المستهلك فعلياً:

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

أربع slots، وprop واحد هو المهم. الـ handler يعيد `{ items: T[], pagination?: { current_page, per_page, total, last_page } }`. الـ pagination اختياري. إن لم يعده الـ backend، تُحمَّل القائمة مرة واحدة وتتوقف. هذا هو السلوك المتدهور لكنه صادق.

## `fetchHandler.length`: توزيع بناءً على arity

بعض واجهات الـ API تريد رقم صفحة، وبعضها لا يريد. بعض الـ endpoints تعمل paginate على الـ server، والبعض الآخر يعيد كل شيء. إذا فرض المكوّن شكلاً واحداً، ينتهي المستهلكون بكتابة closures محوِّلة لإجبار الـ fetcher على التوقيع المتوقع. وإذا فرض المكوّن الشكل _الآخر_، ينتهي المستهلكون الذين لا يهتمون بالـ pagination بكتابة `(_page) => ...` في كل مكان وتجاهل الوسيط.

الحل الخاطئ هو إضافة prop باسم `mode: 'paged' | 'stateless'`. إنه إعداد لشيء يعبّر عنه شكل الدالة نفسها بالفعل.

الحل الصحيح تبيّن أنه فحص الدالة في وقت التشغيل:

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

الـ `Function.prototype.length` يُعيد عدد الوسائط الشكلية التي تُصرِّح بها الدالة. إذا كتب المستهلك `loadProducts(p)` فإن القيمة 1؛ وإذا كتب `loadProducts()` فإن القيمة 0. يتفرّع المكوّن بناءً على ذلك.

من جهة المستهلك، كلاهما مسموح به:

```typescript
const loadAllProducts = () => $api('/products');                                   // stateless
const loadProductsPage = (p) => $api('/products', { query: { page: p.current_page } }); // paged
```

الاتحاد في TypeScript على نوع الـ prop يُبقي التوقيعين صادقين:

```typescript
export type ISPFetchHandler<T> =
  | ((pagination: ISPPaginationMeta) => Promise<ISPPaginationHandlerResult<T>>)
  | (() => Promise<ISPPaginationHandlerResult<T>>);
```

ثمة فخ واحد جدير بأن يُسمَّى. الدوال السهمية (arrow functions) التي تُصرِّح بوسيط لكنها لا تستخدمه لا تزال تُحسب بأنها arity 1. فإذا كتب المستهلك `(_p) => $api('/products')`، فإنها تصيب فرع الـ paged. لا بأس بذلك (فالـ handler يتجاهل الوسيط)، لكنه من النوع الذي يجب تدوينه مرة كي يتمكن الشخص التالي الذي يسأل "لماذا يُمرَّر pagination؟" من قراءة الإجابة.

## `inFlight`: بوابة واحدة، وثلاث قراءات مشتقة

هذه هي الكلاسيكية. يصل المستخدم إلى الأسفل، يُطلَق observer، يبدأ fetch. يمرِّر المستخدم بكسل واحد، يُطلَق observer _مرة أخرى_ (الـ sentinel لا يزال على الشاشة)، ويبدأ fetch ثانٍ قبل أن يُحلَّ الأول. تبعاً للتوقيت، تحصل على:

- كلا الطلبين يعيدان الصفحة 2؛ يتكرّر العناصر.
- أحدهما يُطلَق بـ `current_page = 2`، والآخر بـ `current_page = 3`؛ تتشابك العناصر أو تُتَخطى الصفحة 2 بصمت.
- كلاهما يعيدان الصفحة نفسها، ويتعطّل منطق الـ de-dup عند المستهلك، وينزلق الـ layout.

الحل الساذج هو boolean واحد (`isLoading`). لكنه لا يعمل تماماً لأن هناك _نوعين_ منطقيين مختلفين من التحميل: الأولي (skeleton يملأ الشاشة) والصفحة التالية (skeleton صغير في الأسفل). قد يختلف boolean-ان، ومتى اختلفا يبدأ منطق البوابة في التفرّع على "هل _هذا_ النوع من التحميل جارٍ؟" وهو السؤال الخاطئ.

السؤال الصحيح هو "هل _أي شيء_ جارٍ؟" مصدر واحد للحقيقة، وقراءتان مشتقتان:

```typescript
const initialLoading = ref(true);
const isFetchingMore = ref(false);
const inFlight = ref<'init' | 'next' | null>(null);
```

الـ `inFlight` هو البوابة. أما الاثنان الآخران فما يتبدّل عليه الـ template لتحديد أي skeleton يُعرَض. تُضبَط جميعها معاً:

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

انضباطان صغيران يُبقيان هذا صادقاً. الـ early return يفحص `inFlight.value !== null`، لا أي boolean محدد، فإذا كان init جارياً وأُطلق trigger للصفحة التالية، يُرفض الـ fetch التالي رغم أن `isFetchingMore` لا يزال false. والإفراج يقع في `finally` لا في `try`. أي fetch يرمي استثناءً يُطلق البوابة أيضاً، فلا يستطيع المكوّن أن يُقفل نفسه بصمت في وضع "رفض تحميل أي شيء" بعد عثرة شبكة واحدة.

### الـ sentinel، وعتبة الـ 0.6

الـ sentinel نفسه هو div بحجم 1px مع `aria-hidden`:

```vue
<div ref="sentinelRef" class="h-1 min-w-[1px] w-full" aria-hidden="true" />
```

وفي الـ observer ضمانتان أرغب في عزلهما:

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

`threshold: 0.6` بدلاً من `0`. الـ sentinel بحجم 1px؛ وعند `threshold: 0`، فإن اهتزاز بكسل واحد داخل وخارج الـ viewport أثناء التمرير قد يُطلق الـ callback عدة مرات. وعند 0.6 يجب أن يكون التقاطع ذا معنى (60% من هدف بحجم 1px ليست كثيرة، لكنها مستقرة بوجه الاهتزاز). وفحص الحالة _داخل_ الـ callback يعيد تأكيد البوابة: بين إطلاق التقاطع وتشغيل الـ callback، قد يكون تحميل آخر قد بدأ. الحارس ثلاثي الشروط هو خط الدفاع الثاني idempotent خلف `inFlight`.

## إعادة الضبط عند تغيّر هوية الـ fetcher

يضغط المستخدم على "Category: Shoes." يبدل المكوّن الأب `fetchHandler` جديداً يتضمن الفلتر الجديد. ما ينبغي أن يحدث: مسح القائمة، جلب الصفحة 1 بالـ handler الجديد، ربط observer جديد.

ما يحدث إن لم تتعامل معها: تبقى القائمة القديمة على الشاشة. تُلحَق الصفحة 2 من الفلتر _الجديد_ بالصفحة 1 من الفلتر القديم. يرى المستخدم مزيجاً من الأحذية وعناصر غير ذات صلة، وتحدث عمليات جلب "الصفحة 3" ضد handler ما لكنها تُفسَّر مقابل حالة pagination لـ handler آخر.

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

تحدث أربعة أشياء، بالترتيب، وأربعتها حاملة للحِمل.

افصل (disconnect) أولاً. إن لم تفعل، فإن الـ observer القديم لا يزال حياً أثناء إعادة الضبط، والـ sentinel لا يزال يتقاطع مع الـ viewport (لم يمرَّر شيء). قد يُطلق الـ observer القديم `fetchNextPage()` مقابل حالة pagination قديمة في منتصف إعادة الضبط، وهذا يعني خروج طلب بـ `current_page: 2` مقابل handler يظن أنه يعيد الصفحة الأولى. ذلك الطلب خاطئ جوهرياً. يجب أن يُمنع، لا أن يُصحَّح.

بعد ذلك امسح items وpagination. أبقِ على `per_page` لأنها في الغالب تفضيل مستخدم لا ينبغي للفلتر أن يعيد ضبطه. أما الحقول الثلاثة الأخرى فتعود إلى القيم الافتراضية.

أطلق `fetchData('init')`. يظهر الـ skeleton. يعمل الـ fetch بالـ handler الجديد. تصل العناصر.

أعد ربط الـ observer. عقدة الـ DOM هي ذاتها؛ نربط نسخة observer جديدة بحالة ما بعد إعادة الضبط.


ثمة دقيقة هنا جديرة بالتدوين. الـ watch يجري على `props.fetchHandler`: هوية المرجع. إذا مرّر المستهلك `() => $api('/products', { query: { category } })` inline داخل الـ template، فإن دالة جديدة تُنشأ في كل re-render للأب، ويُطلَق الـ watch في كل re-render. هذا لا يكون تقريباً ما تريده. على المستهلكين أن ينضبطوا: memoize الـ handler عبر `computed`، أو استخرجه من composable تكون هويته مستقرة، أو تقبَّل أن القائمة ستعيد الجلب في كل render من الأب.

فكّرت في أن يقبل المكوّن prop مستقلاً باسم `key` لإطلاق إعادة الضبط صراحةً بدلاً من الاعتماد على هوية المرجع، لكن ذلك يدفع بالتعقيد إلى كل مستهلك. عقد الـ reference-watch أبسط إن كنت راغباً في تثقيف الناس بشأن هوية الدالة مرة واحدة.

## تنظيف الـ observer، والتسريب الذي يمنعه

هذا هو الهادئ. يتصفّح مستخدم بعيداً عن route كان به `ASentinelPagination`. تفصل Vue المكوّن. لكن الـ IntersectionObserver، إن لم تنظّفه، لا يزال حياً. يحتفظ بمرجع لعقدة الـ sentinel في الـ DOM _و_ للـ closure الخاص بالـ callback، الذي التقط نطاق `<script setup>` بأكمله: `items`، `pagination`، جميع الـ refs، ومثيل المكوّن بأكمله.

لا شيء من ذلك يُجمَع (garbage-collected) حتى يفلته الـ observer. على route ذي حركة كثيفة داخلاً وخارجاً، يتراكم التسريب. وجدتُ واحداً في تطبيق سابق بعد أن أفاد مستخدم بأن الصفحة تُصبح أبطأ كلما طال استخدامه لها. كانت جلسته تراكم عشرات من قدر حالة مكوّنات ميتة.

الحل مكالمة واحدة:

```typescript
onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
```

سهل الكتابة، سهل النسيان. الشيء الذي يمسك هذا في code review هو قائمة تحقق ذهنية: كل `new IntersectionObserver`، `new MutationObserver`، `addEventListener`، `setInterval`، `requestAnimationFrame` يحتاج إلى teardown مطابق في `onBeforeUnmount` أو `onUnmounted`. إن لم تستطع الإشارة إلى الـ teardown، فأنت تُسرّب. في كل مرة.

### `v-scroll-reveal`: observer لكل بطاقة

توجيه scroll-reveal لكل بطاقة داخل المكوّن نفسه له نسخته الخاصة من هذا:

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

يخبّئ التوجيه observer الخاص به على العنصر نفسه (`el._scrollObserver`) كي يستطيع `unmounted` العثور عليه لاحقاً. هناك أيضاً استدعاء `observer.unobserve(el)` داخل callback وقت الـ mount. متى تلاشت البطاقة إلى الظهور (faded in)، فلا يبقى شيء يستحق المراقبة، وإبقاء الـ observer مرتبطاً هو مجرد عمل إضافي على كل حدث تمرير دون فائدة. أما `unmounted` فهو الحزام والحمالة الاحتياطية للبطاقات التي انفصلت قبل أن تكون مرئية أبداً (مُرِّرت بسرعة، أو غادر المستخدم، أو أزالها فلتر).

الـ type assertion على `_scrollObserver` أقبح مما أرغب. مفتاح `Symbol` كان سيُجنّب الـ cast لكنه سيكسر أيضاً فحص DevTools. اخترتُ النسخة التي أستطيع قراءتها فعلاً.

## Type guards من دون `zod`

شيئان يقعان خارج إطار المشكلات لكنهما استحقا الدخول إلى المكوّن.

الـ type guards لبيانات الـ pagination الوصفية:

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

لا `zod`، ولا `yup`. ثلاث دوال، ثلاثون سطراً، ولا تُضاف اعتمادية إلى مكوّن UI. النقطة ليست الأداء؛ بل أن مكوّن UI الذي يعتمد على مكتبة validator يُسرّب ذلك الخيار إلى كل مستهلك. الـ guards المكتوبة يدوياً تُبقي رسم الاعتماديات نظيفاً، ومن أجل هذا الشكل من الفحص (أربعة حقول، جميعها أرقام) فهي أقصر من schema على أي حال. فحص `Number.isFinite` يهم. من دونه، يجتاز `NaN` و`Infinity` `typeof === 'number'`، ثم تنتهي بسلوك "الصفحة 3 من Infinity" في مراحل لاحقة.

الـ `void fetchNextPage()` في callback الـ observer صغير ومقصود. الـ callback ليس async، فالانتظار (await) لا يفعل شيئاً. الـ Floating promises تُعثِر معظم الـ linters. الـ `void` هو الإشارة الصادقة: "أعرف أن هذا async، وأنا عن قصد لا أنتظر، نعم فكّرت في الأمر." كلمة واحدة، وهي الفارق بين lint نظيف وتعليق suppress.

## ملخّص الدفاعات الأربع

على نحو 230 سطراً، المكوّن بأكمله من النوع الذي يمكن إعادة كتابته في بعد ظهر واحد. ما يجعله يعمل ليس أياً من القطع الفردية (arity dispatch، `inFlight` بوصفه حالة discriminated، تنظيف الـ observer، إعادة الضبط بهوية المرجع، الـ type guards المكتوبة يدوياً). كل واحدة منها صغيرة بحيث لو شرحتُها منفصلة لهززت رأسك ومضيت.

الشيء الذي جعل هذا المكوّن يتوقف عن كونه مصنعاً للمشكلات هو رؤية أنماط الفشل الأربعة أعلاه وكتابة حراسة _محددة_ لكل واحدة. لا مكتبة، ولا تجريد. مجرد حفنة من الدفاعات الصغيرة، دفعت ثمن كل واحدة منها بمشكلة شحنتُها في نسخة سابقة. هذا في الغالب هو ما تبدو عليه "التقسية" في الممارسة: ليست ذكاءً، بل ذاكرة أطول.
