import type { Visibility } from "@/features/gallery";

export const VISIBILITY_INFO: Record<Visibility, string> = {
  private: "Only you can see this. It's saved on this device and shows up in your gallery, but there's no link to share it.",
  public: "It joins the gallery and gets a link you can share, so others can solve it too.",
};

/** Side length, in pixels, of the square image saved for a puzzle. */
export const OUTPUT_SIZE = 900;

/** Size of the drop zone / crop square: shrinks on short laptops so the whole modal stays on screen. */
export const IMAGE_AREA = "aspect-square w-[min(100%,max(220px,calc(100dvh_-_450px)))] justify-self-center rounded-xl border-2 bg-canvas";
