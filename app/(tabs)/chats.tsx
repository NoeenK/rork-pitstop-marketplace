import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, TextInput } from "react-native";
import { useRouter, Stack } from "expo-router";
import { MessageCircle, Search, Filter, Plus } from "lucide-react-native";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useState } from "react";

export default function ChatsScreen() {
  const router = useRouter();
  const { threads } = useChat();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("All");

  const getFilteredThreadsByTab = () => {
    const filteredThreads = threads.filter(thread => {
      const otherUser = thread.buyerId === user?.id ? thread.seller : thread.buyer;
      const query = searchQuery.toLowerCase();
      return otherUser?.displayName?.toLowerCase().includes(query) || 
             thread.lastMessage?.text?.toLowerCase().includes(query);
    });

    if (selectedTab === "All") return filteredThreads;
    
    if (selectedTab === "Buying") {
      return filteredThreads.filter(thread => thread.buyerId === user?.id);
    }
    
    if (selectedTab === "Selling") {
      return filteredThreads.filter(thread => thread.sellerId === user?.id);
    }
    
    if (selectedTab === "New") {
      return filteredThreads.filter(thread => thread.unreadCount > 0);
    }
    
    return filteredThreads;
  };

  const displayedThreads = getFilteredThreadsByTab();

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) {
      // Show time if today
      if (messageDate.toDateString() === now.toDateString()) {
        return messageDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
      }
      return `${diffHours}h`;
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d`;
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleChatPress = (threadId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/chat/${threadId}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Filter size={18} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {["All", "Buying", "Selling", "New"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.tabActive
              ]}
              onPress={() => {
                setSelectedTab(tab);
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conversation List */}
      {displayedThreads.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No messages yet"
          description="Start a conversation by messaging a seller"
        />
      ) : (
        <ScrollView 
          style={styles.list} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {displayedThreads.map((thread) => {
            const otherUser = thread.buyerId === user?.id ? thread.seller : thread.buyer;
            const isUnread = thread.unreadCount > 0;
            const lastMessageText = thread.lastMessage?.text || "Tap to start chatting";

            return (
              <TouchableOpacity
                key={thread.id}
                style={styles.threadItem}
                onPress={() => handleChatPress(thread.id)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarContainer}>
                  {otherUser?.avatarUrl ? (
                    <Image
                      source={{ uri: otherUser.avatarUrl }}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.avatar, styles.placeholderAvatar]}>
                      <Text style={styles.avatarText}>
                        {otherUser?.displayName?.charAt(0)?.toUpperCase() || "U"}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.threadContent}>
                  <View style={styles.threadHeader}>
                    <Text style={[styles.userName, isUnread && styles.userNameUnread]} numberOfLines={1}>
                      {otherUser?.displayName || "Unknown User"}
                    </Text>
                    <Text style={styles.timestamp}>
                      {formatTime(thread.lastMessageAt)}
                    </Text>
                  </View>

                  <View style={styles.messageRow}>
                    <Text
                      style={[styles.lastMessage, isUnread && styles.lastMessageUnread]}
                      numberOfLines={1}
                    >
                      {lastMessageText}
                    </Text>
                    {isUnread && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                          {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          router.push('/contacts');
        }}
        activeOpacity={0.9}
      >
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    zIndex: -1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  iconButton: {
    padding: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E5E5EA",
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: "#000000",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  list: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listContent: {
    paddingTop: 4,
  },
  threadItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E5E5EA",
  },
  placeholderAvatar: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E5EA",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: "400",
    color: "#000000",
    letterSpacing: -0.3,
    flex: 1,
  },
  userNameUnread: {
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 15,
    color: "#8E8E93",
    fontWeight: "400",
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: 15,
    color: "#8E8E93",
    lineHeight: 18,
    fontWeight: "400",
    flex: 1,
  },
  lastMessageUnread: {
    fontWeight: "400",
    color: "#8E8E93",
  },
  unreadBadge: {
    backgroundColor: "#000000",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  fab: {
    position: "absolute" as const,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
