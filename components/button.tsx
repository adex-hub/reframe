import { cx } from "@/utils/cx";

type Variant = "default" | "primary";
type Shape = "text" | "icon" | "round";

const VARIANTS: Record<Variant, string> = {
  default: "border-line bg-panel",
  primary: "border-accent bg-accent font-semibold text-on-accent",
};
const SHAPES: Record<Shape, string> = {
  text: "px-4",
  icon: "size-11 p-0",
  round: "size-11 rounded-full p-0",
};

/** Classes for anything that should look like a button (also used on the grid-size <select>). */
export function buttonClass({ variant = "default", shape = "text", className }: { variant?: Variant; shape?: Shape; className?: string } = {}) {
  return cx(
    "inline-grid min-h-11 place-items-center rounded-[10px] border disabled:cursor-not-allowed disabled:opacity-45",
    VARIANTS[variant],
    SHAPES[shape],
    className,
  );
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; shape?: Shape };

export function Button({ variant, shape, className, type = "button", ...props }: Props) {
  return <button type={type} className={buttonClass({ variant, shape, className })} {...props} />;
}
