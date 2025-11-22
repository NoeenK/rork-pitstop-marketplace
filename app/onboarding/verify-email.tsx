import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyCodeMutation = trpc.auth.verifyCode.useMutation();
  const resendCodeMutation = trpc.auth.sendVerificationCode.useMutation();

  useEffect(() => {
    if (params.code) {
      setCode(params.code);
      console.log("[VerifyEmail] Pre-filled code from signup:", params.code);
    }
  }, [params.code]);

  const handleVerify = async () => {
    if (!code || !params.email) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    if (!params.username || !params.phoneNumber || !params.password) {
      Alert.alert("Error", "Missing signup information. Please start over.");
      router.replace("/onboarding/signup-email");
      return;
    }

    try {
      setIsVerifying(true);
      console.log("[VerifyEmail] Verifying code for:", params.email);
      
      const result = await verifyCodeMutation.mutateAsync({
        email: params.email,
        code: code,
      });

      if (!result.success) {
        console.error("[VerifyEmail] Verification error:", result.message);
        Alert.alert("Verification Failed", result.message);
        return;
      }

      console.log("[VerifyEmail] Verification successful - redirecting to team selection");
      
      router.push({
        pathname: "/onboarding/select-team",
        params: {
          email: params.email,
          password: params.password,
          username: params.username,
          phoneNumber: params.phoneNumber,
        },
      });
    } catch (error: any) {
      console.error("[VerifyEmail] Verification or signup failed:", error);
      Alert.alert("Error", error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!params.email) {
      Alert.alert("Error", "Missing email. Please start over.");
      return;
    }

    try {
      console.log("[VerifyEmail] Resending verification code to:", params.email);
      const result = await resendCodeMutation.mutateAsync({ email: params.email });
      
      if (result.success) {
        Alert.alert("Success", "A new verification code has been sent to your email!");
      } else {
        Alert.alert("Error", result.message || "Failed to resend code");
      }
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
            We sent a 6-digit verification code to {params.email}. Please enter it below:
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

          <TouchableOpacity onPress={handleResend} style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn&apos;t receive the code? <Text style={styles.resendLink}>Resend</Text></Text>
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
    backgroundColor: "#C17B6B",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFFFFF",
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
