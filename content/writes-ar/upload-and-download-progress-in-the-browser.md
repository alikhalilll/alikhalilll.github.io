---
title: غلاف مخصَّص لـ fetch، وXHR لتقدُّم الرفع
description: لماذا fetch الأصلي هو الاختيار الافتراضي المناسب، وكيف تبني غلافاً طبقياً حوله (رابط أساسي، ومهلات، واعتراضات، وإعادة محاولات)، ومتى تظل بحاجة إلى XHR.
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

في كل مرة أحتاج فيها إلى التخاطب مع HTTP API من المتصفح، ألجأ أولاً إلى `fetch`. فهو البدائي المناسب: مبني على Promise، وقابل للتركيب مع `AbortController`، ويشارك `Request`/`Response` مع Service Workers وواجهة Cache API، ونفس التوقيع يعمل في Node 18+ وBun وDeno وCloudflare Workers دون الحاجة إلى محوِّل. ومعظم نقاشات "أي عميل HTTP يجب أن أستخدم؟" تنتهي عند هذه النقطة.

لكن لدى `fetch` فجوة واحدة لا يحذِّرك منها أحد، وليست من النوع الذي سيصلحه أحد. إنها فجوة بنيوية. فـ `fetch` لا يُطلق أحداث تقدُّم الرفع. يمكن لجسم `Request` أن يكون `ReadableStream`، لكن المتصفحات لا تُطلق `progress` أثناء تصريف البايتات منه إلى السلك. تُسلِّم الجسم إلى طبقة الشبكة فيمضي.

للحصول على شريط تقدُّم رفع حقيقي (وليس مؤشر دوران وهمي غير محدَّد) تحتاج إلى `XMLHttpRequest`. إنها الواجهة الأقدم، لكنها الوحيدة التي تكشف `xhr.upload.onprogress`.

تغطي هذه التدوينة ثلاثة أمور بالترتيب:

1. لماذا يستحق `fetch` الأصلي مكانته الافتراضية، وما الفوائد المحدَّدة التي تحصل عليها منه.
2. كيف تبني غلاف fetch مخصَّصاً (افتراضات، ومهلات، واعتراضات، وإعادة محاولات) دون أن تفقد شكل `fetch`.
3. فجوة XHR، وخريطة أحداث التقدُّم، وغلاف صغير مدعوم بـ XHR يُعيد `Response` كي تبقى بقية شيفرتك بشكل fetch.

إذا سبق وتساءلت لماذا تحوي كثير من قواعد شيفرة الإنتاج مصنعاً باسم `createClient()`, فالجواب يكمن في معظمه في القسمين 1 و2. أما القسم 3 فهو الشيء الوحيد الذي لا يزال هذا العميل عاجزاً عن فعله وحده.

## لماذا يُعدُّ `fetch` الأصلي البدائي الافتراضي

كل نقاش حول عملاء HTTP خضته انتهى في النهاية إلى "استخدم fetch". والأسباب تستحق أن تُذكر صراحة. فهي ما ستتنازل عنه إن اخترت مكتبة مختلفة افتراضياً، وهي تتراكم بمجرد أن تبدأ بتغليفه.

**Promise واحد، وResponse واحد.** يعيد `fetch(url, init)` قيمة من نوع `Promise<Response>`. لا آلة حالات، ولا `readyState`، ولا توصيلات لمعالجات أحداث في المسار السعيد. تبدو `await fetch(...)` مثل أي استدعاء غير متزامن آخر في شيفرتك. لا يزال XHR مدفوعاً بالأحداث تحت الغطاء؛ أما `fetch` فهو الواجهة على هيئة Promise.

**بدائيات موحَّدة لـ Request/Response.** إن `Response` الذي تحصل عليه من `fetch` هو نفس النوع الذي يُعيده Service Workers، وتخزِّنه Cache API، وتقبله بيئات الحافة. يمكنك استدعاء `.clone()` على response، أو إعادته إلى المتصفح، أو تخزينه، أو ضخّه إلى مكان آخر: دون طبقة ترجمة.

