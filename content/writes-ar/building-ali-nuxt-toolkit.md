---
title: بناء ali-nuxt-toolkit، جولة داخل التفاصيل
description: ثلاث موديولات Nuxt 4 داخل monorepo يعتمد على pnpm. عميل fetch مكتوب بأنواع مع دعم لتقدّم الرفع، وتشفير بـ AES-GCM وPBKDF2، وطبقة middleware مربوطة بالـ layouts.
date: 2026-01-12
lang: ar
keywords:
  - Nuxt 4
  - موديولات Nuxt
  - TypeScript
  - monorepo بـ pnpm
  - عميل fetch
  - Interceptors
  - تقدّم الرفع
  - AES-GCM
  - PBKDF2
  - Web Crypto
  - route middleware
  - Changesets
---

منذ فترة قررت أن أجمع الأنماط التي كنت أعيد كتابتها في العمل داخل مجموعة صغيرة من موديولات Nuxt. لا شيء مبتكر، فقط الأشياء التي يكتبها كل فريق SaaS في نهاية المطاف: عميل HTTP مكتوب بأنواع، وmiddleware مربوط بالـ layouts، وخدمة تشفير للأسرار المخزّنة محلياً. تحوّلت عملية تغليفها بشكل صحيح إلى مشروع مستقل بحد ذاته: **ali-nuxt-toolkit**.

هذه التدوينة جولة داخل ما بالداخل ولماذا صيغت أجزاء معينة بالطريقة التي هي عليها. سأتخطى الأجزاء البديهية وأقضي معظم الكلمات على التفاصيل التي كنت لأرغب في قراءتها لو أن شخصاً آخر كتبها.

## شكل الـ repo

`ali-nuxt-toolkit` هو monorepo يعتمد على pnpm. المستوى الأعلى تقريباً كالتالي:

- `packages/`: ثلاث موديولات مستقلة النشر تحت نطاق `@alikhalilll`.
- `apps/docs/`: موقع Nuxt 4 مع `@nuxt/content`، مُولَّد مسبقاً كـ HTML ثابت.
- `playgrounds/nuxt/`: تطبيق بسيط يربط الموديولات الثلاثة معاً، مفيد لتجربتها محلياً.
- `.github/workflows/`: CI (lint، typecheck، matrix build على Node 20 و22) وخط إصدار مدفوع بـ Changesets.

الحزم الثلاث:

- **`@alikhalilll/nuxt-api-provider`**: عميل fetch مكتوب بأنواع قوية مع سلسلة interceptors، وretry/backoff، وtimeouts، وتقدّم الرفع والتنزيل.
- **`@alikhalilll/nuxt-auto-middleware`**: route middleware مربوط بالـ layouts مع أنماط glob، ومجموعات مسمّاة، وتجاوزات لكل صفحة.
- **`@alikhalilll/nuxt-crypto`**: AES-256-GCM وPBKDF2 مبني على Web Crypto، مع cache من نوع LRU للمفاتيح وخوارزميات قابلة للتبديل.

هي صغيرة ومركّزة عمداً. كل واحدة تعمل بشكل مستقل. لكل واحدة أيضاً "core" غير مرتبط بالإطار يمكن تشغيله في Node أو Bun أو Deno أو داخل اختبار. لا حاجة إلى Nuxt.

## هيكل الموديول

جميع الموديولات الثلاثة تتبع نفس شكل Nuxt 4:

```typescript
export default defineNuxtModule<Options>({
  meta: {
    name,
    configKey,
    compatibility: { nuxt: '>=3.0.0' },
  },
  defaults: { /* ... */ },
  setup(options, nuxt) {
    // 1. Write a serialized config file into .nuxt
    addTemplate({
      filename: 'my-module-config.mjs',
      getContents: () => `export default ${JSON.stringify(config)};\n`,
    });

    // 2. Register the runtime plugin
    addPlugin({ src: resolver.resolve('./runtime/plugin'), mode: 'all' });

    // 3. Augment Nuxt's types so $myModule shows up everywhere
    const typesTemplate = addTemplate({
      filename: 'types/my-module.d.ts',
      getContents: () => typeDeclarations,
    });
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: typesTemplate.dst });
    });
  },
});
```

