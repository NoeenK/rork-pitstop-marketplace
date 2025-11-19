import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { X } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function IntroScreen() {
  const router = useRouter();
  const [showModal, setShowModal] = useState<boolean>(false);
  const insets = useSafeAreaInsets();



  const handleEmailSignup = () => {
    setShowModal(false);
    router.push("/onboarding/signup-email");
  };

  const handleLogin = () => {
    setShowModal(false);
    router.push("/onboarding/login");
  };

  const handleSkip = () => {
    router.replace("/(tabs)/(home)");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primaryGradientStart, "#1A0A0A", Colors.background]}
        locations={[0, 0.3, 1]}
        style={styles.gradient}
      />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          onPress={handleSkip}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.imagesGrid}>
          <View style={styles.imageRow}>
            <Image 
              source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/m8yliiqdug29rre5pzwm5" }}
              style={[styles.imageBox, styles.imageLarge]}
              resizeMode="contain"
            />
            <Image 
              source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/w0j4zm9itgg0uy06n3acf" }}
              style={[styles.imageBox, styles.imageMedium]}
              resizeMode="contain"
            />
          </View>
          <View style={styles.imageRow}>
            <Image 
              source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/9adxfkxg5zk44xzkv7gci" }}
              style={[styles.imageBox, styles.imageMedium]}
              resizeMode="contain"
            />
            <Image 
              source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/sqqwkja48tmkmq9br0g4n" }}
              style={[styles.imageBox, styles.imageSmall]}
              resizeMode="contain"
            />
          </View>
          <View style={styles.imageRow}>
            <Image 
              source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/855vq0pgwc9qjyjune24w" }}
              style={[styles.imageBox, styles.imageSmall]}
              resizeMode="contain"
            />
            <Image 
              source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/hteef44l8r6hzetti683b" }}
              style={[styles.imageBox, styles.imageLarge]}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.title}>
            Join and sell pre-loved parts with no fees
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleEmailSignup}
            >
              <Text style={styles.primaryButtonText}>Sign up for PITSTOP</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleLogin}
            >
              <Text style={styles.secondaryButtonText}>I already have an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Sign up for PITSTOP</Text>
            <Text style={styles.modalSubtitle}>
              It&apos;s quickest to use your Apple ID.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.appleButton}>
                <Text style={styles.appleButtonText}>🍎 Continue with Apple</Text>
              </TouchableOpacity>

              <Text style={styles.divider}>or</Text>

              <TouchableOpacity style={styles.googleButton}>
                <Text style={styles.googleButtonText}>G Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.facebookButton}>
                <Text style={styles.facebookButtonText}>f Continue with Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleEmailSignup}>
                <Text style={styles.emailLink}>Continue with email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    paddingHorizontal: 24,
    alignItems: "flex-end",
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  imagesGrid: {
    gap: 8,
    paddingTop: 8,
  },
  imageRow: {
    flexDirection: "row",
    gap: 8,
    height: 120,
  },
  imageBox: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: "hidden",
  },
  imageLarge: {
    flex: 2,
  },
  imageMedium: {
    flex: 1.5,
  },
  imageSmall: {
    flex: 1,
  },
  bottom: {
    paddingTop: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 32,
  },
  buttons: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
  },
  modalButtons: {
    gap: 16,
  },
  appleButton: {
    backgroundColor: "#000000",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  divider: {
    textAlign: "center",
    fontSize: 14,
    color: "#999999",
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#000000",
  },
  facebookButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  facebookButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1877F2",
  },
  emailLink: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
    textAlign: "center",
    paddingVertical: 8,
  },
});
