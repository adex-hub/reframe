"use client";

import { Button } from "@/components/button";
import { MoonIcon, SunIcon } from "@/components/icons";
import { useTheme } from "../hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button shape="round" onClick={toggle} aria-label="Switch light or dark mode" title="Switch light or dark mode">
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
