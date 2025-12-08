import { View, ScrollView, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { Heart } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useListings } from "@/contexts/ListingsContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";
import ListingCard from "@/components/ListingCard";
import ScreenWrapper from "@/components/ScreenWrapper";

export default function ActivityScreen() {
  const { colors } = useTheme();
  const { getUserSavedListingIds } = useSavedListings();
  const { allListings } = useListings();
  const insets = useSafeAreaInsets();

  const savedListingIds = getUserSavedListingIds();
  const savedListings = allListings.filter(listing => savedListingIds.includes(listing.id));

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]} 
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
