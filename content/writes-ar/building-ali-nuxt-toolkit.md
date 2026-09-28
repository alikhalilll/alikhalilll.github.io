---
title: بناء ali-nuxt-toolkit، جولة داخل التفاصيل
description: ثلاث موديولات Nuxt 4 داخل monorepo مبني بـ pnpm. عميل fetch مكتوب بأنواع صارمة يدعم تقدّم الرفع، وتشفير AES-GCM مع PBKDF2، وطبقة middleware مربوطة بالـ layouts.
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

قبل فترة، قررتُ أن أجمع الأنماط التي وجدتُ نفسي أعيد كتابتها في العمل مرة بعد مرة داخل مجموعة صغيرة من موديولات Nuxt. لا شيء مبتكر هنا، فقط الأشياء التي يكتبها في النهاية أي فريق يشتغل على SaaS: عميل HTTP مكتوب بأنواع، وmiddleware مربوط بالـ layouts، وخدمة تشفير للأسرار المخزّنة محلياً. تغليف هذه الأشياء بشكل نظيف تحوّل بحد ذاته إلى مشروع مستقل، وهو **ali-nuxt-toolkit**.

هذه التدوينة جولة داخل ما بُني ولماذا اتّخذت بعض التفاصيل الشكل الذي هي عليه. سأتجاوز البديهيات وأُنفق معظم الكلام على التفاصيل التي كنتُ أتمنى قراءتها لو كتب أحد غيري هذه الحزمة.

## شكل الـ repo

`ali-nuxt-toolkit` عبارة عن monorepo مبني على pnpm. المستوى الأعلى تقريباً على هذا الشكل:

- `packages/`: ثلاث موديولات تُنشر بشكل مستقل تحت نطاق `@alikhalilll`.
- `apps/docs/`: موقع Nuxt 4 مبني على `@nuxt/content`، يُولَّد مسبقاً كـ HTML ثابت.
- `playgrounds/nuxt/`: تطبيق بسيط يربط الموديولات الثلاثة معاً، مفيد لتجربة كل شيء محلياً بسرعة.
- `.github/workflows/`: خط CI (lint وtypecheck وmatrix build على Node 20 و22) وخط إصدار مبني على Changesets.

الحزم الثلاث هي:

- **`@alikhalilll/nuxt-api-provider`**: عميل fetch بأنواع صارمة، مع سلسلة interceptors، وإعادة محاولة مع backoff، وtimeouts، وتتبّع تقدّم الرفع والتنزيل.
- **`@alikhalilll/nuxt-auto-middleware`**: طبقة route middleware مربوطة بالـ layouts، تدعم أنماط glob ومجموعات مسمّاة وتجاوزات على مستوى الصفحة.
- **`@alikhalilll/nuxt-crypto`**: تشفير AES-256-GCM مع PBKDF2 فوق Web Crypto، مع cache من نوع LRU للمفاتيح وخوارزميات قابلة للتبديل.

اخترتُ عمداً أن تكون الحزم صغيرة ومركّزة. كل واحدة تشتغل بمفردها، ولكل واحدة أيضاً نواة مستقلة عن الإطار تعمل داخل Node أو Bun أو Deno أو حتى داخل اختبار، من دون أن تحتاج إلى Nuxt أصلاً.

## هيكل الموديول

الموديولات الثلاثة تسير على نفس هيكل Nuxt 4:

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

الجزء المثير للاهتمام هو _ما لا أفعله_. لا أُمرر كائن الإعدادات عبر provide/inject في وقت التشغيل، ولا أستورد كود المستخدم مباشرة من `module.ts`. كل شيء يمر عبر ملفات مُولَّدة داخل `.nuxt`. لهذا الأسلوب فائدتان:

1. الـ runtime plugin يبقى ضئيلاً جداً، لأنه يستورد كائن JS عادي من مسار افتراضي، بلا أي عمل عند الإقلاع.
2. Tree-shaking يشتغل كما يجب. إذا لم تُستخدم ميزة معينة، فلن يُشار إلى محتوى قالبها أصلاً، وسيسقطها الـ bundle بشكل تلقائي.

