import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { Gift, Trophy, Star, TrendingUp } from "lucide-react-native";
import { useRewards } from "@/contexts/RewardsContext";

export default function MyRewardsScreen() {
  const { rewards, totalPoints, redeemReward } = useRewards();

  const unredeemed = rewards.filter(r => !r.isRedeemed);
  const redeemed = rewards.filter(r => r.isRedeemed);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "My rewards",
          headerStyle: { backgroundColor: "#000000" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />

      <View style={styles.pointsCard}>
        <View style={styles.pointsContent}>
          <Trophy size={40} color="#FF6B35" />
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsLabel}>Total Points</Text>
            <Text style={styles.pointsValue}>{totalPoints}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {unredeemed.length === 0 && redeemed.length === 0 ? (
          <View style={styles.emptyState}>
            <Gift size={64} color="#FF6B35" />
            <Text style={styles.emptyTitle}>No rewards yet</Text>
            <Text style={styles.emptyText}>Earn rewards by being an active member</Text>
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>How to earn rewards:</Text>
              <View style={styles.tipRow}>
                <Star size={16} color="#FFD700" />
                <Text style={styles.tipText}>Complete trades</Text>
              </View>
              <View style={styles.tipRow}>
                <Star size={16} color="#FFD700" />
                <Text style={styles.tipText}>Get positive reviews</Text>
              </View>
              <View style={styles.tipRow}>
                <Star size={16} color="#FFD700" />
                <Text style={styles.tipText}>Verify your identity</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            {unredeemed.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Available Rewards</Text>
                {unredeemed.map((reward) => (
                  <View key={reward.id} style={styles.rewardCard}>
                    <View style={styles.rewardIcon}>
                      {reward.type === "points" && <TrendingUp size={28} color="#FF6B35" />}
                      {reward.type === "badge" && <Trophy size={28} color="#FFD700" />}
                      {reward.type === "discount" && <Gift size={28} color="#34C759" />}
                      {reward.type === "achievement" && <Star size={28} color="#3B82F6" />}
                    </View>
                    <View style={styles.rewardInfo}>
                      <Text style={styles.rewardTitle}>{reward.title}</Text>
                      <Text style={styles.rewardDescription}>{reward.description}</Text>
                      {reward.value && <Text style={styles.rewardValue}>+{reward.value} points</Text>}
                    </View>
                    {reward.type === "discount" && !reward.isRedeemed && (
                      <TouchableOpacity 
                        style={styles.redeemButton}
                        onPress={() => redeemReward(reward.id)}
                      >
                        <Text style={styles.redeemButtonText}>Redeem</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </>
            )}

            {redeemed.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Redeemed</Text>
                {redeemed.map((reward) => (
                  <View key={reward.id} style={[styles.rewardCard, styles.redeemedCard]}>
                    <View style={styles.rewardIcon}>
                      <Gift size={28} color="#666666" />
                    </View>
                    <View style={styles.rewardInfo}>
                      <Text style={[styles.rewardTitle, styles.redeemedText]}>{reward.title}</Text>
                      <Text style={[styles.rewardDescription, styles.redeemedText]}>
                        Redeemed on {reward.earnedAt.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  pointsCard: {
    backgroundColor: "#1C1C1E",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
  },
  pointsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
  },
  tipsContainer: {
    width: "100%",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 12,
    marginTop: 8,
  },
  rewardCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  redeemedCard: {
    opacity: 0.6,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FF6B35",
  },
  redeemedText: {
    color: "#666666",
  },
  redeemButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
