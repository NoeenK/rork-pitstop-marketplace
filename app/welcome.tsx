import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Package, TrendingUp, Users, Shield } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/onboarding/signup-email");
  };

  const handleLogin = () => {
    router.push("/onboarding/login");
  };

  return (
    <LinearGradient
      colors={["#FFF5E6", "#C44B5C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >

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
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>I already have an account</Text>
          </TouchableOpacity>
          
          <Text style={styles.footerText}>
            By continuing, you agree to Pitstop&apos;s{" "}
            <Text style={styles.footerLink}>Terms of Service</Text> and{" "}
            <Text style={styles.footerLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: "#C17B6B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#C17B6B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    fontSize: 56,
    fontWeight: "900" as const,
    color: "#FFFFFF",
  },
  appName: {
    fontSize: 42,
    fontWeight: "900" as const,
    color: "#1A1A1A",
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#C17B6B",
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
    backgroundColor: "rgba(193, 123, 107, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6B5D52",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  footer: {
    gap: 16,
  },
  getStartedButton: {
    backgroundColor: "#C17B6B",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#C17B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E4DF",
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#C17B6B",
  },
  footerText: {
    fontSize: 12,
    color: "#1A1A1A",
    lineHeight: 16,
    textAlign: "center",
    marginTop: 8,
  },
  footerLink: {
    textDecorationLine: "underline",
  },
});
