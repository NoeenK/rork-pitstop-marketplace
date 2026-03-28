import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Platform } from "react-native";
import { Heart, Star } from "lucide-react-native";
import { Listing } from "@/types";
import { useRouter } from "expo-router";
import { useRef, useCallback, useEffect } from "react";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useReviews } from "@/contexts/ReviewsContext";
import * as Haptics from "expo-haptics";

interface ListingCardProps {
  listing: Listing;
  testID?: string;
}

export default function ListingCard({ listing, testID }: ListingCardProps) {
  const router = useRouter();
  const { isSaved, toggleSaved } = useSavedListings();
  const { colors } = useTheme();
  const { getAverageRating } = useReviews();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(1)).current;
  
  const saved = isSaved(listing.id);
  
  useEffect(() => {
    if (saved) {
      Animated.sequence([
        Animated.timing(heartOpacity, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [saved, heartOpacity]);
  const sellerRating = listing.seller ? getAverageRating(listing.seller.id) : 0;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePress = () => {
    router.push(`/listing/${listing.id}`);
  };

  const handleToggleSaved = useCallback((e: any) => {
    e.stopPropagation();
    console.log("[ListingCard] Heart clicked for listing:", listing.id, "Current saved state:", saved);
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Animated.parallel([
      Animated.spring(heartScale, {
        toValue: 1.4,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.spring(heartScale, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    });
    
    toggleSaved(listing.id);
  }, [listing.id, toggleSaved, heartScale, heartOpacity, saved]);

  const formatPrice = (cents: number | null) => {
    if (cents === null) return "Swap";
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        testID={testID}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: listing.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.heartButton}
            onPress={handleToggleSaved}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }], opacity: heartOpacity }}>
              <Heart
                size={20}
                color={saved ? "#FF3B30" : "#FFFFFF"}
                fill={saved ? "#FF3B30" : "transparent"}
                strokeWidth={2.5}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {listing.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.text }]} numberOfLines={1}>
              {formatPrice(listing.priceCents)}
            </Text>
          </View>
          {listing.seller && (
            <View style={styles.sellerInfo}>
              <Text style={[styles.sellerText, { color: colors.textSecondary }]} numberOfLines={1}>
                Team {listing.seller.teamNumber}
              </Text>
              {sellerRating > 0 && (
                <View style={styles.ratingContainer}>
                  <Star size={10} color="#FFB800" fill="#FFB800" />
                  <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                    {sellerRating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: "48%",
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#E5E5E5",
  },
  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingTop: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  price: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  sellerText: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
});
