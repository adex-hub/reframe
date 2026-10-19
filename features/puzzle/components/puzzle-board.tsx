import { cx } from "@/utils/cx";

type Props = {
  size: number;
  tiles: number[];
  image: string;
  done: boolean;
  onTap: (position: number) => void;
};

export function PuzzleBoard({ size: n, tiles, image, done, onTap }: Props) {
  const blankPos = tiles.indexOf(n * n - 1);
  const br = Math.floor(blankPos / n), bc = blankPos % n;

  return (
    <div className="rounded-[4px] border border-line bg-panel p-2.5 shadow-[0_6px_18px_rgba(0,0,0,.12)]">
      <div
        className="group relative aspect-square w-full touch-manipulation bg-canvas"
        data-won={done || undefined}
        role="group"
        aria-label="Puzzle board"
        style={{ "--img": `url("${image}")` } as React.CSSProperties}
      >
        {Array.from({ length: n * n }, (_, id) => {
          const p = tiles.indexOf(id);
          const r = Math.floor(p / n), c = p % n;
          const sr = Math.floor(id / n), sc = id % n;
          const isBlank = id === n * n - 1;
          const can = !done && !isBlank && (r === br || c === bc);
          return (
            <button
              key={id}
              className={cx(
                "absolute border-0 bg-panel bg-no-repeat p-0 shadow-[inset_0_0_0_2px_var(--bg)] group-data-won:shadow-[inset_0_0_0_0_var(--bg)]",
                "transition-[left,top,box-shadow] duration-[.14s,.14s,.6s] ease-[ease] motion-reduce:transition-none",
                isBlank && "invisible group-data-won:visible",
              )}
              onClick={() => onTap(p)}
              aria-label={`Tile ${id + 1}, row ${r + 1}, column ${c + 1}${can ? "" : ", stuck"}`}
              aria-disabled={!can}
              style={{
                width: `${100 / n}%`,
                height: `${100 / n}%`,
                left: `${(c * 100) / n}%`,
                top: `${(r * 100) / n}%`,
                backgroundImage: "var(--img)",
                backgroundSize: `${n * 100}% ${n * 100}%`,
                backgroundPosition: `${(sc * 100) / (n - 1)}% ${(sr * 100) / (n - 1)}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
