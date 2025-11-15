import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "search_alerts";

export interface SearchAlert {
  id: string;
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  createdAt: Date;
  isActive: boolean;
}

export const [SearchAlertsProvider, useSearchAlerts] = createContextHook(() => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SearchAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_${user?.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAlerts(parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
        })));
      }
    } catch (error) {
      console.error("Failed to load search alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAlert = useCallback(async (alert: Omit<SearchAlert, "id" | "createdAt" | "isActive">) => {
    if (!user) return;
    
    try {
      const newAlert: SearchAlert = {
        ...alert,
        id: Date.now().toString(),
        createdAt: new Date(),
        isActive: true,
      };

      const updated = [newAlert, ...alerts];
      setAlerts(updated);
      await AsyncStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to add alert:", error);
    }
  }, [alerts, user]);

  const toggleAlert = useCallback(async (alertId: string) => {
    if (!user) return;

    try {
      const updated = alerts.map((alert) =>
        alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
      );
      setAlerts(updated);
      await AsyncStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to toggle alert:", error);
    }
  }, [alerts, user]);

  const deleteAlert = useCallback(async (alertId: string) => {
    if (!user) return;

    try {
      const updated = alerts.filter((alert) => alert.id !== alertId);
      setAlerts(updated);
      await AsyncStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to delete alert:", error);
    }
  }, [alerts, user]);

  return {
    alerts,
    isLoading,
    addAlert,
    toggleAlert,
    deleteAlert,
  };
});
