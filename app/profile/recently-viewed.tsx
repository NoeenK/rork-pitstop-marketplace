import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { Clock } from "lucide-react-native";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useListings } from "@/contexts/ListingsContext";
import ListingCard from "@/components/ListingCard";
import { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import ScreenWrapper from "@/components/ScreenWrapper";

export default function RecentlyViewedScreen() {
  const { recentlyViewed } = useRecentlyViewed();
  const { allListings } = useListings();
  const { colors } = useTheme();

  const recentListings = useMemo(() => {
    return recentlyViewed
      .map(id => allListings.find(l => l.id === id))
      .filter(Boolean);
  }, [recentlyViewed, allListings]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "Recently viewed",
          headerShown: false,
        }}
      />

      {recentListings.length === 0 ? (
        <View style={styles.emptyState}>
          <Clock size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No recently viewed items</Text>
          <Text style={styles.emptyText}>Items you view will appear here</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {recentListings.map((listing) => listing && (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
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
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
});