### الموديولات الافتراضية، وكيف تُرضي `tsc`

القوالب المُولَّدة لا وجود لها على القرص لحظة تشغيل الـ type-checker، وبالتالي فإن سطراً مثل `import config from '#build/api-provider-config.mjs'` سيظهر كموديول مفقود بلا مجهود إضافي. لذلك تحتوي كل حزمة على ملف `nuxt-virtual.d.ts` يُصرّح بـ stubs مقابلة:

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

بهذا يمر `tsc --noEmit` بسلام، ويظل الإكمال التلقائي في المحرر يعمل على حقول الإعدادات المُولَّدة.

## `nuxt-api-provider`: interceptors قابلة للسلسلة وناقلَين اثنين

صمّمتُ الواجهة العامة لعميل الـ API لتكون مسطّحة قدر الإمكان، فأنت تناديه كما تنادي أي دالة:

```typescript
const users = await $apiProvider<User[]>('/users', { method: 'GET' });
```

وتُضيف السلوك العرضي عبر ثلاث سلاسل:

```typescript
$apiProvider.useRequest((ctx) => {
  ctx.headers.Authorization = `Bearer ${token}`;
});

$apiProvider.useResponse((ctx, response) => { /* ... */ });
$apiProvider.useError((ctx, err) => { /* ... */ });
```

كل استدعاء لـ `use*` يُرجع دالة لإلغاء الاشتراك، وهذه نقطة مهمة إذا كنتَ تُسجّل interceptors من داخل مكوّن وتحتاج إلى تنظيفها عند إلغاء تركيبه.

### ناقلان، وواجهة API واحدة

معظم الطلبات تمر عبر `fetch`، لكن `fetch` لا يكشف عن تقدّم الرفع. جانب `ReadableStream` من جسم الطلب مناسب للـ streams، غير أن المتصفحات لا تُعطيك أحداث `progress` على مستوى البايت كما يفعل XHR. لذلك عندما يُمرّر المستدعي `onRequestProgress`، يُبدّل العميل الناقل:

```typescript
const transport = ctx.options.onRequestProgress
  ? createXhrFetch(ctx.options.onRequestProgress)
  : defaultFetch;
```

الغلاف الخاص بـ XHR يُرجع كائناً على شكل Response، حتى لا يهتم بقية الـ pipeline بكيفية عودة البايتات. هذا النمط، أي "واجهة API واحدة مع تبديل المحرك تحتها"، صار نمطي المفضل منذ عامين. يُبقي الميزات الاختيارية اختيارية فعلاً، من دون أن يُفرّع مسار الكود بأكمله.

### interceptors عبر المسار، لا عبر الدالة

خيارات الموديول تبدو هكذا:

```typescript
{
  baseURL: 'https://api.example.com',
  onRequestPath:  '~/api/on-request.ts',
  onSuccessPath:  '~/api/on-response.ts',
  onErrorPath:    '~/api/on-error.ts',
}
```

الـ interceptors تُحلّ بوصفها _مسارات ملفات_، لا دوال داخلية. القالب المُولَّد يستوردها ديناميكياً، ويتكفّل الـ runtime plugin بربط ما تُصدّره في السلسلة. أفضّل ذلك لسببين:

- **لا إعدادات دائرية.** كثيراً ما يحتاج المستخدم إلى استيراد أنواع من موديول api-provider داخل الـ interceptor الخاص به. لو أن الـ interceptor عاش داخل `nuxt.config.ts`، لأصبح ملف الإعدادات معتمداً على الموديول الذي يقوم بإعداده أصلاً.
- **Code-splitting.** يُصبح كل interceptor في chunk مستقل، وهذا فرق ملموس عند التحميل البارد.

### وسم الأخطاء بلا `instanceof`

