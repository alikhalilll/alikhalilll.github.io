---
title: Validating image URLs without complex error handling
title_ar: التحقق من روابط الصور دون معالجة أخطاء معقّدة
description: A small async helper that uses the browser's Image object to tell you whether a URL actually resolves to a loadable image, without a fetch and without CORS concerns.
description_ar: دالة مساعدة صغيرة غير متزامنة تستخدم كائن Image في المتصفح لتخبرك ما إذا كان الرابط ينتهي فعلاً إلى صورة قابلة للتحميل، بلا fetch وبلا صداع CORS.
date: 2023-07-11
lang: en
keywords:
  - JavaScript
  - image validation
  - async
  - Promise
  - fallback image
  - Image object
  - browser API
  - TypeScript
---

If you have ever rendered a list of images from untrusted data, you know the pattern. Most URLs are fine, a few are dead, and the broken-image icon ruins the layout. You can wrap everything in `try/catch`, or you can ask the browser directly: can you load this?

That is what `checkUrl` does. It returns a Promise that resolves when the image loads and rejects when it does not. No fetch, no CORS handling, and no manual HEAD requests.

## The idea

A Promise that resolves or rejects based on whether the image loads:

```javascript
// success
const promise = new Promise<void>((resolve, reject) => { resolve() })

// failure
const promise = new Promise<void>((resolve, reject) => { reject() })
```

## Using the built-in Image object

Inside the callback, create an `Image`, wire up `onload` and `onerror`, and then set `src` to start the request.

```javascript
const img = new Image();
img.onload = () => resolve();
img.onerror = () => reject();
img.src = url;
```

That is the entire mechanism. The browser does the work, and the Promise is a thin wrapper around two events.

## Using it with a fallback

The most common use case is swapping to a fallback when the original URL is broken.

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

No custom error handling in the template, no flicker of a broken image, and a resolved URL by the time it hits the DOM.

Originally published on [LinkedIn](https://www.linkedin.com/pulse/without-having-write-complex-error-handling-code-image-ali-abdelbaqy/).
