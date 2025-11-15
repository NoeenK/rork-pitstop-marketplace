import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function ConsentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();
  const { colors, isDark } = useTheme();

  const handleAccept = async () => {
    await completeOnboarding();
    router.replace("/(tabs)/(home)");
  };

  const handleDecline = () => {
    router.replace("/(tabs)/(home)");
  };

  if (isDark) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 24, backgroundColor: colors.background }]}>
        {renderContent()}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 24 }]}
    >
      {renderContent()}
    </LinearGradient>
  );

  function renderContent() {
    return (<>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.text}>
            We may allow third-party partners to collect data about your device and your activity on our website and use this data for the following purposes: providing personalized ads and content, conducting ad and content measurement, collecting audience insights, and product development. Click &quot;I Accept&quot; if you agree to the sharing of your data with these third parties.{" "}
            <Text style={styles.link}>Cookie Policy</Text>
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={handleAccept}
        >
          <Text style={styles.acceptButtonText}>I Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.declineButton}
          onPress={handleDecline}
        >
          <Text style={styles.declineButtonText}>Do Not Sell My Personal Information</Text>
        </TouchableOpacity>
      </View>
    </>);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 24,
  },
  link: {
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  footer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  declineButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
});
