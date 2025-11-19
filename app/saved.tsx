import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Heart, SlidersHorizontal, MapPin } from "lucide-react-native";
import { useState } from "react";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useListings } from "@/contexts/ListingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "@/contexts/LocationContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ListingCard from "@/components/ListingCard";
import EmptyState from "@/components/EmptyState";

export default function SavedListingsScreen() {
  const { user } = useAuth();
  const { getUserSavedListingIds } = useSavedListings();
  const { allListings } = useListings();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { colors } = useTheme();
  const { requestPermission } = useLocation();
  const router = useRouter();
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

  const handleLocationPress = () => {
    requestPermission();
  };

  const dynamicStyles = createDynamicStyles(colors, insets);

  if (!user) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={dynamicStyles.redHeader}>
          <Text style={styles.headerTitle}>Wishlists</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push("/filters")} style={styles.iconButton}>
              <SlidersHorizontal size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLocationPress} style={styles.iconButton}>
              <MapPin size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
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
      <View style={dynamicStyles.redHeader}>
        <Text style={styles.headerTitle}>Wishlists</Text>
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
        style={[styles.scroll, dynamicStyles.scrollView]}
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
          <>
            <View style={styles.header}>
              <Heart size={20} color={colors.accent} fill={colors.accent} />
              <Text style={[styles.headerText, { color: colors.text }]}>
                {savedListings.length} {savedListings.length === 1 ? "item" : "items"} saved
              </Text>
            </View>
            <View style={styles.grid}>
              {savedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const createDynamicStyles = (colors: any, insets: any) => StyleSheet.create({
  redHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: insets.top + 12,
    paddingBottom: 16,
    backgroundColor: '#CC3333',
  },
  scrollView: {
    paddingTop: 0,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
