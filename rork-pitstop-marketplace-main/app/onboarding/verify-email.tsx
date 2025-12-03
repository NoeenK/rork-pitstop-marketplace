import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { verifyEmailCode, sendVerificationCode } from "@/lib/verification";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; code?: string }>();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const [code, setCode] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  useEffect(() => {
    if (params.email) {
      setEmail(params.email);
      console.log("[VerifyEmail] Pre-filled email from signup:", params.email);
    }
    if (params.code) {
      setCode(params.code);
      console.log("[VerifyEmail] Pre-filled code from signup:", params.code);
    }
  }, [params.email, params.code]);

  const handleVerify = async () => {
    if (!code || !email) {
      Alert.alert("Error", "Please enter your email and verification code");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    try {
      setIsVerifying(true);
      console.log("[VerifyEmail] Verifying with code:", code, "and email:", trimmedEmail);
      
      const isValid = await verifyEmailCode(trimmedEmail, code);

      if (!isValid) {
        console.error("[VerifyEmail] Verification error: Invalid or expired code");
        Alert.alert("Verification Failed", "Invalid or expired verification code. Please try again.");
        return;
      }

      console.log("[VerifyEmail] Verification successful - moving to welcome screen");
      router.replace({
        pathname: "/onboarding/welcome",
        params: { email: trimmedEmail }
      });
    } catch (error: any) {
      console.error("[VerifyEmail] Verification failed:", error);
      Alert.alert("Error", error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    try {
      console.log("[VerifyEmail] Resending verification code to:", trimmedEmail);
      await sendVerificationCode(trimmedEmail);
      Alert.alert("Success", "A new verification code has been sent to your email!");
    } catch (error: any) {
      console.error("[VerifyEmail] Resend failed:", error);
      Alert.alert("Error", error?.message || "Failed to resend code. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/onboarding/intro");
    } catch (error) {
      console.error("[VerifyEmail] Logout failed:", error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify your email</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.description}>
            {params.email ? (
              `We sent a verification code to ${params.email}. Enter it below:`
            ) : (
              "Enter your email and the verification code that we sent you:"
            )}
          </Text>

          {!params.email && (
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Verification code"
            placeholderTextColor={Colors.textSecondary}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />

          <TouchableOpacity 
            style={[styles.verifyButton, (!code || isVerifying) && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={!code || isVerifying}
          >
            <Text style={styles.verifyButtonText}>{isVerifying ? "Verifying..." : "Verify"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendText}>Didn&apos;t receive our email?</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />

          <TouchableOpacity>
            <Text style={styles.helpText}>Have any questions?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#000000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#000000",
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  content: {
    gap: 20,
  },
  description: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 24,
  },
  email: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#000000",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#DDDDDD",
    paddingVertical: 12,
    fontSize: 16,
    color: "#000000",
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  resendText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
    textAlign: "center",
  },
  spacer: {
    height: 200,
  },
  helpText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
    textAlign: "center",
  },
});
