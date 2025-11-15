import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, TextInput } from "react-native";
import { useRouter, Stack } from "expo-router";
import { MessageCircle, ChevronRight, Camera, PlusCircle, Search } from "lucide-react-native";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useState } from "react";

export default function ChatsScreen() {
  const router = useRouter();
  const { threads } = useChat();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("All");
  const styles = createStyles(colors, isDark);
  const dynamicStyles = createDynamicStyles(colors, insets, isDark);

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
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

  const filteredThreads = threads.filter(thread => {
    const otherUser = thread.buyerId === user?.id ? thread.seller : thread.buyer;
    const query = searchQuery.toLowerCase();
    return otherUser?.displayName?.toLowerCase().includes(query) || 
           thread.lastMessage?.text?.toLowerCase().includes(query);
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={dynamicStyles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ChevronRight size={24} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Camera size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <PlusCircle size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

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
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {["All", "Contacts", "Unknown", "New"].map((tab) => (
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

      {filteredThreads.length === 0 ? (
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
          {filteredThreads.map((thread) => {
            const otherUser = thread.buyerId === user?.id ? thread.seller : thread.buyer;
            const isUnread = thread.unreadCount > 0;

            return (
              <TouchableOpacity
                key={thread.id}
                style={styles.threadItem}
                onPress={() => handleChatPress(thread.id)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarContainer}>
                  {thread.listing?.images[0] || otherUser?.avatarUrl ? (
                    <Image
                      source={{ uri: thread.listing?.images[0] || otherUser?.avatarUrl }}
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
                    <Text style={[styles.timestamp, isUnread && styles.timestampUnread]}>
                      {formatTime(thread.lastMessageAt)}
                    </Text>
                  </View>

                  <View style={styles.messageRow}>
                    <Text
                      style={[styles.lastMessage, isUnread && styles.lastMessageUnread]}
                      numberOfLines={1}
                    >
                      {thread.lastMessage?.text || "Tap to start chatting"}
                    </Text>
                    {isUnread && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{thread.unreadCount > 9 ? '9+' : thread.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const createDynamicStyles = (colors: any, insets: any, isDark: boolean) => StyleSheet.create({
  header: {
    backgroundColor: colors.background,
    paddingTop: insets.top,
    borderBottomWidth: isDark ? 0 : 0.5,
    borderBottomColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTop: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.text,
    position: "absolute" as const,
    left: 0,
    right: 0,
    textAlign: "center" as const,
    zIndex: -1,
  },
  headerActions: {
    flexDirection: "row" as const,
    gap: 16,
    alignItems: "center" as const,
  },
  iconButton: {
    padding: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: isDark ? "#1C1C1E" : "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
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
    backgroundColor: isDark ? "#2C2C2E" : "#E5E5EA",
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: isDark ? "#FFFFFF" : "#000000",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: isDark ? "#FFFFFF" : "#000000",
  },
  tabTextActive: {
    color: isDark ? "#000000" : "#FFFFFF",
  },
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: 4,
  },
  threadItem: {
    flexDirection: "row" as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center" as const,
    borderBottomWidth: 0.5,
    borderBottomColor: isDark ? "#2C2C2E" : "#E5E5EA",
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.border,
  },
  placeholderAvatar: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: isDark ? "#3C3C3E" : "#E5E5EA",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: isDark ? "#FFFFFF" : "#000000",
  },
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: "400" as const,
    color: colors.text,
    letterSpacing: -0.3,
    flex: 1,
  },
  userNameUnread: {
    fontWeight: "600" as const,
  },
  timestamp: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "400" as const,
    marginLeft: 8,
  },
  timestampUnread: {
    fontWeight: "400" as const,
    color: colors.textSecondary,
  },
  messageRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  lastMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: "400" as const,
    flex: 1,
  },
  lastMessageUnread: {
    fontWeight: "400" as const,
    color: colors.textSecondary,
  },
  unreadBadge: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
});
