import { MARK } from "@/lib/brand";

/** Point the favicon at the mark in the given colour, so it follows system theme changes without a reload. */
export function setFavicon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="${color}">${MARK}</svg>`;
  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach((l) => (l.href = href));
}
