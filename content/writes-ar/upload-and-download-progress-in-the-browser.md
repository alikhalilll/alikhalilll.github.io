---
title: غلاف مخصَّص لـ fetch، وXHR لتقدُّم الرفع
description: لماذا يبقى fetch الأصلي الخيار الافتراضي الصحيح، وكيف تبني حوله غلافاً متعدّد الطبقات (رابط أساسي، ومهلات، واعتراضات، وإعادة محاولات)، ومتى تظل بحاجة إلى XHR.
date: 2025-09-22
updatedAt: 2025-09-22
lang: ar
keywords:
  - fetch API
  - XMLHttpRequest
  - XHR
  - تقدُّم الرفع
  - تقدُّم التنزيل
  - AbortController
  - AbortSignal
  - عميل HTTP مخصَّص
  - Interceptors
  - إعادة المحاولة
  - Exponential Backoff
  - TypeScript
---

كلما احتجتُ إلى التعامل مع HTTP API من المتصفح، أبدأ بـ `fetch` مباشرة. أراه الأداة الصحيحة في هذا المستوى: مبني على Promise منذ البداية، ويتركَّب بسلاسة مع `AbortController`، ويتشارك `Request` و`Response` مع Service Workers وواجهة Cache API، ثم إن التوقيع نفسه يعمل في Node 18 وما بعده، وفي Bun وDeno وCloudflare Workers دون الحاجة إلى محوِّل. وأغلب النقاشات التي تدور حول "أيّ عميل HTTP أختار؟" تنتهي عند هذه النقطة.

لكن في `fetch` ثغرة واحدة لا يذكرها أحد، وليست من النوع الذي يتوقَّع أن يُصلَح لاحقاً، لأنها ثغرة بنيوية. `fetch` لا يُطلق أحداث تقدُّم الرفع أصلاً. صحيح أن جسم `Request` يقبل `ReadableStream`، لكن المتصفح لا يُطلق حدث `progress` وهو يستنزف البايتات منه إلى الشبكة. تُسلِّم الجسم إلى طبقة الشبكة، ثم يمضي في طريقه، ولا تسمع منه شيئاً بعد ذلك.

ولو أردتَ شريط تقدُّم رفع حقيقياً لا مجرَّد spinner وهمي، فليس أمامك سوى `XMLHttpRequest`. هو الواجهة الأقدم، لكنه الوحيد الذي يكشف عن `xhr.upload.onprogress`.

سأتحدَّث في هذه التدوينة عن ثلاثة أمور بالترتيب:

1. لماذا يستحق `fetch` الأصلي أن يكون الخيار الافتراضي، وما الفوائد التي تحصل عليها بالضبط من ورائه.
2. كيف تبني غلاف fetch مخصَّصاً (افتراضات، ومهلات، وinterceptors، وإعادة محاولة) دون أن تُضيِّع شكل `fetch`.
3. الثغرة في XHR، وخريطة أحداث التقدُّم، وغلاف صغير مبني على XHR يُعيد `Response` كي تبقى بقية شيفرتك بشكل fetch.

إذا سبق أن تساءلتَ عن سرِّ وجود مصنع باسم `createClient()` في كثير من مشاريع الإنتاج، فإجابتك تكمن في القسمين الأول والثاني. أما القسم الثالث فهو الشيء الوحيد الذي يعجز عنه هذا العميل من تلقاء نفسه.

## لماذا `fetch` الأصلي هو البدائي الافتراضي

كل نقاش خضتُه حول عملاء HTTP انتهى في نهاية المطاف إلى "استخدم fetch". والأسباب تستحق أن تُذكر صراحة، لأنها تحديداً ما ستتنازل عنه لو اخترتَ مكتبة أخرى، ولأنها تتراكم فوق بعضها بمجرَّد أن تبدأ بتغليفه.

**Promise واحدة، وResponse واحدة.** يُعيد `fetch(url, init)` قيمة من نوع `Promise<Response>` مباشرة. لا آلة حالات، ولا `readyState`، ولا حاجة لربط معالجات أحداث في المسار السليم. تقرأ `await fetch(...)` كما تقرأ أي استدعاء غير متزامن آخر في مشروعك. XHR لا يزال مدفوعاً بالأحداث خلف الكواليس، بينما `fetch` هو الواجهة المصمَّمة أصلاً على شكل Promise.

