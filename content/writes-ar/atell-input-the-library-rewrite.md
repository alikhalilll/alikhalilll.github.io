---
title: ملاحظات من إعادة كتابة ATellInput كمكتبة مُنشَرة
description: تحويل حقل هاتف من داخل تطبيق واحد إلى مكوّن Vue مُنشَر استوجب تغييرات جوهرية. تجربة استخدام تكتشف الدولة قبل أيّ تدخّل، وفصل بين رمز ISO2 ورقم الاتصال، ومنتقي متجاوب عبر Popover وDrawer، وSlots لكل شيء.
date: 2026-05-21
updatedAt: 2026-05-21
lang: ar
keywords:
  - Vue 3
  - مكتبة مكوّنات
  - حقل هاتف
  - libphonenumber-js
  - اكتشاف الدولة
  - Popover متجاوب
  - vaul-vue
  - defineModel
  - Slots
  - TypeScript
---

وُلد `ATellInput` داخل تطبيق واحد فقط: قيمة احتياطية تميل إلى السعودية أو مصر، ونداء داخلي لـ `RestCountries`، وتحقّق يظهر عبر v-model لا غير، وقائمة منسدلة ظاهرة على الشاشة طوال الوقت. حلّت تلك النسخة مسألة الصحّة: اضطراب موضع المؤشّر، وأسباب التحقّق، ودعم RTL/LTR. وأنجزت معظم ما يحتاجه مستهلك واحد.

هذه التدوينة تحكي ما جرى حين حاولتُ نشر المكوّن.

يعيش المكوّن الآن في `@alikhalilll/ui/tell-input`، ومهمّة المكتبة المُنشَرة تختلف كلياً. لا تستطيع أن تُشفِّر السوق الذي تخدمه داخل الكود. ولا أن تفترض شكل نظام تصميم المستهلك. ولا أن تُلزم كلّ نقطة تركيب بانتظار واجهة برمجية طرف ثالث. ولا حتى أن تعرف مسبقاً إن كان المستخدم على هاتف أم على حاسوب. حافظت إعادة الكتابة على صحّة النسخة الأصلية وأضافت ما يحتاجه مستهلك المكتبة فعلياً، وكلّ تغيير تقريباً وراءه علّة محدّدة أو قصور واضح في النسخة القديمة.

جمعتُ التغييرات حول السبعة التي استحقّت مكانها.

## نموذجان بشكلين مختلفين: الرقم للخارج، وISO2 في الداخل

بدت الواجهة القديمة أنيقة من بعيد:

```typescript
const phoneModelValue = defineModel<string>('phone', { required: true });
const countryModelValue = defineModel<string>('country', { required: true });
```

كان `country` سلسلة نصية تحوي أرقام الاتصال: `"20"` لمصر، و`"44"` للمملكة المتحدة. سهل التحويل إلى JSON، وسهل ترميزه في URL، وسهل إسكانه في عمود قاعدة بيانات.

المشكلة أنّه عجز عن التفريق بين الولايات المتحدة وكندا.

يتقاسم الرمز `+1` أكثر من 25 دولة ضمن NANP. لو اختار مستخدم كندي "كندا" من القائمة وأصدر v-model القيمة `"1"`, فلن يعرف الأب أيّ `+1` هو المقصود. حدّث الصفحة، واستعد الحالة من URL، ستعود إليك `"1"` بينما يعرض المنتقي أوّل دولة صادف أن ترتّبها القائمة. النموذج الذي يختصر الدولة في "سلسلة رموز اتصال" كان يُفقد نصف المعلومة عن شيء من قطعتين.

النموذج الجديد يفصل بين القطعتين:

```typescript
const phone = defineModel<string>('phone', { default: '' });
const country = defineModel<number | null>('country', { default: null });

const selectedIso2 = ref<string>('');
```

صار `country` رقماً (`20`, `1`, `null`) لأنّ رموز الاتصال أرقامٌ في جوهرها، ولأنّ `Number` ينجو من رحلات URL وDB وJSON بلا أيّ التباس ناتج عن اقتطاع الأحرف. غير أنّ المكوّن يتتبّع داخلياً أيضاً `selectedIso2` يملكه المنتقي وحده. تبقى القيمتان متزامنتين عبر watcher-ين، أحدهما للخارج والآخر للداخل، والداخلي منهما فيه حارس صغير لكنّه حاسم:

