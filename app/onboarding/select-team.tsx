import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Keyboard, TouchableWithoutFeedback, FlatList, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import { searchTeams, TBATeamSimple } from "@/lib/tba";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabaseClient as supabase } from "@/lib/supabase";

export default function SelectTeamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [username, setUsername] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [teams, setTeams] = useState([] as TBATeamSimple[]);
  const [selectedTeam, setSelectedTeam] = useState(null as TBATeamSimple | null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setTeamSearch(query);

    if (!query.trim() || query.length < 1) {
      setTeams([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchTeams(query);
      setTeams(results);
    } catch (error) {
      console.error("[SelectTeam] Search failed:", error);
      setTeams([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectTeam = (team: TBATeamSimple) => {
    setSelectedTeam(team);
    setTeamSearch(`${team.team_number} - ${team.nickname}`);
    setTeams([]);
    Keyboard.dismiss();
  };

  const handleContinue = async () => {
    if (!username.trim()) {
      Alert.alert("Missing Information", "Please enter a username");
      return;
    }

    if (!selectedTeam) {
      Alert.alert("Missing Information", "Please select your team number");
      return;
    }

    try {
      setIsLoading(true);
      console.log("[SelectTeam] Updating profile with team:", selectedTeam.team_number);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated. Please start over.");
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          display_name: username.trim(),
          username: username.toLowerCase().replace(/\s+/g, ''),
          team_number: selectedTeam.team_number,
          school_name: selectedTeam.nickname,
          city: 'Toronto',
          country: 'CA',
        });

      if (profileError) {
        console.error("[SelectTeam] Profile error:", profileError);
        throw profileError;
      }

      await AsyncStorage.setItem("onboarding_completed", "true");
      console.log("[SelectTeam] Profile created successfully");

      router.replace("/(tabs)/(home)");
    } catch (error: any) {
      console.error("[SelectTeam] Profile creation failed:", error);
      Alert.alert("Error", error?.message || "Failed to complete setup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = username.trim() && selectedTeam;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={["#FFF5E6", "#C44B5C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Team Selection</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.heading}>Choose Your Team</Text>
            <Text style={styles.description}>
              Enter your username and select your FRC team to complete your profile.
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#C4B5A8"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Team Number</Text>
                <View style={styles.searchContainer}>
                  <Search size={20} color="#8B7E72" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search team number or name"
                    placeholderTextColor="#C4B5A8"
                    value={teamSearch}
                    onChangeText={handleSearch}
                    keyboardType="number-pad"
                    editable={!isLoading}
                  />
                  {isSearching && <ActivityIndicator size="small" color="#C17B6B" />}
                </View>
              </View>

              {teams.length > 0 && (
                <View style={styles.resultsContainer}>
                  <FlatList
                    data={teams}
                    keyExtractor={(item) => item.key}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.teamItem}
                        onPress={() => handleSelectTeam(item)}
                      >
                        <Text style={styles.teamNumber}>{item.team_number}</Text>
                        <Text style={styles.teamName} numberOfLines={1}>
                          {item.nickname}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.continueButton, (!isValid || isLoading) && styles.continueButtonDisabled]}
                onPress={handleContinue}
                disabled={!isValid || isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>
                  {isLoading ? "Creating Account..." : "Complete Sign Up"}
                </Text>
              </TouchableOpacity>
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
    paddingTop: 20,
  },
  content: {
    gap: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6B5D52",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1A1A1A",
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
  searchContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4DF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: "#1A1A1A",
  },
  resultsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4DF",
    maxHeight: 200,
    overflow: "hidden",
  },
  teamItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F1ED",
    gap: 12,
  },
  teamNumber: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#C17B6B",
    minWidth: 50,
  },
  teamName: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
  },
  continueButton: {
    backgroundColor: "#C17B6B",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