**بدائيات موحَّدة لـ Request وResponse.** `Response` الذي يصلك من `fetch` هو النوع نفسه الذي يُعيده Service Worker، وتخزِّنه Cache API، وتقبله بيئات الحافة. تستطيع أن تستدعي `.clone()` عليه، أو أن تُعيده إلى المتصفح، أو تخزِّنه، أو تدفعه إلى مكان آخر، دون أي طبقة ترجمة بينهما.

**الإلغاء عبر `AbortController`.** إشارة واحدة كافية لإلغاء سلسلة عمل كاملة: fetch، وحساب معتمد عليه، وإعادة محاولة لم تنطلق بعد. تُجمِّع `AbortSignal.any([...])` عدة إشارات في إشارة واحدة، وتمنحك `AbortSignal.timeout(ms)` مهلة زمنية دون الحاجة إلى رقصة `setTimeout` و`clearTimeout`. الإلغاء صار ميزة أصيلة في المنصَّة، لا شأناً تُعالجه كل مكتبة على حدة.

**أجسام على شكل streams.** `Response.body` هو `ReadableStream`. عند التنزيل، تستطيع أن تقرأ القطع فور وصولها، وهذا يكفي لعدَّاد بايتات، أو محلِّل حي، أو لتمرير الـ stream إلى شيء آخر مثل `createImageBitmap` أو `new Response(stream)` أو Cache API. ويقبل `Request.body` هو الآخر streams، غير أن تقدُّم الرفع هو الحالة الوحيدة التي لا يترجم فيها هذا القبول إلى نتيجة عملية.

**خيارات طلب من الدرجة الأولى.** حقول مثل `credentials` و`cache` و`redirect` و`mode` و`referrer` و`integrity` كلها حقول عليا في `RequestInit` مباشرة. لا آثار جانبية على شاكلة `xhr.withCredentials = true`، ولا حيل للالتفاف حول headers ممنوعة. صُمِّمت الواجهة أصلاً وفي ذهنها دلالات الأمن والتخزين المؤقَّت الحديثة.

**اتساق عبر بيئات التشغيل.** التوقيع نفسه لـ `fetch` يعمل في المتصفحات، وNode 18 وما بعده، وBun وDeno وCloudflare Workers وService Workers. لا يحتاج العميل الذي يعمل في SSR إلى تفريع بـ `typeof window`، وتستطيع الشيفرة المُصيَّرة على الخادم أن تتشارك مع تلك المُصيَّرة على العميل طبقة HTTP واحدة.

**قابلية التوسيع دون تسلسلات أصناف.** `fetch` مجرَّد دالة عادية، وعميلك المخصَّص أيضاً دالة عادية بنفس التوقيع. التغليف، وCurrying، والوسائط، والاستبدال: كل هذه التقنيات القياسية تنطبق كما هي، وهذا بالضبط ما يجعل القسم التالي ممكناً.

## بناء غلاف fetch مخصَّص

قلَّما تجد قاعدة شيفرة إنتاجية تستدعي `fetch` مباشرة. الغالب أن يكون لديها `createClient()` أو `apiClient` يضع فوقه طبقات من الافتراضات، وترويسات المصادقة، والمهلات، وإعادة المحاولة، وتوحيد الأخطاء، وربما interceptors أيضاً. والحيلة كلها في أن تبنيه دون أن يفقد شكل `fetch`، حتى إذا احتجتَ لاحقاً أن تُبدِّل الناقل (بناقل مبني على XHR مثلاً كما سنرى) لا تضطر إلى إعادة كتابة كل موضع استدعاء.

سأمرُّ على أربع طبقات، كل واحدة منها صغيرة، وكل واحدة تستحق مكانها.

### الطبقة الأولى: رابط أساسي، وترويسات افتراضية، وJSON مُحلَّل

ابدأ بأقصر غلاف مفيد يمكن تصوُّره:

