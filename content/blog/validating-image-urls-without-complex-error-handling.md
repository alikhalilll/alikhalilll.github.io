---
title: Validating image URLs without complex error handling
description: A tiny async helper that uses the browser's Image object to tell you whether a URL actually resolves to a loadable image.
date: 2023-07-11
---

If you've ever rendered a list of images from untrusted data, you know the pattern: most URLs are fine, a few are dead, and the broken-image icon ruins the layout. You can wrap everything in `try/catch`, or you can ask the browser directly: _can you load this?_

That's what `checkUrl` does. It returns a Promise that resolves when the image loads and rejects when it doesn't — no fetch, no CORS fiddling, no manual HEAD requests.

## The idea

A Promise that resolves or rejects based on whether the image loads:

```javascript
// success
const promise = new Promise<void>((resolve, reject) => { resolve() })

// failure
const promise = new Promise<void>((resolve, reject) => { reject() })
```

## Using the built-in Image object

Inside the callback, create an `Image`, wire up `onload` and `onerror`, then set `src` to kick off the request.

```javascript
const img = new Image();
img.onload = () => resolve();
img.onerror = () => reject();
img.src = url;
```

That's the whole mechanism. The browser does the work; the Promise is just a thin wrapper around two events.

## Using it with a fallback

The most common use case is swapping to a fallback when the original URL is broken.

```javascript
const fallbackImage = 'https://example.com/fallback.png';
let url: string = anonymousOBJECT.image;

const checkImage = async () => {
  try {
    await checkUrl(url);
    // valid — keep the original
  } catch {
    // invalid — swap in the fallback
    url = fallbackImage;
  }
};

checkImage();
```

```html
<img :src="url" />
```

No custom error handling in the template, no flicker of a broken image — just a resolved URL by the time it hits the DOM.

Originally published on [LinkedIn](https://www.linkedin.com/pulse/without-having-write-complex-error-handling-code-image-ali-abdelbaqy/).