```typescript
watch(
  country,
  (next) => {
    if (next == null) {
      if (selectedIso2.value) selectedIso2.value = '';
      return;
    }
    if (dialNumberFor(selectedIso2.value) === next) return;
    const iso2 = resolveCountryIdentifier(String(next));
    if (iso2) selectedIso2.value = iso2;
  },
  { immediate: true }
);
```

السطر `if (dialNumberFor(selectedIso2.value) === next) return;` هو ما أودّ التوقّف عنده. حين يكتب الأب `country = 1` من جديد إلى النموذج والمنتقي يعرض كندا مختارة أصلاً، ينطلق الـ watch, لكنّ رمز الاتصال متطابق مسبقاً، فيعود دون أن يمسّ `selectedIso2`.
لولا هذا الحارس، لكان الـ watcher حلّ `"1"` إلى أوّل دولة NANP أبجدياً وقلب كندا بصمت إلى أيّاً كانت تلك الدولة. الحارس يحفظ الحالة الأغنى.

الـ watch الخارجي يعمل بوضع `flush: 'sync'` كي يبقى العلَم `autoSettingCountry` متّسقاً. لأنّه حين يختار المطابِق دولةً تلقائياً بناءً على ما كُتب، لا نريد اعتبار ذلك "اختياراً يدوياً" يُقفل الاكتشاف التلقائي لاحقاً.

نصفان من بيانات الدولة، ونموذجان مستقلّان، ومصدر حقيقة واحد لكلٍّ منهما.

## تجربة تقوم على الاكتشاف أولاً: المنتقي مخفي افتراضياً

كان المكوّن القديم يرسم القائمة دائماً: العلَم يساراً، وحقل الإدخال يميناً. أمّا المكوّن الجديد فيكتفي بحقل الإدخال وحده افتراضياً. تنزلق القائمة إلى الظهور فقط حين يكتب المستخدم شيئاً يتعرّف عليه المطابِق:

```vue
<Transition
  enter-active-class="transition-all duration-200 ease-out overflow-hidden"
  leave-active-class="transition-all duration-150 ease-in overflow-hidden"
  enter-from-class="opacity-0 -translate-x-1 max-w-0"
  leave-to-class="opacity-0 -translate-x-1 max-w-0"
  enter-to-class="max-w-[12rem]"
  leave-from-class="max-w-[12rem]"
>
  <ACountrySelect v-if="!props.detectFromInput || selectedIso2" ... />
</Transition>
```

يتقلّص `max-w` إلى صفر ما لم يكن هناك اختيار، ثم يتحرّك ليتفتّح عند أوّل تطابق ناجح. ومن يريد الشكل القديم يستطيع إعادة المنتقي الظاهر دائماً عبر `detectFromInput="false"`.

هذا سلوك ينحاز إلى رأي واضح. الأغلبية العظمى من المستخدمين في معظم الدول لا يكتبون بادئة `+` أبداً. بل يكتبون الرقم كما يكتبونه في هاتفهم: `01066105963` في القاهرة، و`07911 123456` في مانشستر. القائمة التي "يُجبَرون على التعامل معها" في كلّ حقل هاتف آخر خطوة زائدة بالنسبة لهم. أخفِها إذاً. وراقب ما يكتبونه. ولا تُظهرها إلا حين يقع الاكتشاف على نتيجة.

الجزء الوحيد الذي فيه بعض التعقيد هو "مراقبة ما يكتبونه". يمرّ عبر ثلاث طبقات في `matchLeadingDialCode`:

```typescript
function matchLeadingDialCode(digits: string): DialMatch | null {
  if (!digits) return null;

  // Tier 1: international parse, disambiguates NANP and strips the calling code.
  try {
    const parsed = parsePhoneNumberFromString(`+${digits}`);
    if (parsed?.country && parsed.countryCallingCode) {
      const parsedCountry = getCountryByValue(parsed.country);
      if (parsedCountry) {
        return { country: parsedCountry, nationalNumber: String(parsed.nationalNumber ?? '') };
      }
    }
  } catch {
    /* libphonenumber throws on partial input, fall through */
  }

  // Tier 2: national-format parse using the silently-inferred country as a hint.
  const hint = inferredCountry.value;
  if (hint && digits.length >= 4) {
    try {
      const parsed = parsePhoneNumberFromString(digits, hint as CountryCode);
      if (parsed?.isValid()) {
        const matched = getCountryByValue(parsed.country || hint);
        if (matched) {
          return { country: matched, nationalNumber: String(parsed.nationalNumber ?? '') };
        }
      }
    } catch {
      /* fall through */
    }
  }

  // Tier 3: longest-prefix match over our own dial-digits index.
  for (let len = Math.min(3, digits.length); len >= 1; len--) {
    const prefix = digits.slice(0, len);
    const group = getCountriesByDial(prefix);
    if (!group.length) continue;
    const nationalNumber = digits.slice(prefix.length);
    if (group.length === 1) return { country: group[0], nationalNumber };
    // ambiguity: prefer current selection, then recents, then first
    // (see "Recents as the tiebreaker" below)
    return { country: group[0], nationalNumber };
  }
  return null;
}
```

