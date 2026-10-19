import { MARK } from "@/lib/brand";

/** "Reframe" with the mark standing in for the "a". */
export function Logo() {
  return (
    <h1 className="m-0 font-display text-[1.6rem] leading-[normal] font-bold tracking-[-.02em]" aria-label="Reframe">
      Refr
      <svg
        className="mr-[.06em] ml-[.07em] inline-block size-[.74em] align-[-.03em]"
        viewBox="3 3 26 26"
        fill="currentColor"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: MARK }}
      />
      me
    </h1>
  );
}
