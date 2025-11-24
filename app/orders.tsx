import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Package, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { supabaseClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Order {
  id: string;
  listingTitle: string;
  listingImage: string;
  sellerName: string;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  priceCents: number;
  orderedAt: Date;
  estimatedDelivery?: Date;
}

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"all" | "active" | "completed">("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabaseClient
          .from("offers")
          .select(`
            *,
            listing:listings(
              title,
              images,
              seller:profiles!seller_id(display_name)
            )
          `)
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[Orders] Failed to load offers:", error);
          setOrders([]);
          return;
        }

        const mapped: Order[] = (data || []).map((offer: any) => {
          const listing = offer.listing || {};
          const sellerName = listing.seller?.display_name || "Seller";
          const statusMap: Record<string, Order["status"]> = {
            pending: "pending",
            accepted: "shipped",
            completed: "delivered",
            declined: "cancelled",
          };
          const mappedStatus = statusMap[offer.status] || "pending";

          return {
            id: offer.id,
            listingTitle: listing.title || "Listing",
            listingImage: listing.images?.[0] || "https://picsum.photos/200",
            sellerName,
            status: mappedStatus,
            priceCents: offer.offered_price_cents || 0,
            orderedAt: new Date(offer.created_at),
            estimatedDelivery: undefined,
          };
        });

        setOrders(mapped);
      } catch (error) {
        console.error("[Orders] Unexpected error:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const filteredOrders = useMemo(() => orders.filter(order => {
    if (selectedTab === "active") return order.status === "pending" || order.status === "shipped";
    if (selectedTab === "completed") return order.status === "delivered";
    return true;
  }), [orders, selectedTab]);

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return { icon: Clock, color: Colors.warning, label: "Pending" };
      case "shipped":
        return { icon: Package, color: Colors.accent, label: "Shipped" };
      case "delivered":
        return { icon: CheckCircle, color: Colors.success, label: "Delivered" };
      case "cancelled":
        return { icon: XCircle, color: Colors.error, label: "Cancelled" };
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.guestState]}>
        <Package size={48} color={Colors.textSecondary} />
        <Text style={styles.emptyTitle}>Sign in to view orders</Text>
        <Text style={styles.emptyDescription}>
          Your purchase history will show up here after you log in.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : (
        <>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "all" && styles.tabActive]}
          onPress={() => setSelectedTab("all")}
        >
          <Text style={[styles.tabText, selectedTab === "all" && styles.tabTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "active" && styles.tabActive]}
          onPress={() => setSelectedTab("active")}
        >
          <Text style={[styles.tabText, selectedTab === "active" && styles.tabTextActive]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "completed" && styles.tabActive]}
          onPress={() => setSelectedTab("completed")}
        >
          <Text style={[styles.tabText, selectedTab === "completed" && styles.tabTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyDescription}>
              When you purchase parts, they&apos;ll appear here
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => console.log("View order", order.id)}
              >
                <Image source={{ uri: order.listingImage }} style={styles.orderImage} />
                
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle} numberOfLines={2}>
                    {order.listingTitle}
                  </Text>
                  <Text style={styles.orderSeller}>From {order.sellerName}</Text>
                  
                  <View style={styles.orderStatus}>
                    <StatusIcon size={16} color={statusInfo.color} />
                    <Text style={[styles.orderStatusText, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                  
                  <Text style={styles.orderPrice}>
                    ${(order.priceCents / 100).toFixed(2)}
                  </Text>
                </View>

                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  guestState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
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
  content: {
    flex: 1,
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
  orderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  orderSeller: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  orderStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  orderStatusText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.accent,
  },
});