توجد الطبقات لأنّ لكلّ واحدة منها فئة من المدخلات تعجز الطبقتان الأخريان عن معالجتها.

تأخذ الطبقة الأولى ما كتبه المستخدم، وتُلحق قبله `+`, ثم تطلب من `libphonenumber` تحليله بوصفه رقماً دولياً. إن كتب المستخدم `447911123456` سيتطابق مع المملكة المتحدة. وإن كتب `1416...` سيتطابق مع كندا تحديداً (لا مع NANP العام)، لأنّ `libphonenumber` يحمل قواعد رموز المناطق مدمجة أصلاً. توجد كتلة catch لأنّ `libphonenumber` يرمي استثناءً على الإدخال الجزئي. `447` رقم ناقص؛ يرفع التحليل استثناءً، فننتقل إلى الطبقة التالية.

الطبقة الثانية هي المسار المخصّص لمن يكتب الرقم كما يستعمله في بلده. `01066105963` لا يبدأ برمز اتصال، وبالتالي لا نفع من الطبقة الأولى. لكن إن كنّا نعرف بصمت أنّ المستخدم في مصر على الأرجح (اعتماداً على IP أو timezone, والمزيد عن هذا لاحقاً)، فبإمكاننا تمرير `"EG"` تلميحاً للمحلِّل، وسيتعرّف `libphonenumber` على `01066105963` بوصفه رقم هاتف محمول مصري صحيح، ويجرّد الصفر الأول (البادئة الوطنية لمصر)، ويعيد الرقم الوطني المعياري `1066105963`. الحارس `digits.length >= 4` يمنع المحلِّل من التعامل مع بدايات رموز المناطق ذات الرقمين بوصفها أرقاماً كاملة.

الطبقة الثالثة هي الاحتياطي لحالة "كتبتُ `44` فقط ولا شيء غير ذلك". في هذه الحالة لا مسار في `libphonenumber` يستطيع المطابقة، فالمدخل قصير جداً. لكنّ فهرس أرقام الاتصال الخاصّ بنا يكفي: `byDialDigits.get('44')` يعيد مجموعة المملكة المتحدة بطول 1, وينتهي الأمر. هنا تُثبت بنية `Map<string, CountryOption[]>` الموروثة من النسخة القديمة قيمتها.

قد تبدو ثلاث طبقات كثيرة. في الحقيقة هي الحدّ الأدنى: كلّ طبقة تعالج مدخلات ترفضها الاثنتان الأخريان.

المُعالِج الذي يستدعيها يبقى صغيراً:

```typescript
const detectAndApply = useDebounceFn(
  () => {
    if (!props.detectFromInput) return;
    if (userPickedCountry.value || selectedIso2.value) return;
    const current = phone.value;
    if (!current) return;
    const match = matchLeadingDialCode(current);
    if (!match) return;
    autoSettingCountry.value = true;
    selectedIso2.value = match.country.value;
    phone.value = match.nationalNumber;
  },
  computed(() => Math.max(0, props.detectDebounceMs))
);
```

يقرأ `useDebounceFn` قيمة `phone.value` لحظة إطلاق المؤقّت، لا لحظة جدولته، فتذوب دفعة من الضغطات على المفاتيح في تحليل واحد. ويمنع `userPickedCountry.value` المكتشفَ التلقائيّ من الدهس على اختيار يدوي. متى استعمل المستخدم القائمة، ينسحب المطابِق مباشرة. أمّا مسح الحقل فلا يخضع لأيّ debounce, بل يعيد المنتقي إلى الاختفاء فوراً:

```typescript
if (!cleaned) {
  autoSettingCountry.value = true;
  selectedIso2.value = '';
  phone.value = '';
  userPickedCountry.value = false;
  return;
}
```