```typescript
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<T>;
}
```

ثلاثة أسطر تشتري لك سلوكين: رمي الخطأ عند أي استجابة غير 2xx، وتحليل JSON عند النجاح. وبمجرَّد أن تلاحظ نفسك تُكرِّر هذين السلوكين في كل موقع استدعاء، يكون الغلاف قد استحقَّ وجوده.

وشكل أنفع قليلاً يقبل إعداداً:

```typescript
export function createClient(options: {
  baseURL: string;
  defaultHeaders?: Record<string, string>;
}) {
  const { baseURL, defaultHeaders = {} } = options;

  return async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = new URL(path, baseURL).toString();
    const headers = { ...defaultHeaders, ...(init.headers as Record<string, string>) };
    const res = await fetch(url, { ...init, headers });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json() as Promise<T>;
  };
}
```

`new URL(path, baseURL)` هو الجزء الذي يستحق أن تسرقه. يتعامل مع الشرطات المائلة في البداية والنهاية بشكل صحيح ومنذ اللحظة الأولى، فلا تحتاج إلى تلك اللعبة اليدوية `${baseURL}/${path}.replace(/\/+/g, '/')` التي ينتهي إليها كل عميل مرتجل مع الوقت. مرِّر مساراً نسبياً فسيُحلَّل مقابل الرابط الأساسي، ومرِّر رابطاً مطلقاً فسيستخدمه `URL` كما هو.

### الطبقة الثانية: المهلات عبر `AbortSignal`

الطريقة الصحيحة لتنفيذ المهلات هي `AbortSignal.timeout(ms)`:

```typescript
const signal = AbortSignal.timeout(30_000);
const res = await fetch(url, { signal });
```

وإن مرَّر المستدعي إشارته الخاصة إلى جانب مهلتك، فادمج الاثنتين بحيث تستطيع أيٌّ منهما إلغاء الطلب:

```typescript
function mergeSignals(a?: AbortSignal, b?: AbortSignal): AbortSignal | undefined {
  if (!a) return b;
  if (!b) return a;
  if ('any' in AbortSignal) return AbortSignal.any([a, b]);
  // fallback for older runtimes
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  a.addEventListener('abort', onAbort, { once: true });
  b.addEventListener('abort', onAbort, { once: true });
  return controller.signal;
}
```

`AbortSignal.any([...])` تقوم بالدمج أصلياً في المتصفحات الحديثة، أما البديل الاحتياطي فيمرِّر الإشارتين يدوياً إلى متحكِّم جديد. في الحالتين، تصل إشارة واحدة إلى `fetch`، وينتهي انقضاء المهلة أو إلغاء المستدعي إلى مسار الرفض نفسه. وهذا مهم، لأن `try/catch` يستطيع أن يفحص `err.name === 'AbortError'` بغضِّ النظر عن الجهة التي أطلقت الحدث.

### الطبقة الثالثة: Interceptors

ثلاث سلاسل (طلب، واستجابة، وخطأ) تكفي لتحوِّل عميلاً جامداً إلى عميل قابل للتوسيع:

```typescript
type RequestInterceptor = (ctx: { url: string; init: RequestInit }) => void | Promise<void>;
type ResponseInterceptor = (res: Response) => Response | Promise<Response>;

export function createClient(options: { baseURL: string; defaultHeaders?: Record<string, string> }) {
  const requestInterceptors: RequestInterceptor[] = [];
  const responseInterceptors: ResponseInterceptor[] = [];

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const ctx = {
      url: new URL(path, options.baseURL).toString(),
      init: { ...init, headers: { ...(options.defaultHeaders ?? {}), ...(init.headers as Record<string, string>) } },
    };
    for (const fn of requestInterceptors) await fn(ctx);
    let res = await fetch(ctx.url, ctx.init);
    for (const fn of responseInterceptors) res = await fn(res);
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json() as Promise<T>;
  }

  request.useRequest = (fn: RequestInterceptor) => {
    requestInterceptors.push(fn);
    return () => void requestInterceptors.splice(requestInterceptors.indexOf(fn), 1);
  };
  request.useResponse = (fn: ResponseInterceptor) => {
    responseInterceptors.push(fn);
    return () => void responseInterceptors.splice(responseInterceptors.indexOf(fn), 1);
  };

  return request;
}
```

