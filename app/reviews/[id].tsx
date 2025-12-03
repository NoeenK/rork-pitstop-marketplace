import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Star } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useReviews } from "@/contexts/ReviewsContext";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase";
import { mapProfileToUser } from "@/lib/profile";
import { User } from "@/types";

export default function ReviewsListScreen() {
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { getReviewsForUser, getAverageRating } = useReviews();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) {
        setUser(null);
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
          console.error("[ReviewsList] Failed to load user:", error);
          setUser(null);
        } else if (data) {
          setUser(mapProfileToUser(data));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("[ReviewsList] Unexpected error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [id]);
  
  const reviews = getReviewsForUser(id || "");
  const rating = getAverageRating(id || "");

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 100 }} />
      </View>
    );
  }

  if (!user) {
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
          title: `Reviews for ${user.displayName}`,
          headerStyle: { backgroundColor: Colors.card },
          headerTintColor: Colors.text,
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingValue}>{rating > 0 ? rating.toFixed(1) : "N/A"}</Text>
            <View style={styles.starRow}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  color={i < Math.round(rating) ? Colors.warning : Colors.border}
                  fill={i < Math.round(rating) ? Colors.warning : "transparent"}
                />
              ))}
            </View>
            <Text style={styles.reviewCount}>{reviews.length} reviews</Text>
          </View>
        </View>

        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>No reviews yet</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.starRowSmall}>
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
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewerName}>
                by {review.reviewer?.displayName || "Anonymous"}
              </Text>
            </View>
          ))
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
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
  },
  ratingContainer: {
    alignItems: "center",
    gap: 8,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: "900" as const,
    color: Colors.accent,
  },
  starRow: {
    flexDirection: "row",
    gap: 6,
  },
  reviewCount: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
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
    marginBottom: 12,
  },
  starRowSmall: {
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
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: "italic" as const,
  },
});
