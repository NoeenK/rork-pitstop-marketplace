import { Tabs, useRouter } from "expo-router";
import { Search, Heart, Plus, MessageCircle, User } from "lucide-react-native";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useChat } from "@/contexts/ChatContext";
import { useTheme } from "@/contexts/ThemeContext";

function TabBadge({ count }: { count: number }) {
  if (count === 0) return null;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const { threads } = useChat();
  const { isDark } = useTheme();
  const unreadChats = threads.filter(t => t.unreadCount > 0).length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? "#FFFFFF" : "#0F0F0F",
        tabBarInactiveTintColor: isDark ? "#AAAAAA" : "#606060",
        tabBarStyle: {
          backgroundColor: isDark ? "#212121" : "#FFFFFF",
          borderTopWidth: isDark ? 0 : 0.2,
          borderTopColor: isDark ? "transparent" : "#E5E5E5",
          elevation: isDark ? 0 : 8,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0 : 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600" as const,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size - 4} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Wishlist",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size - 4} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: "Sell",
          tabBarIcon: ({ color, size }) => (
            <Plus color={color} size={size - 4} strokeWidth={2.5} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/listing/new");
          },
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <View>
              <MessageCircle color={color} size={size - 4} strokeWidth={2.5} />
              <TabBadge count={unreadChats} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size - 4} strokeWidth={2.5} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#FF0000",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700" as const,
  },

});
