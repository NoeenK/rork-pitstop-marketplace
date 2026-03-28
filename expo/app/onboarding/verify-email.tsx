import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Keyboard } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabaseClient as supabase } from "@/lib/supabase";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [email, setEmail] = useState("");

  // Handle deep link for email verification
  useEffect(() => {
    if (params.email) {
      setEmail(params.email as string);
    }
  }, [params.email]);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit verification code");
      return;
    }

    if (!email) {
      Alert.alert("Error", "Email not found. Please try signing up again.");
      router.replace("/onboarding/signup-email");
      return;
    }

    try {
      setIsVerifying(true);
      Keyboard.dismiss();
      
      // Verify the 6-digit code with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error) throw error;

      console.log("[VerifyEmail] Verification successful");
      
      // Get the current user session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      // Update user metadata if needed
      if (user) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { is_over_18: true }
        });
        if (updateError) console.warn("Failed to update user metadata:", updateError);
      }
      
      // Navigate to the username & team selection screen
      console.log("[VerifyEmail] Verification successful - redirecting to team selection");
      
      router.replace("/onboarding/select-team");
    } catch (error: any) {
      console.error("[VerifyEmail] Verification failed:", error);
      Alert.alert("Verification Failed", error?.message || "Invalid or expired code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert("Error", "Email not found. Please try signing up again.");
      return;
    }

    if (resendCooldown > 0) {
      Alert.alert("Please wait", `Please wait ${resendCooldown} seconds before requesting a new code.`);
      return;
    }

    try {
      console.log("[VerifyEmail] Resending 6-digit code to:", email);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'your-app-scheme://onboarding/verify-email',
          shouldCreateUser: false,
          data: {
            is_over_18: true
          }
        },
      });

      if (error) throw error;
      
      setResendCooldown(30);
      Alert.alert("Success", "A new 6-digit code has been sent to your email!");
      
    } catch (error: any) {
      console.error("[VerifyEmail] Resend failed:", error);
      Alert.alert("Error", error?.message || "Failed to resend code. Please try again.");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={["#FFF5E6", "#C44B5C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Email</Text>
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
            We sent a 6-digit verification code to {email}. Please enter it below:
          </Text>

          <View style={styles.codeInputContainer}>
            <TextInput
              style={styles.codeInput}
              placeholder="000000"
              placeholderTextColor="#C4B5A8"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
          </View>

          <TouchableOpacity 
            style={[styles.verifyButton, (!code || code.length !== 6 || isVerifying) && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={!code || code.length !== 6 || isVerifying}
            activeOpacity={0.8}
          >
            <Text style={styles.verifyButtonText}>{isVerifying ? "Verifying..." : "Verify & Sign Up"}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleResend} 
            style={styles.resendContainer}
            disabled={resendCooldown > 0}
          >
            <Text style={styles.resendText}>
              {resendCooldown > 0 
                ? `Resend code in ${resendCooldown}s` 
                : "Didn't receive the code? "}
              {resendCooldown === 0 && (
                <Text style={styles.resendLink}>Resend</Text>
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A1A1A",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A1A1A",
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  content: {
    gap: 24,
  },
  description: {
    fontSize: 16,
    color: "#1A1A1A",
    lineHeight: 24,
    textAlign: "center",
  },
  codeInputContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  codeInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E8E4DF",
    width: "100%",
    textAlign: "center",
    letterSpacing: 8,
  },
  verifyButton: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
    opacity: 1,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resendContainer: {
    marginTop: 8,
  },
  resendText: {
    fontSize: 15,
    color: "#6B5D52",
    textAlign: "center",
  },
  resendLink: {
    color: "#C17B6B",
    fontWeight: "600" as const,
  },
});
