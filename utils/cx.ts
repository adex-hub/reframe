import { twMerge } from "tailwind-merge";

/** Join class names, skipping falsy ones; later Tailwind classes override earlier conflicting ones. */
export const cx = (...names: (string | false | null | undefined)[]) => twMerge(names.filter(Boolean).join(" "));
