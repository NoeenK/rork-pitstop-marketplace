import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions, Share, Platform } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { CheckCircle, MapPin, Calendar, Package, Heart, Eye, MessageCircle, Share2, Star, ChevronRight } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useListings } from "@/contexts/ListingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useChat } from "@/contexts/ChatContext";
import Button from "@/components/Button";
import { useEffect, useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

export default function ListingDetailScreen() {
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const { getListingById, incrementViewCount } = useListings();
  const { user } = useAuth();
  const { isSaved, toggleSaved } = useSavedListings();
  const { getReviewsForUser, getAverageRating } = useReviews();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { createThread } = useChat();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isCreatingThread, setIsCreatingThread] = useState<boolean>(false);
  const scrollViewRef = useRef<any>(null);
  
  const listing = getListingById(id || "");

  useEffect(() => {
    if (id) {
      incrementViewCount(id);
      addToRecentlyViewed(id);
    }
  }, [id, incrementViewCount, addToRecentlyViewed]);

  const sellerRating = listing?.seller ? getAverageRating(listing.seller.id) : 0;
  const sellerReviews = listing?.seller ? getReviewsForUser(listing.seller.id) : [];
  const saved = listing ? isSaved(listing.id) : false;

  if (!listing) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Listing not found</Text>
      </View>
    );
  }

  const formatPrice = (cents: number | null) => {
    if (cents === null) return "Swap Only";
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOwnListing = user?.id === listing.sellerId;

  const handleChat = async () => {
    if (!user || !listing || isCreatingThread) return;
    
    try {
      setIsCreatingThread(true);
      console.log("[ListingDetail] Creating thread for listing:", listing.id);
      
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      const thread = await createThread(listing.id, user.id, listing.sellerId);
      console.log("[ListingDetail] Thread created:", thread.id);
      
      router.push(`/chat/${thread.id}`);
    } catch (error) {
      console.error("[ListingDetail] Failed to create thread:", error);
    } finally {
      setIsCreatingThread(false);
    }
  };

  const handleToggleSaved = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (listing?.id) {
      console.log("[ListingDetail] Toggling saved for listing:", listing.id, "Current state:", saved);
      toggleSaved(listing.id);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this listing: ${listing?.title} - ${listing?.priceCents ? (listing.priceCents / 100).toFixed(0) : "Swap"}`,
        title: listing?.title,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSellerPress = () => {
    if (listing?.seller) {
      router.push(`/user/${listing.seller.id}`);
    }
  };

  const handleImageScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentImageIndex(index);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "",
          headerTransparent: true,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleToggleSaved}
              >
                <Heart
                  size={22}
                  color={saved ? Colors.primary : Colors.text}
                  fill={saved ? Colors.primary : "transparent"}
                  strokeWidth={saved ? 0 : 2}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleShare}
              >
                <Share2 size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          >
            {listing.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {listing.images.length > 1 && (
            <View style={styles.pagination}>
              <View style={styles.paginationDots}>
                {listing.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      currentImageIndex === index && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.paginationText}>
                {currentImageIndex + 1} / {listing.images.length}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{listing.title}</Text>
            </View>
            <Text style={styles.price}>{formatPrice(listing.priceCents)}</Text>

            <View style={styles.tags}>
              <View style={[styles.tag, styles.categoryTag]}>
                <Package size={14} color={Colors.text} />
                <Text style={styles.tagText}>{listing.category}</Text>
              </View>
              <View style={[styles.tag, styles.conditionTag]}>
                <Text style={styles.tagText}>{listing.condition}</Text>
              </View>
              {listing.isSwapOnly && (
                <View style={[styles.tag, styles.swapTag]}>
                  <Text style={styles.tagText}>Swap Only</Text>
                </View>
              )}
            </View>

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Eye size={16} color={Colors.textSecondary} />
                <Text style={styles.statText}>{listing.viewCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Heart size={16} color={Colors.textSecondary} />
                <Text style={styles.statText}>{listing.likeCount}</Text>
              </View>
              <View style={styles.statItem}>
                <MessageCircle size={16} color={Colors.textSecondary} />
                <Text style={styles.statText}>{listing.chatCount}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          {listing.seasonTag && (
            <View style={styles.infoRow}>
              <Calendar size={18} color={Colors.textSecondary} />
              <Text style={styles.infoText}>Used in {listing.seasonTag}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <MapPin size={18} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              {listing.city}, {listing.country}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller</Text>
            <TouchableOpacity style={styles.sellerCard} onPress={handleSellerPress}>
              <LinearGradient
                colors={[Colors.card, Colors.background]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sellerGradient}
              >
                <View style={styles.sellerLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {listing.seller?.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.sellerInfo}>
                    <View style={styles.sellerHeader}>
                      <Text style={styles.sellerName}>{listing.seller?.displayName}</Text>
                      {listing.seller?.isVerified && (
                        <CheckCircle size={16} color={Colors.accent} fill={Colors.accent} />
                      )}
                    </View>
                    <Text style={styles.sellerDetail}>
                      Team {listing.seller?.teamNumber} • {listing.seller?.schoolName}
                    </Text>
                    {sellerRating > 0 && (
                      <View style={styles.ratingRow}>
                        <Star size={14} color={Colors.warning} fill={Colors.warning} />
                        <Text style={styles.ratingText}>
                          {sellerRating.toFixed(1)} ({sellerReviews.length} reviews)
                        </Text>
                      </View>
                    )}
                    <Text style={styles.sellerDetail}>
                      {listing.seller?.tradesCompleted} trades • Responds in {listing.seller?.avgResponseTime}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.timestamp}>
            Listed {formatDate(listing.createdAt)} • {listing.viewCount} views
          </Text>
        </View>
      </ScrollView>

      {!isOwnListing && (
        <View style={styles.footer}>
          <Button
            title="Chat with Seller"
            onPress={handleChat}
            style={styles.chatButton}
            testID="chat-button"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  errorText: {
    color: Colors.text,
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
    marginRight: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageScroll: {
    height: 400,
  },
  pagination: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  paginationDots: {
    flexDirection: "row",
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  paginationDotActive: {
    backgroundColor: Colors.accent,
    width: 20,
  },
  paginationText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  image: {
    width,
    height: 400,
    backgroundColor: Colors.border,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  price: {
    fontSize: 32,
    fontWeight: "900" as const,
    color: Colors.accent,
    marginBottom: 16,
  },
  stats: {
    flexDirection: "row",
    gap: 20,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tags: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  categoryTag: {
    backgroundColor: Colors.card,
  },
  conditionTag: {
    backgroundColor: `${Colors.accent}20`,
  },
  swapTag: {
    backgroundColor: `${Colors.secondary}20`,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  sellerCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sellerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  sellerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.background,
  },
  sellerInfo: {
    flex: 1,
    gap: 4,
  },
  sellerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sellerName: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  sellerDetail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  timestamp: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  chatButton: {
    width: "100%",
  },
});
