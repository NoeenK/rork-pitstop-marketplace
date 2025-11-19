import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Package, TrendingUp, Users, Shield } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import Button from "@/components/Button";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.replace("/(tabs)/(home)");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primaryGradientStart, "#1A0A0A", Colors.background]}
        locations={[0, 0.3, 1]}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>P</Text>
          </View>
          <Text style={styles.appName}>PITSTOP</Text>
          <Text style={styles.tagline}>Buy • Sell • Swap • Build</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Package size={28} color={Colors.accent} />
            </View>
            <Text style={styles.featureTitle}>Trade Parts</Text>
            <Text style={styles.featureDescription}>
              Buy, sell, or swap used robot parts with FRC teams
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Users size={28} color={Colors.accent} />
            </View>
            <Text style={styles.featureTitle}>Community</Text>
            <Text style={styles.featureDescription}>
              Connect with verified teams from around the world
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Shield size={28} color={Colors.accent} />
            </View>
            <Text style={styles.featureTitle}>Safe & Secure</Text>
            <Text style={styles.featureDescription}>
              Verified teams and secure messaging keep everyone safe
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <TrendingUp size={28} color={Colors.accent} />
            </View>
            <Text style={styles.featureTitle}>Sustainability</Text>
            <Text style={styles.featureDescription}>
              Give your parts a second season and reduce waste
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Get Started"
            onPress={handleContinue}
            size="large"
            style={styles.button}
          />
          <Text style={styles.footerText}>
            Every season ends — but your parts can live on.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    fontSize: 56,
    fontWeight: "900" as const,
    color: Colors.background,
  },
  appName: {
    fontSize: 42,
    fontWeight: "900" as const,
    color: Colors.text,
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.accent,
    letterSpacing: 1,
  },
  features: {
    flex: 1,
    justifyContent: "center",
    gap: 32,
  },
  feature: {
    alignItems: "center",
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.accent}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  footer: {
    gap: 20,
  },
  button: {
    width: "100%",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
