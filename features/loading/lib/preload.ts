/**
 * Fetch images so they're in the browser's cache: the board
 * and gallery draw paintings as CSS backgrounds, which can't report when they've loaded, but
 * they reuse these cached copies instantly. A failed image never blocks; nor does a slow load
 * past `timeoutMs`.
 */
export function preload(srcs: string[], timeoutMs: number): Promise<void> {
  // The load event, not img.decode(): decoding waits on rendering, which stalls whenever the browser
  // stops drawing frames; having the file in the cache is what the CSS backgrounds need.
  const images = srcs.map(
    (src) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = src;
      }),
  );
  // Fonts aren't waited for: next/font preloads them with the page.
  const all = Promise.allSettled(images).then(() => {});
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  return Promise.race([all, timeout]);
}
