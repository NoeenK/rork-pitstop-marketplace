import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { Stack } from "expo-router";
import { Heart } from "lucide-react-native";
import { useState } from "react";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useListings } from "@/contexts/ListingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import ListingCard from "@/components/ListingCard";
import EmptyState from "@/components/EmptyState";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SavedListingsScreen() {
  const { user } = useAuth();
  const { getUserSavedListingIds } = useSavedListings();
  const { allListings } = useListings();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const savedListingIds = getUserSavedListingIds();
  const savedListings = allListings.filter((listing) => 
    savedListingIds.includes(listing.id)
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <Text style={[styles.errorText, { color: colors.text }]}>Please sign in to view saved listings</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {savedListings.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No saved listings"
            description="Items you save will appear here"
          />
        ) : (
          <View style={styles.grid}>
            {savedListings.map((listing) => (
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
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 100,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
