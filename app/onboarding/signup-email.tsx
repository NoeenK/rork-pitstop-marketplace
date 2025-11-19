import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Alert, Keyboard, TouchableWithoutFeedback, Platform, Switch } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sendVerificationCode, verifyEmailCode } from "@/lib/verification";

export default function SignUpEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showVerification, setShowVerification] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isOver18, setIsOver18] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const verificationFadeAnim = useRef(new Animated.Value(0)).current;
  const verificationSlideAnim = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleContinueWithEmail = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      console.log("[SignUp] Sending verification code to:", trimmedEmail);
      await sendVerificationCode(trimmedEmail);
      console.log("[SignUp] Verification code sent successfully");

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowVerification(true);
        Animated.parallel([
          Animated.timing(verificationFadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(verificationSlideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
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

  const handleVerifyAndCreateAccount = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a 6-digit verification code");
      return;
    }

    if (!isOver18) {
      Alert.alert("Age Verification Required", "You must be at least 18 years old to create an account");
      return;
    }

    try {
      setIsLoading(true);
      const trimmedEmail = email.trim().toLowerCase();
      console.log("[SignUp] Verifying OTP code for:", trimmedEmail);
      
      const isValid = await verifyEmailCode(trimmedEmail, verificationCode);

      if (!isValid) {
        console.error("[SignUp] Verification failed: Invalid or expired code");
        Alert.alert("Verification Failed", "Invalid or expired verification code. Please try again.");
        return;
      }

      console.log("[SignUp] Verification successful - storing email and navigating to welcome screen");
      
      await AsyncStorage.setItem("pending_signup_email", trimmedEmail);
      
      Animated.parallel([
        Animated.timing(verificationFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(verificationSlideAnim, {
          toValue: -30,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        router.push("/onboarding/welcome");
      });
    } catch (error: any) {
      console.error("[SignUp] Verification error:", error);
      Alert.alert("Error", error?.message || "Something went wrong. Please try again.");
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
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      >
        {!showVerification ? (
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.logo}>Pitstop</Text>

            <View style={styles.mainSection}>
              <Text style={styles.heading}>Your <Text style={styles.firstText}>FIRST</Text> Stop</Text>
              
              <Text style={styles.subtitle}>Enter your email address to get started</Text>

              <TextInput
                style={styles.emailInput}
                placeholder="name@yourcompany.com"
                placeholderTextColor="#C4B5A8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textAlign="center"
              />

              <TouchableOpacity 
                style={styles.continueEmailButton}
                onPress={handleContinueWithEmail}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.continueEmailText}>Continue with Email</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to Pitstop&apos;s{" "}
                <Text style={styles.footerLink}>Consumer Terms</Text> and{" "}
                <Text style={styles.footerLink}>Acceptable Use Policy</Text>, and acknowledge their{" "}
                <Text style={styles.footerLink}>Privacy Policy</Text>.
              </Text>
            </View>
          </Animated.View>
        ) : (
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: verificationFadeAnim,
                transform: [{ translateY: verificationSlideAnim }],
              },
            ]}
          >
            <Text style={styles.logo}>Pitstop</Text>

            <View style={styles.verificationSection}>
              <Text style={styles.heading}>Your <Text style={styles.firstText}>FIRST</Text> Stop</Text>
              <TextInput
                style={styles.verificationInput}
                placeholder="Enter verification code"
                placeholderTextColor="#C4B5A8"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
                autoFocus
              />

              <Text style={styles.ageVerificationLabel}>And verify your age:</Text>

              <View style={styles.ageToggleContainer}>
                <Text style={styles.ageToggleText}>I am at least 18 years of age</Text>
                <Switch
                  value={isOver18}
                  onValueChange={setIsOver18}
                  trackColor={{ false: "#E8E4DF", true: "#C17B6B" }}
                  thumbColor={"#FFFFFF"}
                  ios_backgroundColor="#E8E4DF"
                />
              </View>

              <TouchableOpacity 
                style={[styles.verifyButton, (!verificationCode || !isOver18 || isLoading) && styles.verifyButtonDisabled]}
                onPress={handleVerifyAndCreateAccount}
                disabled={!verificationCode || !isOver18 || isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.verifyButtonText}>
                  {isLoading ? "Verifying..." : "Verify & Create Account"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to Pitstop&apos;s{" "}
                <Text style={styles.footerLink}>Consumer Terms</Text> and{" "}
                <Text style={styles.footerLink}>Acceptable Use Policy</Text>, and acknowledge their{" "}
                <Text style={styles.footerLink}>Privacy Policy</Text>.
              </Text>
            </View>
          </Animated.View>
        )}
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    letterSpacing: 0.5,
  },

  firstText: {
    fontWeight: "900" as const,
    fontStyle: "italic" as const,
    color: "#1A1A1A",
  },
  mainSection: {
    flex: 1,
    justifyContent: "center",
    marginTop: -80,
  },
  heading: {
    fontSize: 36,
    fontWeight: "400" as const,
    color: "#1A1A1A",
    marginBottom: 32,
    lineHeight: 44,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B5D52",
    marginBottom: 20,
    textAlign: "center",
  },
  emailInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E4DF",
  },
  continueEmailButton: {
    backgroundColor: "#C17B6B",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#C17B6B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  continueEmailText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  footer: {
    paddingBottom: 20,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: "#8B7E72",
    lineHeight: 18,
    textAlign: "center",
  },
  footerLink: {
    textDecorationLine: "underline",
  },
  verificationSection: {
    flex: 1,
    justifyContent: "center",
    marginTop: -80,
  },
  verificationInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E8E4DF",
    letterSpacing: 4,
  },
  ageVerificationLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 16,
  },
  ageToggleContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E8E4DF",
  },
  ageToggleText: {
    fontSize: 15,
    color: "#1A1A1A",
    flex: 1,
  },
  verifyButton: {
    backgroundColor: "#C17B6B",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#C17B6B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
