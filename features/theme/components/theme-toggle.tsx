"use client";

import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { useTheme } from "../hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button shape="round" onClick={toggle} aria-label="Switch light or dark mode" title="Switch light or dark mode">
      <Icon icon={theme === "dark" ? Sun03Icon : Moon02Icon} />
    </Button>
  );
}
