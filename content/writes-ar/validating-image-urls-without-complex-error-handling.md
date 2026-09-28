---
title: التحقق من روابط الصور دون معالجة أخطاء معقّدة
description: دالة مساعدة صغيرة غير متزامنة تستخدم كائن Image في المتصفح لتخبرك ما إذا كان الرابط ينتهي فعلاً إلى صورة قابلة للتحميل، بلا fetch وبلا صداع CORS.
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

كل من عرض يوماً قائمة صور قادمة من بيانات لا يثق بها يعرف القصة جيداً. معظم الروابط تعمل، وواحد أو اثنان معطّلان، وأيقونة الصورة المكسورة تكفي وحدها لتخريب التصميم كاملاً. أمامك خياران: تلفّ كل شيء داخل `try/catch`، أو تسأل المتصفح مباشرةً وتدعه يجيب بنفسه: هل يمكنك تحميل هذا الرابط؟

هذا تحديداً ما كتبتُ `checkUrl` من أجله. تُعيد لك Promise ينجح تحليلها عند تحميل الصورة، ويُرفض عند فشلها. بلا fetch، وبلا صداع CORS، وبلا حاجة لإطلاق طلبات HEAD يدوياً.

## الفكرة

Promise ينجح تحليلها أو تُرفض بحسب ما إذا كانت الصورة قد تحمّلت:

```javascript
// success
const promise = new Promise<void>((resolve, reject) => { resolve() })

// failure
const promise = new Promise<void>((resolve, reject) => { reject() })
```

## الاستعانة بكائن Image الجاهز في المتصفح

داخل الـ callback، أنشئ `Image`، اربط `onload` و`onerror`، ثم اضبط `src` ليبدأ الطلب.

```javascript
const img = new Image();
img.onload = () => resolve();
img.onerror = () => reject();
img.src = url;
```

هذه هي الحكاية كلها. المتصفح يتكفّل بالعمل الفعلي، وPromise مجرد غلاف رفيع حول حدثين لا أكثر.

## استخدامها مع صورة احتياطية

الحالة الأكثر شيوعاً عندي هي التبديل إلى صورة احتياطية حين يكون الرابط الأصلي معطّلاً.

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

لا معالجة أخطاء داخل القالب، ولا وميض مزعج لصورة مكسورة، والرابط يصل جاهزاً إلى الـ DOM.

نُشر أصلاً على [LinkedIn](https://www.linkedin.com/pulse/without-having-write-complex-error-handling-code-image-ali-abdelbaqy/).
