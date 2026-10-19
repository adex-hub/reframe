/** The Reframe mark: a big square with its corner cut away around a smaller, overlapping square. */
export const MARK =
  '<mask id="rf-cut"><rect width="32" height="32" fill="#fff"/><rect x="10.5" y="0.5" width="21" height="21" rx="3.5" fill="#000"/></mask>' +
  '<rect x="3" y="10" width="19" height="19" rx="2" mask="url(#rf-cut)"/><rect x="13" y="3" width="16" height="16" rx="2"/>';

/** Ink colour per theme, matching --ink in globals.css. */
export const INK = { light: "#1a2132", dark: "#e8ebf2" } as const;