كل تابع `use*` يُعيد دالة لإلغاء التسجيل، وهذه فائدة عملية حين تسجِّل interceptor داخل مكوِّن وتريد التنظيف عند إزالته.

المصادقة تتحوَّل بذلك إلى سطر واحد:

```typescript
api.useRequest((ctx) => {
  ctx.init.headers = { ...(ctx.init.headers as Record<string, string>), Authorization: `Bearer ${token.value}` };
});
```

وكذلك سيناريو "تجديد التوكن عند 401":

```typescript
api.useResponse(async (res) => {
  if (res.status !== 401) return res;
  await refreshAuth();
  return fetch(res.url, { /* re-run options */ });
});
```

### الطبقة الرابعة: إعادة المحاولة مع Exponential Backoff

في الطلبات المُكافئة (GET وHEAD ومعظم PUT وDELETE)، يمتصُّ مساعد retry صغير أغلب الأخطاء الشبكية العابرة:

```typescript
async function withRetry<T>(fn: () => Promise<T>, attempts = 2, baseDelayMs = 200): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < attempts) await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** i));
    }
  }
  throw lastError;
}
```

ثلاث محاولات مع تأخير 200ms ثم 400ms ثم 800ms تُغطِّي معظم أخطاء 502 العابرة وتقطُّعات DNS. أما إعادة محاولة الطلبات غير المُكافئة فعلى مسؤوليتك، لأن إعادة إرسال POST ثبت في قاعدة البيانات فعلاً أسوأ بكثير من الفشل بوضوح. وأسهل طريقة لضبط ذلك هي قائمة سماح صغيرة داخل الغلاف نفسه (`['GET', 'HEAD', 'PUT', 'DELETE']`).

### النتيجة النهائية

بعد الطبقات الأربع، تصبح واجهة الاستهلاك بهذا الشكل:

```typescript
const api = createClient({
  baseURL: 'https://api.example.com',
  defaultHeaders: { Accept: 'application/json' },
});

api.useRequest((ctx) => {
  ctx.init.headers = { ...(ctx.init.headers as Record<string, string>), Authorization: `Bearer ${token.value}` };
});

const users = await api<User[]>('/users');
```

استدعاء مسطَّح، ومصادقة تُدار مرَّة واحدة، وأخطاء تُرمى بنوع معروف، ومهلات وإعادة محاولة تُطبَّق حيث ينبغي. كل طبقة دالة عادية تلفُّ التي تحتها، وفي القاع لا يزال `fetch`.

وهنا بالضبط تظهر ثغرة تقدُّم الرفع.

## لماذا يعجز `fetch` عن إظهار تقدُّم الرفع

تقدُّم التنزيل مع `fetch` يعمل، لكن بطريقة فيها بعض الحرج. تقرأ جسم الاستجابة كـ stream:

```typescript
const res = await fetch('/big.zip');
const total = Number(res.headers.get('content-length')) || null;
let loaded = 0;
const reader = res.body!.getReader();
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  loaded += value.byteLength;
  onProgress(loaded, total);
}
```

هذا مقبول. صحيح أن عليك أن تحتفظ بالقطع بنفسك (أو أن تدفعها إلى `Response` جديد إن أردتَ تمريرها إلى شيء آخر)، لكن البدائيات موجودة على الأقل.

أما في الرفع، فالقطعة المفقودة أن جسم `Request` تستهلكه شبكة المتصفح، لا شيفرتك. تستطيع أن تمرِّر `ReadableStream`، لكن لا يوجد أي حدث يُطلَق أثناء استنزاف المتصفح له. بعض إصدارات Chromium تدعم `Request.duplex: 'half'` مما يفتح باب streaming الرفع، غير أن حدث `progress` لا يزال غائباً. سيتوجَّب عليك أن تُجهِّز `pull()` الخاص بالـ stream يدوياً لعدِّ البايتات، وحتى إذا فعلتَ ذلك فأنت تقيس ما يُطلقه الـ stream، لا ما أرسله الـ socket فعلاً.

