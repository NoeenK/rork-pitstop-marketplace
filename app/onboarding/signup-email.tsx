import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Keyboard, TouchableWithoutFeedback } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUpEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    if (!username.trim()) {
      Alert.alert("Missing Information", "Please enter a username");
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Missing Information", "Please enter your phone number");
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);
      console.log("[SignUp] Creating account for:", trimmedEmail);
      
      await signUp({
        email: trimmedEmail,
        password: password,
        fullName: username.trim(),
        username: username.trim().toLowerCase().replace(/\s+/g, ''),
        phoneNumber: phoneNumber.trim(),
        teamNumber: 0,
        teamName: "",
      });

      await AsyncStorage.setItem("onboarding_completed", "true");
      console.log("[SignUp] Account created successfully");
      router.replace("/(tabs)/(home)");
    } catch (error: any) {
      console.error("[SignUp] Failed to sign up:", error);
      
      // Handle user already exists error
      if (error?.code === "USER_ALREADY_EXISTS" || error?.message?.includes("already registered")) {
        Alert.alert(
          "Account Already Exists",
          "This email is already registered. Would you like to log in instead?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Log In", 
              onPress: () => router.push("/onboarding/login")
            }
          ]
        );
      } else {
        Alert.alert(
          "Sign Up Failed",
          error?.message || "Failed to create account. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = email && username && phoneNumber && password;

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
                  placeholder="Email"
                  placeholderTextColor="#C4B5A8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#C4B5A8"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#C4B5A8"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
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
                  style={[styles.signUpButton, (!isValid || isLoading) && styles.signUpButtonDisabled]}
                  onPress={handleSignUp}
                  disabled={!isValid || isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signUpButtonText}>
                    {isLoading ? "Creating Account..." : "Sign Up"}
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
    color: "#8B7E72",
    lineHeight: 16,
    textAlign: "center",
  },
  footerLink: {
    textDecorationLine: "underline",
  },
});
