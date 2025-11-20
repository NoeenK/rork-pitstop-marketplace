import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, ScrollView, Alert, Keyboard, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, LayoutChangeEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { searchTeams, TBATeamSimple } from "@/lib/tba";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react-native";
import { supabaseClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pendingOAuthUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null as TBATeamSimple | null);
  const [teamResults, setTeamResults] = useState([] as TBATeamSimple[]);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [isTeamInputFocused, setIsTeamInputFocused] = useState(false);
  const teamInputRef = useRef(null);
  const [passwordInputHeight, setPasswordInputHeight] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const dropdownHeightAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const passwordFieldAnim = useRef(new Animated.Value(0)).current;

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

    if (pendingOAuthUser?.fullName) {
      console.log('[Welcome] Pre-filling name from OAuth:', pendingOAuthUser.fullName);
      setFullName(pendingOAuthUser.fullName);
      setIsOAuthUser(true);
    }
  }, [fadeAnim, slideAnim, pendingOAuthUser]);



  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (teamSearch.length > 0 && isTeamInputFocused) {
        const results = await searchTeams(teamSearch);
        setTeamResults(results);
        if (!showTeamDropdown) {
          setShowTeamDropdown(true);
          Animated.spring(dropdownHeightAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: false,
          }).start();
          
          Animated.spring(passwordFieldAnim, {
            toValue: 1,
            friction: 10,
            tension: 40,
            useNativeDriver: false,
          }).start();
        }
      } else {
        setTeamResults([]);
      }
    }, 200);

    return () => clearTimeout(searchDebounce);
  }, [teamSearch, isTeamInputFocused, showTeamDropdown]);

  const handleTeamInputFocus = () => {
    setIsTeamInputFocused(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleTeamSelect = (team: TBATeamSimple) => {
    setSelectedTeam(team);
    setTeamSearch("");
    setIsTeamInputFocused(false);
    Animated.parallel([
      Animated.timing(dropdownHeightAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(passwordFieldAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setShowTeamDropdown(false);
    });
    Keyboard.dismiss();
  };

  const handleCloseDropdown = () => {
    setIsTeamInputFocused(false);
    Animated.parallel([
      Animated.timing(dropdownHeightAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(passwordFieldAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setShowTeamDropdown(false);
      setTeamSearch("");
    });
    Keyboard.dismiss();
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert("Missing Information", "Please enter your full name");
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Missing Information", "Please enter your phone number");
      return;
    }

    if (!selectedTeam) {
      Alert.alert("Missing Information", "Please select your FRC team");
      return;
    }

    if (!isOAuthUser && (!password || password.length < 6)) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);
      const username = fullName.toLowerCase().replace(/\s+/g, '');
      
      // Get email from AsyncStorage
      const storedEmail = await AsyncStorage.getItem("pending_signup_email");
      if (!storedEmail) {
        Alert.alert("Error", "Email not found. Please start the signup process again.");
        router.replace("/onboarding/signup-email");
        return;
      }

      console.log("[Welcome] Creating account for:", storedEmail);
      
      // Check if user already exists
      const { data: { user: existingUser } } = await supabaseClient.auth.getUser();
      
      let userId: string;
      
      if (!existingUser) {
        // Create new account (email confirmation disabled in Supabase settings)
        const { data: authData, error: signUpError } = await supabaseClient.auth.signUp({
          email: storedEmail,
          password: password,
          options: {
            emailRedirectTo: undefined,
            data: {
              full_name: fullName.trim(),
              display_name: fullName.trim(),
              username,
              phone_number: phoneNumber.trim(),
              team_number: selectedTeam.team_number,
              team_name: selectedTeam.nickname,
            },
          },
        });

        if (signUpError) {
          console.error("[Welcome] Sign up error:", signUpError);
          Alert.alert("Error", signUpError.message || "Failed to create account. Please try again.");
          return;
        }

        if (!authData.user) {
          Alert.alert("Error", "Account creation failed. Please try again.");
          return;
        }

        userId = authData.user.id;
        console.log("[Welcome] Account created successfully:", userId);
      } else {
        // User already exists (from OAuth or previous signup)
        userId = existingUser.id;
        console.log("[Welcome] Using existing user:", userId);
        
        // Update password if provided
        if (!isOAuthUser && password) {
          const { error: passwordError } = await supabaseClient.auth.updateUser({
            password,
          });

          if (passwordError) {
            console.error("[Welcome] Password update error:", passwordError);
            // Don't fail if password update fails, continue with profile update
          }
        }
      }

      // Update or create profile
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .upsert({
          id: userId,
          email: storedEmail,
          full_name: fullName.trim(),
          display_name: fullName.trim(),
          username,
          phone_number: phoneNumber.trim(),
          team_number: selectedTeam.team_number,
          school_name: selectedTeam.nickname,
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error("[Welcome] Profile update error:", profileError);
        Alert.alert("Error", "Failed to update profile. Please try again.");
        return;
      }

      console.log("[Welcome] Profile setup complete");
      
      await AsyncStorage.removeItem("pending_signup_email");
      await AsyncStorage.setItem("onboarding_completed", "true");
      console.log("[Welcome] Onboarding marked as completed");
      
      router.replace("/(tabs)/(home)");
    } catch (error: any) {
      console.error("[Welcome] Setup failed:", error);
      Alert.alert("Error", error?.message || "Failed to complete setup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={showTeamDropdown ? handleCloseDropdown : Keyboard.dismiss}>
          <LinearGradient
            colors={["#FFF5E6", "#C44B5C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.container, { paddingTop: insets.top }]}
          >
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

            <ScrollView 
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              scrollEnabled={!showTeamDropdown}
            >
              <View style={styles.mainSection}>
                <Text style={styles.heading}>Welcome to Pitstop,</Text>
                <Text style={styles.subheading}>let&apos;s get you set up</Text>
                
                <View style={styles.formSection}>
                  <TextInput
                    style={styles.input}
                    placeholder="Full name"
                    placeholderTextColor="#C4B5A8"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!showTeamDropdown}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Phone number"
                    placeholderTextColor="#C4B5A8"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    editable={!showTeamDropdown}
                  />

                  <View>
                    <View style={styles.teamInputContainer}>
                      <TextInput
                        ref={teamInputRef}
                        style={[
                          styles.input,
                          styles.teamInput,
                          selectedTeam && !isTeamInputFocused && styles.teamInputWithSelection,
                        ]}
                        placeholder="Select your FRC team"
                        placeholderTextColor="#C4B5A8"
                        value={isTeamInputFocused || !selectedTeam ? teamSearch : `${selectedTeam.team_number} - ${selectedTeam.nickname}`}
                        onChangeText={setTeamSearch}
                        onFocus={handleTeamInputFocus}
                        onBlur={() => {
                          if (!selectedTeam && teamSearch.length === 0) {
                            setIsTeamInputFocused(false);
                          }
                        }}
                        keyboardType="number-pad"
                        editable={!showTeamDropdown || isTeamInputFocused}
                      />
                      {showTeamDropdown ? (
                        <ChevronUp 
                          size={20} 
                          color="#8B7E72" 
                          style={styles.dropdownIcon}
                        />
                      ) : (
                        <ChevronDown 
                          size={20} 
                          color="#8B7E72" 
                          style={styles.dropdownIcon}
                        />
                      )}
                    </View>

                    {showTeamDropdown && teamResults.length > 0 && (
                      <Animated.View
                        style={[
                          styles.dropdownContainer,
                          {
                            maxHeight: dropdownHeightAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 100],
                            }),
                            opacity: dropdownHeightAnim,
                          },
                        ]}
                      >
                        <ScrollView 
                          style={styles.teamList}
                          keyboardShouldPersistTaps="handled"
                          showsVerticalScrollIndicator={true}
                          nestedScrollEnabled
                        >
                          {teamResults.map((team: TBATeamSimple) => (
                            <TouchableOpacity
                              key={team.key}
                              style={styles.teamItem}
                              onPress={() => handleTeamSelect(team)}
                              activeOpacity={0.6}
                            >
                              <View style={styles.teamNumberBadge}>
                                <Text style={styles.teamNumber}>{team.team_number}</Text>
                              </View>
                              <Text style={styles.teamName} numberOfLines={2}>{team.nickname}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </Animated.View>
                    )}
                  </View>

                  {!isOAuthUser && (
                    <Animated.View
                      style={{
                        marginTop: passwordFieldAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 25],
                        }),
                      }}
                      onLayout={(event: any) => {
                        setPasswordInputHeight(event.nativeEvent.layout.y);
                      }}
                    >
                      <View style={styles.passwordContainer}>
                        <TextInput
                          style={styles.passwordInput}
                          placeholder="Password"
                          placeholderTextColor="#C4B5A8"
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          editable={!showTeamDropdown}
                          onFocus={() => {
                            if (showTeamDropdown && passwordInputHeight > 0) {
                              setTimeout(() => {
                                scrollViewRef.current?.scrollTo({
                                  y: passwordInputHeight - 100,
                                  animated: true,
                                });
                              }, 100);
                            }
                          }}
                        />
                        <TouchableOpacity
                          style={styles.eyeIcon}
                          onPress={() => setShowPassword(!showPassword)}
                          activeOpacity={0.7}
                        >
                          {showPassword ? (
                            <Eye size={20} color="#8B7E72" />
                          ) : (
                            <EyeOff size={20} color="#8B7E72" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  )}

                  <TouchableOpacity 
                    style={[
                      styles.submitButton,
                      (!fullName || !phoneNumber || !selectedTeam || (!isOAuthUser && !password) || isLoading) && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!fullName || !phoneNumber || !selectedTeam || (!isOAuthUser && !password) || isLoading || showTeamDropdown}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.submitButtonText}>
                      {isLoading ? "Creating Account..." : "Start Finding Parts"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
          </LinearGradient>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {!showTeamDropdown && (
        <LinearGradient
          colors={["#FFF5E6", "#C44B5C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.footer, { paddingBottom: insets.bottom }]}
        >
          <Text style={styles.footerText}>
            By continuing, you agree to Pitstop&apos;s{" "}
            <Text style={styles.footerLink}>Consumer Terms</Text> and{" "}
            <Text style={styles.footerLink}>Acceptable Use Policy</Text>, and acknowledge their{" "}
            <Text style={styles.footerLink}>Privacy Policy</Text>.
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  logo: {
    fontSize: 32,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mainSection: {
    gap: 24,
  },
  heading: {
    fontSize: 32,
    fontWeight: "400" as const,
    color: "#1A1A1A",
    textAlign: "center",
  },
  subheading: {
    fontSize: 20,
    fontWeight: "400" as const,
    color: "#1A1A1A",
    textAlign: "center",
    marginTop: -16,
  },
  formSection: {
    gap: 16,
    marginTop: 8,
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
    paddingRight: 16,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: "#1A1A1A",
  },
  eyeIcon: {
    padding: 4,
  },
  teamInputContainer: {
    position: "relative",
  },
  teamInput: {
    paddingRight: 45,
  },
  teamInputWithSelection: {
    color: "#1A1A1A",
  },
  dropdownIcon: {
    position: "absolute",
    right: 20,
    top: 18,
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4DF",
    marginTop: 8,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  teamList: {
    maxHeight: 180,
  },
  teamItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E8E4DF",
    backgroundColor: "#FFFFFF",
  },
  teamNumberBadge: {
    backgroundColor: "#FFF5F2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFE5DD",
    minWidth: 60,
    alignItems: "center",
  },
  teamNumber: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#C17B6B",
  },
  teamName: {
    fontSize: 14,
    color: "#1A1A1A",
    flex: 1,
    fontWeight: "500" as const,
  },

  submitButton: {
    backgroundColor: "#C17B6B",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
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
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  footer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    paddingHorizontal: 32,
    zIndex: 1000,
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
});