عملياً، إن أردتَ شريط تقدُّم رفع في سنة 2026، فستستخدم XHR.

## الأحداث الخمسة في XHR التي تهمُّك حقاً

يُطلق كل XHR مجموعة أحداث ثابتة ومتوقَّعة. والذي يهم منها لواجهات التقدُّم هو:

```typescript
xhr.upload.onprogress = (e: ProgressEvent) => { /* upload bytes */ };
xhr.onprogress        = (e: ProgressEvent) => { /* download bytes */ };
xhr.onload            = () => { /* request completed successfully */ };
xhr.onerror           = () => { /* network error */ };
xhr.onabort           = () => { /* xhr.abort() was called */ };
xhr.ontimeout         = () => { /* xhr.timeout exceeded */ };
```

ثمَّة أمران يسهل أن يفوتك الانتباه إليهما.

الأوَّل أن `xhr.upload` كائن مستقل من نوع `XMLHttpRequestUpload`، وله هدف أحداث خاص به. هو الذي يُطلق `progress` أثناء إرسال جسم الطلب، بينما `xhr` نفسه يُطلق `progress` أثناء استقبال جسم الاستجابة. إنهما مرحلتان في الطلب نفسه، ويشتركان في شكل الحدث ذاته.

الثاني أن `xhr.onload` يُطلَق مع أي طلب مكتمل، حتى لو أرجع HTTP 500. معنى "اكتمل الطلب" هنا هو "ردَّ الخادم"، لا أكثر. فإن أردتَ التحقُّق من أن "الطلب نجح" فعلاً، فافحص `xhr.status` بنفسك داخل `onload`.

هناك أحداث أخرى (`loadstart` و`loadend` و`readystatechange`)، لكن الأحداث الخمسة أعلاه تكفي واجهة التقدُّم تماماً.

## شكل `ProgressEvent`، وحكاية `lengthComputable`

يستقبل كلا الـ callback في `onprogress` كائن `ProgressEvent` يحوي ثلاثة حقول:

```typescript
interface ProgressEvent {
  lengthComputable: boolean;
  loaded: number;   // bytes transferred so far
  total: number;    // bytes expected, ONLY valid when lengthComputable is true
}
```

`lengthComputable` هو الحقل الذي يتجاهله أكثر من ينفِّذ الأمر لأول مرَّة. تصبح قيمته `false` حين يُرسل الخادم استجابة مُقطَّعة دون ترويسة `Content-Length`، وتصبح `false` كذلك أثناء عمليات الرفع التي يكون فيها الجسم stream مجهول الطول. وفي هذه الحالة تكون `total` تساوي `0` بالضبط، لا "غير موجودة" ولا `undefined`، بل الرقم صفر، وحين تقسم عليه في شريط التقدُّم يخرج لك `NaN` أو `Infinity`.

لذلك ضع التطبيع في مكان واحد:

```typescript
function normaliseProgress(phase: 'upload' | 'download', e: ProgressEvent) {
  const total = e.lengthComputable ? e.total : null;
  const ratio = total && total > 0 ? e.loaded / total : null;
  return { phase, loaded: e.loaded, total, ratio };
}
```

`null` هو الجواب الأمين حين لا تعرف المجموع، وطبقة الواجهة هي التي تقرِّر ما تعرضه: عدَّاد بايتات بلا نسبة مئوية، أو شريط غير محدَّد، أو مؤشِّر دوران. المهم ألا تسمح بأن يتسرَّب `NaN` من طبقة النقل.

## أبسط مثال لتقدُّم الرفع

هذا أصغر مثال مفيد لرفع مع تقدُّم، يُظهر واجهة الاستخدام دون أي غلاف:

```typescript
async function uploadWithProgress(
  file: File,
  onProgress: (loaded: number, total: number | null) => void
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    xhr.upload.onprogress = (e) => {
      const total = e.lengthComputable ? e.total : null;
      onProgress(e.loaded, total);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`HTTP ${xhr.status}`));
    };
    xhr.onerror = () => reject(new TypeError('Network error'));
    xhr.onabort = () => reject(new DOMException('Aborted', 'AbortError'));

    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  });
}
```

