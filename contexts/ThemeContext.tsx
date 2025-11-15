import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

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

const THEME_KEY = "@pitstop_theme";

const darkColors: ThemeColors = {
  background: "#0F0F0F",
  card: "#212121",
  accent: "#FFFFFF",
  secondary: "#AAAAAA",
  primary: "#FFFFFF",
  primaryGradientStart: "#0F0F0F",
  primaryGradientEnd: "#0F0F0F",
  text: "#FFFFFF",
  textSecondary: "#AAAAAA",
  border: "#303030",
  success: "#34C759",
  error: "#FF453A",
  warning: "#FF9500",
  cardShadow: "rgba(0, 0, 0, 0.3)",
};

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
  const [theme, setThemeState] = useState<Theme>("system");
  const [loading, setLoading] = useState<boolean>(true);
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.log("Error loading theme:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setTheme = useCallback(async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.log("Error saving theme:", error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }, [theme, setTheme]);

  const activeTheme = useMemo(() => {
    if (theme === "system") {
      return systemColorScheme === "dark" ? "dark" : "light";
    }
    return theme;
  }, [theme, systemColorScheme]);

  const colors = useMemo(() => {
    return activeTheme === "dark" ? darkColors : lightColors;
  }, [activeTheme]);

  return useMemo(() => ({
    theme,
    activeTheme,
    colors,
    setTheme,
    toggleTheme,
    loading,
    isDark: activeTheme === "dark",
  }), [theme, activeTheme, colors, setTheme, toggleTheme, loading]);
});
