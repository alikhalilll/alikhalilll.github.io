---
title: ملاحظات من إعادة كتابة ATellInput كمكتبة مُنشَرة
description: تحويل حقل هاتف داخل تطبيق إلى مكوّن Vue مُنشَر فرض تغييرات محدّدة. تجربة استخدام مبنية على الاكتشاف التلقائي، وفصل بين رمز ISO2 ورقم الاتصال، ومنتقي متجاوب عبر Popover وDrawer، وSlots لكل شيء.
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

بدأ `ATellInput` حياته داخل تطبيق واحد: خيار احتياطي يميل إلى السعودية أو مصر، وطلب داخلي لـ `RestCountries`، وتحقّق يظهر عبر v-model فقط، وقائمة منسدلة ظاهرة على الشاشة دائماً. أنجزت تلك النسخة الجانب الصحيح: قفزات المؤشر، وأسباب التحقّق، والاتجاه ثنائي الاتجاه. وأصابت معظم الأمور لمستهلك واحد.

هذه التدوينة تحكي ما حدث حين حاولتُ نشره.

يعيش المكوّن الآن في `@alikhalilll/ui/tell-input`، والمكتبة المُنشَرة لها توصيف وظيفي مختلف. لا يمكنك أن تفرض السوق الذي تستهدفه. ولا يمكنك افتراض نظام تصميم المستهلك. ولا يمكنك توقّع أن ينتظر كل نقطة تركيب استجابة من واجهة برمجية خارجية. ولا يعود لك أن تقرّر ما إذا كان المستخدم على هاتف أو حاسوب محمول. حافظت إعادة الكتابة على صحّة النسخة الأصلية وأضافت ما يحتاجه مستهلك المكتبة فعلياً، ولكلّ تغيير تقريباً علّة محدّدة أو قيد قديم في النسخة السابقة هو ما دفع إليه.

جمعتُ التغييرات حول السبعة التي استحقّت مكانها.

## نموذجان، بشكلين: الرقم يخرج، وISO2 يظل بالداخل

بدت الواجهة القديمة نظيفة من بعيد:

```typescript
const phoneModelValue = defineModel<string>('phone', { required: true });
const countryModelValue = defineModel<string>('country', { required: true });
```

كان `country` نصّاً يحتوي أرقام الاتصال: `"20"` لمصر، `"44"` للمملكة المتحدة. سهل التحويل إلى JSON، وسهل ترميزه في URL، وسهل وضعه في عمود في قاعدة بيانات.

لكنّه لم يكن قادراً على التمييز بين الولايات المتحدة وكندا.

الرمز `+1` يتشاركه أكثر من 25 دولة ضمن NANP. إن اختار مستخدم كندي "كندا" من القائمة وأصدر v-model القيمة `"1"`, فلن يعرف الأب أي `+1` كان المقصود. أعِد تحميل الصفحة، ورطّب الحالة من URL، وستستعيد `"1"` مع منتقٍ يعرض أيّ دولة صادف أن ترتّبها القائمة أولاً. كان نموذج "نصّ يحتوي أرقام الاتصال" تسلسلاً مفقوداً لشيء يتكوّن من قطعتين.

النموذج الجديد يفصل بينهما:

```typescript
const phone = defineModel<string>('phone', { default: '' });
const country = defineModel<number | null>('country', { default: null });

const selectedIso2 = ref<string>('');
```

صار `country` رقماً الآن (`20`, `1`, `null`) لأنّ رموز الاتصال _هي_ أرقام، ولأنّ `Number` ينجو من رحلات URL وDB وJSON دون غرائب اقتطاع الأحرف. لكنّ المكوّن يتتبّع أيضاً `selectedIso2` داخلياً يملكه المنتقي. تبقى القيمتان متزامنتين عبر زوج من الـ watchers، واحد للخارج وواحد للداخل، وللداخلي حارس صغير لكنّه مهم:

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

السطر `if (dialNumberFor(selectedIso2.value) === next) return;` هو ما أريد الإشارة إليه. حين يكتب الأب `country = 1` مرّة أخرى في النموذج وكان المنتقي يعرض كندا مختارة أصلاً، يُطلَق الـ watch، لكن رمز الاتصال يتطابق مسبقاً، فيعود الـ watch دون المساس بـ `selectedIso2`.
بدون هذا الحارس، سيحلّ الـ watcher الرمز `"1"` إلى أوّل دولة NANP بحسب الترتيب الأبجدي ويقلب كندا بصمت إلى تلك الدولة أياً كانت. الحارس يصون الحالة الأغنى.

