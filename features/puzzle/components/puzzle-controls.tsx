import { Button, buttonClass } from "@/components/button";
import { ShuffleIcon, UndoIcon } from "@/components/icons";
import { GRID_SIZES } from "../constants";

type Props = {
  moves: number;
  size: number;
  onSizeChange: (size: number) => void;
  onUndo: () => void;
  onReshuffle: () => void;
};

export function PuzzleControls({ moves, size, onSizeChange, onUndo, onReshuffle }: Props) {
  return (
    <div className="my-3 flex items-center justify-between">
      <span className="font-semibold text-mute">{moves} {moves === 1 ? "move" : "moves"}</span>
      <div className="flex flex-wrap gap-2">
        <select
          className={buttonClass({ className: "px-2.5 text-ink" })}
          aria-label="Grid size"
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
        >
          {GRID_SIZES.map((s) => (<option key={s} value={s}>{s}×{s}</option>))}
        </select>
        <Button shape="icon" onClick={onUndo} aria-label="Undo" title="Undo">
          <UndoIcon />
        </Button>
        <Button shape="icon" onClick={onReshuffle} aria-label="Reshuffle" title="Reshuffle">
          <ShuffleIcon />
        </Button>
      </div>
    </div>
  );
}
