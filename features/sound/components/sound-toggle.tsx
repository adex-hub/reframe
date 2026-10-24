import { Button } from "@/components/button";
import { SpeakerIcon, SpeakerOffIcon } from "@/components/icons";

export function SoundToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <Button
      variant="ghost"
      shape="icon"
      onClick={onToggle}
      aria-label="Sound"
      aria-pressed={enabled}
      title={enabled ? "Mute sound (M)" : "Turn sound on (M)"}
    >
      {enabled ? <SpeakerIcon /> : <SpeakerOffIcon />}
    </Button>
  );
}
