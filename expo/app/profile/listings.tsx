import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/contexts/ListingsContext";
import { useMemo } from "react";
import { Package } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import ScreenWrapper from "@/components/ScreenWrapper";

export default function ListingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { allListings } = useListings();
  const { colors } = useTheme();

  const userListings = useMemo(() => {
    if (!user) return [];
    return allListings.filter(listing => listing.sellerId === user.id);
  }, [allListings, user]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "My Listings",
          headerShown: false,
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {userListings.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptyText}>Start selling by creating your first listing</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/listing/new')}
            >
              <Text style={styles.createButtonText}>Create Listing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          userListings.map((listing) => (
            <TouchableOpacity
              key={listing.id}
              style={styles.listingCard}
              onPress={() => router.push(`/listing/${listing.id}`)}
            >
              <Text style={styles.listingTitle} numberOfLines={1}>
                {listing.title}
              </Text>
              <Text style={styles.listingPrice}>
                {listing.priceCents ? `$${(listing.priceCents / 100).toFixed(0)}` : "Swap"}
              </Text>
              <Text style={styles.listingStatus}>
                {listing.isActive ? "Active" : "Inactive"}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  listingCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 8,
  },
  listingPrice: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.accent,
    marginBottom: 4,
  },
  listingStatus: {
    fontSize: 14,
    color: colors.success,
  },
});
