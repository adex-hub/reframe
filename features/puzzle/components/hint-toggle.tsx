import { Button } from "@/components/button";
import { BulbIcon, BulbOffIcon } from "@/components/icons";

export function HintToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Button
      shape="icon"
      onClick={onToggle}
      aria-label="Number hints"
      aria-pressed={on}
      title={on ? "Hide number hints (H)" : "Show number hints (H)"}
    >
      {on ? <BulbIcon /> : <BulbOffIcon />}
    </Button>
  );
}
