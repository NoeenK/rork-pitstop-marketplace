import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Keyboard, TouchableWithoutFeedback, Switch } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { supabaseClient as supabase } from "@/lib/supabase";

export default function SignUpEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [isOver18, setIsOver18] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendVerificationMutation = trpc.auth.sendVerificationCode.useMutation();

  const handleSendVerification = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid Gmail address");
      return;
    }

    if (!isOver18) {
      Alert.alert("Age Restriction", "You must be 18 years or older to sign up");
      return;
    }

    try {
      setIsLoading(true);
      console.log("[SignUp] Sending verification code to:", trimmedEmail);
      
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: true,
          data: {
            is_over_18: true
          }
        }
      });

      if (error) throw error;

      console.log("[SignUp] 6-digit code sent successfully");
      
      router.push({
        pathname: "/onboarding/verify-email",
        params: {
          email: trimmedEmail,
        },
      });
    } catch (error: any) {
      console.error("[SignUp] Failed to send verification code:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to send verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = email && isOver18;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={["#FFF5E6", "#C44B5C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.logo}>Pitstop</Text>

            <View style={styles.mainSection}>
              <Text style={styles.heading}>Create Account</Text>
              
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Gmail"
                  placeholderTextColor="#C4B5A8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />

                <View style={styles.ageContainer}>
                  <Text style={styles.ageText}>I am 18 years or older</Text>
                  <Switch
                    value={isOver18}
                    onValueChange={setIsOver18}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isOver18 ? '#f5dd4b' : '#f4f3f4'}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.signUpButton, (!isValid || isLoading) && styles.signUpButtonDisabled]}
                  onPress={handleSendVerification}
                  disabled={!isValid || isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signUpButtonText}>
                    {isLoading ? "Sending Code..." : "Send Verification Code"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/onboarding/login")} disabled={isLoading}>
                  <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Log in</Text></Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By signing up, you agree to Pitstop&apos;s{" "}
                <Text style={styles.footerLink}>Terms of Service</Text> and{" "}
                <Text style={styles.footerLink}>Privacy Policy</Text>.
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
  },
  logo: {
    fontSize: 32,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  mainSection: {
    flex: 1,
    justifyContent: "center",
  },
  heading: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E8E4DF",
  },
  passwordContainer: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4DF",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: "#1A1A1A",
  },
  eyeIcon: {
    paddingRight: 16,
    padding: 4,
  },
  signUpButton: {
    backgroundColor: "#C17B6B",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  signUpButtonDisabled: {
    opacity: 0.5,
  },
  signUpButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  loginText: {
    fontSize: 15,
    color: "#6B5D52",
    textAlign: "center",
    marginTop: 8,
  },
  loginLink: {
    color: "#C17B6B",
    fontWeight: "600" as const,
  },
  footer: {
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: "#1A1A1A",
    lineHeight: 16,
    textAlign: "center",
  },
  footerLink: {
    textDecorationLine: "underline",
  },
  ageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#E8E4DF",
  },
  ageText: {
    fontSize: 16,
    color: "#1A1A1A",
  },
});
