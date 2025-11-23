import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { CheckCircle, MapPin, Calendar, Star } from "lucide-react-native";
import { Image } from "expo-image";
import { Colors } from "@/constants/colors";
import { useListings } from "@/contexts/ListingsContext";
import { useReviews } from "@/contexts/ReviewsContext";
import ListingCard from "@/components/ListingCard";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase";
import { User } from "@/types";
import { mapProfileToUser } from "@/lib/profile";

export default function UserProfileScreen() {
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const { allListings } = useListings();
  const { getReviewsForUser, getAverageRating } = useReviews();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error("[UserProfile] Failed to load profile:", error);
          setProfile(null);
        } else if (data) {
          setProfile(mapProfileToUser(data));
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("[UserProfile] Unexpected error:", error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id]);
  
  const userListings = allListings.filter(listing => listing.sellerId === id && listing.isActive);
  const reviews = getReviewsForUser(id || "");
  const rating = getAverageRating(id || "");

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 100 }} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: profile.displayName,
          headerStyle: { backgroundColor: Colors.card },
          headerTintColor: Colors.text,
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {profile.avatarUrl ? (
            <Image
              source={{ uri: profile.avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{profile.displayName}</Text>
              {profile.isVerified && (
                <CheckCircle size={24} color={Colors.accent} fill={Colors.accent} />
              )}
            </View>

            <Text style={styles.teamInfo}>
              {profile.teamNumber ? `Team ${profile.teamNumber}` : "Team"} • {profile.schoolName || "Community"}
            </Text>

            <View style={styles.locationRow}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.locationText}>
                {profile.city || "Unknown"}, {profile.country || "N/A"}
              </Text>
            </View>

            <View style={styles.joinedRow}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.joinedText}>
                Joined {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userListings.length}</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.tradesCompleted}</Text>
            <Text style={styles.statLabel}>Trades</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <Star size={18} color={Colors.warning} fill={Colors.warning} />
              <Text style={styles.statValue}>{rating > 0 ? rating.toFixed(1) : "N/A"}</Text>
            </View>
            <Text style={styles.statLabel}>{reviews.length} Reviews</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Response rate:</Text>
            <Text style={styles.infoValue}>{profile.responseRate}%</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Avg response time:</Text>
            <Text style={styles.infoValue}>{profile.avgResponseTime}</Text>
          </View>
        </View>

        {reviews.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => router.push(`/reviews/${id}`)}
            >
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
            {reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.starRow}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        color={i < review.rating ? Colors.warning : Colors.border}
                        fill={i < review.rating ? Colors.warning : "transparent"}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}

        {userListings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Listings ({userListings.length})</Text>
            {userListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.text,
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.background,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  teamInfo: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  joinedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  joinedText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  stats: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  seeAll: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  starRow: {
    flexDirection: "row",
    gap: 4,
  },
  reviewDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
});