**الإلغاء عبر `AbortController`.** يمكن لإشارة واحدة أن تلغي سلسلة عمل كاملة: fetch، وحساب لاحق له، وإعادة محاولة لم تنطلق بعد. تُركِّب `AbortSignal.any([...])` عدة إشارات في إشارة واحدة؛ وتمنحك `AbortSignal.timeout(ms)` مهلةً دون رقصة `setTimeout/clearTimeout`. الإلغاء ميزة منصَّة، لا شأن مكتبة.

**أجسام على هيئة streams.** إن `Response.body` هو `ReadableStream`. للتنزيلات، يمكنك قراءة القطع فور وصولها: يكفي ذلك لعدَّاد بايتات محمَّلة، أو محلِّل حي، أو تسليم الـ stream إلى شيء آخر (`createImageBitmap`, `new Response(stream)`, واجهة Cache API). يقبل `Request.body` أيضاً streams، وإن كان تقدُّم الرفع هو المكان الوحيد الذي لا يترجم فيه ذلك.

**خيارات طلب من الدرجة الأولى.** حقول `credentials` و`cache` و`redirect` و`mode` و`referrer` و`integrity`: كلها حقول عليا في `RequestInit`. لا آثار جانبية من نوع `xhr.withCredentials = true`، ولا حلول التفافية لـ headers ممنوعة. صُمِّمت الواجهة بمراعاة دلالات الأمن والتخزين المؤقَّت الحديثة.

**اتساق عبر بيئات التشغيل.** يعمل نفس توقيع `fetch` في المتصفحات وNode 18+ وBun وDeno وCloudflare Workers وService Workers. لا يحتاج عميل قادر على SSR إلى تفريع بـ `typeof window`. ويمكن للشيفرة المُصيَّرة على الخادم والشيفرة المُصيَّرة على العميل أن تتشاركا طبقة HTTP واحدة.

**قابلية توسيع دون تسلسلات أصناف.** إن `fetch` مجرَّد دالة عادية. وعميلك المخصَّص أيضاً دالة عادية بنفس التوقيع. التغليف، وCurrying، والوسائط، والاستبدال: كل التقنيات القياسية تنطبق. وهذا ما يجعل القسم التالي قابلاً للتطبيق.

## بناء غلاف fetch مخصَّص

لا تستدعي معظم قواعد شيفرة الإنتاج `fetch` مباشرة. لديها `createClient()` أو `apiClient` يضع طبقات من الافتراضات، وترويسات المصادقة، والمهلات، وإعادة المحاولة، وتوحيد الأخطاء، وأحياناً interceptors. الحيلة هي أن تبنيه دون أن تفقد شكل `fetch`، بحيث لا يُجبرك استبدال ناقل مختلف (مثل ناقل XHR أدناه) على إعادة كتابة كل مستهلك.

سأشرح أربع طبقات، كل واحدة صغيرة، وكل واحدة تستحق ثقلها.

### الطبقة 1: رابط أساسي، وترويسات افتراضية، وJSON مُحلَّل

ابدأ بأقصر غلاف مفيد:

```typescript
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<T>;
}
```

ثلاثة أسطر تشتري لك سلوكين: "ارمِ عند non-2xx" و"حلِّل JSON عند النجاح". وحين تجد نفسك تكرِّر هذين السلوكين عند كل موقع استدعاء، يستحق الغلاف مكانه.

شكل أكثر فائدة قليلاً يقبل إعداداً:

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

إن `new URL(path, baseURL)` هي القطعة التي تستحق السرقة. تتعامل مع الشرطات المائلة في البداية والنهاية بشكل صحيح دون رقصة `${baseURL}/${path}.replace(/\/+/g, '/')` اليدوية التي ينمو إليها كل عميل مرتجل في نهاية المطاف. مرِّر مساراً نسبياً فسيتم حلُّه مقابل الأساس؛ ومرِّر URL مطلقاً فسيستخدمه `URL` كما هو.

### الطبقة 2: مهلات عبر `AbortSignal`

الطريقة الصحيحة للمهلات هي `AbortSignal.timeout(ms)`:

```typescript
const signal = AbortSignal.timeout(30_000);
const res = await fetch(url, { signal });
```

إن مرَّر المستدعي أيضاً إشارته الخاصة، فادمجهما كي تستطيع أيٌّ منهما إلغاء الطلب:

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

