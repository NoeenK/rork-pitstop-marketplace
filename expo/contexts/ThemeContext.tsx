import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useMemo, useCallback } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeColors {
  background: string;
  card: string;
  accent: string;
  secondary: string;
  primary: string;
  primaryGradientStart: string;
  primaryGradientEnd: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  cardShadow: string;
}

const lightColors: ThemeColors = {
  background: "#F5F5F5",
  card: "#FFFFFF",
  accent: "#111111",
  secondary: "#888888",
  primary: "#111111",
  primaryGradientStart: "#F5F5F5",
  primaryGradientEnd: "#E8E8E8",
  text: "#111111",
  textSecondary: "#888888",
  border: "#E5E5E5",
  success: "#34C759",
  error: "#FF0000",
  warning: "#FF9500",
  cardShadow: "rgba(0, 0, 0, 0.08)",
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [theme] = useState<Theme>("light");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const setTheme = useCallback(async () => {
  }, []);

  const toggleTheme = useCallback(() => {
  }, []);

  const activeTheme = "light" as const;

  const colors = useMemo(() => {
    return lightColors;
  }, []);

  return useMemo(() => ({
    theme,
    activeTheme,
    colors,
    setTheme,
    toggleTheme,
    loading,
    isDark: false,
  }), [theme, colors, setTheme, toggleTheme, loading]);
});