ثلاث ملاحظات تستحق التوقُّف عندها:

- **لا تُعيِّن `Content-Type` عند إرسال `FormData`.** المتصفح يحتاج إلى أن يختار سلسلة boundary الخاصة به لترميز multipart. لو ضبطتَ `Content-Type: multipart/form-data` يدوياً، فستُلغي القيمة التي يضعها المتصفح ومعها الـ boundary، وسيفشل الخادم في تحليل الجسم.
- **فحص `xhr.status` يجب أن يكون صريحاً.** `onload` يُطلَق حتى مع 500. الخلط بين "اكتمل الطلب" و"نجح الطلب" هو المصدر الأوَّل والأكثر شيوعاً لعلل الرفع الصامتة.
- **`new Promise` هو المحوِّل.** XHR مبني على الأحداث، وبقية شيفرتك بشكل `async/await`. تغليفه مرَّة واحدة داخل Promise يُبقي هذا الحرج محصوراً في مكانه.

## أبسط مثال لتقدُّم التنزيل

الشكل نفسه بالنسبة إلى التنزيل، لكن على `xhr.onprogress`:

```typescript
async function downloadWithProgress(
  url: string,
  onProgress: (loaded: number, total: number | null) => void
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';

    xhr.onprogress = (e) => {
      const total = e.lengthComputable ? e.total : null;
      onProgress(e.loaded, total);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as Blob);
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new TypeError('Network error'));

    xhr.send();
  });
}
```

`xhr.responseType = 'blob'` هو السطر الحاسم عند تنزيل الملفات. بدونه ستحصل على نص، وفي المحتوى الثنائي يعني ذلك أن المتصفح سيفكُّ ترميز البايتات بـ UTF-8 ويسلِّمك محتوى فاسداً. مع JSON تستخدم `'json'`، ومع البايتات العامة `'arraybuffer'` أو `'blob'`. المهم أن تضبطه _قبل_ `send()`.

كما أن على الخادم أن يُرسل ترويسة `Content-Length` إن كنت تريد أن تكون قيمة `total` ذات معنى. ترميز النقل المُقطَّع لا يتضمَّنها، فتخرج `lengthComputable` بقيمة `false`. وشبكات CDN التي تُطبِّق gzip أثناء التسليم تُسقط أحياناً `Content-Length` بدورها. حين يحدث هذا، سترضى بعدَّاد بايتات بلا نسبة مئوية، وهذا الحل الأمين على أي حال.

## تغليف XHR ليبدو مثل `fetch`

معظم قاعدة الشيفرة الحديثة مبنية على شكل `fetch`. وإذا نفَّذتَ التقدُّم الحقيقي عبر XHR وتركتَ كل شيء آخر على `fetch`، فسينتهي بك الأمر إلى خطَّي طلب متوازيين بأنواع أخطاء مختلفة، ودلالات إلغاء مختلفة، وتطبيع headers مختلف.

والحل أن تُبقي `fetch` هو الخيار الافتراضي، وأن تُبدِّله بدالة مبنية على XHR _تُعيد `Response`_ في الحالات التي يُطلَب فيها التقدُّم فقط. بهذا لا تتغيَّر الشيفرة المستدعية إطلاقاً.

هذا غلاف يفعل ذلك تماماً (وهو التطبيق الفعلي المستخدم في حزمة api-provider خاصتي):