تأخير المسح يعني بقاء القائمة معلّقة 150 ميلي ثانية بعد إفراغ الحقل، وهو ما يبدو خاطئاً في كلّ مرّة.

## سلسلة اكتشاف البيئة، ولماذا هي قابلة للاستبدال

تعتمد الطبقة الثانية أعلاه على `inferredCountry.value`، أي أفضل تخمين للمكوّن عن موقع المستخدم، يُضبط بصمت قبل أن يكتب حرفاً واحداً. كان "أفضل تخمين" في النسخة القديمة قيمة احتياطية مثبّتة على السعودية أو مصر، لأنّهما السوقان اللذان استهدفتهما النسخة الداخلية. المكتبة لا تملك ترف هذا الافتراض.

السلسلة الجديدة هي `detectCountry()`:

```typescript
export async function detectCountry(opts: DetectCountryOptions = {}): Promise<string> {
  const {
    strategy = 'auto',
    ipEndpoint = 'https://ipapi.co/json/',
    defaultCountry = 'US',
    timeoutMs = 2000,
    cache = true,
  } = opts;

  if (cache) {
    const cached = readCache();
    if (cached) return cached;
  }

  if (strategy === 'none') {
    return defaultCountry.toUpperCase();
  }

  if (strategy === 'auto') {
    const ipResult = await tryIp(ipEndpoint, timeoutMs);
    if (ipResult) {
      if (cache) writeCache(ipResult);
      return ipResult;
    }
  }

  const localResult = tryTimezone() ?? tryLocale();
  const final = (localResult ?? defaultCountry).toUpperCase();
  if (cache) writeCache(final);
  return final;
}
```

أربع إشارات تُقيَّم بترتيب الكلفة: الأرخص المخبَّأ أولاً، والأغلى الذي يمرّ عبر الشبكة أخيراً.

1. تخزين مؤقّت في `sessionStorage`. المستخدم حسم دولته أصلاً ضمن هذه الجلسة، فلا داعي لتكرار العمل.
2. تحديد الموقع الجغرافي عبر IP باستخدام `ipapi.co` (قابل للتكوين). أدقّ إشارة، لكنّها تكلّف نداء شبكة وقدراً يسيراً من الخصوصية. من لا يريد هذا الطلب يمرّر `strategy: 'locale'` ليتخطّى الخطوة كلياً.
3. المنطقة الزمنية عبر `Intl.DateTimeFormat().resolvedOptions().timeZone`, يُبحث عنها في جدول صنعتُه يدوياً يربط `Africa/Cairo` بـ `EG`, و`Asia/Riyadh` بـ `SA`, و`Europe/London` بـ `GB`, وهكذا. يغطّي الجدول أكثف المناطق سكاناً، وهو صريح بأنّه لا يغطّي كلّ منطقة. عدم التطابق يمرّ إلى ما بعده.
4. `navigator.language` الذي يعطي `en-EG` أو `ar-SA` وأشباهها. لاحقة المنطقة هي الدولة. أقلّ موثوقية (فالمستخدمون يتنقّلون بينما locale المتصفح لا)، لكنّها بلا كلفة.
5. القيمة الافتراضية التي يمرّرها المستدعي. `defaultCountry: 'US'` هو الافتراضي في المكتبة، وللمستهلك حرية اختيار غيره.

خطوة IP هي التي احتاجت عناية حقيقية، لأنّ الطلب قد يتعلّق:

```typescript
async function tryIp(endpoint: string, timeoutMs: number): Promise<string | null> {
  if (!isBrowser() || typeof fetch !== 'function') return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, { signal: controller.signal, credentials: 'omit' });
    if (!res.ok) return null;
    const data = (await res.json()) as { country_code?: string; country?: string };
    const code = (data.country_code ?? data.country ?? '').toString().toUpperCase();
    return /^[A-Z]{2}$/.test(code) ? code : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
```

يعني `AbortController` مع مؤقّت من ثانيتين أنّ خدمة IP بطيئة لا تستطيع تعليق سلسلة الاكتشاف لأكثر من `timeoutMs`. وتُبقي `credentials: 'omit'` الكوكيز خارج الطلب المرسَل إلى الطرف الثالث الذي ضبطتَه. أمّا شكل الاستجابة فيُتحقّق منه بالتعبير النمطي `/^[A-Z]{2}$/`, لأنّ بعض واجهات IP تعيد `"GB"`, وبعضها الآخر `"United Kingdom"`, وبعضها `null` حين لا تعرف. التعبير النمطي هو البوّابة.

