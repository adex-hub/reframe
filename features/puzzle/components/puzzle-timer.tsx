import { Clock01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { formatTime } from "@/utils/format-time";

export function PuzzleTimer({ secs }: { secs: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-[20px] border border-line bg-panel px-3 py-1.5 font-semibold tabular-nums" role="timer" aria-label="Time">
      <Icon icon={Clock01Icon} />
      <span>{formatTime(secs)}</span>
    </div>
  );
}
