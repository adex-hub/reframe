import { cx } from "@/utils/cx";

type Props = { className?: string };

const Icon = ({ className, children }: Props & { children: React.ReactNode }) => (
  <svg
    className={cx("size-5 shrink-0", className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const ClockIcon = (p: Props) => <Icon {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></Icon>;
export const SunIcon = (p: Props) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </Icon>
);
export const MoonIcon = (p: Props) => <Icon {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></Icon>;
export const UndoIcon = (p: Props) => <Icon {...p}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></Icon>;
export const ShuffleIcon = (p: Props) => <Icon {...p}><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></Icon>;
export const UploadIcon = (p: Props) => <Icon {...p}><path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></Icon>;
export const InfoIcon = (p: Props) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Icon>;
export const MoreIcon = (p: Props) => <Icon {...p}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></Icon>;
export const PencilIcon = (p: Props) => <Icon {...p}><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" /></Icon>;
export const TrashIcon = (p: Props) => <Icon {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Icon>;
export const CropSmallIcon = (p: Props) => <Icon {...p}><rect x="8" y="8" width="8" height="8" rx="1" /></Icon>;
export const CropLargeIcon = (p: Props) => <Icon {...p}><rect x="4" y="4" width="16" height="16" rx="2" /></Icon>;
