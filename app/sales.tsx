import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useMemo, useState } from "react";
import { Package, DollarSign, TrendingUp, Eye } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/contexts/ListingsContext";

export default function SalesScreen() {
  const { user } = useAuth();
  const { allListings } = useListings();
  const [selectedTab, setSelectedTab] = useState<"active" | "sold">("active");

  const userListings = useMemo(
    () => allListings.filter((listing) => listing.sellerId === user?.id),
    [allListings, user?.id]
  );
  const activeListings = useMemo(
    () => userListings.filter((listing) => listing.isActive && !listing.isSold),
    [userListings]
  );
  const soldListings = useMemo(
    () => userListings.filter((listing) => listing.isSold),
    [userListings]
  );

  const displayListings = selectedTab === "active" ? activeListings : soldListings;

  const totalViews = useMemo(
    () => userListings.reduce((sum, listing) => sum + listing.viewCount, 0),
    [userListings]
  );
  const totalSales = soldListings.length;
  const totalEarnings = useMemo(
    () => soldListings.reduce((sum, listing) => sum + (listing.priceCents || 0), 0),
    [soldListings]
  );

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Package size={48} color={Colors.textSecondary} />
        <Text style={styles.emptyTitle}>Sign in to view sales</Text>
        <Text style={styles.emptyDescription}>
          Manage your listings and sales history once you are logged in.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.accent + "20" }]}>
              <Eye size={20} color={Colors.accent} />
            </View>
            <Text style={styles.statValue}>{totalViews}</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primary + "20" }]}>
              <TrendingUp size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{totalSales}</Text>
            <Text style={styles.statLabel}>Sales</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.secondary + "20" }]}>
              <DollarSign size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.statValue}>${(totalEarnings / 100).toFixed(0)}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "active" && styles.tabActive]}
            onPress={() => setSelectedTab("active")}
          >
            <Text style={[styles.tabText, selectedTab === "active" && styles.tabTextActive]}>
              Active ({activeListings.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "sold" && styles.tabActive]}
            onPress={() => setSelectedTab("sold")}
          >
            <Text style={[styles.tabText, selectedTab === "sold" && styles.tabTextActive]}>
              Sold ({soldListings.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listingsContainer}>
          {displayListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Package size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>
                {selectedTab === "active" ? "No active listings" : "No sales yet"}
              </Text>
              <Text style={styles.emptyDescription}>
                {selectedTab === "active" 
                  ? "Create a listing to start selling" 
                  : "When you sell an item, it will appear here"}
              </Text>
            </View>
          ) : (
            displayListings.map((listing) => (
              <View key={listing.id} style={styles.listingCard}>
                <Image source={{ uri: listing.images[0] }} style={styles.listingImage} />
                
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle} numberOfLines={2}>
                    {listing.title}
                  </Text>
                  <Text style={styles.listingPrice}>
                    {listing.priceCents 
                      ? `$${(listing.priceCents / 100).toFixed(2)}`
                      : "Swap Only"}
                  </Text>
                  
                  <View style={styles.listingStats}>
                    <View style={styles.statItem}>
                      <Eye size={14} color={Colors.textSecondary} />
                      <Text style={styles.statText}>{listing.viewCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Package size={14} color={Colors.textSecondary} />
                      <Text style={styles.statText}>{listing.chatCount} chats</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: Colors.card,
  },
  tabActive: {
    backgroundColor: Colors.accent,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.background,
  },
  listingsContainer: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  listingCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  listingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.accent,
    marginBottom: 8,
  },
  listingStats: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
