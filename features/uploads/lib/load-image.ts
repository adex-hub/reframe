/** Decode an image file. Resolves with the element and its object URL, which the caller must revoke. */
export function loadImage(file: File): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("That file isn't an image. Try a JPEG, PNG or WebP."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't open that image. Try a JPEG, PNG or WebP."));
    };
    img.src = url;
  });
}
