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

export default function SavedListingsScreen() {
  const { user } = useAuth();
  const { getUserSavedListingIds } = useSavedListings();
  const { allListings } = useListings();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { colors } = useTheme();

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