تُنفِّذ `AbortSignal.any([...])` الدمج أصلياً في المتصفحات الحديثة؛ ويقوم البديل الاحتياطي بإحالة الإشارتين يدوياً إلى متحكِّم جديد. في كلتا الحالتين، تتدفَّق إشارة واحدة إلى `fetch`، وينتهي كلٌّ من انقضاء المهلة _أو_ إلغاء المستدعي إلى نفس مسار الرفض، وهو ما يهم لأن `try/catch` اللاحق يستطيع فحص `err.name === 'AbortError'` بغضِّ النظر عن المصدر الذي أطلق الحدث.

### الطبقة 3: Interceptors

تحوِّل ثلاث سلاسل (طلب، وresponse، وخطأ) عميلاً ساكناً إلى عميل قابل للتوسيع:

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

يُعيد كل تابع `use*` دالة إلغاء اشتراك، وهذا مهم حين تسجِّل interceptor من مكوِّن وتريد التنظيف عند إزالته.

تُصبح المصادقة سطراً واحداً:

```typescript
api.useRequest((ctx) => {
  ctx.init.headers = { ...(ctx.init.headers as Record<string, string>), Authorization: `Bearer ${token.value}` };
});
```

وكذلك "التجديد عند 401":

```typescript
api.useResponse(async (res) => {
  if (res.status !== 401) return res;
  await refreshAuth();
  return fetch(res.url, { /* re-run options */ });
});
```

### الطبقة 4: إعادة المحاولة مع Exponential Backoff

للطلبات المُكافئة (GET، وHEAD، ومعظم PUTs، وDELETEs)، يمتصُّ مساعد retry صغير الإخفاقات الشبكية العابرة:

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

ثلاث محاولات مع backoff بمقدار 200ms / 400ms / 800ms تغطي معظم أخطاء 502 الزائفة وعطلات DNS. إعادة محاولة الطلبات غير المُكافئة على مسؤوليتك: إعادة إرسال POST رُسِّخ فعلاً أسوأ من الفشل بصوت مسموع. عادةً ما يُفرض ذلك بقائمة سماح صغيرة (`['GET', 'HEAD', 'PUT', 'DELETE']`) داخل الغلاف.

### ما ينتهي إليه الأمر

بعد هذه الطبقات الأربع، تبدو واجهة المستهلك هكذا:

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

شكل استدعاء مسطَّح، ومصادقة مُدارة مرَّة واحدة، وأخطاء تُرمى كنوع معروف، ومهلات وإعادة محاولة تُطبَّق حيث يليق. كل طبقة دالة عادية تلفُّ التي أسفلها. وفي القاع لا يزال `fetch`.

وهو بالضبط حيث تسكن فجوة تقدُّم الرفع.

## لماذا لا يستطيع `fetch` إظهار تقدُّم الرفع

يعمل تقدُّم التنزيل مع `fetch`، لكن بطريقة محرجة. تقرأ جسم الـ response كـ stream:

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

هذا لا بأس به. عليك أن تحتفظ بالقطع بنفسك (أو أن تضخَّها إلى `Response` جديد إن أردت تسليمها)، لكن البدائيات موجودة.

بالنسبة إلى الرفع، القطعة الغائبة هي أن جسم `Request` يستهلكه مكدَّس شبكة المتصفح، لا شيفرتك. يمكنك تمرير `ReadableStream`، لكن لا يوجد حدث يُطلَق أثناء تصريف المتصفح له. تدعم بعض إصدارات Chromium `Request.duplex: 'half'` مما يفتح الباب أمام streaming الرفع، لكن لا يزال لا يوجد حدث `progress`. سيكون عليك أن تُجهِّز `pull()` الخاص بـ stream نفسك لعدِّ البايتات، وحتى حينذاك تقيس ما يُطلقه الـ stream، لا ما أرسله الـ socket.

عملياً، إن أردت شريط تقدُّم للرفع في 2026، ستستخدم XHR.

## الأحداث الخمسة في XHR التي تهمُّك فعلاً

يُطلق كل XHR مجموعة أحداث متوقَّعة. وتلك التي تهم واجهات التقدُّم هي:

