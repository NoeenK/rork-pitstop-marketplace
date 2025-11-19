import { View, StyleSheet, Text, TouchableOpacity, Animated, TextInput } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useListings } from "@/contexts/ListingsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Search, SlidersHorizontal } from "lucide-react-native";
import ListingCard from "@/components/ListingCard";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useState, useRef, useEffect, memo } from "react";
import type { Listing } from "@/types";

interface AnimatedListingCardProps {
  listing: Listing;
  index: number;
}

const AnimatedListingCard = memo(({ listing, index }: AnimatedListingCardProps) => {
  const delayAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(delayAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [delayAnim, index]);

  return (
    <Animated.View 
      style={[
        styles.gridItem,
        {
          opacity: delayAnim,
          transform: [
            {
              translateY: delayAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <ListingCard listing={listing} />
    </Animated.View>
  );
});

export default function CategoryListingsScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { listings } = useListings();
  const { colors } = useTheme();
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const getCategoryListings = () => {
    let categoryListings: typeof listings = [];
    
    switch (type) {
      case "recommended":
        categoryListings = listings.filter(l => l.likeCount >= 10);
        break;
      case "popular-nearby":
        categoryListings = listings.filter(l => l.viewCount >= 40);
        break;
      case "swap-only":
        categoryListings = listings.filter(l => l.isSwapOnly);
        break;
      case "drivetrain":
        categoryListings = listings.filter(l => l.category === "Drivetrain");
        break;
      case "electronics":
        categoryListings = listings.filter(l => l.category === "Electronics");
        break;
      case "pneumatics":
        categoryListings = listings.filter(l => l.category === "Pneumatics");
        break;
      case "structure":
        categoryListings = listings.filter(l => l.category === "Structure");
        break;
      case "tools":
        categoryListings = listings.filter(l => l.category === "Tools");
        break;
      case "team-merchandise":
        categoryListings = listings.filter(l => l.category === "Team Merchandise");
        break;
      default:
        categoryListings = listings;
    }
    
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      return categoryListings.filter(l => 
        l.title.toLowerCase().includes(search) || 
        l.description.toLowerCase().includes(search)
      );
    }
    
    return categoryListings;
  };

  const getTitle = () => {
    switch (type) {
      case "recommended":
        return "Recommended for You";
      case "popular-nearby":
        return "Popular Nearby";
      case "swap-only":
        return "Swap Only";
      case "drivetrain":
        return "Drivetrain";
      case "electronics":
        return "Electronics";
      case "pneumatics":
        return "Pneumatics";
      case "structure":
        return "Structure";
      case "tools":
        return "Tools";
      case "team-merchandise":
        return "Team Merchandise";
      default:
        return "Listings";
    }
  };

  const categoryListings = getCategoryListings();

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: getTitle(),
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
              <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search in category..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
              onPress={() => router.push("/filters")}
            >
              <SlidersHorizontal size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          opacity={fadeAnim}
        >
          <Animated.View 
            style={[
              styles.gridContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            {categoryListings.map((listing, index) => (
              <AnimatedListingCard 
                key={listing.id} 
                listing={listing} 
                index={index}
              />
            ))}
          </Animated.View>

          {categoryListings.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No listings found
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  gridContainer: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
});