```typescript
export function createXhrFetch(
  onProgress: (progress: RequestProgress) => void
): (input: string, init: RequestInit) => Promise<Response> {
  return function xhrFetch(input, init) {
    const method = (init.method ?? 'GET').toUpperCase();
    const body = (init.body ?? null) as XMLHttpRequestBodyInit | null;
    const headers = init.headers as Record<string, string> | undefined;
    const signal = init.signal as AbortSignal | null | undefined;

    return new Promise<Response>((resolve, reject) => {
      if (typeof XMLHttpRequest === 'undefined') {
        reject(new Error('XHR unavailable in this runtime'));
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open(method, input, true);
      xhr.responseType = 'blob';
      if (init.credentials === 'include') xhr.withCredentials = true;

      if (headers) {
        for (const [name, value] of Object.entries(headers)) {
          try { xhr.setRequestHeader(name, value); }
          catch { /* forbidden headers are silently skipped */ }
        }
      }

      xhr.upload.onprogress = (e) => onProgress(normaliseProgress('upload', e));
      xhr.onprogress        = (e) => onProgress(normaliseProgress('download', e));

      const onAbort = () => xhr.abort();
      if (signal) {
        if (signal.aborted) {
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }
        signal.addEventListener('abort', onAbort, { once: true });
      }

      xhr.onload = () => {
        if (signal) signal.removeEventListener('abort', onAbort);
        resolve(new Response(xhr.response as BodyInit | null, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders()),
        }));
      };
      xhr.onerror   = () => reject(new TypeError('Network error'));
      xhr.onabort   = () => reject(new DOMException('Aborted', 'AbortError'));
      xhr.ontimeout = () => reject(new DOMException('Request timeout', 'TimeoutError'));

      xhr.send(body);
    });
  };
}
```

أربعة أمور تقوم بالعمل الحقيقي في هذا الشكل:

أوَّلها أن **نوع الإرجاع `Promise<Response>`**. وهذا هو المقصد كله: كل ما يقبل `typeof fetch` سيقبل هذه الدالة، وتبقى بقية قاعدة الشيفرة (interceptors وretry وتحليل JSON وتحويل الأخطاء) لا تُبالي بالناقل المستخدم.

وثانيها **مطبِّع الترويسات في الأسفل**، إذ يُترجم `xhr.getAllResponseHeaders()` (سلسلة خام مفصولة بـ CRLF) إلى كائن `Headers`، بحيث يسلك `Response` سلوكه المعتاد كأنه قادم من `fetch`:

```typescript
function parseHeaders(raw: string): Headers {
  const out = new Headers();
  if (!raw) return out;
  for (const line of raw.trim().split(/[\r\n]+/)) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const name = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (name) out.append(name, value);
  }
  return out;
}
```

وثالثها **جسر `AbortSignal`**، فهو الذي يترجم بين بدائيّ الإلغاء في `fetch` وتابع `abort()` في XHR. استدعاء `AbortSignal.addEventListener('abort', xhr.abort)` يجعل الواجهتين تتحدَّثان اللغة نفسها، وفحص `signal.aborted` منذ البداية يُعالج حالة أن يمرِّر المستدعي إشارة مُلغاة سلفاً (وتحدث مثلاً حين تُلغي طلباً قبل أن يُرسَل).

ورابعها **`try/catch` حول `setRequestHeader`**، وهو مقصود. المتصفحات تمنع ترويسات معيَّنة مثل `User-Agent` و`Cookie` و`Host` ومعظم `Sec-*` و`Proxy-*`. `fetch` يتجاهلها بصمت هو الآخر، و`try/catch` هنا يجعل سلوك XHR مطابقاً له.

## الإلغاء، وانقضاء المهلة، وحدوث الخطأ

نهايات XHR الأربع الحصرية هي `onload` و`onerror` و`onabort` و`ontimeout`. وهي متنافية تماماً، بمعنى أن حدثاً واحداً بالضبط سيُطلَق لكل طلب. أما الترجمة إلى عالم `fetch` فهي:

| حدث XHR       | المعنى                                | شكل الـ Promise                                |
|---------------|--------------------------------------|------------------------------------------------|
| `onload`      | ردَّ الخادم (بأي حالة)                | `resolve(new Response(...))`                   |
| `onerror`     | فشل شبكي، أو حجب CORS، أو DNS         | `reject(new TypeError('Network error'))`       |
| `onabort`     | استُدعي `xhr.abort()`                 | `reject(new DOMException('...', 'AbortError'))`|
| `ontimeout`   | انقضت المدة المحددة في `xhr.timeout` بالمللي ثانية | `reject(new DOMException('...', 'TimeoutError'))` |

