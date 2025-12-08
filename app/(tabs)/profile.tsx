import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ShieldCheck, Receipt, Grid3x3, ShoppingBag, Clock, ScanLine, Tag, Sliders, Crosshair, MapPin, BookOpen, UserPlus, Gift, Headphones, FileText, Settings, ChevronRight } from "lucide-react-native";
import { Image } from "expo-image";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import ScreenWrapper from "@/components/ScreenWrapper";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

  if (!user) {
    return (
      <ScreenWrapper>
        <View style={styles.signInPrompt}>
          <Text style={[styles.signInTitle, { color: colors.text }]}>Welcome to Pitstop!</Text>
          <Text style={[styles.signInSubtitle, { color: colors.textSecondary }]}>Sign in to access your profile and manage your listings</Text>
          <TouchableOpacity 
            style={[styles.signInButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/onboarding/login')}
          >
            <Text style={styles.signInButtonText}>Sign In / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Pitstop</Text>
          <TouchableOpacity onPress={() => router.push('/profile/settings')}>
            <Settings size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.verificationBanner}
          onPress={() => router.push('/settings/verification')}
        >
          <ShieldCheck size={24} color={colors.accent} />
          <Text style={styles.verificationText}>Become an ID verified user</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => router.push('/user/' + user.id)}
        >
          <View style={styles.profileInfo}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                router.push('/profile/edit-avatar');
              }}
              style={styles.avatarTouchable}
            >
              {user.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{user.displayName}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeEmoji}>😊</Text>
                  <Text style={styles.badgeCount}>10</Text>
                </View>
              </View>
              {!user.avatarUrl && (
                <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
                  Tap avatar to upload photo
                </Text>
              )}
            </View>
          </View>
          <ChevronRight size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.createListingButton}
          onPress={() => router.push('/listing/new')}
        >
          <Text style={styles.createListingText}>Create listing</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buying & selling</Text>
          <View style={styles.menuGroup}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/listings')}
            >
              <Receipt size={24} color={colors.text} />
              <Text style={styles.menuText}>Listings</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/scanned-items')}
            >
              <Grid3x3 size={24} color={colors.text} />
              <Text style={styles.menuText}>Scanned items</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/orders')}
            >
              <ShoppingBag size={24} color={colors.text} />
              <Text style={styles.menuText}>Purchases</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/recently-viewed')}
            >
              <Clock size={24} color={colors.text} />
              <Text style={styles.menuText}>Recently viewed</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/karrot-vision')}
            >
              <ScanLine size={24} color={colors.text} />
              <Text style={styles.menuText}>Pitstop Vision</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.menuGroup}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/search-alerts')}
            >
              <Tag size={24} color={colors.text} />
              <Text style={styles.menuText}>Search alerts</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/customize-feed')}
            >
              <Sliders size={24} color={colors.text} />
              <Text style={styles.menuText}>Customize feed</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/settings/verification')}
            >
              <Crosshair size={24} color={colors.text} />
              <Text style={styles.menuText}>Verification</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/manage-neighbourhood')}
            >
              <MapPin size={24} color={colors.text} />
              <Text style={styles.menuText}>Manage neighbourhood</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/karrot-harvest')}
            >
              <BookOpen size={24} color={colors.text} />
              <Text style={styles.menuText}>Pitstop Rewards</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referrals & promotions</Text>
          <View style={styles.menuGroup}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/invite-friends')}
            >
              <UserPlus size={24} color={colors.text} />
              <Text style={styles.menuText}>Invite friends</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/my-rewards')}
            >
              <Gift size={24} color={colors.text} />
              <Text style={styles.menuText}>My rewards</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuGroup}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/settings/help')}
            >
              <Headphones size={24} color={colors.text} />
              <Text style={styles.menuText}>Get Help</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/inquiry-history')}
            >
              <FileText size={24} color={colors.text} />
              <Text style={styles.menuText}>Inquiry history</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/settings')}
            >
              <Settings size={24} color={colors.text} />
              <Text style={styles.menuText}>Settings</Text>
              <ChevronRight size={24} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const createStyles = (colors: any, insets: { top: number }) => StyleSheet.create({
  errorText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
  signInPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  signInTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    textAlign: "center",
  },
  signInSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  signInButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 16,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700" as const,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingTop: insets.top + 25,
    paddingBottom: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  verificationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    gap: 12,
  },
  verificationText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.text,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarTouchable: {
    width: 64,
    height: 64,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  profileDetails: {
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.text,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeCount: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
  },
  createListingButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 24,
  },
  createListingText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
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
  avatarHint: {
    fontSize: 12,
    fontWeight: "400" as const,
    marginTop: 4,
  },
});
