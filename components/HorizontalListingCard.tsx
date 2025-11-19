import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from "react-native";
import { Heart, MapPin } from "lucide-react-native";
import { Listing } from "@/types";
import { useRouter } from "expo-router";
import { useRef, useCallback, useEffect } from "react";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useTheme } from "@/contexts/ThemeContext";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface HorizontalListingCardProps {
  listing: Listing;
  testID?: string;
}

export default function HorizontalListingCard({ listing, testID }: HorizontalListingCardProps) {
  const router = useRouter();
  const { isSaved, toggleSaved } = useSavedListings();
  const { colors, isDark } = useTheme();
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

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
  }, [listing.id, toggleSaved, heartScale, heartOpacity]);

  const formatPrice = (cents: number | null) => {
    if (cents === null) return "Swap";
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
            shadowColor: colors.cardShadow,
          }
        ]}
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
                size={18}
                color={saved ? "#FF3B30" : "#FFFFFF"}
                fill={saved ? "#FF3B30" : "transparent"}
                strokeWidth={2.5}
              />
            </Animated.View>
          </TouchableOpacity>
          {listing.isSwapOnly && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>For sale</Text>
            </View>
          )}
        </View>
        
        <View style={styles.content}>
          <View style={styles.categoryRow}>
            <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
              {listing.category}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {listing.title}
          </Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color={colors.textSecondary} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
              {listing.city}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.text }]}>
              {formatPrice(listing.priceCents)}
            </Text>
            {listing.priceCents !== null && (
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                /Night
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: 180,
    marginRight: 12,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: "#E5E5E5",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#111111",
  },
  content: {
    padding: 10,
  },
  categoryRow: {
    marginBottom: 3,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  title: {
    fontSize: 13,
    fontWeight: "600" as const,
    marginBottom: 4,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    marginLeft: 2,
  },
});