الجزء المثير للاهتمام هو _ما لا أفعله_. أنا لا أمرر كائن الإعدادات عبر provide/inject في وقت التشغيل، ولا أستورد كود المستخدم مباشرة من `module.ts`. كل شيء يمر عبر ملفات مُولَّدة داخل `.nuxt`. لهذا فائدتان:

1. يبقى الـ runtime plugin صغيراً جداً. فهو يستورد كائن JS بسيط من مسار افتراضي. لا عمل عند الإقلاع.
2. Tree-shaking يعمل. إذا لم تُستخدم ميزة معينة، فمحتويات القالب الخاصة بها لا تتم الإشارة إليها، ويسقطها الـ bundle.

### الموديولات الافتراضية، وكيفية إبقاء `tsc` سعيداً

القوالب المُولَّدة غير موجودة على القرص عند تشغيل الـ type-checker. بدون جهد إضافي، سيتم تمييز `import config from '#build/api-provider-config.mjs'` على أنه مفقود. كل حزمة تحتوي على `nuxt-virtual.d.ts` تصرّح بـ stubs:

```typescript
declare module '#build/api-provider-config.mjs' {
  const config: {
    baseURL: string;
    defaultTimeoutMs: number;
    retry: { attempts: number; baseDelayMs: number };
  };
  export default config;
}
```

الآن ينجح `tsc --noEmit`، وإكمال الكود التلقائي في المحرر لا يزال يعمل على حقول الإعدادات المُولَّدة.

## `nuxt-api-provider`: interceptors قابلة للسلسلة و transports اثنان

السطح العام لعميل الـ API مسطح عمداً. تناديه كدالة:

```typescript
const users = await $apiProvider<User[]>('/users', { method: 'GET' });
```

تضيف سلوكاً عابراً عبر ثلاث سلاسل:

```typescript
$apiProvider.useRequest((ctx) => {
  ctx.headers.Authorization = `Bearer ${token}`;
});

$apiProvider.useResponse((ctx, response) => { /* ... */ });
$apiProvider.useError((ctx, err) => { /* ... */ });
```

كل `use*` يعيد دالة إلغاء اشتراك، وهذا مهم إذا كنت تسجل interceptors من مكوّن وتريد التنظيف عند إلغاء التركيب.

### transports اثنان، واجهة API واحدة

معظم الطلبات تمر عبر `fetch`. لكن `fetch` لا يكشف تقدّم الرفع. جانب `ReadableStream` من جسم الـ Request مناسب للـ streams لكن المتصفحات لا تعطيك أحداث `progress` على مستوى البايت كما يفعل XHR. لذا عندما يمرر المستدعي `onRequestProgress`، يقوم العميل بتبديل الـ transports:

```typescript
const transport = ctx.options.onRequestProgress
  ? createXhrFetch(ctx.options.onRequestProgress)
  : defaultFetch;
```

الغلاف الخاص بـ XHR يعيد كائناً على شكل Response لكي لا تهتم بقية الـ pipeline بكيفية عودة البايتات. هذا النمط، "واجهة API واحدة مع تبديل المحرك تحتها"، كان نمطي المفضل لعامين. يبقي الميزات الاختيارية اختيارية دون تفريع كل مسار الكود.

### interceptors عبر المسار، وليس عبر الدالة

خيارات الموديول تبدو هكذا:

```typescript
{
  baseURL: 'https://api.example.com',
  onRequestPath:  '~/api/on-request.ts',
  onSuccessPath:  '~/api/on-response.ts',
  onErrorPath:    '~/api/on-error.ts',
}
```

يتم حل الـ interceptors كـ _مسارات ملفات_، وليس كدوال داخلية. القالب المُولَّد يستوردها ديناميكياً، والـ runtime plugin يوصل ما تم تصديره إلى السلسلة. لسببين:

- **لا إعدادات دائرية.** المستخدمون كثيراً ما يريدون استيراد أنواع من موديول api-provider داخل الـ interceptor الخاص بهم. لو أن الـ interceptor عاش داخل `nuxt.config.ts`، لأصبح ملف الإعدادات معتمداً على الموديول الذي يقوم بإعداده.
- **Code-splitting.** يصبح الـ interceptor chunk خاص به، وهذا مهم عند التحميل البارد.

