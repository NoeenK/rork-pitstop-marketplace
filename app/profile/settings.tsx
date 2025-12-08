import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ChevronRight, Bell, Lock, Eye, Globe, Moon, LogOut } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useMemo } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { colors } = useTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => signOut(),
        },
      ]
    );
  };

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: true,
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuGroup}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/settings/notifications')}
            >
              <Bell size={24} color={colors.text} />
              <Text style={styles.menuText}>Notifications</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/settings/appearance')}
            >
              <Moon size={24} color={colors.text} />
              <Text style={styles.menuText}>Appearance</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/settings/language')}
            >
              <Globe size={24} color={colors.text} />
              <Text style={styles.menuText}>Language</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.menuGroup}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/settings/privacy')}
            >
              <Lock size={24} color={colors.text} />
              <Text style={styles.menuText}>Privacy</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/settings/verification')}
            >
              <Eye size={24} color={colors.text} />
              <Text style={styles.menuText}>Verification</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menuGroup}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleSignOut}
            >
              <LogOut size={24} color={colors.error} />
              <Text style={[styles.menuText, { color: colors.error }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuGroup: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400" as const,
    color: colors.text,
  },
  chevron: {
    marginLeft: "auto" as const,
  },
  menuDivider: {
    height: 0.5,
    backgroundColor: colors.border,
    marginLeft: 52,
  },
});