الـ watch الخارجي بوضع `flush: 'sync'` كي يبقى العلَم `autoSettingCountry` متّسقاً. عندما يختار المطابِق دولة تلقائياً بناءً على الإدخال المكتوب، لا نريد أن يُحسَب ذلك "اختياراً يدوياً" يُقفل الاكتشاف التلقائي لاحقاً.

نصفان لبيانات الدولة، ونموذجان مميّزان، ومصدر حقيقة واحد لكلٍّ منهما.

## الاكتشاف أولاً: المنتقي مخفي افتراضياً

المكوّن القديم كان يرسم القائمة دائماً: علم على اليسار، وحقل الإدخال على اليمين. المكوّن الجديد يعرض حقل الإدخال وحده افتراضياً. تنزلق القائمة إلى الظهور فقط عندما يكتب المستخدم شيئاً يتعرّف عليه المطابِق:

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

يتقلّص `max-w` إلى صفر حين لا يكون هناك اختيار، ويتحرّك ليفتح عند أوّل تطابق ناجح. يعيد `detectFromInput="false"` المنتقيَ الظاهر دائماً لمن يريد الشكل القديم.

السلوك يحمل رأياً محدّداً. معظم المستخدمين في معظم الدول _لا_ يكتبون بادئة `+`. يكتبون الرقم الذي يكتبونه في هاتفهم: `01066105963` في القاهرة، `07911 123456` في مانشستر. القائمة التي "يضطرّون للتفاعل معها" في كلّ حقل هاتف آخر هي، لهؤلاء المستخدمين، خطوة لا يحتاجونها. أخفِها. اكتشف ما يفعلونه. أظهرها فقط حين يقع الاكتشاف على شيء.

جزء "اكتشف ما يفعلونه" هو الجزء الوحيد غير التافه. يجري عبر ثلاث طبقات في `matchLeadingDialCode`:

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

توجد الطبقات لأنّ كلّ واحدة تعالج فئة من الإدخال لا تستطيع الطبقات الأخرى معالجتها.

الطبقة الأولى تأخذ ما كتبه المستخدم، تُلحق قبله `+`, ثم تطلب من `libphonenumber` تحليله كرقم دولي. إذا كتب المستخدم `447911123456`, فسيتطابق مع المملكة المتحدة. وإذا كتب `1416...`, فسيتطابق مع كندا تحديداً (وليس NANP العام)، لأنّ `libphonenumber` يحتوي قواعد رموز المناطق مدمجة. توجد كتلة catch لأنّ `libphonenumber` يرمي استثناءً عند الإدخال الجزئي. `447` ليس رقماً مكتملاً؛ التحليل يرفع استثناءً، فننتقل إلى الطبقة التالية.

الطبقة الثانية هي المسار للمستخدمين الذين يكتبون الرقم الذي يستعملونه محلياً فعلاً. `01066105963` لا يبدأ برمز اتصال، فلا تستطيع الطبقة الأولى مساعدتنا. لكن إن كنّا _نعرف بصمت_ أنّ المستخدم غالباً في مصر (من عنوان IP أو المنطقة الزمنية، والمزيد عن ذلك لاحقاً)، يمكننا تمرير `"EG"` كتلميح للمحلِّل وسيتعرّف `libphonenumber` على `01066105963` كرقم محمول مصري صحيح، ويجرّد الصفر الأول (البادئة الوطنية لمصر)، ويعيد الرقم الوطني الأساسي المعياري `1066105963`. الحارس `digits.length >= 4` يمنع المحلِّل من معاملة بدايات بأرقام منطقة من رقمين على أنّها أرقام كاملة.

الطبقة الثالثة هي الخيار الاحتياطي لحالة "كتبتَ `44` ولا شيء بعد ذلك". لا يستطيع أيّ من مساري `libphonenumber` المطابقة؛ الإدخال قصير جداً. لكنّ فهرس أرقام الاتصال الخاص بنا يستطيع: `byDialDigits.get('44')` يعيد مجموعة المملكة المتحدة، طولها 1، انتهى. شكل الـ `Map<string, CountryOption[]>` المُقسَّم من النسخة القديمة يثبت جدواه هنا.

