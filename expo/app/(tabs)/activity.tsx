import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { Heart } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useListings } from "@/contexts/ListingsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";
import ListingCard from "@/components/ListingCard";

export default function ActivityScreen() {
  const { colors } = useTheme();
  const { getUserSavedListingIds } = useSavedListings();
  const { allListings } = useListings();
  const insets = useSafeAreaInsets();

  const savedListingIds = getUserSavedListingIds();
  const savedListings = allListings.filter(listing => savedListingIds.includes(listing.id));

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
      >
        {savedListings.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No saved listings"
            description="Start browsing and save your favorite parts"
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
    fontWeight: "700" as const,
    color: "#000000",
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