### وسم الأخطاء بدون `instanceof`

`instanceof` يفشل في اللحظة التي يكون لديك فيها نسختان من نفس الصنف. يحدث ذلك مع الاعتماديات المكررة، أو iframes، أو web workers، أو خصائص hoisting في pnpm. نوع خطأ العميل يستخدم علامة Symbol بدلاً من ذلك:

```typescript
const API_ERROR_BRAND: unique symbol = Symbol.for(
  '@alikhalilll/nuxt-api-provider.ApiError'
);

export class ApiError extends Error {
  readonly [API_ERROR_BRAND] = true;

  static is(e: unknown): e is ApiError {
    return typeof e === 'object' && e !== null && API_ERROR_BRAND in e;
  }
}
```

`Symbol.for` يعطيك _نفس_ الرمز عبر نسخ الموديول. `ApiError.is(err)` يعمل حيث لا يعمل `err instanceof ApiError`. هذا أنقذني في كل مشروع عبر حدود realm.

## `nuxt-auto-middleware`: regex في وقت التجميع، dispatch في وقت التشغيل

يأخذ الموديول قواعد كهذه:

```typescript
autoMiddleware: {
  groups: {
    adminOnly: ['auth', 'require-admin'],
  },
  rules: [
    { layouts: ['admin-*'], middlewares: ['@adminOnly'] },
    { layouts: [/^workspace\/.*/], middlewares: ['auth', 'workspace'] },
  ],
}
```

في وقت setup الموديول، يتم تجميع كل glob إلى RegExp. يتم توسيع كل مرجع مجموعة. يتم _تسلسل_ القواعد الناتجة داخل قالب مُولَّد:

```typescript
export const rules = [
  { patterns: ['^admin-.*$'], middlewares: ['auth', 'require-admin'] },
  { patterns: ['^workspace\\/.*'], middlewares: ['auth', 'workspace'] },
];
```

في وقت التشغيل، يعيد الـ plugin ترطيب الأنماط بـ `new RegExp(source)` ويطابقها مع الـ layout الحالي. العميل لا يرى مطلقاً محلل glob، فقد تم تجميعه مسبقاً وإزالته. في تطبيق نموذجي هذا يوفر بضعة KB، لكن الأهم من ذلك أن إضافة المزيد من القواعد لا يكلف حجم bundle إضافي بخلاف نصوص القواعد نفسها.

## `nuxt-crypto`: الـ LRU الذي يخزن الوعود

خدمة التشفير هي الجزء الذي أنا الأكثر رضا عنه. تغلف عناصر AES-GCM وPBKDF2 من Web Crypto بواجهة encrypt/decrypt نظيفة. الحيلة هي في cache المفاتيح.

PBKDF2 مع 100,000 تكرار بطيء عن قصد، وهذا هو بيت القصيد. لكن عندما تحاول واجهتك فك تشفير ثلاثة حقول من IndexedDB بالتوازي، فإن إجراء ثلاث اشتقاقات مفاتيح منفصلة هو إهدار وبطيء. الـ cache يحل ذلك، لكن التفصيل الذي يهم فعلاً هو _ماذا_ يخزّن:

```typescript
const getDerivedKey = async (salt, fingerprint?) => {
  const key = KeyCache.key(salt, iterations, fingerprint);
  const cached = cache.get(key);
  if (cached) return cached;

  // Cache the promise, not the settled key
  const pending = algorithm.deriveKey({
    subtle,
    passphrase,
    fingerprint,
    salt,
    iterations,
  });
  cache.set(key, pending);
  return pending;
};
```

الـ cache يحتفظ بـ `Promise<CryptoKey>`، وليس `CryptoKey`. إذا وصلت ثلاث نداءات `decrypt()` في نفس الـ tick بنفس الـ salt، فإنها جميعاً تنتظر _نفس_ الوعد المعلق. PBKDF2 يعمل مرة واحدة. النسخة الساذجة (تخزين المفتاح النهائي) تترك نافذة يرى فيها اثنان من النداءات "غير مخزّن" ويبدآن عملاً مكرراً.

الـ LRU نفسه يستخدم حقيقة أن `Map` في JavaScript يحافظ على ترتيب الإدراج:

