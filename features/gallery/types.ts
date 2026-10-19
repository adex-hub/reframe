export type Visibility = "private" | "public";

export type Artwork = {
  title: string;
  /** Artist and date, e.g. "Claude Monet, c. 1925". */
  artist: string;
  src: string;
  /** Only set on artworks people upload themselves. */
  visibility?: Visibility;
};
