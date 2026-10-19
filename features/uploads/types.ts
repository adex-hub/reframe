import type { Artwork, Visibility } from "@/features/gallery";

/** The editable details of an upload, as typed into the form. */
export type ArtworkDetails = { title: string; artistName: string; year: string };

export type UploadedArtwork = Artwork &
  ArtworkDetails & {
    id: string;
    visibility: Visibility;
  };

/** What the upload modal hands over; the id and display credit are filled in when it's saved. */
export type NewUpload = ArtworkDetails & { src: string; visibility: Visibility };