يفشل `instanceof` في اللحظة التي تنتهي فيها إلى نسختين من نفس الصنف، وهذا يحصل مع الاعتماديات المكرّرة، وiframes، وweb workers، وكل غرابة hoisting في pnpm. لذلك يعتمد نوع الخطأ في العميل على وسم Symbol بدلاً من ذلك:

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

يمنحك `Symbol.for` _نفس_ الرمز عبر كل نسخ الموديول، وبالتالي يعمل `ApiError.is(err)` في الحالات التي يفشل فيها `err instanceof ApiError`. هذه الحيلة أنقذتني في كل مشروع اضطر إلى عبور حدود بيئة تنفيذ (`realm boundary`).

## `nuxt-auto-middleware`: regex عند التجميع، dispatch عند التشغيل

يستقبل الموديول قواعد على هذه الشاكلة:

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

عند setup الموديول، يُترجَم كل glob إلى RegExp، وتُوسَّع كل مرجعية مجموعة، ثم تُسلسَل القواعد الناتجة داخل قالب مُولَّد:

```typescript
export const rules = [
  { patterns: ['^admin-.*$'], middlewares: ['auth', 'require-admin'] },
  { patterns: ['^workspace\\/.*'], middlewares: ['auth', 'workspace'] },
];
```

عند التشغيل، يُعيد الـ plugin بناء الأنماط عبر `new RegExp(source)` ويطابقها مع الـ layout الحالي. العميل لا يرى محلّل glob من الأصل، لأنه صار مُجمَّعاً مسبقاً وخارج الصورة. في تطبيق نموذجي، يوفّر هذا بضعة KB، لكن الأهم أن إضافة قواعد جديدة لا يكلّف من حجم الـ bundle سوى نصوص القواعد نفسها.

## `nuxt-crypto`: الـ LRU الذي يُخزّن الوعود

خدمة التشفير هي الجزء الذي أنا أكثر رضاً عنه. تُغلّف عناصر AES-GCM وPBKDF2 من Web Crypto بواجهة encrypt/decrypt نظيفة. لكن الحيلة الحقيقية هي في cache المفاتيح.

PBKDF2 مع مئة ألف تكرار بطيء عن قصد، وهذا كامل الغرض منه. لكن حين تحاول واجهتك فك تشفير ثلاثة حقول من IndexedDB بالتوازي، فإن اشتقاق ثلاثة مفاتيح منفصلة يكون إهداراً وبطئاً بلا مبرر. الـ cache يحلّ هذا، غير أن التفصيل الذي يُحدث الفرق فعلاً هو _ما_ الذي يُخزّنه:

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

الـ cache يحتفظ بـ `Promise<CryptoKey>` وليس بـ `CryptoKey`. إذا وصلت ثلاث نداءات `decrypt()` في نفس الـ tick وبنفس الـ salt، فإنها تنتظر جميعاً _نفس_ الوعد المعلّق، ويعمل PBKDF2 مرة واحدة فقط. أما النسخة الساذجة، أي تلك التي تُخزّن المفتاح الجاهز، فتترك نافذة زمنية يرى فيها استدعاءان أن الـ cache فارغ ويبدآن نفس العمل بالتوازي.

الـ LRU نفسه يستفيد من كون `Map` في JavaScript يحتفظ بترتيب الإدراج:

```typescript
get(key: string): Promise<CryptoKey> | undefined {
  const value = this.map.get(key);
  if (!value) return undefined;
  this.map.delete(key);   // delete + re-insert moves to newest
  this.map.set(key, value);
  return value;
}
```

وبالتالي يصبح الإخلاء بسيطاً جداً: `this.map.keys().next().value` هو الأقدم دائماً.

### حمولات مُصدَّرة بإصدار

مخرجات التشفير تحمل بايت إصدار في أولها:

```
[version: 1B] [salt: 16B] [iv: 12B] [ciphertext: ...]
```

