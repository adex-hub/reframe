import { useEffect, useRef, useState } from "react";

/** Tracks whether a horizontal scroller has more content hidden off its left and right edges. */
export function useScrollEdges<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ before: false, after: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      // 1px of slack for sub-pixel scroll positions.
      const before = el.scrollLeft > 1;
      const after = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      setEdges((e) => (e.before === before && e.after === after ? e : { before, after }));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    // Re-check when the strip resizes or artworks are added or removed.
    const resize = new ResizeObserver(update);
    resize.observe(el);
    const mutate = new MutationObserver(update);
    mutate.observe(el, { childList: true });
    return () => {
      el.removeEventListener("scroll", update);
      resize.disconnect();
      mutate.disconnect();
    };
  }, []);

  return { ref, ...edges };
}