ثلاث طبقات تبدو كثيرة. هي الحدّ الأدنى: كلّ طبقة تعالج مدخلات ترفضها الطبقتان الأخريان.

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

يقرأ `useDebounceFn` قيمة `phone.value` عند إطلاق المؤقّت لا عند جدولته، فتتلاشى دفعة من ضغطات المفاتيح إلى تحليل واحد. يمنع `userPickedCountry.value` المكتشفَ التلقائيّ من تدمير اختيار يدوي. متى استخدم المستخدم القائمة، ينسحب المطابِق. أمّا مسح الحقل فلا يُؤخَّر؛ يعيد المنتقيَ إلى الاختفاء فوراً:

```typescript
if (!cleaned) {
  autoSettingCountry.value = true;
  selectedIso2.value = '';
  phone.value = '';
  userPickedCountry.value = false;
  return;
}
```

تأخير المسح يعني بقاء القائمة ظاهرة لمدة 150ms بعد أن يفرغ الحقل، وذلك يبدو خاطئاً في كلّ مرّة.

## سلسلة اكتشاف البيئة (ولماذا هي قابلة للاستبدال)

تعتمد الطبقة الثانية أعلاه على `inferredCountry.value`: أفضل تخمين للمكوّن حول موقع المستخدم، يُضبط بصمت قبل أن يكتب أيّ شيء. كان "أفضل تخمين" في النسخة القديمة قيمة احتياطية مُثبَّتة نحو السعودية أو مصر، لأنّ ذانك كانا السوقين اللذين تستهدفهما النسخة الداخلية. المكتبة لا يمكنها تبنّي هذا الافتراض.

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

أربع إشارات، تُقيَّم بترتيب الكلفة: الرخيص المخبّأ أولاً، والمُكلف الذي يمرّ عبر الشبكة أخيراً.

1. تخزين مؤقّت في `sessionStorage`. حسم المستخدم دولته خلال هذه الجلسة؛ لا نعيد العمل.
2. تحديد الموقع الجغرافي عبر IP باستخدام `ipapi.co` (قابل للتكوين). أدقّ إشارة، لكنّها تكلّف طلب شبكة وقدراً يسيراً من الخصوصية. الاستراتيجية `strategy: 'locale'` تتخطّى هذه الخطوة لمن لا يريد الطلب.
3. المنطقة الزمنية، عبر `Intl.DateTimeFormat().resolvedOptions().timeZone`, ويُبحَث عنها في جدول أعددته يدوياً يربط `Africa/Cairo` بـ `EG`, و`Asia/Riyadh` بـ `SA`, و`Europe/London` بـ `GB`, وهكذا. يغطّي الجدول أكثر المناطق سكاناً؛ وهو صريح بأنّه لا يغطّي كلّ منطقة. عدم التطابق يمرّ إلى ما بعده.
4. `navigator.language` الذي يعطي `en-EG` أو `ar-SA` وما شابه. لاحقة المنطقة هي الدولة. أقلّ موثوقية (المستخدمون يتنقّلون؛ لغات المتصفح لا)، لكنّها بلا كلفة.
5. القيمة الافتراضية التي يوفّرها المتصل. `defaultCountry: 'US'` هو الافتراضي في المكتبة؛ للمستهلكين اختيار غيره.

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

`AbortController` مع مؤقّت من ثانيتين يعني أنّ خدمة IP بطيئة لا تستطيع حجب سلسلة الاكتشاف لأكثر من `timeoutMs`. تُبقي `credentials: 'omit'` الكوكيز خارج الطلب إلى أيّ جهة خارجية ضبطتَها. يُتحقَّق من شكل الاستجابة عبر `/^[A-Z]{2}$/` لأنّ بعض واجهات IP تعيد `"GB"`, وبعضها يعيد `"United Kingdom"`, وبعضها يعيد `null` حين لا تعرف. التعبير النمطي هو البوّابة.

يعيش `detectCountry` خارج المكوّن عن قصد:

```typescript
import { detectCountry } from '@alikhalilll/ui/tell-input';

const country = await detectCountry({ strategy: 'locale' });
```