```typescript
get(key: string): Promise<CryptoKey> | undefined {
  const value = this.map.get(key);
  if (!value) return undefined;
  this.map.delete(key);   // delete + re-insert moves to newest
  this.map.set(key, value);
  return value;
}
```

الإخلاء إذن هو فقط `this.map.keys().next().value`: الأقدم.

### حمولات مُصدّرة بإصدار

مخرجات التشفير تحمل بايت إصدار:

```
[version: 1B] [salt: 16B] [iv: 12B] [ciphertext: ...]
```

عند فك التشفير، الإصدارات غير المتطابقة تفشل مبكراً. هذا من نوع الأشياء التي تضيفها قبل أن تحتاج إليها. اليوم الذي أريد فيه التدوير من AES-GCM إلى شيء ما بعد الكم، ستظل الحمولات القديمة تُفك عبر الخوارزمية القديمة بينما تستخدم الجديدة الخوارزمية الجديدة. بدون بايت إصدار ستكون عالقاً في التخمين.

## موقع الوثائق كـ playground للموديولات

`apps/docs` يستخدم الموديولات الثلاثة. يبدو ذلك بديهياً، لكنه حاسم: الوثائق هي _كيف ألاحظ العطب_ قبل أن يلاحظه المستخدمون. إذا كسر تحديث لـ api-provider عرض JSON Placeholder التوضيحي في موقع الوثائق، تفشل CI عند خطوة البناء. لا حاجة إلى مجموعة اختبارات لذلك النوع من الانحدارات.

أشياء أخرى أثبتت جدارتها:

- **`@tailwindcss/vite`**: لا PostCSS، لا `tailwind.config.js`، فقط Vite plugin. ملف إعدادات أقل في حياتي.
- **Static prerender إلى GitHub Pages**: إعداد `github-pages` في Nitro يمنحك `/.output/public/` الذي ترفعه Actions مباشرة إلى Pages. لا خوادم، لا إبطال cache، لا مفاجآت.
- **`NUXT_PUBLIC_CF_ANALYTICS_TOKEN`**: Cloudflare Web Analytics اختياري. لا كوكيز، لا لافتة، لا رأي.

## الإصدار: Changesets في كل شيء

كل PR يغير حزمة يتضمن `.changeset/<id>.md` يصف الترقية وإدخال changelog. على master، يعمل GitHub Action يشغل `changesets version` ويقوم بأحد الأمرين:

1. يفتح PR باسم "Version Packages" مع الإصدارات المرقّاة، أو
2. ينشر إلى npm إذا كانت الإصدارات مرقّاة بالفعل.

هذا هو الإعداد الأقل جهداً الذي وجدته والذي يعطي changelogs صادقة، وانضباط semver، ونشراً إلى npm بدون تدخل يدوي. خط CI نفسه ثلاث ملفات: `ci.yml` (lint وtypecheck وmatrix build)، و`release.yml` (changesets)، و`commitlint.yml` (conventional commits على الـ PRs).

## الأجزاء التي كنت لأعيد استخدامها غداً

لو كنت أبدأ موديول Nuxt جديد من الصفر، كنت لأنقل هذه الأنماط بدون تفكير:

- **تسلسل الإعدادات إلى ملف `.mjs` مُولَّد.** يتجنب إعادة التقييم في وقت التشغيل، ويبقى الـ runtime plugin في 15 سطراً.
- **stubs من `.d.ts` للموديولات الافتراضية.** typecheck خارج الاتصال بدون تشغيل خطوة prepare في Nuxt.
- **أخطاء موسومة بـ Symbol.** مجانية للموديولات ذات الحركة المنخفضة، ومنقذة للحياة للتي تعبر realms.
- **caches مفتاحها الوعد.** في أي وقت تكون فيه العملية الأساسية غير متزامنة ومكلفة، خزّن الوعد، وليس النتيجة.
- **core غير مرتبط بالإطار مع غلاف Nuxt رفيع.** يجعل الكود أسهل في الاختبار، وأسهل في إعادة الاستخدام، وأسهل في الحذف.

الـ repo مرخص برخصة MIT ويعيش على [GitHub](https://github.com/alikhalilll). إذا لاحظت شيئاً يمكن تحسينه، افتح issue. أفضل حقاً أن يتم تصحيحي بدلاً من أن أكون مرتاحاً.
