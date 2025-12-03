import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "feed_preferences";

export interface FeedPreferences {
  categories: string[];
  priceRange: {
    min?: number;
    max?: number;
  };
  showSwapOnly: boolean;
  sortBy: "recent" | "price-low" | "price-high" | "distance";
}

const DEFAULT_PREFERENCES: FeedPreferences = {
  categories: [],
  priceRange: {},
  showSwapOnly: false,
  sortBy: "recent",
};

export const [FeedPreferencesProvider, useFeedPreferences] = createContextHook(() => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<FeedPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_${user?.id}`);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load feed preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = useCallback(async (updates: Partial<FeedPreferences>) => {
    if (!user) return;

    try {
      const updated = { ...preferences, ...updates };
      setPreferences(updated);
      await AsyncStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  }, [preferences, user]);

  const resetPreferences = useCallback(async () => {
    if (!user) return;

    try {
      setPreferences(DEFAULT_PREFERENCES);
      await AsyncStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
    } catch (error) {
      console.error("Failed to reset preferences:", error);
    }
  }, [user]);

  return {
    preferences,
    isLoading,
    updatePreferences,
    resetPreferences,
  };
});