```typescript
xhr.upload.onprogress = (e: ProgressEvent) => { /* upload bytes */ };
xhr.onprogress        = (e: ProgressEvent) => { /* download bytes */ };
xhr.onload            = () => { /* request completed successfully */ };
xhr.onerror           = () => { /* network error */ };
xhr.onabort           = () => { /* xhr.abort() was called */ };
xhr.ontimeout         = () => { /* xhr.timeout exceeded */ };
```

يسهل تفويت أمرين.

أولاً، إن `xhr.upload` هو كائن `XMLHttpRequestUpload` منفصل له هدف أحداثه الخاص. يُطلق `progress` عند إرسال جسم الطلب؛ أما `xhr` نفسه فيُطلق `progress` عند استقبال جسم الـ response. إنهما مرحلتا الطلب ذاته، ويستخدمان نفس شكل الحدث.

ثانياً، يُطلق `xhr.onload` عند أي طلب مكتمل، بما في ذلك طلب أعاد HTTP 500. "اكتمل الطلب" هنا تعني "ردَّ الخادم". إن أردت "نجح الطلب"، فافحص `xhr.status` بنفسك داخل `onload`.

توجد أحداث أخرى (`loadstart`, `loadend`, `readystatechange`) لكن لواجهة تقدُّم تغطي الأحداث الخمسة أعلاه كل ما تحتاجه.

## شكل `ProgressEvent`، وحقل `lengthComputable`

يستقبل كلا رَدَّي النداء `onprogress` كائن `ProgressEvent` بثلاثة حقول:

```typescript
interface ProgressEvent {
  lengthComputable: boolean;
  loaded: number;   // bytes transferred so far
  total: number;    // bytes expected, ONLY valid when lengthComputable is true
}
```

إن `lengthComputable` هو الحقل الذي تنساه معظم التطبيقات لأول مرة. يكون `false` عندما يرسل الخادم response مُقطَّعاً دون header `Content-Length`، ويكون `false` أثناء عمليات الرفع التي يكون فيها الجسم stream ذا طول غير معلوم. حين يكون false، تكون `total` تساوي `0`: لا "غير مُقدَّم"، ولا `undefined`، بل الرقم صفر، والقسمة عليه تعطيك `NaN` أو `Infinity` في شريط تقدُّمك.

اجعل التطبيع في مكان واحد:

```typescript
function normaliseProgress(phase: 'upload' | 'download', e: ProgressEvent) {
  const total = e.lengthComputable ? e.total : null;
  const ratio = total && total > 0 ? e.loaded / total : null;
  return { phase, loaded: e.loaded, total, ratio };
}
```

إن `null` هو الجواب الصادق حين لا تعرف المجموع. وطبقة الواجهة هي التي تقرِّر ما تعرضه: عدَّاد بايتات دون نسبة مئوية، أو شريط غير محدَّد، أو مؤشِّر دوران. لا تدع `NaN` يتسرَّب من طبقة النقل.

## مثال حدُّ أدنى لتقدُّم الرفع

إليك أصغر عملية رفع مفيدة مع تقدُّم، تُظهر واجهة الاستخدام دون غلاف:

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

ثلاثة أمور تستحق الإشارة:

- **لا تُعيِّن `Content-Type` عند إرسال `FormData`.** يحتاج المتصفح إلى اختيار سلسلة boundary الخاصة به لترميز multipart. إن عيَّنت `Content-Type: multipart/form-data` يدوياً، فستتجاوزها دون boundary، وسيفشل الخادم في تحليل الجسم.
- **فحص `xhr.status` صريح.** يُطلق `onload` لأخطاء 500. اعتبار "اكتمل الطلب" و"نجح الطلب" شيئاً واحداً هو المصدر الأوحد الأكثر شيوعاً لعلل الرفع الصامتة.
- **`new Promise` هو المحوِّل.** إن XHR مبني على الأحداث؛ وبقية شيفرتك على شكل `async/await`. تغليفه مرَّة واحدة في Promise يُبقي الحرج محلياً.

## مثال حدُّ أدنى لتقدُّم التنزيل

للتنزيلات، الشكل ذاته، لكن على `xhr.onprogress`:

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