لا اعتماد على Vue، ولا refs تفاعلية، ولا `onMounted`. يعمل في server middleware يريد ضبط كوكي، وفي CLI يريد طباعة أين يُحتمل أن يكون المستخدم، وفي اختبار وحدة يريد التحكّم بالاستراتيجية. الغلاف التفاعلي (`useCountryDetection`) قشرة رقيقة حوله للحالة داخل المكوّن. سطحان، وتنفيذ واحد.

والسلسلة كلّها قابلة للاستبدال. إذا كنت تكتشف الجغرافيا في الخادم أصلاً وتمرّرها عبر SSR، فلن ترغب في أن يعيد المكوّن جلب IP:

```vue
<ATellInput
  v-model:phone="phone"
  v-model:country="country"
  :detector="(opts) => Promise.resolve(serverDetectedCountry.value)"
/>
```

يستبدل الـ prop `detector` السلسلةَ المدمجةَ بالكامل. يواصل المكوّن تشغيل بقية منطق الاكتشاف (يضبط الدولة المستنتجة، ويستخدمها كتلميح للطبقة الثانية، وهكذا)، لكنّ _مصدر_ الإجابة يصير ما قلتَه أنت.

## منتقٍ متجاوب: مكوّن واحد، تقديمان

كانت قائمة الدولة القديمة popover في كلّ عرض. على الهاتف كان ذلك يعني قائمة قابلة للتمرير من 250 صفّاً مثبّتة على زرّ عرضه 38 بكسل، مع حقل بحث يخفيه لوحة المفاتيح على الشاشة. كان يعمل. كان يعمل بشكل سيّئ.

يستخدم المنتقي الجديد الأساسي `AResponsivePopover` من المكتبة نفسها، وهو popover على الحاسوب وdrawer عبر `vaul-vue` على الجوّال:

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

يُمرَّر prop-ان للأصناف (`popoverClass` و`drawerClass`) بشكل منفصل، فيتمكّن المستهلكون من تنسيق كلّ تقديم دون أن يرث الآخر ذلك التنسيق. يريد الـ popover `max-h-[min(22rem,var(--reka-popover-content-available-height))]` لأنّ `reka-ui` يعرض الارتفاع المتاح كمتغيّر CSS؛ ويريد الـ drawer `max-h-[80vh]` لأنّه ورقة سفلية و"80% من نافذة العرض" حدّ منطقي. فرض مجموعة أصناف واحدة على كليهما سيكون خطأً لأحدهما؛ والسماح للمستهلك بتجاوز كلّ منهما على حدة هو تماماً الشقّ الذي تحتاجه المكتبة.

الفائدة الجانبية الأخرى هي البحث. في وضع الـ drawer، يرسو حقل البحث في أعلى ورقة تشغل معظم الشاشة، ولوحة المفاتيح تدفعها لأعلى بدل أن تدفنها. الشيفرة نفسها، والمكوّن نفسه، والشكل الصحيح للجهاز. ليس media-query داخل CSS المستهلك؛ بل عنصر أساسي يعرف الفرق.

## Slots لكلّ شيء (أربعة عشر منها)

كانت النسخة القديمة كتلة واحدة. إعادة تصميم رسالة الخطأ كانت تعني ترقيع المكوّن. تغيير أيقونة السهم كان يعني ترقيع المكوّن. استبدال علم الدولة بواحد من CDN خاصّ بك كان يعني ترقيع المكوّن.

النسخة الجديدة تملك السلوك وتترك للمستهلك ملكية الشكل:

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

أربعة عشر slot، وثلاث مجموعات. البصرية منها (`prefix`, `suffix`, وslot-ا الأيقونتين، و`hint`, و`error`) تزخرف الحقل نفسه. slot-ات مُشغِّل المنتقي (`trigger`, `chevron`, `flag`) تستبدل الزرّ الذي ينقر عليه المستخدم. وslot-ات محتوى المنتقي (`search`, `loading`, `empty`, `group-header`, `item`) تستبدل أيّ شيء داخل الـ popover أو الـ drawer.

معظم slot-ات المنتقي تُمرَّر مباشرة إلى `ACountrySelect`. المكوّن نفسه يتولّى التمرير:

```vue
<template v-if="$slots.trigger" #trigger="slotProps">
  <slot name="trigger" v-bind="slotProps" />
</template>
<template v-if="$slots.chevron" #chevron="slotProps">
  <slot name="chevron" v-bind="slotProps" />
</template>
<!-- ... and so on for each forwarded slot -->
```