يعيش `detectCountry` خارج المكوّن عن قصد:

```typescript
import { detectCountry } from '@alikhalilll/ui/tell-input';

const country = await detectCountry({ strategy: 'locale' });
```

بلا اعتماد على Vue, ولا refs تفاعلية، ولا `onMounted`. يعمل داخل server middleware يريد ضبط كوكي، وفي CLI يريد طباعة موقع المستخدم المرجّح، وفي unit test يريد التحكّم بالاستراتيجية. أمّا الغلاف التفاعلي (`useCountryDetection`) فقشرة رقيقة فوقه للحالة داخل المكوّن. سطحان، وتنفيذ واحد.

والسلسلة كلّها قابلة للاستبدال. إن كنتَ تكتشف الموقع الجغرافي في الخادم أصلاً وتمرّره عبر SSR, فلن ترغب في أن يُعيد المكوّن نداء IP:

```vue
<ATellInput
  v-model:phone="phone"
  v-model:country="country"
  :detector="(opts) => Promise.resolve(serverDetectedCountry.value)"
/>
```

يستبدل الـ prop المسمّى `detector` السلسلةَ المدمجةَ بأكملها. يواصل المكوّن تشغيل بقية منطق الاكتشاف (يضبط الدولة المستنتجة، ويستخدمها تلميحاً للطبقة الثانية، وهكذا)، لكنّ مصدر الإجابة يصبح ما حدّدتَه أنت.

## منتقٍ متجاوب: مكوّن واحد بتقديمَين

كانت قائمة الدولة القديمة popover في كلّ مقاسات الشاشة. على الهاتف كان ذلك يعني قائمة قابلة للتمرير من 250 صفّاً مثبّتة على زرّ عرضه 38 بكسل، مع حقل بحث تحجبه لوحة المفاتيح باستمرار. كان يعمل. لكنّه يعمل بشكل رديء.

يعتمد المنتقي الجديد على العنصر الأساسي `AResponsivePopover` من المكتبة نفسها، وهو popover على الحاسوب وdrawer عبر `vaul-vue` على الجوّال:

```vue
<AResponsivePopover v-model:open="open">
  <AResponsivePopoverTrigger as-child>
    <!-- trigger button -->
  </AResponsivePopoverTrigger>

  <AResponsivePopoverContent
    :popover-class="
      cn(
        'w-[min(20rem,calc(100vw-2rem))] max-h-[min(22rem,var(--reka-popover-content-available-height))]',
        props.popoverClass
      )
    "
    :drawer-class="cn('max-h-[80vh] pb-4', props.drawerClass)"
  >
    <!-- search + list -->
  </AResponsivePopoverContent>
</AResponsivePopover>
```

يُمرَّر prop-ان للأصناف (`popoverClass` و`drawerClass`) كلّ على حدة، فيتمكّن المستهلك من تنسيق كلّ تقديم دون أن يرث الآخر شيئاً منه. الـ popover يريد `max-h-[min(22rem,var(--reka-popover-content-available-height))]` لأنّ `reka-ui` يُتيح الارتفاع المتاح كمتغيّر CSS. أمّا الـ drawer فيريد `max-h-[80vh]` لأنّه ورقة سفلية و"80% من نافذة العرض" سقفٌ منطقي. فرض مجموعة أصناف واحدة على الحالتين سيكون خطأً على إحداهما، لكنّ السماح للمستهلك بتجاوز كلّ منهما مستقلاً هو تحديداً نقطة الفصل التي تحتاجها المكتبة.

الفائدة الجانبية الأخرى تخصّ البحث. في وضع الـ drawer يرسو حقل البحث في أعلى ورقة تغطّي معظم الشاشة، ولوحة المفاتيح تدفع الورقة لأعلى بدل أن تدفنها. الشيفرة نفسها، والمكوّن نفسه، والشكل المناسب للجهاز. ليس media-query داخل CSS المستهلك، بل عنصر أساسي يعرف الفرق بنفسه.

## Slots لكلّ شيء (أربعة عشر Slot)

كانت النسخة القديمة كتلة واحدة صمّاء. تنسيق رسالة الخطأ يعني ترقيع المكوّن. تغيير أيقونة السهم يعني ترقيع المكوّن. استبدال علَم الدولة بواحد من CDN خاصّ بك يعني ترقيع المكوّن.

النسخة الجديدة تملك السلوك وتترك للمستهلك الشكل:

