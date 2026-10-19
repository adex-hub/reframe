/**
 * A board is an array of tile ids indexed by position. Tile `n*n - 1` is the gap,
 * and the board is solved when every tile sits at the position matching its id.
 */

export const solvedTiles = (n: number) => Array.from({ length: n * n }, (_, i) => i);
export const isSolved = (t: number[]) => t.every((v, i) => v === i);

/** Random walk from the solved state, so every shuffle is solvable. */
export function shuffled(n: number): number[] {
  const blank = n * n - 1;
  const t = solvedTiles(n);
  let b = blank;
  let last = -1;
  for (let k = 0; k < n * n * 30; k++) {
    const r = Math.floor(b / n), c = b % n;
    const opts: number[] = [];
    if (r > 0) opts.push(b - n);
    if (r < n - 1) opts.push(b + n);
    if (c > 0) opts.push(b - 1);
    if (c < n - 1) opts.push(b + 1);
    const choices = opts.filter((o) => o !== last);
    const o = choices[Math.floor(Math.random() * choices.length)];
    t[b] = t[o];
    t[o] = blank;
    last = b;
    b = o;
  }
  return isSolved(t) ? shuffled(n) : t;
}

/** Slide the tile at position p (and any tiles between it and the gap). */
export function slide(tiles: number[], n: number, p: number): number[] | null {
  const blank = n * n - 1;
  const b = tiles.indexOf(blank);
  if (p === b) return null;
  const pr = Math.floor(p / n), pc = p % n, br = Math.floor(b / n), bc = b % n;
  if (pr !== br && pc !== bc) return null;
  const step = pr === br ? (b > p ? 1 : -1) : b > p ? n : -n;
  const t = tiles.slice();
  for (let k = b; k !== p; k -= step) t[k] = t[k - step];
  t[p] = blank;
  return t;
}
