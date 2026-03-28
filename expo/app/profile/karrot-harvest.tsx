import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { BookOpen, Trophy, Star, Zap, Award, TrendingUp } from "lucide-react-native";
import { useRewards } from "@/contexts/RewardsContext";
import { useAuth } from "@/contexts/AuthContext";

const ACHIEVEMENTS = [
  {
    id: "first_trade",
    title: "First Trade",
    description: "Complete your first successful trade",
    icon: Zap,
    points: 50,
    color: "#FFD700",
  },
  {
    id: "verified",
    title: "Verified Member",
    description: "Verify your identity",
    icon: Award,
    points: 100,
    color: "#3B82F6",
  },
  {
    id: "trusted_seller",
    title: "Trusted Seller",
    description: "Receive 10 positive reviews",
    icon: Trophy,
    points: 200,
    color: "#FF6B35",
  },
  {
    id: "active_trader",
    title: "Active Trader",
    description: "Complete 25 trades",
    icon: TrendingUp,
    points: 300,
    color: "#34C759",
  },
];

export default function PitstopRewardsScreen() {
  const { totalPoints, addReward } = useRewards();
  const { user } = useAuth();

  const handleClaimReward = (achievement: typeof ACHIEVEMENTS[0]) => {
    addReward({
      type: "achievement",
      title: achievement.title,
      description: achievement.description,
      value: achievement.points,
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Pitstop Rewards",
          headerStyle: { backgroundColor: "#000000" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <BookOpen size={64} color="#FF6B35" />
          <Text style={styles.headerTitle}>Pitstop Rewards</Text>
          <Text style={styles.headerText}>
            Earn points and unlock achievements by being an active member
          </Text>
        </View>

        <View style={styles.pointsCard}>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsLabel}>Your Points</Text>
            <Text style={styles.pointsValue}>{totalPoints}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min((totalPoints / 500) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{500 - totalPoints} points to next tier</Text>
        </View>

        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((achievement) => {
            const IconComponent = achievement.icon;
            
            return (
              <TouchableOpacity
                key={achievement.id}
                style={styles.achievementCard}
                onPress={() => handleClaimReward(achievement)}
              >
                <View style={[styles.achievementIcon, { backgroundColor: achievement.color + "20" }]}>
                  <IconComponent size={32} color={achievement.color} />
                </View>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                <View style={styles.achievementFooter}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.achievementPoints}>{achievement.points} points</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How to earn more rewards</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Complete trades successfully</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Get positive reviews from buyers</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Verify your identity</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Invite friends to join</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>List quality items</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  pointsCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  pointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pointsLabel: {
    fontSize: 16,
    color: "#666666",
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#FF6B35",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#2C2C2E",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B35",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  achievementsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  achievementCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  achievementDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
    lineHeight: 20,
  },
  achievementFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  achievementPoints: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFD700",
  },
  infoCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoBullet: {
    fontSize: 16,
    color: "#FF6B35",
    marginRight: 12,
    fontWeight: "700" as const,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: "#666666",
    lineHeight: 22,
  },
});
