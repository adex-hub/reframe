import { clamp } from "@/utils/clamp";

export const MAX_ZOOM = 4;

/** Crop as the centre of the square (0–1 of the image's width/height) plus a zoom factor. */
export type Crop = { cx: number; cy: number; z: number };

export const INITIAL_CROP: Crop = { cx: 0.5, cy: 0.5, z: 1 };

/** The crop square in image pixels, kept inside the image. */
export function cropBox(im: HTMLImageElement, c: Crop) {
  const w = im.naturalWidth, h = im.naturalHeight;
  const s = Math.min(w, h) / c.z;
  const left = clamp(c.cx * w - s / 2, 0, w - s);
  const top = clamp(c.cy * h - s / 2, 0, h - s);
  return { w, h, s, left, top };
}

/** Snap a crop back inside the image so dragging past an edge doesn't build up slack. */
export function fitCrop(im: HTMLImageElement, c: Crop): Crop {
  const z = clamp(c.z, 1, MAX_ZOOM);
  const { w, h, s, left, top } = cropBox(im, { ...c, z });
  return { cx: (left + s / 2) / w, cy: (top + s / 2) / h, z };
}

/** Render the cropped square as a JPEG data URL. */
export function renderCrop(im: HTMLImageElement, c: Crop, size: number): string {
  const { s, left, top } = cropBox(im, c);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas.getContext("2d")!.drawImage(im, left, top, s, s, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.85);
}
