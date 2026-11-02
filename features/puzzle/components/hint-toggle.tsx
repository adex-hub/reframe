import { BulbIcon, Idea01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";

export function HintToggle({ on, disabled, onToggle }: { on: boolean; disabled?: boolean; onToggle: () => void }) {
  return (
    <Button
      shape="icon"
      onClick={onToggle}
      disabled={disabled}
      aria-label="Number hints"
      aria-pressed={on}
      title={on ? "Hide number hints (H)" : "Show number hints (H)"}
    >
      <Icon icon={on ? Idea01Icon : BulbIcon} />
    </Button>
  );
}
