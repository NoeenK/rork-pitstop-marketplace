import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Keyboard, TouchableWithoutFeedback } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, resetPassword } = useAuth();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isValid = email && password;

  const handleLogin = async () => {
    if (!isValid || isLoading) return;

    try {
      setIsLoading(true);
      await signIn(email, password);
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

  if (isDark) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        {renderContent()}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {renderContent()}
    </LinearGradient>
  );

  function renderContent() {
    return (<>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log in</Text>
        <View style={styles.placeholder} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
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
                <EyeOff size={20} color={Colors.textSecondary} />
              ) : (
                <Eye size={20} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, (!isValid || isLoading) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={!isValid || isLoading}
          >
            <Text style={styles.loginButtonText}>{isLoading ? "Logging in..." : "Log in"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
            <Text style={styles.troubleText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </>);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#000000",
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  form: {
    gap: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#DDDDDD",
    paddingVertical: 12,
    fontSize: 16,
    color: "#000000",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 8,
    top: 12,
    padding: 4,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  troubleText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
    textAlign: "center",
  },
});
