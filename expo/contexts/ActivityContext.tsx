import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Activity } from "@/types";
import { supabaseClient } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

const mapActivityFromDb = (activity: any): Activity => ({
  id: activity.id,
  userId: activity.user_id,
  type: activity.type,
  title: activity.title,
  description: activity.description,
  payload: activity.payload ?? {},
  read: activity.read ?? false,
  createdAt: new Date(activity.created_at),
});

export const [ActivityProvider, useActivity] = createContextHook(() => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      if (!user) {
        setActivities([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabaseClient
          .from("activities")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[ActivityContext] Failed to load activities:", error);
          setActivities([]);
          return;
        }

        setActivities((data || []).map(mapActivityFromDb));
      } catch (error) {
        console.error("[ActivityContext] Unexpected error:", error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [user]);

  const unreadCount = activities.filter(a => !a.read).length;

  const markAsRead = useCallback(async (id: string) => {
    setActivities(prev =>
      prev.map(activity =>
        activity.id === id ? { ...activity, read: true } : activity
      )
    );

    try {
      await supabaseClient
        .from("activities")
        .update({ read: true })
        .eq("id", id);
    } catch (error) {
      console.error("[ActivityContext] Failed to mark activity as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setActivities(prev =>
      prev.map(activity => ({ ...activity, read: true }))
    );

    if (!user) return;

    try {
      await supabaseClient
        .from("activities")
        .update({ read: true })
        .eq("user_id", user.id);
    } catch (error) {
      console.error("[ActivityContext] Failed to mark all as read:", error);
    }
  }, [user]);

  const addActivity = useCallback(async (activity: Omit<Activity, "id" | "createdAt" | "read">) => {
    if (!activity.userId) {
      console.warn("[ActivityContext] Cannot add activity without userId");
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .from("activities")
        .insert({
          user_id: activity.userId,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          payload: activity.payload ?? {},
        })
        .select("*")
        .single();

      if (error) {
        console.error("[ActivityContext] Failed to create activity:", error);
        return;
      }

      setActivities(prev => [mapActivityFromDb(data), ...prev]);
    } catch (error) {
      console.error("[ActivityContext] Unexpected error creating activity:", error);
    }
  }, []);

  return useMemo(() => ({
    activities,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    addActivity,
  }), [activities, unreadCount, isLoading, markAsRead, markAllAsRead, addActivity]);
});
