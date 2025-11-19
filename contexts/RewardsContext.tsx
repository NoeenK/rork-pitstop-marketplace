import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "user_rewards";

export interface Reward {
  id: string;
  type: "points" | "badge" | "discount" | "achievement";
  title: string;
  description: string;
  value?: number;
  earnedAt: Date;
  expiresAt?: Date;
  isRedeemed: boolean;
}

export const [RewardsProvider, useRewards] = createContextHook(() => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRewards();
    }
  }, [user]);

  const loadRewards = async () => {
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_${user?.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        setRewards(data.rewards.map((r: any) => ({
          ...r,
          earnedAt: new Date(r.earnedAt),
          expiresAt: r.expiresAt ? new Date(r.expiresAt) : undefined,
        })));
        setTotalPoints(data.totalPoints || 0);
      }
    } catch (error) {
      console.error("Failed to load rewards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addReward = useCallback(async (reward: Omit<Reward, "id" | "earnedAt" | "isRedeemed">) => {
    if (!user) return;

    try {
      const newReward: Reward = {
        ...reward,
        id: Date.now().toString(),
        earnedAt: new Date(),
        isRedeemed: false,
      };

      const updatedRewards = [newReward, ...rewards];
      const updatedPoints = totalPoints + (reward.value || 0);

      setRewards(updatedRewards);
      setTotalPoints(updatedPoints);

      await AsyncStorage.setItem(
        `${STORAGE_KEY}_${user.id}`,
        JSON.stringify({ rewards: updatedRewards, totalPoints: updatedPoints })
      );
    } catch (error) {
      console.error("Failed to add reward:", error);
    }
  }, [rewards, totalPoints, user]);

  const redeemReward = useCallback(async (rewardId: string) => {
    if (!user) return;

    try {
      const updatedRewards = rewards.map((reward) =>
        reward.id === rewardId ? { ...reward, isRedeemed: true } : reward
      );

      setRewards(updatedRewards);
      await AsyncStorage.setItem(
        `${STORAGE_KEY}_${user.id}`,
        JSON.stringify({ rewards: updatedRewards, totalPoints })
      );
    } catch (error) {
      console.error("Failed to redeem reward:", error);
    }
  }, [rewards, totalPoints, user]);

  return {
    rewards,
    totalPoints,
    isLoading,
    addReward,
    redeemReward,
  };
});
