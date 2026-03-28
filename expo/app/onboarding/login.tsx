import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Keyboard, TouchableWithoutFeedback } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email && password;

  const handleLogin = async () => {
    if (!isValid || isLoading) return;

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      console.log("[Login] Attempting login for:", trimmedEmail);
      await signIn(trimmedEmail, password);
      console.log("[Login] Login successful");
      router.replace("/(tabs)/(home)");
    } catch (error: any) {
      console.error("[LoginScreen] Login error:", error);
      Alert.alert(
        "Login Failed",
        error?.message || "Invalid email or password. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Email Required", "Please enter your email address to reset your password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email.trim());
      Alert.alert(
        "Password Reset Email Sent",
        "Please check your email for instructions to reset your password.",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      console.error("[LoginScreen] Password reset error:", error);
      Alert.alert(
        "Password Reset Failed",
        error?.message || "Unable to send password reset email. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

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
              <Text style={styles.heading}>Welcome Back</Text>
              
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#C4B5A8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    placeholderTextColor="#C4B5A8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    {showPassword ? (
                      <Eye size={20} color="#8B7E72" />
                    ) : (
                      <EyeOff size={20} color="#8B7E72" />
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[styles.loginButton, (!isValid || isLoading) && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={!isValid || isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? "Logging in..." : "Log In"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/onboarding/signup-email")} disabled={isLoading}>
                  <Text style={styles.signUpText}>Don&apos;t have an account? <Text style={styles.signUpLink}>Sign up</Text></Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By logging in, you agree to Pitstop&apos;s{" "}
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
  loginButton: {
    backgroundColor: "#C17B6B",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  forgotPassword: {
    fontSize: 15,
    color: "#C17B6B",
    fontWeight: "600" as const,
    textAlign: "center",
    marginTop: 4,
  },
  signUpText: {
    fontSize: 15,
    color: "#6B5D52",
    textAlign: "center",
    marginTop: 8,
  },
  signUpLink: {
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
});
