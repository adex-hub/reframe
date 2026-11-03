import { formatDuration } from "@/utils/format-time";

/** Overall best for one grid size, across every picture: fastest time and fewest moves, possibly from different solves. */
export type Best = { secs: number; moves: number };

/** The best after this solve: each record only ever improves. */
export function merge(best: Best | null, secs: number, moves: number): Best {
  return best ? { secs: Math.min(best.secs, secs), moves: Math.min(best.moves, moves) } : { secs, moves };
}

/**
 * The quiet line under the win message, comparing this solve with the best before it.
 * Nothing on a first solve (nothing to compare yet); hinted solves only show the record.
 */
export function describe(best: Best | null, secs: number, moves: number, hinted: boolean, size: number) {
  if (!best) return null;
  const grid = `${size}×${size}`;
  const record = `${formatDuration(best.secs)} and ${best.moves} ${best.moves === 1 ? "move" : "moves"}`;
  if (hinted) return `Your best ${grid} without hints: ${record}.`;
  const fastest = secs < best.secs, fewest = moves < best.moves;
  if (fastest && fewest) return `Your fastest ${grid} yet, in your fewest moves.`;
  if (fastest) return `Your fastest ${grid} yet.`;
  if (fewest) return `Your fewest moves on a ${grid} yet.`;
  return `Your best ${grid}: ${record}.`;
}