```typescript
defineSlots<{
  prefix?: () => unknown;
  suffix?: (props: { validationState: 'idle' | 'valid' | 'error'; validation: PhoneValidationResult }) => unknown;
  'valid-icon'?: () => unknown;
  'error-icon'?: (props: { reason: string }) => unknown;
  hint?: (props: { country: string; formatHint: string; example: string | null }) => unknown;
  error?: (props: { message: string; reason: string; validation: PhoneValidationResult }) => unknown;
  trigger?: (props: { selectedCountry: CountryOption | null; open: boolean; sizeClasses: string }) => unknown;
  chevron?: (props: { open: boolean }) => unknown;
  flag?: (props: { country: CountryOption; context: 'trigger' | 'item' }) => unknown;
  item?: (props: { country: CountryOption; selected: boolean; disabled: boolean; select: () => void }) => unknown;
  'group-header'?: (props: { label: string; group: 'suggested' | 'all' }) => unknown;
  search?: (props: { value: string; setValue: (v: string) => void; isSearching: boolean }) => unknown;
  loading?: () => unknown;
  empty?: (props: { query: string }) => unknown;
}>();
```

أربعة عشر slot موزّعة على ثلاث مجموعات. المجموعة البصرية (`prefix`, `suffix`, وslot-ا الأيقونتين، و`hint`, و`error`) تزيّن الحقل نفسه. مجموعة مُشغِّل المنتقي (`trigger`, `chevron`, `flag`) تستبدل الزرّ الذي ينقر عليه المستخدم. ومجموعة محتوى المنتقي (`search`, `loading`, `empty`, `group-header`, `item`) تستبدل أيّ شيء داخل الـ popover أو الـ drawer.

معظم slot-ات المنتقي تُمرَّر مباشرة إلى `ACountrySelect`. المكوّن نفسه يتولّى التوجيه:

```vue
<template v-if="$slots.trigger" #trigger="slotProps">
  <slot name="trigger" v-bind="slotProps" />
</template>
<template v-if="$slots.chevron" #chevron="slotProps">
  <slot name="chevron" v-bind="slotProps" />
</template>
<!-- ... and so on for each forwarded slot -->
```

الشرط `v-if="$slots.x"` هنا مهم. بدونه سيبدو الـ `<template #x>` المُمرَّر موجوداً دائماً من منظور الأب، فلا يحصل الرسم الاحتياطي داخل `ACountrySelect` على أيّ فرصة للعمل. الحارس يقول ببساطة: "لا تُمرّر إلا إذا قدّم المستهلك هذا الـ slot فعلاً".

مثال تخصيص واقعي:

```vue
<ATellInput v-model:phone="phone" v-model:country="country" show-validation>
  <template #suffix="{ validationState }">
    <Sparkle v-if="validationState === 'valid'" class="size-4 text-amber-400" />
  </template>
  <template #error="{ message, reason }">
    <p class="text-destructive text-xs">
      <code class="bg-muted rounded px-1 py-0.5">{{ reason }}</code> {{ message }}
    </p>
  </template>
  <template #empty="{ query }">
    <div class="px-3 py-6 text-center text-sm">
      Nothing matched "<strong>{{ query }}</strong>".
      <button type="button" class="underline" @click="suggestCountry(query)">
        Suggest a country
      </button>
    </div>
  </template>
</ATellInput>
```

وظيفة مكوّن المكتبة أن يملك السلوك (التحليل، والتحقّق، والاكتشاف، وإدارة الحالة)، وأن يترك للمستهلك التحكّم بشكل هذه الأشياء. أربعة عشر slot هي كلفة هذه الصفقة، وهي كلفة تستحقّ.

المبدأ نفسه ينطبق على الـ props غير البصرية:

```typescript
flagUrl?: (iso2: string, width: number) => string;
searcher?: (query: string, country: CountryOption) => boolean;
countries?: CountryOption[];
detector?: (options: DetectCountryOptions) => Promise<string | null | undefined>;
errorMessages?: Record<PhoneValidationReason, string>;
```

يُتيح لك `flagUrl` استبدال `flagcdn.com` بـ CDN خاصّ بك، وهو مفيد إن كان لديك CSP لا يسمح بصور من طرف ثالث. ويُتيح لك `searcher` استبدال مطابقة السلاسل الفرعية بمطابقة بادئة، أو مطابقة ضبابية، أو مطابقة بالاسم العربي، أو أيّ شيء يحتاجه مستخدموك فعلاً. ويُتيح لك `countries` شحن قائمتك المُنتقاة والاستغناء كلياً عن نداء `REST Countries`, وهو مفيد إن كنتَ حسمتَ أنّك تخدم دول الخليج مثلاً. أمّا `errorMessages` فمعنيّ بالتوطين: مرّر جدولاً عربياً وستُعرض أسباب التحقّق بالعربية.