`fetch` يستخدم `TypeError` للأخطاء الشبكية و`DOMException` للإلغاء. الحفاظ على هذه الأنواع بعينها يعني أن معالجات الأخطاء عندك ستستمر في العمل حين تُبدِّل الناقل.

وحين يضبط المستدعي `xhr.timeout = 30_000`، سيُطلَق `ontimeout` تلقائياً دون أي شيفرة إضافية. وهذه من المكاسب الصغيرة لـ XHR على `fetch` مع `AbortController` و`setTimeout`: آلية المهلة مدمجة أصلاً.

## مطبَّات تستحق أن تُسمَّى

مجموعة صغيرة من الفخاخ كلَّفتني وقتاً في أول مرَّة وقعتُ فيها.

**تعيين `Content-Type` مع FormData يكسر multipart.** ترويسة `multipart/form-data; boundary=...` التي يُنشئها المتصفح تلقائياً هي الوحيدة التي يستطيع الخادم أن يحلِّلها. لا تتجاوزها.

**تقدُّم CORS مقيَّد.** في الطلبات عبر الأصول، لن تُطلَق أحداث تقدُّم الرفع إلا إذا شملت الاستجابة ترويسة `Access-Control-Allow-Origin` المناسبة. فإن كنت ترى `loaded = 0` بلا نهاية في رفع عبر أصل مختلف، فالسبب غالباً CORS لا شيفرتك.

**`responseType` يجب أن يُضبط قبل `send()`.** ضبطه بعد ذلك لا يفعل شيئاً. المتصفح يحتاج إلى معرفة كيفية تخزين الاستجابة منذ أول بايت.

**gzip وترويسة `Content-Length`.** كثير من شبكات CDN تُسقط `Content-Length` حين تُطبِّق gzip أثناء التسليم، لأن الطول المضغوط يختلف عن غير المضغوط. فيرى عميلك `lengthComputable: false` رغم أن الخادم يعرف الحجم الحقيقي. لا يوجد حلٌّ من جانب العميل هنا. فإن كان الخادم بيدك، فقدِّم محتوى مضغوطاً مسبقاً، أو تجاوز الضغط في الأصول التي يهمُّ فيها التقدُّم.

**لا تُبقي الاستجابة كلها في الذاكرة دون داعٍ.** `responseType: 'blob'` يترك للمتصفح إدارة العازلة، بينما `responseType: 'arraybuffer'` يُجبرها إلى heap الخاصة بـ JS. لأي شيء يتجاوز بضعة MB، `blob` هو الافتراضي الصحيح.

## ما سألجأ إليه أولاً

لأي مشروع يحتاج واجهات تقدُّم حقيقية، هذا هو الشكل الذي سأبنيه في كل مرَّة:

- **الناقل الافتراضي هو `fetch`.** فهو البدائي الحديث، وهو الأسرع، ويتحوَّل إلى أنماط ودودة لـ SSR بنظافة.
- **لا تلجأ إلى XHR إلا حين يطلب المستدعي التقدُّم صراحة.** خيار واحد باسم `onRequestProgress` كافٍ لتبديل الناقل لهذا الاستدعاء وحده.
- **مسار XHR يُعيد `Promise<Response>`**، حتى يستمر كل ما بعده في العمل بلا تغيير: interceptors وretry وتحويل الأخطاء وتحليل JSON.
- **طبِّع `{ loaded, total, ratio }` في طبقة النقل.** ومرِّر `null` إلى الأعلى حين يكون المجموع مجهولاً. ودع الواجهة تقرِّر كيف تعرض هذه الحالة.
- **اجسر `AbortSignal` مرَّة واحدة** في الغلاف، لا في كل موقع استدعاء. `abort()` في XHR و`AbortController` في fetch يشغلان الفتحة المنطقية نفسها، والغلاف هو الذي يُترجم بينهما.

هذه هي الصورة كاملة. لم يعد XHR الواجهة اللامعة، لكنه لا يزال يعمل في حالة محدَّدة يعجز عنها fetch، والقدر الصغير من شيفرة الغراء أعلاه هو ما يمنعه من أن يُلوِّث بقية قاعدة الشيفرة.
