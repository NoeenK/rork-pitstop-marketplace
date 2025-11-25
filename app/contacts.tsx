import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import { ChevronRight, Search, UserPlus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { supabaseClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import * as Haptics from "expo-haptics";

interface Profile {
  id: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  teamNumber: number | null;
  city: string | null;
  country: string | null;
}

export default function ContactsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { createDirectThread } = useChat();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreatingThread, setIsCreatingThread] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        console.log("[ContactsScreen] No user ID found, skipping load");
        setUsers([]);
        return;
      }

      console.log("[ContactsScreen] Loading users, excluding current user:", user.id);
      
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('id, display_name, username, avatar_url, team_number, city, country')
        .neq('id', user.id)
        .order('display_name', { ascending: true })
        .limit(100);

      if (error) {
        console.error("[ContactsScreen] Supabase error:", JSON.stringify(error, null, 2));
        throw error;
      }

      console.log(`[ContactsScreen] Loaded ${data?.length || 0} users`);

      const profiles: Profile[] = (data || []).map((profile: any) => ({
        id: profile.id,
        displayName: profile.display_name || profile.full_name || 'User',
        username: profile.username,
        avatarUrl: profile.avatar_url,
        teamNumber: profile.team_number,
        city: profile.city,
        country: profile.country,
      }));

      setUsers(profiles);
    } catch (error) {
      console.error("[ContactsScreen] Failed to load users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(u => 
      u.displayName.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query) ||
      u.teamNumber?.toString().includes(query)
    );
  }, [users, searchQuery]);

  const handleUserPress = async (contactUser: Profile) => {
    if (!user || isCreatingThread) return;

    try {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      setIsCreatingThread(contactUser.id);

      const thread = await createDirectThread(user.id, contactUser.id);
      
      router.push(`/chat/${thread.id}`);
    } catch (error) {
      console.error("[ContactsScreen] Failed to create thread:", error);
    } finally {
      setIsCreatingThread(null);
    }
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
          <TouchableOpacity 
            onPress={() => router.back()} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronRight 
              size={24} 
              color="#000000" 
              style={{ transform: [{ rotate: '180deg' }] }} 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Contact</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      {/* Users List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : (
        <ScrollView 
          style={styles.list} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <UserPlus size={48} color="#8E8E93" />
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptyDescription}>
                {searchQuery ? "Try a different search" : "No users available"}
              </Text>
            </View>
          ) : (
            filteredUsers.map((contactUser) => (
              <TouchableOpacity
                key={contactUser.id}
                style={styles.userItem}
                onPress={() => handleUserPress(contactUser)}
                activeOpacity={0.7}
                disabled={isCreatingThread === contactUser.id}
              >
                <View style={styles.avatarContainer}>
                  {contactUser.avatarUrl ? (
                    <Image
                      source={{ uri: contactUser.avatarUrl }}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.avatar, styles.placeholderAvatar]}>
                      <Text style={styles.avatarText}>
                        {contactUser.displayName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.userContent}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {contactUser.displayName}
                  </Text>
                  <Text style={styles.userDetails} numberOfLines={1}>
                    {contactUser.username ? `@${contactUser.username}` : ''}
                    {contactUser.teamNumber ? ` • Team ${contactUser.teamNumber}` : ''}
                    {contactUser.city ? ` • ${contactUser.city}` : ''}
                  </Text>
                </View>

                {isCreatingThread === contactUser.id ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <ChevronRight size={20} color="#8E8E93" />
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
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
    fontWeight: "600" as const,
    color: "#000000",
    position: "absolute" as const,
    left: 0,
    right: 0,
    textAlign: "center" as const,
    zIndex: -1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listContent: {
    paddingTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#000000",
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 15,
    color: "#8E8E93",
    marginTop: 8,
    textAlign: "center" as const,
  },
  userItem: {
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E5EA",
  },
  placeholderAvatar: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E5EA",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#000000",
  },
  userContent: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "500" as const,
    color: "#000000",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  userDetails: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 18,
  },
});
