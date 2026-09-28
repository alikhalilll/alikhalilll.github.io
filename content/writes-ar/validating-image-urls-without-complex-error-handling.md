---
title: التحقق من روابط الصور دون معالجة أخطاء معقّدة
description: مساعد صغير غير متزامن يستخدم كائن Image في المتصفح ليخبرك ما إذا كان الرابط ينتهي فعلاً إلى صورة قابلة للتحميل، بدون fetch وبدون القلق بشأن CORS.
date: 2023-07-11
lang: ar
keywords:
  - JavaScript
  - التحقق من الصور
  - غير متزامن
  - Promise
  - صورة احتياطية
  - كائن Image
  - Browser API
  - TypeScript
---

إن سبق لك عرض قائمة صور مصدرها بيانات غير موثوقة، فأنت تعرف النمط. أغلب الروابط سليمة، القليل منها معطّل، وأيقونة الصورة المكسورة تُخرِّب التخطيط. يمكنك أن تلفّ كل شيء بـ `try/catch`، أو يمكنك أن تسأل المتصفح مباشرةً: هل تستطيع تحميل هذا؟

هذا بالضبط ما تفعله `checkUrl`. تُعيد Promise تُحلّ عند نجاح تحميل الصورة، وتُرفض عند فشلها. بدون fetch، وبدون التعامل مع CORS، وبدون طلبات HEAD يدوية.

## الفكرة

Promise تُحلّ أو تُرفض بناءً على نجاح تحميل الصورة:

```javascript
// success
const promise = new Promise<void>((resolve, reject) => { resolve() })

// failure
const promise = new Promise<void>((resolve, reject) => { reject() })
```

## استخدام كائن Image المدمج

داخل الـ callback، أنشئ `Image`، اربط `onload` و`onerror`، ثم عيّن `src` لبدء الطلب.

```javascript
const img = new Image();
img.onload = () => resolve();
img.onerror = () => reject();
img.src = url;
```

هذه هي الآلية كاملةً. المتصفح يقوم بالعمل، وPromise ليست إلا غلافاً رفيعاً حول حدثين.

## استخدامها مع صورة احتياطية

الاستخدام الأكثر شيوعاً هو التبديل إلى صورة احتياطية عندما يكون الرابط الأصلي معطّلاً.

```javascript
const fallbackImage = 'https://example.com/fallback.png';
let url: string = anonymousOBJECT.image;

const checkImage = async () => {
  try {
    await checkUrl(url);
    // valid, keep the original
  } catch {
    // invalid, swap in the fallback
    url = fallbackImage;
  }
};

checkImage();
```

```html
<img :src="url" />
```

لا معالجة أخطاء مخصَّصة داخل القالب، ولا وميض لصورة مكسورة، ورابط جاهز بحلول اللحظة التي يصل فيها إلى الـ DOM.

نُشر أصلاً على [LinkedIn](https://www.linkedin.com/pulse/without-having-write-complex-error-handling-code-image-ali-abdelbaqy/).