الشرط `v-if="$slots.x"` مهم. بدونه، يُعتبَر `<template #x>` المُمرَّر موجوداً دائماً من منظور الأب، فلا يحظى الرسم الاحتياطي لـ `ACountrySelect` بأيّ فرصة للعمل. الحارس يقول: "مرّر فقط إن قدّم المستهلك هذا الـ slot فعلاً".

تخصيص واقعي:

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

مهمّة مكوّن المكتبة أن يملك _السلوك_ (التحليل، التحقّق، الاكتشاف، الحالة) وأن يترك للمستهلك التحكّم بشكل تلك الأشياء. أربعة عشر slot ثمنُ هذه الصفقة، وهو ثمن يستحقّ.

المبدأ ذاته ينطبق على الـ props غير البصرية:

```typescript
flagUrl?: (iso2: string, width: number) => string;
searcher?: (query: string, country: CountryOption) => boolean;
countries?: CountryOption[];
detector?: (options: DetectCountryOptions) => Promise<string | null | undefined>;
errorMessages?: Record<PhoneValidationReason, string>;
```

يسمح لك `flagUrl` باستبدال `flagcdn.com` بـ CDN خاصّ بك؛ مفيد إن كان لديك CSP لا يسمح بصور من طرف ثالث. ويسمح لك `searcher` باستبدال مطابقة السلاسل الفرعية بمطابقة البادئة، أو مطابقة ضبابية، أو مطابقة بالاسم العربي، أو ما يحتاجه مستخدموك فعلاً. ويسمح لك `countries` بشحن قائمتك المُنتقاة وتخطّي طلب `REST Countries` كلياً؛ مفيد إن كنتَ قرّرتَ أنّك تخدم دول الخليج فحسب مثلاً. أمّا `errorMessages` فهو للتوطين: مرّر جدولاً عربياً وستُعرَض أسباب التحقّق بالعربية.

كلّ prop له افتراضي منطقي. النداء بلا تكوين ما زال يعمل.

## جدول رموز الاتصال المتزامن، ولماذا ليس اختيارياً

عند أوّل تركيب للمكوّن في تبويب جديد، لا يكون طلب `REST Countries` قد اكتمل. أيّ فهارس يبنيها `usePhoneValidation` (`byValue`, `byDialDigits`) تكون خرائط فارغة. إذا كتب المستهلك `default-country="20"` في قالبه، متوقّعاً أن يظهر المنتقي وقد اختار مصر، فما سيحصل عليه دون مساعدة هو منتقٍ فارغ. سيعيد فهرس أرقام الاتصال `[]`, وسيضبط الـ watcher قيمة `selectedIso2` إلى `''`, ولن تظهر مصر إلا حين يعود طلب الشبكة.

لذا يخبز المكوّن جدولاً احتياطياً متزامناً:

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

ويتحقّق `resolveCountryIdentifier` أوّلاً من الفهرس المحمَّل، ثم من هذا الجدول:

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

العكس، أي التحويل من ISO2 إلى رقم اتصال من أجل v-model، يجري الفحص نفسه:

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

الجدول حلّ وسط معلوم. خمسون مدخلاً لا يمكن أن تغطّي كلّ رمز اتصال، واختيار الخمسين ينطوي على رأي: أكثر الدول سكاناً بالإضافة إلى تلك التي أحتاجها شخصياً. المستهلك الذي يمرّر `default-country="678"` (فانواتو) عند التركيب بدون أيّ بيانات دولة مخبّأة لن يحصل على شيء من هذا البحث. بعد ثوانٍ قليلة، حين يعود طلب الشبكة، سيحلّ المنتقي القيمة بشكل صحيح. يوجد الاحتياطي ليجعل حالة 95% تعمل دون وميض؛ والذيل الطويل ينتهي إلى الصحيح.

داخل التطبيق، تستطيع انتظار الطلب. كمكتبة، لا تستطيع أن تُلزم تركيب كلّ مستهلك بالانتظار على واجهة برمجية خارجية، ولا يمكنك شحن 80 كيلوبايت من بيانات الدول بحماسة. الجدول المتزامن هو المسار الثالث.

## السجلّات الأخيرة كفاصل عند التعادل

مطابقة أطول بادئة في الطبقة الثالثة ليست دائماً بلا لبس. يطابق `1` كامل كتلة NANP وأكثر من 25 دولة. الأبجدي الأوّل يعني "ساموا الأمريكية" أو أيّاً كانت الدولة الأسبق ترتيباً في كلّ مرّة. ليس افتراضاً مفيداً لأحد.

