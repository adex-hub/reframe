const UNKNOWN_ARTIST = "Unknown artist";

/** The gallery's credit line, e.g. "Jane Doe, 2026". */
export function creditLine(artistName: string, year: string): string {
  return [artistName.trim() || UNKNOWN_ARTIST, year.trim()].filter(Boolean).join(", ");
}

/** Older uploads only stored the joined credit line; split it back into name and year. */
export function parseCreditLine(artist: string): { artistName: string; year: string } {
  const i = artist.lastIndexOf(", ");
  const hasYear = i >= 0 && /\d/.test(artist.slice(i + 2));
  const name = hasYear ? artist.slice(0, i) : artist;
  return { artistName: name === UNKNOWN_ARTIST ? "" : name, year: hasYear ? artist.slice(i + 2) : "" };
}