كلّ prop له افتراضي منطقي. النداء الذي لا يحتاج تكويناً ما زال يعمل كما هو.

## جدول رموز الاتصال المتزامن، ولماذا ليس اختيارياً

عند أوّل تركيب للمكوّن في تبويب جديد، لا يكون نداء `REST Countries` قد اكتمل. أيّ فهارس يبنيها `usePhoneValidation` (`byValue`, `byDialDigits`) تكون خرائط فارغة. لو كتب المستهلك `default-country="20"` في قالبه متوقّعاً أن يظهر المنتقي وقد اختار مصر، فما سيحصل عليه بلا مساعدة هو منتقٍ فارغ. فهرس أرقام الاتصال يعيد `[]`, ويضبط الـ watcher قيمة `selectedIso2` إلى `''`, ولن تظهر مصر إلا حين يعود نداء الشبكة.

لذلك يُدرِج المكوّن جدولاً احتياطياً متزامناً في داخله:

```typescript
const DIAL_TO_ISO2_FALLBACK: Record<string, string> = {
  '1': 'US',
  '7': 'RU',
  '20': 'EG',
  '27': 'ZA',
  '33': 'FR',
  '44': 'GB',
  '49': 'DE',
  '52': 'MX',
  '55': 'BR',
  '61': 'AU',
  '81': 'JP',
  '86': 'CN',
  '91': 'IN',
  '212': 'MA',
  '966': 'SA',
  '971': 'AE',
  // ... ~50 entries
};
```

ويتحقّق `resolveCountryIdentifier` أولاً من الفهرس المحمَّل، ثم من هذا الجدول:

```typescript
function resolveCountryIdentifier(raw: string | undefined | null): string {
  const v = String(raw ?? '').trim();
  if (!v) return '';
  if (/^[A-Za-z]{2}$/.test(v)) return v.toUpperCase();
  const dial = v.replace(/^\+/, '');
  if (!/^\d+$/.test(dial)) return '';
  const match = getCountriesByDial(dial)[0];
  if (match) return match.value;
  return DIAL_TO_ISO2_FALLBACK[dial] ?? '';
}
```

الاتجاه المعاكس، أي التحويل من ISO2 إلى رقم اتصال من أجل v-model, يُجري الفحص نفسه:

```typescript
function dialNumberFor(iso2: string): number | null {
  if (!iso2) return null;
  const fromIndex = getCountryByValue(iso2)?.raw_data?.dial_digits;
  const digits = fromIndex ?? Object.entries(DIAL_TO_ISO2_FALLBACK).find(([, v]) => v === iso2)?.[0];
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}
```

الجدول تسوية معلومة سلفاً. خمسون مدخلاً لا تكفي لتغطية كلّ رمز اتصال، واختيار الخمسين ينحاز إلى رأي: أكثر الدول سكاناً بالإضافة إلى تلك التي أحتاجها شخصياً. المستهلك الذي يمرّر `default-country="678"` (فانواتو) عند التركيب دون أيّ بيانات دولة مخبّأة لن يحصل على شيء من هذا البحث. بعد ثوانٍ قليلة، حين يعود نداء الشبكة، سيحسم المنتقي القيمة بشكل صحيح. غاية الاحتياطي أن تعمل الحالة الشائعة (95%) دون وميض، والذيل الطويل ينتهي إلى الصحيح.

داخل التطبيق تستطيع انتظار النداء. أمّا في المكتبة فلا تقدر على إلزام كلّ مستهلك بتعليق تركيب مكوّنه انتظاراً لواجهة برمجية طرف ثالث، ولا تستطيع في المقابل شحن 80 كيلوبايت من بيانات الدول بشكل فوري. الجدول المتزامن هو المخرج الثالث.

## آخر الاختيارات كفاصل عند التعادل

مطابقة أطول بادئة في الطبقة الثالثة ليست دائماً واضحة بلا لبس. الرمز `1` يطابق كتلة NANP كاملة، أكثر من 25 دولة. الأبجدي الأوّل يعني "ساموا الأمريكية" أو أيّاً كانت الدولة الأسبق أبجدياً في كلّ مرّة. هذا ليس افتراضاً مفيداً لأيّ أحد.

