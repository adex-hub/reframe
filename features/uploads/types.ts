import type { Artwork, Visibility } from "@/features/gallery";

export type UploadedArtwork = Artwork & { visibility: Visibility };
