import { VolumeHighIcon, VolumeMute02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";

export function SoundToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <Button
      shape="icon"
      onClick={onToggle}
      aria-label="Sound"
      aria-pressed={enabled}
      title={enabled ? "Mute sound (M)" : "Turn sound on (M)"}
    >
      <Icon icon={enabled ? VolumeHighIcon : VolumeMute02Icon} />
    </Button>
  );
}