لذلك تقرأ الطبقة الثالثة من `localStorage`:

```typescript
const recents = readRecents();
const recentHit = recents
  .map((iso2) => group.find((c) => c.value === iso2))
  .find((c): c is CountryOption => Boolean(c));
if (recentHit) return { country: recentHit, nationalNumber };
return { country: group[0], nationalNumber };
```

يكتب المنتقي في `ali_ui_country_recents_v1` كلّما اختار المستخدم دولةً صراحةً، ويقرأ المطابِق منها عند حصول الالتباس. إن كنتَ تعيش في كندا وسبق أن استعملتَ الحقل، فأوّل `+1` تكتبه سيُحلّ إلى كندا. وإن لم تستعمله من قبل، ستحصل على الاحتياطي الأبجدي، وهو خطأ نعم، لكنّه يقع مرّة واحدة فقط.

لمسة صغيرة، لكنّها من ذلك النوع الذي يحوّل "هذا يعمل تقنياً" إلى "هذا مبنيّ بيدِ من استعمله فعلاً".

## عن ماذا كانت إعادة كتابة المكتبة حقيقةً

كانت النسخة الأصلية معنيّة بالصحّة: اضطراب موضع المؤشّر، وأسباب التحقّق، ومعالجة RTL/LTR, والحالات السبع المحدّدة التي على حقل الهاتف أن يميّز بينها. لم يختفِ أيّ من ذلك. كلّه لا يزال حاضراً في هذه النسخة: الدالّة المسنِدة `dropLeadingZeros`, والقيم السبع لـ enum المسمّى `PhoneValidationReason`, ونمط التنسيق ثنائي الاتجاه القائم على غلاف LTR فوق مُدخل RTL. تلك الأشياء لم تكن خاطئة، بل كانت الأساس الذي يُبنى عليه.

ما أضافته إعادة كتابة المكتبة كلّه يتعلّق بحقيقة أنّها لم تعد تخدم تطبيقاً واحداً. فصل بين ISO2 ورمز الاتصال يصمد أمام رموز الاتصال الملتبسة. سلسلة اكتشاف بيئية قابلة للاستبدال وصالحة للعمل دون اتصال. منتقٍ يعمل popover على الحاسوب وdrawer على الهاتف، ولكلّ حالة صنفها الخاصّ. أربعة عشر slot كي لا يشتبك نظام تصميم المستهلك مع المكوّن. جدول رموز اتصال متزامن لأنّ مستهلك المكتبة لا يستطيع انتظار الشبكة. آخر الاختيارات فاصلاً عند التعادل لأنّ "الأبجدي الأوّل" هو مظهر الكسل بعينه.

تضاعف عدد الأسطر تقريباً. النسخة الأصلية كانت 160 سطراً للمكوّن مع 540 سطراً للـ composable, بينما النسخة الجديدة عدّة مئات من الأسطر موزّعة على مكوّنَين واثنين من الـ composables. تضاعف السطح البرمجي أكثر من مرّة. ومع ذلك يظلّ النداء بلا تكوين قابلاً للاختصار في ثلاثة أسطر:

```vue
<ATellInput v-model:phone="phone" v-model:country="country" show-validation />
```

لكلّ prop جديد افتراضي يعكس ما كانت النسخة الداخلية تفعله تلقائياً. من يريد "حقل هاتف فحسب" يحصل عليه. ومن يريد "حقل هاتف بأعلامنا، وقائمة دولنا، ومسند بحثنا، ورسائل أخطائنا" يجد كلّ نقاط الفصل التي يحتاجها.

الدرس الذي سأحمله معي إلى المرّة القادمة: جعل مكوّن قابلاً للنشر يتعلّق أساساً برصد الآراء التي فرضتَها على نفسك، وتحويل كلّ واحد منها إلى نقطة فصل. كلّ `restcountries.com` مثبّت، وكلّ احتياطي "السعودية ومصر"، وكلّ قائمة منسدلة ظاهرة بلا انقطاع: تلك الأمور لم تكن خطأً بالنسبة للتطبيق، لكنّها الأمور التي لن تنجو مع المستهلك التالي. ابحث عنها، وسمِّها، واستبدل كلاً منها بافتراضي مع إمكانية تجاوز. الافتراضي يُبقي مستهلكك القديم راضياً، والتجاوز يفتح الباب للجديد.
