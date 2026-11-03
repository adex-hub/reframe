import { MARK } from "@/lib/brand";

/** The wordmark's type, shared with the loading screen so the two always match. */
export const WORDMARK_CLASS = "font-display leading-[normal] font-bold tracking-[-.02em]";
/** The mark as it sits in the wordmark: sized and set on the text baseline like a letter. */
export const MARK_CLASS = "mr-[.06em] ml-[.07em] inline-block size-[.74em] align-[-.03em]";
/** The viewBox that crops tightly to the mark. */
export const MARK_VIEWBOX = "3 3 26 26";

/** "Reframe" with the mark standing in for the "a". */
export function Logo() {
  return (
    <h1 className={`m-0 text-[1.6rem] ${WORDMARK_CLASS}`} aria-label="Reframe">
      Refr
      <svg className={MARK_CLASS} viewBox={MARK_VIEWBOX} fill="currentColor" aria-hidden="true" dangerouslySetInnerHTML={{ __html: MARK }} />
      me
    </h1>
  );
}