إن `xhr.responseType = 'blob'` هو السطر الحاسم لتنزيلات الملفات. من دونه، تحصل على نص، وبالنسبة إلى المحتوى الثنائي فهذا يعني أن المتصفح يفكُّ ترميز البايتات كـ UTF-8 ويسلِّمك خردة. للـ JSON ستستخدم `'json'`، وللبايتات الاعتباطية `'arraybuffer'` أو `'blob'`. عيِّنه _قبل_ `send()`.

على الخادم أن يُرسل header بـ `Content-Length` إن أردت `total` ذا معنى. لا يتضمَّن ترميز النقل المُقطَّع ذلك، وستكون `lengthComputable` تساوي `false`. وشبكات CDN التي تضغط بـ gzip أثناء التسليم تُجرِّد أحياناً `Content-Length` أيضاً. حين يحصل ذلك، تعلق بعدَّاد بايتات دون نسبة مئوية. وهذا صادق.

## تغليف XHR ليبدو مثل `fetch`

معظم قاعدة الشيفرة الحديثة بشكل `fetch`. إن أنجزت تقدُّماً حقيقياً في XHR وأنجزت كل شيء آخر في `fetch`، فستنتهي بخطي طلب متوازيين: أنواع أخطاء مختلفة، ودلالات إلغاء مختلفة، وتطبيع headers مختلف.

الحيلة هي أن تدع `fetch` هو الافتراضي، وأن تستبدل به دالة مدعومة بـ XHR _تُعيد `Response`_ حين يُحتاج التقدُّم. لا تتغيَّر الشيفرة المستدعية.

إليك غلاف يفعل ذلك تماماً (هذا هو التطبيق الحقيقي من حزمة api-provider خاصتي):

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

أربعة أمور تقوم بعمل حقيقي في هذا الشكل:

إن **نوع الإرجاع هو `Promise<Response>`**. هذه هي الغاية بأكملها: كل ما يقبل `typeof fetch` يقبل هذه الدالة. تبقى بقية قاعدة الشيفرة (interceptors، وretry، وتحليل JSON، وتحويل الأخطاء) غير مبالية بالناقل.

**مطبِّع الترويسات في الأسفل** يترجم `xhr.getAllResponseHeaders()` (سلسلة خام مفصولة بـ CRLF) إلى كائن `Headers` كي يسلك `Response` تماماً مثل ذاك الآتي من `fetch`:

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

إن **جسر AbortSignal** يحوِّل بين بدائيّ الإلغاء في `fetch` وبين توابع `abort()` في XHR. تجعل `AbortSignal.addEventListener('abort', xhr.abort)` الواجهتين تتحدَّثان اللغة نفسها؛ وفحص `signal.aborted` مسبقاً يعالج الحالة التي يمرِّر فيها المستدعي إشارة مُلغاة مسبقاً (وهو ما يحدث، مثلاً، حين تُلغي طلباً قبل إرساله).

إن **`try/catch` حول `setRequestHeader`** مقصود. تمنع المتصفحات ترويسات معيَّنة (`User-Agent`, `Cookie`, `Host`, ومعظم متغيِّرات `Sec-*` و`Proxy-*`). يتجاهلها `fetch` بصمت أيضاً، ويجعل `try/catch` سلوك XHR مطابقاً.

## الإلغاء، وانقضاء المهلة، وحدوث الخطأ

النهايات النهائية الأربع لـ XHR هي `onload` و`onerror` و`onabort` و`ontimeout`. وهي متنافية: يُطلَق واحد بالضبط لكل طلب. أما الترجمة إلى عالم `fetch`:

| حدث XHR       | المعنى                                | شكل الـ Promise                                |
|---------------|--------------------------------------|------------------------------------------------|
| `onload`      | ردَّ الخادم (بأي حالة)                | `resolve(new Response(...))`                   |
| `onerror`     | فشل شبكي، أو حجب CORS، أو DNS         | `reject(new TypeError('Network error'))`       |
| `onabort`     | استُدعي `xhr.abort()`                 | `reject(new DOMException('...', 'AbortError'))`|
| `ontimeout`   | انقضت مليّ ثوان `xhr.timeout`        | `reject(new DOMException('...', 'TimeoutError'))` |