عند فك التشفير، تفشل الإصدارات غير المتطابقة مبكراً. هذا من الأشياء التي تُضاف قبل الحاجة إليها فعلاً. يوم أن أرغب في التدوير من AES-GCM إلى خوارزمية ما بعد الكم، ستظل الحمولات القديمة تُفكّ عبر الخوارزمية القديمة، بينما تستخدم الحمولات الجديدة الخوارزمية الجديدة. من دون بايت إصدار، ستجد نفسك عالقاً في التخمين.

## موقع الوثائق كـ playground للموديولات

`apps/docs` يستخدم الموديولات الثلاثة. يبدو الأمر بديهياً، لكنه محوري: الوثائق هي _الطريقة التي أكتشف بها العطب_ قبل أن يكتشفه المستخدمون. إذا كسر تحديث لـ api-provider مثالَ JSON Placeholder داخل موقع الوثائق، تسقط CI عند خطوة البناء مباشرة. لا حاجة إلى مجموعة اختبارات مخصّصة لهذا النوع من الانحدارات.

من الأشياء الأخرى التي أثبتت جدارتها:

- **`@tailwindcss/vite`**: لا PostCSS، ولا `tailwind.config.js`، فقط Vite plugin. ملف إعدادات أقل يعني حياة أهدأ.
- **التوليد المسبق الثابت إلى GitHub Pages**: إعداد `github-pages` في Nitro يُنتج لك `/.output/public/`، ثم ترفعه Actions مباشرة إلى Pages. بلا خوادم، بلا إبطال cache، بلا مفاجآت.
- **`NUXT_PUBLIC_CF_ANALYTICS_TOKEN`**: تحليلات Cloudflare Web اختيارية، بلا كوكيز ولا لافتة موافقة ولا رأي مفروض.

## الإصدار: Changesets حتى النهاية

كل PR يُعدّل حزمة يتضمّن ملف `.changeset/<id>.md` يصف الترقية وسطر changelog. على master، يعمل GitHub Action يُشغّل `changesets version`، وينتهي إلى أحد أمرين:

1. إما فتح PR بعنوان "Version Packages" يحمل الإصدارات المرقّاة.
2. أو النشر إلى npm مباشرة إذا كانت الإصدارات قد رُقيّت مسبقاً.

هذا هو أقلّ الإعدادات جهداً بين كل ما جرّبت، ويعطيك في المقابل changelogs صادقة، وانضباط semver، ونشراً إلى npm بلا تدخّل يدوي. خط الـ CI نفسه ثلاثة ملفات فقط: `ci.yml` للـ lint والـ typecheck وmatrix build، و`release.yml` للـ changesets، و`commitlint.yml` لفرض conventional commits على الـ PRs.

## الأجزاء التي سأعيد استخدامها غداً

لو بدأتُ موديول Nuxt جديداً من الصفر، لنقلتُ هذه الأنماط بلا تفكير:

- **تسلسل الإعدادات إلى ملف `.mjs` مُولَّد.** يُجنّبك إعادة التقييم في وقت التشغيل، ويُبقي الـ runtime plugin في حدود خمسة عشر سطراً.
- **stubs من `.d.ts` للموديولات الافتراضية.** يمنحك typecheck يعمل دون تشغيل خطوة prepare في Nuxt.
- **أخطاء موسومة بـ Symbol.** ميزة مجانية للموديولات ذات الحركة الخفيفة، ومنقذة فعلاً للتي تعبر حدود بيئات التنفيذ.
- **caches مفتاحها الوعد.** كلما كانت العملية غير متزامنة ومكلفة، خزّن الوعد لا النتيجة.
- **نواة مستقلة عن الإطار مع غلاف Nuxt رفيع.** يجعل الكود أسهل في الاختبار، وأسهل في إعادة الاستخدام، وأسهل في الحذف عند الحاجة.

الـ repo مرخّص برخصة MIT ومتاح على [GitHub](https://github.com/alikhalilll). إذا لاحظت شيئاً يمكن تحسينه، افتح issue. أُفضّل أن يُصحّحني أحدهم على أن أظل مرتاحاً في مكاني.
