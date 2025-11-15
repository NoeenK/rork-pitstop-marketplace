import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo } from "react";
import { Activity } from "@/types";

export const [ActivityProvider, useActivity] = createContextHook(() => {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      userId: "user1",
      type: "offer_received",
      title: "New offer received",
      description: "Team 8717 made an offer on your Swerve Module MK4i",
      payload: { offerId: "offer1", listingId: "1" },
      read: false,
      createdAt: new Date("2024-11-01T15:30:00"),
    },
    {
      id: "2",
      userId: "user1",
      type: "message_received",
      title: "New message",
      description: "Team 8717 sent you a message",
      payload: { threadId: "thread1" },
      read: false,
      createdAt: new Date("2024-11-01T16:30:00"),
    },
  ]);

  const unreadCount = activities.filter(a => !a.read).length;

  const markAsRead = useCallback((id: string) => {
    setActivities(prev =>
      prev.map(activity =>
        activity.id === id ? { ...activity, read: true } : activity
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setActivities(prev =>
      prev.map(activity => ({ ...activity, read: true }))
    );
  }, []);

  const addActivity = useCallback((activity: Omit<Activity, "id" | "createdAt" | "read">) => {
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
      read: false,
      createdAt: new Date(),
    };
    setActivities(prev => [newActivity, ...prev]);
  }, []);

  return useMemo(() => ({
    activities,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addActivity,
  }), [activities, unreadCount, markAsRead, markAllAsRead, addActivity]);
});