لذلك تقرأ الطبقة الثالثة من `localStorage`:

```typescript
const recents = readRecents();
const recentHit = recents
  .map((iso2) => group.find((c) => c.value === iso2))
  .find((c): c is CountryOption => Boolean(c));
if (recentHit) return { country: recentHit, nationalNumber };
return { country: group[0], nationalNumber };
```

يكتب المنتقي في `ali_ui_country_recents_v1` كلّما اختار المستخدم دولةً صراحةً، ويقرأ المطابِق منها عند الالتباس. إن كنتَ تعيش في كندا واستخدمت الحقل من قبل، فإنّ أوّل `+1` تكتبه سيُحلّ إلى كندا. وإن لم تستخدمه أبداً، فستحصل على الاحتياطي الأبجدي: خطأ نعم، لكن مرّة واحدة فقط.

لمسة صغيرة، لكنّها من النوع الذي يحوّل "هذا يعمل من الناحية التقنية" إلى "هذا يبدو مبنياً بيد من استخدمه".

## عمّاذا كانت إعادة كتابة المكتبة فعلاً

كانت النسخة الأصلية عن الصحّة: قفزات المؤشر، وأسباب التحقّق، ومعالجة ثنائي الاتجاه، والحالات السبع المحدّدة التي على حقل هاتف أن يميّز بينها. لم يذهب أيّ من ذلك. كلّ ذلك ما زال في هذه النسخة: الدالّة المُسنِدة `dropLeadingZeros`, وقيم enum السبع لـ `PhoneValidationReason`, ونمط ثنائي الاتجاه بغلاف LTR فوق مدخل RTL. هذه الأشياء لم تكن خطأ؛ كانت الأساس.

ما أضافته إعادة كتابة المكتبة هو كلّ ما يخصّ _عدم كوننا تطبيقاً واحداً_. فصل ISO2 عن رمز الاتصال يصمد أمام رموز الاتصال الملتبسة. سلسلة اكتشاف بيئية قابلة للاستبدال وآمنة في وضع عدم الاتصال. منتقٍ يكون popover على الحاسوب وdrawer على الهاتف مع خطّافي أصناف منفصلين لكلٍّ منهما. أربعة عشر slot كي لا يشتبك نظام تصميم المستهلك مع المكوّن. جدول رموز اتصال متزامن لأنّ مستهلكي المكتبة لا يستطيعون انتظار الشبكة. السجلّات الأخيرة كفاصل عند التعادل لأنّ الأبجدي الأوّل هو ما يبدو عليه "الكسل".

تضاعف عدد الأسطر تقريباً. كانت النسخة الأصلية 160 سطراً للمكوّن بالإضافة إلى 540 للـ composable؛ النسخة الجديدة عدّة مئات من الأسطر عبر مكوّنين واثنين من الـ composables. تضاعف السطح البرمجي بأكثر من مرّة. ومع ذلك ما زال النداء بلا تكوين يتّسع في ثلاثة أسطر:

```vue
<ATellInput v-model:phone="phone" v-model:country="country" show-validation />
```

كلّ prop جديد له افتراضي يعكس ما كانت تفعله النسخة داخل التطبيق بالصدفة. من يريد "حقل هاتف فحسب" يحصل عليه. ومن يريد "حقل هاتف بأعلامنا، وقائمة دولنا، ومسند بحثنا، ورسائل أخطائنا" يحصل على كلّ الخطاطيف التي يحتاجها.

الدرس الذي سأحمله إلى ما بعدها: جعل مكوّن قابلاً للنشر يتعلّق أساساً بتحديد الآراء التي خبزتَها لنفسك وتحويلها إلى خطاطيف. كلّ `restcountries.com` مُثبَّت، وكلّ احتياطي "السعودية ومصر"، وكلّ قائمة منسدلة ظاهرة دائماً: تلك الأمور لم تكن خاطئة _بالنسبة للتطبيق_, لكنّها الأمور التي لن تنجو مع المستهلك التالي. ابحث عنها، وسمِّها، واستبدل كلاً منها بافتراضي وتجاوز. الافتراضي يُبقي مستهلكك القديم راضياً؛ والتجاوز يُدخل الجديد.
