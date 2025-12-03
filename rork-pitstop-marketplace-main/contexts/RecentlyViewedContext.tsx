import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Listing } from "@/types";

const STORAGE_KEY = "recently_viewed_listings";
const MAX_ITEMS = 50;

export const [RecentlyViewedProvider, useRecentlyViewed] = createContextHook(() => {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recently viewed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToRecentlyViewed = useCallback(async (listingId: string) => {
    try {
      setRecentlyViewed((prev) => {
        const filtered = prev.filter((id) => id !== listingId);
        const updated = [listingId, ...filtered].slice(0, MAX_ITEMS);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Failed to add to recently viewed:", error);
    }
  }, []);

  const clearRecentlyViewed = useCallback(async () => {
    try {
      setRecentlyViewed([]);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear recently viewed:", error);
    }
  }, []);

  return {
    recentlyViewed,
    isLoading,
    addToRecentlyViewed,
    clearRecentlyViewed,
  };
});