يستخدم `fetch` النوع `TypeError` للأخطاء الشبكية و`DOMException` للإلغاء. مطابقة تلك الأنواع تعني أن معالجات الأخطاء الحالية تبقى تعمل حين تُبدِّل النواقل.

إن تعيين `xhr.timeout = 30_000` من قِبل المستدعي يُطلق `ontimeout` تلقائياً دون أي شيفرة إضافية. وهذا أحد المكاسب الصغيرة لـ XHR على `fetch` مع `AbortController` مع `setTimeout`: آليّة المهلة مبنيَّة داخلياً.

## مطبَّات تستحق التسمية

حفنة من الفخاخ كلَّفتني وقتاً في أول مرة صادفتها.

**تعيين `Content-Type` مع FormData يُفسد multipart.** إن ترويسة `multipart/form-data; boundary=...` التلقائية التي يضعها المتصفح هي الوحيدة التي يستطيع الخادم تحليلها. لا تتجاوزها.

**تقدُّم CORS مقيَّد.** بالنسبة إلى الطلبات عبر الأصول، لا تُطلَق أحداث تقدُّم الرفع إلا إذا شمل الـ response ترويسة `Access-Control-Allow-Origin` المناسبة. إن كنت ترى `loaded = 0` إلى الأبد في رفع عبر أصل مختلف، فالسبب على الأرجح CORS وليس شيفرتك.

**يجب تعيين `responseType` قبل `send()`.** تعيينه بعده لا يفعل شيئاً. يحتاج المتصفح إلى معرفة كيفية تخزين الـ response من أول بايت.

**Gzip و`Content-Length`.** تُجرِّد كثير من شبكات CDN ترويسة `Content-Length` حين تُطبِّق gzip أثناء التسليم (لأن الطول المضغوط يختلف عن الطول غير المضغوط). ويرى عميلك `lengthComputable: false` رغم أن الخادم كان يعرف الحجم. لا يوجد إصلاح من جانب العميل. إن كنت تتحكَّم بالخادم، فقدِّم محتوى مضغوطاً مسبقاً أو تجاوز الضغط للأصول التي يهم فيها التقدُّم.

**لا تحتفظ بكامل الـ response في الذاكرة دون داعٍ.** يتيح `responseType: 'blob'` للمتصفح إدارة العازلة؛ أما `responseType: 'arraybuffer'` فيُجبرها إلى ذاكرة heap في JS. لأي شيء يتجاوز بضعة MB، فإن `blob` هو الافتراضي الصحيح.

## ما سألجأ إليه أولاً

لأي مشروع يحتاج إلى واجهات تقدُّم حقيقية، الشكل الذي سأبنيه في كل مرَّة:

- **الناقل الافتراضي هو `fetch`.** إنه البدائي الحديث؛ وهو أسرع؛ ويتحوَّل إلى أنماط ودودة لـ SSR بنظافة.
- **اطلب XHR فقط حين يطلب المستدعي تقدُّماً.** يكفي خيار وحيد باسم `onRequestProgress` لتبديل الناقل لهذا الاستدعاء بالتحديد.
- **يُعيد مسار XHR `Promise<Response>`**، بحيث يستمر كل ما بعده في العمل: interceptors، وretry، وتحويل الأخطاء، وتحليل JSON.
- **طبِّع `{ loaded, total, ratio }` في طبقة النقل.** سلِّم `null` إلى الأعلى حين يكون المجموع غير معلوم. ودع الواجهة تقرِّر كيف تعرض تلك الحالة.
- **اجسر `AbortSignal` مرَّة واحدة** في الغلاف، لا عند كل مستدعٍ. تعيش `abort()` في XHR و`AbortController` في fetch في نفس الفتحة المنطقية؛ ويقوم الغلاف بالترجمة.

هذه هي الصورة الكاملة. لم يعد XHR الواجهة الرائجة؛ إنه الواجهة التي لا تزال تصلح لشيء محدَّد يعجز fetch عن فعله، والقدر الصغير من شيفرة الغراء أعلاه هو ما يمنعه من تلويث بقية قاعدة الشيفرة.
