import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Heart, SlidersHorizontal, MapPin } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useListings } from "@/contexts/ListingsContext";
import { useLocation } from "@/contexts/LocationContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";
import ListingCard from "@/components/ListingCard";
import ScreenWrapper from "@/components/ScreenWrapper";

export default function ActivityScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { getUserSavedListingIds } = useSavedListings();
  const { allListings } = useListings();
  const { requestPermission } = useLocation();
  const insets = useSafeAreaInsets();

  const savedListingIds = getUserSavedListingIds();
  const savedListings = allListings.filter(listing => savedListingIds.includes(listing.id));

  const handleLocationPress = () => {
    requestPermission();
  };

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={[styles.redHeader, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push("/filters")} style={styles.iconButton}>
            <SlidersHorizontal size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLocationPress} style={styles.iconButton}>
            <MapPin size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]} 
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  redHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#CC3333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
